import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Play, Square, ChevronDown } from 'lucide-react'

interface ExpandablePanelProps {
    title: string
    icon: any
    did: string
    status: 'active' | 'paused' | 'error'
    onToggleStatus?: () => void
    children: React.ReactNode
    defaultExpanded?: boolean
    headerStats?: React.ReactNode // Extra info in the header right side
}

export function ExpandablePanel({
    title,
    icon: Icon,
    did,
    status,
    onToggleStatus,
    children,
    defaultExpanded = false,
    headerStats
}: ExpandablePanelProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)

    const isActive = status === 'active'

    return (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden transition-all hover:border-zinc-800">
            {/* Header (Clickable anywhere to expand) */}
            <div
                className={`p-4 flex items-center justify-between cursor-pointer select-none transition-colors ${isExpanded ? 'bg-zinc-900/30' : 'hover:bg-zinc-900/40'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm tracking-tight text-white">{title}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-tighter ${isActive
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                }`}>
                                {isActive ? 'ACTIVO' : 'PAUSADO'}
                            </span>
                        </div>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">{did || 'did:veritas:unassigned'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Optional extra stats */}
                    {headerStats && (
                        <div className="hidden sm:block mr-2" onClick={(e) => e.stopPropagation()}>
                            {headerStats}
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        {onToggleStatus && (
                            <button
                                onClick={onToggleStatus}
                                className={`p-2 rounded-lg transition-all ${isActive
                                    ? 'text-emerald-500 hover:bg-emerald-900/30'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                    }`}
                                title={isActive ? "Pausar Agente" : "Iniciar Agente"}
                            >
                                {isActive ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                            </button>
                        )}
                        <button
                            onClick={() => setIsExpanded(true)}
                            className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                            title="Configurar"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Chevron expand */}
                    <div className={`text-zinc-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Expandable Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-zinc-900 p-6 bg-black/20">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
