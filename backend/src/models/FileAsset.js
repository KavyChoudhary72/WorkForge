import mongoose from 'mongoose';

const fileAssetSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploaderName: { type: String, default: '' },
    name: { type: String, required: true, trim: true },
    sizeBytes: { type: Number, default: 0 },
    formattedSize: { type: String, default: '0 KB' },
    type: { type: String, default: 'application/octet-stream' },
    url: { type: String, default: '' },
    cloudinaryPublicId: { type: String, default: null },
    category: {
      type: String,
      default: 'Document'
    },
    folder: { type: String, default: 'General' },
    permissions: {
      type: String,
      enum: ['Public', 'Team Only', 'Private'],
      default: 'Team Only'
    },
    versionHistory: [
      {
        version: { type: Number, default: 1 },
        url: { type: String, required: true },
        sizeBytes: { type: Number, default: 0 },
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

fileAssetSchema.index({ organizationId: 1, folder: 1, createdAt: -1 });

export default mongoose.model('FileAsset', fileAssetSchema);
