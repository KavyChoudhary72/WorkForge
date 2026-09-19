import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  HardDrive,
  Users,
  Shield,
  TrendingUp,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Camera,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { OrgLogo } from '../components/common/UserAvatar';

export default function OrganizationMgmtPage() {
  const { organizationsList, currentOrg, currentUser } = useAuth();

  const isSuperAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'SUPER_ADMIN';

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl max-w-xl mx-auto my-12 space-y-4 border border-rose-500/20 shadow-xl">
        <Shield className="w-14 h-14 text-rose-500 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Super Admin Access Restricted</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Multi-Tenant Organization Management is reserved exclusively for Platform Super Administrators. Company Admins and members manage their assigned workspace resources.
        </p>
      </div>
    );
  }

  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const defaultOrgList = [
    { id: 'c-1', name: 'TechNova Solutions', industry: 'Software Development', email: 'admin@technova.com', phone: '+91-9876543210', plan: 'Enterprise', subscriptionPlan: 'Enterprise', activeUsersCount: 120, employeeCount: 120, storageUsed: 45, storageLimit: 100, status: 'Active', createdAt: '2026-01-15' },
    { id: 'c-2', name: 'PixelCraft Studio', industry: 'UI/UX Design Agency', email: 'contact@pixelcraft.com', phone: '+91-9876500011', plan: 'Pro', subscriptionPlan: 'Pro', activeUsersCount: 35, employeeCount: 35, storageUsed: 12, storageLimit: 50, status: 'Active', createdAt: '2026-01-16' },
    { id: 'c-3', name: 'GrowthX Marketing', industry: 'Digital Marketing', email: 'admin@growthx.com', phone: '+91-9876500012', plan: 'Pro', subscriptionPlan: 'Pro', activeUsersCount: 60, employeeCount: 60, storageUsed: 18, storageLimit: 50, status: 'Active', createdAt: '2026-01-17' },
    { id: 'c-4', name: 'BuildSmart Constructions', industry: 'Construction', email: 'office@buildsmart.com', phone: '+91-9876500013', plan: 'Business', subscriptionPlan: 'Business', activeUsersCount: 250, employeeCount: 250, storageUsed: 75, storageLimit: 100, status: 'Active', createdAt: '2026-01-18' },
    { id: 'c-5', name: 'MediCare Plus', industry: 'Healthcare', email: 'support@medicareplus.com', phone: '+91-9876500014', plan: 'Enterprise', subscriptionPlan: 'Enterprise', activeUsersCount: 180, employeeCount: 180, storageUsed: 55, storageLimit: 100, status: 'Active', createdAt: '2026-01-19' },
    { id: 'c-6', name: 'EduSpark Academy', industry: 'Education', email: 'admin@eduspark.com', phone: '+91-9876500015', plan: 'Business', subscriptionPlan: 'Business', activeUsersCount: 90, employeeCount: 90, storageUsed: 20, storageLimit: 50, status: 'Active', createdAt: '2026-01-20' },
    { id: 'c-7', name: 'FinEdge Consulting', industry: 'Finance', email: 'contact@finedge.com', phone: '+91-9876500016', plan: 'Enterprise', subscriptionPlan: 'Enterprise', activeUsersCount: 75, employeeCount: 75, storageUsed: 28, storageLimit: 100, status: 'Active', createdAt: '2026-01-21' },
    { id: 'c-8', name: 'UrbanKart Retail', industry: 'E-Commerce', email: 'admin@urbankart.com', phone: '+91-9876500017', plan: 'Business', subscriptionPlan: 'Business', activeUsersCount: 110, employeeCount: 110, storageUsed: 34, storageLimit: 100, status: 'Active', createdAt: '2026-01-22' },
    { id: 'c-9', name: 'AgriTech Innovations', industry: 'Agriculture Technology', email: 'support@agritech.com', phone: '+91-9876500018', plan: 'Pro', subscriptionPlan: 'Pro', activeUsersCount: 40, employeeCount: 40, storageUsed: 15, storageLimit: 50, status: 'Active', createdAt: '2026-01-23' },
    { id: 'c-10', name: 'SkyNet Logistics', industry: 'Logistics', email: 'contact@skynetlogistics.com', phone: '+91-9876500019', plan: 'Enterprise', subscriptionPlan: 'Enterprise', activeUsersCount: 300, employeeCount: 300, storageUsed: 90, storageLimit: 200, status: 'Active', createdAt: '2026-01-24' },
    { id: 'c-11', name: 'BlueOcean Travels', industry: 'Travel & Tourism', email: 'admin@blueocean.com', phone: '+91-9876500020', plan: 'Pro', subscriptionPlan: 'Pro', activeUsersCount: 28, employeeCount: 28, storageUsed: 10, storageLimit: 50, status: 'Active', createdAt: '2026-01-25' },
    { id: 'c-12', name: 'AutoDrive Motors', industry: 'Automobile', email: 'office@autodrive.com', phone: '+91-9876500021', plan: 'Business', subscriptionPlan: 'Business', activeUsersCount: 220, employeeCount: 220, storageUsed: 65, storageLimit: 100, status: 'Active', createdAt: '2026-01-26' },
    { id: 'c-13', name: 'GreenLeaf Energy', industry: 'Renewable Energy', email: 'contact@greenleaf.com', phone: '+91-9876500022', plan: 'Enterprise', subscriptionPlan: 'Enterprise', activeUsersCount: 150, employeeCount: 150, storageUsed: 50, storageLimit: 100, status: 'Active', createdAt: '2026-01-27' },
    { id: 'c-14', name: 'LegalEase Associates', industry: 'Legal Services', email: 'admin@legalease.com', phone: '+91-9876500023', plan: 'Pro', subscriptionPlan: 'Pro', activeUsersCount: 22, employeeCount: 22, storageUsed: 8, storageLimit: 50, status: 'Active', createdAt: '2026-01-28' },
    { id: 'c-15', name: 'FoodHub Restaurants', industry: 'Food & Beverage', email: 'support@foodhub.com', phone: '+91-9876500024', plan: 'Business', subscriptionPlan: 'Business', activeUsersCount: 95, employeeCount: 95, storageUsed: 25, storageLimit: 50, status: 'Suspended', createdAt: '2026-01-29' }
  ];

  const [orgs, setOrgs] = useState(organizationsList && organizationsList.length > 0 ? organizationsList : defaultOrgList);

  const [newOrg, setNewOrg] = useState({
    name: '',
    slug: '',
    logo: '',
    plan: 'Starter',
    departments: 'Engineering, Sales, Marketing',
  });

  const filteredOrgs = orgs.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.plan.toLowerCase().includes(search.toLowerCase())
  );

  const totalMRR = orgs.reduce((sum, o) => sum + (o.mrr || 0), 0);

  const handleCreateOrg = (e) => {
    e.preventDefault();
    const created = {
      id: `org-${Date.now()}`,
      name: newOrg.name,
      slug: newOrg.slug || newOrg.name.toLowerCase().replace(/\s+/g, '-'),
      logo: newOrg.logo || '',
      plan: newOrg.plan,
      status: 'Active',
      departments: newOrg.departments.split(',').map(d => d.trim()),
      storageUsed: 0.5,
      storageLimit: newOrg.plan === 'Enterprise' ? 100 : newOrg.plan === 'Pro Plan' ? 50 : 10,
      createdAt: new Date().toISOString().split('T')[0],
      activeUsersCount: 1,
      mrr: newOrg.plan === 'Enterprise' ? 2499 : newOrg.plan === 'Pro Plan' ? 899 : 299,
    };
    setOrgs([created, ...orgs]);
    setShowCreateModal(false);
    setNewOrg({ name: '', slug: '', logo: '', plan: 'Starter', departments: 'Engineering, Sales' });
  };

  const toggleStatus = (id) => {
    setOrgs(prev => prev.map(o => {
      if (o.id === id) {
        return { ...o, status: o.status === 'Active' ? 'Suspended' : 'Active' };
      }
      return o;
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Super Admin Governance Control</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Multi-Tenant Organization Management
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Control tenant isolated workspaces, storage quotas, subscription plans, and custom logos.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Tenant Org</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-xl">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Active Tenants</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{orgs.length} Organizations</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-bold">100% Data Isolation Active</div>
        </div>

        <div className="glass-panel p-5 rounded-xl">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total SaaS MRR</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">₹{totalMRR.toLocaleString('en-IN')}/mo</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-bold">Enterprise Tier Dominance</div>
        </div>

        <div className="glass-panel p-5 rounded-xl">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Global Platform Storage</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">65.1 GB / 160 GB</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">S3 Encrypted Buckets</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-transparent focus:border-blue-500 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
            placeholder="Search tenant name or subscription plan..."
          />
        </div>
      </div>

      {/* Organization Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrgs.map(org => {
          const usagePercent = Math.round((org.storageUsed / org.storageLimit) * 100);

          return (
            <div key={org.id} className="glass-panel p-6 rounded-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <OrgLogo name={org.name} src={org.logo} size="md" />
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{org.name}</h3>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{org.slug}.workforge.io</div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider border ${
                    org.status === 'Active'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800'
                  }`}>
                    {org.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs py-3 border-y border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Subscription Tier</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">{org.plan} (₹{org.mrr}/mo)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Active Seat Count</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{org.activeUsersCount} Seats</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Tenant Joined</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{org.createdAt}</span>
                  </div>
                </div>

                {/* Storage Meter */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center">
                      <HardDrive className="w-3.5 h-3.5 mr-1 text-slate-400" /> Storage Usage
                    </span>
                    <span>{org.storageUsed} GB / {org.storageLimit} GB ({usagePercent}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${usagePercent > 80 ? 'bg-red-500' : 'bg-blue-600'}`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => toggleStatus(org.id)}
                  className={`text-xs font-bold hover:underline ${
                    org.status === 'Active' ? 'text-red-500' : 'text-emerald-500'
                  }`}
                >
                  {org.status === 'Active' ? 'Suspend Tenant Access' : 'Reactivate Tenant'}
                </button>

                <span className="text-[10px] text-slate-500 font-mono font-medium">ID: {org.id}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Provision New Org Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Provision New Tenant Organization</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={newOrg.name}
                  onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                  placeholder="e.g. Oscorp Industries"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Domain Subdomain Slug</label>
                <input
                  type="text"
                  value={newOrg.slug}
                  onChange={(e) => setNewOrg({ ...newOrg, slug: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                  placeholder="oscorp"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Company Logo URL (Optional)</label>
                <div className="flex items-center space-x-2">
                  <OrgLogo name={newOrg.name || 'Organization'} src={newOrg.logo} size="md" />
                  <input
                    type="url"
                    value={newOrg.logo}
                    onChange={(e) => setNewOrg({ ...newOrg, logo: e.target.value })}
                    className="flex-1 p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium"
                    placeholder="https://... (or leave blank for initial logo badge)"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Subscription Plan Tier</label>
                <select
                  value={newOrg.plan}
                  onChange={(e) => setNewOrg({ ...newOrg, plan: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                >
                  <option value="Starter">Starter Plan (₹299/mo - 10 GB Storage)</option>
                  <option value="Pro Plan">Pro Plan (₹899/mo - 50 GB Storage)</option>
                  <option value="Enterprise">Enterprise (₹2,499/mo - 100 GB Storage)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 font-semibold hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Provision Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
