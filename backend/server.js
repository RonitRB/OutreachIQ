require('dotenv').config();

const mongoose = require('mongoose');
const { validateEnv } = require('./src/config/env');
validateEnv();

const connectDB = require('./src/config/db');
const app = require('./src/app');
const seedTemplates = require('./src/seeds/templates');

const PORT = process.env.PORT || 5000;

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
  if (server) {
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
