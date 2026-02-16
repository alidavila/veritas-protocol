
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_API_KEY) {
    console.error("❌ Missing Environment Variables.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Model for Embeddings and Text Generation
const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
const textModel = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * 📥 INGEST: Adds text to the Knowledge Base
 */
async function ingest(text, agentId = null) {
    console.log(`📥 Ingesting: "${text.substring(0, 50)}..."`);

    try {
        // 1. Generate Embedding
        const result = await embeddingModel.embedContent(text);
        const embedding = result.embedding.values;

        // 2. Save to Supabase
        // If agentId is null, try to find the 'Support Agent'
        let targetAgentId = agentId;
        if (!targetAgentId) {
            const { data: agents } = await supabase.from('agents').select('id').eq('type', 'support').limit(1);
            if (agents && agents.length > 0) targetAgentId = agents[0].id;
            else {
                console.warn("⚠️ No Support Agent found. Linking to first available agent.");
                const { data: anyAgent } = await supabase.from('agents').select('id').limit(1);
                targetAgentId = anyAgent?.[0]?.id;
            }
        }

        const { error } = await supabase.from('knowledge_base').insert({
            agent_id: targetAgentId,
            content: text,
            embedding: embedding,
            metadata: { source: 'manual-ingest', date: new Date().toISOString() }
        });

        if (error) throw error;
        console.log("✅ Saved to Knowledge Base.");
        return true;

    } catch (error) {
        console.error("❌ Ingestion Error:", error.message);
        if (error.message.includes("relation \"knowledge_base\" does not exist")) {
            console.error("💡 HINT: Did you run the SQL migration? The table 'knowledge_base' is missing.");
        }
        return false;
    }
}

/**
 * 🔍 QUERY: Asks the Agent
 */
async function query(question) {
    console.log(`\n🔍 Querying: "${question}"`);

    try {
        // 1. Embed the Question
        const result = await embeddingModel.embedContent(question);
        const queryEmbedding = result.embedding.values;

        // 2. Search in Supabase (RPC call)
        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5, // Similarity threshold
            match_count: 3
        });

        if (error) throw error;

        // Context construction
        const context = documents?.map(doc => doc.content).join("\n\n") || "";

        console.log(`   -> Found ${documents?.length || 0} relevant snippets.`);

        if (!context) {
            console.log("🤖 Agent: I don't have enough information to answer that.");
            return;
        }

        // 3. Generate Answer with Context
        const prompt = `
        You are a helpful Support Agent for Veritas Protocol.
        Use the following context to answer the user's question.
        If the answer is not in the context, say you don't know.
        
        CONTEXT:
        ${context}
        
        QUESTION:
        ${question}
        `;

        const chatResult = await textModel.generateContent(prompt);
        const response = chatResult.response.text();

        console.log(`🤖 Agent: ${response}`);
        return response;

    } catch (error) {
        console.error("❌ Query Error:", error.message);
    }
}

// --- CLI HANDLER ---
const args = process.argv.slice(2);
const command = args[0];
const payload = args[1];

if (command === '--ingest' && payload) {
    ingest(payload);
} else if (command === '--query' && payload) {
    query(payload);
} else {
    console.log("Usage:");
    console.log("  node scripts/support_agent.js --ingest \"Your text here\"");
    console.log("  node scripts/support_agent.js --query \"Your question here\"");
}
