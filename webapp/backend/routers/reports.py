from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from datetime import datetime, timedelta
import pandas as pd
import io
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from fpdf import FPDF
from backend.services.supabase_client import supabase as sync_db
from backend.exceptions import NotFoundException, InternalServerErrorException

router = APIRouter(tags=["Reports"])

@router.get("/api/report/download", summary="Download Report PDF")
def download_report(period: str, plantId: str, startDate: str = Query(None), endDate: str = Query(None)):
    try:
        now = datetime.now()
        
        if period == 'live':
            target_plant = plantId if plantId != 'summary' else None
            start_live = now - timedelta(hours=24)
            query = sync_db.table("misurazioni").select("*").gte("timestamp", start_live.isoformat()).lte("timestamp", now.isoformat()).order("timestamp")
            
            if target_plant: 
                query = query.eq("impianto_id", target_plant)
            else: 
                query = query.limit(200)
            
            res = query.execute()
            
            if not res.data: 
                raise NotFoundException(detail="Nessun dato per il report")
                
            df = pd.DataFrame(res.data)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            plt.figure(figsize=(10, 5))
            plt.plot(df['timestamp'], df['produzione_kw'], color='#eab308', linewidth=2)
            plt.fill_between(df['timestamp'], df['produzione_kw'], color='#eab308', alpha=0.3)
            plt.title("Produzione Live (Ultime 24h)")
            plt.ylabel("Potenza (kW)")
            plt.grid(axis='y', linestyle='--', alpha=0.5)
            plt.xticks(rotation=45, fontsize=8)
            
            kpi = {
                "totalEnergy": round(df['produzione_kw'].sum() / 12, 2), 
                "co2": round((df['produzione_kw'].sum() / 12) * 0.225, 2), 
                "peakValue": round(df['produzione_kw'].max(), 2)
            }
            
        else:
            if period == 'week':
                start_date = (now - timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)
                table_name = "vista_settimanale"
            elif period == 'month':
                start_date = (now - timedelta(days=29)).replace(hour=0, minute=0, second=0, microsecond=0)
                table_name = "vista_settimanale"
            elif period == 'year':
                start_year = now.year - 1
                start_month = now.month + 1
                if start_month > 12: 
                    start_month = 1
                    start_year += 1
                start_date = now.replace(year=start_year, month=start_month, day=1, hour=0, minute=0, second=0, microsecond=0)
                table_name = "vista_mensile"
            elif period == 'custom' and startDate and endDate:
                start_date = datetime.strptime(startDate, "%Y-%m-%d")
                limit_date = datetime.strptime(endDate, "%Y-%m-%d").replace(hour=23, minute=59)
                if (limit_date - start_date).days > 60: 
                    table_name = "vista_mensile"
                else: 
                    table_name = "vista_settimanale"
                now = limit_date 
            else:
                start_date = (now - timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)
                table_name = "vista_settimanale"

            query = sync_db.table(table_name).select("*").gte("timestamp", start_date.isoformat()).lte("timestamp", now.isoformat()).order("timestamp")
            
            if plantId and plantId != 'summary':
                query = query.eq("impianto_id", plantId)
                
            res = query.execute()
            
            if not res.data:
                kpi = {"totalEnergy": 0, "co2": 0, "peakValue": 0}
                plt.figure(figsize=(10, 5))
                plt.text(0.5, 0.5, "Nessun dato disponibile", ha='center')
            else:
                df = pd.DataFrame(res.data)
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                
                total_prod = df['produzione'].sum()
                kpi = {
                    "totalEnergy": round(total_prod, 2),
                    "co2": round(total_prod * 0.225, 2),
                    "peakValue": round(df['produzione'].max(), 2)
                }
                
                plt.figure(figsize=(10, 5))
                width = 20 if table_name == "vista_mensile" else 0.6
                plt.bar(df['timestamp'], df['produzione'], color='#16a34a', alpha=0.8, width=width)
                plt.title(f"Andamento Produzione ({period.capitalize()})")
                plt.ylabel("Energia (kWh)")
                plt.grid(axis='y', linestyle='--', alpha=0.3)
                plt.xticks(rotation=45, fontsize=8)

        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', bbox_inches='tight')
        plt.close()
        img_buffer.seek(0)

        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(40, 10, f"Rinova Report - {period.upper()}")
        pdf.ln(10)
        
        pdf.set_font("Arial", '', 12)
        pdf.cell(0, 10, f"Generato il: {datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=True)
        pdf.ln(10)
        
        pdf.set_fill_color(245, 245, 245)
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(45, 10, "Totale Energia", 1, 0, 'C', 1)
        pdf.cell(45, 10, "CO2 Evitata", 1, 0, 'C', 1)
        pdf.cell(45, 10, "Picco Max", 1, 1, 'C', 1)
        
        pdf.set_font("Arial", '', 12)
        pdf.cell(45, 10, f"{kpi['totalEnergy']} kWh", 1, 0, 'C')
        pdf.cell(45, 10, f"{kpi['co2']} kg", 1, 0, 'C')
        pdf.cell(45, 10, f"{kpi['peakValue']} kW", 1, 1, 'C')
        pdf.ln(10)

        import tempfile, os
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_file:
            tmp_file.write(img_buffer.getvalue())
            tmp_path = tmp_file.name
            
        pdf.image(tmp_path, x=10, y=None, w=190)
        os.unlink(tmp_path)
        
        pdf_buffer = io.BytesIO()
        pdf_bytes = pdf.output(dest='S').encode('latin-1')
        pdf_buffer.write(pdf_bytes)
        pdf_buffer.seek(0)
        
        return StreamingResponse(pdf_buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=rinova_report_{period}.pdf"})
        
    except Exception as e:
        if isinstance(e, NotFoundException): raise e
        print(f"PDF Error: {e}")
        raise InternalServerErrorException(detail="Errore generazione Report")