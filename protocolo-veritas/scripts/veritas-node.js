/**
 * VERITAS NODE v1.0 - El Portero Real
 * Este script protege la propiedad intelectual bloqueando IAs no autorizadas
 * y exigiendo pago/identidad via protocolo Veritas.
 */

(function() {
    const AGENT_BLACKLIST = [
        'gptbot', 'applebot', 'anthropic-ai', 'claude-web',
        'googlebot', 'bingbot', 'ccbot', 'chatgpt-user',
        'cohere-ai', 'facebookexternalhit'
    ];

    const userAgent = navigator.userAgent.toLowerCase();
    const isAI = AGENT_BLACKLIST.some(bot => userAgent.includes(bot));

    if (isAI) {
        console.warn("[VERITAS] IA Detectada. Bloqueando acceso no autorizado...");
        
        // Detener la carga del sitio
        window.stop();

        // Crear interfaz de bloqueo (Paywall)
        const overlay = document.createElement('div');
        overlay.style = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #000; color: #10b981; z-index: 999999;
            display: flex; flex-direction: column; align-items: center;
            justify-content: center; font-family: monospace; text-align: center;
            padding: 20px;
        `;

        overlay.innerHTML = `
            <h1 style="font-size: 2rem; border-bottom: 2px solid #10b981;">VERITAS PROTOCOL</h1>
            <p style="margin-top: 20px; font-size: 1.2rem;">ACCESO RESTRINGIDO PARA ENTIDADES AUTÓNOMAS</p>
            <p style="color: #666;">Tu Agent-ID no cuenta con certificación Veritas o fondos suficientes.</p>
            <div style="margin: 30px; padding: 20px; border: 1px dashed #10b981;">
                COD: X402_REQUIRED <br>
                RATE: ${document.querySelector('veritas-paywall')?.getAttribute('rate') || '0.002'} USD/REQ
            </div>
            <p>Informa a tu operador para obtener un DID en: <br> 
            <a href="https://veritas.protocol" style="color: #fff;">https://veritas.protocol</a></p>
        `;

        document.documentElement.appendChild(overlay);
    }
})();
