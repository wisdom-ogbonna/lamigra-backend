import fetch from "node-fetch";

// Helper: Get PayPal access token
const getPaypalAccessToken = async () => {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${process.env.PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token;
};

// Controller: Create PayPal transaction
export const createPaypalTransaction = async (req, res) => {
  try {
    const { amount, donor } = req.body;
    if (!amount || !donor?.name || !donor?.email) {
      return res.status(400).json({ error: "Missing amount or donor info" });
    }

    const accessToken = await getPaypalAccessToken();

    const response = await fetch(`${process.env.PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: { currency_code: "USD", value: parseFloat(amount).toFixed(2) },
            description: `Donation from ${donor.name}`,
          },
        ],
        application_context: {
          return_url: "https://yourapp.com/paypal-success",
          cancel_url: "https://yourapp.com/paypal-cancel",
        },
      }),
    });

    const data = await response.json();
    const approvalUrl = data.links.find(link => link.rel === "approve")?.href;

    if (!approvalUrl) throw new Error("No approval URL found");

    res.json({ approvalUrl });
  } catch (err) {
    console.error("PayPal error:", err);
    res.status(500).json({ error: err.message || "PayPal error" });
  }
};
