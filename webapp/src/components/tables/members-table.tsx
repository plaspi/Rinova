import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search, Mail, UserCog, Ban, CheckCircle, Leaf, ListFilter, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MemberDetails } from "@/components/details/memberDetails"
import { toast } from "sonner"
import type { MemberData } from "@/pages/CerPage"

interface MembersTableProps {
    data: MemberData[];
    currentUserRole: string;
}

export function MembersTable({ data, currentUserRole }: MembersTableProps) {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRow, setSelectedRow] = useState<MemberData | null>(null);

  const navigate = useNavigate();
  
  // PAGINATION STATE
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 8; 

  const canManage = currentUserRole === 'admin' || currentUserRole === 'representative';

  const filteredData = data.filter(item => {
    const matchesSearch = 
        item.nome?.toLowerCase().includes(filter.toLowerCase()) ||
        item.cognome?.toLowerCase().includes(filter.toLowerCase()) ||
        item.email?.toLowerCase().includes(filter.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || item.stato === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const handleNext = () => { if (page < totalPages - 1) setPage(p => p + 1); };
  const handlePrev = () => { if (page > 0) setPage(p => p - 1); };

  if (page > 0 && paginatedData.length === 0 && totalPages > 0) {
      setPage(0);
  }

  return (
    <div className="space-y-0 flex flex-col h-full">
      
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-background/50 gap-4 border-b">
        <div className="flex items-center gap-2 w-full max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cerca per nome o email..." 
              className="pl-8 h-9 bg-background border-muted" 
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(0); }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
           {canManage && (
             <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(0); }}>
                <SelectTrigger className="h-9 w-40 text-xs bg-card!                /* Sfondo del bottone (es. scuro/chiaro) */
    border-input!           /* Colore del bordo a riposo */
    text-foreground!        /* Colore del testo */
    hover:border-primary!   /* (Opzionale) Bordo verde se ci passi sopra */
    focus:ring-primary!     /* (Opzionale) Anello verde se cliccato */
  ">
                    <ListFilter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Stato" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    <SelectItem value="attivo">Attivi</SelectItem>
                    <SelectItem value="in_attesa">In Attesa</SelectItem>
                    <SelectItem value="sospeso">Sospesi</SelectItem>
                </SelectContent>
             </Select>
           )}

           <Button size="sm" className="h-9 text-xs ml-auto bg-card! sm:ml-0" onClick={() => toast.info("Funzionalità inviti prossimamente disponibile")}>
             + Invita
           </Button>
        </div>
      </div>

      {/* TABELLA */}
      <div className="flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/40">
              <TableHead className="w-16 pl-6"></TableHead> 
              <TableHead>Membro</TableHead>
              <TableHead className="hidden md:table-cell">Ruolo</TableHead>
              <TableHead className="hidden md:table-cell">POD</TableHead>
              <TableHead>Stato</TableHead>
              {canManage && <TableHead className="text-right pr-6">Azioni</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/50 border-b last:border-0 cursor-pointer h-16.25" onClick={() => setSelectedRow(row)}>
                <TableCell className="pl-6">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={row.avatar_url || ""} className="object-cover" />
                    <AvatarFallback className="bg-muted/50">
                        <Leaf className="h-4 w-4 text-green-600" />
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{row.nome} {row.cognome}</span>
                    <span className="text-xs text-muted-foreground">{row.email}</span>
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell">
                   <div className="flex items-center gap-2">
                     {row.ruolo === "Amministratore" && <UserCog className="h-3 w-3 text-primary" />}
                     <span className="text-sm capitalize">{row.ruolo}</span>
                   </div>
                </TableCell>

                <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                  {row.pod || "—"}
                </TableCell>

                <TableCell>
                   <BadgeStatus status={row.stato} />
                </TableCell>

                {canManage && (
                    <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 bg-card! text-foreground!">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedRow(row)}>
                            Visualizza dettagli
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info("Sblocca Rinova Energy Pro", { description: "Chat disponibile nel piano Pro.", icon: <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" />, action: { label: "Vedi Piani", onClick: () => navigate("/subscription") }, })}>
                            <Mail className="mr-2 h-4 w-4" /> Invia messaggio
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {row.stato !== "attivo" && (
                              <DropdownMenuItem className="text-green-600" onClick={() => toast.info("Prossimamente")}>
                                 <CheckCircle className="mr-2 h-4 w-4" /> Attiva utente
                              </DropdownMenuItem>
                          )}
                          {row.stato === "attivo" && (
                              <DropdownMenuItem className="text-red-600" onClick={() => toast.info("Prossimamente")}>
                                 <Ban className="mr-2 h-4 w-4" /> Sospendi
                              </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                )}
              </TableRow>
            ))}
            
            {/* NO FILLER ROWS LOOP HERE */}
            
            {filteredData.length === 0 && (
                <TableRow>
                    <TableCell colSpan={canManage ? 6 : 5} className="h-64 text-center text-muted-foreground">
                        Nessun membro trovato.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       {/* Pagination Footer - Renderizza solo se serve */}
       {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/5 mt-auto">
                <span className="text-xs text-muted-foreground">
                    Pagina {page + 1} di {totalPages}
                </span>
                <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrev} disabled={page === 0}>
                        <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNext} disabled={page === totalPages - 1}>
                        <ChevronRight className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        )}

      {selectedRow && (
          <MemberDetails member={selectedRow} onClose={() => setSelectedRow(null)} />
      )}
    </div>
  )
}

function BadgeStatus({ status }: { status: string }) {
    const stNormalized = status?.toLowerCase().replace('_', ' ');
    
    let styleClass = "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200";
    
    if(stNormalized === "attivo") {
        styleClass = "bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 border-green-500/20";
    }
    if(stNormalized === "sospeso") {
        styleClass = "bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20 border-red-500/20";
    }
    if(stNormalized.includes("attesa")) {
        styleClass = "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/20";
    }

    return (
        <Badge variant="outline" className={`font-medium border capitalize ${styleClass}`}>
            {stNormalized}
        </Badge>
    )
}