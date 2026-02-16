import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ShieldCheck, Mail, Zap, ArrowRight, X, Bot, Search } from 'lucide-react'
import { agentsService } from '../lib/agents'

// --- SYSTEM PRODUCTS (Hardcoded/Featured) ---
const systemProducts = [
    {
        id: 'gatekeeper',
        name: 'The Gatekeeper',
        tagline: 'El "Cadenero" Digital',
        rarity: 'INFRASTRUCTURE',
        desc: {
            es: 'Tu "Seguridad" Privada. Un filtro inteligente que se pone delante de tu web. Si es humano, pasa gratis. Si es IA, paga peaje.',
            en: 'Your Private Security. A smart filter that sits in front of your site. Humans pass free. AI bots pay a toll.'
        },
        longDesc: {
            es: 'Bloquea scrapers, filtra tráfico basura y cobra peaje a los agentes de IA. Tu primera línea de defensa. El Gatekeeper no es solo un firewall. Es un nodo activo que negocia con cada petición entrante. Si detecta una firma de IA (Agent-User-Agent), le presenta un contrato de micro-pago.',
            en: 'Blocks scrapers, filters junk traffic, and tolls AI agents. Your first line of defense. The Gatekeeper is not just a firewall. It is an active node that negotiates with every incoming request. If it detects an AI signature, it presents a micro-payment contract.'
        },
        price: 'Free',
        priceSub: '1% fee / tx',
        stats: [
            { label: 'Security Score', value: '100%' },
            { label: 'Threats Blocked', value: '14,918' },
            { label: 'Uptime', value: '99.99%' }
        ],
        features: ['DDOS Protection', 'Agent KYC', 'Smart Rate Limiting'],
        gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
        iconColor: 'text-emerald-500',
        icon: <ShieldCheck className="w-16 h-16 text-emerald-500" />,
        smallIcon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
        videoSrc: 'https://rdoccjvqkmvobmqrvisy.supabase.co/storage/v1/object/public/marketplace/Seguridad_IA.mp4'
    },
    {
        id: 'marketer',
        name: 'Auto-Marketer v1',
        tagline: 'Outbound Sales Autonomous Unit',
        rarity: 'GROWTH',
        desc: {
            es: 'Cazador autónomo. Escanea la web, detecta clientes vulnerables y cierra ventas por email 24/7.',
            en: 'Autonomous hunter. Scans the web, detects vulnerable clients, and closes email deals 24/7.'
        },
        longDesc: {
            es: 'Este agente vive en la red. Se alimenta de leads cualificados y ejecuta campañas de email frío hiper-personalizadas. Aprende de cada rechazo y optimiza su copy automáticamente. Es como tener un equipo de ventas que no duerme.',
            en: 'This agent lives on the network. Fed by qualified leads, it executes hyper-personalized cold email campaigns. It learns from every rejection and optimizes its copy automatically.'
        },
        price: '$49',
        priceSub: '/ month',
        stats: [
            { label: 'Outreach Cap', value: '10k/mo' },
            { label: 'Avg. Open Rate', value: '42%' },
            { label: 'Auto-Reply', value: 'Yes' }
        ],
        features: ['Email Warmup', 'Sentiment Analysis', 'CRM Sync'],
        gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
        iconColor: 'text-blue-500',
        icon: <Mail className="w-16 h-16 text-blue-500" />,
        smallIcon: <Mail className="w-6 h-6 text-blue-500" />,
        videoSrc: 'https://rdoccjvqkmvobmqrvisy.supabase.co/storage/v1/object/public/marketplace/marketer.mp4'
    }
]

import { useSoundEffects } from '../hooks/useSoundEffects'
import { GeoAnalyzer } from './GeoAnalyzer'

export function ServiceMarketplace({ theme = 'dark', lang = 'es' }: { theme?: 'dark' | 'light', lang?: 'es' | 'en' }) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [deploying, setDeploying] = useState(false)
    const [showDiagnostic, setShowDiagnostic] = useState(false)
    const [marketplaceAgents, setMarketplaceAgents] = useState<any[]>([])
    const { playHover, playClick } = useSoundEffects()

    useEffect(() => {
        fetchMarketplace()
    }, [])

    const fetchMarketplace = async () => {
        try {
            const data = await agentsService.getMarketplaceAgents()
            const formatted = data.map(agent => ({
                id: agent.id,
                name: agent.name,
                tagline: `Agente ${agent.type} Autónomo`,
                rarity: 'COMMUNITY',
                desc: { es: agent.description || 'Sin descripción disponible.', en: agent.description || 'No description available.' },
                longDesc: { es: agent.description || 'Este es un agente desplegado por un usuario de la comunidad Veritas.', en: agent.description || 'Community agent.' },
                price: agent.price_usd ? `$${agent.price_usd}` : '$0',
                priceSub: '/ month',
                stats: [
                    { label: 'Status', value: agent.status.toUpperCase() },
                    { label: 'Type', value: agent.type.toUpperCase() },
                    { label: 'Uptime', value: '100%' }
                ],
                features: ['Veritas Certified', 'Easy Connect'],
                gradient: 'from-zinc-500/10 via-zinc-500/5 to-transparent',
                iconColor: 'text-zinc-500',
                icon: agent.type === 'scraper' ? <Search className="w-16 h-16 text-zinc-500" /> : <Bot className="w-16 h-16 text-zinc-500" />,
                smallIcon: <Bot className="w-6 h-6 text-zinc-500" />
            }))
            setMarketplaceAgents(formatted)
        } catch (error) {
            console.error("Error fetching marketplace:", error)
        }
    }

    const products = [...systemProducts, ...marketplaceAgents]

    const handleCardClick = (id: string) => {
        playClick()
        setSelectedId(id)
    }

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedId(null)
    }

    const handleDeploy = (e: React.MouseEvent, id: string) => {
        e.stopPropagation()

        if (id === 'gatekeeper') {
            setShowDiagnostic(true)
            return
        }

        setDeploying(true)
        setTimeout(() => {
            alert(`Instancia del agente ${id} solicitada. Revisando legitimidad...`)
            setDeploying(false)
            setSelectedId(null)
        }, 1500)
    }

    const isDark = theme === 'dark'
    const selectedProduct = products.find(p => p.id === selectedId)

    return (
        <section className="relative h-full flex flex-col justify-center">

            {/* DIAGNOSTIC MODAL (GATEKEEPER) */}
            {showDiagnostic && createPortal(
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500"
                        onClick={() => setShowDiagnostic(false)}
                    />
                    <div className="relative z-10 w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowDiagnostic(false)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <GeoAnalyzer onComplete={async (url) => {
                            setDeploying(true)
                            try {
                                const newAgent = await agentsService.createAgent({
                                    name: `Gatekeeper for ${url.replace(/https?:\/\//, '')}`,
                                    type: 'custom',
                                    description: `Veritas Gatekeeper active on ${url}. Monitoring AI traffic and collecting x402 tolls.`,
                                    config: {
                                        target_url: url,
                                        version: '2.0',
                                        protection: 'high'
                                    }
                                })
                                setShowDiagnostic(false)
                                setSelectedId(null)
                                alert(`Nodo Activado: ${newAgent.name}\nDID: ${newAgent.id}\nWallet: ${newAgent.wallet_address}\n\nBienvenido a la Economía Agéntica.`)
                            } catch (error) {
                                console.error("Error activating node:", error)
                                alert("Error al activar el nodo. Asegúrate de que el backend esté corriendo.")
                            } finally {
                                setDeploying(false)
                            }
                        }} />
                    </div>
                </div>,
                document.body
            )}

            {/* BACKDROP BLUR WHEN EXPANDED */}
            {selectedId && (
                <div // ... existing backdrop
                    className="fixed inset-0 z-40 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setSelectedId(null)}
                />
            )}
// ... rest of component

            {/* Header */}
            <div className={`mb-8 px-1 transition-opacity duration-300 ${selectedId ? 'opacity-0' : 'opacity-100'}`}>
                <h2 className={`text-xl font-bold mb-1 flex items-center gap-2 tracking-tighter ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    Marketplace
                </h2>
                <p className={`text-xs font-medium uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Available Infrastructure
                </p>
            </div>

            {/* MARQUEE CAROUSEL */}
            <div className={`relative w-full overflow-hidden pb-12 transition-all duration-500 ${selectedId ? 'opacity-50 blur-sm pointer-events-none' : 'opacity-100'}`}>

                {/* Gradient Masks for smooth edges */}
                <div className={`absolute top-0 left-0 h-full w-24 z-10 bg-gradient-to-r ${isDark ? 'from-black to-transparent' : 'from-zinc-50 to-transparent'}`}></div>
                <div className={`absolute top-0 right-0 h-full w-24 z-10 bg-gradient-to-l ${isDark ? 'from-black to-transparent' : 'from-zinc-50 to-transparent'}`}></div>

                {/* The Track */}
                <div className="flex w-max animate-marquee gap-6 px-6">
                    {/* Render TWICE to create the loop */}
                    {[...products, ...products].map((p, i) => (
                        <div
                            key={`${p.id}-${i}`} // Unique key for duplicates
                            onClick={() => handleCardClick(p.id)}
                            onMouseEnter={playHover}
                            className={`group relative flex-shrink-0 w-80 h-[460px] cursor-pointer border rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2 ring-1 ring-inset ${isDark ? 'bg-zinc-950 border-zinc-800 ring-white/5' : 'bg-white border-zinc-200 ring-black/5'}`}
                        >
                            {/* 1. VISUAL SIMULATION (Top Half) */}
                            <div className={`h-[55%] w-full relative overflow-hidden p-6 flex flex-col justify-between transition-colors duration-500 ${isDark ? 'bg-zinc-900/30 group-hover:bg-zinc-900/50' : 'bg-zinc-50 group-hover:bg-zinc-100'}`}>

                                {/* Abstract Simulation based on Agent Type */}
                                <div className="absolute inset-0 opacity-80 transition-opacity duration-700">
                                    {
                                        // IF VIDEO EXISTS, RENDER VIDEO
                                        // @ts-ignore - Dynamic property check
                                        p.videoSrc ? (
                                            <video
                                                src={p.videoSrc}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="w-full h-full object-cover opacity-0 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700 ease-out"
                                            />
                                        ) : (
                                            // ELSE RENDER FALLBACK ANIMATIONS
                                            <>
                                                {p.id === 'gatekeeper' && <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay"></div>}
                                                {p.id === 'marketer' && (
                                                    <div className="space-y-3 p-6 opacity-60">
                                                        <div className="h-0.5 w-3/4 bg-blue-500/30 rounded-full animate-pulse"></div>
                                                        <div className="h-0.5 w-1/2 bg-blue-500/30 rounded-full animate-pulse delay-75"></div>
                                                        <div className="h-0.5 w-full bg-blue-500/30 rounded-full animate-pulse delay-150"></div>
                                                    </div>
                                                )}
                                            </>
                                        )
                                    }
                                </div>

                                {/* Icon Floating */}
                                <div className="relative z-10 transform scale-90 group-hover:scale-100 transition-transform duration-500 ease-out origin-center drop-shadow-lg">
                                    {p.icon}
                                </div>

                                {/* Live Badge */}
                                <div className={`text-[9px] font-mono tracking-widest uppercase flex items-center gap-2 relative z-10 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                    <div className={`w-1 h-1 rounded-full animate-pulse ${p.iconColor.replace('text-', 'bg-')}`}></div>
                                    Live Node
                                </div>
                            </div>

                            {/* 2. INFO (Bottom Half) */}
                            <div className="h-[45%] p-6 flex flex-col relative">
                                {/* Subtle Gradient Line Separator */}
                                <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-800 opacity-50`}></div>

                                <div className="mb-3">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2 block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                        {p.rarity}
                                    </span>
                                    {/* TYPOGRAPHY: Heavier, tighter tracking, subtle gradient */}
                                    <h3 className={`text-2xl font-bold tracking-tighter leading-none mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${isDark ? 'text-white from-white to-zinc-400' : 'text-zinc-900 from-zinc-900 to-zinc-600'}`}>
                                        {p.name}
                                    </h3>
                                </div>

                                <p className={`text-xs font-medium leading-relaxed line-clamp-3 mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                    {lang === 'es' ? p.desc.es : p.desc.en}
                                </p>

                                <div className="mt-auto flex justify-between items-end">
                                    <div>
                                        <div className={`text-xl font-mono font-medium tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>{p.price}</div>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:rotate-[-45deg] ${isDark ? 'bg-zinc-900 text-zinc-400 group-hover:bg-white group-hover:text-black shadow-lg shadow-black/20' : 'bg-zinc-100 text-zinc-400 group-hover:bg-black group-hover:text-white shadow-lg shadow-zinc-200'}`}>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* EXPANDED MODAL (PORTAL TO BODY TO ESCAPE STACKING CONTEXTS) */}
            {selectedId && selectedProduct && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
                    {/* BACKDROP */}
                    <div
                        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setSelectedId(null)}
                    />

                    {/* MODAL CONTENT */}
                    <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row ${isDark ? 'bg-zinc-950 border border-zinc-800' : 'bg-white'}`}>

                        {/* LEFT: IMMERSIVE VISUAL */}
                        <div className={`w-full md:w-2/5 p-8 flex flex-col justify-center relative overflow-hidden ${isDark ? 'bg-zinc-900/30' : 'bg-zinc-50'}`}>
                            <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${selectedProduct.gradient}`}></div>
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="mb-8 transform scale-150">{selectedProduct.icon}</div>
                                <h2 className={`text-2xl font-bold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>{selectedProduct.name}</h2>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-400' : 'border-zinc-200 bg-white text-zinc-600'}`}>
                                    veritas verified
                                </span>
                            </div>
                        </div>

                        {/* RIGHT: SPECS & BUY */}
                        <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col">
                            <button
                                onClick={handleClose}
                                className={`absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="mb-8">
                                <h3 className={`text-xs font-bold uppercase mb-4 opacity-50 tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-900'}`}>Capabilities</h3>
                                <p className={`text-lg leading-relaxed font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                    {lang === 'es' ? selectedProduct.longDesc.es : selectedProduct.longDesc.en}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-10">
                                {selectedProduct.stats.map((stat: { label: string; value: string }, i: number) => (
                                    <div key={i} className={`pb-4 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                                        <div className="text-[10px] text-zinc-500 mb-1 font-mono uppercase tracking-wider">{stat.label}</div>
                                        <div className={`text-xl font-mono font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>{stat.value}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto flex items-center justify-between gap-6">
                                <div>
                                    <div className={`text-3xl font-mono font-bold tracking-tighter ${isDark ? 'text-white' : 'text-zinc-900'}`}>{selectedProduct.price}</div>
                                    <div className="text-xs text-zinc-500">{selectedProduct.priceSub}</div>
                                </div>
                                <button
                                    onClick={(e) => handleDeploy(e, selectedProduct.id)}
                                    disabled={deploying}
                                    className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
                                >
                                    {deploying ? (
                                        <span className="animate-spin"><Zap className="w-4 h-4" /></span>
                                    ) : (
                                        <>
                                            Deploy Instance
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>,
                document.body
            )}
        </section>
    )
}
