import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/services/supabase_client";
import { toast } from "sonner";

export function UserPasswordForm() {
    const [loading, setLoading] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pass, setPass] = useState({ new: "", confirm: "" });

    const handleUpdate = async () => {
        if (!pass.new || pass.new !== pass.confirm) {
            toast.error("Le password non coincidono o sono vuote.");
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: pass.new });
            if (error) throw error;
            toast.success("Password aggiornata.");
            setPass({ new: "", confirm: "" });
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-border shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-orange-500" /> Cambio Password
                </CardTitle>
                <CardDescription>Aggiorna la tua password di accesso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Nuova Password</Label>
                        <div className="relative">
                            <Input 
                                type={showNew ? "text" : "password"} 
                                value={pass.new} 
                                onChange={e => setPass({...pass, new: e.target.value})} 
                                className="h-9 pr-10" 
                                placeholder="••••••••"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowNew(!showNew)} 
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-card! focus:outline-none flex items-center justify-center z-10"
                            >
                                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Conferma Password</Label>
                        <div className="relative">
                            <Input 
                                type={showConfirm ? "text" : "password"} 
                                value={pass.confirm} 
                                onChange={e => setPass({...pass, confirm: e.target.value})} 
                                className="h-9 pr-10" 
                                placeholder="••••••••"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-card! focus:outline-none flex items-center justify-center z-10"
                            >
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/20 py-3 flex justify-end">
                <Button 
                    variant="outline"
                    size="sm" onClick={handleUpdate}
                    disabled={loading || !pass.new}
                >
                    {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />} Aggiorna Password
                </Button>
            </CardFooter>
        </Card>
    );
}