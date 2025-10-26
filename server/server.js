import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
// Ensure .js extension is used for local file imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
// import boardRoutes from './routes/board.routes.js';
import taskRoutes from './routes/task.routes.js';   // <-- NEW: Import task routes
import contactRoutes from './routes/contact.routes.js';

// Load environment variables
dotenv.config();


// --- Middlewares ---
// Enable Cross-Origin Resource Sharing for requests from your frontend
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
// Parse incoming requests with JSON payloads
app.use(express.json());

// --- API Routes ---
// Mount the routers on specific base paths
app.use('/api/auth', authRoutes);         // Handles /api/auth/register, /api/auth/login, etc.
app.use('/api/users', userRoutes);         // Handles /api/users/me, etc.
app.use('/api/workspaces', workspaceRoutes); // Handles /api/workspaces/, /api/workspaces/:id, and nests board routes
app.use('/api/tasks', taskRoutes);   
app.use('/api/contact', contactRoutes);

// --- Database Connection ---
const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully! ✅');
  } catch (error) {
    // Log error and exit if connection fails
    console.error(`Error connecting to MongoDB: ${error.message} ❌`);
    process.exit(1); // Exit process with failure
  }
};
connectDB(); // Call the function to establish the database connection

// --- Simple Root Route ---
// A basic route to check if the API is running
app.get('/', (req, res) => {
  res.send('API is running...');
});

// --- Start Server ---
// Start the Express server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

