export default function BacktestsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Backtests Lab</h1>
      <p className="text-gray-400">Simula estrategias en datos históricos con baja latencia.</p>
      
      <div className="glass-card p-8 rounded-2xl border-dashed border-white/10 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <span className="text-2xl">🧪</span>
        </div>
        <h3 className="text-xl font-bold">Sin experimentos activos</h3>
        <p className="text-gray-500 mt-2 max-w-sm">
          Carga un script de estrategia para comenzar el procesamiento en el cluster.
        </p>
        <button className="mt-6 px-6 py-3 rounded-lg bg-[var(--terminal-green)] text-black font-bold hover:brightness-110 transition-all">
          Nuevo Backtest
        </button>
      </div>
    </div>
  );
}
