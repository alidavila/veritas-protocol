
# 🏛️ Veritas Protocol (Monorepo)

This repository contains the entire ecosystem of the Veritas Agentic Protocol.

## 📂 Project Structure

### 1. `protocolo-veritas/` (The Core)

**Status**: 🟢 Production
The main Protocol implementation. Contains:

- **Frontend**: React Dashboard (`/dashboard`, `/admin`).
- **Backend Agents**: The "Army" (`router`, `treasurer`, `hunter`).
- **Infrastructure**: Supabase Types, Vercel Config.

### 2. `veritas-cli/`

**Status**: 🟡 Beta
Command Line Interface for developers to register Identities and run local audits.

### 3. `veritas-ghost-auditor/`

**Status**: 🔵 Experimental
Standalone Puppeteer script for deep web analysis.

---

## 🚀 Deployment

### Frontend (Vercel)

The Dashboard lives in `protocolo-veritas`.

- **Root Directory**: `protocolo-veritas`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Backend (Local/VPS)

The Agents run via PM2 found in `protocolo-veritas/ecosystem.config.cjs`.

---

## 🔐 Security

- Private keys (`.treasurer-wallet.json`) are **gitignored**.
- API Keys are managed via `.env`.
