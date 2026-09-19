import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Client from '../models/Client.js';
import Invoice from '../models/Invoice.js';
import ActivityLog from '../models/ActivityLog.js';
import { logActivity } from '../middleware/activityLogger.js';

// Get All Organizations (Super Admin Governance)
export const getAllOrganizations = async (req, res, next) => {
  try {
    const orgs = await Organization.find().sort({ createdAt: -1 });
    res.json(orgs);
  } catch (error) {
    next(error);
  }
};

// Create / Provision New Tenant Organization (Super Admin)
export const createOrganization = async (req, res, next) => {
  try {
    const { name, slug, industry, email, phone, plan, storageLimitGB, departments } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Organization name is required.' });
    }

    const orgSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const existing = await Organization.findOne({ slug: orgSlug });
    if (existing) {
      return res.status(400).json({ message: `Organization with slug '${orgSlug}' already exists.` });
    }

    const planTier = plan || 'Starter';
    const limitGB = storageLimitGB || (planTier === 'Enterprise' ? 100 : planTier === 'Pro Plan' ? 50 : 10);
    const mrr = planTier === 'Enterprise' ? 2499 : planTier === 'Pro Plan' ? 899 : 299;

    const org = await Organization.create({
      name,
      slug: orgSlug,
      industry: industry || 'General Business',
      email: email || '',
      phone: phone || '',
      plan: planTier,
      subscriptionPlan: planTier,
      storageLimitGB: limitGB,
      mrr,
      departments: departments ? (Array.isArray(departments) ? departments : departments.split(',').map(d => d.trim())) : ['Engineering', 'Operations', 'Sales'],
      status: 'Active'
    });

    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'AccountCreation',
      details: `Super Admin provisioned new tenant organization '${org.name}' (${org.slug}).`,
      req
    });

    res.status(201).json(org);
  } catch (error) {
    next(error);
  }
};

// Update Organization Status / Suspension
export const updateOrganizationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const org = await Organization.findByIdAndUpdate(id, { status }, { new: true });
    if (!org) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'TenantSuspension',
      details: `Super Admin updated status of organization '${org.name}' to ${status}.`,
      req
    });

    res.json(org);
  } catch (error) {
    next(error);
  }
};

// Upgrade / Modify Tenant Plan (Super Admin)
export const upgradeOrganizationPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { plan, storageLimitGB } = req.body;

    if (!plan) {
      return res.status(400).json({ message: 'Plan tier is required.' });
    }

    const limitGB = storageLimitGB || (plan === 'Enterprise' ? 100 : plan === 'Pro Plan' ? 50 : 10);
    const mrr = plan === 'Enterprise' ? 2499 : plan === 'Pro Plan' ? 899 : 299;

    const org = await Organization.findByIdAndUpdate(
      id,
      {
        plan,
        subscriptionPlan: plan,
        storageLimitGB: limitGB,
        mrr
      },
      { new: true }
    );

    if (!org) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'RoleChange',
      details: `Super Admin upgraded organization '${org.name}' to ${plan} (${limitGB} GB Quota).`,
      req
    });

    res.json(org);
  } catch (error) {
    next(error);
  }
};

// Delete Organization (Super Admin)
export const deleteOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;

    const org = await Organization.findById(id);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    // Cascade delete tenant records
    await Promise.all([
      User.deleteMany({ organizationId: id }),
      Project.deleteMany({ organizationId: id }),
      Task.deleteMany({ organizationId: id }),
      Client.deleteMany({ organizationId: id }),
      Invoice.deleteMany({ organizationId: id }),
      Organization.findByIdAndDelete(id)
    ]);

    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'TenantSuspension',
      details: `Super Admin permanently deleted organization '${org.name}' and all associated tenant data.`,
      req
    });

    res.json({ message: `Organization '${org.name}' and all related records deleted successfully.` });
  } catch (error) {
    next(error);
  }
};

// Get Global Cross-Tenant Analytics (Super Admin)
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const [totalOrgs, activeOrgs, suspendedOrgs, totalUsers, totalProjects, totalInvoices] = await Promise.all([
      Organization.countDocuments(),
      Organization.countDocuments({ status: 'Active' }),
      Organization.countDocuments({ status: 'Suspended' }),
      User.countDocuments({ role: { $ne: 'SUPER_ADMIN' } }),
      Project.countDocuments(),
      Invoice.countDocuments()
    ]);

    const orgs = await Organization.find();
    const totalMRR = orgs.reduce((acc, o) => acc + (o.mrr || 0), 0);
    const totalStorageUsedGB = orgs.reduce((acc, o) => acc + (o.storageUsedGB || o.storageUsageGB || 0), 0);
    const totalStorageLimitGB = orgs.reduce((acc, o) => acc + (o.storageLimitGB || 100), 0);

    res.json({
      totalOrgs,
      activeOrgs,
      suspendedOrgs,
      totalUsers,
      totalProjects,
      totalInvoices,
      totalMRR,
      totalStorageUsedGB,
      totalStorageLimitGB
    });
  } catch (error) {
    next(error);
  }
};

// Get Global Audit Logs across all tenants
export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('organizationId', 'name')
      .populate('userId', 'name email role');
    res.json(logs);
  } catch (error) {
    next(error);
  }
};
