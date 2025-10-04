// routes/donationRoutes.js
import express from "express";
import { createPaymentIntent } from "../controllers/donationController.js";

const router = express.Router();

// POST /api/donations/create-payment-intent
router.post("/create-payment-intent", createPaymentIntent);

export default router;
