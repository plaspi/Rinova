import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/sidebar/sidebarLayout";
import { NavLayout } from "@/components/nav/navLayout";
import { ModeToggle } from "@/components/modeToggle";
import { useNavigate } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Loader2, Leaf, Zap, Trophy, Activity, TrendingUp, Calendar as CalendarIcon, Download, Sparkles, Lock } from "lucide-react";
import { supabase } from "@/services/supabase_client";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/context/authContext";
import { useQuery } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";
import { API_BASE_URL } from "@/services/api_config";

const DAYS_FULL_IT: Record<string, string> = {
    'Lun': 'Lunedì', 'Mar': 'Martedì', 'Mer': 'Mercoledì', 'Gio': 'Giovedì',
    'Ven': 'Venerdì', 'Sab': 'Sabato', 'Dom': 'Domenica'
};

const MONTHS_FULL_IT: Record<string, string> = {
    'Gen': 'Gennaio', 'Feb': 'Febbraio', 'Mar': 'Marzo', 'Apr': 'Aprile',
    'Mag': 'Maggio', 'Giu': 'Giugno', 'Lug': 'Luglio', 'Ago': 'Agosto',
    'Set': 'Settembre', 'Ott': 'Ottobre', 'Nov': 'Novembre', 'Dic': 'Dicembre'
};

export default function HistoryPage() {
    // --- LOGICA LOCALSTORAGE PER SELECTED PLANT ---
    const [selectedPlant, setSelectedPlant] = useState<string>(() => {
        return localStorage.getItem("last_selected_plant") || "";
    });
    
    const [period, setPeriod] = useState("week");
    const [pdfLoading, setPdfLoading] = useState(false);
    
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    const { isPro } = useAuth();
    const navigate = useNavigate();

    // --- QUERY IMPIANTI ---
    const { data: plants = [] } = useQuery({
        queryKey: ['plants-list'],
        queryFn: async () => {
            const { data } = await supabase.from('impianti').select('id, nome');
            return data || [];
        }
    });

    // --- SINCRONIZZAZIONE IMPIANTO E LOCALSTORAGE ---
    useEffect(() => {
        if (plants.length > 0) {
            const exists = plants.find(p => p.id === selectedPlant);
            if (!selectedPlant || !exists) {
                const firstId = plants[0].id;
                setSelectedPlant(firstId);
                localStorage.setItem("last_selected_plant", firstId);
            }
        }
    }, [plants, selectedPlant]);

    const handlePlantChange = (id: string) => {
        setSelectedPlant(id);
        localStorage.setItem("last_selected_plant", id);
    };

    // --- QUERY STORICO DATI ---
    const { data: historyData, isLoading: loading } = useQuery({
        queryKey: ['production-history', selectedPlant, period, dateRange],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            let url = `${API_BASE_URL}/api/production/history?plantId=${selectedPlant}&period=${period}`;
            
            if (period === 'custom' && dateRange?.from && dateRange?.to) {
                const startStr = format(dateRange.from, 'yyyy-MM-dd');
                const endStr = format(dateRange.to, 'yyyy-MM-dd');
                url += `&startDate=${startStr}&endDate=${endStr}`;
            }

            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error("Errore nel caricamento dello storico");
            return res.json();
        },
        enabled: !!selectedPlant && selectedPlant !== "" && (period !== 'custom' || (!!dateRange?.from && !!dateRange?.to))
    });

    const chartData = historyData?.chart || [];
    const kpi = historyData?.kpi || { totalEnergy: 0, co2: 0, peakValue: 0, peakTime: "-", efficiency: 0 };

    const handleTabChange = (val: string) => {
        if (val === 'custom' && !isPro) {
            toast("Sblocca Rinova Energy Pro", {
                id: "pro-lock-custom",
                description: "Per usufruire dell'analisi personalizzata esegui l'upgrade al piano Pro.",
                icon: <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" />,
                action: {
                    label: "Vedi Piani",
                    onClick: () => navigate("/subscription")
                },
            });
            return;
        }
        setPeriod(val);
    };

    const handleDownloadPdf = async () => {
        if (!isPro) {
            toast("Esegui l'upgrade al Piano Pro", {
                id: "pro-lock-pdf",
                description: "Sblocca la reportistica PDF illimitata",
                icon: <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" />,
                action: {
                    label: "Upgrade",
                    onClick: () => navigate("/subscription")
                },
            });
            return;
        }

        setPdfLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) { setPdfLoading(false); return; }
        
        let url = `${API_BASE_URL}/api/report/download?plantId=${selectedPlant}&period=${period}`;
        if (period === 'custom' && dateRange?.from && dateRange?.to) {
             const startStr = format(dateRange.from, 'yyyy-MM-dd');
             const endStr = format(dateRange.to, 'yyyy-MM-dd');
             url += `&startDate=${startStr}&endDate=${endStr}`;
        }
        
        try {
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if(res.ok) {
                const blob = await res.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `Report_Rinova_${period}_${format(new Date(), 'yyyyMMdd')}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (e) {
            console.error("Errore download:", e);
        } finally {
            setPdfLoading(false);
        }
    };

    const formatPeakTime = (shortLabel: string) => {
        if (!shortLabel) return "-";
        if (period === 'week' && DAYS_FULL_IT[shortLabel]) return DAYS_FULL_IT[shortLabel];
        if (period === 'year' && MONTHS_FULL_IT[shortLabel]) return MONTHS_FULL_IT[shortLabel];
        return shortLabel;
    };

    return (
        <div className="flex flex-col h-full w-full bg-background">
            
            <NavLayout className="sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur-md flex items-center px-6 gap-4 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="bg-card!" />
                    <Breadcrumb className="hidden md:flex">
                        <BreadcrumbList>
                            <BreadcrumbItem><BreadcrumbLink href="/home">Rinova</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem><BreadcrumbPage>Storico</BreadcrumbPage></BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedPlant} onValueChange={handlePlantChange}>
                        <SelectTrigger className="w-50 h-9 bg-card! shadow-sm border-input">
                            <SelectValue placeholder="Seleziona Impianto" />
                        </SelectTrigger>
                        <SelectContent>
                            {plants.map((p: any) => (
                                <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <ModeToggle />
                </div>
            </NavLayout>

            <div className="flex-1 p-6 space-y-8 overflow-y-auto">
                
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
                    <div>
                        <h1 className="text-4xl! font-bold tracking-tight flex items-center gap-2 mb-1">
                            <TrendingUp className="h-8 w-8 text-primary" />
                            Analisi Produzione
                        </h1>
                        <p className="text-muted-foreground">Monitoraggio performance e reportistica avanzata.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                        <div className="flex flex-wrap items-center gap-2 bg-muted/40 p-1.5 rounded-xl border shadow-sm">
                            <Tabs value={period} onValueChange={handleTabChange} className="h-9">
                                <TabsList className="h-full bg-transparent p-0 gap-1">
                                    <TabsTrigger value="week" className="h-8 px-3 bg-card! rounded-lg data-[state=active]:bg-background! data-[state=active]:shadow-sm">Settimana</TabsTrigger>
                                    <TabsTrigger value="month" className="h-8 px-3 bg-card! rounded-lg data-[state=active]:bg-background! data-[state=active]:shadow-sm">Mese</TabsTrigger>
                                    <TabsTrigger value="year" className="h-8 px-3 bg-card! rounded-lg data-[state=active]:bg-background! data-[state=active]:shadow-sm">Anno</TabsTrigger>
                                    <TabsTrigger value="custom" className="h-8 px-3 bg-card! rounded-lg data-[state=active]:bg-background! data-[state=active]:shadow-sm gap-1.5">
                                        Custom
                                        {!isPro && <Lock className="h-3 w-3 text-amber-500 opacity-70" />}
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {period === 'custom' && (
                                <>
                                    <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-8 border-dashed border-input bg-card!">
                                                <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-70" />
                                                {dateRange?.from ? (dateRange.to ? <>{format(dateRange.from, "dd MMM", {locale:it})} - {format(dateRange.to, "dd MMM", {locale:it})}</> : format(dateRange.from, "dd MMM", {locale:it})) : "Date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="end">
                                            <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={it} />
                                        </PopoverContent>
                                    </Popover>
                                </>
                            )}
                        </div>

                        <Button 
                            variant="outline" 
                            onClick={handleDownloadPdf} 
                            disabled={pdfLoading || loading}
                            className="h-12 sm:h-12 px-4 shadow-sm bg-card! border-primary/20 hover:bg-primary/5 hover:text-primary transition-all gap-2 min-w-35"
                        >
                            {pdfLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    <span>Scarica Report</span>
                                    {!isPro && <Lock className="h-3.5 w-3.5 text-amber-500 ml-1" />}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {loading && chartData.length === 0 ? (
                     <div className="h-125 w-full flex flex-col items-center justify-center gap-4 text-muted-foreground bg-muted/5 border border-dashed rounded-xl animate-pulse">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
                        <p className="text-sm font-medium">Aggiornamento analisi...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                            <KpiCard title="Energia Prodotta" value={kpi.totalEnergy} unit="kWh" icon={Zap} color="text-yellow-500" desc={`Totale nel periodo`} />
                            <KpiCard title="CO₂ Evitata" value={kpi.co2} unit="kg" icon={Leaf} color="text-green-500" desc="Fattore ISPRA: 0.225 kg/kWh" />
                            <KpiCard title={period === 'year' ? "Miglior Mese" : "Miglior Giornata"} value={kpi.peakValue} unit="kWh" icon={Trophy} color="text-blue-500" desc={`Registrato: ${formatPeakTime(kpi.peakTime)}`} />
                            <KpiCard title="Performance" value={kpi.efficiency} unit="%" icon={Activity} color="text-purple-500" desc="Rispetto al teorico stimato" />
                        </div>

                        <Card className="shadow-sm border border-border/50 animate-in fade-in duration-300">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Andamento Produzione</CardTitle>
                                        <CardDescription>
                                            {period === 'week' && "Analisi giornaliera ultimi 7 giorni"}
                                            {period === 'month' && "Analisi giornaliera ultimi 30 giorni"}
                                            {period === 'year' && "Analisi mensile anno corrente"}
                                            {period === 'custom' && "Analisi dettagliata periodo personalizzato"}
                                        </CardDescription>
                                    </div>
                                    <div className="px-2.5 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {period === 'custom' ? 'Custom' : period}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="h-100 w-full pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9}/>
                                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip period={period} />} cursor={{ fill: 'var(--muted)', opacity: 0.2 }} />
                                        <Bar dataKey="Produzione" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={50} animationDuration={1000} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}

const CustomTooltip = ({ active, payload, label, period }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const value = payload[0].value;
        const fullDateIso = data.full_date;
        let formattedDate = label;
        if (fullDateIso) {
            const dateObj = new Date(fullDateIso);
            const options: Intl.DateTimeFormatOptions = (period === 'year' || (period === 'custom' && label.length < 4))
                ? { month: 'long', year: 'numeric' }
                : { weekday: 'long', day: 'numeric', month: 'long' };
            const rawDate = new Intl.DateTimeFormat('it-IT', options).format(dateObj);
            formattedDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
        }
        return (
            <div className="rounded-lg border border-border bg-popover p-3 shadow-xl">
                <p className="mb-1 text-sm font-semibold text-popover-foreground">{formattedDate}</p>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Produzione:</span>
                    <span className="text-sm font-bold text-foreground">{Number(value).toFixed(2)} kWh</span>
                </div>
            </div>
        );
    }
    return null;
};

function KpiCard({ title, value, unit, icon: Icon, color, desc }: any) {
    return (
        <Card className="overflow-hidden border-none shadow-md bg-linear-to-br from-card to-muted/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold tracking-tight">{typeof value === 'number' ? value.toFixed(2) : value}</span>
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