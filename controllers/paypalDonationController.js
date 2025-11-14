// controllers/paypalDonationController.js

import paypal from "@paypal/checkout-server-sdk";
import dotenv from "dotenv";

dotenv.config();

// PAYPAL ENVIRONMENT
const environment =
  process.env.PAYPAL_MODE === "live"
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      );

const client = new paypal.core.PayPalHttpClient(environment);

// --------------------------------------------------------
// CREATE DONATION ORDER
// --------------------------------------------------------
export const createPaypalDonation = async (req, res) => {
  try {
    const { amount, currency = "USD", description = "Donation" } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Donation amount required" });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");

    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          description,
          amount: {
            currency_code: currency,
            value: amount,
          },
        },
      ],
    });

    const order = await client.execute(request);

    res.status(201).json({
      success: true,
      orderID: order.result.id,
    });
  } catch (error) {
    console.error("PayPal Create Order Error:", error);
    res.status(500).json({ message: "PayPal create order failed", error });
  }
};

// --------------------------------------------------------
// CAPTURE DONATION PAYMENT
// --------------------------------------------------------
export const capturePaypalDonation = async (req, res) => {
  try {
    const { orderID } = req.body;

    if (!orderID) {
      return res.status(400).json({ message: "orderID is required" });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await client.execute(request);

    res.status(200).json({
      success: true,
      message: "Donation captured successfully",
      data: capture.result,
    });
  } catch (error) {
    console.error("PayPal Capture Error:", error);
    res.status(500).json({ message: "PayPal capture failed", error });
  }
};
