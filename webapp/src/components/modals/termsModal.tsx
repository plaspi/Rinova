import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// --- SHARED LAYOUT COMPONENT ---
interface LegalModalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdate: string;
  content: React.ReactNode;
}

function LegalModalLayout({ children, title, lastUpdate, content }: LegalModalLayoutProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="cursor-pointer font-semibold underline hover:text-primary transition-colors">
          {children}
        </span>
      </DialogTrigger>
      <DialogContent className={cn(
        "max-w-md md:max-w-2xl h-[85vh] flex flex-col p-0 gap-0 bg-card border-border sm:rounded-xl",
        "fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
        "data-[state=open]:animate-slide-up-fade",
        "data-[state=open]:slide-in-from-left-0 data-[state=open]:zoom-in-0 fade-in-0",
        "duration-200",
        "[&>button]:bg-background!",
        "[&>button]:hover:border-transparent!",
        "[&>button]:text-frontground!",
        "[&>button]:hover:outline-none!",
        "[&>button]:transition-none!",
        "[&>button]:active:border-transparent!",
        "[&>button]:border-none!",
        "[&>button]:focus:ring-0!",
        "[&>button]:focus:ring-offset-0!", 
        "[&>button]:focus:outline-none! ",
        "[&>button]:focus-visible:ring-0!"
      )}>
        <DialogHeader className="p-6 pb-4 border-b shrink-0 bg-muted/10">
          <DialogTitle className="text-2xl font-bold text-foreground">{title}</DialogTitle>
          <DialogDescription>
            Ultimo aggiornamento: {lastUpdate}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-6">
          <div className="text-sm text-muted-foreground space-y-6 pr-4 text-justify leading-relaxed">
            {content}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// --- COMPONENT 1: TERMS OF SERVICE ---
export function TermsOfServiceModal({ children }: { children: React.ReactNode }) {
  const content = (
    <>
      <section>
        <h3 className="text-foreground font-semibold mb-2">1. Accettazione dei Termini</h3>
        <p>
          Benvenuto in Rinova. Utilizzando la nostra applicazione, il sito web e i servizi correlati (collettivamente, il "Servizio"), l'utente accetta di essere vincolato dai presenti Termini di Servizio. Se non accetti questi termini, ti invitiamo a non utilizzare il Servizio. Rinova Energy S.r.l. ("Rinova", "noi") si riserva il diritto di modificare questi termini in qualsiasi momento.
        </p>
      </section>

      <section>
        <h3 className="text-foreground font-semibold mb-2">2. Descrizione del Servizio</h3>
        <p>
          Rinova fornisce una piattaforma digitale per il monitoraggio dei consumi energetici, la gestione della produzione fotovoltaica e la partecipazione a Comunità Energetiche Rinnovabili (CER). Il Servizio include analisi dati, reportistica e strumenti di ottimizzazione.
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Dati Energetici:</strong> Forniamo visualizzazioni basate sui dati ricevuti dai meter o dai distributori. Non garantiamo l'assoluta precisione dei dati in tempo reale se dipendenti da terze parti.</li>
          <li><strong>Non Consulenza Finanziaria:</strong> Le stime di risparmio sono proiezioni basate sui dati storici. Non costituiscono garanzia di rendimento finanziario.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-foreground font-semibold mb-2">3. Registrazione e Sicurezza</h3>
        <p>
          Per accedere ad alcune funzionalità, è necessario creare un account. L'utente è responsabile della custodia delle proprie credenziali di accesso. Rinova non sarà responsabile per eventuali perdite derivanti dall'uso non autorizzato del tuo account. L'utente si impegna a fornire dati veritieri e completi (es. POD, dati anagrafici) durante la registrazione.
        </p>
      </section>

      <section>
        <h3 className="text-foreground font-semibold mb-2">4. Comunità Energetiche (CER)</h3>
        <p>
          Se l'utente partecipa a una CER tramite Rinova, accetta che i propri dati di consumo e produzione vengano condivisi con il Referente della Comunità e con il GSE (Gestore Servizi Energetici) ai fini del calcolo degli incentivi condivisi. L'adesione a una CER è regolata dallo Statuto specifico della Comunità stessa, che prevale in caso di conflitto sulle regole di ripartizione economica.
        </p>
      </section>

      <section>
        <h3 className="text-foreground font-semibold mb-2">5. Proprietà Intellettuale</h3>
        <p>
          Tutti i diritti, titoli e interessi relativi al Servizio (inclusi software, design, loghi e algoritmi) sono e rimarranno di proprietà esclusiva di Rinova e dei suoi licenziatari. È vietata la copia, la modifica o la distribuzione non autorizzata del software.
        </p>
      </section>

      <section>
        <h3 className="text-foreground font-semibold mb-2">6. Limitazione di Responsabilità</h3>
        <p>
          Nella misura massima consentita dalla legge, Rinova non sarà responsabile per danni indiretti, incidentali o consequenziali derivanti dall'uso o dall'impossibilità di utilizzare il Servizio, inclusi malfunzionamenti della rete elettrica o interruzioni del servizio internet.
        </p>
      </section>

      <section>
        <h3 className="text-foreground font-semibold mb-2">7. Risoluzione e Cancellazione</h3>
        <p>
          L'utente può cancellare il proprio account in qualsiasi momento tramite le impostazioni dell'app. Rinova si riserva il diritto di sospendere o terminare l'accesso al Servizio in caso di violazione dei presenti Termini o per esigenze tecniche/legali, previo preavviso ragionevole.
        </p>
      </section>
      
      <section className="pt-4 border-t">
        <p className="text-xs">
          Per domande sui Termini di Servizio, contattaci a: <a href="mailto:support_rinovaenergy@gmail.com" className="text-primary hover:underline">support_rinovaenergy@gmail.com</a>
        </p>
      </section>
    </>
  );

  return (
    <LegalModalLayout title="Termini di Servizio" lastUpdate="5 Febbraio 2026" content={content}>
      {children}
    </LegalModalLayout>
  );
}

// --- COMPONENT 2: PRIVACY POLICY ---
export function PrivacyPolicyModal({ children }: { children: React.ReactNode }) {
  const content = (
    <>
      <section>
        <h3 className="text-foreground font-semibold mb-2">1. Titolare del Trattamento</h3>
        <p>
          Rinova Energy S.r.l. (di seguito "Titolare") con sede legale a Trento, Italia, si impegna a proteggere la tua privacy e i tuoi dati personali in conformità al Regolamento UE 2016/679 (GDPR).
        </p>
      </section>

      <section>
        <h3 className="text-foreground font-semibold mb-2">2. Dati Raccolti</h3>
        <p>
          Raccogliamo diverse tipologie di dati per fornire e migliorare il nostro Servizio:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Dati Personali:</strong> Nome, cognome, indirizzo email, codice fiscale, numero di telefono.</li>
          <li><strong>Dati Energetici:</strong> Codice POD/PDR, dati di consumo (prelievi) e produzione (immissioni) quartorari o orari, potenza contrattuale.</li>
          <li><strong>Dati Tecnici:</strong> Indirizzo IP, tipo di dispositivo, log di sistema.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-foreground font-semibold mb-2">3. Finalità del Trattamento</h3>
        <p>
          I tuoi dati vengono trattati per:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Fornire il servizio di monitoraggio energetico.</li>
          <li>Gestire la partecipazione tecnica e amministrativa alle Comunità Energetiche (es. invio dati al GSE).</li>
          <li>Inviare notifiche di sicurezza o reportistica (via email/push).</li>
          <li>Adempiere agli obblighi legali e fiscali.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-foreground font-semibold mb-2">4. Condivisione dei Dati</h3>
        <p>
          I dati non saranno diffusi, ma potranno essere comunicati a:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Gestore dei Servizi Energetici (GSE):</strong> Per le pratiche di incentivazione CER.</li>
          <li><strong>Distributori di Rete:</strong> Per l'acquisizione delle curve di carico.</li>
          <li><strong>Fornitori di Servizi Tecnici:</strong> (es. hosting cloud, provider email) che agiscono come Responsabili del Trattamento.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-foreground font-semibold mb-2">5. Conservazione dei Dati</h3>
        <p>
          I dati saranno conservati per il tempo strettamente necessario a conseguire gli scopi per cui sono stati raccolti (es. durata del contratto) e successivamente per 10 anni per obblighi fiscali/legali.
        </p>
      </section>

      <section>
        <h3 className="text-foreground font-semibold mb-2">6. Diritti dell'Utente</h3>
        <p>
          Ai sensi del GDPR, hai il diritto di:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Accedere ai tuoi dati personali e richiederne copia.</li>
          <li>Richiedere la rettifica di dati inesatti.</li>
          <li>Richiedere la cancellazione ("diritto all'oblio") qualora non sussistano motivi legali per la conservazione.</li>
          <li>Revocare il consenso in qualsiasi momento (es. per notifiche marketing).</li>
        </ul>
      </section>

      <section>
        <h3 className="text-foreground font-semibold mb-2">7. Sicurezza</h3>
        <p>
          Adottiamo misure di sicurezza tecniche e organizzative adeguate (crittografia, controlli di accesso) per proteggere i tuoi dati da accessi non autorizzati o perdite accidentali.
        </p>
      </section>

      <section className="pt-4 border-t">
        <p className="text-xs">
          Per esercitare i tuoi diritti, scrivi al Responsabile della Protezione Dati (DPO): <a href="mailto:support_rinovaenergy@gmail.com" className="text-primary hover:underline">support_rinovaenergy@gmail.com</a>
        </p>
      </section>
    </>
  );

  return (
    <LegalModalLayout title="Privacy Policy" lastUpdate="5 Febbraio 2026" content={content}>
      {children}
    </LegalModalLayout>
  );
}