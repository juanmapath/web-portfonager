"use client";

import { useEffect, useState, useMemo } from 'react';
import { apiProftviewClient } from '@/app/api/client';
import { useAuth } from '@/app/api/auth-context';
import { Family, Bot, BotAsset, AggregatedStats, Broker } from '@/app/api/types';
import { Database, Terminal, Plus, DollarSign, XCircle, X, Lock } from 'lucide-react';

export default function BotsPage() {
  const { isAuthenticated } = useAuth();
  const [families, setFamilies] = useState<Family[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [assets, setAssets] = useState<BotAsset[]>([]);
  
  const [selectedFamily, setSelectedFamily] = useState<number | null>(null);
  const [selectedBot, setSelectedBot] = useState<number | null>(null);
  const [expandedAssetId, setExpandedAssetId] = useState<number | null>(null);
  const [aggregatedStats, setAggregatedStats] = useState<AggregatedStats | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isAddCapitalModalOpen, setIsAddCapitalModalOpen] = useState(false);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [modalBotId, setModalBotId] = useState<number | null>(null);
  const [modalBrokerId, setModalBrokerId] = useState<number | null>(null);
  const [modalAmount, setModalAmount] = useState<string>('');
  const [isBotDropdownOpen, setIsBotDropdownOpen] = useState(false);
  const [botSearch, setBotSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Asset Modal states
  const [assetModalMode, setAssetModalMode] = useState<'add' | 'remove' | null>(null);
  const [isAddAssetCapitalModalOpen, setIsAddAssetCapitalModalOpen] = useState(false);
  const [modalAssetId, setModalAssetId] = useState<number | null>(null);
  const [modalAssetAmount, setModalAssetAmount] = useState<string>('');

  // Load initial data
  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      try {
        const [famsRes, botsRes, assetsRes, statsRes, brokersRes] = await Promise.all([
          apiProftviewClient.getFamilies(),
          apiProftviewClient.getBots(),
          apiProftviewClient.getAssets(),
          apiProftviewClient.getAggregatedAssets(),
          apiProftviewClient.getBrokers()
        ]);
        setFamilies(famsRes);
        setBots(botsRes);
        setAssets(assetsRes);
        setAggregatedStats(statsRes);
        setBrokers(brokersRes);
      } catch (error) {
        console.error("Error loading bots data", error);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, []);

  // Handle filtering assets
  useEffect(() => {
    async function filterAssets() {
      if (isLoading) return; // Prevent initial double fetch
      try {
        const params: { family?: number; bot?: number } = {};
        if (selectedFamily) {
          params.family = selectedFamily;
        }
        if (selectedBot) {
          params.bot = selectedBot;
        }
        
        const [assetsRes, statsRes] = await Promise.all([
          apiProftviewClient.getAssets(params),
          apiProftviewClient.getAggregatedAssets(params)
        ]);
        setAssets(assetsRes);
        setAggregatedStats(statsRes);
        setExpandedAssetId(null); // Reset expanded state on filter change
      } catch (error) {
        console.error("Error filtering assets", error);
      }
    }
    
    filterAssets();
  }, [selectedFamily, selectedBot, isLoading]);

  const selectedModalAsset = useMemo(() => 
    assets.find(a => a.id === modalAssetId), 
    [assets, modalAssetId]
  );

  const selectedModalBot = useMemo(() => 
    bots.find(b => b.id === modalBotId), 
    [bots, modalBotId]
  );

  const filteredModalBots = useMemo(() => {
    if (!botSearch) return bots;
    return bots.filter(b => 
      b.name.toLowerCase().includes(botSearch.toLowerCase())
    );
  }, [bots, botSearch]);

  const handleAddCapital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalBotId || !modalBrokerId || !modalAmount) return;
    
    setIsSubmitting(true);
    try {
      await apiProftviewClient.addCapital({
        bot_id: modalBotId,
        broker_id: modalBrokerId,
        amount: Number(modalAmount)
      });
      
      // Reset form and close modal
      setIsAddCapitalModalOpen(false);
      setModalBotId(null);
      setModalBrokerId(null);
      setModalAmount('');
      
      // Refresh data
      const [assetsRes, statsRes] = await Promise.all([
        apiProftviewClient.getAssets(selectedBot ? { bot: selectedBot } : selectedFamily ? { family: selectedFamily } : undefined),
        apiProftviewClient.getAggregatedAssets(selectedBot ? { bot: selectedBot } : selectedFamily ? { family: selectedFamily } : undefined)
      ]);
      setAssets(assetsRes);
      setAggregatedStats(statsRes);
      
    } catch (error) {
      console.error("Error adding capital", error);
      alert("Error adding capital. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAssetCapital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAssetId || !modalAssetAmount) return;
    
    setIsSubmitting(true);
    try {
      await apiProftviewClient.addAssetCapital({
        bot_asset_id: modalAssetId,
        amount: assetModalMode === 'remove' ? -Math.abs(Number(modalAssetAmount)) : Math.abs(Number(modalAssetAmount))
      });
      
      setIsAddAssetCapitalModalOpen(false);
      setModalAssetId(null);
      setModalAssetAmount('');
      setAssetModalMode(null);
      
      const [assetsRes, statsRes] = await Promise.all([
        apiProftviewClient.getAssets(selectedBot ? { bot: selectedBot } : selectedFamily ? { family: selectedFamily } : undefined),
        apiProftviewClient.getAggregatedAssets(selectedBot ? { bot: selectedBot } : selectedFamily ? { family: selectedFamily } : undefined)
      ]);
      setAssets(assetsRes);
      setAggregatedStats(statsRes);
      
    } catch (error) {
      console.error("Error adding asset capital", error);
      alert("Error adding capital to asset. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedFamily(val ? Number(val) : null);
    setSelectedBot(null); // Reset bot selection when family changes
  };

  const filteredBots = useMemo(() => {
    if (!selectedFamily) return bots;
    return bots.filter(b => b.family === selectedFamily);
  }, [bots, selectedFamily]);

  return (
    <div className="space-y-12 pb-20 pt-4">
      {/* Header Section */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-sm border border-terminal-green/50 flex flex-wrap content-center justify-center p-0.5 gap-0.5">
              <div className="w-[5px] h-[5px] bg-terminal-green/80"></div>
              <div className="w-[5px] h-[5px] bg-terminal-green/30"></div>
              <div className="w-[5px] h-[5px] bg-terminal-green/30"></div>
              <div className="w-[5px] h-[5px] bg-terminal-green/80"></div>
            </div>
            <span className="font-mono text-terminal-green text-xs font-bold tracking-widest uppercase">APP INSTANCE: SYSTEM 5000</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white uppercase mt-2">
            BOTS
          </h1>
        </div>
        
        {/* Header Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full xl:w-auto">
          {isAuthenticated ? (
            <>
              <button 
                onClick={() => setIsAddCapitalModalOpen(true)}
                className="flex-1 xl:flex-none px-5 py-3 bg-white text-black font-extrabold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-colors rounded-sm flex items-center justify-center gap-2"
              >
                <Terminal size={14} />
                Add/Withdraw Capital to Bot
              </button>
              <button className="flex-1 xl:flex-none px-5 py-3 border border-terminal-green/50 text-terminal-green font-extrabold text-[10px] uppercase tracking-widest hover:bg-terminal-green/10 transition-colors rounded-sm flex items-center justify-center gap-2">
                <Plus size={14} />
                Add Asset
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 px-4 py-3 bg-void border border-white/5 rounded-sm">
              <Lock size={12} className="text-gray-600" />
              <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Auth required for modifications</span>
            </div>
          )}
        </div>
      </header>
      
      {/* Filter Section */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Dropdown for Family */}
        <div className="relative">
          <select 
            value={selectedFamily || ''}
            onChange={handleFamilyChange}
            className="appearance-none bg-transparent border border-terminal-green text-terminal-green px-8 py-[14px] rounded-[14px] outline-none hover:bg-terminal-green/5 transition-colors cursor-pointer pr-14 min-w-[200px] uppercase tracking-widest font-mono text-sm"
            disabled={isLoading}
            style={{ borderRadius: '12px' }}
          >
            <option value="" className="bg-void text-white">ALL</option>
            {families.map(f => (
              <option key={f.id} value={f.id} className="bg-void text-white">{f.name}</option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-terminal-green">
            <svg width="18" height="10" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Bots Sliding List inside container block */}
        <div 
          className="flex-1 overflow-x-auto flex items-center w-full" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="border border-terminal-green rounded-[12px] px-2 py-2 flex items-center gap-3 min-w-[300px] min-h-[50px] bg-void">
            {filteredBots.map(bot => (
              <button
                key={bot.id}
                onClick={() => setSelectedBot(bot.id === selectedBot ? null : bot.id)}
                className={`px-5 py-1.5 rounded-full border transition-all text-xs tracking-widest uppercase font-mono whitespace-nowrap
                  ${selectedBot === bot.id 
                    ? 'bg-terminal-green text-black border-terminal-green font-bold shadow-[0_0_10px_rgba(0,255,148,0.5)]' 
                    : 'border-white text-white hover:border-terminal-green hover:text-terminal-green'
                  }`}
              >
                {bot.name}
              </button>
            ))}
            {filteredBots.length === 0 && (
              <div className="text-gray-500 text-xs tracking-widest uppercase font-mono px-4 w-full text-center">NO BOTS FOUND</div>
            )}
          </div>
        </div>
      </div>

      {/* Aggregated Stats Section */}
      {aggregatedStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-8">
          <div className="cyber-card p-4 rounded-xl border-t-2 border-t-sky-400/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-sky-400/[0.02] to-transparent pointer-events-none"></div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest relative z-10">Capital</p>
            <div className="mt-1 relative z-10 font-mono">
              <p className="text-sky-400 text-lg md:text-xl font-bold">
                ${(aggregatedStats.cap_to_trade_sum + aggregatedStats.cap_value_in_trade_sum + aggregatedStats.cap_to_add_sum + aggregatedStats.cap_no_asignado).toLocaleString()}
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <p className="text-white text-base md:text-lg">
                  ${(aggregatedStats.cap_to_trade_sum + aggregatedStats.cap_value_in_trade_sum).toLocaleString()}
                </p>
                <p className="text-terminal-green text-xs md:text-sm font-bold opacity-80">
                  +{(aggregatedStats.cap_to_add_sum + aggregatedStats.cap_no_asignado).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="cyber-card p-4 rounded-xl border-t-2 border-t-sky-400/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-sky-400/[0.02] to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Invertido</p>
                <p className="font-mono text-white text-xl mt-1">
                  ${aggregatedStats.total_capital_added.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">PNL</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className={`font-mono text-xl ${(aggregatedStats.pnl_un_sum + aggregatedStats.PNL_sum) >= 0 ? 'text-terminal-green' : 'text-red-500'}`}>
                    {(aggregatedStats.pnl_un_sum + aggregatedStats.PNL_sum) >= 0 ? '+' : ''}{(aggregatedStats.pnl_un_sum + aggregatedStats.PNL_sum).toLocaleString()}
                  </p>
                  <p className={`font-mono text-xs ${
                    aggregatedStats.total_capital_added > 0 
                      ? (((aggregatedStats.pnl_un_sum + aggregatedStats.PNL_sum) / aggregatedStats.total_capital_added) >= 0 ? 'text-terminal-green' : 'text-red-500')
                      : 'text-gray-400'
                  }`}>
                    ({aggregatedStats.total_capital_added > 0 
                      ? `${(((aggregatedStats.pnl_un_sum + aggregatedStats.PNL_sum) / aggregatedStats.total_capital_added) * 100).toFixed(2)}%` 
                      : '0.00%'})
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        {isLoading && assets.length === 0 ? (
          <div className="col-span-full py-12 flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-terminal-green"></div>
          </div>
        ) : assets.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center cyber-card border-dashed">
             <Database className="text-white/20 mb-4" size={48} />
             <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">No assets found for current selection.</p>
          </div>
        ) : (
          assets.map(asset => {
            const isExpanded = expandedAssetId === asset.id;
            const capAdded = asset.capAdded ?? 0;
            const rets = capAdded > 0 ? ((asset.pnl_un ?? 0) + (asset.PNL ?? 0)) / capAdded : 0;
            
            return (
              <div 
                key={asset.id} 
                onClick={() => setExpandedAssetId(isExpanded ? null : asset.id)}
                className={`cyber-card p-5 group flex flex-col rounded-xl border-t-2 border-t-terminal-green/50 hover:bg-white/[0.03] transition-all duration-300 relative overflow-hidden cursor-pointer ${
                  isExpanded ? 'md:col-span-2 xl:col-span-2 shadow-[0_0_30px_rgba(0,255,148,0.15)] ring-1 ring-terminal-green/30' : ''
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-terminal-green/[0.03] to-transparent pointer-events-none transition-opacity duration-300"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10 hover:text-terminal-green transition-colors">
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-xl font-bold text-white tracking-widest group-hover:text-terminal-green transition-colors">{asset.asset}</h3>
                      <span className="text-xs font-mono text-gray-500 font-medium">${asset.last_price?.toLocaleString() ?? 0}</span>
                    </div>
                    <p className="text-xs text-terminal-green font-mono mt-0.5 hover:brightness-125 transition-all">{asset.bot_name}</p>
                  </div>
                  <div className="flex flex-col items-end">
                     <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider mb-2 ${asset.operate ? 'bg-terminal-green/20 text-terminal-green border border-terminal-green/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                       {asset.operate ? 'ACTIVE' : 'INACTIVE'}
                     </div>
                     <span className="text-[10px] text-gray-500 uppercase font-mono">{asset.broker_name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-auto border-t border-white/10 pt-4 relative z-10 px-2 sm:px-0">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Qty Open</p>
                    <p className="font-mono text-white text-sm mt-1">{asset.qty_open ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Pos Value</p>
                    <p className="font-mono text-white text-sm mt-1">
                      ${(asset.qty_open === 0 ? asset.cap_to_trade : asset.cap_value_in_trade)?.toLocaleString() ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Un Pnl</p>
                    <p className={`font-mono text-sm mt-1 ${(asset.pnl_un ?? 0) >= 0 ? 'text-terminal-green' : 'text-red-500'}`}>
                      {(asset.pnl_un ?? 0) >= 0 ? '+' : ''}{(asset.pnl_un ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Rets</p>
                    <p className={`font-mono text-sm mt-1 ${rets >= 0 ? 'text-terminal-green' : 'text-red-500'}`}>
                      {rets >= 0 ? '+' : ''}{(rets * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* EXPANDED SECTION */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-dashed border-white/20 relative z-10 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-4 px-2 sm:px-0">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Op Price</p>
                        <p className="font-mono text-white text-sm mt-1">${asset.op_price?.toLocaleString() ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Pend To Add</p>
                        <p className="font-mono text-white text-sm mt-1">${asset.cap_to_add?.toLocaleString() ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Cap Added</p>
                        <p className="font-mono text-white text-sm mt-1">${asset.capAdded?.toLocaleString() ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Created Date</p>
                        <p className="font-mono text-white text-sm mt-1">{asset.created_date ? new Date(asset.created_date).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</p>
                      </div>
                    </div>

                    {asset.params1 && (
                      <div className="mb-6 px-2 sm:px-0">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">Params</p>
                        <p className="font-mono text-terminal-green text-xs break-all bg-terminal-green/5 p-2 rounded border border-terminal-green/20">
                          {asset.params1.replace(/\[|\]/g, '')}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {isAuthenticated ? (
                        <>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setModalAssetId(asset.id);
                              setAssetModalMode('add');
                              setIsAddAssetCapitalModalOpen(true);
                            }}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-terminal-green/10 text-terminal-green border border-terminal-green/50 hover:bg-terminal-green hover:text-black transition-colors rounded-sm text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-2"
                          >
                            <DollarSign size={14} />
                            Add Capital
                          </button>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setModalAssetId(asset.id);
                              setAssetModalMode('remove');
                              setIsAddAssetCapitalModalOpen(true);
                            }}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-amber-500/10 text-amber-500 border border-amber-500/50 hover:bg-amber-500 hover:text-black transition-colors rounded-sm text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-2"
                          >
                            <XCircle size={14} />
                            Remove Capital
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); }}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors rounded-sm text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-2"
                          >
                            <Terminal size={14} />
                            Close Positions
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-void border border-white/5 rounded-sm">
                          <Lock size={12} className="text-gray-600" />
                          <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Auth required for operations</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Raw Data Debug Section */}
      <div className="mt-20 pt-8 border-t border-white/5">
        <details className="group">
          <summary className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.4em] cursor-pointer hover:text-terminal-green transition-colors list-none flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-800 group-open:bg-terminal-green"></div>
            Inspect Raw API Data
          </summary>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-terminal-green/50 uppercase tracking-widest">Aggregated Stats JSON</p>
              <pre className="bg-void border border-white/5 p-4 rounded-lg overflow-auto text-[10px] font-mono text-gray-400 max-h-[300px] scrollbar-thin">
                {JSON.stringify(aggregatedStats, null, 2)}
              </pre>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-terminal-green/50 uppercase tracking-widest">First 2 Assets JSON</p>
              <pre className="bg-void border border-white/5 p-4 rounded-lg overflow-auto text-[10px] font-mono text-gray-400 max-h-[300px] scrollbar-thin">
                {JSON.stringify(assets.slice(0, 2), null, 2)}
              </pre>
            </div>
          </div>
        </details>
      </div>

      {/* Add Capital Modal */}
      {isAddCapitalModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmitting && setIsAddCapitalModalOpen(false)}
          ></div>
          
          <div className="cyber-card w-full max-w-md p-8 rounded-2xl border-t-4 border-t-terminal-green relative z-10 animate-in zoom-in-95 duration-200 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Add / Withdraw</h2>
                <p className="text-[10px] text-terminal-green font-mono uppercase tracking-[0.2em] mt-1">Transaction Portal</p>
              </div>
              <button 
                onClick={() => setIsAddCapitalModalOpen(false)}
                disabled={isSubmitting}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddCapital} className="space-y-6">
              <div className="space-y-2 relative">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Select Bot</label>
                
                {/* Custom Bot Dropdown Trigger */}
                <div 
                  onClick={() => setIsBotDropdownOpen(!isBotDropdownOpen)}
                  className={`w-full bg-void border ${isBotDropdownOpen ? 'border-terminal-green' : 'border-white/10'} text-white px-4 py-3 rounded-xl transition-colors font-mono text-sm cursor-pointer flex justify-between items-center`}
                >
                  <span className={modalBotId ? 'text-white' : 'text-gray-500'}>
                    {selectedModalBot ? selectedModalBot.name : 'CHOOSE BOT...'}
                  </span>
                  <svg className={`transition-transform duration-200 ${isBotDropdownOpen ? 'rotate-180' : ''}`} width="12" height="8" viewBox="0 0 14 8" fill="none">
                    <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Custom Bot Dropdown List */}
                {isBotDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-[110]" 
                      onClick={() => setIsBotDropdownOpen(false)}
                    ></div>
                    <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-terminal-green/30 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[120] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-2 border-b border-white/5">
                        <input 
                          autoFocus
                          type="text"
                          placeholder="Search bot..."
                          value={botSearch}
                          onChange={(e) => setBotSearch(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-terminal-green/50 mb-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-terminal-green/20">
                        {filteredModalBots.length > 0 ? (
                          filteredModalBots.map(bot => (
                            <div 
                              key={bot.id}
                              onClick={() => {
                                setModalBotId(bot.id);
                                setIsBotDropdownOpen(false);
                                setBotSearch('');
                              }}
                              className={`px-4 py-3 text-xs font-mono cursor-pointer transition-colors border-l-2 ${
                                modalBotId === bot.id 
                                  ? 'bg-terminal-green/10 border-terminal-green text-terminal-green' 
                                  : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <div className="font-bold uppercase tracking-wider">{bot.name}</div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-[10px] text-gray-600 uppercase tracking-widest">No results found</div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Select Broker</label>
                <select 
                  required
                  value={modalBrokerId || ''}
                  onChange={(e) => setModalBrokerId(Number(e.target.value))}
                  className="w-full bg-void border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-terminal-green transition-colors font-mono text-sm appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-void">CHOOSE BROKER...</option>
                  {brokers.map(broker => (
                    <option key={broker.id} value={broker.id} className="bg-void">{broker.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-terminal-green font-mono">$</span>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    value={modalAmount}
                    onChange={(e) => setModalAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-void border border-white/10 text-white pl-8 pr-4 py-3 rounded-xl outline-none focus:border-terminal-green transition-colors font-mono text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsAddCapitalModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-colors rounded-xl disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-terminal-green text-black font-black text-xs uppercase tracking-widest hover:bg-bright-green transition-colors rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_4px_20px_rgba(0,255,148,0.2)]"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Plus size={16} strokeWidth={3} />
                      Save
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Capital to Asset Modal */}
      {isAddAssetCapitalModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmitting && setIsAddAssetCapitalModalOpen(false)}
          ></div>
          
          <div className="cyber-card w-full max-w-md p-8 rounded-2xl border-t-4 border-t-terminal-green relative z-10 animate-in zoom-in-95 duration-200 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                  {assetModalMode === 'add' ? 'Add Capital' : 'Remove Capital'}
                </h2>
                <p className="text-[10px] text-terminal-green font-mono uppercase tracking-[0.2em] mt-1">
                  Asset Allocation Portal
                </p>
              </div>
              <button 
                onClick={() => setIsAddAssetCapitalModalOpen(false)}
                disabled={isSubmitting}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddAssetCapital} className="space-y-6">
              <div className="space-y-2 relative">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Asset</label>
                <div className="w-full bg-void border border-white/5 text-white/50 px-4 py-3 rounded-xl font-mono text-sm cursor-not-allowed">
                  {selectedModalAsset ? `${selectedModalAsset.asset} - ${selectedModalAsset.bot_name}` : 'N/A'}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-terminal-green font-mono">$</span>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={modalAssetAmount}
                    onChange={(e) => setModalAssetAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-void border border-white/10 text-white pl-8 pr-4 py-3 rounded-xl outline-none focus:border-terminal-green transition-colors font-mono text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsAddAssetCapitalModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-colors rounded-xl disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-6 py-4 ${assetModalMode === 'add' ? 'bg-terminal-green' : 'bg-red-500'} text-black font-black text-xs uppercase tracking-widest hover:opacity-90 transition-colors rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_4px_20px_rgba(0,0,0,0.2)]`}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {assetModalMode === 'add' ? <Plus size={16} strokeWidth={3} /> : <XCircle size={16} strokeWidth={3} />}
                      {assetModalMode === 'add' ? 'Add' : 'Remove'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

