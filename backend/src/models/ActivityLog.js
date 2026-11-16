import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    userEmail: {
      type: String,
      default: ''
    },
    userName: {
      type: String,
      default: ''
    },
    action: {
      type: String,
      required: true
    },
    details: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

activityLogSchema.index({ organizationId: 1, createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
