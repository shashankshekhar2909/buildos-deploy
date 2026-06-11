"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
});
type FormData = z.infer<typeof schema>;

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const res = await signIn("credentials", { ...data, redirect: false });
    if (res?.error) setError("Invalid email or password");
    else { router.push("/dashboard"); router.refresh(); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Email</label>
        <input {...register("email")} type="email" placeholder="you@example.com"
          autoComplete="email"
          className={`input ${errors.email ? "input-error" : ""}`} />
        {errors.email && <p className="text-xs text-danger-text mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="label">Password</label>
        <input {...register("password")} type="password" placeholder="••••••••"
          autoComplete="current-password"
          className={`input ${errors.password ? "input-error" : ""}`} />
        {errors.password && <p className="text-xs text-danger-text mt-1">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="bg-danger/5 border border-danger/20 rounded-lg px-3 py-2.5">
          <p className="text-sm text-danger-text">{error}</p>
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg w-full mt-1">
        {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign in"}
      </button>
    </form>
  );
}
