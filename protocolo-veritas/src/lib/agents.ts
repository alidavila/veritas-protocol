
import { supabase } from './supabase'

export interface Agent {
    id: string
    user_id: string
    name: string
    type: 'support' | 'sales' | 'scraper' | 'custom'
    wallet_address: string | null
    status: 'active' | 'paused' | 'error'
    config: any
    created_at: string
    is_public?: boolean
    price_usd?: number
    description?: string
    last_seen?: string
    wallet_balance?: number
    current_task?: string
}

export const agentsService = {
    async getAgents() {
        const { data, error } = await supabase
            .from('agents')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as Agent[]
    },

    async getMarketplaceAgents() {
        const { data, error } = await supabase
            .from('agents')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as Agent[]
    },

    async createAgent(agent: Partial<Agent>) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        let realAddress = `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}` // Mock fallback
        let walletConfig = {}

        try {
            console.log("Requesting real Coinbase CDP wallet...");
            // Call the local Wallet Factory
            const response = await fetch('http://localhost:3000/wallets/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                realAddress = data.address;
                walletConfig = {
                    wallet_id: data.wallet_id,
                    seed: data.seed,
                    provider: 'coinbase_cdp',
                    network: 'base-sepolia'
                };
                console.log("Real wallet created:", realAddress);
            } else {
                console.warn("Backend error. Falling back to mock wallet.");
            }
        } catch (e) {
            console.warn("Could not connect to Veritas Backend (localhost:3000). Using mock wallet.");
        }

        const newAgent = {
            ...agent,
            user_id: user.id,
            wallet_address: realAddress,
            status: 'active',
            config: {
                ...agent.config,
                ...walletConfig
            }
        }

        const { data, error } = await supabase
            .from('agents')
            .insert([newAgent])
            .select()
            .single()

        if (error) throw error
        return data as Agent
    },

    async updateAgentStatus(id: string, status: 'active' | 'paused' | 'error') {
        const { data, error } = await supabase
            .from('agents')
            .update({ status })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Agent
    },

    async togglePublic(id: string, isPublic: boolean) {
        const { data, error } = await supabase
            .from('agents')
            .update({ is_public: isPublic })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Agent
    },

    async deleteAgent(id: string) {
        const { error } = await supabase
            .from('agents')
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    async ingestKnowledge(agentId: string, text: string) {
        try {
            const response = await fetch('http://localhost:3000/agent/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId, text })
            });
            return await response.json();
        } catch (e) {
            console.error(e);
            return { error: 'Connection failed' };
        }
    },

    async queryAgent(agentId: string, question: string) {
        try {
            const response = await fetch('http://localhost:3000/agent/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId, question })
            });
            return await response.json();
        } catch (e) {
            console.error(e);
            return { error: 'Connection failed' };
        }
    },

    async logAction(action: string, details: any) {
        const { error } = await supabase
            .from('agent_ledger')
            .insert([{
                agent_id: 'DASHBOARD',
                action,
                amount: 0,
                details
            }]);
        if (error) throw error;
    },

    async sendCommand(command: string, agentId: string = 'all') {
        const { error } = await supabase
            .from('agent_commands')
            .insert([{
                command,
                agent_id: agentId,
                status: 'pending'
            }]);
        if (error) throw error;
    }
}
