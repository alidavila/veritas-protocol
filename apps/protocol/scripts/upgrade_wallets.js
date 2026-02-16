
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function upgradeWallets() {
    console.log('🚀 Upgrading Agent Wallets to Real Protocol/Local Wallets...');

    // 1. Fetch Agents
    const { data: agents, error } = await supabase.from('agents').select('*');
    if (error) {
        console.error('❌ Error fetching agents:', error);
        return;
    }

    console.log(`Found ${agents.length} agents.`);

    for (const agent of agents) {
        console.log(`\n🤖 Processing: ${agent.name} (${agent.id})`);

        // Check if already upgraded (optional heuristic, or just force upgrade)
        // For now, we force upgrade to ensure everyone has a valid keypair available (seed/privateKey)

        try {
            // 2. Call Wallet Factory
            const response = await fetch('http://localhost:3000/wallets/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                console.error(`   ❌ API Error: ${response.statusText}`);
                continue;
            }

            const walletData = await response.json();

            if (walletData.status !== 'success') {
                console.error(`   ❌ Factory Error: ${walletData.message}`);
                continue;
            }

            // 3. Update Agent
            // Ensure config is an object
            const currentConfig = typeof agent.config === 'string' ? JSON.parse(agent.config) : (agent.config || {});

            const updates = {
                wallet_address: walletData.address,
                config: {
                    ...currentConfig,
                    wallet: {
                        id: walletData.wallet_id,
                        network: walletData.network,
                        provider: walletData.provider,
                        // STORE SENSITIVE KEY - In production use encryption!
                        // For this prototype, we store it so the agent can actually USE it.
                        secret: walletData.seed
                    }
                }
            };

            const { error: updateError } = await supabase
                .from('agents')
                .update(updates)
                .eq('id', agent.id);

            if (updateError) {
                console.error(`   ❌ DB Update Failed: ${updateError.message}`);
            } else {
                console.log(`   ✅ Upgraded! New Address: ${walletData.address}`);
                console.log(`      Provider: ${walletData.provider}`);
            }

        } catch (e) {
            console.error(`   ❌ Exception: ${e.message}`);
        }
    }

    console.log('\n✨ Upgrade Complete.');
}

upgradeWallets();
