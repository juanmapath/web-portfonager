'use client';

import React, { useState, useCallback } from 'react';
import { SelectedAsset } from '@/app/api/types';
import ScrapperTactics from './components/ScrapperTactics';
import AIAnalysisPanel from './components/AIAnalysisPanel';

export default function GemsDashboard() {
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const runAnalysis = useCallback(async (asset: SelectedAsset) => {
    setIsAnalyzing(true);
    setAiAnalysis('');
    setAnalysisError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: asset.company_name,
          raw_metrics: asset.raw_metrics,
        }),
      });
      const data = await res.json() as { analysis?: string; error?: string };
      if (!res.ok || data.error) {
        setAnalysisError(data.error || `Error ${res.status}`);
      } else {
        setAiAnalysis(data.analysis || '');
      }
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Only select the asset — do NOT auto-trigger analysis
  const handleAssetSelect = useCallback((asset: SelectedAsset) => {
    setSelectedAsset(asset);
    setAiAnalysis('');
    setAnalysisError(null);
  }, []);

  // Manual trigger for AI analysis
  const handleRunAnalysis = useCallback(() => {
    if (selectedAsset) runAnalysis(selectedAsset);
  }, [selectedAsset, runAnalysis]);

  return (
    <>
      {/* Main scrapper section with tactics, table, and competitor charts */}
      <ScrapperTactics onAssetSelect={handleAssetSelect} />

      {/* AI Analysis panel — always visible once an asset is selected */}
      <AIAnalysisPanel
        asset={selectedAsset}
        analysis={aiAnalysis}
        isLoading={isAnalyzing}
        error={analysisError}
        onAnalyze={handleRunAnalysis}
      />
    </>
  );
}
