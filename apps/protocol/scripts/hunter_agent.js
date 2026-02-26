/**
 * HUNTER AGENT v2.0 — Real Lead Discovery
 * 
 * What it does:
 * 1. Takes a list of seed URLs (or discovers via sitemap/search)
 * 2. Fetches their robots.txt to check if they block AI agents
 * 3. Checks for structured data (JSON-LD)
 * 4. Calculates a GEO vulnerability score
 * 5. Saves qualified leads to Supabase agent_ledger
 * 
 * Usage: node hunter_agent.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const AGENT_ID = 'did:veritas:hunter:002';
const SCAN_INTERVAL_MS = 60_000; // 1 minute between rounds

// ============================================================
// SEED TARGETS — Real companies to scan
// These can come from multiple sources in the future:
//  - Google Custom Search API
//  - Sitemap crawling
//  - Manual input
//  - Supabase 'targets' table
// ============================================================
const SEED_TARGETS = [
    'https://www.shopify.com',
    'https://www.wordpress.com',
    'https://www.squarespace.com',
    'https://www.wix.com',
    'https://www.godaddy.com',
    'https://www.hubspot.com',
    'https://www.salesforce.com',
    'https://www.notion.so',
    'https://www.medium.com',
    'https://www.substack.com',
    'https://www.ghost.org',
    'https://www.webflow.com',
    'https://www.carrd.co',
    'https://www.framer.com',
    'https://www.vercel.com',
    'https://www.netlify.com',
    'https://www.stripe.com',
    'https://techcrunch.com',
    'https://www.producthunt.com',
    'https://www.ycombinator.com',
];

// ============================================================
// CORE: Analyze a single target
// ============================================================
async function analyzeTarget(url) {
    const result = {
        url,
        robotsFound: false,
        blocksAI: false,
        blockedAgents: [],
        hasStructuredData: false,
        hasAPI: false,
        httpStatus: 0,
        geoScore: 100,
        issues: [],
        isLead: false
    };

    const AI_AGENTS = ['GPTBot', 'ChatGPT-User', 'anthropic-ai', 'Claude-Web', 'CCBot', 'Google-Extended', 'Bytespider', 'PerplexityBot'];

    try {
        // 1. Check robots.txt
        const robotsUrl = new URL('/robots.txt', url).href;
        const robotsRes = await fetch(robotsUrl, {
            signal: AbortSignal.timeout(8000),
            headers: { 'User-Agent': 'Veritas-Hunter-Agent/2.0' }
        });

        if (robotsRes.ok) {
            result.robotsFound = true;
            const robotsTxt = await robotsRes.text();

            for (const agent of AI_AGENTS) {
                if (robotsTxt.toLowerCase().includes(agent.toLowerCase()) &&
                    robotsTxt.toLowerCase().includes('disallow')) {
                    result.blocksAI = true;
                    result.blockedAgents.push(agent);
                }
            }
        }
    } catch (e) {
        // Can't reach robots.txt — that's fine
    }

    try {
        // 2. Check main page
        const mainRes = await fetch(url, {
            signal: AbortSignal.timeout(10000),
            headers: { 'User-Agent': 'Veritas-Hunter-Agent/2.0' }
        });
        result.httpStatus = mainRes.status;

        const html = await mainRes.text();
        result.hasStructuredData = html.includes('application/ld+json') || html.includes('itemscope');
        result.hasAPI = html.includes('/api/') || html.includes('graphql') || html.includes('swagger');

        // Extract Email (basic regex + mailto)
        const mailtoMatch = html.match(/mailto:([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
        if (mailtoMatch) {
            result.email = mailtoMatch[1];
        } else {
            // Fallback: try to guess or find in text
            const emailMatch = html.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
            if (emailMatch) result.email = emailMatch[1];
        }

    } catch (e) {
        result.httpStatus = 0;
    }

    // 3. Calculate GEO score
    if (result.blocksAI) {
        result.geoScore -= 30;
        result.issues.push(`Blocks AI agents: ${result.blockedAgents.join(', ')}`);
    } else if (!result.robotsFound) {
        result.geoScore -= 10;
        result.issues.push('No robots.txt found');
    }

    if (!result.hasStructuredData) {
        result.geoScore -= 25;
        result.issues.push('No structured data (JSON-LD/microdata)');
    }

    if (!result.hasAPI) {
        result.geoScore -= 20;
        result.issues.push('No public API detected');
    }

    // A lead is a site with a low GEO score — they NEED Veritas
    result.isLead = result.geoScore < 80;

    return result;
}

// ============================================================
// SCAN LOOP
// ============================================================
async function runScanRound(targets) {
    console.log(`\n🎯 [HUNTER] Starting scan round — ${targets.length} targets`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);

    let leadsFound = 0;

    for (const url of targets) {
        try {
            const result = await analyzeTarget(url);
            const domain = new URL(url).hostname;

            if (result.isLead) {
                leadsFound++;
                console.log(`   ✅ LEAD: ${domain} — GEO Score: ${result.geoScore}/100`);
                result.issues.forEach(i => console.log(`      └─ ${i}`));

                // Save lead to Supabase
                await supabase.from('agent_ledger').insert([{
                    agent_id: AGENT_ID,
                    action: 'LEAD_FOUND',
                    amount: 0,
                    details: {
                        target: domain,
                        url: url,
                        geo_score: result.geoScore,
                        blocks_ai: result.blocksAI,
                        blocked_agents: result.blockedAgents,
                        has_structured_data: result.hasStructuredData,
                        has_api: result.hasAPI,
                        issues: result.issues,
                        source: 'HUNTER_AGENT_V2'
                    }
                }]);
            } else {
                console.log(`   ⬡  SKIP: ${domain} — GEO Score: ${result.geoScore}/100 (not a lead)`);
            }
        } catch (e) {
            console.log(`   ❌ ERROR: ${url} — ${e.message}`);
        }
    }

    console.log(`\n   📊 Round complete: ${leadsFound}/${targets.length} leads found`);

    // Log scan summary
    await supabase.from('agent_ledger').insert([{
        agent_id: AGENT_ID,
        action: 'SCAN_ROUND_COMPLETED',
        amount: 0,
        details: {
            targets_scanned: targets.length,
            leads_found: leadsFound,
            timestamp: new Date().toISOString(),
            source: 'HUNTER_AGENT_V2'
        }
    }]);

    return leadsFound;
}

// ============================================================
// AUTONOMOUS LOOP
// ============================================================
async function main() {
    // Check system status
    const { data: control } = await supabase
        .from('agent_control')
        .select('status, config')
        .single();

    if (control?.status !== 'running' || !control?.config?.hunter?.enabled) {
        console.log('⚠️  System STOPPED or Hunter DISBALED from the dashboard.');
        console.log('   Checking again in 30 seconds...');
        setTimeout(main, 30_000);
        return;
    }

    console.log('🦞 VERITAS HUNTER AGENT v2.0');
    console.log('   Mode: Autonomous');
    console.log(`   Interval: ${SCAN_INTERVAL_MS / 1000}s`);
    console.log(`   Targets: ${SEED_TARGETS.length}`);

    await runScanRound(SEED_TARGETS);

    // Schedule next round
    console.log(`\n⏰ Next scan in ${SCAN_INTERVAL_MS / 1000} seconds...`);
    setTimeout(main, SCAN_INTERVAL_MS);
}

main().catch(console.error);
