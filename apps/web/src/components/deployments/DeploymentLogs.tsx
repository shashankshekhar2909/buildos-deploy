"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Terminal } from "lucide-react";

export function DeploymentLogs({ deploymentId }: { deploymentId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["logs", deploymentId],
    queryFn: () => apiClient.get(`/api/logs/${deploymentId}`).then(r => r.data),
    refetchInterval: 3000,
  });

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Terminal className="w-4 h-4 text-text-tertiary" />
        <h3 className="text-sm font-medium text-text-secondary">Build & Runtime Logs</h3>
      </div>
      <div className="log-output min-h-48 max-h-[500px]">
        {isLoading
          ? <span className="text-text-tertiary">Fetching logs...</span>
          : data?.logs
            ? data.logs
            : <span className="text-text-tertiary">No logs yet. Waiting for deployment to start...</span>
        }
      </div>
    </div>
  );
}
