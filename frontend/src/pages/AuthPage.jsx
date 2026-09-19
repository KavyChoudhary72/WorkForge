import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle, Building2, User, AlertCircle, KeyRound, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import WorkForgeLogo from '../components/common/WorkForgeLogo';

export default function AuthPage({ onLoginSuccess, initialMode = 'login', onBackToHome }) {
  const { login, registerCompany, resetPasswordEmail, submitResetPassword, verifyEmailToken, loading, authError } = useAuth();
  
  // Auth Modes: 'login' | 'signup'
  const [mode, setMode] = useState(initialMode);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  
  // Modal & Reset States
  const [showForgot, setShowForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);

  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password Policy Checks
  const passHasLength = password.length >= 8;
  const passHasUpper = /[A-Z]/.test(password);
  const passHasLower = /[a-z]/.test(password);
  const passHasNumber = /[0-9]/.test(password);
  const passHasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passIsValid = passHasLength && passHasUpper && passHasLower && passHasNumber && passHasSpecial;

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    const res = await login(email, password, rememberSession);
    if (res.success) {
      if (onLoginSuccess) onLoginSuccess(res.defaultPath);
    } else {
      setLocalError(res.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    if (!name || !email || !password || !companyName) {
      setLocalError('All fields are required to register a company workspace.');
      return;
    }

    if (!passIsValid) {
      setLocalError('Please satisfy all password security requirements before creating a workspace.');
      return;
    }

    const res = await registerCompany({ name, email, password, companyName });
    if (res.success) {
      if (onLoginSuccess) {
        onLoginSuccess('/');
      }
    } else {
      setLocalError(res.error || 'Workspace registration failed.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLocalError('');
    const res = await resetPasswordEmail(forgotEmail);
    if (res.success) {
      setForgotSent(true);
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
    } else {
      setLocalError(res.error || 'Failed to send reset link.');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!resetToken || !newPassword) {
      setLocalError('Reset token and new password are required.');
      return;
    }
    const res = await submitResetPassword(resetToken, newPassword, confirmPassword);
    if (res.success) {
      setSuccessMsg('Password reset successfully! Please sign in with your new password.');
      setShowForgot(false);
      setShowResetForm(false);
      setForgotSent(false);
    } else {
      setLocalError(res.error || 'Password reset failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      {/* Subtle Background Decorative Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center flex flex-col items-center">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="mb-6 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors inline-flex items-center space-x-1 bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-full border border-slate-300 dark:border-slate-800 shadow-sm"
          >
            <span>← Back to Homepage</span>
          </button>
        )}
        
        {/* WorkForge Clickable Logo */}
        <WorkForgeLogo size="large" onClick={onBackToHome} className="mb-4" />

        <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
          {mode === 'login' 
            ? 'Multi-Tenant Project & Client Management Platform' 
            : 'Register a New Company Organization Workspace'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Main Theme-Consistent Card Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 py-8 px-6 shadow-xl dark:shadow-2xl rounded-2xl sm:px-10 transition-colors">

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
            <button
              onClick={() => { setMode('login'); setLocalError(''); setSuccessMsg(''); }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 text-center transition-colors ${
                mode === 'login'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setLocalError(''); setSuccessMsg(''); }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 text-center transition-colors ${
                mode === 'signup'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Create Workspace
            </button>
          </div>

          {/* Error Banner */}
          {(localError || authError) && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-center font-medium">
              <AlertCircle className="w-4 h-4 mr-2.5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span>{localError || authError}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center font-medium">
              <CheckCircle className="w-4 h-4 mr-2.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form className="space-y-5" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors placeholder-slate-400"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setShowForgot(true); setForgotEmail(email); setForgotSent(false); }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors placeholder-slate-400"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember session (30 Days)</span>
                </label>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> JWT & HttpOnly
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all focus:outline-none text-sm disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* COMPANY SIGN UP FORM */
            <form className="space-y-4" onSubmit={handleSignupSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blue-600"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Company / Organization Name
                </label>
                <div className="relative">
                  <Building2 className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blue-600"
                    placeholder="Acme Innovations Inc"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blue-600"
                    placeholder="jane@acme.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blue-600"
                    placeholder="Min 8 characters"
                  />
                </div>

                {/* Password Policy Indicator Checklist */}
                {password.length > 0 && (
                  <div className="mt-2.5 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center space-x-1.5">
                      {passHasLength ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                      <span className={passHasLength ? 'text-emerald-700 dark:text-emerald-300 font-medium' : 'text-slate-500 dark:text-slate-400'}>Minimum 8 characters</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {passHasUpper ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                      <span className={passHasUpper ? 'text-emerald-700 dark:text-emerald-300 font-medium' : 'text-slate-500 dark:text-slate-400'}>At least one uppercase letter (A-Z)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {passHasLower ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                      <span className={passHasLower ? 'text-emerald-700 dark:text-emerald-300 font-medium' : 'text-slate-500 dark:text-slate-400'}>At least one lowercase letter (a-z)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {passHasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                      <span className={passHasNumber ? 'text-emerald-700 dark:text-emerald-300 font-medium' : 'text-slate-500 dark:text-slate-400'}>At least one number (0-9)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {passHasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                      <span className={passHasSpecial ? 'text-emerald-700 dark:text-emerald-300 font-medium' : 'text-slate-500 dark:text-slate-400'}>At least one special character (!@#$%^&*)</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || (password.length > 0 && !passIsValid)}
                className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all focus:outline-none text-sm disabled:opacity-50 mt-4"
              >
                {loading ? 'Creating Workspace...' : 'Register & Enter Workspace'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          WorkForge Enterprise SaaS • Secure MongoDB Authentication
        </div>
      </div>

      {/* Forgot / Reset Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Reset Password</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Enter your corporate email address to receive password reset instructions.
            </p>

            {showResetForm ? (
              <form onSubmit={handleResetSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 font-mono">Reset Token</label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                    placeholder="Reset token..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                    placeholder="New password"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                    placeholder="Confirm password"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowForgot(false); setShowResetForm(false); }}
                    className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            ) : forgotSent ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>Password reset instructions generated for {forgotEmail}.</span>
                </div>
                {resetToken && (
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-[11px] font-mono text-slate-800 dark:text-slate-200 break-all">
                    Reset Token: {resetToken}
                  </div>
                )}
                <div className="flex justify-between">
                  <button
                    onClick={() => setShowResetForm(true)}
                    className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center"
                  >
                    <KeyRound className="w-3.5 h-3.5 mr-1" />
                    Enter New Password
                  </button>
                  <button
                    onClick={() => { setShowForgot(false); setForgotSent(false); }}
                    className="px-3 py-1.5 text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs mb-4 focus:outline-none focus:border-blue-600"
                  placeholder="name@company.com"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => { setShowForgot(false); setForgotSent(false); }}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
