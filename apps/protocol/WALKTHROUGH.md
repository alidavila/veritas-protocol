
# 🏆 Veritas Protocol: Mission Accomplished

We have successfully transitioned from a mock SaaS to a live **Protocol + Army**.

## 1. The Army is Alive 🤖

Your backend agents are now running as persistent processes via PM2.

- **Router**: Listening for your commands from the Admin Dashboard.
- **Treasurer**: Managing a real Coinbase CDP Wallet on Base Sepolia.
- **Hunter**: Scanning the web and logging leads to Supabase.

Check their status anytime in your terminal:

```bash
npx pm2 monit
```

## 2. The Dashboard is Ready Commander TEGER

The frontend has been built (`dist/`) and is ready for Vercel.

- **Admin Panel**: `/admin` - Your Command Center.
- **Public View**: `/dashboard` - For your clients.

## 3. How to Operate

1. **Start the Dashboard**:

    ```bash
    cd protocolo-veritas
    npm run dev
    ```

2. **Issue Commands**:
    Go to `http://localhost:5173/admin` -> **Router Link** tab.
    Type: *"Stop all agents"* or *"Start hunting"* to see the Router react in your terminal.

## 4. Deployment

Follow the instructions in `DEPLOY.md` to push the dashboard to the cloud (Vercel).

---
*The Protocol is active. The Army awaits your orders.*
