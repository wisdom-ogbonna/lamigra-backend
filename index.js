import express from 'express';
import dotenv from 'dotenv';
import smsRoutes from './routes/smsRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import raidRoutes from './routes/raidRoutes.js';
import otpRoutes from "./routes/otp.js";
import donateRoutes from "./routes/donate.js";

dotenv.config();

const app = express();
app.use(express.json());

// Let Render provide the correct port
const PORT = process.env.PORT || 3000;

// Register routes
app.use('/api', smsRoutes);
app.use('/api', locationRoutes);
app.use('/api', raidRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/donate", donateRoutes);

// Root route for Render health check or manual test
app.get('/', (req, res) => {
  res.send('✅ IceRaider backend is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running and listening on port ${PORT}`);
});
