"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  FlaskConical, 
  Gem, 
  Settings, 
  LogOut,
  LayoutDashboard,
  Cpu
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Bots", icon: Bot, href: "/bots" },
  { name: "Backtests Lab", icon: FlaskConical, href: "/backtests" },
  { name: "Gems Finder", icon: Gem, href: "/gems" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="fixed left-6 top-6 bottom-6 glass-panel rounded-3xl z-50 flex flex-col items-center py-8 overflow-hidden"
      initial={{ width: 80 }}
      animate={{ width: isHovered ? 260 : 80 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Brand Icon */}
      <div className="mb-12 flex items-center justify-center w-full px-6">
        <div className="w-12 h-12 rounded-2xl bg-terminal-green/10 border border-terminal-green/20 flex items-center justify-center flex-shrink-0 neon-glow">
          <Cpu size={24} className="text-terminal-green" />
        </div>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-4 flex flex-col"
            >
              <span className="font-bold text-xl tracking-wider text-white">PORTFONAGER</span>
              <span className="text-[10px] font-mono text-terminal-green tracking-[0.3em]">SYSTEM 5000</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 w-full px-4 space-y-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="block group">
              <div className={`
                relative flex items-center h-12 rounded-2xl transition-all duration-300
                ${isActive ? 'bg-terminal-green/5 text-terminal-green' : 'text-gray-500 hover:text-white'}
              `}>
                <div className={`w-12 h-12 flex items-center justify-center flex-shrink-0 z-10 ${isActive ? 'neon-text' : ''}`}>
                  <item.icon size={22} strokeWidth={1.5} />
                </div>
                
                <AnimatePresence mode="wait">
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="ml-2 font-bold text-sm uppercase tracking-widest whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 border border-terminal-green/20 rounded-2xl z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="w-full px-4 space-y-3 pt-6 border-t border-white/5">
        <div className="flex items-center h-12 rounded-2xl text-gray-500 hover:text-white transition-all cursor-pointer">
          <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
            <Settings size={20} strokeWidth={1.5} />
          </div>
          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-2 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center h-12 rounded-2xl text-red-500/60 hover:text-red-500 transition-all cursor-pointer">
          <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
            <LogOut size={20} strokeWidth={1.5} />
          </div>
          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-2 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap"
              >
                Shutdown
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
