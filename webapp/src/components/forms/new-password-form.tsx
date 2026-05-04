import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { EyeOff, Eye, CheckCircle2, ArrowRight, ArrowLeft, KeyRound, Loader2, Lock } from "lucide-react";
import { supabase } from "@/services/supabase_client";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RinovaLogo } from "@/components/rinova-logo";

// --- 1. SCHEMA ZOD (Validazione + Match) ---
const passwordSchema = z.object({
  newPassword: z.string()
      .min(8, "Inserire almeno 8 caratteri")
      .regex(/[A-Z]/, "Inserire almeno una maiuscola")
      .regex(/[a-z]/, "Inserire almeno una minuscola")
      .regex(/[0-9]/, "Inserire almeno un numero")
      .regex(/[^a-zA-Z0-9]/, "Inserire almeno un carattere speciale"), // Catch-all per simboli,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
});

type NewPasswordValues = z.infer<typeof passwordSchema>;

export function NewPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // UI States
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // --- 2. HOOK FORM CON ZOD ---
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewPasswordValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onSubmit", // Valida quando premi invio
  });

  // --- 3. SUBMIT (Supabase gestisce la sessione in automatico) ---
  const onSubmit = async (data: NewPasswordValues) => {
    try {
        // Supabase ha già recuperato il token dall'URL automaticamente
        const { error } = await supabase.auth.updateUser({
          password: data.newPassword,
        });

        if (error) throw error;

        setIsSuccess(true);
        toast.success("Password aggiornata con successo!");
        
        // Redirect al login dopo 1.2 secondi
        setTimeout(() => navigate("/login"), 1200);

    } catch (err: any) {
        console.error(err);
        toast.error("Errore aggiornamento: " + (err.message || "Sessione scaduta o invalida"));
    }
  };

  // --- RENDER CONTENT ---
  const renderFormContent = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
      {/* CAMPO 1: NUOVA PASSWORD */}
      <div className="space-y-1.5">
          <Label htmlFor="newPassword">Nuova Password</Label>
          <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  className="pl-10 pr-10 h-10 bg-card!"
                  placeholder="••••••••"
                  {...register("newPassword")}
              />
              <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground focus:outline-none flex items-center justify-center"
              >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
          </div>
          {/* Errore Zod */}
          {errors.newPassword && (
            <p className="text-[10px] text-destructive font-medium animate-in fade-in slide-in-from-top-1">
              {errors.newPassword.message}
            </p>
          )}
      </div>

      {/* CAMPO 2: CONFERMA PASSWORD */}
      <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Conferma Password</Label>
          <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="pl-10 pr-10 h-10 bg-card!"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
              />
              <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground focus:outline-none flex items-center justify-center"
              >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
          </div>
          {/* Errore Zod (Match) */}
          {errors.confirmPassword && (
            <p className="text-[10px] text-destructive font-medium animate-in fade-in slide-in-from-top-1">
              {errors.confirmPassword.message}
            </p>
          )}
      </div>

      <Button 
        type="submit" 
        className="w-full h-11 bg-primary! text-card! hover:bg-primary/90 mt-2 font-semibold shadow-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? "Salvataggio..." : "Imposta Password"}
      </Button>
    </form>
  );

  // --- VISTA SUCCESSO ---
  const SuccessView = () => (
    <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
        <CheckCircle2 className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h3 className="text-xl font-bold">Password Aggiornata!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          La tua password è stata modificata con successo.
        </p>
      </div>
      <Button 
        className="w-full" 
        onClick={() => navigate('/login')}
      >
        Vai al Login <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    return (
      <div className={cn("min-h-screen w-full bg-background flex flex-col p-6 font-sans text-foreground", className)} {...props}>
        <div className="flex items-center justify-between mb-8">
            <Link to="/login" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                <ArrowLeft className="w-6 h-6 text-foreground" />
            </Link>
            <div className="flex items-center gap-2">
                <RinovaLogo className="h-8 w-8 text-primary"/>
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
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 text-primary ring-1 ring-primary/20">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Nuova Password</h1>
                    <p className="text-muted-foreground">
                        Scegli una password sicura per il tuo account.
                    </p>
                </div>
                {renderFormContent()}
              </>
            )}
        </div>
      </div>
    );
  }

  // --- DESKTOP LAYOUT ---
  return (
    <div className={cn("flex flex-col min-h-screen w-full items-center justify-center bg-muted/30 p-4", className)} {...props}>
      <Card className="w-full max-w-sm shadow-2xl border-0 ring-1 ring-border/50 bg-card">
        <div className="p-5 pb-0 flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-sm">
            <RinovaLogo className="h-8 w-8 text-black"/>
          </div>
          <span className="text-2xl font-bold text-primary tracking-tight">Rinova</span>
        </div>

        {isSuccess ? (
          <div className="p-8">
            <SuccessView />
          </div>
        ) : (
          <>
            <CardHeader className="text-center space-y-1 pb-2 pt-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1 ring-1 ring-primary/20">
                  <KeyRound className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-xl">Nuova Password</CardTitle>
                <CardDescription className="text-sm">
                    Inserisci le nuove credenziali.
                </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-6">
                {renderFormContent()}
            </CardContent>

            <CardFooter className="justify-center border-t bg-muted/10 py-4">
                <Link to="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Annulla e torna al Login
                </Link>
            </CardFooter>
          </>
        )}
      </Card>
      
      <div className="mt-8 text-xs text-muted-foreground">
        &copy; 2024 Rinova Energy. Tutti i diritti riservati.
      </div>
    </div>
  );
}