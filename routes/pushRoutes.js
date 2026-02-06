import express from "express";
import { savePushToken, sendNearbyNotification } from "../controllers/pushController.js";

const router = express.Router();

router.post("/save-push-token", savePushToken);
router.post("/send-notification", sendNearbyNotification);

export default router;
