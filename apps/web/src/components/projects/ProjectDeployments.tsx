"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Deployment {
  id: string;
  status: string;
  createdAt: Date | string;
  commitSha?: string | null;
  commitMessage?: string | null;
  url?: string | null;
}

export function ProjectDeployments({ deployments }: { deployments: Deployment[] }) {
  if (!deployments.length) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-text-tertiary">No deployments yet</p>
      </div>
    );
  }

  return (
    <div className="card divide-y divide-border">
      {deployments.map((d) => (
        <Link key={d.id} href={`/deployments/${d.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-hover transition-colors">
          <span className={`badge-${d.status.toLowerCase()}`}>{d.status}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-primary truncate">{d.commitMessage || d.id.slice(0, 8)}</p>
            {d.commitSha && <p className="text-xs text-text-tertiary font-mono">{d.commitSha.slice(0, 7)}</p>}
          </div>
          <span className="text-xs text-text-tertiary shrink-0">
            {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
          </span>
          <ChevronRight className="w-4 h-4 text-text-tertiary shrink-0" />
        </Link>
      ))}
    </div>
  );
}
