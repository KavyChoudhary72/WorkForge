import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import GlobalSearchModal from './components/common/GlobalSearchModal';
import InactivityModal from './components/common/InactivityModal';
import PlanChooserModal from './components/common/PlanChooserModal';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AdminAuthPage from './pages/AdminAuthPage';
import DashboardPage from './pages/DashboardPage';
import OrganizationMgmtPage from './pages/OrganizationMgmtPage';
import ClientMgmtPage from './pages/ClientMgmtPage';
import ProjectMgmtPage from './pages/ProjectMgmtPage';
import TaskMgmtPage from './pages/TaskMgmtPage';
import TimeTrackingPage from './pages/TimeTrackingPage';
import InvoiceMgmtPage from './pages/InvoiceMgmtPage';
import FileManagerPage from './pages/FileManagerPage';
import TeamMgmtPage from './pages/TeamMgmtPage';
import CalendarPage from './pages/CalendarPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import ReportsPage from './pages/ReportsPage';
import AiHubPage from './pages/AiHubPage';
import IntegrationsPage from './pages/IntegrationsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import { SocketProvider } from './context/SocketContext';

function AppContent() {
  const { currentUser, getRoleDefaultPath, logout, apiFetch, silentRefresh, updateCurrentUser } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pathname, setPathname] = useState(window.location.pathname);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [showPlanChooserModal, setShowPlanChooserModal] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'SUPER_ADMIN') {
      const plan = currentUser.subscriptionDetails?.plan || 'None';
      const trialActivated = currentUser.subscriptionDetails?.trialActivated || false;
      const trialEndDate = currentUser.subscriptionDetails?.trialEndDate;

      if (plan === 'Trial Plan' && trialActivated && trialEndDate) {
        const isExpired = new Date(trialEndDate) < new Date();
        if (!isExpired) {
          const lastShown = localStorage.getItem('nexus_last_plan_popup');
          const twelveHoursMs = 12 * 60 * 60 * 1000;
          if (!lastShown || (Date.now() - parseInt(lastShown, 10)) > twelveHoursMs) {
            setShowPlanChooserModal(true);
            localStorage.setItem('nexus_last_plan_popup', Date.now().toString());
          }
        }
      }
    }
  }, [currentUser]);

  // Helper to check if current pathname is a secret Super Admin route
  const isSecretAdminRoute = (path) => {
    const normPath = (path || '').toLowerCase();
    return normPath === '/super-admin-portal' || normPath === '/admin/login' || normPath === '/secret-admin';
  };

  // View state: 'landing' | 'auth' | 'admin' | 'workspace'
  const [viewState, setViewState] = useState(() => {
    if (isSecretAdminRoute(window.location.pathname)) return 'admin';
    return 'landing'; // Always land on public Homepage when opening http://localhost:5173/
  });
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      setPathname(currentPath);
      if (isSecretAdminRoute(currentPath)) {
        setViewState('admin');
      } else if (currentPath === '/') {
        setViewState('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update default active page when user logs in
  useEffect(() => {
    if (currentUser) {
      const targetPath = getRoleDefaultPath(currentUser.role);
      if (targetPath === '/organization') setActivePage('organizations');
      else if (targetPath === '/projects') setActivePage('projects');
      else if (targetPath === '/tasks') setActivePage('tasks');
      else if (targetPath === '/invoices') setActivePage('invoices');
      else setActivePage('dashboard');
    }
  }, [currentUser, getRoleDefaultPath]);

  // 30-Minute Inactivity Timeout Monitor
  const inactivityTimerRef = useRef(null);
  const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 Minutes

  const handleInactivityLogout = useCallback(() => {
    if (currentUser) {
      logout();
      setShowInactivityModal(true);
      setViewState('auth');
      setAuthMode('login');
    }
  }, [currentUser, logout]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (currentUser) {
      inactivityTimerRef.current = setTimeout(() => {
        handleInactivityLogout();
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [currentUser, handleInactivityLogout, INACTIVITY_TIMEOUT_MS]);

  useEffect(() => {
    if (!currentUser) return;

    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart', 'click'];
    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    events.forEach((event) => window.addEventListener(event, handleUserActivity));
    resetInactivityTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleUserActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [currentUser, resetInactivityTimer]);

  // 1. Secret Super Admin URL handling (/admin/login)
  if (viewState === 'admin' || isSecretAdminRoute(pathname)) {
    return (
      <>
        <AdminAuthPage
          onAdminLoginSuccess={() => {
            setActivePage('organizations');
            window.history.pushState({}, '', '/');
            setPathname('/');
            setViewState('workspace');
          }}
        />
        <InactivityModal
          isOpen={showInactivityModal}
          onLoginAgain={() => {
            setShowInactivityModal(false);
            setViewState('auth');
            setAuthMode('login');
          }}
        />
      </>
    );
  }

  // 2. Standard Auth Page (Company Admin / Employee Sign In / Register)
  if (viewState === 'auth') {
    return (
      <>
        <AuthPage
          initialMode={authMode}
          onBackToHome={() => {
            window.history.pushState({}, '', '/');
            setPathname('/');
            setViewState('landing');
          }}
          onLoginSuccess={(defaultPath) => {
            if (defaultPath === '/organization') setActivePage('organizations');
            else if (defaultPath === '/projects') setActivePage('projects');
            else if (defaultPath === '/tasks') setActivePage('tasks');
            else if (defaultPath === '/invoices') setActivePage('invoices');
            else setActivePage('dashboard');
            window.history.pushState({}, '', '/');
            setPathname('/');
            setViewState('workspace');
          }}
        />
        <InactivityModal
          isOpen={showInactivityModal}
          onLoginAgain={() => {
            setShowInactivityModal(false);
            setViewState('auth');
            setAuthMode('login');
          }}
        />
      </>
    );
  }

  // 3. Homepage (Landing Page) View - Default for opening http://localhost:5173/
  if (viewState === 'landing' || !currentUser) {
    return (
      <>
        <LandingPage
          onOpenAuth={(mode = 'login') => {
            if (mode === 'workspace' && currentUser) {
              setViewState('workspace');
            } else {
              setAuthMode(mode);
              setViewState('auth');
            }
          }}
        />
        <InactivityModal
          isOpen={showInactivityModal}
          onLoginAgain={() => {
            setShowInactivityModal(false);
            setViewState('auth');
            setAuthMode('login');
          }}
        />
      </>
    );
  }

  // Authenticated Workspace View
  if (currentUser && currentUser.role !== 'SUPER_ADMIN') {
    const isPeter = currentUser.email === 'peter@oscorp.com';
    const plan = isPeter ? 'Pro Plan' : (currentUser.subscriptionDetails?.plan || 'None');
    const trialActivated = isPeter ? false : (currentUser.subscriptionDetails?.trialActivated || false);
    const trialEndDate = currentUser.subscriptionDetails?.trialEndDate;

    // 1. If trial is NOT activated and plan is None: block and require trial activation
    if (plan === 'None' && !trialActivated) {
      return (
        <PlanChooserModal
          onClose={() => {}}
          onBackToLogin={logout}
          isExpired={false}
          showTrialOption={true}
          apiFetch={apiFetch}
          silentRefresh={silentRefresh}
          updateCurrentUser={updateCurrentUser}
          currentPlan={plan}
        />
      );
    }

    // 2. If trial has expired: block and require plan selection
    const isExpired = trialEndDate ? new Date(trialEndDate) < new Date() : false;
    if (plan === 'Trial Plan' && isExpired) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 text-white p-4">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6 shadow-2xl text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-3xl font-black shadow-lg text-white">
                ⚠️
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold tracking-tight">Your Trial Has Expired</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your 7-day free trial of WorkForge has come to an end. Please choose a subscription plan to unlock your workspace.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setShowPlanChooserModal(true);
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/30"
              >
                Choose a Paid Plan
              </button>
              <button
                onClick={() => logout()}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-colors text-xs text-slate-300"
              >
                Sign Out
              </button>
            </div>
          </div>
          
          {showPlanChooserModal && (
            <PlanChooserModal
              onClose={() => setShowPlanChooserModal(false)}
              onBackToLogin={logout}
              isExpired={false}
              showTrialOption={false}
              apiFetch={apiFetch}
              silentRefresh={silentRefresh}
              updateCurrentUser={updateCurrentUser}
              currentPlan={plan}
            />
          )}
        </div>
      );
    }
  }

  // Authenticated Workspace View
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenPlanChooser={() => setShowPlanChooserModal(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <TopBar
          onOpenSearch={() => setIsSearchOpen(true)}
          activePage={activePage}
          setActivePage={setActivePage}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activePage === 'dashboard' && (
            <DashboardPage
              setActivePage={setActivePage}
              onOpenPlanChooser={() => setShowPlanChooserModal(true)}
            />
          )}
          {activePage === 'organizations' && <OrganizationMgmtPage />}
          {activePage === 'clients' && <ClientMgmtPage />}
          {activePage === 'projects' && <ProjectMgmtPage />}
          {activePage === 'tasks' && <TaskMgmtPage />}
          {activePage === 'timetracking' && <TimeTrackingPage />}
          {activePage === 'invoices' && <InvoiceMgmtPage />}
          {activePage === 'files' && <FileManagerPage />}
          {activePage === 'team' && <TeamMgmtPage />}
          {activePage === 'calendar' && <CalendarPage />}
          {activePage === 'activity' && <ActivityLogsPage />}
          {activePage === 'reports' && <ReportsPage />}
          {activePage === 'integrations' && <IntegrationsPage />}
          {activePage === 'settings' && (
            <SettingsPage
              onOpenPlanChooser={() => setShowPlanChooserModal(true)}
            />
          )}
          {activePage === 'profile' && <ProfilePage />}
          {activePage === 'aihub' && <AiHubPage />}
        </main>
      </div>

      {/* Cmd/Ctrl + K Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(page) => setActivePage(page)}
      />

      {/* 30-Minute Inactivity Expiry Notification Modal */}
      <InactivityModal
        isOpen={showInactivityModal}
        onLoginAgain={() => {
          setShowInactivityModal(false);
          setViewState('auth');
          setAuthMode('login');
        }}
      />

      {/* Plan Chooser Modal (non-blocking 12-hour popup during trial) */}
      {showPlanChooserModal && (
        <PlanChooserModal
          onClose={() => setShowPlanChooserModal(false)}
          isExpired={false}
          showTrialOption={false}
          apiFetch={apiFetch}
          silentRefresh={silentRefresh}
          updateCurrentUser={updateCurrentUser}
          currentPlan={currentUser?.subscriptionDetails?.plan || currentOrg?.plan || 'Pro Plan'}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
