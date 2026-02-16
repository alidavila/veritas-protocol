import React, { useEffect, useRef } from 'react';
import { Terminal, ShieldAlert, Wifi } from 'lucide-react';

interface TerminalMonitorProps {
  logs: string[];
  status: string;
}

export const TerminalMonitor: React.FC<TerminalMonitorProps> = ({ logs, status }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-veritas-bg border border-veritas-border rounded-lg overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className="bg-veritas-panel px-4 py-2 flex items-center justify-between border-b border-veritas-border">
        <div className="flex items-center gap-2 text-veritas-primary font-tech tracking-wider uppercase text-sm">
          <Terminal size={16} />
          <span>Veritas Kernel Output</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-veritas-muted">
                <Wifi size={12} className={status !== 'IDLE' ? 'text-veritas-success animate-pulse' : 'text-veritas-muted'} />
                {status === 'IDLE' ? 'STANDBY' : 'UPLINK ACTIVE'}
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 font-mono text-xs md:text-sm overflow-y-auto space-y-1 relative bg-black/50">
        {logs.length === 0 && (
          <div className="text-veritas-muted/30 italic absolute inset-0 flex items-center justify-center pointer-events-none">
            // Awaiting Target Designation...
          </div>
        )}
        {logs.map((log, idx) => (
          <div key={idx} className={`${
            log.includes('[ERROR]') || log.includes('COMPROMISED') ? 'text-veritas-danger' : 
            log.includes('[SUCCESS]') || log.includes('BLOCKED') ? 'text-veritas-success' : 
            log.includes('[WARN]') ? 'text-veritas-warning' :
            log.includes('>>') ? 'text-veritas-primary font-bold' : 'text-veritas-text'
          } break-all`}>
            {log}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Footer Status Bar */}
      <div className="bg-veritas-panel border-t border-veritas-border px-4 py-1 text-[10px] font-mono flex justify-between text-veritas-muted uppercase tracking-widest">
        <span>Mem: 4096TB</span>
        <span>Sec_Protocol: ENABLED</span>
        <span>Ver: 3.0.1-GHOST</span>
      </div>
    </div>
  );
};
