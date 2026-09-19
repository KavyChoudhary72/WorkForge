import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Briefcase,
  CheckSquare,
  Users,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function CalendarPage() {
  const { projects, tasks } = useData();
  const [view, setView] = useState('Month'); // 'Month' | 'Week' | 'Day'
  const [selectedDay, setSelectedDay] = useState(15);

  // Month days array
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  // Map real projects and tasks into calendar events
  const projectEvents = projects.map((p, idx) => ({
    id: `p-${p.id || idx}`,
    title: `[Project Deadline] ${p.name}`,
    date: (idx * 6 + 4) % 30 + 1,
    time: '05:00 PM',
    type: 'deadline',
    entity: p.clientName || 'Key Account',
    color: 'bg-indigo-600 dark:bg-indigo-700'
  }));

  const taskEvents = tasks.map((t, idx) => ({
    id: `t-${t.id || idx}`,
    title: `[Task Due] ${t.title}`,
    date: (idx * 4 + 2) % 30 + 1,
    time: '11:00 AM',
    type: 'task',
    entity: t.assigneeName || 'Unassigned',
    color: 'bg-blue-600 dark:bg-blue-700'
  }));

  const standardMeetings = [
    { id: 'm-1', title: '[Meeting] Client Architecture Review Call', date: 8, time: '10:00 AM', type: 'meeting', entity: 'Google Meet', color: 'bg-emerald-600' },
    { id: 'm-2', title: '[Follow-up] Quarterly Financial Retrospective', date: 15, time: '02:30 PM', type: 'meeting', entity: 'Executive Board', color: 'bg-purple-600' },
    { id: 'm-3', title: '[Sprint Review] Engineering Demo & Sign-off', date: 22, time: '04:00 PM', type: 'meeting', entity: 'Dev Team', color: 'bg-amber-600' }
  ];

  const allEvents = [...projectEvents, ...taskEvents, ...standardMeetings];

  // Week days (Aug 10 - Aug 16)
  const weekDays = [
    { dayName: 'Mon', date: 10 },
    { dayName: 'Tue', date: 11 },
    { dayName: 'Wed', date: 12 },
    { dayName: 'Thu', date: 13 },
    { dayName: 'Fri', date: 14 },
    { dayName: 'Sat', date: 15 },
    { dayName: 'Sun', date: 16 }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <CalendarIcon className="w-4 h-4" />
            <span>Schedule & Deliverables</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Enterprise Calendar & Milestones
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track client deadlines, project milestones, sprint task due dates, and meetings across Month, Week, and Day views.
          </p>
        </div>

        {/* View Switcher: Month, Week, Day */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {['Month', 'Week', 'Day'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === v
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {v} View
            </button>
          ))}
        </div>
      </div>

      {/* Legend & Navigation Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-base text-slate-900 dark:text-slate-100">
            {view === 'Day' ? `August ${selectedDay}, 2026` : view === 'Week' ? 'Week of Aug 10 - Aug 16, 2026' : 'August 2026'}
          </span>
          <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mr-1.5" /> Project Deadlines</span>
          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-1.5" /> Task Due Dates</span>
          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mr-1.5" /> Client Meetings</span>
        </div>
      </div>

      {/* VIEW 1: MONTH VIEW */}
      {view === 'Month' && (
        <div className="glass-panel p-6 rounded-2xl overflow-x-auto">
          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="bg-slate-100 dark:bg-slate-950 p-2.5 font-bold text-center text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                {d}
              </div>
            ))}

            {daysInMonth.map(day => {
              const dayEvents = allEvents.filter(e => e.date === day);
              const isSelected = selectedDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`bg-white dark:bg-slate-900 min-h-[110px] p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex flex-col justify-between cursor-pointer ${
                    isSelected ? 'ring-2 ring-blue-500 inset-0' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${day === 15 ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center' : 'text-slate-700 dark:text-slate-300'}`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-semibold">{dayEvents.length} events</span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayEvents.slice(0, 2).map(e => (
                      <div key={e.id} className={`${e.color} text-white p-1 rounded text-[10px] truncate font-medium shadow-2xs`} title={e.title}>
                        {e.time} - {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-bold pl-1">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: WEEK VIEW */}
      {view === 'Week' && (
        <div className="glass-panel p-6 rounded-2xl overflow-x-auto">
          <div className="grid grid-cols-7 gap-3 min-w-[700px]">
            {weekDays.map(w => {
              const dayEvents = allEvents.filter(e => e.date === w.date);
              return (
                <div key={w.date} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col min-h-[400px]">
                  <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-500 uppercase">{w.dayName}</div>
                    <div className="text-lg font-black text-slate-900 dark:text-slate-100">{w.date}</div>
                  </div>

                  <div className="space-y-2 mt-3 flex-1 overflow-y-auto">
                    {dayEvents.length === 0 ? (
                      <div className="text-center text-[11px] text-slate-400 italic pt-8">No events scheduled</div>
                    ) : (
                      dayEvents.map(e => (
                        <div key={e.id} className={`${e.color} text-white p-2.5 rounded-xl text-xs space-y-1 shadow-sm`}>
                          <div className="font-bold leading-tight">{e.title}</div>
                          <div className="text-[10px] opacity-90">{e.time} • {e.entity}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: DAY VIEW */}
      {view === 'Day' && (
        <div className="glass-panel p-6 rounded-2xl max-w-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Daily Agenda for August {selectedDay}, 2026
              </h3>
              <p className="text-xs text-slate-500">Scheduled deliverables, deadlines, and conference calls.</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full font-bold text-xs">
              {allEvents.filter(e => e.date === selectedDay).length} Scheduled
            </span>
          </div>

          <div className="space-y-3">
            {allEvents.filter(e => e.date === selectedDay).length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs italic">
                No deadlines or meetings registered for August {selectedDay}. Click on Month view to select a different date.
              </div>
            ) : (
              allEvents.filter(e => e.date === selectedDay).map(e => (
                <div key={e.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded text-white ${e.color}`}>
                      {e.type}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{e.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{e.entity}</p>
                  </div>

                  <div className="flex items-center space-x-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>{e.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
