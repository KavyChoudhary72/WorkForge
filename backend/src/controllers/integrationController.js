import Organization from '../models/Organization.js';

/**
 * Helper to mask sensitive keys before sending config to client
 */
const sanitizeIntegrationConfig = (config = {}) => {
  const sanitized = { ...config };
  if (sanitized.razorpaySecret) {
    sanitized.razorpaySecret = '••••••••';
  }
  return sanitized;
};

/**
 * @desc Get all connected third-party integrations for tenant organization
 * @route GET /api/integrations
 */
export const getIntegrations = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.user.organizationId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found.' });
    }
    
    const integrations = org.integrations || new Map();
    const result = {};

    for (const [key, value] of integrations.entries()) {
      result[key] = {
        status: value?.status || 'Disconnected',
        config: sanitizeIntegrationConfig(value?.config || {})
      };
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Toggle connection status of an integration
 * @route POST /api/integrations/:id/toggle
 */
export const toggleIntegration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const org = await Organization.findById(req.user.organizationId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    if (!org.integrations) {
      org.integrations = new Map();
    }

    const current = org.integrations.get(id) || { status: 'Disconnected', config: {} };
    const nextStatus = current.status === 'Connected' ? 'Disconnected' : 'Connected';
    
    org.integrations.set(id, {
      status: nextStatus,
      config: current.config || {}
    });

    await org.save();
    res.json({
      id,
      status: nextStatus,
      config: sanitizeIntegrationConfig(current.config || {})
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Save integration credentials/configuration safely
 * @route PUT /api/integrations/:id/config
 */
export const saveIntegrationConfig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { config } = req.body;
    const org = await Organization.findById(req.user.organizationId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    if (!org.integrations) {
      org.integrations = new Map();
    }

    const current = org.integrations.get(id) || { status: 'Disconnected', config: {} };
    
    // Only update secret if user provided a new real secret (not masked bullets)
    const updatedConfig = { ...current.config, ...config };
    if (config?.razorpaySecret && config.razorpaySecret.includes('•')) {
      updatedConfig.razorpaySecret = current.config?.razorpaySecret || '';
    }

    org.integrations.set(id, {
      status: current.status,
      config: updatedConfig
    });

    await org.save();
    res.json({
      id,
      status: current.status,
      config: sanitizeIntegrationConfig(updatedConfig)
    });
  } catch (error) {
    next(error);
  }
};
