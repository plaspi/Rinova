import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Eye, EyeOff, ArrowRight, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/services/supabase_client";
import { cn } from "@/lib/utils";

// --- VALIDAZIONE & MESSAGGI UMANI ---
const phoneRegex = /^\d{8,15}$/; 
const fiscalCodeRegex = /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/i;
const zipCodeRegex = /^\d{5}$/;

const registrationSchema = z.object({
  email: z.email("Inserisci un'email valida"),
  password: z.string()
    .min(8, "Inserire almeno 8 caratteri")
    .regex(/[A-Z]/, "Inserire almeno una maiuscola")
    .regex(/[a-z]/, "Inserire almeno una minuscola")
    .regex(/[0-9]/, "Inserire almeno un numero")
    .regex(/[^a-zA-Z0-9]/, "Inserire almeno un carattere speciale"), // Catch-all per simboli,
  name: z.string().min(2, "Inserisci un nome valido"),
  surname: z.string().min(2, "Inserisci un cognome valido"),
  fiscalCode: z.string().regex(fiscalCodeRegex, "Codice Fiscale non valido").toUpperCase(),
  phoneNumber: z.string().regex(phoneRegex, "Numero non valido"),
  street_name: z.string().min(2, "Inserisci la via"),
  street_number: z.string().min(1, "Civico mancante"),
  zip_code: z.string().regex(zipCodeRegex, "CAP di 5 cifre"),
  city: z.string().min(1, "Seleziona la città"),
  province: z.string().length(2, "2 lettere").toUpperCase(),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

type CityOption = {
  nome: string;
  provincia: string;
};

export function RegistrationForm({ className, ...props }: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Stati per la gestione CAP
  const [isFetchingCap, setIsFetchingCap] = useState(false);
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [showCitySelect, setShowCitySelect] = useState(false);
  
  const selectTriggerRef = useRef<HTMLButtonElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    mode: "onSubmit", // validation after submit
    reValidateMode: "onChange" // error stays until correction
  });

  const zipCodeValue = watch("zip_code");
  const selectedCity = watch("city");
  const selectedProvince = watch("province");

  // --- LOGICA CAP ---
  useEffect(() => {
    if (zipCodeValue && zipCodeValue.length === 5) {
      const fetchCities = async () => {
        setIsFetchingCap(true);
        setCityOptions([]);
        setShowCitySelect(false);
        
        try {
          const { data, error } = await supabase
            .from('comuni')
            .select('nome, provincia')
            .eq('cap', zipCodeValue);

          if (error) throw error;

          if (data && data.length > 0) {
            if (data.length === 1) {
              const city = data[0];
              setValue("city", city.nome, { shouldValidate: true });
              setValue("province", city.provincia, { shouldValidate: true });
              setShowCitySelect(false);
            } else {
              setCityOptions(data);
              setShowCitySelect(true);
              setTimeout(() => { selectTriggerRef.current?.click(); }, 100);
            }
          } else {
             setValue("city", "", { shouldValidate: true });
             setValue("province", "", { shouldValidate: true });
             toast.error("Nessuna città trovata per questo CAP.");
          }
        } catch (error) {
          console.error("Err CAP:", error);
        } finally {
          setIsFetchingCap(false);
        }
      };
      fetchCities();
    } else {
      if (selectedCity || showCitySelect) {
          setValue("city", "", { shouldValidate: true });
          setValue("province", "", { shouldValidate: true });
          setShowCitySelect(false);
          setCityOptions([]);
      }
    }
  }, [zipCodeValue, setValue]); 

  const handleCitySelect = (cityName: string) => {
    const cityData = cityOptions.find(c => c.nome === cityName);
    if (cityData) {
      setValue("city", cityData.nome, { shouldValidate: true });
      setValue("province", cityData.provincia, { shouldValidate: true });
      setShowCitySelect(false);
    }
  };

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
            street_name: data.street_name,
            street_number: data.street_number,
            zip_code: data.zip_code,
            city: data.city,
            province: data.province,
          },
        },
      });
      if (error) throw error;
      toast.success("Registrazione completata! Conferma la mail.");
    } catch (err: Error) {
      console.error(err);
      toast.error(err.message || "Errore durante la registrazione.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("w-full shadow-none border-0 bg-transparent", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-3 p-0">
          
          {/* 1. EMAIL & PASSWORD */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" placeholder="mail@example.com" className="h-9 bg-card focurs:border-primary! " {...register("email")} />
              {errors.email && <p className="text-[10px] text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs ">Password</Label>
              <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="h-9 pr-9"
                    placeholder="password"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground bg-card! hover:border-primary! hover:text-foreground bg-brand-card! flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
              </div>
              {errors.password && <p className="text-[10px] text-destructive">{errors.password.message}</p>}
            </div>
          </div>

          {/* 2. NOME & COGNOME */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs">Nome</Label>
              <Input id="name" placeholder="Mario" className="h-9 bg-card! focus:border-primary! " {...register("name")} />
              {errors.name && <p className="text-[10px] text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="surname" className="text-xs">Cognome</Label>
              <Input id="surname" placeholder="Rossi" className="h-9 bg-card! focus:border-primary!" {...register("surname")} />
              {errors.surname && <p className="text-[10px] text-destructive">{errors.surname.message}</p>}
            </div>
          </div>

          {/* 3. CF & TELEFONO */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="fiscalCode" className="text-xs">Codice Fiscale</Label>
              <Input id="fiscalCode" placeholder="RSSMRA..." className="h-9 uppercase font-mono bg-card! focus:border-primary!" maxLength={16} {...register("fiscalCode")} />
              {errors.fiscalCode && <p className="text-[10px] text-destructive">{errors.fiscalCode.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="phoneNumber" className="text-xs">Telefono</Label>
              {/* Box Telefono Custom */}
              <div className="flex items-center h-9 w-full rounded-md border border-input bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-ring focus-within:border-primary">
                <div className="flex items-center justify-center h-full px-3 bg-muted/30 border-r border-input rounded-l-md text-xs font-medium text-muted-foreground select-none">
                  +39
                </div>
                <Input 
                  id="phoneNumber" 
                  type="tel"
                  className="flex-1 px-3 py-1 text-sm  w-full h-full rounded-r-md bg-card! "
                  placeholder="3331234567"
                  {...register("phoneNumber")} 
                />
              </div>
              {errors.phoneNumber && <p className="text-[10px] text-destructive">{errors.phoneNumber.message}</p>}
            </div>
          </div>

          {/* 4. INDIRIZZO & GEOGRAFIA */}
          <div className="space-y-1 pt-1">
            <div className="grid grid-cols-[2fr_0.7fr_1fr] gap-3 items-start relative">
              
              {/* VIA */}
              <div className="space-y-1">
                <Label htmlFor="street_name" className="text-xs">Via / Piazza</Label>
                <Input id="street_name" placeholder="Via Roma" className="h-9 bg-card! focus:border-primary!" {...register("street_name")} />
                {errors.street_name && <p className="text-[10px] text-destructive absolute">{errors.street_name.message}</p>}
              </div>

              {/* NUMERO */}
              <div className="space-y-1">
                <Label htmlFor="street_number" className="text-xs">N°</Label>
                <Input id="street_number" placeholder="10" className="h-9 bg-card! focus:border-primary!" {...register("street_number")} />
                {errors.street_number && <p className="text-[10px] text-destructive absolute">{errors.street_number.message}</p>}
              </div>
              
              {/* CAP & CITTÀ */}
              <div className="space-y-1 relative">
                 <Label htmlFor="zip_code" className="text-xs">CAP</Label>
                 <div className="relative">
                    <Input 
                      id="zip_code" 
                      placeholder="00100" 
                      maxLength={5} 
                      className="h-9 bg-card! focus:border-primary!" 
                      {...register("zip_code")} 
                    />
                    {isFetchingCap && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                         <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      </div>
                    )}
                 </div>
                 
                 {/* ERRORE CAP */}
                 {errors.zip_code && (
                    <p className="text-[10px] text-destructive absolute top-full left-0 mt-0.5">
                        {errors.zip_code.message}
                    </p>
                 )}
                 
                 {/* SELECT */}
                 {showCitySelect && (
                   <div className="absolute bottom-full right-0 w-auto min-w-full mb-0 z-50"> 
                      <Select onValueChange={handleCitySelect}>
                        <SelectTrigger ref={selectTriggerRef} className="h-0 w-0 p-0 m-0 border-0 opacity-0 overflow-hidden absolute"><SelectValue placeholder="" /></SelectTrigger>
                        <SelectContent className="max-h-50" align="end" side="top" sideOffset={0}>
                          {cityOptions.map((city) => (
                            <SelectItem key={`${city.nome}-${city.provincia}`} value={city.nome}>
                              {city.nome} ({city.provincia})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                   </div>
                 )}
              </div>
            </div>

            {/* AREA FEEDBACK */}
            <div className="h-5 mt-4 flex items-center justify-start relative">
              {(!showCitySelect && selectedCity) ? (
                  // success
                  <div className="flex items-center gap-1.5 text-[11px] text-green-600 font-medium animate-in fade-in slide-in-from-top-1">
                    <MapPin className="h-3.5 w-3.5 fill-current/20" /> 
                    {selectedCity} ({selectedProvince})
                  </div>
              ) : (
                  // error city
                  (errors.city && !errors.zip_code) && (
                    <p className="text-[10px] text-destructive animate-in fade-in">
                        {errors.city.message}
                    </p>
                  )
              )}
            </div>
            
            <input type="hidden" {...register("city")} />
            <input type="hidden" {...register("province")} />
          </div>

        </CardContent>
        
        <CardFooter className="flex flex-col gap-3 p-0 pt-3">
          <Button 
            type="submit" 
            className="w-full h-10 text-sm font-semibold bg-brand-gradient! text-background hover:bg-primary/90 transition-all shadow-md" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrati <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="text-center text-xs text-muted-foreground">
             Hai già un account? <a href="/login" className="font-semibold text-primary hover:underline">Accedi</a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}