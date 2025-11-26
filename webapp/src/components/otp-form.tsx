import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function OTPForm({ ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card {...props}>
        <div className="max-w-md p-2">
                    <a href="#" className="w-[27%] flex items-center">
                        <img 
                        src="/images/rinova_logo.png" 
                        alt="Logo Rinova" 
                        className="w-full h-auto object-contain"
                        />
                    </a>
                </div>
      <CardHeader className="text-center p-2">
        <Field className="font-bold">Inserisci il codice di verifica</Field>
        <CardDescription>Ti è stato inviato un codice di verifica.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp">Verification code</FieldLabel>
              <InputOTP maxLength={6} id="otp" required>
                <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                  <InputOTPSlot index={0} className="border-3"/>
                  <InputOTPSlot index={1} className="border-3"/>
                  <InputOTPSlot index={2} className="border-3"/>
                  <InputOTPSlot index={3} className="border-3"/>
                  <InputOTPSlot index={4} className="border-3"/>
                  <InputOTPSlot index={5} className="border-3"/>
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription>
                Inserisci il codice a 6 cifre.
              </FieldDescription>
            </Field>
            <FieldGroup>
                    <Button type="submit" className="!bg-[#2c6e29] text-white hover:-translate-y-[2px] !border-2 ">Conferma</Button>
              <FieldDescription className="text-center">
                Non hai ricevuto il codice? <a href="#">Rinvia il codice</a>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
