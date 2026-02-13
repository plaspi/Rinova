import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, Trash2, Leaf } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { supabase } from "@/services/supabase_client";
import { AlertDialog, AlertDialogTrigger, AlertDialogTitle, AlertDialogHeader, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function UserAvatarCard() {
    const { user, profile, refreshProfile } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const navigate = useNavigate();

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) return;

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}/avatar-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {upsert: true});
            
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const { error: updateError } = await supabase
                .from('users')
                .update({ avatar_url: publicUrl })
                .eq('id', user?.id);

            if (updateError) throw updateError;
            
            toast.success("Foto profilo aggiornata!");
            await refreshProfile();

        } catch (error: any) {
            toast.error("Errore upload: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            setDeleteLoading(true);

            //call supabase rpc
            const { error } = await supabase.rpc('delete_user_account');
            if(error) throw error;

            //clean local session
            await supabase.auth.signOut();

            toast.success("Account eliminato con successo.");

            //Redirect registrazione
            navigate("/registration")
        } catch (error: any) {
            toast.error("Errore eliminazione account");
        } finally {
            setDeleteLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <Card className="border-border shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 pb-8 text-center border-b">
                    <div className="relative mx-auto w-fit">
                        <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                            <AvatarImage src={profile?.avatar_url || ""} className="object-cover"/>
                            <AvatarFallback className="bg-primary/10">
                                <Leaf className="h-12 w-12 text-primary" />
                            </AvatarFallback>
                        </Avatar>
                        <label 
                            htmlFor="avatar-upload"
                            className="absolute bottom-0 right-0 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-transform hover:scale-105"
                        >
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                        </label>
                        <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                    </div>
                    <div className="mt-4">
                        <h3 className="font-bold text-xl">{profile?.name} {profile?.surname}</h3>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                </CardHeader>
            </Card>

            <Card className="border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-red-600! dark:text-red-400! font-semibold flex items-center gap-2">
                        <Trash2 className="h-4 w-4" /> Eliminazione Account
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        L'eliminazione è irreversibile, i tuoi dati saranno eliminati per sempre.
                    </p>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="w-full bg-red-400! dark:bg-red-600! hover:bg-red-600! dark:hover:bg-red-700!">
                                Elimina definitivamente
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Sei Assolutamente sicuro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Questa azione non può essere annullata. Questo eliminerà permanentemente il tuo account e rimuoverà i tuoi dati dai nostri server.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-muted!">Annulla</AlertDialogCancel>
                                <AlertDialogAction
                                onClick={handleDeleteAccount}
                                className="bg-red-400! dark:bg-red-600! hover:bg-red-600! dark:hover:bg-red-700! text-foreground!"
                                disabled={deleteLoading}
                                >
                                    {deleteLoading ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Eliminazione... </>
                                    ) : (
                                        "Procedi con l'eliminazione"
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    
                </CardContent>
            </Card>
        </div>
    );
}