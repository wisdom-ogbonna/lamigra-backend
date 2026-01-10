import axios from "axios";

const otpStore = {}; // Replace with Redis/DB in production

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const otp = generateOTP();
    otpStore[email] = { otp, createdAt: Date.now() };

    // Send email using Resend API
    await axios.post(
      "https://api.resend.com/emails",
      {
        from: "Lamigra <info@lamigraapp.com>", // works instantly
        to: [email],
        subject: "Your LAMIGRA Verification Code",
        html: `
          <h2>LAMIGRA Verification</h2>
          <p>Your OTP code is:</p>
          <h1>${otp}</h1>
          <p>This code expires in 5 minutes.</p>
        `,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true, message: "OTP sent to " + email });
  } catch (error) {
    console.error("Resend API error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

export const verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore[email];

  if (!record || record.otp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  const age = Date.now() - record.createdAt;
  if (age > 5 * 60 * 1000) {
    delete otpStore[email];
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  delete otpStore[email];
  res.json({ success: true, message: "OTP verified" });
};
