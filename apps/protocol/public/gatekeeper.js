
/**
 * Veritas Gatekeeper - Universal Snippet v1.1
 * SEO-Friendly & Identity Aware
 */

(function () {
    console.log("[Veritas] Gatekeeper initializing...");

    const CONFIG = {
        agentId: document.currentScript?.getAttribute('data-veritas-id') || 'public-node',
        price: '0.001',
        currency: 'USDC',
        // Bots allowed for basic indexing (SEO)
        searchBots: ['googlebot', 'bingbot', 'slurp', 'duckduckbot'],
        // Bots required to pay/identify (AI Training/Scrapers)
        aiBots: [
            'gptbot', 'chatgpt-user', 'anthropic-ai', 'claudebot',
            'google-extended', 'bytespider', 'perplexitybot', 'ccbot'
        ]
    };

    function getBotType() {
        const ua = navigator.userAgent.toLowerCase();
        if (CONFIG.searchBots.some(bot => ua.includes(bot))) return 'search';
        if (CONFIG.aiBots.some(bot => ua.includes(bot))) return 'ai';
        return 'user';
    }

    function injectPaywallSchema() {
        // Standard Schema.org for Paywalled Content
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
                "name": "Veritas Protocol Protected Site"
            }
        });
        document.head.appendChild(script);
    }

    async function analyzeVisitor() {
        const type = getBotType();

        if (type === 'search') {
            console.log("[Veritas] Search Bot detected. Injecting SEO Paywall Schema.");
            injectPaywallSchema();
            return; // Search bots see content but indexed as paywalled
        }

        if (type === 'ai') {
            applyVeritasProtocol();
            return;
        }

        // Logic for regular users could go here
    }

    function applyVeritasProtocol() {
        console.warn("[Veritas] ACCESS RESTRICTED: AI Identity Required.");

        const style = document.createElement('style');
        style.innerHTML = `
            #veritas-overlay {
                position: fixed; inset: 0; z-index: 10000;
                background: rgba(0,0,0,0.98); backdrop-filter: blur(12px);
                color: white; display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                font-family: 'JetBrains Mono', monospace; text-align: center;
            }
            .veritas-card {
                max-width: 480px; padding: 40px; border: 1px solid rgba(16, 185, 129, 0.2);
                border-radius: 32px; background: black;
                box-shadow: 0 0 40px rgba(16, 185, 129, 0.05);
            }
            .veritas-btn {
                background: #10b981; color: black; border: none; padding: 14px 28px;
                border-radius: 12px; font-weight: 800; cursor: pointer;
                text-transform: uppercase; letter-spacing: 1px;
            }
        `;
        document.head.appendChild(style);

        const overlay = document.createElement('div');
        overlay.id = 'veritas-overlay';
        overlay.innerHTML = `
            <div class="veritas-card">
                <div style="color: #10b981; font-size: 48px; margin-bottom: 24px;">🔒</div>
                <h2 style="font-size: 20px; letter-spacing: -0.5px; margin-bottom: 16px;">VERITAS IDENTITY CHALLENGE</h2>
                <p style="color: #71717a; font-size: 13px; line-height: 1.6; margin-bottom: 32px;">
                    Este recurso está protegido por el Protocolo Veritas. 
                    Su agente de IA debe identificarse mediante una firma DID válida 
                    o procesar el micropago x402 para proceder.
                </p>
                <div style="font-size: 11px; padding: 16px; background: #09090b; border: 1px solid #27272a; border-radius: 12px; margin-bottom: 32px;">
                    <span style="color: #10b981">REQUIRED:</span> HTTP 402 Payment Required<br>
                    <span style="color: #10b981">PRICE:</span> ${CONFIG.price} ${CONFIG.currency}
                </div>
                <button class="veritas-btn" onclick="document.getElementById('veritas-overlay').remove()">Validar como Humano</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', analyzeVisitor);
    } else {
        analyzeVisitor();
    }
})();
