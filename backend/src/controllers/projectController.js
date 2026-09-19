import Project from '../models/Project.js';
import { logActivity } from '../middleware/activityLogger.js';
import { emitTenantEvent } from '../config/socket.js';

export const getProjects = async (req, res, next) => {
  try {
    const filter = req.user.role === 'SUPER_ADMIN' ? {} : { organizationId: req.user.organizationId };
    const projects = await Project.find(filter)
      .populate('clientId', 'name company email')
      .populate('assignedTeam', 'name email profileImage designation role')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { organizationId, ...projectData } = req.body;
    const project = await Project.create({
      ...projectData,
      organizationId: req.user.organizationId
    });

    await logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ProjectCreated',
      details: `Project '${project.name}' created by ${req.user.name}.`,
      req
    });

    emitTenantEvent(req.user.organizationId, 'project_created', project);

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const filter = req.user.role === 'SUPER_ADMIN' 
      ? { _id: req.params.id } 
      : { _id: req.params.id, organizationId: req.user.organizationId };

    const project = await Project.findOne(filter)
      .populate('clientId', 'name company email')
      .populate('assignedTeam', 'name email profileImage designation role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied.' });
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { organizationId, ...updateData } = req.body;
    const filter = req.user.role === 'SUPER_ADMIN'
      ? { _id: req.params.id }
      : { _id: req.params.id, organizationId: req.user.organizationId };

    const project = await Project.findOneAndUpdate(filter, updateData, {
      new: true,
      runValidators: true
    }).populate('assignedTeam', 'name email profileImage designation role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied.' });
    }

    await logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ProjectUpdated',
      details: `Project '${project.name}' status set to ${project.status}.`,
      req
    });

    emitTenantEvent(req.user.organizationId, 'project_updated', project);

    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const filter = req.user.role === 'SUPER_ADMIN'
      ? { _id: req.params.id }
      : { _id: req.params.id, organizationId: req.user.organizationId };

    const project = await Project.findOneAndDelete(filter);
    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied.' });
    }

    await logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ProjectDeleted',
      details: `Project '${project.name}' was removed.`,
      req
    });

    emitTenantEvent(req.user.organizationId, 'project_deleted', { id: req.params.id });

    res.json({ message: 'Project removed successfully.' });
  } catch (error) {
    next(error);
  }
};
