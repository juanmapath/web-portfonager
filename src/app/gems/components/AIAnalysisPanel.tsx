'use client';

import React, { useRef, useEffect } from 'react';
import { Loader2, BrainCircuit, RefreshCw, Copy, Check } from 'lucide-react';
import { SelectedAsset } from '@/app/api/types';

// ─── Minimal markdown → JSX renderer ─────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H1
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-lg font-bold text-white mt-4 mb-2 leading-snug">
          {inlineParse(line.slice(2))}
        </h1>
      );
    }
    // H2
    else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-sm font-bold text-[var(--holo-blue)] mt-5 mb-1.5 uppercase tracking-wide border-b border-white/5 pb-1">
          {inlineParse(line.slice(3))}
        </h2>
      );
    }
    // H3
    else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-xs font-bold text-gray-300 mt-3 mb-1">
          {inlineParse(line.slice(4))}
        </h3>
      );
    }
    // Table header separator row (|---|---|) — skip rendering
    else if (/^\|[-\s|]+\|$/.test(line)) {
      i++;
      continue;
    }
    // Table row
    else if (line.startsWith('|')) {
      const cells = line.split('|').filter(Boolean).map(c => c.trim());
      const isHeader = lines[i + 1]?.match(/^\|[-\s|]+\|$/);
      elements.push(
        <tr key={i} className={`border-b border-white/[0.06] ${isHeader ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}>
          {cells.map((cell, ci) => (
            isHeader
              ? <th key={ci} className="px-3 py-2 text-[10px] font-bold uppercase text-gray-400 text-left">{inlineParse(cell)}</th>
              : <td key={ci} className="px-3 py-2 text-xs text-gray-300">{inlineParse(cell)}</td>
          ))}
        </tr>
      );
      // Wrap consecutive table rows in a <table>
      if (!elements.find((el, idx) => idx < elements.length - 1 && React.isValidElement(el) && (el as React.ReactElement).type === 'table')) {
        const tableRows: React.ReactNode[] = [];
        let j = i;
        while (j < lines.length && (lines[j].startsWith('|') || /^\|[-\s|]+\|$/.test(lines[j]))) {
          j++;
        }
        // Replace last pushed element with a wrapped table
        if (i === 0 || !lines[i-1].startsWith('|')) {
          elements.pop();
          const tableChildren: React.ReactNode[] = [];
          for (let k = i; k < j; k++) {
            const row = lines[k];
            if (/^\|[-\s|]+\|$/.test(row)) continue;
            const rowCells = row.split('|').filter(Boolean).map(c => c.trim());
            const isHead = lines[k + 1]?.match(/^\|[-\s|]+\|$/);
            tableChildren.push(
              <tr key={k} className={`border-b border-white/[0.06] ${isHead ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}>
                {rowCells.map((cell, ci) => (
                  isHead
                    ? <th key={ci} className="px-3 py-2 text-[10px] font-bold uppercase text-gray-400 text-left">{inlineParse(cell)}</th>
                    : <td key={ci} className="px-3 py-2 text-xs text-gray-300">{inlineParse(cell)}</td>
                ))}
              </tr>
            );
          }
          elements.push(
            <div key={`table-${i}`} className="overflow-x-auto my-3 rounded-lg border border-white/10">
              <table className="w-full text-left border-collapse">{tableChildren}</table>
            </div>
          );
          i = j;
          continue;
        }
      }
    }
    // Bullet point
    else if (line.match(/^[-*]\s/)) {
      elements.push(
        <li key={i} className="text-xs text-gray-300 ml-4 mb-1 list-disc marker:text-[var(--holo-blue)]">
          {inlineParse(line.slice(2))}
        </li>
      );
    }
    // Numbered item
    else if (line.match(/^\d+\.\s/)) {
      elements.push(
        <li key={i} className="text-xs text-gray-300 ml-4 mb-1 list-decimal">
          {inlineParse(line.replace(/^\d+\.\s/, ''))}
        </li>
      );
    }
    // Verdict / classification line
    else if (line.includes('CLASIFICACIÓN:') || line.includes('TOP PICK') || line.includes('HOLD') || line.includes('AVOID')) {
      const isTop = line.includes('TOP PICK');
      const isAvoid = line.includes('AVOID');
      elements.push(
        <div key={i} className={`my-3 px-4 py-3 rounded-lg border font-bold text-sm text-center uppercase tracking-widest mono ${
          isTop ? 'bg-green-500/10 border-green-500/30 text-green-400' :
          isAvoid ? 'bg-red-500/10 border-red-500/30 text-red-400' :
          'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
        }`}>
          {inlineParse(line.replace(/\[|\]/g, ''))}
        </div>
      );
    }
    // Empty line → spacing
    else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />);
    }
    // Regular paragraph
    else {
      elements.push(
        <p key={i} className="text-xs text-gray-300 leading-relaxed mb-1">
          {inlineParse(line)}
        </p>
      );
    }

    i++;
  }
  return elements;
}

/** Handle inline **bold** and *italic* */
function inlineParse(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/\*(.+?)\*/);

    const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;
    const italicIdx = italicMatch ? remaining.indexOf(italicMatch[0]) : Infinity;

    if (boldMatch && boldIdx <= italicIdx) {
      if (boldIdx > 0) parts.push(remaining.slice(0, boldIdx));
      parts.push(<strong key={key++} className="text-white font-semibold">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldIdx + boldMatch[0].length);
    } else if (italicMatch) {
      if (italicIdx > 0) parts.push(remaining.slice(0, italicIdx));
      parts.push(<em key={key++} className="text-gray-400 italic">{italicMatch[1]}</em>);
      remaining = remaining.slice(italicIdx + italicMatch[0].length);
    } else {
      parts.push(remaining);
      break;
    }
  }
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface AIAnalysisPanelProps {
  asset: SelectedAsset | null;
  analysis: string;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function AIAnalysisPanel({
  asset,
  analysis,
  isLoading,
  error,
  onRetry,
}: AIAnalysisPanelProps) {
  const [copied, setCopied] = React.useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [analysis]);

  const handleCopy = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!asset) {
    return (
      <div className="glass-card rounded-xl border-white/5 bg-white/[0.02] backdrop-blur-md flex flex-col items-center justify-center py-16 gap-3">
        <BrainCircuit className="w-10 h-10 text-white/10" />
        <p className="text-sm text-gray-600 italic">
          Selecciona un activo en la tabla para generar el análisis AI
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.01] shrink-0">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-[var(--holo-blue)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            AI Quant Analysis
          </span>
          <span className="mono text-[10px] text-[var(--holo-blue)] border border-[var(--holo-blue)]/30 px-1.5 py-0.5 rounded">
            {asset.ticker}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {analysis && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/20"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          )}
          <button
            onClick={onRetry}
            disabled={isLoading}
            className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-[var(--holo-blue)] transition-colors px-2 py-1 rounded border border-white/10 hover:border-[var(--holo-blue)]/30 disabled:opacity-40"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            Re-analizar
          </button>
        </div>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 min-h-[200px]">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
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

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={onRetry}
              className="text-xs text-gray-500 hover:text-white underline transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !error && analysis && (
          <div className="space-y-0.5">
            {renderMarkdown(analysis)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2 bg-black/30 border-t border-white/5 flex items-center justify-between text-[10px] mono text-gray-600">
        <span>Powered by Google Gemini · Powered by Raw Metrics Data</span>
        <span className="text-[var(--holo-blue)]/50">QUANT ENGINE v1.0</span>
      </div>
    </div>
  );
}
