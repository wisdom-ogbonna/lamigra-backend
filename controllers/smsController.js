import dotenv from 'dotenv';
dotenv.config();
import twilio from 'twilio';
import { db } from '../config/firebase.js';
import jwt from 'jsonwebtoken'; // 👈 import JWT

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const otpStore = new Map(); // Temporary in-memory store

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const isExpired = (expiresAt) => Date.now() > expiresAt;

export const sendCode = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  const otp = generateOTP();
  const expiresAt = Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES) * 60 * 1000;

  try {
    await client.messages.create({
      body: `Your verification code is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    otpStore.set(phoneNumber, { otp, expiresAt });

    // Optionally save to Firestore
    await db.collection('otp_verifications').doc(phoneNumber).set({ otp, expiresAt });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

export const verifyCode = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ message: 'Phone number and OTP are required' });
  }

  const record = otpStore.get(phoneNumber) ||
    (await db.collection('otp_verifications').doc(phoneNumber).get()).data();

  if (!record) {
    return res.status(400).json({ message: 'No OTP found for this number' });
  }

  if (isExpired(record.expiresAt)) {
    otpStore.delete(phoneNumber);
    await db.collection('otp_verifications').doc(phoneNumber).delete();
    return res.status(400).json({ message: 'OTP has expired' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // ✅ OTP is valid
  otpStore.delete(phoneNumber);
  await db.collection('otp_verifications').doc(phoneNumber).delete();

  // ✅ Create a JWT with the phone number
  const token = jwt.sign(
    { phoneNumber },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '10m' }
  );

  return res.status(200).json({
    message: 'OTP verified successfully',
    token // send to client
  });
};

