import express from 'express';
import {
  registerCompany,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  adminLogin,
  refreshToken,
  logout,
  logoutAllDevices,
  getActiveSessions,
  revokeSession,
  forgotPassword,
  resetPassword,
  changePassword,
  createEmployee,
  inviteClient,
  activateTrial,
  choosePlan
} from '../controllers/authController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Authentication Endpoints
router.post('/register-company', registerCompany);
router.get('/verify-email', verifyEmail);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/login', loginUser);
router.post('/admin-login', adminLogin);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected Authentication & Session Endpoints
router.post('/logout-all', protect, logoutAllDevices);
router.get('/sessions', protect, getActiveSessions);
router.delete('/sessions/:sessionId', protect, revokeSession);
router.post('/change-password', protect, changePassword);

// Protected Onboarding Endpoints
router.post('/create-employee', protect, requireRole('COMPANY_ADMIN', 'SUPER_ADMIN'), createEmployee);
router.post('/invite-client', protect, requireRole('COMPANY_ADMIN', 'SUPER_ADMIN'), inviteClient);
router.post('/activate-trial', protect, activateTrial);
router.post('/choose-plan', protect, choosePlan);

// Fetch current user details
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

export default router;
