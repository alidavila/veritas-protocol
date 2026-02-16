# ORGANIGRAMA: FUERZA DE TRABAJO SINTÉTICA

## 1. AGENTE CEO: "El Orquestador" (Programmable Router)
*   **Misión:** Es tu mano derecha. Recibe tus órdenes de alto nivel ("Aumentar leads en sector inmobiliario") y las desglosa en tareas para los demás.
*   **Especificaciones Técnicas:**
    *   Usa un LLM avanzado (GPT-4o / Claude 3.5).
    *   Tiene acceso de "lectura/escritura" al tablero de control en Supabase.
    *   **Función Crítica:** Gestiona el "Router Programable". Si un agente subalterno falla o se queda sin presupuesto, el CEO decide si abortar o pedirte permiso. No ejecuta, delega.

## 2. AGENTE CAZADOR: "El SDR Autónomo" (Sales Development Rep)
*   **Misión:** Encontrar clientes que *necesitan* lo que vendemos (Visibilidad GEO). Escanea la web buscando empresas que son invisibles para la IA.
*   **Especificaciones Técnicas:**
    *   **Herramientas:** Scraping web (Firecrawl/Apify), Google Search API.
    *   **Workflow:**
        1. Busca "Clínicas dentales en [Ciudad]".
        2. Analiza sus webs: "¿Tienen Schema Markup? ¿Tienen API pública?".
        3. Genera un "Informe de Invisibilidad" automático: "Hola Clínica X, ChatGPT no puede leer tus precios. Estás perdiendo clientes".
    *   **KPI:** 100 auditorías enviadas/día.

## 3. AGENTE ARQUITECTO: "El Ingeniero MCP"
*   **Misión:** Entregar el producto. Cuando el Cazador consigue un interesado, este agente construye la solución técnica básica.
*   **Especificaciones Técnicas:**
    *   **Conexión:** Supabase Edge Functions + MCP.
    *   **Workflow:**
        1. Recibe la URL del cliente.
        2. Genera automáticamente el código JSON-LD (Schema.org) optimizado para que Google/GPT lo lean.
        3. Prepara un endpoint MCP básico ("Hola Mundo") para que los agentes del cliente puedan conectarse.
    *   **Valor:** Entrega el trabajo técnico en segundos, no semanas.

## 4. AGENTE TESORERO: "El Financiero" (Skyfire/x402)
*   **Misión:** Asegurar que el dinero entre y salga. Gestiona la billetera de la empresa.
*   **Especificaciones Técnicas:**
    *   **Integración:** Wallet MPC (Coinbase/Skyfire).
    *   **Autonomía:**
        *   **Cobrar:** Emite solicitudes de pago x402. Si el cliente quiere descargar el "Informe de Invisibilidad" completo o el código JSON-LD, el Agente Tesorero le cobra $5 o $50 USDC automáticamente.
        *   **Pagar:** Paga las facturas de la API de OpenAI y los servidores de Supabase para que la empresa no se detenga. Tiene un límite de gasto diario (ej. $20).

## 5. AGENTE CENTINELA: "El Abogado/Compliance"
*   **Misión:** Evitar que la empresa quiebre o alucine. Es el freno de mano.
*   **Especificaciones Técnicas:**
    *   **Lógica:** Basado en "Mandatos" (AP2) y políticas de seguridad.
    *   **Función:** Revisa cada salida del Agente Cazador antes de enviar un email. ¿Es ofensivo? ¿Promete algo ilegal? Si detecta riesgo, bloquea el envío y te alerta.
    *   **Seguridad:** Verifica que los pagos salientes del Tesorero coincidan con el trabajo realizado (evita robos).
