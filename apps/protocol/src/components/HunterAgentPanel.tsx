import { useState, useEffect } from 'react'
import { Crosshair, Link as LinkIcon, Save, RefreshCw } from 'lucide-react'
import { ExpandablePanel } from './ExpandablePanel'
import { supabase } from '../lib/supabase'

export function HunterAgentPanel() {
    const [status, setStatus] = useState<'active' | 'paused'>('paused')
    const [config, setConfig] = useState({ urls: '', niche: '' })
    const [saving, setSaving] = useState(false)
    const [stats, setStats] = useState({ leads: 0, scanned: 0 })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const { data: c } = await supabase.from('agents').select('config, status').eq('type', 'scraper').limit(1).single()
            if (c?.config) setConfig(c.config)
            if (c?.status === 'active') setStatus('active')

            const { count: leadsCount } = await supabase.from('agent_ledger').select('*', { count: 'exact', head: true }).eq('action', 'LEAD_FOUND')
            const { count: scannedCount } = await supabase.from('agent_ledger').select('*', { count: 'exact', head: true }).in('action', ['GEO_AUDIT_COMPLETED', 'SCAN_COMPLETED'])
            setStats({ leads: leadsCount || 0, scanned: scannedCount || 0 })
        } catch (e) {
            console.error(e)
        }
    }

    const toggleStatus = async () => {
        const newStatus = status === 'active' ? 'paused' : 'active'
        setStatus(newStatus)
        setSaving(true)
        try {
            await supabase.from('agents').update({
                status: newStatus,
                config: config,
                updated_at: new Date().toISOString()
            }).eq('type', 'scraper')
        } finally {
            setSaving(false)
        }
    }

    const saveConfig = async () => {
        setSaving(true)
        try {
            await supabase.from('agents').update({
                status: status,
                config: config,
                updated_at: new Date().toISOString()
            }).eq('type', 'scraper')
        } finally {
            setSaving(false)
        }
    }

    return (
        <ExpandablePanel
            title="Lead Scraper (Hunter V2)"
            icon={Crosshair}
            did="did:veritas:hunter:002"
            status={status}
            onToggleStatus={toggleStatus}
            headerStats={
                <div className="flex gap-4 text-[10px] font-mono">
                    <div className="flex flex-col items-end">
                        <span className="text-zinc-500">ESCANEADOS</span>
                        <span className="text-zinc-300">{stats.scanned}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-emerald-500/50">LEADS</span>
                        <span className="text-emerald-500 font-bold">{stats.leads}</span>
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h5 className="text-xs font-bold text-zinc-500 uppercase">Configuración de Búsqueda</h5>

                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Nicho Objetivo</label>
                        <input
                            type="text"
                            className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:border-emerald-500 outline-none mt-1"
                            placeholder="Ej: Inmobiliarias en Miami"
                            value={config.niche}
                            onChange={(e) => setConfig({ ...config, niche: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Semillas (URLs separadas por coma)</label>
                        <textarea
                            className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:border-emerald-500 outline-none mt-1 min-h-[80px]"
                            placeholder="https://ejemplo.com, https://otro.com"
                            value={config.urls}
                            onChange={(e) => setConfig({ ...config, urls: e.target.value })}
                        />
                    </div>

                    <button
                        onClick={saveConfig}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg border border-zinc-800 transition-colors"
                    >
                        {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Guardar Configuración
                    </button>
                </div>

                <div className="space-y-4">
                    <h5 className="text-xs font-bold text-zinc-500 uppercase">Base de Conocimiento Operativa</h5>
                    <div className="bg-black/50 border border-zinc-800 rounded-xl p-4 text-[11px] text-zinc-400 font-mono space-y-2">
                        <p>1. Extrae sitemaps de URLs semillas.</p>
                        <p>2. Analiza meta tags y schemas JSON-LD vs robots.txt.</p>
                        <p>3. Asigna Vulnerability GEO Score (0-100).</p>
                        <p className="text-emerald-500/70">Score &lt; 80 = TARGET CUALIFICADO.</p>
                        <div className="h-px bg-zinc-800 my-2"></div>
                        <p className="flex items-center gap-2 text-zinc-500">
                            <LinkIcon className="w-3 h-3" /> Pipeline &rarr; did:veritas:marketer:001
                        </p>
                    </div>
                </div>
            </div>
        </ExpandablePanel>
    )
}
