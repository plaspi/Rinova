from fastapi import APIRouter, Depends
from backend.services.auth import get_current_user
from backend.services.supabase_client import get_db
from datetime import datetime, timedelta
import pandas as pd
from backend.schemas import (
    LiveDashboardResponse, 
    PlantSimple, 
    SimpleKPI, 
    SummaryChartPoint, 
    ErrorResponse
)
from backend.exceptions import InternalServerErrorException, ServiceUnavailableException

router = APIRouter(tags=["Dashboard"])

@router.get(
    "/api/production/live",
    response_model=LiveDashboardResponse,
    summary="Dati Live Dashboard",
    responses={500: {"model": ErrorResponse}}
)
async def get_live_dashboard(user=Depends(get_current_user)):
    try:
        db = get_db()
        user_id = user.get('sub')

        resp_plants = await db.table("impianti").select("id, nome, status").eq("user_id", user_id).execute()
        plants = resp_plants.data or []
        
        if not plants:
            return {"plants": [], "charts": {}, "kpi": {"peak": 0, "totalEnergy": 0, "avgPower": 0}}

        plant_ids = [p['id'] for p in plants]
        now = datetime.now()
        start_date = now - timedelta(hours=24)

        resp_data = await db.table("misurazioni")\
            .select("*")\
            .in_("impianto_id", plant_ids)\
            .gte("timestamp", start_date.isoformat())\
            .lte("timestamp", now.isoformat()) \
            .order("timestamp", desc=False)\
            .execute()
            
        raw_data = resp_data.data
        if not raw_data:
             return {"plants": plants, "charts": {str(p['id']): [] for p in plants}, "kpi": {"peak": 0, "totalEnergy": 0, "avgPower": 0}}

        df = pd.DataFrame(raw_data)
        col_mapping = {'bucket': 'timestamp', 'data_ora': 'timestamp'}
        df.rename(columns=col_mapping, inplace=True)
        
        # Fix Timezone
        df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True)
        df['timestamp'] = df['timestamp'].dt.tz_convert('Europe/Rome').dt.tz_localize(None)

        df = df.sort_values('timestamp')
        if 'produzione_kw' in df.columns:
            df['produzione_kw'] = df['produzione_kw'].round(2)
        if 'consumo_kw' in df.columns:
            df['consumo_kw'] = df['consumo_kw'].round(2)

        charts_data = {}
        total_power_sum = 0
        total_count = 0
        global_peak = 0
        
        # OPTIMIZATION: Group the dataframe once instead of filtering inside the loop
        grouped = df.groupby('impianto_id')
        
        for plant in plants:
            pid = plant['id']
            
            if pid in grouped.groups:
                plant_df = grouped.get_group(pid).copy()
                
                # Vectorized column creation (Much faster than .apply)
                plant_df['timestamp_full'] = plant_df['timestamp'].dt.strftime('%Y-%m-%dT%H:%M:%S')
                plant_df['time'] = plant_df['timestamp'].dt.strftime('%H:%M')
                plant_df['Produzione'] = plant_df['produzione_kw']
                plant_df['Consumo'] = plant_df.get('consumo_kw', 0.0)
                
                # Natively convert to list of dictionaries
                charts_data[str(pid)] = plant_df[['timestamp_full', 'time', 'Produzione', 'Consumo']].to_dict('records')
                
                local_peak = plant_df['produzione_kw'].max()
                if local_peak > global_peak: global_peak = local_peak
                total_power_sum += plant_df['produzione_kw'].sum()
                total_count += len(plant_df)
            else:
                charts_data[str(pid)] = []

        total_energy = round(total_power_sum / 12, 2) if total_count > 0 else 0
        avg_power = round(total_power_sum / total_count, 2) if total_count > 0 else 0

        return {
            "plants": plants,
            "charts": charts_data,
            "kpi": {"peak": round(global_peak, 2), "totalEnergy": total_energy, "avgPower": avg_power}
        }
    except Exception as e:
        if isinstance(e, ServiceUnavailableException): raise e
        print(f"Error Live Dashboard: {e}")
        raise InternalServerErrorException(detail=str(e))

@router.get("/api/dashboard/summary", response_model=SimpleKPI, summary="KPI Sommario Home")
async def get_dashboard_summary(user: dict = Depends(get_current_user)):
    try:
        db = get_db()
        user_id = user.get('sub')

        plants_res = await db.table('impianti').select('id').eq('user_id', user_id).execute()
        if not plants_res.data:
            return {"produzione": 0.0, "consumo": 0.0, "batteria": 0, "risparmio_co2": 0.0, "trend_produzione": "0%", "trend_consumo": "0%"}
        
        plant_ids = [p['id'] for p in plants_res.data]
            
        now = datetime.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday_start = today_start - timedelta(days=1)
        week_start = now - timedelta(days=7) 
        
        res_today = await db.table('mv_analytics_oraria').select('produzione_kwh, consumo_kwh').in_('impianto_id', plant_ids).gte('ora', today_start.isoformat()).lte('ora', now.isoformat()).execute()
        res_yesterday = await db.table('mv_analytics_oraria').select('produzione_kwh, consumo_kwh').in_('impianto_id', plant_ids).gte('ora', yesterday_start.isoformat()).lt('ora', today_start.isoformat()).execute()
        res_week = await db.table('vista_settimanale').select('produzione').in_('impianto_id', plant_ids).gte('timestamp', week_start.strftime('%Y-%m-%d')).execute()

        data_today = res_today.data or []
        data_yesterday = res_yesterday.data or []
        data_week = res_week.data or []
        
        prod_today = sum(d['produzione_kwh'] for d in data_today)
        cons_today = sum(d['consumo_kwh'] for d in data_today)
        prod_yesterday = sum(d['produzione_kwh'] for d in data_yesterday)
        cons_yesterday = sum(d['consumo_kwh'] for d in data_yesterday)
        prod_week = sum(d['produzione'] for d in data_week)
        
        def calc_trend(curr, prev):
            if prev == 0: return "+0%" if curr > 0 else "0%"
            perc = ((curr - prev) / prev) * 100
            sign = "+" if perc > 0 else ""
            return f"{sign}{int(perc)}%"

        return {
            "produzione": round(prod_today, 2),
            "consumo": round(cons_today, 2),
            "batteria": 78, 
            "risparmio_co2": round(prod_week * 0.225, 2),
            "trend_produzione": calc_trend(prod_today, prod_yesterday),
            "trend_consumo": calc_trend(cons_today, cons_yesterday)
        }
    except Exception as e:
        print(f"ERR Dashboard Summary: {e}")
        raise InternalServerErrorException(detail="Errore nel calcolo del sommario della dashboard")
    
@router.get("/api/dashboard/chart", response_model=list[SummaryChartPoint], summary="Grafico Home (4 Ore)")
async def get_dashboard_chart(user: dict = Depends(get_current_user)):
    try:
        db = get_db()
        user_id = user.get('sub')

        plants_res = await db.table("impianti").select("id").eq("user_id", user_id).execute()
        if not plants_res.data: return []
        plant_ids = [p['id'] for p in plants_res.data]

        now = datetime.now()
        start_date = now - timedelta(hours=4)
        res = await db.table('misurazioni').select('timestamp, produzione_kw, consumo_kw')\
            .in_('impianto_id', plant_ids)\
            .gte('timestamp', start_date.isoformat())\
            .lte('timestamp', now.isoformat())\
            .order('timestamp', desc=False)\
            .execute()
        data = res.data or []
        if not data: return []

        df = pd.DataFrame(data)
        df.rename(columns={'timestamp': 'ora'}, inplace=True)
        
        # Fix Timezone
        df['ora'] = pd.to_datetime(df['ora'], utc=True)
        df['ora'] = df['ora'].dt.tz_convert('Europe/Rome').dt.tz_localize(None)
        df_grouped = df.groupby('ora')[['produzione_kw', 'consumo_kw']].sum().reset_index()
        
        result = []
        for _, row in df_grouped.iterrows():
            result.append({"ora": row['ora'].strftime('%H:%M'), "produzione": round(row['produzione_kw'], 2), "consumo": round(row['consumo_kw'], 2)})
        return result
    except Exception as e:
        print(f"ERR Dashboard Chart: {e}")
        raise InternalServerErrorException(detail="Errore nel caricamento del grafico della dashboard")

@router.get("/api/dashboard/plants", response_model=list[PlantSimple], summary="Lista Widget Impianti")
async def get_dashboard_plants(user=Depends(get_current_user)):
    try:
        db = get_db()
        user_id = user.get('sub')


        res = await db.table("impianti").select("id, nome, status").eq("user_id", user_id).order("nome").execute()
        return res.data or []
    except Exception:
        return []