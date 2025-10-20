/**
 * StatusBar Component
 * Top status bar for mobile devices (WiFi, signal, battery)
 */

import { Wifi, Signal, Battery } from 'lucide-react';

export default function StatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: false 
  });

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-8 flex items-center justify-between px-4 text-xs text-gray-800 z-50 safe-area-top"
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <span className="font-medium">{time}</span>
      <div className="flex items-center gap-2">
        <Signal className="w-4 h-4" />
        <Wifi className="w-4 h-4" />
        <Battery className="w-5 h-4" />
      </div>
    </div>
  );
}

