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

export interface AssistantResponse {
    reply: string
    command?: string
    payload?: any
}

export async function askAssistant(question: string, context: AssistantContext, lang: 'es' | 'en'): Promise<AssistantResponse> {
    if (!genAI) {
        return {
            reply: lang === 'es'
                ? 'Error: API key de Gemini no configurada. Agrega VITE_GEMINI_API_KEY a tu archivo .env'
                : 'Error: Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file'
        }
    }

    // Fetch business logic
    let businessLogic = ''
    try {
        const res = await fetch('/LOGICA_VERITAS.md')
        if (res.ok) businessLogic = await res.text()
    } catch (e) {
        console.warn('Logic file not found')
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const commandInstructions = `
COMANDOS DISPONIBLES (usa estos cuando el CEO dé una ORDEN, no una pregunta):
- UPDATE_HUNTER_NICHE: Cambiar el nicho objetivo del Hunter. Payload: { "niche": "nuevo nicho" }
- UPDATE_HUNTER_URLS: Cambiar las URLs semilla del Hunter. Payload: { "urls": "url1, url2" }
- PAUSE_AGENT: Pausar un agente. Payload: { "agent": "hunter|email|treasurer" }
- RESUME_AGENT: Reanudar un agente. Payload: { "agent": "hunter|email|treasurer" }
- UPDATE_EMAIL_LIMIT: Cambiar el límite diario de emails. Payload: { "limit": 50 }
- UPDATE_STRATEGY: Cambiar la estrategia activa. Payload: { "niche": "...", "hook": "..." }
- APPROVE_ALL_DRAFTS: Aprobar todos los borradores pendientes. Payload: {}

FORMATO DE RESPUESTA:
Si el CEO da una ORDEN operativa, responde SIEMPRE con JSON puro:
{"reply": "tu respuesta al CEO", "command": "NOMBRE_COMANDO", "payload": { ... }}

Si el CEO hace una PREGUNTA (no una orden), responde con JSON sin command:
{"reply": "tu respuesta al CEO"}

IMPORTANTE: Tu respuesta SIEMPRE debe ser JSON válido. Nada más.
`

    const systemPrompt = `
Eres el Asistente Operativo del CEO de VERITAS CORP. No solo respondes preguntas, EJECUTAS órdenes.

AGENTES ACTIVOS:
1. Hunter (Lead Scraper): Escanea empresas y encuentra leads cualificados
2. Email Marketer: Genera y envía correos de outreach
3. Treasurer: Audita ingresos x402 de los Gatekeepers
4. Gatekeeper: Protege sitios web de scraping no autorizado por bots de IA

MÉTRICAS ACTUALES:
- Leads encontrados: ${context.leadsFound}
- Estado del sistema: ${context.systemStatus === 'running' ? 'OPERATIVO' : 'DETENIDO'}
- Fondos: ${context.fundsAllocated} ETH

ÚLTIMOS EVENTOS:
${context.recentLogs.slice(0, 5).map((log: any) => `- ${log.agent_id}: ${log.action} ${log.details?.target || ''}`).join('\n')}

${commandInstructions}

${businessLogic ? `MANUAL DE LÓGICA & NEGOCIO:\n${businessLogic}` : ''}

Responde en ${lang === 'es' ? 'español' : 'inglés'}. Sé conciso (máximo 3 oraciones).
`

    const MAX_RETRIES = 2
    const RETRY_DELAY_MS = 5000

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await model.generateContent(`${systemPrompt}\n\nMensaje del CEO: ${question}`)
            const response = await result.response
            const text = response.text().trim()

            // Try to parse as JSON (structured command response)
            try {
                // Strip markdown code fences if present
                const cleaned = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim()
                const parsed = JSON.parse(cleaned)
                return {
                    reply: parsed.reply || text,
                    command: parsed.command,
                    payload: parsed.payload
                }
            } catch {
                // If not JSON, return as plain reply
                return { reply: text }
            }
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
                return {
                    reply: lang === 'es'
                        ? '⚠️ El asistente alcanzó el límite de uso de la API. Intenta de nuevo en 1 minuto.'
                        : '⚠️ Assistant hit API rate limit. Try again in 1 minute.'
                }
            }

            return {
                reply: lang === 'es'
                    ? `Error al conectar con el asistente: ${error.message}`
                    : `Error connecting to assistant: ${error.message}`
            }
        }
    }

    return { reply: lang === 'es' ? 'Error inesperado del asistente.' : 'Unexpected assistant error.' }
}
