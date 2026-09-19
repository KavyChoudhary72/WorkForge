import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null, // Null for system/global roles
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    permissions: [
      {
        type: String
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('Role', roleSchema);
