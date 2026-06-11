"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { DeploymentStatusBadge } from "./DeploymentStatusBadge";
import { DeploymentFilters } from "./DeploymentFilters";
import { formatDistanceToNow } from "date-fns";

type Filter = "All" | "Running" | "Building" | "Deploying" | "Failed" | "Stopped" | "Queued";

export function DeploymentList() {
  const [filter, setFilter] = useState<Filter>("All");

  const { data: deployments, isLoading } = useQuery({
    queryKey: ["deployments"],
    queryFn: () => apiClient.get("/api/deployments").then(r => r.data),
    refetchInterval: 5000,
  });

  const filtered = filter === "All"
    ? deployments
    : deployments?.filter((d: any) => d.status.toUpperCase() === filter.toUpperCase());

  if (isLoading) return (
    <div className="card divide-y divide-border">
      {[1,2,3].map(i => <div key={i} className="h-14 animate-pulse bg-surface-raised m-px rounded" />)}
    </div>
  );

  return (
    <div className="space-y-4">
      <DeploymentFilters active={filter} onChange={setFilter} />
      <div className="card divide-y divide-border">
        {filtered?.map((d: any) => (
          <Link key={d.id} href={`/deployments/${d.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-surface-raised transition-colors">
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium text-text-primary">{d.project?.name}</p>
              <p className="text-xs text-text-tertiary font-mono truncate">
                {d.commitSha?.slice(0,7) && <span className="mr-2">{d.commitSha.slice(0,7)}</span>}
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
        {!filtered?.length && (
          <div className="py-12 text-center text-text-tertiary text-sm">
            {filter !== "All" ? `No ${filter.toLowerCase()} deployments` : "No deployments found"}
          </div>
        )}
      </div>
    </div>
  );
}
