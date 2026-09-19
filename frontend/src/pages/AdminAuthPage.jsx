import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import WorkForgeLogo from '../components/common/WorkForgeLogo';

export default function AdminAuthPage({ onAdminLoginSuccess }) {
  const { loginSuperAdmin, loading, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [localError, setLocalError] = useState('');

  const handleHomeNavigate = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Super Admin credentials required.');
      return;
    }

    const res = await loginSuperAdmin(email, password, rememberSession);
    if (res.success) {
      if (onAdminLoginSuccess) onAdminLoginSuccess(res.defaultPath);
    } else {
      setLocalError(res.error || 'Access Denied: Only Super Admin accounts can authenticate through this portal.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center flex flex-col items-center">
        <WorkForgeLogo size="large" onClick={handleHomeNavigate} className="mb-4" />
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Platform Owner Governance</h2>
        <p className="mt-2 text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
          Restricted Portal • Super Admin Authentication Only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          
          {(localError || authError) && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center font-medium">
              <AlertCircle className="w-4 h-4 mr-2.5 text-red-400 flex-shrink-0" />
              <span>{localError || authError}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Super Admin Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="kavychoudhary49@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-amber-600 focus:ring-amber-500"
                />
                <span>Remember session (30 Days)</span>
              </label>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-[11px] text-amber-300/90 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2.5 text-amber-400 flex-shrink-0" />
              <span>This portal is strictly restricted to platform owners. Normal user accounts cannot authenticate through this route.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 transition-colors focus:outline-none text-sm disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying Governance Credentials...</span>
              ) : (
                <>
                  <span>Authenticate Super Admin</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          WorkForge Platform Security Protocol • ISO/IEC 27001 Certified Governance
        </div>
      </div>
    </div>
  );
}
