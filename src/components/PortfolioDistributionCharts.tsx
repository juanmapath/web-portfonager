"use client";

import React, { useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Treemap, Legend } from 'recharts';
import { useProftviewStore } from '@/store/useProftviewStore';
import { Loader2, PieChart as PieIcon, Layers } from 'lucide-react';

const COLORS = [
  '#00FF94', // terminal-green
  '#9D4EDD', // cyber-purple
  '#3A86FF', // electric-blue
  '#FF006E', // neon-pink
  '#FFBE0B', // gold
  '#FB5607', // orange
  '#8338EC', // deep-purple
  '#34E0A1', // soft-green
  '#5465FF', // blue-indigo
  '#06D6A0', // mint
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black/90 border border-white/10 p-3 rounded-lg backdrop-blur-md shadow-2xl">
        <p className="font-mono text-xs text-white/60 uppercase tracking-widest mb-1">{data.bot_name || data.name}</p>
        <p className="font-black text-sm text-white">{data.asset || data.bot_name || data.name}</p>
        <div className="flex items-center gap-4 mt-2 border-t border-white/5 pt-2">
          <div>
            <p className="text-[10px] text-white/40 uppercase">Valor</p>
            <p className="text-sm font-mono text-terminal-green">${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase">Porcentaje</p>
            <p className="text-sm font-mono text-cyber-purple">{Number(data.percentage).toFixed(2)}%</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomizedContent = (props: any) => {
  const { x, y, width, height, index, name, percentage } = props;

  // Only show label if the box is big enough
  if (width < 40 || height < 20) return null;

  const displayPercentage = isNaN(Number(percentage)) ? "0.00" : Number(percentage).toFixed(2);

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: COLORS[index % COLORS.length],
          fillOpacity: 0.2,
          stroke: COLORS[index % COLORS.length],
          strokeWidth: 1.5,
          strokeOpacity: 0.4,
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - 5}
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize={11}
        fontWeight="900"
        className="uppercase tracking-widest fill-white"
        style={{ 
          pointerEvents: 'none', 
          textShadow: '0px 0px 3px rgba(0,0,0,1), 0px 0px 6px rgba(0,0,0,0.8)',
          paintOrder: 'stroke',
          stroke: 'rgba(0,0,0,0.5)',
          strokeWidth: '0.5px'
        }}
      >
        {props.asset_ticker || name}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 10}
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize={10}
        className="font-mono fill-white"
        style={{ 
          pointerEvents: 'none', 
          textShadow: '0px 0px 3px rgba(0,0,0,1), 0px 0px 6px rgba(0,0,0,0.8)',
          fillOpacity: 1,
          paintOrder: 'stroke',
          stroke: 'rgba(0,0,0,0.5)',
          strokeWidth: '0.5px'
        }}
      >
        {displayPercentage}%
      </text>
    </g>
  );
};

export function PortfolioDistributionCharts() {
  const { portfolioPercentages, isLoading, fetchPortfolioPercentages } = useProftviewStore();

  useEffect(() => {
    fetchPortfolioPercentages();
  }, [fetchPortfolioPercentages]);

  const treemapData = useMemo(() => {
    if (!portfolioPercentages) return [];
    return portfolioPercentages.asset_bot_percentages.map((item) => ({
      name: `${item.asset} (${item.bot_name})`,
      value: item.value,
      percentage: item.percentage,
      bot_name: item.bot_name,
      asset_ticker: item.asset
    }));
  }, [portfolioPercentages]);

  const pieData = useMemo(() => {
    if (!portfolioPercentages) return [];
    return portfolioPercentages.bot_percentages.map((item) => ({
      name: item.bot_name,
      value: item.value,
      percentage: item.percentage
    }));
  }, [portfolioPercentages]);

  if (isLoading && !portfolioPercentages) {
    return (
      <div className="h-[400px] flex items-center justify-center border border-white/5 bg-white/[0.01] rounded-xl">
        <Loader2 className="animate-spin text-terminal-green" size={32} />
      </div>
    );
  }

  if (!portfolioPercentages) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bot Distribution - Doughnut */}
      <div className="cyber-card p-6 min-h-[450px] flex flex-col rounded-xl border-t-2 border-t-terminal-green/50">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-terminal-green/10 border border-terminal-green/30">
            <PieIcon size={20} className="text-terminal-green" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-widest text-white/90 uppercase">Distribución por Bot</h3>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Balance de capital por estrategia</p>
          </div>
        </div>

        <div className="flex-1 relative">
          {/* Total display moved BEFORE chart to be in background */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-0">
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Total</p>
            <p className="text-2xl font-black text-white">
              ${(portfolioPercentages.total_portfolio_value / 1000).toFixed(1)}K
            </p>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    className="hover:opacity-80 transition-opacity cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                    style={{ filter: `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]}44)` }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                content={(props) => {
                  const { payload } = props;
                  return (
                    <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
                      {payload?.map((entry: any, index: number) => (
                        <li key={`item-${index}`} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                          <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">{entry.value}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset Distribution - Treemap */}
      <div className="cyber-card p-6 min-h-[450px] flex flex-col rounded-xl border-t-2 border-t-cyber-purple/50">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-cyber-purple/10 border border-cyber-purple/30">
            <Layers size={20} className="text-cyber-purple" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-widest text-white/90 uppercase">Distribución por Activo</h3>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Mapa de exposición de activos</p>
          </div>
        </div>

        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="value"
              aspectRatio={4 / 3}
              stroke="#000"
              content={<CustomizedContent />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
