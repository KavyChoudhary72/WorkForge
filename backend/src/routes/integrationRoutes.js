import express from 'express';
import {
  getIntegrations,
  toggleIntegration,
  saveIntegrationConfig
} from '../controllers/integrationController.js';
import { protect, enforceTenantIsolation } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, enforceTenantIsolation);

router.get('/', getIntegrations);
router.post('/:id/toggle', toggleIntegration);
router.put('/:id/config', saveIntegrationConfig);

export default router;
