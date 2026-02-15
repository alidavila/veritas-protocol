import * as tools from './tools'

/**
 * Protocol Veritas MCP Server (Model Context Protocol)
 * 
 * This server acts as the bridge between the Agent (LLM) and the Infrastructure (Supabase).
 * It exposes defined "tools" that the agent can call to perform actions.
 */

export const mcp = {
    name: "veritas-core",
    version: "1.0.0",

    // The tools available to the agent
    tools: {
        save_transaction: tools.save_transaction,
        log_error: tools.log_error,
        query_inventory: tools.query_inventory
    },

    /**
     * Execute a tool by name.
     * This is the entry point for the agent's "function calling" capability.
     */
    async call(toolName: string, args: any) {
        // @ts-ignore - Dynamic access
        const tool = this.tools[toolName]
        if (!tool) {
            throw new Error(`Tool '${toolName}' not found in Veritas Protocol.`)
        }

        console.log(`[MCP] Executing ${toolName} with args:`, args)
        return await tool(...Object.values(args))
    }
}
