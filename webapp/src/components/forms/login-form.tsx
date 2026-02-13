import React, { useState, useEffect} from "react";
import { useForm } from "react-hook-form";
import {
  Eye, 
  EyeOff, 
  ArrowRight,
  Loader2
} from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/services/supabase_client";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
 
const loginSchema = z.object({
  email: z.string().min(2, "Inserisci una mail valida"),
  password: z.string().min(2, "Inserisci una password valida")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //redirect after login success
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/home");
    });
  }, [navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast.success("Bentornato!");
      navigate("/home");

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Errore login");
      setIsLoading(false);
    }
  };

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit", 
    reValidateMode: "onChange" 
  });

  const handleSocialLogin = async (provider: 'google' | 'azure') => {
    setIsLoading(true)

    try{
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/home`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Errore durante il login.");
    } finally {
      setIsLoading(false);
    }
  };

  return(
    <Card className={cn("w-full shadow-none border-0 bg-transparent", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4 p-0">

          {/* EMAIL */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-medium">Email</Label>
            <Input id="email" type="email" placeholder="mail@example.com" className="h-10" {...register("email")} />
            {errors.email && <p className="text-[10px] text-destructive">{errors.email.message}</p>}
          </div>

          {/* PASSWORD */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium">Password</Label>
              <Link 
                  to="/forgotpw" 
                  className="text-[11px] text-primary font-medium hover:underline focus:outline-none"
                  tabIndex={-1}
                >
                  Password dimenticata?
              </Link>
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="h-10 pr-9"
                placeholder="password"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground bg-transparent outline-none! flex items-center justify-center transition-colors select-none!"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-destructive">{errors.password.message}</p>}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 p-0 pt-6">
          <Button 
            type="submit" 
            className="w-full h-10 font-semibold shadow-md text-foreground! bg-primary!" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Accedi <ArrowRight className="ml-2 h-4 w-4 text-foreground!"/>
          </Button>

          {/* SEPARATORE */}
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center"><Separator className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-medium">o continua con</span>
            </div>
          </div>

          {/* SOCIAL BUTTONS */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button 
                variant="outline" 
                type="button" 
                className="w-full h-10 bg-brand-gradient! text-background hover:bg-neutral-100! hover:text-neutral-900! font-medium"
                onClick={()=> handleSocialLogin('google')}
                disabled={isLoading}
              >
                {/* Logo Google */}
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
            <Button 
              variant="outline" 
              type="button" 
                className="w-full h-10 bg-brand-gradient! text-background hover:bg-neutral-100! hover:text-neutral-900! font-medium"
              onClick={() => handleSocialLogin('azure')}
              disabled={isLoading}
            >
              {/* Logo Microsoft */}
              <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              Microsoft
            </Button>
          </div>
          
          <div className="text-center text-xs text-muted-foreground mt-2">
            Non hai un account?{" "} <Link to="/registration" className="font-semibold text-primary hover:underline underline-offset-4">Registrati ora</Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}