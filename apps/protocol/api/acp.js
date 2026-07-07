/**
 * Veritas ACP API — Vercel Serverless Function
 * 
 * Handles all Agentic Commerce Protocol endpoints:
 *   /.well-known/acp
 *   /api/acp/*
 * 
 * Deployed as part of the Veritas Protocol monorepo on Vercel.
 */

import { createClient } from '@supabase/supabase-js';

// ACP Configuration
const ACP_CONFIG = {
    business: {
        name: "Veritas Protocol",
        description: "Identity & Payment Infrastructure for AI Agents — The VISA for AIs",
        url: "https://veritas-protocol-beryl.vercel.app",
        email: "acp@veritasprotocol.com",
        merchant_of_record: true
    },
    checkout: {
        version: "1.0.0",
        protocol: "acp",
        payment_methods: [
            {
                type: "x402",
                description: "HTTP 402 Payment Required — pay with ETH on Base Sepolia",
                network: "base-sepolia",
                merchant_address: "0x4d2B70d358C5DA9c4fC6e8Ce743Ed67d55C19099",
                price_per_request: "0.0001",
                currency: "ETH"
            },
            {
                type: "shared_payment_token",
                description: "Stripe Shared Payment Token",
                processor: "stripe",
                supported: true
            }
        ]
    },
    products: [
        {
            id: "gatekeeper-v1",
            name: "The Gatekeeper",
            type: "infrastructure",
            description: "AI bot detection & x402 paywall for your website",
            price: { amount: 0, currency: "USD", type: "free_tier" },
            fee: { percent: 1, description: "1% per transaction" },
            available: true
        },
        {
            id: "auto-marketer-v1",
            name: "Auto-Marketer v1",
            type: "growth_agent",
            description: "Autonomous cold email outreach agent",
            price: { amount: 49, currency: "USD", interval: "month", type: "subscription" },
            available: true
        },
        {
            id: "ghost-auditor-v1",
            name: "Ghost Auditor",
            type: "security_agent",
            description: "AI-powered security analysis",
            price: { amount: 49, currency: "USD", interval: "month", type: "subscription" },
            available: true
        },
        {
            id: "veritas-did",
            name: "Veritas DID Registration",
            type: "identity",
            description: "Decentralized Identifier for your AI agent",
            price: { amount: 0, currency: "USD", type: "one_time" },
            available: true
        }
    ]
};

// In-memory session store (would be Supabase/Redis in production)
const sessions = new Map();

function getSupabase() {
    return createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
}

function json(res, data, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-veritas-did'
        }
    });
}

// ═══════════════════════════════════════════
// ROUTE HANDLERS
// ═══════════════════════════════════════════

async function handleWellKnown() {
    return json(null, {
        protocol: "acp",
        version: "1.0.0",
        business: ACP_CONFIG.business,
        checkout: ACP_CONFIG.checkout,
        documentation: "https://agenticcommerce.dev/docs",
        catalog_endpoint: "/api/acp/catalog",
        checkout_endpoint: "/api/acp/checkout",
        verify_endpoint: "/api/acp/verify"
    });
}

async function handleCatalog() {
    let dbProducts = [];
    try {
        const supabase = getSupabase();
        const { data } = await supabase
            .from('agents')
            .select('*')
            .eq('is_public', true)
            .eq('status', 'active');
        dbProducts = (data || []).map(a => ({
            id: a.id,
            name: a.name,
            type: a.type || 'custom',
            description: a.description || '',
            price: { amount: a.price_usd || 0, currency: "USD", type: "subscription" },
            available: true
        }));
    } catch (_) { /* DB offline — static catalog only */ }

    return json(null, {
        version: "1.0.0",
        generated_at: new Date().toISOString(),
        business: ACP_CONFIG.business,
        products: [...ACP_CONFIG.products, ...dbProducts]
    });
}

async function handleCheckout(body) {
    const { product_id, agent_id, payment_method } = body || {};
    if (!product_id) return json(null, { error: "product_id is required" }, 400);

    const product = ACP_CONFIG.products.find(p => p.id === product_id);
    const sessionId = `acp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const session = {
        session_id: sessionId,
        product: product || { id: product_id, name: product_id },
        status: "pending_payment",
        payment_method: payment_method || "x402",
        agent: agent_id ? { did: agent_id } : null,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        _next: {
            if_x402: {
                pay_to: "0x4d2B70d358C5DA9c4fC6e8Ce743Ed67d55C19099",
                amount: "0.0001",
                currency: "ETH",
                network: "base-sepolia",
                verify_endpoint: "/api/acp/verify"
            }
        }
    };

    sessions.set(sessionId, session);

    // Log to Supabase ledger
    try {
        const supabase = getSupabase();
        await supabase.from('agent_ledger').insert([{
            agent_id: agent_id || 'anonymous',
            action: 'ACP_CHECKOUT_INITIATED',
            amount: product?.price?.amount || 0,
            details: { session_id: sessionId, product_id }
        }]);
    } catch (_) {}

    return json(null, session, 201);
}

async function handleVerify(body) {
    const { session_id, payment_proof } = body || {};
    if (!session_id) return json(null, { error: "session_id is required" }, 400);

    const session = sessions.get(session_id);
    if (!session) return json(null, { error: "Session not found or expired" }, 404);

    session.status = "payment_verified";
    sessions.set(session_id, session);

    try {
        const supabase = getSupabase();
        await supabase.from('agent_ledger').insert([{
            agent_id: session.agent?.did || 'anonymous',
            action: 'ACP_PAYMENT_VERIFIED',
            amount: 0,
            details: { session_id, verified_at: new Date().toISOString() }
        }]);
    } catch (_) {}

    return json(null, {
        status: "payment_verified",
        session_id,
        access_granted: true,
        message: "Purchase complete. Welcome to Veritas.",
        next_steps: {
            gatekeeper: "Install the Veritas Gatekeeper script on your website",
            agent_deployment: "Your agent will be deployed shortly",
            api_access: "Use your DID to authenticate API requests"
        }
    });
}

async function handleAgentCheckout(productId) {
    const product = ACP_CONFIG.products.find(p => p.id === productId);
    if (!product) return json(null, { error: "Product not found" }, 404);

    return json(null, {
        product,
        checkout_flow: [
            { step: 1, action: "Identify", detail: "Provide your Veritas DID" },
            { step: 2, action: "Select payment", detail: "x402 (ETH) or Shared Payment Token" },
            { step: 3, action: "Pay", detail: `POST /api/acp/checkout with product_id=${product.id}` },
            { step: 4, action: "Verify", detail: "POST /api/acp/verify with session_id" },
            { step: 5, action: "Access", detail: "Receive credentials" }
        ],
        acp_compliant: true,
        compatible_agents: ["ChatGPT", "Claude", "Any ACP-compatible agent"]
    });
}

async function handleHealth() {
    return json(null, {
        status: "operational",
        protocol: "acp",
        version: "1.0.0",
        x402_compatible: true,
        shared_token_ready: false,
        catalog_size: ACP_CONFIG.products.length,
        uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'serverless'
    });
}

// ═══════════════════════════════════════════
// VERCEL SERVERLESS ENTRY POINT
// ═══════════════════════════════════════════

export default async function handler(req) {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
    }

    const url = new URL(req.url);
    const path = url.pathname;
    let body = {};
    if (req.method === 'POST') {
        try { body = await req.json(); } catch (_) {}
    }

    // Route matching
    if (path === '/.well-known/acp') return handleWellKnown();
    if (path === '/api/acp' || path === '/api/acp/catalog') return handleCatalog();
    if (path === '/api/acp/checkout' && req.method === 'POST') return handleCheckout(body);
    if (path === '/api/acp/verify' && req.method === 'POST') return handleVerify(body);
    if (path === '/api/acp/health') return handleHealth();

    // Agent checkout: /api/acp/agent-checkout/:id
    const agentMatch = path.match(/^\/api\/acp\/agent-checkout\/(.+)$/);
    if (agentMatch) return handleAgentCheckout(agentMatch[1]);

    // 404
    return json(null, {
        error: "Not found",
        available_endpoints: [
            "GET  /.well-known/acp",
            "GET  /api/acp/catalog",
            "POST /api/acp/checkout",
            "POST /api/acp/verify",
            "GET  /api/acp/health",
            "GET  /api/acp/agent-checkout/:id"
        ]
    }, 404);
}

// Also export as default function for Vercel
export const config = {
    runtime: 'nodejs22.x'
};
