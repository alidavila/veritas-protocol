// --- TRANSLATIONS (Updated with GEO) ---
export const translations = {
    es: {
        welcome: {
            title: "Veritas Protocol.",
            subtitle: "El Sistema Operativo de la Economía Máquina.",
            desc_business: "Tus clientes ya no navegan webs. Mandan a sus agentes. ¿Es tu negocio visible para ellos?",
            desc_dev: "Infraestructura soberana para tus agentes autónomos. Identidad, Wallet y Pagos en 3 clicks.",
            cta_geo: "Diagnóstico GEO (Empresas)",
            cta_agent: "Desplegar Agente (Devs)",
            status: "ESTADO: RED ACTIVA"
        },
        step1: {
            label: "PASO 01: EXISTENCIA",
            title: "Dale un nombre.",
            desc_business: "Solución detectada: Tu negocio es invisible a la IA. Necesitas un 'Agente Embajador' en la red Veritas.",
            desc_dev: "Para que tu agente pueda firmar contratos y moverse por la red, necesita una identidad única. Así de simple.",
            success_hack: "(Demo: Usar identidad por defecto)"
        },
        step2: {
            label: "PASO 02: RECURSOS",
            title: "Dale presupuesto.",
            desc: "Las ideas son gratis, pero la ejecución cuesta. Carga la billetera de tu agente para que pueda pagar sus propios gastos. 'Pin, pun, pao'.",
            cta: "Confirmar Fondos y Seguir"
        },
        step3: {
            label: "PASO 03: ACCESO",
            title: "Entrar al Kernel.",
            desc: "Tu agente está listo. Ingresa tu email para recibir tu llave de acceso y ver el monitor en tiempo real.",
            cta: "Iniciar Sesión en el Swarm",
            feedback: "¿No es lo que buscabas? Dinos qué falta."
        },
        concierge: {
            modal_title: "Soporte Directo",
            modal_desc: "Entendido. Si esto no resolvió tu problema, dime exactamente qué necesitas que construya.",
            placeholder: "Ej: Necesito que mi agente negocie contratos por email...",
            submit: "Enviar Requerimiento"
        }
    },
    en: {
        welcome: {
            title: "Veritas Protocol.",
            subtitle: "The Operating System for the Machine Economy.",
            desc_business: "Your customers stopped browsing. They send agents now. Is your business visible to them?",
            desc_dev: "Sovereign infrastructure for autonomous agents. Identity, Wallet & Payments in 3 clicks.",
            cta_geo: "Run GEO Diagnosis (Biz)",
            cta_agent: "Deploy Agent (Devs)",
            status: "STATUS: NETWORK ACTIVE"
        },
        step1: {
            label: "STEP 01: EXISTENCE",
            title: "Give it a name.",
            desc_business: "Solution detected: Your business is invisible to AI. You need an 'Ambassador Agent' on the Veritas network.",
            desc_dev: "For your agent to sign contracts and move through the network, it needs a unique identity. Simple as that.",
            success_hack: "(Demo: Use default identity)"
        },
        step2: {
            label: "STEP 02: RESOURCES",
            title: "Give it a budget.",
            desc: "Ideas are free, execution costs money. Load your agent's wallet so it can pay its own expenses. Done.",
            cta: "Confirm Funds & Next"
        },
        step3: {
            label: "STEP 03: ACCESS",
            title: "Enter the Kernel.",
            desc: "Your agent is ready. Enter your email to receive your access key and view the real-time monitor.",
            cta: "Login to Swarm",
            feedback: "Not what you needed? Tell us."
        },
        concierge: {
            modal_title: "Direct Support",
            modal_desc: "Understood. If this didn't solve your problem, tell me exactly what you need built.",
            placeholder: "e.g. I need an agent that negotiates contracts via email...",
            submit: "Submit Requirement"
        }
    }
} as const

export type Lang = keyof typeof translations
export type Translations = typeof translations[Lang]
