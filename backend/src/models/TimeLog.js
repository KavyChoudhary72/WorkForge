import mongoose from 'mongoose';

const timeLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    userName: { type: String, default: '' },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    projectName: { type: String, default: '' },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    taskTitle: { type: String, default: '' },
    description: { type: String, default: '' },
    durationSeconds: { type: Number, required: true, default: 0 },
    hours: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    billable: { type: Boolean, default: true },
    hourlyRate: { type: Number, default: 85 },
    totalAmount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('TimeLog', timeLogSchema);
