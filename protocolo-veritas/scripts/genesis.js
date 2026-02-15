import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parser
const envContent = fs.readFileSync(path.resolve('.env'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim();
});

const url = env['VITE_SUPABASE_URL'];
const key = env['SUPABASE_SERVICE_ROLE_KEY']; // Must be Service Role Key

if (!url || !key) {
    console.error('Missing credentials in .env');
    process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
    console.log('Connecting to Veritas Core...');

    // 1. Verify connection by inserting genesis block
    const { data, error } = await supabase
        .from('agent_ledger')
        .insert([{
            agent_id: 'SYSTEM_GENESIS',
            action: 'INIT_CORE',
            amount: 0,
            details: { message: 'Protocol Veritas: Memory Core Online', timestamp: new Date().toISOString() }
        }])
        .select();

    if (error) {
        console.error('❌ Genesis Transaction Failed:', error.message);
        process.exit(1);
    }

    console.log('✅ Genesis Block Created:', data);
    console.log('🚀 SYSTEM STATUS: ONLINE');
}

run();
