import React from 'react';
import {
  IndianRupee,
  Briefcase,
  Clock,
  CheckSquare,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Users,
  ShieldCheck,
  Calendar as CalendarIcon
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage({ setActivePage }) {
  const { projects, clients, invoices, timeLogs, tasks, activityLogs } = useData();
  const { currentOrg, currentUser } = useAuth();

  // Financial Stats
  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.totalAmount, 0);
  const pendingRevenue = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').reduce((sum, i) => sum + i.totalAmount, 0);
  const activeProjectsCount = projects.filter(p => p.status === 'In Progress' || p.status === 'Testing').length;
  const totalBillableHours = timeLogs.filter(l => l.billable).reduce((sum, l) => sum + l.hours, 0);
  const activeClientsCount = clients.filter(c => !c.isArchived).length;
  const completedTasksCount = tasks.filter(t => t.status === 'Completed' || t.status === 'Done').length;
  const totalTasksCount = tasks.length || 1;
  const taskCompletionRate = Math.round((completedTasksCount / totalTasksCount) * 100);

  // Revenue Trend Chart Mock Data
  const financialData = [
    { month: 'Jan', revenue: 42000, expenses: 18000 },
    { month: 'Feb', revenue: 58000, expenses: 22000 },
    { month: 'Mar', revenue: 64000, expenses: 24000 },
    { month: 'Apr', revenue: 78000, expenses: 28000 },
    { month: 'May', revenue: 92000, expenses: 31000 },
    { month: 'Jun', revenue: 110000, expenses: 35000 },
    { month: 'Jul', revenue: 148500, expenses: 42000 },
  ];

  // Task Weekly Velocity Data
  const taskWeeklyData = [
    { day: 'Mon', completed: 8, created: 10 },
    { day: 'Tue', completed: 12, created: 9 },
    { day: 'Wed', completed: 15, created: 11 },
    { day: 'Thu', completed: 11, created: 7 },
    { day: 'Fri', completed: 18, created: 14 },
    { day: 'Sat', completed: 6, created: 3 },
    { day: 'Sun', completed: 4, created: 2 },
  ];

  // Upcoming Deadlines (Projects & Tasks)
  const upcomingDeadlines = [
    ...projects.filter(p => p.deadline && p.status !== 'Completed' && p.status !== 'Delivered').map(p => ({
      id: p.id,
      type: 'Project',
      title: p.name,
      targetPage: 'projects',
      due: p.deadline,
      priority: p.priority || 'High',
      status: p.status
    })),
    ...tasks.filter(t => (t.dueDate || t.due) && t.status !== 'Completed' && t.status !== 'Done').map(t => ({
      id: t.id,
      type: 'Task',
      title: t.title,
      targetPage: 'tasks',
      due: t.dueDate || t.due,
      priority: t.priority || 'Medium',
      status: t.status
    }))
  ].slice(0, 4);

  // Project Status Breakdown
  const projectStatusData = [
    { name: 'In Progress', count: projects.filter(p => p.status === 'In Progress').length, color: '#3B82F6' },
    { name: 'Testing', count: projects.filter(p => p.status === 'Testing').length, color: '#8B5CF6' },
    { name: 'Planning', count: projects.filter(p => p.status === 'Planning').length, color: '#F59E0B' },
    { name: 'Completed', count: projects.filter(p => p.status === 'Completed' || p.status === 'Delivered').length, color: '#10B981' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Workspace: {currentOrg.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here is your executive portfolio summary for {currentOrg.name}. All systems operational.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActivePage('aihub')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run AI Portfolio Health Audit</span>
          </button>
        </div>
      </div>

      {/* 6 Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Revenue */}
        <div className="glass-panel p-4 rounded-xl cursor-pointer hover:border-blue-500/50 transition-all" onClick={() => setActivePage('invoices')}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Collected Revenue</span>
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>+18.4% this mo</span>
          </div>
        </div>

        {/* Metric 2: Active Projects */}
        <div className="glass-panel p-4 rounded-xl cursor-pointer hover:border-blue-500/50 transition-all" onClick={() => setActivePage('projects')}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Active Projects</span>
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {activeProjectsCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            <span>{projects.length} Total Pipeline</span>
          </div>
        </div>

        {/* Metric 3: Active Clients */}
        <div className="glass-panel p-4 rounded-xl cursor-pointer hover:border-blue-500/50 transition-all" onClick={() => setActivePage('clients')}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Active Clients</span>
            <div className="p-1.5 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 rounded-lg">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {activeClientsCount}
          </div>
          <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium mt-1">
            <span>{clients.length} Accounts Listed</span>
          </div>
        </div>

        {/* Metric 4: Completed Tasks */}
        <div className="glass-panel p-4 rounded-xl cursor-pointer hover:border-blue-500/50 transition-all" onClick={() => setActivePage('tasks')}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Completed Tasks</span>
            <div className="p-1.5 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-lg">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {completedTasksCount} / {tasks.length}
          </div>
          <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1">
            <span>{taskCompletionRate}% sprint velocity</span>
          </div>
        </div>

        {/* Metric 5: Billable Hours */}
        <div className="glass-panel p-4 rounded-xl cursor-pointer hover:border-blue-500/50 transition-all" onClick={() => setActivePage('timetracking')}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Billable Hours</span>
            <div className="p-1.5 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {totalBillableHours} hrs
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            <span>94% Utilization</span>
          </div>
        </div>

        {/* Metric 6: Pending Receivables */}
        <div className="glass-panel p-4 rounded-xl cursor-pointer hover:border-blue-500/50 transition-all" onClick={() => setActivePage('invoices')}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Pending Due</span>
            <div className="p-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            ₹{pendingRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
            <span>{invoices.filter(i => i.status === 'Overdue').length} Overdue Invoices</span>
          </div>
        </div>
      </div>

      {/* Analytics Row: Revenue Trend & Project Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Revenue & Margin Dynamics
              </h3>
              <p className="text-xs text-slate-400">Monthly billing vs operational expenditures</p>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <span className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-1.5" /> Gross Revenue
              </span>
              <span className="flex items-center text-slate-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 mr-1.5" /> Expenses
              </span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#64748B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#F8FAFC' }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" stroke="#64748B" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Health Snapshot & Project Distribution */}
        <div className="space-y-6">
          {/* AI Project Health Score Card */}
          <div className="glass-panel p-6 rounded-xl bg-gradient-to-br from-indigo-950/40 via-navy-900 to-slate-900 border-indigo-800/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">AI Health Index</h3>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                88/100 (Optimal)
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Real-time portfolio evaluation detects optimal burn rate and strong milestone velocity across client deliverables. Omnichannel Strategy is performing in top 90th percentile.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 text-slate-300">
                <span>Budget Variance</span>
                <span className="text-emerald-400 font-semibold">+4.2% Margin</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 text-slate-300">
                <span>Sprint Velocity</span>
                <span className="text-blue-400 font-semibold">96.8% On-Time</span>
              </div>
            </div>
          </div>

          {/* Status Breakdown Bar */}
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
              Active Project Breakdown
            </h3>
            <div className="space-y-3">
              {projectStatusData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>{item.name}</span>
                    <span className="font-semibold">{item.count} Projects</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(item.count / projects.length) * 100}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Velocity & Upcoming Deadlines Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completed Tasks Weekly Velocity Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center">
                <CheckSquare className="w-4 h-4 text-teal-500 mr-2" />
                <span>Sprint Task Completion Velocity</span>
              </h3>
              <p className="text-xs text-slate-400">Weekly completed vs newly assigned tasks</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center text-teal-600 dark:text-teal-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 mr-1.5" /> Completed
              </span>
              <span className="flex items-center text-slate-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500 mr-1.5" /> Created
              </span>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskWeeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#F8FAFC' }}
                />
                <Bar dataKey="completed" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="created" fill="#64748B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Deadlines Widget */}
        <div className="glass-panel p-6 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center">
                <CalendarIcon className="w-4 h-4 text-amber-500 mr-2" />
                <span>Upcoming Deadlines</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold rounded-full">
                {upcomingDeadlines.length} Imminent
              </span>
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">No imminent deadlines.</div>
              ) : (
                upcomingDeadlines.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActivePage(item.targetPage)}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-all border border-slate-200 dark:border-slate-800/60 flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          item.type === 'Project' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                        }`}>
                          {item.type}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.title}</h4>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-2">
                        <span>Due: {item.due}</span>
                        <span>•</span>
                        <span className={item.priority === 'High' ? 'text-red-500 font-semibold' : 'text-slate-400'}>{item.priority} Priority</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 hover:text-blue-500 flex-shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
          
          <button
            onClick={() => setActivePage('calendar')}
            className="w-full mt-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
          >
            <span>Open Workspace Calendar</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>

      {/* Bottom Grid: Key Projects Table + System Activity Log Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects Quick Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Active Client Projects
            </h3>
            <button
              onClick={() => setActivePage('projects')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center"
            >
              <span>View All Projects</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="pb-3">Project Code & Name</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Budget / Spent</th>
                  <th className="pb-3">Progress</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {projects.slice(0, 3).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                      <div>{p.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{p.code}</div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{p.clientName}</td>
                    <td className="py-3 font-mono text-slate-700 dark:text-slate-300">
                      ₹{p.spent.toLocaleString('en-IN')} / ₹{p.budget.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${p.completionPercent}%` }} />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{p.completionPercent}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        p.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-800' :
                        p.status === 'Testing' ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-800' :
                        'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time System Audit Feed */}
        <div className="glass-panel p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mr-2" />
              <span>Audit Trail Activity</span>
            </h3>
            <button
              onClick={() => setActivePage('activity')}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Logs
            </button>
          </div>

          <div className="space-y-3">
            {activityLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-semibold">
                  <span>{log.userName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{log.timestamp.split(' ')[1]}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{log.details}</p>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">{log.action}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
