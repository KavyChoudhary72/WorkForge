import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  Sliders,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  X,
  Lock,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function IntegrationsPage() {
  const { currentOrg, apiFetch } = useAuth();
  const { addNotification } = useData();

  const [activeModal, setActiveModal] = useState(null);
  const [configData, setConfigData] = useState({
    razorpayKeyId: 'rzp_live_9A8B7C6D5E4F3',
    razorpaySecret: '••••••••••••••••••••',
    whatsappPhoneId: '+91 98765 43210',
    slackWebhook: 'https://hooks.slack.com/services/T00/B00/XXXX',
    googleAccount: 'operations@workforge.in',
    zoomAccount: 'meetings@workforge.in'
  });

  const [integrations, setIntegrations] = useState([
    {
      id: 'razorpay',
      name: 'Razorpay Payment Gateway',
      category: 'Payment & Subscriptions',
      description: 'Accept instant online invoice payments via UPI, Credit/Debit Cards, NetBanking, and Razorpay Subscriptions (INR ₹).',
      status: 'Connected',
      iconBg: 'bg-blue-600',
      badge: 'Indian Payment Standard',
      isPopular: true
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API',
      category: 'Client Communications',
      description: 'Send automated invoice payment reminders, project status updates, and task alerts directly to clients via WhatsApp.',
      status: 'Connected',
      iconBg: 'bg-emerald-600',
      badge: 'Client Outreach',
      isPopular: true
    },
    {
      id: 'slack',
      name: 'Slack Team Workspace',
      category: 'Internal Operations',
      description: 'Stream task updates, time logs, and AI Health audit alerts into your company Slack channels.',
      status: 'Connected',
      iconBg: 'bg-purple-600',
      badge: 'Real-Time Sync'
    },
    {
      id: 'gcal',
      name: 'Google Calendar',
      category: 'Schedule & Meetings',
      description: 'Sync project milestones, client review deadlines, and team meetings directly to Google Calendar.',
      status: 'Connected',
      iconBg: 'bg-amber-600',
      badge: 'Calendar Sync'
    },
    {
      id: 'gmail',
      name: 'Gmail & Google Workspace',
      category: 'Email Notifications',
      description: 'Send automated PDF invoices, client welcome emails, and meeting summaries via your corporate Gmail domain.',
      status: 'Connected',
      iconBg: 'bg-red-600',
      badge: 'Email Outbound'
    },
    {
      id: 'zoom',
      name: 'Zoom Video Communications',
      category: 'Video Meetings',
      description: 'Schedule client review calls and import raw meeting transcripts directly into WorkForge AI Summarizer.',
      status: 'Disconnected',
      iconBg: 'bg-sky-600',
      badge: 'AI Transcript Sync'
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook & Teams',
      category: 'Enterprise Calendar',
      description: 'Integrate Microsoft 365 enterprise calendar, mail, and Teams notifications across your organization.',
      status: 'Disconnected',
      iconBg: 'bg-indigo-600',
      badge: 'Enterprise M365'
    }
  ]);

  // Sync data with MongoDB on load
  const loadIntegrations = async () => {
    if (!apiFetch) return;
    try {
      const { res, data } = await apiFetch('/integrations');
      if (res.ok && data) {
        setIntegrations(prev => prev.map(item => {
          const dbItem = data[item.id];
          return {
            ...item,
            status: dbItem?.status || item.status
          };
        }));
        
        // Map configs
        const configs = {};
        Object.keys(data).forEach(id => {
          if (data[id]?.config) {
            Object.assign(configs, data[id].config);
          }
        });
        setConfigData(prev => ({ ...prev, ...configs }));
      }
    } catch (e) {
      console.warn('Failed to load active integrations from MongoDB, falling back.', e);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, [apiFetch]);

  const toggleIntegrationStatus = async (id) => {
    if (!apiFetch) {
      // Offline fallback
      setIntegrations(prev => prev.map(item => {
        if (item.id === id) {
          const nextStatus = item.status === 'Connected' ? 'Disconnected' : 'Connected';
          addNotification(
            `${item.name} ${nextStatus}`,
            `Integration ${item.name} is now ${nextStatus.toLowerCase()}.`,
            nextStatus === 'Connected' ? 'success' : 'info'
          );
          return { ...item, status: nextStatus };
        }
        return item;
      }));
      return;
    }

    try {
      const { res, data } = await apiFetch(`/integrations/${id}/toggle`, {
        method: 'POST'
      });
      if (res.ok) {
        setIntegrations(prev => prev.map(item => {
          if (item.id === id) {
            addNotification(
              `${item.name} ${data.status}`,
              `Integration ${item.name} is now ${data.status.toLowerCase()} in cloud database.`,
              data.status === 'Connected' ? 'success' : 'info'
            );
            return { ...item, status: data.status };
          }
          return item;
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!apiFetch || !activeModal) return;

    let configPayload = {};
    if (activeModal === 'razorpay') {
      configPayload = {
        razorpayKeyId: configData.razorpayKeyId,
        razorpaySecret: configData.razorpaySecret
      };
    } else if (activeModal === 'whatsapp') {
      configPayload = {
        whatsappPhoneId: configData.whatsappPhoneId
      };
    } else {
      configPayload = {
        googleAccount: configData.googleAccount
      };
    }

    try {
      const { res } = await apiFetch(`/integrations/${activeModal}/config`, {
        method: 'PUT',
        body: JSON.stringify({ config: configPayload })
      });
      if (res.ok) {
        addNotification('Settings Saved', 'Integration parameters saved to MongoDB.', 'success');
        setActiveModal(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl border border-indigo-700/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>WorkForge Enterprise Integrations Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Integrations & API Gateways
          </h1>
          <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
            Connect Razorpay, WhatsApp Business, Slack, Zoom, and Google Workspace to automate client billing, messaging, and schedule synchronization.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-950/80 border border-indigo-500/50 px-4 py-2 rounded-full text-xs font-bold text-indigo-100 shadow-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{integrations.filter(i => i.status === 'Connected').length} Active Integrations</span>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => {
          const isConnected = item.status === 'Connected';

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {item.isPopular && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-bl-lg uppercase tracking-wider shadow-xs">
                  Popular in India
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-11 h-11 rounded-xl ${item.iconBg} text-white flex items-center justify-center font-black text-lg shadow-md flex-shrink-0`}>
                    {item.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{item.name}</h3>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">{item.category}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {item.description}
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold">
                    {item.badge}
                  </span>
                  {isConnected ? (
                    <span className="flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Connected</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-xs font-semibold text-slate-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Not Configured</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center space-x-2">
                <button
                  onClick={() => toggleIntegrationStatus(item.id)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all shadow-xs ${
                    isConnected
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                  }`}
                >
                  {isConnected ? 'Disconnect' : 'Connect Integration'}
                </button>
                <button
                  onClick={() => setActiveModal(item.id)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
                  title="Configure Parameters"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-extrabold capitalize">{activeModal} Integration Gateway</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              {activeModal === 'razorpay' && (
                <>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-900 dark:text-blue-200 text-xs font-semibold leading-relaxed">
                    Razorpay enables automated subscription renewals, GST Tax Invoice payments, and instant UPI / NetBanking settlement in INR (₹).
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Razorpay Key ID</label>
                    <input
                      type="text"
                      required
                      value={configData.razorpayKeyId}
                      onChange={(e) => setConfigData({ ...configData, razorpayKeyId: e.target.value })}
                      className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Razorpay Key Secret</label>
                    <input
                      type="password"
                      required
                      value={configData.razorpaySecret}
                      onChange={(e) => setConfigData({ ...configData, razorpaySecret: e.target.value })}
                      className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </>
              )}

              {activeModal === 'whatsapp' && (
                <>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs font-semibold leading-relaxed">
                    WhatsApp Business Cloud API sends automatic payment links, invoice PDF files, and task due reminders directly to client mobile numbers.
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Registered Business Phone Number (+91)</label>
                    <input
                      type="text"
                      required
                      value={configData.whatsappPhoneId}
                      onChange={(e) => setConfigData({ ...configData, whatsappPhoneId: e.target.value })}
                      className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </>
              )}

              {activeModal !== 'razorpay' && activeModal !== 'whatsapp' && (
                <div>
                  <label className="block font-bold mb-1">Connection Endpoint / Service Email</label>
                  <input
                    type="text"
                    required
                    value={configData.googleAccount}
                    onChange={(e) => setConfigData({ ...configData, googleAccount: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-600/20"
                >
                  Save Integration Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
