import React, { useState } from "react";
import { 
  Home, 
  Settings, 
  User, 
  Leaf, 
  LogOut, 
  Menu, 
  X, 
  Phone, 
  MapPin, 
  Mail, 
  CreditCard, 
  Shield, 
  Zap, 
  Edit2,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-separator";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ModeToggle } from "@/modeToggle";
import { useIsMobile } from "@/hooks/use-mobile";


const cn = (...classes: (string | boolean)[]) => classes.filter(Boolean).join(" ");


export default function AreaPersonale() {
  const [activeTab, setActiveTab] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-background flex font-sans text-foreground">
      
      {/* OVERLAY MOBILE (Sfondo scuro quando il menu è aperto) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* CONTENUTO PRINCIPALE */}
      <main className="flex-1 flex flex-col overflow-x-hidden bg-muted/30">
            {activeTab === "profile" && <ProfileContent />}
            {activeTab === "home" && <HomeContent setActiveTab={setActiveTab} />}
            {activeTab === "settings" && <SettingsContent />}
            {useIsMobile() && (
            <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t h-16 z-40 flex justify-around items-center safe-area-pb px-2 shadow-[0_-5px_10px_-5px_rgba(0,0,0,0.05)]">
              
              {/* HOME */}
              <Button 
                onClick={() => setActiveTab("home")}
                className="flex-1 group flex flex-col border-primary! focus-visible:outline-none items-center bg-card! justify-center gap-1 h-full cursor-pointer "
              >
                {/* Icon Container: Diventa una pillola colorata quando attivo */}
                <div className={cn(
                  "p-1.5 rounded-2xl transition-all duration-300 ease-in-out",
                  activeTab === "home" 
                    ? "bg-primary/15 text-primary scale-105" // Attivo: sfondo soft e leggero zoom
                    : "bg-transparent text-muted-foreground group-hover:bg-muted/30" // Inattivo
                )}>
                  <Home className={cn(
                    "w-5 h-5 transition-transform duration-300", 
                    activeTab === "home" && "fill-current"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors duration-300",
                  activeTab === "home" ? "text-primary" : "text-muted-foreground"
                )}>
                  Home
                </span>
              </Button>

              {/* PROFILE */}
              <Button 
                onClick={() => setActiveTab("profile")}
                className="flex-1 group border-primary! flex flex-col items-center bg-card! justify-center gap-1 h-full"
              >
                <div className={cn(
                  "p-1.5 rounded-2xl transition-all duration-300 ease-in-out",
                  activeTab === "profile" 
                    ? "text-primary scale-105" 
                    : "bg-transparent text-muted-foreground group-hover:bg-muted/30"
                )}>
                  <User className={cn(
                    "w-5 h-5 transition-transform duration-300", 
                    activeTab === "profile" && "fill-current"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors duration-300",
                  activeTab === "profile" ? "text-primary" : "text-muted-foreground"
                )}>
                  Profilo
                </span>
              </Button>

              {/* SETTINGS */}
              <Button 
                onClick={() => setActiveTab("settings")}
                className="flex-1 group border-primary! flex flex-col items-center bg-card! justify-center gap-1 h-full cursor-pointer focus:outline-none"
              >
                <div className={cn(
                  "p-1.5 rounded-2xl transition-all duration-300 ease-in-out",
                  activeTab === "settings" 
                    ? "bg-primary/15 text-primary scale-105" 
                    : "bg-transparent text-muted-foreground group-hover:bg-muted/30"
                )}>
                  <Settings className={cn(
                    "w-5 h-5 transition-transform duration-300", 
                    activeTab === "settings" && "fill-current animate-spin-slow"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors duration-300",
                  activeTab === "settings" ? "text-primary" : "text-muted-foreground"
                )}>
                  Opzioni
                </span>
              </Button>

            </div>
          )}
      </main>
    </div>
  );
}

// --- VISTE (Resto del contenuto invariato) ---

function HomeContent({ setActiveTab }: any) {
  return (
    <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 pt-6">
      <div className="bg-brand-soft rounded-full mb-6 ring-1 ring-brand-soft shadow-sm">
        <Home size={64} className="text-primary" />
      </div>
      <h2 className="text-4xl font-bold text-foreground tracking-tight">Bentornato, Mario!</h2>
      <p className="text-muted-foreground mt-4 max-w-lg text-lg">
        La tua energia è sotto controllo. Oggi hai risparmiato il <span className="font-semibold text-primary">12%</span> rispetto alla media settimanale.
      </p>
      <div className="flex gap-4 mt-8">
        <Button 
          size="lg" 
          onClick={() => setActiveTab('profile')} 
          className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 !bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Gestisci Profilo
        </Button>
        <Button size="lg" variant="outline" className="gap-2 bg-card! border-border">
          Vedi Analisi <ArrowUpRight className="w-4 h-4"/>
        </Button>
      </div>
    </div>
  );
}

function SettingsContent() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center gap-3 mb-6">
         <div className="p-2 bg-card border rounded-lg shadow-sm">
           <Settings className="w-6 h-6 text-muted-foreground" />
         </div>
         <h2 className="text-2xl font-bold text-foreground">Impostazioni Generali</h2>
       </div>
       
      <Card>
        <CardHeader>
          <CardTitle>Preferenze Applicazione</CardTitle>
          <CardDescription>Gestisci come l'applicazione si comporta e comunica con te.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border-2 rounded-lg bg-muted/30">
             <div className="space-y-0.5">
               <Label className="text-base">Notifiche Push</Label>
               <p className="text-sm text-muted-foreground">Ricevi aggiornamenti sui consumi in tempo reale</p>
             </div>
             <Button variant="outline" size="sm" className=" border-brand-soft! bg-brand-soft! text-primary hover:text-primary hover:bg-brand-soft transform
                    transition-transform
                    duration-200
                    hover:-translate-y-1
                    active:translate-y-0">Attiva</Button>
          </div>
          <div className="flex items-center justify-between p-4 border-2 rounded-lg bg-muted/30">
             <div className="space-y-0.5">
               <Label className="text-base">Tema Scuro</Label>
               <p className="text-sm text-muted-foreground">Passa alla modalità dark</p>
             </div>
              <ModeToggle/>
          </div>
          <div className="flex items-center justify-between p-4 border-2 rounded-lg bg-muted/30">
             <div className="space-y-0.5">
               <Label className="text-base">Elimina account</Label>
               <p className="text-sm text-muted-foreground">Elimina definitivamente il tuo account Rinova</p>
             </div>
             <Button variant="outline" size="sm" className="!border-destructive !bg-destructive text-destructive-foreground hover:bg-destructive/90 transform
                    transition-transform
                    duration-200
                    hover:-translate-y-1
                    active:translate-y-0">Elimina</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileContent() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:px-8">
      
      {/* HEADER UTENTE */}
      <div className="relative rounded-xl overflow-x-hidden bg-card shadow-sm border border-border group">
        <div className="h-32 bg-linear-to-r from-primary to-nuance">
           <div className="absolute inset-0 bg-black/5"></div>
        </div>
        <div className="px-6 pb-6 flex flex-col md:flex-row items-center md:items-end -mt-12 gap-4">
          <Avatar className="h-24 w-24 ring-4 rounded-full ring-background shadow-xl bg-card">
            <AvatarFallback className="text-2xl flex h-full  items-center justify-center font-bold">MR</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 flex flex-col items-center text-center mb-2">
            <h2 className="text-2xl  font-bold flex items-center justify-center gap-2 text-foreground md:text-white transition-colors">
              Mario Rossi 
              <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-50" />
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
              <span className="text-sm text-muted-foreground">mario.rossi@example.com</span>
              <Badge variant="secondary" className="border border-brand-soft bg-brand-soft text-primary hover:bg-brand-soft">
                Membro CER
              </Badge>
            </div>
          </div>
          
          <div className="mb-2">
            <Button variant="outline" size="sm" className="gap-2 bg-card/80! backdrop-blur-sm border-border hover:bg-card">
              <Edit2 size={14} /> Modifica Cover
            </Button>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        
        {/* COLONNA SINISTRA */}
        <div className="space-y-6 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni personali</CardTitle>
              <CardDescription>I tuoi dati di contatto principali</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <div className="flex items-center">
                    <Input defaultValue="Mario" disabled className="pl-9 w-[85%] bg-muted" />
                    <User className=" left-3 top-2.5 h-4 w-4 text-muted-foreground" />

                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cognome</Label>
                  <div className="flex items-center">
                    <Input defaultValue="Rossi" disabled className="pl-9 w-[85%] bg-muted" />
                    <User className="left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Telefono</Label>
                  <div className="flex items-center">
                    <Input defaultValue="+39 334 1234567" disabled className="pl-9 w-[85%] bg-muted" />
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Comune</Label>
                  <div className="flex items-center">
                    <Input defaultValue="Milano" disabled className="pl-9 w-[85%] bg-muted" />
                    <MapPin className="left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                 <Button variant="default" className="p-0 h-auto font-normal
                    bg-primary!
                    text-card
                    hover:border-brand-soft!
                    transform
                    transition-transform
                    duration-200
                    hover:-translate-y-1
                    active:translate-y-0 ">Modifica informazioni personali</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="w-5 h-5 text-primary" /> Credenziali e sicurezza
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border-2 border-brand-soft! hover:border-brand-soft transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-xs text-muted-foreground">mario.rossi@example.com</p>
                </div>
                <Button variant="outline" size="sm" className="h-8
                    !bg-brand-soft
                    text-primary!
                    hover:!bg-brand-soft
                    hover:!border-brand-soft
                    hover:text-primary
                    transform
                    transition-transform
                    duration-200
                    hover:-translate-y-1
                    active:translate-y-0
                  ">Cambia</Button>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border-2 border-brand-soft! hover:border-brand-soft transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">Password</p>
                  <p className="text-xs text-muted-foreground font-mono tracking-widest">••••••••••</p>
                </div>
                <Button variant="outline" size="sm" className="
                    h-8
                    !bg-brand-soft
                    text-primary!
                    hover:!bg-brand-soft
                    hover:!border-brand-soft
                    hover:text-primary
                    transform
                    transition-transform
                    duration-200
                    hover:-translate-y-1
                    active:translate-y-0
                  ">Cambia
                </Button> 
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLONNA DESTRA */}
        <div className="space-y-6 min-w-0">
          
          <Card className="border-0 shadow-xl bg-linear-to-br from-primary to-nuanceCard text-white overflow-hidden">
           

            <CardHeader className="relative z-10">
              <div className="flex justify-between items-start">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md shadow-inner">
                  <Zap className="text-yellow-300 w-6 h-6 fill-yellow-300" />
                </div>
                <span className="bg-white/20 border border-white/30 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
                  Stato: Attivo
                </span>
              </div>
              <CardTitle className="mt-4 text-2xl font-bold tracking-tight">Comunità Energetica</CardTitle>
              <p className="text-white/90 font-medium">Milano Nord</p>
            </CardHeader>
            <CardContent className="relative z-10 pt-2">
              <div className="grid grid-cols-2 gap-4 mt-2 border-t border-white/10 pt-4">
                <div>
                   <p className="text-[10px] text-white/80 uppercase font-bold tracking-wider mb-1">POD</p>
                   <p className="font-mono text-sm bg-black/20 inline-block px-1.5 rounded text-white">IT123456789</p>
                </div>
                <div>
                   <p className="text-[10px] text-white/80 uppercase font-bold tracking-wider mb-1">Impianto</p>
                   <p className="text-sm font-medium">3.2 kW PV</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-3 border-l-primary border-b-primary hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Dettagli Impianto</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:border-brand-soft! bg-card!"><ArrowUpRight className="w-4 h-4"/></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-3">
                 <div className="flex justify-between border-b border-dashed border-border pb-2">
                    <span className="text-muted-foreground text-sm">POD</span>
                    <span className="font-mono text-sm text-foreground bg-muted px-1 rounded">IT123456789</span>
                 </div>
                 <div className="flex justify-between border-b border-dashed border-border pb-2">
                    <span className="text-muted-foreground text-sm">Tipologia</span>
                    <span className="font-medium text-sm">Fotovoltaico</span>
                 </div>
                 <div className="flex justify-between border-b border-dashed border-border pb-2">
                    <span className="text-muted-foreground text-sm">Potenza</span>
                    <span className="font-bold text-primary text-sm">3,2 kW</span>
                 </div>
                 <div className="flex justify-between border-b border-dashed border-border pb-2">
                    <span className="text-muted-foreground text-sm">Indirizzo</span>
                    <span className="font-medium text-sm text-right">Via Paolo V n8</span>
                 </div>
                 <div className="flex justify-between items-center pt-2">
                    <span className="text-muted-foreground text-sm">Stato</span>
                    <Badge className="bg-brand-soft text-primary hover:bg-brand-soft">Attivo</Badge>
                 </div>
              </div>

              <Separator className="my-4" />

              <Button className="w-full  !bg-brand-soft
                    text-primary!
                    hover:!bg-brand-soft
                    hover:!border-brand-soft
                    transform
                    transition-transform
                    duration-200
                    hover:-translate-y-1
                    active:translate-y-0 " variant="default">
                Visualizza tutti gli impianti
              </Button>
            </CardContent>
          </Card>

          <div className="bg-brand-soft border border-brand-soft rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-card p-2 rounded-full shadow-sm ring-1 ring-brand-soft">
                   <Leaf className="text-primary w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Hai ridotto la CO2 del 15%</p>
                  <p className="text-xs text-primary/80">Rispetto al mese scorso. Continua così!</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full sm:w-auto h-8 text-xs bg-card! hover:bg-brand-soft border-primary text-primary">Vedi Report</Button>
           </div>
        </div>

      </div>
    </div>
  );
}