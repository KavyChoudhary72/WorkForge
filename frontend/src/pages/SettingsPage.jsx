import React, { useState } from 'react';
import {
  Settings,
  Building,
  Shield,
  Bell,
  Globe,
  Save,
  CheckCircle,
  KeyRound,
  Laptop,
  HardDrive
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { OrgLogo } from '../components/common/UserAvatar';

export default function SettingsPage() {
  const { currentOrg, currentUser, apiFetch } = useAuth();
  const { addNotification } = useData();

  const [activeTab, setActiveTab] = useState('company');
  const [savedMessage, setSavedMessage] = useState('');

  // Company Settings Form
  const [companyForm, setCompanyForm] = useState({
    name: currentOrg?.name || 'Acme Global Innovations',
    industry: currentOrg?.industry || 'Enterprise Software',
    email: currentOrg?.email || 'contact@acmeglobal.com',
    phone: currentOrg?.phone || '+91 98765 43210',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST +5:30)',
    gstNumber: '27AAAAA0000A1Z5'
  });

  // Security Form
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification Preferences
  const [notifPrefs, setNotifPrefs] = useState({
    emailInvoices: true,
    taskAssignments: true,
    projectHealthAlerts: true,
    weeklyDigest: false,
    soundAlerts: true
  });

  const handleSaveCompany = (e) => {
    e.preventDefault();
    setSavedMessage('Organization settings updated successfully.');
    addNotification('Settings Saved', 'Company profile and regional preferences updated.', 'success');
    setTimeout(() => setSavedMessage(''), 4000);
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }
    try {
      const { res, data } = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword
        })
      });
      if (res.ok) {
        setSavedMessage('Security credentials and password updated successfully.');
        addNotification('Password Updated', 'Your account credentials have been modified.', 'success');
        setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(data.message || 'Failed to update password.');
      }
    } catch (err) {
      alert('Network error while changing password.');
    }
    setTimeout(() => setSavedMessage(''), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Tenant Workspace Configuration</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            System & Workspace Settings
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Configure tenant branding, regional tax standards, security protocols, and real-time notification alerts.
          </p>
        </div>
      </div>

      {savedMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center shadow-xs">
          <CheckCircle className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'company'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Organization Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security & Authentication</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'notifications'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification Alerts</span>
        </button>
      </div>

      {/* TAB 1: Organization Profile */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="glass-panel p-6 rounded-2xl space-y-6 max-w-3xl">
          <div className="flex items-center space-x-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <OrgLogo name={companyForm.name} src={currentOrg?.logo} size="lg" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{companyForm.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tenant ID: {currentOrg?.id || currentOrg?._id || 'tenant-primary'}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {currentOrg?.plan || 'Pro Plan'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Company Legal Name</label>
              <input
                type="text"
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Industry Vertical</label>
              <input
                type="text"
                value={companyForm.industry}
                onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Corporate Contact Email</label>
              <input
                type="email"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Phone Helpline</label>
              <input
                type="text"
                value={companyForm.phone}
                onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">System Currency</label>
              <select
                value={companyForm.currency}
                onChange={(e) => setCompanyForm({ ...companyForm, currency: e.target.value })}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
              >
                <option value="INR (₹)">Indian Rupee (₹ INR)</option>
                <option value="USD ($)">US Dollar ($ USD)</option>
                <option value="EUR (€)">Euro (€ EUR)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Primary GSTIN / Tax ID</label>
              <input
                type="text"
                value={companyForm.gstNumber}
                onChange={(e) => setCompanyForm({ ...companyForm, gstNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Organization Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Security */}
      {activeTab === 'security' && (
        <form onSubmit={handleSaveSecurity} className="glass-panel p-6 rounded-2xl space-y-6 max-w-2xl text-xs">
          <div className="space-y-1 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Security Credentials & Access</h3>
            <p className="text-slate-500 dark:text-slate-400">Manage master administrator password and device session authentication protocols.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={securityForm.currentPassword}
                onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="••••••••••••"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">New Secure Password</label>
              <input
                type="password"
                required
                value={securityForm.newPassword}
                onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="Minimum 8 characters with numbers & symbols"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={securityForm.confirmPassword}
                onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="Repeat new password"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-200">Active Session Security Safeguards</div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Sessions timeout automatically after 30 minutes of idle inactivity. All refresh tokens are hashed with SHA-256 in MongoDB and transmitted through strict HttpOnly cookies.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              <KeyRound className="w-4 h-4" />
              <span>Update Password Credentials</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Notification Alerts */}
      {activeTab === 'notifications' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6 max-w-2xl text-xs">
          <div className="space-y-1 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Push & Email Notification Routing</h3>
            <p className="text-slate-500 dark:text-slate-400">Control automated alerts generated across project milestones, task assignments, and billing collection.</p>
          </div>

          <div className="space-y-3">
            {[
              { key: 'emailInvoices', title: 'Invoice & Payment Receipts', desc: 'Receive instant notifications when invoices are marked Paid or Overdue.' },
              { key: 'taskAssignments', title: 'Task Delegation & Comments', desc: 'Real-time push alerts when tasks are assigned to you or commented on.' },
              { key: 'projectHealthAlerts', title: 'AI Project Health Anomalies', desc: 'Flag budget burn variances or schedule slippage exceeding 15% threshold.' },
              { key: 'weeklyDigest', title: 'Executive Weekly Rollup Digest', desc: 'Email summary every Monday morning with billable utilization metrics.' },
              { key: 'soundAlerts', title: 'Browser Sound Chimes', desc: 'Play audible ping on incoming real-time Socket.IO WebSocket broadcasts.' }
            ].map(pref => (
              <label key={pref.key} className="flex items-start justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                <div className="pr-4">
                  <div className="font-bold text-slate-800 dark:text-slate-200">{pref.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{pref.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs[pref.key]}
                  onChange={(e) => setNotifPrefs({ ...notifPrefs, [pref.key]: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 mt-1 cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
