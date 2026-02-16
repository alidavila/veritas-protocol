import { useEffect, useState } from 'react';
import { ArrowDown, Zap, Target, DollarSign, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FunnelStepProps {
  icon: React.ElementType;
  title: string;
  value: string;
  detail: string;
  color: string;
  loading?: boolean;
}

const FunnelStep = ({ icon: Icon, title, value, detail, color, loading }: FunnelStepProps) => (
  <div className="relative flex flex-col items-center group">
    <div className={`p-4 rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:border-${color}-500/50 transition-all duration-500 w-full max-w-md`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${color}-500/10`}>
            <Icon className={`w-5 h-5 text-${color}-500`} />
          </div>
          <span className="text-sm font-bold text-zinc-200">{title}</span>
        </div>
        <span className={`text-xl font-mono font-bold text-${color}-400`}>
          {loading ? '...' : value}
        </span>
      </div>
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{detail}</p>
    </div>
    <ArrowDown className="w-4 h-4 text-zinc-700 my-2 animate-bounce" />
  </div>
);

export const RevenueFunnel = () => {
  const [metrics, setMetrics] = useState({
    leads: 0,
    qualified: 0,
    gatekeepers: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('funnel_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_ledger' }, () => {
        fetchMetrics(); // Refresh on any new event
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchMetrics = async () => {
    try {
      // Fetch all ledger entries to calculate real metrics
      const { data, error } = await supabase
        .from('agent_ledger')
        .select('action, amount');

      if (error) throw error;

      const leads = data?.filter(d => d.action === 'LEAD_FOUND').length || 0;
      const qualified = data?.filter(d => d.action === 'GEO_AUDIT_COMPLETED').length || 0;
      const gatekeepers = data?.filter(d => d.action === 'IDENTITY_REGISTERED').length || 0;
      const revenue = data
        ?.filter(d => d.action === 'PAYMENT_ACCEPTED')
        .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0) || 0;

      setMetrics({ leads, qualified, gatekeepers, revenue });
    } catch (e) {
      console.error('[RevenueFunnel] Error fetching metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-black/40 rounded-3xl border border-zinc-800/50 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-white">Embudo de Ingresos Veritas</h3>
          <p className="text-xs text-zinc-500">Datos en tiempo real desde Supabase</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-500 font-bold animate-pulse">
          LIVE DATA
        </div>
      </div>

      <div className="space-y-2">
        <FunnelStep
          icon={Target}
          title="Hunter: Lead Detection"
          value={metrics.leads.toLocaleString()}
          detail="Leads Detectados por Hunter Agent"
          color="blue"
          loading={loading}
        />
        <FunnelStep
          icon={Zap}
          title="Ghost: GEO Audits"
          value={metrics.qualified.toLocaleString()}
          detail="Auditorías GEO Completadas"
          color="purple"
          loading={loading}
        />
        <FunnelStep
          icon={ShieldCheck}
          title="Identidades Registradas"
          value={metrics.gatekeepers.toLocaleString()}
          detail="Agentes con DID + Wallet Veritas"
          color="emerald"
          loading={loading}
        />

        <div className="pt-4 flex flex-col items-center">
          <div className="w-full max-w-md p-6 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Total Revenue (X402 Payments)</p>
                <h4 className="text-3xl font-mono font-bold text-white">
                  {loading ? '...' : `${metrics.revenue.toFixed(4)} ETH`}
                </h4>
              </div>
              <div className="p-4 bg-emerald-500 rounded-xl">
                <DollarSign className="w-8 h-8 text-black" />
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-1000"
                style={{ width: `${Math.min(100, metrics.revenue * 1000)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
