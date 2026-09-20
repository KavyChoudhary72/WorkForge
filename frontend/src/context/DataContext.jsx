import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  MOCK_ORGANIZATIONS,
  MOCK_CLIENTS,
  MOCK_PROJECTS,
  MOCK_TASKS,
  MOCK_INVOICES,
  MOCK_TIME_LOGS,
  MOCK_FILES,
  MOCK_NOTIFICATIONS,
  MOCK_ACTIVITY_LOGS,
  MOCK_USERS
} from '../data/mockData';
import { formatINR } from '../utils/formatters';

const DataContext = createContext();

export function DataProvider({ children }) {
  const { currentUser, apiFetch } = useAuth();

  // Bulletproof LocalStorage setter with QuotaExceeded protection
  const safeSetStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[Storage Quota Warning] Could not cache '${key}' to localStorage:`, err.message);
      if (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014) {
        try {
          // Free up space by purging heavy/non-essential caches
          localStorage.removeItem('nexus_files');
          localStorage.removeItem('nexus_activity');
          localStorage.removeItem('nexus_timelogs');
          // Try once more for lightweight essential data
          if (key !== 'nexus_files' && key !== 'nexus_activity') {
            localStorage.setItem(key, JSON.stringify(value));
          }
        } catch {
          // Silently ignore; data remains safely in React memory
        }
      }
    }
  };

  // Helper to purge legacy dummy data from local storage
  const getCleanStorage = (key, fallback) => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return fallback;
      // Auto-purge oversized entries (e.g. legacy files or base64 blobs > 300KB)
      if (saved.length > 300000) {
        localStorage.removeItem(key);
        return fallback;
      }
      const parsed = JSON.parse(saved);
      const hasLegacyDummy = JSON.stringify(parsed).includes('org-1') || JSON.stringify(parsed).includes('Acme Global') || JSON.stringify(parsed).includes('PRJ-APX');
      if (hasLegacyDummy) {
        localStorage.removeItem(key);
        return fallback;
      }
      return parsed;
    } catch (e) {
      return fallback;
    }
  };

  // Master Collections
  const [organizations, setOrganizations] = useState(() => getCleanStorage('nexus_organizations', MOCK_ORGANIZATIONS));
  const [clients, setClients] = useState(() => getCleanStorage('nexus_clients', MOCK_CLIENTS));
  const [projects, setProjects] = useState(() => getCleanStorage('nexus_projects', MOCK_PROJECTS));
  const [tasks, setTasks] = useState(() => getCleanStorage('nexus_tasks', MOCK_TASKS));
  const [invoices, setInvoices] = useState(() => getCleanStorage('nexus_invoices', MOCK_INVOICES));
  const [timeLogs, setTimeLogs] = useState(() => getCleanStorage('nexus_timelogs', MOCK_TIME_LOGS));
  const [files, setFiles] = useState(() => getCleanStorage('nexus_files', MOCK_FILES));
  const [notifications, setNotifications] = useState(() => getCleanStorage('nexus_notifications', MOCK_NOTIFICATIONS));
  const [activityLogs, setActivityLogs] = useState(() => getCleanStorage('nexus_activity', MOCK_ACTIVITY_LOGS));
  const [teamMembers, setTeamMembers] = useState(() => getCleanStorage('nexus_team', MOCK_USERS));

  // Proactively purge oversized legacy cache entries on mount
  useEffect(() => {
    try {
      ['nexus_files', 'nexus_activity', 'nexus_timelogs'].forEach(key => {
        const item = localStorage.getItem(key);
        if (item && (item.length > 250000 || item.includes('data:image'))) {
          localStorage.removeItem(key);
        }
      });
    } catch {}
  }, []);

  // Fetch real database records concurrently in parallel with fast-fail fallback
  const fetchBackendData = async () => {
    try {
      if (!apiFetch) return;

      const endpoints = [
        apiFetch('/clients'),
        apiFetch('/projects'),
        apiFetch('/tasks'),
        apiFetch('/invoices'),
        apiFetch('/timelogs'),
        apiFetch('/files'),
        apiFetch('/notifications'),
        apiFetch('/users'),
        apiFetch('/activity'),
        currentUser?.role === 'SUPER_ADMIN' ? apiFetch('/admin/organizations') : Promise.resolve({ res: { ok: false } })
      ];

      const results = await Promise.allSettled(endpoints);
      const [resCli, resProj, resTsk, resInv, resTime, resFile, resNotif, resUser, resAct, resOrg] = results.map(r => 
        r.status === 'fulfilled' ? r.value : { res: { ok: false }, data: null }
      );

      // 1. Clients
      if (resCli.res?.ok && Array.isArray(resCli.data)) {
        setClients(resCli.data.map(c => ({ ...c, id: c._id || c.id })));
      }

      // 2. Projects
      if (resProj.res?.ok && Array.isArray(resProj.data)) {
        setProjects(resProj.data.map(p => ({
          ...p,
          id: p._id || p.id,
          clientName: p.clientId?.name || p.clientName || 'Key Account'
        })));
      }

      // 3. Tasks
      if (resTsk.res?.ok && Array.isArray(resTsk.data)) {
        setTasks(resTsk.data.map(t => ({
          ...t,
          id: t._id || t.id,
          projectName: t.projectId?.name || t.projectName || 'Active Project',
          assignedName: t.assignedTo?.name || 'Unassigned'
        })));
      }

      // 4. Invoices
      if (resInv.res?.ok && Array.isArray(resInv.data)) {
        setInvoices(resInv.data.map(i => ({
          ...i,
          id: i._id || i.id,
          clientName: i.clientId?.name || i.clientName || 'Key Account',
          projectName: i.projectId?.name || i.projectName || 'General Work',
          lineItems: (i.items || i.lineItems || []).map(item => ({
            ...item,
            quantity: item.hours || item.quantity || 1
          }))
        })));
      }

      // 5. TimeLogs
      if (resTime.res?.ok && Array.isArray(resTime.data)) {
        setTimeLogs(resTime.data.map(t => ({ ...t, id: t._id || t.id })));
      }

      // 6. Files
      if (resFile.res?.ok && Array.isArray(resFile.data)) {
        setFiles(resFile.data.map(f => ({ ...f, id: f._id || f.id })));
      }

      // 7. Notifications
      if (resNotif.res?.ok && Array.isArray(resNotif.data)) {
        setNotifications(resNotif.data.map(n => ({ ...n, id: n._id || n.id })));
      }

      // 8. Users
      if (resUser.res?.ok && Array.isArray(resUser.data)) {
        setTeamMembers(resUser.data.map(u => ({ ...u, id: u._id || u.id })));
      }

      // 9. Activity Logs
      if (resAct.res?.ok && Array.isArray(resAct.data)) {
        setActivityLogs(resAct.data.map(a => {
          const rawDate = a.createdAt ? new Date(a.createdAt) : new Date();
          const isoStr = rawDate.toISOString(); 
          const datePart = isoStr.split('T')[0];
          const timePart = isoStr.split('T')[1].split('.')[0];
          return {
            ...a,
            id: a._id || a.id,
            timestamp: `${datePart} ${timePart}`,
            userName: a.userId?.name || a.userEmail || 'System Process',
            userRole: a.userId?.role || 'System'
          };
        }));
      }

      // 10. Organizations (Super Admin only)
      if (resOrg.res?.ok && Array.isArray(resOrg.data)) {
        setOrganizations(resOrg.data.map(o => ({ ...o, id: o._id || o.id })));
      }
    } catch (err) {
      console.warn('[DataContext Warning] Preserving local cache fallback:', err.message);
    }
  };

  // Sync data whenever user logs in or refreshes token
  useEffect(() => {
    if (currentUser && apiFetch) {
      fetchBackendData();
    }
  }, [currentUser, apiFetch]);

  // Active Timer Widget State
  const [activeTimer, setActiveTimer] = useState({
    isRunning: false,
    seconds: 0,
    projectId: 'prj-1',
    projectName: 'Q4 Omnichannel Retail Expansion Strategy',
    taskTitle: 'Vendor Contract & SLA Audit',
  });

  // Timer Tick Effect
  useEffect(() => {
    let interval = null;
    if (activeTimer.isRunning) {
      interval = setInterval(() => {
        setActiveTimer(prev => ({ ...prev, seconds: prev.seconds + 1 }));
      }, 1000);
    } else if (!activeTimer.isRunning && activeTimer.seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeTimer.isRunning]);

  // Timer actions
  const startTimer = (projectId, taskTitle) => {
    const targetProject = projects.find(p => p.id === projectId);
    setActiveTimer({
      isRunning: true,
      seconds: 0,
      projectId: projectId || 'prj-1',
      projectName: targetProject ? targetProject.name : 'General Task',
      taskTitle: taskTitle || 'Active Working Session',
    });
  };

  const pauseTimer = () => {
    setActiveTimer(prev => ({ ...prev, isRunning: false }));
  };

  const resumeTimer = () => {
    setActiveTimer(prev => ({ ...prev, isRunning: true }));
  };

  const stopTimerAndSave = async (userName = 'Current User') => {
    if (activeTimer.seconds > 0) {
      const hours = +(activeTimer.seconds / 3600).toFixed(2);
      const newLog = {
        projectId: activeTimer.projectId.startsWith('prj-') ? undefined : activeTimer.projectId,
        projectName: activeTimer.projectName,
        taskTitle: activeTimer.taskTitle,
        durationSeconds: activeTimer.seconds,
        hours: Math.max(hours, 0.1),
        date: new Date().toISOString(),
        billable: true,
        description: `Logged via active workspace timer (${Math.floor(activeTimer.seconds / 60)} min session).`,
      };

      try {
        const { res, data } = await apiFetch('/timelogs', {
          method: 'POST',
          body: JSON.stringify(newLog)
        });
        if (res.ok) {
          const savedLog = { ...data, id: data._id || data.id };
          setTimeLogs(prev => [savedLog, ...prev]);
          addActivityLog(currentUser?.name || userName, currentUser?.role || 'Employee', 'LOG_TIME', `Logged ${hours} hours on ${activeTimer.projectName}`);
        }
      } catch (e) {
        const fallbackLog = {
          ...newLog,
          id: `log-${Date.now()}`,
          orgId: 'org-1',
          userId: 'usr-emp1',
          userName,
          hours: Math.max(hours, 0.1),
          date: new Date().toISOString().split('T')[0],
        };
        setTimeLogs(prev => [fallbackLog, ...prev]);
      }
    }
    setActiveTimer({ isRunning: false, seconds: 0, projectId: '', projectName: '', taskTitle: '' });
  };

  // Activity Log Creator Helper
  const addActivityLog = async (userName, userRole, action, details) => {
    const newLog = {
      id: `act-${Date.now()}`,
      orgId: 'org-1',
      userName,
      userRole,
      action,
      details,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Toast Notification Helper
  const addNotification = (title, message, type = 'info', link = '#') => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      orgId: 'org-1',
      title,
      message,
      timestamp: 'Just now',
      type,
      read: false,
      link,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Save to localStorage (Local fallback cache with Quota Safety)
  useEffect(() => {
    safeSetStorage('nexus_organizations', organizations);
  }, [organizations]);

  useEffect(() => {
    safeSetStorage('nexus_clients', clients);
  }, [clients]);

  useEffect(() => {
    safeSetStorage('nexus_projects', projects);
  }, [projects]);

  useEffect(() => {
    safeSetStorage('nexus_tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    safeSetStorage('nexus_invoices', invoices);
  }, [invoices]);

  useEffect(() => {
    safeSetStorage('nexus_timelogs', timeLogs);
  }, [timeLogs]);

  useEffect(() => {
    // Only store lightweight file metadata in localStorage (never large base64 data)
    const lightweightFiles = (files || []).map(f => ({
      id: f.id || f._id,
      name: f.name,
      formattedSize: f.formattedSize,
      sizeBytes: f.sizeBytes,
      type: f.type,
      category: f.category,
      folder: f.folder,
      url: f.url?.startsWith('data:') ? '' : f.url
    }));
    safeSetStorage('nexus_files', lightweightFiles);
  }, [files]);

  useEffect(() => {
    safeSetStorage('nexus_notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    // Only store the latest 30 audit logs to conserve storage quota
    safeSetStorage('nexus_activity', (activityLogs || []).slice(0, 30));
  }, [activityLogs]);

  // CRUD Handlers
  const addClient = async (clientData) => {
    try {
      const { res, data } = await apiFetch('/clients', {
        method: 'POST',
        body: JSON.stringify(clientData)
      });
      if (res.ok) {
        const savedClient = { ...data, id: data._id || data.id };
        setClients(prev => [savedClient, ...prev]);
        addActivityLog(currentUser?.name || 'System User', currentUser?.role || 'Admin', 'CREATE_CLIENT', `Created new client: ${clientData.name}`);
        addNotification('Client Added', `New client "${clientData.name}" was onboarded successfully.`, 'success');
      }
    } catch (e) {
      const newClient = { ...clientData, id: `cli-${Date.now()}`, totalBilled: 0, activeProjectsCount: 0 };
      setClients(prev => [newClient, ...prev]);
    }
  };

  const updateClient = async (id, updatedData) => {
    try {
      const { res, data } = await apiFetch(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...data, id: data._id || data.id || id } : c));
      }
    } catch (e) {
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
    }
  };

  const addProject = async (projectData) => {
    try {
      const { res, data } = await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
      });
      if (res.ok) {
        const client = clients.find(c => c.id === projectData.clientId);
        const savedProject = {
          ...data,
          id: data._id || data.id,
          clientName: client ? client.name : 'Enterprise Client'
        };
        setProjects(prev => [savedProject, ...prev]);
        addActivityLog(currentUser?.name || 'System User', currentUser?.role || 'Project Manager', 'CREATE_PROJECT', `Created project: ${projectData.name}`);
        addNotification('Project Created', `Project "${projectData.name}" has been launched.`, 'info');
      }
    } catch (e) {
      const newProject = {
        ...projectData,
        id: `prj-${Date.now()}`,
        spent: 0,
        completionPercent: 0,
        aiHealthScore: 85,
        aiHealthFactors: ['New project initialized', 'Scope baseline established'],
        attachmentsCount: 0,
      };
      setProjects(prev => [newProject, ...prev]);
    }
  };

  const updateProject = async (id, updatedData) => {
    try {
      const { res, data } = await apiFetch(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data, id: data._id || data.id || id } : p));
      }
    } catch (e) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    }
  };

  const addTask = async (taskData) => {
    try {
      const { res, data } = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        const savedTask = { ...data, id: data._id || data.id };
        setTasks(prev => [savedTask, ...prev]);
        addActivityLog(currentUser?.name || 'System User', currentUser?.role || 'Project Manager', 'CREATE_TASK', `Created task: ${taskData.title}`);
        addNotification('Task Assigned', `New task "${taskData.title}" was created.`, 'info');
      }
    } catch (e) {
      const newTask = {
        ...taskData,
        id: `tsk-${Date.now()}`,
        loggedHours: 0,
        commentsCount: 0,
        checklist: taskData.checklist || [],
        aiRiskLevel: taskData.aiRiskLevel || 'Low',
      };
      setTasks(prev => [newTask, ...prev]);
    }
  };

  const updateTask = async (id, updatedData) => {
    try {
      const { res, data } = await apiFetch(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data, id: data._id || data.id || id } : t));
      }
    } catch (e) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
    }
  };

  const deleteTask = async (id) => {
    try {
      const { res } = await apiFetch(`/tasks/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== id));
      }
    } catch (e) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const addInvoice = async (invoiceData) => {
    try {
      const { res, data } = await apiFetch('/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData)
      });
      if (res.ok) {
        const client = clients.find(c => c.id === invoiceData.clientId);
        const savedInvoice = {
          ...data,
          id: data._id || data.id,
          clientName: client ? client.name : 'Client Entity',
          projectName: invoiceData.projectName || 'General Work',
          lineItems: (data.items || data.lineItems || []).map(item => ({
            ...item,
            quantity: item.hours || item.quantity || 1
          }))
        };
        setInvoices(prev => [savedInvoice, ...prev]);
        addActivityLog(currentUser?.name || 'System User', currentUser?.role || 'Company Admin', 'CREATE_INVOICE', `Created Invoice #${savedInvoice.id}`);
        addNotification('Invoice Created', `Invoice #${savedInvoice.id} generated successfully.`, 'success');
      }
    } catch (e) {
      const newInvoice = {
        ...invoiceData,
        id: `inv-2026-0${invoices.length + 1}`,
        paidAt: invoiceData.status === 'Paid' ? new Date().toISOString().split('T')[0] : null,
      };
      setInvoices(prev => [newInvoice, ...prev]);
    }
  };

  const updateInvoiceStatus = async (id, newStatus) => {
    try {
      const { res, data } = await apiFetch(`/invoices/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setInvoices(prev => prev.map(inv => {
          if (inv.id === id) {
            return {
              ...inv,
              ...data,
              id: data._id || data.id || id
            };
          }
          return inv;
        }));
        addActivityLog(currentUser?.name || 'System User', 'Finance', 'UPDATE_INVOICE', `Updated Invoice #${id} status to ${newStatus}`);
      }
    } catch (e) {
      setInvoices(prev => prev.map(inv => {
        if (inv.id === id) {
          const isPaid = newStatus === 'Paid';
          return {
            ...inv,
            status: newStatus,
            paidAt: isPaid ? new Date().toISOString().split('T')[0] : inv.paidAt
          };
        }
        return inv;
      }));
    }
  };

  const addFile = async (fileData) => {
    try {
      const { res, data } = await apiFetch('/files', {
        method: 'POST',
        body: JSON.stringify(fileData)
      });
      if (res.ok) {
        const savedFile = { ...data, id: data._id || data.id };
        setFiles(prev => [savedFile, ...prev]);
        addActivityLog(currentUser?.name || 'System User', currentUser?.role || 'Employee', 'FILE_UPLOAD', `Uploaded file: ${fileData.name}`);
      } else {
        throw new Error(data?.message || 'Server error uploading file');
      }
    } catch (e) {
      const newFile = {
        ...fileData,
        id: `fl-${Date.now()}`,
        uploadedAt: new Date().toISOString().split('T')[0],
        version: 'v1.0',
      };
      setFiles(prev => [newFile, ...prev]);
    }
  };

  const deleteFile = async (id) => {
    try {
      const { res } = await apiFetch(`/files/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setFiles(prev => prev.filter(f => f.id !== id));
        addNotification('File Removed', 'Document was deleted from vault.', 'info');
      }
    } catch (e) {
      setFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  const markNotificationRead = async (id) => {
    try {
      const { res } = await apiFetch(`/notifications/${id}/read`, {
        method: 'PUT'
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (e) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const value = {
    organizations,
    clients,
    projects,
    tasks,
    invoices,
    timeLogs,
    files,
    notifications,
    activityLogs,
    teamMembers,
    activeTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimerAndSave,
    addClient,
    updateClient,
    addProject,
    updateProject,
    addTask,
    updateTask,
    deleteTask,
    addInvoice,
    updateInvoiceStatus,
    addFile,
    deleteFile,
    markNotificationRead,
    formatINR,
    addActivityLog,
    addNotification,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
