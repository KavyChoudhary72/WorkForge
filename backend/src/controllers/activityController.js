import ActivityLog from '../models/ActivityLog.js';

export const getActivityLogs = async (req, res, next) => {
  try {
    const filter = req.user.role === 'SUPER_ADMIN' ? {} : { organizationId: req.user.organizationId };
    
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', 'name email role');
      
    res.json(logs);
  } catch (error) {
    next(error);
  }
};
