import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import tableRoutes from './routes/tables.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import billRoutes from './routes/bills.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, native apps)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost',
        'https://billing-app-hazel.vercel.app',
        'capacitor://localhost',
        'ionic://localhost',
        process.env.CLIENT_URL,
      ].filter(Boolean);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Allow any vercel.app subdomain
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      
      // Allow all for Socket.io (more permissive)
      return callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});

// Allowed origins for CORS
const allowedOrigins = [
  // Local development
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost',
  'http://127.0.0.1:5173',
  
  // Vercel web app
  'https://billing-app-hazel.vercel.app',
  
  // Capacitor mobile app origins
  'capacitor://localhost',
  'capacitor://billing-app-hazel.vercel.app',
  'ionic://localhost',
  'http://localhost:8080',
  
  // Dynamic from environment
  process.env.CLIENT_URL,
].filter(Boolean); // Remove any undefined values

// CORS middleware with dynamic origin checking
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow any vercel.app subdomain
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    // Allow any render.com subdomain
    if (origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// Handle preflight requests for all routes
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Annapoorna API is running' });
});

const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Annapoorna Server running on port ${PORT}`);
});

