"use client";

import React, { useState } from 'react';
import { X, Lock, User, Terminal, Loader2 } from 'lucide-react';
import { apiProftviewClient } from '@/app/api/client';
import { useAuth } from '@/app/api/auth-context';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { token } = await apiProftviewClient.login({ 
        username: username.toLowerCase(), 
        password 
      });
      login(token);
      onClose();
    } catch (err: unknown) {
      console.error("Login error:", err);
      setError("Credenciales inválidas o error de conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={() => !isLoading && onClose()}
      ></div>
      
      <div className="cyber-card w-full max-w-md p-8 rounded-2xl border-t-4 border-t-terminal-green relative z-10 animate-in zoom-in-95 duration-200 shadow-[0_0_100px_rgba(0,255,148,0.1)]">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Terminal size={14} className="text-terminal-green" />
              <span className="text-[10px] text-terminal-green font-mono uppercase tracking-[0.3em]">Secure Access</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">SYSTEM LOGIN</h2>
          </div>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-terminal-green/50" />
              <input 
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="operator name"
                className="w-full bg-void border border-white/10 text-white pl-12 pr-4 py-4 rounded-xl outline-none focus:border-terminal-green transition-colors font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Access Token / Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-terminal-green/50" />
              <input 
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-void border border-white/10 text-white pl-12 pr-4 py-4 rounded-xl outline-none focus:border-terminal-green transition-colors font-mono text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg text-red-500 text-[10px] font-mono uppercase tracking-widest text-center animate-shake">
              {error}
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-terminal-green text-black font-black text-xs uppercase tracking-widest hover:bg-bright-green transition-colors rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 shadow-[0_4px_30px_rgba(0,255,148,0.2)] group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Lock size={16} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                  Authorize Access
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
          <p className="text-[9px] font-mono text-gray-600 uppercase tracking-[0.2em] text-center max-w-[240px]">
            Restricted area. Unauthorized access will be logged and reported to system administrators.
          </p>
        </div>
      </div>
    </div>
  );
}
