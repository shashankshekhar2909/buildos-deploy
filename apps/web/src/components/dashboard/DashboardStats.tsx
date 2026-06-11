"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Rocket, FolderGit2, Activity, Globe } from "lucide-react";

export function DashboardStats() {
  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: () => apiClient.get("/api/projects").then(r => r.data) });
  const { data: deployments } = useQuery({ queryKey: ["deployments"], queryFn: () => apiClient.get("/api/deployments").then(r => r.data) });

  const stats = [
    { label: "Projects",    value: projects?.length ?? 0,                                                           icon: FolderGit2, color: "text-accent" },
    { label: "Deployments", value: deployments?.length ?? 0,                                                        icon: Rocket,     color: "text-info-text" },
    { label: "Running",     value: deployments?.filter((d: any) => d.status === "RUNNING").length ?? 0,             icon: Activity,   color: "text-success-text" },
    { label: "Failed",      value: deployments?.filter((d: any) => d.status === "FAILED").length ?? 0,              icon: Globe,      color: "text-danger-text" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="card px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</span>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <p className="text-2xl font-semibold text-text-primary tabular-nums">{value}</p>
        </div>
      ))}
    </div>
  );
}
