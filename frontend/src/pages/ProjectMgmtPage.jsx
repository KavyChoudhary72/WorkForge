import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Sparkles,
  Calendar,
  IndianRupee,
  Users,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Grid,
  List,
  X,
  ChevronRight,
  Loader2,
  FileText
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { UserAvatar } from '../components/common/UserAvatar';
import { getApiBaseUrl } from '../services/api';

export default function ProjectMgmtPage() {
  const { projects, clients, addProject, updateProject, teamMembers } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const recalculateGeminiScore = async (proj) => {
    if (!proj) return;
    setLoadingAi(true);
    try {
      const API_BASE = getApiBaseUrl();
      const res = await fetch(`${API_BASE}/ai/health-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: proj })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const updated = {
          ...proj,
          aiHealthScore: data.data.score,
          aiHealthFactors: data.data.factors
        };
        setSelectedProject(updated);
        if (updateProject) {
          updateProject(proj.id, {
            aiHealthScore: data.data.score,
            aiHealthFactors: data.data.factors
          });
        }
      }
    } catch (err) {
      console.error('Failed recalculating score with Gemini:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const statuses = ['All', 'Planning', 'In Progress', 'On Hold', 'Testing', 'Completed', 'Delivered', 'Cancelled'];

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          (p.code && p.code.toLowerCase().includes(search.toLowerCase())) ||
                          (p.clientName && p.clientName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    clientId: clients[0]?.id || '',
    description: '',
    budget: 50000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    priority: 'High',
    status: 'Planning',
    assignedTeam: [],
    attachments: []
  });

  const [newAttachmentName, setNewAttachmentName] = useState('');

  const handleCreateProject = (e) => {
    e.preventDefault();
    const client = clients.find(c => c.id === formData.clientId);
    addProject({
      ...formData,
      clientName: client ? client.name : 'Enterprise Client',
      assignedTeam: formData.assignedTeam.length > 0 ? formData.assignedTeam : [teamMembers[0]?.id || 'usr-1']
    });
    setShowAddModal(false);
    setFormData({
      name: '',
      code: '',
      clientId: clients[0]?.id || '',
      description: '',
      budget: 50000,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      priority: 'High',
      status: 'Planning',
      assignedTeam: [],
      attachments: []
    });
  };

  const toggleTeamMember = (memberId) => {
    setFormData(prev => {
      const exists = prev.assignedTeam.includes(memberId);
      return {
        ...prev,
        assignedTeam: exists
          ? prev.assignedTeam.filter(id => id !== memberId)
          : [...prev.assignedTeam, memberId]
      };
    });
  };

  const addAttachment = () => {
    if (!newAttachmentName.trim()) return;
    setFormData(prev => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        {
          name: newAttachmentName.trim(),
          url: `https://vault.workforge.io/docs/${encodeURIComponent(newAttachmentName.trim())}`,
          size: '1.2 MB',
          uploadedAt: new Date().toISOString()
        }
      ]
    }));
    setNewAttachmentName('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>Portfolio & Milestone Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Projects & AI Health Audits
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Monitor client project budgets, burn velocity, assigned engineers, contract attachments, and automated AI health audits.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Client Project</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-transparent focus:border-blue-500 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
            placeholder="Search project name, code, or client..."
          />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-700 dark:text-slate-300 font-bold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-transparent rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
          >
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(p => {
          const budget = p.budget || 0;
          const spent = p.spent || 0;
          const percent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
          const healthScore = p.aiHealthScore || 85;

          return (
            <div key={p.id} className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between hover:border-blue-500/50 transition-colors">
              <div>
                <div className="flex items-start justify-between space-x-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                      {p.code || 'PRJ-PRO'}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mt-0.5">{p.name}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{p.clientName}</p>
                  </div>

                  <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider border ${
                    p.status === 'Completed' || p.status === 'Delivered' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300' :
                    p.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300' :
                    p.status === 'On Hold' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300' :
                    p.status === 'Cancelled' ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {p.description || 'Enterprise project deliverable initiative.'}
                </p>

                {/* Budget Utilization Meter */}
                <div className="mt-4 space-y-1.5 py-3 border-y border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600 dark:text-slate-400">Budget Utilization:</span>
                    <span className="text-slate-900 dark:text-slate-100">₹{spent.toLocaleString('en-IN')} / ₹{budget.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-amber-500' : 'bg-blue-600'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* AI Health Score Badge */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Health: {healthScore}/100</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">
                    Due: {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : p.endDate || '2026-12-31'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
                <button
                  onClick={() => setSelectedProject(p)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
                >
                  View Details & Team
                </button>
                <button
                  onClick={() => recalculateGeminiScore(p)}
                  title="Run Real-time Gemini Audit"
                  className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Create New Client Project</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                    placeholder="e.g. Core System Migration"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Project Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                    placeholder="PRJ-MIG-01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Client Entity</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Budget (₹ INR)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: +e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    {statuses.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">End / Due Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Assigned Team Members</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  {teamMembers.map(m => {
                    const isChecked = formData.assignedTeam.includes(m.id);
                    return (
                      <label key={m.id} className="flex items-center space-x-2 p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTeamMember(m.id)}
                          className="rounded text-blue-600"
                        />
                        <span className="truncate font-medium text-slate-800 dark:text-slate-200">{m.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Project Attachments</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newAttachmentName}
                    onChange={(e) => setNewAttachmentName(e.target.value)}
                    placeholder="e.g. Scope_Of_Work_v1.pdf"
                    className="flex-1 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={addAttachment}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
                  >
                    Attach
                  </button>
                </div>
                {formData.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.attachments.map((att, idx) => (
                      <div key={idx} className="flex items-center space-x-1 text-[11px] text-blue-600 dark:text-blue-400">
                        <Paperclip className="w-3 h-3" />
                        <span>{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Strategic Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                  placeholder="Goals, deliverables, milestones, and scope details..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 font-semibold hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase">{selectedProject.code}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedProject.name}</h3>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{selectedProject.description}</p>

            <div className="space-y-2 text-xs py-2 border-y border-slate-200 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Client:</span>
                <span className="font-bold">{selectedProject.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-blue-600">{selectedProject.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Allocated Budget:</span>
                <span className="font-bold">₹{(selectedProject.budget || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Spent:</span>
                <span className="font-bold">₹{(selectedProject.spent || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* AI Health Audit Results */}
            {selectedProject.aiHealthFactors && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl space-y-1.5 text-xs border border-indigo-200 dark:border-indigo-800">
                <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center space-x-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Gemini AI Audit Factors ({selectedProject.aiHealthScore}/100)</span>
                </div>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px] list-disc list-inside">
                  {selectedProject.aiHealthFactors.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Close Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
