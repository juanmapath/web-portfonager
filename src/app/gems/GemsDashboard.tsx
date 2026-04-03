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

  const handleAssetSelect = useCallback((asset: SelectedAsset) => {
    setSelectedAsset(asset);
    runAnalysis(asset);
  }, [runAnalysis]);

  const handleRetry = useCallback(() => {
    if (selectedAsset) runAnalysis(selectedAsset);
  }, [selectedAsset, runAnalysis]);

  return (
    <>
      {/* AI Analysis panel — shown whenever an asset is selected */}
      {selectedAsset && (
        <div className="mt-4">
          <AIAnalysisPanel
            asset={selectedAsset}
            analysis={aiAnalysis}
            isLoading={isAnalyzing}
            error={analysisError}
            onRetry={handleRetry}
          />
        </div>
      )}

      {/* Main scrapper section with tactics, table, and competitor charts */}
      <ScrapperTactics onAssetSelect={handleAssetSelect} />
    </>
  );
}
