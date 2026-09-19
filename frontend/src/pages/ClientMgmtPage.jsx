import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Building,
  Mail,
  Phone,
  FileText,
  Briefcase,
  MapPin,
  X,
  ExternalLink,
  ChevronRight,
  Edit2,
  Archive,
  RotateCcw,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { UserAvatar } from '../components/common/UserAvatar';

export default function ClientMgmtPage() {
  const { clients, addClient, updateClient, toggleArchiveClient, projects } = useData();
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active'); // 'Active' | 'Archived' | 'All'
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    gstNumber: '',
    industry: 'Financial Technology',
    address: '',
    contactPerson: '',
    notes: '',
    avatar: ''
  });

  const industries = ['All', 'Financial Technology', 'Healthcare / SaaS', 'Logistics & Distribution', 'Retail', 'Software'];

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          (c.company && c.company.toLowerCase().includes(search.toLowerCase())) ||
                          (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
                          (c.contactPerson && c.contactPerson.toLowerCase().includes(search.toLowerCase()));
    const matchesIndustry = industryFilter === 'All' || c.industry === industryFilter;
    const isArchived = c.isArchived || c.status === 'Archived';
    const matchesStatus = statusFilter === 'All' ? true : statusFilter === 'Archived' ? isArchived : !isArchived;

    return matchesSearch && matchesIndustry && matchesStatus;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addClient(formData);
    setShowAddModal(false);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      gstNumber: '',
      industry: 'Financial Technology',
      address: '',
      contactPerson: '',
      notes: '',
      avatar: ''
    });
  };

  const handleOpenEdit = (c) => {
    setEditingClient(c);
    setFormData({
      name: c.name,
      company: c.company || '',
      email: c.email,
      phone: c.phone || '',
      gstNumber: c.gstNumber || c.gst || c.taxId || '',
      industry: c.industry || 'Financial Technology',
      address: c.address || '',
      contactPerson: c.contactPerson || '',
      notes: c.notes || '',
      avatar: c.avatar || ''
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingClient) return;
    if (updateClient) {
      updateClient(editingClient.id, formData);
    }
    setEditingClient(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>CRM & Enterprise Accounts</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Client Directory & Portfolios
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Manage client accounts, contact persons, tax registration (GSTIN), addresses, and contract portfolios.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              company: '',
              email: '',
              phone: '',
              gstNumber: '',
              industry: 'Financial Technology',
              address: '',
              contactPerson: '',
              notes: '',
              avatar: ''
            });
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client Account</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-transparent focus:border-blue-500 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
            placeholder="Search client name, company, contact person, or email..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-700 dark:text-slate-300 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-transparent rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
            >
              <option value="Active">Active Accounts</option>
              <option value="Archived">Archived Accounts</option>
              <option value="All">All Accounts</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-700 dark:text-slate-300 font-bold">Industry:</span>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-transparent rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
            >
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(c => {
          const clientProjects = projects.filter(p => p.clientId === c.id || p.clientId?._id === c.id);
          const isArchived = c.isArchived || c.status === 'Archived';

          return (
            <div
              key={c.id}
              className={`glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between transition-all ${
                isArchived ? 'opacity-60 border-slate-400/40' : 'hover:border-blue-500/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between space-x-3">
                  <div className="flex items-center space-x-3">
                    <UserAvatar name={c.name} src={c.avatar} size="lg" />
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{c.name}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center font-semibold mt-0.5">
                        <Building className="w-3.5 h-3.5 mr-1" /> {c.company || 'Private Client'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded uppercase tracking-wider ${
                    isArchived
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-600/40'
                      : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-800/40'
                  }`}>
                    {isArchived ? 'Archived' : c.industry || 'Tech'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs py-3 border-y border-slate-200 dark:border-slate-800">
                  {c.contactPerson && (
                    <div className="flex items-center text-slate-700 dark:text-slate-300 font-semibold">
                      <Users className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span>Contact: {c.contactPerson}</span>
                    </div>
                  )}
                  <div className="flex items-center text-slate-700 dark:text-slate-300 font-medium">
                    <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  <div className="flex items-center text-slate-700 dark:text-slate-300 font-medium">
                    <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span>{c.phone || '+91-XXXXXXXXXX'}</span>
                  </div>
                  {(c.gstNumber || c.gst || c.taxId) && (
                    <div className="flex items-center text-slate-700 dark:text-slate-300 font-medium">
                      <FileText className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span className="font-mono text-[11px]">GSTIN: {c.gstNumber || c.gst || c.taxId}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center text-slate-700 dark:text-slate-300 font-medium">
                      <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Total Billed</div>
                    <div className="font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">₹{(c.totalBilled || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Active Projects</div>
                    <div className="font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 text-right">{clientProjects.length} Active</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => toggleArchiveClient && toggleArchiveClient(c.id)}
                  title={isArchived ? 'Restore Client' : 'Archive Client'}
                  className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                    isArchived
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-amber-500'
                  }`}
                >
                  {isArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setSelectedClient(c)}
                  className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
                  title="View Details"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Client Modal */}
      {(showAddModal || editingClient) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingClient ? 'Edit Client Record' : 'Add New Enterprise Client'}
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setEditingClient(null); }}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingClient ? handleEditSubmit : handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Account / Client Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                    placeholder="e.g. Elena Rostova"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Legal Company Entity</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                    placeholder="Acme Innovations Inc"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Primary Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                    placeholder="VP Operations / Lead"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Billing Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                    placeholder="billing@client.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                    placeholder="27AAAAA0000A1Z5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Industry Vertical</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    <option value="Financial Technology">Financial Technology</option>
                    <option value="Healthcare / SaaS">Healthcare / SaaS</option>
                    <option value="Logistics & Distribution">Logistics & Distribution</option>
                    <option value="Retail">Retail</option>
                    <option value="Software">Software</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Corporate Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                    placeholder="Bandra Kurla Complex, Mumbai"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Confidential Notes / Terms</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                  placeholder="Key account details, billing cycle terms, preferred payment method..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingClient(null); }}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 font-semibold hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  {editingClient ? 'Save Changes' : 'Save Client Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Full Profile Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <UserAvatar name={selectedClient.name} src={selectedClient.avatar} size="md" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedClient.name}</h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{selectedClient.company}</div>
                </div>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Industry:</span>
                <span className="font-bold">{selectedClient.industry}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Contact Person:</span>
                <span className="font-bold">{selectedClient.contactPerson || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Email:</span>
                <span className="font-bold">{selectedClient.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Phone:</span>
                <span className="font-bold">{selectedClient.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Address:</span>
                <span className="font-bold">{selectedClient.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">GSTIN / Tax ID:</span>
                <span className="font-mono font-bold">{selectedClient.gstNumber || selectedClient.gst || selectedClient.taxId || 'N/A'}</span>
              </div>
              {selectedClient.notes && (
                <div className="pt-2">
                  <span className="text-slate-500 block mb-1">Notes:</span>
                  <p className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 italic">{selectedClient.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
