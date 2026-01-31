import React from "react";
import { SidebarTrigger } from "@/components/sidebar/sidebarLayout";
import { NavLayout } from "@/components/nav/navLayout";
import { ModeToggle } from "@/components/modeToggle";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; 
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
    Bell, 
    Shield, 
    FileText, 
    Globe, 
    Eye, 
    Smartphone, 
    Mail, 
    Check
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    // Gestione URL params
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get("tab") || "generale"; 
    
    // Funzione helper per cambiare tab
    const setTab = (tabId: string) => {
        setSearchParams({ tab: tabId });
    };

    // Mock states
    const [notifEmail, setNotifEmail] = React.useState(true);
    const [notifPush, setNotifPush] = React.useState(true);

    // Definizione dei Tab
    const tabs = [
        { id: "generale", label: "Generale", icon: Globe },
        { id: "notifiche", label: "Notifiche", icon: Bell },
        { id: "aspetto", label: "Aspetto", icon: Eye },
        { id: "legale", label: "Legale", icon: Shield },
    ];

    return (
                <main className="flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out">
                    
                    {/* NAVBAR */}
                    <NavLayout className="sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur-md flex items-center px-6 gap-4 justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger/>
                            <div className="h-6 w-px bg-border/60 mx-2 hidden md:block" />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem><BreadcrumbLink href="/home">Rinova</BreadcrumbLink></BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem><BreadcrumbPage>Impostazioni</BreadcrumbPage></BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        <div className="flex items-center gap-3"><ModeToggle/></div>
                    </NavLayout>

                    {/* CONTENUTO SCROLLABILE */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="max-w-4xl mx-auto space-y-8">
                            
                            {/* HEADER PAGINA */}
                            <div className="space-y-1">
                                <h1 className="text-4xl! font-bold tracking-tight text-foreground">Impostazioni</h1>
                                <p className="text-muted-foreground text-lg">
                                    Gestisci le preferenze.
                                </p>
                            </div>

                            {/* NAVIGATION GRID (Responsive: 2x2 Mobile, 1x4 Desktop) */}
                            <div className="w-full">
                                <nav className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="Tabs">
                                    {tabs.map((tab) => {
                                        const isActive = currentTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setTab(tab.id)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-200 h-24 sm:h-28",
                                                    // Stile Attivo
                                                    isActive
                                                        ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary/20"
                                                        // Stile Inattivo
                                                        : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:border-primary/50 hover:text-foreground"
                                                )}
                                            >
                                                <tab.icon className={cn("h-6 w-6 mb-1", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                                <span className="text-sm font-medium">{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* CONTENUTO SCHEDE */}
                            <div className="mt-6">
                                
                                {/* --- TAB: GENERALE --- */}
                                {currentTab === "generale" && (
                                    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Lingua e Regione</CardTitle>
                                                <CardDescription>Personalizza la lingua e i formati regionali.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="language">Lingua Applicazione</Label>
                                                    <div className="relative max-w-sm">
                                                        <select 
                                                            id="language"
                                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <option value="it">Italiano (Italia)</option>
                                                            <option value="en">English (US) (Coming soon)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Fuso Orario</Label>
                                                    <Input value="Europa/Roma (GMT+1)" disabled className="bg-muted/50 max-w-sm" />
                                                </div>
                                            </CardContent>
                                            <CardFooter className="bg-muted/20 border-t px-6 py-4">
                                                <Button onClick={() => toast.success("Impostazioni salvate")}>Salva Modifiche</Button>
                                            </CardFooter>
                                        </Card>
                                    </div>
                                )}

                                {/* --- TAB: NOTIFICHE --- */}
                                {currentTab === "notifiche" && (
                                    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Canali di comunicazione</CardTitle>
                                                <CardDescription>Decidi su quali canali vuoi ricevere aggiornamenti.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-base">Email</Label>
                                                        <p className="text-sm text-muted-foreground">Report mensili e avvisi di sicurezza.</p>
                                                    </div>
                                                    <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
                                                </div>
                                                <Separator />
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-base">Notifiche Push</Label>
                                                        <p className="text-sm text-muted-foreground">Avvisi live su produzione e consumi.</p>
                                                    </div>
                                                    <Switch checked={notifPush} onCheckedChange={setNotifPush} />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Preferenze Contenuto</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-base">Marketing e Novità</Label>
                                                        <p className="text-sm text-muted-foreground">Aggiornamenti sulle Comunità Energetiche.</p>
                                                    </div>
                                                    <Switch />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* --- TAB: ASPETTO --- */}
                                {currentTab === "aspetto" && (
                                    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Tema Interfaccia</CardTitle>
                                                <CardDescription>Scegli l'aspetto che preferisci per Rinova.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    {/* Opzione Chiaro */}
                                                    <div className="cursor-not-allowed opacity-60">
                                                        <div className="h-24 rounded-lg bg-[#f4f4f5] border-2 border-transparent mb-2" />
                                                        <span className="text-sm font-medium block text-center">Chiaro</span>
                                                    </div>
                                                    
                                                    {/* Opzione Scuro */}
                                                    <div className="cursor-not-allowed opacity-60">
                                                        <div className="h-24 rounded-lg bg-[#09090b] border-2 border-transparent mb-2" />
                                                        <span className="text-sm font-medium block text-center">Scuro</span>
                                                    </div>

                                                    {/* Opzione Sistema (Attiva) */}
                                                    <div className="relative">
                                                        <div className="h-24 rounded-lg bg-linear-to-br from-[#f4f4f5] to-[#09090b] border-2 border-primary flex items-center justify-center mb-2">
                                                            <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                                                                <Check className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-medium block text-center text-primary">Sistema</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground text-center sm:text-left">
                                                    Usa il toggle nella barra in alto per cambiare tema istantaneamente.
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Accessibilità Visiva</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-base">Aumenta Contrasto</Label>
                                                        <p className="text-sm text-muted-foreground">Migliora la distinzione dei bordi.</p>
                                                    </div>
                                                    <Switch />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* --- TAB: LEGALE --- */}
                                {currentTab === "legale" && (
                                    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="grid gap-4">
                                            <Card className="hover:bg-muted/40 transition-colors cursor-pointer group">
                                                <CardContent className="p-6 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2.5 bg-muted rounded-lg group-hover:bg-background transition-colors">
                                                            <FileText className="h-5 w-5 text-foreground" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-base">Termini di Servizio</h4>
                                                            <p className="text-sm text-muted-foreground">Contratto di licenza e utilizzo.</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm">Apri</Button>
                                                </CardContent>
                                            </Card>
                                            
                                            <Card className="hover:bg-muted/40 transition-colors cursor-pointer group">
                                                <CardContent className="p-6 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2.5 bg-muted rounded-lg group-hover:bg-background transition-colors">
                                                            <Shield className="h-5 w-5 text-foreground" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-base">Privacy Policy</h4>
                                                            <p className="text-sm text-muted-foreground">Gestione dati e GDPR.</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm">Apri</Button>
                                                </CardContent>
                                            </Card>
                                        </div>
                                        <div className="text-center pt-8">
                                            <p className="text-xs text-muted-foreground">
                                                Rinova App v1.2.0 &copy; 2024 Rinova S.r.l.
                                            </p>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </main>
    );
}