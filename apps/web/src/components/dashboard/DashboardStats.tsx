"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Rocket, FolderGit2, Globe, Activity } from "lucide-react";

export function DashboardStats() {
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiClient.get("/api/projects").then((r) => r.data),
  });

  const { data: deployments } = useQuery({
    queryKey: ["deployments"],
    queryFn: () => apiClient.get("/api/deployments").then((r) => r.data),
  });

  const stats = [
    {
      label: "Total Projects",
      value: projects?.length ?? 0,
      icon: FolderGit2,
    },
    {
      label: "Total Deployments",
      value: deployments?.length ?? 0,
      icon: Rocket,
    },
    {
      label: "Running",
      value: deployments?.filter((d: any) => d.status === "RUNNING").length ?? 0,
      icon: Activity,
    },
    {
      label: "Domains",
      value: "—",
      icon: Globe,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}
