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
import { useAuth, type UserSettings } from "@/context/authContext";
import { useTheme } from "@/components/themeProvider";
// Ensure this path matches where you saved the file you uploaded
import { TermsOfServiceModal, PrivacyPolicyModal } from "@/components/modals/termsModal"; 
import { 
    Bell, 
    Shield, 
    FileText, 
    Globe, 
    Eye,
    Check,
    Save,
    Settings
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get("tab") || "generale"; 
    
    const { settings: serverSettings, updateSettings } = useAuth();
    const { setTheme } = useTheme();

    const [localSettings, setLocalSettings] = React.useState<UserSettings>(serverSettings);
    const [isDirty, setIsDirty] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        setLocalSettings(serverSettings);
    }, [serverSettings]);

    React.useEffect(() => {
        const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(serverSettings);
        setIsDirty(hasChanges);
    }, [localSettings, serverSettings]);

    const setTab = (tabId: string) => {
        setSearchParams({ tab: tabId });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSettings(localSettings);
            toast.success("Impostazioni salvate con successo");
        } catch (error) {
            toast.error("Errore durante il salvataggio");
        } finally {
            setIsSaving(false);
        }
    };

    const updateNotify = (key: keyof UserSettings['notifications'], val: boolean) => {
        setLocalSettings(prev => ({
            ...prev,
            notifications: { ...prev.notifications, [key]: val }
        }));
    };

    const updateTheme = (val: 'light' | 'dark' | 'system') => {
        setLocalSettings(prev => ({ ...prev, theme: val }));
        setTheme(val); 
    };

    const DirtySaveFooter = () => {
        return (
            <CardFooter className={cn(
                "bg-muted/30 px-6 flex justify-between items-center transition-all duration-300 ease-in-out overflow-hidden",
                isDirty 
                    ? "max-h-24 py-4 border-t opacity-100" 
                    : "max-h-0 py-0 border-t-0 opacity-0"
            )}>
                <span className="text-sm text-muted-foreground hidden sm:block">
                    Hai modifiche non salvate.
                </span>
                <Button 
                    onClick={handleSave} 
                    disabled={isSaving} 
                    className="ml-auto bg-card! text-foreground! outline-0! border-2! hover:border-yellow-500! shadow-md transition-all"
                >
                    {isSaving ? (
                        "Salvataggio..."
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Salva Modifiche
                        </>
                    )}
                </Button>
            </CardFooter>
        );
    };

    const tabs = [
        { id: "generale", label: "Generale", icon: Globe },
        { id: "notifiche", label: "Notifiche", icon: Bell },
        { id: "aspetto", label: "Aspetto", icon: Eye },
        { id: "legale", label: "Legale", icon: Shield },
    ];

    return (
        <main className="flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out">
            
            <NavLayout className="sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur-md flex items-center px-6 gap-4 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="bg-card!" />
                    <div className="h-6 w-px bg-border/60 mx-2 hidden md:block" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem><BreadcrumbLink href="/home">Rinova</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem><BreadcrumbPage>Impostazioni</BreadcrumbPage></BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="flex items-center gap-3"><ModeToggle /></div>
            </NavLayout>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300">
                    
                    <div className="space-y-2 mb-4">
                        <h1 className="text-4xl! font-bold tracking-tight flex items-center gap-2">
                            <Settings className="h-8 w-8 text-primary" />
                            Impostazioni
                        </h1>
                    </div>

                    <div className="w-full">
                        <nav className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="Tabs">
                            {tabs.map((tab) => {
                                const isActive = currentTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setTab(tab.id)}
                                        className={cn(
                                            "flex flex-col bg-card! items-center border-0! justify-center gap-3 p-4 rounded-xl transition-all duration-200 h-24 sm:h-28",
                                            isActive
                                                ? "ring-offset-0! focus:outline-none! hover-ring  hover:outline-none! hover:border-transparent! ring-2! ring-black dark:ring-primary!"
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

                    <div className="mt-6">
                        
                        {currentTab === "generale" && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                <Card>
                                    <CardHeader className="space-y-2">
                                        <CardTitle className="text-lg">Lingua e Regione</CardTitle>
                                        <CardDescription>Personalizza la lingua e il fuso orario</CardDescription>
                                        <Separator />
                                    </CardHeader>
                                    
                                    <CardContent className="space-y-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="language">Lingua Applicazione</Label>
                                            <div className="relative max-w-sm">
                                                <select 
                                                    value={localSettings.language}
                                                    onChange={(e) => setLocalSettings(prev => ({...prev, language: e.target.value}))}
                                                    id="language"
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                >
                                                    <option className="bg-card!" value="it">Italiano (Italia)</option>
                                                    <option className="bg-card!" value="en">English (US) (Coming soon)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Fuso Orario</Label>
                                            <Input value="Europa/Roma (GMT+1)" disabled className="bg-muted/50 max-w-sm" />
                                        </div>
                                    </CardContent>
                                    
                                    <DirtySaveFooter />
                                </Card>
                            </div>
                        )}

                        {currentTab === "notifiche" && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Impostazioni Notifiche</CardTitle>
                                        <CardDescription>Gestisci come e quando vuoi essere contattato.</CardDescription>
                                        <Separator />
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Canali di Comunicazione</h3>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label className="text-base">Email</Label>
                                                    <p className="text-sm text-muted-foreground">Report mensili e avvisi di sicurezza.</p>
                                                </div>
                                                <Switch 
                                                    checked={localSettings.notifications.email} 
                                                    onCheckedChange={(c) => updateNotify('email', c)} 
                                                />
                                            </div>
                                            
                                           {/*} <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label className="text-base">Notifiche Push</Label>
                                                    <p className="text-sm text-muted-foreground">Avvisi live su produzione e consumi.</p>
                                                </div>
                                                <Switch 
                                                    checked={localSettings.notifications.push} 
                                                    onCheckedChange={(c) => updateNotify('push', c)} 
                                                />
                                            </div>*/}
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Preferenze Contenuto</h3>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label className="text-base">Marketing e Novità</Label>
                                                    <p className="text-sm text-muted-foreground">Aggiornamenti sulle Comunità Energetiche.</p>
                                                </div>
                                                <Switch
                                                    checked={localSettings.notifications.marketing} 
                                                    onCheckedChange={(c) => updateNotify('marketing', c)} 
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                    
                                    <DirtySaveFooter />
                                </Card>
                            </div>
                        )}

                        {currentTab === "aspetto" && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tema Interfaccia</CardTitle>
                                        <CardDescription>Scegli l'aspetto che preferisci per Rinova.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div 
                                                onClick={() => updateTheme('light')}
                                                className={cn(
                                                    "cursor-pointer rounded-xl border-2 p-1 transition-all hover:scale-[1.02]",
                                                    localSettings.theme === 'light' 
                                                        ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                                                        : "border-border hover:border-primary/50"
                                                )}
                                            >
                                                <div className="h-24 rounded-lg bg-[#ffffff] border shadow-sm mb-2 relative">
                                                    {localSettings.theme === 'light' && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg animate-in zoom-in">
                                                                <Check className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium block text-center">Chiaro</span>
                                            </div>
                                            
                                            <div 
                                                onClick={() => updateTheme('dark')}
                                                className={cn(
                                                    "cursor-pointer rounded-xl border-2 p-1 transition-all hover:scale-[1.02]",
                                                    localSettings.theme === 'dark' 
                                                        ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                                                        : "border-border hover:border-primary/50"
                                                )}
                                            >
                                                <div className="h-24 rounded-lg bg-[#09090b] border shadow-sm mb-2 relative">
                                                    {localSettings.theme === 'dark' && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg animate-in zoom-in">
                                                                <Check className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium block text-center">Scuro</span>
                                            </div>

                                            <div 
                                                onClick={() => updateTheme('system')}
                                                className={cn(
                                                    "cursor-pointer rounded-xl border-2 p-1 transition-all hover:scale-[1.02]",
                                                    localSettings.theme === 'system' 
                                                        ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                                                        : "border-border hover:border-primary/50"
                                                )}
                                            >
                                                <div className="h-24 rounded-lg bg-linear-to-br from-[#ffffff] to-[#09090b] border shadow-sm mb-2 relative flex items-center justify-center">
                                                    {localSettings.theme === 'system' && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg animate-in zoom-in">
                                                                <Check className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium block text-center">Sistema</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground text-center sm:text-left">
                                            L'anteprima è immediata, ma ricorda di salvare le modifiche per renderle permanenti.
                                        </p>
                                    </CardContent>

                                    <DirtySaveFooter />
                                </Card>

                                {/*<Card>
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
                                </Card>*/}
                            </div>
                        )}

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
                                            <TermsOfServiceModal>Visualizza</TermsOfServiceModal>
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
                                            <PrivacyPolicyModal>Visualizza</PrivacyPolicyModal>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="text-center pt-8">
                                    <p className="text-xs text-muted-foreground">
                                        Rinova App v1.8.1 &copy; 2024 Rinova Energy.
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
            </div>
        </main>
    );
}