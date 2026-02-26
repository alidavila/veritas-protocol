import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useTranslation } from 'react-i18next'
import {
    Mail, Check, X, Settings,
    RefreshCw, Eye, Ban
} from 'lucide-react'
import { ExpandablePanel } from './ExpandablePanel'

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
        sequence_num?: number
        sequence_type?: 'DIAGNOSTIC' | 'CONSEQUENCE' | 'MICRO_OFFER'
    }
    created_at: string
}

interface EmailConfig {
    enabled: boolean
    daily_limit: number
    sent_today: number
    schedule_start: number
    schedule_end: number
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
    from_name: 'Agentes Veritas',
    from_email: 'onboarding@resend.dev',
    blacklist: [],
    follow_up_days: 3,
    auto_approve: false,
    template_style: 'cold_outreach'
}

export function EmailAgentPanel() {
    const { t } = useTranslation()
    const [config, setConfig] = useState<EmailConfig>(DEFAULT_CONFIG)
    const [drafts, setDrafts] = useState<EmailDraft[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [previewDraft, setPreviewDraft] = useState<EmailDraft | null>(null)
    const [blacklistInput, setBlacklistInput] = useState('')
    const [stats, setStats] = useState({
        total_sent: 0,
        sent_today: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    })

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
            .from('agents')
            .select('config')
            .eq('type', 'sales')
            .limit(1)
            .single()
        if (data?.config) {
            setConfig({ ...DEFAULT_CONFIG, ...data.config })
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
            await supabase
                .from('agents')
                .update({
                    config: config,
                    updated_at: new Date().toISOString()
                }).eq('type', 'sales')

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

        setSaving(true)
        try {
            await supabase
                .from('agents')
                .update({
                    status: newConfig.enabled ? 'active' : 'paused',
                    config: newConfig,
                    updated_at: new Date().toISOString()
                }).eq('type', 'sales')

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

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            WAITING_APPROVAL: t('emailAgent.statusWaiting'),
            APPROVED: t('emailAgent.statusApproved'),
            REJECTED: t('emailAgent.statusRejected'),
            SENT: t('emailAgent.statusSent')
        }
        return map[status] || status
    }

    const getTemplateLabel = (key: string) => {
        const map: Record<string, string> = {
            cold_outreach: t('emailAgent.templateCold'),
            value_first: t('emailAgent.templateValue'),
            question_hook: t('emailAgent.templateQuestion')
        }
        return map[key] || key
    }

    const pendingDrafts = drafts.filter(d => d.details.status === 'WAITING_APPROVAL')

    if (loading) {
        return (
            <div className="p-6 text-center text-zinc-500">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                {t('emailAgent.loading')}
            </div>
        )
    }

    return (
        <ExpandablePanel
            title={t('emailAgent.title')}
            icon={Mail}
            did="did:veritas:marketer:001"
            status={config.enabled ? 'active' : 'paused'}
            onToggleStatus={toggleEnabled}
            headerStats={
                <div className="flex gap-4 text-[10px] font-mono mr-4">
                    <div className="flex flex-col items-end">
                        <span className="text-zinc-500">ENVIADOS HOY</span>
                        <span className="text-zinc-300">{stats.sent_today} / {config.daily_limit}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-yellow-500/50">PENDIENTES</span>
                        <span className="text-yellow-500 font-bold">{stats.pending}</span>
                    </div>
                </div>
            }
        >
            <div className="space-y-8">
                {/* ── CONFIG PANEL ── */}
                <div className="space-y-6">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <Settings className="w-4 h-4" /> {t('emailAgent.configuration')}
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">{t('emailAgent.dailyLimit')}</label>
                                <input
                                    type="number"
                                    value={config.daily_limit}
                                    onChange={e => setConfig({ ...config, daily_limit: parseInt(e.target.value) || 50 })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">{t('emailAgent.schedule')}</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="number" min="0" max="23"
                                        value={config.schedule_start}
                                        onChange={e => setConfig({ ...config, schedule_start: parseInt(e.target.value) || 9 })}
                                        className="w-20 bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                    />
                                    <span className="text-zinc-500 text-sm">{t('emailAgent.scheduleTo')}</span>
                                    <input
                                        type="number" min="0" max="23"
                                        value={config.schedule_end}
                                        onChange={e => setConfig({ ...config, schedule_end: parseInt(e.target.value) || 18 })}
                                        className="w-20 bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">{t('emailAgent.followUpDays')}</label>
                                <input
                                    type="number"
                                    value={config.follow_up_days}
                                    onChange={e => setConfig({ ...config, follow_up_days: parseInt(e.target.value) || 3 })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">{t('emailAgent.templateStyle')}</label>
                                <select
                                    value={config.template_style}
                                    onChange={e => setConfig({ ...config, template_style: e.target.value as any })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                >
                                    {['cold_outreach', 'value_first', 'question_hook'].map(k => (
                                        <option key={k} value={k}>{getTemplateLabel(k)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">{t('emailAgent.senderName')}</label>
                                <input
                                    type="text"
                                    value={config.from_name}
                                    onChange={e => setConfig({ ...config, from_name: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">{t('emailAgent.senderEmail')}</label>
                                <input
                                    type="email"
                                    value={config.from_email}
                                    onChange={e => setConfig({ ...config, from_email: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                                <div>
                                    <p className="text-sm text-white font-medium">{t('emailAgent.autoApprove')}</p>
                                    <p className="text-xs text-zinc-500">{t('emailAgent.autoApproveDesc')}</p>
                                </div>
                                <button
                                    onClick={() => setConfig({ ...config, auto_approve: !config.auto_approve })}
                                    className={`w-12 h-6 rounded-full transition-colors p-0.5 ${config.auto_approve ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${config.auto_approve ? 'translate-x-6' : ''}`} />
                                </button>
                            </div>

                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">
                                    <Ban className="w-3 h-3 inline mr-1" />{t('emailAgent.blacklist')}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={blacklistInput}
                                        onChange={e => setBlacklistInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addToBlacklist()}
                                        placeholder={t('emailAgent.blacklistPlaceholder')}
                                        className="flex-1 bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                                    />
                                    <button onClick={addToBlacklist} className="px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/20">
                                        {t('emailAgent.block')}
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
                            {t('emailAgent.saveConfig')}
                        </button>
                    </div>
                </div>

                {/* ── DRAFT INBOX ── */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {t('emailAgent.draftInbox')}
                            {stats.pending > 0 && (
                                <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full text-[10px]">
                                    {t('emailAgent.pendingCount', { count: stats.pending })}
                                </span>
                            )}
                        </h3>
                        {pendingDrafts.length > 1 && (
                            <button
                                onClick={approveAll}
                                className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" /> {t('emailAgent.approveAll', { count: pendingDrafts.length })}
                            </button>
                        )}
                    </div>

                    {drafts.length === 0 ? (
                        <div className="p-8 text-center text-zinc-600 italic">
                            {t('emailAgent.noDrafts')}
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-900">
                            {drafts.slice(0, 20).map(draft => (
                                <div
                                    key={draft.id}
                                    className={`p-4 flex items-center justify-between hover:bg-zinc-900/30 transition-colors ${draft.details.status === 'WAITING_APPROVAL' ? 'bg-yellow-500/[0.02]' : ''}`}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${draft.details.status === 'WAITING_APPROVAL' ? 'bg-yellow-500 animate-pulse' :
                                            draft.details.status === 'APPROVED' ? 'bg-blue-500' :
                                                draft.details.status === 'SENT' ? 'bg-emerald-500' : 'bg-red-500'
                                            }`} />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-white truncate">{draft.details.target_domain}</span>
                                                {draft.details.sequence_num && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${draft.details.sequence_num === 1 ? 'text-cyan-400 bg-cyan-500/10' :
                                                        draft.details.sequence_num === 2 ? 'text-orange-400 bg-orange-500/10' :
                                                            'text-pink-400 bg-pink-500/10'
                                                        }`}>
                                                        #{draft.details.sequence_num}
                                                    </span>
                                                )}
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
                                            {getStatusLabel(draft.details.status)}
                                        </span>

                                        <button
                                            onClick={() => setPreviewDraft(previewDraft?.id === draft.id ? null : draft)}
                                            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800"
                                            title={t('emailAgent.preview')}
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>

                                        {draft.details.status === 'WAITING_APPROVAL' && (
                                            <>
                                                <button
                                                    onClick={() => approveDraft(draft)}
                                                    className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10"
                                                    title={t('emailAgent.approve')}
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => rejectDraft(draft)}
                                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"
                                                    title={t('emailAgent.reject')}
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
                                    <p className="text-xs text-zinc-500">{t('common.to')}: <span className="text-zinc-300">{previewDraft.details.target_email}</span></p>
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
                                        <Check className="w-4 h-4" /> {t('emailAgent.approveAndQueue')}
                                    </button>
                                    <button
                                        onClick={() => { rejectDraft(previewDraft); setPreviewDraft(null) }}
                                        className="flex-1 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg font-bold text-sm hover:bg-red-500/20 flex items-center justify-center gap-2"
                                    >
                                        <X className="w-4 h-4" /> {t('emailAgent.reject')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </ExpandablePanel>
    )
}
