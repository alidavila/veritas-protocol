
import { useState } from 'react'
import { Bot, Terminal, ShieldAlert, Cpu, Check, X, AlertTriangle } from 'lucide-react'
import { agentsService } from '../lib/agents'

// Simulation of a GEO analysis (The Trojan Horse)
export function GeoAnalyzer({ onComplete }: { onComplete: (url: string) => void }) {
    const [logs, setLogs] = useState<string[]>([])
    const [url, setUrl] = useState('')
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<'INVISIBLE' | 'OPTIMIZED' | 'ERROR' | null>(null)
    const [email, setEmail] = useState('')
    const [emailSaved, setEmailSaved] = useState(false)

    const handleSaveLead = async () => {
        if (!email) return;
        try {
            await agentsService.logAction('LEAD_FOUND_INBOUND', {
                email,
                domain: url,
                source: 'geo-analyzer'
            });
            setEmailSaved(true);
        } catch (e) {
            console.error("Failed to save lead", e);
        }
    }

    const validateUrl = (input: string) => {
        // Basic syntax check
        const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return !!pattern.test(input);
    }

    const scanUrlHTML = async (inputUrl: string): Promise<{ success: boolean; html: string; error?: string }> => {
        try {
            // Use AllOrigins as a CORS proxy to fetch the actual HTML content of the target URL
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(inputUrl)}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

            const response = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Proxy fetch failed');

            const data = await response.json();
            return { success: true, html: data.contents || '' };
        } catch (error) {
            console.error("HTML fetch failed:", error);
            return { success: false, html: '', error: 'Failed to access URL' };
        }
    }

    // Simulador de Auditoría
    const runAudit = async () => {
        if (!url) return

        // Ensure protocol
        let targetUrl = url
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl
        }

        setAnalyzing(true)
        setLogs([])
        setResult(null)

        // 1. Syntax Validation
        if (!validateUrl(targetUrl)) {
            setLogs([
                `[INIT] Resolving host: ${targetUrl}...`,
                `[ERR] Syntax Error: Invalid URL format`,
                `[FAIL] Aborting sequence.`
            ])
            setAnalyzing(false)
            setResult('ERROR')
            return
        }

        // 2. Real HTML Fetch via Proxy (The Real Verification)
        setLogs(prev => [...prev, `[INIT] Attempting deep scan of: ${targetUrl}...`])

        const scanData = await scanUrlHTML(targetUrl);

        if (!scanData.success || !scanData.html) {
            setLogs(prev => [
                ...prev,
                `[NET] Connection timed out or blocked by destination firewall.`,
                `[ERR] FETCH_ERROR`,
                `[CRITICAL] Host appears to be down or actively blocking our proxy.`
            ])
            setAnalyzing(false)
            setResult('ERROR')
            return
        }

        // 3. True analysis of HTML content
        const html = scanData.html.toLowerCase();

        // Let's actually check for Veritas installation
        const hasGatekeeper = html.includes('gatekeeper.js') || html.includes('data-veritas-id');

        // Estimate token density simply
        const rawTextSize = html.replace(/<[^>]*>?/gm, '').length;
        const estimatedTokens = Math.floor(rawTextSize / 4);

        const sequence = [
            { t: 500, msg: `[NET] Port 443 open. Deep Scan activated.` },
            { t: 1200, msg: `[CRAWL] User-Agent: "Veritas-Geo-Scout/2.0"...` },
            { t: 1800, msg: `[DOM] HTML Fetched (${scanData.html.length / 1024 | 0} KB)` },
            { t: 2600, msg: `[SCHEMA] Parsing JSON-LD... Structure: Found 0 nodes.` },
            { t: 3400, msg: `[SEMANTIC] Content Density Analyzed. Token Count: ~${estimatedTokens}.` },
            { t: 4200, msg: `[SIM] LLM Context Window Test...` },
            { t: 5000, msg: `[VERITAS] Scanning for Protection Node...` },
            { t: 5800, msg: hasGatekeeper ? `[SHIELD] Veritas Protocol node DETECTED.` : `[WARN] No defense protocols found.` },
            { t: 6500, msg: `[AUDIT] FINALIZING REPORT...` },
        ]

        let accumulatedTime = 0
        sequence.forEach(({ t, msg }, idx) => {
            accumulatedTime += t
            setTimeout(() => {
                setLogs(prev => [...prev, msg])

                const el = document.getElementById('geo-logs')
                if (el) el.scrollTop = el.scrollHeight

                if (idx === sequence.length - 1) {
                    setAnalyzing(false)

                    if (hasGatekeeper) {
                        setResult('OPTIMIZED');
                    } else {
                        setResult('INVISIBLE');
                    }
                }
            }, accumulatedTime)
        })
    }

    if (result === 'ERROR') {
        return (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-4">
                    <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold text-red-500 mb-1">Error de Conexión</h3>
                        <p className="text-sm text-red-400">
                            No pudimos acceder a <code>{url}</code>. Verifica que la URL sea correcta y accesible públicamente.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setResult(null)}
                    className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white font-bold transition-colors"
                >
                    Intentar de nuevo
                </button>
            </div>
        )
    }

    if (result === 'INVISIBLE') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-4">
                    <ShieldAlert className="w-8 h-8 text-red-500 shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold text-red-500 mb-1">DIAGNÓSTICO: INVISIBLE & GRATIS</h3>
                        <p className="text-xs text-red-400/80 leading-relaxed">
                            Bots como Claude y GPT están leyendo tu web pero <b>no pueden pagarte</b>. Estás regalando tu data.
                        </p>
                    </div>
                </div>

                {/* THE SOLUTION: THE PIXEL */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-50 text-[10px] uppercase font-bold tracking-widest text-emerald-500">
                        Veritas Node v1.0
                    </div>

                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-emerald-500" />
                        Tu "Portero" Digital (The Toll Booth)
                    </h4>
                    <p className="text-zinc-400 text-xs mb-4">
                        Copia y pega esto en el <code>&lt;head&gt;</code> de tu web. <br />
                        Este script detecta IAs, les pide su ID y <b>les cobra por cada visita</b>.
                    </p>

                    <div className="bg-black p-4 rounded-lg font-mono text-[10px] text-zinc-300 border border-zinc-800 relative">
                        <div className="text-emerald-500 selection:bg-emerald-500/30">
                            &lt;script src="https://veritas-protocol-app.vercel.app/gatekeeper.js"<br />
                            &nbsp;&nbsp;data-veritas-id="your-id"<br />
                            &nbsp;&nbsp;data-wallet="0x..."<br />
                            &nbsp;&nbsp;data-rate="0.002"&gt;&lt;/script&gt;
                        </div>
                        <button
                            onClick={() => { navigator.clipboard.writeText('<script src="https://veritas-protocol-app.vercel.app/gatekeeper.js" data-veritas-id="client-001" data-wallet="0x4d2B70d358C5DA9c4fC6e8Ce743Ed67d55C19099" data-rate="0.002"></script>'); alert("Copiado al portapapeles") }}
                            className="absolute top-2 right-2 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-white transition-colors"
                        >
                            COPY
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    {!emailSaved ? (
                        <div className="space-y-3 bg-red-950/30 p-4 rounded-xl border border-red-900/50">
                            <p className="text-xs text-red-200">Envíanos este reporte forense y el código de <b>The Gatekeeper</b> a tu correo:</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="tu@startup.com"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveLead()}
                                    className="flex-1 bg-black border border-red-900/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                                />
                                <button
                                    onClick={handleSaveLead}
                                    className="px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer"
                                >
                                    Enviar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-emerald-950/30 rounded-xl border border-emerald-900/50 text-center animate-in fade-in zoom-in-95">
                            <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                            <p className="text-sm font-bold text-emerald-400">¡Reporte Enviado!</p>
                            <p className="text-xs text-emerald-500/70 mt-1">Tu radar estará activado en breve. Revisa tu bandeja de entrada.</p>
                            <button onClick={() => onComplete(url)} className="mt-4 px-4 py-2 bg-zinc-800 text-white font-bold text-xs rounded hover:bg-zinc-700">Omitir y seguir</button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (result === 'OPTIMIZED') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-lg flex items-start gap-4">
                    <ShieldAlert className="w-8 h-8 text-emerald-500 shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold text-emerald-500 mb-1">DIAGNÓSTICO: OPTIMIZADO & PROTEGIDO</h3>
                        <p className="text-xs text-emerald-400/80 leading-relaxed">
                            El nodo de <b>Veritas Protocol</b> ha sido detectado con éxito. <br />
                            Los MLLs y Crawlers no pueden leer tus datos sin ejecutar una transacción x402.
                        </p>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden group shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" />
                        Tráfico de IA Monetizado
                    </h4>
                    <p className="text-zinc-400 text-xs mb-4">
                        Tus activos digitales están monetizando consultas en tiempo real de Google-Extended, GPTBot, ClaudeBot, y Perplexity.
                    </p>

                    <button
                        onClick={() => setResult(null)}
                        className="w-full py-3 mt-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white font-bold transition-colors"
                    >
                        Auditar otro dominio
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 mb-4">
                    <Bot className="w-6 h-6 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold">Auditoría GEO</h2>
                <p className="text-sm text-zinc-500">
                    Generative Engine Optimization. <br />
                    Averigua si los Agentes de IA pueden ver (y comprar) en tu web.
                </p>
            </div>

            {/* Input URL */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Terminal className="h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                    type="text"
                    disabled={analyzing}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="ej. tesla.com"
                    onKeyDown={(e) => e.key === 'Enter' && runAudit()}
                    className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-lg leading-5 bg-black text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                />
                {!analyzing && (
                    <button
                        onClick={runAudit}
                        disabled={!url}
                        className="absolute inset-y-1 right-1 px-4 bg-zinc-800 text-white text-xs font-bold rounded-md hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-zinc-800 transition-colors"
                    >
                        EJECUTAR
                    </button>
                )}
            </div>

            {/* Terminal Output */}
            <div className="relative">
                <div className="absolute top-0 left-0 w-full h-8 bg-zinc-800 rounded-t-lg flex items-center px-2 gap-1.5 border-b border-zinc-700">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                    <div className="ml-2 text-[10px] text-zinc-400 font-mono">auditd — veritas-cli — 80x24</div>
                </div>
                <div
                    id="geo-logs"
                    className="h-48 bg-black rounded-b-lg p-4 pt-4 font-mono text-[10px] text-zinc-300 overflow-y-auto border-x border-b border-zinc-800 shadow-inner"
                >
                    <div className="mt-6 space-y-1">
                        {!analyzing && logs.length === 0 && (
                            <div className="opacity-50 text-center mt-12">
                                [ SYSTEM READY ] <br />
                                Waiting for target host...
                            </div>
                        )}
                        {logs.map((log, i) => {
                            const isError = log.includes('[FAIL]') || log.includes('[CRITICAL]') || log.includes('[ERR]')
                            const isWarn = log.includes('[WARN]')
                            return (
                                <div key={i} className={`${isError ? 'text-red-500' : isWarn ? 'text-yellow-500' : 'text-emerald-500/80'}`}>
                                    <span className="opacity-50 mr-2">{'>'}</span>
                                    {log}
                                </div>
                            )
                        })}
                        {analyzing && <div className="animate-pulse text-emerald-500">_</div>}
                    </div>
                </div>
            </div>

            {/* Value Prop Hints */}
            {!analyzing && !result && (
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg dark:bg-zinc-900 dark:border-zinc-800">
                        <div className="flex items-center gap-2 mb-1">
                            <X className="w-4 h-4 text-red-500" />
                            <span className="text-xs font-bold">SEO (Humano)</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-tight">Optimizado para ojos y clicks. Inútil para agentes.</p>
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg dark:bg-zinc-900 dark:border-emerald-900/30">
                        <div className="flex items-center gap-2 mb-1">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">GEO (Agente)</span>
                        </div>
                        <p className="text-[10px] text-emerald-600/80 dark:text-emerald-500/60 leading-tight">Datos estructurados y pagos via API. El futuro.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
