import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Mail, MapPin, Lock } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { supabase } from "@/services/supabase_client";
import { toast } from "sonner";

type CityOption = { nome: string; provincia: string; };

export function UserProfileForm() {
    const { user, profile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    
    // Stati CAP
    const [isFetchingCap, setIsFetchingCap] = useState(false);
    const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
    const [showCitySelect, setShowCitySelect] = useState(false);
    const selectTriggerRef = useRef<HTMLButtonElement>(null);

    const [formData, setFormData] = useState({
        name: "", surname: "", email: "", street_name: "", 
        street_number: "", zip_code: "", city: "", province: ""
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                surname: profile.surname || "",
                email: user?.email || "",
                street_name: profile.street_name || "",
                street_number: profile.street_number || "",
                zip_code: profile.zip_code || "",
                city: profile.city || "",
                province: profile.province || ""
            });
        }
    }, [profile, user]);

    // Logica CAP (identica a prima)
    useEffect(() => {
        const fetchCities = async () => {
            if (formData.zip_code && formData.zip_code.length === 5) {
                if (formData.zip_code === profile?.zip_code && formData.city) return;

                setIsFetchingCap(true);
                setCityOptions([]);
                setShowCitySelect(false);
                try {
                    const { data } = await supabase.from('comuni').select('nome, provincia').eq('cap', formData.zip_code);
                    if (data && data.length > 0) {
                        if (data.length === 1) {
                            setFormData(p => ({ ...p, city: data[0].nome, province: data[0].provincia }));
                        } else {
                            setCityOptions(data);
                            setShowCitySelect(true);
                            setTimeout(() => selectTriggerRef.current?.click(), 100);
                        }
                    } else {
                        toast.error("CAP non trovato");
                    }
                } catch (e) { console.error(e); } 
                finally { setIsFetchingCap(false); }
            }
        };
        fetchCities();
    }, [formData.zip_code]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error } = await supabase.from('users').update({
                name: formData.name,
                surname: formData.surname,
                street_name: formData.street_name,
                street_number: formData.street_number,
                zip_code: formData.zip_code,
                city: formData.city,
                province: formData.province,
            }).eq('id', user?.id);

            if (error) throw error;
            toast.success("Profilo salvato.");
        } catch (error: any) {
            toast.error("Errore: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-border shadow-sm">
            <CardHeader>
                <CardTitle>Dettagli Anagrafici</CardTitle>
                <CardDescription>Informazioni utilizzate per la fatturazione e le comunicazioni CER.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Nome Cognome */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="surname">Cognome</Label>
                            <Input id="surname" value={formData.surname} onChange={(e) => setFormData({...formData, surname: e.target.value})} />
                        </div>
                    </div>

                    {/* Email Locked */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Account</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input id="email" value={formData.email} disabled className="pl-10 pr-10 bg-muted/50 border-dashed text-muted-foreground" />
                            <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                        </div>
                    </div>

                    <Separator />

                    {/* Indirizzo */}
                    <div className="grid grid-cols-[3fr_1fr] gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="street">Via / Piazza</Label>
                            <Input id="street" placeholder="Via Roma" value={formData.street_name} onChange={(e) => setFormData({...formData, street_name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="number">N°</Label>
                            <Input id="number" placeholder="10" value={formData.street_number} onChange={(e) => setFormData({...formData, street_number: e.target.value})} />
                        </div>
                    </div>

                    {/* CAP Città Provincia */}
                    <div className="grid grid-cols-[1fr_2fr_0.8fr] gap-4 items-start relative">
                        <div className="space-y-2 relative">
                            <Label htmlFor="zip">CAP</Label>
                            <div className="relative">
                                <Input id="zip" maxLength={5} placeholder="00100" value={formData.zip_code} onChange={(e) => setFormData({...formData, zip_code: e.target.value})} />
                                {isFetchingCap && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                            </div>
                            {showCitySelect && (
                                <div className="absolute top-full left-0 w-[200%] z-50 mt-1"> 
                                    <Select onValueChange={(val) => {
                                        const c = cityOptions.find(opt => opt.nome === val);
                                        if (c) { setFormData(p => ({...p, city: c.nome, province: c.provincia})); setShowCitySelect(false); }
                                    }}>
                                        <SelectTrigger ref={selectTriggerRef} className="h-0 w-0 opacity-0 absolute"><SelectValue /></SelectTrigger>
                                        <SelectContent className="max-h-50 overflow-y-auto">
                                            {cityOptions.map((city) => <SelectItem key={`${city.nome}-${city.provincia}`} value={city.nome}>{city.nome} ({city.provincia})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">Città</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="city" className="pl-10" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="Roma" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="province">Prov.</Label>
                            <Input id="province" value={formData.province} readOnly className="bg-muted/30 text-center font-mono uppercase" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" /> Salva Anagrafica
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}