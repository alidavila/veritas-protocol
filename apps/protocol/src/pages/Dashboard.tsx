// Dashboard uses agentsService & useVeritasState for data

import { Helmet } from 'react-helmet-async'
import { askAssistant } from '../lib/gemini'
import {
    Users, Activity, LogOut, Wallet, Globe, ShieldCheck,
    Play, Square, Settings, Mail,
    MessageSquare, DollarSign, Megaphone,
    Save, RefreshCw, PlusCircle, Send, Bot, Copy, CheckCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useVeritasState } from '../hooks/useVeritasState'
import { agentsService, Agent } from '../lib/agents'
import { EmailAgentPanel } from '../components/EmailAgentPanel'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

const THEME = {
    bg: 'bg-black',
    panel: 'bg-zinc-950 border border-zinc-900',
    text: 'text-zinc-400',
    accent: 'text-emerald-500',
    hover: 'hover:bg-zinc-900',
    border: 'border-zinc-800'
}

export function DashboardPage() {
    const { signOut } = useAuth()
    const { stats, signals, treasury, fetchStats: _fetchStats } = useVeritasState()
    const { t } = useTranslation()
    const [agents, setAgents] = useState<Agent[]>([])
    const [loading, setLoading] = useState(true)
    const [searchParams] = useSearchParams()
    const gatekeeperInstalled = searchParams.get('gatekeeper') === 'installed'
    const [snippetCopied, setSnippetCopied] = useState(false)
    const [gkInstallTab, setGkInstallTab] = useState<'js' | 'wp'>('js')

    // Mission Control State — loads from Supabase
    const [mission, setMission] = useState({
        niche: "Real Estate Agents in Miami",
        emailSubject: "Your listings are invisible to AI",
    })
    const [isEditingStrategy, setIsEditingStrategy] = useState(false)
    const [savingStrategy, setSavingStrategy] = useState(false)

    // CEO Assistant State
    const [assistantInput, setAssistantInput] = useState('')
    const [assistantResponse, setAssistantResponse] = useState('')
    const [assistantLoading, setAssistantLoading] = useState(false)

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
        } finally {
            setSavingStrategy(false)
        }
    }

    const fetchAgents = async () => {
        setLoading(true)
        try {
            const data = await agentsService.getAgents()
            setAgents(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAgents()
    }, [])

    const handleAgentControl = async (id: string, action: 'start' | 'stop') => {
        await agentsService.controlAgent(id, action)
        await fetchAgents()
    }

    const handleLogout = async () => {
        await signOut()
    }

    const deployDefaultFleet = async () => {
        setLoading(true)
        await agentsService.deployInitialFleet()
        await fetchAgents()
    }

    const conversionRate = stats.emails > 0 ? ((stats.clicks / stats.emails) * 100).toFixed(1) : "0.0"

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
            <Helmet>
                <title>{t('dashboard.pageTitle')}</title>
            </Helmet>

            {/* Sidebar (Colapsado para foco) */}
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
            <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black transition-all">

                {/* Top Bar */}
                <header className="h-20 border-b border-zinc-800 flex justify-between items-center px-8 bg-black/20 backdrop-blur-md sticky top-0 z-20">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{t('dashboard.pageTitle')}</h1>
                        <p className="text-xs text-zinc-500 font-mono">{t('dashboard.systemStatus')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher variant="compact" />
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/30 border border-emerald-500/20 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-emerald-500 tracking-wide">{t('dashboard.systemStatus')} {t('dashboard.online')}</span>
                        </div>
                        <div className="h-8 w-px bg-zinc-800"></div>
                        <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-zinc-500" />
                            <span className="font-mono text-zinc-300">{treasury.toFixed(4)} ETH</span>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto space-y-8">

                    {/* 1. KPI GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className={`${THEME.panel} p-5 rounded-2xl`}>
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-zinc-500 text-xs font-bold uppercase">{t('dashboard.kpiProspects')}</p>
                                <Users className="w-4 h-4 text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold">{stats.leads}</h3>
                            <p className="text-[10px] text-zinc-600 mt-1 uppercase">{t('dashboard.thisWeek')}</p>
                        </div>
                        <div className={`${THEME.panel} p-5 rounded-2xl`}>
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-zinc-500 text-xs font-bold uppercase">{t('dashboard.kpiEmailsSent')}</p>
                                <Mail className="w-4 h-4 text-purple-500" />
                            </div>
                            <h3 className="text-2xl font-bold">{stats.emails}</h3>
                            <p className="text-[10px] text-zinc-600 mt-1 uppercase">{t('dashboard.thisWeek')}</p>
                        </div>
                        <div className={`${THEME.panel} p-5 rounded-2xl`}>
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-zinc-500 text-xs font-bold uppercase">{t('dashboard.kpiInterest')}</p>
                                <Activity className="w-4 h-4 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-bold">{conversionRate}%</h3>
                            <p className="text-[10px] text-zinc-600 mt-1 uppercase">{t('dashboard.thisWeek')}</p>
                        </div>
                        <div className={`${THEME.panel} p-5 rounded-2xl`}>
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-zinc-500 text-xs font-bold uppercase">{t('dashboard.kpiTreasury')}</p>
                                <DollarSign className="w-4 h-4 text-amber-500" />
                            </div>
                            <h3 className="text-2xl font-bold">{treasury.toFixed(4)} ETH</h3>
                            <p className="text-[10px] text-zinc-600 mt-1 uppercase">{t('dashboard.ethOnBase')}</p>
                        </div>
                    </div>

                    {/* GATEKEEPER INSTALLATION PANEL */}
                    {(gatekeeperInstalled || agents.some(a => a.name.toLowerCase().includes('gatekeeper'))) && (() => {
                        const gkAgent = agents.find(a => a.name.toLowerCase().includes('gatekeeper'))
                        const targetDomain = gkAgent?.description?.match(/active on ([^.]+\.[^.]+)/)?.[1] || 'tu-dominio.com'
                        const snippet = `<script src="https://veritas-protocol-app.vercel.app/gatekeeper.js"
  data-veritas-id="${gkAgent?.id?.slice(0, 8) || 'client-001'}"
  data-wallet="0x4d2B70d358C5DA9c4fC6e8Ce743Ed67d55C19099"
  data-rate="0.002"></script>`
                        return (
                            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4 duration-700">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                                            🔒 Gatekeeper Activo
                                            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-mono">v2.0</span>
                                        </h3>
                                        <p className="text-sm text-zinc-400 mt-1">
                                            Tu nodo está listo. Instala el script en <code className="text-emerald-400 bg-emerald-500/10 px-1 rounded">{targetDomain}</code> para empezar a detectar y cobrar a bots de IA.
                                        </p>
                                    </div>
                                </div>

                                {/* Tabs Selector */}
                                <div className="flex gap-2 mb-6 p-1 bg-black/40 rounded-xl border border-zinc-800 w-fit">
                                    <button
                                        onClick={() => setGkInstallTab('js')}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${gkInstallTab === 'js' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                        JavaScript (Universal)
                                    </button>
                                    <button
                                        onClick={() => setGkInstallTab('wp')}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${gkInstallTab === 'wp' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                        WordPress Plugin
                                    </button>
                                </div>

                                {gkInstallTab === 'js' ? (
                                    <>
                                        {/* Step by step JS */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            <div className="bg-black/40 p-4 rounded-xl border border-zinc-800">
                                                <div className="text-emerald-500 font-mono text-[9px] font-bold mb-2">PASO 1</div>
                                                <p className="text-[11px] text-zinc-400">Copia el script universal</p>
                                            </div>
                                            <div className="bg-black/40 p-4 rounded-xl border border-zinc-800">
                                                <div className="text-emerald-500 font-mono text-[9px] font-bold mb-2">PASO 2</div>
                                                <p className="text-[11px] text-zinc-400">Pégalo en el <code className="text-emerald-400">&lt;head&gt;</code></p>
                                            </div>
                                            <div className="bg-black/40 p-4 rounded-xl border border-zinc-800">
                                                <div className="text-emerald-500 font-mono text-[9px] font-bold mb-2">PASO 3</div>
                                                <p className="text-[11px] text-zinc-400">Detección activa en tiempo real</p>
                                            </div>
                                        </div>

                                        {/* Snippet */}
                                        <div className="relative bg-black rounded-xl border border-zinc-800 p-4 font-mono text-[11px] text-emerald-400">
                                            <pre className="whitespace-pre-wrap break-all">{snippet}</pre>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(snippet)
                                                    setSnippetCopied(true)
                                                    setTimeout(() => setSnippetCopied(false), 2000)
                                                }}
                                                className="absolute top-3 right-3 px-3 py-1.5 bg-zinc-800 hover:bg-emerald-600 rounded-lg text-[10px] text-white transition-colors flex items-center gap-1.5"
                                            >
                                                {snippetCopied ? <><CheckCircle className="w-3 h-3" /> Copiado!</> : <><Copy className="w-3 h-3" /> Copiar</>}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-black/40 p-6 rounded-xl border border-zinc-800 text-center">
                                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                                <Globe className="w-8 h-8 text-emerald-500" />
                                            </div>
                                            <h4 className="text-white font-bold mb-2">Veritas Connector for WordPress</h4>
                                            <p className="text-xs text-zinc-500 mb-6 max-w-sm mx-auto">
                                                Usa nuestro plugin oficial para integrar Veritas en tu sitio WP sin tocar una sola línea de código.
                                            </p>
                                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                <a
                                                    href="/veritas-gatekeeper.php"
                                                    download="veritas-gatekeeper.php"
                                                    className="px-6 py-3 bg-emerald-500 text-black rounded-xl font-bold text-xs hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <PlusCircle className="w-4 h-4" />
                                                    Descargar .php
                                                </a>
                                                <div className="px-6 py-3 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-help group relative">
                                                    Manual de Instalación
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-800 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[10px] shadow-xl">
                                                        Sube el archivo a /wp-content/plugins/ y actívalo desde el admin.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* How it Works / Tutorial Section */}
                                <div className="mt-8 pt-8 border-t border-emerald-500/10">
                                    <h4 className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest mb-4">¿Cómo funciona el "Portero"?</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                                <Bot className="w-4 h-4 text-emerald-500" />
                                                Detección de Identidad
                                            </div>
                                            <p className="text-xs text-zinc-500 leading-relaxed">
                                                Cuando un bot (GPTBot, Claude, etc.) llega a tu web, el Gatekeeper analiza su firma digital. Si no tiene una identidad verificada en Veritas, es interceptado.
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                Peaje x402
                                            </div>
                                            <p className="text-xs text-zinc-500 leading-relaxed">
                                                Se le presenta al bot un contrato de micropago. El bot puede pagar 0.002 USDC (via Base) para acceder al contenido. Todo se graba en tu Ledger.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )

                    })()}

                    {/* 2. SPLIT VIEW: FLEET & STRATEGY */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* LEFT: Agent Fleet Control */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Users className="w-5 h-5 text-zinc-500" />
                                    {t('dashboard.agentFleet')}
                                </h2>
                                <button
                                    onClick={fetchAgents}
                                    className="text-xs flex items-center gap-1 text-emerald-500 hover:text-emerald-400"
                                >
                                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> {t('emailAgent.refresh')}
                                </button>
                            </div>

                            <div className="grid gap-3">
                                {loading && agents.length === 0 ? (
                                    <div className="p-8 text-center text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/20">
                                        Cargando estado de la flota...
                                    </div>
                                ) : agents.length === 0 ? (
                                    <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                                        <p className="text-zinc-400 mb-4">No hay agentes desplegados.</p>
                                        <button
                                            onClick={deployDefaultFleet}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 mx-auto"
                                        >
                                            <PlusCircle className="w-4 h-4" /> Desplegar Flota Génesis
                                        </button>
                                    </div>
                                ) : (
                                    agents.map(agent => (
                                        <div key={agent.id} className={`${THEME.panel} p-4 rounded-xl flex items-center justify-between group transition-all hover:bg-zinc-900/40`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${agent.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                                    <MessageSquare className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-sm tracking-tight">{agent.name}</h4>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-tighter ${agent.status === 'active'
                                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                            : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                                            }`}>
                                                            {agent.status === 'active' ? t('emailAgent.active') : t('emailAgent.paused')}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 font-mono mt-0.5">{agent.did || 'did:veritas:unassigned'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAgentControl(agent.id, agent.status === 'active' ? 'stop' : 'start')}
                                                    className={`p-2 rounded-lg transition-all ${agent.status === 'active'
                                                        ? 'text-emerald-500 hover:bg-emerald-900/30'
                                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                                        }`}
                                                    title={agent.status === 'active' ? "Pausar Agente" : "Iniciar Agente"}
                                                >
                                                    {agent.status === 'active' ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                                                </button>
                                                <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Configurar">
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Strategy & Niche */}
                        <div className="space-y-4">
                            <div className={`${THEME.panel} p-6 rounded-2xl space-y-6 relative overflow-hidden h-full`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full translate-x-16 -translate-y-16"></div>

                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-zinc-500" />
                                        {t('dashboard.strategyTitle')}
                                    </h2>
                                    <button
                                        onClick={() => setIsEditingStrategy(!isEditingStrategy)}
                                        className="text-xs text-emerald-500 hover:text-emerald-400 font-bold"
                                    >
                                        {isEditingStrategy ? 'CANCELAR' : 'EDITAR'}
                                    </button>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t('dashboard.strategyTitle')}</h3>
                                        {isEditingStrategy && (
                                            <button
                                                onClick={handleSaveStrategy}
                                                disabled={savingStrategy}
                                                className="bg-emerald-500 text-black p-2 rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50"
                                                title="Guardar Estrategia"
                                            >
                                                <Save className={`w-4 h-4 ${savingStrategy ? 'animate-spin' : ''}`} />
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">{t('dashboard.targetNiche')}</label>
                                        {isEditingStrategy ? (
                                            <input
                                                type="text"
                                                value={mission.niche}
                                                onChange={e => setMission({ ...mission, niche: e.target.value })}
                                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none"
                                            />
                                        ) : (
                                            <p className="text-sm font-medium text-zinc-300">{mission.niche}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">{t('dashboard.currentHook')}</label>
                                        {isEditingStrategy ? (
                                            <input
                                                type="text"
                                                value={mission.emailSubject}
                                                onChange={e => setMission({ ...mission, emailSubject: e.target.value })}
                                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none"
                                            />
                                        ) : (
                                            <p className="text-sm font-medium text-emerald-500 italic">"{mission.emailSubject}"</p>
                                        )}
                                    </div>

                                    <div className="pt-2 border-t border-zinc-800">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-500">Tasa de Conversión</span>
                                            <span className="font-mono text-emerald-500">{conversionRate}%</span>
                                        </div>
                                        <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className="bg-emerald-500 h-full transition-all duration-1000"
                                                style={{ width: `${conversionRate}%` }}
                                            ></div>
                                        </div>
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
                            {t('dashboard.recentSignals')}
                            <span className="w-full h-px bg-zinc-900"></span>
                        </h2>
                        <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-zinc-900/50 text-zinc-500">
                                    <tr>
                                        <th className="px-6 py-3 font-bold uppercase tracking-widest text-[10px]">Tiempo</th>
                                        <th className="px-6 py-3 font-bold uppercase tracking-widest text-[10px]">Agente</th>
                                        <th className="px-6 py-3 font-bold uppercase tracking-widest text-[10px]">Señal</th>
                                        <th className="px-6 py-3 font-bold uppercase tracking-widest text-[10px] text-right">Costo (Gas)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-900">
                                    {signals.map((sig, idx) => (
                                        <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-zinc-500">{sig.time}</td>
                                            <td className="px-6 py-4 font-bold text-zinc-300 underline decoration-zinc-800 underline-offset-4">{sig.agent}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 font-mono text-[10px]">
                                                    {sig.log}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-zinc-500">{sig.cost}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* 5. CEO ASSISTANT */}
                    <section>
                        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Bot className="w-4 h-4" />
                            {t('dashboard.assistantTitle', 'Asistente IA del CEO')}
                            <span className="w-full h-px bg-zinc-900"></span>
                        </h2>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
                            {assistantResponse && (
                                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <Bot className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{assistantResponse}</div>
                                    </div>
                                </div>
                            )}
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault()
                                    if (!assistantInput.trim() || assistantLoading) return
                                    setAssistantLoading(true)
                                    setAssistantResponse('')
                                    try {
                                        const lang = (t('lang', 'es') === 'en' ? 'en' : 'es') as 'es' | 'en'
                                        const response = await askAssistant(assistantInput, {
                                            totalEvents: stats.leads + stats.emails,
                                            leadsFound: stats.leads,
                                            alertsTriggered: 0,
                                            fundsAllocated: treasury,
                                            systemStatus: 'running',
                                            recentLogs: signals.map(s => ({
                                                agent_id: s.agent,
                                                action: s.log
                                            }))
                                        }, lang)
                                        setAssistantResponse(response)
                                    } catch (err) {
                                        setAssistantResponse('Error al conectar con el asistente.')
                                    } finally {
                                        setAssistantLoading(false)
                                        setAssistantInput('')
                                    }
                                }}
                                className="flex gap-3"
                            >
                                <input
                                    type="text"
                                    value={assistantInput}
                                    onChange={(e) => setAssistantInput(e.target.value)}
                                    placeholder={t('dashboard.assistantPlaceholder', '¿Qué quieres saber sobre tu operación?')}
                                    className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none placeholder:text-zinc-600"
                                    disabled={assistantLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={assistantLoading || !assistantInput.trim()}
                                    className="px-5 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {assistantLoading ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}
