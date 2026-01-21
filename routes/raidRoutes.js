import express from "express";
import { upload } from "../middlewares/upload.js";
import { reportRaid } from "../controllers/raidController.js";

const router = express.Router();

// 👇 matches your frontend FormData.append("files", ...)
router.post("/report-raid", upload.array("files"), reportRaid);

export default router;
