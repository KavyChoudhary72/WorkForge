import express from 'express';
import { getFiles, createFile, uploadFile, uploadMiddleware, deleteFile, getStorageStatus } from '../controllers/fileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/storage-status', getStorageStatus);

router
  .route('/')
  .get(getFiles)
  .post(createFile);

router.post('/upload', uploadMiddleware, uploadFile);

router
  .route('/:id')
  .delete(deleteFile);

export default router;
