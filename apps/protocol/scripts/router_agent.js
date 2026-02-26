
/**
 * ROUTER AGENT v1.0 (Command & Control)
 * 
 * Features:
 * 1. 📡 Polls `agent_commands` table for "pending" instructions.
 * 2. 🧠 Parses natural language (or text) commands using simple regex/logic (AI upgrade later).
 * 3. 📢 Broadcasts config changes to other agents (via `agent_config` or Ledger).
 * 4. 💓 Sends heartbeats.
 * 
 * Usage: node scripts/router_agent.js
 */

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { VeritasPulse } from './lib/veritas-pulse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const AGENT_ID = 'did:veritas:router:001';
const pulse = new VeritasPulse(AGENT_ID, 'custom'); // 'custom' type for Router

const GEN_AI_KEY = process.env.VITE_GEMINI_API_KEY;
const genAI = GEN_AI_KEY ? new GoogleGenerativeAI(GEN_AI_KEY) : null;

async function processCommands() {
    console.log('\n📡 ROUTER: Scanning for orders...');

    // 1. Fetch PENDING commands
    const { data: commands, error } = await supabase
        .from('agent_commands')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true }); // Process oldest first

    if (error || !commands?.length) return;

    console.log(`   Found ${commands.length} pending commands.`);

    for (const cmd of commands) {
        console.log(`   ⚡ Processing: "${cmd.command}"`);

        await pulse.log('CMD_RECEIVED', { command: cmd.command, id: cmd.id });

        try {
            let result = { action: 'acknowledged', note: 'Processed' };
            let actionType = 'UNKNOWN';

            // --- AI PARSING ---
            if (genAI) {
                const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                const prompt = `
                ACT AS: Veritas Router (Command & Control).
                INPUT: "${cmd.command}"
                
                AVAILABLE ACTIONS:
                1. STOP_ALL: Panic button. Pause everything.
                2. START_ALL: Resume operations.
                3. DEPLOY_AGENT: Create a new agent (mock).
                4. QUERY_STATUS: content = "summary".
                5. UNKNOWN: If unclear.

                OUTPUT JSON: { "action": "ACTION_NAME", "reason": "short explanation" }
                `;

                try {
                    const aiRes = await model.generateContent(prompt);
                    const text = aiRes.response.text().replace(/```json|```/g, '').trim();
                    const parsed = JSON.parse(text);
                    actionType = parsed.action;
                    result.note = parsed.reason;
                } catch (e) {
                    console.error("AI Parsing failed, falling back to regex.");
                }
            }

            // --- EXECUTION ---
            // Fallback or AI Result
            if (actionType === 'UNKNOWN') {
                if (cmd.command.toLowerCase().includes('stop')) actionType = 'STOP_ALL';
                else if (cmd.command.toLowerCase().includes('start')) actionType = 'START_ALL';
            }

            console.log(`   🤖 Logic Decision: ${actionType}`);

            switch (actionType) {
                case 'STOP_ALL':
                    await supabase.from('agents').update({ status: 'paused' }).neq('type', 'custom');
                    result.action = 'PAUSED_FLEET';
                    break;
                case 'START_ALL':
                    await supabase.from('agents').update({ status: 'active' }).neq('type', 'custom');
                    result.action = 'RESUMED_FLEET';
                    break;
                default:
                    result.action = 'LOGGED_ONLY';
            }

            // 2. Mark as COMPLETED
            await supabase
                .from('agent_commands')
                .update({ status: 'completed', result: result, updated_at: new Date() })
                .eq('id', cmd.id);

            // 3. Log
            await pulse.log('CMD_EXECUTED', { original_cmd: cmd.command, result });

            console.log('   ✅ Command Executed.');

        } catch (e) {
            console.error('   ❌ Execution Failed:', e);
            await supabase
                .from('agent_commands')
                .update({ status: 'failed', result: { error: e.message }, updated_at: new Date() })
                .eq('id', cmd.id);
        }
    }
}

async function main() {
    pulse.startHeartbeat();
    console.log("🦾 ROUTER AGENT ONLINE. Waiting for Commander...");

    // Fast Polling Loop for Router (Needs to be responsive)
    setInterval(async () => {
        await processCommands();
    }, 5000); // Every 5 seconds
}

main().catch(console.error);
