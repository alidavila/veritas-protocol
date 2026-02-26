import { useState, useEffect } from 'react'
import { DollarSign, Wallet, ArrowRightLeft, ShieldCheck, RefreshCw, TrendingUp, BarChart3 } from 'lucide-react'
import { ExpandablePanel } from './ExpandablePanel'
import { supabase } from '../lib/supabase'
import { createPublicClient, http, formatEther } from 'viem'
import { baseSepolia } from 'viem/chains'

const TREASURY_ADDRESS = "0x4d2B70d358C5DA9c4fC6e8Ce743Ed67d55C19099"

const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
})

interface TollTransaction {
    id: string
    action: string
    amount: number
    agent_id: string
    details: any
    created_at: string
}

export function TreasurerPanel() {
    const [status, setStatus] = useState<'active' | 'paused'>('active')
    const [loading, setLoading] = useState(true)
    const [walletBalance, setWalletBalance] = useState(0)
    const [recentTx, setRecentTx] = useState<TollTransaction[]>([])
    const [stats, setStats] = useState({
        totalRevenue: 0,
        tollsCollected: 0,
        paymentsAccepted: 0,
        activeWallets: 0
    })

    useEffect(() => {
        loadData()

        // Realtime: refresh on new ledger entries
        const channel = supabase
            .channel('treasurer_live')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_ledger' }, (payload) => {
                const action = payload.new?.action
                if (['PAYMENT_ACCEPTED', 'TOLL_COLLECTED', 'IDENTITY_REGISTERED'].includes(action)) {
                    loadData()
                }
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    const loadData = async () => {
        setLoading(true)
        await Promise.all([fetchWalletBalance(), fetchTransactions(), fetchStats()])
        setLoading(false)
    }

    const fetchWalletBalance = async () => {
        try {
            // Try to get Treasurer's dedicated wallet first
            const { data: treasurer } = await supabase
                .from('agents')
                .select('wallet_address')
                .eq('id', 'did:veritas:treasurer:001')
                .single()

            const addr = treasurer?.wallet_address || TREASURY_ADDRESS

            const balanceWei = await publicClient.getBalance({ address: addr as `0x${string}` })
            setWalletBalance(parseFloat(formatEther(balanceWei)))
        } catch (e) {
            console.error('[Treasurer] Balance fetch failed:', e)
            // Fallback: try the hardcoded treasury address
            try {
                const balanceWei = await publicClient.getBalance({ address: TREASURY_ADDRESS as `0x${string}` })
                setWalletBalance(parseFloat(formatEther(balanceWei)))
            } catch {
                setWalletBalance(0)
            }
        }
    }

    const fetchTransactions = async () => {
        try {
            const { data } = await supabase
                .from('agent_ledger')
                .select('*')
                .in('action', ['PAYMENT_ACCEPTED', 'TOLL_COLLECTED', 'IDENTITY_REGISTERED', 'EMAIL_SENT'])
                .order('created_at', { ascending: false })
                .limit(10)

            if (data) setRecentTx(data as TollTransaction[])
        } catch (e) {
            console.error('[Treasurer] Tx fetch failed:', e)
        }
    }

    const fetchStats = async () => {
        try {
            // Revenue from x402 payments
            const { data: payments } = await supabase
                .from('agent_ledger')
                .select('amount')
                .in('action', ['PAYMENT_ACCEPTED', 'TOLL_COLLECTED'])

            const totalRevenue = payments
                ?.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) || 0

            const { count: tollCount } = await supabase
                .from('agent_ledger')
                .select('*', { count: 'exact', head: true })
                .eq('action', 'TOLL_COLLECTED')

            const { count: paymentCount } = await supabase
                .from('agent_ledger')
                .select('*', { count: 'exact', head: true })
                .eq('action', 'PAYMENT_ACCEPTED')

            // Count wallets with balance
            const { count: agentWallets } = await supabase
                .from('agents')
                .select('*', { count: 'exact', head: true })
                .not('wallet_address', 'is', null)

            setStats({
                totalRevenue,
                tollsCollected: tollCount || 0,
                paymentsAccepted: paymentCount || 0,
                activeWallets: agentWallets || 0
            })
        } catch (e) {
            console.error('[Treasurer] Stats fetch failed:', e)
        }
    }

    const getActionLabel = (action: string) => {
        const map: Record<string, { label: string, color: string }> = {
            PAYMENT_ACCEPTED: { label: 'Pago x402', color: 'text-emerald-400' },
            TOLL_COLLECTED: { label: 'Peaje Bot', color: 'text-amber-400' },
            IDENTITY_REGISTERED: { label: 'DID Creado', color: 'text-blue-400' },
            EMAIL_SENT: { label: 'Email Enviado', color: 'text-purple-400' }
        }
        return map[action] || { label: action, color: 'text-zinc-400' }
    }

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'ahora'
        if (mins < 60) return `${mins}m`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours}h`
        return `${Math.floor(hours / 24)}d`
    }

    return (
        <ExpandablePanel
            title="Auditor de Tesorería"
            icon={DollarSign}
            did="did:veritas:treasurer:004"
            status={status}
            onToggleStatus={() => setStatus(status === 'active' ? 'paused' : 'active')}
            headerStats={
                <div className="flex gap-4 text-[10px] font-mono mr-4">
                    <div className="flex flex-col items-end">
                        <span className="text-zinc-500">PEAJES</span>
                        <span className="text-zinc-300">{stats.tollsCollected + stats.paymentsAccepted}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-amber-500/50">BALANCE</span>
                        <span className="text-amber-500 font-bold">{walletBalance.toFixed(4)} ETH</span>
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LEFT: Real Transactions */}
                <div className="space-y-4">
                    <h5 className="text-xs font-bold text-zinc-500 uppercase flex justify-between items-center">
                        Liquidaciones Recientes
                        <button onClick={loadData} className="hover:text-amber-500 transition-colors">
                            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </h5>

                    <div className="space-y-2">
                        {recentTx.length === 0 ? (
                            <div className="bg-black/40 border border-zinc-800 rounded-lg p-4 text-center">
                                <p className="text-xs text-zinc-600 italic">
                                    Sin transacciones aún. Los peajes x402 aparecerán aquí en tiempo real.
                                </p>
                            </div>
                        ) : (
                            recentTx.map(tx => {
                                const { label, color } = getActionLabel(tx.action)
                                return (
                                    <div key={tx.id} className="bg-black/40 border border-zinc-800 rounded-lg p-3 flex justify-between items-center text-xs hover:border-zinc-700 transition-colors">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                                                <ArrowRightLeft className="w-3 h-3 text-amber-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`font-bold truncate ${color}`}>{label}</p>
                                                <p className="text-zinc-600 font-mono text-[9px]">
                                                    {tx.agent_id?.slice(0, 20) || 'system'} · {timeAgo(tx.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        {tx.amount > 0 && (
                                            <div className="text-emerald-400 font-mono font-bold shrink-0 ml-2">
                                                +{parseFloat(String(tx.amount)).toFixed(4)} ETH
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>

                    <button
                        onClick={loadData}
                        className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg text-xs font-bold transition-colors border border-amber-500/20"
                    >
                        Actualizar Transacciones
                    </button>
                </div>

                {/* RIGHT: Cash Flow Summary */}
                <div className="space-y-4">
                    <h5 className="text-xs font-bold text-zinc-500 uppercase">Flujo de Caja del Sistema</h5>

                    {/* Revenue Breakdown */}
                    <div className="bg-black/50 border border-zinc-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-zinc-400">
                                <TrendingUp className="w-3 h-3 text-emerald-500" /> Ingresos x402 Totales
                            </span>
                            <span className="font-mono font-bold text-emerald-400">
                                {stats.totalRevenue.toFixed(4)} ETH
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-zinc-400">
                                <BarChart3 className="w-3 h-3 text-amber-500" /> Peajes Cobrados
                            </span>
                            <span className="font-mono text-zinc-300">{stats.tollsCollected}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-zinc-400">
                                <DollarSign className="w-3 h-3 text-purple-500" /> Pagos Aceptados
                            </span>
                            <span className="font-mono text-zinc-300">{stats.paymentsAccepted}</span>
                        </div>
                        <div className="h-px bg-zinc-800"></div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-zinc-400">
                                <Wallet className="w-3 h-3 text-blue-500" /> Wallets con Balance
                            </span>
                            <span className="font-mono text-zinc-300">{stats.activeWallets}</span>
                        </div>
                    </div>

                    {/* Treasury Wallet Card */}
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Treasury Vault</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                        <p className="font-mono text-2xl font-bold text-white">{walletBalance.toFixed(4)} ETH</p>
                        <p className="font-mono text-[9px] text-zinc-500 break-all">{TREASURY_ADDRESS}</p>
                        <div className="flex gap-2 text-[10px]">
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                <ShieldCheck className="w-3 h-3 inline mr-1" />Base Sepolia
                            </span>
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                Live Balance
                            </span>
                        </div>
                    </div>

                    {/* Fee Config */}
                    <div className="bg-black/50 border border-zinc-800 rounded-xl p-4 text-[11px] text-zinc-400 space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Fee del Protocolo</label>
                        <select className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:border-amber-500 outline-none">
                            <option value="10">10%</option>
                            <option value="15">15%</option>
                            <option value="20">20% (default)</option>
                        </select>
                        <p className="text-[9px] text-zinc-600 mt-1">Se aplica a cada peaje x402 cobrado por los Gatekeepers.</p>
                    </div>
                </div>
            </div>
        </ExpandablePanel>
    )
}
