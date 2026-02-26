/**
 * Command Bridge: Maps CEO Assistant commands to actual agent operations.
 * This is the brain that translates natural language intent into Supabase mutations.
 */

import { agentsService } from './agents'
import { supabase } from './supabase'

export interface CommandResult {
    success: boolean
    message: string
    action: string
}

/**
 * Executes a structured command from the CEO Assistant.
 * Returns a result with success/failure and a human-readable description.
 */
export async function executeAssistantCommand(
    command: string,
    payload: any = {}
): Promise<CommandResult> {
    console.log(`[CommandBridge] Executing: ${command}`, payload)

    try {
        switch (command) {
            case 'PAUSE_AGENT': {
                const agentName = payload.agent || 'all'
                const agent = await findAgentByName(agentName)
                if (agent) {
                    await agentsService.updateAgentStatus(agent.id, 'paused')
                    return { success: true, message: `${agent.name} pausado.`, action: 'pause' }
                }
                // If no specific agent found, send a global pause command
                await agentsService.sendCommand('PAUSE', agentName)
                return { success: true, message: `Comando PAUSE enviado a ${agentName}.`, action: 'pause' }
            }

            case 'RESUME_AGENT': {
                const agentName = payload.agent || 'all'
                const agent = await findAgentByName(agentName)
                if (agent) {
                    await agentsService.updateAgentStatus(agent.id, 'active')
                    return { success: true, message: `${agent.name} reactivado.`, action: 'resume' }
                }
                await agentsService.sendCommand('RESUME', agentName)
                return { success: true, message: `Comando RESUME enviado a ${agentName}.`, action: 'resume' }
            }

            case 'UPDATE_HUNTER_NICHE': {
                const niche = payload.niche || payload.value
                if (!niche) return { success: false, message: 'No se especificó un nicho.', action: 'error' }

                // Update strategy with the new niche
                const currentStrategy = await agentsService.getStrategy()
                await agentsService.saveStrategy({
                    niche,
                    emailSubject: currentStrategy?.emailSubject || 'Your business needs this'
                })
                // Notify hunter via command
                await agentsService.sendCommand(`SET_NICHE:${niche}`, 'hunter')
                return { success: true, message: `Nicho actualizado a "${niche}".`, action: 'config' }
            }

            case 'UPDATE_HUNTER_URLS': {
                const urls = payload.urls || payload.value
                if (!urls) return { success: false, message: 'No se especificaron URLs.', action: 'error' }

                await agentsService.sendCommand(`SET_URLS:${urls}`, 'hunter')
                // Also persist in agent_control config
                await updateAgentControlConfig({ hunter_urls: urls })
                return { success: true, message: `URLs del Hunter actualizadas.`, action: 'config' }
            }

            case 'UPDATE_EMAIL_LIMIT': {
                const limit = payload.limit || payload.value
                if (!limit) return { success: false, message: 'No se especificó un límite.', action: 'error' }

                await updateAgentControlConfig({ email_agent: { daily_limit: Number(limit) } })
                await agentsService.sendCommand(`SET_LIMIT:${limit}`, 'email')
                return { success: true, message: `Límite diario de emails: ${limit}.`, action: 'config' }
            }

            case 'UPDATE_STRATEGY': {
                const niche = payload.niche
                const hook = payload.hook || payload.emailSubject
                if (!niche && !hook) return { success: false, message: 'No se especificó estrategia.', action: 'error' }

                const current = await agentsService.getStrategy()
                await agentsService.saveStrategy({
                    niche: niche || current?.niche || '',
                    emailSubject: hook || current?.emailSubject || ''
                })
                return { success: true, message: `Estrategia actualizada.`, action: 'config' }
            }

            case 'APPROVE_ALL_DRAFTS': {
                // Fetch drafts waiting for approval
                const { data: drafts, error: fetchError } = await supabase
                    .from('agent_ledger')
                    .select('*')
                    .eq('action', 'EMAIL_DRAFT')
                    .filter('details->>status', 'eq', 'WAITING_APPROVAL')

                if (fetchError) throw fetchError
                const count = drafts?.length || 0

                if (count > 0) {
                    for (const draft of drafts) {
                        const newDetails = { ...draft.details, status: 'APPROVED' }
                        await supabase
                            .from('agent_ledger')
                            .update({ details: newDetails })
                            .eq('id', draft.id)
                    }
                }
                return { success: true, message: `${count} borradores aprobados.`, action: 'approve' }
            }

            default:
                return { success: false, message: `Comando desconocido: ${command}`, action: 'error' }
        }
    } catch (error: any) {
        console.error('[CommandBridge] Error:', error)
        return { success: false, message: `Error ejecutando ${command}: ${error.message}`, action: 'error' }
    }
}

// ── Helpers ──────────────────────────────────────────────

/** Find agent by fuzzy name match (hunter, email, treasurer, etc.) */
async function findAgentByName(name: string) {
    const agents = await agentsService.getAgents()
    const normalized = name.toLowerCase()

    const nameMap: Record<string, string[]> = {
        'hunter': ['hunter', 'scraper', 'lead'],
        'email': ['email', 'marketer', 'sales'],
        'treasurer': ['treasurer', 'finance', 'treasury'],
        'gatekeeper': ['gatekeeper', 'support', 'sentinel'],
    }

    for (const [_key, aliases] of Object.entries(nameMap)) {
        if (aliases.some(a => normalized.includes(a))) {
            return agents.find(ag =>
                aliases.some(a =>
                    ag.name.toLowerCase().includes(a) ||
                    ag.type.toLowerCase().includes(a)
                )
            )
        }
    }

    // Direct match attempt
    return agents.find(ag => ag.name.toLowerCase().includes(normalized))
}

/** Merge partial config into agent_control row */
async function updateAgentControlConfig(partialConfig: Record<string, any>) {
    const { data: existing } = await supabase
        .from('agent_control')
        .select('config')
        .eq('id', 1)
        .single()

    const merged = { ...(existing?.config || {}), ...partialConfig }

    await supabase
        .from('agent_control')
        .upsert({
            id: 1,
            config: merged,
            updated_at: new Date().toISOString()
        })
}
