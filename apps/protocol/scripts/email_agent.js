/**
 * EMAIL AGENT v2.1 (Pulse Integrated)
 * 
 * Features:
 * 1. 🧠 Logic Injection: Reads LOGICA_VERITAS.md
 * 2. 📝 Draft Mode: Generates drafts (WAITING_APPROVAL)
 * 3. 🤖 AI Generation: Uses Gemini Pro
 * 4. 📨 Sender Loop: Sends APPROVED drafts via Resend
 * 5. 💓 Pulse: Sends heartbeats to Dashboard
 * 
 * Usage: node scripts/email_agent.js
 */

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { VeritasPulse } from './lib/veritas-pulse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// --- CONFIGURATION ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;
const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;

// Agent Identify
const AGENT_ID = 'did:veritas:marketer:001';
const pulse = new VeritasPulse(AGENT_ID, 'sales');

// Read Business Logic
let BUSINESS_LOGIC = '';
try {
    const logicPath = path.join(__dirname, '../knowledge/LOGICA_VERITAS.md');
    BUSINESS_LOGIC = fs.readFileSync(logicPath, 'utf-8');
    console.log('🧠 Business Logic Loaded into Memory');
} catch (e) {
    console.warn('⚠️ LOGICA_VERITAS.md not found. Using fallback logic.');
}

async function runHunterLoop() {
    console.log('\n🔎 HUNTING: Looking for new leads to draft...');
    pulse.log('HUNTING_STARTED', { logic_loaded: !!BUSINESS_LOGIC });

    // 1. Get recent leads
    const { data: leads } = await supabase
        .from('agent_ledger')
        .select('*')
        .eq('action', 'LEAD_FOUND')
        .order('created_at', { ascending: false })
        .limit(20);

    if (!leads?.length) return;

    for (const lead of leads) {
        const domain = lead.details.target;

        // 2. Check if we already have a draft or sent email
        const { data: existing } = await supabase
            .from('agent_ledger')
            .select('*')
            .in('action', ['EMAIL_DRAFT', 'EMAIL_SENT', 'EMAIL_QUEUED'])
            .filter('details->>target_domain', 'eq', domain)
            .limit(1);

        if (existing?.length) continue;

        console.log(`✨ Generating Draft for: ${domain}`);

        // 3. AI Generation
        let subject = `Submission for ${domain}`;
        let body = `Hello team at ${domain}...`;

        if (genAI) {
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const prompt = `
            CONTEXT:
            ${BUSINESS_LOGIC.slice(0, 2000)}... 
            
            TASK:
            You are "Veritas AI", an autonomous agent looking for B2B partners.
            Target Domain: ${domain}
            GEO Score: ${lead.details.geo_score}/100.
            
            GOAL:
            Write a SHORT, cold outreach email to the CTO/Owner.
            Sell them the "Gatekeeper" product.
            
            FORMAT JSON:
            { "subject": "...", "html": "..." }
            `;

            try {
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                const jsonStr = responseText.replace(/```json|```/g, '').trim();
                const json = JSON.parse(jsonStr);
                subject = json.subject;
                body = json.html;
            } catch (e) {
                console.error('   🤖 AI Gen Failed, using fallback');
                body = `<p>We noticed ${domain} has a low GEO score.</p>`;
            }
        }

        // 4. Save Draft via Pulse
        await pulse.log('EMAIL_DRAFT', {
            target_domain: domain,
            target_email: lead.details.email || `info@${domain}`,
            subject: subject,
            body: body,
            status: 'WAITING_APPROVAL',
            geo_score: lead.details.geo_score
        });
        console.log('   📝 SDK Draft Saved via Pulse.');
    }
}

async function runSenderLoop() {
    console.log('📨 SENDER: Checking for approved drafts...');

    // 1. Find APPROVED drafts
    const { data: drafts } = await supabase
        .from('agent_ledger')
        .select('*')
        .eq('action', 'EMAIL_DRAFT')
        .order('created_at', { ascending: false })
        .limit(50);

    if (!drafts) return;

    const approvedDrafts = drafts.filter(d => d.details?.status === 'APPROVED');

    for (const draft of approvedDrafts) {
        console.log(`🚀 Sending Approved Email to ${draft.details.target_domain}...`);

        try {
            if (!resend) throw new Error("No Resend Key");

            const SAFE_DESTINATION = 'delivered@resend.dev';
            const data = await resend.emails.send({
                from: 'Veritas Agents <onboarding@resend.dev>',
                to: [SAFE_DESTINATION],
                subject: draft.details.subject,
                html: draft.details.body
            });

            if (data.error) throw data.error;

            console.log('   ✅ Sent! ID:', data.data.id);

            // 2. Update Draft Status (Keep raw Supabase for updates for now)
            const newDetails = { ...draft.details, status: 'SENT', sent_at: new Date().toISOString(), resend_id: data.data.id };
            await supabase
                .from('agent_ledger') // This table might be immutable in some designs, but we update here for state tracking
                .update({ details: newDetails })
                .eq('id', draft.id);

            // 3. Log via Pulse
            await pulse.log('EMAIL_SENT', {
                target_domain: draft.details.target_domain,
                provider: 'RESEND',
                original_draft_id: draft.id
            });

            // 4. Update Balance (Simulated Cost)
            // await pulse.updateBalance(currentBalance - 0.0001); 

        } catch (e) {
            console.error('   ❌ Send Failed:', e);
            await pulse.log('EMAIL_ERROR', { error: e.message, domain: draft.details.target_domain });
        }
    }
}

async function main() {
    pulse.startHeartbeat(); // START THE HEARTBEAT

    try {
        await runHunterLoop();
        await runSenderLoop();
    } catch (e) {
        console.error("Agent Loop Error:", e);
        await pulse.dead(); // Report death
        process.exit(1);
    }

    console.log('💤 Agent sleeping (Heartbeat active)...');
    // We keep the process alive for heartbeats if we want, or we just exit?
    // For a cron job, we exit. For a daemon, we wait.
    // The user said "Army of agents". Typically daemons.
    // I'll keep it running for a bit then exit, OR set it to loop.
    // Let's make it a Daemon for now? No, the previous code was oneshot.
    // But "Heartbeat" implies continuous running.
    // I will enable a loop logic here.

    // Simple Loop
    setInterval(async () => {
        await runHunterLoop();
        await runSenderLoop();
    }, 60000 * 5); // Every 5 minutes
}

main().catch(console.error);
