import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="bg-muted flex flex-col items-center justify-center h-screen w-screen p-6 md:p-10">
      <div id = "ceres" className="w-screen md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}
