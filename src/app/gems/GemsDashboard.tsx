'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { SelectedAsset } from '@/app/api/types';
import ScrapperTactics from './components/ScrapperTactics';
import AIAnalysisPanel from './components/AIAnalysisPanel';
import { buildAnalysisPrompt } from '@/app/api/analyze/prompt';

export default function GemsDashboard() {
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(null);

  const promptText = useMemo(() => {
    if (!selectedAsset) return '';
    const m = selectedAsset.raw_metrics || {};
    return buildAnalysisPrompt({
      company_name: selectedAsset.company_name || 'Unknown Company',
      roic: String(m.roic ?? m.ROIC ?? 'N/A'),
      ev_ebitda: String(m['EV/EBITDA'] ?? m.ev_ebitda ?? 'N/A'),
      oper_margin: String(m.oper_margin ?? 'N/A'),
      oper_margin_avg: String(m.oper_margin_avg ?? m['Operating Margin Industry Avg'] ?? 'N/A'),
      sales_growth_yoy: String(m.sales_growth_yoy ?? 'N/A'),
      sales_growth_qoq: String(m.sales_growth_qoq ?? 'N/A'),
      sales_growth_qoq_avg: String(m.sales_growth_qoq_avg ?? m['Sales Growth QoQ industry Avg'] ?? 'N/A'),
      sales_growth_yoy_avg: String(m.sales_growth_yoy_avg ?? m['Sales Growth YoY industry Avg'] ?? 'N/A'),
      price_per_fcf: String(m.price_per_fcf ?? m['Price to FCF'] ?? m['P/FCF'] ?? 'N/A'),
      priceToFCF_avg: String(m.priceToFCF_avg ?? m['Price to FCF Industry Avg'] ?? 'N/A'),
      earnings_date: String(m.earnings_date ?? m['Earnings Date'] ?? 'N/A'),
    });
  }, [selectedAsset]);

  const handleAssetSelect = useCallback((asset: SelectedAsset) => {
    setSelectedAsset(asset);
  }, []);

  return (
    <>
      {/* Main scrapper section with tactics, table, and competitor charts */}
      <ScrapperTactics onAssetSelect={handleAssetSelect} />

      {/* AI Prompt Generator panel — always visible once an asset is selected */}
      <AIAnalysisPanel
        asset={selectedAsset}
        promptText={promptText}
      />
    </>
  );
}
