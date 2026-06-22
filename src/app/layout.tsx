import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { AuthProvider } from "@/app/api/auth-context";
import Link from "next/link";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfonager 5000 | Quant Portfolio Manager",
  description: "Advanced bot management and portfolio tracking for high-tech hacker quants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`
          ${inter.variable} 
          ${spaceGrotesk.variable} 
          ${jetbrainsMono.variable} 
          antialiased bg-void text-gray-200
        `}
      >
        <AuthProvider>
          <Sidebar />
          <main className="ml-24 transition-all duration-300 min-h-screen p-8 flex flex-col justify-between">
            <div className="max-w-7xl mx-auto w-full flex-grow">
              {children}
            </div>
            
            <footer className="mt-20 border-t border-white/5 pt-8 pb-4 max-w-7xl mx-auto w-full">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-gray-500">
                <div>
                  © 2026 DGEN SYSTEMS / PORTFONAGER 5000. ALL RIGHTS RESERVED.
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                  <Link href="/privacy-policy" className="hover:text-terminal-green transition-colors uppercase">Política de Privacidad</Link>
                  <Link href="/terms-of-service" className="hover:text-cyber-purple transition-colors uppercase">Condiciones del Servicio</Link>
                  <Link href="/data-deletion" className="hover:text-red-500 transition-colors uppercase">Eliminación de Datos</Link>
                </div>
              </div>
            </footer>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

