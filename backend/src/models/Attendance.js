import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    status: {
      type: String,
      required: true,
      enum: ['Present', 'Absent', 'Late', 'Leave'],
      default: 'Present'
    },
    checkIn: {
      type: Date
    },
    checkOut: {
      type: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model('Attendance', attendanceSchema);
