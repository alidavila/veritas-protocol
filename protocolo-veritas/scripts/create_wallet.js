import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env
dotenv.config();

const apiKeyName = process.env.CDP_API_KEY_NAME;
const privateKey = process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, '\n'); 

if (!apiKeyName || !privateKey) {
    console.error('❌ Error: Missing CDP credentials in .env');
    console.error('   Ensure CDP_API_KEY_NAME and CDP_API_KEY_PRIVATE_KEY are set.');
    process.exit(1);
}

// Configure SDK
Coinbase.configure({ apiKeyName, privateKey });

async function main() {
    console.log("\n--- VERITAS PROTOCOL: AGENT INITIALIZATION ---");
    console.log("Target Network: Base Sepolia (L2)");
    
    try {
        console.log("🛠️  Creating secure wallet on Base...");
        const wallet = await Wallet.create({ networkId: 'base-sepolia' });

        console.log(`✅  Wallet ID: ${wallet.getId()}`);
        
        const address = await wallet.getDefaultAddress();
        console.log(`📍  Address:   ${address.getId()}`);

        // Save wallet data
        const walletData = await wallet.export();
        fs.writeFileSync(path.resolve('.wallet-data.json'), JSON.stringify(walletData, null, 2));
        console.log(`🔐  Keys exported to .wallet-data.json`);

        // Faucet for gas
        console.log("💧  Requesting testnet ETH for gas...");
        const faucetTx = await wallet.faucet();
        console.log(`🔗  Faucet Tx: ${faucetTx.getTransactionLink()}`);
        console.log("----------------------------------------------\n");

    } catch (error) {
        console.error("\n❌ FATAL ERROR during initialization:");
        console.error(error.message);
        console.log("----------------------------------------------\n");
    }
}

main();
