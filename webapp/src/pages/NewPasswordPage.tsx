import { NewPasswordForm } from "@/components/new-password-form"

export default function NewPasswordPage() {
  return (
    <div className="bg-muted flex flex-col items-center justify-center h-screen w-screen max-h-screen max-w-screen">
      <div className="flex w-full flex-col">
        <NewPasswordForm/>
      </div>
    </div>
  )
}
