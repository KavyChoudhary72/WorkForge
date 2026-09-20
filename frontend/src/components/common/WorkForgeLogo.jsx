import React, { useState } from 'react';

export default function WorkForgeLogo({ 
  onClick, 
  size = 'medium', 
  className = '',
  showText = true,
  onlyImage = false
}) {
  const [imgError, setImgError] = useState(false);

  const emblemSizes = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-14 h-14',
    xlarge: 'w-20 h-20'
  };

  const textSizes = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-3xl',
    xlarge: 'text-4xl'
  };

  const handleLogoClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  if (onlyImage) {
    return (
      <img
        src="/logo.png"
        alt="WorkForge Logo"
        onClick={handleLogoClick}
        className={`${emblemSizes[size] || 'w-10 h-10'} rounded-full object-cover shadow-md shadow-orange-500/25 cursor-pointer hover:scale-105 transition-transform ${className}`}
      />
    );
  }

  return (
    <div
      onClick={handleLogoClick}
      className={`inline-flex items-center space-x-3 cursor-pointer group select-none ${className}`}
      title="WorkForge - Enterprise Multi-Tenant Platform"
    >
      {/* Official WorkForge Circular Badge */}
      <div className={`relative flex-shrink-0 ${emblemSizes[size] || 'w-10 h-10'} rounded-full overflow-hidden shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200 ring-2 ring-orange-500/20`}>
        {!imgError ? (
          <img
            src="/logo.png"
            alt="WorkForge"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-black flex items-center justify-center text-xs">
            WF
          </div>
        )}
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className={`font-black tracking-tight ${textSizes[size] || 'text-2xl'} leading-none flex items-center`}>
            <span className="text-slate-900 dark:text-white font-extrabold">
              Work
            </span>
            <span className="text-orange-500 dark:text-orange-400 font-extrabold">
              Forge
            </span>
          </div>
          {size !== 'small' && (
            <span className="text-[9.5px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">
              Enterprise Workspace
            </span>
          )}
        </div>
      )}
    </div>
  );
}
