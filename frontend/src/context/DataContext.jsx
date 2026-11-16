import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
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
  const getCleanStorage = (key, fallback = []) => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return fallback;
      // Auto-purge oversized entries (e.g. legacy files or base64 blobs > 300KB)
      if (saved.length > 300000) {
        localStorage.removeItem(key);
        return fallback;
      }
      const parsed = JSON.parse(saved);
      const str = JSON.stringify(parsed);
      const hasLegacyDummy = str.includes('org-1') || str.includes('Acme') || str.includes('PRJ-APX') || str.includes('Sarah Connor') || str.includes('Alex Morgan') || str.includes('Omnichannel');
      if (hasLegacyDummy) {
        localStorage.removeItem(key);
        return fallback;
      }
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  };

  // Master Collections - Exclusively sourced from Live MongoDB Backend API
  const [organizations, setOrganizations] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [files, setFiles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState(null);
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  // Proactively purge any remaining localStorage database cache
  useEffect(() => {
    try {
      [
        'nexus_organizations', 'nexus_clients', 'nexus_projects', 
        'nexus_tasks', 'nexus_invoices', 'nexus_timelogs', 
        'nexus_files', 'nexus_notifications', 'nexus_activity', 'nexus_team'
      ].forEach(key => localStorage.removeItem(key));
    } catch {}
  }, []);

  // Fetch real database records concurrently in parallel with fast-fail fallback
  const fetchBackendData = async () => {
    try {
      if (!apiFetch) return;
      setDataLoading(true);

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
          clientName: p.clientId?.name || p.clientName || 'Client'
        })));
      }

      // 3. Tasks
      if (resTsk.res?.ok && Array.isArray(resTsk.data)) {
        setTasks(resTsk.data.map(t => ({
          ...t,
          id: t._id || t.id,
          projectName: t.projectId?.name || t.projectName || 'Project',
          assignedName: t.assignedTo?.name || 'Unassigned'
        })));
      }

      // 4. Invoices
      if (resInv.res?.ok && Array.isArray(resInv.data)) {
        setInvoices(resInv.data.map(i => ({
          ...i,
          id: i._id || i.id,
          clientName: i.clientId?.name || i.clientName || 'Client',
          projectName: i.projectId?.name || i.projectName || 'Project',
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

      setLastSynced(new Date());
    } catch (err) {
      console.warn('[DataContext Warning] Preserving local cache fallback:', err.message);
    } finally {
      setDataLoading(false);
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
    projectId: '',
    projectName: '',
    taskTitle: '',
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
      projectId: projectId || '',
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

  // Add Manual Time Log Entry
  const addTimeLog = async (logData) => {
    try {
      if (apiFetch) {
        const { res, data } = await apiFetch('/timelogs', {
          method: 'POST',
          body: JSON.stringify(logData)
        });
        if (res.ok && data) {
          const saved = { ...data, id: data._id || data.id };
          setTimeLogs(prev => [saved, ...prev]);
          addActivityLog(currentUser?.name || 'User', currentUser?.role || 'Employee', 'LOG_TIME', `Logged ${logData.hours} hours on ${logData.projectName || 'Project'}`);
          return saved;
        }
      }
    } catch (e) {
      console.warn('API time log failed, applying local fallback:', e);
    }
    const fallback = {
      id: `log-${Date.now()}`,
      orgId: currentUser?.organizationId || 'org-1',
      userId: currentUser?.id || 'usr-1',
      userName: currentUser?.name || 'User',
      ...logData
    };
    setTimeLogs(prev => [fallback, ...prev]);
    return fallback;
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

  // CRUD Handlers
  const addClient = async (clientData) => {
    setDataLoading(true);
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
        return { success: true, client: savedClient };
      } else {
        const errMsg = data?.message || 'Server error adding client';
        addNotification('Failed to Add Client', errMsg, 'error');
        return { success: false, error: errMsg };
      }
    } catch (e) {
      console.error('[addClient] Error:', e.message);
      addNotification('Connection Error', 'Could not reach server', 'error');
      return { success: false, error: e.message };
    } finally {
      setDataLoading(false);
    }
  };

  const updateClient = async (id, updatedData) => {
    setDataLoading(true);
    try {
      const { res, data } = await apiFetch(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...data, id: data._id || data.id || id } : c));
        return { success: true, client: data };
      } else {
        return { success: false, error: data?.message };
      }
    } catch (e) {
      console.error('[updateClient] Error:', e.message);
      return { success: false, error: e.message };
    } finally {
      setDataLoading(false);
    }
  };

  const toggleArchiveClient = async (id) => {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    const isCurrentlyArchived = client.status === 'Archived' || client.isArchived;
    const newStatus = isCurrentlyArchived ? 'Active' : 'Archived';
    await updateClient(id, { status: newStatus, isArchived: !isCurrentlyArchived });
    addNotification('Client Status Updated', `${client.name} marked as ${newStatus}.`, 'info');
  };

  const addProject = async (projectData) => {
    setDataLoading(true);
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
        return { success: true, project: savedProject };
      } else {
        const errMsg = data?.message || 'Server error creating project';
        addNotification('Failed to Create Project', errMsg, 'error');
        return { success: false, error: errMsg };
      }
    } catch (e) {
      console.error('[addProject] Error:', e.message);
      addNotification('Connection Error', 'Could not reach server', 'error');
      return { success: false, error: e.message };
    } finally {
      setDataLoading(false);
    }
  };

  const updateProject = async (id, updatedData) => {
    setDataLoading(true);
    try {
      const { res, data } = await apiFetch(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data, id: data._id || data.id || id } : p));
        return { success: true, project: data };
      } else {
        return { success: false, error: data?.message };
      }
    } catch (e) {
      console.error('[updateProject] Error:', e.message);
      return { success: false, error: e.message };
    } finally {
      setDataLoading(false);
    }
  };

  const addTask = async (taskData) => {
    setDataLoading(true);
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
        return { success: true, task: savedTask };
      } else {
        const errMsg = data?.message || 'Server error creating task';
        addNotification('Failed to Create Task', errMsg, 'error');
        return { success: false, error: errMsg };
      }
    } catch (e) {
      console.error('[addTask] Error:', e.message);
      addNotification('Connection Error', 'Could not reach server', 'error');
      return { success: false, error: e.message };
    } finally {
      setDataLoading(false);
    }
  };

  const updateTask = async (id, updatedData) => {
    setDataLoading(true);
    try {
      const { res, data } = await apiFetch(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data, id: data._id || data.id || id } : t));
        return { success: true, task: data };
      } else {
        return { success: false, error: data?.message };
      }
    } catch (e) {
      console.error('[updateTask] Error:', e.message);
      return { success: false, error: e.message };
    } finally {
      setDataLoading(false);
    }
  };

  const deleteTask = async (id) => {
    setDataLoading(true);
    try {
      const { res } = await apiFetch(`/tasks/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== id));
        addNotification('Task Deleted', 'Task was removed.', 'info');
        return { success: true };
      }
    } catch (e) {
      console.error('[deleteTask] Error:', e.message);
    } finally {
      setDataLoading(false);
    }
  };

  const addInvoice = async (invoiceData) => {
    setDataLoading(true);
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
        return { success: true, invoice: savedInvoice };
      } else {
        const errMsg = data?.message || 'Server error creating invoice';
        addNotification('Failed to Create Invoice', errMsg, 'error');
        return { success: false, error: errMsg };
      }
    } catch (e) {
      console.error('[addInvoice] Error:', e.message);
      addNotification('Connection Error', 'Could not reach server', 'error');
      return { success: false, error: e.message };
    } finally {
      setDataLoading(false);
    }
  };

  const updateInvoiceStatus = async (id, newStatus) => {
    setDataLoading(true);
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
        return { success: true };
      }
    } catch (e) {
      console.error('[updateInvoiceStatus] Error:', e.message);
    } finally {
      setDataLoading(false);
    }
  };

  const addFile = async (fileData) => {
    setDataLoading(true);
    try {
      const { res, data } = await apiFetch('/files', {
        method: 'POST',
        body: JSON.stringify(fileData)
      });
      if (res.ok) {
        const savedFile = { ...data, id: data._id || data.id };
        setFiles(prev => [savedFile, ...prev]);
        addActivityLog(currentUser?.name || 'System User', currentUser?.role || 'Employee', 'FILE_UPLOAD', `Uploaded file: ${fileData.name}`);
        return { success: true, file: savedFile };
      } else {
        throw new Error(data?.message || 'Server error uploading file');
      }
    } catch (e) {
      console.error('[addFile] Error:', e.message);
      return { success: false, error: e.message };
    } finally {
      setDataLoading(false);
    }
  };

  const deleteFile = async (id) => {
    setDataLoading(true);
    try {
      const { res } = await apiFetch(`/files/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setFiles(prev => prev.filter(f => f.id !== id));
        addNotification('File Removed', 'Document was deleted from vault.', 'info');
        return { success: true };
      }
    } catch (e) {
      console.error('[deleteFile] Error:', e.message);
    } finally {
      setDataLoading(false);
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
    dataLoading,
    lastSynced,
    isBackendOnline,
    refetchData: fetchBackendData,
    fetchBackendData,
    toggleArchiveClient,
    activeTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimerAndSave,
    addTimeLog,
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
