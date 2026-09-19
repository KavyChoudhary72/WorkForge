import Payment from '../models/Payment.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Invoice from '../models/Invoice.js';
import Organization from '../models/Organization.js';

export const getPayments = async (req, res, next) => {
  try {
    const filter = req.user.role === 'SUPER_ADMIN' ? {} : { organizationId: req.user.organizationId };
    const payments = await Payment.find(filter)
      .populate('invoiceId', 'invoiceNumber amount status')
      .populate('clientId', 'name company')
      .sort({ paymentDate: -1, createdAt: -1 });
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

export const createPayment = async (req, res, next) => {
  try {
    const { organizationId, ...paymentData } = req.body;
    const payment = await Payment.create({
      ...paymentData,
      organizationId: req.user.organizationId
    });
    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { invoiceId } = req.body;

    // 1. Fetch organization to get custom integrations config
    const org = await Organization.findById(req.user.organizationId);
    const rzpIntegration = org?.integrations?.get('razorpay');
    
    let keyId = process.env.RAZORPAY_KEY_ID;
    let secretKey = process.env.RAZORPAY_SECRET;

    // Use organization specific credentials if available and connected
    if (rzpIntegration && rzpIntegration.status === 'Connected') {
      if (rzpIntegration.config?.razorpayKeyId && rzpIntegration.config?.razorpaySecret) {
        keyId = rzpIntegration.config.razorpayKeyId;
        secretKey = rzpIntegration.config.razorpaySecret;
      }
    }

    if (!keyId || !secretKey || keyId === 'rzp_test_YourKeyIdHere') {
      return res.status(400).json({ message: 'Razorpay API credentials are not configured or still have default placeholders.' });
    }

    // 2. Fetch Invoice
    const invoice = await Invoice.findOne({ _id: invoiceId, organizationId: req.user.organizationId });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    // 3. Initialize Razorpay SDK
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: secretKey
    });

    // Amount needs to be in paise (smallest currency unit in INR)
    const options = {
      amount: Math.round(invoice.totalAmount * 100),
      currency: 'INR',
      receipt: `receipt_inv_${invoice.invoiceNumber}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    next(error);
  }
};

export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { invoiceId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // 1. Retrieve Secret
    const org = await Organization.findById(req.user.organizationId);
    const rzpIntegration = org?.integrations?.get('razorpay');

    let secretKey = process.env.RAZORPAY_SECRET;

    if (rzpIntegration && rzpIntegration.status === 'Connected' && rzpIntegration.config?.razorpaySecret) {
      secretKey = rzpIntegration.config.razorpaySecret;
    }

    // 2. Verify Signature
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // 3. Find invoice & client
    const invoice = await Invoice.findOne({ _id: invoiceId, organizationId: req.user.organizationId });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    // 4. Update Invoice status to Paid
    invoice.status = 'Paid';
    await invoice.save();

    // 5. Create Payment record in DB
    const payment = await Payment.create({
      organizationId: req.user.organizationId,
      invoiceId,
      clientId: invoice.clientId,
      amount: invoice.totalAmount,
      paymentMethod: 'Razorpay',
      status: 'Completed',
      transactionId: razorpayPaymentId,
      paymentDate: new Date()
    });

    res.status(200).json({ success: true, payment });
  } catch (error) {
    next(error);
  }
};

export const createSubscriptionOrder = async (req, res, next) => {
  try {
    const { planName, cycle } = req.body;

    const org = await Organization.findById(req.user.organizationId);
    let keyId = process.env.RAZORPAY_KEY_ID;
    let secretKey = process.env.RAZORPAY_SECRET;

    if (org?.integrations?.get('razorpay')?.status === 'Connected') {
      const config = org.integrations.get('razorpay').config;
      if (config?.razorpayKeyId && config?.razorpaySecret) {
        keyId = config.razorpayKeyId;
        secretKey = config.razorpaySecret;
      }
    }

    if (!keyId || !secretKey || keyId === 'rzp_test_YourKeyIdHere') {
      return res.status(400).json({ message: 'Razorpay API credentials are not configured.' });
    }

    let amount = 2499; // Default Monthly
    if (cycle === 'quarterly') amount = 6499;
    else if (cycle === 'annually') amount = 22499;

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: secretKey
    });

    const options = {
      amount: Math.round(amount * 100), // In paise
      currency: 'INR',
      receipt: `receipt_sub_${req.user.id}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    next(error);
  }
};

export const verifySubscriptionPayment = async (req, res, next) => {
  try {
    const { planName, cycle, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const org = await Organization.findById(req.user.organizationId);
    let secretKey = process.env.RAZORPAY_SECRET;

    if (org?.integrations?.get('razorpay')?.status === 'Connected' && org.integrations.get('razorpay').config?.razorpaySecret) {
      secretKey = org.integrations.get('razorpay').config.razorpaySecret;
    }

    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed.' });
    }

    // Upgrade Organization Plan in DB
    if (org) {
      org.plan = planName || 'Pro Plan';
      org.subscriptionPlan = planName || 'Pro Plan';
      await org.save();
    }

    // Save payment details to Database
    let amount = 2499;
    if (cycle === 'quarterly') amount = 6499;
    else if (cycle === 'annually') amount = 22499;

    await Payment.create({
      organizationId: req.user.organizationId,
      invoiceId: null, // No specific invoice for subscription purchases
      clientId: req.user.id, // Paid by user admin
      amount,
      paymentMethod: 'Razorpay',
      status: 'Completed',
      transactionId: razorpayPaymentId,
      paymentDate: new Date()
    });

    // Populate user object to return
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user.id).populate('organizationId');

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        userId: user._id,
        authId: user.authId,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId?._id || user.organizationId,
        organizationName: user.organizationId?.name || 'WorkForge Enterprise Workspace',
        avatar: user.profileImage,
        department: user.department,
        designation: user.designation,
        permissions: user.permissions,
        accountStatus: user.accountStatus,
        isEmailVerified: true,
        subscriptionDetails: {
          plan: user.organizationId?.plan || 'None',
          seats: user.subscriptionDetails?.seats || 10,
          trialActivated: user.organizationId?.trialActivated || false,
          trialStartDate: user.organizationId?.trialStartDate,
          trialEndDate: user.organizationId?.trialEndDate
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
