import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TermsModal } from "../modals/termsModal";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/services/supabase_client";
import { cn } from "@/lib/utils";

// --- VALIDAZIONE ---
const phoneRegex = /^\d{8,15}$/; 
const fiscalCodeRegex = /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/i;

const registrationSchema = z.object({
  name: z.string().min(2, "Nome corto"),
  surname: z.string().min(2, "Cognome corto"),
  address: z.string().min(2, "Indirizzo richiesto"), 
  fiscalCode: z.string().regex(fiscalCodeRegex, "CF errato").toUpperCase(),
  phoneNumber: z.string().regex(phoneRegex, "Num. errato"),
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "Min 8 car.").regex(/[0-9]/, "Serve numero"),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function RegistrationForm({ className, ...props }: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    setIsLoading(true);
    const fullPhoneNumber = `+39${data.phoneNumber}`;

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            surname: data.surname,
            ssn: data.fiscalCode,
            phone: fullPhoneNumber,
            address: data.address,
          },
        },
      });

      if (error) throw error;
      toast.success("Registrazione completata! Controlla la mail.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Errore registrazione.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("w-full shadow-none border-0 bg-transparent", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4 p-0">
          
          {/* RIGA 1: NOME & COGNOME */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs">Nome</Label>
              <Input id="name" placeholder="Mario" className="h-10" {...register("name")} />
              {errors.name && <p className="text-[10px] text-destructive font-medium">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="surname" className="text-xs">Cognome</Label>
              <Input id="surname" placeholder="Rossi" className="h-10" {...register("surname")} />
              {errors.surname && <p className="text-[10px] text-destructive font-medium">{errors.surname.message}</p>}
            </div>
          </div>

          {/* RIGA 2: CODICE FISCALE & TELEFONO */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="fiscalCode" className="text-xs">Codice Fiscale</Label>
              <Input 
                id="fiscalCode" 
                placeholder="RSSMRA..." 
                className="h-10 uppercase font-mono" 
                maxLength={16} 
                {...register("fiscalCode")} 
              />
              {errors.fiscalCode && <p className="text-[10px] text-destructive font-medium">{errors.fiscalCode.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phoneNumber" className="text-xs">Telefono</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none select-none">
                  +39
                </div>
                <Input 
                  id="phoneNumber" 
                  type="tel" 
                  placeholder="333 123456" 
                  className="h-10 pl-11"
                  {...register("phoneNumber")} 
                />
              </div>
              {errors.phoneNumber && <p className="text-[10px] text-destructive font-medium">{errors.phoneNumber.message}</p>}
            </div>
          </div>

          {/* RIGA 3: COMUNE */}
          <div className="space-y-1">
            <Label htmlFor="address" className="text-xs">Comune / Indirizzo</Label>
            <Input id="address" placeholder="Roma, Via..." className="h-10" {...register("address")} />
            {errors.address && <p className="text-[10px] text-destructive font-medium">{errors.address.message}</p>}
          </div>

          {/* RIGA 4: EMAIL & PASSWORD */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" placeholder="mail@example.com" className="h-10" {...register("email")} />
              {errors.email && <p className="text-[10px] text-destructive font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="h-10 pr-9"
                    {...register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
              </div>
              {errors.password && <p className="text-[10px] text-destructive font-medium">{errors.password.message}</p>}
            </div>
          </div>

        </CardContent>
        
        <CardFooter className="flex flex-col gap-4 p-0 pt-4">
          
          {/* MODIFICA QUI: PULSANTE VERDE VIBRANTE */}
          <Button 
            type="submit" 
            className="w-full h-10 text-sm font-semibold bg-primary! text-card! transition-all shadow-md mt-2" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrati <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            Hai già un account? <a href="/login" className="font-semibold text-green-600 hover:underline underline-offset-4">Accedi</a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}