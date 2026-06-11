"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Rocket, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeployButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const qc = useQueryClient();

  const deploy = useMutation({
    mutationFn: () => apiClient.post("/api/deployments", { projectId, commitMessage: "Manual deploy" }).then(r => r.data),
    onSuccess: (deployment) => {
      qc.invalidateQueries({ queryKey: ["deployments"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      router.push(`/deployments/${deployment.id}`);
    },
  });

  return (
    <button
      onClick={() => deploy.mutate()}
      disabled={deploy.isPending}
      className="btn-primary btn-md"
    >
      {deploy.isPending
        ? <><Loader2 className="w-4 h-4 animate-spin" /> Deploying...</>
        : <><Rocket className="w-4 h-4" /> Deploy</>
      }
    </button>
  );
}
