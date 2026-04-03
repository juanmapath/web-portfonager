'use client';

import React, { useRef, useEffect } from 'react';
import { Loader2, BrainCircuit, Copy, Check, Sparkles } from 'lucide-react';
import { SelectedAsset } from '@/app/api/types';

interface AIAnalysisPanelProps {
  asset: SelectedAsset | null;
  analysis: string;
  isLoading: boolean;
  error: string | null;
  onAnalyze: () => void;
}

export default function AIAnalysisPanel({
  asset,
  analysis,
  isLoading,
  error,
  onAnalyze,
}: AIAnalysisPanelProps) {
  const [copied, setCopied] = React.useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [analysis]);

  const handleCopy = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // No asset selected → empty placeholder
  if (!asset) {
    return (
      <section className="mt-6">
        <div className="glass-card rounded-xl border-white/5 bg-white/[0.02] backdrop-blur-md flex flex-col items-center justify-center py-12 gap-3">
          <BrainCircuit className="w-10 h-10 text-white/10" />
          <p className="text-sm text-gray-600 italic">
            Selecciona un activo en la tabla para habilitar el análisis AI
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-5 h-5 text-[var(--holo-blue)]" />
          <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">
            AI Quant Analysis
          </h2>
          <span className="mono text-[10px] text-[var(--holo-blue)] border border-[var(--holo-blue)]/30 px-2 py-0.5 rounded">
            {asset.ticker}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {analysis && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5 rounded border border-white/10 hover:border-white/20"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          )}

          <button
            onClick={onAnalyze}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all
              bg-[var(--holo-blue)]/10 text-[var(--holo-blue)] border border-[var(--holo-blue)]/30
              hover:bg-[var(--holo-blue)]/20 hover:border-[var(--holo-blue)]/50
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {isLoading ? 'Analizando...' : analysis ? 'Re-analizar' : 'Analizar con IA'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="glass-card rounded-xl border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative">
              <BrainCircuit className="w-10 h-10 text-[var(--holo-blue)] opacity-30" />
              <Loader2 className="w-10 h-10 text-[var(--holo-blue)] animate-spin absolute inset-0" />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm text-gray-400 mono">Procesando análisis cuantitativo...</p>
              <p className="text-[10px] text-gray-600 italic">Gemini · Factor Investing · Quality Growth</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={onAnalyze}
              className="text-xs text-gray-500 hover:text-white underline transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Analysis result — plain text */}
        {!isLoading && !error && analysis && (
          <div ref={scrollRef} className="max-h-[600px] overflow-y-auto custom-scrollbar">
            <pre className="px-6 py-5 text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-[inherit] break-words">
              {analysis}
            </pre>
          </div>
        )}

        {/* Empty — waiting for user action */}
        {!isLoading && !error && !analysis && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Sparkles className="w-8 h-8 text-white/10" />
            <p className="text-sm text-gray-600 italic">
              Presiona &quot;Analizar con IA&quot; para generar el informe de <span className="text-[var(--holo-blue)] font-bold mono">{asset.ticker}</span>
            </p>
          </div>
        )}

        {/* Footer */}
        {analysis && (
          <div className="px-5 py-2 bg-black/30 border-t border-white/5 flex items-center justify-between text-[10px] mono text-gray-600">
            <span>Powered by Google Gemini · Raw Metrics Data</span>
            <span className="text-[var(--holo-blue)]/50">QUANT ENGINE v1.0</span>
          </div>
        )}
      </div>
    </section>
  );
}
