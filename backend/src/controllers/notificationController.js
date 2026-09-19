import Notification from '../models/Notification.js';

export const getNotifications = async (req, res, next) => {
  try {
    // Only return notifications specifically for the logged-in user under their tenant
    const filter = {
      organizationId: req.user.organizationId,
      userId: req.user.id
    };
    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const { organizationId, userId, ...notifData } = req.body;
    const notification = await Notification.create({
      ...notifData,
      organizationId: req.user.organizationId,
      userId: userId || req.user.id
    });
    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = {
      _id: id,
      organizationId: req.user.organizationId,
      userId: req.user.id
    };
    
    const notification = await Notification.findOneAndUpdate(
      filter,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or access denied.' });
    }
    
    res.json(notification);
  } catch (error) {
    next(error);
  }
};
