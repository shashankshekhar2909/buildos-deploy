"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Required"),
  githubRepo: z.string().regex(/^[^/]+\/[^/]+$/, "Format: owner/repo"),
  branch: z.string().default("main"),
  port: z.coerce.number().int().min(1).max(65535).default(3000),
  buildCommand: z.string().optional(),
  startCommand: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function NewProjectButton() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { branch: "main", port: 3000 },
  });

  const create = useMutation({
    mutationFn: (data: FormData) =>
      apiClient.post("/api/projects", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      reset();
    },
  });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        New Project
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Project</h2>
              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit((d) => create.mutate(d))} className="space-y-3">
              {[
                { name: "name" as const, label: "Project Name", placeholder: "my-app" },
                { name: "githubRepo" as const, label: "GitHub Repo", placeholder: "owner/repo" },
                { name: "branch" as const, label: "Branch", placeholder: "main" },
                { name: "port" as const, label: "Port", placeholder: "3000" },
                { name: "buildCommand" as const, label: "Build Command", placeholder: "npm run build" },
                { name: "startCommand" as const, label: "Start Command", placeholder: "npm start" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="text-sm font-medium block mb-1">{f.label}</label>
                  <input
                    {...register(f.name)}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors[f.name] && (
                    <p className="text-xs text-destructive mt-1">{errors[f.name]?.message}</p>
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={create.isPending}
                className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {create.isPending ? "Creating..." : "Create Project"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
