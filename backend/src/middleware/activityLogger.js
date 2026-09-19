import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async ({ organizationId = null, userId = null, userEmail = '', action, details = '', req = null }) => {
  try {
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req?.headers['user-agent'] || '';

    await ActivityLog.create({
      organizationId,
      userId,
      userEmail,
      action,
      details,
      ipAddress,
      userAgent
    });
  } catch (error) {
    console.error('[ActivityLog Error]', error.message);
  }
};
