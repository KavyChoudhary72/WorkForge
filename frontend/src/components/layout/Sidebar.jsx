import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  CheckSquare,
  Clock,
  FileText,
  FolderGit2,
  UserCheck,
  Calendar,
  ShieldCheck,
  BarChart3,
  SlidersHorizontal,
  Sparkles,
  ChevronDown,
  Settings,
  UserCircle
} from 'lucide-react';
import WorkForgeLogo from '../common/WorkForgeLogo';
import { OrgLogo } from '../common/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import ImageCropperModal from '../common/ImageCropperModal';

export default function Sidebar({ activePage, setActivePage }) {
  const { currentOrg, switchOrganization, organizationsList, currentUser, updateCompanyLogo } = useAuth();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);

  const isSuperAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'SUPER_ADMIN';

  const menuItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'organizations', label: 'Multi-Tenant Orgs', icon: Building2, badge: 'Super Admin', restricted: !isSuperAdmin },
    { id: 'clients', label: 'Client Directory', icon: Users },
    { id: 'projects', label: 'Projects & AI Health', icon: Briefcase },
    { id: 'tasks', label: 'Tasks & Kanban Board', icon: CheckSquare },
    { id: 'timetracking', label: 'Time & Productivity', icon: Clock },
    { id: 'invoices', label: 'Invoices & PDF Billing', icon: FileText },
    { id: 'files', label: 'File Manager & Assets', icon: FolderGit2 },
    { id: 'team', label: 'Team Directory & HR', icon: UserCheck },
    { id: 'calendar', label: 'Calendar & Schedule', icon: Calendar },
    { id: 'activity', label: 'Audit Trail / Logs', icon: ShieldCheck },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'integrations', label: 'Integrations Hub', icon: SlidersHorizontal },
    { id: 'settings', label: 'Company & Settings', icon: Settings },
    { id: 'profile', label: 'My Profile & Skills', icon: UserCircle },
    { id: 'aihub', label: 'AI Intelligence Hub', icon: Sparkles, highlight: true },
  ];

  const handleHomeNavigate = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleCropLogoSave = (croppedDataUrl) => {
    updateCompanyLogo(croppedDataUrl);
  };

  return (
    <>
      <aside className="w-64 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col h-screen sticky top-0 z-40 border-r border-slate-200 dark:border-slate-800 transition-colors">
        {/* Brand Header with Clickable WorkForge Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <WorkForgeLogo size="small" onClick={handleHomeNavigate} />
        </div>

        {/* Multi-Tenant Workspace Selector */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 relative">
          <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider px-2 mb-1">
            Active Workspace
          </div>
          <div className="flex items-center space-x-2">
            <OrgLogo
              name={currentOrg?.name || 'Workspace'}
              src={currentOrg?.logo || ''}
              size="md"
              onClick={() => setShowCropModal(true)}
            />
            <button
              onClick={() => setShowOrgDropdown(!showOrgDropdown)}
              className="flex-1 flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/60 text-left transition-colors truncate"
            >
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{currentOrg?.name || 'Workspace'}</div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">{currentOrg?.plan || 'Pro Plan'}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 ml-1" />
            </button>
          </div>

          {/* Tenant Switcher Dropdown */}
          {showOrgDropdown && (
            <div className="absolute left-3 right-3 top-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Switch Organization Tenant
              </div>
              {organizationsList.map(org => (
                <button
                  key={org.id}
                  onClick={() => {
                    switchOrganization(org.id);
                    setShowOrgDropdown(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 text-left text-xs transition-colors ${
                    org.id === currentOrg.id
                      ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 font-bold border-l-2 border-blue-600'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <OrgLogo name={org.name} src={org.logo} size="sm" />
                  <div className="truncate">
                    <div className="truncate font-semibold">{org.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{org.plan} • {org.status}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.filter(item => !item.restricted).map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                    : item.highlight
                    ? 'bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/40 text-indigo-700 dark:text-indigo-300 hover:from-indigo-100 hover:to-blue-100 border border-indigo-200 dark:border-indigo-700/40'
                    : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                    item.restricted
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60'
                      : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1">
            <span>Role Level</span>
            <span className="font-extrabold text-blue-600 dark:text-blue-400">{currentUser?.role || 'Member'}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
            <span>Security Protocol</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">TLS 1.3 / AES-256</span>
          </div>
        </div>
      </aside>

      {/* Image Cropper Modal for Company Logo */}
      <ImageCropperModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        onCropSave={handleCropLogoSave}
        title={`Crop Logo for ${currentOrg?.name || 'Company'}`}
        cropShape="square"
      />
    </>
  );
}
