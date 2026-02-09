from fastapi import APIRouter, Depends, Query
from backend.services.auth import get_current_user
from backend.services.supabase_client import get_db
from datetime import datetime, timedelta
import pandas as pd
from backend.schemas import HistoryResponse, ErrorResponse
from backend.exceptions import InternalServerErrorException, BadRequestException, ServiceUnavailableException

router = APIRouter(tags=["Analytics"])
DAYS_IT = {0:'Lun', 1:'Mar', 2:'Mer', 3:'Gio', 4:'Ven', 5:'Sab', 6:'Dom'}
MONTHS_IT = {1:'Gen', 2:'Feb', 3:'Mar', 4:'Apr', 5:'Mag', 6:'Giu', 7:'Lug', 8:'Ago', 9:'Set', 10:'Ott', 11:'Nov', 12:'Dic'}

@router.get(
    "/api/production/history",
    response_model=HistoryResponse,
    summary="Storico Produzione",
    responses={400: {"model": ErrorResponse}}
)
async def get_production_history(
    period: str = Query(..., description="Periodo: day, week, month, year, custom"), 
    plantId: str = Query(..., description="ID Impianto"), 
    startDate: str = Query(None), 
    endDate: str = Query(None),   
    user=Depends(get_current_user)
):
    try:
        db = get_db()
            
        now = datetime.now()
        
        if period == 'day':
            start_date = now - timedelta(hours=24)
            table_name, col_time, col_val, resample_freq = "mv_analytics_oraria", "ora", "produzione_kwh", '1h'
        elif period == 'week':
            start_date = (now - timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)
            table_name, col_time, col_val, resample_freq = "vista_settimanale", "timestamp", "produzione", '1D'
        elif period == 'month':
            start_date = (now - timedelta(days=30)).replace(hour=0, minute=0, second=0, microsecond=0)
            table_name, col_time, col_val, resample_freq = "vista_settimanale", "timestamp", "produzione", '1D'
        elif period == 'year':
            #12 month bars to avoid same month collision on dataKey time
            start_year = now.year - 1
            start_month = now.month + 1
            #handle edge case where month = december(can't query month 12+1) and year goes back to currentyear(start_year+1)
            if start_month > 12: 
                start_month = 1
                start_year += 1
            start_date = now.replace(year=start_year, month=start_month, day=1, hour=0, minute=0, second=0, microsecond=0)
            table_name, col_time, col_val, resample_freq = "vista_mensile", "timestamp", "produzione", 'MS'
        elif period == 'custom':
            if not startDate or not endDate: return {"chart": [], "kpi": {"totalEnergy":0.0, "co2":0.0, "peakValue":0.0, "peakTime":"-", "efficiency":0.0}}
            start_date = datetime.strptime(startDate, "%Y-%m-%d")
            limit_date = datetime.strptime(endDate, "%Y-%m-%d").replace(hour=23, minute=59)
            col_time, col_val = "timestamp", "produzione"
            if (limit_date - start_date).days > 60: table_name, resample_freq = "vista_mensile", 'MS'
            else: table_name, resample_freq = "vista_settimanale", '1D'
            now = limit_date 
        else:
            raise BadRequestException(detail="Periodo non valido")

        res = await db.table(table_name).select(f"{col_time}, {col_val}").eq("impianto_id", plantId).gte(col_time, start_date.isoformat()).lte(col_time, now.isoformat()).order(col_time).execute()
        if not res.data: 
             return {"chart": [], "kpi": {"totalEnergy":0.0, "co2":0.0, "peakValue":0.0, "peakTime":"-", "efficiency":0.0}}

        df = pd.DataFrame(res.data)
        df.rename(columns={col_time: 'timestamp', col_val: 'value'}, inplace=True)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        if df['timestamp'].dt.tz is not None:
            df['timestamp'] = df['timestamp'].dt.tz_localize(None)
            
        df['timestamp'] = df['timestamp'].dt.normalize()
        
        full_idx = pd.date_range(start=start_date, end=now, freq=resample_freq)
        if period != 'day': full_idx = full_idx.normalize()
        
        df = df.set_index('timestamp')
        df_resampled = df.reindex(full_idx, fill_value=0).reset_index()
        df_resampled.rename(columns={'index': 'timestamp'}, inplace=True) 
        df_resampled['value'] = df_resampled['value'].fillna(0)

        total_prod = df_resampled['value'].sum()
        max_peak_val = df_resampled['value'].max()
        efficiency = (total_prod / (6.0 * ((now - start_date).total_seconds() / 3600 / 24 * 5)) * 100) if total_prod > 0 else 0.0
        if efficiency > 100: efficiency = 99.9

        peak_label = "-"
        if total_prod > 0:
            pk_ts = df_resampled.iloc[df_resampled['value'].idxmax()]['timestamp']
            if period == 'day': peak_label = pk_ts.strftime('%H:%M')
            elif period in ['year'] or (period == 'custom' and resample_freq == 'MS'): peak_label = MONTHS_IT.get(pk_ts.month, '-')
            else: peak_label = f"{pk_ts.day} {MONTHS_IT.get(pk_ts.month,'')}"

        chart_data = []
        for _, row in df_resampled.iterrows():
            ts = row['timestamp']
            label = ""
            if period == 'day': label = ts.strftime('%H:%M')
            elif period == 'week': label = DAYS_IT.get(ts.weekday(), '-')
            elif period == 'month': label = ts.strftime('%d')
            elif period == 'year' or (period=='custom' and resample_freq=='MS'): label = MONTHS_IT.get(ts.month, '-')
            else: label = f"{ts.day} {MONTHS_IT.get(ts.month,'')}"
            chart_data.append({"time": str(label), "full_date": ts.isoformat(), "Produzione": round(row['value'], 2)})

        return {
            "chart": chart_data,
            "kpi": {
                "totalEnergy": round(total_prod, 2),
                "co2": round(total_prod * 0.225, 2),
                "peakValue": round(max_peak_val, 2),    
                "peakTime": peak_label,
                "efficiency": round(efficiency, 1)
            }
        }
    except Exception as e:
        if isinstance(e, (BadRequestException, ServiceUnavailableException)): raise e
        print(f"ERR History: {e}")
        return {"chart": [], "kpi": {"totalEnergy":0.0, "co2":0.0, "peakValue":0.0, "peakTime":"-", "efficiency":0.0}}