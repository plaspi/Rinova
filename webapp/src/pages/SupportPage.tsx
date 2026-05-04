import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SidebarTrigger } from "@/components/sidebar/sidebarLayout";
import { NavLayout } from "@/components/nav/navLayout";
import { ModeToggle } from "@/components/modeToggle";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TicketsTable, type Ticket } from "@/components/tables/ticket-table";
import { TicketDetail } from "@/components/details/ticketDetails";
import { supabase } from "@/services/supabase_client";
import {
    LifeBuoy,
    MessageSquarePlus,
    UploadCloud,
    Send,
    Loader2,
    Paperclip,
    X,
    FileText,
    HelpCircle,
    Mail,
    Download
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/authContext";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// --- ATTACHMENTS CONFIGURATION ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

// --- VALIDATION SCHEMA ---
const supportSchema = z.object({
    category: z.string().min(1, "Seleziona una categoria"),
    subject: z.string().min(1, "Inserisci un oggetto"),
    message: z.string().min(20, "Descrivi il problema con almeno 20 caratteri").max(300, "Descrivi il problema in massimo 300 caratteri"),
});

type SupportFormValues = z.infer<typeof supportSchema>;

export default function SupportPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<SupportFormValues>({
        resolver: zodResolver(supportSchema),
        defaultValues: {
            category: "",
            subject: "",
            message: ""
        }
    });

    const { data: tickets = [], isLoading: isLoadingTickets } = useQuery({
        queryKey: ['support-tickets', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('support_tickets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Ticket[];
        },
        enabled: !!user,
    });

    // --- HANDLERS ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            const validFiles: File[] = [];

            selectedFiles.forEach(file => {
                //check size
                if (file.size > MAX_FILE_SIZE) {
                    toast.error("File troppo grande", {
                        description: `${file.name} supera il limite di 5MB.`
                    });
                    return;
                }
                //check type
                if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                    toast.error("Formato non supportato", {
                        description: `${file.name} non è di un formato accettato.`
                    });
                    return;
                }
                validFiles.push(file);
            });

            if (validFiles.length === 0) return;

            setFiles(prev => {
                const combined = [...prev, ...validFiles];
                //total limit count
                if (combined.length > 3) {
                    toast.warning("Limite allegati raggiunto", {
                        description: "Puoi allegare massimo 3 file. I file in eccesso sono stati esclusi."
                    });
                    return combined.slice(0, 3);
                }
                return combined;
            });
            //reset input to allow selecting the same file again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: SupportFormValues) => {
        setIsSubmitting(true);
        try {
            if (!user) throw new Error("User not authenticated");

            const { data: ticketData, error: createError } = await supabase
                .from('support_tickets')
                .insert({
                    user_id: user.id,
                    category: data.category,
                    subject: data.subject,
                    message: data.message,
                    status: 'open',
                    attachments: []
                })
                .select()
                .single();

            if (createError) throw createError;
            if (!ticketData) throw new Error("Errore creazione ticket");

            const ticketId = ticketData.id;
            const uploadedPaths: string[] = [];

            if (files.length > 0) {
                for (const file of files) {

                    // explicit extension check
                    let fileExt = "bin";
                    if (file.type === "image/png") fileExt = "png";
                    else if (file.type === "image/jpeg") fileExt = "jpg";
                    else if (file.type === "application/pdf") fileExt = "pdf";

                    // NEW: Rimuovi l'estensione originale prima di sanificare
                    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                    const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');

                    // final filepath
                    const filePath = `${user.id}/${ticketId}/${cleanName}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                        .from('support_attachments')
                        .upload(filePath, file);

                    if (uploadError) {
                        toast.error(`Errore nel caricamento del file: ${file.name}`);
                        continue;
                    }
                    uploadedPaths.push(filePath);
                }
                //update ticket row with attachments
                if (uploadedPaths.length > 0) {
                    const { error: updateError } = await supabase
                        .from('support_tickets')
                        .update({ attachments: uploadedPaths })
                        .eq('id', ticketId);

                    if (updateError) throw updateError;
                }
            }
            toast.success("Ticket creato con successo!", {
                description: "Ti contatteremo al più presto"
            });

            reset();
            setFiles([]);
            queryClient.invalidateQueries({ queryKey: ['support-tickets'] })

        } catch (error) {
            toast.error("Errore durante l'invio", {
                description: "Riprova tra qualche istante."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col min-h-screen w-full bg-background animate-in fade-in transition-all duration-300">
            {/* --- NAVBAR --- */}
            <NavLayout className="sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur-md flex items-center px-6 gap-4 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="bg-card!" />
                    <div className="h-6 w-px bg-border/60 mx-2 hidden md:block" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem><BreadcrumbLink href="/home">Rinova</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem><BreadcrumbPage>Supporto & Feedback</BreadcrumbPage></BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="flex items-center gap-3"><ModeToggle /></div>
            </NavLayout>

            {/* --- CONTENT --- */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto">

                <div className="space-y-8">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-4xl! font-bold tracking-tight flex items-center gap-3 text-foreground">
                            <LifeBuoy className="h-8 w-8 text-primary" /> Centro Assistenza
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Hai riscontrato un problema o vuoi suggerire una nuova funzionalità? Scrivici qui.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* --- LEFT COL: FORM --- */}
                        <div className="lg:col-span-2">
                            <Card className="border-border shadow-md bg-card">
                                <CardHeader>
                                    <CardTitle>Nuova Richiesta</CardTitle>
                                    <CardDescription>Compila il modulo sottostante. I campi contrassegnati con * sono obbligatori.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                        <input type="hidden" {...register("category")} />

                                        <div className="space-y-2">
                                            <Label>Categoria*</Label>
                                            <Select onValueChange={(val) => setValue("category", val, { shouldValidate: true })}>
                                                <SelectTrigger className={cn(
                                                    "bg-background! text-foreground! border-input",
                                                    errors.category && "border-destructive"
                                                )}>
                                                    <SelectValue placeholder="Seleziona motivo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="technical">Problema Tecnico</SelectItem>
                                                    <SelectItem value="billing">Fatturazione e Contratti</SelectItem>
                                                    <SelectItem value="feedback">Feedback e Suggerimenti</SelectItem>
                                                    <SelectItem value="account">Gestione Account</SelectItem>
                                                    <SelectItem value="others">Altro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="subject">Oggetto*</Label>
                                            <Input
                                                id="subject"
                                                placeholder="Es. Errore caricamento grafico produzione"
                                                {...register("subject")}
                                                className={cn("bg-background text-foreground", errors.subject && "border-destructive")}
                                            />
                                            {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message">Messaggio*</Label>
                                            <Textarea
                                                id="message"
                                                placeholder="Descrivi dettagliatamente il problema o la tua idea..."
                                                className={cn("min-h-37.5 resize-none bg-background text-foreground", errors.message && "border-destructive")}
                                                {...register("message")}
                                            />
                                            {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Allegati</Label>
                                            <div
                                                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer bg-background/50"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                                                <p className="text-sm font-medium text-foreground">
                                                    Clicca per caricare immagini o documenti
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    PNG, JPG o PDF fino a 5MB
                                                </p>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    multiple
                                                    accept="image/*,application/pdf"
                                                    onChange={handleFileChange}
                                                />
                                            </div>

                                            {files.length > 0 && (
                                                <div className="grid grid-cols-1 gap-2 mt-2">
                                                    {files.map((file, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-2 bg-muted/40 border rounded-md text-sm">
                                                            <div className="flex items-center gap-2 truncate">
                                                                <Paperclip className="h-4 w-4 text-primary" />
                                                                <span className="truncate max-w-50">{file.name}</span>
                                                                <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(0)} KB)</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                                                className="bg-card! text-foreground! border-0! hover:text-red-500! p-1"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto gap-2 shadow-md hover:border-primary! bg-primary!">
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" /> Invio...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4" /> Invia Ticket
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* --- RIGHT COL: INFO & FAQ --- */}
                        <div className="flex flex-col gap-6">
                            <Card className="bg-muted/20 border-border">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <HelpCircle className="h-5 w-5 text-amber-500" /> FAQ Rapide
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-sm">Come resetto la password?</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Vai su "Account" {'>'} "Cambio Password" o usa il link "Password dimenticata" nella pagina di login.
                                        </p>
                                    </div>
                                    <Separator />
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-sm">Dove trovo le mie fatture?</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Le fatture non sono ancora gestite direttamente da Rinova, ma le puoi chiedere al tuo fornitore di energia.
                                        </p>
                                    </div>
                                    <Separator />
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-sm">Il grafico è vuoto?</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Verifica che l'inverter sia connesso a internet. I dati possono avere un ritardo fino a 15 minuti.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-primary/5 border-primary/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg text-primary">
                                        <MessageSquarePlus className="h-5 w-5" /> Canali Diretti
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-background p-2 rounded-full shadow-sm">
                                            <Mail className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">Email Supporto</p>
                                            <a href="mailto:rinovaenergy-support@gmail.com" className="text-muted-foreground hover:text-primary hover:underline">support@rinovaenergy.com</a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-background p-2 rounded-full shadow-sm">
                                            <FileText className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">Documentazione</p>
                                            <p className="text-muted-foreground text-xs">Manuale utente v0.1</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-2 bg-background hover:bg-primary/10 border-primary/20 text-primary"
                                        onClick={() => toast.info("Guida Utente in arrivo!", { description: "Il manuale utente PDF è ancora in fase di sviluppo" })}
                                    >
                                        <Download className="h-4 w-4" /> Scarica Guida
                                    </Button>
                                </CardContent>
                                <CardFooter className="bg-primary/10 py-3 px-6">
                                    <p className="text-xs text-primary/80 font-medium w-full text-center">
                                        Rispondiamo Lun-Sab, 08:00 - 20:00
                                    </p>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>

                    {/* --- HISTORY TABLE SECTION --- */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold tracking-tight">I tuoi Ticket</h3>
                        </div>
                        {isLoadingTickets ? (
                            <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg bg-muted/5">
                                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                            </div>
                        ) : (
                            <TicketsTable
                                tickets={tickets}
                                onTicketSelect={(ticket) => setSelectedTicket(ticket)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* --- DETAIL DRAWER (RENDERED HERE TO FIX Z-INDEX WAR) --- */}
            <TicketDetail
                ticket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
            />
        </main>
    );
}