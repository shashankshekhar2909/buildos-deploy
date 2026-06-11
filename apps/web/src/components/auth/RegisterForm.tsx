"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

export function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
    });
    if (!res.ok) { const b = await res.json(); setError(b.error || "Registration failed"); return; }

    const signInRes = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    if (signInRes?.error) onSuccess();
    else { router.push("/dashboard"); router.refresh(); }
  };

  const fields = [
    { key: "name" as const,            label: "Full name",        type: "text",     placeholder: "Jane Smith",      auto: "name" },
    { key: "email" as const,           label: "Email",            type: "email",    placeholder: "you@example.com", auto: "email" },
    { key: "password" as const,        label: "Password",         type: "password", placeholder: "Min 8 characters",auto: "new-password" },
    { key: "confirmPassword" as const, label: "Confirm password", type: "password", placeholder: "••••••••",        auto: "new-password" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map(f => (
        <div key={f.key}>
          <label className="label">{f.label}</label>
          <input {...register(f.key)} type={f.type} placeholder={f.placeholder}
            autoComplete={f.auto}
            className={`input ${errors[f.key] ? "input-error" : ""}`} />
          {errors[f.key] && <p className="text-xs text-danger-text mt-1">{errors[f.key]?.message}</p>}
        </div>
      ))}

      {error && (
        <div className="bg-danger/5 border border-danger/20 rounded-lg px-3 py-2.5">
          <p className="text-sm text-danger-text">{error}</p>
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg w-full mt-1">
        {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : "Create account"}
      </button>
    </form>
  );
}
