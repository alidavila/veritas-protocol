import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
    console.log("📊 Checking Supabase for Real Data...\n");

    const { data: ledger, error } = await supabase
        .from('agent_ledger')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("❌ Error:", error);
        return;
    }

    console.log(`Found ${ledger?.length || 0} records:\n`);

    if (ledger && ledger.length > 0) {
        ledger.forEach((tx, i) => {
            console.log(`${i + 1}. ${tx.action} by ${tx.agent_id.split(':')[2]?.toUpperCase() || tx.agent_id}`);
            console.log(`   Amount: ${tx.amount} ETH`);
            console.log(`   Details:`, JSON.stringify(tx.details, null, 2));
            console.log('');
        });
    } else {
        console.log("⚠️  No data found! Agents might not be writing to database.");
    }
}

checkData();
