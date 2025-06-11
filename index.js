import express from 'express';
import dotenv from 'dotenv';
import smsRoutes from './routes/smsRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import raidRoutes from './routes/raidRoutes.js';

dotenv.config();
const app = express();
app.use(express.json());

// Register routes
app.use('/api', smsRoutes);
app.use('/api', locationRoutes);
app.use('/api', raidRoutes);
app.get('/', (req, res) => {
  res.send('IceRaider backend running');
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`✅ OTP API running on http://localhost:${PORT}`));
