"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Globe, CheckCircle, XCircle } from "lucide-react";

export function DomainList() {
  const { data: domains, isLoading } = useQuery({
    queryKey: ["domains"],
    queryFn: () => apiClient.get("/api/domains").then((r) => r.data),
  });

  if (isLoading) return <div className="text-muted-foreground text-sm">Loading...</div>;

  return (
    <div className="border border-border rounded-lg divide-y divide-border">
      {domains?.map((d: any) => (
        <div key={d.id} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{d.domain}</p>
              <p className="text-xs text-muted-foreground">{d.project?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {d.verified ? (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" /> Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-yellow-600">
                <XCircle className="w-3 h-3" /> Pending
              </span>
            )}
          </div>
        </div>
      ))}
      {domains?.length === 0 && (
        <div className="p-8 text-center text-muted-foreground text-sm">No domains configured.</div>
      )}
    </div>
  );
}
