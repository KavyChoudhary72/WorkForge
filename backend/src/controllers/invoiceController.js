import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import Project from '../models/Project.js';
import { logActivity } from '../middleware/activityLogger.js';
import { emitTenantEvent } from '../config/socket.js';

export const getInvoices = async (req, res, next) => {
  try {
    const filter = req.user.role === 'SUPER_ADMIN' ? {} : { organizationId: req.user.organizationId };
    
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }
    if (req.query.clientId) {
      filter.clientId = req.query.clientId;
    }

    const invoices = await Invoice.find(filter)
      .populate('clientId', 'name company email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req, res, next) => {
  try {
    const { organizationId, ...invoiceData } = req.body;

    // Clean up empty strings to prevent Mongoose CastErrors
    if (invoiceData.projectId === '') {
      delete invoiceData.projectId;
    }
    if (invoiceData.clientId === '') {
      delete invoiceData.clientId;
    }

    if (!invoiceData.clientId) {
      return res.status(400).json({ message: 'A valid Client must be selected to create an invoice.' });
    }
    
    // Map lineItems to items array
    const items = invoiceData.lineItems || invoiceData.items || [];
    const formattedItems = items.map(item => ({
      description: item.description || 'General Services',
      hours: item.quantity || item.hours || 1,
      quantity: item.quantity || item.hours || 1,
      rate: item.rate || 0,
      amount: item.amount || ((item.quantity || item.hours || 1) * (item.rate || 0)) || 0
    }));

    const amount = invoiceData.subtotal || invoiceData.amount || formattedItems.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = invoiceData.taxRate !== undefined ? invoiceData.taxRate : 10;
    const taxAmount = invoiceData.taxAmount !== undefined ? invoiceData.taxAmount : (amount * taxRate) / 100;
    const discountAmount = invoiceData.discountAmount || invoiceData.discount || 0;
    const totalAmount = invoiceData.totalAmount || (amount + taxAmount - discountAmount);

    // Generate unique invoice number if not provided
    const count = await Invoice.countDocuments();
    const invoiceNumber = invoiceData.invoiceNumber || `INV-2026-${String(count + 1).padStart(3, '0')}`;

    const invoice = await Invoice.create({
      ...invoiceData,
      invoiceNumber,
      amount,
      taxRate,
      taxAmount,
      discount: discountAmount,
      discountAmount,
      totalAmount,
      items: formattedItems,
      dueDate: invoiceData.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      organizationId: req.user.organizationId
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('clientId', 'name company email')
      .populate('projectId', 'name');

    await logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'InvoiceCreated',
      details: `Invoice #${invoice.invoiceNumber} created for ₹${invoice.totalAmount}.`,
      req
    });

    emitTenantEvent(req.user.organizationId, 'invoice_created', populatedInvoice);

    res.status(201).json(populatedInvoice);
  } catch (error) {
    next(error);
  }
};

export const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['Paid', 'Pending', 'Overdue', 'Draft', 'Sent'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }
    
    const filter = req.user.role === 'SUPER_ADMIN' ? { _id: id } : { _id: id, organizationId: req.user.organizationId };
    
    const invoice = await Invoice.findOneAndUpdate(
      filter,
      { status },
      { new: true, runValidators: true }
    )
      .populate('clientId', 'name company email')
      .populate('projectId', 'name');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found or access denied.' });
    }

    await logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'InvoiceStatusUpdate',
      details: `Invoice #${invoice.invoiceNumber} status marked as ${status}.`,
      req
    });

    emitTenantEvent(req.user.organizationId, 'invoice_updated', invoice);

    if (status === 'Paid') {
      emitTenantEvent(req.user.organizationId, 'invoice_paid', invoice);
    }
    
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};
