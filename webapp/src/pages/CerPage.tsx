import { useState } from "react"
import { SidebarTrigger } from "@/components/sidebar/sidebarLayout"
import { NavLayout } from "@/components/nav/navLayout"
import { ModeToggle } from "@/components/modeToggle"
import { MembersTable } from "@/components/tables/members-table" 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
    Bell, Users, PlusCircle, Leaf, Crown, 
    Mail, Pin, Search, CalendarRange,
    ChevronLeft, ChevronRight, X, Trash2,
} from "lucide-react"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { supabase } from "@/services/supabase_client"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// --- TYPES ---
type Annuncio = {
    id: number;
    titolo: string;
    messaggio: string;
    tipo: 'info' | 'alert' | 'manutenzione' | 'evento';
    created_at: string;
    is_pinned: boolean;
    author_id: string;
    users?: {
        name: string;
        surname: string;
        avatar_url?: string;
    }
};

export type MemberData = {
    id: string;
    nome: string;
    cognome: string;
    email: string;
    ruolo: string;
    stato: 'attivo' | 'sospeso' | 'in_attesa';
    avatar_url: string | null;
    pod?: string | null;
}

// --- SUB-COMPONENTS ---

function AnnouncementItem({ item, onClick }: { item: Annuncio, onClick: () => void }) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('it-IT', {
            day: 'numeric', month: 'short'
        });
    };

    const typeConfig = {
        info: { color: "text-blue-600", bg: "bg-blue-500/10" },
        alert: { color: "text-red-600", bg: "bg-red-500/10" },
        manutenzione: { color: "text-amber-600", bg: "bg-amber-500/10" },
        evento: { color: "text-purple-600", bg: "bg-purple-500/10" },
    };
    const style = typeConfig[item.tipo];

    return (
        <div 
            onClick={onClick}
            className={cn(
                "group relative p-4 border-b border-border/40 last:border-0 hover:bg-muted/40 transition-colors flex flex-col justify-between min-h-25 cursor-pointer",
                item.is_pinned ? "bg-primary/5" : "bg-transparent"
            )}
        >
            <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex items-center gap-2 overflow-hidden">
                    <Badge variant="secondary" className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0 rounded-sm h-5 border-0", style.bg, style.color)}>
                        {item.tipo}
                    </Badge>
                    <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{item.titolo}</h4>
                </div>
                {item.is_pinned && <Pin className="h-3.5 w-3.5 text-primary shrink-0 -rotate-45" />}
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {item.messaggio}
            </p>

            <div className="flex items-center justify-between pt-2 mt-auto">
                <div className="flex items-center gap-2">
                     <Avatar className="h-5 w-5 border border-border/50">
                        <AvatarImage src={item.users?.avatar_url || undefined} />
                        <AvatarFallback className="bg-muted text-[8px]">
                            <Leaf className="h-3 w-3 text-green-600" />
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] font-medium text-muted-foreground truncate max-w-25">
                        {item.users?.name ? `${item.users.name} ${item.users.surname}` : "Amministrazione"}
                    </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                    {formatDate(item.created_at)}
                </span>
            </div>
        </div>
    )
}

function BachecaPaginata({ annunci, canManage, onCreate, onSelect }: { annunci: Annuncio[], canManage: boolean, onCreate: () => void, onSelect: (a: Annuncio) => void }) {
    const [page, setPage] = useState(0);
    const [filterTime, setFilterTime] = useState("all");
    const ITEMS_PER_PAGE = 4;

    const filterLabels: Record<string, string> = {
        "all": "Tutti",
        "30gg": "30 gg",
        "90gg": "3 Mesi"
    };

    const filteredByTime = annunci.filter(a => {
        if (filterTime === "all") return true;
        const days = filterTime === "30gg" ? 30 : 90;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return new Date(a.created_at) >= cutoff;
    });

    const totalPages = Math.ceil(filteredByTime.length / ITEMS_PER_PAGE);
    const paginatedItems = filteredByTime.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const handleNext = () => { if (page < totalPages - 1) setPage(p => p + 1); };
    const handlePrev = () => { if (page > 0) setPage(p => p - 1); };

    return (
        <Card className="border-border/60 shadow-sm flex flex-col h-fit overflow-hidden">
            <CardHeader className="py-3 px-4 border-b bg-muted/10 flex flex-row items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Bell className="h-3.5 w-3.5" /> Bacheca
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <Select value={filterTime} onValueChange={(val) => { setFilterTime(val); setPage(0); }}>
                        <SelectTrigger className="h-8 w-32.5 text-xs bg-background px-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2 truncate">
                                <CalendarRange className="h-3.5 w-3.5 opacity-70 shrink-0" />
                                <span>{filterLabels[filterTime]}</span>
                            </div>
                        </SelectTrigger>
                        <SelectContent align="end" className="bg-card! text-foreground!">
                            <SelectItem value="all">Tutti</SelectItem>
                            <SelectItem value="30gg">Ultimi 30 giorni</SelectItem>
                            <SelectItem value="90gg">Ultimi 90 giorni</SelectItem>
                        </SelectContent>
                    </Select>

                    {(canManage) && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 bg-card! text-foreground!" onClick={onCreate}>
                            <PlusCircle className="h-4 w-4 text-primary" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            
            <div className="flex flex-col bg-card/30">
                {paginatedItems.length > 0 ? (
                    <div className="flex flex-col">
                        {paginatedItems.map((item) => (
                            <AnnouncementItem 
                                key={item.id} 
                                item={item}  
                                onClick={() => onSelect(item)} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground opacity-50 min-h-37.5">
                        <Leaf className="h-8 w-8 mb-2" />
                        <p className="text-xs">Nessun avviso trovato.</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="p-2 border-t bg-muted/5 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground ml-2">Pagina {page + 1} di {totalPages}</span>
                    <div className="flex gap-1">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={handlePrev} disabled={page === 0}>
                            <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={handleNext} disabled={page === totalPages - 1}>
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}

// --- DETAIL MODAL ---

interface AnnouncementDetailProps {
    announcement: Annuncio | null;
    currentUserId: string;
    onClose: () => void;
    onDelete: (id: number) => void;
}

function AnnouncementDetail({ announcement, currentUserId, onClose, onDelete }: AnnouncementDetailProps) {
    if (!announcement) return null;

    const isAuthor = announcement.author_id === currentUserId;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('it-IT', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const typeConfig = {
        info: { color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-200" },
        alert: { color: "text-red-600", bg: "bg-red-500/10", border: "border-red-200" },
        manutenzione: { color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-200" },
        evento: { color: "text-purple-600", bg: "bg-purple-500/10", border: "border-purple-200" },
    };
    const style = typeConfig[announcement.tipo];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="w-full max-w-lg bg-card text-card-foreground border border-border rounded-xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                
                <div className="p-6 border-b flex items-start justify-between bg-muted/10 shrink-0">
                    <div className="space-y-3 pr-8">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border", style.bg, style.color, style.border)}>
                                {announcement.tipo}
                            </Badge>
                            {announcement.is_pinned && <Badge variant="secondary" className="text-[10px] px-2 py-0.5 gap-1"><Pin className="h-3 w-3" /> Fissato</Badge>}
                        </div>
                        <h2 className="text-xl font-bold leading-tight">{announcement.titolo}</h2>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-full">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {announcement.messaggio}
                    </p>
                </div>

                <div className="p-4 border-t bg-muted/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border">
                            <AvatarImage src={announcement.users?.avatar_url || undefined} />
                            <AvatarFallback><Leaf className="h-4 w-4 text-green-600" /></AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold">
                                {announcement.users?.name ? `${announcement.users.name} ${announcement.users.surname}` : "Amministrazione"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                {formatDate(announcement.created_at)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isAuthor && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                                onClick={() => onDelete(announcement.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only sm:not-sr-only">Elimina</span>
                            </Button>
                        )}
                        <Button onClick={onClose} variant="outline" size="sm">Chiudi</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- MAIN PAGE ---

export default function CerPage() {
    const queryClient = useQueryClient();
    
    // States UI
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Annuncio | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    
    // Form States
    const [newAnnuncio, setNewAnnuncio] = useState({
        titolo: "",
        messaggio: "",
        tipo: "info",
        is_pinned: false
    });

    // --- 1. QUERY UTENTE & MEMBERSHIP ---
    const { data: userData, isLoading: isUserLoading } = useQuery({
        queryKey: ['cer-user-status'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;
            
            const { data: membership } = await supabase
                .from('cer_members')
                .select('cer_id, role')
                .eq('user_id', user.id)
                .maybeSingle();

            return {
                id: user.id,
                membership
            };
        }
    });

    const currentUserId = userData?.id || "";
    const membership = userData?.membership;
    const isMember = !!membership;
    const myCerId = membership?.cer_id;
    const currentUserRole = membership?.role || 'member';

    // --- 2. QUERY ANNUNCI (Dipende da myCerId) ---
    const { data: annunci = [] } = useQuery({
        queryKey: ['cer-annunci', myCerId],
        queryFn: async () => {
            const { data } = await supabase
                .from('annunci')
                .select('*, users:author_id(name, surname, avatar_url)')
                .eq('cer_id', myCerId) 
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(50);
            return data as unknown as Annuncio[] || [];
        },
        enabled: !!myCerId, // Parte solo se siamo membri
    });

    // --- 3. QUERY MEMBRI (Dipende da myCerId) ---
    const { data: membri = [] } = useQuery({
        queryKey: ['cer-membri', myCerId],
        queryFn: async () => {
            const { data } = await supabase
                .from('cer_members')
                .select(`
                    user_id, role, status,
                    users:user_id (name, surname, email, avatar_url)
                `)
                .eq('cer_id', myCerId);
            
            if (!data) return [];

            return data.map((row: any) => ({
                id: row.user_id,
                nome: row.users?.name || "Utente",
                cognome: row.users?.surname || "",
                email: row.users?.email || "N/A",
                avatar_url: row.users?.avatar_url || null,
                ruolo: row.role === 'admin' ? 'Amministratore' : row.role === 'representative' ? 'Referente' : 'Membro',
                stato: row.status || 'attivo',
                pod: null 
            })) as MemberData[];
        },
        enabled: !!myCerId,
    });

    // --- MUTATION CREAZIONE ANNUNCIO ---
    const createMutation = useMutation({
        mutationFn: async (annuncio: any) => {
            const { error } = await supabase.from('annunci').insert({
                ...annuncio,
                cer_id: myCerId,
                author_id: currentUserId
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cer-annunci'] });
            toast.success("Annuncio pubblicato!");
            setIsCreateOpen(false);
            setNewAnnuncio({ titolo: "", messaggio: "", tipo: "info", is_pinned: false });
        },
        onError: (e: any) => toast.error("Errore pubblicazione", { description: e.message })
    });

    // --- MUTATION ELIMINAZIONE ANNUNCIO ---
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { data, error } = await supabase
                .from('annunci')
                .delete()
                .eq('id', id)
                .select();
            
            if (error) throw error;
            if (!data || data.length === 0) throw new Error("Annuncio non trovato o permesso negato.");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cer-annunci'] });
            toast.success("Annuncio eliminato.");
            setDeleteId(null);
            setSelectedAnnouncement(null);
        },
        onError: (e: any) => toast.error("Errore eliminazione", { description: e.message })
    });

    const handleCreateAnnouncement = () => {
        if (!newAnnuncio.titolo || !newAnnuncio.messaggio) {
            toast.error("Compila titolo e messaggio");
            return;
        }
        createMutation.mutate(newAnnuncio);
    };

    const executeDelete = () => {
        if (deleteId) deleteMutation.mutate(deleteId);
    };

    const admins = membri.filter(m => m.ruolo === 'Amministratore' || m.ruolo === 'Referente');
    const isAdmin = currentUserRole === 'admin' || currentUserRole === 'representative';
    const isLoading = isUserLoading; // Caricamento principale

    return (
            <main className="flex-1 flex flex-col min-h-screen w-full h-full bg-background animate-in fade-in overflow-y-scroll"> 
                <NavLayout className="sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur-md flex items-center px-6 gap-4 justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="bg-card!" />
                        <div className="h-6 w-px bg-border/60 mx-2 hidden md:block" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem><BreadcrumbLink href="/home">Rinova</BreadcrumbLink></BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem><BreadcrumbPage>Gestione CER</BreadcrumbPage></BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex items-center gap-3"><ModeToggle /></div>
                </NavLayout>

                <div className="flex-1 p-6 md:p-8 space-y-4">
                    
                    <div className="flex flex-col gap-1">
                        <h1 className="text-4xl! font-bold tracking-tight flex items-center gap-2">
                            <Users className="h-8 w-8 text-primary" />
                            Comunità Energetica
                            </h1>
                        <p className="text-muted-foreground">Gestione operativa della CER.</p>
                    </div>

                    {isLoading ? (
                         <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Caricamento...</p>
                         </div>
                    ) : !isMember ? (
                        <div className="max-w-4xl mx-auto mt-10">
                            <Card className="border-dashed border-2 border-primary bg-muted/20">
                                <CardHeader className="text-center">
                                    <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4 w-fit">
                                        <Users className="h-10 w-10 text-primary" />
                                    </div>
                                    <CardTitle className="text-2xl">Non fai ancora parte di una CER</CardTitle>
                                </CardHeader>
                                <CardContent className="grid md:grid-cols-2 gap-6 p-8 pt-2">
                                     <Button className="w-full h-auto py-4 flex flex-col gap-2 bg-brand-gradient! text-background! hover:brightness-110 hover:-translate-y-1 hover:border-transparent!" variant="outline" onClick={() => toast.info("Prossimamente!")}>
                                        <Search className="h-6 w-6" />
                                        <span>Trova CER</span>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            
                            {/* --- COLONNA SINISTRA (8/12) --- */}
                            <div className="lg:col-span-8 flex flex-col gap-6">
                                
                                {/* KPI STRIP */}
                                <div className="flex flex-col md:flex-row gap-4 items-center bg-card border rounded-lg p-3 px-6 shadow-sm">
                                    <div className="flex items-center gap-3 border-r pr-6 mr-2 w-full md:w-auto pb-4 md:pb-0 border-b md:border-b-0">
                                        <div className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Stato Attuale</span>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-foreground">Attiva</h3>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-mono">ID: {myCerId?.slice(0,6)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Crown className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Il Tuo Ruolo</span>
                                            <span className="text-lg font-bold text-foreground capitalize">
                                                {currentUserRole === 'representative' ? 'Referente' : currentUserRole}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {currentUserRole === 'admin' ? 'Gestione completa' : 'Accesso limitato'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* TABELLA MEMBRI */}
                                <Card className="border-border/60 shadow-sm overflow-hidden h-fit">
                                    <CardHeader className="px-6 py-4 border-b bg-muted/5 flex flex-row items-center justify-between">
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <Users className="h-4 w-4 text-primary" /> Elenco Partecipanti
                                        </CardTitle>
                                        <Badge variant="outline" className="text-xs font-medium">
                                            {membri.length} Membri Totali
                                        </Badge>
                                    </CardHeader>
                                    <div className="p-0">
                                         <MembersTable data={membri} currentUserRole={currentUserRole} />
                                    </div>
                                </Card>
                            </div>

                            {/* --- COLONNA DESTRA (4/12) --- */}
                            <div className="lg:col-span-4 flex flex-col gap-6">
                                
                                {/* 1. REFERENTI */}
                                <Card className="border-border/60 shadow-sm shrink-0 h-fit">
                                    <CardHeader className="py-3 px-4 border-b bg-muted/10">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Referenti</span>
                                            <Badge variant="secondary" className="text-[10px] h-5">{admins.length}</Badge>
                                        </div>
                                    </CardHeader>
                                    <div className="p-3 grid gap-2">
                                        {admins.slice(0, 3).map(admin => (
                                            <div key={admin.id} className="flex items-center gap-3 p-1.5 rounded-md hover:bg-muted/40 transition-colors">
                                                <Avatar className="h-8 w-8 border border-border/50">
                                                    <AvatarImage src={admin.avatar_url || undefined} />
                                                    <AvatarFallback className="bg-primary/5">
                                                        <Leaf className="h-4 w-4 text-green-600" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{admin.nome} {admin.cognome}</p>
                                                    <p className="text-[10px] text-muted-foreground capitalize">{admin.ruolo}</p>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 bg-card! text-foreground!" onClick={() => toast.info("Chat in arrivo...")}>
                                                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                {/* 2. BACHECA PAGINATA E INTERATTIVA */}
                                <BachecaPaginata 
                                    annunci={annunci}  
                                    canManage={isAdmin} 
                                    onCreate={() => setIsCreateOpen(true)}
                                    onSelect={(item) => setSelectedAnnouncement(item)}
                                />

                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL CREAZIONE ANNUNCIO */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="sm:max-w-125 p-6 bg-card border-border [&>button]:bg-background!
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
                        [&>button]:focus-visible:ring-0!">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-xl">Nuovo Annuncio</DialogTitle>
                        </DialogHeader>
                        
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="titolo" className="text-sm font-semibold">Titolo</Label>
                                <Input 
                                    id="titolo" 
                                    placeholder="Es. Manutenzione programmata"
                                    value={newAnnuncio.titolo}
                                    onChange={(e) => setNewAnnuncio({...newAnnuncio, titolo: e.target.value})}
                                    className="bg-background"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex flex-col gap-2 flex-1">
                                    <Label htmlFor="tipo" className="text-sm font-semibold">Tipo</Label>
                                    <Select 
                                        value={newAnnuncio.tipo} 
                                        onValueChange={(val) => setNewAnnuncio({...newAnnuncio, tipo: val})}
                                    >
                                        <SelectTrigger className="bg-card text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="info">Informazione</SelectItem>
                                            <SelectItem value="alert">Avviso Urgente</SelectItem>
                                            <SelectItem value="manutenzione">Manutenzione</SelectItem>
                                            <SelectItem value="evento">Evento</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2 justify-end pb-1">
                                    <div 
                                        className="flex items-center gap-3 cursor-pointer group"
                                        onClick={() => setNewAnnuncio(prev => ({...prev, is_pinned: !prev.is_pinned}))}
                                    >
                                        <div className={cn(
                                            "w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out border-2",
                                            newAnnuncio.is_pinned 
                                                ? "bg-green-600 border-green-600" 
                                                : "bg-transparent border-muted-foreground/40"
                                        )}>
                                            <div className={cn(
                                                "absolute top-0.5 left-0.5 w-4 h-4 rounded-full shadow-sm transition-transform duration-200 bg-white",
                                                newAnnuncio.is_pinned ? "translate-x-5" : "translate-x-0"
                                            )} />
                                        </div>
                                        <Label className="cursor-pointer text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                            Fissa in alto
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="msg" className="text-sm font-semibold">Messaggio</Label>
                                <Textarea 
                                    id="msg" 
                                    placeholder="Scrivi qui il contenuto dell'avviso..."
                                    className="resize-none h-32 bg-background leading-relaxed"
                                    value={newAnnuncio.messaggio}
                                    onChange={(e) => setNewAnnuncio({...newAnnuncio, messaggio: e.target.value})}
                                />
                            </div>
                        </div>

                        <DialogFooter className="mt-6 gap-2 sm:gap-0">
                            <Button variant="outline" className="border-2! hover:border-primary!" onClick={() => setIsCreateOpen(false)}>Annulla</Button>
                            <Button variant="outline" className="border-2! hover:border-primary!" onClick={handleCreateAnnouncement} disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                                Pubblica
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* MODAL VISUALIZZAZIONE DETTAGLIO */}
                <AnnouncementDetail 
                    announcement={selectedAnnouncement} 
                    currentUserId={currentUserId}
                    onClose={() => setSelectedAnnouncement(null)} 
                    onDelete={(id) => setDeleteId(id)}
                />

                {/* MODAL CONFERMA CANCELLAZIONE */}
                <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <DialogContent className="sm:max-w-105 p-0 overflow-hidden bg-card border-border [&>button:last-child]:hidden gap-0 shadow-xl">
                        
                        <div className="p-6 flex items-start gap-5">
                            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
                                <Trash2 className="h-5 w-5 text-red-600" />
                            </div>
                            
                            <div className="space-y-1.5 pt-1">
                                <DialogTitle className="text-lg font-semibold text-foreground leading-none">
                                    Elimina Annuncio
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                                    L'annuncio verrà rimosso permanentemente dalla bacheca. Vuoi procedere?
                                </DialogDescription>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-end gap-3 p-4 bg-muted/30 border-t border-border">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setDeleteId(null)}
                                disabled={deleteMutation.isPending}
                                className="h-9 px-4"
                            >
                                Annulla
                            </Button>
                            <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={executeDelete}
                                disabled={deleteMutation.isPending}
                                className="h-9 px-6 bg-red-500! hover:bg-red-700! text-white! font-medium shadow-sm gap-2"
                            >
                                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Elimina"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
    )
}