"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(1, "Required").max(100),
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Registration failed");
      return;
    }

    // Auto sign-in after registration
    const signInRes = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (signInRes?.error) {
      onSuccess(); // redirect to sign-in tab
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const fields = [
    { name: "name" as const, label: "Full name", type: "text", placeholder: "Jane Smith", autoComplete: "name" },
    { name: "email" as const, label: "Email", type: "email", placeholder: "you@example.com", autoComplete: "email" },
    { name: "password" as const, label: "Password", type: "password", placeholder: "Min 8 characters", autoComplete: "new-password" },
    { name: "confirmPassword" as const, label: "Confirm password", type: "password", placeholder: "••••••••", autoComplete: "new-password" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((f) => (
        <div key={f.name}>
          <label className="block text-sm font-medium mb-1">{f.label}</label>
          <input
            {...register(f.name)}
            type={f.type}
            placeholder={f.placeholder}
            autoComplete={f.autoComplete}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {errors[f.name] && (
            <p className="text-xs text-destructive mt-1">{errors[f.name]?.message}</p>
          )}
        </div>
      ))}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
