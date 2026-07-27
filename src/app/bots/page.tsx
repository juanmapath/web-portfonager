"use client";

import { useEffect, useState, useMemo } from 'react';
import { apiProftviewClient } from '@/app/api/client';
import { useAuth } from '@/app/api/auth-context';
import { Family, Bot, BotAsset, AggregatedStats, Broker } from '@/app/api/types';
import { Database, Terminal, Plus, DollarSign, XCircle, X, Lock, ChevronDown } from 'lucide-react';

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

  // New Filter states
  const [selectedBroker, setSelectedBroker] = useState<number | null>(null);
  const [filterPendToAdd, setFilterPendToAdd] = useState<'all' | 'zero' | 'greaterThanZero'>('all');
  const [filterRets, setFilterRets] = useState<'all' | 'positive' | 'negative'>('all');
  const [filterQtyOpen, setFilterQtyOpen] = useState<'all' | 'zero' | 'greaterThanZero'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
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

  // Close Position Modal states
  const [isClosePositionModalOpen, setIsClosePositionModalOpen] = useState(false);
  const [closeAllQuantity, setCloseAllQuantity] = useState(true);
  const [closeExecutionPrice, setCloseExecutionPrice] = useState<string>('');
  const [closeQuantity, setCloseQuantity] = useState<string>('');

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
        const params: { family?: number; bot?: number; broker?: number } = {};
        if (selectedFamily) {
          params.family = selectedFamily;
        }
        if (selectedBot) {
          params.bot = selectedBot;
        }
        if (selectedBroker) {
          params.broker = selectedBroker;
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
  }, [selectedFamily, selectedBot, selectedBroker, isLoading]);

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
      const refreshParams: { family?: number; bot?: number; broker?: number } = {};
      if (selectedFamily) refreshParams.family = selectedFamily;
      if (selectedBot) refreshParams.bot = selectedBot;
      if (selectedBroker) refreshParams.broker = selectedBroker;

      const [assetsRes, statsRes] = await Promise.all([
        apiProftviewClient.getAssets(refreshParams),
        apiProftviewClient.getAggregatedAssets(refreshParams)
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
      
      const refreshParams: { family?: number; bot?: number; broker?: number } = {};
      if (selectedFamily) refreshParams.family = selectedFamily;
      if (selectedBot) refreshParams.bot = selectedBot;
      if (selectedBroker) refreshParams.broker = selectedBroker;

      const [assetsRes, statsRes] = await Promise.all([
        apiProftviewClient.getAssets(refreshParams),
        apiProftviewClient.getAggregatedAssets(refreshParams)
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

  const handleClosePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAssetId || !closeExecutionPrice) return;
    if (!closeAllQuantity && !closeQuantity) return;
    
    setIsSubmitting(true);
    try {
      await apiProftviewClient.closePosition({
        bot_asset_id: modalAssetId,
        all_quantity: closeAllQuantity,
        execution_price: Number(closeExecutionPrice),
        ...(closeAllQuantity ? {} : { quantity_closed: Number(closeQuantity) })
      });
      
      setIsClosePositionModalOpen(false);
      setModalAssetId(null);
      setCloseExecutionPrice('');
      setCloseQuantity('');
      setCloseAllQuantity(true);
      
      const refreshParams: { family?: number; bot?: number; broker?: number } = {};
      if (selectedFamily) refreshParams.family = selectedFamily;
      if (selectedBot) refreshParams.bot = selectedBot;
      if (selectedBroker) refreshParams.broker = selectedBroker;

      const [assetsRes, statsRes] = await Promise.all([
        apiProftviewClient.getAssets(refreshParams),
        apiProftviewClient.getAggregatedAssets(refreshParams)
      ]);
      setAssets(assetsRes);
      setAggregatedStats(statsRes);
      
    } catch (error) {
      console.error("Error closing position", error);
      alert("Error closing position. Please try again.");
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

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // 1. pend_to_add filter: 0 or >0
      const capToAdd = asset.cap_to_add ?? 0;
      if (filterPendToAdd === 'zero' && capToAdd !== 0) return false;
      if (filterPendToAdd === 'greaterThanZero' && capToAdd <= 0) return false;

      // 2. rets filter: >0 or <0
      const capAdded = asset.capAdded ?? 0;
      const rets = capAdded > 0 ? ((asset.pnl_un ?? 0) + (asset.PNL ?? 0)) / capAdded : 0;
      if (filterRets === 'positive' && rets <= 0) return false;
      if (filterRets === 'negative' && rets >= 0) return false;

      // 3. qty_open filter: 0 or >0
      const qtyOpen = asset.qty_open ?? 0;
      if (filterQtyOpen === 'zero' && qtyOpen !== 0) return false;
      if (filterQtyOpen === 'greaterThanZero' && qtyOpen <= 0) return false;

      // 4. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesAsset = asset.asset?.toLowerCase().includes(query);
        const matchesBot = asset.bot_name?.toLowerCase().includes(query);
        const matchesFamily = asset.family_name?.toLowerCase().includes(query);
        if (!matchesAsset && !matchesBot && !matchesFamily) return false;
      }

      return true;
    });
  }, [assets, filterPendToAdd, filterRets, filterQtyOpen, searchQuery]);

  const { activeAssets, inactiveAssets } = useMemo(() => {
    const active: BotAsset[] = [];
    const inactive: BotAsset[] = [];
    filteredAssets.forEach(a => {
      if (a.operate) {
        active.push(a);
      } else {
        inactive.push(a);
      }
    });
    return { activeAssets: active, inactiveAssets: inactive };
  }, [filteredAssets]);

  const handleClearFilters = () => {
    setSelectedFamily(null);
    setSelectedBot(null);
    setSelectedBroker(null);
    setFilterPendToAdd('all');
    setFilterQtyOpen('all');
    setFilterRets('all');
    setSearchQuery('');
  };

  const renderAssetRow = (asset: BotAsset) => {
    const isExpanded = expandedAssetId === asset.id;
    const capAdded = asset.capAdded ?? 0;
    const rets = capAdded > 0 ? ((asset.pnl_un ?? 0) + (asset.PNL ?? 0)) / capAdded : 0;
    
    return (
      <div 
        key={asset.id} 
        onClick={() => setExpandedAssetId(isExpanded ? null : asset.id)}
        className={`border border-white/5 hover:border-terminal-green/30 bg-void/50 hover:bg-white/[0.02] p-4 rounded-xl transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col gap-4 ${
          isExpanded ? 'shadow-[0_0_30px_rgba(0,255,148,0.1)] border-terminal-green/25' : ''
        }`}
      >
        {/* Horizontal Row Header (Visible when collapsed) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full relative z-10">
          
          {/* Col 1: Ticker & Price */}
          <div className="flex items-baseline gap-2.5 min-w-[120px]">
            <span className="text-lg font-bold text-white tracking-widest uppercase hover:text-terminal-green transition-colors">{asset.asset}</span>
            <span className="text-xs font-mono text-gray-500 font-medium">${asset.last_price?.toLocaleString() ?? 0}</span>
          </div>

          {/* Col 2: Bot & Family Info */}
          <div className="flex flex-col min-w-[160px]">
            <span className="text-xs text-terminal-green font-mono font-bold">{asset.bot_name}</span>
            <span className="text-[9px] text-gray-500 uppercase font-mono tracking-wider">{asset.family_name}</span>
          </div>

          {/* Col 3: Broker */}
          <div className="min-w-[100px]">
            <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-bold mb-0.5">Broker</span>
            <span className="text-xs font-mono text-white/90">{asset.broker_name}</span>
          </div>

          {/* Col 4: Qty Open & Pos Value */}
          <div className="min-w-[140px]">
            <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-bold mb-0.5">Qty / Pos Value</span>
            <span className="text-xs font-mono text-white">
              {asset.qty_open ?? 0} <span className="text-gray-600">/</span> ${(asset.qty_open === 0 ? asset.cap_to_trade : asset.cap_value_in_trade)?.toLocaleString() ?? 0}
            </span>
          </div>

          {/* Col 5: Un PNL & Rets */}
          <div className="min-w-[160px]">
            <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-bold mb-0.5">Un PNL / Rets</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold ${(asset.pnl_un ?? 0) >= 0 ? 'text-terminal-green' : 'text-red-500'}`}>
                {(asset.pnl_un ?? 0) >= 0 ? '+' : ''}{(asset.pnl_un ?? 0).toLocaleString()}
              </span>
              <span className={`text-xs font-mono ${rets >= 0 ? 'text-terminal-green' : 'text-red-500'}`}>
                ({rets >= 0 ? '+' : ''}{(rets * 100).toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Col 6: Status & Chevron */}
          <div className="flex items-center gap-4 justify-between lg:justify-end min-w-[130px]">
            <div className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${asset.operate ? 'bg-terminal-green/10 text-terminal-green border-terminal-green/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              {asset.operate ? 'ACTIVE' : 'INACTIVE'}
            </div>
            <ChevronDown 
              size={16} 
              className={`text-gray-500 transition-transform duration-300 hidden lg:block ${isExpanded ? 'rotate-180 text-terminal-green' : ''}`} 
            />
          </div>

        </div>

        {/* EXPANDED SECTION */}
        {isExpanded && (
          <div className="mt-2 pt-4 border-t border-dashed border-white/10 relative z-10 animate-in fade-in slide-in-from-top-2 duration-300">
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
                  {(asset.qty_open ?? 0) > 0 && (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setModalAssetId(asset.id);
                        setIsClosePositionModalOpen(true);
                      }}
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors rounded-sm text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Terminal size={14} />
                      Close Positions
                    </button>
                  )}
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
  };

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
            </>
          ) : (
            <div className="flex items-center gap-2 px-4 py-3 bg-void border border-white/5 rounded-sm">
              <Lock size={12} className="text-gray-600" />
              <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Auth required for modifications</span>
            </div>
          )}
        </div>
      </header>
      
      {/* Aggregated Stats Section */}
      {aggregatedStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
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

      {/* Filters Control Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-6 items-end bg-void border border-white/5 p-5 rounded-[12px]">
        {/* Search Bar */}
        <div className="sm:col-span-2 md:col-span-1 lg:col-span-2 flex flex-col gap-1.5">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest pl-1">Search Ticker / Name</span>
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="ENTER TICKER OR NAME..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border border-white/10 text-white pl-4 pr-10 py-3 rounded-[12px] outline-none focus:border-terminal-green/50 transition-colors font-mono text-xs uppercase tracking-wider"
            />
            {searchQuery ? (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 text-gray-500 hover:text-white transition-colors"
                type="button"
              >
                <X size={16} />
              </button>
            ) : (
              <svg className="absolute right-4 text-gray-500 pointer-events-none" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </div>

        {/* Family Dropdown */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest pl-1">Family</span>
          <div className="relative">
            <select 
              value={selectedFamily || ''}
              onChange={handleFamilyChange}
              className="appearance-none bg-transparent border border-white/10 text-white w-full px-4 py-[13px] rounded-[12px] outline-none hover:bg-white/5 transition-colors cursor-pointer pr-10 uppercase tracking-widest font-mono text-xs"
              disabled={isLoading}
            >
              <option value="" className="bg-void text-white">ALL FAMILIES</option>
              {families.map(f => (
                <option key={f.id} value={f.id} className="bg-void text-white">{f.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg width="12" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Bot Dropdown */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest pl-1">Bot</span>
          <div className="relative">
            <select 
              value={selectedBot || ''}
              onChange={(e) => setSelectedBot(e.target.value ? Number(e.target.value) : null)}
              className="appearance-none bg-transparent border border-white/10 text-white w-full px-4 py-[13px] rounded-[12px] outline-none hover:bg-white/5 transition-colors cursor-pointer pr-10 uppercase tracking-widest font-mono text-xs"
              disabled={isLoading}
            >
              <option value="" className="bg-void text-white">ALL BOTS</option>
              {filteredBots.map(b => (
                <option key={b.id} value={b.id} className="bg-void text-white">{b.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg width="12" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Broker Dropdown */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest pl-1">Broker</span>
          <div className="relative">
            <select 
              value={selectedBroker || ''}
              onChange={(e) => setSelectedBroker(e.target.value ? Number(e.target.value) : null)}
              className="appearance-none bg-transparent border border-white/10 text-white w-full px-4 py-[13px] rounded-[12px] outline-none hover:bg-white/5 transition-colors cursor-pointer pr-10 uppercase tracking-widest font-mono text-xs"
              disabled={isLoading}
            >
              <option value="" className="bg-void text-white">ALL BROKERS</option>
              {brokers.map(b => (
                <option key={b.id} value={b.id} className="bg-void text-white">{b.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg width="12" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Pend To Add Filter */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest pl-1">Pend To Add</span>
          <div className="flex bg-black border border-white/10 rounded-[12px] p-1 gap-1 w-full min-h-[46px] items-center">
            <button
              onClick={() => setFilterPendToAdd('all')}
              type="button"
              className={`flex-1 py-2 rounded-[8px] font-mono text-[10px] tracking-wider transition-all uppercase ${
                filterPendToAdd === 'all' ? 'bg-terminal-green text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterPendToAdd('zero')}
              type="button"
              className={`flex-1 py-2 rounded-[8px] font-mono text-[10px] tracking-wider transition-all uppercase ${
                filterPendToAdd === 'zero' ? 'bg-terminal-green text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              0
            </button>
            <button
              onClick={() => setFilterPendToAdd('greaterThanZero')}
              type="button"
              className={`flex-1 py-2 rounded-[8px] font-mono text-[10px] tracking-wider transition-all uppercase ${
                filterPendToAdd === 'greaterThanZero' ? 'bg-terminal-green text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              &gt;0
            </button>
          </div>
        </div>

        {/* Qty Open Filter */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest pl-1">Qty Open</span>
          <div className="flex bg-black border border-white/10 rounded-[12px] p-1 gap-1 w-full min-h-[46px] items-center">
            <button
              onClick={() => setFilterQtyOpen('all')}
              type="button"
              className={`flex-1 py-2 rounded-[8px] font-mono text-[10px] tracking-wider transition-all uppercase ${
                filterQtyOpen === 'all' ? 'bg-terminal-green text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterQtyOpen('zero')}
              type="button"
              className={`flex-1 py-2 rounded-[8px] font-mono text-[10px] tracking-wider transition-all uppercase ${
                filterQtyOpen === 'zero' ? 'bg-terminal-green text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              0
            </button>
            <button
              onClick={() => setFilterQtyOpen('greaterThanZero')}
              type="button"
              className={`flex-1 py-2 rounded-[8px] font-mono text-[10px] tracking-wider transition-all uppercase ${
                filterQtyOpen === 'greaterThanZero' ? 'bg-terminal-green text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              &gt;0
            </button>
          </div>
        </div>

        {/* Rets Filter (Returns) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest pl-1">Returns (Rets)</span>
          <div className="flex bg-black border border-white/10 rounded-[12px] p-1 gap-1 w-full min-h-[46px] items-center">
            <button
              onClick={() => setFilterRets('all')}
              type="button"
              className={`flex-1 py-2 rounded-[8px] font-mono text-[10px] tracking-wider transition-all uppercase ${
                filterRets === 'all' ? 'bg-terminal-green text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRets('positive')}
              type="button"
              className={`flex-1 py-2 rounded-[8px] font-mono text-[10px] tracking-wider transition-all uppercase ${
                filterRets === 'positive' ? 'bg-terminal-green text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              &gt;0
            </button>
            <button
              onClick={() => setFilterRets('negative')}
              type="button"
              className={`flex-1 py-2 rounded-[8px] font-mono text-[10px] tracking-wider transition-all uppercase ${
                filterRets === 'negative' ? 'bg-terminal-green text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              &lt;0
            </button>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest pl-1 invisible sm:block">&nbsp;</span>
          <button
            onClick={handleClearFilters}
            type="button"
            className="w-full bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/30 transition-all font-mono text-xs uppercase tracking-widest py-3 px-4 rounded-[12px] min-h-[46px] flex items-center justify-center gap-2"
          >
            <X size={14} />
            Clear
          </button>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="space-y-12 mt-8">
        {isLoading && assets.length === 0 ? (
          <div className="py-12 flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-terminal-green"></div>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center cyber-card border-dashed">
             <Database className="text-white/20 mb-4" size={48} />
             <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">No assets found for current selection.</p>
          </div>
        ) : (
          <>
            {/* Active Assets Grid */}
            {activeAssets.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-terminal-green animate-pulse"></div>
                  <h2 className="text-lg font-mono text-white font-bold tracking-widest uppercase">Active Bots / Assets ({activeAssets.length})</h2>
                </div>
                <div className="space-y-3">
                  {activeAssets.map(renderAssetRow)}
                </div>
              </div>
            )}

            {/* Inactive Assets Grid */}
            {inactiveAssets.length > 0 && (
              <div className="space-y-4 pt-8 border-t border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <h2 className="text-lg font-mono text-white font-bold tracking-widest uppercase">Inactive Bots / Assets ({inactiveAssets.length})</h2>
                </div>
                <div className="space-y-3 opacity-75 hover:opacity-100 transition-opacity duration-300">
                  {inactiveAssets.map(renderAssetRow)}
                </div>
              </div>
            )}
          </>
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
      {/* Close Position Modal */}
      {isClosePositionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmitting && setIsClosePositionModalOpen(false)}
          ></div>
          
          <div className="cyber-card w-full max-w-md p-8 rounded-2xl border-t-4 border-t-red-500 relative z-10 animate-in zoom-in-95 duration-200 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Close Position</h2>
                <p className="text-[10px] text-red-500 font-mono uppercase tracking-[0.2em] mt-1">Trading Action</p>
              </div>
              <button 
                onClick={() => setIsClosePositionModalOpen(false)}
                disabled={isSubmitting}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleClosePosition} className="space-y-6">
              <div className="space-y-2 relative">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Asset</label>
                <div className="w-full bg-void border border-white/5 text-white/50 px-4 py-3 rounded-xl font-mono text-sm cursor-not-allowed">
                  {selectedModalAsset ? `${selectedModalAsset.asset} - ${selectedModalAsset.bot_name}` : 'N/A'}
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-10 h-6 rounded-full transition-colors relative ${closeAllQuantity ? 'bg-red-500' : 'bg-gray-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${closeAllQuantity ? 'left-5' : 'left-1'}`}></div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={closeAllQuantity}
                    onChange={(e) => setCloseAllQuantity(e.target.checked)}
                  />
                  <span className="text-[10px] text-white uppercase tracking-widest font-bold group-hover:text-red-400 transition-colors">
                    Close Total
                  </span>
                </label>
              </div>

              {!closeAllQuantity && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Quantity Closed</label>
                  <input 
                    required
                    type="number"
                    step="any"
                    min="0"
                    value={closeQuantity}
                    onChange={(e) => setCloseQuantity(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-void border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-red-500 transition-colors font-mono text-sm"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Execution Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 font-mono">$</span>
                  <input 
                    required
                    type="number"
                    step="any"
                    value={closeExecutionPrice}
                    onChange={(e) => setCloseExecutionPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-void border border-white/10 text-white pl-8 pr-4 py-3 rounded-xl outline-none focus:border-red-500 transition-colors font-mono text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsClosePositionModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-colors rounded-xl disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-red-500 text-white font-black text-xs uppercase tracking-widest hover:opacity-90 transition-colors rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_4px_20px_rgba(239,68,68,0.2)]"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Terminal size={16} strokeWidth={3} />
                      Execute
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

