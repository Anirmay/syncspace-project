# SyncSpace 🚀

A modern collaborative workspace management platform for real-time team collaboration, task management, and communication. Built with cutting-edge web technologies for seamless productivity and synchronization.

**Live Demo:**
- 🌐 **Frontend**: [anirmay-syncspace.netlify.app](https://anirmay-syncspace.netlify.app)
- 🔌 **Backend API**: [syncspace-project.onrender.com](https://syncspace-project.onrender.com)

---

## Features

### 🤝 Real-Time Collaboration
- WebSocket integration with Socket.IO for live updates
- Real-time messaging and notifications
- Instant workspace synchronization
- Live user presence indicators

### 📋 Task Management
- Create, read, update, and delete tasks
- Drag-and-drop task organization with dnd-kit
- Task assignment and tracking
- Priority and status management
- Task filtering and search

### 🏢 Workspace Management
- Create and manage workspaces
- Invite team members to workspaces
- Role-based access control
- Workspace settings and customization

### 💬 Communication
- Real-time messaging system
- Direct user-to-user messages
- File sharing and uploads
- Message history
- Email notifications via Nodemailer

### 👥 User Management
- User registration and authentication
- JWT-based session management
- User profiles
- Team member management
- Account security with bcryptjs password hashing

### 📁 File Management
- File upload and download
- Document sharing within workspaces
- File organization

### 🔔 Notifications
- Real-time notifications
- Email notifications
- Notification preferences
- Activity tracking

### 💄 Modern UI/UX
- Smooth animations with Framer Motion
- Drag-and-drop interfaces
- Responsive design with Tailwind CSS
- Scroll animations with AOS
- Beautiful component library

---

## Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router v7** - Navigation and routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **dnd-kit** - Drag and drop functionality
- **Axios** - HTTP client for API calls
- **AOS** - Scroll animations
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time WebSocket communication
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload middleware
- **Nodemailer** - Email notifications
- **CORS** - Cross-origin resource sharing
- **Cookie-parser** - Cookie handling

---

## Project Structure

```
syncspace-project/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Route pages/screens
│   │   ├── context/          # React context for state management
│   │   ├── utils/            # Utility functions
│   │   ├── assets/           # Images, icons, etc.
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # Entry point
│   │   ├── index.css         # Global styles
│   │   └── App.css           # App styles
│   ├── public/               # Static files
│   ├── vite.config.js        # Vite configuration
│   ├── tailwind.config.js    # Tailwind CSS config
│   ├── postcss.config.js     # PostCSS config
│   ├── package.json
│   └── index.html            # HTML entry point
│
├── server/                    # Node.js backend (Express)
│   ├── controllers/          # Route handlers and business logic
│   ├── routes/               # API route definitions
│   ├── models/               # MongoDB Mongoose schemas
│   ├── middleware/           # Custom middleware (auth, etc.)
│   ├── uploads/              # Uploaded files storage
│   ├── server.js             # Express server entry point
│   ├── .env                  # Environment variables
│   └── package.json
│
├── netlify.toml              # Netlify deployment config
└── .git/                     # Git repository
```

---

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (for database)
- Git

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Anirmay/syncspace-project.git
cd syncspace-project
```

#### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/syncspace

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
CLIENT_URL=http://localhost:5173

# Email (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=./uploads
```

#### 3. Setup Frontend

```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000
```

#### 4. Run Locally

**Terminal 1 - Backend:**
```bash
cd server
npm run start:dev  # Uses nodemon for auto-restart
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

The frontend will be available at `http://localhost:5173`
The backend API will be available at `http://localhost:5000`

---

## Deployment

### Frontend (Netlify)
The React frontend is deployed on **Netlify**.

**Deploy Config** (`netlify.toml`):
```toml
[build]
  base = "client"
  command = "npm ci && npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Steps to Deploy:**
1. Push to GitHub repository
2. Connect repository to Netlify
3. Netlify automatically builds and deploys
4. Access at: https://anirmay-syncspace.netlify.app

### Backend (Render)
The Node.js backend is deployed on **Render**.

**Deployed at:** https://syncspace-project.onrender.com

**Steps to Deploy:**
1. Create Web Service on Render
2. Connect GitHub repository
3. Set environment variables (MONGO_URI, JWT_SECRET, etc.)
4. Set Start Command: `npm start`
5. Render auto-deploys on push to main branch
6. Access at: https://syncspace-project.onrender.com

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user account

### Workspaces
- `GET /api/workspaces` - Get all user workspaces
- `POST /api/workspaces` - Create new workspace
- `GET /api/workspaces/:id` - Get workspace details
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/reorder` - Reorder tasks (drag-drop)

### Messages
- `GET /api/messages` - Get all messages
- `POST /api/messages` - Send message
- `GET /api/messages/:id` - Get message details
- `DELETE /api/messages/:id` - Delete message

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id` - Download file
- `DELETE /api/files/:id` - Delete file

### Invitations
- `POST /api/invitations` - Send workspace invitation
- `GET /api/invitations` - Get pending invitations
- `PUT /api/invitations/:id/accept` - Accept invitation
- `PUT /api/invitations/:id/reject` - Reject invitation

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

---

## Real-Time Features (Socket.IO Events)

### Workspace Events
- `workspace:user-joined` - User joined workspace
- `workspace:user-left` - User left workspace
- `workspace:updated` - Workspace details updated

### Task Events
- `task:created` - New task created
- `task:updated` - Task details updated
- `task:deleted` - Task deleted
- `task:reordered` - Task position changed

### Message Events
- `message:sent` - New message received
- `message:updated` - Message edited
- `message:deleted` - Message deleted

### Notification Events
- `notification:new` - New notification
- `notification:read` - Notification marked as read

---

## Development

### Available Scripts

**Client:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

**Server:**
```bash
npm start        # Start server
npm run start:dev # Start with nodemon (auto-reload)
```

### Code Standards
- Use ES6+ JavaScript
- Follow Airbnb style guide
- ESLint is configured for both client and server
- Run linter before committing

---

## Environment Variables

### Server (.env)
```env
# Database
MONGO_URI=mongodb+srv://...

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Server Config
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=app-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000
```

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Performance Optimizations

- Lazy loading with React.lazy()
- Code splitting with Vite
- Image optimization
- Efficient state management with Context API
- WebSocket for real-time communication instead of polling

---

## Security

- JWT authentication for protected routes
- Password hashing with bcryptjs
- CORS configuration for secure API access
- Input validation and sanitization
- Secure cookie handling
- Environment variables for sensitive data

---

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Troubleshooting

### Backend Connection Issues
- Ensure MongoDB URI is correct in `.env`
- Check if backend is running on correct port
- Verify CORS is configured properly

### File Upload Issues
- Check file size limit in `.env`
- Ensure `uploads` directory exists
- Verify multer configuration

### Real-Time Features Not Working
- Check Socket.IO connection
- Verify both client and server are running
- Check browser console for errors

---

## License

This project is licensed under the ISC License.

---

## Author

Created with ❤️ by **Anirmay Khan**

---

## Support

For support, email me or open an issue on GitHub.

---

## Roadmap

- [ ] Dark mode theme
- [ ] Advanced analytics dashboard
- [ ] Calendar view for tasks
- [ ] Video conferencing integration
- [ ] Mobile app (React Native)
- [ ] Offline mode support
- [ ] Advanced search with filters
- [ ] Custom workflows and automation

---

## Changelog

### v1.0.0
- Initial release
- Core task management
- Real-time messaging
- Workspace collaboration
- User authentication
