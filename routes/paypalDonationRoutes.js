// routes/paypalDonationRoutes.js

import express from "express";
import {
  createPaypalDonation,
  capturePaypalDonation,
} from "../controllers/paypalDonationController.js";

const router = express.Router();

// Create PayPal donation order
router.post("/create", createPaypalDonation);

// Capture PayPal donation after approval
router.post("/capture", capturePaypalDonation);

export default router;
