import express from "express";
import dotenv from "dotenv";
import smsRoutes from "./routes/smsRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import raidRoutes from "./routes/raidRoutes.js";

import otpRoutes from "./routes/otp.js";
import cors from "cors"; // ✅ import cors
import donationRoutes from "./routes/donationRoutes.js";
import Stripe from "stripe";   // ✅ correct import
import productRoutes from "./routes/productRoutes.js";
import paypalDonationRoutes from "./routes/paypalDonationRoutes.js"; // PayPal
import pushRoutes from "./routes/pushRoutes.js";
dotenv.config();

// ✅ Initialize Stripe once
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
// ✅ Allow requests from all domains (CORS)
app.use(cors({ origin: "*" }));
app.use(express.json());

// Let Render provide the correct port
const PORT = process.env.PORT || 3000;

// Register routes
app.use("/api", smsRoutes);
app.use("/api", pushRoutes);

app.use("/api", locationRoutes);
app.use("/api", raidRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api", donationRoutes); // optional if you move donation logic into routes
app.use("/api/products", productRoutes);
// Use PayPal donation routes
app.use("/api/donation/paypal", paypalDonationRoutes);

// Root route for Render health check or manual test
app.get("/", (req, res) => {
  res.send("✅ IceRaider backend is running");
});



// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running and listening on port ${PORT}`);
});
