import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getSocketUrl } from '../services/api';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { currentUser, currentOrg } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeNotification, setRealtimeNotification] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setIsConnected(false);
      setSocket(null);
      return;
    }

    const SOCKET_URL = getSocketUrl();
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 2,
      reconnectionDelay: 10000,
      timeout: 5000
    });

    newSocket.on('connect_error', (err) => {
      setIsConnected(false);
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      if (currentOrg?._id || currentOrg?.id) {
        newSocket.emit('join_tenant', currentOrg._id || currentOrg.id);
      }
      if (currentUser?._id || currentUser?.id) {
        newSocket.emit('join_user', currentUser._id || currentUser.id);
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Real-time event listeners
    newSocket.on('task_created', (task) => {
      setRealtimeNotification({
        title: 'New Task Created',
        message: `Task "${task.title}" has been added to the sprint.`,
        type: 'info',
        time: new Date().toLocaleTimeString()
      });
    });

    newSocket.on('task_updated', (task) => {
      setRealtimeNotification({
        title: 'Task Updated',
        message: `Task "${task.title}" status changed to ${task.status}.`,
        type: 'info',
        time: new Date().toLocaleTimeString()
      });
    });

    newSocket.on('task_comment_added', ({ taskId, comment }) => {
      setRealtimeNotification({
        title: 'New Task Comment',
        message: `${comment.userName}: "${comment.text.substring(0, 40)}..."`,
        type: 'info',
        time: new Date().toLocaleTimeString()
      });
    });

    newSocket.on('project_updated', (project) => {
      setRealtimeNotification({
        title: 'Project Status Updated',
        message: `Project "${project.name}" is now ${project.status}.`,
        type: 'success',
        time: new Date().toLocaleTimeString()
      });
    });

    newSocket.on('invoice_paid', (invoice) => {
      setRealtimeNotification({
        title: 'Invoice Paid',
        message: `Invoice #${invoice.invoiceNumber || invoice.id} has been marked Paid!`,
        type: 'success',
        time: new Date().toLocaleTimeString()
      });
    });

    newSocket.on('file_uploaded', (file) => {
      setRealtimeNotification({
        title: 'File Uploaded',
        message: `"${file.name}" was uploaded to ${file.category}.`,
        type: 'info',
        time: new Date().toLocaleTimeString()
      });
    });

    newSocket.on('leave_requested', (leave) => {
      setRealtimeNotification({
        title: 'New Leave Request',
        message: `${leave.name} applied for ${leave.type} (${leave.days} day(s)).`,
        type: 'warning',
        time: new Date().toLocaleTimeString()
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser, currentOrg]);

  // Clear toast notification after 5 seconds
  useEffect(() => {
    if (realtimeNotification) {
      const timer = setTimeout(() => {
        setRealtimeNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [realtimeNotification]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, realtimeNotification, clearNotification: () => setRealtimeNotification(null) }}>
      {children}
      {/* Real-time floating push notification toast */}
      {realtimeNotification && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 border border-blue-500/50 text-white p-4 rounded-2xl shadow-2xl flex items-start space-x-3 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0 animate-ping" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-blue-400">{realtimeNotification.title}</h4>
              <span className="text-[10px] text-slate-400">{realtimeNotification.time}</span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5 leading-snug">{realtimeNotification.message}</p>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext) || { socket: null, isConnected: false };
};
