import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Testing', 'Completed', 'On Hold', 'Delivered', 'Cancelled'],
      default: 'Planning'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    budget: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    startDate: { type: Date },
    dueDate: { type: Date },
    endDate: { type: Date },
    progress: { type: Number, default: 0 },
    assignedTeam: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        size: { type: String, default: '0 KB' },
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

projectSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

export default mongoose.model('Project', projectSchema);
