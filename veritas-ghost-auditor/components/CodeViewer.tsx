import React from 'react';
import { Copy, Terminal, Check } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  filename: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, filename }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-lg border border-veritas-border overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-black">
        <div className="flex items-center gap-2">
            <Terminal size={14} className="text-veritas-primary" />
            <span className="text-xs font-mono text-gray-300">{filename}</span>
        </div>
        <button 
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
            {copied ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>}
            {copied ? 'COPIADO' : 'COPIAR'}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <pre className="font-mono text-xs md:text-sm text-green-400 leading-relaxed whitespace-pre-wrap">
            {code}
        </pre>
      </div>
    </div>
  );
};
