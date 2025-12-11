import { LoginForm } from "@/components/forms/login-form"

export default function LoginPage() {
  return (
    <div className="bg-muted flex flex-col items-center justify-center h-screen w-screen ">
      <div className="w-full h-full">
        <LoginForm />
      </div>
    </div>
  )
}
