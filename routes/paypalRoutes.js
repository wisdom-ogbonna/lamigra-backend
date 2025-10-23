import express from "express";
import { createPaypalTransaction } from "../controllers/paypalController.js";

const router = express.Router();

// PayPal donation
router.post("/create-transaction", createPaypalTransaction);

export default router;
