import Organization from '../models/Organization.js';

export const getIntegrations = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.user.organizationId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found.' });
    }
    
    // If integrations map doesn't exist, return empty object
    const integrations = org.integrations || new Map();
    res.json(Object.fromEntries(integrations));
  } catch (error) {
    next(error);
  }
};

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
    res.json({ id, status: nextStatus, config: current.config });
  } catch (error) {
    next(error);
  }
};

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
    
    org.integrations.set(id, {
      status: current.status,
      config: { ...current.config, ...config }
    });

    await org.save();
    res.json({ id, status: current.status, config: org.integrations.get(id).config });
  } catch (error) {
    next(error);
  }
};
