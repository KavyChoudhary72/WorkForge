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
      required: true,
      enum: [
        'Login',
        'Logout',
        'PasswordReset',
        'PasswordChange',
        'EmailVerification',
        'AccountCreation',
        'RoleChange',
        'SuspendedAccount',
        'FailedLoginAttempt',
        'TenantSuspension',
        'TokenRefresh',
        'SessionTimeout',
        'LogoutAllDevices',
        'TaskCreated',
        'TaskUpdated',
        'TaskDeleted',
        'ProjectCreated',
        'ProjectUpdated',
        'ProjectDeleted',
        'FileUpload',
        'FileDeleted',
        'InvoiceCreated',
        'InvoiceStatusUpdate'
      ]
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
