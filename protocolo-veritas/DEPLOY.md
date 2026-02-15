
# 🚀 Deployment Guide: Veritas Protocol

## 1. Frontend (The Dashboard)

### Option A: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not installed):

    ```bash
    npm i -g vercel
    ```

2. **Login**:

    ```bash
    vercel login
    ```

3. **Deploy**:
    Run this command in the `protocolo-veritas` folder:

    ```bash
    vercel
    ```

    - Follow the prompts (Set defaults to Y).
    - When asked for **Environment Variables**, go to the Vercel Dashboard -> Settings -> Environment Variables and add:
      - `VITE_SUPABASE_URL`: (Your Supabase URL)
      - `VITE_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)

### Option B: Local Preview

To see the production build locally:

```bash
npm run preview
```

---

## 2. Backend (The Army)

The agents (Router, Treasurer, Hunter) run as Node.js processes. To keep them running permanently:

1. **Install PM2**:

    ```bash
    npm i -g pm2
    ```

2. **Start the Army**:

    ```bash
    pm2 start ecosystem.config.cjs
    ```

3. **Monitor**:

    ```bash
    pm2 monit
    ```

4. **View Logs**:

    ```bash
    pm2 logs
    ```

5. **Stop**:

    ```bash
    pm2 stop all
    ```

## 3. Operations

- **Admin Panel**: Go to your deployed Vercel URL `/admin`.
- **Command Router**: Type "Start all agents" in the Admin Panel to wake up the PM2 processes (via Supabase sync).
