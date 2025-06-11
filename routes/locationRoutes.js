import express from 'express';
import { updateLocation } from '../controllers/locationController.js';

const router = express.Router();

router.post('/update-location', updateLocation);

export default router;
