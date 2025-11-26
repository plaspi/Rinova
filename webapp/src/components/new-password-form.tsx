    import { useState } from "react"
    import { cn } from "@/lib/utils"
    import { Button } from "@/components/ui/button"
    import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    } from "@/components/ui/card"
    import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    } from "@/components/ui/field"
    import { Input } from "@/components/ui/input"

    export function NewPasswordForm({
    className,
    ...props
    }: React.ComponentProps<"div">) {

        const [password, setPassword] = useState("")
        const [confirmPassword, setConfirmPassword] = useState("")
        const [error, setError] = useState("")
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault()

            if (password !== confirmPassword) {
            setError("Le password non coincidono. Riprova.")
            return
            }

            setError("")
            // TODO: invio reale della richiesta
        }
        
    return (
        <div className={cn("flex flex-col h-screen w-screen items-center justify-center bg-muted max-h-screen max-w-screen", className)} {...props}>
        <Card>
            <div className="max-w-md p-2">
                    <a href="#" className="w-[20%] flex items-center">
                        <img 
                        src="/images/rinova_logo.png" 
                        alt="Logo Rinova" 
                        className="w-full h-auto object-contain"
                        />
                    </a>
                </div>
            <CardHeader className="text-center p-2">
            <Field className="text-xl font-bold">Inserisci nuova password</Field>
            <CardDescription>
                Inserisci la nuvoa password per confermare la modifica
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit}>
                <FieldGroup className="gap-4">
                <Field>
                    <FieldLabel htmlFor="password">Nuova password</FieldLabel>
                    <Input
                    id="newpw"
                    type="password"
                    className="border-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="password">Conferma nuova password</FieldLabel>
                    <Input
                    id="newpw2"
                    type="password"
                    className="border-2"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    />
                </Field>
                <Field>
                    <Button type="submit" className="!bg-[#2c6e29] text-white hover:-translate-y-[2px] !border-2 ">
                        Conferma nuova password
                    </Button>
                    {error &&(<FieldDescription className="text-center text-red-600 mt-2">Per confermare il cambiamento la password deve coincidere</FieldDescription>)}
                </Field>
                </FieldGroup>
            </form>
            </CardContent>
        </Card>
        </div>
    )
    }