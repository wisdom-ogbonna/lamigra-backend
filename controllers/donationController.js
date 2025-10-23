// controllers/donationController.js
import stripe from "../config/stripe.js";

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, donor } = req.body; // ✅ NEW

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid donation amount" });
    }

    // Stripe expects amount in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount),
      currency: "usd",
      payment_method_types: ["card"],
      metadata: {
        donor_name: donor?.name || "Anonymous",
        donor_email: donor?.email || "N/A",
      },
      receipt_email: donor?.email, // Stripe will automatically send a receipt
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
};
