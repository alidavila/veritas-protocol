# 🦞 VERITAS — PROJECT MAP

> **"The VISA for AIs"** — Identity & Financial Infrastructure for AI Agents

## Architecture

```text
┌─────────────────────────────────────────────────────┐
│                    VERITAS PROTOCOL                   │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  veritas-cli  │  │ protocolo-   │  │  ghost-    │ │
│  │  (Node.js)    │  │ veritas      │  │  auditor   │ │
│  │              │  │ (React+Vite) │  │  (React)   │ │
│  │ • register   │  │              │  │            │ │
│  │ • audit      │  │ • Dashboard  │  │ • Gemini   │ │
│  │ • gatekeeper │  │ • Wallet     │  │   attacks  │ │
│  │ • status     │  │ • Marketplace│  │ • Forensic │ │
│  └──────┬───────┘  │ • CEO Chat   │  │   analysis │ │
│         │          └──────┬───────┘  └─────┬──────┘ │
│         │                 │                │         │
│         └─────────────────┴────────────────┘         │
│                           │                           │
│                    ┌──────┴──────┐                    │
│                    │  SUPABASE   │                    │
│                    │             │                    │
│                    │ • agent_    │                    │
│                    │   ledger    │                    │
│                    │ • agent_    │                    │
│                    │   control   │                    │
│                    │ • veritas_  │                    │
│                    │   identities│                    │
│                    └──────┬──────┘                    │
│                           │                           │
│                    ┌──────┴──────┐                    │
│                    │ BASE SEPOLIA│                    │
│                    │ (Blockchain)│                    │
│                    │ • ETH Wallet│                    │
│                    │ • x402 Pay  │                    │
│                    └─────────────┘                    │
└─────────────────────────────────────────────────────┘

### Source of Truth: Supabase
Todos los proyectos (CLI, Dashboard, Scripts) sincronizan datos via Supabase.

## 📖 Documentación Estratégica
- [LOGICA_VERITAS.md](file:///C:/Users/JD%202021/.gemini/antigravity/brain/b4c00606-ba1b-4a58-a13e-b7ab23f887d9/LOGICA_VERITAS.md): Desglose de 40 preguntas sobre el funcionamiento interno.

All projects share the **same Supabase backend**. This ensures that:
- An agent registered in the **CLI** appears in the **Dashboard**.
- An action performed by a script in **protocolo-veritas/scripts** is logged everywhere.
- System status (agent_control) is synchronized across all tools.

## Sub-Projects

### 1. `protocolo-veritas/` — Frontend + Backend Scripts

- **Tech**: React, Vite, TypeScript, TailwindCSS
- **Dashboard**: Real-time agent visualization from Supabase
- **CEO Assistant**: Gemini AI + Voice (Speech Recognition + TTS)
- **Marketplace**: 3 products with Supabase-hosted videos
- **Scripts**: hunter_agent, sentinel_agent, treasurer_agent, x402_gateway

### 2. `veritas-cli/` — Developer Tool

- **Tech**: Node.js ESM, Supabase SDK
- **Commands**: `register`, `audit`, `gatekeeper`, `status`
- **Connects to**: Same Supabase instance as dashboard

### 3. `veritas-ghost-auditor/` — AI Security Auditor

- **Tech**: React, Gemini AI API
- **Capabilities**: Generate attack payloads, forensic analysis, Playwright script generation
- **Connects to**: Supabase for audit log persistence

## Database Tables (Supabase)

| Table | Purpose | Used By |
|---|---|---|
| `agent_ledger` | All agent actions (leads, audits, payments, alerts) | Everything |
| `agent_control` | System on/off status | Dashboard, CLI |
| `veritas_identities` | DID registrations | CLI, CreateIdentityForm |

## Revenue Model

1. **x402 Micropayments** — AI agents pay ETH to access data behind Gatekeeper
2. **Audit Subscriptions** — Ghost Auditor as SaaS
3. **Marketplace** — Deploy infrastructure agents for a fee

## Key API Keys Required

| Key | Used For |
|---|---|
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | All DB operations |
| `VITE_SUPABASE_ANON_KEY` | Frontend reads |
| `CDP_API_KEY_*` | Coinbase wallet on Base Sepolia |
| `VITE_GEMINI_API_KEY` | CEO Assistant + Ghost Auditor |
