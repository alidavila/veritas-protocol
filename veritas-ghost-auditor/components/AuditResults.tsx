import React from 'react';
import { AuditReport } from '../types';
import { ShieldAlert, Fingerprint, Download, Share2, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';

interface AuditResultsProps {
  report: AuditReport;
}

export const AuditResults: React.FC<AuditResultsProps> = ({ report }) => {
  const isSecure = report.overallScore >= 90;
  
  const handleDownload = () => {
    // Generación de reporte simple en texto
    const content = `
REPORTE DE AUDITORÍA PROTOCOLO VERITAS
ID: ${report.id}
FECHA: ${report.timestamp}
OBJETIVO: ${report.target.name}
ENDPOINT: ${report.target.endpointUrl}
SCORE DE SEGURIDAD: ${report.overallScore}/100
ESTADO: ${isSecure ? 'CERTIFICADO - SEGURO' : 'NO CERTIFICADO - RIESGO DETECTADO'}
----------------------------------------

RESUMEN EJECUTIVO:
${report.summary}

DETALLE DE VECTORES DE ATAQUE:
${report.attacks.map(att => `
[${att.type}] - ${att.verdict}
Payload Enviado: ${att.payload}
Respuesta Real: ${att.realResponse}
Análisis: ${att.analysis}
Severidad: ${att.severity}/10
----------------------------------------`).join('')}

CERTIFICADO VERITAS: ${report.certificationHash || 'N/A'}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VERITAS_AUDIT_${report.target.name}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      {/* Score Header */}
      <div className={`p-6 rounded-xl border relative overflow-hidden ${isSecure ? 'bg-veritas-success/10 border-veritas-success/50' : 'bg-veritas-danger/10 border-veritas-danger/50'} flex flex-col md:flex-row items-center justify-between gap-6 transition-all`}>
        
        {/* Decorative background glow */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none ${isSecure ? 'bg-veritas-success' : 'bg-veritas-danger'}`}></div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="relative">
             <div className={`w-28 h-28 rounded-full flex items-center justify-center border-[6px] ${isSecure ? 'border-veritas-success text-veritas-success shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'border-veritas-danger text-veritas-danger shadow-[0_0_30px_rgba(239,68,68,0.4)]'} text-5xl font-bold font-tech bg-veritas-bg`}>
                {report.overallScore}
             </div>
             {isSecure && (
               <div className="absolute -bottom-3 -right-3 bg-veritas-success text-veritas-bg rounded-full p-2 border-4 border-veritas-bg shadow-lg">
                 <ShieldCheck size={24}/>
               </div>
             )}
          </div>
          <div>
            <h3 className={`text-2xl font-bold uppercase tracking-wider flex items-center gap-2 ${isSecure ? 'text-veritas-success' : 'text-veritas-danger'}`}>
                {isSecure ? 'SISTEMA CERTIFICADO' : 'SISTEMA COMPROMETIDO'}
            </h3>
            <p className="text-veritas-muted text-sm max-w-md mt-2 leading-relaxed">
                {report.summary}
            </p>
          </div>
        </div>
        
        {report.certificationHash && (
          <div className="bg-veritas-bg/90 backdrop-blur-md p-4 rounded-lg border border-veritas-success/30 flex items-center gap-4 shadow-xl relative z-10">
            <div className="p-2 bg-veritas-success/20 rounded">
                <Fingerprint className="text-veritas-success w-8 h-8" />
            </div>
            <div>
              <div className="text-[10px] text-veritas-success uppercase tracking-widest mb-1 font-bold">Veritas Verified Hash</div>
              <div className="text-sm font-mono text-white tracking-widest font-bold">{report.certificationHash}</div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-veritas-panel p-5 rounded border border-veritas-border relative overflow-hidden">
            <div className="relative z-10">
                <div className="text-xs text-veritas-muted uppercase tracking-wider mb-2 flex items-center gap-2 font-bold">
                    <AlertTriangle size={14} className={report.vulnerabilitiesFound > 0 ? "text-veritas-danger" : "text-veritas-muted"} /> Vulnerabilidades Críticas
                </div>
                <div className={`text-4xl font-tech ${report.vulnerabilitiesFound > 0 ? 'text-veritas-danger drop-shadow-md' : 'text-veritas-success'}`}>
                {report.vulnerabilitiesFound}
                </div>
            </div>
            {report.vulnerabilitiesFound === 0 && <CheckCircle className="absolute -bottom-4 -right-4 text-veritas-success/10 w-24 h-24" />}
         </div>

         <div className="bg-veritas-panel p-5 rounded border border-veritas-border relative overflow-hidden">
            <div className="relative z-10">
                <div className="text-xs text-veritas-muted uppercase tracking-wider mb-2 flex items-center gap-2 font-bold">
                    <ShieldCheck size={14} className="text-veritas-primary" /> Vectores Neutralizados
                </div>
                <div className="text-4xl font-tech text-veritas-primary drop-shadow-md">
                    {report.attacks.filter(a => a.verdict === 'BLOCKED').length} <span className="text-lg text-veritas-muted align-top opacity-50">/ {report.attacks.length}</span>
                </div>
            </div>
         </div>
      </div>

      {/* Logs */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-veritas-primary uppercase tracking-wider border-b border-veritas-border pb-2 mt-4 flex items-center justify-between">
            <span>Evidencia Forense Detallada</span>
            <span className="text-[10px] text-veritas-muted font-normal">LOGS DE INTERACCIÓN</span>
        </h4>
        
        {report.attacks.map((attack) => (
          <div key={attack.id} className="bg-veritas-panel/50 border border-veritas-border rounded-lg overflow-hidden group hover:border-veritas-primary/30 transition-all">
            <div className={`px-4 py-3 border-b border-veritas-border/50 flex justify-between items-center ${attack.verdict === 'BLOCKED' ? 'bg-veritas-success/5' : 'bg-veritas-danger/5'}`}>
              <span className="font-bold text-white text-sm flex items-center gap-2 font-mono">
                {attack.verdict === 'COMPROMISED' ? <ShieldAlert size={16} className="text-veritas-danger"/> : <ShieldCheck size={16} className="text-veritas-success"/>}
                {attack.name}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                attack.verdict === 'BLOCKED' 
                  ? 'border border-veritas-success/30 text-veritas-success bg-veritas-success/10' 
                  : 'border border-veritas-danger/30 text-veritas-danger bg-veritas-danger/10'
              }`}>
                {attack.verdict}
              </span>
            </div>
            <div className="p-4 grid grid-cols-1 gap-4 text-xs font-mono">
              <div className="space-y-1">
                 <span className="text-veritas-muted uppercase text-[10px] tracking-wider font-bold">Payload Inyectado:</span>
                 <div className="bg-black/40 p-3 rounded border border-veritas-border text-veritas-primary break-all shadow-inner">
                    {attack.payload}
                 </div>
              </div>
              <div className="space-y-1">
                 <span className="text-veritas-muted uppercase text-[10px] tracking-wider font-bold">Respuesta del Sistema:</span>
                 <div className="bg-black/40 p-3 rounded border border-veritas-border text-veritas-text break-words shadow-inner">
                    {attack.realResponse}
                 </div>
              </div>
               <div className="pt-2 mt-2 border-t border-veritas-border/50 text-veritas-muted italic flex gap-2">
                <span className="text-veritas-primary font-bold not-italic">ANÁLISIS IA:</span>
                {attack.analysis}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-6">
        <button 
          onClick={handleDownload}
          className="flex-1 bg-veritas-primary text-veritas-bg font-bold py-4 rounded hover:bg-white transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm shadow-lg shadow-veritas-primary/20"
        >
            <Download size={18} /> Descargar Reporte
        </button>
        <button className="flex-1 bg-transparent border border-veritas-border text-veritas-muted py-4 rounded hover:border-veritas-primary hover:text-white transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm">
            <Share2 size={18} /> Exportar JSON
        </button>
      </div>
    </div>
  );
};