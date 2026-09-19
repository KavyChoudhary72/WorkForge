import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Mail,
  Shield,
  Briefcase,
  CheckCircle,
  Clock,
  X,
  Camera,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Tag,
  Award,
  FileText
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from '../components/common/UserAvatar';

export default function TeamMgmtPage() {
  const { teamMembers = [], addNotification, formatINR } = useData();
  const { apiFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'attendance' | 'leaves'
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedPerformanceEmployee, setSelectedPerformanceEmployee] = useState(null);

  // Clock-in State for Attendance
  const [clockedIn, setClockedIn] = useState(true);
  const [clockInTime, setClockInTime] = useState('09:30 AM');

  // Attendance Records State
  const [attendanceList, setAttendanceList] = useState([
    { id: 'att-1', name: 'Sarah Chen', department: 'Executive Management', clockIn: '09:15 AM', clockOut: '06:30 PM', status: 'Present', hours: 9.25 },
    { id: 'att-2', name: 'David Miller', department: 'Operations', clockIn: '09:45 AM', clockOut: '06:45 PM', status: 'Late', hours: 9.0 },
    { id: 'att-3', name: 'Ananya Sharma', department: 'Client Deliverables', clockIn: '09:20 AM', clockOut: '06:15 PM', status: 'Present', hours: 8.9 },
    { id: 'att-4', name: 'Rahul Verma', department: 'Financial Operations', clockIn: '-', clockOut: '-', status: 'On Leave', hours: 0 },
    { id: 'att-5', name: 'Priya Patel', department: 'Product & Design', clockIn: '09:05 AM', clockOut: '06:00 PM', status: 'Present', hours: 8.95 }
  ]);

  // Leave Requests State
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 'lve-101', name: 'Rahul Verma', type: 'Casual Leave', dates: '2026-08-14 to 2026-08-16', days: 3, reason: 'Family Function in Jaipur', status: 'Approved' },
    { id: 'lve-102', name: 'Ananya Sharma', type: 'Sick Leave', dates: '2026-08-20', days: 1, reason: 'Medical Appointment', status: 'Pending' },
    { id: 'lve-103', name: 'David Miller', type: 'Earned Leave', dates: '2026-09-01 to 2026-09-05', days: 5, reason: 'Annual Vacation', status: 'Approved' }
  ]);

  // Fetch real leaves from backend if available
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        if (apiFetch) {
          const { res, data } = await apiFetch('/leaves');
          if (res.ok && Array.isArray(data) && data.length > 0) {
            setLeaveRequests(data.map(l => ({
              id: l._id || l.id,
              name: l.name || (l.userId?.name) || 'Employee',
              type: l.type,
              dates: `${new Date(l.startDate).toLocaleDateString()} to ${new Date(l.endDate).toLocaleDateString()}`,
              days: l.days,
              reason: l.reason,
              status: l.status
            })));
          }
        }
      } catch (err) {
        // Fallback to local state
      }
    };
    fetchLeaves();
  }, [apiFetch]);

  const [newLeave, setNewLeave] = useState({
    name: 'Current Employee',
    type: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    title: 'Senior Operations Associate',
    department: 'Operations',
    role: 'EMPLOYEE',
    salaryLPA: '12.5 LPA',
    joiningDate: new Date().toISOString().split('T')[0],
    skills: 'React, Node.js, Cloud',
    avatar: ''
  });

  const departments = ['All', 'Executive Management', 'Operations', 'Client Deliverables', 'Financial Operations', 'Product & Design'];

  const filteredMembers = teamMembers.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                          m.email.toLowerCase().includes(search.toLowerCase()) ||
                          (m.title && m.title.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = deptFilter === 'All' || m.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleToggleClock = () => {
    if (clockedIn) {
      setClockedIn(false);
      addNotification('Clocked Out', 'Your work shift has been logged successfully.', 'info');
    } else {
      setClockedIn(true);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setClockInTime(timeStr);
      addNotification('Clocked In', `Attendance marked Present at ${timeStr}.`, 'success');
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!newLeave.startDate || !newLeave.endDate) return;

    const req = {
      id: `lve-${Date.now()}`,
      name: newLeave.name,
      type: newLeave.type,
      dates: `${newLeave.startDate} to ${newLeave.endDate}`,
      days: 2,
      reason: newLeave.reason || 'Personal Leave',
      status: 'Pending'
    };

    setLeaveRequests([req, ...leaveRequests]);

    try {
      if (apiFetch) {
        await apiFetch('/leaves', {
          method: 'POST',
          body: JSON.stringify({
            type: newLeave.type,
            startDate: newLeave.startDate,
            endDate: newLeave.endDate,
            reason: newLeave.reason
          })
        });
      }
    } catch (err) {
      // Saved in state
    }

    addNotification('Leave Requested', 'Your leave application has been submitted to HR.', 'success');
    setShowLeaveModal(false);
  };

  const updateLeaveStatus = async (id, status) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    try {
      if (apiFetch) {
        await apiFetch(`/leaves/${id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status })
        });
      }
    } catch (err) {
      // Handled in state
    }
    addNotification('Leave Status Updated', `Leave request #${id} marked as ${status}.`, 'info');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Clock-in Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>Human Resources & Attendance Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Team Directory & HR Portal
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Manage employee competencies, attendance time clocks, leave approvals, and quarterly performance reviews.
          </p>
        </div>

        {/* Quick Shift Clock-In Widget */}
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-right px-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Today's Shift</div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
              {clockedIn ? `In at ${clockInTime}` : 'Shift Ended'}
            </div>
          </div>
          <button
            onClick={handleToggleClock}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              clockedIn
                ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {clockedIn ? 'Clock Out' : 'Clock In Now'}
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'directory'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Team Directory ({filteredMembers.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Daily Attendance Tracker
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'leaves'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Leave Applications ({leaveRequests.filter(l => l.status === 'Pending').length} Pending)
        </button>
      </div>

      {/* TAB 1: TEAM DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-transparent focus:border-blue-500 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                placeholder="Search employee name, title, or email..."
              />
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-bold"
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => {
              const defaultSkills = ['Full Stack', 'Node.js', 'System Architecture', 'Agile'];
              const memberSkills = member.skills || defaultSkills;

              return (
                <div
                  key={member.id || member.email}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start space-x-4">
                      <UserAvatar name={member.name} src={member.avatar} size="lg" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">{member.name}</h3>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate">{member.title || 'Operations Lead'}</p>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mt-0.5">{member.department}</span>
                      </div>
                    </div>

                    {/* Skills Badges */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {memberSkills.map((sk, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          {sk}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-1.5 text-xs pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center text-slate-600 dark:text-slate-400">
                        <Mail className="w-3.5 h-3.5 mr-2 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] pt-1">
                        <span className="text-slate-500 dark:text-slate-400">Salary CTC:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{member.salaryLPA || '₹14.5 LPA'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">Privilege Role:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{member.role || 'EMPLOYEE'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setSelectedPerformanceEmployee(member)}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>Performance Notes & Reviews</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE TRACKER */}
      {activeTab === 'attendance' && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Shift Attendance Logs</h3>
              <p className="text-xs text-slate-500">Real-time check-in timestamps and workday durations.</p>
            </div>
            <span className="px-3 py-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
              4 / 5 Present Today
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Clock In</th>
                  <th className="pb-3">Clock Out</th>
                  <th className="pb-3">Total Shift</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {attendanceList.map(item => (
                  <tr key={item.id}>
                    <td className="py-3 font-bold text-slate-900 dark:text-slate-100">{item.name}</td>
                    <td className="py-3 text-slate-500">{item.department}</td>
                    <td className="py-3 font-mono">{item.clockIn}</td>
                    <td className="py-3 font-mono">{item.clockOut}</td>
                    <td className="py-3 font-mono font-bold">{item.hours > 0 ? `${item.hours} hrs` : '-'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'Present' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                        item.status === 'Late' ? 'bg-amber-100 dark:bg-amber-950 text-amber-600' : 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LEAVE APPLICATIONS */}
      {activeTab === 'leaves' && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Leave Requests & Absence Approvals</h3>
              <p className="text-xs text-slate-500">Review pending paid time off, casual leaves, and medical leaves.</p>
            </div>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          </div>

          <div className="space-y-3">
            {leaveRequests.map(l => (
              <div key={l.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{l.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600">
                      {l.type}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 font-mono">({l.days} days)</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Dates: {l.dates}</div>
                  <p className="text-slate-500 text-[11px] italic">Reason: "{l.reason}"</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    l.status === 'Approved' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                    l.status === 'Rejected' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' :
                    'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}>
                    {l.status}
                  </span>

                  {l.status === 'Pending' && (
                    <div className="flex items-center space-x-1.5 ml-2">
                      <button
                        onClick={() => updateLeaveStatus(l.id, 'Approved')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateLeaveStatus(l.id, 'Rejected')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-xs"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Notes Modal */}
      {selectedPerformanceEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <UserAvatar name={selectedPerformanceEmployee.name} src={selectedPerformanceEmployee.avatar} size="md" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedPerformanceEmployee.name}</h3>
                  <div className="text-xs text-blue-600 font-bold">{selectedPerformanceEmployee.title || 'Team Member'}</div>
                </div>
              </div>
              <button onClick={() => setSelectedPerformanceEmployee(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Q2 Performance Assessment: Exceptional</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Demonstrated outstanding milestone delivery velocity during the legacy migration sprint. Maintained 96.5% billable hour accuracy.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800 dark:text-slate-200">Manager Performance Notes</label>
                <textarea
                  rows={3}
                  defaultValue="Promoted to sprint lead. Recommended for leadership training and quarterly performance retention bonus."
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setSelectedPerformanceEmployee(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Close Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Submit Leave Application</h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Leave Category</label>
                <select
                  value={newLeave.type}
                  onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                >
                  <option value="Casual Leave">Casual Leave (Paid)</option>
                  <option value="Sick Leave">Sick / Medical Leave</option>
                  <option value="Earned Leave">Earned / Annual Vacation</option>
                  <option value="Other">Other Emergency Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Reason for Absence</label>
                <textarea
                  rows={2}
                  required
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                  placeholder="Medical reason, personal function, family emergency..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:underline font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-600/20"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
