import React, { useState } from 'react';
import {
  Clock,
  Play,
  Pause,
  Square,
  Plus,
  Calendar,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
  X,
  FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export default function TimeTrackingPage() {
  const { timeLogs, activeTimer, startTimer, pauseTimer, resumeTimer, stopTimerAndSave, projects } = useData();
  const { currentUser } = useAuth();
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedProjectForTimer, setSelectedProjectForTimer] = useState(projects[0]?.id || 'prj-1');
  const [timerLabel, setTimerLabel] = useState('Sprint Feature Development');

  const [manualForm, setManualForm] = useState({
    projectId: projects[0]?.id || '',
    taskTitle: '',
    hours: 2.5,
    date: new Date().toISOString().split('T')[0],
    billable: true,
    description: '',
  });

  // Calculate stats
  const totalHours = timeLogs.reduce((sum, l) => sum + l.hours, 0);
  const billableHours = timeLogs.filter(l => l.billable).reduce((sum, l) => sum + l.hours, 0);
  const billablePercent = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0;

  // Chart data for daily breakdown
  const dailyData = [
    { day: 'Mon', billable: 7.5, nonBillable: 1.0 },
    { day: 'Tue', billable: 8.0, nonBillable: 0.5 },
    { day: 'Wed', billable: 6.5, nonBillable: 1.5 },
    { day: 'Thu', billable: 8.5, nonBillable: 0.0 },
    { day: 'Fri', billable: 7.0, nonBillable: 1.0 },
  ];

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Time & Productivity Tracking</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Live Stopwatch & Timesheets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track employee billable hours in real-time, generate client timesheets, and analyze productivity metrics.
          </p>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Manual Time Entry</span>
        </button>
      </div>

      {/* Main Stopwatch Widget Card */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-slate-100 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 w-full md:w-auto">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Live Workspace Timer
          </div>
          <div className="font-mono text-5xl font-extrabold tracking-wider text-white">
            {formatTime(activeTimer.seconds)}
          </div>
          <p className="text-xs text-slate-400">
            {activeTimer.isRunning
              ? `Currently tracking: ${activeTimer.projectName}`
              : 'Select project and start timer for instant time logging.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {!activeTimer.isRunning && activeTimer.seconds === 0 && (
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={selectedProjectForTimer}
                onChange={(e) => setSelectedProjectForTimer(e.target.value)}
                className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
              >
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              <button
                onClick={() => startTimer(selectedProjectForTimer, timerLabel)}
                className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Timer</span>
              </button>
            </div>
          )}

          {activeTimer.isRunning && (
            <button
              onClick={pauseTimer}
              className="flex items-center space-x-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-amber-600/30 transition-all"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause Session</span>
            </button>
          )}

          {!activeTimer.isRunning && activeTimer.seconds > 0 && (
            <button
              onClick={resumeTimer}
              className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume</span>
            </button>
          )}

          {activeTimer.seconds > 0 && (
            <button
              onClick={() => stopTimerAndSave(currentUser.name)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-red-600/30 transition-all"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop & Save Log</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Hours Logged</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalHours} Hours</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">Across active projects</div>
        </div>

        <div className="glass-panel p-5 rounded-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Billable Hours</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{billableHours} Hours</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{billablePercent}% Billable Ratio</div>
        </div>

        <div className="glass-panel p-5 rounded-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Revenue Generated</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">₹{(billableHours * 250).toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Based on ₹250/hr standard rate</div>
        </div>
      </div>

      {/* Daily Timesheet Bar Chart + Recent Logs Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 glass-panel p-6 rounded-xl">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
            Weekly Hours Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#F8FAFC' }}
                />
                <Bar dataKey="billable" fill="#3B82F6" stackId="a" radius={[0, 0, 4, 4]} name="Billable" />
                <Bar dataKey="nonBillable" fill="#64748B" stackId="a" radius={[4, 4, 0, 0]} name="Non-Billable" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Recent Timesheet Log Entries
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3">Date & User</th>
                  <th className="pb-3">Project & Description</th>
                  <th className="pb-3">Hours</th>
                  <th className="pb-3">Billable Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {timeLogs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                      <div>{l.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{l.date}</div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">{l.projectName}</div>
                      <div className="text-[11px] text-slate-500">{l.description}</div>
                    </td>
                    <td className="py-3 font-mono font-bold">{l.hours} hrs</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                        l.billable ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {l.billable ? 'Billable' : 'Non-Billable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Manual Time Entry</h3>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const proj = projects.find(p => p.id === manualForm.projectId);
              useData().timeLogs.unshift({
                id: `log-${Date.now()}`,
                orgId: 'org-1',
                userId: 'usr-emp1',
                userName: currentUser.name,
                projectId: manualForm.projectId,
                projectName: proj ? proj.name : 'General Project',
                taskTitle: manualForm.taskTitle || 'Manual Work',
                hours: +manualForm.hours,
                date: manualForm.date,
                billable: manualForm.billable,
                description: manualForm.description,
              });
              setShowManualModal(false);
            }} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Project</label>
                <select
                  value={manualForm.projectId}
                  onChange={(e) => setManualForm({ ...manualForm, projectId: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hours Spent</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={manualForm.hours}
                    onChange={(e) => setManualForm({ ...manualForm, hours: +e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={manualForm.date}
                    onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Description</label>
                <textarea
                  rows={3}
                  required
                  value={manualForm.description}
                  onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="billableCheck"
                  checked={manualForm.billable}
                  onChange={(e) => setManualForm({ ...manualForm, billable: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="billableCheck" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  Mark as Billable Hour
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded"
                >
                  Save Time Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
