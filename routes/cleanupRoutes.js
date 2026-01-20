import express from "express";
import { cleanupExpiredRaids } from "../controllers/cleanupController.js";

const router = express.Router();

router.get("/cleanup-expired-raids", cleanupExpiredRaids);

export default router;
