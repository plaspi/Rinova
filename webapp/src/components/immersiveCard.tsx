import { cn } from "@/lib/utils";

interface ImmersiveFeatureCardProps {
  title: string;
  description: string;
  imageLight: string;
  imageDark: string;
  className?: string; // Per fargli occupare 1 colonna o 2 colonne nella griglia
}

export function ImmersiveFeatureCard({
  title,
  description,
  imageLight,
  imageDark,
  className,
}: ImmersiveFeatureCardProps) {
  return (
    <div className={cn(
        "relative overflow-hidden rounded-[40px] border! border-border! bg-muted/20! group",
        className
    )}>
      {/* 1. IMMAGINE LIGHT (Visibile in Light Mode, scompare in Dark Mode) */}
      <img
        src={imageLight}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-100 dark:opacity-0 group-hover:scale-105"
      />

      {/* 2. IMMAGINE DARK (Invisibile in Light Mode, appare in Dark Mode) */}
      {/* transition-all duration-700 garantisce una dissolvenza incrociata perfetta! */}
      <img
        src={imageDark}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-0 dark:opacity-100 group-hover:scale-105"
      />

      {/* 3. GRADIENTE DI PROTEZIONE (Assicura sempre il contrasto del testo) */}
      {/* Usiamo bg-background che in light mode è bianco sfumato, in dark mode è nero sfumato */}
      <div className="absolute inset-0 bg-linear-to-t from-background! via-background/40! to-transparent z-10 pointer-events-none" />

      {/* 4. TESTO IN OVERLAY */}
      <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-20">
        <h3 className="text-3xl md:text-4xl font-extrabold text-foreground! tracking-tight mb-3 transition-colors duration-300">
            {title}
        </h3>
        <p className="text-lg text-muted-foreground! max-w-2xl transition-colors duration-300">
            {description}
        </p>
      </div>
    </div>
  );
}