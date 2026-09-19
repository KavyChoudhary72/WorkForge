import express from 'express';
import {
  getAllOrganizations,
  createOrganization,
  updateOrganizationStatus,
  upgradeOrganizationPlan,
  deleteOrganization,
  getAdminAnalytics,
  getAuditLogs
} from '../controllers/adminController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict Super Admin Access Only
router.use(protect, requireRole('SUPER_ADMIN'));

router.get('/organizations', getAllOrganizations);
router.post('/organizations', createOrganization);
router.put('/organizations/:id/status', updateOrganizationStatus);
router.put('/organizations/:id/plan', upgradeOrganizationPlan);
router.delete('/organizations/:id', deleteOrganization);
router.get('/analytics', getAdminAnalytics);
router.get('/audit-logs', getAuditLogs);

export default router;
