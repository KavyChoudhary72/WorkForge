import express from 'express';
import {
  getClients,
  createClient,
  updateClient,
  toggleArchiveClient,
  deleteClient
} from '../controllers/clientController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getClients)
  .post(createClient);

router
  .route('/:id')
  .put(updateClient)
  .delete(deleteClient);

router.put('/:id/archive', toggleArchiveClient);

export default router;
