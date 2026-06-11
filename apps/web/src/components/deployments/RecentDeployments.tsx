"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { DeploymentStatusBadge } from "./DeploymentStatusBadge";
import { formatDistanceToNow } from "date-fns";
import { Rocket } from "lucide-react";

export function RecentDeployments() {
  const { data: deployments, isLoading } = useQuery({
    queryKey: ["deployments"],
    queryFn: () => apiClient.get("/api/deployments").then(r => r.data),
  });

  return (
    <div>
      <h3 className="text-sm font-medium text-text-secondary mb-3">Recent Deployments</h3>
      <div className="card divide-y divide-border">
        {isLoading && (
          <div className="px-4 py-8 text-center text-text-tertiary text-sm">Loading...</div>
        )}
        {!isLoading && deployments?.length === 0 && (
          <div className="px-4 py-10 text-center">
            <Rocket className="w-8 h-8 text-text-tertiary mx-auto mb-3" />
            <p className="text-sm text-text-secondary">No deployments yet</p>
            <Link href="/projects" className="text-xs text-accent hover:underline mt-1 block">Create a project →</Link>
          </div>
        )}
        {deployments?.slice(0, 8).map((d: any) => (
          <Link key={d.id} href={`/deployments/${d.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-surface-raised transition-colors">
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{d.project?.name}</p>
              <p className="text-xs text-text-tertiary truncate mt-0.5 font-mono">
                {d.commitSha?.slice(0, 7) && <span className="mr-2">{d.commitSha.slice(0, 7)}</span>}
                {d.commitMessage || "Manual deploy"}
              </p>
            </div>
            <div className="flex items-center gap-3 ml-4 shrink-0">
              <DeploymentStatusBadge status={d.status} />
              <span className="text-xs text-text-tertiary">
                {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
