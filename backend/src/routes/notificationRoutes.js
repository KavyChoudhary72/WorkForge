import express from 'express';
import {
  getNotifications,
  createNotification,
  markNotificationRead
} from '../controllers/notificationController.js';
import { protect, enforceTenantIsolation } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, enforceTenantIsolation);

router
  .route('/')
  .get(getNotifications)
  .post(createNotification);

router
  .route('/:id/read')
  .put(markNotificationRead);

export default router;
