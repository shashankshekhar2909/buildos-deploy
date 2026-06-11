"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { DeploymentStatusBadge } from "./DeploymentStatusBadge";
import { RefreshCw, Square, ExternalLink, GitCommit, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export function DeploymentDetail({ id }: { id: string }) {
  const qc = useQueryClient();
  const { data: d, isLoading } = useQuery({
    queryKey: ["deployment", id],
    queryFn: () => apiClient.get(`/api/deployments/${id}`).then(r => r.data),
    refetchInterval: 5000,
  });

  const action = useMutation({
    mutationFn: (act: "restart" | "stop") =>
      apiClient.patch(`/api/deployments/${id}`, { action: act }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deployment", id] }),
  });

  if (isLoading || !d) return <div className="card px-5 py-4 text-text-tertiary text-sm">Loading...</div>;

  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-border flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="text-base font-semibold text-text-primary">{d.project?.name}</h2>
            <DeploymentStatusBadge status={d.status} />
          </div>
          <p className="text-xs text-text-tertiary font-mono">{d.project?.githubRepo}</p>
        </div>
        {d.url && (
          <a href={d.url} target="_blank" rel="noopener noreferrer"
            className="btn-secondary btn-sm">
            <ExternalLink className="w-3.5 h-3.5" /> Open
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-border border-b border-border">
        {[
          { label: "Commit", icon: GitCommit, value: d.commitSha?.slice(0,12) || "—", mono: true },
          { label: "Message", icon: null, value: d.commitMessage || "Manual deploy" },
          { label: "Started", icon: Clock, value: d.startedAt ? formatDistanceToNow(new Date(d.startedAt), { addSuffix: true }) : "—" },
          { label: "Created", icon: null, value: format(new Date(d.createdAt), "MMM d, HH:mm") },
        ].map(({ label, value, mono }) => (
          <div key={label} className="px-4 py-3">
            <p className="text-xs text-text-tertiary mb-1">{label}</p>
            <p className={`text-sm text-text-primary truncate ${mono ? "font-mono" : ""}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 flex gap-2">
        <button onClick={() => action.mutate("restart")} disabled={action.isPending}
          className="btn-secondary btn-sm">
          <RefreshCw className="w-3.5 h-3.5" /> Restart
        </button>
        <button onClick={() => action.mutate("stop")}
          disabled={action.isPending || d.status === "STOPPED"}
          className="btn-danger btn-sm">
          <Square className="w-3.5 h-3.5" /> Stop
        </button>
      </div>
    </div>
  );
}
