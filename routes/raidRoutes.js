import express from 'express';
import { reportRaid } from '../controllers/raidController.js';

const router = express.Router();

router.post('/report-raid', reportRaid);

export default router;
