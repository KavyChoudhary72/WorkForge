import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  addTaskComment
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(createTask);

router
  .route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.post('/:id/comments', addTaskComment);

export default router;
