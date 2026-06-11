"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { DeploymentStatusBadge } from "./DeploymentStatusBadge";
import { RefreshCw, Square, Trash2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function DeploymentDetail({ id }: { id: string }) {
  const qc = useQueryClient();
  const { data: deployment, isLoading } = useQuery({
    queryKey: ["deployment", id],
    queryFn: () => apiClient.get(`/api/deployments/${id}`).then((r) => r.data),
    refetchInterval: 5000,
  });

  const action = useMutation({
    mutationFn: (act: "restart" | "stop") =>
      apiClient.patch(`/api/deployments/${id}`, { action: act }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deployment", id] }),
  });

  if (isLoading || !deployment) return <div className="text-muted-foreground text-sm">Loading...</div>;

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">{deployment.project?.name}</h2>
          <p className="text-sm text-muted-foreground">{deployment.project?.githubRepo}</p>
          {deployment.commitMessage && (
            <p className="text-sm mt-1">{deployment.commitMessage}</p>
          )}
        </div>
        <DeploymentStatusBadge status={deployment.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Commit</span>
          <p className="font-mono">{deployment.commitSha?.slice(0, 12) || "—"}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Created</span>
          <p>{formatDistanceToNow(new Date(deployment.createdAt), { addSuffix: true })}</p>
        </div>
        {deployment.url && (
          <div>
            <span className="text-muted-foreground">URL</span>
            <a
              href={deployment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary"
            >
              {deployment.url} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2 border-t border-border">
        <button
          onClick={() => action.mutate("restart")}
          disabled={action.isPending}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          Restart
        </button>
        <button
          onClick={() => action.mutate("stop")}
          disabled={action.isPending || deployment.status === "STOPPED"}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50"
        >
          <Square className="w-4 h-4" />
          Stop
        </button>
      </div>
    </div>
  );
}
