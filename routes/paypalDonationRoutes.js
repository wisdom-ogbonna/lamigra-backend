// routes/paypalDonationRoutes.js

import express from "express";
import {
  createPaypalDonation,
  capturePaypalDonation,
} from "../controllers/paypaldonationController.js";

const router = express.Router();

// ----------------------------
// POST: Create PayPal donation order
// ----------------------------
router.post("/create", createPaypalDonation);

// POST: Capture PayPal donation after approval
router.post("/capture", capturePaypalDonation);

// ----------------------------
// Optional GET routes for PayPal redirects
// You can use these if you want to handle frontend redirect after PayPal
// ----------------------------
router.get("/success", (req, res) => {
  // PayPal returns ?token=ORDERID on redirect
  const orderID = req.query.token;
  res.send(`Donation completed! OrderID: ${orderID}`);
});

router.get("/cancel", (req, res) => {
  res.send("Donation cancelled by the user.");
});

export default router;
