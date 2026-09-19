import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  hours: { type: Number, default: 1 },
  quantity: { type: Number, default: 1 },
  rate: { type: Number, default: 0 },
  amount: { type: Number, default: 0 }
});

const invoiceSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue', 'Draft', 'Sent'],
      default: 'Pending'
    },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    items: [invoiceItemSchema],
    taxRate: { type: Number, default: 10 },
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    notes: { type: String, default: '' },
    paymentMethod: { type: String, default: 'Bank Transfer' }
  },
  { timestamps: true }
);

invoiceSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

export default mongoose.model('Invoice', invoiceSchema);
