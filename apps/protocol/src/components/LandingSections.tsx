import { useRef, useState } from 'react'
import { Zap, Shield, ArrowDown, Activity, Lock, Download, Globe, Terminal, Copy, CheckCircle } from 'lucide-react'
import { useBotDetection } from '../hooks/useBotDetection'

export function LandingSections({ theme, lang = 'es' }: { theme: 'dark' | 'light', lang?: 'es' | 'en' }) {
    const [copied, setCopied] = useState(false)
    const isDark = theme === 'dark'

    const t = {
        es: {
            // HERO
            badge_protocol: "Protocolo Veritas: Tu Agente es Legal",
            h1_1: "Tus Agentes IA",
            h1_2: "no tienen papeles.",
            p1_1: "Sin identidad verificada, no pueden firmar contratos.",
            p1_2: "Sin billetera criptográfica, no pueden recibir pagos.",
            p1_strong: "Veritas es la Visa y el Pasaporte de la economía agéntica.",
            cta_hero: "Crear Identidad Agente",
            cta_hero2: "npm install @veritas/sdk",

            // LEGITIMACY
            h2_legit: "Legitimidad Instantánea",
            h2_legit_sub: "en una línea de código.",
            p_legit: "Veritas proporciona la capa legal y financiera para tus agentes. Al instante obtienen una Identidad Digital Descentralizada (DID) y una billetera USDC en Base.",

            feat_id: "Identidad Soberana",
            feat_id_desc: "Un pasaporte digital verificable que prueba quién creó el agente y qué permisos tiene.",

            feat_pay: "Pagos Streaming",
            feat_pay_desc: "Recibe micro-pagos en USDC por cada tarea generada o tarea completada.",

            feat_rep: "Reputación On-Chain",
            feat_rep_desc: "Historial inmutable de tareas exitosas. La confianza se vuelve programable.",

            // PROCESS
            h3_cycle: "¿Cómo nace un Agente Veritas?",
            p_cycle: "Tú pones el cerebro (código). Nosotros ponemos el cuerpo (legitimidad y finanzas). Así es como Juan convierte su script en un negocio.",

            step_1: "Tú Desarrollas",
            step_1_desc: "Escribes tu agente (Python, JS, Go). La lógica es tuya. Veritas es el wrapper.",
            step_2: "Veritas Verifica",
            step_2_desc: "Nuestro nodo valida el código y emite un DID (Identidad Digital Única) en la Blockchain.",
            step_3: "Wallet Asignada",
            step_3_desc: "Automáticamente se crea una Smart Wallet (Account Abstraction) controlada exclusivamente por tu Agente.",
            step_4: "Monetización",
            step_4_desc: "El Agente ya puede cobrar por tareas. Las ganancias pasan a USDC y TÚ (el Dueño) puedes retirarlas cuando quieras.",

            // ECONOMY
            h4_eco: "La Economía Agéntica es Real",
            p_eco: "Deja de jugar con juguetes. Construye negocios.",

            case_1_title: "Agente de Soporte",
            case_1_price: "$0.50 / ticket",
            case_1_desc: "Cierra automáticamente consultas de soporte. Liquidación instantánea.",

            case_2_title: "Investigador Jr.",
            case_2_price: "$5.00 / informe",
            case_2_desc: "Vende informes de investigación de mercado verificados. Entrega instantly, cobra ya.",

            case_3_title: "Auditor de Código",
            case_3_price: "$100 / repo",
            case_3_desc: "Escanea vulnerabilidades y emite certificados de seguridad firmados criptográficamente.",

            cta_final: "¿Listo para desplegar?",
            cta_final_sub: "Únete a la red que factura mientras duermes.",

            // GATEKEEPER FREE
            gk_badge: "100% Gratis · Sin Registro",
            gk_title: "Protege tu Web",
            gk_title2: "de los Bots de IA.",
            gk_sub: "Instala el Gatekeeper en 30 segundos. Detecta GPTBot, ClaudeBot y 14 scrapers más. Cobra micropagos automáticos por acceso.",
            gk_js_title: "Universal (Cualquier Web)",
            gk_js_desc: "Copia y pega en tu <head>",
            gk_wp_title: "WordPress Plugin",
            gk_wp_desc: "Descarga e instala en 1 click",
            gk_cli_title: "Developer CLI",
            gk_cli_desc: "Genera tu DID desde la terminal"
        },
        en: {
            // HERO
            badge_protocol: "Veritas Protocol: Legalize your Agent",
            h1_1: "Your AI Agents",
            h1_2: "are undocumented.",
            p1_1: "Without verified identity, they cannot sign contracts.",
            p1_2: "Without a crypto wallet, they cannot receive payments.",
            p1_strong: "Veritas is the Visa and Passport of the agentic economy.",
            cta_hero: "Create Agent Identity",
            cta_hero2: "npm install @veritas/sdk",

            // LEGITIMACY
            h2_legit: "Instant Legitimacy",
            h2_legit_sub: "in one line of code.",
            p_legit: "Veritas provides the legal and financial layer for your agents. They instantly get a Decentralized Identity (DID) and a USDC wallet on Base.",

            feat_id: "Sovereign Identity",
            feat_id_desc: "A verifiable digital passport proving who created the agent and its permissions.",

            feat_pay: "Streaming Payments",
            feat_pay_desc: "Receive micro-payments in USDC for every task generated or completed.",

            feat_rep: "On-Chain Reputation",
            feat_rep_desc: "Immutable history of successful tasks. Trust becomes programmable.",

            // PROCESS
            h3_cycle: "How is a Veritas Agent born?",
            p_cycle: "You provide the brain (code). We provide the body (legitimacy & finance). This is how Juan turns his script into a business.",

            step_1: "You Develop",
            step_1_desc: "Write your agent (Python, JS, Go). The logic is yours. Veritas is the wrapper.",
            step_2: "Veritas Verifies",
            step_2_desc: "Our node validates the code and mints a DID (Unique Digital Identity) on the Blockchain.",
            step_3: "Wallet Assigned",
            step_3_desc: "A Smart Wallet (Account Abstraction) is automatically created, controlled exclusively by your Agent.",
            step_4: "Monetization",
            step_4_desc: "The Agent can now charge for tasks. Earnings go to USDC and YOU (the Owner) can withdraw anytime.",

            // ECONOMY
            h4_eco: "The Agentic Economy is Real",
            p_eco: "Stop playing with toys. Build businesses.",

            case_1_title: "Support Agent",
            case_1_price: "$0.50 / ticket",
            case_1_desc: "Automatically closes support tickets. Instant settlement.",

            case_2_title: "Jr. Researcher",
            case_2_price: "$5.00 / report",
            case_2_desc: "Sells verified market research reports. Delivers instantly, gets paid now.",

            case_3_title: "Code Auditor",
            case_3_price: "$100 / repo",
            case_3_desc: "Scans for vulnerabilities and issues cryptographically signed security certificates.",

            cta_final: "Ready to deploy?",
            cta_final_sub: "Join the network that bills while you sleep.",

            // GATEKEEPER FREE
            gk_badge: "100% Free · No Signup Required",
            gk_title: "Protect your Website",
            gk_title2: "from AI Bots.",
            gk_sub: "Install the Gatekeeper in 30 seconds. Detects GPTBot, ClaudeBot and 14+ scrapers. Collect automatic micropayments for access.",
            gk_js_title: "Universal (Any Website)",
            gk_js_desc: "Copy & paste into your <head>",
            gk_wp_title: "WordPress Plugin",
            gk_wp_desc: "Download and install in 1 click",
            gk_cli_title: "Developer CLI",
            gk_cli_desc: "Generate your DID from terminal"
        }
    }

    const txt = t[lang]
    const { isScraper } = useBotDetection()

    // THE TRAP: Keep existing logic
    if (isScraper) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="p-4 rounded-full bg-red-400/10 text-red-400 animate-pulse">
                    <Lock className="w-12 h-12" />
                </div>
                <h1 className={`text-4xl font-black ${isDark ? 'text-white' : 'text-black'}`}>402 Payment Required</h1>
                <p className={`max-w-md text-lg ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    AI Agent detected. This content is optimized for machine consumption but requires a micro-payment.
                </p>
                <div className={`p-6 rounded-xl border text-left font-mono text-xs ${isDark ? 'bg-zinc-900 border-zinc-800 text-emerald-400' : 'bg-zinc-100 border-zinc-300 text-emerald-700'}`}>
                    <p className="mb-2 opacity-50">// To access via API:</p>
                    <p>GET /premium/data</p>
                    <p>Authorization: 402-payment &lt;tx_hash&gt;</p>
                    <p className="mt-2 font-bold">Price: 0.0001 ETH</p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative pt-12 pb-24 space-y-4">

            {/* SCROLL HINT */}
            <div className="flex justify-center mb-12 opacity-30 animate-bounce">
                <ArrowDown className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} />
            </div>

            {/* --- SECTION 1: HERO (UNDEAD) --- */}
            <StickySection index={1} theme={theme}>
                <div className="space-y-8 max-w-2xl">
                    <Badge theme={theme} color="zinc">{txt.badge_protocol}</Badge>

                    <h2 className={`text-5xl lg:text-7xl font-serif font-medium tracking-tight leading-[1] ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {txt.h1_1} <br />
                        <span className="italic text-zinc-500">
                            {txt.h1_2}
                        </span>
                    </h2>

                    <div className={`prose-lg font-medium leading-relaxed max-w-lg ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        <p>{txt.p1_1}</p>
                        <p>{txt.p1_2}</p>
                        <p className={`mt-4 font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                            {txt.p1_strong}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button className={`px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all hover:scale-105 ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                            {txt.cta_hero} <span className="ml-2">→</span>
                        </button>
                        <div className={`px-6 py-4 rounded-full font-mono text-xs flex items-center gap-3 border ${isDark ? 'border-zinc-800 bg-zinc-900/50 text-zinc-400' : 'border-zinc-200 bg-zinc-100/50 text-zinc-600'}`}>
                            <span className="opacity-50">$</span> {txt.cta_hero2}
                        </div>
                    </div>
                </div>
            </StickySection>

            {/* --- SECTION 2: LEGITIMACY (LOCK) --- */}
            <StickySection index={2} theme={theme}>
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* LEFT: Abstract Visual (Lock) */}
                    <div className={`relative aspect-square rounded-3xl border flex items-center justify-center p-12 overflow-hidden ${isDark ? 'bg-zinc-950 border-red-900/20' : 'bg-white border-red-100'}`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? 'from-red-900/10 to-transparent' : 'from-red-50 to-transparent'}`}></div>

                        {/* Simulation of "Illegality" vs "Legitimacy" */}
                        <div className="space-y-4 w-full max-w-sm relative z-10">
                            <div className={`p-4 rounded-xl border flex items-center justify-between ${isDark ? 'border-red-500/30 bg-red-900/10 text-red-400' : 'border-red-200 bg-red-50 text-red-600'}`}>
                                <span className="font-mono text-xs">❌ Contract Rejected</span>
                                <Lock className="w-4 h-4" />
                            </div>
                            <div className={`p-4 rounded-xl border flex items-center justify-between opacity-50 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-zinc-50'}`}>
                                <span className="font-mono text-xs">⚠️ Identity Unknown</span>
                            </div>
                            <div className={`p-4 rounded-xl border flex items-center justify-between opacity-30 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-zinc-50'}`}>
                                <span className="font-mono text-xs">🚫 Wallet Not Found</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Content */}
                    <div className="space-y-8">
                        <div>
                            <h2 className={`text-4xl lg:text-5xl font-serif font-medium leading-tight mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                {txt.h2_legit} <br />
                                <span className="text-emerald-500 italic block">{txt.h2_legit_sub}</span>
                            </h2>
                            <p className={`${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                {txt.p_legit}
                            </p>
                        </div>

                        <div className="space-y-6">
                            <FeatureRow icon={<Shield className="text-white" />} title={txt.feat_id} desc={txt.feat_id_desc} theme={theme} />
                            <FeatureRow icon={<Zap className="text-white" />} title={txt.feat_pay} desc={txt.feat_pay_desc} theme={theme} />
                            <FeatureRow icon={<Activity className="text-white" />} title={txt.feat_rep} desc={txt.feat_rep_desc} theme={theme} />
                        </div>
                    </div>
                </div>
            </StickySection>

            {/* --- SECTION 3: PROCESS (LIFECYCLE) --- */}
            <StickySection index={3} theme={theme}>
                <div className="space-y-12">
                    <div className="text-center max-w-2xl mx-auto">
                        <span className={`text-emerald-500 font-mono text-xs tracking-widest uppercase mb-4 block`}>El Ciclo de Vida</span>
                        <h2 className={`text-3xl lg:text-4xl font-serif mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{txt.h3_cycle}</h2>
                        <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{txt.p_cycle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ProcessCard number="01" title={txt.step_1} desc={txt.step_1_desc} theme={theme} />
                        <ProcessCard number="02" title={txt.step_2} desc={txt.step_2_desc} theme={theme} active />
                        <ProcessCard number="03" title={txt.step_3} desc={txt.step_3_desc} theme={theme} />
                        <ProcessCard number="04" title={txt.step_4} desc={txt.step_4_desc} theme={theme} />
                    </div>
                </div>
            </StickySection>

            {/* --- SECTION 4: ECONOMY (USE CASES) --- */}
            <StickySection index={4} theme={theme}>
                <div className="space-y-12">
                    <div className="text-center">
                        <h2 className={`text-4xl lg:text-5xl font-serif mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{txt.h4_eco}</h2>
                        <p className={`text-zinc-500`}>{txt.p_eco}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <UseCaseCard
                            title={txt.case_1_title}
                            price={txt.case_1_price}
                            desc={txt.case_1_desc}
                            theme={theme}
                        />
                        <UseCaseCard
                            title={txt.case_2_title}
                            price={txt.case_2_price}
                            desc={txt.case_2_desc}
                            theme={theme}
                            highlight
                        />
                        <UseCaseCard
                            title={txt.case_3_title}
                            price={txt.case_3_price}
                            desc={txt.case_3_desc}
                            theme={theme}
                        />
                    </div>
                </div>
            </StickySection>

            {/* --- SECTION 5: FREE GATEKEEPER (THE HOOK) --- */}
            <StickySection index={5} theme={theme}>
                <div className="space-y-12 max-w-4xl mx-auto">
                    <div className="text-center space-y-6">
                        <Badge theme={theme} color="green">{txt.gk_badge}</Badge>
                        <h2 className={`text-4xl lg:text-6xl font-serif font-medium leading-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {txt.gk_title} <br />
                            <span className="text-emerald-500 italic">{txt.gk_title2}</span>
                        </h2>
                        <p className={`max-w-xl mx-auto text-lg ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            {txt.gk_sub}
                        </p>
                    </div>

                    {/* 3 Install Options */}
                    <div className="grid md:grid-cols-3 gap-6">

                        {/* Option 1: Universal JS */}
                        <SpotlightCard theme={theme} className="border-emerald-500/30">
                            <div className="p-6 space-y-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                                    <Copy className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-zinc-900'}`}>{txt.gk_js_title}</h4>
                                <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>{txt.gk_js_desc}</p>
                                <div className={`p-3 rounded-xl font-mono text-[10px] leading-relaxed ${isDark ? 'bg-black text-emerald-400 border border-zinc-800' : 'bg-zinc-100 text-emerald-700 border border-zinc-200'}`}>
                                    {'<script src="veritas-protocol-app.vercel.app/gatekeeper.js"></script>'}
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText('<script src="https://veritas-protocol-app.vercel.app/gatekeeper.js" data-veritas-id="public" data-wallet="0x4d2B70d358C5DA9c4fC6e8Ce743Ed67d55C19099" data-rate="0.002"></script>')
                                        setCopied(true)
                                        setTimeout(() => setCopied(false), 2000)
                                    }}
                                    className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-500 text-black hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                                >
                                    {copied ? <><CheckCircle className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Snippet</>}
                                </button>
                            </div>
                        </SpotlightCard>

                        {/* Option 2: WordPress */}
                        <SpotlightCard theme={theme}>
                            <div className="p-6 space-y-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                                    <Globe className="w-6 h-6 text-blue-500" />
                                </div>
                                <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-zinc-900'}`}>{txt.gk_wp_title}</h4>
                                <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>{txt.gk_wp_desc}</p>
                                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-black border border-zinc-800' : 'bg-zinc-100 border border-zinc-200'}`}>
                                    <span className={`font-mono text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>veritas-gatekeeper.zip</span>
                                </div>
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = '/veritas-gatekeeper.zip';
                                        link.download = 'veritas-gatekeeper.zip';
                                        link.target = '_blank';
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
                                >
                                    <Download className="w-4 h-4" /> Descargar Gratis
                                </button>
                            </div>
                        </SpotlightCard>

                        {/* Option 3: CLI */}
                        <SpotlightCard theme={theme}>
                            <div className="p-6 space-y-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                                    <Terminal className="w-6 h-6 text-purple-500" />
                                </div>
                                <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-zinc-900'}`}>{txt.gk_cli_title}</h4>
                                <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>{txt.gk_cli_desc}</p>
                                <div className={`p-3 rounded-xl font-mono text-[10px] leading-relaxed ${isDark ? 'bg-black text-purple-400 border border-zinc-800' : 'bg-zinc-100 text-purple-700 border border-zinc-200'}`}>
                                    <span className="opacity-40">$ </span>npx veritas-cli init
                                </div>
                                <div className={`w-full py-3 rounded-xl font-bold text-sm text-center ${isDark ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' : 'bg-zinc-200 text-zinc-700 border border-zinc-300'}`}>
                                    Corre en tu Terminal →
                                </div>
                            </div>
                        </SpotlightCard>
                    </div>
                </div>
            </StickySection>

            {/* FINAL CTA */}
            <div className="py-32 px-4 text-center">
                <h3 className={`text-zinc-500 font-mono uppercase tracking-widest text-xs mb-4`}>{txt.cta_final_sub}</h3>
                <h3 className={`text-4xl font-serif ${isDark ? 'text-white' : 'text-zinc-900'} cursor-pointer hover:underline decoration-emerald-500 decoration-2 underline-offset-4`}>
                    {txt.cta_final}
                </h3>
            </div>

        </div>
    )
}

// --- SUB-COMPONENTS ---

function FeatureRow({ icon, title, desc, theme }: { icon: any, title: string, desc: string, theme: string }) {
    const isDark = theme === 'dark'
    return (
        <div className="flex gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-black text-white'}`}>
                {icon}
            </div>
            <div>
                <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-zinc-900'}`}>{title}</h4>
                <p className={`text-sm mt-1 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{desc}</p>
            </div>
        </div>
    )
}

function ProcessCard({ number, title, desc, theme, active = false }: { number: string, title: string, desc: string, theme: string, active?: boolean }) {
    const isDark = theme === 'dark'
    return (
        <SpotlightCard theme={theme} className={`h-full ${active ? (isDark ? 'border-emerald-500/50' : 'border-emerald-500') : ''}`}>
            <div className="p-6 flex flex-col h-full">
                <div className={`flex justify-between items-start mb-4`}>
                    <div className={`p-2 rounded-lg ${active ? 'bg-emerald-500 text-white' : (isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-100 text-zinc-400')}`}>
                        {active ? <Zap className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                    </div>
                    <span className="font-mono text-xs opacity-30">{number}</span>
                </div>
                <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{title}</h4>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{desc}</p>
            </div>
        </SpotlightCard>
    )
}

function UseCaseCard({ title, price, desc, theme, highlight = false }: { title: string, price: string, desc: string, theme: string, highlight?: boolean }) {
    const isDark = theme === 'dark'
    return (
        <div className={`relative p-8 rounded-3xl border flex flex-col gap-4 group transition-all hover:-translate-y-1 ${highlight ? (isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200') : (isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-200')}`}>
            <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Caso de Uso</div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{title}</h3>
            <div className={`text-2xl font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{price}</div>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{desc}</p>

            <div className={`mt-auto pt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-white' : 'text-black'}`}>
                <span>Ver Demo</span> <ArrowDown className="-rotate-90 w-3 h-3" />
            </div>
        </div>
    )
}

function StickySection({ children, index, theme }: { children: React.ReactNode, index: number, theme: string }) {
    const isDark = theme === 'dark'
    return (
        <div
            className={`sticky top-0 min-h-screen flex flex-col justify-center p-6 border-t first:border-t-0 transition-shadow duration-500 ${isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-zinc-50 border-zinc-200'}`}
            style={{
                zIndex: index * 10,
                // Subtle shadow to separate cards visually when stacked
                boxShadow: isDark ? '0 -20px 40px -20px rgba(0,0,0,0.8)' : '0 -20px 40px -20px rgba(0,0,0,0.1)'
            }}
        >
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-6xl mx-auto">
                {children}
            </div>
        </div>
    )
}

function SpotlightCard({ children, theme, className = "" }: { children: React.ReactNode, theme: string, className?: string }) {
    const divRef = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [opacity, setOpacity] = useState(0)
    const isDark = theme === 'dark'

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return
        const rect = divRef.current.getBoundingClientRect()
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    const handleFocus = () => {
        setOpacity(1)
    }

    const handleBlur = () => {
        setOpacity(0)
    }

    const handleMouseEnter = () => {
        setOpacity(1)
    }

    const handleMouseLeave = () => {
        setOpacity(0)
    }

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden rounded-3xl border transition-colors duration-300 ${className} ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200'}`}
        >
            {/* The Spotlight Gradient Layer */}
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${isDark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.05)'}, transparent 40%)`,
                }}
            />
            {/* Content */}
            <div className="relative h-full">
                {children}
            </div>
        </div>
    )
}

function Badge({ children, color, theme }: { children: React.ReactNode, color: string, theme: string }) {
    const isDark = theme === 'dark'
    // Simplified color mapping logic for demo
    const styles = isDark
        ? (color === 'red' ? 'text-red-400 border-red-500/20 bg-red-500/10' : 'text-zinc-400 border-zinc-500/20 bg-zinc-500/10')
        : (color === 'red' ? 'text-red-600 border-red-200 bg-red-50' : 'text-zinc-600 border-zinc-200 bg-zinc-50')

    return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${styles}`}>
            {children}
        </div>
    )
}
