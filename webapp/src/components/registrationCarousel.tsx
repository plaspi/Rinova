import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Laptop, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegistrationCarouselProps {
  className?: string;
}

export function RegistrationCarousel({ className }: RegistrationCarouselProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      
      <Carousel 
        className="w-full h-full flex items-center" 
        opts={{ loop: true }} 
        plugins={[Autoplay({ delay: 5000 })]}
      >
        <CarouselContent className="items-center">
          
          {/* --- SLIDE 1: EFFICIENZA --- */}
          <CarouselItem className="flex flex-col items-center justify-center text-center p-6 lg:p-12">
            
            {/* GLASS CARD */}
            {/* Rimosso aspect-ratio fisso. Usa larghezza fissa max e padding per il contenuto */}
            <div className="w-full max-w-[380px] bg-white/10 border border-white/20 rounded-3xl backdrop-blur-md shadow-2xl p-8 flex flex-col gap-6">
               
               {/* Parte Superiore: Icona e Numero */}
               <div className="flex items-start justify-between w-full">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Zap className="w-8 h-8 text-white fill-white/20" />
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold tracking-tighter text-white">+12.4%</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/70 mt-1">Efficienza Energetica</div>
                  </div>
               </div>

               {/* Progress Bar visuale */}
               <div className="w-full space-y-2">
                 <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className="h-full w-[75%] bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)] animate-pulse" />
                 </div>
                 <div className="flex justify-between text-xs font-medium text-white/60">
                   <span>Settimana scorsa</span>
                   <span>Oggi</span>
                 </div>
               </div>
            </div>

            {/* Testo Sotto la card */}
            <div className="mt-8 max-w-xs mx-auto space-y-2">
              <h3 className="text-2xl font-bold text-white">Unisciti alle CER</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Partecipa alle Comunità Energetiche e massimizza il risparmio collettivo.
              </p>
            </div>
          </CarouselItem>


          {/* --- SLIDE 2: DASHBOARD --- */}
          <CarouselItem className="flex flex-col items-center justify-center text-center p-6 lg:p-12">
            
            <div className="w-full max-w-[380px] aspect-square bg-white/10 border border-white/20 rounded-3xl backdrop-blur-md shadow-2xl flex items-center justify-center relative mb-8">
               <Laptop className="w-24 h-24 text-white opacity-90" />
               <div className="absolute inset-0 bg-white/5 rounded-3xl animate-pulse" />
            </div>

            <div className="max-w-xs mx-auto space-y-2">
              <h3 className="text-2xl font-bold text-white">Gestione Semplificata</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Tieni traccia di consumi e scadenze da un'unica dashboard intuitiva.
              </p>
            </div>
          </CarouselItem>

          
          {/* --- SLIDE 3: SICUREZZA --- */}
          <CarouselItem className="flex flex-col items-center justify-center text-center p-6 lg:p-12">
            
            <div className="w-full max-w-[380px] aspect-square bg-white/10 border border-white/20 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col items-center justify-center p-6 mb-8">
               <ShieldCheck className="w-32 h-32 text-white drop-shadow-lg" />
               <div className="mt-6 px-4 py-1.5 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                  End-to-End Encryption
               </div>
            </div>

            <div className="max-w-xs mx-auto space-y-2">
              <h3 className="text-2xl font-bold text-white">Sicurezza al primo posto</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                I tuoi dati sensibili sono protetti con gli standard di crittografia più elevati.
              </p>
            </div>
          </CarouselItem>

        </CarouselContent>
      </Carousel>
    </div>
  );
}