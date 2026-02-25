import { motion } from 'framer-motion'
import { ArrowRight, Check, Code2, Lock, Shield, Terminal, Zap, Wallet, Fingerprint } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useTranslation } from 'react-i18next'

import { ServiceMarketplace } from './ServiceMarketplace'
import { LanguageSwitcher } from './LanguageSwitcher'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function VeritasResendLanding() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-200 font-sans overflow-x-hidden">
            <Navbar />
            <HeroSection />
            <ProblemSolutionSection />
            <KeyLifecycleSection />
            <MarketplaceSection />
            <EconomySection />
            <FaqSection />
            <CtaSection />
        </div>
    )
}

function Navbar() {
    const { t } = useTranslation()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "fixed top-0 w-full z-50 border-b transition-all duration-300",
                scrolled ? "bg-black/80 backdrop-blur-md border-white/10" : "bg-transparent border-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-emerald-300 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-shadow">
                        <div className="w-3 h-3 bg-black rounded-full" />
                    </div>
                    <span className="font-bold text-xl tracking-tight font-serif text-white">Veritas</span>
                </Link>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                    {[
                        { label: t('nav.protocol'), href: '#how-it-works' },
                        { label: t('nav.development'), href: '#lifecycle' },
                        { label: t('nav.useCases'), href: '#marketplace' },
                        { label: t('nav.pricing'), href: '#pricing' }
                    ].map((item) => (
                        <a key={item.label} href={item.href} className="hover:text-white transition-colors relative group">
                            {item.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-emerald-500 group-hover:w-full transition-all duration-300" />
                        </a>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">{t('nav.login')}</Link>
                    <Link to="/login" className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-full hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        {t('nav.deployAgent')}
                    </Link>
                </div>
            </div>
        </motion.nav>
    )
}

function HeroSection() {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText('npm install @veritas/sdk')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <section className="pt-40 pb-20 px-6 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black pointer-events-none" />
            <div className="absolute top-[20%] left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse-slow" />
            <div className="absolute top-[30%] right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />

            <div className="max-w-5xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-zinc-300 mb-8 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="group-hover:text-white transition-colors">{t('hero.badge')}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-6xl md:text-8xl font-serif tracking-tight leading-[1] mb-8"
                >
                    {t('hero.title1')} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-500 via-white to-white">{t('hero.title2')}</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    {t('hero.subtitle1')} <br />
                    {t('hero.subtitle2')} <br />
                    <strong className="text-white font-medium">{t('hero.subtitleBold')}</strong>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link to="/dashboard?action=create_id" className="h-14 px-8 rounded-full bg-white text-black font-bold text-base flex items-center gap-2 hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                        {t('hero.cta')}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <button
                        onClick={handleCopy}
                        className="h-14 px-8 rounded-full border border-white/10 bg-white/5 text-white font-semibold text-base hover:bg-white/10 transition-all backdrop-blur-sm flex items-center gap-2"
                    >
                        {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Terminal className="w-5 h-5 text-zinc-400" />}
                        <code>npm install @veritas/sdk</code>
                    </button>
                </motion.div>
            </div>
        </section>
    )
}

function ProblemSolutionSection() {
    const { t } = useTranslation()
    return (
        <section id="how-it-works" className="py-32 px-6 border-t border-white/5 bg-zinc-950/50">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-r from-red-500/10 to-transparent blur-2xl rounded-3xl" />
                        <div className="relative border border-white/10 bg-black/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <Lock className="w-32 h-32 text-red-500 rotate-12" />
                            </div>

                            <h3 className="text-2xl font-serif text-red-400 mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                {t('problemSolution.currentStateTitle')}
                            </h3>

                            <div className="space-y-4 font-mono text-sm">
                                <div className="flex items-center gap-4 text-zinc-500 line-through decoration-red-500/50">
                                    <Wallet className="w-5 h-5" />
                                    <span>{t('problemSolution.noPayments')}</span>
                                </div>
                                <div className="flex items-center gap-4 text-zinc-500 line-through decoration-red-500/50">
                                    <Fingerprint className="w-5 h-5" />
                                    <span>{t('problemSolution.noKyc')}</span>
                                </div>
                                <div className="flex items-center gap-4 text-zinc-500 line-through decoration-red-500/50">
                                    <Shield className="w-5 h-5" />
                                    <span>{t('problemSolution.noLiability')}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5">
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-200 text-xs">
                                    ⚠️ <strong>{t('problemSolution.riskTitle')}</strong> {t('problemSolution.riskDesc')}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-5xl font-serif mb-6 leading-tight">
                            {t('problemSolution.solutionTitle1')} <br />
                            <span className="text-emerald-500">{t('problemSolution.solutionTitle2')}</span>
                        </h2>
                        <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                            {t('problemSolution.solutionDesc')}
                        </p>

                        <div className="space-y-6">
                            {[
                                { title: t('problemSolution.feature1Title'), desc: t('problemSolution.feature1Desc'), icon: Fingerprint },
                                { title: t('problemSolution.feature2Title'), desc: t('problemSolution.feature2Desc'), icon: Zap },
                                { title: t('problemSolution.feature3Title'), desc: t('problemSolution.feature3Desc'), icon: Check }
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-4 items-start group">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                                        <feature.icon className="w-6 h-6 text-zinc-300 group-hover:text-emerald-400 transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                                        <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

function KeyLifecycleSection() {
    const { t } = useTranslation()
    return (
        <section id="lifecycle" className="py-32 px-6 border-t border-white/5 bg-gradient-to-b from-black to-zinc-900/50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <span className="text-emerald-400 font-mono text-sm uppercase tracking-widest mb-4 block">{t('lifecycle.sectionLabel')}</span>
                    <h2 className="text-4xl md:text-5xl font-serif mb-6">{t('lifecycle.title')}</h2>
                    <p className="text-zinc-400 text-lg">{t('lifecycle.subtitle')}</p>
                </div>

                <div className="relative">
                    <div className="hidden md:block absolute top-[20%] left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent dashed-line" />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                        {[
                            { step: "01", title: t('lifecycle.step1Title'), icon: Code2, desc: t('lifecycle.step1Desc'), action: t('lifecycle.step1Action') },
                            { step: "02", title: t('lifecycle.step2Title'), icon: Fingerprint, desc: t('lifecycle.step2Desc'), action: t('lifecycle.step2Action') },
                            { step: "03", title: t('lifecycle.step3Title'), icon: Wallet, desc: t('lifecycle.step3Desc'), action: t('lifecycle.step3Action') },
                            { step: "04", title: t('lifecycle.step4Title'), icon: Zap, desc: t('lifecycle.step4Desc'), action: t('lifecycle.step4Action') }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="relative group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all">
                                    <item.icon className="w-8 h-8 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-white shadow-lg">
                                        {item.step}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-6">{item.desc}</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold font-mono tracking-wide">
                                    <Check className="w-3 h-3" />
                                    {item.action}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

function MarketplaceSection() {
    const { t } = useTranslation()
    return (
        <section id="marketplace" className="py-20 px-6 relative bg-black overflow-hidden">
            <div className="max-w-7xl mx-auto w-full relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif mb-4 text-white">{t('marketplace.title')}</h2>
                    <p className="text-zinc-400">{t('marketplace.subtitle')}</p>
                </div>
                <div className="min-h-[600px] flex justify-center">
                    <ServiceMarketplace theme="dark" />
                </div>
            </div>
        </section>
    )
}

function CtaSection() {
    const { t } = useTranslation()
    return (
        <section className="py-32 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-900/10" />
            <div className="max-w-4xl mx-auto text-center relative z-10 border border-white/10 bg-black/80 backdrop-blur-2xl rounded-[3rem] p-12 md:p-24 shadow-2xl">
                <h2 className="text-5xl md:text-7xl font-serif mb-8 tracking-tight">
                    {t('cta.title1')} <br /><span className="text-emerald-400">{t('cta.title2')}</span>
                </h2>
                <div className="flex justify-center gap-4">
                    <Link to="/login" className="h-16 px-10 rounded-full bg-white text-black font-bold text-lg hover:bg-zinc-200 transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center">
                        {t('cta.button')}
                    </Link>
                </div>
            </div>
        </section>
    )
}

function EconomySection() {
    const { t } = useTranslation()
    return (
        <section className="py-32 px-6 border-t border-white/5 bg-zinc-950">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <span className="text-emerald-400 font-mono text-sm uppercase tracking-widest mb-4 block">{t('economy.sectionLabel')}</span>
                    <h2 className="text-4xl md:text-5xl font-serif mb-6">{t('economy.title')}</h2>
                    <p className="text-zinc-400 text-lg" dangerouslySetInnerHTML={{ __html: t('economy.subtitle') }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-3xl bg-red-950/20 border border-red-500/20 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <Lock className="w-12 h-12 text-red-500 -rotate-12" />
                        </div>
                        <h3 className="text-2xl font-bold text-red-500 mb-2">{t('economy.optionATitle')}</h3>
                        <p className="text-zinc-400 text-sm mb-6 h-12">{t('economy.optionADesc')}</p>

                        <div className="space-y-3 font-mono text-xs">
                            <div className="bg-black/50 p-3 rounded border border-red-500/20 text-red-400">
                                &gt; GET /flights/bog-mia<br />
                                &lt; 403 Forbidden (Cloudflare)
                            </div>
                            <div className="bg-black/50 p-3 rounded border border-red-500/20 text-red-400">
                                &gt; Solving CAPTCHA...<br />
                                <span className="animate-pulse">&lt; FAILED. IP BANNED.</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            {t('economy.optionAResult')}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-3xl bg-emerald-950/20 border border-emerald-500/20 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <Zap className="w-12 h-12 text-emerald-500 rotate-12" />
                        </div>
                        <h3 className="text-2xl font-bold text-emerald-500 mb-2">{t('economy.optionBTitle')}</h3>
                        <p className="text-zinc-400 text-sm mb-6 h-12">{t('economy.optionBDesc')}</p>

                        <div className="space-y-3 font-mono text-xs">
                            <div className="bg-black/50 p-3 rounded border border-emerald-500/20 text-emerald-400">
                                &gt; PAY 0.01 USDC to airline.eth<br />
                                &lt; {t('economy.paymentVerified')}
                            </div>
                            <div className="bg-black/50 p-3 rounded border border-emerald-500/20 text-emerald-400">
                                &gt; GET /api/v1/flights<br />
                                &lt; {t('economy.cleanData')}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {t('economy.optionBResult')}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

function FaqSection() {
    const { t } = useTranslation()

    const faqs = [
        { q: t('faq.q1'), a: t('faq.a1') },
        { q: t('faq.q2'), a: t('faq.a2') },
        { q: t('faq.q3'), a: t('faq.a3') }
    ]

    return (
        <section className="py-32 px-6 bg-black">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif mb-4">{t('faq.title')}</h2>
                    <p className="text-zinc-500">{t('faq.subtitle')}</p>
                </div>
                <div className="grid gap-6">
                    {faqs.map((faq, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/50 transition-colors">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-start gap-3">
                                <span className="text-emerald-500 font-serif italic">{t('faq.questionPrefix')}</span>
                                {faq.q}
                            </h3>
                            <p className="text-zinc-400 pl-8 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
