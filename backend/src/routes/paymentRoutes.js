import express from 'express';
import { 
  getPayments, 
  createPayment, 
  createRazorpayOrder, 
  verifyRazorpayPayment,
  createSubscriptionOrder,
  verifySubscriptionPayment 
} from '../controllers/paymentController.js';
import { protect, enforceTenantIsolation } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, enforceTenantIsolation);

router
  .route('/')
  .get(getPayments)
  .post(createPayment);

router.post('/razorpay-order', createRazorpayOrder);
router.post('/razorpay-verify', verifyRazorpayPayment);
router.post('/subscription-order', createSubscriptionOrder);
router.post('/subscription-verify', verifySubscriptionPayment);

export default router;
