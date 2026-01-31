import { useEffect, useState } from "react";
import { RinovaLogo } from "@/components/rinova-logo";
import { cn } from "@/lib/utils";

export function LogoutScreen() {
  const [unplug, setUnplug] = useState(false);

  useEffect(() => {
    // Aspetta un istante piccolissimo per permettere il render, poi avvia l'animazione
    const timer = setTimeout(() => {
        setUnplug(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      
      <div className="relative flex items-center">
        
        {/* LA PRESA (Fissa al centro) */}
        {/* Simula una placchetta a muro scura con due fori */}
        <div className="relative z-0 h-32 w-32 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_2px_10px_rgba(0,0,0,1)] flex items-center justify-center gap-6">
            {/* Viti della placchetta (dettaglio estetico) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-neutral-700" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-neutral-700" />
            
            {/* I due buchi della presa */}
            <div className="h-4 w-4 rounded-full bg-black shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"></div>
            <div className="h-4 w-4 rounded-full bg-black shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"></div>
        </div>

        {/* LA SPINA (Il tuo Logo) */}
        {/* Si muove quando 'unplug' diventa true */}
        <div 
            className={cn(
                "absolute left-0 z-10 flex items-center justify-center pointer-events-none transition-all duration-2000 ease-in-out",
                unplug ? "-translate-x-48 opacity-0" : "translate-x-0 opacity-100"
            )}
        >
            {/* Corpo della spina (sfondo del logo) */}
            <div className="relative bg-background/90 p-3 rounded-2xl shadow-2xl border border-white/10 ring-1 ring-green-500/30 backdrop-blur-sm">
                {/* Effetto scintilla quando si stacca */}
                <div className={cn(
                    "absolute -right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-400 rounded-full blur-lg transition-opacity duration-300",
                    unplug ? "opacity-100 scale-150" : "opacity-0 scale-0"
                )} />
                
                <RinovaLogo className="w-16 h-16 text-[#08CA08] drop-shadow-[0_0_15px_rgba(8,202,8,0.5)]" />
            </div>
        </div>

      </div>

      <div className="mt-12 text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">Disconnessione...</h2>
        <p className="text-neutral-400 text-sm">A presto su Rinova</p>
      </div>
    </div>
  );
}