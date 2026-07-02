const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const mongoose = require('mongoose');
const multer = require('multer');
const configurePassport = require('./config/passport');

// Route imports
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const jobsRoutes = require('./routes/jobs');
const emailRoutes = require('./routes/email');
const gmailRoutes = require('./routes/gmail');
const trackerRoutes = require('./routes/tracker');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, message: 'Too many auth attempts, please try again later' },
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, message: 'Too many requests, please try again later' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, message: 'Too many requests, please try again later' },
});

const gmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, message: 'Too many Gmail requests, please try again later' },
});

// Sessions with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

// Passport
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'OutreachIQ API' });
});

app.get('/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    if (dbState !== 1) {
      return res.status(503).json({ status: 'error', db: 'disconnected' });
    }
    await mongoose.connection.db.admin().ping();
    return res.json({ status: 'ok', db: 'connected' });
  } catch {
    return res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// Mount routes
app.use('/auth', authLimiter, authRoutes);
app.use('/resume', aiLimiter, resumeRoutes);
app.use('/jobs', apiLimiter, jobsRoutes);
app.use('/email', aiLimiter, emailRoutes);
app.use('/gmail', gmailLimiter, gmailRoutes);
app.use('/tracker', apiLimiter, trackerRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: true, message: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: true, message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: true, message: err.message });
  }

  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: true, message: err.message });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: true, message: 'Internal server error' });
});

module.exports = app;
