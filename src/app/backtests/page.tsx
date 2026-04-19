"use client";

import { useEffect, useState, useMemo } from 'react';
import { apiProftviewClient, apiBacktestClient } from '@/app/api/client';
import { BotAsset, BacktestResult } from '@/app/api/types';
import { Terminal, Database, Activity, BarChart2, Calendar, Target, ShieldAlert, ArrowUpRight, TrendingUp } from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Legend
} from 'recharts';

function createBuckets(data: number[] | undefined, numBuckets = 20) {
  if (!data || data.length === 0) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  if (min === max) return [{ min, max, name: min.toFixed(2), count: data.length, range: `${min.toFixed(2)}` }];
  
  const step = (max - min) / numBuckets;
  const buckets = Array.from({ length: numBuckets }, (_, i) => ({
    min: min + i * step,
    max: min + (i + 1) * step,
    mid: min + (i + 0.5) * step,
    name: `${(min + i * step).toFixed(2)}`,
    range: `${(min + i * step).toFixed(2)} to ${(min + (i + 1) * step).toFixed(2)}`,
    count: 0
  }));

  data.forEach(val => {
    const bucketIndex = Math.min(Math.floor((val - min) / step), numBuckets - 1);
    buckets[bucketIndex].count++;
  });

  return buckets;
}

const PERIODS = [
  { id: '1q', label: '1 Quarter' },
  { id: '1y', label: '1 Year' },
  { id: '5y', label: '5 Years' },
  { id: 'all', label: 'All Time' },
];

export default function BacktestsPage() {
  const [assets, setAssets] = useState<BotAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<BotAsset | null>(null);
  const [period, setPeriod] = useState<string>('1y');
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [isLoadingResult, setIsLoadingResult] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      try {
        const res = await apiProftviewClient.getAssets();
        setAssets(res);
      } catch (error) {
        console.error("Error loading assets", error);
      } finally {
        setIsLoadingAssets(false);
      }
    }
    loadAssets();
  }, []);

  useEffect(() => {
    async function loadResults() {
      if (!selectedAsset) return;
      setIsLoadingResult(true);
      try {
        const res = await apiBacktestClient.getResults(selectedAsset.id, period);
        setResult(res as BacktestResult);
      } catch (error) {
        console.error("Error loading backtest results", error);
        setResult(null);
      } finally {
        setIsLoadingResult(false);
      }
    }
    loadResults();
  }, [selectedAsset, period]);

  // Process data for charts
  const mergedCurveData = useMemo(() => {
    if (!result?.equity_curve || !result?.bh_curve) return [];
    const dates = result.equity_curve.Date || [];
    return dates.map((date, i) => ({
      date,
      Strategy: result.equity_curve.cum_returns_st[i] || 0,
      BuyAndHold: result.bh_curve.BH_rets[i] || 0
    }));
  }, [result]);

  const drawdownData = useMemo(() => {
    if (!result?.drawdown_curve) return [];
    return result.drawdown_curve.Date.map((date, i) => ({
      date,
      Drawdown: result.drawdown_curve.drawdown[i] || 0
    }));
  }, [result]);

  const longsRetsBuckets = useMemo(() => createBuckets(result?.distributions?.longs_rets, 15), [result]);
  const daysInsideBuckets = useMemo(() => createBuckets(result?.distributions?.days_inside, 15), [result]);
  
  const longsRetsMean = useMemo(() => {
    const data = result?.distributions?.longs_rets;
    if (!data || data.length === 0) return null;
    return data.reduce((a, b) => a + b, 0) / data.length;
  }, [result]);

  const daysInsideMean = useMemo(() => {
    const data = result?.distributions?.days_inside;
    if (!data || data.length === 0) return null;
    return data.reduce((a, b) => a + b, 0) / data.length;
  }, [result]);

  // Bootstrap processing
  const bootstrapData = result?.distributions?.bootstrap;
  const bootstrapArray = bootstrapData?.estadisticas_bootstrap_ci || bootstrapData?.estadisticas_bootstrap_h0 || [];
  const bootstrapBuckets = useMemo(() => createBuckets(bootstrapArray, 20), [bootstrapArray]);

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-100px)] pt-4 pb-20">
      
      {/* LEFT PANEL: Asset Selection */}
      <div className="w-full md:w-1/3 xl:w-1/4 flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-4 h-4 rounded-sm border border-terminal-green/50 flex flex-wrap content-center justify-center p-0.5 gap-0.5">
             <div className="w-[5px] h-[5px] bg-terminal-green/80"></div>
             <div className="w-[5px] h-[5px] bg-terminal-green/30"></div>
             <div className="w-[5px] h-[5px] bg-terminal-green/30"></div>
             <div className="w-[5px] h-[5px] bg-terminal-green/80"></div>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white uppercase">Portfolio BackTest</h1>
        </div>
        
        <div className="cyber-card p-4 rounded-xl border-t-2 border-t-terminal-green flex-1 flex flex-col max-h-[85vh]">
          <h2 className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-4">Select Asset Bot</h2>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-terminal-green/20">
            {isLoadingAssets ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-terminal-green"></div>
              </div>
            ) : (
              assets.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 group flex justify-between items-center ${
                    selectedAsset?.id === asset.id 
                      ? 'bg-terminal-green/10 border-terminal-green text-terminal-green shadow-[0_0_15px_rgba(0,255,148,0.1)]' 
                      : 'bg-void border-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`font-bold tracking-widest uppercase ${selectedAsset?.id === asset.id ? 'text-terminal-green' : 'text-white group-hover:text-terminal-green transition-colors'}`}>
                      {asset.asset}
                    </span>
                    <span className="text-[10px] font-mono opacity-60">ID: {asset.id} • {asset.bot_name}</span>
                  </div>
                  {selectedAsset?.id === asset.id && <Terminal size={14} className="text-terminal-green" />}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Dashboard */}
      <div className="flex-1 flex flex-col gap-6">
        {selectedAsset ? (
          <>
            {/* Header: Title and Period Selection */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase flex items-center gap-3">
                  {selectedAsset.asset} <span className="text-sm font-mono text-terminal-green border border-terminal-green px-2 py-1 rounded bg-terminal-green/10">ID: {selectedAsset.id}</span>
                </h2>
                <p className="text-gray-500 font-mono text-sm mt-1 uppercase tracking-widest">{selectedAsset.bot_name} • {selectedAsset.family_name}</p>
              </div>

              <div className="flex bg-void border border-white/10 rounded-lg p-1">
                {PERIODS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPeriod(p.id)}
                    className={`px-4 py-2 text-xs font-bold font-mono tracking-widest uppercase rounded-md transition-all ${
                      period === p.id 
                        ? 'bg-terminal-green text-black shadow-[0_0_10px_rgba(0,255,148,0.3)]' 
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingResult ? (
              <div className="flex-1 flex flex-col items-center justify-center cyber-card border-dashed">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-terminal-green mb-4"></div>
                 <p className="text-terminal-green font-mono text-xs tracking-widest uppercase animate-pulse">Running Backtest Simulation...</p>
              </div>
            ) : !result ? (
              <div className="flex-1 flex flex-col items-center justify-center cyber-card border-dashed">
                 <Database className="text-white/20 mb-4" size={48} />
                 <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">No backtest data available for this period.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="cyber-card p-4 rounded-xl border-t-2 border-t-sky-400/50">
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-1.5"><ArrowUpRight size={12}/> CAGR</p>
                    <p className={`text-xl font-mono font-bold mt-2 ${result?.metrics?.CAGR !== undefined && result.metrics.CAGR >= 0 ? 'text-terminal-green' : 'text-red-500'}`}>
                      {result?.metrics?.CAGR !== undefined ? `${result.metrics.CAGR.toFixed(2)}%` : 'N/A'}
                    </p>
                    {result?.metrics?.BH_rets_EA !== undefined && (
                      <p className="text-[9px] font-mono text-gray-500 mt-1 uppercase">BH: {result?.metrics?.BH_rets_EA?.toFixed(2)}%</p>
                    )}
                  </div>
                  <div className="cyber-card p-4 rounded-xl border-t-2 border-t-red-500/50">
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-1.5"><ShieldAlert size={12}/> Max DD</p>
                    <p className="text-xl text-white font-mono font-bold mt-2">
                      {result?.metrics?.max_dd !== undefined ? `${result?.metrics?.max_dd?.toFixed(2)}%` : 'N/A'}
                    </p>
                    {result?.metrics?.BH_max_dd !== undefined && (
                      <p className="text-[9px] font-mono text-gray-500 mt-1 uppercase">BH: {result?.metrics?.BH_max_dd?.toFixed(2)}%</p>
                    )}
                  </div>
                  <div className="cyber-card p-4 rounded-xl border-t-2 border-t-purple-500/50">
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-1.5"><Target size={12}/> Profit Factor</p>
                    <p className="text-xl text-white font-mono font-bold mt-2">
                      {result?.metrics?.prof_fact !== undefined ? result?.metrics?.prof_fact?.toFixed(2) : 'N/A'}
                    </p>
                  </div>
                  <div className="cyber-card p-4 rounded-xl border-t-2 border-t-terminal-green/50">
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-1.5"><Activity size={12}/> Win Rate</p>
                    <p className="text-xl text-white font-mono font-bold mt-2">
                      {result?.metrics?.prof_trds !== undefined ? `${result?.metrics?.prof_trds?.toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                  <div className="cyber-card p-4 rounded-xl border-t-2 border-t-blue-500/50">
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-1.5"><TrendingUp size={12}/> Win/Loss</p>
                    <p className="text-xl text-white font-mono font-bold mt-2">
                      {result?.metrics?.['wns/ls'] !== undefined ? result?.metrics?.['wns/ls']?.toFixed(2) : 'N/A'}
                    </p>
                  </div>
                  <div className="cyber-card p-4 rounded-xl border-t-2 border-t-amber-500/50">
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> Trades</p>
                    <p className="text-xl text-white font-mono font-bold mt-2">
                      {result?.metrics?.no_trds !== undefined ? result?.metrics?.no_trds : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Equity Curve */}
                  <div className="cyber-card p-5 rounded-xl border border-white/5 lg:col-span-2">
                    <h3 className="text-xs text-white font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
                      <BarChart2 size={14} className="text-terminal-green"/> Equity vs Buy & Hold
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mergedCurveData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                          <XAxis dataKey="date" stroke="#666" tick={{fill: '#666', fontSize: 10}} minTickGap={30} />
                          <YAxis stroke="#666" tick={{fill: '#666', fontSize: 10}} tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#333', borderRadius: '8px' }}
                            itemStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
                            labelStyle={{ color: '#888', marginBottom: '4px', fontSize: '10px' }}
                            formatter={(value: any) => [`${(Number(value) * 100).toFixed(2)}%`]}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                          <Line type="monotone" dataKey="Strategy" stroke="#00FF94" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#00FF94' }} />
                          <Line type="monotone" dataKey="BuyAndHold" stroke="#00D4FF" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Drawdown Area */}
                  <div className="cyber-card p-5 rounded-xl border border-white/5">
                    <h3 className="text-xs text-white font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Activity size={14} className="text-red-500"/> Drawdown Profile
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={drawdownData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                          <XAxis dataKey="date" stroke="#666" tick={{fill: '#666', fontSize: 10}} minTickGap={30} />
                          <YAxis stroke="#666" tick={{fill: '#666', fontSize: 10}} tickFormatter={(val) => `${val.toFixed(0)}%`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#333', borderRadius: '8px' }}
                            itemStyle={{ fontFamily: 'monospace', fontSize: '12px', color: '#ef4444' }}
                            labelStyle={{ color: '#888', marginBottom: '4px', fontSize: '10px' }}
                            formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Drawdown']}
                          />
                          <Area type="monotone" dataKey="Drawdown" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Bottom Distributions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Longs Rets */}
                  <div className="cyber-card p-5 rounded-xl border border-white/5 bg-void">
                    <h3 className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mb-4">Trade Returns Dist (Longs)</h3>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={longsRetsBuckets} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                          <XAxis dataKey="min" type="number" domain={['auto', 'auto']} stroke="#555" tick={{fill: '#555', fontSize: 9}} tickFormatter={(val) => val.toFixed(2)} />
                          <YAxis stroke="#555" tick={{fill: '#555', fontSize: 9}} />
                          <Tooltip 
                            cursor={{fill: '#111'}}
                            contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#333', borderRadius: '8px' }}
                            itemStyle={{ fontFamily: 'monospace', fontSize: '12px', color: '#00D4FF' }}
                            labelStyle={{ color: '#888', fontSize: '10px' }}
                            formatter={(value: any) => [value, 'Count']}
                            labelFormatter={(val) => `Value: ${Number(val).toFixed(2)}`}
                          />
                          <Bar dataKey="count" fill="#00D4FF" radius={[2, 2, 0, 0]} />
                          {longsRetsMean !== null && (
                            <ReferenceLine x={longsRetsMean} stroke="#fff" strokeWidth={2} label={{ position: 'top', value: 'Mean', fill: '#fff', fontSize: 10 }} />
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Bootstrap CI with Markers */}
                  <div className="cyber-card p-5 rounded-xl border border-white/5 bg-void relative">
                    <h3 className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mb-4">Bootstrap H0 & Confidence</h3>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bootstrapBuckets} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                          <XAxis dataKey="min" type="number" domain={['auto', 'auto']} stroke="#555" tick={{fill: '#555', fontSize: 9}} tickFormatter={(val) => val.toFixed(2)} />
                          <YAxis stroke="#555" tick={{fill: '#555', fontSize: 9}} />
                          <Tooltip 
                            cursor={{fill: '#111'}}
                            contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#333', borderRadius: '8px' }}
                            itemStyle={{ fontFamily: 'monospace', fontSize: '12px', color: '#7B61FF' }}
                            labelStyle={{ color: '#888', fontSize: '10px' }}
                            formatter={(value: any) => [value, 'Freq']}
                            labelFormatter={(val) => `Value: ${Number(val).toFixed(2)}`}
                          />
                          <Bar dataKey="count" fill="#7B61FF" opacity={0.6} radius={[2, 2, 0, 0]} />
                          
                          {/* Reference Lines for CI, Statistic, Critical and Mean H0 */}
                          {bootstrapData?.statistic_of_back_test !== undefined && (
                            <ReferenceLine x={bootstrapData.statistic_of_back_test} stroke="#00FF94" strokeWidth={2} strokeDasharray="3 3" label={{ position: 'top', value: 'Stat', fill: '#00FF94', fontSize: 10 }} />
                          )}
                          {bootstrapData?.valor_critico !== undefined && (
                            <ReferenceLine x={bootstrapData.valor_critico} stroke="#FF00E5" strokeWidth={1} strokeDasharray="5 5" label={{ position: 'top', value: 'Crit', fill: '#FF00E5', fontSize: 9 }} />
                          )}
                          {bootstrapData?.media_h0 !== undefined && (
                            <ReferenceLine x={bootstrapData.media_h0} stroke="#FFD700" strokeWidth={1} label={{ position: 'top', value: 'Mean H0', fill: '#FFD700', fontSize: 9 }} />
                          )}
                          {bootstrapData?.confidence_interaval_30 && bootstrapData.confidence_interaval_30.length === 2 && (
                            <>
                              <ReferenceLine x={bootstrapData.confidence_interaval_30[0]} stroke="#ef4444" strokeWidth={1} label={{ position: 'insideTopLeft', value: 'CI-', fill: '#ef4444', fontSize: 9 }} />
                              <ReferenceLine x={bootstrapData.confidence_interaval_30[1]} stroke="#ef4444" strokeWidth={1} label={{ position: 'insideTopRight', value: 'CI+', fill: '#ef4444', fontSize: 9 }} />
                            </>
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Days Inside */}
                  <div className="cyber-card p-5 rounded-xl border border-white/5 bg-void">
                    <h3 className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mb-4">Days Inside Dist</h3>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={daysInsideBuckets} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                          <XAxis dataKey="min" type="number" domain={['auto', 'auto']} stroke="#555" tick={{fill: '#555', fontSize: 9}} tickFormatter={(val) => val.toFixed(0)} />
                          <YAxis stroke="#555" tick={{fill: '#555', fontSize: 9}} />
                          <Tooltip 
                            cursor={{fill: '#111'}}
                            contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#333', borderRadius: '8px' }}
                            itemStyle={{ fontFamily: 'monospace', fontSize: '12px', color: '#f59e0b' }}
                            labelStyle={{ color: '#888', fontSize: '10px' }}
                            formatter={(value: any) => [value, 'Count']}
                            labelFormatter={(val) => `Days: ${Number(val).toFixed(0)}`}
                          />
                          <Bar dataKey="count" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                          {daysInsideMean !== null && (
                            <ReferenceLine x={daysInsideMean} stroke="#fff" strokeWidth={2} label={{ position: 'top', value: 'Mean', fill: '#fff', fontSize: 10 }} />
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center cyber-card border-dashed min-h-[400px]">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 ring-1 ring-white/10">
               <Terminal className="text-terminal-green" size={24} />
             </div>
             <h3 className="text-xl font-bold uppercase tracking-widest text-white">No Asset Selected</h3>
             <p className="text-gray-500 mt-2 max-w-sm text-center text-sm font-mono">
               Select an asset from the portfolio list to run its backtest simulation and visualize the alpha decay metrics.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
