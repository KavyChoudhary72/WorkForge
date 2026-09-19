import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    refreshTokenHash: {
      type: String,
      required: true,
      index: true
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    browser: {
      type: String,
      default: 'Unknown Browser'
    },
    device: {
      type: String,
      default: 'Desktop'
    },
    operatingSystem: {
      type: String,
      default: 'Unknown OS'
    },
    loginTime: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    rememberMe: {
      type: Boolean,
      default: false
    },
    isValid: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Session', sessionSchema);
