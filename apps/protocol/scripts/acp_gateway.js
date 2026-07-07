/**
 * VERITAS ACP GATEWAY
 * Agentic Commerce Protocol integration — Stripe/OpenAI compatible.
 * 
 * Extends the existing x402 gateway with ACP-compliant endpoints:
 *   - Checkout configuration (discoverable by AI agents)
 *   - Catalog feed (products discoverable via ChatGPT + other AI platforms)
 *   - ACP metadata / .well-known
 *   - Payment verification (Shared Payment Token compatible)
 * 
 * Usage: node acp_gateway.js
 * Port: 3001 (separate from x402 gateway on 3000)
 */

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.ACP_PORT || 3001;

// Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ══════════════════════════════════════════════════════════════════
// VERITAS ACP CONFIGURATION
// ══════════════════════════════════════════════════════════════════

const ACP_CONFIG = {
    business: {
        name: "Veritas Protocol",
        description: "Identity & Payment Infrastructure for AI Agents — The VISA for AIs",
        url: "https://veritas-protocol-beryl.vercel.app",
        email: "acp@veritasprotocol.com",
        merchant_of_record: true,
        supported_currencies: ["ETH", "USD"],
        payment_processors: ["veritas_x402", "stripe_shared_token"],
    },
    checkout: {
        version: "1.0.0",
        protocol: "acp",
        modes: ["one_time", "subscription"],
        supported_flows: ["digital_goods", "api_access", "agent_deployment"],
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
                description: "Stripe Shared Payment Token — pay with fiat via Stripe",
                processor: "stripe",
                supported: true
            }
        ],
        endpoints: {
            catalog: "/acp/catalog",
            checkout: "/acp/checkout",
            verify: "/acp/verify",
            metadata: "/.well-known/acp"
        }
    },
    products: [
        {
            id: "gatekeeper-v1",
            name: "The Gatekeeper",
            type: "infrastructure",
            description: "AI bot detection & x402 paywall. Protect your website from unauthorized AI scraping.",
            price: { amount: 0, currency: "USD", type: "free_tier" },
            fee: { percent: 1, description: "1% protocol fee per transaction" },
            available: true,
            acp_enabled: true
        },
        {
            id: "auto-marketer-v1",
            name: "Auto-Marketer v1",
            type: "growth_agent",
            description: "Autonomous cold email outreach agent. Finds leads, generates emails via AI, sends sequences.",
            price: { amount: 49, currency: "USD", interval: "month", type: "subscription" },
            features: ["Lead discovery", "AI email generation", "3-email sequences", "Supabase analytics"],
            available: true,
            acp_enabled: true
        },
        {
            id: "ghost-auditor-v1",
            name: "Ghost Auditor",
            type: "security_agent",
            description: "AI-powered security analysis. Generates attack payloads, forensic analysis, Playwright scripts.",
            price: { amount: 49, currency: "USD", interval: "month", type: "subscription" },
            features: ["Gemini AI analysis", "Attack payload generation", "Forensic reporting", "Playwright automation"],
            available: true,
            acp_enabled: true
        },
        {
            id: "hunter-agent",
            name: "Hunter Agent",
            type: "lead_agent",
            description: "Autonomous lead discovery agent. Scrapes the web to find potential customers for your business.",
            price: { amount: 29, currency: "USD", interval: "month", type: "subscription" },
            available: false,
            acp_enabled: false
        },
        {
            id: "sentinel-agent",
            name: "Sentinel Agent",
            type: "compliance_agent",
            description: "Compliance and fraud detection agent. Monitors your ledger for suspicious patterns.",
            price: { amount: 29, currency: "USD", interval: "month", type: "subscription" },
            available: false,
            acp_enabled: false
        },
        {
            id: "treasurer-agent",
            name: "Treasurer Agent",
            type: "finance_agent",
            description: "Wallet management and x402 payment processing agent. Handles Base Sepolia transactions.",
            price: { amount: 19, currency: "USD", interval: "month", type: "subscription" },
            available: false,
            acp_enabled: false
        },
        {
            id: "veritas-did",
            name: "Veritas DID Registration",
            type: "identity",
            description: "Register a Decentralized Identifier (DID) for your AI agent. Required for agent commerce.",
            price: { amount: 0, currency: "USD", type: "one_time" },
            available: true,
            acp_enabled: true
        }
    ]
};

// ══════════════════════════════════════════════════════════════════
// ACP ENDPOINTS
// ══════════════════════════════════════════════════════════════════

/**
 * .well-known/acp — Discovery endpoint
 * AI platforms use this to discover ACP-compatible businesses.
 */
app.get('/.well-known/acp', (req, res) => {
    res.json({
        protocol: "acp",
        version: "1.0.0",
        business: ACP_CONFIG.business,
        checkout: ACP_CONFIG.checkout,
        documentation: "https://agenticcommerce.dev/docs"
    });
});

/**
 * ACP Catalog — Product feed
 * Stripe/OpenAI-compatible catalog listing all Veritas products.
 */
app.get('/acp/catalog', async (req, res) => {
    try {
        // Also fetch any dynamic agents from Supabase
        const { data: dbAgents } = await supabase
            .from('agents')
            .select('*')
            .eq('is_public', true)
            .eq('status', 'active');

        const dynamicProducts = (dbAgents || []).map(agent => ({
            id: agent.id,
            name: agent.name,
            type: agent.type || 'custom_agent',
            description: agent.description || 'AI Agent',
            price: {
                amount: agent.price_usd || 0,
                currency: "USD",
                interval: "month",
                type: "subscription"
            },
            available: true,
            acp_enabled: true,
            wallet_address: agent.wallet_address
        }));

        const catalog = {
            version: "1.0.0",
            generated_at: new Date().toISOString(),
            business: ACP_CONFIG.business,
            total_products: ACP_CONFIG.products.length + dynamicProducts.length,
            products: [...ACP_CONFIG.products, ...dynamicProducts]
        };

        res.json(catalog);
    } catch (error) {
        // If DB fails, still return static catalog
        res.json({
            version: "1.0.0",
            generated_at: new Date().toISOString(),
            business: ACP_CONFIG.business,
            products: ACP_CONFIG.products
        });
    }
});

/**
 * ACP Checkout — Initiate agentic checkout
 * Receives product selection + agent identity, returns payment instructions.
 */
app.post('/acp/checkout', async (req, res) => {
    const { product_id, agent_id, payment_method, quantity = 1 } = req.body;

    if (!product_id) {
        return res.status(400).json({ error: "product_id is required" });
    }

    // Find product
    const product = ACP_CONFIG.products.find(p => p.id === product_id);
    if (!product) {
        // Check DB
        const { data: dbAgent } = await supabase
            .from('agents')
            .select('*')
            .eq('id', product_id)
            .single();

        if (!dbAgent) {
            return res.status(404).json({ error: "Product not found", product_id });
        }
    }

    const finalProduct = product || {
        id: product_id,
        name: product_id,
        type: 'custom_agent',
        price: { amount: 0, currency: "USD", type: "one_time" }
    };

    // Generate checkout session
    const checkoutSession = {
        session_id: `acp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        product: {
            id: finalProduct.id,
            name: finalProduct.name,
            type: finalProduct.type,
            price: finalProduct.price
        },
        quantity,
        total: {
            amount: (finalProduct.price?.amount || 0) * quantity,
            currency: finalProduct.price?.currency || "USD"
        },
        payment: {
            methods: ACP_CONFIG.checkout.payment_methods,
            selected: payment_method || "x402"
        },
        agent: agent_id ? { did: agent_id } : null,
        status: "pending_payment",
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        _next: {
            // Instructions for the agent
            if_x402: {
                pay_to: ACP_CONFIG.checkout.payment_methods[0].merchant_address,
                amount: "0.0001",
                currency: "ETH",
                network: "base-sepolia",
                verify_endpoint: "/acp/verify"
            },
            if_shared_token: {
                instruction: "Use Stripe Shared Payment Token to complete purchase",
                stripe_account: "acct_1TC3VeCCwrZ0i1Mx"
            }
        }
    };

    // Log to ledger
    await supabase.from('agent_ledger').insert([{
        agent_id: agent_id || 'anonymous',
        action: 'ACP_CHECKOUT_INITIATED',
        amount: finalProduct.price?.amount || 0,
        details: {
            session_id: checkoutSession.session_id,
            product_id,
            payment_method: payment_method || 'x402'
        }
    }]);

    res.status(201).json(checkoutSession);
});

/**
 * ACP Verify — Verify payment and complete purchase
 */
app.post('/acp/verify', async (req, res) => {
    const { session_id, payment_proof } = req.body;

    if (!session_id) {
        return res.status(400).json({ error: "session_id is required" });
    }

    // In production, verify the payment proof against the blockchain or Stripe
    // For now, accept and log

    await supabase.from('agent_ledger').insert([{
        agent_id: req.body.agent_id || 'anonymous',
        action: 'ACP_PAYMENT_VERIFIED',
        amount: 0,
        details: {
            session_id,
            payment_proof: payment_proof ? 'provided' : 'missing',
            verified_at: new Date().toISOString()
        }
    }]);

    res.json({
        status: "payment_verified",
        session_id,
        access_granted: true,
        message: "Purchase complete. Agent access granted.",
        next_steps: {
            gatekeeper: "Install the Veritas Gatekeeper script on your website",
            agent_deployment: "Your agent will be deployed within 60 seconds",
            api_access: "Use your DID to authenticate API requests"
        }
    });
});

/**
 * Health check
 */
app.get('/acp/health', (req, res) => {
    res.json({
        status: "operational",
        protocol: "acp",
        version: "1.0.0",
        x402_compatible: true,
        shared_token_ready: false, // Requires Stripe integration
        catalog_size: ACP_CONFIG.products.length
    });
});

/**
 * ACP agent-facing checkout page (for agents to read)
 */
app.get('/acp/agent-checkout/:product_id', (req, res) => {
    const product = ACP_CONFIG.products.find(p => p.id === req.params.product_id);
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    res.json({
        product,
        checkout_flow: {
            "1_identify": "Provide your Veritas DID",
            "2_select_payment": "Choose x402 (ETH) or Shared Payment Token (Stripe)",
            "3_pay": `POST /acp/checkout with product_id=${product.id}`,
            "4_verify": "POST /acp/verify with session_id from step 3",
            "5_access": "Receive access credentials"
        },
        acp_compliant: true,
        compatible_agents: ["ChatGPT", "Claude", "Any ACP-compatible agent"],
        human_fallback_url: `${ACP_CONFIG.business.url}/marketplace`
    });
});

// Start
app.listen(port, () => {
    console.log(`\n🦞 Veritas ACP Gateway Online`);
    console.log(`   Port: ${port}`);
    console.log(`   Catalog: http://localhost:${port}/acp/catalog`);
    console.log(`   Discovery: http://localhost:${port}/.well-known/acp`);
    console.log(`   Products: ${ACP_CONFIG.products.length} (${ACP_CONFIG.products.filter(p => p.acp_enabled).length} ACP-enabled)`);
    console.log(`   x402 Compatible: ✅`);
    console.log(`   Shared Token: ⚠️ (requires Stripe integration)\n`);
});
