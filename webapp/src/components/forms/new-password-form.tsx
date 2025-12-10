import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import { Label } from "@radix-ui/react-label"
import { EyeOff, Eye, CheckCircle2, ArrowRight, ArrowLeft, Leaf, KeyRound, Lock } from "lucide-react"

export function NewPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  const isMobile = useIsMobile();
  
  // --- STATI ---
  // Stati per la visibilità (UI)
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Stati per la logica (Dati e Errori)
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // Stato unico per i dati del form (LOGICA AGGIUNTA)
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  // --- HANDLERS (LOGICA AGGIUNTA) ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    // Mappatura degli ID degli input alle chiavi dello stato
    // Nota: Ho cambiato gli id negli input sotto per farli coincidere (password -> newPassword)
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    if (error) setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Le password non coincidono");
      return;
    }
    if (formData.newPassword.length < 8) {
      setError("La password deve essere di almeno 8 caratteri");
      return;
    }

    setError("");
    console.log("Password Reset Data:", formData); // Dati pronti per il backend
    setIsSuccess(true);
  };

  // --- CONTENUTO DEL FORM (Render Function) ---
  // Trasformato in funzione per leggere lo stato aggiornato
  const renderFormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* CAMPO 1: NUOVA PASSWORD */}
      <div className="space-y-1.5">
          <div className="flex items-center justify-between">
              <Label htmlFor="newPassword">Nuova Password</Label>
          </div>
          <div className="relative">
              {/* LUCCHETTO */}
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          
              <Input
                  id="newPassword" // ID aggiornato per coincidere con formData
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword} // Collegamento dati
                  onChange={handleChange}      // Collegamento handler
                  className="pl-10 pr-10 h-10 bg-card!"
                  placeholder="••••••••"
                  required
              />
                          
              {/* PULSANTE OCCHIO (Tuo stile originale mantenuto) */}
              <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  // Stile originale preservato esattamente come richiesto
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-card! focus:outline-none flex items-center justify-center"
              >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
          </div>
      </div>

      {/* CAMPO 2: CONFERMA PASSWORD */}
      <div className="space-y-1.5">
          <div className="flex items-center justify-between">
              <Label htmlFor="confirmPassword">Conferma Password</Label>
          </div>
          <div className="relative">
              {/* LUCCHETTO */}
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          
              <Input
                  id="confirmPassword" // ID aggiornato per coincidere con formData
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword} // Collegamento dati
                  onChange={handleChange}          // Collegamento handler
                  className="pl-10 pr-10 h-10 bg-card!"
                  placeholder="••••••••"
                  required
              />
                          
              {/* PULSANTE OCCHIO (Tuo stile originale mantenuto) */}
              <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  // Stile originale preservato esattamente come richiesto
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-card! focus:outline-none flex items-center justify-center"
              >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
          </div>
      </div>

      {error && (
        <p className="text-xs text-destructive font-medium text-center animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full h-10 bg-primary! hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm mt-2">
        Imposta Password
      </Button>
    </form>
  );

  // --- VISTA SUCCESSO (Invariata) ---
  const SuccessView = () => (
    <div className="text-center space-y-4 py-4 animate-in zoom-in-95 duration-300">
      <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h3 className="text-xl font-bold">Password Aggiornata!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          La tua password è stata modificata con successo.
        </p>
      </div>
      <Button 
        className="w-full bg-primary! text-primary-foreground!" 
        onClick={() => window.location.href = '/login'}
      >
        Vai al Login <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  // --- 1. VERSIONE MOBILE (Invariata nella struttura) ---
  if (isMobile) {
    return (
      <div className={cn("min-h-screen w-full bg-background flex flex-col p-6 font-sans text-foreground", className)} {...props}>
        
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-8">
            <a href="/login" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                <ArrowLeft className="w-6 h-6 text-foreground" />
            </a>
            <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" />
                <span className="font-bold text-primary">Rinova</span>
            </div>
            <div className="w-8" />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            {isSuccess ? (
              <SuccessView />
            ) : (
              <>
                <div className="mb-8 text-center sm:text-left">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 text-primary">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Nuova Password</h1>
                    <p className="text-muted-foreground">
                        Scegli una password sicura per proteggere il tuo account.
                    </p>
                </div>
                {/* Qui richiamiamo la funzione renderFormContent */}
                {renderFormContent()}
              </>
            )}
        </div>
      </div>
    );
  }

  // --- 2. VERSIONE DESKTOP COMPATTA (Invariata nella struttura) ---
  return (
    <div className={cn("flex flex-col min-h-screen w-full items-center justify-center bg-muted/30 p-4", className)} {...props}>
      
      <Card className="w-full max-w-sm shadow-2xl border-0 ring-1 ring-border/50 bg-card">
        
        {/* LOGO INTERNO ALLA CARD */}
        <div className="p-5 pb-0 flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-sm">
            <Leaf className="text-primary-foreground w-4 h-4" />
          </div>
          <span className="text-lg font-bold text-primary tracking-tight">Rinova</span>
        </div>

        {isSuccess ? (
          <div className="p-8">
            <SuccessView />
          </div>
        ) : (
          <>
            {/* HEADER COMPATTO */}
            <CardHeader className="text-center space-y-1 pb-2 pt-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                  <KeyRound className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-xl">Nuova Password</CardTitle>
                <CardDescription className="text-sm">
                    Inserisci le nuove credenziali.
                </CardDescription>
            </CardHeader>
            
            {/* CONTENT COMPATTO */}
            <CardContent className="pb-6">
                {/* Qui richiamiamo la funzione renderFormContent */}
                {renderFormContent()}
            </CardContent>

            {/* FOOTER COMPATTO */}
            <CardFooter className="justify-center border-t bg-muted/10 py-3">
                <a href="/login" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Annulla e torna al Login
                </a>
            </CardFooter>
          </>
        )}
      </Card>
      
      {/* Footer credits */}
      <div className="mt-8 text-xs text-muted-foreground">
        &copy; 2024 Rinova Energy. Tutti i diritti riservati.
      </div>
    </div>
  );
}