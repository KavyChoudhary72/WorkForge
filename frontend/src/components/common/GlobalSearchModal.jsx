import React, { useState, useEffect } from 'react';
import { Search, X, Folder, Users, CheckSquare, FileText, File, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function GlobalSearchModal({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const { projects, clients, tasks, invoices, files, teamMembers } = useData();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProjects = query.trim() ? projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.code.toLowerCase().includes(query.toLowerCase())) : [];
  const filteredClients = query.trim() ? clients.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.company.toLowerCase().includes(query.toLowerCase())) : [];
  const filteredTasks = query.trim() ? tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase())) : [];
  const filteredInvoices = query.trim() ? invoices.filter(i => i.id.toLowerCase().includes(query.toLowerCase()) || i.clientName.toLowerCase().includes(query.toLowerCase())) : [];
  const filteredFiles = query.trim() ? files.filter(f => f.name.toLowerCase().includes(query.toLowerCase())) : [];
  const filteredMembers = query.trim() ? teamMembers.filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.email.toLowerCase().includes(query.toLowerCase())) : [];

  const totalResults = filteredProjects.length + filteredClients.length + filteredTasks.length + filteredInvoices.length + filteredFiles.length + filteredMembers.length;

  const handleSelect = (page) => {
    onNavigate(page);
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-16 bg-slate-900/60 backdrop-blur-sm px-3 sm:px-4">
      <div className="w-full max-auto max-w-2xl bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all max-h-[85vh] flex flex-col">
        {/* Search Header */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 text-sm focus:outline-none placeholder-slate-400"
            placeholder="Search projects, clients, tasks, invoices... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 sm:p-4 space-y-4 touch-scroll">
          {!query.trim() ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Type keywords to search across the entire multi-tenant workspace platform.
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No results found for <span className="font-semibold text-slate-700 dark:text-slate-200">"{query}"</span>
            </div>
          ) : (
            <>
              {/* Projects */}
              {filteredProjects.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Projects</div>
                  <div className="space-y-1">
                    {filteredProjects.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect('projects')}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Folder className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{p.name}</div>
                            <div className="text-xs text-slate-400">{p.code} • {p.clientName}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clients */}
              {filteredClients.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Clients</div>
                  <div className="space-y-1">
                    {filteredClients.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelect('clients')}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Users className="w-4 h-4 text-emerald-500" />
                          <div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{c.name}</div>
                            <div className="text-xs text-slate-400">{c.industry} • {c.email}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {filteredTasks.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tasks</div>
                  <div className="space-y-1">
                    {filteredTasks.map(t => (
                      <div
                        key={t.id}
                        onClick={() => handleSelect('tasks')}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <CheckSquare className="w-4 h-4 text-indigo-500" />
                          <div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{t.title}</div>
                            <div className="text-xs text-slate-400">Assigned: {t.assigneeName} • Status: {t.status}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {filteredInvoices.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Invoices</div>
                  <div className="space-y-1">
                    {filteredInvoices.map(i => (
                      <div
                        key={i.id}
                        onClick={() => handleSelect('invoices')}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-amber-500" />
                          <div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">Invoice #{i.id}</div>
                            <div className="text-xs text-slate-400">{i.clientName} • ₹{i.totalAmount.toLocaleString('en-IN')} • {i.status}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {filteredFiles.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Files</div>
                  <div className="space-y-1">
                    {filteredFiles.map(f => (
                      <div
                        key={f.id}
                        onClick={() => handleSelect('files')}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <File className="w-4 h-4 text-purple-500" />
                          <div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{f.name}</div>
                            <div className="text-xs text-slate-400">{f.size} • Uploaded by {f.uploadedBy}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-navy-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Navigate with click or arrow keys</span>
          <span>Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 font-mono">ESC</kbd> to exit</span>
        </div>
      </div>
    </div>
  );
}
