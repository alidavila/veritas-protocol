
import { useState } from 'react'
import { X, Bot, Shield, Search, Zap, Loader2, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { agentsService } from '../lib/agents'

interface DeployAgentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

const AGENT_TYPES = [
    { id: 'support', icon: Bot, label: 'Support Agent', desc: 'Handles customer queries and issues.', color: 'text-blue-400' },
    { id: 'sales', icon: Zap, label: 'Sales Agent', desc: 'Identifies leads and closes deals.', color: 'text-emerald-400' },
    { id: 'scraper', icon: Search, label: 'Data Scraper', desc: 'Extracts information from websites.', color: 'text-purple-400' },
    { id: 'custom', icon: Shield, label: 'Custom Protocol', desc: 'User-defined logic and behavior.', color: 'text-zinc-400' },
]

export function DeployAgentModal({ isOpen, onClose, onSuccess }: DeployAgentModalProps) {
    const [name, setName] = useState('')
    const [type, setType] = useState('support')
    const [isPublic, setIsPublic] = useState(false)
    const [price, setPrice] = useState('0')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDeploy = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await agentsService.createAgent({
                name,
                type: type as any,
                is_public: isPublic,
                price_usd: parseFloat(price),
                description
            })
            onSuccess()
            onClose()
            setName('')
            setIsPublic(false)
            setPrice('0')
            setDescription('')
        } catch (err: any) {
            setError(err.message || 'Failed to deploy agent')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 sticky top-0 z-10 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                    <Bot className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Desplegar Nuevo Agente</h2>
                                    <p className="text-xs text-zinc-500">Configura tu nodo de IA en Veritas Protocol</p>
                                </div>
                            </div>
                            <button onClick={onClose} type="button" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>
                        </div>

                        <form onSubmit={handleDeploy} className="p-8 space-y-8">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">Nombre del Agente</label>
                                    <input
                                        autoFocus
                                        required
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ej: HunterBot-01"
                                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">Precio Mensual (USD)</label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">Descripción (Marketplace)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe las capacidades de tu agente..."
                                    rows={3}
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">Tipo de Especialidad</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {AGENT_TYPES.map((agent) => (
                                        <div
                                            key={agent.id}
                                            onClick={() => setType(agent.id)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${type === agent.id
                                                ? 'bg-emerald-500/5 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                                : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
                                        >
                                            <agent.icon className={`w-6 h-6 mb-3 ${type === agent.id ? 'text-emerald-500' : agent.color}`} />
                                            <p className="font-bold text-sm text-white">{agent.label}</p>
                                            <p className="text-[10px] text-zinc-500 mt-1 leading-tight">{agent.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPublic ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Listar en Marketplace</p>
                                        <p className="text-[10px] text-zinc-500">Permite que otros alquilen tu agente.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsPublic(!isPublic)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPublic ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="pt-4">
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Desplegando...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5 fill-current" />
                                            Confirmar Despliegue
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-center text-zinc-600 mt-4 leading-relaxed">
                                    Al desplegar, se creará una **Wallet de Base Sepolia** vinculada únicamente a este agente para gestionar sus pagos y transacciones automáticamente.
                                </p>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
