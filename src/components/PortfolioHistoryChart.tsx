"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";
import { Activity, TrendingUp, BarChart2 } from "lucide-react";
import { apiProftviewClient } from "@/app/api/client";
import { PortfolioHistory } from "@/app/api/types";

export function PortfolioHistoryChart() {
  const [data, setData] = useState<PortfolioHistory[]>([]);
  const [activeTab, setActiveTab] = useState<"capital" | "returns">("returns");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const history = await apiProftviewClient.getHistory();
        setData(history);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setError("ERROR: SYSTEM_FETCH_FAILURE");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="cyber-card w-full h-[450px] flex flex-col items-center justify-center rounded-xl bg-panel animate-pulse border-dashed">
        <Activity size={40} className="text-terminal-green/20 mb-6 animate-spin" />
        <p className="text-[10px] font-mono text-terminal-green/40 uppercase tracking-[0.4em]">INITIATING DATA RETRIEVAL...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cyber-card w-full h-[450px] flex flex-col items-center justify-center rounded-xl bg-panel border-red-500/30">
        <Activity size={40} className="text-red-500/40 mb-6" />
        <p className="text-[10px] font-mono text-red-500 uppercase tracking-[0.4em]">{error}</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 border border-white/10 rounded-sm font-mono text-[10px]">
          <p className="text-gray-400 mb-2 uppercase tracking-widest">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-4 mb-0.5">
              <span className="uppercase text-gray-500">{entry.name}:</span>
              <span style={{ color: entry.color }} className="font-bold">
                {entry.name === "capital"
                  ? `$${entry.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                  : `${(entry.value).toFixed(2)}%`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="cyber-card w-full rounded-xl bg-panel overflow-visible flex flex-col group">
      {/* Chart Header / Tabs */}
      <div className="p-6 pb-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-terminal-green/5 border border-terminal-green/20">
            <BarChart2 size={18} className="text-terminal-green" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-widest text-white/90 uppercase leading-none">Historico del Portafolio</h3>
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-[0.2em] mt-2">Global System Metrics</p>
          </div>
        </div>

        <div className="flex bg-void/50 p-1 rounded-md border border-white/5">
          <button
            onClick={() => setActiveTab("capital")}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm flex items-center gap-2 ${activeTab === "capital"
              ? "bg-terminal-green text-black"
              : "text-gray-500 hover:text-white"
              }`}
          >
            <TrendingUp size={12} />
            Capital
          </button>
          <button
            onClick={() => setActiveTab("returns")}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm flex items-center gap-2 ${activeTab === "returns"
              ? "bg-cyber-purple text-white shadow-[0_0_15px_rgba(157,78,221,0.3)]"
              : "text-gray-500 hover:text-white"
              }`}
          >
            <Activity size={12} />
            Rendimientos
          </button>
        </div>
      </div>

      {/* Chart Body */}
      <div className="w-full h-[350px] min-h-[350px] p-6 pt-2 relative">
        {data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%" key={data.length}>
            {activeTab === "capital" ? (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff94" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ff94" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4b5563', fontSize: 9, fontFamily: 'monospace' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  tick={{ fill: '#4b5563', fontSize: 9, fontFamily: 'monospace' }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="capital"
                  name="capital"
                  stroke="#00ff94"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCapital)"
                  animationDuration={1500}
                />
              </AreaChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4b5563', fontSize: 9, fontFamily: 'monospace' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4b5563', fontSize: 9, fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${(val).toFixed(1)}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="rect"
                  wrapperStyle={{
                    fontSize: '9px',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    paddingBottom: '20px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ret_cums"
                  name="Portfolio"
                  stroke="#00ff94"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#00ff94', strokeWidth: 2, fill: '#000' }}
                />
                <Line
                  type="monotone"
                  dataKey="spy_ret"
                  name="SPY"
                  stroke="#9d4edd"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="qqq_ret"
                  name="QQQ"
                  stroke="#48cae4"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="5 5"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
      {/* Footer / Status */}
      <div className="px-6 py-4 bg-void/30 border-t border-white/5 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse"></div>
            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Feed: ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse opacity-50"></div>
            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Encryption: AES-256</span>
          </div>
        </div>
        <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">
          Last Check: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
