// server/server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes.js');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Routes ---
app.use('/api/auth', authRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully! ✅');
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message} ❌`);
    process.exit(1);
  }
};

// Connect to the database
connectDB();

// A simple test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server
// This is the crucial line that keeps the server running
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});