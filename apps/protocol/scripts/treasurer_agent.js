
/**
 * TREASURER AGENT v2.0 (Real Wallet)
 * 
 * Features:
 * 1. 🏦 Manages the MASTER WALLET for the Veritas Protocol.
 * 2. 🔐 Persists wallet keys locally (.treasurer-wallet.json).
 * 3. 💓 Reports Logic + Balance to Dashboard via VeritasPulse.
 * 4. 💰 (Future) Automates payouts to other agents.
 */

import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { VeritasPulse } from './lib/veritas-pulse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Coinbase Config
const apiKeyName = process.env.CDP_API_KEY_NAME;
const privateKey = process.env.CDP_API_KEY_PRIVATE?.replace(/\\n/g, '\n');

if (!apiKeyName || !privateKey) {
    console.error('❌ Missing CDP Credentials. Treasurer cannot start.');
    process.exit(1);
}

Coinbase.configure({ apiKeyName, privateKey });

// Agent Config
const AGENT_ID = "did:veritas:treasurer:001";
const pulse = new VeritasPulse(AGENT_ID, 'custom');
const WALLET_FILE = path.join(__dirname, '.treasurer_wallet.json');

async function getOrInitWallet() {
    let wallet;
    if (fs.existsSync(WALLET_FILE)) {
        console.log('📂 Loading existing Treasurer Wallet...');
        const data = JSON.parse(fs.readFileSync(WALLET_FILE, 'utf-8'));
        wallet = await Wallet.import(data);
    } else {
        console.log('🆕 Creating NEW Treasurer Wallet...');
        wallet = await Wallet.create({ networkId: 'base-sepolia' });
        const data = await wallet.export();
        fs.writeFileSync(WALLET_FILE, JSON.stringify(data, null, 2));
        console.log('💾 Wallet saved to disk.');

        // Initial Faucet (Only on creation)
        console.log('💧 Requesting Faucet Funds...');
        try {
            await wallet.faucet();
            console.log('   ✅ Faucet request sent.');
        } catch (e) {
            console.warn('   ⚠️ Faucet failed (maybe rate limited):', e.message);
        }
    }
    return wallet;
}

async function main() {
    const wallet = await getOrInitWallet();
    const address = (await wallet.getDefaultAddress()).getId();
    console.log(`🏦 TREASURER ONLINE (Base Sepolia)`);
    console.log(`📍 Address: ${address}`);

    // Update Pulse with wallet info immediately
    pulse.wallet_address = address;

    // Start Heartbeat
    pulse.startHeartbeat();

    console.log('💓 Heartbeat started. Monitoring balance...');

    // Monitoring Loop
    setInterval(async () => {
        try {
            // Get Real Balance
            const balance = await wallet.getBalance('ETH'); // Returns Decimal/BigInt? SDK docs say Decimal usually
            // The new SDK returns a Balance object or number. Let's assume number or simple object for now.
            // Actually, newer SDK: await wallet.getBalance(Asset.ETH) -> number

            // Adjust based on actual return type of SDK 0.25.0
            // Assuming it returns a number or object with toString

            // Quick fix for type safety in JS:
            const balNum = Number(balance);

            console.log(`💰 Balance: ${balNum} ETH`);

            // Log status (Pulse handles heartbeat, but we want explicit log for balance updates sometimes)
            // Actually, Pulse heartbeat sends 'wallet_balance' if we update the property on the pulse object?
            // checking VeritasPulse implementation... 
            // It sends 'this.wallet_balance'. So we must update it.
            pulse.updateBalance(balNum);

        } catch (e) {
            console.error('❌ Balance Check Error:', e.message);
        }
    }, 30000); // Every 30s
}

main().catch(console.error);
