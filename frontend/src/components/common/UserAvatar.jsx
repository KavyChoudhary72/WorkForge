import React, { useState } from 'react';
import { Camera } from 'lucide-react';

// Generates first 1 or 2 letters of name
export function getInitials(name = '') {
  if (!name) return 'W';
  const clean = name.trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

// Generates consistent initial letter badge for Users
export function UserAvatar({ name = 'User', src = '', size = 'md', className = '', onClick }) {
  const [imgError, setImgError] = useState(false);

  const initials = getInitials(name);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base font-extrabold'
  }[size] || 'w-9 h-9 text-xs';

  const isClickable = typeof onClick === 'function';

  return (
    <div
      onClick={onClick}
      className={`relative group ${isClickable ? 'cursor-pointer' : ''}`}
      title={isClickable ? `Click to crop & set custom photo for ${name}` : name}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className={`${sizeClasses} rounded-full object-cover ring-2 ring-blue-500/20 ${className}`}
        />
      ) : (
        <div
          className={`${sizeClasses} rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-slate-900 text-white font-extrabold flex items-center justify-center shadow-md flex-shrink-0 tracking-wider ${className}`}
        >
          {initials}
        </div>
      )}

      {isClickable && (
        <div className="absolute inset-0 rounded-full bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
          <Camera className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}

// Generates first 1 or 2 letter logo badge for Organizations
export function OrgLogo({ name = 'Organization', src = '', size = 'md', className = '', onClick }) {
  const [imgError, setImgError] = useState(false);

  const initials = getInitials(name);
  const effectiveSrc = src || (name?.toLowerCase().includes('workforge') || name?.toLowerCase().includes('workspace') ? '/logo.png' : '');

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px] font-bold',
    md: 'w-8 h-8 text-xs font-extrabold',
    lg: 'w-12 h-12 text-sm font-black'
  }[size] || 'w-8 h-8 text-xs font-extrabold';

  const isClickable = typeof onClick === 'function';

  return (
    <div
      onClick={onClick}
      className={`relative group ${isClickable ? 'cursor-pointer' : ''}`}
      title={isClickable ? `Click to crop & set custom logo for ${name}` : name}
    >
      {effectiveSrc && !imgError ? (
        <img
          src={effectiveSrc}
          alt={name}
          onError={() => setImgError(true)}
          className={`${sizeClasses} rounded-xl object-cover ring-1 ring-slate-300 dark:ring-slate-700 shadow-sm ${className}`}
        />
      ) : (
        <div
          className={`${sizeClasses} rounded-xl bg-gradient-to-br from-orange-600 via-amber-600 to-slate-900 text-white font-black flex items-center justify-center shadow-md flex-shrink-0 tracking-wider ${className}`}
        >
          {initials}
        </div>
      )}

      {isClickable && (
        <div className="absolute inset-0 rounded-xl bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
          <Camera className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}
