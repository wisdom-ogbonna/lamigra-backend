import express from 'express';
import multer from 'multer';
import { reportRaid } from '../controllers/raidController.js';

const router = express.Router();
const upload = multer(); // memory storage by default

router.post('/report-raid', upload.single('file'), reportRaid); // ✅ attach multer middleware

export default router;
