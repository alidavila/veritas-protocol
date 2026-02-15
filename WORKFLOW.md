# 🧭 VERITAS WORKFLOW GUIDE

Welcome to the Veritas ecosystem. To avoid confusion, follow this guide to understand how to use each part of your project.

## 🧠 The Nuclear Brain: Supabase

Everything you do in any sub-project is saved in **Supabase**. This is your single source of truth.

- **Tables**: `agent_ledger` (actions), `veritas_identities` (IDs), `agent_control` (on/off).

## 📖 Strategic Intelligence

For a deep dive into the business and technical logic, read:

- [LOGICA_VERITAS.md](file:///C:/Users/JD%202021/.gemini/antigravity/brain/b4c00606-ba1b-4a58-a13e-b7ab23f887d9/LOGICA_VERITAS.md): 40 Questions & Answers about the protocol.

---

## 🖥️ Project 1: The Agent Manager (Dashboard)

**Path**: `protocolo-veritas/`
**Run**: `npm run dev`

### When to use

- **Visual Monitoring**: See your agents "breathing" and acting in real-time.
- **CEO Assistant**: Chat with the AI and use voice commands.
- **Quick Registration**: Add a new agent identity via a web form.
- **Marketplace**: Deploy product-level agents.

---

## 🛠️ Project 2: The Developer CLI

**Path**: `veritas-cli/`
**Run**: `node index.js [command]` or `veritas [command]`

### Intended use for CLI

- **Identity (Register)**: When you have a complex "Soul" file (`.md`) and want to register it officially.
- **Security (Audit)**: Run deep GEO audits on external websites.
- **Gatekeeper**: Generate the code to protect websites and charge AI agents.

---

## 🚀 Recommended Workflow

1. **Start the Brain**: Ensure your Supabase instance is active and `.env` files are configured.
2. **Launch the Control Tower**: Run `protocolo-veritas` to have a visual view.
3. **Deploy via CLI**: Use the CLI to register your agents or audit targets. They will automatically appear in your Dashboard.
4. **Monitor & Scale**: Use the Dashboard to track revenue and agent health.

---

## ⚠️ Important Tips

- **Consistency**: Use the same Supabase project for all folders.
- **Environment**: If you change a key in one `.env`, update it in the others as well.
- **No Meshes**: Avoid editing the same database table manually while agents are running.
