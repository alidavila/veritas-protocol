# 🧠 VERITAS: LÓGICA & ESTRATEGIA (40 PREGUNTAS)

Este documento desglosa cada componente del proyecto para asegurar una comprensión total del motor Veritas.

---

## 🏗️ Lógica del Negocio (Business & Revenue)

1. **¿Qué es Veritas en esencia?** Es una infraestructura de identidad (DID) y pagos (Smart Wallets) diseñada para que los agentes de IA puedan operar legal y financieramente.
2. **¿Cuál es el problema que resuelve?** Los agentes son "invisibles" para el comercio tradicional porque no tienen identidad verificable ni forma de pagar/cobrar de forma autónoma.
3. **¿Cómo genera dinero el protocolo?** A través de un "peaje" (tasa del 1%) por cada transacción que pase por el Portero (Gatekeeper) y mediante la renta de agentes especializados.
4. **¿Qué es el "Caballo de Troya GEO"?** Una auditoría gratuita que asusta a las empresas diciéndoles que son invisibles para ChatGPT, para que instalen el Portero Veritas.
5. **¿Qué significa B2A?** Business-to-Agent. Empresas vendiendo servicios o datos directamente a máquinas.
6. **¿Y A2A?** Agent-to-Agent. Un agente pagando a otro por una tarea, como un investigador pagando a un analista de datos.
7. **¿Cómo funciona el alquiler de agentes?** Los usuarios pueden desplegar instancias de agentes (Hunter, Marketer) pagando una cuota mensual en el Marketplace.
8. **¿Qué es el "Organic Substrate"?** Un ecosistema donde los agentes se pagan entre sí con tokens o crédito interno para mantenerse operativos.
9. **¿Quién es el Agente CEO?** El orquestador que recibe órdenes en lenguaje natural y delega tareas a los agentes técnicos (Hunter, Treasurer).
10. **¿Es Veritas una criptomoneda?** No, es un protocolo que usa redes existentes (como Base) para facilitar el comercio agéntico.

---

## 🖥️ Lógica del Frontend (Dashboard & UX)

1. **¿Qué hace el botón "npm install @veritas/sdk"?** Actualmente es puramente visual. Representa el futuro SDK que los desarrolladores usarán para integrar Veritas en sus propios bots.
2. **¿Por qué el botón de "Asistencia" parece no hacer nada?** Es un chat interactivo con Gemini. Si no responde, verifica que la clave `VITE_GEMINI_API_KEY` esté en tu `.env`.
3. **¿Qué es el "Nuclear Dashboard"?** Es la pestaña `VeritasHQ` donde ves el log ("Ledger") de todas las acciones de los agentes en tiempo real.
4. **¿Cómo funciona el flujo de identidad en la web?** Creas un nombre y asocias una wallet. Es un registro rápido para usuarios finales.
5. **¿Qué datos muestra el ProtocolVisualizer?** Muestra las métricas reales de Supabase: cuántos leads se han encontrado y cuánto dinero se ha movido.
6. **¿Qué hace el GeoAnalyzer?** Simula una auditoría profunda. Verifica si el sitio es accesible y asusta al usuario con un reporte de "invisibilidad" para cerrar la venta del Gatekeeper.
7. **¿Es real el escaneo del GeoAnalyzer?** Sí y no. Hace un ping real para ver si la web existe, pero el reporte de "Directivas IA" es una simulación persuasiva.
8. **¿Por qué el mapa del proyecto dice "The VISA for AIs"?** Porque Veritas valida la identidad (Pasaporte) y permite el pago (Visa).
9. **¿Qué es el Marketplace de Servicios?** Una lista de productos (Gatekeeper, Marketer) que el usuario puede "comprar" o "activar".
10. **¿Cómo se conectan los videos del Marketplace?** Se sirven directamente desde el storage de Supabase para mayor velocidad y profesionalismo.

---

## 🛠️ Lógica Técnica (CLI & Backend)

1. **¿Para qué sirve el CLI?** Para tareas de bajo nivel. Registrar "Souls" (almas de agentes), auditar sitios desde la terminal y generar código crudo.
2. **¿Qué diferencia hay entre `register` en CLI y Web?** El CLI requiere un archivo `.md` (Soul) y genera un hash criptográfico para crear un DID único y soberano.
3. **¿Qué es un DID?** Decentralized Identifier. Una dirección única que identifica al agente sin depender de un servidor central.
4. **¿Cómo funciona el Agente Portero (Gatekeeper)?** Es un script que el dueño de una web pega en su sitio. Bloquea el acceso a scrapers a menos que paguen.
5. **¿Cómo sabe el Portero si es un agente de IA?** Analiza el `User-Agent` de la petición (ej. GPTBot, ClaudeBot) y busca firmas de comportamiento robótico.
6. **¿Qué es el protocolo x402?** Basado en el error HTTP 402 (Payment Required). Si un bot quiere entrar, el servidor le pide una micro-transacción.
7. **¿Dónde se guardan todos los logs?** En la tabla `agent_ledger` de Supabase.
8. **¿Qué es el "Real-time Ledger"?** Una conexión vía WebSockets (Supabase Realtime) que actualiza el dashboard en milisegundos cuando un agente hace algo.
9. **¿Cómo se crean las wallets reales?** Intentamos conectar con un backend local (`localhost:3000`) que usa el SDK de Coinbase CDP.
10. **¿Qué pasa si el backend de wallets no está corriendo?** El sistema usa una wallet de "mock" (simulada) para que la demo no se rompa.

---

## 🎭 Lógica de los Agentes (Especialistas)

1. **¿Qué hace el Agente Cazador (Hunter)?** Escanea URLs buscando empresas que no están optimizadas para IA y genera reportes de venta.
2. **¿Qué hace el Agente Tesorero (Treasurer)?** Vigila el balance de la empresa y decide cuándo mover fondos para pagar servidores o cobrar facturas.
3. **¿Qué hace el Agente Centinela?** Actúa como un abogado. Revisa que los agentes no prometan cosas ilegales y que los pagos coincidan con el trabajo.
4. **¿Cómo "alquila" alguien un agente?** En el Marketplace, al darle "Deploy", el sistema crea el registro en la base de datos y activa el proceso de ese agente.
5. **¿Pueden los agentes trabajar entre sí?** Sí, el CEO puede ordenar al Cazador buscar clientes y al Arquitecto preparar el código para esos clientes.
6. **¿Qué es un "Mandato" (AP2)?** Una instrucción firmada que autoriza a un agente a gastar hasta cierta cantidad de dinero.
7. **¿Cómo se "mata" a un agente?** Desde el Dashboard o CLI, cambiando su estado a `stopped` en la tabla `agent_control`.
8. **¿Qué es el "Grit" de un agente?** Es su persistencia. Un agente con alto grit reintenta tareas fallidas usando diferentes estrategias.
9. **¿Por qué usamos Gemini y no solo GPT-4?** Gemini nos permite ventanas de contexto masivas para leer códigos enteros y manuales de usuario rápidamente.
10. **¿Cuál es el siguiente paso (Fase 2)?** Pasar de las wallets simuladas a transacciones reales en Base Sepolia con agentes operando 24/7.
