import React from 'react';
import { Ghost, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-6 border-b border-veritas-border bg-veritas-bg/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-veritas-primary blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <Ghost className="w-8 h-8 text-veritas-primary relative z-10" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-white font-tech uppercase">
              Veritas <span className="text-veritas-primary">Ghost Auditor</span>
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-veritas-muted font-mono tracking-widest uppercase">
              <span>Ops Center</span>
              <span className="w-1 h-1 rounded-full bg-veritas-muted"></span>
              <span>v1.0.0-beta</span>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-veritas-muted uppercase tracking-wider">Saldo Operativo</span>
            <span className="text-sm font-mono font-bold text-veritas-success">2,450.00 USDC</span>
          </div>
          <div className="h-8 w-px bg-veritas-border"></div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-veritas-primary/30 bg-veritas-primary/5 text-veritas-primary text-xs font-bold uppercase tracking-wide">
            <ShieldCheck size={14} />
            <span>Veritas Node Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};
