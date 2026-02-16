import { useEffect, useState } from 'react'
import { Activity, Power, Terminal } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface AgentLog {
    id: string
    agent_id: string
    action: string
    amount: number
    details: any
    created_at: string
}

export function ProtocolVisualizer({ theme }: { theme: 'dark' | 'light' }) {
    const [logs, setLogs] = useState<AgentLog[]>([])
    const [systemStatus, setSystemStatus] = useState<'running' | 'stopped'>('stopped')
    const [isLoading, setIsLoading] = useState(false)

    const isDark = theme === 'dark'
    const bg = isDark ? 'bg-zinc-950' : 'bg-white'
    const panelBg = isDark ? 'bg-zinc-900/50' : 'bg-zinc-50'
    const border = isDark ? 'border-zinc-800' : 'border-zinc-200'
    const textMain = isDark ? 'text-zinc-200' : 'text-zinc-800'
    const textSub = isDark ? 'text-zinc-500' : 'text-zinc-500'
    const accent = isDark ? 'text-emerald-400' : 'text-emerald-600'

    // Fetch logs and control state
    useEffect(() => {
        fetchLogs()
        fetchControlState()

        // Real-time subscription
        const channel = supabase
            .channel('ledger_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_ledger' }, (payload) => {
                setLogs(prev => [payload.new as AgentLog, ...prev].slice(0, 50))
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchLogs = async () => {
        const { data } = await supabase
            .from('agent_ledger')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)

        if (data) {
            console.log(`[ProtocolVisualizer] Loaded ${data.length} real logs from Supabase`)
            setLogs(data)
        }
    }

    const fetchControlState = async () => {
        const { data } = await supabase
            .from('agent_control')
            .select('status')
            .single()
        if (data) setSystemStatus(data.status)
    }

    const toggleSystem = async () => {
        setIsLoading(true)
        const newStatus = systemStatus === 'running' ? 'stopped' : 'running'

        const { data: controlRow } = await supabase.from('agent_control').select('id').single()

        const { error } = await supabase
            .from('agent_control')
            .update({ status: newStatus })
            .eq('id', controlRow?.id)

        if (!error) {
            setSystemStatus(newStatus)
        }
        setIsLoading(false)
    }

    const getActionColor = (action: string) => {
        if (action.includes('LEAD')) return 'text-blue-400'
        if (action.includes('FUND')) return 'text-emerald-400'
        if (action.includes('ALERT')) return 'text-red-400'
        if (action.includes('PAYMENT')) return 'text-yellow-400'
        return textSub
    }

    return (
        <div className={`h-full flex flex-col p-6 font-mono text-xs ${bg} ${textMain}`}>
            {/* HEADER */}
            <div className={`flex justify-between items-center mb-6 pb-4 border-b ${border}`}>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Terminal className={`w-4 h-4 ${accent}`} />
                        <span className="font-bold tracking-widest">VERITAS PROTOCOL - LIVE FEED</span>
                    </div>
                    <div className={textSub}>Real-Time Agent Activity from Supabase</div>
                </div>
                <button
                    onClick={toggleSystem}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${systemStatus === 'running'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                        } ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                >
                    <Power className="w-4 h-4" />
                    {isLoading ? 'SWITCHING...' : systemStatus === 'running' ? 'AGENTS: ON' : 'AGENTS: OFF'}
                </button>
            </div>

            {/* LIVE LOGS */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-orange-500 animate-pulse" />
                    <span className="font-bold">AGENT LEDGER ({logs.length} events)</span>
                </div>

                <div className={`flex-1 overflow-y-auto rounded-lg border ${border} ${panelBg} p-4 space-y-2`}>
                    {logs.length === 0 ? (
                        <div className={`${textSub} text-center py-8`}>
                            No activity yet. Start the agents with the button above.
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className={`p-3 rounded border ${border} ${isDark ? 'bg-zinc-900' : 'bg-white'} hover:bg-opacity-80 transition-all`}>
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white">{log.agent_id.split(':')[2]?.toUpperCase() || log.agent_id}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </div>
                                    <span className={textSub}>{new Date(log.created_at).toLocaleTimeString()}</span>
                                </div>
                                {log.amount > 0 && (
                                    <div className={accent}>Amount: {log.amount} ETH</div>
                                )}
                                {log.details && (
                                    <div className={`${textSub} text-[10px] mt-1`}>
                                        {JSON.stringify(log.details, null, 2)}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
