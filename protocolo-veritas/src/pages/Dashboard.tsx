
import { Helmet } from 'react-helmet-async'
import { Users, Activity, LogOut, Wallet, Shield, Globe } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { agentsService, Agent } from '../lib/agents'
import { useVeritasState } from '../hooks/useVeritasState'

const THEME = {
    bg: 'bg-black',
    panel: 'bg-zinc-950 border border-zinc-800',
    text: 'text-zinc-400',
    accent: 'text-emerald-500',
    hover: 'hover:bg-zinc-900',
    border: 'border-zinc-800'
}

export function DashboardPage() {
    const { signOut } = useAuth()
    const { ledger, treasury } = useVeritasState()
    const [activeTab, setActiveTab] = useState('agents')
    const [agents, setAgents] = useState<Agent[]>([])
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        try {
            setLoading(true)
            const agentsData = await agentsService.getAgents()
            setAgents(agentsData)
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await signOut()
            window.location.href = '/login'
        } catch (error) {
            console.error("Error signing out:", error)
        }
    }



    return (
        <div className={`min-h-screen ${THEME.bg} text-white font-sans flex overflow-hidden`}>
            <Helmet>
                <title>Console | Veritas Protocol</title>
            </Helmet>

            {/* Sidebar */}
            <aside className={`w-64 border-r ${THEME.border} bg-zinc-950/50 p-6 flex flex-col backdrop-blur-xl`}>
                <div className="flex items-center gap-3 mb-10 pl-2">
                    <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/50 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight block leading-none">VERITAS</span>
                        <span className="text-[10px] text-zinc-500 font-mono tracking-widest">USER VIEW</span>
                    </div>
                </div>

                <nav className="space-y-1 flex-1">
                    {[
                        { id: 'agents', icon: Users, label: "My Agents" },
                        { id: 'logs', icon: Activity, label: "Live Activity" },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === item.id
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
                        >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className={`border-t ${THEME.border} pt-6 space-y-1`}>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
                {/* Header */}
                <header className={`h-16 border-b ${THEME.border} flex justify-between items-center px-8 bg-black/50 backdrop-blur-sm sticky top-0 z-10`}>
                    <div className="flex items-center gap-4">
                        <span className="text-zinc-500 text-sm">Status:</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-sm font-bold">Online</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-full hover:border-zinc-700 transition-colors cursor-pointer group">
                            <Wallet className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                            <span className="text-sm font-mono text-zinc-300">
                                {treasury > 0 ? `${treasury.toFixed(4)} ETH` : '$0.00 USDC'}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-6xl mx-auto">
                    {/* TOP SUMMARY */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {activeTab === 'agents' ? 'My Nodes' : 'Activity Stream'}
                            </h1>
                            <p className="text-zinc-500">
                                {activeTab === 'agents' ? 'View your active agent deployments.' : 'Real-time ledger of your agents actions.'}
                            </p>
                        </div>
                    </div>

                    {/* TAB CONTENT */}

                    {/* TAB: AGENTS */}
                    {activeTab === 'agents' && (
                        <>
                            {loading ? (
                                <div className="py-20 text-center">
                                    <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Syncing...</p>
                                </div>
                            ) : agents.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {agents.map((agent) => {
                                        const isOnline = agent.last_seen && (new Date().getTime() - new Date(agent.last_seen).getTime() < 1000 * 60 * 5);
                                        return (
                                            <div key={agent.id} className={`p-6 rounded-2xl ${THEME.panel} flex flex-col gap-6 group hover:border-emerald-500/30 transition-all`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center ${isOnline ? 'text-emerald-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]' : 'text-zinc-600'} group-hover:scale-110 transition-transform`}>
                                                            <Shield className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-bold text-lg">{agent.name}</h3>
                                                                {isOnline ? (
                                                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono uppercase flex items-center gap-1.5">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                                        ONLINE
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] bg-zinc-800 text-zinc-500 border border-zinc-700 px-2 py-0.5 rounded-full font-mono uppercase">
                                                                        OFFLINE
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                                                                <span>ID: {agent.id.slice(0, 8)}</span>
                                                                <span className="text-zinc-800">|</span>
                                                                <span>Seen: {agent.last_seen ? new Date(agent.last_seen).toLocaleTimeString() : 'Never'}</span>
                                                                <span className="text-zinc-800">|</span>
                                                                <span className={agent.wallet_balance && agent.wallet_balance > 0 ? "text-emerald-400" : ""}>
                                                                    {agent.wallet_balance ? `${agent.wallet_balance.toFixed(4)} ETH` : '0 ETH'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="border border-zinc-800 rounded-2xl p-16 text-center bg-zinc-950/30 border-dashed">
                                    <h3 className="text-xl font-bold text-white mb-2">No active agents found</h3>
                                    <p className="text-zinc-500 max-w-md mx-auto mb-8 leading-relaxed">
                                        You don't have any functioning agents deployed yet.
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* TAB: LOGS */}
                    {activeTab === 'logs' && (
                        <div className="bg-black border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-300">Live Agent Ledger</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-[10px] font-mono text-emerald-500 uppercase">Real-time</span>
                                </div>
                            </div>

                            <div className="p-0 max-h-[500px] overflow-y-auto font-mono text-[11px]">
                                {ledger.length === 0 ? (
                                    <div className="p-12 text-center text-zinc-600 italic">
                                        Waiting for network activity...
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-zinc-900 text-zinc-500 uppercase text-[9px] tracking-tighter">
                                            <tr>
                                                <th className="px-6 py-3 font-normal border-b border-zinc-800">Timestamp</th>
                                                <th className="px-6 py-3 font-normal border-b border-zinc-800">Agent</th>
                                                <th className="px-6 py-3 font-normal border-b border-zinc-800">Action</th>
                                                <th className="px-6 py-3 font-normal border-b border-zinc-800 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-900">
                                            {ledger.map((tx) => (
                                                <tr key={tx.id} className="hover:bg-zinc-900/50 transition-colors group">
                                                    <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">
                                                        {new Date(tx.timestamp).toLocaleTimeString([], { hour12: false })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                                                            <span className="text-zinc-300 truncate max-w-[120px]">{tx.from}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-zinc-400 italic">
                                                        {tx.note}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={tx.amount > 0 ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                                                            {tx.amount > 0 ? `+${tx.amount.toFixed(4)}` : tx.amount.toFixed(4)}
                                                        </span>
                                                        <span className="text-[9px] text-zinc-600 ml-1">ETH</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main >
        </div >
    )
}
