
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from the root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export class VeritasPulse {
    constructor(agentId, agentType) {
        if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('VERITAS PULSE: Missing Supabase credentials in .env');
        }

        this.agentId = agentId;
        this.agentType = agentType;
        this.supabase = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        this.heartbeatInterval = null;
        console.log(`[PULSE] Initialized for Agent: ${agentId}`);
    }

    /**
     * Starts the heartbeat loop
     * @param {number} intervalMs - Interval in milliseconds (default 30s)
     */
    startHeartbeat(intervalMs = 30000) {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

        // Initial beat
        this.pulse();

        this.heartbeatInterval = setInterval(() => {
            this.pulse();
        }, intervalMs);

        console.log(`[PULSE] Heartbeat started (${intervalMs}ms)`);
    }

    /**
     * Sends a single heartbeat update
     */
    async pulse(extraData = {}) {
        try {
            const updateData = {
                status: 'active',
                ...extraData
            };

            const { error } = await this.supabase
                .from('agents')
                .update(updateData)
                .eq('id', this.agentId);

            if (error) throw error;
            // process.stdout.write('.'); // Minimal log
        } catch (err) {
            console.error(`[PULSE] Error sending heartbeat: ${err.message}`);
        }
    }

    /**
     * Updates the wallet balance
     * @param {number} balance 
     */
    async updateBalance(balance) {
        await this.pulse({ wallet_balance: balance });
        console.log(`[PULSE] Balance updated: ${balance} ETH`);
    }

    /**
     * Logs an action to the public ledger
     * @param {string} action - Short action name (e.g., 'EMAIL_SENT')
     * @param {object} details - JSON details
     * @param {number} amount - Cost or value involved (optional)
     */
    async log(action, details = {}, amount = 0) {
        try {
            const { error } = await this.supabase
                .from('agent_ledger')
                .insert({
                    agent_id: this.agentId,
                    action: action,
                    details: details,
                    amount: amount,
                    created_at: new Date().toISOString()
                });

            if (error) throw error;
            console.log(`[LEDGER] ${action}: ${JSON.stringify(details).substring(0, 50)}...`);
        } catch (err) {
            console.error(`[PULSE] Ledger error: ${err.message}`);
        }
    }

    /**
     * Call this when the agent is stopping or crashing
     */
    async dead() {
        await this.pulse({ status: 'paused' });
        console.log(`[PULSE] Agent signal lost.`);
    }
}
