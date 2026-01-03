import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsModalProps {
  children: React.ReactNode;
  title: string;
}

export function TermsModal({ children, title }: TermsModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="cursor-pointer font-semibold hover:underline hover:text-primary transition-colors">
          {children}
        </span>
      </DialogTrigger>
      {/* max-w-md per mobile/tablet, max-h-[80vh] per evitare overflow schermo */}
      <DialogContent className="max-w-md md:max-w-lg h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle className="text-xl font-bold text-foreground">{title}</DialogTitle>
          <DialogDescription>
            Ultimo aggiornamento: 25 Dicembre 2024
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-6 pt-2">
          <div className="text-sm text-muted-foreground space-y-4 pr-4">
            <p>
              <strong>1. Introduzione</strong><br/>
              Benvenuto in Rinova. Questo documento disciplina l'utilizzo dell'applicazione e dei servizi connessi.
              Utilizzando la piattaforma, accetti di essere vincolato dai presenti termini.
            </p>
            <p>
              <strong>2. Gestione Dati Energetici</strong><br/>
              L'utente autorizza Rinova a raccogliere e analizzare i dati di consumo provenienti dai dispositivi connessi (POD, Smart Meter) al fine di fornire suggerimenti di risparmio e ottimizzazione.
            </p>
            <p>
              <strong>3. Privacy e Sicurezza (GDPR)</strong><br/>
              I tuoi dati sono trattati in conformità al Regolamento UE 2016/679. Utilizziamo crittografia end-to-end per proteggere le tue informazioni sensibili. Non cediamo i tuoi dati a terzi senza consenso esplicito.
            </p>
            <p>
              <strong>4. Comunità Energetiche (CER)</strong><br/>
              La partecipazione a una CER tramite Rinova è soggetta ai regolamenti specifici della Comunità di riferimento. Rinova funge da piattaforma tecnologica di gestione e ripartizione.
            </p>
            <p>
               Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
               Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}