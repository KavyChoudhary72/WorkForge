import express from 'express';
import { getActivityLogs } from '../controllers/activityController.js';
import { protect, enforceTenantIsolation } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, enforceTenantIsolation);

router.get('/', getActivityLogs);

export default router;
