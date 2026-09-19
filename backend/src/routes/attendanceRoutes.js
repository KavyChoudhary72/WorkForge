import express from 'express';
import { getAttendance, recordAttendance } from '../controllers/attendanceController.js';
import { protect, enforceTenantIsolation } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, enforceTenantIsolation);

router
  .route('/')
  .get(getAttendance)
  .post(recordAttendance);

export default router;
