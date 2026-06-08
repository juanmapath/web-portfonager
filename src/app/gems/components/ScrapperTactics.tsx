'use client';

import React, { useState, useEffect } from 'react';
import { apiGemsfinderClient } from '@/app/api/client';
import { Tactic, SelectedAsset } from '@/app/api/types';
import { Loader2, ChevronDown, Activity, TrendingUp, BarChart3, Database, Search, Sliders, Play, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CompetitorAnalysis from './CompetitorAnalysis';

export default function ScrapperTactics({ onAssetSelect }: { onAssetSelect?: (asset: SelectedAsset) => void }) {
  const [tactics, setTactics] = useState<Tactic[]>([]);
  const [selectedTactic, setSelectedTactic] = useState<Tactic | null>(null);
  const [assets, setAssets] = useState<SelectedAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingTactics, setIsLoadingTactics] = useState(true);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRunningScreener, setIsRunningScreener] = useState(false);
  const [screenerStatus, setScreenerStatus] = useState<'success' | 'error' | null>(null);
  const [screenerMessage, setScreenerMessage] = useState('');

  // Fetch tactics on mount
  useEffect(() => {
    async function loadTactics() {
      try {
        const data = await apiGemsfinderClient.getTactics();
        setTactics(data);
        if (data.length > 0) {
          setSelectedTactic(data[0]);
        }
      } catch (err) {
        console.error('Error loading tactics:', err);
        setError('Error al cargar tácticas de escaneo.');
      } finally {
        setIsLoadingTactics(false);
      }
    }
    loadTactics();
  }, []);

  const handleRunScreener = async () => {
    setIsRunningScreener(true);
    setScreenerStatus(null);
    try {
      const result = await apiGemsfinderClient.runScreener();
      setScreenerStatus('success');
      setScreenerMessage(result.detail || 'GemsFinder screener encolado exitosamente.');
      // Refresh tactics list to get potential updates (e.g. latest session ID changes eventually)
      const data = await apiGemsfinderClient.getTactics();
      setTactics(data);
      if (selectedTactic) {
        const updated = data.find(t => t.id === selectedTactic.id);
        if (updated) {
          setSelectedTactic(updated);
        }
      }
    } catch (err: any) {
      console.error('Error running screener:', err);
      setScreenerStatus('error');
      setScreenerMessage(err.message || 'Error al ejecutar el screener.');
    } finally {
      setIsRunningScreener(false);
    }
  };

  // Fetch assets when selectedTactic changes
  useEffect(() => {
    async function loadAssets() {
      if (!selectedTactic || selectedTactic.latest_session_id === null) {
        setAssets([]);
        return;
      }

      setIsLoadingAssets(true);
      try {
        const data = await apiGemsfinderClient.getAssets(selectedTactic.latest_session_id);
        setAssets(data);
      } catch (err) {
        console.error('Error loading assets:', err);
        setError('Error al cargar activos de la sesión actual.');
      } finally {
        setIsLoadingAssets(false);
      }
    }
    loadAssets();
  }, [selectedTactic]);

  const handleTacticChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tacticId = parseInt(e.target.value);
    const tactic = tactics.find(t => t.id === tacticId);
    if (tactic) {
      setSelectedTactic(tactic);
      setSearchQuery('');
    }
  };

  const formatMetric = (val: string | undefined) => {
    if (val === undefined || val === null || val === 'N/A') return '-';
    return val;
  };

  const filteredAssets = assets.filter(asset => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const tickerMatch = (asset.ticker || '').toLowerCase().includes(q);
    const nameMatch = (asset.company_name || '').toLowerCase().includes(q);
    const industryMatch = (asset.industry || '').toLowerCase().includes(q);
    return tickerMatch || nameMatch || industryMatch;
  });

  return (
    <section className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Activity className="text-[var(--holo-blue)] w-6 h-6" />
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase italic">Scrapper Tactics</h2>
        </div>

        <button
          onClick={handleRunScreener}
          disabled={isRunningScreener}
          style={{
            background: 'linear-gradient(90deg, #00d4ff 0%, #00ff94 100%)',
            boxShadow: '0 0 15px rgba(0, 212, 255, 0.4)',
          }}
          className="flex items-center gap-2 px-4 py-2 text-black font-extrabold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none text-xs uppercase tracking-wider font-mono border border-white/20"
        >
          {isRunningScreener ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              Ejecutando...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-black" />
              Ejecutar Screener
            </>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {screenerStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 backdrop-blur-md ${
              screenerStatus === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                : 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
            }`}
          >
            <div className="flex items-center gap-3">
              {screenerStatus === 'success' ? (
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-green-400" />
              ) : (
                <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-red-400" />
              )}
              <div className="flex flex-col">
                <span className="font-bold uppercase tracking-wider mono text-[10px]">
                  {screenerStatus === 'success' ? 'Operación Exitosa' : 'Error de Ejecución'}
                </span>
                <span className="mono mt-0.5 text-gray-300">{screenerMessage}</span>
              </div>
            </div>
            <button
              onClick={() => setScreenerStatus(null)}
              className="text-gray-500 hover:text-white transition-colors p-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left column: Tactics Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-5 rounded-xl border-white/5 bg-white/[0.02] backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--holo-blue)]" />
            <label className="block text-xs font-semibold text-[var(--holo-blue)] uppercase tracking-widest mb-2 px-1">
              Seleccionar Táctica
            </label>

            <div className="relative group">
              {isLoadingTactics ? (
                <div className="flex items-center gap-2 text-gray-500 py-2 mono italic">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando...
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedTactic?.id || ''}
                    onChange={handleTacticChange}
                    className="w-full bg-black/40 border border-white/10 text-white py-2.5 pl-3 pr-10 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-[var(--holo-blue)] transition-all cursor-pointer mono"
                  >
                    {tactics.map(t => (
                      <option key={t.id} value={t.id} className="bg-neutral-900">
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-[var(--holo-blue)]" />
                </div>
              )}
            </div>

            {selectedTactic && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                  <Sliders className="w-3.5 h-3.5 text-[var(--holo-blue)]" />
                  <span>Parámetros de Táctica</span>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-lg p-3 max-h-[280px] overflow-y-auto custom-scrollbar pr-1.5 space-y-2">
                  {selectedTactic.params && Object.keys(selectedTactic.params).length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                      {Object.entries(selectedTactic.params).map(([key, val]) => (
                        <div
                          key={key}
                          className="p-2 bg-white/[0.02] border border-white/5 rounded flex items-center justify-between text-xs mono hover:border-white/10 transition-colors"
                        >
                          <span className="text-gray-400 text-[11px] truncate mr-2 font-sans font-medium" title={key}>
                            {key}
                          </span>
                          <span className="font-bold text-[var(--holo-blue)] bg-[var(--holo-blue)]/10 px-2 py-0.5 rounded text-[11px] border border-[var(--holo-blue)]/20">
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic p-2 text-center">
                      Sin parámetros definidos
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Assets Table */}
        <div className="lg:col-span-3">
          <div className="glass-card rounded-xl border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden min-h-[420px] flex flex-col">
            <div className="p-4 border-b border-white/10 flex flex-wrap justify-between items-center gap-3 bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Assets por Ranking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por asset o industria..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-black/40 border border-white/10 text-white text-xs py-1.5 pl-8 pr-3 rounded focus:outline-none focus:ring-1 focus:ring-[var(--holo-blue)] transition-all w-48 sm:w-64 mono"
                  />
                </div>
                <span className="text-[10px] mono text-gray-500">{filteredAssets.length} Resultados</span>
              </div>
            </div>

            <div className="h-[340px] overflow-y-auto overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter bg-black sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-1 border-b border-white/5">Asset</th>
                    <th className="px-5 py-1 border-b border-white/5">Industry</th>
                    <th className="px-5 py-1 border-b border-white/5 text-right">Score</th>
                    <th className="px-5 py-1 border-b border-white/5 text-right">P/FCF</th>
                    <th className="px-5 py-1 border-b border-white/5 text-right">ROE</th>
                    <th className="px-5 py-1 border-b border-white/5 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <AnimatePresence mode="popLayout">
                    {isLoadingAssets ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-[var(--holo-blue)] animate-spin" />
                            <span className="mono text-gray-500 uppercase italic">Escaneando base de datos...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredAssets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-20 text-center text-gray-500 italic">
                          No se encontraron activos para esta búsqueda.
                        </td>
                      </tr>
                    ) : (
                      filteredAssets.map((asset, index) => (
                        <motion.tr
                          key={asset.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => { setSelectedAssetId(asset.id); onAssetSelect?.(asset); }}
                          className={`
                            cursor-pointer transition-colors border-b border-white/[0.02] group
                            ${selectedAssetId === asset.id ? 'bg-[var(--holo-blue)]/10' : 'hover:bg-white/[0.04]'}
                          `}
                        >
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <span className="mono font-bold text-[var(--holo-blue)] group-hover:text-cyan-400">
                                {asset.ticker || '???'}
                              </span>
                              <span className="text-[10px] text-gray-500 group-hover:text-gray-400 leading-tight">
                                {asset.company_name || 'Unknown Company'}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-300">
                            {asset.industry || '-'}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className={`
                              mono px-2 py-0.5 rounded-sm text-xs font-bold
                              ${(asset.score || 0) > 0.8 ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}
                            `}>
                              {typeof asset.score === 'number' ? asset.score.toFixed(3) : '-'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right mono text-xs text-gray-400">
                            {formatMetric(asset.raw_metrics?.price_per_fcf)}
                          </td>
                          <td className="px-5 py-4 text-right mono text-xs text-gray-400">
                            {formatMetric(asset.raw_metrics?.roe)}
                          </td>
                          <td className="px-5 py-4 text-right mono text-xs text-gray-400">
                            {formatMetric(asset.raw_metrics?.oper_margin)}
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 uppercase mono">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live Terminal
                </span>
                <span>Session ID: #{selectedTactic?.latest_session_id}</span>
              </div>
              <div className="flex gap-4">
                <span>API-REF: GEMS_FINDER_V1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competitor Analysis - shown when an asset row is selected */}
      {selectedAssetId && (() => {
        const target = assets.find(a => a.id === selectedAssetId);
        return target ? <CompetitorAnalysis targetAsset={target} /> : null;
      })()}



      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 243, 255, 0.2);
        }
      `}</style>
    </section>
  );
}
