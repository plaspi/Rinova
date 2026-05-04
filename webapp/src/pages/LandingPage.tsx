import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/services/supabase_client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/authContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { RinovaLogo } from "@/components/rinova-logo";
import { TermsOfServiceModal, PrivacyPolicyModal } from "@/components/modals/termsModal";
import { ModeToggle } from "@/components/modeToggle";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  LayoutDashboard, Leaf, Settings, BrainCircuit, BarChart3, 
  Globe, User, LogIn, UserPlus, Mail, Check,
  Sparkles, Send, Target, Rocket, Loader2, CheckCircle2
} from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Inserisci il tuo nome"),
  company: z.string().optional(), // L'azienda può essere facoltativa
  email: z.email("Inserisci un'email valida"),
  message: z.string().min(10, "Il messaggio deve contenere almeno 10 caratteri"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function LandingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const { register: registerContact, handleSubmit: handleContactSubmit, formState: {errors: contactErrors}, reset: resetContact } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
        const { error } = await supabase
        .from('contact_requests')
        .insert([{
            name: data.name,
            company: data.company || null,
            email: data.email,
            message: data.message,
            created_at: new Date().toISOString(),
        }]);
        if (error) throw error;
    },
    onSuccess: () => {
        setContactSuccess(true);
        resetContact();
    },
    onError: (err: Error) => {
        console.error("Errore invio contatto: ", err);
        setContactError("Si è verificato un errore. Riprova più tardi.");
    }
  });

  const onContactSubmit = (data: ContactFormValues) => {
    setContactError(null);
    contactMutation.mutate(data);
  };

   useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (contactSuccess) {
        timeoutId = setTimeout(() => {
            setContactSuccess(false);
        }, 3000);
    }

    return () => {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [contactSuccess]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full! min-h-screen bg-background! text-foreground! font-sans overflow-x-hidden transition-colors duration-300">
      
      {/* --- 1. NAVBAR --- */}
      <nav className="fixed top-0 z-50 w-full border-b! border-border/50! bg-background/30! backdrop-blur-2xl! px-6 py-4">
        <div className="max-w-350 mx-auto flex items-center justify-between">
          <div className="flex-1 flex justify-start">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <RinovaLogo className="h-10 w-10 text-primary! group-hover:scale-105 transition-transform" />
              <span className="text-3xl font-bold tracking-tight text-foreground!">
                Rinova <span className="text-primary!">Energy</span>
              </span>
            </div>
          </div>
          
          <div className="hidden lg:flex flex-none items-center justify-center gap-10 text-md font-semibold text-foreground/80!">
            <span onClick={() => scrollTo('platform')} className="cursor-pointer hover:text-primary! transition-colors">Piattaforma</span>
            <span onClick={() => scrollTo('roadmap')} className="cursor-pointer hover:text-primary! transition-colors">Roadmap</span>
            <span onClick={() => scrollTo('about')} className="cursor-pointer hover:text-primary! transition-colors">Chi Siamo</span>
            <span onClick={() => scrollTo('billing')} className="cursor-pointer hover:text-primary! transition-colors">Piani</span>
            <span onClick={() => scrollTo('contact')} className="cursor-pointer hover:text-primary! transition-colors">Contatti</span>
          </div>

          <div className="flex-1 flex justify-end items-center gap-4">
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 border-2! border-primary/20! cursor-pointer hover:border-primary! transition-colors shadow-sm">
                  {user ? (
                    <>
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10! text-primary!">
                        {profile?.name?.[0] || <User className="h-5 w-5" />}
                      </AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback className="bg-primary/10! text-primary!">
                      <Leaf className="h-5 w-5" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl! shadow-2xl! border-border/50!">
                {user ? (
                  <>
                    <div className="px-2 py-1.5 text-sm font-semibold">{profile?.name} {profile?.surname}</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer rounded-lg!" onClick={() => navigate("/home")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Vai alla Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-lg!" onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" /> Impostazioni Profilo
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground!">Area Riservata</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer rounded-lg!" onClick={() => navigate("/login")}>
                      <LogIn className="mr-2 h-4 w-4 text-primary!" /> Accedi
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-lg!" onClick={() => navigate("/registration")}>
                      <UserPlus className="mr-2 h-4 w-4 text-primary!" /> Registrati
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* --- 2. HERO SECTION --- */}
      <section className="relative w-full pt-36 pb-20 px-6 max-w-300 mx-auto flex flex-col items-center justify-center text-center">
        <div className="absolute top-25 left-1/2 -translate-x-1/2 w-250 h-125 bg-primary/30! dark:bg-primary/15! rounded-full blur-[120px] z-0 pointer-events-none transition-colors duration-500"></div>

        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50! border! border-border/50! text-xs font-semibold text-primary! mb-10 shadow-sm backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Rinova v2.0 è online
        </div>

        <h1 className="relative z-10 text-6xl! md:text-[5.5rem] font-extrabold tracking-tighter leading-[1.05] mb-8 text-foreground!">
          L'ecosistema digitale per le <br className="hidden md:block" /> 
          <span className="text-primary!">Comunità Energetiche Rinnovabili</span>
        </h1>
        
        <p className="relative z-10 text-xl md:text-2xl text-muted-foreground! max-w-3xl leading-relaxed mb-12">
            La soluzione enterprise per monitorare impianti asset-light e gestire Comunità Energetiche Rinnovabili in un'unica dashboard intelligente.
        </p>

        <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" className="h-14 px-10 bg-primary! text-background! font-bold text-base rounded-full! shadow-2xl hover:scale-105 transition-transform" onClick={() => navigate("/login")}>
                Esplora la Piattaforma
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 border-border! text-foreground! font-bold text-base rounded-full! hover:bg-muted! hover:scale-105 transition-transform" onClick={() => scrollTo('contact')}>
                <Mail className="mr-2 h-5 w-5" /> Parla con Noi
            </Button>
        </div>
      </section>

      {/* --- 3. SHOWCASE MOCKUP --- */}
      <section id="showcase" className="relative w-full max-w-350 mx-auto px-6 py-16 z-10">
        {/* Glow Esterno: posizionato dietro alla card per l'effetto backblur reale */}
        <div className="absolute inset-12 bg-primary/25! dark:bg-primary/10! blur-[100px] rounded-full z-0 pointer-events-none"></div>
        
        <div className="relative z-10 w-full bg-card! border! border-border/50! rounded-4xl overflow-hidden shadow-2xl shadow-primary/5!">
            <div className="aspect-21/9 w-full flex flex-col items-center justify-center bg-muted/30!">
                <BarChart3 className="h-16 w-16 text-muted-foreground/30! mb-4" />
                <p className="text-muted-foreground! font-mono text-sm uppercase tracking-widest">[ Video demo in arrivo ]</p>
            </div>
        </div>
      </section>

      {/* --- 4. SEZIONE PIATTAFORMA (Asset + CER) --- */}
      <section id="platform" className="w-full max-w-350 mx-auto px-6 py-32 space-y-40 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">Un unico motore <br/> infiniti impianti</h2>
            <p className="text-xl text-muted-foreground!">Abbiamo unito il monitoraggio tecnico e la gestione amministrativa per offrirti il controllo totale sulla transizione energetica.</p>
        </div>

        {/* Gestione Asset */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center scroll-mt-32">
            <div className="lg:col-span-5 space-y-6 pr-0 lg:pr-8">
                <div className="h-14 w-14 bg-primary/10! flex items-center justify-center rounded-2xl mb-4">
                    <Settings className="h-7 w-7 text-primary!" />
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground!">Gestione Asset</h3>
                <p className="text-lg text-muted-foreground! leading-relaxed text-justify">
                    Visualizza in tempo reale la produzione di inverter e batterie. Confronta le performance effettive con le stime nominali e ricevi alert immediati per ogni anomalia.
                </p>
                <ul className="space-y-4 pt-4">
                    <li className="flex items-center gap-3 text-foreground! font-medium"><Check className="h-5 w-5 text-primary!" /> Integrazione hardware universale</li>
                    <li className="flex items-center gap-3 text-foreground! font-medium"><Check className="h-5 w-5 text-primary!" /> Analisi predittiva manutenzione</li>
                </ul>
            </div>
            <div className="lg:col-span-7 relative group">
                <div className="absolute inset-0 bg-primary/30! dark:bg-primary/40! blur-[80px] rounded-full z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 aspect-16/10 rounded-4xl border! border-border/50! bg-card! shadow-2xl overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
                    <img src="/landingpage/images/plants_light.png" className="absolute inset-0 w-full h-full scale-105 object-cover object-top-left dark:opacity-0 transition-opacity duration-700" />
                    <img src="/landingpage/images/plants_dark.png" className="absolute inset-0 w-full h-full scale-105 object-cover object-top-left opacity-0 dark:opacity-100 transition-opacity duration-700" />
                </div>
            </div>
        </div>

        {/* Network CER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center scroll-mt-32">
            <div className="lg:col-span-7 order-2 lg:order-1 relative group">
                <div className="absolute inset-0 bg-blue-500/30! dark:bg-blue-500/40! blur-[80px] rounded-full z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 aspect-16/10 rounded-4xl border! border-border/50! bg-card! shadow-2xl overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
                    <img src="/landingpage/images/cer_light.png" className="absolute inset-0 w-full h-full object-cover object-top-left dark:opacity-0 transition-opacity duration-700" />
                    <img src="/landingpage/images/cer_dark.png" className="absolute inset-0 w-full h-full object-cover object-top-left opacity-0 dark:opacity-100 transition-opacity duration-700" />
                </div>
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-6 pl-0 lg:pl-8">
                <div className="h-14 w-14 bg-blue-500/10! flex items-center justify-center rounded-2xl mb-4">
                    <Globe className="h-7 w-7 text-blue-500!" />
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground!">Network CER</h3>
                <p className="text-lg text-muted-foreground! leading-relaxed text-justify">
                    Dimentica i fogli Excel. Rinova automatizza l'onboarding dei membri e il calcolo della ripartizione degli incentivi GSE in modo trasparente e immediato.
                </p>
                <ul className="space-y-4 pt-4">
                    <li className="flex items-center gap-3 text-foreground! font-medium"><Check className="h-5 w-5 text-blue-500!" /> Gestione ruoli e permessi</li>
                    <li className="flex items-center gap-3 text-foreground! font-medium"><Check className="h-5 w-5 text-blue-500!" /> Calcolo automatico benefici economici</li>
                </ul>
            </div>
        </div>
      </section>

      {/* --- 5. SEZIONE ROADMAP (Visione Futura) --- */}
      <section id="roadmap" className="w-full py-32 bg-background! border-border/50! scroll-mb-12 relative overflow-hidden">
        <div className="max-w-350 mx-auto px-6">
            <div className="flex flex-col items-center text-center space-y-6 mb-20">
                <div className="h-14 w-14 bg-primary/10! flex items-center justify-center rounded-2xl">
                    <Rocket className="h-7 w-7 text-primary!" />
                </div>
                <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">Visione 2026</h2>
                <p className="text-xl text-muted-foreground! max-w-auto">Non ci fermiamo al monitoraggio. Stiamo costruendo l'intelligenza che guiderà il tuo risparmio.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <RoadmapCard 
                    icon={<BrainCircuit className="h-6 w-6" />}
                    title="AI Forecasting"
                    status="In Sviluppo"
                    desc="Modelli predittivi proprietari basati su dati meteo API per ottimizzare i cicli di carica/scarica delle batterie."
                />
                <RoadmapCard 
                    icon={<Target className="h-6 w-6" />}
                    title="Smart Grid Integration"
                    status="~Q4 2026"
                    desc="Integrazione diretta con i mercati elettrici per vendere l'energia prodotta nei momenti di picco prezzo."
                />
                <RoadmapCard 
                    icon={<LayoutDashboard className="h-6 w-6" />}
                    title="App Mobile Nativa"
                    status="PIANO 2027"
                    desc="Esperienza mobile ottimizzata con notifiche push real-time e widget per il controllo rapido."
                />
            </div>
        </div>
      </section>

      {/* --- 6. CHI SIAMO --- */}
      <section id="about" className="w-full py-32 bg-background! scroll-mt-8">
        <div className="max-w-350 mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
                <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">Perché Rinova?</h2>
                <p className="text-xl text-muted-foreground! leading-relaxed">
                    Siamo nati dalla necessità di rendere le Comunità Energetiche accessibili a tutti. Crediamo che la tecnologia debba essere invisibile: un ponte fluido tra la produzione rinnovabile e il consumo intelligente.
                </p>
                <div className="flex gap-10">
                    <div>
                        <div className="text-4xl font-bold text-primary!">100%</div>
                        <p className="text-sm text-muted-foreground!">Digital Cloud</p>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-primary!">99.9%</div>
                        <p className="text-sm text-muted-foreground!">Uptime Garantito</p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="h-48 bg-primary/10! rounded-3xl border! border-primary/20! flex items-center justify-center">
                    <span className="text-xs text-foreground/80! uppercase tracking-widest">Passione</span>
                </div>
                <div className="h-48 bg-primary/20! rounded-3xl border! border-primary/30! flex items-center justify-center translate-y-8">
                    <span className="text-xs text-primary! uppercase tracking-widest font-bold">Innovazione</span>
                </div>
                <div className="h-48 bg-primary/10! rounded-3xl border! border-primary/20! flex items-center justify-center -translate-y-4">
                    <span className="text-xs text-foreground/80! uppercase tracking-widest">Sostenibilità</span>
                </div>
                <div className="h-48 bg-primary/10! rounded-3xl border! border-primary/20! flex items-center justify-center translate-y-4">
                    <span className="text-xs text-foreground/80! uppercase tracking-widest">Comunità</span>
                </div>
            </div>
        </div>
      </section>

      {/* --- 7. PRICING --- */}
      <section id="billing" className="w-full px-6 py-32 bg-background! border-border/50!">
        <div className="text-center mb-20 max-w-350 mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground!">Scegli la tua potenza.</h2>
            <p className="text-xl text-muted-foreground!">Soluzioni scalabili per ogni necessità energetica.</p>
        </div>
        
        <div className="max-w-250 mx-auto grid md:grid-cols-2 gap-10">
            <div className="bg-muted/20! border! border-border/50! p-10 rounded-4xl flex flex-col shadow-sm">
                <h4 className="text-2xl font-bold text-foreground! mb-2">Basic</h4>
                <p className="text-muted-foreground! text-sm mb-6">Perfetto per monitorare il tuo autoconsumo.</p>
                <div className="text-5xl font-extrabold mb-8 text-foreground!">Gratis <span className="text-lg font-normal text-muted-foreground!">/Sempre</span></div>
                <ul className="space-y-4 mb-10 flex-1">
                    <li className="flex items-center gap-3 text-foreground!"><Check className="h-5 w-5 text-muted-foreground!" /> Monitoraggio Live (24h)</li> 
                    <li className="flex items-center gap-3 text-foreground!"><Check className="h-5 w-5 text-muted-foreground!" /> Dashboard statistiche base</li>
                    <li className="flex items-center gap-3 text-foreground!"><Check className="h-5 w-5 text-muted-foreground!" /> Accesso bacheca CER</li>
                </ul>
                <Button variant="outline" className="h-12 w-full! rounded-full! border-border! text-foreground! font-semibold hover:bg-muted!">Crea Account</Button>
            </div>

            <div className="relative group">
                {/* Glow Esterno dedicato al piano Pro */}
                <div className="absolute inset-0 bg-primary/50! dark:bg-primary/25! blur-[60px] rounded-full z-0 transition-opacity duration-500 opacity-100 pointer-events-none"></div>
                
                <div className="relative z-10 bg-background! border-2! border-primary! p-10 rounded-4xl flex flex-col shadow-2xl">
                    <div className="absolute top-6 right-6">
                        <Sparkles className="h-8 w-8 text-primary!" />
                    </div>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary! text-background! text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
                        Consigliato
                    </div>
                    <h4 className="text-2xl font-bold text-primary! mb-2">Rinova Pro </h4>
                    <p className="text-muted-foreground! text-sm mb-6">Per professionisti e gestori CER.</p>
                    <div className="text-5xl font-extrabold mb-8 text-foreground!">€5 <span className="text-lg font-normal text-muted-foreground!">/mese</span></div>
                    <ul className="space-y-4 mb-10 flex-1">
                        <li className="flex items-center gap-3 text-foreground! font-medium"><Check className="h-5 w-5 text-primary!" /> Analisi storica avanzata</li>
                        <li className="flex items-center gap-3 text-foreground! font-medium"><Check className="h-5 w-5 text-primary!" /> Reportistica PDF Illimitata</li>
                        <li className="flex items-center gap-3 text-foreground! font-medium"><Check className="h-5 w-5 text-primary!" /> Chat e Messaggistica membri CER</li>
                        <li className="flex items-center gap-3 text-foreground! font-medium"><Check className="h-5 w-5 text-primary!" /> Ottimizzazione con Rinova AI</li>
                    </ul>
                    <Button className="h-12 w-full! rounded-full! bg-primary! text-background! font-bold hover:scale-105 transition-transform">Sblocca Rinova Pro</Button>
                </div>
            </div>
        </div>
      </section>

      {/* --- 8. CONTATTI --- */}
      <section id="contact" className="w-full py-32 bg-background! scroll-mt-8">
        <div className="max-w-350 mx-auto px-6">
            <div className="bg-muted/30! border! border-border/50! rounded-[3rem] p-8 md:p-16 grid lg:grid-cols-2 gap-16 shadow-inner">
                <div className="space-y-8">
                    <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">Pronto alla rivoluzione?</h2>
                    <p className="text-xl text-muted-foreground!">Contattaci per una presentazione personalizzata o per richiedere credenziali di test aziendali.</p>
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-4 text-foreground! font-medium">
                            <div className="h-10 w-10 bg-primary/10! rounded-full flex items-center justify-center"><Mail className="h-5 w-5 text-primary!"/></div>
                            support_rinovaenergy@gmail.com
                        </div>
                    </div>
                </div>
                
                {/* FORM IMPLEMENTATO */}
                <form onSubmit={handleContactSubmit(onContactSubmit)} className="space-y-4 relative">
                    
                    {/* Messaggio di successo in overlay */}
                    {contactSuccess && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-muted/80! backdrop-blur-sm rounded-3xl! animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                            <h3 className="text-2xl font-bold text-foreground!">Messaggio Inviato!</h3>
                            <p className="text-muted-foreground! text-center mt-2 px-6">Ti risponderemo il prima possibile sulla tua email.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Input 
                                {...registerContact("name")} 
                                placeholder="Nome" 
                                className={`h-14 rounded-2xl! bg-background! ${contactErrors.name ? "border-destructive! focus-visible:ring-destructive!" : "border-border/50! focus-visible:ring-primary!"}`} 
                            />
                            {contactErrors.name && <p className="text-xs text-destructive font-medium pl-2">{contactErrors.name.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <Input 
                                {...registerContact("company")} 
                                placeholder="Azienda (Opzionale)" 
                                className="h-14 rounded-2xl! border-border/50! bg-background! focus-visible:ring-primary!" 
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Input 
                            {...registerContact("email")} 
                            placeholder="Email" 
                            className={`h-14 rounded-2xl! bg-background! ${contactErrors.email ? "border-destructive! focus-visible:ring-destructive!" : "border-border/50! focus-visible:ring-primary!"}`} 
                        />
                        {contactErrors.email && <p className="text-xs text-destructive font-medium pl-2">{contactErrors.email.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <Textarea 
                            {...registerContact("message")} 
                            placeholder="Come possiamo aiutarti?" 
                            className={`min-h-37.5 rounded-3xl! bg-background! resize-none ${contactErrors.message ? "border-destructive! focus-visible:ring-destructive!" : "border-border/50! focus-visible:ring-primary!"}`} 
                        />
                        {contactErrors.message && <p className="text-xs text-destructive font-medium pl-2">{contactErrors.message.message}</p>}
                    </div>

                    {contactError && <p className="text-sm text-destructive font-bold text-center">{contactError}</p>}

                    <Button 
                        type="submit" 
                        disabled={contactMutation.isPending || contactSuccess}
                        className="w-full h-14 rounded-full! bg-primary! text-primary-foreground! font-bold text-lg hover:bg-primary/90! shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all duration-300"
                    >
                        {contactMutation.isPending ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Invio in corso...</>
                        ) : (
                            <>Invia Messaggio <Send className="ml-2 h-5 w-5" /></>
                        )}
                    </Button>
                </form>
            </div>
        </div>
      </section>

      {/* --- 9. FOOTER --- */}
      <footer className="w-full border-t! border-border! bg-background! py-6">
        <div className="max-w-350 mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
                <RinovaLogo className="h-10 w-10 text-primary!" />
                <span className="text-2xl font-bold tracking-tight text-foreground!">Rinova <span className="text-primary!">Energy</span></span>
            </div>
            <p className="text-muted-foreground! text-sm text-center">
                © 2026 Rinova Energy
            </p>
            <div className="flex items-center gap-8 text-sm font-bold text-muted-foreground!">
                <PrivacyPolicyModal><span className="hover:text-foreground! transition-colors">Privacy Policy</span></PrivacyPolicyModal>
                <TermsOfServiceModal><span className="hover:text-foreground! transition-colors">Termini di Servizio</span></TermsOfServiceModal>
            </div>
        </div>
      </footer>
    </div>
  );
}

function RoadmapCard({ icon, title, status, desc }: { icon: any, title: string, status: string, desc: string }) {
    return (
        <div className="bg-muted/20! border! border-border/50! p-8 rounded-4xl space-y-4 hover:border-primary/50! transition-colors group">
            <div className="h-12 w-12 bg-primary/10! rounded-xl flex items-center justify-center text-primary! group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <div className="text-xs font-bold text-primary! uppercase tracking-widest mb-1">{status}</div>
                <h4 className="text-xl font-bold">{title}</h4>
            </div>
            <p className="text-muted-foreground! text-sm leading-relaxed">{desc}</p>
        </div>
    );
}