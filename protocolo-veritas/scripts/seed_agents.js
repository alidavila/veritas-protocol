
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Use SERVICE_ROLE_KEY to bypass RLS and access auth.users
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const WARRIORS = [
    {
        name: 'Hunter V2',
        type: 'scraper',
        status: 'active',
        description: 'Scout Agent. Finds leads on 𝕏 and LinkedIn.',
        is_public: false,
        price_usd: 0,
        config: { version: '2.0', target: 'B2B' }
    },
    {
        name: 'Email Agent',
        type: 'sales',
        status: 'active',
        description: 'Outreach Agent. Drafts and sends cold emails.',
        is_public: false,
        price_usd: 0,
        config: { model: 'gemini-pro', daily_limit: 50 }
    },
    {
        name: 'Ghost Auditor',
        type: 'support',
        status: 'active',
        description: 'Analysis Agent. Checks GEO scores and vulnerabilities.',
        is_public: true,
        price_usd: 49,
        config: { tools: ['geo-audit'] }
    },
    {
        name: 'Treasurer',
        type: 'custom',
        status: 'active',
        description: 'Finance Agent. Manages wallet and payments.',
        is_public: false,
        price_usd: 0,
        config: { network: 'base-sepolia' }
    },
    {
        name: 'Veritas Kernel',
        type: 'custom',
        status: 'active',
        description: 'Orchestrator. Manages the swarm.',
        is_public: false,
        price_usd: 0,
        config: { role: 'admin' }
    }
];

async function seed() {
    console.log('🌱 Seeding 5 Warriors...');

    // 1. Get a valid user ID (the first one found)
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError || !users || users.length === 0) {
        console.error('❌ Could not find any users in auth.users. Please sign up in the app first.');
        return;
    }

    const userId = users[0].id;
    console.log(`👤 Using User ID: ${userId} (${users[0].email})`);

    // 2. Check existing agents
    const { data: existing } = await supabase.from('agents').select('name');
    const existingNames = new Set(existing?.map(e => e.name) || []);

    const toInsert = WARRIORS.filter(w => !existingNames.has(w.name)).map(w => ({
        ...w,
        user_id: userId,
        wallet_address: `0x${Math.random().toString(16).slice(2, 42)}`
    }));

    if (toInsert.length === 0) {
        console.log('✅ All warriors already exist.');
        return;
    }

    const { error } = await supabase.from('agents').insert(toInsert);

    if (error) {
        console.error('❌ Error seeding:', error.message);
    } else {
        console.log(`✅ Successfully deployed ${toInsert.length} agents to the database.`);
    }
}

seed();
