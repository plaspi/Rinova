import { RegistrationForm } from "@/components/forms/registration-form";
import { RegistrationCarousel } from "@/components/registrationCarousel";
import { Card } from "@/components/ui/card";
import { Leaf } from "lucide-react";

export default function RegistrationPage() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-muted/20 p-4 lg:p-0">
      
      <Card className="
        w-full max-w-5xl 
        h-full lg:h-auto lg:max-h-[90vh] 
        flex flex-col lg:grid lg:grid-cols-2 
        border-0 lg:border shadow-none lg:shadow-2xl 
        lg:rounded-3xl 
        ring-1 ring-border/50
        overflow-hidden bg-card
        animate-in fade-in zoom-in-95 duration-400
      ">
        
        {/* COLONNA SINISTRA (Form) */}
        <div className="flex-1 flex flex-col justify-center p-6 lg:p-12 overflow-y-auto scrollbar-hide relative">
          
          <div className="flex items-center gap-2 mb-6 shrink-0">
            <div className="bg-green-500 p-2 rounded-lg shadow-sm">
               <Leaf className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">Rinova</span>
          </div>

          {/* MODIFICA QUI: 
              1. max-w-[520px] invece di max-w-sm: Allarga il form orizzontalmente.
              2. mx-auto: Lo centra perfettamente nella colonna bianca.
          */}
          <div className="w-full max-w-[520px] mx-auto space-y-6">
              <div className="flex flex-col space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Crea un account</h1>
                <p className="text-sm text-muted-foreground">
                  Inserisci i tuoi dati qui sotto per iniziare.
                </p>
              </div>
              
              <RegistrationForm />
          </div>
        </div>

        {/* COLONNA DESTRA (Visual) */}
        <div className="hidden lg:flex flex-col relative bg-linear-to-br from-green-500 to-emerald-900 text-white overflow-hidden items-center justify-center">
           
           {/* Pattern di sfondo */}
           <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
           <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />

           {/* Componente Carousel */}
           <RegistrationCarousel className="w-full h-full z-10" />
        </div>

      </Card>
    </div>
  );
}