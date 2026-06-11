"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { repoNameFromUrl } from "@/lib/git-url";
import { Plus, X, Loader2, GitBranch, Globe, Terminal } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name:         z.string().min(1, "Required"),
  githubRepo:   z.string().min(1, "Required").refine(
    (v) => v.startsWith("http") || v.startsWith("git@") || /^[^/\s]+\/[^/\s]+$/.test(v),
    "Enter a git URL (https://..., git@...) or owner/repo"
  ),
  branch:       z.string().min(1).default("main"),
  port:         z.coerce.number().int().min(1).max(65535).default(3000),
  buildCommand: z.string().optional(),
  startCommand: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function NewProjectButton() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { branch: "main", port: 3000 },
  });

  const repoValue = watch("githubRepo");
  const nameValue = watch("name");

  // Auto-fill project name from repo URL
  useEffect(() => {
    if (!repoValue || nameValue) return;
    const detected = repoNameFromUrl(repoValue);
    if (detected) setValue("name", detected);
  }, [repoValue]);

  const create = useMutation({
    mutationFn: (data: FormData) => apiClient.post("/api/projects", data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); setOpen(false); reset(); },
  });

  const close = () => { setOpen(false); reset(); };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary btn-md">
        <Plus className="w-4 h-4" /> New Project
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in">
          <div className="card w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface z-10">
              <h2 className="font-semibold text-text-primary">New Project</h2>
              <button onClick={close} className="btn-ghost btn-sm p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(d => create.mutate(d))} className="p-5 space-y-5">
              {/* Git URL — primary field */}
              <div>
                <label className="label">Git repository URL</label>
                <input
                  {...register("githubRepo")}
                  placeholder="https://github.com/owner/repo  ·  git@github.com:owner/repo  ·  owner/repo"
                  className={`input font-mono text-xs ${errors.githubRepo ? "input-error" : ""}`}
                  autoFocus
                />
                {errors.githubRepo
                  ? <p className="text-xs text-danger-text mt-1">{errors.githubRepo.message}</p>
                  : <p className="text-xs text-text-tertiary mt-1">HTTPS, SSH, or GitHub shorthand (owner/repo)</p>
                }
              </div>

              {/* Name */}
              <div>
                <label className="label">Project name</label>
                <input
                  {...register("name")}
                  placeholder="my-app"
                  className={`input ${errors.name ? "input-error" : ""}`}
                />
                {errors.name && <p className="text-xs text-danger-text mt-1">{errors.name.message}</p>}
              </div>

              {/* Branch + Port row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label flex items-center gap-1.5"><GitBranch className="w-3.5 h-3.5" />Branch</label>
                  <input {...register("branch")} placeholder="main" className="input" />
                </div>
                <div>
                  <label className="label flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />Port</label>
                  <input {...register("port")} type="number" placeholder="3000" className="input" />
                </div>
              </div>

              {/* Build / Start commands */}
              <div className="space-y-3">
                <div>
                  <label className="label flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" />Build command <span className="text-text-tertiary font-normal">(optional)</span></label>
                  <input {...register("buildCommand")} placeholder="npm run build" className="input font-mono text-xs" />
                </div>
                <div>
                  <label className="label flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" />Start command <span className="text-text-tertiary font-normal">(optional)</span></label>
                  <input {...register("startCommand")} placeholder="npm start" className="input font-mono text-xs" />
                </div>
              </div>

              {create.isError && (
                <p className="text-sm text-danger-text">Failed to create project. Check the repo URL and try again.</p>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={close} className="btn-secondary btn-md flex-1">Cancel</button>
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
