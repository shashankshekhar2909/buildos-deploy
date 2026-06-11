"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function DeploymentLogs({ deploymentId }: { deploymentId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["logs", deploymentId],
    queryFn: () => apiClient.get(`/api/logs/${deploymentId}`).then((r) => r.data),
    refetchInterval: 3000,
  });

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm">Logs</h3>
      </div>
      <div className="bg-black/90 rounded-b-lg p-4 min-h-64 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <p className="text-gray-400 text-sm font-mono">Loading...</p>
        ) : data?.logs ? (
          <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">{data.logs}</pre>
        ) : (
          <p className="text-gray-500 text-sm font-mono">No logs yet.</p>
        )}
      </div>
    </div>
  );
}
