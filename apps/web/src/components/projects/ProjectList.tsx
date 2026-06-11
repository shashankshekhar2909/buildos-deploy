"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { DeploymentStatusBadge } from "../deployments/DeploymentStatusBadge";
import { GitBranch, FolderGit2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ProjectList() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiClient.get("/api/projects").then(r => r.data),
  });

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {[1,2,3].map(i => <div key={i} className="card h-24 animate-pulse bg-surface-raised" />)}
    </div>
  );

  if (!projects?.length) return (
    <div className="card py-16 text-center">
      <FolderGit2 className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
      <p className="text-text-secondary text-sm font-medium">No projects yet</p>
      <p className="text-text-tertiary text-xs mt-1">Click "New Project" to connect a GitHub repo</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {projects.map((p: any) => (
        <Link key={p.id} href={`/projects/${p.id}`} className="card-hover p-4 block">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                <FolderGit2 className="w-4 h-4 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                <p className="text-xs text-text-tertiary truncate">{p.githubRepo}</p>
              </div>
            </div>
            {p.deployments?.[0] && <DeploymentStatusBadge status={p.deployments[0].status} />}
          </div>
          <div className="flex items-center justify-between text-xs text-text-tertiary">
            <span className="flex items-center gap-1">
              <GitBranch className="w-3 h-3" />{p.branch}
            </span>
            <span>{formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true })}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
