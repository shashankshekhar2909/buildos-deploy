"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { DeploymentStatusBadge } from "./DeploymentStatusBadge";
import { formatDistanceToNow } from "date-fns";

export function DeploymentList() {
  const { data: deployments, isLoading } = useQuery({
    queryKey: ["deployments"],
    queryFn: () => apiClient.get("/api/deployments").then((r) => r.data),
  });

  if (isLoading) return <div className="text-muted-foreground text-sm">Loading...</div>;

  return (
    <div className="border border-border rounded-lg divide-y divide-border">
      {deployments?.map((d: any) => (
        <Link
          key={d.id}
          href={`/deployments/${d.id}`}
          className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
        >
          <div className="min-w-0 space-y-0.5">
            <p className="font-medium truncate">{d.project?.name}</p>
            <p className="text-xs text-muted-foreground">{d.project?.githubRepo}</p>
            <p className="text-xs text-muted-foreground truncate">
              {d.commitMessage || d.commitSha?.slice(0, 7) || "Manual deploy"}
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <DeploymentStatusBadge status={d.status} />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
            </span>
          </div>
        </Link>
      ))}
      {deployments?.length === 0 && (
        <div className="p-8 text-center text-muted-foreground text-sm">No deployments yet.</div>
      )}
    </div>
  );
}
