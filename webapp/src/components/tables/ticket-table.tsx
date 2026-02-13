import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    ChevronRight,
    Paperclip,
    Hash
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- TYPES ---
export interface Ticket {
    id: string;
    category: string;
    subject: string;
    message: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    created_at: string;
    attachments: string[];
}

// --- HELPER CONFIG ---
const getStatusConfig = (status: string) => {
    switch (status) {
        case 'open':
            return { label: 'Aperto', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: AlertCircle };
        case 'in_progress':
            return { label: 'In Corso', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: Clock };
        case 'resolved':
            return { label: 'Risolto', color: 'bg-green-500/10 text-green-600 border-green-200', icon: CheckCircle2 };
        case 'closed':
            return { label: 'Chiuso', color: 'bg-muted text-muted-foreground border-border', icon: XCircle };
        default:
            return { label: status, color: 'bg-muted text-muted-foreground', icon: AlertCircle };
    }
};

const formatCategory = (cat: string) => {
    const map: Record<string, string> = {
        technical: "Problema Tecnico",
        billing: "Fatturazione e Contratti",
        feedback: "Feedback e Suggerimenti",
        account: "Gestione Account",
        others: "Altro"
    };
    return map[cat] || cat;
};

interface TicketsTableProps {
    tickets: Ticket[];
    onTicketSelect: (ticket: Ticket) => void;
}

export function TicketsTable({ tickets, onTicketSelect }: TicketsTableProps) {
    return (
        <Card className="border shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/90 hover:bg-muted/90 border-b border-border/60">
                            <TableHead className="w-25 pl-6 h-12 font-medium">ID Ticket</TableHead>
                            <TableHead className="h-12 font-medium">Categoria</TableHead>
                            <TableHead className="w-45 h-12 font-medium hidden md:table-cell">Data</TableHead>
                            <TableHead className="w-35 h-12 font-medium">Stato</TableHead>
                            <TableHead className="w-12.5 h-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                            <AlertCircle className="h-4 w-4" />
                                        </div>
                                        <p>Non hai ancora aperto nessun ticket.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            tickets.map((ticket) => {
                                const status = getStatusConfig(ticket.status);
                                const StatusIcon = status.icon;
                                
                                return (
                                    <TableRow 
                                        key={ticket.id} 
                                        className="group cursor-pointer hover:bg-muted/40 transition-all border-b border-border/40 last:border-0"
                                        onClick={() => onTicketSelect(ticket)}
                                    >
                                        {/* 1. ID (Hash) */}
                                        <TableCell className="pl-6! py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono text-xs font-medium text-foreground">
                                                    {ticket.id}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* 2. CATEGORY (Mapped Full Name) */}
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-sm text-foreground">
                                                    {formatCategory(ticket.category)}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* 3. DATE */}
                                        <TableCell className="hidden md:table-cell py-4">
                                            <span className="text-xs text-muted-foreground font-medium">
                                                {format(new Date(ticket.created_at), "d MMM yyyy", { locale: it })}
                                            </span>
                                            <span className="block text-[10px] text-muted-foreground/60">
                                                {format(new Date(ticket.created_at), "HH:mm", { locale: it })}
                                            </span>
                                        </TableCell>

                                        {/* 4. STATUS */}
                                        <TableCell className="py-4">
                                            <Badge variant="outline" className={cn("rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider gap-1.5 transition-colors shadow-none", status.color)}>
                                                <StatusIcon className="w-3 h-3" />
                                                {status.label}
                                            </Badge>
                                        </TableCell>

                                        {/* 5. ARROW & ATTACHMENT ICON */}
                                        <TableCell className="text-right pr-6 py-4">
                                            <div className="flex items-center justify-end gap-3">
                                                {ticket.attachments && ticket.attachments.length > 0 && (
                                                    <Paperclip className="h-3.5 w-3.5 text-muted-foreground/50" />
                                                )}
                                                <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}