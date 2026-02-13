import { useState } from "react";
import { SidebarTrigger } from "@/components/sidebar/sidebarLayout";
import { NavLayout } from "@/components/nav/navLayout";
import { ModeToggle } from "@/components/modeToggle";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, HelpCircle, X } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function PlansPage() {
    const { isPro } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        setIsLoading(true);
        toast.info("Integrazione pagamenti in arrivo...", {
            description: "Presto potrai effettuare l'upgrade automatico da qui."
        });
        setTimeout(() => setIsLoading(false), 2000);
    };

    const freeFeatures = [
        "Monitoraggio Live (ultime 24h)",
        "Storico standard (Settimana/Mese/Anno)",
        "Gestione Impianti base",
        "Accesso Bacheca CER",
    ];

    const proFeatures = [
        "Analisi Storico con date personalizzate",
        "Reportistica PDF illimitata",
        "Chat e messaggistica membri CER",
        "Dashboard personalizzabile",
        "Supporto prioritario",
    ];

    return (
        <div className="flex flex-col h-full w-full bg-background">
            
            {/* NAVBAR */}
            <NavLayout className="sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur-md flex items-center px-6 gap-4 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="bg-card!" />
                    <Breadcrumb className="hidden md:flex">
                        <BreadcrumbList>
                            <BreadcrumbItem><BreadcrumbLink href="/home">Rinova</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem><BreadcrumbPage>Piani e Tariffe</BreadcrumbPage></BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="flex items-center gap-3"><ModeToggle /></div>
            </NavLayout>

            {/* CONTENUTO PRINCIPALE */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto animate-in fade-in duration-500">
                
                {/* HEADER PAGINA (FUORI DAL DIV CENTRATO - ALLINEATO A SX) */}
                <div className="flex flex-col gap-1 mb-8">
                    <h1 className="text-4xl! font-bold tracking-tight flex items-center gap-3 text-foreground">
                        <Sparkles className="h-8 w-8 text-amber-500" />
                        Piani e Tariffe
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Scegli il piano adatto alle tue esigenze e sblocca il potenziale della tua CER.
                    </p>
                </div>

                {/* WRAPPER SOLO PER LE CARD (CENTRATO PER ESTETICA) */}
                <div className="max-w-5xl mx-auto space-y-10">
                    
                    {/* GRID DEI PIANI */}
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        
                        {/* --- PIANO FREE --- */}
                        <Card className={cn(
                            "relative shadow-md transition-all duration-300 hover:shadow-lg border-border",
                            !isPro && "border-muted-foreground/20 bg-muted/30"
                        )}>
                            <CardHeader className="pb-8">
                                <CardTitle className="text-2xl font-bold">Base</CardTitle>
                                <CardDescription>Per iniziare a monitorare i tuoi consumi.</CardDescription>
                                <div className="mt-6 flex items-baseline gap-1">
                                    <span className="text-4xl font-bold tracking-tight">Gratis</span>
                                    <span className="text-sm font-semibold leading-6 text-muted-foreground">/ sempre</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4 text-sm leading-6 text-foreground/80">
                                    {freeFeatures.map((feature, index) => (
                                        <li key={index} className="flex gap-x-3 items-center">
                                            <Check className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                                            {feature}
                                        </li>
                                    ))}
                                    <li className="flex gap-x-3 items-center opacity-50">
                                        <X className="h-5 w-5 flex-none text-muted-foreground" />
                                        Analisi date personalizzate
                                    </li>
                                    <li className="flex gap-x-3 items-center opacity-50">
                                        <X className="h-5 w-5 flex-none text-muted-foreground" />
                                        Funzionalità Social CER
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className="w-full" 
                                    variant={!isPro ? "outline" : "secondary"}
                                    disabled={!isPro} 
                                >
                                    {!isPro ? "Piano Attuale" : "Torna a Base"}
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* --- PIANO PRO --- */}
                        <Card className={cn(
                            "relative shadow-xl transition-all duration-300 hover:shadow-2xl scale-105 z-10 ring-2 ring-primary/20", 
                            isPro && "bg-muted/30 border-primary/50"
                        )}>
                            {!isPro && (
                                <div className="absolute -top-4 inset-x-0 flex justify-center">
                                    <Badge className="bg-primary hover:bg-primary text-sm px-4 py-1 shadow-sm flex items-center gap-1">
                                        <Zap className="h-3.5 w-3.5 fill-current" />
                                        Più Popolare
                                    </Badge>
                                </div>
                            )}

                            <CardHeader className="pb-8">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                                        Pro
                                        {isPro && <Badge variant="outline" className="border-primary text-primary">Attivo</Badge>}
                                    </CardTitle>
                                    <HelpCircle className="h-5 w-5 text-muted-foreground opacity-50 hover:opacity-100 cursor-help transition-opacity" />
                                </div>
                                <CardDescription>Per utenti avanzati e membri attivi della CER.</CardDescription>
                                <div className="mt-6 flex items-baseline gap-1">
                                    <span className="text-4xl font-bold tracking-tight">4,99€</span>
                                    <span className="text-sm font-semibold leading-6 text-muted-foreground">/ mese</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4 text-sm leading-6">
                                    <li className="flex gap-x-3 items-center font-medium">
                                        <Check className="h-5 w-5 flex-none text-primary" />
                                        Tutte le funzionalità Base, più:
                                    </li>
                                    {proFeatures.map((feature, index) => (
                                        <li key={index} className="flex gap-x-3 items-center">
                                            <div className="h-5 w-5 flex items-center justify-center rounded-full bg-primary/10">
                                                <Sparkles className="h-3 w-3 text-primary fill-primary" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className={cn("w-full gap-2 font-semibold text-md h-11", !isPro && "bg-green-600! hover:bg-green-700! text-white shadow-md")}
                                    variant={isPro ? "outline" : "default"}
                                    disabled={isPro || isLoading} 
                                    onClick={handleUpgrade}
                                >
                                    {isLoading ? (
                                        "Elaborazione..."
                                    ) : isPro ? (
                                        "Piano Attuale"
                                    ) : (
                                        <>
                                            <Zap className="h-4 w-4 fill-current" />
                                            Effettua Upgrade
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                            {!isPro && (
                                <p className="text-xs text-center text-muted-foreground pb-4 px-6 -mt-2">
                                    Puoi disdire in qualsiasi momento. Nessun vincolo.
                                </p>
                            )}
                        </Card>

                    </div>
                    
                    {/* FAQ / FOOTER */}
                    <div className="text-center pt-8 text-muted-foreground text-sm">
                        <p>Hai bisogno di un piano personalizzato per una grande CER?</p>
                        <Link to={"mailto:rionvaenergy-support@gmail.com"}>
                        <Button variant="link" className="text-foreground! bg-accent! h-auto mt-2">Contattaci per soluzioni Enterprise</Button>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}