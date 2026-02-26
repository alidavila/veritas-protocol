import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Mail, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { agentsService } from '../lib/agents'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

export function LoginPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const activateAgent = searchParams.get('activate')
    const activateUrl = searchParams.get('url')
    const { signInWithGoogle, signInWithMagicLink, signInWithPassword, signUp, user } = useAuth()
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mode, setMode] = useState<'login' | 'signup' | 'magiclink'>('login')
    const [sent, setSent] = useState(false)

    if (user) {
        // If user is already logged in and has activation params, create agent first
        if (activateAgent === 'gatekeeper' && activateUrl) {
            agentsService.createAgent({
                name: `Gatekeeper for ${activateUrl}`,
                type: 'support',
                description: `Veritas Gatekeeper active on ${activateUrl}. Monitoring AI traffic and collecting x402 tolls.`,
                config: {
                    target_url: activateUrl,
                    version: '2.0',
                    protection: 'high'
                }
            }).then(() => {
                navigate('/dashboard?gatekeeper=installed')
            }).catch(() => {
                navigate('/dashboard')
            })
        } else {
            navigate('/dashboard')
        }
        return null
    }

    // Helper: after successful auth, activate gatekeeper if params present
    const postAuthAction = async () => {
        if (activateAgent === 'gatekeeper' && activateUrl) {
            try {
                await agentsService.createAgent({
                    name: `Gatekeeper for ${activateUrl}`,
                    type: 'support',
                    description: `Veritas Gatekeeper active on ${activateUrl}. Monitoring AI traffic and collecting x402 tolls.`,
                    config: {
                        target_url: activateUrl,
                        version: '2.0',
                        protection: 'high'
                    }
                })
                navigate('/dashboard?gatekeeper=installed')
            } catch {
                navigate('/dashboard')
            }
        } else {
            navigate('/dashboard')
        }
    }

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await signInWithPassword(email, password)
            await postAuthAction()
        } catch (err: any) {
            if (err.message?.includes('Invalid login credentials')) {
                setError(t('login.invalidCredentials'))
            } else {
                setError(err.message || t('login.loginError'))
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password.length < 6) {
            setError(t('login.passwordTooShort'))
            return
        }
        setLoading(true)
        setError(null)
        try {
            await signUp(email, password)
            setSent(true)
        } catch (err: any) {
            if (err.message?.includes('already registered')) {
                setError(t('login.alreadyRegistered'))
            } else {
                setError(err.message || t('login.signupError'))
            }
        } finally {
            setLoading(false)
        }
    }

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await signInWithMagicLink(email)
            setSent(true)
        } catch (err: any) {
            setError(err.message || t('login.magicLinkError'))
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
            if (err.message?.includes('provider is not enabled')) {
                setError(t('login.googleNotEnabled'))
            } else {
                setError(err.message || t('login.googleError'))
            }
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
            <Helmet>
                <title>{mode === 'signup' ? t('login.titleSignup') : t('login.titleLogin')} | Veritas Protocol</title>
            </Helmet>

            {/* Language Switcher (top right) */}
            <div className="absolute top-6 right-6 z-20">
                <LanguageSwitcher variant="compact" />
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black pointer-events-none" />
            <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

            <div className="w-full max-w-md relative z-10">
                {/* Gatekeeper Activation Banner */}
                {activateAgent === 'gatekeeper' && activateUrl && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-emerald-400">Activando Gatekeeper</p>
                            <p className="text-xs text-emerald-500/70">Inicia sesión para activar el nodo en <code className="text-emerald-400">{activateUrl}</code></p>
                        </div>
                    </div>
                )}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block mb-6 hover:scale-105 transition-transform">
                        <div className="w-16 h-16 bg-zinc-900/80 backdrop-blur border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)] mx-auto rotate-3">
                            <div className="w-6 h-6 bg-emerald-500 rounded-sm" />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{t('login.consoleTitle')}</h1>
                    <p className="text-zinc-500">
                        {mode === 'signup' ? t('login.signupSubtitle') : t('login.loginSubtitle')}
                    </p>
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
                            <h3 className="text-xl font-bold text-white mb-2">{t('login.checkEmail')}</h3>
                            <p className="text-zinc-400 text-sm mb-6"
                                dangerouslySetInnerHTML={{
                                    __html: mode === 'signup'
                                        ? t('login.verificationSent', { email })
                                        : t('login.magicLinkSent', { email })
                                }}
                            />
                            <button onClick={() => { setSent(false); setMode('login') }} className="text-emerald-500 text-sm hover:underline">
                                {t('login.backToLogin')}
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
                                {t('login.continueWithGoogle')}
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-800" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-zinc-900/50 px-3 text-zinc-600 font-mono">{t('login.orWithEmail')}</span>
                                </div>
                            </div>

                            {(mode === 'login' || mode === 'signup') && (
                                <form onSubmit={mode === 'login' ? handlePasswordLogin : handleSignUp} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">{t('login.emailLabel')}</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder={t('login.emailPlaceholder')}
                                                className="w-full bg-black/50 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-700"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">{t('login.passwordLabel')}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-black/50 border border-zinc-700 rounded-xl pl-10 pr-12 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-700"
                                                required
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3.5 text-zinc-600 hover:text-zinc-400"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-emerald-600 text-white font-bold h-12 rounded-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {mode === 'signup' ? t('login.createAccount') : t('login.signIn')}
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {mode === 'magiclink' && (
                                <form onSubmit={handleMagicLink} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">{t('login.emailLabel')}</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder={t('login.emailPlaceholder')}
                                                className="w-full bg-black/50 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-700"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-emerald-600/10 border border-emerald-500/50 text-emerald-500 font-bold h-12 rounded-xl hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 group"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {t('login.sendMagicLink')}
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            <div className="flex flex-col items-center gap-2 text-xs text-zinc-500">
                                {mode === 'login' && (
                                    <>
                                        <button onClick={() => { setMode('signup'); setError(null) }} className="hover:text-emerald-400 transition-colors">
                                            {t('login.noAccount')} <span className="text-emerald-500 font-semibold">{t('login.register')}</span>
                                        </button>
                                        <button onClick={() => { setMode('magiclink'); setError(null) }} className="hover:text-zinc-300 transition-colors">
                                            {t('login.magicLinkOption')}
                                        </button>
                                    </>
                                )}
                                {mode === 'signup' && (
                                    <button onClick={() => { setMode('login'); setError(null) }} className="hover:text-emerald-400 transition-colors">
                                        {t('login.hasAccount')} <span className="text-emerald-500 font-semibold">{t('login.loginLink')}</span>
                                    </button>
                                )}
                                {mode === 'magiclink' && (
                                    <button onClick={() => { setMode('login'); setError(null) }} className="hover:text-emerald-400 transition-colors">
                                        {t('login.backToPasswordLogin')}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/5 text-center flex justify-center items-center gap-2 text-zinc-600 text-xs">
                        <ShieldCheck className="w-3 h-3" />
                        {t('login.protectedBy')}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
