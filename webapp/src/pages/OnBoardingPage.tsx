import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/authContext";
import { supabase } from "@/services/supabase_client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RinovaLogo } from "@/components/rinova-logo";
import { Loader2, AlertCircle, Sparkles, LayoutDashboard, Database, Sun } from "lucide-react";

// Schema Zod
const onboardingSchema = z.object({
  name: z.string().min(2, "Inserisci un nome valido"),
  surname: z.string().min(2, "Inserisci un cognome valido"),
  ssn: z.string().length(16, "Codice Fiscale di 16 caratteri").toUpperCase(),
  street_name: z.string().min(3, "Inserisci un indirizzo valido"),
  street_number: z.string().min(1, "Richiesto"),
  city: z.string().min(2, "Inserisci una città"),
  province: z.string().length(2, "Sigla provincia (es. MI)").toUpperCase(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function OnBoardingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    // Usiamo onChange per far sparire il rosso appena l'utente digita
    mode: "onChange", 
    defaultValues: {
      name: profile?.name || user?.user_metadata?.full_name?.split(" ")[0] || "",
      surname: profile?.surname || user?.user_metadata?.full_name?.split(" ")[1] || "",
      ssn: profile?.ssn || "",
      street_name: profile?.street_name || "",
      street_number: profile?.street_number || "",
      city: profile?.city || "",
      province: profile?.province || "",
    },
  });

  // Forza la validazione immediata al caricamento per evidenziare in rosso i campi vuoti
  useEffect(() => {
    trigger();
  }, [trigger]);

  // Protezione anti-loop
  useEffect(() => {
    if (
      profile?.name && profile?.surname && profile?.ssn && 
      profile?.city && profile?.province && 
      profile?.street_name && profile?.street_number
    ) {
      navigate("/home", { replace: true });
    }
  }, [profile, navigate]);

  const onSubmit = async (data: OnboardingFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: data.name,
          surname: data.surname,
          ssn: data.ssn,
          street_name: data.street_name,
          street_number: data.street_number,
          city: data.city,
          province: data.province,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Svuota la RAM e riparte da Home!
      window.location.replace("/home");

    } catch (err: Error) {
      console.error("Errore salvataggio:", err);
      setGlobalError(err.message || "Si è verificato un errore durante il salvataggio dei dati.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full! min-h-screen! bg-background! flex! flex-col! md:flex-row! font-sans! overflow-hidden! transition-colors duration-300">
      
      {/* --- LEFT PANEL: VISUAL/STORYTELLING --- */}
      <div className="w-full! md:w-[45%]! bg-muted/10! p-10! md:p-14! flex! flex-col! justify-between! relative! overflow-hidden! border-b! md:border-b-0! md:border-r! border-border/50!">
          
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-primary/10 to-transparent pointer-events-none -z-10"></div>
          
          <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left space-y-8 mt-4 md:mt-16">
              <RinovaLogo className="h-12 w-12 text-primary!" />
              
              <div className="space-y-6">
                  <h1 className="text-4xl! md:text-5xl! lg:text-6xl! font-bold! tracking-tighter! leading-[1.05] text-foreground!">
                      Quasi pronti<br/> <span className="text-primary!">Un ultimo passo</span>
                  </h1>
                  <p className="items-center text-base! md:text-lg! text-muted-foreground! max-w-lg! font-medium! leading-relaxed! text-justify">
                      Per garantire il corretto funzionamento della piattaforma Rinova Energy, ti invitiamo a completare il tuo profilo, inserendo i dati obbligatori mancanti evidenziati.
                  </p>
              </div>
          </div>

          <div className="relative z-10 flex flex-row items-center justify-center md:justify-start gap-8 text-foreground/80! pt-12 md:pb-6">
              <Sun className="h-8 w-8" />
              <Database className="h-8 w-8" />
              <LayoutDashboard className="h-8 w-8" />
          </div>
      </div>

      {/* --- RIGHT PANEL: FORM (FITS-IN-SCREEN) --- */}
      <div className="flex-1! bg-background! p-8! md:p-14! flex! items-center justify-center relative! overflow-y-auto">
          
          <div className="absolute top-20 right-20 w-80 h-80 bg-primary/10! rounded-full blur-[100px] pointer-events-none -z-10"></div>

          <div className="w-full max-w-115 space-y-6 relative z-10">
            
            {globalError && (
              <div className="p-4 rounded-xl bg-destructive/10 border! border-destructive/20! flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive font-medium leading-relaxed">{globalError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-foreground!">Nome</label>
                  <Input 
                    {...register("name")} 
                    className={`bg-card! h-11! rounded-lg! border! ${errors.name ? "border-destructive! focus-visible:ring-destructive! ring-1 ring-destructive/30" : "border-border/50!"}`} 
                  />
                  {errors.name && <p className="text-[11px] text-destructive font-medium pl-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-foreground!">Cognome</label>
                  <Input 
                    {...register("surname")} 
                    className={`bg-card! h-11! rounded-lg! border! ${errors.surname ? "border-destructive! focus-visible:ring-destructive! ring-1 ring-destructive/30" : "border-border/50!"}`} 
                  />
                  {errors.surname && <p className="text-[11px] text-destructive font-medium pl-1">{errors.surname.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-foreground!">Codice Fiscale</label>
                <Input 
                  {...register("ssn")} 
                  className={`bg-card! h-11! rounded-lg! border! uppercase! ${errors.ssn ? "border-destructive! focus-visible:ring-destructive! ring-1 ring-destructive/30" : "border-border/50!"}`} 
                />
                {errors.ssn && <p className="text-[11px] text-destructive font-medium pl-1">{errors.ssn.message}</p>}
              </div>

              <div className="flex gap-3">
                <div className="flex-1 space-y-1.5">
                    <label className="text-[13px] font-semibold text-foreground!">Via / Piazza / Indirizzo</label>
                    <Input 
                        {...register("street_name")} 
                        className={`bg-card! h-11! rounded-lg! border! ${errors.street_name ? "border-destructive! focus-visible:ring-destructive! ring-1 ring-destructive/30" : "border-border/50!"}`} 
                    />
                    {errors.street_name && <p className="text-[11px] text-destructive font-medium pl-1">{errors.street_name.message}</p>}
                </div>
                <div className="w-20 flex-none space-y-1.5">
                    <label className="text-[13px] font-semibold text-foreground!">Civico</label>
                    <Input 
                        {...register("street_number")} 
                        className={`bg-card! h-11! rounded-lg! border! ${errors.street_number ? "border-destructive! focus-visible:ring-destructive! ring-1 ring-destructive/30" : "border-border/50!"}`} 
                    />
                    {errors.street_number && <p className="text-[11px] text-destructive font-medium pl-1">{errors.street_number.message}</p>}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 space-y-1.5">
                    <label className="text-[13px] font-semibold text-foreground!">Città</label>
                    <Input 
                        {...register("city")} 
                        className={`bg-card! h-11! rounded-lg! border! ${errors.city ? "border-destructive! focus-visible:ring-destructive! ring-1 ring-destructive/30" : "border-border/50!"}`} 
                    />
                    {errors.city && <p className="text-[11px] text-destructive font-medium pl-1">{errors.city.message}</p>}
                </div>
                <div className="w-17.5 flex-none space-y-1.5">
                    <label className="text-[13px] font-semibold text-foreground!">Prov.</label>
                    <Input 
                        {...register("province")} 
                        maxLength={2}
                        className={`bg-card! h-11! rounded-lg! border! uppercase! ${errors.province ? "border-destructive! focus-visible:ring-destructive! ring-1 ring-destructive/30" : "border-border/50!"}`} 
                    />
                    {errors.province && <p className="text-[11px] text-destructive font-medium pl-1">{errors.province.message}</p>}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full! h-12! rounded-full! font-bold! text-base! mt-8! bg-primary! text-primary-foreground! hover:bg-primary/90! shadow-xl! shadow-primary/10! hover:scale-[1.02] transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary-foreground!" />
                    <span className="text-primary-foreground!">Salvataggio in corso...</span>
                  </>
                ) : (
                  <span className="flex items-center gap-2 text-primary-foreground!">
                    Completa Registrazione <Sparkles className="h-4 w-4 text-primary-foreground!" />
                  </span>
                )}
              </Button>
            </form>

          </div>
      </div>
    </div>
  );
}