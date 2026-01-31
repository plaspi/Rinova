import { useState, useEffect } from "react";
import { Zap, BatteryCharging, Users, Leaf, Plug, Home } from "lucide-react";
import { RinovaLogo } from "@/components/rinova-logo";

export function SplashScreen() {
    const [iconIndex, setIconIndex] = useState(0);
    
    //lista delle icone che ruotano
    const icons = [
        { icon: Zap, color: "text-yellow-500" },
        { icon: Home, color: "text-blue-500" },
        { icon: BatteryCharging, color: "text-green-500" },
        { icon: Users, color: "text-orange-500" },
        { icon: Leaf, color: "text-primary" },
        { icon: Plug, color: "text-grey-500"},
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setIconIndex((prev) => (prev + 1) % icons.length);
        }, 1000); //cambia ogni 1000ms

        return () => clearInterval(interval);
    }, []);

    const CurrentIcon = icons[iconIndex].icon;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
            
            {/* Animazione Centrale */}
            <div className="relative flex items-center justify-center mb-8">
                {/* Cerchio rotante esterno (Spinner sottile) */}
                <div className="absolute inset-0 w-24 h-24 border-t-2 border-primary/30 rounded-full animate-spin" />
                
                {/* Icona che cambia al centro */}
                <div className="w-24 h-24 flex items-center justify-center bg-muted/20 rounded-full backdrop-blur-sm ring-1 ring-border shadow-2xl">
                    <CurrentIcon 
                        key={iconIndex} // La key forza il re-render per l'animazione
                        className={`w-10 h-10 ${icons[iconIndex].color} animate-in zoom-in-50 fade-in duration-300`} 
                    />
                </div>
            </div>

            {/* Logo e Branding */}
            <div className="flex items-center gap-3">
                 {/* Qui usiamo il tuo logo SVG piccolo */}
                 <RinovaLogo className="w-12 h-12 text-[#08CA08]" />
                 <span className="text-5xl font-bold tracking-tight text-foreground">Rinova</span>
            </div>

            <p className="mt-4 pl-2 items-center text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-70">
                Caricamento Sistema...
            </p>
        </div>
    );
}