import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"


export function RegistrationForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col", className)} {...props}>
      <FieldGroup className="gap-4">
        
        <div className="items-center gap-[5%] text-center">
          <div className="pb-[3%] flex justify-center items-center">
          {/* Testo centrato */}
        <h3 className="text-3xl transform font-bold">
            Registrati
        </h3>
        </div>
        
          
          
          <p className="text-muted-foreground text-sm text-balance">
            Entra con le tue credenziali per registrare il tuo account
          </p>
          
        </div>
  <div id="reg" className="flex flex-col gap-4 p-[1%]">
  {/* Riga 1: Nome e Cognome */}
  <div className="flex gap-3">
    <Field className="gap-1">
      <FieldLabel htmlFor="name">Nome</FieldLabel>
      <Input id="name" type="text" placeholder="Nome"  className="border-2 " required />
    </Field>
    <Field className="gap-1">
      <FieldLabel htmlFor="surname">Cognome</FieldLabel>
      <Input id="surname" type="text" placeholder="Cognome" className="border-2" required />
    </Field>
  </div>

  {/* Riga 2: Email e Codice fiscale */}
  <div className="flex gap-4">
    <Field className="gap-1">
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input id="email" type="email" placeholder="enrico.example@..." className="border-2" required />
    </Field>
    <Field className="gap-1">
      <FieldLabel htmlFor="id">Codice fiscale</FieldLabel>
      <Input id="id" type="text" placeholder="Codice fiscale" className="border-2" required />
    </Field>
  </div>

  {/* Riga 3: Telefono e Comune */}
  <div className="flex gap-4">
    <Field className="gap-1">
      <FieldLabel htmlFor="phone">Numero di telefono</FieldLabel>
      <Input id="phonenumber" type="tel" placeholder="Num di telefono" className="border-2" required />
    </Field>
    <Field className="gap-1">
      <FieldLabel htmlFor="place">Comune di residenza</FieldLabel>
      <Input id="place" type="text" placeholder="Comune di residenza" className="border-2" required />
    </Field>
  </div>
  <div className="flex gap-4 items-end">
  {/* Password */}
  <Field className="flex-1 flex flex-col gap-1 w-[50%]">
    <FieldLabel htmlFor="password">Password</FieldLabel>
    <Input id="password" type="password" className="border-2"
 required />
  </Field>

  {/* Bottone di invio */}
  <Button type="submit" className=" !bg-[#2c6e29] text-white h-10 shadow-md hover:shadow-lg transition-all hover:-translate-y-[2px] !border-2 !border-[#2c6e29] ">
    Registrati
  </Button>
</div>
</div>
 
        
           

          
<FieldDescription className="text-center">
            Hai già un account?
            <a href="login" className="underline underline-offset-4">
              Accedi
            </a>
          </FieldDescription>  
          <FieldDescription className="px-6 text-center">
        Cliccando Registrati, accetti i nostri <a href="#">Termini di Servizio</a>{" "}
        e la nostra <a href="#">Informativa sulla Privacy</a>.
      </FieldDescription>        
      </FieldGroup>
      

    </form>
  )
}
