# DIRECTIVA DE PROYECTO: "PROTOCOLO VERITAS" (Infraestructura de Comercio Agéntico)

**PARA:** Agente de Desarrollo / Arquitecto de Software
**DE:** CEO / Arquitecto de Producto
**OBJETIVO FINAL:** Construir una **Empresa Autónoma Descentralizada** que provea la infraestructura de confianza, pagos y datos para la economía de agentes de IA. No es un chatbot; es la "Visa + el Pasaporte" para que los agentes operen en internet.

---

### 1. LA IDEA DE NEGOCIO (El "Qué" y "Por Qué")
Estamos construyendo el **sistema operativo para el comercio B2A (Business-to-Agent) y A2A (Agent-to-Agent)**.
*   **El Problema:** Los agentes de IA actuales son "turistas sin cartera". No pueden pagar, no tienen identidad verificable y no pueden "ver" los datos de productos en webs normales.
*   **La Solución:** "Veritas". Un servidor MCP maestro que dota a cualquier agente de:
    1.  **Identidad:** Un pasaporte criptográfico (DID/VC) para probar quién es y quién es su dueño,.
    2.  **Billetera:** Capacidad de pagar micro-transacciones (x402) o compras grandes (AP2/ACP) de forma autónoma,.
    3.  **Visibilidad:** Un traductor que convierte datos de empresas (inventarios, servicios) en formatos legibles por IA (GEO/Schema),.

---

### 2. ARQUITECTURA TÉCNICA (El "Cómo" - Stack 360°)
No vamos a construir un monolito. Vamos a construir una **"Célula GenAI-Nativa"** (basado en principios de arquitectura autónoma).

*   **Cerebro & Memoria (Supabase + MCP):**
    *   Usaremos **Supabase** como la fuente de verdad (PostgreSQL).
    *   Implementaremos un **Servidor MCP (Model Context Protocol)** usando `mcp-lite` en **Supabase Edge Functions**. Esto expone la base de datos como "Herramientas" para que los agentes lean/escriban de forma segura,.
*   **Rieles Financieros (Híbrido x402 + AP2):**
    *   **Micro-pagos (A2A):** Implementaremos el protocolo **x402** (Coinbase) sobre la red Base. Permite a los agentes pagar centavos por llamadas API o datos usando USDC. Respuesta HTTP 402 = "Pago Requerido" -> Agente firma -> Acceso concedido,.
    *   **Macro-comercio (B2C):** Soportaremos **Google AP2** (Protocolo de Pagos de Agentes) para emitir "Mandatos" (intenciones de compra firmadas) para transacciones mayores que requieren auditoría.
*   **Identidad (Verifiable Credentials):**
    *   Emitiremos **DIDs (Identificadores Descentralizados)** para cada agente registrado, permitiendo verificar "quién autorizó a este bot a gastar dinero".

---

### 3. FASES DE CONSTRUCCIÓN (Roadmap de Ejecución)

#### **FASE 1: El Núcleo de Memoria (Día 1-7)**
*   **Objetivo:** Que el Agente pueda leer/escribir en su propia base de datos sin alucinar.
*   **Tarea Técnica:**
    1.  Desplegar proyecto en Supabase.
    2.  Configurar `pgvector` for semantic memory (RAG).
    3.  Crear un servidor MCP en una Edge Function que exponga herramientas: `query_inventory`, `save_transaction`, `log_error`.
    4.  **Hito:** El agente recibe una instrucción en lenguaje natural y ejecuta un SQL válido en Supabase,.

#### **FASE 2: Autonomía Económica (Día 8-21)**
*   **Objetivo:** Que el Agente pueda cobrar y pagar.
*   **Tarea Técnica:**
    1.  Integrar SDK de **x402** o **Skyfire**.
    2.  Crear un endpoint que devuelva un error `402 Payment Required` si un agente externo intenta acceder a un dato premium.
    3.  Dotar a nuestro agente de una **Wallet MPC (Multi-Party Computation)** para que pueda firmar transacciones sin exponer la llave privada completa.
    4.  **Hito:** Un agente externo paga 0.01 USDC para leer un registro de nuestra base de datos.

#### **FASE 3: Visibilidad GEO (Día 22-30)**
*   **Objetivo:** Que los productos sean "invisibles" para humanos pero "irresistibles" para IAs.
*   **Tarea Técnica:**
    1.  Implementar inyección automática de **JSON-LD / Schema.org** en todos los outputs públicos.
    2.  Estructurar los datos de precios e inventario para que sean legibles por **ChatGPT Search** y **Perplexity** (Estrategia GEO).

---

### 4. ESTRATEGIA DE RENTABILIDAD Y MONETIZACIÓN 💰
Esta empresa gana dinero de 3 formas automáticas:

1.  **Peaje de Infraestructura (The Toll Booth):** Cobramos una micro-comisión (ej. 0.5%) por cada transacción que un agente procese a través de nuestro protocolo x402/AP2.
2.  **Venta de Datos Sintéticos:** Nuestros agentes generan datos de comportamiento de mercado. Empaquetamos y vendemos estos datasets a empresas que necesitan entrenar sus modelos (Mercado de Datos Sintéticos).
3.  **Identidad como Servicio:** Cobramos a empresas por emitir "Credenciales Verificables" (VCs) para sus agentes, dándoles legitimidad para operar en la red.

---

### 5. ESTRATEGIA DE VIRALIDAD (El "Caballo de Troya GEO") 🚀
No haremos marketing para humanos. Haremos **GEO (Generative Engine Optimization)**.
*   **La Táctica:** Creamos una herramienta gratuita "Auditoría de Visibilidad IA". Las empresas ponen su URL y les decimos: "Tu web es invisible para ChatGPT. Instala Veritas para que los agentes te vean".
*   **El Efecto de Red:** Cada empresa que instala Veritas se convierte en un nodo que acepta nuestros pagos x402, expandiendo el ecosistema automáticamente.

---

### 6. CÓMO LOGRAR LA "EMPRESA AUTÓNOMA" (Agentes trabajando entre sí)
Para que esto funcione solo, implementaremos el patrón **"Organic Substrate"**:
*   **Agente CEO (Orquestador):** Define objetivos de alto nivel ("Aumentar liquidez en 10%").
*   **Agente Developer:** Escribe y despliega mejoras en las Edge Functions (usando MCP para leer la base de código).
*   **Agente Sales:** Escanea la web buscando empresas con mal GEO, genera un reporte y lo envía.
*   **Protocolo Interno:** Los agentes se pagan entre sí. Si el Agente Sales cierra un trato, transfiere una comisión (tokens internos) al Agente Developer que mantuvo el servidor. Esto alinea incentivos matemáticamente.
