import Client from '../models/Client.js';

export const getClients = async (req, res, next) => {
  try {
    const filter = req.user.role === 'SUPER_ADMIN' ? {} : { organizationId: req.user.organizationId };

    // Support filtering by archived status (default to active/non-archived unless requested)
    if (req.query.archived === 'true') {
      filter.isArchived = true;
    } else if (req.query.archived === 'all') {
      // Return both
    } else {
      filter.isArchived = { $ne: true };
    }

    if (req.query.industry && req.query.industry !== 'All') {
      filter.industry = req.query.industry;
    }

    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: regex }, { company: regex }, { email: regex }];
    }

    const clients = await Client.find(filter).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

export const createClient = async (req, res, next) => {
  try {
    const { organizationId, ...clientData } = req.body;
    const client = await Client.create({
      ...clientData,
      gstNumber: clientData.gstNumber || clientData.gst || clientData.taxId || '',
      taxId: clientData.taxId || clientData.gst || clientData.gstNumber || '',
      organizationId: req.user.organizationId
    });
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = req.user.role === 'SUPER_ADMIN' ? { _id: id } : { _id: id, organizationId: req.user.organizationId };

    const updateData = { ...req.body };
    if (updateData.gst || updateData.gstNumber) {
      updateData.gstNumber = updateData.gstNumber || updateData.gst;
      updateData.taxId = updateData.taxId || updateData.gstNumber;
    }

    const client = await Client.findOneAndUpdate(filter, updateData, {
      new: true,
      runValidators: true
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found or access denied.' });
    }

    res.json(client);
  } catch (error) {
    next(error);
  }
};

export const toggleArchiveClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = req.user.role === 'SUPER_ADMIN' ? { _id: id } : { _id: id, organizationId: req.user.organizationId };

    const client = await Client.findOne(filter);
    if (!client) {
      return res.status(404).json({ message: 'Client not found or access denied.' });
    }

    client.isArchived = !client.isArchived;
    client.status = client.isArchived ? 'Archived' : 'Active';
    await client.save();

    res.json(client);
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = req.user.role === 'SUPER_ADMIN' ? { _id: id } : { _id: id, organizationId: req.user.organizationId };

    const client = await Client.findOneAndDelete(filter);
    if (!client) {
      return res.status(404).json({ message: 'Client not found or access denied.' });
    }

    res.json({ message: 'Client record removed successfully.' });
  } catch (error) {
    next(error);
  }
};
