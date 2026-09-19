import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  User,
  X,
  ChevronRight,
  MoreHorizontal,
  Tag,
  Paperclip,
  Send
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from '../components/common/UserAvatar';

export default function TaskMgmtPage() {
  const { tasks, projects, teamMembers, addTask, updateTask, deleteTask } = useData();
  const { currentUser, apiFetch } = useAuth();
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');

  const columns = [
    { id: 'Todo', title: 'To Do', color: 'border-slate-500 text-slate-500' },
    { id: 'In Progress', title: 'In Progress', color: 'border-blue-500 text-blue-500' },
    { id: 'Review', title: 'In Review', color: 'border-amber-500 text-amber-500' },
    { id: 'Done', title: 'Completed', color: 'border-emerald-500 text-emerald-500' },
  ];

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          (t.assigneeName && t.assigneeName.toLowerCase().includes(search.toLowerCase())) ||
                          (t.labels && t.labels.some(l => l.toLowerCase().includes(search.toLowerCase())));
    const matchesProject = projectFilter === 'All' || t.projectId === projectFilter;
    return matchesSearch && matchesProject;
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: projects[0]?.id || '',
    assigneeId: teamMembers[0]?.id || '',
    dueDate: '2026-08-15',
    priority: 'High',
    estimatedHours: 16,
    checklistInput: 'Configure Auth logic, Run tests',
    labelsInput: 'Backend, Feature',
    attachmentName: ''
  });

  const handleCreateTask = (e) => {
    e.preventDefault();
    const project = projects.find(p => p.id === newTask.projectId);
    const assignee = teamMembers.find(m => m.id === newTask.assigneeId);

    const checklistItems = newTask.checklistInput
      .split(',')
      .map((item, idx) => ({ id: `c-${idx}`, text: item.trim(), completed: false }))
      .filter(i => i.text.length > 0);

    const labelsArray = newTask.labelsInput
      .split(',')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const attachmentsArray = newTask.attachmentName.trim() ? [
      {
        name: newTask.attachmentName.trim(),
        url: `https://vault.workforge.io/tasks/${encodeURIComponent(newTask.attachmentName.trim())}`,
        size: '150 KB',
        uploadedAt: new Date().toISOString()
      }
    ] : [];

    addTask({
      ...newTask,
      status: 'Todo',
      projectName: project ? project.name : 'General Project',
      assigneeName: assignee ? assignee.name : 'David Miller',
      assigneeAvatar: assignee ? (assignee.avatar || '') : '',
      checklist: checklistItems,
      labels: labelsArray,
      attachments: attachmentsArray,
      comments: [],
      aiRiskLevel: 'Low',
    });

    setShowAddModal(false);
    setNewTask({
      title: '',
      description: '',
      projectId: projects[0]?.id || '',
      assigneeId: teamMembers[0]?.id || '',
      dueDate: '2026-08-15',
      priority: 'High',
      estimatedHours: 16,
      checklistInput: 'Configure Auth logic, Run tests',
      labelsInput: 'Backend, Feature',
      attachmentName: ''
    });
  };

  const moveTaskStatus = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  const toggleChecklistItem = (task, itemIndex) => {
    const updatedChecklist = [...(task.checklist || [])];
    updatedChecklist[itemIndex].completed = !updatedChecklist[itemIndex].completed;
    updateTask(task.id, { checklist: updatedChecklist });
    if (selectedTask && selectedTask.id === task.id) {
      setSelectedTask({ ...selectedTask, checklist: updatedChecklist });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedTask) return;

    const newComment = {
      id: `comm-${Date.now()}`,
      userId: currentUser?.id || currentUser?._id,
      userName: currentUser?.name || 'Current User',
      text: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...(selectedTask.comments || []), newComment];
    updateTask(selectedTask.id, { comments: updatedComments });
    setSelectedTask({ ...selectedTask, comments: updatedComments });

    // Also notify backend
    try {
      if (apiFetch) {
        await apiFetch(`/tasks/${selectedTask.id}/comments`, {
          method: 'POST',
          body: JSON.stringify({ text: newCommentText.trim() })
        });
      }
    } catch (err) {
      // Handled gracefully in state
    }

    setNewCommentText('');
  };

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColId, setDragOverColId] = useState(null);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
    setDragOverColId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <CheckSquare className="w-4 h-4" />
            <span>Agile Sprint Execution</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Task Management & Kanban Board
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Drag & drop task cards across sprint columns, manage subtask checklists, labels, file attachments, and real-time comments.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Sprint Task</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
            placeholder="Search task title, label, or assignee..."
          />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Filter Project:</span>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
          >
            <option value="All">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Kanban Board 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id || (col.id === 'Todo' && t.status === 'To Do') || (col.id === 'Review' && t.status === 'In Review') || (col.id === 'Done' && t.status === 'Completed'));
          const isOver = dragOverColId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverColId(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-2xl p-4 border transition-all duration-200 flex flex-col min-h-[600px] ${
                isOver
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 border-dashed ring-2 ring-blue-500/20'
                  : 'bg-slate-100/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80'
              }`}
            >
              {/* Column Title */}
              <div className={`flex items-center justify-between pb-3 border-b-2 ${col.color} mb-3`}>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{col.title}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {colTasks.length}
                  </span>
                </div>
                {isOver && (
                  <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 animate-pulse uppercase tracking-wider">
                    Drop Here
                  </span>
                )}
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colTasks.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs italic border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No tasks in {col.title}
                  </div>
                ) : (
                  colTasks.map(t => {
                    const completedChecklist = t.checklist?.filter(i => i.completed).length || 0;
                    const totalChecklist = t.checklist?.length || 0;
                    const isDraggingThis = draggedTaskId === t.id;
                    const commentsCount = t.comments?.length || 0;
                    const attachmentsCount = t.attachments?.length || 0;

                    return (
                      <div
                        key={t.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onDragEnd={() => { setDraggedTaskId(null); setDragOverColId(null); }}
                        className={`bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/50 transition-all cursor-grab active:cursor-grabbing space-y-2.5 ${
                          isDraggingThis ? 'opacity-40 scale-95 border-blue-500' : ''
                        }`}
                        onClick={() => setSelectedTask(t)}
                      >
                        <div className="flex items-start justify-between">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                            t.priority === 'Urgent' ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400' :
                            t.priority === 'High' ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            {t.priority}
                          </span>

                          <span className="flex items-center space-x-1 text-[10px] text-indigo-500 font-semibold">
                            <Sparkles className="w-3 h-3" />
                            <span>Risk: {t.aiRiskLevel || 'Low'}</span>
                          </span>
                        </div>

                        {/* Labels Badges */}
                        {t.labels && t.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {t.labels.map((lbl, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 text-[9px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded">
                                #{lbl}
                              </span>
                            ))}
                          </div>
                        )}

                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-snug">{t.title}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {t.description}
                          </p>
                        </div>

                        {/* Checklist progress */}
                        {totalChecklist > 0 && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Subtasks: {completedChecklist}/{totalChecklist}</span>
                          </div>
                        )}

                        {/* Meta footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                          <div className="flex items-center space-x-1.5">
                            <UserAvatar name={t.assigneeName || 'Member'} src={t.assigneeAvatar || ''} size="xs" />
                            <span className="text-slate-600 dark:text-slate-400 text-[10px]">{t.assigneeName ? t.assigneeName.split(' ')[0] : 'Team'}</span>
                          </div>

                          <div className="flex items-center space-x-2 text-slate-400 text-[10px]">
                            {commentsCount > 0 && (
                              <span className="flex items-center space-x-0.5 text-blue-500">
                                <MessageSquare className="w-3 h-3" />
                                <span>{commentsCount}</span>
                              </span>
                            )}
                            {attachmentsCount > 0 && (
                              <span className="flex items-center space-x-0.5 text-slate-400">
                                <Paperclip className="w-3 h-3" />
                                <span>{attachmentsCount}</span>
                              </span>
                            )}
                            <span className="flex items-center space-x-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{t.estimatedHours || 8}h</span>
                            </span>
                          </div>
                        </div>

                        {/* Quick Move Buttons */}
                        <div className="pt-1 flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                          {col.id !== 'Todo' && (
                            <button
                              onClick={() => moveTaskStatus(t.id, col.id === 'In Progress' ? 'Todo' : col.id === 'Review' ? 'In Progress' : 'Review')}
                              className="px-1.5 py-0.5 text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 rounded hover:bg-slate-200"
                            >
                              ← Prev
                            </button>
                          )}
                          {col.id !== 'Done' && (
                            <button
                              onClick={() => moveTaskStatus(t.id, col.id === 'Todo' ? 'In Progress' : col.id === 'In Progress' ? 'Review' : 'Done')}
                              className="px-1.5 py-0.5 text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 font-semibold"
                            >
                              Next →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Details Drawer Modal with Comments & Attachments */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase font-bold">{selectedTask.id}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{selectedTask.title}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTask.labels?.map((l, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 text-[9px] font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-600 rounded">
                      #{l}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{selectedTask.description}</p>

            {/* Subtask Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Checklist Milestones</div>
              {selectedTask.checklist?.map((item, idx) => (
                <label key={item.id || idx} className="flex items-center space-x-2.5 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistItem(selectedTask, idx)}
                    className="rounded text-blue-600"
                  />
                  <span className={item.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>

            {/* Attachments Section */}
            {selectedTask.attachments && selectedTask.attachments.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center">
                  <Paperclip className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  <span>Attachments ({selectedTask.attachments.length})</span>
                </div>
                {selectedTask.attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{att.name}</span>
                    <span className="text-[10px] text-slate-400">{att.size || '150 KB'}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Comments Thread */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                <span>Task Discussion & Comments ({selectedTask.comments?.length || 0})</span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto p-1">
                {selectedTask.comments && selectedTask.comments.length > 0 ? (
                  selectedTask.comments.map((c, idx) => (
                    <div key={c.id || idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                        <span>{c.userName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{c.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-xs italic py-2">No comments yet. Start the conversation below.</div>
                )}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Post comment or milestone update..."
                  className="flex-1 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
                  title="Send Comment"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => { deleteTask(selectedTask.id); setSelectedTask(null); }}
                className="text-red-500 hover:underline font-semibold"
              >
                Delete Task
              </button>
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold"
              >
                Close Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Create Sprint Task</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="e.g. Write end-to-end integration tests"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Project</label>
                  <select
                    value={newTask.projectId}
                    onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assignee</label>
                  <select
                    value={newTask.assigneeId}
                    onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Est. Hours</label>
                  <input
                    type="number"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: +e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Labels (comma separated)</label>
                <input
                  type="text"
                  value={newTask.labelsInput}
                  onChange={(e) => setNewTask({ ...newTask, labelsInput: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="Backend, Feature, Urgent"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Attachment Name / File (Optional)</label>
                <input
                  type="text"
                  value={newTask.attachmentName}
                  onChange={(e) => setNewTask({ ...newTask, attachmentName: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="e.g. TestCoverageReport.pdf"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Checklist Milestones (comma separated)</label>
                <input
                  type="text"
                  value={newTask.checklistInput}
                  onChange={(e) => setNewTask({ ...newTask, checklistInput: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="Task item 1, Task item 2"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
