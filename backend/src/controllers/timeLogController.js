import TimeLog from '../models/TimeLog.js';

export const getTimeLogs = async (req, res, next) => {
  try {
    const filter = req.user.role === 'SUPER_ADMIN' ? {} : { organizationId: req.user.organizationId };
    const logs = await TimeLog.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

export const createTimeLog = async (req, res, next) => {
  try {
    const { organizationId, ...logData } = req.body;
    const log = await TimeLog.create({
      ...logData,
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userName: req.user.name
    });
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

export const deleteTimeLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = req.user.role === 'SUPER_ADMIN' ? { _id: id } : { _id: id, organizationId: req.user.organizationId };
    
    const log = await TimeLog.findOneAndDelete(filter);
    if (!log) {
      return res.status(404).json({ message: 'Time log not found or access denied.' });
    }
    
    res.json({ message: 'Time log deleted.' });
  } catch (error) {
    next(error);
  }
};
