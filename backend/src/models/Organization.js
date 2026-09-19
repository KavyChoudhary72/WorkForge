import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: false },
    logo: { type: String, default: '' },
    industry: { type: String, default: 'General Industry' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    plan: { type: String, default: 'None' },
    subscriptionPlan: { type: String, default: 'None' },
    employeeCount: { type: Number, default: 10 },
    activeUsersCount: { type: Number, default: 10 },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Inactive'],
      default: 'Active'
    },
    departments: [{ type: String }],
    storageUsedGB: { type: Number, default: 0 },
    storageUsageGB: { type: Number, default: 0 },
    storageLimitGB: { type: Number, default: 100 },
    mrr: { type: Number, default: 0 },
    trialActivated: { type: Boolean, default: false },
    trialStartDate: { type: Date },
    trialEndDate: { type: Date },
    integrations: {
      type: Map,
      of: {
        status: { type: String, enum: ['Connected', 'Disconnected'], default: 'Disconnected' },
        config: { type: mongoose.Schema.Types.Mixed, default: {} }
      },
      default: {}
    }
  },
  { timestamps: true }
);

export default mongoose.model('Organization', organizationSchema);
