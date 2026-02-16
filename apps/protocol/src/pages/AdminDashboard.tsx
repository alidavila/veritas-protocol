
import { Helmet } from 'react-helmet-async'
import { BarChart3, Shield, Users, Activity, LogOut, Wallet, Plus, Terminal, Search, Zap, AlertCircle, Command, Key, Trash2, Bot } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { agentsService, Agent } from '../lib/agents'
import { keysService, APIKey } from '../lib/keys'
import { useVeritasState } from '../hooks/useVeritasState'
import { DeployAgentModal } from '../components/DeployAgentModal'

const THEME = {
    bg: 'bg-black',
    panel: 'bg-zinc-950 border border-zinc-800',
    text: 'text-zinc-400',
    accent: 'text-red-500', // Admin gets Red/Crimson accent to distinguish
    hover: 'hover:bg-zinc-900',
    border: 'border-zinc-800'
}

export function AdminDashboardPage() {
    const { signOut } = useAuth()
    const { ledger, treasury } = useVeritasState()
    const [activeTab, setActiveTab] = useState('overview') // Admin starts on Overview
    const [agents, setAgents] = useState<Agent[]>([])
    const [keys, setKeys] = useState<APIKey[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [commandInput, setCommandInput] = useState('')

    // API Keys State
    const [newKeyName, setNewKeyName] = useState('')
    const [generatedKey, setGeneratedKey] = useState<string | null>(null)
    const [isCreatingKey, setIsCreatingKey] = useState(false)


    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        try {
            const [agentsData, keysData] = await Promise.all([
                agentsService.getAgents(),
                keysService.getKeys()
            ])
            setAgents(agentsData)
            setKeys(keysData)
        } catch (error) {
            console.error("Error fetching data:", error)
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

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newKeyName) return
        try {
            setIsCreatingKey(true)
            const result = await keysService.createKey(newKeyName)
            setGeneratedKey(result.fullKey)
            setNewKeyName('')
            const updatedKeys = await keysService.getKeys()
            setKeys(updatedKeys)
        } catch (error) {
            console.error("Error creating key:", error)
        } finally {
            setIsCreatingKey(false)
        }
    }

    const handleDeleteKey = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres revocar esta llave? Esta acción es irreversible.')) return
        try {
            await keysService.deleteKey(id)
            setKeys(keys.filter(k => k.id !== id))
        } catch (error) {
            console.error("Error deleting key:", error)
        }
    }







    const getAgentIcon = (type: string) => {
        switch (type) {
            case 'support': return Bot
            case 'sales': return Zap
            case 'scraper': return Search
            default: return Shield
        }
    }

    const handleRouterCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commandInput) return;

        try {
            // Save command to Command Table
            await agentsService.sendCommand(commandInput, 'all');
            alert(`Orden enviada al Router: "${commandInput}"`);
            setCommandInput('');
        } catch (error) {
            console.error("Error sending command:", error);
            alert("Error al enviar comando");
        }
    }

    return (
        <div className={`min-h-screen ${THEME.bg} text-white font-sans flex overflow-hidden`}>
            <Helmet>
                <title>COMMANDER | Veritas Protocol</title>
            </Helmet>

            <DeployAgentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchInitialData}
            />

            {/* Sidebar */}
            <aside className={`w-64 border-r border-red-900/30 bg-red-950/10 p-6 flex flex-col backdrop-blur-xl`}>
                <div className="flex items-center gap-3 mb-10 pl-2">
                    <div className="w-8 h-8 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center justify-center">
                        <Terminal className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight block leading-none text-red-100">VERITAS</span>
                        <span className="text-[10px] text-red-500 font-mono tracking-widest">COMMANDER</span>
                    </div>
                </div>

                <nav className="space-y-1 flex-1">
                    {[
                        { id: 'overview', icon: BarChart3, label: "War Room" },
                        { id: 'agents', icon: Users, label: "Army Status" },
                        { id: 'router', icon: Command, label: "Router Link" },
                        { id: 'keys', icon: Shield, label: "Access Keys" },
                        { id: 'logs', icon: Activity, label: "Global Logs" },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === item.id
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
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
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-black">
                {/* Header */}
                <header className={`h-16 border-b ${THEME.border} flex justify-between items-center px-8 bg-black/50 backdrop-blur-sm sticky top-0 z-10`}>
                    <div className="flex items-center gap-4">
                        <span className="text-zinc-500 text-sm">Mode:</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-900/20 rounded-full border border-red-900/50">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-sm font-bold text-red-100">ADMINISTRATOR</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-full">
                            <Wallet className="w-4 h-4 text-zinc-500" />
                            <span className="text-sm font-mono text-zinc-300">
                                Global Treasury: {treasury > 0 ? `${treasury.toFixed(4)} ETH` : '$0.00'}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-6xl mx-auto">

                    {/* ROUTER COMMAND INPUT (Always visible in Admin) */}
                    {activeTab === 'router' && (
                        <div className="mb-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                                <Terminal className="w-5 h-5 text-red-500" />
                                Router Command Interface
                            </h2>
                            <form onSubmit={handleRouterCommand} className="flex gap-4">
                                <input
                                    type="text"
                                    value={commandInput}
                                    onChange={(e) => setCommandInput(e.target.value)}
                                    placeholder="E.g., 'Stop scraping and start emailing leads with score > 80'"
                                    className="flex-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-red-500"
                                />
                                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                                    Execute
                                </button>
                            </form>
                            <p className="text-xs text-zinc-500 mt-2 font-mono">Commands are processed by the local Router Agent via Supabase.</p>
                        </div>
                    )}


                    {/* TOP SUMMARY */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-white">
                                {activeTab === 'agents' ? 'Army Status' :
                                    activeTab === 'overview' ? 'War Room' :
                                        activeTab === 'keys' ? 'Security Keys' :
                                            activeTab === 'router' ? 'Router Control' :
                                                activeTab === 'logs' ? 'Global Logs' : 'Commander'}
                            </h1>
                        </div>
                        {activeTab === 'agents' && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg flex items-center gap-2 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Deploy Unit
                            </button>
                        )}
                    </div>

                    {/* Stats Grid */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            {[
                                { label: "Active Units", value: agents.length.toString(), change: agents.length > 0 ? "Online" : "Inactivo" },
                                { label: "Total Transactions", value: ledger.length.toString(), change: "Global" },
                                { label: "System Health", value: "98%", change: "Stable" },
                            ].map((stat, i) => (
                                <div key={i} className={`p-5 rounded-xl ${THEME.panel} border-zinc-800`}>
                                    <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-3">{stat.label}</p>
                                    <div className="flex justify-between items-end">
                                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                                        <p className="text-zinc-600 text-xs">{stat.change}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TAB CONTENT */}

                    {/* TAB: AGENTS */}
                    {activeTab === 'agents' && (
                        <div className="grid grid-cols-1 gap-4">
                            {agents.map((agent) => {
                                const Icon = getAgentIcon(agent.type)
                                return (
                                    <div key={agent.id} className={`p-6 rounded-2xl ${THEME.panel} flex flex-col gap-6 group hover:border-red-500/30 transition-all`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500">
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-lg">{agent.name}</h3>
                                                        {agent.last_seen && (new Date().getTime() - new Date(agent.last_seen).getTime() < 1000 * 60 * 5) ? (
                                                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono uppercase flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                                ONLINE
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-mono uppercase">
                                                                OFFLINE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                                                        <span>ID: {agent.id.slice(0, 8)}</span>
                                                        <span className="text-zinc-800">|</span>
                                                        <span>Seen: {agent.last_seen ? new Date(agent.last_seen).toLocaleTimeString() : 'Never'}</span>
                                                        <span className="text-zinc-800">|</span>
                                                        <span className={agent.wallet_balance && agent.wallet_balance > 0 ? "text-white" : ""}>
                                                            {agent.wallet_balance ? `${agent.wallet_balance.toFixed(4)} ETH` : '0.00 ETH'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* TAB: KEYS */}
                    {activeTab === 'keys' && (
                        <div className="space-y-8">
                            <div className={`p-8 rounded-2xl ${THEME.panel} relative overflow-hidden`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Master API Keys</h3>
                                        <p className="text-zinc-500 text-sm">Create credentials for your army.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleCreateKey} className="flex gap-4">
                                    <input
                                        type="text"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        placeholder="Key Name (e.g., Hunter-Alpha)"
                                        className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                                    />
                                    <button
                                        disabled={isCreatingKey || !newKeyName}
                                        className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 rounded-xl transition-all"
                                    >
                                        {isCreatingKey ? 'Generando...' : 'Create Key'}
                                    </button>
                                </form>
                                {generatedKey && (
                                    <div className="mt-8 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl border-dashed">
                                        <div className="flex items-center gap-2 text-red-400 mb-4 text-xs font-bold uppercase tracking-widest">
                                            <AlertCircle className="w-4 h-4" />
                                            Copy key now.
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-black border border-zinc-800 p-4 rounded-xl font-mono text-emerald-500 text-sm truncate">
                                                {generatedKey}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Existing Keys Table */}
                            <div className={`rounded-2xl ${THEME.panel} overflow-hidden`}>
                                <div className="divide-y divide-zinc-900">
                                    {keys.map((key) => (
                                        <div key={key.id} className="p-6 flex items-center justify-between hover:bg-zinc-900/20 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <Key className="w-5 h-5 text-zinc-600" />
                                                <div>
                                                    <p className="font-bold text-white text-sm">{key.name}</p>
                                                    <p className="text-xs text-zinc-500 font-mono">{key.key_prefix}...</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteKey(key.id)} className="p-2 text-zinc-600 hover:text-red-400">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: LOGS */}
                    {activeTab === 'logs' && (
                        <div className="bg-black border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                                <span className="text-xs font-mono uppercase tracking-widest text-zinc-300">Global Event Stream</span>
                            </div>
                            <div className="p-0 max-h-[500px] overflow-y-auto font-mono text-[11px]">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-zinc-900 text-zinc-500 uppercase text-[9px] tracking-tighter">
                                        <tr>
                                            <th className="px-6 py-3 font-normal border-b border-zinc-800">Time</th>
                                            <th className="px-6 py-3 font-normal border-b border-zinc-800">Agent</th>
                                            <th className="px-6 py-3 font-normal border-b border-zinc-800">Log</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-900">
                                        {ledger.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-zinc-900/50 transition-colors">
                                                <td className="px-6 py-4 text-zinc-500">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                                                <td className="px-6 py-4 text-emerald-500">{tx.from}</td>
                                                <td className="px-6 py-4 text-zinc-300">{tx.note}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main >
        </div >
    )
}
