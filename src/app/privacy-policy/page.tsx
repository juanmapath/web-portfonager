import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Key, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
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
          <div className="w-8 h-8 rounded-lg bg-terminal-green/10 border border-terminal-green/20 flex items-center justify-center">
            <Shield size={18} className="text-terminal-green" />
          </div>
          <span className="font-mono text-terminal-green text-xs font-bold tracking-widest uppercase">
            DOCUMENT: SECURE_DATA_POLICY_V1.2
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase font-heading">
          Política de Privacidad
        </h1>
        <p className="text-sm text-gray-500 font-mono">Última actualización: 22 de junio de 2026</p>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Summary & Quick Links */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-panel space-y-4">
            <h3 className="text-sm font-mono text-white font-bold uppercase tracking-wider border-b border-white/5 pb-2">
              Resumen para Meta Reviewers
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Esta política cumple con los requisitos del Developer Agreement de Meta para la integración de la API de WhatsApp Business. 
            </p>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-gray-500">PROPIETARIO:</span>
                <span className="text-terminal-green">Portfonager 5000</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-gray-500">PROPÓSITO:</span>
                <span className="text-holo-blue">Alertas y Automatización</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-gray-500">DATOS DE WHATSAPP:</span>
                <span className="text-white">Número de Teléfono</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">ENCRIPTACIÓN:</span>
                <span className="text-terminal-green">AES-256-GCM</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-panel">
            <h3 className="text-sm font-mono text-white font-bold uppercase tracking-wider mb-4">
              Secciones
            </h3>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <a href="#data-collected" className="hover:text-terminal-green transition-colors flex items-center gap-2">
                  <span className="text-terminal-green font-bold">01.</span> Datos Recolectados
                </a>
              </li>
              <li>
                <a href="#data-usage" className="hover:text-terminal-green transition-colors flex items-center gap-2">
                  <span className="text-terminal-green font-bold">02.</span> Uso de la Información
                </a>
              </li>
              <li>
                <a href="#whatsapp-integration" className="hover:text-terminal-green transition-colors flex items-center gap-2">
                  <span className="text-terminal-green font-bold">03.</span> Integración con WhatsApp
                </a>
              </li>
              <li>
                <a href="#market-scraping" className="hover:text-terminal-green transition-colors flex items-center gap-2">
                  <span className="text-terminal-green font-bold">04.</span> Scraping y APIs de Terceros
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-terminal-green transition-colors flex items-center gap-2">
                  <span className="text-terminal-green font-bold">05.</span> Seguridad y Almacenamiento
                </a>
              </li>
              <li>
                <a href="#deletion" className="hover:text-terminal-green transition-colors flex items-center gap-2">
                  <span className="text-terminal-green font-bold">06.</span> Sus Derechos y Eliminación
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Detailed Sections */}
        <div className="lg:col-span-2 space-y-12">
          {/* Section 1 */}
          <section id="data-collected" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-terminal-green text-sm font-bold">01/</span>
              <h2 className="text-xl font-bold uppercase tracking-wider text-white font-heading">
                Datos que Recolectamos
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Para proporcionar servicios de gestión y optimización de portafolios, recopilamos información de los usuarios únicamente cuando es estrictamente necesaria para el funcionamiento de nuestras automatizaciones:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase font-mono">
                  <Key size={14} className="text-terminal-green" />
                  Credenciales de API (Exchanges)
                </div>
                <p className="text-xs text-gray-500">
                  Claves de lectura y ejecución para automatizar portafolios de trading. Estas se encriptan a nivel de base de datos y nunca se exponen públicamente.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase font-mono">
                  <Eye size={14} className="text-holo-blue" />
                  Datos de Contacto e Identidad
                </div>
                <p className="text-xs text-gray-500">
                  Nombre, correo electrónico y número de teléfono (para envío de notificaciones y alertas en tiempo real vía WhatsApp).
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="data-usage" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-terminal-green text-sm font-bold">02/</span>
              <h2 className="text-xl font-bold uppercase tracking-wider text-white font-heading">
                Uso de la Información
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Los datos recolectados se utilizan exclusivamente para:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
              <li>Monitorear y actualizar el estado de los bots de trading configurados.</li>
              <li>Calcular rendimientos de portafolios y ejecutar rebalanceos automáticos autorizados.</li>
              <li>Enviar notificaciones operativas inmediatas relativas a las órdenes de trading ejecutadas.</li>
              <li>Realizar scraping y recolección de datos públicos de mercado para nutrir las estrategias del usuario.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="whatsapp-integration" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-terminal-green text-sm font-bold">03/</span>
              <h2 className="text-xl font-bold uppercase tracking-wider text-white font-heading">
                Uso de WhatsApp Business API
              </h2>
            </div>
            <div className="p-4 rounded-xl bg-terminal-green/5 border border-terminal-green/10 space-y-3">
              <p className="text-xs text-gray-300 leading-relaxed font-mono">
                [COMPLIANCE CHECK: META DEVELOPER PLATFORM]
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Nuestra integración con WhatsApp Business API sirve para enviar notificaciones operativas críticas (alertas de compras, ventas, cambios bruscos de portafolio o fallos de ejecución en bots). 
              </p>
              <p className="text-xs text-gray-400 leading-relaxed font-bold">
                No utilizamos el canal de WhatsApp para enviar publicidad, spam ni promociones no solicitadas. Todo mensaje es detonado por una acción explícita o regla preestablecida por el usuario dentro de sus automatizaciones en Portfonager 5000.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="market-scraping" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-terminal-green text-sm font-bold">04/</span>
              <h2 className="text-xl font-bold uppercase tracking-wider text-white font-heading">
                Scraping y Datos Públicos de Mercado
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Nuestra aplicación integra servicios de extracción de datos (web scraping) y monitoreo de APIs de mercados públicos. Estos procesos se realizan de conformidad con los términos de servicio de los sitios fuente, limitándose a datos públicos y no recopilando información personal identificable de terceros sin su consentimiento.
            </p>
          </section>

          {/* Section 5 */}
          <section id="security" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-terminal-green text-sm font-bold">05/</span>
              <h2 className="text-xl font-bold uppercase tracking-wider text-white font-heading">
                Seguridad y Almacenamiento
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 flex items-start gap-2">
              <Lock size={16} className="text-terminal-green mt-1 flex-shrink-0" />
              <span>
                Toda la información del usuario se almacena en servidores seguros con cifrado AES-256 en reposo y conexiones TLS 1.3 en tránsito. Las claves de API e información financiera sensible nunca se registran en texto plano.
              </span>
            </p>
          </section>

          {/* Section 6 */}
          <section id="deletion" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-terminal-green text-sm font-bold">06/</span>
              <h2 className="text-xl font-bold uppercase tracking-wider text-white font-heading">
                Derechos de los Usuarios y Eliminación de Datos
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Usted tiene derecho a acceder, rectificar, limitar o eliminar toda la información personal y credenciales almacenadas en nuestra base de datos.
            </p>
            <p className="text-sm leading-relaxed text-gray-400">
              Para eliminar de forma inmediata y automática sus datos asociados con WhatsApp y la aplicación, siga las instrucciones de nuestra sección dedicada a la:{" "}
              <Link href="/data-deletion" className="text-terminal-green hover:underline font-mono">
                Página de Eliminación de Datos de Usuario
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
