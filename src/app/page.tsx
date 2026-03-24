"use client";

import { useState } from "react";
import { Terminal, Activity, TrendingUp, Zap, LogOut } from "lucide-react";
import { useAuth } from "@/app/api/auth-context";
import { LoginModal } from "@/components/LoginModal";

export default function DashboardPage() {
  const { isAuthenticated, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="space-y-12 pb-20 pt-4">
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-sm border border-terminal-green/50 flex flex-wrap content-center justify-center p-0.5 gap-0.5">
              <div className="w-[5px] h-[5px] bg-terminal-green/80"></div>
              <div className="w-[5px] h-[5px] bg-terminal-green/30"></div>
              <div className="w-[5px] h-[5px] bg-terminal-green/30"></div>
              <div className="w-[5px] h-[5px] bg-terminal-green/80"></div>
            </div>
            <span className="font-mono text-terminal-green text-xs font-bold tracking-widest uppercase">APP INSTANCE: SYSTEM 5000</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white uppercase mt-2">
            PORTFONAGER DASHBOARD
          </h1>
        </div>
        <div className="flex gap-4">
          {!isAuthenticated ? (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="px-6 py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors rounded-sm flex items-center gap-2"
            >
              <Terminal size={14} />
              Iniciar Sesión
            </button>
          ) : (
            <button 
              onClick={logout}
              className="px-6 py-3 border border-red-500/50 text-red-500 font-extrabold text-xs uppercase tracking-widest hover:bg-red-500/10 transition-colors rounded-sm flex items-center gap-2"
            >
              <LogOut size={14} />
              Cerrar Sesión
            </button>
          )}
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {[
          {
            title: "Mejores Estrategias (Mes Pasado)",
            icon: TrendingUp,
            colorClass: "text-terminal-green",
            bgClass: "bg-terminal-green/10",
            borderClass: "border-terminal-green/30"
          },
          {
            title: "Mejores Tickers (Mes Pasado)",
            icon: Activity,
            colorClass: "text-cyber-purple",
            bgClass: "bg-cyber-purple/10",
            borderClass: "border-cyber-purple/30"
          }
        ].map((card, i) => (
          <div key={i} className={`cyber-card p-6 min-h-[320px] flex flex-col group rounded-xl border-t-2 ${i === 0 ? 'border-t-terminal-green/50' : 'border-t-cyber-purple/50'}`}>
            <div className="flex items-center gap-4 mb-8">
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-lg ${card.bgClass} border ${card.borderClass}`}
              >
                <card.icon size={20} className={card.colorClass} />
              </div>
              <h3 className="text-lg font-black tracking-widest text-white/90 uppercase">{card.title}</h3>
            </div>

            <div className="flex-1 border border-dashed border-white/5 bg-white/[0.01] rounded-lg flex items-center justify-center relative overflow-hidden group-hover:bg-white/[0.03] transition-colors">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
              <p className="text-[11px] font-mono text-gray-500 uppercase tracking-[0.2em]">Datos en tiempo real próximamente...</p>
            </div>
          </div>
        ))}
      </div>

      {/* Performance section */}
      <div className="space-y-6 pt-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-terminal-green" />
            <h2 className="text-[10px] font-extrabold tracking-[0.3em] uppercase text-terminal-green">Backtest Explorer</h2>
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase text-white">System Performance Analysis</h2>
        </div>

        <div className="cyber-card w-full h-[350px] flex flex-col items-center justify-center border-dashed rounded-xl bg-panel">
          <Activity size={40} className="text-white/10 mb-6" />
          <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.4em] max-w-sm text-center leading-loose">
            Select a system configuration to load historical performance data
          </p>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-void z-[1001]">
        <div className="h-full bg-terminal-green shadow-[0_0_10px_rgba(0,255,148,0.8)] transition-all duration-1000" style={{ width: '10%' }}></div>
      </div>
    </div>
  );
}
