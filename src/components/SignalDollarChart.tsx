"use client";

import React, { useEffect, useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  Legend
} from 'recharts';
import { DollarSign, Activity, TrendingUp, AlertCircle, RefreshCw, MoveHorizontal } from 'lucide-react';
import { useProftviewStore } from '@/store/useProftviewStore';

export function SignalDollarChart() {
  const { dollarSignal, isLoadingDollar, errorDollar, fetchSignalDollar } = useProftviewStore();
  const [activePeriod, setActivePeriod] = useState<"historical" | "last_year" | "last_month">("last_year");
  const [brushRange, setBrushRange] = useState<{ startIndex?: number; endIndex?: number } | null>(null);

  useEffect(() => {
    fetchSignalDollar();
  }, [fetchSignalDollar]);

  const currentData = useMemo(() => {
    if (!dollarSignal) return [];
    return dollarSignal[activePeriod] || [];
  }, [dollarSignal, activePeriod]);

  // Manejo del rango del Brush para que al seleccionar "historical" cargue por defecto los últimos 10 años
  useEffect(() => {
    if (activePeriod === "historical" && dollarSignal && dollarSignal.historical.length > 0) {
      const data = dollarSignal.historical;
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
      const targetDateStr = tenYearsAgo.toISOString().split('T')[0];

      let startIdx = data.findIndex(p => p.date >= targetDateStr);
      if (startIdx === -1) {
        startIdx = Math.max(0, data.length - 2500); // aprox 10 años de días hábiles
      }
      setBrushRange({ startIndex: startIdx, endIndex: data.length - 1 });
    } else {
      setBrushRange(null);
    }
  }, [activePeriod, dollarSignal]);

  const buySignalPoints = useMemo(() => {
    return currentData.filter(p => p.buy_signal);
  }, [currentData]);

  if (isLoadingDollar && !dollarSignal) {
    return (
      <div className="cyber-card w-full h-[500px] flex flex-col items-center justify-center rounded-xl bg-panel border-dashed">
        <RefreshCw size={40} className="text-terminal-green/20 mb-6 animate-spin" />
        <p className="text-[10px] font-mono text-terminal-green/40 uppercase tracking-[0.4em]">CARGANDO SEÑALES DÓLAR (USD/COP)...</p>
      </div>
    );
  }

  if (errorDollar) {
    return (
      <div className="cyber-card w-full h-[500px] flex flex-col items-center justify-center rounded-xl bg-panel border-red-500/30">
        <AlertCircle size={40} className="text-red-500/40 mb-6" />
        <p className="text-[10px] font-mono text-red-500 uppercase tracking-[0.4em]">ERROR: {errorDollar}</p>
        <button
          onClick={fetchSignalDollar}
          className="mt-4 px-4 py-2 border border-red-500/50 text-red-500 font-mono text-xs uppercase hover:bg-red-500/10 transition-colors"
        >
          REINTENTAR
        </button>
      </div>
    );
  }

  if (!dollarSignal || currentData.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-black/90 border border-white/10 p-3 rounded-lg backdrop-blur-md shadow-2xl font-mono text-xs z-50">
          <p className="text-white/60 mb-2 uppercase tracking-widest border-b border-white/10 pb-1 flex justify-between items-center gap-4">
            <span>{label}</span>
            {dataPoint.buy_signal && (
              <span className="bg-terminal-green/20 text-terminal-green px-1.5 py-0.5 rounded border border-terminal-green/40 font-bold text-[10px]">
                BUY SIGNAL
              </span>
            )}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between gap-6">
              <span className="text-white/40 uppercase">Close USD/COP:</span>
              <span className="font-bold text-white">${dataPoint.close?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {dataPoint.bb_low !== null && dataPoint.bb_low !== undefined && (
              <div className="flex justify-between gap-6">
                <span className="text-white/40 uppercase">BB Low:</span>
                <span className="font-bold text-[#00D4FF]">${dataPoint.bb_low?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {dataPoint.zscore !== null && dataPoint.zscore !== undefined && (
              <div className="flex justify-between gap-6">
                <span className="text-white/40 uppercase">Z-Score:</span>
                <span className={`font-bold ${dataPoint.zscore <= -2 ? 'text-terminal-green' : 'text-cyber-purple'}`}>
                  {dataPoint.zscore?.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const latestPoint = currentData[currentData.length - 1] || null;

  return (
    <div className="cyber-card w-full rounded-xl bg-panel overflow-visible flex flex-col border-t-2 border-t-terminal-green/50">
      {/* Header & Tabs */}
      <div className="p-6 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-terminal-green/10 border border-terminal-green/30">
            <DollarSign size={24} className="text-terminal-green" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black tracking-widest text-white uppercase leading-none">Estrategia Dólar (USD/COP)</h3>
              {latestPoint && latestPoint.buy_signal && (
                <span className="animate-pulse px-2 py-0.5 bg-terminal-green text-black font-extrabold text-[9px] font-mono uppercase tracking-widest rounded-sm shadow-[0_0_10px_rgba(0,255,148,0.5)]">
                  SEÑAL ACTIVA
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1.5">
              TRM, Bandas de Bollinger Inferior y Z-Score
            </p>
          </div>
        </div>

        {/* Period Selection Tabs */}
        <div className="flex bg-void/80 p-1 rounded-lg border border-white/10 font-mono text-xs">
          {[
            { id: "historical", label: "Histórico" },
            { id: "last_year", label: "1 Año" },
            { id: "last_month", label: "1 Mes" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePeriod(tab.id as any)}
              className={`px-4 py-2 uppercase tracking-widest rounded-md font-bold transition-all duration-200 ${
                activePeriod === tab.id
                  ? "bg-terminal-green text-black shadow-[0_0_15px_rgba(0,255,148,0.4)]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart (Close & BB Low) */}
      <div className="p-6 pb-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2 px-2">
          <span className="text-xs font-mono text-white/60 uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-terminal-green" />
            Precio vs BB Low (2 SD)
          </span>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-[10px] text-white/60 uppercase">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-0.5 bg-white"></div>
              <span>Close (TRM)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-0.5 bg-[#00D4FF] border border-dashed"></div>
              <span>BB Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-terminal-green"></div>
              <span>Buy Signal</span>
            </div>
            {activePeriod === "historical" && (
              <div className="flex items-center gap-1.5 text-terminal-green bg-terminal-green/10 px-2 py-0.5 rounded border border-terminal-green/30">
                <MoveHorizontal size={12} />
                <span>Arrastrar & Zoom</span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentData} syncId="dollarChartSync" margin={{ top: 10, right: 10, left: 0, bottom: activePeriod === "historical" ? 10 : 0 }}>
              <defs>
                <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
                tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={(val) => `$${val.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Vertical lines for buy signals */}
              {buySignalPoints.map((p) => (
                <ReferenceLine
                  key={`sig-${p.date}`}
                  x={p.date}
                  stroke="#00FF94"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  label={{
                    value: "BUY",
                    position: "insideTopRight",
                    fill: "#00FF94",
                    fontSize: 10,
                    fontWeight: "bold",
                    fontFamily: "monospace"
                  }}
                />
              ))}

              <Area
                type="monotone"
                dataKey="close"
                name="Close"
                stroke="#FFFFFF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorClose)"
                isAnimationActive={true}
                animationDuration={1000}
              />

              <Line
                type="monotone"
                dataKey="bb_low"
                name="BB Low"
                stroke="#00D4FF"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="3 3"
                isAnimationActive={true}
                animationDuration={1000}
              />

              {/* Brush para navegación histórica interactiva */}
              {activePeriod === "historical" && (
                <Brush
                  dataKey="date"
                  height={30}
                  stroke="#00FF94"
                  fill="#050505"
                  startIndex={brushRange?.startIndex}
                  endIndex={brushRange?.endIndex}
                  onChange={(newRange) => setBrushRange(newRange)}
                  tickFormatter={(date) => date.split('-')[0]}
                  style={{ fill: "#050505" }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sub Chart (Z-Score) */}
      <div className="p-6 pt-4 border-t border-white/5">
        <div className="flex justify-between items-center mb-2 px-2">
          <span className="text-xs font-mono text-white/60 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={14} className="text-cyber-purple" />
            Z-Score (10d)
          </span>
          <span className="font-mono text-[10px] text-terminal-green uppercase tracking-widest">
            Nivel de sobreventa &lt;= -2
          </span>
        </div>

        <div className="w-full h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentData} syncId="dollarChartSync" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                hide={true}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[-3.5, 3.5]}
                tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }}
                ticks={[-3, -2, 0, 2, 3]}
              />
              <Tooltip content={<CustomTooltip />} />

              <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
              <ReferenceLine y={-2} stroke="#00FF94" strokeWidth={1} strokeDasharray="3 3" />

              {/* Vertical lines for buy signals matching top chart */}
              {buySignalPoints.map((p) => (
                <ReferenceLine
                  key={`sig-sub-${p.date}`}
                  x={p.date}
                  stroke="#00FF94"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              ))}

              <Line
                type="monotone"
                dataKey="zscore"
                name="Z-Score"
                stroke="#7B61FF"
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="px-6 py-3 bg-void/50 border-t border-white/5 flex justify-between items-center rounded-b-xl">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse"></div>
          <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">
            FUENTE: DATOS.GOV.CO (TRM)
          </span>
        </div>
        <button
          onClick={fetchSignalDollar}
          className="text-[10px] font-mono text-terminal-green uppercase tracking-widest hover:underline flex items-center gap-1.5"
        >
          <RefreshCw size={10} className={isLoadingDollar ? "animate-spin" : ""} />
          SINCRONIZAR
        </button>
      </div>
    </div>
  );
}
