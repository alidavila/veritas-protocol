import { Helmet } from 'react-helmet-async'
import { GeoAnalyzer } from '../components/GeoAnalyzer'
import { Link, useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'

export function AuditPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
            <Helmet>
                <title>Veritas AI Audit | Revisa si Claude o ChatGPT te están leyendo</title>
                <meta name="description" content="Auditoría gratuita en tiempo real para vulnerabilidades de Inteligencia Artificial." />
            </Helmet>

            <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-900/50 sticky top-0 bg-black/50 backdrop-blur-md z-50">
                <Link to="/" className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-emerald-500" />
                    <span className="font-bold tracking-widest uppercase text-sm">Veritas Protocol</span>
                </Link>
                <Link to="/login" className="text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                    LOGIN
                </Link>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12 md:py-24 flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 space-y-6">
                    <div className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-[10px] tracking-widest rounded-full uppercase">
                        Prueba de Vulnerabilidad IA
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        ¿Están las IAs <span className="text-red-500 line-through decoration-red-900">leyendo</span> <br />
                        <span className="text-emerald-500">robando</span> tu contenido?
                    </h1>
                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-lg">
                        Los bloqueos tradicionales con <code>robots.txt</code> ya no funcionan. Descubre en segundos si agentes de IA como GPTBot o ClaudeBot pueden clonar tu dominio gratis.
                        Aprende cómo usar Veritas Protocol para cobrarles un peaje por cada respuesta generada con tu dominio.
                    </p>

                    <ul className="space-y-4 mt-8 text-sm text-zinc-300">
                        <li className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500">1</span>
                            Escaneo Proxy en tiempo real para Bots.
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500">2</span>
                            Cálculo de densidad semántica expuesta.
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500">3</span>
                            Detección de "The Gatekeeper" (Protocolo x402).
                        </li>
                    </ul>
                </div>

                <div className="flex-1 w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-2xl relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-3xl pointer-events-none"></div>
                    <GeoAnalyzer onComplete={() => {
                        // Once they complete and skip (or finish email), we can send them to login or show the marketplace demo
                        navigate('/');
                    }} />
                </div>
            </main>

            <footer className="border-t border-zinc-900 py-12 text-center text-xs text-zinc-600 mt-24">
                <p>Protected by Veritas Protocol © {new Date().getFullYear()}</p>
            </footer>
        </div>
    )
}
