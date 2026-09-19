import React, { useState, useEffect } from 'react';
import { Laptop, Smartphone, Tablet, Globe, Shield, Trash2, LogOut, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ActiveSessionsModal({ isOpen, onClose }) {
  const { getActiveSessions, revokeSession, logoutAllDevices } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSessions = async () => {
    setLoading(true);
    setError('');
    const res = await getActiveSessions();
    if (res.success) {
      setSessions(res.sessions || []);
    } else {
      setError(res.error || 'Failed to load active sessions.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen]);

  const handleRevoke = async (sessionId) => {
    const res = await revokeSession(sessionId);
    if (res.success) {
      setSuccessMsg('Device session revoked successfully.');
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setError(res.error || 'Failed to revoke session.');
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Are you sure you want to log out from all active devices? You will be required to sign in again.')) return;
    await logoutAllDevices();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Active Device Sessions</h3>
              <p className="text-xs text-slate-400">Manage and revoke active login sessions across your devices.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback banners */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-lg">
            {successMsg}
          </div>
        )}

        {/* Sessions list */}
        <div className="max-h-80 overflow-y-auto space-y-3 mb-6 pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              <span>Fetching active device sessions...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No active sessions found.</div>
          ) : (
            sessions.map((s) => {
              const isMobile = s.device === 'Mobile';
              const isTablet = s.device === 'Tablet';
              const DeviceIcon = isMobile ? Smartphone : isTablet ? Tablet : Laptop;

              return (
                <div
                  key={s.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                    s.isCurrent
                      ? 'bg-blue-950/30 border-blue-800/80'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className={`p-2.5 rounded-lg border ${
                      s.isCurrent ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      <DeviceIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-white truncate">
                          {s.browser} on {s.operatingSystem}
                        </span>
                        {s.isCurrent && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded">
                            Current Device
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span className="font-mono">{s.ipAddress}</span>
                        <span>•</span>
                        <span>Last active: {new Date(s.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {!s.isCurrent && (
                    <button
                      onClick={() => handleRevoke(s.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                      title="Revoke session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            onClick={handleLogoutAll}
            className="px-3.5 py-2 text-xs font-semibold bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 rounded-xl transition-colors flex items-center"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            <span>Logout All Devices</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
