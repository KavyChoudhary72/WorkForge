import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Play,
  Pause,
  Square,
  Clock,
  ChevronDown,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Info,
  Shield,
  LogOut,
  Laptop,
  Camera,
  Crop,
  X,
  Settings,
  UserCircle,
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserAvatar, OrgLogo } from '../common/UserAvatar';
import ActiveSessionsModal from '../common/ActiveSessionsModal';
import ImageCropperModal from '../common/ImageCropperModal';

export default function TopBar({ onOpenSearch, activePage, setActivePage, onToggleMobileSidebar }) {
  const { currentUser, currentOrg, darkMode, toggleDarkMode, logout, logoutAllDevices, updateUserProfileImage, updateCompanyLogo } = useAuth();
  const { activeTimer, pauseTimer, resumeTimer, stopTimerAndSave, notifications, markNotificationRead } = useData();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  
  // Crop Modal States
  const [cropTarget, setCropTarget] = useState(null); // 'user' | 'company'
  const [showCropModal, setShowCropModal] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenCropUser = () => {
    setCropTarget('user');
    setShowCropModal(true);
    setShowPersonaMenu(false);
  };

  const handleOpenCropCompany = () => {
    setCropTarget('company');
    setShowCropModal(true);
    setShowPersonaMenu(false);
  };

  const handleCropSave = (croppedDataUrl) => {
    if (cropTarget === 'user') {
      updateUserProfileImage(croppedDataUrl);
    } else if (cropTarget === 'company') {
      updateCompanyLogo(croppedDataUrl);
    }
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
        {/* Left: Hamburger & Global Search Trigger */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 max-w-md">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-medium transition-colors border border-slate-200 dark:border-transparent hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
              <span className="truncate">Search workspace...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-mono bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-600 shadow-2xs font-semibold">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Active Timer Widget */}
          <div className={`hidden md:flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            activeTimer.isRunning
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 animate-pulse'
              : activeTimer.seconds > 0
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-400'
              : 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono text-sm font-bold">{formatTime(activeTimer.seconds)}</span>
            <span className="truncate max-w-[120px] hidden lg:inline text-slate-600 dark:text-slate-400 font-medium">
              {activeTimer.projectName || 'Timer Idle'}
            </span>

            {activeTimer.isRunning ? (
              <button
                onClick={pauseTimer}
                title="Pause Timer"
                className="p-1 hover:bg-emerald-200/50 dark:hover:bg-emerald-900/50 rounded transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
            ) : activeTimer.seconds > 0 ? (
              <button
                onClick={resumeTimer}
                title="Resume Timer"
                className="p-1 hover:bg-amber-200/50 dark:hover:bg-amber-900/50 rounded transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setActivePage('timetracking')}
                title="Open Time Tracker"
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}

            {activeTimer.seconds > 0 && (
              <button
                onClick={() => stopTimerAndSave(currentUser?.name || 'Workspace Member')}
                title="Save Logged Time"
                className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 rounded transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
          </div>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowPersonaMenu(false);
              }}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white dark:ring-navy-900" />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => notifications.forEach(n => markNotificationRead(n.id))}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">No notifications available.</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-start space-x-3 ${
                          !n.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          {n.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600" />}
                          {n.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-slate-500 font-normal">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed font-medium">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title={`Switch to ${darkMode ? 'Light' : 'Dark'} Mode`}
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {/* User Profile Trigger */}
          <div className="relative flex items-center space-x-2">
            <UserAvatar
              name={currentUser?.name || 'User'}
              src={currentUser?.avatar || currentUser?.profileImage || ''}
              size="md"
              onClick={handleOpenCropUser}
            />

            <button
              onClick={() => {
                setShowPersonaMenu(!showPersonaMenu);
                setShowNotifDropdown(false);
              }}
              className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="hidden lg:block text-left">
                <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                  {currentUser?.name || 'Workspace Member'}
                </div>
                <div className="text-[11px] text-blue-700 dark:text-blue-400 font-bold">
                  {currentUser?.role || 'Member'}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 hidden lg:block" />
            </button>

            {/* User Dropdown Menu */}
            {showPersonaMenu && (
              <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Authenticated Workspace User</div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{currentUser?.name || 'Workspace Member'}</div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">{currentUser?.email || ''}</div>
                </div>

                {/* Profile Actions */}
                <div className="px-2 py-2 border-b border-slate-200 dark:border-slate-800 space-y-1">
                  <button
                    onClick={() => {
                      setActivePage('profile');
                      setShowPersonaMenu(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <UserCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>My Profile & Skills</span>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage('settings');
                      setShowPersonaMenu(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span>Company & System Settings</span>
                  </button>

                  <button
                    onClick={handleOpenCropUser}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Crop className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Upload & Crop User Profile Photo</span>
                  </button>

                  <button
                    onClick={handleOpenCropCompany}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Crop className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Upload & Crop Company Logo</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowSessionsModal(true);
                      setShowPersonaMenu(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Laptop className="w-4 h-4 text-blue-600" />
                    <span>Active Device Sessions</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setShowPersonaMenu(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>

                  <button
                    onClick={() => {
                      logoutAllDevices();
                      setShowPersonaMenu(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Log Out All Devices</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Device File Manager Upload & Crop Modal */}
      <ImageCropperModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        onCropSave={handleCropSave}
        title={cropTarget === 'company' ? `Crop Logo for ${currentOrg?.name || 'Company'}` : `Crop Profile Photo for ${currentUser?.name || 'User'}`}
        cropShape={cropTarget === 'user' ? 'circle' : 'square'}
      />

      {/* Active Device Sessions Management Modal */}
      <ActiveSessionsModal
        isOpen={showSessionsModal}
        onClose={() => setShowSessionsModal(false)}
      />
    </>
  );
}
