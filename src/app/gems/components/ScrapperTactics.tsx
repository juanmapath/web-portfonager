'use client';

import React, { useState, useEffect } from 'react';
import { apiGemsfinderClient } from '@/app/api/client';
import { Tactic, SelectedAsset } from '@/app/api/types';
import { Loader2, ChevronDown, Activity, TrendingUp, BarChart3, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CompetitorAnalysis from './CompetitorAnalysis';

export default function ScrapperTactics({ onAssetSelect }: { onAssetSelect?: (asset: SelectedAsset) => void }) {
  const [tactics, setTactics] = useState<Tactic[]>([]);
  const [selectedTactic, setSelectedTactic] = useState<Tactic | null>(null);
  const [assets, setAssets] = useState<SelectedAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [isLoadingTactics, setIsLoadingTactics] = useState(true);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    }
  };

  const formatMetric = (val: string | undefined) => {
    if (val === undefined || val === null || val === 'N/A') return '-';
    return val;
  };

  return (
    <section className="mt-8 space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="text-[var(--holo-blue)] w-6 h-6" />
        <h2 className="text-2xl font-bold tracking-tight text-white uppercase italic">Scrapper Tactics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase flex items-center gap-1.5 mb-1">
                    <Database className="w-3 h-3" /> Latest Session ID
                  </div>
                  <div className="mono text-lg font-bold text-[var(--holo-blue)]">
                    #{selectedTactic.latest_session_id || 'N/A'}
                  </div>
                </div>

                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3 h-3" /> Focus
                  </div>
                  <div className="text-sm font-medium text-gray-300">
                    {selectedTactic.market_cap_category} Market Cap
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Assets Table */}
        <div className="lg:col-span-3">
          <div className="glass-card rounded-xl border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden min-h-[360px] flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Assets por Ranking</span>
              </div>
              <span className="text-[10px] mono text-gray-500">{assets.length} Resultados</span>
            </div>

            <div className="h-[260px] overflow-y-auto overflow-x-auto custom-scrollbar">
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
                    ) : assets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-20 text-center text-gray-500 italic">
                          No se encontraron activos para esta táctica.
                        </td>
                      </tr>
                    ) : (
                      assets.map((asset, index) => (
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
