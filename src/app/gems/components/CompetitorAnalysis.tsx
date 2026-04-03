'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ReferenceLine, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { apiGemsfinderClient } from '@/app/api/client';
import { SelectedAsset, CompetitorAsset } from '@/app/api/types';
import { Loader2, GitCompare, TrendingUp, Zap, Target } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strips %, $, and other chars; returns 0 if unparseable */
function parseMetric(val: string | undefined | null): number {
  if (!val) return 0;
  const n = parseFloat(String(val).replace(/[%$,BbMmTt]/g, '').trim());
  return isNaN(n) ? 0 : n;
}

/** Market cap string → approximate number for bubble sizing */
function parseMarketCap(val: string | undefined | null): number {
  if (!val) return 0;
  const str = String(val).trim().toUpperCase();
  if (str.endsWith('T')) return parseFloat(str) * 1_000_000;
  if (str.endsWith('B')) return parseFloat(str) * 1_000;
  if (str.endsWith('M')) return parseFloat(str);
  return parseFloat(str) || 0;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ComboAsset {
  ticker: string;
  company_name: string;
  isTarget: boolean;
  roic: number;
  oper_margin: number;
  sales_growth_yoy: number;
  ev_ebitda: number;
  price_per_fcf: number;
  peg: number;
  market_cap_num: number;
  inv_pfcf: number;
  inv_peg: number;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const NEON = '#00f3ff';
const PURPLE = '#a855f7';

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(0,4,20,0.95)',
  border: '1px solid rgba(0,243,255,0.2)',
  borderRadius: '8px',
  color: '#e5e7eb',
  fontSize: '11px',
};

function BarTab({
  data,
  dataKey,
  label,
  color,
  targetTicker,
}: {
  data: ComboAsset[];
  dataKey: keyof ComboAsset;
  label: string;
  color: string;
  targetTicker: string;
}) {
  const chartData = [...data]
    .filter(a => (a[dataKey] as number) !== 0)
    .sort((a, b) => (b[dataKey] as number) - (a[dataKey] as number));

  const mean =
    chartData.reduce((s, a) => s + (a[dataKey] as number), 0) /
    (chartData.length || 1);

  return (
    <div className="h-[380px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 64, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis type="number" stroke="#4b5563" tick={{ fontSize: 10, fill: '#6b7280' }} />
          <YAxis
            dataKey="ticker"
            type="category"
            stroke="#4b5563"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            width={56}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as ComboAsset;
              const val = payload[0].value;
              return (
                <div style={TOOLTIP_STYLE} className="p-3 rounded-lg shadow-xl">
                  <p className="font-bold text-white mb-1 mono">{d.ticker}</p>
                  <p className="text-gray-400 text-[10px] mb-1.5">{d.company_name}</p>
                  <p className="text-cyan-400 text-xs">
                    {label}: <span className="font-bold">{typeof val === 'number' ? val.toFixed(2) : val}</span>
                  </p>
                </div>
              );
            }}
          />
          <ReferenceLine
            x={mean}
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `Avg: ${mean.toFixed(1)}`,
              fill: '#ef4444',
              fontSize: 9,
              position: 'top',
            }}
          />
          <Bar dataKey={dataKey as string} name={label} maxBarSize={14} radius={[0, 2, 2, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.ticker === targetTicker ? NEON : color}
                opacity={entry.ticker === targetTicker ? 1 : 0.65}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ScatterTabConfig {
  xKey: keyof ComboAsset;
  yKey: keyof ComboAsset;
  zKey: keyof ComboAsset;
  xLabel: string;
  yLabel: string;
  zLabel: string;
}

function BubbleChart({
  data,
  cfg,
  targetTicker,
}: {
  data: ComboAsset[];
  cfg: ScatterTabConfig;
  targetTicker: string;
}) {
  const valid = data.filter(
    a =>
      (a[cfg.xKey] as number) !== 0 &&
      (a[cfg.yKey] as number) !== 0 &&
      (a[cfg.zKey] as number) > 0
  );

  if (valid.length === 0)
    return (
      <div className="flex items-center justify-center h-[380px] text-gray-500 italic text-sm">
        Datos insuficientes para esta vista.
      </div>
    );

  return (
    <div className="h-[380px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 24, bottom: 32, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            type="number"
            dataKey={cfg.xKey as string}
            name={cfg.xLabel}
            stroke="#4b5563"
            tick={{ fontSize: 10, fill: '#6b7280' }}
            label={{
              value: cfg.xLabel,
              position: 'insideBottom',
              offset: -16,
              fill: '#6b7280',
              fontSize: 10,
            }}
          />
          <YAxis
            type="number"
            dataKey={cfg.yKey as string}
            name={cfg.yLabel}
            stroke="#4b5563"
            tick={{ fontSize: 10, fill: '#6b7280' }}
            label={{
              value: cfg.yLabel,
              angle: -90,
              position: 'insideLeft',
              fill: '#6b7280',
              fontSize: 10,
            }}
          />
          <ZAxis
            type="number"
            dataKey={cfg.zKey as string}
            range={[40, 600]}
            name={cfg.zLabel}
          />
          <Tooltip
            cursor={{ strokeDasharray: '4 4', stroke: 'rgba(255, 255, 255, 0.5)' }}
            contentStyle={TOOLTIP_STYLE}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as ComboAsset;
              return (
                <div style={TOOLTIP_STYLE} className="p-3 rounded-lg shadow-xl">
                  <p className="font-bold text-white mb-1.5 mono">{d.ticker}</p>
                  <p className="text-gray-400 text-[10px] mb-2">{d.company_name}</p>
                  <p className="text-cyan-400">
                    {cfg.xLabel}: {(d[cfg.xKey] as number).toFixed(2)}
                  </p>
                  <p className="text-purple-400">
                    {cfg.yLabel}: {(d[cfg.yKey] as number).toFixed(2)}
                  </p>
                  <p className="text-yellow-400">
                    {cfg.zLabel}: {(d[cfg.zKey] as number).toFixed(3)}
                  </p>
                </div>
              );
            }}
          />
          <Scatter name="Competitors" data={valid}>
            {valid.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.ticker === targetTicker ? NEON : PURPLE}
                stroke={entry.ticker === targetTicker ? '#fff' : 'transparent'}
                strokeWidth={entry.ticker === targetTicker ? 2 : 0}
                opacity={entry.ticker === targetTicker ? 1 : 0.6}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const LEFT_METRICS: {
  key: keyof ComboAsset;
  label: string;
  color: string;
}[] = [
    { key: 'roic', label: 'ROIC (%)', color: NEON },
    { key: 'oper_margin', label: 'Op. Margin (%)', color: '#f59e0b' },
    { key: 'sales_growth_yoy', label: 'Sales Growth YoY (%)', color: '#10b981' },
    { key: 'ev_ebitda', label: 'EV/EBITDA', color: '#a855f7' },
  ];

const RIGHT_TABS: {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  cfg: ScatterTabConfig;
}[] = [
    {
      id: 'compounder',
      label: 'Compounder',
      subtitle: 'Calidad + Crecimiento',
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      cfg: {
        xKey: 'sales_growth_yoy',
        yKey: 'roic',
        zKey: 'inv_pfcf',
        xLabel: 'Sales Growth YoY (%)',
        yLabel: 'ROIC (%)',
        zLabel: '1/P•FCF',
      },
    },
    {
      id: 'ganga',
      label: 'Ganga',
      subtitle: 'Eficiencia de Capital vs. Valoración',
      icon: <Zap className="w-3.5 h-3.5" />,
      cfg: {
        xKey: 'ev_ebitda',
        yKey: 'roic',
        zKey: 'inv_peg',
        xLabel: 'EV/EBITDA',
        yLabel: 'ROIC (%)',
        zLabel: '1/PEG',
      },
    },
    {
      id: 'regla40',
      label: 'Regla del 40',
      subtitle: 'para Growth / SaaS',
      icon: <Target className="w-3.5 h-3.5" />,
      cfg: {
        xKey: 'sales_growth_yoy',
        yKey: 'inv_pfcf',
        zKey: 'market_cap_num',
        xLabel: 'Sales Growth YoY (%)',
        yLabel: '1/P•FCF',
        zLabel: 'Market Cap',
      },
    },
  ];

function toComboAsset(
  asset: SelectedAsset | CompetitorAsset,
  isTarget: boolean,
  marketCapStr?: string
): ComboAsset {
  const m = asset.raw_metrics || {};
  const pfcf = parseMetric(m.price_per_fcf);
  const peg = parseMetric(m.peg || m.PEG);
  // API returns the key literally as "EV/EBITDA" — fall back to snake_case variants
  const evEbitda = parseMetric(m['EV/EBITDA'] || m['ev/ebitda'] || m.ev_ebitda);
  // market_cap comes as a field on SelectedAsset but also lives in raw_metrics for competitors
  const marketCap = marketCapStr || m.marketCap || m.market_cap || m['Market Cap'];
  return {
    ticker: asset.ticker || '',
    company_name: asset.company_name || '',
    isTarget,
    roic: parseMetric(m.roic || m.ROIC),
    oper_margin: parseMetric(m.oper_margin),
    sales_growth_yoy: parseMetric(m.sales_growth_yoy),
    ev_ebitda: evEbitda,
    price_per_fcf: pfcf,
    peg,
    market_cap_num: parseMarketCap(marketCap),
    inv_pfcf: pfcf > 0 ? 1 / pfcf : 0,
    inv_peg: peg > 0 ? 1 / peg : 0,
  };
}

interface CompetitorAnalysisProps {
  targetAsset: SelectedAsset;
}

export default function CompetitorAnalysis({ targetAsset }: CompetitorAnalysisProps) {
  const [competitors, setCompetitors] = useState<CompetitorAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState<keyof ComboAsset>('roic');
  const [activeRightTab, setActiveRightTab] = useState('compounder');

  useEffect(() => {
    if (!targetAsset?.id) return;
    setIsLoading(true);
    apiGemsfinderClient
      .getCompetitors(targetAsset.id)
      .then(setCompetitors)
      .catch(err => console.error('Error loading competitors:', err))
      .finally(() => setIsLoading(false));
  }, [targetAsset?.id]);

  const allAssets: ComboAsset = toComboAsset(targetAsset, true, targetAsset.market_cap);
  const competitorAssets: ComboAsset[] = competitors.map(c =>
    toComboAsset(c, false)
  );
  const combined: ComboAsset[] = [allAssets, ...competitorAssets];

  const currentLeftMetric = LEFT_METRICS.find(m => m.key === activeLeftTab) || LEFT_METRICS[0];
  const currentRightTab = RIGHT_TABS.find(t => t.id === activeRightTab) || RIGHT_TABS[0];

  return (
    <section className="mt-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <GitCompare className="text-[var(--holo-blue)] w-5 h-5" />
        <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">
          Competitor Analysis
        </h2>
        <span className="mono text-[10px] text-gray-500 border border-white/10 px-2 py-0.5 rounded">
          {targetAsset.ticker} ·{' '}
          <span className="text-gray-400">{targetAsset.industry || 'Industry'}</span>
        </span>
      </div>

      {isLoading ? (
        <div className="glass-card rounded-xl border-white/5 bg-white/[0.02] p-16 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[var(--holo-blue)] animate-spin" />
          <span className="mono text-gray-500 uppercase italic text-sm">
            Cargando datos de competidores...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* ── Left: Metric Bar Charts ─────────────────────────── */}
          <div className="glass-card rounded-xl border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/10 overflow-x-auto">
              {LEFT_METRICS.map(m => (
                <button
                  key={m.key}
                  onClick={() => setActiveLeftTab(m.key)}
                  className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeLeftTab === m.key
                    ? 'text-[var(--holo-blue)] border-b-2 border-[var(--holo-blue)] bg-white/[0.02]'
                    : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                  {m.label.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Chart title */}
            <div className="px-5 pt-4 pb-1">
              <p className="text-xs font-semibold text-gray-400">{currentLeftMetric.label}</p>
              <p className="text-[10px] text-gray-600">
                {combined.length} companies · Destacado:{' '}
                <span className="text-[var(--holo-blue)]">{targetAsset.ticker}</span>
              </p>
            </div>

            <div className="px-2 pb-4">
              <BarTab
                data={combined}
                dataKey={currentLeftMetric.key}
                label={currentLeftMetric.label}
                color={currentLeftMetric.color}
                targetTicker={targetAsset.ticker}
              />
            </div>
          </div>

          {/* ── Right: Bubble Chart Tabs ────────────────────────── */}
          <div className="glass-card rounded-xl border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {RIGHT_TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveRightTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-bold uppercase tracking-wider transition-all ${activeRightTab === t.id
                    ? 'text-[var(--holo-blue)] border-b-2 border-[var(--holo-blue)] bg-white/[0.02]'
                    : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Subtitle */}
            <div className="px-5 pt-4 pb-1">
              <p className="text-xs font-semibold text-gray-400">{currentRightTab.label}</p>
              <p className="text-[10px] text-gray-600 italic">{currentRightTab.subtitle}</p>
            </div>

            <div className="px-2 pb-4">
              <BubbleChart
                data={combined}
                cfg={currentRightTab.cfg}
                targetTicker={targetAsset.ticker}
              />
            </div>

            {/* Legend */}
            <div className="px-5 pb-4 flex gap-4 text-[10px] mono text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                {targetAsset.ticker} (Seleccionado)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block opacity-70" />
                Competidores
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
