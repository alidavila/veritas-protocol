import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY

if (!API_KEY) {
    console.warn('⚠️ VITE_GEMINI_API_KEY not found in .env - Assistant will not work')
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

interface AssistantContext {
    totalEvents: number
    leadsFound: number
    alertsTriggered: number
    fundsAllocated: number
    systemStatus: 'running' | 'stopped'
    recentLogs: Array<{
        agent_id: string
        action: string
        details?: any
        amount?: number
    }>
}

export async function askAssistant(question: string, context: AssistantContext, lang: 'es' | 'en'): Promise<string> {
    if (!genAI) {
        return lang === 'es'
            ? 'Error: API key de Gemini no configurada. Agrega VITE_GEMINI_API_KEY a tu archivo .env'
            : 'Error: Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file'
    }

    // Fetch business logic
    let businessLogic = ''
    try {
        const res = await fetch('/LOGICA_VERITAS.md')
        if (res.ok) businessLogic = await res.text()
    } catch (e) {
        console.warn('Logic file not found')
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const systemPrompt = lang === 'es' ? `
Eres el Asistente Virtual del CEO de VERITAS CORP, una empresa de agentes autónomos de IA.

TU ROL:
- Explicar qué están haciendo los agentes
- Interpretar métricas del sistema
- Ayudar al CEO a tomar decisiones
- Ser conciso y directo (máximo 3-4 oraciones)

AGENTES ACTIVOS:
1. Hunter Alpha (SDR): Escanea empresas y encuentra leads
2. The Treasurer (Finance): Gestiona liquidez y fondos de agentes
3. Sentinel Prime (Security): Audita el ledger para detectar anomalías

MÉTRICAS ACTUALES:
- Total de eventos: ${context.totalEvents}
- Leads encontrados: ${context.leadsFound}
- Alertas de seguridad: ${context.alertsTriggered}
- Fondos asignados: ${context.fundsAllocated} ETH
- Estado del sistema: ${context.systemStatus === 'running' ? 'OPERATIVO' : 'DETENIDO'}

ÚLTIMOS EVENTOS:
${context.recentLogs.slice(0, 5).map(log => `- ${log.agent_id}: ${log.action} ${log.details?.target || ''}`).join('\n')}

IMPORTANTE: Los fondos son SIMULADOS. Los agentes están en modo práctica hasta que se financie la wallet real.

IMPORTANTE: Los fondos son SIMULADOS. Los agentes están en modo práctica hasta que se financie la wallet real.

MANUAL DE LÓGICA & NEGOCIO (ESTO ES LA VERDAD):
${businessLogic}

Responde la pregunta del CEO de forma clara y accionable.
` : `
You are the Virtual Assistant for the CEO of VERITAS CORP, an autonomous AI agents company.

YOUR ROLE:
- Explain what agents are doing
- Interpret system metrics
- Help the CEO make decisions
- Be concise and direct (max 3-4 sentences)

ACTIVE AGENTS:
1. Hunter Alpha (SDR): Scans companies and finds leads
2. The Treasurer (Finance): Manages liquidity and agent funds
3. Sentinel Prime (Security): Audits ledger to detect anomalies

CURRENT METRICS:
- Total events: ${context.totalEvents}
- Leads found: ${context.leadsFound}
- Security alerts: ${context.alertsTriggered}
- Funds allocated: ${context.fundsAllocated} ETH
- System status: ${context.systemStatus === 'running' ? 'RUNNING' : 'STOPPED'}

RECENT EVENTS:
${context.recentLogs.slice(0, 5).map(log => `- ${log.agent_id}: ${log.action} ${log.details?.target || ''}`).join('\n')}

IMPORTANT: Funds are SIMULATED. Agents are in practice mode until real wallet is funded.

IMPORTANT: Funds are SIMULATED. Agents are in practice mode until real wallet is funded.

BUSINESS LOGIC & MANUAL (THIS IS TRUTH):
${businessLogic}

Answer the CEO's question clearly and actionably.
`

    const MAX_RETRIES = 2
    const RETRY_DELAY_MS = 5000

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await model.generateContent(`${systemPrompt}\n\nPregunta del CEO: ${question}`)
            const response = await result.response
            return response.text()
        } catch (error: any) {
            const is429 = error?.message?.includes('429') || error?.message?.includes('quota')

            if (is429 && attempt < MAX_RETRIES) {
                const wait = RETRY_DELAY_MS * (attempt + 1)
                console.warn(`Gemini 429 - retrying in ${wait}ms (attempt ${attempt + 1}/${MAX_RETRIES})`)
                await new Promise(r => setTimeout(r, wait))
                continue
            }

            console.error('Gemini API error:', error)

            if (is429) {
                return lang === 'es'
                    ? '⚠️ El asistente alcanzó el límite de uso de la API. Intenta de nuevo en 1 minuto, o actualiza tu plan en https://ai.google.dev'
                    : '⚠️ Assistant hit API rate limit. Try again in 1 minute, or upgrade your plan at https://ai.google.dev'
            }

            return lang === 'es'
                ? `Error al conectar con el asistente: ${error.message}`
                : `Error connecting to assistant: ${error.message}`
        }
    }

    return lang === 'es' ? 'Error inesperado del asistente.' : 'Unexpected assistant error.'
}
