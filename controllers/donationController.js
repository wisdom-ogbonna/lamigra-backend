// controllers/donationController.js
import stripe from "../config/stripe.js";

export const createPaymentIntent = async (req, res) => {
  try {
   const { amount, name, email } = req.body;


    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid donation amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount), // cents
      currency: "usd",
      payment_method_types: ["card"],
      metadata: {
        donor_name: name || "Anonymous",
        donor_email: email || "N/A",
      },
      receipt_email: email || undefined,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
};
