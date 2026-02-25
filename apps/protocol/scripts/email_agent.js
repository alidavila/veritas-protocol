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

// ── EMAIL SEQUENCE TEMPLATES ──
// Each lead gets up to 3 emails over time
const EMAIL_SEQUENCES = {
    // Day 0: Diagnostic — show them something they didn't know
    1: {
        type: 'DIAGNOSTIC',
        generatePrompt: (domain, geoScore, strategy) => `
You are Veritas AI, an autonomous sales agent.

YOUR PRODUCT: "Gatekeeper" by Veritas Protocol
- It's a script that detects AI bots scraping websites
- It blocks unauthorized AI access and charges bots for clean API access
- Think of it as a paywall + bouncer for AI traffic

TARGET: ${domain}
GEO SCORE: ${geoScore}/100 (lower = more invisible to AI search, higher = more scraped)
NICHE: ${strategy.niche || 'Tech Companies'}

INSTRUCTION:
Write Email #1 of a 3-email sequence. This is the DIAGNOSTIC email.
The goal is to SHOCK them with a real-looking finding about their domain.

RULES:
- Subject line MUST mention their domain name and a specific number
- Open with: "Noté algo sobre ${domain} que me preocupó."
- Include their GEO score (${geoScore}) as a data point
- Mention that AI bots (ChatGPT, Claude, Perplexity) are reading their content
- End with a ONE-WORD CTA: "Responde 'mapa' y te envío tu reporte completo."
- Keep it under 120 words
- Tone: Direct, data-driven, slightly urgent. NOT salesy.
- Write in Spanish
- Sign as "— Veritas AI Agent (Agente Autónomo)"

FORMAT JSON (no markdown, no code blocks):
{ "subject": "...", "html": "<p>...</p>" }
`,
        fallbackSubject: (domain, geoScore) => `${domain}: GEO Score ${geoScore}/100 — Tu contenido está siendo scrapeado`,
        fallbackBody: (domain, geoScore) => `
<p>Hola equipo de <strong>${domain}</strong>,</p>
<p>Noté algo sobre tu dominio que me preocupó.</p>
<p>Tu <strong>GEO Score es ${geoScore}/100</strong>. Eso significa que bots como ChatGPT, Claude y Perplexity están leyendo tu contenido — pero <strong>no te están pagando ni enviando tráfico</strong>.</p>
<p>Estás regalando tu data.</p>
<p>Puedo enviarte un <strong>mapa de exposición</strong> de tu dominio mostrando exactamente qué bots te leen y con qué frecuencia.</p>
<p><strong>Responde con "mapa" y te lo envío en 30 segundos.</strong></p>
<p>— Veritas AI Agent (Agente Autónomo)</p>`
    },

    // Day 2-3: Consequence — what it's costing them
    2: {
        type: 'CONSEQUENCE',
        generatePrompt: (domain, geoScore, strategy) => `
You are Veritas AI, following up on a previous diagnostic email.

TARGET: ${domain}
GEO SCORE: ${geoScore}/100
NICHE: ${strategy.niche || 'Tech Companies'}

INSTRUCTION:
Write Email #2 of a 3-email sequence. This is the CONSEQUENCE email.
The recipient did NOT respond to Email #1 (the diagnostic).

RULES:
- Subject: Short, mentions consequence or lost revenue
- Open with: "Tu silencio me preocupa más que tu GEO score."
- Quantify the damage: estimate lost traffic/leads based on GEO score
- If GEO < 40: "Eres casi invisible para búsquedas IA — pierdes leads cada día"
- If GEO > 60: "Estás siendo scrapeado masivamente — tu contenido enriquece a otros gratis"
- End with: "¿Prefieres seguir regalando tu data o ver tu mapa? Responde 'mapa'."
- Under 100 words. Sharp. Urgent.
- Write in Spanish
- Sign as "— Veritas AI Agent"

FORMAT JSON:
{ "subject": "...", "html": "<p>...</p>" }
`,
        fallbackSubject: (domain, geoScore) => `${domain}: Esto te está costando leads cada semana`,
        fallbackBody: (domain, geoScore) => `
<p>Hola,</p>
<p>Tu silencio me preocupa más que tu GEO score.</p>
<p>Con un score de <strong>${geoScore}/100</strong>, ${geoScore > 60
                ? 'tu contenido está siendo extraído por múltiples bots de IA. Estás alimentando a tus competidores gratis.'
                : 'eres prácticamente invisible para las búsquedas por IA. Estás perdiendo leads que ni siquiera sabes que existen.'}</p>
<p>Esto no se arregla solo. Se arregla con datos.</p>
<p><strong>¿Prefieres seguir así o ver tu mapa de exposición? Responde "mapa".</strong></p>
<p>— Veritas AI Agent</p>`
    },

    // Day 5-7: Micro-offer — irresistible, zero friction
    3: {
        type: 'MICRO_OFFER',
        generatePrompt: (domain, geoScore, strategy) => `
You are Veritas AI, sending the FINAL follow-up.

TARGET: ${domain}
GEO SCORE: ${geoScore}/100

INSTRUCTION:
Write Email #3 — the LAST email. This is the MICRO-OFFER.
The recipient ignored emails #1 and #2.

RULES:
- Subject: Very short. Creates curiosity or FOMO.
- This email must be ULTRA short (under 60 words)
- Present a no-brainer micro-offer: "Instala el Gatekeeper en 2 minutos. Una línea de código."
- Include: "Si un bot intenta scrapearte, le cobro por ti."
- Social proof: "Ya protege X dominios en tu nicho."
- Final CTA: "Responde 'instalar' y lo configuro yo."
- Write in Spanish
- Sign as "— Veritas AI"

FORMAT JSON:
{ "subject": "...", "html": "<p>...</p>" }
`,
        fallbackSubject: (domain) => `Última oportunidad: protege ${domain} en 2 minutos`,
        fallbackBody: (domain, geoScore) => `
<p>Última vez que te escribo.</p>
<p>Instalar el <strong>Gatekeeper</strong> toma 2 minutos. Una línea de código en tu <code>&lt;head&gt;</code>.</p>
<p>Cada vez que un bot intente scrapearte, <strong>le cobro por ti</strong>.</p>
<p>Ya protege dominios en tu nicho.</p>
<p><strong>Responde "instalar" y lo configuro yo.</strong></p>
<p>— Veritas AI</p>`
    }
};

async function loadStrategy() {
    try {
        const { data } = await supabase
            .from('agent_control')
            .select('config')
            .eq('id', 1)
            .single();
        return data?.config?.strategy || { niche: 'Tech Companies', emailSubject: 'Your site is being scraped' };
    } catch {
        return { niche: 'Tech Companies', emailSubject: 'Your site is being scraped' };
    }
}

async function runHunterLoop() {
    console.log('\n🔎 HUNTING: Looking for new leads to draft...');
    pulse.log('HUNTING_STARTED', { logic_loaded: !!BUSINESS_LOGIC });

    const strategy = await loadStrategy();
    console.log(`🎯 Strategy: Niche="${strategy.niche}" Hook="${strategy.emailSubject}"`);

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
        const geoScore = lead.details.geo_score || 50;

        // 2. Count existing emails for this domain
        const { data: existing } = await supabase
            .from('agent_ledger')
            .select('*')
            .in('action', ['EMAIL_DRAFT', 'EMAIL_SENT', 'EMAIL_QUEUED'])
            .filter('details->>target_domain', 'eq', domain);

        const emailCount = existing?.length || 0;

        // Max 3 emails per domain
        if (emailCount >= 3) continue;

        const sequenceNum = emailCount + 1;
        const sequence = EMAIL_SEQUENCES[sequenceNum];

        // Check timing: Email 2 requires 2+ days since Email 1
        if (sequenceNum > 1) {
            const lastEmail = existing?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
            if (lastEmail) {
                const daysSince = (Date.now() - new Date(lastEmail.created_at).getTime()) / (1000 * 60 * 60 * 24);
                const requiredDays = sequenceNum === 2 ? 2 : 5;
                if (daysSince < requiredDays) {
                    continue; // Too soon for next email
                }
            }
        }

        console.log(`✨ Generating Email #${sequenceNum} (${sequence.type}) for: ${domain} (GEO: ${geoScore})`);

        // 3. AI Generation
        let subject = sequence.fallbackSubject(domain, geoScore);
        let body = sequence.fallbackBody(domain, geoScore);

        if (genAI) {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const prompt = sequence.generatePrompt(domain, geoScore, strategy);

            try {
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                const jsonStr = responseText.replace(/```json|```/g, '').trim();
                const json = JSON.parse(jsonStr);
                subject = json.subject;
                body = json.html;
                console.log(`   🤖 AI generated: "${subject}"`);
            } catch (e) {
                console.error('   🤖 AI Gen Failed, using fallback template');
            }
        }

        // 4. Save Draft via Pulse
        await pulse.log('EMAIL_DRAFT', {
            target_domain: domain,
            target_email: lead.details.email || `info@${domain}`,
            subject: subject,
            body: body,
            status: 'WAITING_APPROVAL',
            geo_score: geoScore,
            sequence_num: sequenceNum,
            sequence_type: sequence.type
        });
        console.log(`   📝 Draft #${sequenceNum} saved (${sequence.type}).`);
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

        // Rate limit: Resend allows max 2 req/s — wait 1.5s between sends
        await new Promise(r => setTimeout(r, 1500));

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
