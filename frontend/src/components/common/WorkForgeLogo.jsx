import React from 'react';
import { Flame, Hammer, Zap, Layers } from 'lucide-react';

export default function WorkForgeLogo({ onClick, size = 'medium', className = '' }) {
  const iconSizes = {
    small: 'w-5 h-5',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xlarge: 'w-10 h-10'
  };

  const textSizes = {
    small: 'text-base',
    medium: 'text-xl',
    large: 'text-2xl',
    xlarge: 'text-3xl'
  };

  const handleLogoClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div
      onClick={handleLogoClick}
      className={`inline-flex items-center space-x-2.5 cursor-pointer group select-none ${className}`}
      title="WorkForge - Go to Homepage"
    >
      {/* Dynamic Forge Badge with Zoho-inspired Coral Red + Royal Blue & Mint Accents */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white font-bold shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform ${
        size === 'small' ? 'w-8 h-8 p-1.5' : size === 'large' ? 'w-11 h-11 p-2' : size === 'xlarge' ? 'w-14 h-14 p-2.5' : 'w-10 h-10 p-2'
      }`}>
        <div className="relative flex items-center justify-center w-full h-full">
          <Hammer className={`${iconSizes[size] || 'w-6 h-6'} text-white stroke-[2.5]`} />
          <Flame className="w-3 h-3 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className={`font-black tracking-tight ${textSizes[size] || 'text-xl'} flex items-center`}>
          <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Work
          </span>
          <span className="text-red-600 dark:text-rose-500">Forge</span>
        </div>
        {size !== 'small' && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 -mt-1">
            Enterprise OS
          </span>
        )}
      </div>
    </div>
  );
}
