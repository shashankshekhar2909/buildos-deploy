"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Globe, CheckCircle2, Clock } from "lucide-react";

export function DomainList() {
  const { data: domains, isLoading } = useQuery({
    queryKey: ["domains"],
    queryFn: () => apiClient.get("/api/domains").then(r => r.data),
  });

  if (isLoading) return <div className="card py-8 text-center text-text-tertiary text-sm">Loading...</div>;

  return (
    <div className="card divide-y divide-border">
      {domains?.map((d: any) => (
        <div key={d.id} className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center">
              <Globe className="w-4 h-4 text-text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{d.domain}</p>
              <p className="text-xs text-text-tertiary">{d.project?.name}</p>
            </div>
          </div>
          {d.verified ? (
            <span className="badge-running"><CheckCircle2 className="w-3 h-3" /> Verified</span>
          ) : (
            <span className="badge-queued"><Clock className="w-3 h-3" /> Pending DNS</span>
          )}
        </div>
      ))}
      {!domains?.length && (
        <div className="py-12 text-center">
          <Globe className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
          <p className="text-sm text-text-secondary">No domains configured</p>
        </div>
      )}
    </div>
  );
}
