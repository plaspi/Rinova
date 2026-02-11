import { RegistrationForm } from "@/components/forms/registration-form";
import { RegistrationCarousel } from "@/components/registrationCarousel";
import { Card } from "@/components/ui/card";
import { TermsOfServiceModal, PrivacyPolicyModal } from "@/components/modals/termsModal"; 
import { RinovaLogo } from "@/components/rinova-logo";

export default function RegistrationPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-muted/20 p-4 lg:p-0">
      
      {/* CARD PRINCIPALE */}
      <Card className="
        w-full max-w-5xl 
        h-full lg:h-auto lg:max-h-[90vh] 
        flex flex-col lg:grid lg:grid-cols-2 
        border-0 lg:border shadow-none lg:shadow-2xl 
        lg:rounded-3xl 
        ring-1 ring-border/50
        overflow-hidden bg-card
        animate-in fade-in zoom-in-95 duration-400
      ">
        
        {/* COLONNA SINISTRA (Form) */}
        <div className="flex-1 flex flex-col p-6 lg:p-12 overflow-y-auto scrollbar-hide relative pb-6">
          
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <div className="bg-green-500 p-2 bg-brand-gradient! rounded-lg shadow-sm">
               <RinovaLogo className="text-background w-8 h-8" />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">Rinova</span>
          </div>

          <div className="w-full max-w-130 mx-auto space-y-6 my-auto">
              <div className="flex flex-col space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Crea un account</h1>
                <p className="text-sm text-muted-foreground">
                  Inserisci i tuoi dati qui sotto per iniziare.
                </p>
              </div>
              
              <RegistrationForm />
          </div>
        </div>

        {/* COLONNA DESTRA (Visual) */}
        <div className="hidden lg:flex flex-col relative bg-linear-to-br from-green-500 to-emerald-900 text-white overflow-hidden items-center justify-center">
           <div className="absolute top-[-20%] right-[-10%] w-125 h-125 bg-white/10 rounded-full blur-3xl pointer-events-none" />
           <div className="absolute bottom-[-20%] left-[-10%] w-100 h-100 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
           <RegistrationCarousel className="w-full h-full z-10" />
        </div>

      </Card>

      {/* FOOTER ESTERNO (Stile Login) */}
      <div className="mt-4 text-center px-4 shrink-0">
           <p className="text-[12px] text-muted-foreground max-w-sm mx-auto">
              Cliccando registrati accetti i nostri <TermsOfServiceModal>Termini</TermsOfServiceModal> e <PrivacyPolicyModal>Privacy</PrivacyPolicyModal>.
           </p>
      </div>

    </div>
  );
}