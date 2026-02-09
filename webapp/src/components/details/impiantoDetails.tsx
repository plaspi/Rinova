import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertTriangle, CloudOff, Sun, Wind, Zap, MapPin, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImpiantoDetailsProps {
  impianto: any
  onClose: () => void
}

export function ImpiantoDetails({ impianto, onClose }: ImpiantoDetailsProps) {
  if (!impianto) return null

  // Logica icone stato e tipo
  let StatusIcon = CheckCircle;
  let statusColor = "text-green-600 bg-green-500/10 border-green-500/20";
  
  // Controllo case-insensitive per sicurezza
  const statoLower = impianto.stato?.toLowerCase() || "";

  if(statoLower === "offline") { 
      StatusIcon = CloudOff; 
      statusColor = "text-red-600 bg-red-500/10 border-red-500/20"; 
  }
  if(statoLower === "manutenzione") { 
      StatusIcon = AlertTriangle; 
      statusColor = "text-yellow-600 bg-yellow-500/10 border-yellow-500/20"; 
  }

  const TypeIcon = impianto.tipo?.toLowerCase().includes("eolico") ? Wind : Sun;

  return (
    // OVERLAY SFOCATO
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* MODALE CENTRALE */}
      <div className="bg-background w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col">

        {/* HEADER FISSO (Sticky) */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-6 md:px-8 py-6 flex items-start justify-between shrink-0">
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <TypeIcon className="h-8 w-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight line-clamp-1">
                        {impianto.nome}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-sm text-muted-foreground font-mono">
                            ID: {impianto.id}
                        </span>
                        <span className="text-muted-foreground hidden sm:inline">•</span>
                        <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1.5", statusColor)}>
                            <StatusIcon className="h-3 w-3" />
                            {impianto.stato}
                        </span>
                    </div>
                </div>
            </div>

            <button
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors shrink-0 ml-2"
                onClick={onClose}
            >
                <X className="h-6 w-6" />
            </button>
        </div>

        {/* CORPO DEL MODALE (Griglia Scrollabile) */}
        <div className="p-6 md:p-8 space-y-8">
            
            {/* GRIGLIA PRINCIPALE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* 1. SPECIFICHE TECNICHE */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                        <Activity className="h-4 w-4 text-primary" /> Specifiche Tecniche
                    </h3>
                    <div className="bg-muted/30 rounded-xl p-5 border space-y-4">
                        <Row label="Tipologia" value={impianto.tipo} />
                        <Row label="Potenza Nominale" value={`${impianto.potenza} kW`} highlight />
                        <Row label="Produttore" value={impianto.produttore} />
                        <Row label="Modello Pannelli" value={impianto.modelloPannelli || "N/D"} />
                        <Row label="Data Attivazione" value={new Date(impianto.data_attivazione).toLocaleDateString()} />
                    </div>
                </div>

                {/* 2. DATI DI RETE */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                        <Zap className="h-4 w-4 text-yellow-500" /> Connessione Rete
                    </h3>
                    <div className="bg-muted/30 rounded-xl p-5 border space-y-4">
                         <Row label="Codice POD" value={impianto.pod || "IT001E..."} mono />
                         <Row label="Inverter Serial No." value="INV-X998877" mono />
                         <Row label="Tensione Lavoro" value="230 V" />
                         <Row label="Convenzione" value="SSP (Scambio sul posto)" />
                    </div>
                </div>
            </div>

            {/* 3. LOCALIZZAZIONE (Full Width) */}
            <div className="space-y-4">
                 <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <MapPin className="h-4 w-4 text-blue-500" /> Localizzazione
                </h3>
                <div className="bg-muted/30 rounded-xl p-5 border flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <Row label="Indirizzo" value="Via Roma 10, Milano (MI)" />
                        <Row label="Coordinate" value="45.4642° N, 9.1900° E" mono />
                        <Row label="Orientamento" value="Sud (180°)" />
                        <Row label="Inclinazione" value="30°" />
                    </div>
                    {/* Placeholder Mappa */}
                    <div className="w-full md:w-64 h-32 bg-muted rounded-lg border border-dashed flex items-center justify-center text-xs text-muted-foreground shrink-0">
                        Mappa Impianto
                    </div>
                </div>
            </div>

        </div>

        {/* FOOTER */}
        <div className="bg-muted/20 border-t p-6 flex justify-end gap-3 rounded-b-2xl shrink-0 mt-auto">
            <Button variant="outline" onClick={onClose}>
                Chiudi
            </Button>
            <Button onClick={() => alert("Funzione modifica non ancora attiva")}>
                Modifica Dati
            </Button>
        </div>

      </div>
    </div>
  )
}

// Componente riga helper per mantenere il codice pulito
function Row({ label, value, highlight = false, mono = false }: { label: string, value: any, highlight?: boolean, mono?: boolean }) {
    return (
        <div className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0 last:pb-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={cn(
                "text-sm font-medium text-foreground text-right",
                highlight && "text-base font-bold text-primary",
                mono && "font-mono text-xs"
            )}>
                {value}
            </span>
        </div>
    )
}