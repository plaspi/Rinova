import { ForgotPasswordForm } from "@/components/forms/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="bg-muted flex flex-col items-center justify-center h-screen w-screen max-h-screen max-w-screen">
      <div className="flex w-full flex-col">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
