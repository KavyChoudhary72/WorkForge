import LeaveRequest from '../models/LeaveRequest.js';
import { logActivity } from '../middleware/activityLogger.js';
import { emitTenantEvent } from '../config/socket.js';

export const getLeaveRequests = async (req, res, next) => {
  try {
    const filter = req.user.role === 'SUPER_ADMIN' ? {} : { organizationId: req.user.organizationId };
    
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }

    const leaves = await LeaveRequest.find(filter)
      .populate('userId', 'name email role department designation profileImage')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    next(error);
  }
};

export const createLeaveRequest = async (req, res, next) => {
  try {
    const { type, startDate, endDate, days, reason } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required.' });
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const diffTime = Math.abs(eDate - sDate);
    const calculatedDays = days || Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const leave = await LeaveRequest.create({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      name: req.user.name,
      type: type || 'Casual Leave',
      startDate: sDate,
      endDate: eDate,
      days: calculatedDays,
      reason: reason || 'Personal Leave',
      status: 'Pending'
    });

    emitTenantEvent(req.user.organizationId, 'leave_requested', leave);

    res.status(201).json(leave);
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const filter = req.user.role === 'SUPER_ADMIN' ? { _id: id } : { _id: id, organizationId: req.user.organizationId };

    const leave = await LeaveRequest.findOneAndUpdate(
      filter,
      {
        status,
        approvedBy: req.user.id
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found or access denied.' });
    }

    emitTenantEvent(req.user.organizationId, 'leave_status_updated', leave);

    res.json(leave);
  } catch (error) {
    next(error);
  }
};
