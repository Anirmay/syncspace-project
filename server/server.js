import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Ensure .js extension is used for local file imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
// import boardRoutes from './routes/board.routes.js';
import taskRoutes from './routes/task.routes.js';   // <-- NEW: Import task routes
import contactRoutes from './routes/contact.routes.js';
import messageRoutes from './routes/message.routes.js';
import fileRoutes from './routes/file.routes.js';
// --- NEW: Import invitation routes ---
import invitationRoutes from './routes/invitation.routes.js';
import notificationRoutes from './routes/notification.routes.js';


// Load environment variables
dotenv.config();


// --- Middlewares ---
// Enable Cross-Origin Resource Sharing for requests from your frontend
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cookieParser()); 
app.use(express.json());

// Configure allowed origins dynamically and include Netlify frontend domain(s)
const allowedOrigins = [
  "http://localhost:5173",                     // Your local dev
  "https://syncspace-project.netlify.app",    // existing Netlify domain
  "https://anirmay-syncspace.netlify.app",    // the deployed frontend origin seen in the screenshot
  process.env.CLIENT_URL                          // option to set CLIENT_URL in env for flexibility
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // For debugging in logs, you might want to console.warn the blocked origin here
      callback(new Error('CORS policy: This origin is not allowed')); 
    }
  },
  credentials: true // Required for cookies to work
}));

// Ensure preflight requests are handled
app.options('*', cors());

// Parse incoming requests with JSON payloads
app.use(cookieParser());
app.use(express.json());

// --- API Routes ---
// Mount the routers on specific base paths
app.use('/api/auth', authRoutes);         // Handles /api/auth/register, /api/auth/login, etc.
app.use('/api/users', userRoutes);         // Handles /api/users/me, etc.
app.use('/api/workspaces', workspaceRoutes); // Handles /api/workspaces/, /api/workspaces/:id, and nests board routes
app.use('/api/tasks', taskRoutes);   
app.use('/api/contact', contactRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/files', fileRoutes);

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
app.get('/', (req, res) => { res.send('API is running...'); });
app.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`); });

