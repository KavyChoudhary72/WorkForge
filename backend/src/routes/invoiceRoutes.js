import express from 'express';
import {
  getInvoices,
  createInvoice,
  updateInvoiceStatus
} from '../controllers/invoiceController.js';
import { protect, enforceTenantIsolation } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, enforceTenantIsolation);

router
  .route('/')
  .get(getInvoices)
  .post(createInvoice);

router
  .route('/:id/status')
  .put(updateInvoiceStatus);

export default router;
