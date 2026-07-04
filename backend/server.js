require('dotenv').config();

const mongoose = require('mongoose');
const { validateEnv } = require('./src/config/env');
validateEnv();

const connectDB = require('./src/config/db');
const app = require('./src/app');
const seedTemplates = require('./src/seeds/templates');

const PORT = process.env.PORT || 5000;
const SHUTDOWN_TIMEOUT_MS = 10000;

let server;

const startServer = async () => {
  try {
    await connectDB();
    await seedTemplates();

    server = app.listen(PORT, () => {
      console.log(`✓ OutreachIQ API running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully`);

  // Force exit if graceful shutdown takes too long
  const forceExit = setTimeout(() => {
    console.error('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  if (server) {
    server.close(async () => {
      try {
        await mongoose.connection.close();
      } catch (err) {
        console.error('Error closing MongoDB connection:', err.message);
      }
      clearTimeout(forceExit);
      process.exit(0);
    });
  } else {
    clearTimeout(forceExit);
    process.exit(0);
  }
};

// Graceful shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Catch unhandled errors to prevent silent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit — log and let the error handler deal with it
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Exit on uncaught exceptions — the process is in an undefined state
  process.exit(1);
});

startServer();
