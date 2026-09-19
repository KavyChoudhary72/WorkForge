import express from 'express';
import { getUsers, updateUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getUsers);
router.put('/profile', updateUserProfile);

export default router;
