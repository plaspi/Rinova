import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {Lock} from "lucide-react";
import { ArrowRight, Eye, EyeOff, FileText, Mail, MapPin, Phone, User } from "lucide-react";

export function RegistrationForm({ className, ...props }: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const isMobile = useIsMobile();

  // 1. STATO UNICO PER TUTTI I CAMPI
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    id: "",
    phonenumber: "",
    place: "",
    password: ""
  });

  // 2. FUNZIONE PER AGGIORNARE LO STATO
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // 3. FUNZIONE DI INVIO FORM
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Blocca il refresh della pagina
    console.log("Dati inviati:", formData);
    // Qui puoi fare la chiamata API: await registerUser(formData);
  };

  // --- CONTENUTO DEL FORM (Trasformato in funzione render per accedere allo stato) ---
  const renderFormContent = () => (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* RIGA 1: NOME & COGNOME */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input 
              id="name" 
              value={formData.name} 
              onChange={handleChange} 
              type="text" 
              placeholder="Mario" 
              className="pl-10 bg-card!" 
              required 
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="surname">Cognome</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input 
              id="surname" 
              value={formData.surname} 
              onChange={handleChange} 
              type="text" 
              placeholder="Rossi" 
              className="pl-10 bg-card!" 
              required 
            />
          </div>
        </div>
      </div>

      {/* RIGA 2: EMAIL & CODICE FISCALE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input 
              id="email" 
              value={formData.email} 
              onChange={handleChange} 
              type="email" 
              placeholder="mario.rossi@example.com" 
              className="pl-10 bg-card!" 
              required 
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="id">Codice Fiscale</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input 
              id="id" 
              value={formData.id} 
              onChange={handleChange} 
              type="text" 
              placeholder="RSSMRA..." 
              className="pl-10 bg-card! uppercase" 
              required 
            />
          </div>
        </div>
      </div>

      {/* RIGA 3: TELEFONO & COMUNE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phonenumber">Telefono</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input 
              id="phonenumber" 
              value={formData.phonenumber} 
              onChange={handleChange} 
              type="tel" 
              placeholder="+39 333..." 
              className="pl-10 bg-card!" 
              required 
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="place">Comune</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input 
              id="place" 
              value={formData.place} 
              onChange={handleChange} 
              type="text" 
              placeholder="Roma" 
              className="pl-10 bg-card!" 
              required 
            />
          </div>
        </div>
      </div>

      {/* PASSWORD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password" // IMPORTANTE: l'id deve coincidere con la chiave nello stato formData
              value={formData.password}
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              className="pl-10 pr-10 h-10 bg-card!"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-card! focus:outline-none flex items-center justify-center p-2"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-10 text-sm font-semibold bg-primary! text-primary-foreground! hover:bg-primary/90 transition-all shadow-md"
        >
          Registrati <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* FOOTER */}
      <div className="text-center text-xs mt-2 text-muted-foreground px-6">
        Cliccando Registrati, accetti i nostri <a href="#" className="underline hover:text-primary">Termini</a> e <a href="#" className="underline hover:text-primary">Privacy</a>.
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><Separator /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background md:bg-card px-2 text-muted-foreground font-medium">
            Hai già un account? <a href="/login" className="hover:underline underline-offset-4 text-nuance!">Accedi al tuo profilo</a>
          </span>
        </div>
      </div>
    </form>
  );

  // --- RENDER ---
  if (isMobile) {
    return (
      <div className={cn("min-h-screen w-full bg-background flex flex-col justify-center justify-items-center p-6 font-sans text-foreground", className)} {...props}>
        <div className="flex flex-col gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Registrati</h1>
            <p className="text-sm text-muted-foreground mt-1">Inserisci i tuoi dati per creare un nuovo account.</p>
          </div>
        </div>
        {renderFormContent()}
      </div>
    );
  }

  return (
    <div className={cn("w-full bg-muted/30 flex flex-col items-center justify-center font-sans text-foreground", className)} {...props}>
      <div className="mb-6 text-center">
        <h2 className="text-5xl font-bold mb-3 tracking-tight text-foreground">Registrati</h2>
        <p className="text-sm text-muted-foreground">Inizia il tuo percorso di risparmio energetico.</p>
      </div>
      {renderFormContent()}
    </div>
  );
}