"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Plus, X, Loader2 } from "lucide-react";

export function AddDomainButton() {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [projectId, setProjectId] = useState("");
  const qc = useQueryClient();
  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: () => apiClient.get("/api/projects").then(r => r.data) });

  const add = useMutation({
    mutationFn: () => apiClient.post("/api/domains", { domain, projectId }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["domains"] }); setOpen(false); setDomain(""); setProjectId(""); },
  });

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary btn-md">
        <Plus className="w-4 h-4" /> Add Domain
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in">
          <div className="card w-full max-w-sm shadow-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-text-primary">Add Domain</h2>
              <button onClick={() => setOpen(false)} className="btn-ghost btn-sm p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">Domain</label>
                <input value={domain} onChange={e => setDomain(e.target.value)}
                  placeholder="app.example.com" className="input" />
              </div>
              <div>
                <label className="label">Project</label>
                <select value={projectId} onChange={e => setProjectId(e.target.value)} className="input">
                  <option value="">Select project...</option>
                  {projects?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setOpen(false)} className="btn-secondary btn-md flex-1">Cancel</button>
                <button onClick={() => add.mutate()} disabled={!domain || !projectId || add.isPending}
                  className="btn-primary btn-md flex-1">
                  {add.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : "Add Domain"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
