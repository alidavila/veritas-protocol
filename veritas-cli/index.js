#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// --- CONFIG ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Faltan credenciales de Supabase en .env');
    console.error('   Asegúrate de tener SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const args = process.argv.slice(2);
const command = args[0];

// ============================================================
// COMMAND: veritas register --soul ./my-soul.md
// ============================================================
if (command === 'register') {
    const soulFlagIndex = args.indexOf('--soul');
    if (soulFlagIndex === -1 || !args[soulFlagIndex + 1]) {
        console.error('❌ Error: Debes especificar tu archivo de alma: --soul ./ruta/a/soul.md');
        process.exit(1);
    }

    const soulPath = args[soulFlagIndex + 1];
    if (!fs.existsSync(soulPath)) {
        console.error(`❌ Error: No se encuentra el archivo: ${soulPath}`);
        process.exit(1);
    }

    const soulContent = fs.readFileSync(soulPath, 'utf8');
    const soulHash = crypto.createHash('sha256').update(soulContent).digest('hex');

    // Generate DID (Decentralized Identity)
    const did = `did:veritas:${soulHash.substring(0, 16)}`;
    const wallet = `0x${crypto.randomBytes(20).toString('hex')}`;

    // Check if already exists in Supabase
    const { data: existing } = await supabase
        .from('veritas_identities')
        .select('*')
        .eq('did_key', did)
        .single();

    if (existing) {
        console.log(`\n⚠️  Esta alma ya está registrada en Supabase.`);
        console.log(`🆔 DID: ${existing.did_key}`);
        console.log(`📛 Nombre: ${existing.agent_name}`);
        console.log(`📅 Registrado: ${existing.created_at}`);
        process.exit(0);
    }

    // Extract agent name from soul.md (first heading or filename)
    const nameMatch = soulContent.match(/^#\s+(.+)$/m);
    const agentName = nameMatch ? nameMatch[1].trim() : path.basename(soulPath, '.md');

    // Insert into Supabase
    const { data, error } = await supabase
        .from('veritas_identities')
        .insert([{
            agent_name: agentName,
            did_key: did,
            owner_email: 'cli@veritas.protocol',
            spending_limit_usd: 0
        }])
        .select()
        .single();

    if (error) {
        console.error('❌ Error al registrar en Supabase:', error.message);
        process.exit(1);
    }

    // Also log the registration event in the agent_ledger
    await supabase.from('agent_ledger').insert([{
        agent_id: did,
        action: 'IDENTITY_REGISTERED',
        amount: 0,
        details: {
            agent_name: agentName,
            soul_hash: soulHash.substring(0, 12),
            wallet: wallet,
            source: 'CLI'
        }
    }]);

    console.log(`\n✅ IDENTIDAD VERITAS REGISTRADA EN SUPABASE`);
    console.log(`----------------------------------------`);
    console.log(`📄 Alma Verificada: ${path.basename(soulPath)}`);
    console.log(`🔒 Hash del Alma: ${soulHash.substring(0, 12)}...`);
    console.log(`🆔 TU DID: \x1b[32m${did}\x1b[0m`);
    console.log(`💰 TU WALLET: \x1b[36m${wallet}\x1b[0m`);
    console.log(`📊 Dashboard: Visible en tu panel web en tiempo real`);
    console.log(`----------------------------------------`);
    console.log(`👉 Usa este DID para pasar por los Porteros Veritas.`);

// ============================================================
// COMMAND: veritas audit <url>
// ============================================================
} else if (command === 'audit') {
    const url = args[1];
    if (!url) {
        console.error('❌ Error: Falta la URL. Uso: veritas audit <url>');
        process.exit(1);
    }

    console.log(`\n🕵️  VERITAS GHOST AUDITOR v2.0`);
    console.log(`🎯 Objetivo: ${url}`);
    console.log(`⏳ Escaneando legibilidad para agentes (GEO)...\n`);

    // REAL AUDIT: Fetch robots.txt
    let robotsTxt = null;
    let robotsBlocking = false;
    let hasStructuredData = false;
    let hasApiEndpoint = false;
    let httpStatus = 0;
    let securityHeaders = {};

    try {
        // 1. Check robots.txt
        const robotsUrl = new URL('/robots.txt', url).href;
        const robotsRes = await fetch(robotsUrl);
        if (robotsRes.ok) {
            robotsTxt = await robotsRes.text();
            const blockingAgents = ['GPTBot', 'ChatGPT-User', 'anthropic-ai', 'Claude-Web', 'CCBot', 'Google-Extended'];
            robotsBlocking = blockingAgents.some(agent =>
                robotsTxt.toLowerCase().includes(agent.toLowerCase()) &&
                robotsTxt.toLowerCase().includes('disallow')
            );
        }
    } catch (e) {
        robotsTxt = null;
    }

    try {
        // 2. Check main page
        const mainRes = await fetch(url, {
            headers: { 'User-Agent': 'Veritas-Ghost-Auditor/2.0' }
        });
        httpStatus = mainRes.status;

        // Check security headers
        securityHeaders = {
            csp: mainRes.headers.get('content-security-policy') ? true : false,
            xframe: mainRes.headers.get('x-frame-options') ? true : false,
            hsts: mainRes.headers.get('strict-transport-security') ? true : false,
        };

        const html = await mainRes.text();

        // 3. Check for structured data (JSON-LD, microdata)
        hasStructuredData = html.includes('application/ld+json') || html.includes('itemscope');

        // 4. Check for API endpoint indicators
        hasApiEndpoint = html.includes('/api/') || html.includes('graphql') || html.includes('swagger');

    } catch (e) {
        console.error(`   ⚠️ No se pudo conectar a ${url}: ${e.message}`);
    }

    // Calculate GEO score
    let geoScore = 100;
    const issues = [];

    if (robotsBlocking) {
        geoScore -= 30;
        issues.push('❌ Robots.txt: Bloquea agentes de IA (GPTBot/Claude)');
    } else if (robotsTxt) {
        issues.push('✅ Robots.txt: No bloquea agentes de IA');
    } else {
        geoScore -= 10;
        issues.push('⚠️  Robots.txt: No encontrado');
    }

    if (!hasStructuredData) {
        geoScore -= 25;
        issues.push('❌ Datos Estructurados (JSON-LD): No encontrados');
    } else {
        issues.push('✅ Datos Estructurados: Detectados');
    }

    if (!hasApiEndpoint) {
        geoScore -= 20;
        issues.push('❌ API Pública: No detectada');
    } else {
        issues.push('✅ API Pública: Indicadores encontrados');
    }

    if (!securityHeaders.csp) {
        geoScore -= 5;
        issues.push('⚠️  Content-Security-Policy: Ausente');
    }

    const riskLevel = geoScore >= 80 ? 'BAJO' : geoScore >= 50 ? 'MEDIO' : 'ALTO';

    // Print Report
    console.log(`📊 REPORTE DE AUDITORÍA GEO`);
    console.log(`================================`);
    issues.forEach(i => console.log(`   ${i}`));
    console.log(`================================`);
    console.log(`📈 Score GEO: ${geoScore}/100`);
    console.log(`⚠️  Riesgo de Invisibilidad para IAs: ${riskLevel}`);

    if (geoScore < 80) {
        console.log(`\n💡 OPORTUNIDAD: Este sitio pierde tráfico de agentes.`);
        console.log(`👉 Solución: Instalar Veritas Gatekeeper.`);
    } else {
        console.log(`\n✅ Este sitio está bien optimizado para agentes de IA.`);
    }

    // Log audit to Supabase
    const { error: auditError } = await supabase.from('agent_ledger').insert([{
        agent_id: 'did:veritas:ghost:cli',
        action: 'GEO_AUDIT_COMPLETED',
        amount: 0,
        details: {
            target: url,
            geo_score: geoScore,
            risk_level: riskLevel,
            robots_blocking: robotsBlocking,
            has_structured_data: hasStructuredData,
            has_api: hasApiEndpoint,
            http_status: httpStatus,
            source: 'CLI'
        }
    }]);

    if (auditError) {
        console.error('\n⚠️  No se pudo guardar en Supabase:', auditError.message);
    } else {
        console.log(`\n📊 Auditoría guardada en Supabase → Visible en tu Dashboard`);
    }

// ============================================================
// COMMAND: veritas gatekeeper --price 0.002
// ============================================================
} else if (command === 'gatekeeper') {
    const priceFlagIndex = args.indexOf('--price');
    const price = priceFlagIndex !== -1 && args[priceFlagIndex + 1]
        ? args[priceFlagIndex + 1]
        : '0.002';

    const walletFlagIndex = args.indexOf('--wallet');
    const wallet = walletFlagIndex !== -1 && args[walletFlagIndex + 1]
        ? args[walletFlagIndex + 1]
        : '0x4d2B70d358C5DA9c4fC6e8Ce743Ed67d55C19099';

    console.log(`\n🛡️  GENERANDO CÓDIGO DE PORTERO (GATEKEEPER) v2.0\n`);

    // Generate a real, functional inline script instead of referencing a non-existent CDN
    const code = `<!-- VERITAS GATEKEEPER v2.0 -->
<!-- Pega esto en el <head> de tu sitio -->
<script>
(function() {
  var VERITAS_CONFIG = {
    price: ${price},
    wallet: "${wallet}",
    gatewayUrl: "https://your-veritas-gateway.vercel.app/api/verify"
  };

  // Detect AI User-Agents
  var aiAgents = ['GPTBot','ChatGPT-User','anthropic-ai','Claude-Web','CCBot',
                  'Google-Extended','Bytespider','PerplexityBot'];
  var ua = navigator.userAgent || '';
  var isAI = aiAgents.some(function(a) { return ua.indexOf(a) !== -1; });

  if (isAI) {
    // Block content and show paywall
    document.addEventListener('DOMContentLoaded', function() {
      document.body.innerHTML = '<div style="padding:40px;font-family:monospace;text-align:center">'
        + '<h1>🛡️ Veritas Gatekeeper</h1>'
        + '<p>Access requires payment: ' + VERITAS_CONFIG.price + ' USD</p>'
        + '<p>Pay to wallet: <code>' + VERITAS_CONFIG.wallet + '</code></p>'
        + '<p>Protocol: x402 | Network: Base</p>'
        + '</div>';
    });
  }
})();
</script>`;

    console.log(code);
    console.log(`\n✅ Copia y pega esto en el <head> de tu sitio web.`);
    console.log(`💰 Precio por acceso: $${price} USD`);
    console.log(`🏦 Wallet receptora: ${wallet}`);

// ============================================================
// COMMAND: veritas status
// ============================================================
} else if (command === 'status') {
    console.log(`\n📊 VERITAS PROTOCOL - ESTADO DEL SISTEMA\n`);

    // Fetch identities count
    const { count: identityCount } = await supabase
        .from('veritas_identities')
        .select('*', { count: 'exact', head: true });

    // Fetch recent ledger activity
    const { data: recentLogs, error } = await supabase
        .from('agent_ledger')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    // Fetch system control status
    const { data: control } = await supabase
        .from('agent_control')
        .select('status')
        .single();

    if (error) {
        console.error('❌ Error leyendo Supabase:', error.message);
        process.exit(1);
    }

    // Count by action type
    const leads = recentLogs?.filter(l => l.action === 'LEAD_FOUND').length || 0;
    const payments = recentLogs?.filter(l => l.action === 'PAYMENT_ACCEPTED').length || 0;
    const alerts = recentLogs?.filter(l => l.action === 'ALERT_TRIGGERED').length || 0;
    const audits = recentLogs?.filter(l => l.action === 'GEO_AUDIT_COMPLETED').length || 0;

    console.log(`   🟢 Sistema: ${control?.status === 'running' ? 'OPERATIVO' : 'DETENIDO'}`);
    console.log(`   🆔 Identidades registradas: ${identityCount || 0}`);
    console.log(`   📋 Últimos 10 eventos:`);
    console.log(`      🎯 Leads encontrados: ${leads}`);
    console.log(`      💰 Pagos procesados: ${payments}`);
    console.log(`      🚨 Alertas: ${alerts}`);
    console.log(`      🕵️  Auditorías GEO: ${audits}`);
    console.log(`\n   📅 Últimos eventos:`);

    recentLogs?.slice(0, 5).forEach(log => {
        const time = new Date(log.created_at).toLocaleString();
        const agent = log.agent_id.split(':')[2]?.toUpperCase() || log.agent_id;
        console.log(`      [${time}] ${agent}: ${log.action} ${log.details?.target || ''}`);
    });

// ============================================================
// HELP
// ============================================================
} else {
    console.log(`
🦞 VERITAS CLI v2.0 - Infraestructura de Identidad para Agentes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Comandos:
  veritas register --soul <archivo>   → Registra identidad en Supabase
  veritas audit <url>                 → Auditoría GEO real de un sitio web
  veritas gatekeeper [--price 0.002]  → Genera código del portero
  veritas status                      → Estado del sistema desde Supabase

Opciones de gatekeeper:
  --price <amount>    Precio por acceso (default: 0.002)
  --wallet <address>  Wallet receptora (default: treasury)

Conexión: Supabase ✅ | Network: Base Sepolia
    `);
}
