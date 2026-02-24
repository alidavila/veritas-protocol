import { supabase } from '../lib/supabase'

import { Helmet } from 'react-helmet-async'
import {
    Users, Activity, LogOut, Wallet, Globe,
    Play, Square, Settings, Target, Mail,
    MessageSquare, DollarSign, Megaphone,
    Save, RefreshCw, PlusCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useVeritasState } from '../hooks/useVeritasState'
import { agentsService, Agent } from '../lib/agents'
import { EmailAgentPanel } from '../components/EmailAgentPanel'

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
    const [agents, setAgents] = useState<Agent[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ leads: 0, emails: 0, engaged: 0 })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [leads, emails, engaged] = await Promise.all([
                    supabase.from('agent_ledger').select('*', { count: 'exact', head: true }).eq('action', 'LEAD_FOUND'),
                    supabase.from('agent_ledger').select('*', { count: 'exact', head: true }).eq('action', 'EMAIL_SENT'),
                    supabase.from('agent_ledger').select('*', { count: 'exact', head: true }).eq('action', 'REPLY_RECEIVED')
                ])

                setStats({
                    leads: leads.count || 0,
                    emails: emails.count || 0,
                    engaged: engaged.count || 0
                })
            } catch (e) {
                console.error("Error fetching stats:", e)
            }
        }
        fetchStats()
    }, [])

    const KPIS = [
        { label: 'Leads Scraped', value: stats.leads.toLocaleString(), change: 'Live', icon: Target, color: 'text-blue-500' },
        { label: 'Emails Sent', value: stats.emails.toLocaleString(), change: 'Live', icon: Mail, color: 'text-purple-500' },
        { label: 'Engaged', value: stats.engaged.toLocaleString(), change: 'Live', icon: MessageSquare, color: 'text-orange-500' },
        { label: 'Treasury', value: `${treasury.toFixed(4)} ETH`, change: 'On-Chain', icon: DollarSign, color: 'text-emerald-500' },
    ]

    const fetchAgents = async () => {
        setLoading(true)
        try {
            const data = await agentsService.getAgents()
            setAgents(data)
        } catch (error) {
            console.error("Error fetching agents:", error)
        } finally {
            setLoading(false)
        }
    }

    const toggleAgent = async (agent: Agent) => {
        const newStatus = agent.status === 'active' ? 'paused' : 'active'
        await agentsService.updateAgentStatus(agent.id, newStatus)
        setAgents(agents.map(a => a.id === agent.id ? { ...a, status: newStatus } : a))
    }

    const deployDefaultFleet = async () => {
        setLoading(true)
        try {
            await agentsService.createAgent({
                name: 'Scout-Alpha',
                type: 'scraper',
                status: 'active',
                config: { target: 'LinkedIn', interval: 300 }
            })
            await agentsService.createAgent({
                name: 'Closer-Beta',
                type: 'sales',
                status: 'paused',
                config: { template: 'Cold Outreach V1', max_daily: 50 }
            })
            await fetchAgents()
        } catch (error) {
            console.error("Error deploying default fleet:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAgents()
    }, [])

    // Mission Control State — loads from Supabase
    const [mission, setMission] = useState({
        niche: "Real Estate Agents in Miami",
        emailSubject: "Your listings are invisible to AI",
        status: "ACTIVE"
    })
    const [isEditingStrategy, setIsEditingStrategy] = useState(false)
    const [savingStrategy, setSavingStrategy] = useState(false)

    useEffect(() => {
        agentsService.getStrategy().then(s => {
            if (s) setMission(s)
        })
    }, [])

    const handleSaveStrategy = async () => {
        setSavingStrategy(true)
        try {
            await agentsService.saveStrategy(mission)
            setIsEditingStrategy(false)
        } catch (e) {
            console.error('Error saving strategy:', e)
        } finally {
            setSavingStrategy(false)
        }
    }

    const conversionRate = stats.leads > 0 ? ((stats.emails / stats.leads) * 100).toFixed(1) : '0.0'

    const handleLogout = async () => {
        try {
            await signOut()
            window.location.href = '/login'
        } catch (error) {
            console.error("Error signing out:", error)
        }
    }

    return (
        <div className={`min-h-screen ${THEME.bg} text-white font-sans flex`}>
            <Helmet>
                <title>CEO Cockpit | Veritas</title>
            </Helmet>

            {/* Sidebar (Collapsed for focus) */}
            <aside className={`w-20 border-r ${THEME.border} bg-zinc-950/50 flex flex-col items-center py-6 backdrop-blur-xl`}>
                <div className="mb-8">
                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/50 rounded-xl flex items-center justify-center">
                        <Globe className="w-6 h-6 text-emerald-500" />
                    </div>
                </div>

                <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                    <button className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <Activity className="w-5 h-5" />
                    </button>
                    <Link to="/broadcast" className="p-3 rounded-xl text-zinc-500 hover:bg-zinc-900 hover:text-purple-500 transition-colors flex justify-center" title="Broadcast Hub">
                        <Megaphone className="w-5 h-5" />
                    </Link>
                    <button className="p-3 rounded-xl text-zinc-500 hover:bg-zinc-900 transition-colors">
                        <Users className="w-5 h-5" />
                    </button>
                    <button className="p-3 rounded-xl text-zinc-500 hover:bg-zinc-900 transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </nav>

                <button onClick={handleLogout} className="p-3 rounded-xl text-red-500/50 hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-5 h-5" />
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">

                {/* Top Bar */}
                <header className="h-20 border-b border-zinc-800 flex justify-between items-center px-8 bg-black/20 backdrop-blur-md sticky top-0 z-20">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Mission Control</h1>
                        <p className="text-xs text-zinc-500 font-mono">OPERATIONAL VIEW</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/30 border border-emerald-500/20 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-emerald-500 tracking-wide">SYSTEM ONLINE</span>
                        </div>
                        <div className="h-8 w-px bg-zinc-800"></div>
                        <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-zinc-500" />
                            <span className="font-mono text-zinc-300">{treasury.toFixed(4)} ETH</span>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto space-y-8">

                    {/* 1. KPI GRID (The Funnel) */}
                    <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {KPIS.map((kpi, idx) => (
                            <div key={idx} className={`${THEME.panel} p-5 rounded-2xl flex items-start justify-between hover:border-zinc-700 transition-colors`}>
                                <div>
                                    <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">{kpi.label}</p>
                                    <h3 className="text-2xl font-bold text-white">{kpi.value}</h3>
                                    <span className="text-xs text-emerald-500 font-mono mt-1 block">{kpi.change} this week</span>
                                </div>
                                <div className={`p-3 rounded-xl bg-zinc-900/50 ${kpi.color}`}>
                                    <kpi.icon className="w-5 h-5" />
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* 2. SPLIT VIEW: FLEET & STRATEGY */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* LEFT: Agent Fleet Control */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Users className="w-5 h-5 text-zinc-500" />
                                    Active Fleet
                                </h2>
                                <button
                                    onClick={fetchAgents}
                                    className="text-xs flex items-center gap-1 text-emerald-500 hover:text-emerald-400"
                                >
                                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
                                </button>
                            </div>

                            <div className="grid gap-3">
                                {loading && agents.length === 0 ? (
                                    <div className="p-8 text-center text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/20">
                                        Loading fleet status...
                                    </div>
                                ) : agents.length === 0 ? (
                                    <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                                        <p className="text-zinc-400 mb-4">No agents deployed.</p>
                                        <button
                                            onClick={deployDefaultFleet}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 mx-auto"
                                        >
                                            <PlusCircle className="w-4 h-4" /> Deploy Genesis Fleet
                                        </button>
                                    </div>
                                ) : (
                                    agents.map(agent => (
                                        <div key={agent.id} className={`bg-zinc-900/40 border ${agent.status === 'active' ? 'border-emerald-500/30' : 'border-zinc-800'} rounded-xl p-4 flex items-center justify-between group hover:border-zinc-700 transition-all`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${agent.type === 'scraper' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    agent.type === 'sales' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                        'bg-zinc-800 text-zinc-400'
                                                    } border`}>
                                                    {agent.type === 'scraper' ? <Target className="w-5 h-5" /> :
                                                        agent.type === 'sales' ? <Mail className="w-5 h-5" /> :
                                                            <Settings className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-sm">{agent.name}</h3>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${agent.status === 'active'
                                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                            : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                                            }`}>
                                                            {agent.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 font-mono mt-0.5">
                                                        {agent.description || agent.type.toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleAgent(agent)}
                                                    className={`p-2 rounded-lg transition-colors ${agent.status === 'active'
                                                        ? 'text-emerald-500 hover:bg-emerald-900/30'
                                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                                        }`}
                                                    title={agent.status === 'active' ? "Pause Agent" : "Start Agent"}
                                                >
                                                    {agent.status === 'active' ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                                                </button>
                                                <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Configure">
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Strategy War Room */}
                        <div className="lg:col-span-1">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-zinc-500" />
                                    Strategy
                                </h2>
                                <button
                                    onClick={() => setIsEditingStrategy(!isEditingStrategy)}
                                    className="text-xs text-zinc-400 hover:text-white underline"
                                >
                                    {isEditingStrategy ? 'Cancel' : 'Edit'}
                                </button>
                            </div>

                            <div className={`p-5 rounded-2xl ${THEME.panel} space-y-5 relative overflow-hidden`}>
                                {isEditingStrategy && (
                                    <div className="absolute top-0 right-0 p-2">
                                        <button
                                            onClick={handleSaveStrategy}
                                            disabled={savingStrategy}
                                            className="bg-emerald-500 text-black p-2 rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50"
                                        >
                                            <Save className={`w-4 h-4 ${savingStrategy ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Target Niche</label>
                                    {isEditingStrategy ? (
                                        <input
                                            type="text"
                                            value={mission.niche}
                                            onChange={(e) => setMission({ ...mission, niche: e.target.value })}
                                            className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    ) : (
                                        <div className="text-sm font-medium text-white border-l-2 border-blue-500 pl-3">
                                            {mission.niche}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Current Hook (Subject)</label>
                                    {isEditingStrategy ? (
                                        <input
                                            type="text"
                                            value={mission.emailSubject}
                                            onChange={(e) => setMission({ ...mission, emailSubject: e.target.value })}
                                            className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    ) : (
                                        <div className="text-sm font-medium text-white border-l-2 border-purple-500 pl-3 italic">
                                            "{mission.emailSubject}"
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2 border-t border-zinc-800">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-zinc-500">Conversion Rate</span>
                                        <span className="font-mono text-emerald-500">{conversionRate}%</span>
                                    </div>
                                    <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(parseFloat(conversionRate), 100)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3. EMAIL AGENT CONTROL */}
                    <section>
                        <EmailAgentPanel />
                    </section>

                    {/* 4. ACTIVITY LOG (Reduced) */}
                    <section>
                        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            Recent Signals
                            <span className="w-full h-px bg-zinc-900"></span>
                        </h2>
                        <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-zinc-900">
                                    {ledger.slice(0, 5).map((tx) => (
                                        <tr key={tx.id} className="hover:bg-zinc-900/50 transition-colors text-xs group">
                                            <td className="px-4 py-3 text-zinc-500 font-mono w-32">
                                                {new Date(tx.timestamp).toLocaleTimeString([], { hour12: false })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-bold text-zinc-300">{tx.from}</span>
                                            </td>
                                            <td className="px-4 py-3 text-zinc-400">
                                                {tx.note}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-zinc-500 group-hover:text-emerald-500">
                                                {tx.amount > 0 && '+'}{tx.amount.toFixed(4)}
                                            </td>
                                        </tr>
                                    ))}
                                    {ledger.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-zinc-600 italic">
                                                No signals detected in the ether...
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    )
}
