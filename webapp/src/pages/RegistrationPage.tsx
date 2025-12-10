import { RegistrationForm } from "@/components/forms/registration-form"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { useIsMobile } from "@/hooks/use-mobile" // Assicurati che l'import sia corretto

export default function RegistrationPage() {
  const isMobile = useIsMobile()

  // --- 1. VERSIONE MOBILE ---
  // Il componente RegistrationForm è già autonomo per il mobile 
  // (ha il suo logo, header e layout full-screen).
  if (isMobile) {
    return <RegistrationForm />
  }

  // --- 2. VERSIONE DESKTOP ---
  // Layout a due colonne bloccato a schermo intero (h-screen)
  return (
    <div className="grid lg:grid-cols-2 h-screen w-full overflow-hidden">
      
      {/* COLONNA SINISTRA (Logo + Form) */}
      <div className="flex flex-col h-full relative bg-card! p-8 md:p-12 lg:p-16">

        {/* Logo fisso in alto a sinistra */}
        <div className="absolute top-8 left-8 z-20">
          <a href="#" className="flex items-center">
              <img 
                src="/images/rinova_logo.png" 
                alt="Logo Rinova" 
                className="h-12 w-auto object-contain" // Dimensioni controllate
              />
          </a>
        </div>
        
        {/* Wrapper per centrare il form verticalmente e orizzontalmente */}
        <div className="flex-1 flex items-center justify-center w-full">
           <div className="w-full max-w-md">
             {/* Passiamo classi per "resettare" lo stile desktop base del Form 
                e farlo integrare nella colonna bianca pulita.
             */}
             <RegistrationForm className="min-h-0 bg-transparent p-0 shadow-none" />
           </div>
        </div>
      </div>

      {/* COLONNA DESTRA (Carosello) */}
      <div className="flex flex-col md:p-4 w-full hidden lg:flex max-h-screen overflow-hidden">
        <Carousel className="w-full h-full flex-1" opts={{loop:true,}} plugins={[Autoplay({delay: 6000})]}>
          <CarouselContent className="w-full h-full">
            <CarouselItem className="w-full h-full">
              <img
                src="/images/rinova_logo.png"
                alt="slide1"
                className="w-full h-full object-contain max-h-screen"
              />
            </CarouselItem>

            <CarouselItem className="w-full h-full">
              <img
                src="/images/carousel3.jpg"
                alt="slide2"
                className="w-full h-full object-contain max-h-screen"
              />
            </CarouselItem>

            <CarouselItem className="w-full h-full">
              <img
                src="/images/carousel3.jpg"
                alt="slide3"
                className="w-full h-full object-contain"
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
</div>
    </div>
  )
}