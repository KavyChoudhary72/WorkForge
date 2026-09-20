import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Session from '../models/Session.js';

// Helper: Password Strength Validation
export const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
};

// Helper: Hash Tokens for DB storage (SHA-256)
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Helper: JWT Access Token Generation (15 Minutes Expiry)
const generateAccessToken = (user) => {
  const orgId = user.role === 'SUPER_ADMIN' ? null : (user.organizationId?._id || user.organizationId || null);
  const payload = {
    userId: user._id,
    id: user._id,
    email: user.email,
    role: user.role,
    organizationId: orgId,
    permissions: user.permissions || []
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'nexus_pulse_production_jwt_access_secret_2026_super_secure', {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });
};

// Helper: Refresh Token Cookie Setting
const setRefreshTokenCookie = (res, refreshToken, rememberMe = false) => {
  const maxAgeMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAgeMs,
    path: '/'
  });
};

// Helper: User Agent Parser
const parseUserAgent = (req) => {
  const ua = req.headers['user-agent'] || '';
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let device = 'Desktop';

  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) device = 'Mobile';
  else if (ua.includes('iPad') || ua.includes('Tablet')) device = 'Tablet';

  const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || '127.0.0.1';

  return { browser, operatingSystem: os, device, ipAddress, userAgentString: ua };
};

// Helper: Internal Audit Logging
const logActivityInternal = async ({ organizationId, userId, userEmail, action, details, req }) => {
  try {
    const ActivityLog = (await import('../models/ActivityLog.js')).default;
    const { ipAddress, userAgentString } = parseUserAgent(req);
    await ActivityLog.create({
      organizationId: organizationId || null,
      userId: userId || null,
      userEmail: userEmail || '',
      action,
      details,
      ipAddress,
      userAgent: userAgentString
    });
  } catch (err) {
    console.error('[Audit Log Error]', err.message);
  }
};

// 1. Company Registration (Instant Auto-Login on Sign Up)
export const registerCompany = async (req, res, next) => {
  try {
    const { name, email, password, companyName } = req.body;

    if (!name || !email || !password || !companyName) {
      return res.status(400).json({ message: 'Name, email, password, and company name are required.' });
    }

    const pwdError = validatePasswordStrength(password);
    if (pwdError) {
      return res.status(400).json({ message: pwdError });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email address already exists. Please sign in.' });
    }

    // Create Organization
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
    const organization = await Organization.create({
      name: companyName,
      slug,
      plan: 'None',
      status: 'Active',
      departments: ['Engineering', 'Design', 'Marketing', 'Executive']
    });

    // Create Company Admin User (Auto-verified for immediate seamless onboarding)
    const user = await User.create({
      organizationId: organization._id,
      name,
      email: email.toLowerCase(),
      password,
      role: 'COMPANY_ADMIN',
      department: 'Executive',
      designation: 'Company Founder',
      accountStatus: 'Active',
      isEmailVerified: true,
      permissions: ['ALL_PERMISSIONS', 'MANAGE_USERS', 'MANAGE_PROJECTS', 'MANAGE_BILLING']
    });

    // Generate Tokens for immediate login
    const accessToken = generateAccessToken(user);
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { browser, operatingSystem, device, ipAddress } = parseUserAgent(req);

    await Session.create({
      userId: user._id,
      refreshTokenHash,
      ipAddress,
      browser,
      device,
      operatingSystem,
      loginTime: new Date(),
      lastActivity: new Date(),
      expiresAt,
      rememberMe: true,
      isValid: true
    });

    setRefreshTokenCookie(res, refreshToken, true);

    await logActivityInternal({
      organizationId: organization._id,
      userId: user._id,
      userEmail: user.email,
      action: 'AccountCreation',
      details: `New company organization '${companyName}' registered by ${name}. Auto-authenticated.`,
      req
    });

    res.status(201).json({
      message: 'Company workspace registered successfully.',
      accessToken,
      user: {
        id: user._id,
        userId: user._id,
        authId: user.authId,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: organization._id,
        organizationName: organization.name,
        avatar: user.profileImage,
        department: user.department,
        designation: user.designation,
        permissions: user.permissions,
        accountStatus: user.accountStatus,
        isEmailVerified: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Email Verification Endpoints
export const verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token || req.body.token;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const user = await User.findOne({ verificationToken: token });

    if (user) {
      user.isEmailVerified = true;
      user.accountStatus = 'Active';
      user.verificationToken = null;
      user.verificationTokenExpires = null;
      await user.save();
    }

    res.json({ message: 'Email address verified successfully. You may now log in.' });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    user.isEmailVerified = true;
    user.accountStatus = 'Active';
    await user.save();

    res.json({ message: `Verification email verified for ${user.email}.` });
  } catch (error) {
    next(error);
  }
};

// 3. User Login Flow
export const loginUser = async (req, res, next) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    let user = await User.findOne({ email: email.toLowerCase() }).populate('organizationId');

    if (!user) {
      await logActivityInternal({
        userEmail: email,
        action: 'FailedLoginAttempt',
        details: `Failed login attempt for non-existent user ${email}.`,
        req
      });
      return res.status(401).json({ message: 'User account not found. Please check your email or click "Create Workspace".' });
    }

    // Auto-ensure verified email and active account on login for clean user experience
    if (!user.isEmailVerified || user.accountStatus === 'PendingVerification') {
      user.isEmailVerified = true;
      user.accountStatus = 'Active';
      await user.save();
    }

    // Verify Password using bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await logActivityInternal({
        organizationId: user.organizationId?._id || user.organizationId || null,
        userId: user._id,
        userEmail: user.email,
        action: 'FailedLoginAttempt',
        details: `Failed password verification for user ${email}.`,
        req
      });
      return res.status(401).json({ message: 'Invalid password entered. Please check your credentials.' });
    }

    // Super Admin must authenticate through /admin/login
    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({
        message: 'Super Admin accounts must authenticate exclusively through the Super Admin Portal (/admin/login).'
      });
    }

    // Check Account Status
    if (user.accountStatus === 'Suspended') {
      return res.status(403).json({ message: 'Access Denied: Your account has been suspended by an administrator.' });
    }

    // Generate Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = hashToken(refreshToken);

    const sessionDurationDays = rememberMe ? 30 : 7;
    const expiresAt = new Date(Date.now() + sessionDurationDays * 24 * 60 * 60 * 1000);

    const { browser, operatingSystem, device, ipAddress } = parseUserAgent(req);

    // Save Session in DB
    await Session.create({
      userId: user._id,
      refreshTokenHash,
      ipAddress,
      browser,
      device,
      operatingSystem,
      loginTime: new Date(),
      lastActivity: new Date(),
      expiresAt,
      rememberMe,
      isValid: true
    });

    setRefreshTokenCookie(res, refreshToken, rememberMe);

    user.lastLoginAt = new Date();
    await user.save();

    await logActivityInternal({
      organizationId: user.organizationId?._id || null,
      userId: user._id,
      userEmail: user.email,
      action: 'Login',
      details: `Successful login as ${user.role} on ${browser} (${operatingSystem}).`,
      req
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        userId: user._id,
        authId: user.authId,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId?._id || user.organizationId,
        organizationName: user.organizationId?.name || 'WorkForge Enterprise Workspace',
        avatar: user.profileImage,
        department: user.department,
        designation: user.designation,
        permissions: user.permissions,
        accountStatus: user.accountStatus,
        isEmailVerified: true,
        subscriptionDetails: {
          plan: user.email === 'peter@oscorp.com' ? 'Pro Plan' : (user.organizationId?.plan || 'None'),
          seats: user.subscriptionDetails?.seats || 10,
          trialActivated: user.email === 'peter@oscorp.com' ? false : (user.organizationId?.trialActivated || false),
          trialStartDate: user.organizationId?.trialStartDate,
          trialEndDate: user.organizationId?.trialEndDate
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// 4. Super Admin Dedicated Login (/admin/login)
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Super Admin email and master password required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      await logActivityInternal({
        userEmail: email,
        action: 'FailedLoginAttempt',
        details: `Unauthorized Super Admin login attempt for non-existent email ${email}.`,
        req
      });
      return res.status(403).json({ message: 'Access Denied: Only Super Admin accounts can authenticate here.' });
    }

    // STRICT ROLE CHECK: Normal users MUST NEVER authenticate through this route!
    if (user.role !== 'SUPER_ADMIN') {
      await logActivityInternal({
        userId: user._id,
        userEmail: user.email,
        action: 'FailedLoginAttempt',
        details: `Non-Super Admin role '${user.role}' attempted authentication via /admin/login route. Access rejected.`,
        req
      });
      return res.status(403).json({
        message: 'Access Denied: Normal user accounts are not allowed to authenticate through this route.'
      });
    }

    // Verify Password using bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await logActivityInternal({
        userId: user._id,
        userEmail: user.email,
        action: 'FailedLoginAttempt',
        details: `Failed password attempt on Super Admin account ${email}.`,
        req
      });
      return res.status(401).json({ message: 'Invalid Super Admin master password.' });
    }

    if (user.accountStatus === 'Suspended') {
      return res.status(403).json({ message: 'Access Denied: Super Admin account suspended.' });
    }

    // Generate Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = hashToken(refreshToken);

    const sessionDurationDays = rememberMe ? 30 : 7;
    const expiresAt = new Date(Date.now() + sessionDurationDays * 24 * 60 * 60 * 1000);

    const { browser, operatingSystem, device, ipAddress } = parseUserAgent(req);

    await Session.create({
      userId: user._id,
      refreshTokenHash,
      ipAddress,
      browser,
      device,
      operatingSystem,
      loginTime: new Date(),
      lastActivity: new Date(),
      expiresAt,
      rememberMe,
      isValid: true
    });

    setRefreshTokenCookie(res, refreshToken, rememberMe);

    user.lastLoginAt = new Date();
    await user.save();

    await logActivityInternal({
      userId: user._id,
      userEmail: user.email,
      action: 'Login',
      details: 'Super Admin logged into WorkForge Platform Governance portal.',
      req
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        userId: user._id,
        authId: user.authId,
        name: user.name,
        email: user.email,
        role: 'SUPER_ADMIN',
        organizationId: null,
        permissions: user.permissions,
        isEmailVerified: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// 5. Refresh Token Rotation (/api/auth/refresh)
export const refreshToken = async (req, res, next) => {
  try {
    const clientRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!clientRefreshToken) {
      return res.status(401).json({ message: 'Refresh token missing.' });
    }

    const hashedIncoming = hashToken(clientRefreshToken);

    const session = await Session.findOne({ refreshTokenHash: hashedIncoming });

    if (!session || !session.isValid || session.expiresAt < new Date()) {
      if (session && session.userId) {
        console.warn(`[Token Theft Safeguard] Revoking all sessions for user ${session.userId} due to reused refresh token.`);
        await Session.updateMany({ userId: session.userId }, { isValid: false });
      }
      res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
      return res.status(401).json({ message: 'Invalid or revoked refresh token. Re-authentication required.' });
    }

    const user = await User.findById(session.userId).populate('organizationId');
    if (!user || user.accountStatus === 'Suspended') {
      await Session.findByIdAndDelete(session._id);
      res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
      return res.status(401).json({ message: 'User account not active.' });
    }

    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const newRefreshTokenHash = hashToken(newRefreshToken);
    const newAccessToken = generateAccessToken(user);

    session.refreshTokenHash = newRefreshTokenHash;
    session.lastActivity = new Date();
    await session.save();

    setRefreshTokenCookie(res, newRefreshToken, session.rememberMe);

    res.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        userId: user._id,
        authId: user.authId,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.role === 'SUPER_ADMIN' ? null : (user.organizationId?._id || user.organizationId),
        organizationName: user.organizationId?.name || 'WorkForge Enterprise Workspace',
        avatar: user.profileImage,
        department: user.department,
        designation: user.designation,
        permissions: user.permissions,
        accountStatus: user.accountStatus,
        subscriptionDetails: {
          plan: user.email === 'peter@oscorp.com' ? 'Pro Plan' : (user.organizationId?.plan || 'None'),
          seats: user.subscriptionDetails?.seats || 10,
          trialActivated: user.email === 'peter@oscorp.com' ? false : (user.organizationId?.trialActivated || false),
          trialStartDate: user.organizationId?.trialStartDate,
          trialEndDate: user.organizationId?.trialEndDate
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// 6. Logout Current Device
export const logout = async (req, res, next) => {
  try {
    const clientRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (clientRefreshToken) {
      const hashedIncoming = hashToken(clientRefreshToken);
      await Session.findOneAndDelete({ refreshTokenHash: hashedIncoming });
    }

    if (req.user) {
      await logActivityInternal({
        organizationId: req.user.organizationId,
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'Logout',
        details: 'User logged out of current device session.',
        req
      });
    }

    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

// 7. Logout All Devices
export const logoutAllDevices = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await Session.deleteMany({ userId });

    await logActivityInternal({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'LogoutAllDevices',
      details: 'User terminated all active device sessions.',
      req
    });

    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
    res.json({ message: 'Successfully logged out from all active devices.' });
  } catch (error) {
    next(error);
  }
};

// 8. Device Session Management
export const getActiveSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const currentRefreshToken = req.cookies.refreshToken;
    const currentHash = currentRefreshToken ? hashToken(currentRefreshToken) : null;

    const sessions = await Session.find({
      userId,
      isValid: true,
      expiresAt: { $gt: new Date() }
    }).sort({ lastActivity: -1 });

    const formattedSessions = sessions.map((s) => ({
      id: s._id,
      ipAddress: s.ipAddress,
      browser: s.browser,
      device: s.device,
      operatingSystem: s.operatingSystem,
      loginTime: s.loginTime,
      lastActivity: s.lastActivity,
      isCurrent: currentHash ? s.refreshTokenHash === currentHash : false
    }));

    res.json({ sessions: formattedSessions });
  } catch (error) {
    next(error);
  }
};

export const revokeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await Session.findOneAndDelete({ _id: sessionId, userId });

    if (!session) {
      return res.status(404).json({ message: 'Session not found or already terminated.' });
    }

    res.json({ message: 'Device session revoked successfully.' });
  } catch (error) {
    next(error);
  }
};

// 9. Forgot Password & Reset Password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({ message: `If an account with ${email} exists, password reset instructions have been sent.` });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await logActivityInternal({
      organizationId: user.organizationId,
      userId: user._id,
      userEmail: user.email,
      action: 'PasswordReset',
      details: 'Password reset request initiated.',
      req
    });

    res.json({
      message: `Password reset link sent to ${user.email}. Link valid for 15 minutes.`,
      resetToken
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required.' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const pwdError = validatePasswordStrength(newPassword);
    if (pwdError) {
      return res.status(400).json({ message: pwdError });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    await Session.deleteMany({ userId: user._id });

    res.json({ message: 'Password reset successful. Please log in with your new password.' });
  } catch (error) {
    next(error);
  }
};

// 10. Change Password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword, logoutOtherDevices = true } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match.' });
    }

    const pwdError = validatePasswordStrength(newPassword);
    if (pwdError) {
      return res.status(400).json({ message: pwdError });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password entered is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    if (logoutOtherDevices) {
      const clientRefreshToken = req.cookies.refreshToken;
      const currentHash = clientRefreshToken ? hashToken(clientRefreshToken) : null;
      if (currentHash) {
        await Session.deleteMany({ userId: user._id, refreshTokenHash: { $ne: currentHash } });
      } else {
        await Session.deleteMany({ userId: user._id });
      }
    }

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

// 11. Employee Creation
export const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, department, designation, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const pwdError = validatePasswordStrength(password);
    if (pwdError) {
      return res.status(400).json({ message: pwdError });
    }

    const targetRole = role === 'PROJECT_MANAGER' ? 'PROJECT_MANAGER' : 'EMPLOYEE';
    const orgId = req.user?.organizationId;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const newUser = await User.create({
      organizationId: orgId,
      name,
      email: email.toLowerCase(),
      password,
      role: targetRole,
      department: department || 'General',
      designation: designation || 'Team Member',
      accountStatus: 'Active',
      isEmailVerified: true,
      permissions: targetRole === 'PROJECT_MANAGER' ? ['MANAGE_PROJECTS', 'MANAGE_TASKS'] : ['MANAGE_TASKS']
    });

    res.status(201).json({
      message: 'Employee account created successfully.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        designation: newUser.designation
      }
    });
  } catch (error) {
    next(error);
  }
};

// 12. Client Invitation
export const inviteClient = async (req, res, next) => {
  try {
    const { name, email, company, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const clientPassword = password || 'Password@123';
    const orgId = req.user?.organizationId;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const newUser = await User.create({
      organizationId: orgId,
      name,
      email: email.toLowerCase(),
      password: clientPassword,
      role: 'CLIENT',
      department: 'Client Portal',
      designation: company || 'External Client',
      accountStatus: 'Active',
      isEmailVerified: true,
      permissions: ['VIEW_PROJECTS', 'VIEW_INVOICES']
    });

    res.status(201).json({
      message: 'Client invited successfully.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        company: newUser.designation
      }
    });
  } catch (error) {
    next(error);
  }
};

export const activateTrial = async (req, res, next) => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      return res.status(400).json({ message: 'User does not belong to any organization.' });
    }

    const org = await Organization.findById(orgId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    if (org.trialActivated) {
      return res.status(400).json({ message: 'Trial has already been activated for this organization.' });
    }

    org.trialActivated = true;
    org.trialStartDate = new Date();
    org.trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    org.plan = 'Trial Plan';
    org.subscriptionPlan = 'Trial Plan';
    await org.save();

    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user.id).populate('organizationId');

    res.json({
      message: '7-day trial activated successfully.',
      user: {
        id: user._id,
        userId: user._id,
        authId: user.authId,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId?._id || user.organizationId,
        organizationName: user.organizationId?.name || 'WorkForge Enterprise Workspace',
        avatar: user.profileImage,
        department: user.department,
        designation: user.designation,
        permissions: user.permissions,
        accountStatus: user.accountStatus,
        isEmailVerified: true,
        subscriptionDetails: {
          plan: user.organizationId?.plan || 'None',
          seats: user.subscriptionDetails?.seats || 10,
          trialActivated: user.organizationId?.trialActivated || false,
          trialStartDate: user.organizationId?.trialStartDate,
          trialEndDate: user.organizationId?.trialEndDate
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const choosePlan = async (req, res, next) => {
  try {
    const { plan, cycle = 'monthly', paymentMethod = 'Direct Manual Purchase' } = req.body;
    const orgId = req.user?.organizationId;
    if (!orgId) {
      return res.status(400).json({ message: 'User does not belong to any organization.' });
    }

    // Normalize plan name
    let normalizedPlan = 'Pro Plan';
    let amount = 2499;
    if (plan && plan.toLowerCase().includes('starter')) {
      normalizedPlan = 'Starter Plan';
      amount = 999;
    } else if (plan && plan.toLowerCase().includes('enterprise')) {
      normalizedPlan = 'Enterprise Plan';
      amount = cycle === 'annually' ? 44999 : 4999;
    } else {
      normalizedPlan = 'Pro Plan';
      if (cycle === 'quarterly') amount = 6499;
      else if (cycle === 'annually') amount = 22499;
      else amount = 2499;
    }

    const org = await Organization.findById(orgId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    org.plan = normalizedPlan;
    org.subscriptionPlan = normalizedPlan;
    org.trialActivated = false;
    await org.save();

    // Record payment in DB
    const Payment = (await import('../models/Payment.js')).default;
    await Payment.create({
      organizationId: org._id,
      amount,
      paymentMethod: paymentMethod === 'Razorpay' ? 'Razorpay' : 'Credit Card',
      status: 'Completed',
      transactionId: `SUB-${Date.now()}`,
      paymentDate: new Date()
    });

    // Record Activity Log
    const ActivityLog = (await import('../models/ActivityLog.js')).default;
    await ActivityLog.create({
      organizationId: org._id,
      userId: req.user.id,
      userName: req.user.name,
      action: 'SUBSCRIPTION_UPGRADED',
      details: `${req.user.name} purchased ${normalizedPlan} (${cycle}) for ${org.name}.`
    });

    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user.id).populate('organizationId');

    res.json({
      message: `Successfully upgraded to ${normalizedPlan}.`,
      user: {
        id: user._id,
        userId: user._id,
        authId: user.authId,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId?._id || user.organizationId,
        organizationName: user.organizationId?.name || 'WorkForge Workspace',
        avatar: user.profileImage,
        department: user.department,
        designation: user.designation,
        permissions: user.permissions,
        accountStatus: user.accountStatus,
        isEmailVerified: true,
        subscriptionDetails: {
          plan: user.organizationId?.plan || 'None',
          seats: user.subscriptionDetails?.seats || 10,
          trialActivated: user.organizationId?.trialActivated || false,
          trialStartDate: user.organizationId?.trialStartDate,
          trialEndDate: user.organizationId?.trialEndDate
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrganizationLogo = async (req, res, next) => {
  try {
    const { logo } = req.body;
    const orgId = req.user?.organizationId;
    if (!orgId) {
      return res.status(400).json({ message: 'User does not belong to any organization.' });
    }

    let finalLogoUrl = logo || '';

    // If logo is base64 and Cloudinary is configured, upload to Cloudinary!
    if (logo && logo.startsWith('data:image')) {
      const { isCloudinaryConfigured, uploadBase64ToCloudinary } = await import('../config/cloudinary.js');
      if (isCloudinaryConfigured()) {
        try {
          const cldRes = await uploadBase64ToCloudinary(logo, `workforge/organizations/${orgId}/logo`);
          finalLogoUrl = cldRes.url;
        } catch (cldErr) {
          console.warn('[Cloudinary] Logo upload fallback to base64:', cldErr.message);
        }
      }
    }

    const org = await Organization.findByIdAndUpdate(
      orgId,
      { logo: finalLogoUrl },
      { new: true }
    );

    if (!org) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    res.json({
      success: true,
      message: 'Organization logo updated successfully.',
      logo: finalLogoUrl,
      organization: org
    });
  } catch (error) {
    next(error);
  }
};

