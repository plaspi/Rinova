import React, { useState } from "react";
import { 
  Leaf, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  CheckCircle2,
  BarChart3,
  ShieldCheck
} from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { useIsMobile } from "@/hooks/use-mobile"; 

// Helper per le classi
const cn = (...classes: (string | undefined | null | boolean)[]) => classes.filter(Boolean).join(" ");

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const isMobile = useIsMobile();

  // --- 1. LOGICA AGGIUNTA: Stato per salvare i dati ---
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // --- 2. LOGICA AGGIUNTA: Funzione per aggiornare lo stato quando scrivi ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // --- 3. LOGICA AGGIUNTA: Funzione invio form ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Blocca il refresh della pagina
    console.log("Dati Login:", formData); // Qui hai i dati pronti per il backend
  };

  // --- 1. VERSIONE MOBILE (Return anticipato) ---
  // Nessuna modifica grafica, solo collegamento dati
  if (isMobile) {
    return (
      <div className={cn("min-h-screen w-full bg-background flex flex-col justify-center p-6 font-sans text-foreground", className)} {...props}>
        
        {/* Header Mobile */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg shadow-sm">
               <Leaf className="text-primary-foreground w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-primary tracking-tight">Rinova</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Accedi</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Inserisci le tue credenziali per gestire la tua energia.
            </p>
          </div>
        </div>

        {/* Form Mobile - Collegato handleSubmit */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                // Collegamento dati
                value={formData.email}
                onChange={handleChange}
                placeholder="mario.rossi@example.com"
                className="pl-10 h-12" // Stile mantenuto
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="/forgotpw" className="text-sm font-medium text-primary hover:underline">
                Password dimenticata?
              </a>
            </div>
              <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      // Collegamento dati
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10 h-10" // Stile mantenuto
                      placeholder="••••••••"
                      required
                    />
                    
                    {/* PULSANTE OCCHIO */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none flex items-center justify-center"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
          </div>

          <Button type="submit" className="w-full h-12 text-sm font-semibold bg-primary! text-card!">
            Accedi <ArrowRight className="ml-2 h-4 w-4 text-card!" />
          </Button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><Separator /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-medium">o continua con</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" type="button" className="h-12 bg-primary! border-border hover:bg-muted/50">
              Apple
            </Button>
            <Button variant="outline" type="button" className="h-12 bg-primary! border-border hover:bg-muted/50">
              Google
            </Button>
          </div>

          <div className="text-center text-sm mt-6">
            Non hai un account?{" "}
            <a href="/registration" className="font-semibold text-primary hover:underline">
              Registrati ora
            </a>
          </div>
        </form>

        <div className="mt-auto pt-8 text-center px-4">
           <p className="text-xs text-muted-foreground">
              Cliccando Accedi, accetti i nostri <a href="#" className="underline hover:text-primary">Termini</a> e <a href="#" className="underline hover:text-primary">Privacy</a>.
           </p>
        </div>
      </div>
    );
  
  }

  // --- 2. VERSIONE DESKTOP (Default Return) ---
  // Nessuna modifica grafica, solo collegamento dati
  return (
    <div 
      className={cn(
        "h-screen w-full overflow-hidden bg-muted/30 flex flex-col items-center justify-center p-4 font-sans text-foreground", 
        className
      )} 
      {...props}
    >
      {/* WRAPPER CENTRATO */}
      <div className="flex flex-col items-center w-full max-w-4xl h-full max-h-[95vh]">
        
        {/* CARD PRINCIPALE */}
        <Card className="w-full flex-1 overflow-hidden grid md:grid-cols-2 animate-in fade-in zoom-in-95 duration-500 border-0 shadow-2xl ring-1 ring-border/50 bg-card">
          
          {/* COLONNA SINISTRA (Form) */}
          <div className="p-3 md:p-6 flex flex-col justify-center h-full overflow-y-auto relative"> 
            
            {/* Header Compatto */}
            <div className="flex items-center h-auto gap-2 shrink-0">
              <div className="bg-primary p-1.5 rounded-lg shadow-sm">
                 <Leaf className="text-primary-foreground w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-primary tracking-tight">Rinova</span>
            </div>

            <div className="flex flex-col gap-1 mb-2 shrink-0">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Accedi</h1>
              <p className="text-sm text-muted-foreground">
                Inserisci le tue credenziali per gestire la tua energia.
              </p>
            </div>

            {/* Form compattato - Collegato handleSubmit */}
            <form className="space-y-4 flex-1 flex-col justify-center" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    // Collegamento dati
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="mario.rossi@example.com" 
                    className="pl-10 h-10 bg-card!" // Stile mantenuto
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="/forgotpw" className="text-xs font-medium text-primary hover:underline underline-offset-2">
                    Password dimenticata?
                  </a>
                </div>
                <div className="relative">
                  {/* LUCCHETTO */}
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    // Collegamento dati
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 h-10 bg-card!" // Stile mantenuto
                    placeholder="••••••••"
                    required
                  />
                  
                  {/* PULSANTE OCCHIO */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-card! focus:outline-none flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-10 text-sm font-semibold bg-primary! text-card! mt-2">
                Accedi <ArrowRight className="ml-2 h-4 w-4 text-card!" />
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><Separator /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card text-muted-foreground font-medium">o continua con</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" type="button" className="h-9 text-xs bg-primary! text-card border-border hover:text-card! hover:bg-muted/50">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  Apple
                </Button>
                <Button variant="outline" type="button" className="h-9 text-xs bg-primary! text-card border-border hover:text-card! hover:bg-muted/50">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Google
                </Button>
              </div>

              <div className="text-center text-xs pt-2">
                Non hai un account?{" "}
                <a href="/registration" className="font-semibold text-primary hover:underline underline-offset-4">
                  Registrati ora
                </a>
              </div>
            </form>
          </div>

          {/* COLONNA DESTRA (Visual) */}
          <div className="hidden md:flex flex-col relative bg-linear-to-br from-primary to-nuanceCard text-primary-foreground p-8 items-start justify-between overflow-hidden h-full">
            {/* Pattern Sfondo */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
               <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border-[50px] border-white blur-3xl"></div>
               <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full border-[50px] border-accent blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full shrink-0">
              <div className="bg-white/10 backdrop-blur-md inline-flex p-2 rounded-xl border border-white/20 shadow-lg mb-6">
                 <BarChart3 className="w-5 h-5 text-yellow-300 fill-yellow-300/20" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4 leading-tight">
                Bentornato.<br/>
                Riprendi il controllo dei tuoi <span className="text-brand-soft">consumi</span>.
              </h2>
              
              <div className="space-y-3">
                 <div className="flex items-center gap-3">
                   <div className="bg-primary-foreground/20 p-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5 text-brand-soft" /></div>
                   <p className="font-medium text-sm text-primary-foreground/90">Visualizza i tuoi risparmi in tempo reale</p>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="bg-primary-foreground/20 p-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5 text-brand-soft" /></div>
                   <p className="font-medium text-sm text-primary-foreground/90">Gestisci i pagamenti e le scadenze</p>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="bg-primary-foreground/20 p-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5 text-brand-soft" /></div>
                   <p className="font-medium text-sm text-primary-foreground/90">Accedi ai dati della tua CER</p>
                 </div>
              </div>
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 w-full mt-auto">
              <div className="flex items-center gap-3">
                 <div className="bg-card rounded-full p-1.5"><ShieldCheck className="w-4 h-4 text-primary" /></div>
                 <div>
                    <p className="text-sm font-bold">Accesso Sicuro</p>
                    <p className="text-xs text-brand-soft/80">I tuoi dati energetici sono protetti con crittografia end-to-end.</p>
                 </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Ridotto */}
        <div className="mt-3 text-center px-4 shrink-0">
           <p className="text-[10px] text-muted-foreground max-w-sm mx-auto">
              Cliccando Accedi, accetti i nostri <a href="#" className="underline hover:text-primary">Termini</a> e <a href="#" className="underline hover:text-primary">Privacy</a>.
           </p>
        </div>
      </div>
    </div>
  );
}