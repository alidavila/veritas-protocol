import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
    Mail, Play, Square, Check, X, Clock, Send, Settings,
    RefreshCw, ChevronDown, ChevronUp, Eye, Ban, Zap,
    Calendar, Hash, AlertTriangle, TrendingUp
} from 'lucide-react'

interface EmailDraft {
    id: string
    agent_id: string
    action: string
    details: {
        target_domain: string
        target_email: string
        subject: string
        body: string
        status: 'WAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SENT'
        geo_score?: number
        sent_at?: string
        resend_id?: string
    }
    created_at: string
}

interface EmailConfig {
    enabled: boolean
    daily_limit: number
    sent_today: number
    schedule_start: number // hour (0-23)
    schedule_end: number   // hour (0-23)
    from_name: string
    from_email: string
    blacklist: string[]
    follow_up_days: number
    auto_approve: boolean
    template_style: 'cold_outreach' | 'value_first' | 'question_hook'
}

const DEFAULT_CONFIG: EmailConfig = {
    enabled: false,
    daily_limit: 50,
    sent_today: 0,
    schedule_start: 9,
    schedule_end: 18,
    from_name: 'Veritas Agents',
    from_email: 'onboarding@resend.dev',
    blacklist: [],
    follow_up_days: 3,
    auto_approve: false,
    template_style: 'cold_outreach'
}

const TEMPLATE_LABELS: Record<string, string> = {
    cold_outreach: '🧊 Cold Outreach',
    value_first: '💎 Value First',
    question_hook: '❓ Question Hook'
}

export function EmailAgentPanel() {
    const [config, setConfig] = useState<EmailConfig>(DEFAULT_CONFIG)
    const [drafts, setDrafts] = useState<EmailDraft[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showConfig, setShowConfig] = useState(false)
    const [previewDraft, setPreviewDraft] = useState<EmailDraft | null>(null)
    const [blacklistInput, setBlacklistInput] = useState('')
    const [stats, setStats] = useState({
        total_sent: 0,
        sent_today: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    })

    // Load config + drafts + stats
    useEffect(() => {
        loadAll()
    }, [])

    const loadAll = async () => {
        setLoading(true)
        await Promise.all([loadConfig(), loadDrafts(), loadStats()])
        setLoading(false)
    }

    const loadConfig = async () => {
        const { data } = await supabase
            .from('agent_control')
            .select('config')
            .eq('id', 1)
            .single()
        if (data?.config?.email_agent) {
            setConfig({ ...DEFAULT_CONFIG, ...data.config.email_agent })
        }
    }

    const loadDrafts = async () => {
        const { data } = await supabase
            .from('agent_ledger')
            .select('*')
            .eq('action', 'EMAIL_DRAFT')
            .order('created_at', { ascending: false })
            .limit(50)
        if (data) setDrafts(data as EmailDraft[])
    }

    const loadStats = async () => {
        const today = new Date().toISOString().split('T')[0]

        const [totalSent, sentToday, pending, approved, rejected] = await Promise.all([
            supabase.from('agent_ledger').select('*', { count: 'exact', head: true }).eq('action', 'EMAIL_SENT'),
            supabase.from('agent_ledger').select('*', { count: 'exact', head: true }).eq('action', 'EMAIL_SENT').gte('created_at', today),
            supabase.from('agent_ledger').select('*', { count: 'exact', head: true }).eq('action', 'EMAIL_DRAFT').filter('details->>status', 'eq', 'WAITING_APPROVAL'),
            supabase.from('agent_ledger').select('*', { count: 'exact', head: true }).eq('action', 'EMAIL_DRAFT').filter('details->>status', 'eq', 'APPROVED'),
            supabase.from('agent_ledger').select('*', { count: 'exact', head: true }).eq('action', 'EMAIL_DRAFT').filter('details->>status', 'eq', 'REJECTED')
        ])

        setStats({
            total_sent: totalSent.count || 0,
            sent_today: sentToday.count || 0,
            pending: pending.count || 0,
            approved: approved.count || 0,
            rejected: rejected.count || 0
        })
    }

    const saveConfig = async () => {
        setSaving(true)
        try {
            // Get existing config and merge
            const { data: existing } = await supabase
                .from('agent_control')
                .select('config')
                .eq('id', 1)
                .single()

            const mergedConfig = {
                ...(existing?.config || {}),
                email_agent: config
            }

            await supabase
                .from('agent_control')
                .upsert({
                    id: 1,
                    config: mergedConfig,
                    status: config.enabled ? 'running' : 'stopped',
                    updated_at: new Date().toISOString()
                })

            // Also send command
            await supabase
                .from('agent_commands')
                .insert([{
                    command: config.enabled ? 'EMAIL_AGENT_START' : 'EMAIL_AGENT_STOP',
                    agent_id: 'did:veritas:marketer:001',
                    status: 'pending'
                }])

        } catch (e) {
            console.error('Error saving config:', e)
        } finally {
            setSaving(false)
        }
    }

    const toggleEnabled = async () => {
        const newConfig = { ...config, enabled: !config.enabled }
        setConfig(newConfig)

        // Save immediately on toggle
        setSaving(true)
        try {
            const { data: existing } = await supabase
                .from('agent_control')
                .select('config')
                .eq('id', 1)
                .single()

            await supabase
                .from('agent_control')
                .upsert({
                    id: 1,
                    config: { ...(existing?.config || {}), email_agent: newConfig },
                    status: newConfig.enabled ? 'running' : 'stopped',
                    updated_at: new Date().toISOString()
                })

            await supabase.from('agent_commands').insert([{
                command: newConfig.enabled ? 'EMAIL_AGENT_START' : 'EMAIL_AGENT_STOP',
                agent_id: 'did:veritas:marketer:001',
                status: 'pending'
            }])
        } finally {
            setSaving(false)
        }
    }

    const approveDraft = async (draft: EmailDraft) => {
        const newDetails = { ...draft.details, status: 'APPROVED' as const }
        await supabase
            .from('agent_ledger')
            .update({ details: newDetails })
            .eq('id', draft.id)
        setDrafts(drafts.map(d => d.id === draft.id ? { ...d, details: newDetails } : d))
        setStats({ ...stats, pending: stats.pending - 1, approved: stats.approved + 1 })
    }

    const rejectDraft = async (draft: EmailDraft) => {
        const newDetails = { ...draft.details, status: 'REJECTED' as const }
        await supabase
            .from('agent_ledger')
            .update({ details: newDetails })
            .eq('id', draft.id)
        setDrafts(drafts.map(d => d.id === draft.id ? { ...d, details: newDetails } : d))
        setStats({ ...stats, pending: stats.pending - 1, rejected: stats.rejected + 1 })
    }

    const approveAll = async () => {
        const pending = drafts.filter(d => d.details.status === 'WAITING_APPROVAL')
        for (const draft of pending) {
            await approveDraft(draft)
        }
    }

    const addToBlacklist = () => {
        if (!blacklistInput.trim()) return
        const domain = blacklistInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '')
        if (!config.blacklist.includes(domain)) {
            setConfig({ ...config, blacklist: [...config.blacklist, domain] })
        }
        setBlacklistInput('')
    }

    const removeFromBlacklist = (domain: string) => {
        setConfig({ ...config, blacklist: config.blacklist.filter(d => d !== domain) })
    }

    const pendingDrafts = drafts.filter(d => d.details.status === 'WAITING_APPROVAL')
    const sentDrafts = drafts.filter(d => d.details.status === 'SENT')
    const approvedDrafts = drafts.filter(d => d.details.status === 'APPROVED')

    if (loading) {
        return (
            <div className="p-6 text-center text-zinc-500">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                Loading Email Agent...
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* ── HEADER: ON/OFF + Stats ── */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${config.enabled ? 'bg-purple-500/10 border-purple-500/30' : 'bg-zinc-900 border-zinc-700'
                            }`}>
                            <Mail className={`w-6 h-6 ${config.enabled ? 'text-purple-400' : 'text-zinc-500'}`} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                Email Agent
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-mono ${config.enabled
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                        : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                    }`}>
                                    {config.enabled ? 'ACTIVE' : 'PAUSED'}
                                </span>
                            </h2>
                            <p className="text-xs text-zinc-500 font-mono">did:veritas:marketer:001</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowConfig(!showConfig)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button
                            onClick={loadAll}
                            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={toggleEnabled}
                            disabled={saving}
                            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${config.enabled
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                                }`}
                        >
                            {config.enabled ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                            {config.enabled ? 'Detener' : 'Activar'}
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-5 gap-3">
                    {[
                        { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                        { label: 'Approved', value: stats.approved, icon: Check, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        { label: 'Sent Total', value: stats.total_sent, icon: Send, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                        { label: 'Sent Today', value: stats.sent_today, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { label: 'Rejected', value: stats.rejected, icon: X, color: 'text-red-500', bg: 'bg-red-500/10' },
                    ].map((s, i) => (
                        <div key={i} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3 text-center">
                            <div className={`inline-flex p-1.5 rounded-lg ${s.bg} mb-1`}>
                                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                            </div>
                            <p className="text-xl font-bold text-white">{s.value}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Daily Limit Bar */}
                <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-500">Daily Usage</span>
                        <span className="text-zinc-400 font-mono">{stats.sent_today} / {config.daily_limit}</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${stats.sent_today >= config.daily_limit ? 'bg-red-500' :
                                    stats.sent_today > config.daily_limit * 0.8 ? 'bg-yellow-500' : 'bg-emerald-500'
                                }`}
                            style={{ width: `${Math.min((stats.sent_today / config.daily_limit) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* ── CONFIG PANEL (Collapsible) ── */}
            {showConfig && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6 animate-in slide-in-from-top-2">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Configuration
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Daily Limit</label>
                                <input
                                    type="number"
                                    value={config.daily_limit}
                                    onChange={e => setConfig({ ...config, daily_limit: parseInt(e.target.value) || 50 })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Schedule (Hours)</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="number"
                                        min="0" max="23"
                                        value={config.schedule_start}
                                        onChange={e => setConfig({ ...config, schedule_start: parseInt(e.target.value) || 9 })}
                                        className="w-20 bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                    />
                                    <span className="text-zinc-500 text-sm">to</span>
                                    <input
                                        type="number"
                                        min="0" max="23"
                                        value={config.schedule_end}
                                        onChange={e => setConfig({ ...config, schedule_end: parseInt(e.target.value) || 18 })}
                                        className="w-20 bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Follow-Up After (days)</label>
                                <input
                                    type="number"
                                    value={config.follow_up_days}
                                    onChange={e => setConfig({ ...config, follow_up_days: parseInt(e.target.value) || 3 })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Template Style</label>
                                <select
                                    value={config.template_style}
                                    onChange={e => setConfig({ ...config, template_style: e.target.value as any })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                >
                                    {Object.entries(TEMPLATE_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">From Name</label>
                                <input
                                    type="text"
                                    value={config.from_name}
                                    onChange={e => setConfig({ ...config, from_name: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">From Email</label>
                                <input
                                    type="email"
                                    value={config.from_email}
                                    onChange={e => setConfig({ ...config, from_email: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                                <div>
                                    <p className="text-sm text-white font-medium">Auto-Approve Drafts</p>
                                    <p className="text-xs text-zinc-500">Skip manual review</p>
                                </div>
                                <button
                                    onClick={() => setConfig({ ...config, auto_approve: !config.auto_approve })}
                                    className={`w-12 h-6 rounded-full transition-colors p-0.5 ${config.auto_approve ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${config.auto_approve ? 'translate-x-6' : ''}`} />
                                </button>
                            </div>

                            {/* Blacklist */}
                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">
                                    <Ban className="w-3 h-3 inline mr-1" />Blacklist Domains
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={blacklistInput}
                                        onChange={e => setBlacklistInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addToBlacklist()}
                                        placeholder="domain.com"
                                        className="flex-1 bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                                    />
                                    <button onClick={addToBlacklist} className="px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/20">
                                        Block
                                    </button>
                                </div>
                                {config.blacklist.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {config.blacklist.map(d => (
                                            <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-xs">
                                                {d}
                                                <button onClick={() => removeFromBlacklist(d)} className="hover:text-white">×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-zinc-800">
                        <button
                            onClick={saveConfig}
                            disabled={saving}
                            className="px-6 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 text-sm flex items-center gap-2"
                        >
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Save Configuration
                        </button>
                    </div>
                </div>
            )}

            {/* ── DRAFT INBOX ── */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Draft Inbox
                        {stats.pending > 0 && (
                            <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full text-[10px]">
                                {stats.pending} pending
                            </span>
                        )}
                    </h3>
                    {pendingDrafts.length > 1 && (
                        <button
                            onClick={approveAll}
                            className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 flex items-center gap-1"
                        >
                            <Check className="w-3 h-3" /> Approve All ({pendingDrafts.length})
                        </button>
                    )}
                </div>

                {drafts.length === 0 ? (
                    <div className="p-8 text-center text-zinc-600 italic">
                        No drafts yet. Start the Email Agent to generate outreach.
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-900">
                        {drafts.slice(0, 20).map(draft => (
                            <div
                                key={draft.id}
                                className={`p-4 flex items-center justify-between hover:bg-zinc-900/30 transition-colors ${draft.details.status === 'WAITING_APPROVAL' ? 'bg-yellow-500/[0.02]' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${draft.details.status === 'WAITING_APPROVAL' ? 'bg-yellow-500 animate-pulse' :
                                            draft.details.status === 'APPROVED' ? 'bg-blue-500' :
                                                draft.details.status === 'SENT' ? 'bg-emerald-500' : 'bg-red-500'
                                        }`} />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white truncate">{draft.details.target_domain}</span>
                                            {draft.details.geo_score && (
                                                <span className="text-[10px] font-mono text-zinc-500">GEO:{draft.details.geo_score}</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-500 truncate">{draft.details.subject}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 ml-4">
                                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-mono ${draft.details.status === 'WAITING_APPROVAL' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' :
                                            draft.details.status === 'APPROVED' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' :
                                                draft.details.status === 'SENT' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                                                    'text-red-400 border-red-500/30 bg-red-500/10'
                                        }`}>
                                        {draft.details.status.replace('_', ' ')}
                                    </span>

                                    <button
                                        onClick={() => setPreviewDraft(previewDraft?.id === draft.id ? null : draft)}
                                        className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800"
                                        title="Preview"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                    </button>

                                    {draft.details.status === 'WAITING_APPROVAL' && (
                                        <>
                                            <button
                                                onClick={() => approveDraft(draft)}
                                                className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10"
                                                title="Approve"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => rejectDraft(draft)}
                                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"
                                                title="Reject"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Preview Panel */}
                {previewDraft && (
                    <div className="border-t border-zinc-800 p-6 bg-zinc-900/30">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-xs text-zinc-500">To: <span className="text-zinc-300">{previewDraft.details.target_email}</span></p>
                                <p className="text-sm font-bold text-white mt-1">{previewDraft.details.subject}</p>
                            </div>
                            <button onClick={() => setPreviewDraft(null)} className="text-zinc-500 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div
                            className="text-sm text-zinc-300 bg-black border border-zinc-800 rounded-xl p-4 max-h-60 overflow-y-auto"
                            dangerouslySetInnerHTML={{ __html: previewDraft.details.body }}
                        />
                        {previewDraft.details.status === 'WAITING_APPROVAL' && (
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => { approveDraft(previewDraft); setPreviewDraft(null) }}
                                    className="flex-1 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold text-sm hover:bg-emerald-500/20 flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Approve & Queue
                                </button>
                                <button
                                    onClick={() => { rejectDraft(previewDraft); setPreviewDraft(null) }}
                                    className="flex-1 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg font-bold text-sm hover:bg-red-500/20 flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" /> Reject
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
