import Attendance from '../models/Attendance.js';

export const getAttendance = async (req, res, next) => {
  try {
    const filter = req.user.role === 'SUPER_ADMIN' ? {} : { organizationId: req.user.organizationId };
    
    // Support filtering by employee userId or specific date if passed
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    if (req.query.date) {
      const startOfDay = new Date(req.query.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(req.query.date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }
    
    const records = await Attendance.find(filter)
      .populate('userId', 'name email role department designation')
      .sort({ date: -1 });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

export const recordAttendance = async (req, res, next) => {
  try {
    const { userId, date, status, checkIn, checkOut } = req.body;
    
    // Default target date is today
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const targetUserId = userId || req.user.id;
    const organizationId = req.user.organizationId;
    
    // Upsert attendance for target user and day
    const record = await Attendance.findOneAndUpdate(
      {
        organizationId,
        userId: targetUserId,
        date: { $gte: startOfDay, $lte: endOfDay }
      },
      {
        organizationId,
        userId: targetUserId,
        date: targetDate,
        status: status || 'Present',
        checkIn: checkIn ? new Date(checkIn) : undefined,
        checkOut: checkOut ? new Date(checkOut) : undefined
      },
      { upsert: true, new: true }
    );
    
    res.status(200).json(record);
  } catch (error) {
    next(error);
  }
};
