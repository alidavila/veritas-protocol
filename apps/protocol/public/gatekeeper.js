
/**
 * Veritas Gatekeeper v2.0 — Universal CDN Snippet
 * Install in any website's <head> to protect against AI scraping.
 * 
 * Usage:
 * <script src="https://YOUR-VERITAS-URL/gatekeeper.js" 
 *         data-veritas-id="your-client-id" 
 *         data-wallet="0x..." 
 *         data-rate="0.002">
 * </script>
 */

(function () {
    console.log("[Veritas] Gatekeeper v2.0 initializing...");

    // Read config from script tag attributes
    const scriptTag = document.currentScript;
    const CONFIG = {
        clientId: scriptTag?.getAttribute('data-veritas-id') || 'public-node',
        wallet: scriptTag?.getAttribute('data-wallet') || '0x0000',
        price: scriptTag?.getAttribute('data-rate') || '0.002',
        currency: 'USDC',
        // The Veritas API endpoint for reporting
        apiUrl: scriptTag?.getAttribute('data-api') || 'https://veritas-protocol-app.vercel.app',
        // Bots allowed for basic indexing (SEO-safe)
        searchBots: ['googlebot', 'bingbot', 'slurp', 'duckduckbot', 'yandexbot'],
        // AI Bots that must pay/identify
        aiBots: [
            'gptbot', 'chatgpt-user', 'anthropic-ai', 'claudebot', 'claude-web',
            'google-extended', 'bytespider', 'perplexitybot', 'ccbot',
            'applebot-extended', 'cohere-ai', 'diffbot', 'youbot', 'amazonbot',
            'facebookbot', 'omgilibot',
            // Our own test bot
            'veritas-scraper'
        ]
    };

    function getBotType() {
        const ua = navigator.userAgent.toLowerCase();
        if (CONFIG.searchBots.some(bot => ua.includes(bot))) return 'search';
        if (CONFIG.aiBots.some(bot => ua.includes(bot))) return 'ai';
        return 'user';
    }

    // Report detection to Veritas backend
    async function reportDetection(type, details) {
        try {
            const payload = {
                client_id: CONFIG.clientId,
                wallet: CONFIG.wallet,
                domain: window.location.hostname,
                page: window.location.pathname,
                bot_type: type,
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                ...details
            };

            // Report via image beacon (more reliable, no CORS issues)
            const params = new URLSearchParams({
                event: 'GATEKEEPER_DETECTION',
                data: JSON.stringify(payload)
            });
            const img = new Image();
            img.src = `${CONFIG.apiUrl}/api/gatekeeper-report?${params}`;

            console.log(`[Veritas] Detection reported: ${type}`, payload);
        } catch (e) {
            console.warn('[Veritas] Report failed:', e);
        }
    }

    function injectPaywallSchema() {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "isAccessibleForFree": "false",
            "hasPart": {
                "@type": "WebPageElement",
                "isAccessibleForFree": "false",
                "cssSelector": ".premium-content"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Protected by Veritas Protocol"
            }
        });
        document.head.appendChild(script);
    }

    async function analyzeVisitor() {
        const type = getBotType();

        if (type === 'search') {
            console.log("[Veritas] Search Bot detected. SEO Paywall Schema injected.");
            injectPaywallSchema();
            reportDetection('SEARCH_BOT', { action: 'ALLOWED' });
            return;
        }

        if (type === 'ai') {
            console.warn("[Veritas] AI Bot DETECTED! Blocking access.");
            reportDetection('AI_BOT_BLOCKED', {
                action: 'BLOCKED',
                price: CONFIG.price,
                currency: CONFIG.currency
            });
            showPaywall();
            return;
        }

        // Normal user — just report for stats
        reportDetection('HUMAN_VISIT', { action: 'ALLOWED' });
    }

    function showPaywall() {
        // Stop page rendering
        try { window.stop(); } catch (e) { }

        const style = document.createElement('style');
        style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');
            #veritas-overlay {
                position: fixed; inset: 0; z-index: 99999;
                background: rgba(0,0,0,0.98); backdrop-filter: blur(20px);
                color: white; display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                font-family: 'JetBrains Mono', monospace; text-align: center;
                animation: veritasFadeIn 0.3s ease-out;
            }
            @keyframes veritasFadeIn {
                from { opacity: 0; } to { opacity: 1; }
            }
            .veritas-card {
                max-width: 520px; padding: 48px; 
                border: 1px solid rgba(16, 185, 129, 0.15);
                border-radius: 32px; background: #09090b;
                box-shadow: 0 0 80px rgba(16, 185, 129, 0.08), 0 0 200px rgba(16, 185, 129, 0.03);
            }
            .veritas-lock { 
                font-size: 56px; margin-bottom: 24px;
                animation: veritasPulse 2s infinite;
            }
            @keyframes veritasPulse {
                0%, 100% { opacity: 1; } 50% { opacity: 0.5; }
            }
            .veritas-title { 
                font-size: 18px; letter-spacing: 3px; 
                color: #10b981; font-weight: 800;
                margin-bottom: 16px;
            }
            .veritas-desc { 
                color: #71717a; font-size: 12px; 
                line-height: 1.8; margin-bottom: 32px; 
            }
            .veritas-proto {
                font-size: 11px; padding: 20px;
                background: #000; border: 1px solid #27272a;
                border-radius: 16px; margin-bottom: 32px;
                text-align: left; line-height: 2;
            }
            .veritas-proto .label { color: #10b981; font-weight: 700; }
            .veritas-proto .value { color: #a1a1aa; }
            .veritas-btn {
                background: #10b981; color: black; border: none; 
                padding: 16px 32px; border-radius: 14px; 
                font-weight: 800; cursor: pointer;
                text-transform: uppercase; letter-spacing: 2px;
                font-size: 12px; font-family: inherit;
                transition: all 0.2s;
            }
            .veritas-btn:hover { 
                background: #34d399; 
                box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
            }
            .veritas-footer {
                margin-top: 24px; font-size: 10px; color: #3f3f46;
            }
            .veritas-footer a { color: #10b981; text-decoration: none; }
        `;
        document.head.appendChild(style);

        const overlay = document.createElement('div');
        overlay.id = 'veritas-overlay';
        overlay.innerHTML = `
            <div class="veritas-card">
                <div class="veritas-lock">🔒</div>
                <div class="veritas-title">VERITAS IDENTITY CHALLENGE</div>
                <p class="veritas-desc">
                    This resource is protected by <strong style="color:#10b981">Veritas Protocol</strong>.<br>
                    Your AI agent must authenticate via a valid DID signature<br>
                    or process an x402 micropayment to proceed.
                </p>
                <div class="veritas-proto">
                    <span class="label">STATUS:</span> <span class="value">HTTP 402 Payment Required</span><br>
                    <span class="label">PROTOCOL:</span> <span class="value">Veritas x402 v2.0</span><br>
                    <span class="label">PRICE:</span> <span class="value">${CONFIG.price} ${CONFIG.currency} per request</span><br>
                    <span class="label">PAY TO:</span> <span class="value">${CONFIG.wallet.slice(0, 6)}...${CONFIG.wallet.slice(-4)}</span><br>
                    <span class="label">NETWORK:</span> <span class="value">Base (Coinbase L2)</span>
                </div>
                <button class="veritas-btn" onclick="document.getElementById('veritas-overlay').remove()">
                    I'm Human — Let Me In
                </button>
                <p class="veritas-footer">
                    Protected by <a href="https://veritas-protocol-app.vercel.app" target="_blank">Veritas Protocol</a> · 
                    AI agents must pay for access
                </p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', analyzeVisitor);
    } else {
        analyzeVisitor();
    }
})();
