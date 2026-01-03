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
import { CheckCircle2, ArrowLeft, Leaf, Mail, ArrowRight } from "lucide-react"

    export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
    const [emailSent, setEmailSent] = useState(false);
    const isMobile = useIsMobile();
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulazione invio
        setTimeout(() => setEmailSent(true), 500);
    };

    // --- STATO DI SUCCESSO (Condiviso) ---
    const SuccessView = () => (
        <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-brand-soft! p-4 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">Email inviata!</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
            Abbiamo inviato un link di ripristino a <span className="font-medium text-foreground">{email}</span>.
            </p>
        </div>
        <Button 
            className="w-full bg-primary! border border-input  text-card! hover:bg-muted" 
            onClick={() => window.location.href = '/forgotpw'}
        >
            <ArrowLeft className="mr-2 h-4 w-4" /> indietro
        </Button>
        </div>
    );

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
                    <Leaf className="w-5 h-5 text-primary" />
                    <span className="font-bold text-primary">Rinova</span>
                </div>
                <div className="w-8" /> {/* Spacer per centrare */}
            </div>

            {emailSent ? (
                <div className="flex-1 flex flex-col justify-center">
                    <SuccessView />
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Password dimenticata?</h1>
                        <p className="text-muted-foreground">
                            Non preoccuparti, succede. Inserisci la tua email e ti aiuteremo a recuperarla.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="mario.rossi@example.com"
                                    className="pl-10 h-12 text-base"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 text-base bg-primary! hover:bg-primary/90 shadow-md">
                            Invia link di recupero
                        </Button>
                    </form>

                    <div className="mt-auto pt-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            Hai ricordato la password? <a href="/login" className="text-primary font-semibold hover:underline">Accedi</a>
                        </p>
                    </div>
                </div>
            )}
        </div>
        );
    }

    // --- 2. VERSIONE DESKTOP ---
    return (
    <div className={cn("flex flex-col min-h-screen w-full items-center justify-center bg-muted/30 p-4", className)} {...props}>
      
      <Card className="w-full max-w-md shadow-2xl border-0 ring-1 ring-border/50">
        
        {/* LOGO INTERNO ALLA CARD (Top Left) */}
        <div className="p-6 pb-0 flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-sm">
            <Leaf className="text-primary-foreground w-4 h-4" />
          </div>
          <span className="text-lg font-bold text-primary tracking-tight">Rinova</span>
        </div>

        {emailSent ? (
            <div className="p-8 pt-4">
                <SuccessView />
            </div>
        ) : (
            <>
                <CardHeader className="text-center space-y-2 pb-6 pt-4">
                    <CardTitle className="text-2xl">Recupera Password</CardTitle>
                    <CardDescription className="text-base">
                        Inserisci l'indirizzo email associato al tuo account Rinova.
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="mario.rossi@example.com"
                                    className="pl-10 bg-muted/30"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-11 bg-primary! text-card! hover:bg-primary/90 font-semibold shadow-sm">
                            Invia Email <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="justify-center border-t bg-muted/10 py-4">
                    <a href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Torna al login
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