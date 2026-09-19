import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    authId: {
      type: String,
      default: function () {
        return `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      },
      index: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null // Null for SUPER_ADMIN
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'PROJECT_MANAGER', 'EMPLOYEE', 'CLIENT'],
      default: 'EMPLOYEE'
    },
    profileImage: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: 'General'
    },
    designation: {
      type: String,
      default: 'Team Member'
    },
    phone: {
      type: String,
      default: ''
    },
    permissions: [
      {
        type: String
      }
    ],
    accountStatus: {
      type: String,
      enum: ['Active', 'Suspended', 'PendingVerification'],
      default: 'Active'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      default: null
    },
    verificationTokenExpires: {
      type: Date,
      default: null
    },
    passwordResetToken: {
      type: String,
      default: null
    },
    passwordResetExpires: {
      type: Date,
      default: null
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    subscriptionDetails: {
      plan: { type: String, default: 'Starter' },
      seats: { type: Number, default: 10 }
    }
  },
  { timestamps: true }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
