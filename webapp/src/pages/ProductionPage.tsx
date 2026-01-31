import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/sidebar/sidebarLayout";
import { NavLayout } from "@/components/nav/navLayout";
import { ModeToggle } from "@/components/modeToggle";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RefreshCcw, Loader2, Zap, Activity, TrendingUp, Lock, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/services/supabase_client";
import { useAuth } from "@/context/authContext";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = "http://127.0.0.1:8000/api";

export default function ProductionPage() {
    const { isPro } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [pdfLoading, setPdfLoading] = useState(false);

    // --- QUERY UNICA PER I DATI (Sostituisce fetchDashboard e useEffect) ---
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboard-live'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            const response = await fetch(`${API_URL}/production/live`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error("Errore caricamento dati");
            return response.json();
        },
        refetchInterval: 300000, // Aggiornamento automatico ogni 5 minuti come avevi prima
    });

    // Funzione refresh manuale che usa TanStack
    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-live'] });
    };

    const handleDownloadReport = async () => {
        if (!isPro) {
            toast("Reportistica Avanzata", {
                id: "pro-lock-live",
                description: "Il download dei report Live è riservato al piano Pro.",
                icon: <Lock className="h-5 w-5 text-amber-500" />,
                action: { label: "Upgrade", onClick: () => navigate("/settings/plans") },
            });
            return;
        }

        setPdfLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const res = await fetch(`${API_URL}/report/download?period=live&plantId=summary`, { 
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

    const { kpi, charts, plants } = dashboardData || { 
        kpi: { peak: 0, totalEnergy: 0, avgPower: 0 }, 
        charts: {}, 
        plants: [] 
    };

    return (
        <main className="flex-1 flex flex-col min-h-screen w-full overflow-y-auto transition-all duration-300">
            <NavLayout className="sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur-md flex items-center px-6 gap-4 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="bg-card!" />
                    <Breadcrumb className="hidden md:flex">
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
                        <h1 className="text-4xl! font-bold tracking-tight text-foreground">Impianti Live</h1>
                        <p className="text-muted-foreground mt-1">
                            Panoramica in tempo reale delle ultime <span className="font-semibold text-primary">24 ore</span>.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2"> 
                        <Button variant="outline" size="lg" onClick={handleRefresh} disabled={isLoading} className="gap-2 bg-card! text-foregroung!">
                            <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                            Aggiorna
                        </Button>
                        <Button 
                            variant="default" 
                            size="lg" 
                            onClick={handleDownloadReport} 
                            disabled={pdfLoading || isLoading}
                            className="gap-2 bg-card! hover:bg-primary/90 text-foreground!"
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

                {isLoading && !dashboardData ? (
                    <div className="flex h-96 items-center justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {plants.map((plant: any) => (
                            <Card key={plant.id} className="shadow-lg border-t-4 border-t-primary overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <CardHeader className="pb-2 bg-muted/5">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg font-semibold">{plant.nome}</CardTitle>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-200">
                                            <span className="relative flex h-2 w-2">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="h-70 w-full mt-4 pr-4">
                                        {charts[plant.id] && charts[plant.id].length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={charts[plant.id]}>
                                                    <defs>
                                                        <linearGradient id={`grad_${plant.id}`} x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} stroke="#888" />
                                                    <XAxis 
                                                        dataKey="timestamp_full" 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        tick={{fontSize: 11, fill: '#666'}} 
                                                        minTickGap={40}
                                                        dy={10}
                                                        tickFormatter={(value) => new Date(value).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    />
                                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#666'}} width={40} />
                                                    <Tooltip content={<CustomTooltipLive />} cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }} />
                                                    <Area 
                                                        type="monotone" 
                                                        dataKey="Produzione" 
                                                        stroke="#ca8a04" 
                                                        strokeWidth={2.5}
                                                        fill={`url(#grad_${plant.id})`} 
                                                        animationDuration={1500}
                                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#ca8a04' }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground/40 gap-2">
                                                <Activity className="h-8 w-8" />
                                                <p className="text-sm font-medium">Nessun dato recente</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

// --- TOOLTIP LIVE CUSTOM (Invariato) ---
const CustomTooltipLive = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const fullDateIso = payload[0].payload.timestamp_full;
        const value = payload[0].value;
        let dateLabel = label;
        if (fullDateIso) {
            const d = new Date(fullDateIso);
            dateLabel = d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
        }
        return (
            <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
                <p className="mb-1 text-xs font-semibold text-card-foreground uppercase tracking-wide">{dateLabel}</p>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="text-sm font-medium text-muted-foreground">Potenza:</span>
                    <span className="text-lg font-bold text-foreground">{Number(value).toFixed(2)} <span className="text-xs font-normal text-muted-foreground">kW</span></span>
                </div>
            </div>
        );
    }
    return null;
};

// --- KPI CARD (Invariato) ---
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