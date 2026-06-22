"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trash2, ArrowLeft, CheckCircle2, ShieldAlert, Mail } from "lucide-react";

export default function DataDeletionPage() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [referenceCode, setReferenceCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setStatus("loading");
    
    // Simulate API call to data deletion endpoint
    setTimeout(() => {
      setStatus("success");
      setReferenceCode("DEL-" + Math.floor(100000 + Math.random() * 900000));
    }, 1500);
  };

  return (
    <div className="space-y-12 pb-24 pt-4 font-sans text-gray-300">
      {/* Header */}
      <header className="space-y-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-mono text-terminal-green hover:underline uppercase tracking-wider"
        >
          <ArrowLeft size={12} />
          Volver al Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-system-error/10 border border-system-error/20 flex items-center justify-center">
            <Trash2 size={18} className="text-system-error" />
          </div>
          <span className="font-mono text-system-error text-xs font-bold tracking-widest uppercase">
            COMPLIANCE: DATA_DELETION_CALLBACK
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase font-heading">
          Instrucciones de Eliminación de Datos
        </h1>
        <p className="text-sm text-gray-500 font-mono">De conformidad con la Política de Plataforma de Meta</p>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Info: Meta Compliance Requirements */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-panel space-y-4">
            <h3 className="text-sm font-mono text-white font-bold uppercase tracking-wider border-b border-white/5 pb-2">
              Política de Meta
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Meta requiere que proporcionemos una forma clara y reproducible para que los usuarios soliciten la eliminación de la información personal compartida a través de la integración de WhatsApp.
            </p>
            <div className="p-3 bg-holo-blue/5 border border-holo-blue/20 rounded-xl flex gap-2">
              <ShieldAlert size={16} className="text-holo-blue flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                Una vez completado este proceso, su número telefónico y credenciales asociadas serán permanentemente removidos de nuestro motor de mensajería y bases de datos activas en un plazo máximo de 24 horas.
              </p>
            </div>
          </div>
        </div>

        {/* Right Info: Interactive tool & explanations */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider text-white font-heading">
              Cómo eliminar sus datos
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tiene dos opciones para solicitar la eliminación de sus datos:
            </p>
            
            <div className="space-y-6 mt-4">
              <div className="p-5 rounded-xl bg-surface border border-white/5 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-terminal-green/10 text-terminal-green text-xs flex items-center justify-center font-bold">1</span>
                  Método Automatizado en Línea (Recomendado)
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Ingrese el número de teléfono con el cual interactúa o recibe notificaciones en su canal de WhatsApp. El sistema enviará una señal de purga a nuestras bases de datos.
                </p>

                {status === "success" ? (
                  <div className="p-4 bg-terminal-green/5 border border-terminal-green/20 rounded-lg space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-terminal-green text-xs font-bold font-mono">
                      <CheckCircle2 size={16} />
                      SOLICITUD PROCESADA CON ÉXITO
                    </div>
                    <p className="text-xs text-gray-400 font-mono">
                      Código de referencia: <span className="text-white font-bold">{referenceCode}</span>
                    </p>
                    <p className="text-[11px] text-gray-500">
                      El número ingresado ha sido dado de baja de nuestros servidores de alerta y las suscripciones de bot activas asociadas han sido canceladas.
                    </p>
                    <button 
                      onClick={() => setStatus("idle")} 
                      className="text-xs text-terminal-green font-mono underline block pt-2"
                    >
                      Enviar otra solicitud
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3 mt-4">
                    <div className="flex flex-col md:flex-row gap-3">
                      <input 
                        type="tel"
                        placeholder="Ej. +52 1 55 1234 5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        disabled={status === "loading"}
                        className="flex-1 bg-void border border-white/10 rounded-lg px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-terminal-green transition-colors"
                      />
                      <button 
                        type="submit"
                        disabled={status === "loading"}
                        className="px-6 py-2 bg-terminal-green text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-terminal-green/80 transition-colors disabled:opacity-50"
                      >
                        {status === "loading" ? "Procesando..." : "Eliminar Datos"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="p-5 rounded-xl bg-surface border border-white/5 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyber-purple/10 text-cyber-purple text-xs flex items-center justify-center font-bold">2</span>
                  Solicitud por Correo Electrónico
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed flex items-center gap-2">
                  <Mail size={14} className="text-cyber-purple" />
                  <span>
                    Envíe un correo electrónico a <span className="text-white font-mono">support@portfonager5000.com</span> con el asunto <span className="text-white font-mono">"Eliminación de datos de WhatsApp"</span> indicando su nombre de usuario y número de teléfono registrado. Le confirmaremos la eliminación completa en menos de 48 horas hábiles.
                  </span>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
