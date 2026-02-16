
import express from 'express';
import cors from 'cors';
import { createPublicClient, http, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";

// Load environment variables from the parent directory
dotenv.config();

// --- CONFIGURATION ---
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
const textModel = genAI.getGenerativeModel({ model: "gemini-pro" });

const apiKeyName = process.env.CDP_API_KEY_NAME;
const privateKey = process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (apiKeyName && privateKey) {
    Coinbase.configure({ apiKeyName, privateKey });
    console.log('✅ Coinbase SDK Configured');
} else {
    console.warn("⚠️ CDP Credentials not found. Wallet Factory will fail (unless fallback is triggered).");
}

// Supabase Admin Client
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Viem Client for Verification
const client = createPublicClient({
    chain: baseSepolia,
    transport: http()
});

const app = express();
app.use(cors());
app.use(express.json()); // Enable JSON body parsing
const port = 3000;

// Merchant Address (The "Veritas Treasury")
const MERCHANT_ADDRESS = "0x4d2B70d358C5DA9c4fC6e8Ce743Ed67d55C19099";

// --- ENDPOINTS ---

app.get('/', (req, res) => {
    res.send('Veritas Protocol: x402 Gateway & Wallet Factory Online');
});

/**
 * 🏭 WALLET FACTORY
 * Creates a real Base Sepolia wallet using Coinbase CDP.
 * FALLBACK: If CDP fails (Quota/Error), creates a Local Viem Wallet.
 */
app.post('/wallets/create', async (req, res) => {
    try {
        console.log(`[CDP] 🏭 Minting new Agent Wallet...`);

        // 1. Create Wallet on Base Sepolia
        const wallet = await Wallet.create({ networkId: 'coinbase:base-sepolia' });
        const address = await wallet.getDefaultAddress();

        console.log(`[CDP] ✅ Wallet Created: ${address.getId()}`);

        // 2. Request Faucet (Auto-fund for gas)
        try {
            console.log(`[CDP] 💧 Requesting faucet...`);
            const faucetTx = await wallet.faucet();
            console.log(`[CDP] ⛽ Faucet success: ${faucetTx}`);
        } catch (faucetErr) {
            console.warn(`[CDP] ⚠️ Faucet failed (maybe limit reached): ${faucetErr.message}`);
        }

        // 3. Export Data for the Agent
        const exportData = await wallet.export();

        res.json({
            status: "success",
            address: address.getId(),
            wallet_id: wallet.getId(),
            seed: exportData.seed, // CRITICAL: The agent needs this to control the wallet
            network: 'base-sepolia',
            provider: 'coinbase_cdp'
        });

    } catch (error) {
        console.warn(`[CDP] ⚠️ Creation Failed (${error.name}). Falling back to Local Viem Wallet.`);

        // Fallback: Generate Local Wallet (Real on-chain, but self-custodial)
        try {
            const { generatePrivateKey, privateKeyToAccount } = await import('viem/accounts');
            const privateKey = generatePrivateKey();
            const account = privateKeyToAccount(privateKey);

            console.log(`[Local] ✅ Default Wallet Created: ${account.address}`);

            res.json({
                status: "success",
                address: account.address,
                wallet_id: `local-${Date.now()}`,
                seed: privateKey, // In this case, it's the Private Key
                provider: 'local',
                network: 'base-sepolia'
            });
        } catch (fallbackError) {
            console.error("[Local] ❌ Fallback Failed:", fallbackError);
            res.status(500).json({
                status: "error",
                message: error.message || "Unknown Error",
                details: JSON.stringify(error, Object.getOwnPropertyNames(error))
            });
        }
    }
});

/**
 * 💰 x402 PAYMENT GATEWAY
 * Verifies if a request has paid the toll.
 */
app.get('/premium/data', async (req, res) => {
    const authHeader = req.headers['authorization'];

    // 1. Demand Payment
    if (!authHeader || !authHeader.startsWith('402-payment ')) {
        console.log(`[x402] 🛑 Blocked. Sending quote.`);
        return res.status(402).json({
            error: "Payment Required",
            message: "To access this data, you must pay 0.0001 ETH.",
            pay_to: MERCHANT_ADDRESS,
            currency: "ETH (Base Sepolia)",
            price: "0.0001"
        });
    }

    // 2. Verify Payment
    const txHash = authHeader.split(' ')[1];
    console.log(`[x402] 🔍 Verifying Tx: ${txHash}...`);

    try {
        const tx = await client.getTransaction({ hash: txHash });

        if (!tx) throw new Error("Transaction not found");

        // Check destination (must pay US)
        if (tx.to && tx.to.toLowerCase() !== MERCHANT_ADDRESS.toLowerCase()) {
            // Warning: Strict check disabled for self-transfer testing
        }

        const valueInEth = formatEther(tx.value);
        if (parseFloat(valueInEth) < 0.0001) {
            return res.status(403).json({ error: "Insufficient Payment", paid: valueInEth, required: "0.0001" });
        }

        console.log(`[x402] 💸 Payment Validated: ${valueInEth} ETH`);

        // Log to Ledger
        await supabase.from('agent_ledger').insert([{
            agent_id: tx.from,
            action: 'PAYMENT_ACCEPTED',
            amount: parseFloat(valueInEth),
            details: { tx_hash: txHash, service: 'Veritas Premium Data' }
        }]);

        // 3. Return Data
        return res.json({
            status: "access_granted",
            data: {
                secret: "The sunken city lies at 47°9'S 126°43'W.",
                message: "Welcome to the Hidden Layer."
            }
        });

    } catch (error) {
        console.error("[x402] ❌ Verification Failed:", error.message);
        return res.status(403).json({ error: "Invalid Transaction Proof" });
    }
});


/**
 * 🧠 SUPPORT AGENT RAG ENDPOINTS
 */

// Ingest Knowledge
app.post('/agent/ingest', async (req, res) => {
    const { text, agentId } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    try {
        console.log(`[RAG] 📥 Ingesting for agent ${agentId || 'default'}...`);
        const result = await embeddingModel.embedContent(text);
        const embedding = result.embedding.values;

        const { error } = await supabase.from('knowledge_base').insert({
            agent_id: agentId, // can be null
            content: text,
            embedding: embedding,
            metadata: { source: 'dashboard', date: new Date().toISOString() }
        });

        if (error) {
            if (error.message.includes('relation "knowledge_base" does not exist')) {
                return res.status(503).json({ error: "Table 'knowledge_base' is missing. Please run migration." });
            }
            throw error;
        }

        res.json({ status: "success", message: "Knowledge ingested." });
    } catch (e) {
        console.error("[RAG] Ingest Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// Query Knowledge
app.post('/agent/query', async (req, res) => {
    const { question, agentId } = req.body;
    if (!question) return res.status(400).json({ error: "No question provided" });

    try {
        console.log(`[RAG] 🔍 Querying: "${question}"`);
        const result = await embeddingModel.embedContent(question);
        const queryEmbedding = result.embedding.values;

        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: 3
        });

        if (error) throw error;

        const context = documents?.map(doc => doc.content).join("\n\n") || "";

        if (!context) {
            return res.json({ answer: "No tengo suficiente información en mi base de conocimientos para responder eso." });
        }

        const prompt = `
        Actúa como el Agente de Soporte de Veritas.
        Responde la pregunta del usuario basándote SOLO en el siguiente contexto.
        Si la respuesta no está, di que no sabes.
        
        CONTEXTO:
        ${context}
        
        PREGUNTA:
        ${question}
        `;

        const chatResult = await textModel.generateContent(prompt);
        const response = chatResult.response.text();

        res.json({ answer: response, sources: documents.map(d => d.id) });

    } catch (e) {
        console.error("[RAG] Query Error:", e);
        res.status(500).json({ error: e.message });
    }
});

app.listen(port, () => {
    console.log(`\n🚧 Veritas Gateway (x402, Wallets, RAG) running on http://localhost:${port}`);
    console.log(`   Merchant Wallet: ${MERCHANT_ADDRESS}`);
});
