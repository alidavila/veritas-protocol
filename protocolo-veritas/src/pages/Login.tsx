import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Mail, AlertCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
    const navigate = useNavigate()
    const { signInWithGoogle, signInWithMagicLink, user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [sent, setSent] = useState(false)

    // Redirect if already logged in
    if (user) {
        navigate('/dashboard')
        return null
    }

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await signInWithMagicLink(email)
            setSent(true)
        } catch (err: any) {
            setError(err.message || "Error sending magic link")
        } finally {
            setLoading(false)
        }
    }

    const handleGoogle = async () => {
        setLoading(true)
        setError(null)
        try {
            await signInWithGoogle()
        } catch (err: any) {
            console.error(err)
            if (err.message?.includes('provider is not enabled') || err.msg?.includes('provider is not enabled')) {
                setError("Error: Google Auth no está habilitado en tu proyecto Supabase. Ve a Authentication > Providers y actívalo.")
            } else {
                setError(err.message || err.msg || "Error with Google Auth")
            }
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
            <Helmet>
                <title>Login | Veritas Protocol</title>
            </Helmet>

            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black pointer-events-none" />
            <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block mb-6 hover:scale-105 transition-transform">
                        <div className="w-16 h-16 bg-zinc-900/80 backdrop-blur border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)] mx-auto rotate-3">
                            <div className="w-6 h-6 bg-emerald-500 rounded-sm" />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Veritas Console</h1>
                    <p className="text-zinc-500">Acceso seguro a tu infraestructura de agentes.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
                >
                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {sent ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                <Mail className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Revisa tu Email</h3>
                            <p className="text-zinc-400 text-sm mb-6">
                                Hemos enviado un enlace mágico a <strong>{email}</strong>. <br />
                                Haz click para entrar sin contraseña.
                            </p>
                            <button
                                onClick={() => setSent(false)}
                                className="text-emerald-500 text-sm hover:underline"
                            >
                                Usar otro correo
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <button
                                onClick={handleGoogle}
                                disabled={loading}
                                className="w-full bg-white text-black font-bold h-12 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                                Continuar con Google
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-800" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-black px-2 text-zinc-600 font-mono upper">O usa tu email</span>
                                </div>
                            </div>

                            <form onSubmit={handleMagicLink} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">Email Corporativo</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="tu@empresa.com"
                                            className="w-full bg-black/50 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-700"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-emerald-600/10 border border-emerald-500/50 text-emerald-500 font-bold h-12 rounded-xl hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Enviar Magic Link
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/5 text-center flex justify-center items-center gap-2 text-zinc-600 text-xs">
                        <ShieldCheck className="w-3 h-3" />
                        Protegido por Veritas Protocol Auth
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
