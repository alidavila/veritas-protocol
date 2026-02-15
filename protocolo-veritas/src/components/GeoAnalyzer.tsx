
import { useState } from 'react'
import { Bot, Terminal, ShieldAlert, Cpu, Check, X, AlertTriangle } from 'lucide-react'

// Simulation of a GEO analysis (The Trojan Horse)
export function GeoAnalyzer({ onComplete }: { onComplete: (url: string) => void }) {
    const [logs, setLogs] = useState<string[]>([])
    const [url, setUrl] = useState('')
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<'INVISIBLE' | 'OPTIMIZED' | 'ERROR' | null>(null)

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

    const checkConnectivity = async (inputUrl: string): Promise<boolean> => {
        try {
            // "no-cors" allows us to send a request to another domain.
            // If the domain exists, it resolves (opaque response).
            // If the domain doesn't exist (DNS fail), it throws an error.
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            await fetch(inputUrl, {
                mode: 'no-cors',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return true;
        } catch (error) {
            console.error("Connectivity check failed:", error);
            return false;
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

        // 2. Real Connectivity Check (The Magic Trick)
        setLogs(prev => [...prev, `[INIT] Pinging host: ${targetUrl}...`])

        const isAlive = await checkConnectivity(targetUrl);

        if (!isAlive) {
            setLogs(prev => [
                ...prev,
                `[NET] Connection timed out or refused.`,
                `[ERR] DNS_PROBE_FINISHED_NXDOMAIN`,
                `[CRITICAL] Host appears to be down or non-existent.`
            ])
            setAnalyzing(false)
            setResult('ERROR')
            return
        }

        // 3. If we are here, the site EXISTS. Run the simulation.
        const sequence = [
            { t: 500, msg: `[NET] Port 443 open. Handshake success.` },
            { t: 1200, msg: `[CRAWL] User-Agent: "Googlebot-Image/1.0"...` },
            { t: 1800, msg: `[WARN] robots.txt found. Checking AI directives...` },
            { t: 2400, msg: `[FAIL] 'GPTBot' Disallowed.` },
            { t: 3000, msg: `[FAIL] 'CCBot' Disallowed.` },
            { t: 3600, msg: `[SCHEMA] Parsing JSON-LD... Structure: None.` },
            { t: 4200, msg: `[SEMANTIC] Content Density: Low. Token Count: 402.` },
            { t: 4800, msg: `[SIM] LLM Context Window Test...` },
            { t: 5500, msg: `[CRITICAL] HALLUCINATION RISK: HIGH (88%)` },
            { t: 6000, msg: `[AUDIT] FINALIZING REPORT...` },
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
                    setResult('INVISIBLE')
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
                            &lt;script src="https://cdn.veritas.protocol/node.js"&gt;&lt;/script&gt;<br />
                            &lt;veritas-paywall wallet="0x123...abc" rate="0.002" /&gt;
                        </div>
                        <button
                            onClick={() => { navigator.clipboard.writeText('<script src="https://cdn.veritas.protocol/node.js"></script>'); alert("Copiado al portapapeles") }}
                            className="absolute top-2 right-2 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-white transition-colors"
                        >
                            COPY
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={() => onComplete(url)}
                        className="w-full py-4 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 group"
                    >
                        <span>ACTIVAR NODO Y EMPEZAR A COBRAR</span>
                        <Check className="w-4 h-4 group-hover:scale-125 transition-transform" />
                    </button>
                    <p className="text-center text-[10px] text-zinc-500 mt-3">
                        Al hacer click, se creará tu identidad (DID) y tu billetera receptora.
                    </p>
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
