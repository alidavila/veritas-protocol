(function () {
    // 1. Get Config from Script Tag
    const scriptTag = document.currentScript;
    const AGENT_ID = scriptTag.getAttribute('data-agent-id');
    const API_URL = "http://localhost:3000/agent/query"; // Gateway URL

    if (!AGENT_ID) {
        console.error("Veritas Widget: Missing data-agent-id attribute.");
        return;
    }

    // 2. Inject Styles
    const style = document.createElement('style');
    style.innerHTML = `
        #veritas-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            font-family: 'Segoe UI', sans-serif;
        }
        #veritas-fab {
            width: 60px;
            height: 60px;
            background: #8b5cf6; /* Purple */
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }
        #veritas-fab:hover { transform: scale(1.05); }
        #veritas-fab svg { width: 30px; height: 30px; fill: white; }
        
        #veritas-chat-window {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 500px;
            background: #18181b; /* Zinc 900 */
            border: 1px solid #27272a; /* Zinc 800 */
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            display: none; /* Hidden by default */
            flex-direction: column;
            overflow: hidden;
        }
        #veritas-chat-window.open { display: flex; }
        
        .v-header {
            padding: 16px;
            background: #27272a;
            color: white;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .v-header-title { font-size: 14px; }
        .v-close { cursor: pointer; opacity: 0.7; }
        
        .v-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            background: #09090b; /* Zinc 950 */
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .v-msg {
            max-width: 85%;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 13px;
            line-height: 1.5;
        }
        .v-msg-bot {
            align-self: flex-start;
            background: #27272a;
            color: #d4d4d8; /* Zinc 300 */
            border-bottom-left-radius: 2px;
        }
        .v-msg-user {
            align-self: flex-end;
            background: #7c3aed; /* Violet 600 */
            color: white;
            border-bottom-right-radius: 2px;
        }
        .v-thinking { opacity: 0.5; font-style: italic; font-size: 11px; margin-bottom: 5px; color: #a1a1aa; }

        .v-input-area {
            padding: 12px;
            background: #18181b;
            border-top: 1px solid #27272a;
            display: flex;
            gap: 8px;
        }
        .v-input {
            flex: 1;
            background: #27272a;
            border: none;
            padding: 10px;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            outline: none;
        }
        .v-input::placeholder { color: #52525b; }
        .v-send {
            background: #8b5cf6;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
    `;
    document.head.appendChild(style);

    // 3. Create DOM Structure
    const container = document.createElement('div');
    container.id = 'veritas-widget-container';

    // FAB
    const fab = document.createElement('div');
    fab.id = 'veritas-fab';
    fab.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg>`;

    // Window
    const windowDiv = document.createElement('div');
    windowDiv.id = 'veritas-chat-window';
    windowDiv.innerHTML = `
        <div class="v-header">
            <div class="v-header-title">Veritas Support</div>
            <div class="v-close">✕</div>
        </div>
        <div class="v-messages" id="v-messages">
            <div class="v-msg v-msg-bot">Hola, ¿en qué puedo ayudarte hoy?</div>
        </div>
        <div class="v-input-area">
            <input type="text" class="v-input" id="v-input" placeholder="Escribe tu pregunta..." />
            <button class="v-send" id="v-send">➤</button>
        </div>
    `;

    container.appendChild(windowDiv);
    container.appendChild(fab);
    document.body.appendChild(container);

    // 4. Logic
    const messagesDiv = windowDiv.querySelector('#v-messages');
    const input = windowDiv.querySelector('#v-input');
    const sendBtn = windowDiv.querySelector('#v-send');
    const closeBtn = windowDiv.querySelector('.v-close');

    // Toggle Window
    fab.onclick = () => windowDiv.classList.toggle('open');
    closeBtn.onclick = () => windowDiv.classList.remove('open');

    // Send Message
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        // Add User Msg
        addMessage(text, 'user');
        input.value = '';

        // Thinking Indicator
        const thinking = document.createElement('div');
        thinking.className = 'v-thinking';
        thinking.innerText = 'Veritas thinking...';
        messagesDiv.appendChild(thinking);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: AGENT_ID,
                    question: text
                })
            });
            const data = await response.json();

            messagesDiv.removeChild(thinking);
            if (data.error) addMessage("Error: " + data.error, 'bot');
            else addMessage(data.answer, 'bot');

        } catch (e) {
            messagesDiv.removeChild(thinking);
            addMessage("Error de conexión.", 'bot');
        }
    }

    function addMessage(text, type) {
        const div = document.createElement('div');
        div.className = `v-msg v-msg-${type}`;
        div.innerText = text;
        messagesDiv.appendChild(div);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

})();
