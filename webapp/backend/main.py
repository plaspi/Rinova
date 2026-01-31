from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from services.auth import get_current_user
from services.supabase_client import supabase
from datetime import datetime, timedelta, timezone
import pandas as pd
import uvicorn
import io
import matplotlib
matplotlib.use('Agg') # Backend non interattivo per server
import matplotlib.pyplot as plt
from fpdf import FPDF

app = FastAPI()

# --- 1. CONFIGURAZIONE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex= r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. ROUTE BASE ---
@app.get("/")
def root():
    return {"status": "ok", "message": "API Rinova funzionante"}

# --- 4. PRODUZIONE LIVE (Tutto in uno) ---
@app.get("/api/production/live")
def get_live_dashboard(user=Depends(get_current_user)):
    try:
        # A. Recupera impianti
        resp_plants = supabase.table("impianti").select("id, nome").limit(20).execute()
        plants = resp_plants.data or []
        
        if not plants:
            return {"kpi": {"peak": 0, "totalEnergy": 0, "avgPower": 0}, "charts": {}, "plants": []}

        plant_ids = [p['id'] for p in plants]
        
        # B. Recupera Dati Live (Ultime 24 ore)
        now = datetime.now()
        start_date = now - timedelta(hours=24)

        # PROTEZIONE FUTURO: .lte("timestamp", now) assicura che non leggiamo dati simulati futuri
        resp_data = supabase.table("misurazioni")\
            .select("*")\
            .in_("impianto_id", plant_ids)\
            .gte("timestamp", start_date.isoformat())\
            .lte("timestamp", now.isoformat()) \
            .order("timestamp", desc=False)\
            .execute()
            
        raw_data = resp_data.data
        if not raw_data:
             return {"kpi": {"peak": 0, "totalEnergy": 0, "avgPower": 0}, "charts": {}, "plants": plants}

        # C. Elaborazione
        df = pd.DataFrame(raw_data)
        col_mapping = {'bucket': 'timestamp', 'data_ora': 'timestamp'}
        df.rename(columns=col_mapping, inplace=True)
        
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        if df['timestamp'].dt.tz is not None:
             df['timestamp'] = df['timestamp'].dt.tz_localize(None)

        df = df.sort_values('timestamp')
        
        if 'produzione_kw' in df.columns:
            df['produzione_kw'] = df['produzione_kw'].round(2)

        charts_data = {}
        total_power_sum = 0
        total_count = 0
        global_peak = 0

        for plant in plants:
            pid = plant['id']
            plant_df = df[df['impianto_id'] == pid].copy()
            
            if not plant_df.empty:
                chart_points = plant_df.apply(lambda row: {
                    "timestamp_full": row['timestamp'].isoformat(), 
                    "time": row['timestamp'].strftime('%H:%M'),
                    "Produzione": row['produzione_kw']
                }, axis=1).tolist()
                
                charts_data[pid] = chart_points
                
                local_peak = plant_df['produzione_kw'].max()
                if local_peak > global_peak: global_peak = local_peak
                
                total_power_sum += plant_df['produzione_kw'].sum()
                total_count += len(plant_df)
            else:
                charts_data[pid] = []

        total_energy = round(total_power_sum / 12, 2) if total_count > 0 else 0
        avg_power = round(total_power_sum / total_count, 2) if total_count > 0 else 0

        return {
            "plants": plants,
            "charts": charts_data,
            "kpi": {
                "peak": round(global_peak, 2),
                "totalEnergy": total_energy,
                "avgPower": avg_power
            }
        }

    except Exception as e:
        print(f"Error Live Dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    

# Map giorni e mesi in italiano
DAYS_IT = {0:'Lun', 1:'Mar', 2:'Mer', 3:'Gio', 4:'Ven', 5:'Sab', 6:'Dom'}
MONTHS_IT = {1:'Gen', 2:'Feb', 3:'Mar', 4:'Apr', 5:'Mag', 6:'Giu', 7:'Lug', 8:'Ago', 9:'Set', 10:'Ott', 11:'Nov', 12:'Dic'}

# --- 5. STORICO PRODUZIONE (Logica Viste + Protezione Futuro) ---
# ... import e resto del codice invariato ...

@app.get("/api/production/history")
def get_production_history(
    period: str, 
    plantId: str, 
    startDate: str = Query(None), # Opzionale per custom
    endDate: str = Query(None),   # Opzionale per custom
    user=Depends(get_current_user)
):
    try:
        now = datetime.now()
        
        # --- 1. CONFIGURAZIONE LOGICA ---
        if period == 'day':
            start_date = now - timedelta(hours=24)
            table_name = "mv_analytics_oraria"
            col_time = "ora"
            col_val = "produzione_kwh"
            resample_freq = '1h' 
            
        elif period == 'week':
            start_date = (now - timedelta(days=7)).replace(hour=0, minute=0, second=0, microsecond=0)
            table_name = "vista_settimanale" 
            col_time = "timestamp"
            col_val = "produzione"
            resample_freq = '1D'
            
        elif period == 'month':
            start_date = (now - timedelta(days=30)).replace(hour=0, minute=0, second=0, microsecond=0)
            table_name = "vista_settimanale"
            col_time = "timestamp"
            col_val = "produzione"
            resample_freq = '1D'
            
        elif period == 'year':
            start_date = now.replace(year=now.year-1, day=1, hour=0, minute=0, second=0, microsecond=0)
            table_name = "vista_mensile"
            col_time = "timestamp"
            col_val = "produzione"
            resample_freq = 'MS'

        elif period == 'custom':
            # LOGICA INTELLIGENTE PER CUSTOM RANGE
            if not startDate or not endDate:
                return {}
            
            # Parsing date (dal formato YYYY-MM-DD del frontend)
            start_date = datetime.strptime(startDate, "%Y-%m-%d")
            limit_date = datetime.strptime(endDate, "%Y-%m-%d").replace(hour=23, minute=59)
            
            # Calcolo durata per decidere la risoluzione
            delta_days = (limit_date - start_date).days
            
            col_time = "timestamp"
            col_val = "produzione"
            
            if delta_days > 60:
                # Se più di 2 mesi, mostra raggruppamento MENSILE
                table_name = "vista_mensile"
                resample_freq = 'MS'
            else:
                # Altrimenti mostra GIORNALIERO
                table_name = "vista_settimanale"
                resample_freq = '1D'
                
            # Override temporaneo di 'now' per il reindex corretto fino alla fine del custom range
            now = limit_date 
            
        else:
            return {}

        # --- 2. QUERY ---
        res = supabase.table(table_name)\
            .select(f"{col_time}, {col_val}")\
            .eq("impianto_id", plantId)\
            .gte(col_time, start_date.isoformat())\
            .lte(col_time, now.isoformat()) \
            .order(col_time)\
            .execute()

        if not res.data: 
            return {"chart": [], "kpi": {}}

        # --- 3. ELABORAZIONE ---
        df = pd.DataFrame(res.data)
        df.rename(columns={col_time: 'timestamp', col_val: 'value'}, inplace=True)
        
        df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True).dt.tz_convert(None).dt.normalize()
        
        # --- 4. RIEMPIMENTO BUCHI ---
        if period == 'day':
            full_idx = pd.date_range(start=start_date, end=now, freq=resample_freq)
        else:
            full_idx = pd.date_range(start=start_date, end=now, freq=resample_freq).normalize()
        
        df = df.set_index('timestamp')
        df_resampled = df.reindex(full_idx, fill_value=0).reset_index()
        df_resampled.rename(columns={'index': 'timestamp'}, inplace=True) 
        df_resampled['value'] = df_resampled['value'].fillna(0)

        # --- 5. KPI ---
        total_prod = df_resampled['value'].sum()
        max_peak_val = df_resampled['value'].max()
        co2_saved = total_prod * 0.225
        
        # Efficienza (semplificata)
        est_power = 6.0 
        hours = (now - start_date).total_seconds() / 3600
        theoretical_max = est_power * (hours / 24 * 5) 
        efficiency = (total_prod / theoretical_max * 100) if theoretical_max > 0 else 0
        if efficiency > 100: efficiency = 99.9

        # Peak Label
        peak_label = "-"
        DAYS_IT = {0:'Lun', 1:'Mar', 2:'Mer', 3:'Gio', 4:'Ven', 5:'Sab', 6:'Dom'}
        MONTHS_IT = {1:'Gen', 2:'Feb', 3:'Mar', 4:'Apr', 5:'Mag', 6:'Giu', 7:'Lug', 8:'Ago', 9:'Set', 10:'Ott', 11:'Nov', 12:'Dic'}

        if total_prod > 0:
            idxmax = df_resampled['value'].idxmax()
            pk_ts = df_resampled.iloc[idxmax]['timestamp']
            if period == 'day': peak_label = pk_ts.strftime('%H:%M')
            elif period == 'year' or (period == 'custom' and resample_freq == 'MS'): 
                peak_label = MONTHS_IT.get(pk_ts.month, '-')
            else: peak_label = f"{pk_ts.day} {MONTHS_IT.get(pk_ts.month,'')}"

        # --- 6. OUTPUT JSON ---
        chart_data = []
        for _, row in df_resampled.iterrows():
            ts = row['timestamp']
            val = round(row['value'], 2)
            
            label = ""
            if period == 'day': label = ts.strftime('%H:%M')
            elif period == 'week': label = DAYS_IT.get(ts.weekday(), '-')
            elif period == 'month': label = ts.strftime('%d')
            elif period == 'year': label = MONTHS_IT.get(ts.month, '-')
            elif period == 'custom':
                if resample_freq == 'MS': label = MONTHS_IT.get(ts.month, '-') 
                else: label = f"{ts.day} {MONTHS_IT.get(ts.month,'')}"

            chart_data.append({
                "time": label,
                "full_date": ts.isoformat(),
                "Produzione": val
            })

        return {
            "chart": chart_data,
            "kpi": {
                "totalEnergy": round(total_prod, 2),
                "co2": round(co2_saved, 2),
                "peakValue": round(max_peak_val, 2),
                "peakTime": peak_label,
                "efficiency": round(efficiency, 1)
            }
        }
    except Exception as e:
        print(f"ERR History: {e}")
        return {"chart": [], "kpi": {}}

# --- NUOVA ROUTE: GENERAZIONE PDF ---@app.get("/api/report/download")
def download_report(
    period: str, 
    plantId: str, 
    startDate: str = Query(None), 
    endDate: str = Query(None)
):
    try:
        now = datetime.now()
        
        # --- CASO SPECIALE: LIVE REPORT ---
        if period == 'live':
            # Recuperiamo dati ultimi 24h (Simile alla dashboard)
            # Se plantId='summary', potremmo aggregare, ma qui per semplicità prendiamo dati generici o di un impianto
            # Per ora facciamo una query generica su 'misurazioni' per l'impianto (se fornito) o il primo che troviamo
            
            target_plant = plantId if plantId != 'summary' else None
            
            # Se non c'è ID, ne prendiamo uno a caso per demo, o tutti
            start_live = now - timedelta(hours=24)
            query = supabase.table("misurazioni").select("*").gte("timestamp", start_live.isoformat()).lte("timestamp", now.isoformat()).order("timestamp")
            
            if target_plant:
                query = query.eq("impianto_id", target_plant)
            else:
                query = query.limit(200) # Limitiamo per summary generico
                
            res = query.execute()
            
            if not res.data:
                raise HTTPException(status_code=404, detail="Nessun dato live disponibile per il report")
                
            df = pd.DataFrame(res.data)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            # Preparazione dati per grafico
            # Per il Live usiamo un Line Chart (più sensato per 24h)
            plt.figure(figsize=(10, 5))
            plt.plot(df['timestamp'], df['produzione_kw'], color='#eab308', linewidth=2) # Giallo/Ambra
            plt.fill_between(df['timestamp'], df['produzione_kw'], color='#eab308', alpha=0.3)
            plt.title("Produzione Live (Ultime 24h)")
            plt.ylabel("Potenza (kW)")
            plt.grid(axis='y', linestyle='--', alpha=0.5)
            plt.xticks(rotation=45, fontsize=8)
            
            # KPI Semplici per Live
            kpi = {
                "totalEnergy": round(df['produzione_kw'].sum() / 12, 2), # Stima grossolana energia
                "co2": round((df['produzione_kw'].sum() / 12) * 0.225, 2),
                "peakValue": round(df['produzione_kw'].max(), 2),
                "efficiency": "N/A"
            }
            
        else:
            # --- CASO STORICO (Logica esistente) ---
            # ... (Tutto il blocco 'if period == day/week...' di prima va qui, chiamando la funzione get_production_history logic) ...
            # Per brevità richiamo la funzione esistente simulata:
            data = get_production_history(period, plantId, startDate, endDate, None)
            if not data or 'chart' not in data: raise HTTPException(status_code=404, detail="No data")
            
            kpi = data['kpi']
            chart_data = data['chart']
            
            # Bar Chart per storico
            labels = [d['time'] for d in chart_data]
            values = [d['Produzione'] for d in chart_data]
            plt.figure(figsize=(10, 5))
            plt.bar(labels, values, color='#22c55e') 
            plt.title(f"Produzione Energia - {period.capitalize()}")
            plt.ylabel("kWh")
            plt.grid(axis='y', linestyle='--', alpha=0.7)
            plt.xticks(rotation=45, fontsize=8)

        # --- GENERAZIONE PDF COMUNE ---
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
        pdf.cell(0, 10, f"Data generazione: {datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=True)
        if period == 'live':
             pdf.cell(0, 10, "Tipo: Monitoraggio in tempo reale (24h)", ln=True)
        else:
             pdf.cell(0, 10, f"Periodo Analisi: {period}", ln=True)
        pdf.ln(10)
        
        # KPI Table
        pdf.set_fill_color(245, 245, 245)
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(45, 10, "Totale Energia", 1, 0, 'C', 1)
        pdf.cell(45, 10, "CO2 Evitata", 1, 0, 'C', 1)
        pdf.cell(45, 10, "Picco Max", 1, 1, 'C', 1)
        
        pdf.set_font("Arial", '', 12)
        pdf.cell(45, 10, f"{kpi['totalEnergy']} kWh", 1, 0, 'C')
        pdf.cell(45, 10, f"{kpi['co2']} kg", 1, 0, 'C')
        # Unit check
        unit = "kW" if period == 'live' else "kWh"
        pdf.cell(45, 10, f"{kpi['peakValue']} {unit}", 1, 1, 'C')
        pdf.ln(10)

        # Immagine
        import tempfile, os
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_file:
            tmp_file.write(img_buffer.getvalue())
            tmp_path = tmp_file.name
        
        # Centra immagine (A4 width ~210mm)
        pdf.image(tmp_path, x=10, y=None, w=190)
        os.unlink(tmp_path)

        pdf_buffer = io.BytesIO()
        pdf_bytes = pdf.output(dest='S').encode('latin-1')
        pdf_buffer.write(pdf_bytes)
        pdf_buffer.seek(0)
        
        return StreamingResponse(pdf_buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=rinova_report_{period}.pdf"})

    except Exception as e:
        print(f"PDF Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
# --- 6. ROUTE SUMMARY ---
@app.get("/api/dashboard/summary")
def get_dashboard_summary(user: dict = Depends(get_current_user)):
    try:
        now = datetime.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday_start = today_start - timedelta(days=1)
        week_start = now - timedelta(days=7) # Per calcolo CO2 settimanale
        
        # 1. Dati Oggi e Ieri (per Prod/Consumo e Trend) da mv_analytics_oraria (più veloce per aggregati)
        res_today = supabase.table('mv_analytics_oraria')\
            .select('produzione_kwh, consumo_kwh')\
            .gte('ora', today_start.isoformat())\
            .lte('ora', now.isoformat())\
            .execute()
        
        res_yesterday = supabase.table('mv_analytics_oraria')\
            .select('produzione_kwh, consumo_kwh')\
            .gte('ora', yesterday_start.isoformat())\
            .lt('ora', today_start.isoformat())\
            .execute()

        # 2. Dati Settimanali per CO2 (dalla vista giornaliera)
        res_week = supabase.table('vista_settimanale')\
            .select('produzione')\
            .gte('timestamp', week_start.strftime('%Y-%m-%d'))\
            .execute()

        data_today = res_today.data or []
        data_yesterday = res_yesterday.data or []
        data_week = res_week.data or []
        
        # Totali Oggi
        prod_today = sum(d['produzione_kwh'] for d in data_today)
        cons_today = sum(d['consumo_kwh'] for d in data_today)
        
        # Totali Ieri
        prod_yesterday = sum(d['produzione_kwh'] for d in data_yesterday)
        cons_yesterday = sum(d['consumo_kwh'] for d in data_yesterday)
        
        # Totale Settimana per CO2
        prod_week = sum(d['produzione'] for d in data_week)
        
        # Calcolo Trend %
        def calc_trend(curr, prev):
            if prev == 0: return "+0%" if curr > 0 else "0%"
            perc = ((curr - prev) / prev) * 100
            sign = "+" if perc > 0 else ""
            return f"{sign}{int(perc)}%"

        return {
            "produzione": round(prod_today, 2),
            "consumo": round(cons_today, 2),
            "batteria": 78, # Valore simulato
            "risparmio_co2": round(prod_week * 0.225, 2), # Calcolo su base settimanale
            "trend_produzione": calc_trend(prod_today, prod_yesterday),
            "trend_consumo": calc_trend(cons_today, cons_yesterday)
        }
    except Exception as e:
        print(f"Error summary: {e}")
        return {
            "produzione": 0, "consumo": 0, "batteria": 0, "risparmio_co2": 0,
            "trend_produzione": "--", "trend_consumo": "--"
        }

# --- CHART ENDPOINT (MODIFICATO: Dati granulari 5 min da 'misurazioni') ---
@app.get("/api/dashboard/chart")
def get_dashboard_chart(user: dict = Depends(get_current_user)):
    try:
        now = datetime.now()
        # Ultime 4 ore
        start_date = now - timedelta(hours=4)

        # Interroghiamo 'misurazioni' invece di 'mv_analytics_oraria' per avere i 5 minuti
        # Limitiamo i campi per performance
        res = supabase.table('misurazioni')\
            .select('timestamp, produzione_kw, consumo_kw')\
            .gte('timestamp', start_date.isoformat())\
            .lte('timestamp', now.isoformat())\
            .order('timestamp', desc=False)\
            .execute()
            
        data = res.data or []
        if not data: return []

        df = pd.DataFrame(data)
        # Rinominare colonna per uniformità con logica precedente
        df.rename(columns={'timestamp': 'ora'}, inplace=True)
        df['ora'] = pd.to_datetime(df['ora'])
        
        # Se ci sono più impianti, raggruppiamo sommando i valori per lo stesso timestamp
        df_grouped = df.groupby('ora')[['produzione_kw', 'consumo_kw']].sum().reset_index()
        
        result = []
        for _, row in df_grouped.iterrows():
            result.append({
                "ora": row['ora'].strftime('%H:%M'), # Formato HH:MM per il grafico
                "produzione": round(row['produzione_kw'], 2),
                "consumo": round(row['consumo_kw'], 2)
            })
            
        return result
    except Exception as e:
        print(f"Error home chart: {e}")
        return []

@app.get("/api/dati-privati")
def leggi_dati_sensibili(user: dict = Depends(get_current_user)):
    return {
        "message": "Accesso autorizzato",
        "utente": user['sub'],
        "ruolo": user.get('role', 'user')
    }

@app.get("/api/debug/history-check")
def debug_history(period: str, plantId: str):
    now = datetime.now()
    
    # Replica la logica della history
    if period == 'year':
        table = "vista_mensile"
        start = now.replace(year=now.year-1, day=1)
    elif period == 'month':
        table = "vista_settimanale"
        start = now - timedelta(days=30)
    else:
        return "Periodo non supportato per debug"

    # 1. Esegui la query SENZA filtri temporali stretti per vedere se i dati esistono
    res_all = supabase.table(table)\
        .select("*")\
        .eq("impianto_id", plantId)\
        .limit(5)\
        .execute()
        
    # 2. Esegui la query CON i filtri che usa l'app
    res_filtered = supabase.table(table)\
        .select("*")\
        .eq("impianto_id", plantId)\
        .gte("timestamp", start.isoformat())\
        .lte("timestamp", now.isoformat()) \
        .execute()

    return {
        "debug_info": {
            "tabella_usata": table,
            "ora_server_python": now.isoformat(),
            "filtro_start": start.isoformat(),
            "filtro_end": now.isoformat()
        },
        "dati_senza_filtro_data (primi 5)": res_all.data,
        "dati_che_vede_il_grafico": res_filtered.data
    }

@app.get("/api/debug/db")
def debug_db():
    res = supabase.table("impianti").select("*").execute()
    impianti = res.data
    res2 = supabase.table("misurazioni").select("*").limit(10).execute()
    misurazioni = res2.data
    return {
        "impianti_trovati": len(impianti),
        "impianti_raw": impianti,
        "misurazioni_trovate": len(misurazioni),
        "misurazioni_sample": misurazioni
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)