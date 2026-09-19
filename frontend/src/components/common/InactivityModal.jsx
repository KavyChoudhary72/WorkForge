import React from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';

export default function InactivityModal({ isOpen, onLoginAgain }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
        {/* Top Decorative Banner */}
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-5 text-amber-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Session Expired</h3>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Your session has expired due to inactivity. All authentication data has been cleared to safeguard your account workspace.
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 text-left text-xs text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Inactivity Threshold:</span>
            <span className="font-mono text-slate-200">30 Minutes</span>
          </div>
          <div className="flex justify-between">
            <span>Security Status:</span>
            <span className="font-mono text-emerald-400">Session Cleared</span>
          </div>
        </div>

        <button
          onClick={onLoginAgain}
          className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all text-sm group"
        >
          <LogIn className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
          <span>Login Again</span>
        </button>
      </div>
    </div>
  );
}
