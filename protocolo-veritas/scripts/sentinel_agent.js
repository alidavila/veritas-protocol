import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const AGENT_ID = "did:veritas:sentinel:001";
const AGENT_NAME = "Sentinel Prime";

console.log(`🛡️  [${AGENT_NAME}] Policy Engine Active. Auditing Ledger...`);

async function auditLedger() {
    // 1. Fetch recent transactions
    const { data: txs, error } = await supabase
        .from('agent_ledger')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("❌ Ledger Read Error:", error);
        return;
    }

    if (!txs || txs.length === 0) {
        console.log("   No recent transactions.");
        return;
    }

    console.log(`\n🔎 Analyzed ${txs.length} recent blocks.`);

    // 2. Mock Analysis Logic
    for (const tx of txs) {
        if (tx.action === 'PAYMENT_ACCEPTED' && tx.amount > 0.05) {
            console.log(`   🚨 High Value Transaction detected: ${tx.amount} ETH (Tx: ${tx.details?.tx_hash?.substring(0, 10)}...)`);
            // In a real scenario, we'd flag it or freeze it.
        }
        if (tx.agent_id === 'unknown') {
            console.log(`   ⚠️ Anonymous Activity detected.`);
        }
    }

    // 3. Simulate Random Security Event
    if (Math.random() > 0.8) {
        console.log(`   ⚠️ Suspicious Patter Detected in Sector 4.`);
        // Log Alert
        const { error: alertError } = await supabase.from('agent_ledger').insert([{
            agent_id: AGENT_ID,
            action: 'ALERT_TRIGGERED',
            amount: 0,
            details: {
                severity: 'MEDIUM',
                reason: 'Velocity check failed',
                target: 'did:veritas:hunter:001'
            }
        }]);
        if (!alertError) console.log("   --> Alert Logged.");
    } else {
        console.log("   ✅ System Integrity: 100%");
    }
}

async function main() {
    while (true) {
        // Check if system is running
        const { data: control } = await supabase
            .from('agent_control')
            .select('status')
            .single();

        if (control?.status === 'stopped') {
            console.log("🛑 System stopped by Control Panel. Exiting...");
            process.exit(0);
        }

        await auditLedger();
        const wait = 10000;
        console.log(`⏳ Sleeping for ${wait / 1000}s...`);
        await new Promise(r => setTimeout(r, wait));
    }
}

main();
