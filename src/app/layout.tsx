import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { AuthProvider } from "@/app/api/auth-context";

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
          <main className="ml-24 transition-all duration-300 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
