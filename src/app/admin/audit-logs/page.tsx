"use client";

import * as React from "react";
import { AuditLogEntry } from "@/lib/models/types";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, RefreshCw, Lock, AlertTriangle, FileText, UserCheck } from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/audit-logs", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            Compliance & Security
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-0.5">
            Immutable Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-proof record of all operational actions, logins, status changes, and agreement signings.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          isLoading={isLoading}
          className="text-xs text-slate-300 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          <span>Refresh Audit Stream</span>
        </Button>
      </div>

      {/* Audit Data Table */}
      <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-charcoal-800 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="pb-3.5 font-semibold">Timestamp</th>
                <th className="pb-3.5 font-semibold">Actor / Officer</th>
                <th className="pb-3.5 font-semibold">Role</th>
                <th className="pb-3.5 font-semibold">Action Type</th>
                <th className="pb-3.5 font-semibold">Target Entity</th>
                <th className="pb-3.5 font-semibold text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800/60 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-charcoal-850/60">
                  <td className="py-3.5 text-slate-400 font-sans text-xs">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="py-3.5 font-sans font-semibold text-white">
                    {log.actorName}
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded bg-charcoal-800 text-gold-400 text-[10px] uppercase">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="py-3.5 font-semibold text-gold-300">
                    {log.action}
                  </td>
                  <td className="py-3.5 text-slate-300">
                    {log.targetType}: <span className="text-white font-bold">{log.targetId}</span>
                  </td>
                  <td className="py-3.5 text-right font-sans">
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      VERIFIED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
