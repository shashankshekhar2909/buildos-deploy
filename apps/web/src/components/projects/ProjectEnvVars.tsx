"use client";

import { useState } from "react";
import { Plus, Eye, EyeOff, Trash2, Save } from "lucide-react";

interface EnvVar { key: string; value: string; reveal: boolean }

export function ProjectEnvVars({ projectId }: { projectId: string }) {
  const [vars, setVars] = useState<EnvVar[]>([]);
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  const add = () => {
    if (!newKey.trim()) return;
    setVars((v) => [...v, { key: newKey.trim(), value: newVal, reveal: false }]);
    setNewKey("");
    setNewVal("");
  };

  const remove = (idx: number) => setVars((v) => v.filter((_, i) => i !== idx));
  const toggle = (idx: number) => setVars((v) => v.map((x, i) => i === idx ? { ...x, reveal: !x.reveal } : x));

  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Environment variables</h2>
          <p className="text-xs text-text-tertiary mt-0.5">Available at build and runtime</p>
        </div>
        {vars.length > 0 && (
          <button className="btn-primary btn-sm flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" /> Save all
          </button>
        )}
      </div>

      {vars.length > 0 && (
        <div className="divide-y divide-border">
          {vars.map((v, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <span className="text-xs font-mono text-text-primary w-40 shrink-0 truncate">{v.key}</span>
              <span className="text-xs font-mono text-text-secondary flex-1 truncate">
                {v.reveal ? v.value : "•".repeat(Math.min(v.value.length, 16))}
              </span>
              <button onClick={() => toggle(i)} className="text-text-tertiary hover:text-text-primary">
                {v.reveal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => remove(i)} className="text-text-tertiary hover:text-danger-text">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-5 flex gap-2">
        <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="KEY" className="input font-mono text-xs w-40" />
        <input value={newVal} onChange={(e) => setNewVal(e.target.value)} placeholder="value" className="input font-mono text-xs flex-1" type="password" />
        <button onClick={add} className="btn-secondary btn-sm flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
    </div>
  );
}
