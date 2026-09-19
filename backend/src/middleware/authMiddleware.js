import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Access token missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nexus_pulse_production_jwt_access_secret_2026_super_secure');

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload.' });
    }

    const user = await User.findById(userId).populate('organizationId');

    if (!user) {
      return res.status(401).json({ message: 'User account not found.' });
    }

    if (user.accountStatus === 'Suspended') {
      return res.status(403).json({ message: 'Access Denied: Your account has been suspended.' });
    }

    const orgId = user.role === 'SUPER_ADMIN' ? null : (user.organizationId?._id || user.organizationId || null);

    const isPeter = user.email === 'peter@oscorp.com';
    req.user = {
      id: user._id,
      userId: user._id,
      authId: user.authId,
      organizationId: orgId,
      orgDetails: user.organizationId,
      role: user.role,
      name: user.name,
      email: user.email,
      permissions: user.permissions || [],
      accountStatus: user.accountStatus,
      isEmailVerified: user.isEmailVerified,
      plan: isPeter ? 'Pro Plan' : (user.organizationId?.plan || 'None'),
      trialActivated: isPeter ? false : (user.organizationId?.trialActivated || false),
      trialStartDate: user.organizationId?.trialStartDate,
      trialEndDate: user.organizationId?.trialEndDate
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired', tokenExpired: true });
    }
    return res.status(401).json({ message: 'Invalid authentication token.' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user?.role || 'Guest'}' is not authorized for this resource.`
      });
    }
    next();
  };
};

export const enforceTenantIsolation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  if (!req.user.organizationId) {
    return res.status(403).json({ message: 'Tenant organization association missing.' });
  }

  req.tenantFilter = { organizationId: req.user.organizationId };
  next();
};
