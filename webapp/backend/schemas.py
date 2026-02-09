from pydantic import BaseModel, Field
from enum import Enum

# --- ENUM STATUS IMPIANTO ---

class PlantStatus(str, Enum):
    ATTIVO = "attivo"
    MANUTENZIONE = "manutenzione"
    OFFLINE = "offline"

# --- MODELLI CONDIVISI (KPI & BASE) ---

class KPIBase(BaseModel):
    """Indicatori chiave di prestazione comuni."""
    totalEnergy: float = Field(..., description="Energia totale prodotta nel periodo (kWh)", json_schema_extra={"example": 120.5})
    avgPower: float | None = Field(None, description="Potenza media calcolata (kW)", json_schema_extra={"example": 4.5})
    peak: float | None = Field(None, description="Picco di potenza massimo registrato (kW)", json_schema_extra={"example": 12.2})

class SimpleKPI(BaseModel):
    """KPI per la dashboard riassuntiva (Home)."""
    produzione: float = Field(..., description="Produzione totale odierna (kWh)")
    consumo: float = Field(..., description="Consumo totale odierno (kWh)")
    batteria: int = Field(..., description="Percentuale batteria attuale", ge=0, le=100, json_schema_extra={"example": 78})
    risparmio_co2: float = Field(..., description="CO2 risparmiata (stimata in kg)")
    trend_produzione: str = Field(..., description="Variazione % rispetto a ieri", json_schema_extra={"example": "+5%"})
    trend_consumo: str = Field(..., description="Variazione % rispetto a ieri", json_schema_extra={"example": "-2%"})

# --- DASHBOARD LIVE ---

class PlantSimple(BaseModel):
    id: str = Field(..., description="UUID univoco dell'impianto")
    nome: str = Field(..., description="Nome visualizzato dell'impianto")
    status: PlantStatus = Field(..., description="Stato attuale dell'impianto")

class LiveChartPoint(BaseModel):
    timestamp_full: str = Field(..., description="Timestamp completo ISO 8601")
    time: str = Field(..., description="Orario formattato per asse X (HH:MM)", json_schema_extra={"example": "14:30"})
    Produzione: float = Field(..., description="Valore di produzione istantanea (kW)")

class LiveDashboardResponse(BaseModel):
    """Struttura dati completa per la Dashboard Live."""
    plants: list[PlantSimple] = Field(..., description="Lista degli impianti disponibili")
    charts: dict[str, list[LiveChartPoint]] = Field(..., description="Dati grafici raggruppati per ID impianto")
    kpi: KPIBase

# --- STORICO PRODUZIONE ---

class HistoryChartPoint(BaseModel):
    time: str = Field(..., description="Etichetta asse X (es. 'Lun', '14:00', 'Gen')")
    full_date: str = Field(..., description="Data completa ISO")
    Produzione: float

class HistoryKPI(BaseModel):
    totalEnergy: float
    co2: float
    peakValue: float
    peakTime: str = Field(..., description="Momento in cui è avvenuto il picco (etichetta)")
    efficiency: float | str = Field(..., description="Efficienza stimata impianto (%)")

class HistoryResponse(BaseModel):
    chart: list[HistoryChartPoint]
    kpi: HistoryKPI

# --- GRAFICO SUMMARY HOME ---

class SummaryChartPoint(BaseModel):
    ora: str = Field(..., description="Orario formattato (HH:MM)", json_schema_extra={"example": "09:00"})
    produzione: float
    consumo: float

# --- RISPOSTE GENERICHE / ERRORI ---

class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Dettaglio dell'errore riscontrato")

class GenericResponse[T](BaseModel):
    status: str
    message: str
    data: T | None = None