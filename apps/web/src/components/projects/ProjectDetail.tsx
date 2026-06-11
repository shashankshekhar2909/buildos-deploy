"use client";

import { Globe, GitBranch, Clock, Activity } from "lucide-react";

interface Deployment {
  id: string;
  status: string;
  createdAt: Date | string;
  url?: string | null;
}

interface ProjectDetailProps {
  project: {
    id: string;
    name: string;
    githubRepo: string;
    branch: string;
    deployments?: Deployment[];
    domains?: { domain: string }[];
  };
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const latest = project.deployments?.[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<Activity className="w-4 h-4" />} label="Status" value={latest?.status || "idle"} />
        <Stat icon={<Globe className="w-4 h-4" />} label="Domain" value={project.domains?.[0]?.domain || "—"} />
        <Stat icon={<GitBranch className="w-4 h-4" />} label="Branch" value={project.branch} />
        <Stat icon={<Clock className="w-4 h-4" />} label="Last deploy" value={latest ? new Date(latest.createdAt).toLocaleDateString() : "Never"} />
      </div>

      {project.githubRepo && (
        <div className="card p-4">
          <p className="text-xs text-text-tertiary mb-1">Repository</p>
          <a href={project.githubRepo} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline break-all">
            {project.githubRepo}
          </a>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="text-text-tertiary">{icon}</div>
      <div>
        <p className="text-xs text-text-tertiary">{label}</p>
        <p className="text-sm font-medium text-text-primary truncate">{value}</p>
      </div>
    </div>
  );
}
