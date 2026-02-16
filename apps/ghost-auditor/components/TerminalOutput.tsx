import React from 'react';
import { SupabasePayload } from '../types';
import { Copy, Check } from 'lucide-react';

interface TerminalOutputProps {
  data: SupabasePayload | null;
  loading: boolean;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ data, loading }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!data && !loading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-veritas-700 font-mono text-sm border-2 border-dashed border-veritas-700 rounded-lg p-8 opacity-50">
        // ESPERANDO DATOS DE ENTRADA...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-veritas-900 rounded-lg border border-veritas-700 shadow-2xl overflow-hidden flex flex-col">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-veritas-800 border-b border-veritas-700">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
        </div>
        <div className="text-xs font-mono text-veritas-accent opacity-70">SUPABASE_INSERT_PAYLOAD.JSON</div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 p-6 overflow-auto font-mono text-sm relative">
        {loading ? (
          <div className="flex flex-col space-y-2 text-veritas-accent">
            <p className="animate-pulse">> INICIANDO PROTOCOLO DE GENERACIÓN...</p>
            <p className="animate-pulse delay-75">> CONTACTANDO NÚCLEO VERITAS...</p>
            <p className="animate-pulse delay-150">> CALCULANDO HASH CRIPTOGRÁFICO...</p>
            <p className="animate-pulse delay-300">> FORMATO DE SALIDA: JSON...</p>
          </div>
        ) : (
          <>
            <pre className="text-emerald-400 language-json">
              {JSON.stringify(data, null, 2)}
            </pre>
            
            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 p-2 rounded bg-veritas-800 hover:bg-veritas-700 text-veritas-accent transition-colors border border-veritas-700"
              title="Copiar JSON"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </>
        )}
      </div>
      
      {/* Decorative Scan Line */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-veritas-accent/5 to-transparent h-[10%] w-full animate-scan opacity-20"></div>
    </div>
  );
};
