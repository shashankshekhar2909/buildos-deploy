"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

const schema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(8, "At least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

export function SettingsSecurity() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const res = await fetch("/api/user/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    });
    if (!res.ok) { const b = await res.json(); setError(b.error); return; }
    setSuccess(true);
    reset();
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-text-primary">Security</h2>
        <p className="text-xs text-text-tertiary mt-0.5">Change your password</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
        {[
          { key: "currentPassword" as const, label: "Current password" },
          { key: "newPassword" as const,     label: "New password" },
          { key: "confirmPassword" as const, label: "Confirm new password" },
        ].map(f => (
          <div key={f.key} className="max-w-sm">
            <label className="label">{f.label}</label>
            <input {...register(f.key)} type="password" placeholder="••••••••" className={`input ${errors[f.key] ? "input-error" : ""}`} />
            {errors[f.key] && <p className="text-xs text-danger-text mt-1">{errors[f.key]?.message}</p>}
          </div>
        ))}
        {error && <p className="text-sm text-danger-text">{error}</p>}
        {success && <p className="text-sm text-success-text">Password updated successfully</p>}
        <button type="submit" disabled={isSubmitting} className="btn-primary btn-md">
          {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : "Update password"}
        </button>
      </form>
    </div>
  );
}
