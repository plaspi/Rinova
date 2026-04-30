import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/sidebar/sidebarLayout";
import { NavLayout } from "@/components/nav/navLayout";
import { ModeToggle } from "@/components/modeToggle";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RefreshCcw, Loader2, Zap, Activity, TrendingUp, Lock, Download, Sparkles, WifiOff, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/services/supabase_client";
import { useAuth } from "@/context/authContext";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/services/api_config";
import { usePlants } from "@/context/plantsContext";

export default function ProductionPage() {
    const { isPro } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    // Rename 'plants' from context to 'userPlants' to differentiate from API data
    const { getPlantStatus, refreshPlants, plants: userPlants, isLoading: plantsLoading } = usePlants();
    
    const [pdfLoading, setPdfLoading] = useState(false);
    const [retryingId, setRetryingId] = useState<string | null>(null);

    // --- QUERY DATI DASHBOARD ---
    const { data: dashboardData, isLoading: dataLoading } = useQuery({
        queryKey: ['dashboard-live'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            const response = await fetch(`${API_BASE_URL}/api/production/live`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error("Errore caricamento dati");
            return response.json();
        },
        refetchInterval: 300000, 
    });

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-live'] });
        refreshPlants();
    };

    const handleRetryPlant = async (plantId: string) => {
        setRetryingId(plantId);
        try {
            await refreshPlants(); 
            await queryClient.invalidateQueries({ queryKey: ['dashboard-live'] });
            toast.success("Stato impianto aggiornato", {id: "status-refreshed"});
        } catch (e) {
            toast.error("Impossibile connettersi all'impianto");
        } finally {
            setRetryingId(null);
        }
    };

    const handleDownloadReport = async () => {
        if (!isPro) {
            toast("Sblocca Rinova Energy Pro", {
                id: "pro-lock-live",
                description: "Il download dei report PDF è riservato al piano Pro.",
                icon: <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" />,
                action: { label: "Vedi Piani", onClick: () => navigate("/subscription") },
            });
            return;
        }

        setPdfLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const res = await fetch(`${API_BASE_URL}/api/report/download?period=live&plantId=summary`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            
            if(res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Report_Live_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (e) {
            console.error(e);
            toast.error("Errore download report");
        } finally {
            setPdfLoading(false);
        }
    };

    // Use default if dashboardData is not yet loaded
    const kpi = dashboardData?.kpi || { peak: 0, totalEnergy: 0, avgPower: 0 };
    const charts = dashboardData?.charts || {};

    const isLoading = plantsLoading || (dataLoading && !dashboardData);

    return (
        <main className="flex-1 flex flex-col min-h-screen w-full overflow-y-auto transition-all duration-300">
            <NavLayout className="sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur-md flex items-center px-6 gap-4 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="bg-card!" />
                    <div className="h-6 w-px bg-border/60 mx-2 hidden md:block" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem><BreadcrumbLink href="/home">Rinova</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem><BreadcrumbPage>Monitoraggio Live</BreadcrumbPage></BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="flex items-center gap-3"><ModeToggle /></div>
            </NavLayout>

            <div className="flex-1 p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl! font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Zap className="h-8 w-8 text-primary" />
                            Impianti Live
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Panoramica in tempo reale delle ultime <span className="font-semibold text-primary">24 ore</span>.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2"> 
                        <Button variant="outline" size="lg" onClick={handleRefresh} disabled={isLoading} className="gap-2 bg-card! border-2! outline-0! hover:border-primary! hover:text-primary! text-foregroung!">
                            <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                            Aggiorna
                        </Button>
                        <Button 
                            variant="default" 
                            size="lg" 
                            onClick={handleDownloadReport} 
                            disabled={pdfLoading || isLoading}
                            className="gap-2 bg-card! border-2! hover:bg-primary/90 text-foreground! hover:text-primary! hover:border-primary!"
                        >
                            {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            Scarica Report
                            {!isPro && <Lock className="h-3.5 w-3.5 text-amber-300 ml-1" />}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KpiCard title="Picco Massimo" value={kpi.peak} unit="kW" icon={TrendingUp} color="text-red-500" desc="Valore massimo registrato oggi" />
                    <KpiCard title="Energia Prodotta (24h)" value={kpi.totalEnergy} unit="kWh" icon={Zap} color="text-yellow-500" desc="Totale accumulato nel periodo" />
                    <KpiCard title="Potenza Media Attuale" value={kpi.avgPower} unit="kW" icon={Activity} color="text-blue-500" desc="Media istantanea su tutti gli impianti" />
                </div>

                {isLoading ? (
                    <div className="flex h-96 items-center justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {/* ITERATE OVER 'userPlants' (Context) INSTEAD OF API DATA
                           This ensures even offline plants are rendered.
                        */}
                        {userPlants.map((plant: any) => {
                            const status = getPlantStatus(plant.id);
                            const isOffline = status === 'offline';
                            const isMaintenance = status === 'manutenzione';
                            const isBlocked = isOffline || isMaintenance;
                            const isPlantRetrying = retryingId === plant.id;
                            
                            // Safe check if charts exist for this plant
                            const hasData = charts && charts[plant.id] && charts[plant.id].length > 0;

                            return (
                                <Card 
                                    key={plant.id} 
                                    className={cn(
                                        "shadow-lg border-t-4 overflow-hidden hover:shadow-xl transition-shadow duration-300 relative",
                                        isOffline ? "border-t-red-500" : isMaintenance ? "border-t-amber-500" : "border-t-primary"
                                    )}
                                >
                                    <CardHeader className="pb-2 bg-muted/5">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-lg font-semibold">{plant.nome}</CardTitle>
                                            
                                            {/* Status Badge */}
                                            {isBlocked ? (
                                                <div className={cn(
                                                    "flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider",
                                                    isOffline 
                                                        ? "bg-red-500/10 text-red-500 border-red-500/50" 
                                                        : "bg-amber-500/10 text-amber-500 border-amber-500/50"
                                                )}>
                                                    {isOffline ? (
                                                        <>
                                                            <WifiOff className="h-3.5 w-3.5" />
                                                            Offline
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Wrench className="h-3.5 w-3.5" />
                                                            Manutenzione
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-200">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                    </span>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent className="p-0">
                                        <div className="h-70 w-full mt-4 pr-0">
                                            {isBlocked ? (
                                                // Blocked UI (Offline/Maintenance)
                                                <div className="flex flex-col items-center justify-center h-full pb-8 px-6 gap-4 animate-in fade-in zoom-in-95">
                                                    <div className={cn(
                                                        "flex items-center justify-center w-20 h-20 rounded-2xl shadow-sm mb-1",
                                                        isOffline 
                                                            ? "bg-red-500/10 text-red-500" 
                                                            : "bg-amber-500/10 text-amber-500"
                                                    )}>
                                                        {isOffline ? <WifiOff className="w-10 h-10" /> : <Wrench className="w-10 h-10" />}
                                                    </div>
                                                    
                                                    <div className="text-center space-y-1">
                                                        <h3 className="text-xl font-bold tracking-tight text-foreground">
                                                            {isOffline ? "Connessione Persa" : "In Manutenzione"}
                                                        </h3>
                                                        <p className="text-muted-foreground text-sm">
                                                            {isOffline 
                                                                ? "Impossibile recuperare i dati live." 
                                                                : "Manutenzione programmata in corso."}
                                                        </p>
                                                    </div>

                                                    <Button 
                                                        variant="outline"
                                                        className="gap-2 mt-2 bg-transparent border-dashed border-muted-foreground/30 hover:bg-muted/50"
                                                        onClick={() => handleRetryPlant(plant.id)}
                                                        disabled={isPlantRetrying}
                                                    >
                                                        {isPlantRetrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                                                        {isPlantRetrying ? "Controllo..." : "Riprova"}
                                                    </Button>
                                                </div>
                                            ) : hasData ? (
                                                <div className="pr-4 h-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={charts[plant.id]}>
                                                            <defs>
                                                                <linearGradient id={`prod_${plant.id}`} x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                                                </linearGradient>
                                                                <linearGradient id={`cons_${plant.id}`} x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="ef4444" stopOpacity={0.3}/>
                                                                    <stop offset="95%" stopColor="ef4444" stopOpacity={0}/>
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} stroke="hsl(var(--border))" />
                                                            <XAxis 
                                                                dataKey="time" 
                                                                axisLine={false} 
                                                                tickLine={false} 
                                                                tick={{fontSize: 11, fill: 'hsl(var(--foreground))'}} 
                                                                minTickGap={40}
                                                                dy={10}
                                                                tickFormatter={(value) => new Date(value).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            />
                                                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: 'hsl(var(--foreground))'}} width={40} />
                                                            <Tooltip content={<CustomTooltipLive />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }} />
                                                            <Area 
                                                                type="monotone" 
                                                                dataKey="Produzione" 
                                                                stroke="#22c55e" 
                                                                strokeWidth={2.5}
                                                                fill={`url(#prod_${plant.id})`} 
                                                                animationDuration={1500}
                                                                activeDot={{ r: 6, strokeWidth: 0, fill: '#22c55e' }}
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="Consumo"
                                                                stroke="#ef4444"
                                                                strokeWidth={2.5}
                                                                fill={`url(#cons_${plant.id})`}
                                                                animationDuration={1500}
                                                                activeDot={{ r:6, strokeWidth: 0, fill: '#ef4444' }}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            ) : (
                                                <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground/40 gap-2 pb-6">
                                                    <Activity className="h-8 w-8" />
                                                    <p className="text-sm font-medium">Nessun dato recente</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

// --- TOOLTIP & KPI HELPERS ---
const CustomTooltipLive = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const fullDateIso = payload[0].payload.timestamp_full;
        let dateLabel = label;
        if (fullDateIso) {
            const d = new Date(fullDateIso);
            dateLabel = d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
        }
        return (
            <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
                <p className="mb-1 text-xs font-semibold text-card-foreground uppercase tracking-wide">{dateLabel}</p>
                <div className="flex flex-col gap-1.5">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }}/>
                            <span className="text-sm font-medium text-muted-foreground capitalize">{entry.name}:</span>
                            <span className="text-sm font-bold text-foreground">{Number(entry.value).toFixed(2)} <span className="text-xs font-normal text-muted-foreground">kW</span></span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

function KpiCard({ title, value, unit, icon: Icon, color, desc }: any) {
    return (
        <Card className="overflow-hidden border-none shadow-md bg-linear-to-br from-card to-muted/20">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold tracking-tight">{value?.toFixed(2)}</span>
                            <span className="text-md font-medium text-muted-foreground">{unit}</span>
                        </div>
                    </div>
                    <div className={cn("p-2 rounded-lg bg-background shadow-sm ring-1 ring-inset ring-gray-900/5", color.replace('text-', 'bg-').replace('500', '000'))}>
                         <Icon className={cn("h-6 w-6", color)} />
                    </div>
                </div>
                {desc && <p className="mt-4 text-xs text-muted-foreground/80">{desc}</p>}
            </CardContent>
        </Card>
    );
}