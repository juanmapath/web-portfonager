'use client';

import React, { useRef } from 'react';
import { BrainCircuit, Copy, Check, Sparkles, ExternalLink, Terminal } from 'lucide-react';
import { SelectedAsset } from '@/app/api/types';

interface AIAnalysisPanelProps {
  asset: SelectedAsset | null;
  promptText: string;
}

export default function AIAnalysisPanel({ asset, promptText }: AIAnalysisPanelProps) {
  const [copied, setCopied] = React.useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = () => {
    if (promptText) {
      navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!asset) {
    return (
      <section className="mt-6">
        <div className="glass-card rounded-xl border-white/5 bg-white/[0.02] backdrop-blur-md flex flex-col items-center justify-center py-12 gap-3">
          <BrainCircuit className="w-10 h-10 text-white/10" />
          <p className="text-sm text-gray-600 italic">
            Selecciona un activo en la tabla para preparar el prompt de análisis AI
          </p>
        </div>
      </section>
    );
  }

  const aiPlatforms = [
    { name: 'ChatGPT', url: 'https://chatgpt.com', color: 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' },
    { name: 'Claude', url: 'https://claude.ai', color: 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' },
    { name: 'Gemini', url: 'https://gemini.google.com', color: 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' },
    { name: 'Perplexity', url: 'https://www.perplexity.ai', color: 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' },
  ];

  return (
    <section className="mt-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-5 h-5 text-[var(--holo-blue)]" />
          <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">
            AI Quant Analysis Prompt Generator
          </h2>
          <span className="mono text-[10px] text-[var(--holo-blue)] border border-[var(--holo-blue)]/30 px-2 py-0.5 rounded">
            {asset.ticker}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all
              bg-[var(--holo-blue)]/10 text-[var(--holo-blue)] border border-[var(--holo-blue)]/30
              hover:bg-[var(--holo-blue)]/20 hover:border-[var(--holo-blue)]/50 shadow-lg shadow-[var(--holo-blue)]/5"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Prompt Copiado con Éxito' : 'Copiar Prompt para IA'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="glass-card rounded-xl border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden flex flex-col">
        {/* Banner de plataformas */}
        <div className="p-4 bg-black/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Sparkles className="w-4 h-4 text-[var(--holo-blue)]" />
            <span>Copia el prompt y pégalo en tu plataforma de IA favorita:</span>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            {aiPlatforms.map(platform => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors mono ${platform.color}`}
              >
                <span>{platform.name}</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            ))}
          </div>
        </div>

        {/* Prompt Content */}
        <div className="p-4 bg-neutral-950/60 relative">
          <div className="absolute top-3 right-4 flex items-center gap-1.5 text-[10px] mono text-gray-500 uppercase tracking-widest pointer-events-none">
            <Terminal className="w-3.5 h-3.5 text-[var(--holo-blue)]" /> Ready to Prompt
          </div>
          <textarea
            ref={textareaRef}
            value={promptText}
            readOnly
            rows={16}
            className="w-full bg-transparent text-xs text-gray-300 mono leading-relaxed resize-y focus:outline-none custom-scrollbar border-0 p-2 selection:bg-[var(--holo-blue)]/30"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-2 bg-black/30 border-t border-white/5 flex items-center justify-between text-[10px] mono text-gray-600">
          <span>Formatted for Advanced AI Models (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro)</span>
          <span className="text-[var(--holo-blue)]/50">PROMPT ENGINE v2.0</span>
        </div>
      </div>
    </section>
  );
}
