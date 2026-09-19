import express from 'express';
import {
  runProjectHealthAudit,
  runTaskEstimation,
  runMeetingNotesSummarizer
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/health-audit', runProjectHealthAudit);
router.post('/estimate-task', runTaskEstimation);
router.post('/summarize-notes', runMeetingNotesSummarizer);

export default router;
