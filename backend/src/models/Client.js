import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    name: { type: String, required: true, trim: true },
    company: { type: String, default: '' },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    taxId: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    contactPerson: { type: String, default: '' },
    notes: { type: String, default: '' },
    industry: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Active', 'Lead', 'Inactive', 'Archived'],
      default: 'Active'
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

clientSchema.index({ organizationId: 1, isArchived: 1, createdAt: -1 });

export default mongoose.model('Client', clientSchema);
