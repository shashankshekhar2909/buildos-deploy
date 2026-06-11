"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "lucide-react";

export function DeploymentLogs({ deploymentId }: { deploymentId: string }) {
  const [logs, setLogs] = useState<string>("");
  const [done, setDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource(`/api/deployments/${deploymentId}/stream`);
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.log) setLogs((prev) => prev + data.log);
      if (data.done) { setDone(true); es.close(); }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [deploymentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-text-tertiary" />
          <h3 className="text-sm font-medium text-text-secondary">Build & Runtime Logs</h3>
        </div>
        {done && <span className="text-xs text-text-tertiary">Stream ended</span>}
        {!done && logs && (
          <span className="flex items-center gap-1.5 text-xs text-info-text">
            <span className="w-1.5 h-1.5 rounded-full bg-info animate-pulse" />
            Live
          </span>
        )}
      </div>
      <div className="log-output min-h-48 max-h-[500px]">
        {!logs
          ? <span className="text-text-tertiary">Waiting for deployment to start...</span>
          : <pre className="whitespace-pre-wrap break-all">{logs}</pre>
        }
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
