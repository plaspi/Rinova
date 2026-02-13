import { useState } from "react";
import { SidebarTrigger } from "@/components/sidebar/sidebarLayout"
import { NavLayout } from "@/components/nav/navLayout"
import { ModeToggle } from "@/components/modeToggle"
import { PlantsTable } from "@/components/tables/plants-table" 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, Activity, BatteryCharging, Loader2, Plus, MapPin, Leaf } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { supabase } from "@/services/supabase_client";
import { useAuth } from "@/context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// --- IMPORT PER LA MAPPA (OpenStreetMap) ---
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icone Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Componente click mappa
function LocationMarker({ setPos, pos }: { setPos: (lat: string, lng: string) => void, pos: { lat: number, lng: number } | null }) {
    useMapEvents({
        click(e) {
            setPos(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
        },
    });
    return pos ? <Marker position={[pos.lat, pos.lng]} /> : null;
}

type ImpiantoUI = {
    id: string;
    nome: string;
    tipo: string;
    potenza: number;
    stato: string; 
    data_attivazione: string;
    produttore: string;
};

export default function PlantsPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);

    const [formData, setFormData] = useState({
        nome: "",
        tipo: "fotovoltaico",
        potenza: "",
        produttore: "",
        data_attivazione: "",
        codice_pod: "",
        serial_inverter: "",
        tensione: "230", 
        convenzione: "SSP", 
        latitudine: "",
        longitudine: ""
    });

    const { data: impianti = [], isLoading } = useQuery({
        queryKey: ['plants-list', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('impianti')
                .select('*')
                .eq('user_id', user?.id);

            if (error) throw error;
            return (data || []).map((row: any) => ({
                ...row,
                stato: row.status, 
            })) as ImpiantoUI[];
        },
        enabled: !!user?.id,
    });

    const createPlantMutation = useMutation({
        mutationFn: async (newPlant: any) => {
            const payload = {
                user_id: user?.id,
                nome: newPlant.nome,
                tipo: newPlant.tipo,
                potenza: parseFloat(newPlant.potenza),
                produttore: newPlant.produttore,
                data_attivazione: newPlant.data_attivazione,
                status: 'attivo',
                codice_pod: newPlant.codice_pod,
                serial_inverter: newPlant.serial_inverter,
                tensione: newPlant.tensione,
                convenzione: newPlant.convenzione,
                latitudine: newPlant.latitudine ? parseFloat(newPlant.latitudine) : null,
                longitudine: newPlant.longitudine ? parseFloat(newPlant.longitudine) : null,
            };

            const { error } = await supabase.from('impianti').insert(payload);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plants-list'] });
            toast.success("Impianto creato", { description: "Il dispositivo è stato aggiunto correttamente." });
            setIsAddOpen(false);
            setFormData({
                nome: "", tipo: "fotovoltaico", potenza: "", produttore: "", data_attivazione: "",
                codice_pod: "", serial_inverter: "", tensione: "230", convenzione: "SSP",
                latitudine: "", longitudine: ""
            });
        },
        onError: (error: any) => {
            console.error(error);
            toast.error("Errore salvataggio", { description: "Verifica i dati inseriti." });
        }
    });

    const handleNewImpianto = () => {
        if (!formData.nome || !formData.potenza || !formData.codice_pod) {
            toast.warning("Dati mancanti", { description: "Inserisci almeno Nome, Potenza e POD." });
            return;
        }
        createPlantMutation.mutate(formData);
    };

    const handleMapClick = (lat: string, lng: string) => {
        setFormData(prev => ({ ...prev, latitudine: lat, longitudine: lng }));
    };

    const kpi = {
        potenzaTotale: impianti.reduce((acc, curr) => acc + (curr.potenza || 0), 0).toFixed(2),
        attivi: impianti.filter(i => i.stato === 'attivo').length,
        batteriaTotale: 0 
    };

    return (
        <main className="flex-1 flex flex-col min-h-screen bg-background animate-in fade-in">
            <NavLayout className="sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur-md flex items-center px-6 gap-4 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="bg-card!" />
                    <div className="h-6 w-px bg-border/60 mx-2 hidden md:block" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem><BreadcrumbLink href="/home">Rinova</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem><BreadcrumbPage>I Miei Impianti</BreadcrumbPage></BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="flex items-center gap-3"><ModeToggle /></div>
            </NavLayout>

            <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
                
                {/* HEADER - SOLO TESTO, NESSUN BOTTONE QUI */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl! font-bold tracking-tight flex items-center gap-2">
                            <Leaf className="h-8 w-8 text-primary" />
                            Gestione Impianti
                            </h1>
                        <p className="text-muted-foreground mt-1">
                            Configura i tuoi dispositivi di produzione e accumulo.
                        </p>
                    </div>
                </div>

                {/* KPI CARDS */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Potenza Installata</CardTitle>
                            <Zap className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{isLoading ? "..." : `${kpi.potenzaTotale} kW`}</div>
                            <p className="text-xs text-muted-foreground">Totale nominale</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Impianti Attivi</CardTitle>
                            <Activity className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? "..." : kpi.attivi} <span className="text-muted-foreground text-base font-normal">/ {impianti.length}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Dispositivi operativi</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Capacità Batteria</CardTitle>
                            <BatteryCharging className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpi.batteriaTotale} kWh</div>
                            <p className="text-xs text-muted-foreground">Storage disponibile</p>
                        </CardContent>
                    </Card>
                </div>

                {/* SEZIONE TABELLA - QUI C'È L'UNICO BOTTONE */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                         <h3 className="text-lg font-semibold">Lista Dispositivi</h3>
                         
                         {/* BOTTONE UNICO PER NUOVO IMPIANTO */}
                         <Button onClick={() => setIsAddOpen(true)} className="gap-2 shadow-sm h-9hover:border-yellow-500! text-foreground! bg-card!">
                            <Plus className="h-4 w-4" /> Nuovo Impianto
                         </Button>
                    </div>
                    
                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <PlantsTable data={impianti} />
                    )}
                </div>
            </div>

            {/* MODALE DIALOG */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:text-primary! 
                    [&>button]:bg-background!
                    [&>button]:hover:text-red-700!
                    [&>button]:hover:border-transparent!
                    [&>button]:text-frontground!
                    [&>button]:hover:outline-none!
                    [&>button]:transition-none!
                    [&>button]:active:border-transparent!
                    [&>button]:border-none!
                    [&>button]:focus:ring-0! 
                    [&>button]:focus:ring-offset-0! 
                    [&>button]:focus:outline-none! 
                    [&>button]:focus-visible:ring-0!
                    ">
                    <DialogHeader>
                        <DialogTitle>Registra Nuovo Impianto</DialogTitle>
                        <DialogDescription>Compila i dati tecnici richiesti per la connessione alla rete.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-6 py-4">
                        {/* 1. DATI GENERALI */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Identificazione</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome Impianto *</Label>
                                    <Input id="nome" placeholder="Es. Tetto Abitazione" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tipo">Tipologia Fonte</Label>
                                    <Select value={formData.tipo} onValueChange={v => setFormData({...formData, tipo: v})}>
                                        <SelectTrigger className="bg-background! hover:border-transparent!"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fotovoltaico">Fotovoltaico (Solare)</SelectItem>
                                            <SelectItem value="eolico">Eolico</SelectItem>
                                            <SelectItem value="termico">Termico</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="produttore">Produttore / Marca</Label>
                                    <Input id="produttore" placeholder="Es. SunPower, Tesla" value={formData.produttore} onChange={e => setFormData({...formData, produttore: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="data">Data Attivazione</Label>
                                    <Input id="data" type="date" value={formData.data_attivazione} onChange={e => setFormData({...formData, data_attivazione: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        {/* 2. DATI TECNICI & RETE */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Parametri di Rete</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pod">Codice POD *</Label>
                                    <Input id="pod" placeholder="IT001E..." value={formData.codice_pod} onChange={e => setFormData({...formData, codice_pod: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="potenza">Potenza Nominale (kW) *</Label>
                                    <Input id="potenza" type="number" placeholder="Es. 6.0" value={formData.potenza} onChange={e => setFormData({...formData, potenza: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="serial">Seriale Inverter</Label>
                                    <Input id="serial" placeholder="SN-XXXX-YYYY" value={formData.serial_inverter} onChange={e => setFormData({...formData, serial_inverter: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tensione">Tensione Lavoro</Label>
                                    <Select value={formData.tensione} onValueChange={v => setFormData({...formData, tensione: v})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="230">Monofase (230V)</SelectItem>
                                            <SelectItem value="400">Trifase (400V)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="convenzione">Convenzione GSE</Label>
                                    <Select value={formData.convenzione} onValueChange={v => setFormData({...formData, convenzione: v})}>
                                        <SelectTrigger className="bg-background! hover:border-transparent!"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SSP">Scambio sul Posto (SSP)</SelectItem>
                                            <SelectItem value="RID">Ritiro Dedicato (RID)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* 3. GEOLOCALIZZAZIONE (MAPPA OPENSTREETMAP) */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground border-b pb-2 flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Geolocalizzazione
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Latitudine</Label>
                                    <Input type="number" value={formData.latitudine} readOnly placeholder="Seleziona sulla mappa" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Longitudine</Label>
                                    <Input type="number" value={formData.longitudine} readOnly placeholder="Seleziona sulla mappa" />
                                </div>
                            </div>
                            
                            <div className="h-64 w-full rounded-lg overflow-hidden border border-border shadow-inner relative z-0">
                                <MapContainer 
                                    center={[41.9028, 12.4964]} // Default Roma
                                    zoom={5} 
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <LocationMarker 
                                        setPos={handleMapClick} 
                                        pos={formData.latitudine ? { lat: parseFloat(formData.latitudine), lng: parseFloat(formData.longitudine) } : null} 
                                    />
                                </MapContainer>
                            </div>
                            <p className="text-xs text-muted-foreground">* Clicca sulla mappa per impostare la posizione esatta dell'impianto.</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" className="border-2! hover:border-primary!" onClick={() => setIsAddOpen(false)}>Annulla</Button>
                        <Button variant="outline" className="border-2! hover:border-yellow-500!" onClick={handleNewImpianto} disabled={createPlantMutation.isPending}>
                            {createPlantMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salva Impianto
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}