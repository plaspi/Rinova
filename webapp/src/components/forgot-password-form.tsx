import { cn } from "@/lib/utils"
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
import { Input } from "@/components/ui/input"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <div className="max-w-md p-4">
                 <a href="#" className="w-[20%] flex items-center">
                      <img 
                      src="/images/rinova_logo.png" 
                      alt="Logo Rinova" 
                      className="w-full h-auto object-contain"
                      />
                  </a>
              </div>
        <CardHeader className="text-center p-2">
          <Field className="text-xl">Password dimenticata?</Field>
          <CardDescription>
            Inserisci la tua email per modificare la password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  className="border-2"
                  required
                />
              </Field>
              <Field>
              </Field>
              <Field>
                <Button type="submit" className="!bg-[#2c6e29] text-white hover:-translate-y-[2px] !border-2 ">Invia Email</Button>
                <FieldDescription className="text-center">
                  Already have an account? <a href="#">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
