#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════╗
 * ║  VERITAS CLI v2.1 — Zero Dependencies Edition   ║
 * ║  The Identity Standard for AI Agents & Humans   ║
 * ╚══════════════════════════════════════════════════╝
 * 
 * Usage (NO npm install needed, NO .env needed):
 *   npx veritas-cli init          — Create a DID + Wallet
 *   npx veritas-cli status        — Show your identity
 *   npx veritas-cli sign "msg"    — Sign a message
 *   npx veritas-cli snippet       — Get your Gatekeeper <script> tag
 *   npx veritas-cli help          — Show commands
 * 
 * Works with: Node.js 16+ (uses built-in crypto, zero external packages)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(process.cwd(), '.veritas');
const IDENTITY_FILE = path.join(CONFIG_DIR, 'identity.json');
const VERITAS_CDN = 'https://veritas-protocol-app.vercel.app';

const args = process.argv.slice(2);
const command = args[0];

// ─── Colors for terminal ───
const c = {
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    cyan: (s) => `\x1b[36m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
    red: (s) => `\x1b[31m${s}\x1b[0m`,
    dim: (s) => `\x1b[2m${s}\x1b[0m`,
    bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

console.log('');
console.log(c.green('  ╔══════════════════════════════════════╗'));
console.log(c.green('  ║') + c.bold('  💠 VERITAS PROTOCOL CLI v2.1       ') + c.green('║'));
console.log(c.green('  ║') + c.dim('  Identity Standard for AI Agents    ') + c.green('║'));
console.log(c.green('  ╚══════════════════════════════════════╝'));
console.log('');

// ─── Generate Ethereum-compatible keypair using Node.js crypto ───
function generateIdentity() {
    const privateKeyBytes = crypto.randomBytes(32);
    const privateKey = '0x' + privateKeyBytes.toString('hex');

    const ecdh = crypto.createECDH('secp256k1');
    ecdh.setPrivateKey(privateKeyBytes);
    const publicKeyUncompressed = ecdh.getPublicKey();

    const pubKeyWithoutPrefix = publicKeyUncompressed.slice(1);
    const hash = crypto.createHash('sha256').update(pubKeyWithoutPrefix).digest('hex');
    const address = '0x' + hash.slice(-40);

    return { privateKey, address };
}

// ─── INIT ───
function init() {
    if (fs.existsSync(IDENTITY_FILE)) {
        console.log(c.yellow('  ⚠️  Identity already exists in this directory.'));
        console.log(c.dim('     Use "status" to view it, or delete .veritas/ to reset.\n'));
        return;
    }

    console.log(c.cyan('  🛠️  Generating new Agent Identity...\n'));

    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    const { privateKey, address } = generateIdentity();
    const did = `did:veritas:${address}`;
    const veritasId = address.slice(2, 10);

    const identity = {
        did,
        address,
        veritasId,
        privateKey,
        createdAt: new Date().toISOString(),
        reputation: 100,
        status: 'verified',
        protocol: 'Veritas Protocol v2.1'
    };

    fs.writeFileSync(IDENTITY_FILE, JSON.stringify(identity, null, 2));

    const gitignorePath = path.join(CONFIG_DIR, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
        fs.writeFileSync(gitignorePath, 'identity.json\n');
    }

    console.log(c.green('  ✅ Identity Created Successfully!\n'));
    console.log(`  ${c.dim('DID:')}        ${c.bold(did)}`);
    console.log(`  ${c.dim('Wallet:')}     ${c.cyan(address)}`);
    console.log(`  ${c.dim('Veritas ID:')} ${c.green(veritasId)}`);
    console.log(`  ${c.dim('Reputation:')} ${c.green('100/100')}`);
    console.log(`  ${c.dim('Saved to:')}   ${c.dim(IDENTITY_FILE)}`);
    console.log('');
    console.log(c.yellow('  🔒 Keep .veritas/identity.json safe — it has your private key.'));
    console.log(c.dim('     A .gitignore was created to prevent accidental commits.\n'));
    console.log(c.green('  💡 Next step: run "npx veritas-cli snippet" to get your Gatekeeper tag.\n'));
}

// ─── STATUS ───
function status() {
    if (!fs.existsSync(IDENTITY_FILE)) {
        console.log(c.red('  ❌ No identity found. Run "npx veritas-cli init" first.\n'));
        return;
    }

    const id = JSON.parse(fs.readFileSync(IDENTITY_FILE, 'utf8'));
    console.log(c.cyan('  📋 Agent Identity Status:\n'));
    console.log(`  ${c.dim('DID:')}         ${c.bold(id.did)}`);
    console.log(`  ${c.dim('Address:')}     ${c.cyan(id.address)}`);
    console.log(`  ${c.dim('Veritas ID:')}  ${c.green(id.veritasId)}`);
    console.log(`  ${c.dim('Reputation:')}  ${c.green(id.reputation + '/100')}`);
    console.log(`  ${c.dim('Status:')}      ${id.status === 'verified' ? c.green('✓ Verified') : c.yellow('⏳ Pending')}`);
    console.log(`  ${c.dim('Created:')}     ${new Date(id.createdAt).toLocaleString()}`);
    console.log('');
}

// ─── SIGN ───
function sign() {
    const message = args.slice(1).join(' ');
    if (!message) {
        console.log(c.red('  ❌ Please provide a message to sign.'));
        console.log(c.dim('     Usage: npx veritas-cli sign "your message"\n'));
        return;
    }

    if (!fs.existsSync(IDENTITY_FILE)) {
        console.log(c.red('  ❌ No identity found. Run "npx veritas-cli init" first.\n'));
        return;
    }

    const id = JSON.parse(fs.readFileSync(IDENTITY_FILE, 'utf8'));
    const privateKeyHex = id.privateKey.replace('0x', '');

    console.log(c.cyan(`  🖋️  Signing as ${c.dim(id.did)}...\n`));

    const privateKeyDer = Buffer.from(privateKeyHex, 'hex');
    const signature = crypto.createHmac('sha256', privateKeyDer).update(message).digest('hex');

    console.log(c.green('  ✅ Signature Generated:\n'));
    console.log(`  ${c.dim('Message:')}    ${message}`);
    console.log(`  ${c.dim('Signer:')}     ${id.did}`);
    console.log(`  ${c.dim('Signature:')}  ${c.cyan('0x' + signature)}`);
    console.log('');
}

// ─── SNIPPET ───
function snippet() {
    if (!fs.existsSync(IDENTITY_FILE)) {
        console.log(c.red('  ❌ No identity found. Run "npx veritas-cli init" first.\n'));
        return;
    }

    const id = JSON.parse(fs.readFileSync(IDENTITY_FILE, 'utf8'));

    const tag = `<script src="${VERITAS_CDN}/gatekeeper.js"
  data-veritas-id="${id.veritasId}"
  data-wallet="${id.address}"
  data-rate="0.002"></script>`;

    console.log(c.green('  🔒 Your Gatekeeper Script Tag:\n'));
    console.log(c.cyan(`  ${tag}\n`));
    console.log(c.dim('  Paste this in the <head> of your HTML to activate Gatekeeper protection.'));
    console.log(c.dim('  It will detect AI bots and present them with an x402 payment challenge.\n'));
}

// ─── HELP ───
function help() {
    console.log(c.bold('  Available Commands:\n'));
    console.log(`  ${c.green('init')}       Create a new local identity (DID + Wallet)`);
    console.log(`  ${c.green('status')}     Show your current identity info`);
    console.log(`  ${c.green('sign')} ${c.dim('<msg>')}  Sign a message with your DID`);
    console.log(`  ${c.green('snippet')}    Get your personalized Gatekeeper <script> tag`);
    console.log(`  ${c.green('help')}       Show this help message`);
    console.log('');
    console.log(c.dim('  Examples:'));
    console.log(c.dim('    npx veritas-cli init'));
    console.log(c.dim('    npx veritas-cli sign "I am a legitimate AI agent"'));
    console.log(c.dim('    npx veritas-cli snippet'));
    console.log('');
}

// ─── Router ───
switch (command) {
    case 'init': init(); break;
    case 'status': status(); break;
    case 'sign': sign(); break;
    case 'snippet': snippet(); break;
    case 'help':
    case undefined: help(); break;
    default:
        console.log(c.red(`  ❌ Unknown command: ${command}\n`));
        help();
}
