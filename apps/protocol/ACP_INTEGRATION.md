# Veritas ACP Integration

> **Veritas Protocol meets Stripe/OpenAI Agentic Commerce Protocol**

## What we built

Veritas now has a **full ACP-compliant gateway** that enables AI agents to:

1. **Discover** Veritas products via catalog endpoint
2. **Pay** using x402 (ETH on Base) or Stripe Shared Payment Tokens
3. **Verify** payments and receive access credentials

## Files

| File | Purpose |
|---|---|
| `scripts/acp_gateway.js` | ACP gateway server (port 3001) |
| `public/acp-catalog.json` | Static catalog for Stripe SFTP ingestion |

## Endpoints

```bash
# Discovery — AI platforms find us here
GET /.well-known/acp

# Product catalog — what we sell to agents
GET /acp/catalog

# Initiate checkout — agents start buying here
POST /acp/checkout
Body: { product_id, agent_id, payment_method }

# Verify payment — complete purchase
POST /acp/verify
Body: { session_id, payment_proof }

# Health check
GET /acp/health
```

## How to run

```bash
cd apps/protocol/scripts
node acp_gateway.js
```

## How it connects to Stripe

1. **ACP Protocol**: We implement the same open standard (agenticcommerce.dev)
2. **x402**: Stripe's docs now officially support x402 — our existing gateway is compatible
3. **Shared Payment Tokens**: Endpoint ready for Stripe token integration
4. **Catalog Feed**: `acp-catalog.json` follows Stripe's catalog format for SFTP upload

## What's next (you)

- [ ] Create Stripe Products in Dashboard matching catalog
- [ ] Upload catalog via Stripe SFTP (or use Dashboard)
- [ ] Apply for ChatGPT agentic commerce program
- [ ] Deploy `acp_gateway.js` to production (Vercel serverless or separate VPS)
- [ ] Register Veritas on agenticcommerce.dev

## Proof of concept

Veritas was building x402 payments BEFORE Stripe standardized it. This integration 
validates that vision — the protocol we built independently is now the industry standard 
being adopted by Stripe + OpenAI.
