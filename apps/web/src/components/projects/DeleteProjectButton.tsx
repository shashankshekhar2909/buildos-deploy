"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeleteProjectButton({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();

  const del = useMutation({
    mutationFn: () => apiClient.delete(`/api/projects/${projectId}`),
    onSuccess: () => router.push("/projects"),
  });

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-danger-text">Delete &quot;{projectName}&quot;?</span>
        <button onClick={() => del.mutate()} disabled={del.isPending} className="btn-danger btn-sm">
          {del.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm"}
        </button>
        <button onClick={() => setConfirm(false)} className="btn-secondary btn-sm">Cancel</button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirm(true)} className="btn-secondary btn-sm">
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
