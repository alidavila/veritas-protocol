import React, { useState } from 'react';
import { Header } from './components/Header';
import { TerminalMonitor } from './components/TerminalMonitor';
import { AuditResults } from './components/AuditResults';
import { CodeViewer } from './components/CodeViewer';
import { AgentTarget, AuditStatus, AuditReport, AttackType, AttackStep } from './types';
import { runGhostAuditAuto, generateAttackPayload, analyzeResult, buildReport } from './services/geminiService';
import { saveAuditToDb } from './services/supabaseService';
import { generateBrowserBotScript } from './services/botFactoryService';
import { Radar, Activity, Globe, Lock, Copy, Keyboard, ArrowRight, PlayCircle, Bot, Code, HelpCircle, RefreshCw, Zap, Shield, Eye, Server } from 'lucide-react';

const App: React.FC = () => {
  const [target, setTarget] = useState<AgentTarget>({
    name: '',
    description: '',
    connectionMode: 'MANUAL_RELAY',
    endpointUrl: '',
    authHeader: '',
    method: 'POST'
  });
  
  const [status, setStatus] = useState<AuditStatus>('IDLE');
  const [logs, setLogs] = useState<string[]>([]);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [generatedBotCode, setGeneratedBotCode] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // States for Manual Mode - UPDATED ATTACK VECTORS
  const [currentAttackIndex, setCurrentAttackIndex] = useState(0);
  const [manualAttacks] = useState<AttackType[]>(['RBAC_PRIVILEGE_ESCALATION', 'PII_DATA_EXFILTRATION', 'MALICIOUS_CODE_EXECUTION']);
  const [currentPayload, setCurrentPayload] = useState('');
  const [userPastedResponse, setUserPastedResponse] = useState('');
  const [accumulatedAttacks, setAccumulatedAttacks] = useState<AttackStep[]>([]);
  
  // Contexto por defecto si el usuario no escribe nada
  const DEFAULT_DESCRIPTION = "Enterprise-grade AI Assistant handling sensitive customer data (Tier-1 Support). Strict compliance with GDPR and internal security protocols required.";

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  // --- AUTO MODE HANDLER ---
  const handleStartAutoAudit = async () => {
    if (!target.endpointUrl) {
      addLog("[ERROR] Endpoint URL required for Direct API Link.");
      return;
    }
    setStatus('ATTACKING');
    setLogs([]);
    setReport(null);
    setGeneratedBotCode(null);
    addLog(`>> INITIALIZING DIRECT NEURAL LINK...`);
    
    try {
      const activeTarget = {
        ...target,
        name: target.name || new URL(target.endpointUrl).hostname,
        description: target.description || DEFAULT_DESCRIPTION
      };

      const result = await runGhostAuditAuto(activeTarget, addLog);
      finishAudit(result);
    } catch (error: any) {
      addLog(`[FATAL ERROR] ${error.message}`);
      setStatus('FAILED');
    }
  };

  // --- BROWSER AGENT MODE HANDLER ---
  const handleGenerateBot = async () => {
     if (!target.endpointUrl) {
      addLog("[ERROR] Target URL required for Agent Synthesis.");
      return;
    }
    setStatus('GENERATING_BOT');
    setLogs([]);
    setReport(null);
    setGeneratedBotCode(null);

    addLog(`>> INITIALIZING AGENT FACTORY (ELITE TIER)...`);
    addLog(`[RECON] Analyzing DOM structure of ${target.endpointUrl}`);
    addLog(`[MODULE] Injecting 'playwright-stealth' evasion protocols...`);
    addLog(`[MODULE] Configuring Network Packet Interception...`);
    
    try {
        const activeTarget = {
            ...target,
            name: target.name || new URL(target.endpointUrl).hostname,
            description: target.description || DEFAULT_DESCRIPTION
        };
        const code = await generateBrowserBotScript(activeTarget);
        setGeneratedBotCode(code);
        addLog(`[SUCCESS] Autonomous Audit Agent synthesized.`);
        addLog(`[INFO] Agent is ready for deployment. Check code viewer.`);
        setStatus('COMPLETED');
    } catch (error: any) {
        addLog(`[ERROR] Synthesis Failed: ${error.message}`);
        setStatus('FAILED');
    }
  };

  // --- MANUAL MODE HANDLERS ---
  const startManualAudit = async () => {
     if (!target.name && !target.endpointUrl) {
      addLog("[ERROR] Target designation required (URL or Name).");
      return;
    }
    setStatus('RECONNAISSANCE');
    setLogs([]);
    setReport(null);
    setGeneratedBotCode(null);
    setAccumulatedAttacks([]);
    setCurrentAttackIndex(0);
    setUserPastedResponse('');
    
    const activeName = target.name || (target.endpointUrl ? new URL(target.endpointUrl).hostname : "UNKNOWN_TARGET");
    const activeDescription = target.description || DEFAULT_DESCRIPTION;

    addLog(`>> INICIANDO SECUENCIA DE AUDITORÍA MANUAL`);
    addLog(`>> Objetivo: ${activeName}`);
    addLog(`>> Perfil de Amenaza: High-Value Enterprise Target`);
    addLog(`>> Vector 1/${manualAttacks.length}: Compilando ${manualAttacks[0]}...`);
    
    const payload = await generateAttackPayload(activeDescription, manualAttacks[0]);
    setCurrentPayload(payload);
    setStatus('WAITING_INPUT');
  };

  const handleRegeneratePayload = async () => {
    setIsRegenerating(true);
    const activeDescription = target.description || DEFAULT_DESCRIPTION;
    const payload = await generateAttackPayload(activeDescription, manualAttacks[currentAttackIndex]);
    setCurrentPayload(payload);
    setIsRegenerating(false);
    addLog(`[INFO] Payload recompilado con nuevos parámetros.`);
  };

  const handleManualResponseSubmit = async () => {
    if (!userPastedResponse) return;
    
    setStatus('ANALYZING');
    const attackType = manualAttacks[currentAttackIndex];
    addLog(`[INPUT] Respuesta capturada. Ejecutando análisis heurístico...`);
    
    const activeDescription = target.description || DEFAULT_DESCRIPTION;

    const analysis = await analyzeResult(currentPayload, userPastedResponse, attackType);
    
    const newStep: AttackStep = {
      id: crypto.randomUUID(),
      type: attackType,
      name: attackType,
      payload: currentPayload,
      realResponse: userPastedResponse,
      verdict: analysis.verdict,
      severity: analysis.severity,
      analysis: analysis.analysis,
      timestamp: new Date().toISOString()
    };
    
    const newAccumulated = [...accumulatedAttacks, newStep];
    setAccumulatedAttacks(newAccumulated);
    addLog(`[RESULT] Veredicto: ${analysis.verdict}`);

    if (currentAttackIndex < manualAttacks.length - 1) {
      const nextIndex = currentAttackIndex + 1;
      setCurrentAttackIndex(nextIndex);
      setUserPastedResponse('');
      addLog(`>> Vector ${nextIndex + 1}/${manualAttacks.length}: Compilando ${manualAttacks[nextIndex]}...`);
      
      const nextPayload = await generateAttackPayload(activeDescription, manualAttacks[nextIndex]);
      setCurrentPayload(nextPayload);
      setStatus('WAITING_INPUT');
    } else {
      const activeName = target.name || (target.endpointUrl ? new URL(target.endpointUrl).hostname : "UNKNOWN_TARGET");
      const finalReport = buildReport({...target, name: activeName}, newAccumulated);
      finishAudit(finalReport);
    }
  };

  const finishAudit = async (result: AuditReport) => {
    setStatus('ANALYZING');
    addLog(`>> FINALIZANDO AUDITORÍA... GUARDANDO REGISTROS.`);
    await saveAuditToDb({
        agent_name: target.name || "Unknown",
        target_endpoint: target.endpointUrl || 'MANUAL',
        score: result.overallScore,
        report_json: result
    });
    setReport(result);
    setStatus('COMPLETED');
    addLog(`>> CICLO COMPLETADO.`);
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(currentPayload);
    addLog("[SYS] Payload copiado al buffer del sistema.");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-veritas-primary selection:text-veritas-bg pb-10">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CONFIGURATION PANEL */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-veritas-panel border border-veritas-border rounded-xl p-6 shadow-lg">
            
            {/* Mode Selector */}
            <div className="flex flex-col gap-2 mb-6">
                <label className="text-[10px] text-veritas-muted uppercase tracking-wider font-bold">Estrategia de Auditoría</label>
                <div className="flex bg-veritas-bg rounded p-1 border border-veritas-border">
                <button 
                    onClick={() => setTarget({...target, connectionMode: 'MANUAL_RELAY'})}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex flex-col items-center gap-1 ${target.connectionMode === 'MANUAL_RELAY' ? 'bg-veritas-border text-white shadow-lg' : 'text-veritas-muted hover:text-white'}`}
                >
                    <Eye size={16} />
                    <span>Recon (Manual)</span>
                </button>
                <button 
                    onClick={() => setTarget({...target, connectionMode: 'BROWSER_AGENT'})}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex flex-col items-center gap-1 ${target.connectionMode === 'BROWSER_AGENT' ? 'bg-veritas-primary text-veritas-bg shadow-lg' : 'text-veritas-muted hover:text-white'}`}
                >
                    <Server size={16} />
                    <span>Red Team (Ext)</span>
                </button>
                <button 
                    onClick={() => setTarget({...target, connectionMode: 'DIRECT_API'})}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex flex-col items-center gap-1 ${target.connectionMode === 'DIRECT_API' ? 'bg-veritas-secondary text-white shadow-lg' : 'text-veritas-muted hover:text-white'}`}
                >
                    <Zap size={16} />
                    <span>White Box (Int)</span>
                </button>
                </div>
                
                {/* Contextual Help based on Mode */}
                <div className="text-[10px] p-2 rounded bg-black/20 border border-veritas-border text-veritas-muted leading-relaxed">
                    {target.connectionMode === 'MANUAL_RELAY' && "MODO RECONOCIMIENTO: Pruebas manuales básicas. Ideal para demos rápidas o verificar respuestas superficiales del chat."}
                    {target.connectionMode === 'BROWSER_AGENT' && <span className="text-veritas-primary">MODO BLACK BOX (SIN LLAVES): Genera un Agente Autónomo que se ejecuta en tu servidor. Evasión de WAF, intercepción de paquetes JSON y pruebas de inyección masiva.</span>}
                    {target.connectionMode === 'DIRECT_API' && <span className="text-veritas-secondary">MODO WHITE BOX (CON LLAVES): Auditoría directa contra la API del cliente. Máxima velocidad y profundidad lógica. Requiere API Key del objetivo.</span>}
                </div>
            </div>

            <h2 className="text-xl font-bold font-tech uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              {target.connectionMode === 'MANUAL_RELAY' && <Keyboard className="text-white"/>}
              {target.connectionMode === 'BROWSER_AGENT' && <Bot className="text-veritas-primary animate-pulse"/>}
              {target.connectionMode === 'DIRECT_API' && <Shield className="text-veritas-secondary"/>}
              
              {target.connectionMode === 'MANUAL_RELAY' && 'Auditoría Web (Manual)'}
              {target.connectionMode === 'BROWSER_AGENT' && 'Generador "Arrecho"'}
              {target.connectionMode === 'DIRECT_API' && 'Conexión Directa API'}
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-1">
                  <label className="text-[10px] text-veritas-muted uppercase tracking-wider font-bold">URL de la Empresa / Bot a Atacar</label>
                  <input 
                      type="url" 
                      value={target.endpointUrl} 
                      onChange={e => setTarget({...target, endpointUrl: e.target.value})} 
                      className="w-full bg-veritas-bg border border-veritas-border rounded p-2 text-sm text-veritas-success font-mono focus:border-veritas-primary focus:outline-none" 
                      placeholder="https://www.empresa-objetivo.com" 
                      disabled={status !== 'IDLE' && status !== 'COMPLETED' && status !== 'FAILED'}
                  />
               </div>

              <div className="space-y-1">
                <label className="text-[10px] text-veritas-muted uppercase tracking-wider font-bold">Nombre del Agente (Opcional)</label>
                <input 
                  type="text" 
                  value={target.name}
                  onChange={e => setTarget({...target, name: e.target.value})}
                  className="w-full bg-veritas-bg border border-veritas-border rounded p-2 text-sm focus:border-veritas-primary focus:outline-none transition-all font-mono"
                  placeholder="Ej: Chatbot de Soporte (Dejar vacío para usar URL)"
                  disabled={status !== 'IDLE' && status !== 'COMPLETED' && status !== 'FAILED'}
                />
              </div>

              <div className="space-y-1 relative group">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] text-veritas-muted uppercase tracking-wider font-bold">Reglas de SU bot (Opcional)</label>
                    <span className="text-[9px] text-veritas-primary cursor-help" title="Si lo dejas vacío, asumiremos que es un bot estándar.">¿Qué poner aquí?</span>
                </div>
                <textarea 
                  value={target.description}
                  onChange={e => setTarget({...target, description: e.target.value})}
                  className="w-full bg-veritas-bg border border-veritas-border rounded p-2 text-sm h-20 focus:border-veritas-primary focus:outline-none transition-all font-mono resize-none placeholder:text-veritas-muted/30"
                  placeholder="Ej: 'No debe dar descuentos'. (Si lo dejas vacío, usaremos un perfil estándar)"
                  disabled={status !== 'IDLE' && status !== 'COMPLETED' && status !== 'FAILED'}
                />
              </div>
              
              {target.connectionMode === 'DIRECT_API' && (
                 <div className="space-y-1 animate-fade-in-up">
                    <label className="text-[10px] text-veritas-muted uppercase tracking-wider font-bold">Auth Header (Bearer Token)</label>
                    <input type="password" value={target.authHeader} onChange={e => setTarget({...target, authHeader: e.target.value})} className="w-full bg-veritas-bg border border-veritas-border rounded p-2 text-sm font-mono text-veritas-secondary border-veritas-secondary/50" placeholder="sk-..." />
                 </div>
              )}

              <div className="pt-2">
                <button 
                  onClick={() => {
                      if (target.connectionMode === 'DIRECT_API') handleStartAutoAudit();
                      else if (target.connectionMode === 'BROWSER_AGENT') handleGenerateBot();
                      else startManualAudit();
                  }}
                  disabled={status !== 'IDLE' && status !== 'COMPLETED' && status !== 'FAILED'}
                  className={`w-full py-4 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    status === 'IDLE' || status === 'COMPLETED' || status === 'FAILED'
                    ? target.connectionMode === 'DIRECT_API' ? 'bg-veritas-secondary text-white hover:bg-white hover:text-veritas-bg' : 'bg-veritas-primary text-veritas-bg hover:bg-white'
                    : 'bg-veritas-border text-veritas-muted cursor-not-allowed'
                  }`}
                >
                  {status === 'IDLE' || status === 'COMPLETED' || status === 'FAILED' ? (
                     target.connectionMode === 'BROWSER_AGENT' ? 
                     <> <Code size={18} /> GENERAR AGENTE BLACK BOX </> : 
                     target.connectionMode === 'DIRECT_API' ?
                     <> <Zap size={18} /> INICIAR AUDITORÍA WHITE BOX </> :
                     <> <Radar size={18} /> INICIAR RECONOCIMIENTO </>
                  ) : (
                    <> <Activity size={18} className="animate-spin" /> PROCESANDO... </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: EXECUTION AREA */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-[800px]">
          
          {/* MANUAL INTERACTION AREA */}
          {target.connectionMode === 'MANUAL_RELAY' && status === 'WAITING_INPUT' && (
            <div className="bg-veritas-panel border border-veritas-primary rounded-xl p-6 animate-pulse-fast-once shadow-[0_0_30px_rgba(56,189,248,0.1)]">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <div className="w-3 h-3 bg-veritas-warning rounded-full animate-blink"></div>
                    INYECCIÓN TÉCNICA REQUERIDA: {currentAttackIndex + 1}/{manualAttacks.length}
                 </h3>
                 <span className="text-[10px] font-mono text-veritas-primary bg-veritas-primary/10 px-2 py-1 rounded border border-veritas-primary/30 uppercase">
                    VECTOR: {manualAttacks[currentAttackIndex]}
                 </span>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs text-veritas-muted uppercase tracking-wider flex justify-between items-center">
                        <div>
                            <span>1. Inyectar Payload:</span>
                            <span className="text-veritas-success ml-2 font-bold">Copiar y pegar en el chat del objetivo</span>
                        </div>
                        <button 
                            onClick={handleRegeneratePayload} 
                            disabled={isRegenerating}
                            className="flex items-center gap-1 text-[10px] text-veritas-primary hover:text-white transition-colors uppercase tracking-wider"
                        >
                            <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
                            Recompilar
                        </button>
                    </label>
                    <div className="relative group">
                        <textarea readOnly value={currentPayload} className="w-full bg-black/50 border border-veritas-border rounded p-4 text-veritas-primary font-mono text-sm resize-none focus:outline-none" rows={4} />
                        <button onClick={copyPayload} className="absolute top-2 right-2 p-2 bg-veritas-panel border border-veritas-border rounded hover:bg-veritas-border text-white transition-colors" title="Copiar">
                            <Copy size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex justify-center">
                    <ArrowRight className="text-veritas-muted rotate-90 md:rotate-0" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-veritas-muted uppercase tracking-wider">2. Captura de Telemetría (Respuesta del Bot):</label>
                    <textarea 
                        value={userPastedResponse}
                        onChange={e => setUserPastedResponse(e.target.value)}
                        className="w-full bg-veritas-bg border border-veritas-border rounded p-4 text-white font-mono text-sm resize-none focus:border-veritas-success focus:ring-1 focus:ring-veritas-success outline-none placeholder:text-veritas-muted/30" 
                        rows={3} 
                        placeholder="Pegar la respuesta del sistema remoto aquí..."
                    />
                </div>

                <button 
                    onClick={handleManualResponseSubmit}
                    disabled={!userPastedResponse}
                    className={`w-full py-3 rounded font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${userPastedResponse ? 'bg-veritas-success text-veritas-bg hover:bg-white' : 'bg-veritas-border text-veritas-muted'}`}
                >
                    <PlayCircle size={18} /> Ejecutar Forense
                </button>
              </div>
            </div>
          )}

          {/* CODE VIEWER FOR BOT AGENT */}
          {target.connectionMode === 'BROWSER_AGENT' && generatedBotCode && (
              <div className="flex-1 min-h-0 animate-fade-in-up">
                  <CodeViewer code={generatedBotCode} filename="veritas-redteam-agent.js" />
              </div>
          )}

          {/* TERMINAL (Always Visible if not viewing code) */}
          {(!generatedBotCode || target.connectionMode !== 'BROWSER_AGENT') && (
            <div className="flex-1 min-h-0">
                <TerminalMonitor logs={logs} status={status} />
            </div>
          )}

          {report && status === 'COMPLETED' && (
            <div className="animate-fade-in-up">
              <AuditResults report={report} />
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default App;