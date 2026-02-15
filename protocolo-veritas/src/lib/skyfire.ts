
interface SkyfireConfig {
    apiKey: string
    agentId?: string
}

// API URL for future use
// const SKYFIRE_API_URL = 'https://api.skyfire.xyz/v1'

export class SkyfireService {
    private apiKey: string
    private agentId: string | undefined

    constructor(config: SkyfireConfig) {
        this.apiKey = config.apiKey
        this.agentId = config.agentId
        // Mostrar en consola que recibimos el ID (solo los primeros caracteres por seguridad)
        console.log('Skyfire Service Initialized. Agent ID:', this.agentId ? `${this.agentId.substring(0, 5)}...` : 'None')
    }

    async getWalletBalance(_walletAddress: string): Promise<string> {
        // En un futuro aquí haremos: fetch(`${SKYFIRE_API_URL}/wallets/${this.agentId}/balance`)
        console.log(`[Skyfire] Verificando balance para Agent: ${this.agentId || 'Anon'}`)

        return new Promise((resolve) => {
            setTimeout(() => {
                // Si hay API Key configurada, mostramos saldo "real" de bienvenida ($500.00)
                // Si no, mostramos 0.00
                const balance = this.apiKey ? '500.00' : '0.00'
                resolve(balance)
            }, 1000)
        })
    }

    async processPayment(amount: number, recipient: string): Promise<boolean> {
        console.log(`[Skyfire] Procesando pago de $${amount} a ${recipient}...`)
        return new Promise((resolve) => {
            setTimeout(() => resolve(true), 2000)
        })
    }
}

export const skyfire = new SkyfireService({
    apiKey: import.meta.env.VITE_SKYFIRE_API_KEY || '',
    agentId: import.meta.env.VITE_SKYFIRE_AGENT_ID || ''
})
