import Task from '../models/Task.js';
import { logActivity } from '../middleware/activityLogger.js';
import { emitTenantEvent } from '../config/socket.js';

export const getTasks = async (req, res, next) => {
  try {
    const filter = req.user.role === 'SUPER_ADMIN' ? {} : { organizationId: req.user.organizationId };
    
    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
    }
    
    const tasks = await Task.find(filter)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email profileImage designation')
      .populate('comments.userId', 'name email profileImage')
      .sort({ createdAt: -1 });
      
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { organizationId, ...taskData } = req.body;
    const task = await Task.create({
      ...taskData,
      organizationId: req.user.organizationId
    });

    const populatedTask = await Task.findById(task._id)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email profileImage');

    await logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'TaskCreated',
      details: `Task '${task.title}' created in project.`,
      req
    });

    emitTenantEvent(req.user.organizationId, 'task_created', populatedTask);

    res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = req.user.role === 'SUPER_ADMIN' ? { _id: id } : { _id: id, organizationId: req.user.organizationId };
    
    const task = await Task.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true
    })
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email profileImage');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found or access denied.' });
    }

    await logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'TaskUpdated',
      details: `Task '${task.title}' status updated to ${task.status}.`,
      req
    });

    emitTenantEvent(req.user.organizationId, 'task_updated', task);
    
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const addTaskComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const filter = req.user.role === 'SUPER_ADMIN' ? { _id: id } : { _id: id, organizationId: req.user.organizationId };
    const task = await Task.findOne(filter);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const comment = {
      userId: req.user.id,
      userName: req.user.name,
      text: text.trim(),
      createdAt: new Date()
    };

    task.comments.push(comment);
    await task.save();

    emitTenantEvent(req.user.organizationId, 'task_comment_added', { taskId: id, comment });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = req.user.role === 'SUPER_ADMIN' ? { _id: id } : { _id: id, organizationId: req.user.organizationId };
    
    const task = await Task.findOneAndDelete(filter);
    if (!task) {
      return res.status(404).json({ message: 'Task not found or access denied.' });
    }

    await logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'TaskDeleted',
      details: `Task '${task.title}' was deleted.`,
      req
    });

    emitTenantEvent(req.user.organizationId, 'task_deleted', { id });
    
    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
