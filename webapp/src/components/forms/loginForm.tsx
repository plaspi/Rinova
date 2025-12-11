import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

export function LoginForm() {
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000); // finto delay per lo skeleton
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 w-full max-w-md">
      <Input type="email" placeholder="Email" required />
      <Input type="password" placeholder="Password" required />
      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
        {loading ? "Accesso in corso..." : "Accedi"}
      </Button>
    </form>
  );
}
