import { useState, useEffect } from 'react'
import { DollarSign, Wallet, ArrowRightLeft, ShieldCheck, RefreshCw } from 'lucide-react'
import { ExpandablePanel } from './ExpandablePanel'
import { supabase } from '../lib/supabase'

export function TreasurerPanel() {
    const [status, setStatus] = useState<'active' | 'paused'>('active')
    const [stats, setStats] = useState({ treasuryEth: 0, transactions: 0, activeWallets: 0 })
    const [loading, setLoading] = useState(false)
    const [recentTx, setRecentTx] = useState<any[]>([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            // Fetch Gatekeeper Agent to get the assigned treasury wallet
            const { data: agents } = await supabase.from('agents').select('*').limit(10)
            const gkAgent = agents?.find(a => a.name.toLowerCase().includes('gatekeeper'))

            // Mocking for now, eventually query blockchain or real ledger
            setStats({
                treasuryEth: 0.0003,
                transactions: 12,
                activeWallets: gkAgent?.wallet ? 1 : 0
            })

            setRecentTx([
                { id: 'tx1', amount: 0.00005, from: 'Bot: GPTBot', age: '2 min ago' },
                { id: 'tx2', amount: 0.00005, from: 'Bot: ClaudeBot', age: '15 min ago' },
                { id: 'tx3', amount: 0.00005, from: 'Bot: WebCrawler', age: '1 hour ago' }
            ])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
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
                        <span className="text-zinc-500">TXS HOY</span>
                        <span className="text-zinc-300">{stats.transactions}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-amber-500/50">FONDOS DISP.</span>
                        <span className="text-amber-500 font-bold">{stats.treasuryEth} ETH</span>
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h5 className="text-xs font-bold text-zinc-500 uppercase flex justify-between items-center">
                        Liquidaciones Recientes
                        <button onClick={loadData} className="hover:text-amber-500">
                            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </h5>

                    <div className="space-y-2">
                        {recentTx.map(tx => (
                            <div key={tx.id} className="bg-black/40 border border-zinc-800 rounded-lg p-3 flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                                        <ArrowRightLeft className="w-3 h-3 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-zinc-300 font-bold">{tx.from}</p>
                                        <p className="text-zinc-600 font-mono text-[9px]">{tx.age}</p>
                                    </div>
                                </div>
                                <div className="text-emerald-400 font-mono font-bold">
                                    +{tx.amount} ETH
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg text-xs font-bold transition-colors border border-amber-500/20">
                        Ver todas las transacciones
                    </button>
                </div>

                <div className="space-y-4">
                    <h5 className="text-xs font-bold text-zinc-500 uppercase">Configuración de Comisiones</h5>
                    <div className="bg-black/50 border border-zinc-800 rounded-xl p-4 text-[11px] text-zinc-400 space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Fee del Protocolo (Nuestra Tajada)</label>
                            <select className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:border-amber-500 outline-none">
                                <option value="10">10%</option>
                                <option value="15">15%</option>
                                <option value="20" selected>20%</option>
                            </select>
                        </div>
                        <div className="h-px bg-zinc-800 my-2"></div>
                        <div className="space-y-2 font-mono">
                            <p className="flex items-center gap-2"><Wallet className="w-3 h-3 text-zinc-500" /> Retiro Mínimo: 0.01 ETH</p>
                            <p className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-zinc-500" /> Red: Base (Layer 2)</p>
                        </div>
                    </div>
                </div>
            </div>
        </ExpandablePanel>
    )
}
