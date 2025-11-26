import { OTPForm } from "@/components/otp-form"

export default function OtpPage() {
  return (
    <div className="flex flex-col w-screen h-screen max-w-screen max-h-screen bg-muted items-center justify-center">
      <div className="w-full max-w-xs">
        <OTPForm />
      </div>
    </div>
  )
}
