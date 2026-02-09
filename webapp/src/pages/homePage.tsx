import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/sidebar/sidebarLayout"
import { NavLayout } from "@/components/nav/navLayout"
import { ModeToggle } from "@/components/modeToggle"
import { supabase } from "@/services/supabase_client"; 
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Lock, Sparkles, Pencil, Leaf, Zap, Plug, BatteryLow, BatteryMedium, BatteryFull, CheckCircle2, Wrench, XCircle } from "lucide-react"; 
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, } from "@/components/ui/breadcrumb"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_BASE_URL } from "@/services/api_config";

interface DashboardData {
  produzione: number;
  consumo: number;
  batteria: number;
  risparmio_co2: number;
  trend_produzione: string;
  trend_consumo: string;
}

interface PlantSimple {
    id: string;
    nome: string;
    status: 'attivo' | 'manutenzione' | 'offline';
}

export default function HomePage() {
    const { isPro } = useAuth();
    const navigate = useNavigate();

    // Query per KPI
    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_BASE_URL}/api/dashboard/summary`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
            if (!res.ok) throw new Error("Errore fetch KPI");
            return res.json() as Promise<DashboardData>;
        }
    });

    // Query per Grafico
    const { data: chartData = [], isLoading: isLoadingChart } = useQuery({
        queryKey: ['dashboard-chart'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_BASE_URL}/api/dashboard/chart`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
            if (!res.ok) throw new Error("Errore fetch Grafico");
            return res.json();
        }
    });

    // Query lista impianti
    const { data: plantsList = [], isLoading: isLoadingPlants } = useQuery({
        queryKey: ['dashboard-plants'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_BASE_URL}/api/dashboard/plants`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
            if (!res.ok) throw new Error("Errore fetch Lista Impianti");
            return res.json() as Promise<PlantSimple[]>;
        }
    });

    const handleEditWidgets = () => {
        if (!isPro) {
            toast("Sblocca Rinova Energy Pro", {
                description: "Sblocca il piano Pro per modificare, nascondere o riordinare i widget.",
                icon: <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" />,
                action: { label: "Vedi Piani", onClick: () => navigate("/subscription") },
            });
            return;
        }
        toast.info("Modalità modifica attiva", { description: "Funzionalità drag & drop in arrivo..." });
    };

    const viewData = stats || {
        produzione: 0, consumo: 0, batteria: 0, risparmio_co2: 0,
        trend_produzione: "--", trend_consumo: "--"
    };

    // --- LOGICA BATTERIA DINAMICA ---
    const getBatteryConfig = (level: number) => {
        if (level < 30) return { icon: BatteryLow, color: "text-red-500" };
        if (level < 90) return { icon: BatteryMedium, color: "text-yellow-500" };
        return { icon: BatteryFull, color: "text-green-500" };
    };
    
    const batConfig = getBatteryConfig(viewData.batteria);

    return (
        <main className="flex-1 flex flex-col min-h-screen bg-background animate-in fade-in transition-all duration-300">
            <NavLayout className="sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur-md flex items-center px-6 gap-4 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="bg-card!" />
                    <div className="h-6 w-px bg-border/60 mx-2 hidden md:block" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="#">Rinova</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Dashboard</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="flex items-center gap-3">
                    <ModeToggle />
                </div>
            </NavLayout>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl! font-bold tracking-tight">Panoramica Energetica</h1>
                    <Button 
                        variant={isPro ? "outline" : "secondary"}
                        onClick={handleEditWidgets}
                        className="gap-2 shadow-sm bg-card!"
                    >
                        {!isPro ? <Lock className="h-4 w-4 text-amber-600 opacity-80" /> : <Pencil className="h-4 w-4" />}
                        Modifica Widget
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <HomeKpiCard 
                        title="Produzione Oggi" 
                        value={`${viewData.produzione}`} 
                        unit="kWh"
                        trend={viewData.trend_produzione} 
                        desc="rispetto a ieri"
                        icon={Zap}
                        color="text-yellow-500"
                        loading={isLoadingStats}
                    />
                    <HomeKpiCard 
                        title="Consumo" 
                        value={`${viewData.consumo}`} 
                        unit="kWh"
                        trend={viewData.trend_consumo}
                        desc="rispetto a ieri"
                        icon={Plug}
                        color="text-blue-500"
                        inverseTrend={true}
                        loading={isLoadingStats}
                    />
                    <HomeKpiCard 
                        title="Batteria" 
                        value={`${viewData.batteria}`} 
                        unit="%"
                        desc={viewData.batteria > 0 ? "In standby" : "Non collegata"}
                        icon={batConfig.icon}
                        color={batConfig.color}
                        loading={isLoadingStats}
                    />
                    <HomeKpiCard 
                        title="Risparmio CO2" 
                        value={`${viewData.risparmio_co2}`} 
                        unit="kg"
                        desc="Questa settimana"
                        icon={Leaf}
                        color="text-emerald-500"
                        loading={isLoadingStats}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-7 lg:h-100">
                    <div className="col-span-4 rounded-xl border bg-card p-6 shadow-sm flex flex-col">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            Andamento (Ultime 4 Ore)
                            {isLoadingChart && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                        </h3>
                        
                        <div className="flex-1 min-h-0 w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="ora" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }} />
                                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                        <Area type="monotone" dataKey="produzione" name="Produzione" stroke="#22c55e" fillOpacity={1} fill="url(#colorProd)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="consumo" name="Consumo" stroke="#ef4444" fillOpacity={1} fill="url(#colorCons)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                                    {isLoadingChart ? "Caricamento dati..." : "Nessun dato recente"}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-3 rounded-xl border bg-card p-0 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-6 pb-2">
                             <h3 className="font-semibold text-lg flex items-center justify-between">
                                Stato Impianti
                                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                    {plantsList.length} Totali
                                </span>
                             </h3>
                        </div>

                        <ScrollArea className="flex-1 p-6 pt-2">
                            {isLoadingPlants ? (
                                <div className="flex flex-col gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-14 w-full bg-muted/20 animate-pulse rounded-lg" />
                                    ))}
                                </div>
                            ) : plantsList.length > 0 ? (
                                <div className="space-y-3">
                                    {plantsList.map((plant) => (
                                        <PlantListItem key={plant.id} plant={plant} />
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed p-8">
                                    <Leaf className="h-8 w-8 opacity-20 mb-2" />
                                    <p className="text-sm">Nessun impianto collegato</p>
                                </div>
                            )}
                        </ScrollArea>
                    </div>  
                </div>
            </div>
        </main>
    )
}

function PlantListItem({ plant }: { plant: PlantSimple }) {
    const status = plant.status.toLowerCase();
    
    let icon = <CheckCircle2 className="h-4 w-4 text-green-500" />;
    let statusClass = "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    let label = "Attivo";

    if (status === 'offline') {
        icon = <XCircle className="h-4 w-4 text-red-500" />;
        statusClass = "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
        label = "Offline";
    } else if (status === 'manutenzione') {
        icon = <Wrench className="h-4 w-4 text-yellow-500" />;
        statusClass = "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
        label = "Manutenzione";
    }

    return (
        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors group">
            <div className="flex items-center gap-3">
                <div className={cn("flex items-center justify-center w-8 h-8 rounded-full border", statusClass.replace("text-", "bg-opacity-0 "))}>
                    {icon}
                </div>
                <div className="flex flex-col">
                    <span className="font-medium text-sm leading-none group-hover:text-primary transition-colors">
                        {plant.nome}
                    </span>
                </div>
            </div>
            <div className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border", statusClass)}>
                {label}
            </div>
        </div>
    )
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border p-3 rounded-lg shadow-xl text-sm">
                <p className="font-semibold mb-2 text-foreground">{label}</p>
                <div className="flex flex-col gap-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-muted-foreground capitalize">{entry.name}:</span>
                            <span className="font-bold text-foreground">{entry.value} kW</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

// --- COMPONENTE KPI UNIFICATO ---
function HomeKpiCard({ 
    title, 
    value, 
    unit,
    trend, 
    desc, // Nuova prop: descrizione fissa (es: "rispetto a ieri" o "Questa settimana")
    icon: Icon, 
    color,
    inverseTrend = false,
    loading = false
}: { 
    title: string, 
    value: string, 
    unit?: string,
    trend?: string, 
    desc?: string,
    icon: any, 
    color: string,
    inverseTrend?: boolean,
    loading?: boolean
}) {
    // Logica colori trend
    let trendColor = "text-muted-foreground";

    if (trend && trend !== "--" && trend !== "") {
        if (trend.includes('+')) {
            trendColor = inverseTrend ? "text-red-500" : "text-green-500";
        } else if (trend.includes('-')) {
            trendColor = inverseTrend ? "text-green-500" : "text-red-500";
        }
    }

    return (
        <Card className="overflow-hidden border-none shadow-md bg-linear-to-br from-card to-muted/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold tracking-tight">
                                {loading ? "..." : value}
                            </span>
                            {unit && <span className="text-md font-medium text-muted-foreground">{unit}</span>}
                        </div>
                    </div>
                    <div className={cn(
                        "p-2 rounded-lg bg-background shadow-sm ring-1 ring-inset ring-gray-900/5", 
                        color.replace('text-', 'bg-').replace('500', '000')
                    )}>
                         <Icon className={cn("h-6 w-6", color)} />
                    </div>
                </div>
                
                {/* FOOTER DELLA CARD */}
                <div className="mt-4 flex items-center text-sm">
                    {/* Caso A: C'è un trend -> Mostra trend colorato + descrizione */}
                    {trend && trend !== "--" && trend !== "" ? (
                        <>
                            <span className={cn("font-medium", trendColor)}>
                                {trend}
                            </span>
                            {desc && <span className="text-muted-foreground opacity-90 ml-1">{desc}</span>}
                        </>
                    ) : (
                        /* Caso B: Niente trend -> Mostra solo descrizione (es. CO2, Batteria) */
                        <span className="text-muted-foreground opacity-80">
                            {desc || "Dato aggiornato"}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}