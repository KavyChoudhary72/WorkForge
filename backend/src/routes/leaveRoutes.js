import express from 'express';
import { getLeaveRequests, createLeaveRequest, updateLeaveStatus } from '../controllers/leaveController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getLeaveRequests)
  .post(createLeaveRequest);

router
  .route('/:id/status')
  .put(requireRole('COMPANY_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'), updateLeaveStatus);

export default router;
