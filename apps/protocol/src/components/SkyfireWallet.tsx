
import { useState, useEffect } from 'react'
import { Zap, Copy, Check, ArrowDown, ExternalLink } from 'lucide-react'
import { useVeritasState } from '../hooks/useVeritasState'

interface SkyfireWalletProps {
    theme?: 'dark' | 'light';
    mode?: 'send' | 'receive';
}

// The real treasury address (from create_wallet.js)
const TREASURY_ADDRESS = "0x4d2B70d358C5DA9c4fC6e8Ce743Ed67d55C19099";

export function SkyfireWallet({ theme = 'dark', mode = 'send' }: SkyfireWalletProps) {
    const { treasury } = useVeritasState()
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(true)

    const isDark = theme === 'dark'
    const textMain = isDark ? 'text-white' : 'text-zinc-900'
    const iconBg = isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
    const bg = isDark ? 'bg-zinc-900' : 'bg-white'
    const border = isDark ? 'border-zinc-800' : 'border-zinc-200'

    useEffect(() => {
        // Treasury is loaded by useVeritasState hook
        const timer = setTimeout(() => setLoading(false), 1500)
        return () => clearTimeout(timer)
    }, [])

    const copyAddress = () => {
        navigator.clipboard.writeText(TREASURY_ADDRESS)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const shortAddress = `${TREASURY_ADDRESS.slice(0, 6)}...${TREASURY_ADDRESS.slice(-4)}`;

    return (
        <section className={`relative overflow-hidden transition-all duration-500 rounded-3xl p-1 group`}>
            {/* GLOW EFFECT */}
            <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? 'from-emerald-500/10 via-emerald-500/5 to-transparent' : 'from-zinc-200 via-white to-transparent'} opacity-50 blur-xl -z-10`}></div>

            {/* CARD */}
            <div className={`${bg} backdrop-blur-xl ${border} border rounded-2xl p-6 relative overflow-hidden shadow-2xl`}>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${iconBg}`}>
                            <Zap className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-zinc-900'}`} />
                        </div>
                        <div>
                            <h2 className={`text-sm font-bold tracking-tight ${textMain}`}>Treasury Wallet</h2>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                                {mode === 'receive' ? 'Merchant Node' : 'Base Sepolia (L2)'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-950/30 px-2 py-1 rounded-full border border-emerald-900/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-mono text-emerald-500 font-bold">LIVE</span>
                    </div>
                </div>

                {/* Balance / Address Display */}
                {mode === 'receive' ? (
                    <div className="mb-8">
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">Your Receiving Address</p>
                        <div
                            onClick={copyAddress}
                            className={`group flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${isDark ? 'bg-black/50 border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-950/10' : 'bg-zinc-50 border-zinc-200 hover:border-emerald-500/50'}`}
                        >
                            <code className={`font-mono text-lg tracking-wider ${textMain}`}>{shortAddress}</code>
                            <div className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-zinc-900 group-hover:bg-emerald-500/20' : 'bg-white group-hover:bg-zinc-100'}`}>
                                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500" />}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-emerald-500/80 font-mono">
                            <ArrowDown className="w-3 h-3 animate-bounce" />
                            <span>Listening for payments on Base Sepolia...</span>
                        </div>
                    </div>
                ) : (
                    <div className="mb-8">
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Balance Real (Blockchain)</p>
                        <div className="flex items-baseline gap-1">
                            {loading ? (
                                <span className="text-4xl font-light text-zinc-500 animate-pulse tracking-tighter">Loading...</span>
                            ) : (
                                <>
                                    <span className={`text-5xl font-bold tracking-tighter ${textMain} drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]`}>
                                        {treasury.toFixed(6)}
                                    </span>
                                    <span className="text-sm text-zinc-500 ml-2 font-mono">ETH</span>
                                </>
                            )}
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-2 font-mono">{shortAddress}</p>
                    </div>
                )}

                {/* Action Bar */}
                <div className="grid grid-cols-2 gap-4">
                    <a
                        href={`https://sepolia.basescan.org/address/${TREASURY_ADDRESS}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
                    >
                        <ExternalLink className="w-3 h-3" />
                        Ver en BaseScan
                    </a>
                    <button
                        onClick={copyAddress}
                        className={`border py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-2 hover:bg-opacity-50 ${isDark ? 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
                    >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copiado!' : 'Copiar Address'}
                    </button>
                </div>

                {/* Footer */}
                <div className={`mt-8 pt-6 border-t flex justify-between items-center text-[9px] font-mono tracking-widest uppercase ${isDark ? 'border-zinc-800/50 text-zinc-600' : 'border-zinc-200 text-zinc-400'}`}>
                    <span>NET: BASE_SEPOLIA</span>
                    <span className="flex items-center gap-1"><span className="w-1 h-1 bg-emerald-500 rounded-full"></span> REAL DATA</span>
                </div>
            </div>
        </section>
    )
}
