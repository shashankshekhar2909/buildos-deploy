"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Plus, X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name:         z.string().min(1, "Required"),
  githubRepo:   z.string().regex(/^[^/]+\/[^/]+$/, "Format: owner/repo"),
  branch:       z.string().default("main"),
  port:         z.coerce.number().int().min(1).max(65535).default(3000),
  buildCommand: z.string().optional(),
  startCommand: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const fields = [
  { name: "name" as const,         label: "Project name",   placeholder: "my-app",       type: "text" },
  { name: "githubRepo" as const,   label: "GitHub repo",    placeholder: "owner/repo",   type: "text" },
  { name: "branch" as const,       label: "Branch",         placeholder: "main",         type: "text" },
  { name: "port" as const,         label: "Port",           placeholder: "3000",         type: "number" },
  { name: "buildCommand" as const, label: "Build command",  placeholder: "npm run build",type: "text" },
  { name: "startCommand" as const, label: "Start command",  placeholder: "npm start",    type: "text" },
];

export function NewProjectButton() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { branch: "main", port: 3000 },
  });

  const create = useMutation({
    mutationFn: (data: FormData) => apiClient.post("/api/projects", data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); setOpen(false); reset(); },
  });

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary btn-md">
        <Plus className="w-4 h-4" /> New Project
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in">
          <div className="card w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-text-primary">New Project</h2>
              <button onClick={() => setOpen(false)} className="btn-ghost btn-sm p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(d => create.mutate(d))} className="p-5 space-y-4">
              {fields.map(f => (
                <div key={f.name}>
                  <label className="label">{f.label}</label>
                  <input {...register(f.name)} type={f.type} placeholder={f.placeholder}
                    className={`input ${errors[f.name] ? "input-error" : ""}`} />
                  {errors[f.name] && <p className="text-xs text-danger-text mt-1">{errors[f.name]?.message}</p>}
                </div>
              ))}

              {create.isError && (
                <p className="text-sm text-danger-text">Failed to create project. Try again.</p>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary btn-md flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={create.isPending} className="btn-primary btn-md flex-1">
                  {create.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
