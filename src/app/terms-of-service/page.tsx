import React from "react";
import Link from "next/link";
import { Scale, ArrowLeft, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

export default function TermsOfServicePage() {
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
          <div className="w-8 h-8 rounded-lg bg-cyber-purple/10 border border-cyber-purple/20 flex items-center justify-center">
            <Scale size={18} className="text-cyber-purple" />
          </div>
          <span className="font-mono text-cyber-purple text-xs font-bold tracking-widest uppercase">
            DOCUMENT: TERMS_CONDITIONS_V1.0
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase font-heading">
          Condiciones del Servicio
        </h1>
        <p className="text-sm text-gray-500 font-mono">Última actualización: 22 de junio de 2026</p>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Fast Overview */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-panel space-y-4">
            <h3 className="text-sm font-mono text-white font-bold uppercase tracking-wider border-b border-white/5 pb-2">
              Descargo de Responsabilidad
            </h3>
            <div className="p-3 bg-system-error/5 border border-system-error/20 rounded-xl flex gap-2">
              <AlertTriangle size={16} className="text-system-error flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                ADVERTENCIA: EL TRADING CONLLEVA RIESGO. ESTE SOFTWARE NO OFRECE ASESORÍA FINANCIERA. EL USO DE AUTOMATIZACIONES Y BOTS ES BAJO SU PROPIA RESPONSABILIDAD.
              </p>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Al habilitar nuestras automatizaciones de portafolio y conectar APIs de mercados, usted acepta plenamente estos términos.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-panel">
            <h3 className="text-sm font-mono text-white font-bold uppercase tracking-wider mb-4">
              Secciones
            </h3>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <a href="#acceptance" className="hover:text-cyber-purple transition-colors flex items-center gap-2">
                  <span className="text-cyber-purple font-bold">01.</span> Aceptación de Términos
                </a>
              </li>
              <li>
                <a href="#trading-bots" className="hover:text-cyber-purple transition-colors flex items-center gap-2">
                  <span className="text-cyber-purple font-bold">02.</span> Automatización y Trading
                </a>
              </li>
              <li>
                <a href="#scraping-data" className="hover:text-cyber-purple transition-colors flex items-center gap-2">
                  <span className="text-cyber-purple font-bold">03.</span> Scraping e Información
                </a>
              </li>
              <li>
                <a href="#whatsapp-rules" className="hover:text-cyber-purple transition-colors flex items-center gap-2">
                  <span className="text-cyber-purple font-bold">04.</span> Uso de Notificaciones WhatsApp
                </a>
              </li>
              <li>
                <a href="#liability" className="hover:text-cyber-purple transition-colors flex items-center gap-2">
                  <span className="text-cyber-purple font-bold">05.</span> Límite de Responsabilidad
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Detailed Text */}
        <div className="lg:col-span-2 space-y-12">
          {/* Section 1 */}
          <section id="acceptance" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-cyber-purple text-sm font-bold">01/</span>
              <h2 className="text-xl font-bold uppercase tracking-wider text-white font-heading">
                Aceptación del Acuerdo
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Bienvenido a Portfonager 5000. Al acceder a nuestra aplicación, configurar bots, extraer datos de mercados mediante nuestros scrapers o registrar su número de teléfono para recibir alertas a través de WhatsApp, usted acuerda estar sujeto a las presentes Condiciones de Servicio.
            </p>
          </section>

          {/* Section 2 */}
          <section id="trading-bots" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-cyber-purple text-sm font-bold">02/</span>
              <h2 className="text-xl font-bold uppercase tracking-wider text-white font-heading">
                Automatización y Bots de Trading
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Nuestra plataforma provee herramientas de automatización de portafolios y trading quant. 
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-400 space-y-2">
              <li>El usuario configura y activa autónomamente las reglas e instrucciones de compra, venta o rebalanceo.</li>
              <li>El usuario provee sus propias credenciales de API de exchanges de terceros bajo su exclusivo criterio.</li>
              <li>No somos responsables por pérdidas financieras ocasionadas por latencia de red, fallos del exchange, errores en las fórmulas de los bots o configuraciones erróneas del usuario.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="scraping-data" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-cyber-purple text-sm font-bold">03/</span>
              <h2 className="text-xl font-bold uppercase tracking-wider text-white font-heading">
                Servicios de Scraping y Datos de Mercado
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              La plataforma recopila información mediante web scraping y APIs públicas. Estos datos se entregan "tal cual" y con fines exclusivamente informativos u operativos del portafolio. No garantizamos la absoluta exactitud o disponibilidad ininterrumpida de los datos históricos o de mercado en tiempo real debido a posibles cambios en los portales fuente de terceros.
            </p>
          </section>

          {/* Section 4 */}
          <section id="whatsapp-rules" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-cyber-purple text-sm font-bold">04/</span>
              <h2 className="text-xl font-bold uppercase tracking-wider text-white font-heading">
                Uso Responsable del Canal de WhatsApp
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              El servicio de envío de notificaciones y alertas operativas a través de la API de WhatsApp está condicionado a las siguientes reglas:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-400 space-y-2">
              <li>Usted debe ser el propietario legítimo del número de teléfono registrado.</li>
              <li>Los mensajes se envían de forma reactiva ante configuraciones y disparadores establecidos por usted mismo dentro de la plataforma (ej. alertas de precios, ejecuciones de órdenes o reportes periódicos de portafolio).</li>
              <li>El usuario se compromete a no utilizar las integraciones para propósitos maliciosos, de spam, o violando las directrices de comercio y políticas de WhatsApp/Meta.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="liability" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-cyber-purple text-sm font-bold">05/</span>
              <h2 className="text-xl font-bold uppercase tracking-wider text-white font-heading">
                Limitación de Responsabilidad y Ley Aplicable
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              En ningún caso Portfonager 5000, sus desarrolladores o afiliados serán responsables por daños indirectos, incidentales o pérdidas financieras resultantes de las transacciones realizadas por las automatizaciones o la imposibilidad de recibir alertas de WhatsApp en tiempo de mercado crítico.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
