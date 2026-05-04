import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { supabase } from "@/services/supabase_client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ArrowRight, RotateCw, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { RinovaLogo } from "@/components/rinova-logo";

interface OTPFormContentProps {
  otp: string;
  setOtp: (val: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleResend: () => void;
  isSubmitting: boolean;
  canResend: boolean;
  timer: number;
  email: string;
}

function OTPFormContent({ 
  otp, setOtp, handleSubmit, handleResend, isSubmitting, canResend, timer 
}: OTPFormContentProps) {
  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* OTP Input Section */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <InputOTP maxLength={6}
          value={otp} 
          onChange={(value) => setOtp(value)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <p className="text-xs text-muted-foreground text-center">
          Inserisci il codice a 6 cifre che ti abbiamo inviato.
        </p>
      </div>

      <Button type="submit" className="w-full h-11 bg-primary! hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
        disabled={isSubmitting || otp.length < 6}
      >
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? "Verifica in corso..." : "Verifica Codice"}
        {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Non hai ricevuto il codice?{" "}
          <button 
            type="button" 
            onClick={handleResend}
            disabled={!canResend}
            className={cn(
              "bg-transparent! text-primary! font-medium hover:underline inline-flex items-center transition-colors",
              canResend
              ? "text-primary! hover:underline cursor-pointer" 
              : "text-muted-foreground/50! cursor-not-allowed"  
            )}
          >
            {canResend ? (
              <>Invia di nuovo <RotateCw className="ml-1.5 h-3 w-3" /></>
            ) : (
              <>Invia di nuovo tra {timer}s</>
            )}
          </button>
        </p>
      </div>
    </form>
  );
}

export function OTPForm({ className, ...props }: React.ComponentProps<"div">) {
  //hooks
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  //functions
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, _setEmail] = useState<string>(location.state?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(()=> {
    const intervalId = setInterval(()=> {
      setTimer((prev)=> {
        if(prev <= 1) {
          clearInterval(intervalId);
          setCanResend(true);
          return 0;
        }
        return prev-1;
      });
    }, 1000);
    return ()=> clearInterval(intervalId);
  }, [timer === 60]);

  const handleResend = async ()=> {
    if(!canResend) return;

    setCanResend(false);
    setTimer(60);
    setOtp("");

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if(error) throw error;
      toast.success("Nuovo codice inviato");
    } catch (err: Error){
      console.error(err);
      toast.error("Errore, nell'invio del codice. Riprovare più tardi.");
      setCanResend(true); //se fallisce riattivo il bottone
    }
    
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error("Il codice deve essere di 6 cifre");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'signup' // O 'email'/'recovery' in base a come arrivi qui
      });

      if (error) throw error;

      toast.success("Account verificato con successo!");
      navigate("/home"); 

    } catch (err: Error) {
      console.error(err);
      toast.error(err.message || "Codice non valido o scaduto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formProps = {
    otp, setOtp, handleSubmit, handleResend, isSubmitting, canResend, timer, email
  };

  // --- 1. VERSIONE MOBILE ---
  if (isMobile) {
    return (
      <div className={cn("min-h-screen w-full bg-background flex flex-col p-6 font-sans text-foreground", className)} {...props}>
        
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-8">
          <a href="/login" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="w-6 h-6 text-foreground" />
          </a>
          <div className="flex items-center gap-2">
              <RinovaLogo className="w-6 h-6 text-black" />
              <span className="font-bold text-primary">Rinova</span>
          </div>
          <div className="w-8" />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="mb-8 text-center sm:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 text-primary">
                  <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Verifica Account</h1>
              <p className="text-muted-foreground">
                  Per la tua sicurezza, inserisci il codice di verifica inviato alla tua email.
              </p>
          </div>
          <OTPFormContent {...formProps} />
        </div>
      </div>
    );
  }

  // --- 2. VERSIONE DESKTOP ---
  return (
    <div className={cn("flex flex-col min-h-screen w-full items-center justify-center bg-muted/30 p-4", className)} {...props}>
      <Card className="w-full max-w-sm shadow-2xl border-0 ring-1 ring-border/50">
        
        {/* LOGO INTERNO ALLA CARD (Top Left) */}
        <div className="p-5 pb-0 flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-sm">
            <RinovaLogo className="text-black w-8 h-8" />
          </div>
          <span className="text-2xl font-bold text-primary tracking-tight">Rinova</span>
        </div>

        {/* HEADER COMPATTO */}
        <CardHeader className="text-center space-y-1 pb-2 pt-2">
          <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-xl">Verifica in 2 Passaggi</CardTitle>
          <CardDescription className="text-sm">
            Abbiamo inviato un codice alla tua email.
          </CardDescription>
        </CardHeader>
        
        {/* CONTENT COMPATTO */}
        <CardContent className="pb-6">
          <OTPFormContent {...formProps} />
        </CardContent>

        {/* FOOTER COMPATTO */}
        <CardFooter className="justify-center border-t bg-muted/10 py-3">
          <a href="/login" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Torna al Login
          </a>
        </CardFooter>
      </Card>
      
      {/* Footer credits */}
      <div className="mt-8 text-xs text-muted-foreground">
        &copy; 2024 Rinova Energy. Tutti i diritti riservati.
      </div>
    </div>
  );
}

