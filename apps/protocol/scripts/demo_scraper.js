/**
 * VERITAS DEMO SCRAPER v1.0
 * 
 * Simulates an AI bot trying to scrape a Gatekeeper-protected website.
 * Used for creating the documented demo/case study.
 * 
 * Usage: node demo_scraper.js <URL>
 * Example: node demo_scraper.js https://dist-fqwea21mj-jesusalis-projects.vercel.app
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const TARGET_URL = process.argv[2] || 'http://localhost:5173';

// Bots to simulate
const BOT_PERSONAS = [
    { name: 'GPTBot (OpenAI)', ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot' },
    { name: 'ClaudeBot (Anthropic)', ua: 'Mozilla/5.0 (compatible; claudebot/1.0; +https://anthropic.com)' },
    { name: 'PerplexityBot', ua: 'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai)' },
    { name: 'CCBot (Common Crawl)', ua: 'CCBot/2.0 (https://commoncrawl.org/faq/)' },
    { name: 'Veritas Test Scraper', ua: 'Veritas-Scraper/1.0 (Test Bot for Demo)' },
];

console.log('\n🤖 VERITAS DEMO SCRAPER v1.0');
console.log('━'.repeat(50));
console.log(`🎯 Target: ${TARGET_URL}`);
console.log(`📡 Simulating ${BOT_PERSONAS.length} AI bot identities`);
console.log('━'.repeat(50));

async function scrapeAsBot(persona) {
    console.log(`\n🔄 [${persona.name}]`);
    console.log(`   User-Agent: ${persona.ua.substring(0, 60)}...`);

    try {
        const startTime = Date.now();
        const response = await fetch(TARGET_URL, {
            headers: {
                'User-Agent': persona.ua,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(15000)
        });

        const elapsed = Date.now() - startTime;
        const body = await response.text();

        console.log(`   Status: ${response.status} (${response.statusText})`);
        console.log(`   Response time: ${elapsed}ms`);
        console.log(`   Body size: ${body.length} bytes`);

        // Check for Veritas Gatekeeper markers
        const hasGatekeeper = body.includes('veritas') || body.includes('Veritas') || body.includes('gatekeeper');
        const hasPaywall = body.includes('402') || body.includes('Payment Required') || body.includes('IDENTITY CHALLENGE');
        const has403 = response.status === 403;
        const has402 = response.status === 402;

        // Check for x402 headers
        const veritasProtocol = response.headers.get('x-veritas-protocol');
        const veritasPrice = response.headers.get('x-veritas-price');

        if (has402 || has403) {
            console.log(`   ⛔ BLOCKED by server (HTTP ${response.status})`);
            if (veritasProtocol) console.log(`   📋 Protocol: ${veritasProtocol}`);
            if (veritasPrice) console.log(`   💰 Price: ${veritasPrice}`);
        } else if (hasPaywall) {
            console.log(`   🔒 GATEKEEPER DETECTED in response body!`);
            console.log(`   📋 Page contains paywall/challenge content`);
        } else if (hasGatekeeper) {
            console.log(`   🛡️  Gatekeeper script present but not triggered (bot check is client-side)`);
            console.log(`   📝 Note: Client-side detection only works in browsers, not fetch requests`);
        } else {
            console.log(`   ✅ ACCESS GRANTED — No protection detected`);
        }

        return {
            bot: persona.name,
            status: response.status,
            blocked: has402 || has403,
            gatekeeperDetected: hasGatekeeper,
            paywallShown: hasPaywall,
            elapsed
        };

    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return { bot: persona.name, error: error.message };
    }
}

// Also check robots.txt
async function checkRobotsTxt() {
    console.log('\n📄 Checking robots.txt...');
    try {
        const robotsUrl = new URL('/robots.txt', TARGET_URL).href;
        const res = await fetch(robotsUrl, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
            const text = await res.text();
            console.log(`   Found robots.txt (${text.length} bytes)`);

            const blocksAI = ['GPTBot', 'ChatGPT-User', 'anthropic-ai', 'CCBot', 'Google-Extended']
                .filter(agent => text.toLowerCase().includes(agent.toLowerCase()));

            if (blocksAI.length > 0) {
                console.log(`   🚫 Blocks AI agents: ${blocksAI.join(', ')}`);
            } else {
                console.log(`   ⚠️  No AI agent restrictions in robots.txt`);
            }
        } else {
            console.log(`   ❌ No robots.txt found (${res.status})`);
        }
    } catch (e) {
        console.log(`   ❌ Error: ${e.message}`);
    }
}

// Check for Veritas meta tags  
async function checkMetaTags() {
    console.log('\n🏷️  Checking for Veritas meta tags...');
    try {
        const res = await fetch(TARGET_URL, { signal: AbortSignal.timeout(10000) });
        const html = await res.text();

        const hasVeritasMeta = html.includes('veritas-protocol') || html.includes('veritas-price');
        const hasGatekeeperScript = html.includes('gatekeeper.js');

        if (hasGatekeeperScript) {
            console.log('   ✅ Gatekeeper script tag found in page!');
            const match = html.match(/gatekeeper\.js[^>]*data-veritas-id="([^"]*)"/);
            if (match) console.log(`   📋 Client ID: ${match[1]}`);
        } else {
            console.log('   ❌ No Gatekeeper script tag found');
        }

        if (hasVeritasMeta) {
            console.log('   ✅ Veritas meta tags found');
        }
    } catch (e) {
        console.log(`   ❌ Error: ${e.message}`);
    }
}

async function main() {
    // Phase 1: Reconnaissance
    console.log('\n═══ PHASE 1: RECONNAISSANCE ═══');
    await checkRobotsTxt();
    await checkMetaTags();

    // Phase 2: Bot Simulation
    console.log('\n═══ PHASE 2: BOT SIMULATION ═══');
    const results = [];
    for (const persona of BOT_PERSONAS) {
        const result = await scrapeAsBot(persona);
        results.push(result);
        // Small delay between requests
        await new Promise(r => setTimeout(r, 1000));
    }

    // Phase 3: Summary Report
    console.log('\n═══ PHASE 3: SUMMARY REPORT ═══');
    console.log('━'.repeat(50));
    console.log(`Target: ${TARGET_URL}`);
    console.log(`Bots tested: ${results.length}`);
    const blocked = results.filter(r => r.blocked).length;
    const gkDetected = results.filter(r => r.gatekeeperDetected).length;
    console.log(`Blocked by server: ${blocked}/${results.length}`);
    console.log(`Gatekeeper in page: ${gkDetected}/${results.length}`);

    if (blocked === 0 && gkDetected === 0) {
        console.log('\n⚠️  VULNERABILITY ASSESSMENT: This site has NO AI protection!');
        console.log('   Recommendation: Install Veritas Gatekeeper');
    } else if (gkDetected > 0 && blocked === 0) {
        console.log('\n🟡 PARTIAL PROTECTION: Client-side only');
        console.log('   Note: gatekeeper.js detects bots via User-Agent in the browser,');
        console.log('   but server-side fetch requests bypass client-side JS.');
        console.log('   For full protection, also use the WordPress plugin or a server-side middleware.');
    } else {
        console.log('\n🟢 FULLY PROTECTED: Server-side blocking active');
    }

    console.log('\n━'.repeat(50));
    console.log('Demo scraper completed. Use this output for documentation.');
}

main().catch(console.error);
