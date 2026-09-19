import express from 'express';
import {
  getTimeLogs,
  createTimeLog,
  deleteTimeLog
} from '../controllers/timeLogController.js';
import { protect, enforceTenantIsolation } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, enforceTenantIsolation);

router
  .route('/')
  .get(getTimeLogs)
  .post(createTimeLog);

router
  .route('/:id')
  .delete(deleteTimeLog);

export default router;
