import { cn } from "@/lib/utils";
import { 
    X, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    XCircle, 
    Paperclip, 
    Download, 
    Calendar,
    Tag,
    MessageSquare,
    Hash,
    CornerDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { Ticket } from "@/components/tables/ticket-table";
import { supabase } from "@/services/supabase_client";
import { toast } from "sonner";

interface TicketDetailProps {
  ticket: Ticket | null;
  onClose: () => void;
}

export function TicketDetail({ ticket, onClose }: TicketDetailProps) {
  if (!ticket) return null;

  // --- CONFIGURATIONS ---
  const getStatusConfig = (status: string) => {
      switch (status) {
          case 'open': return { label: 'Aperto', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: AlertCircle };
          case 'in_progress': return { label: 'In Lavorazione', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: Clock };
          case 'resolved': return { label: 'Risolto', color: 'bg-green-500/10 text-green-600 border-green-200', icon: CheckCircle2 };
          case 'closed': return { label: 'Chiuso', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: XCircle };
          default: return { label: status, color: 'bg-gray-100 text-gray-500', icon: AlertCircle };
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

  const status = getStatusConfig(ticket.status);
  const StatusIcon = status.icon;

  const handleDownload = async (path: string) => {
      try {
          const { data, error } = await supabase.storage
              .from('support_attachments')
              .createSignedUrl(path, 60);

          if (error) throw error;
          window.open(data.signedUrl, '_blank');
      } catch (e) {
          toast.error("Impossibile scaricare il file");
      }
  };

  return (
    // OVERLAY: Covers the whole screen with a blur
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* MODAL CONTAINER: Responsive width, nice borders */}
      <div className="bg-background w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl border shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden">

        {/* --- HEADER (Sticky) --- */}
        <div className="bg-background/95 backdrop-blur border-b px-6 py-4 flex items-start justify-between shrink-0 z-10">
            <div className="space-y-1.5 flex-1 min-w-0 mr-4">
                {/* Status & ID Row */}
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider gap-1.5", status.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                        <Hash className="h-3 w-3" /> {ticket.id}
                    </span>
                </div>
                
                {/* Title */}
                <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-tight line-clamp-2">
                    {ticket.subject}
                </h2>

                {/* Meta Row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-primary/70" />
                        {formatCategory(ticket.category)}
                    </span>
                    <span className="hidden sm:inline text-border">|</span>
                    <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary/70" />
                        {format(new Date(ticket.created_at), "d MMMM yyyy, HH:mm", { locale: it })}
                    </span>
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9 bg-muted-foreground/65! transition-colors shrink-0 hover:text-accent-foreground"
                onClick={onClose}
            >
                <X className="h-5 w-5" />
            </Button>
        </div>

        {/* --- BODY (Scrollable) --- */}
        <ScrollArea className="flex-1 bg-muted/5">
            <div className="p-6 space-y-8 max-w-3xl mx-auto">
                
                {/* USER REQUEST */}
                <div className="flex gap-4">
                    <Avatar className="h-10 w-10 border bg-background mt-1 shadow-sm shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            TU
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-baseline justify-between">
                            <span className="text-sm font-semibold text-foreground">Tu</span>
                        </div>
                        
                        {/* The Message Bubble */}
                        <div className="bg-background border p-5 rounded-2xl rounded-tl-none shadow-sm text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {ticket.message}
                        </div>

                        {/* Attachments Area */}
                        {ticket.attachments && ticket.attachments.length > 0 && (
                            <div className="pt-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                                    Allegati ({ticket.attachments.length})
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {ticket.attachments.map((path, idx) => {
                                        const fileName = path.split('/').pop() || "File";
                                        return (
                                            <div 
                                                key={idx} 
                                                onClick={() => handleDownload(path)}
                                                className="flex items-center gap-3 p-2.5 rounded-lg border bg-background hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group"
                                            >
                                                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600">
                                                    <Paperclip className="h-4 w-4" />
                                                </div>
                                                <span className="text-xs font-medium truncate flex-1">{fileName}</span>
                                                <Download className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* TIMELINE SEPARATOR */}
                {ticket.status !== 'open' && (
                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center"><Separator /></div>
                        <div className="relative flex justify-center">
                            <span className="bg-muted/5 px-3 py-1 rounded-full border text-[10px] font-medium text-muted-foreground flex items-center gap-2">
                                <CornerDownRight className="h-3 w-3" /> Risposte Supporto
                            </span>
                        </div>
                    </div>
                )}

                {/* ADMIN RESPONSE (Mockup logic) */}
                {ticket.status !== 'open' && (
                    <div className="flex gap-4 flex-row-reverse">
                        <Avatar className="h-10 w-10 border mt-1 bg-primary text-primary-foreground shadow-sm shrink-0">
                            <AvatarFallback>S</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1 min-w-0 text-right">
                            <div className="flex items-baseline justify-end gap-2">
                                <span className="text-xs text-muted-foreground">Supporto Rinova</span>
                                <span className="text-sm font-semibold text-primary">Operatore</span>
                            </div>
                            
                            <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl rounded-tr-none text-left shadow-sm text-sm text-foreground/90 leading-relaxed">
                                <p className="mb-2">Salve,</p>
                                <p>Abbiamo preso in carico la tua richiesta "{ticket.subject}".</p>
                                <p className="mt-2">Un tecnico sta analizzando i log del sistema per identificare la causa del problema. Ti aggiorneremo entro 24 ore.</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </ScrollArea>

        {/* --- FOOTER --- */}
        <div className="p-4 border-t bg-background shrink-0 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-muted-foreground">
                Ultimo aggiornamento: {format(new Date(ticket.created_at), "dd MMM yyyy")}
            </span>
            <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none bg-muted-foreground/65! hover:text-accent-foreground">
                    Chiudi
                </Button>
                {ticket.status !== 'closed' && (
                    <Button className="gap-2 flex-1 sm:flex-none shadow-md bg-primary!" onClick={() => toast.info("Chat in arrivo...")}>
                        <MessageSquare className="h-4 w-4" /> Aggiungi risposta
                    </Button>
                )}
            </div>
        </div>

      </div>
    </div>
  )
}