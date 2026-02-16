import dotenv from 'dotenv';
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";

dotenv.config();

// Configure SDK
let sdk;
try {
    sdk = await import("@coinbase/coinbase-sdk");
} catch (e) {
    sdk = await import("@coinbase/cdp-sdk");
}
const { Coinbase: CB, Wallet: W } = sdk;

const apiKeyName = process.env.CDP_API_KEY_NAME;
const privateKey = process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!apiKeyName || !privateKey) {
    console.error('❌ Missing CDP credentials');
    process.exit(1);
}
CB.configure({ apiKeyName, privateKey });

async function main() {
    console.log("🤖 [Client] Attempting to access Premium Data...");

    // 1. Initial Request (Will fail with 402)
    const initialRes = await fetch('http://localhost:3000/premium/data');

    if (initialRes.status === 200) {
        console.log("✅ Access Granted directly (Free tier?)");
        return;
    }

    if (initialRes.status !== 402) {
        console.error(`❌ Unexpected Error: ${initialRes.status}`);
        return;
    }

    const challenge = await initialRes.json();
    console.log(`🔒 [Gateway] 402 Payment Required`);
    console.log(`   Price: ${challenge.price} ETH`);
    console.log(`   Pay To: ${challenge.pay_to}`);

    // 2. Perform Payment
    console.log(`💸 [Client] Initiating Payment via Base Sepolia...`);

    // Re-create wallet from persistence (or just fetch the default since config is global?)
    // The SDK manages wallet locally if persists? 
    // Actually, create({ networkId }) creates a NEW wallet if not loaded.
    // We should load from file if we want to reuse the same address from create_wallet.js
    // OR just create a new ephemeral wallet and fund it from faucet?
    // Let's reuse the wallet data if we can import it.
    // The SDK's `Wallet.import(data)` is the way.

    let wallet;
    try {
        const fs = await import('fs');
        const walletData = JSON.parse(fs.readFileSync('.wallet-data.json', 'utf-8'));
        wallet = await W.import(walletData);
        console.log(`   Loaded Wallet: ${wallet.getId()}`);
    } catch (e) {
        console.log("   Creating new temporary wallet...");
        wallet = await W.create({ networkId: 'base-sepolia' });
    }

    // Check Balance
    let balance = await wallet.getBalance('eth');
    console.log(`   Current Balance: ${balance} ETH`);

    if (balance < 0.0005) {
        console.log("   ⚠️ Low Balance. Requesting Faucet...");
        try {
            const tx = await wallet.faucet();
            console.log(`   Faucet Tx: ${tx.getTransactionLink()}`);
            // Wait for it? usually instant for testnet API but chain needs time.
            console.log("   Waiting 5s for funds...");
            await new Promise(r => setTimeout(r, 5000));
            balance = await wallet.getBalance('eth');
            console.log(`   New Balance: ${balance} ETH`);
        } catch (err) {
            console.error("   ❌ Faucet failed:", err.message);
        }
    }

    if (balance < 0.0002) {
        console.error("   ❌ Still insufficient funds.");
        return;
    }

    const transfer = await wallet.createTransfer({
        amount: 0.0001,
        assetId: 'eth',
        destination: challenge.pay_to
    });

    // Wait for the transfer to be submitted? createTransfer returns a Transfer object.
    // We need to wait for it to be on-chain.
    await transfer.wait();

    const txHash = transfer.getTransactionLink().split('/').pop(); // Extract hash from link or object
    // Actually, transfer.getTransactionHash() might not exist on all SDK versions.
    // Let's rely on transfer.toString() or check the object structure.
    // The link is usually `https://.../tx/0x...`.

    console.log(`✅ [Client] Payment Sent! Hash: ${txHash}`);
    console.log(`   Link: ${transfer.getTransactionLink()}`);

    // 3. Authenticate with Proof
    console.log(`🔑 [Client] Presenting Receipt to Gateway...`);
    const finalRes = await fetch('http://localhost:3000/premium/data', {
        headers: {
            'Authorization': `402-payment ${txHash}`
        }
    });

    const finalData = await finalRes.json();

    if (finalRes.status === 200) {
        console.log(`🔓 [Success] Data Unlocked:`);
        console.log(JSON.stringify(finalData, null, 2));
    } else {
        console.error(`⛔ [Failed] Server rejected payment:`, finalData);
    }
}

main();
