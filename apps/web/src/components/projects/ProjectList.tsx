"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { DeploymentStatusBadge } from "../deployments/DeploymentStatusBadge";
import { FolderGit2, GitBranch } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ProjectList() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiClient.get("/api/projects").then((r) => r.data),
  });

  if (isLoading) return <div className="text-muted-foreground text-sm">Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects?.map((p: any) => (
        <Link
          key={p.id}
          href={`/projects/${p.id}`}
          className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.githubRepo}</p>
              </div>
            </div>
            {p.deployments?.[0] && (
              <DeploymentStatusBadge status={p.deployments[0].status} />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <GitBranch className="w-3 h-3" />
            <span>{p.branch}</span>
            <span className="ml-auto">
              {formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true })}
            </span>
          </div>
        </Link>
      ))}
      {projects?.length === 0 && (
        <div className="col-span-3 p-12 text-center text-muted-foreground">
          No projects yet. Click &quot;New Project&quot; to connect a GitHub repo.
        </div>
      )}
    </div>
  );
}
