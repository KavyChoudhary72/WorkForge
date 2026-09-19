import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, ShieldAlert, Terminal } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function ActivityLogsPage() {
  const { activityLogs } = useData();
  const [search, setSearch] = useState('');

  const filteredLogs = activityLogs.filter(l =>
    l.userName.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Compliance Audit Trail</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            System Activity & Security Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable audit record of user logins, role modifications, entity creation, invoice actions, and file downloads.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
            placeholder="Filter logs by user, action code, or details..."
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-panel p-6 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
              <th className="pb-3">Timestamp</th>
              <th className="pb-3">User & Role</th>
              <th className="pb-3">Action Type</th>
              <th className="pb-3">Audit Log Details</th>
              <th className="pb-3 text-right">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {filteredLogs.map(l => (
              <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 text-slate-400">{l.timestamp}</td>
                <td className="py-3 font-sans font-semibold text-slate-800 dark:text-slate-200">
                  <div>{l.userName}</div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">{l.userRole}</div>
                </td>
                <td className="py-3">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                    {l.action}
                  </span>
                </td>
                <td className="py-3 font-sans text-slate-600 dark:text-slate-300">{l.details}</td>
                <td className="py-3 text-right text-slate-400">{l.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
