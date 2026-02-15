import { supabase } from '../supabase'

// --- 1. CORE TOOLS ---

/**
 * Saves a financial or action transaction to the ledger.
 * This is the primary way agents "remember" what they did.
 */
export async function save_transaction(agent_id: string, action: string, amount: number, details: any) {
    const { data, error } = await supabase
        .from('agent_ledger')
        .insert([
            { agent_id, action, amount, details }
        ])
        .select()

    if (error) {
        console.error('MCP Error: Failed to save transaction', error)
        throw new Error(error.message)
    }
    return data
}

/**
 * Logs an error or warning encountered by an agent.
 */
export async function log_error(agent_id: string, message: string, context?: any) {
    return save_transaction(agent_id, 'ERROR', 0, { message, context })
}

/**
 * Search the inventory using semantic search (Mockup for Phase 1).
 * In Phase 2, this will use pgvector.
 */
export async function query_inventory(query: string) {
    // TODO: Implement pgvector search
    console.log(`[MCP] Agent searching for: ${query}`)

    // For now, return a mock response to validate the plumbing
    return {
        result: "Found 3 verified nodes matching your criteria.",
        data: [
            { id: "node_1", type: "storage", price: "0.01 USDC/GB" },
            { id: "node_2", type: "compute", price: "0.05 USDC/hr" }
        ]
    }
}
