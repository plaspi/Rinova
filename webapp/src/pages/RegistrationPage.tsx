import { RegistrationForm } from "@/components/registration-form"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"


export default function RegistrationPage() {
  return (
    <div className="grid min-h-svh w-[100%] lg:grid-cols-2">
      
      {/* Colonna sinistra */}
      <div className="flex flex-col md:p-[4%] w-[100%] min-h-screen shadow-lg rounded-xl">

        <div className="relative w-full flex items-center">
        {/* Logo a sinistra */}
        <a href="#" className="w-[20%] flex items-center">
            <img 
            src="/images/rinova_logo.png" 
            alt="Logo Rinova" 
            className="w-full h-auto object-contain"
            />
        </a>
        </div>
        


        {/* Form */}
        <div className="">
          <div className="w-[100%] max-w-[100%]">
            <RegistrationForm />
          </div>
        </div>

      </div>

      {/* Colonna destra */}
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
