export default function GemsFinderPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Gems Finder</h1>
      <p className="text-gray-400">Escaneo de activos infravalorados basado en sentimiento y fundamentales.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl border-white/5">
          <h3 className="font-bold text-[var(--holo-blue)] mb-4">Escaneo de Sentimiento</h3>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="mono">$AAPL</span>
                <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400">BULLISH</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border-white/10 border-dashed border-2 flex items-center justify-center italic text-gray-500">
          Módulo de Análisis Visual (Próximamente)
        </div>
      </div>
    </div>
  );
}
