import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOCK_USERS, MOCK_ORGANIZATIONS } from '../data/mockData';
import { getApiBaseUrl } from '../services/api';

const AuthContext = createContext();

const API_BASE_URL = getApiBaseUrl();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.avatar && u.avatar.includes('unsplash')) u.avatar = '';
        if (u.profileImage && u.profileImage.includes('unsplash')) u.profileImage = '';
        if (u.organizationLogo && u.organizationLogo.includes('unsplash')) u.organizationLogo = '';
        return u;
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const defaultOrg = {
    id: 'org-1',
    name: 'WorkForge Enterprise Workspace',
    slug: 'workforge-enterprise',
    plan: 'Pro Plan',
    status: 'Active',
    departments: ['Engineering', 'Design', 'Product', 'Marketing', 'Executive'],
    logo: ''
  };

  const [currentOrg, setCurrentOrg] = useState(() => {
    try {
      const savedOrg = localStorage.getItem('nexus_org');
      if (savedOrg) {
        const o = JSON.parse(savedOrg);
        if (o.logo && o.logo.includes('unsplash')) o.logo = '';
        return o;
      }
      return defaultOrg;
    } catch (e) {
      return defaultOrg;
    }
  });

  const [authToken, setAuthToken] = useState(() => localStorage.getItem('nexus_token') || null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Sync currentOrg dynamically when currentUser changes or logs in
  useEffect(() => {
    if (currentUser) {
      const orgName = currentUser.organizationName || (currentUser.role === 'SUPER_ADMIN' ? 'WorkForge Governance' : 'WorkForge Workspace');
      const orgId = currentUser.organizationId || 'org-1';
      const updatedOrg = {
        id: orgId,
        name: orgName,
        slug: orgName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        plan: currentUser.subscriptionDetails?.plan || (currentUser.role === 'SUPER_ADMIN' ? 'Pro Plan' : 'None'),
        status: 'Active',
        logo: currentUser.organizationLogo || currentOrg?.logo || ''
      };
      setCurrentOrg(updatedOrg);
      localStorage.setItem('nexus_org', JSON.stringify(updatedOrg));
    }
  }, [currentUser]);

  // Dark/Light Mode state
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('nexus_theme');
    if (savedTheme) return savedTheme === 'dark';
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('nexus_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('nexus_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Role Default Landing Paths
  const getRoleDefaultPath = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '/organization';
      case 'COMPANY_ADMIN':
        return '/';
      case 'PROJECT_MANAGER':
        return '/projects';
      case 'EMPLOYEE':
        return '/tasks';
      case 'CLIENT':
        return '/invoices';
      default:
        return '/';
    }
  };

  // Helper for API fetch calls with credentials
  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const defaultHeaders = { 'Content-Type': 'application/json' };
    const token = authToken || localStorage.getItem('nexus_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
      credentials: 'include'
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));
    return { res, data };
  }, [authToken]);

  // Silent Token Refresh
  const silentRefresh = useCallback(async () => {
    try {
      const hasSavedUser = localStorage.getItem('nexus_user');
      if (!hasSavedUser && !document.cookie.includes('refreshToken')) {
        return false;
      }

      const { res, data } = await apiFetch('/auth/refresh', { method: 'POST' });
      if (res.ok && data.accessToken) {
        setAuthToken(data.accessToken);
        localStorage.setItem('nexus_token', data.accessToken);
        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('nexus_user', JSON.stringify(data.user));
        }
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }, [apiFetch]);

  // Initial Silent Auth Check on Application Mount
  useEffect(() => {
    silentRefresh();
  }, [silentRefresh]);

  // Silent Token Refresh Interval (14 minutes)
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      silentRefresh();
    }, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentUser, silentRefresh]);

  // Unified Login
  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { res, data } = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe })
      });

      if (!res.ok) {
        setLoading(false);
        setAuthError(data.message || 'Authentication failed');
        return {
          success: false,
          error: data.message || 'Authentication failed',
          emailUnverified: data.emailUnverified,
          verificationToken: data.verificationToken
        };
      }

      setCurrentUser(data.user);
      if (data.accessToken) {
        setAuthToken(data.accessToken);
        localStorage.setItem('nexus_token', data.accessToken);
      }
      localStorage.setItem('nexus_user', JSON.stringify(data.user));
      setLoading(false);
      return { success: true, user: data.user, defaultPath: getRoleDefaultPath(data.user.role) };
    } catch (err) {
      setLoading(false);
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Super Admin Login (/admin/login ONLY)
  const loginSuperAdmin = async (email, password, rememberMe = false) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { res, data } = await apiFetch('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe })
      });

      if (!res.ok) {
        setLoading(false);
        setAuthError(data.message || 'Super Admin authentication denied');
        return { success: false, error: data.message || 'Super Admin authentication denied' };
      }

      setCurrentUser(data.user);
      if (data.accessToken) {
        setAuthToken(data.accessToken);
        localStorage.setItem('nexus_token', data.accessToken);
      }
      localStorage.setItem('nexus_user', JSON.stringify(data.user));
      setLoading(false);
      return { success: true, user: data.user, defaultPath: '/organization' };
    } catch (err) {
      setLoading(false);
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Company Registration (Sign Up)
  const registerCompany = async ({ name, email, password, companyName }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { res, data } = await apiFetch('/auth/register-company', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, companyName })
      });

      if (!res.ok) {
        setLoading(false);
        setAuthError(data.message || 'Registration failed');
        return { success: false, error: data.message || 'Registration failed' };
      }

      setCurrentUser(data.user);
      if (data.accessToken) {
        setAuthToken(data.accessToken);
        localStorage.setItem('nexus_token', data.accessToken);
      }
      localStorage.setItem('nexus_user', JSON.stringify(data.user));
      setLoading(false);
      return {
        success: true,
        message: data.message,
        verificationToken: data.verificationToken,
        user: data.user
      };
    } catch (err) {
      setLoading(false);
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Update Profile Image URL for Current User
  const updateUserProfileImage = async (profileImage) => {
    try {
      const { res, data } = await apiFetch('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ profileImage })
      });
      const updated = { ...currentUser, avatar: profileImage, profileImage };
      setCurrentUser(updated);
      localStorage.setItem('nexus_user', JSON.stringify(updated));
      return { success: true, user: updated };
    } catch (e) {
      const updated = { ...currentUser, avatar: profileImage, profileImage };
      setCurrentUser(updated);
      localStorage.setItem('nexus_user', JSON.stringify(updated));
      return { success: true, user: updated };
    }
  };

  // Update Company Logo URL for Active Organization
  const updateCompanyLogo = async (logoUrl) => {
    const updatedOrg = { ...currentOrg, logo: logoUrl };
    setCurrentOrg(updatedOrg);
    localStorage.setItem('nexus_org', JSON.stringify(updatedOrg));
    if (currentUser) {
      const updatedUser = { ...currentUser, organizationLogo: logoUrl };
      setCurrentUser(updatedUser);
      localStorage.setItem('nexus_user', JSON.stringify(updatedUser));
    }

    try {
      const { res, data } = await apiFetch('/auth/organization-logo', {
        method: 'PUT',
        body: JSON.stringify({ logo: logoUrl })
      });
      if (res.ok && data?.logo) {
        const persistedOrg = { ...currentOrg, logo: data.logo };
        setCurrentOrg(persistedOrg);
        localStorage.setItem('nexus_org', JSON.stringify(persistedOrg));
      }
    } catch (err) {
      console.warn('Backend logo sync failed, preserved locally:', err.message);
    }
  };

  // Verify Email
  const verifyEmailToken = async (token) => {
    try {
      const { res, data } = await apiFetch('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token })
      });
      if (!res.ok) throw new Error(data.message || 'Email verification failed.');
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Forgot Password
  const resetPasswordEmail = async (email) => {
    try {
      const { res, data } = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error(data.message || 'Failed to send password reset link.');
      return { success: true, message: data.message, resetToken: data.resetToken };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Reset Password
  const submitResetPassword = async (token, newPassword, confirmPassword) => {
    try {
      const { res, data } = await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword, confirmPassword })
      });
      if (!res.ok) throw new Error(data.message || 'Password reset failed.');
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Change Password
  const changePassword = async (currentPassword, newPassword, confirmPassword, logoutOtherDevices = true) => {
    try {
      const { res, data } = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword, logoutOtherDevices })
      });
      if (!res.ok) throw new Error(data.message || 'Change password failed.');
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Logout Current Device
  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('nexus_user');
    localStorage.removeItem('nexus_token');
    setAuthToken(null);
    setCurrentUser(null);
  };

  // Logout All Devices
  const logoutAllDevices = async () => {
    try {
      await apiFetch('/auth/logout-all', { method: 'POST' });
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('nexus_user');
    localStorage.removeItem('nexus_token');
    setAuthToken(null);
    setCurrentUser(null);
  };

  // Fetch Active Device Sessions
  const getActiveSessions = async () => {
    try {
      const { res, data } = await apiFetch('/auth/sessions', { method: 'GET' });
      if (!res.ok) throw new Error(data.message || 'Failed to fetch active sessions.');
      return { success: true, sessions: data.sessions };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Revoke Specific Session
  const revokeSession = async (sessionId) => {
    try {
      const { res, data } = await apiFetch(`/auth/sessions/${sessionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(data.message || 'Failed to revoke session.');
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Switch Organization Workspace
  const switchOrganization = (orgId) => {
    const targetOrg = MOCK_ORGANIZATIONS.find(o => o.id === orgId) || currentOrg || defaultOrg;
    if (targetOrg) {
      setCurrentOrg(targetOrg);
      localStorage.setItem('nexus_org', JSON.stringify(targetOrg));
    }
  };

  const switchUserPersona = (userId) => {
    const targetUser = MOCK_USERS.find(u => u.id === userId) || currentUser;
    if (targetUser) {
      setCurrentUser(targetUser);
      localStorage.setItem('nexus_user', JSON.stringify(targetUser));
    }
  };

  const updateCurrentUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('nexus_user', JSON.stringify(user));
    const newPlan = user?.subscriptionDetails?.plan || user?.organizationId?.plan;
    if (newPlan) {
      setCurrentOrg(prev => {
        if (!prev) return prev;
        const updated = { ...prev, plan: newPlan };
        localStorage.setItem('nexus_org', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const value = {
    currentUser,
    updateCurrentUser,
    currentOrg,
    authToken,
    apiFetch,
    darkMode,
    loading,
    authError,
    toggleDarkMode,
    switchOrganization,
    switchUserPersona,
    updateUserProfileImage,
    updateCompanyLogo,
    login,
    loginSuperAdmin,
    registerCompany,
    verifyEmailToken,
    resetPasswordEmail,
    submitResetPassword,
    changePassword,
    logout,
    logoutAllDevices,
    getActiveSessions,
    revokeSession,
    getRoleDefaultPath,
    silentRefresh,
    organizationsList: MOCK_ORGANIZATIONS,
    usersList: MOCK_USERS
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
