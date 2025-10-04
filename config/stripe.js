import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("⚠️ STRIPE_SECRET_KEY is not set in your .env file");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Do NOT specify apiVersion
export default stripe;
