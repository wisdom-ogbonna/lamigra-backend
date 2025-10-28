import express from "express";
import dotenv from "dotenv";
import smsRoutes from "./routes/smsRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import raidRoutes from "./routes/raidRoutes.js";
import paypalRoutes from "./routes/paypalRoutes.js";
import otpRoutes from "./routes/otp.js";
import donationRoutes from "./routes/donationRoutes.js";
import Stripe from "stripe";   // ✅ correct import
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

// ✅ Initialize Stripe once
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());

// Let Render provide the correct port
const PORT = process.env.PORT || 3000;

// Register routes
app.use("/api", smsRoutes);
app.use("/api", locationRoutes);
app.use("/api", raidRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api", donationRoutes); // optional if you move donation logic into routes
app.use("/api/products", productRoutes);

// Donation endpoint
app.post("/api/donations/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // amount in cents
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Root route for Render health check or manual test
app.get("/", (req, res) => {
  res.send("✅ IceRaider backend is running");
});

app.use("/api/paypal", paypalRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running and listening on port ${PORT}`);
});
