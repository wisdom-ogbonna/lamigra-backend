import nodemailer from "nodemailer";

const otpStore = {}; // Replace with Redis/DB in production

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  const otp = generateOTP();
  otpStore[email] = { otp, createdAt: Date.now() };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your LAMIGRA Verification Code",
    text: `Your OTP code is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent to " + email });
  } catch (error) {
    console.error(error);
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
