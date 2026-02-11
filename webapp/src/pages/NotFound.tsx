import { Button } from "@/components/ui/button"
import { ZapOff, Home, ArrowLeft, Leaf } from "lucide-react"
import { useNavigate } from "react-router-dom" // Assumendo che usi react-router

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden p-4">
      
      {/* BACKGROUND DECORATION */}
      {/* Un leggero bagliore verde/primary al centro per dare profondità */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      
      {/* Elementi decorativi di sfondo (foglie sparse sfocate) */}
      <Leaf className="absolute top-20 left-[20%] text-primary/5 h-24 w-24 -rotate-12 blur-sm" />
      <Leaf className="absolute bottom-20 right-[20%] text-primary/5 h-32 w-32 rotate-45 blur-sm" />

      {/* CONTENT CARD */}
      <div className="z-10 flex flex-col items-center text-center max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        {/* ICONA ANIMATA */}
        <div className="relative">
            {/* Cerchio rotante esterno */}
            <div className="absolute inset-0 -m-4 rounded-full border-2 border-dashed border-muted-foreground/20 animate-[spin_10s_linear_infinite]" />
            
            {/* Cerchio pulsante interno */}
            <div className="h-24 w-24 bg-muted/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-border/50 shadow-sm">
                <ZapOff className="h-10 w-10 text-muted-foreground" />
            </div>
            
            {/* Badge 404 sovrapposto */}
            <div className="absolute -bottom-2 -right-2 bg-background border border-border px-2 py-0.5 rounded-md text-xs font-mono font-bold shadow-sm">
                ERR_404
            </div>
        </div>

        {/* TESTI */}
        <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Calo di Tensione
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Sembra che la pagina che stavi cercando sia stata scollegata dalla rete o non sia mai esistita.
            </p>
        </div>

        {/* AZIONI */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button 
                variant="outline" 
                className="gap-2 h-11"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft className="h-4 w-4" />
                Torna Indietro
            </Button>
            
            <Button 
                className="gap-2 h-11 bg-foreground! text-primary-foreground hover:bg-primary/90"
                onClick={() => navigate("/home")}
            >
                <Home className="h-4 w-4" />
                Vai alla Dashboard
            </Button>
        </div>

        {/* FOOTER PICCOLO */}
        <div className="pt-8">
            <p className="text-xs text-muted-foreground/50 font-mono">
                Rinova Energy &copy; {new Date().getFullYear()}
            </p>
        </div>

      </div>
    </div>
  )
}