import express from "express";
import { savePushToken, sendBroadcastNotification } from "../controllers/pushController.js";

const router = express.Router();

router.post("/save-push-token", savePushToken);
router.post("/send-notification", sendBroadcastNotification);

export default router;
