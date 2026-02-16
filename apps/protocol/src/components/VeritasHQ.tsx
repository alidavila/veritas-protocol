import { useState, useEffect } from 'react'
import { Terminal, Power, Cpu, Wifi, Activity, ShieldAlert, DollarSign, Crosshair, Mail, Server } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useVeritasState } from '../hooks/useVeritasState'

const THEME = {
    bg: 'bg-black',
    panel: 'bg-zinc-950 border border-zinc-800',
    text: 'text-zinc-400',
    accent: 'text-emerald-500',
    accentBg: 'bg-emerald-500/10',
    danger: 'text-red-500',
    dangerBg: 'bg-red-500/10',
    mono: 'font-mono'
}

export function VeritasHQ({ onExit }: { onExit: () => void }) {
    const [systemStatus, setSystemStatus] = useState<'running' | 'stopped'>('stopped')
    const [logs, setLogs] = useState<any[]>([])
    const { treasury } = useVeritasState() // Get real ETH balance
    const [isLoading, setIsLoading] = useState(false)
    const [uptime, setUptime] = useState(0)

    useEffect(() => {
        fetchControlState()
        fetchLogs()

        const channel = supabase
            .channel('nuclear_dashboard')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_ledger' }, (payload) => {
                setLogs(prev => [payload.new, ...prev].slice(0, 100))
            })
            .subscribe()

        const interval = setInterval(() => setUptime(prev => prev + 1), 1000)

        return () => {
            supabase.removeChannel(channel)
            clearInterval(interval)
        }
    }, [])

    const fetchLogs = async () => {
        const { data } = await supabase
            .from('agent_ledger')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100)
        if (data) setLogs(data)
    }

    const fetchControlState = async () => {
        const { data } = await supabase.from('agent_control').select('status').single()
        if (data) setSystemStatus(data.status)
    }

    const toggleSystem = async () => {
        setIsLoading(true)
        const newStatus = systemStatus === 'running' ? 'stopped' : 'running'
        const { data: control } = await supabase.from('agent_control').select('id').single()

        if (control) {
            await supabase.from('agent_control').update({ status: newStatus }).eq('id', control.id)
            setSystemStatus(newStatus)
        }
        setIsLoading(false)
    }

    const approveDraft = async (log: any) => {
        if (!log.details || log.details.status !== 'WAITING_APPROVAL') return

        const newDetails = { ...log.details, status: 'APPROVED' }

        const { error } = await supabase
            .from('agent_ledger')
            .update({ details: newDetails })
            .eq('id', log.id)

        if (error) {
            console.error('Failed to approve', error)
            alert('Error approving draft')
        }
    }

    const leads = logs.filter(l => l.action === 'LEAD_FOUND').length
    const emails = logs.filter(l => l.action === 'EMAIL_SENT').length
    const audits = logs.filter(l => l.action === 'GEO_AUDIT_COMPLETED').length
    const revenue = logs.filter(l => l.action === 'PAYMENT_RECEIVED').reduce((acc, curr) => acc + (curr.amount || 0), 0)

    const agents = [
        { id: 'HUNTER', name: 'Hunter V2', role: 'Scout', active: systemStatus === 'running', icon: Crosshair, stats: `${leads} Targets` },
        { id: 'MARKETER', name: 'Email Agent', role: 'Outreach', active: systemStatus === 'running', icon: Mail, stats: `${emails} Sent` },
        { id: 'GHOST', name: 'Ghost Auditor', role: 'Analysis', active: systemStatus === 'running', icon: ShieldAlert, stats: `${audits} Audits` },
        { id: 'TREASURER', name: 'Treasurer', role: 'Finance', active: systemStatus === 'running', icon: DollarSign, stats: `${revenue.toFixed(4)} ETH` },
    ]

    return (
        <div className={`min-h-screen ${THEME.bg} ${THEME.text} ${THEME.mono} p-4 overflow-hidden flex flex-col`}>
            <style>{`
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: #000; }
                ::-webkit-scrollbar-thumb { background: #333; }
                ::-webkit-scrollbar-thumb:hover { background: #10b981; }
            `}</style>

            <div className={`flex items-center justify-between p-6 mb-4 ${THEME.panel} border-b-2 ${systemStatus === 'running' ? 'border-emerald-500' : 'border-red-500'}`}>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Terminal className={`w-6 h-6 ${systemStatus === 'running' ? THEME.accent : THEME.danger}`} />
                        <h1 className="text-xl font-bold tracking-widest text-white">VERITAS<span className="opacity-50">KERNEL</span></h1>
                    </div>

                    <div className="h-8 w-px bg-zinc-800"></div>

                    <div className="flex gap-8 text-xs font-bold">
                        <div>
                            <span className="block opacity-50 mb-1">NETWORK</span>
                            <span className="text-white flex items-center gap-2"><Wifi className="w-3 h-3 text-emerald-500" /> BASE SEPOLIA</span>
                        </div>
                        <div>
                            <span className="block opacity-50 mb-1">UPTIME</span>
                            <span className="text-white font-mono">{new Date(uptime * 1000).toISOString().substr(11, 8)}</span>
                        </div>
                        <div>
                            <span className="block opacity-50 mb-1">TREASURY</span>
                            <span className="text-white flex items-center gap-1">
                                <span className="text-emerald-400">{treasury.toFixed(4)}</span> ETH
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`text-right ${systemStatus === 'running' ? 'text-emerald-500 animate-pulse' : 'text-red-500'}`}>
                        <div className="text-xs font-bold tracking-widest">SYSTEM STATUS</div>
                        <div className="text-2xl font-black">{systemStatus.toUpperCase()}</div>
                    </div>

                    <button
                        onClick={toggleSystem}
                        disabled={isLoading}
                        className={`w-16 h-16 flex items-center justify-center rounded-full border-4 transition-all hover:scale-105 active:scale-95 ${systemStatus === 'running'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                            : 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                            }`}
                    >
                        <Power className="w-8 h-8" />
                    </button>

                    <button onClick={onExit} className="ml-4 px-3 py-1 text-xs border border-zinc-700 hover:bg-zinc-800 transition-colors">
                        EXIT
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-hidden">

                <div className="col-span-1 md:col-span-3 flex flex-col gap-4">
                    <div className={`${THEME.panel} flex-1 p-4 flex flex-col`}>
                        <h2 className="text-xs font-bold tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                            <Cpu className="w-4 h-4" /> ACTIVE UNITS
                        </h2>
                        <div className="space-y-2">
                            {agents.map(agent => (
                                <div key={agent.id} className={`p-3 border border-zinc-800/50 flex items-center justify-between transition-all ${agent.active ? 'bg-zinc-900/50' : 'opacity-50 grayscale'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded ${agent.active && systemStatus === 'running' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-600'}`}>
                                            <agent.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-zinc-200">{agent.name}</div>
                                            <div className="text-[10px] text-zinc-600">{agent.role}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-white">{agent.stats}</div>
                                        <div className="text-[10px] text-emerald-600 flex items-center justify-end gap-1">
                                            {agent.active && systemStatus === 'running' ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ONLINE</> : 'OFFLINE'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-4 flex gap-2">
                            <div className="flex-1 bg-zinc-900 p-2 rounded text-center border border-zinc-800">
                                <div className="text-[10px] text-zinc-600">TOTAL LEADS</div>
                                <div className="text-xl font-bold text-white">{leads}</div>
                            </div>
                            <div className="flex-1 bg-zinc-900 p-2 rounded text-center border border-zinc-800">
                                <div className="text-[10px] text-zinc-600">REVENUE</div>
                                <div className="text-xl font-bold text-white">${revenue.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`${THEME.panel} col-span-1 md:col-span-6 flex flex-col p-0 overflow-hidden relative`}>
                    <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none z-10" />

                    <div className="p-3 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
                        <h2 className="text-xs font-bold tracking-widest text-emerald-500 flex items-center gap-2">
                            <Activity className="w-4 h-4" /> REAL-TIME LEDGER
                        </h2>
                        <span className="text-[10px] text-zinc-500 animate-pulse">LIVE STREAMING</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs">
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-3 hover:bg-zinc-900/50 p-1 rounded group border-b border-zinc-900/50 pb-2 mb-2">
                                <span className="text-zinc-600 w-20 shrink-0">{new Date(log.created_at).toLocaleTimeString()}</span>
                                <span className={`w-24 shrink-0 font-bold ${log.action === 'LEAD_FOUND' ? 'text-blue-400' :
                                    log.action === 'EMAIL_SENT' ? 'text-purple-400' :
                                        log.action === 'PAYMENT_RECEIVED' ? 'text-emerald-400' :
                                            log.action === 'ALERT_TRIGGERED' ? 'text-red-400' :
                                                'text-zinc-400'
                                    }`}>{log.action}</span>
                                <div className="flex-1 overflow-hidden">
                                    <span className="text-zinc-300 block truncate">
                                        {log.details?.target || log.details?.target_domain || JSON.stringify(log.details)}
                                    </span>
                                    {log.details?.subject && <span className="text-[10px] text-zinc-500 block truncate">subject: {log.details.subject}</span>}
                                </div>

                                {log.amount > 0 && <span className="text-emerald-500 font-bold">+ {log.amount} ETH</span>}
                            </div>
                        ))}
                        {logs.map(log => (
                            log.action === 'EMAIL_DRAFT' && log.details?.status === 'WAITING_APPROVAL' && (
                                <div key={log.id} className="ml-24 mb-4 p-3 bg-zinc-900/80 border border-zinc-800 rounded relative group/draft">
                                    <div className="absolute -left-3 top-4 w-3 h-px bg-zinc-800"></div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Draft Pending Review</div>
                                    <div className="font-bold text-zinc-300 mb-1">{log.details.subject}</div>
                                    <div className="text-zinc-500 italic mb-3 line-clamp-3 bg-black/50 p-2 rounded border border-zinc-900">
                                        {(log.details.body || '').replace(/<[^>]*>/g, '')}
                                    </div>
                                    <button
                                        onClick={() => approveDraft(log)}
                                        className="w-full py-2 bg-emerald-900/30 hover:bg-emerald-500 hover:text-black border border-emerald-900/50 hover:border-emerald-500 text-emerald-500 rounded transition-all text-[10px] font-bold tracking-widest flex items-center justify-center gap-2"
                                    >
                                        <Mail className="w-3 h-3" /> APPROVE & SEND
                                    </button>
                                </div>
                            )
                        ))}
                        <div className="text-emerald-500 animate-pulse pl-24 pt-2">_</div>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-3 flex flex-col gap-4">
                    <div className={`${THEME.panel} flex-1 p-4`}>
                        <h2 className="text-xs font-bold tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                            <Server className="w-4 h-4" /> INFRASTRUCTURE
                        </h2>

                        <div className="space-y-4">
                            <StatusRow label="Supabase Database" status="healthy" ping="45ms" />
                            <StatusRow label="Realtime Channel" status="connected" ping="12ms" />
                            <StatusRow label="RPC Provider" status="healthy" ping="88ms" />
                            <StatusRow label="Vercel Edge" status="standby" ping="-" />
                        </div>

                        <div className="mt-8 border-t border-zinc-900 pt-4">
                            <div className="text-[10px] text-zinc-500 mb-2">MEMORY USAGE</div>
                            <div className="w-full bg-zinc-900 h-1 rounded overflow-hidden mb-1">
                                <div className="bg-emerald-500 h-full w-[34%]"></div>
                            </div>
                            <div className="flex justify-between text-[10px] mt-1 text-zinc-600">
                                <span>USED: 34%</span>
                                <span>FREE: 66%</span>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="text-[10px] text-zinc-500 mb-2">RUN MANUAL AGENT</div>
                            <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-[10px] text-zinc-400 font-mono">
                                &gt; node scripts/hunter_agent.js
                            </div>
                            <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-[10px] text-zinc-400 font-mono mt-2">
                                &gt; node scripts/email_agent.js
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

function StatusRow({ label, status, ping }: any) {
    const isGood = status === 'healthy' || status === 'connected'
    return (
        <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-600">{ping}</span>
                <div className={`w-2 h-2 rounded-full ${isGood ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
            </div>
        </div>
    )
}
