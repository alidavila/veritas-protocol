#!/usr/bin/env node

/**
 * Veritas CLI v1.0 — The Developer Standard for AI Agent Identity
 * 
 * Usage:
 *   npx veritas-cli init          - Create a new DID and Wallet
 *   npx veritas-cli status        - Show current identity
 *   npx veritas-cli sign <msg>    - Sign a message to prove DID ownership
 */

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(process.cwd(), '.veritas');
const IDENTITY_FILE = path.join(CONFIG_PATH, 'identity.json');

const args = process.argv.slice(2);
const command = args[0];

console.log('\n💠 VERITAS PROTOCOL CLI v1.0');
console.log('━'.repeat(40));

async function init() {
    if (fs.existsSync(IDENTITY_FILE)) {
        console.log('⚠️  Identity already exists in this directory.');
        console.log('   Use "status" to view it or delete .veritas/identity.json to reset.');
        return;
    }

    console.log('🛠️  Generating new Agent Identity (DID + Wallet)...');

    if (!fs.existsSync(CONFIG_PATH)) {
        fs.mkdirSync(CONFIG_PATH, { recursive: true });
    }

    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    // Generate a DID (DID:Veritas:<address>)
    const did = `did:veritas:${account.address}`;

    const identity = {
        did,
        address: account.address,
        privateKey,
        createdAt: new Date().toISOString(),
        reputation: 100,
        status: 'verified'
    };

    fs.writeFileSync(IDENTITY_FILE, JSON.stringify(identity, null, 2));

    console.log('✅ Identity Created Successfully!');
    console.log(`   DID:     ${did}`);
    console.log(`   Wallet:  ${account.address}`);
    console.log(`   Config:  ${IDENTITY_FILE}`);
    console.log('\n🔒 Keep your identity.json safe. It contains your private key.');
}

function status() {
    if (!fs.existsSync(IDENTITY_FILE)) {
        console.log('❌ No identity found. Run "init" first.');
        return;
    }

    const identity = JSON.parse(fs.readFileSync(IDENTITY_FILE, 'utf8'));
    console.log('📋 Agent Identity Status:');
    console.log(`   DID:         ${identity.did}`);
    console.log(`   Address:     ${identity.address}`);
    console.log(`   Reputation:  ${identity.reputation}/100`);
    console.log(`   Created:     ${new Date(identity.createdAt).toLocaleString()}`);
}

async function sign() {
    const message = args.slice(1).join(' ');
    if (!message) {
        console.log('❌ Error: Please provide a message to sign.');
        console.log('   Usage: npx veritas-cli sign "your message"');
        return;
    }

    if (!fs.existsSync(IDENTITY_FILE)) {
        console.log('❌ No identity found. Run "init" first.');
        return;
    }

    const identity = JSON.parse(fs.readFileSync(IDENTITY_FILE, 'utf8'));
    const account = privateKeyToAccount(identity.privateKey);

    console.log(`🖋️  Signing message as ${identity.did}...`);
    const signature = await account.signMessage({ message });

    console.log('\n✅ Signature Generated:');
    console.log(`${signature}`);
}

function help() {
    console.log('Available Commands:');
    console.log('   init           Create a new local identity (DID + Wallet)');
    console.log('   status         Show current identity info');
    console.log('   sign <msg>     Sign a message with your Agent DID');
    console.log('   help           Show this help message');
}

switch (command) {
    case 'init':
        init();
        break;
    case 'status':
        status();
        break;
    case 'sign':
        sign();
        break;
    case 'help':
    case undefined:
        help();
        break;
    default:
        console.log(`❌ Unknown command: ${command}`);
        help();
}

console.log('━'.repeat(40) + '\n');
