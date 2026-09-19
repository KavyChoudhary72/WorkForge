import express from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { protect, requireRole, enforceTenantIsolation } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, enforceTenantIsolation);

router
  .route('/')
  .get(getProjects)
  .post(requireRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'PROJECT_MANAGER'), createProject);

router
  .route('/:id')
  .get(getProjectById)
  .put(requireRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'PROJECT_MANAGER'), updateProject)
  .delete(requireRole('SUPER_ADMIN', 'COMPANY_ADMIN'), deleteProject);

export default router;
