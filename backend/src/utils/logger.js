const winston = require('winston');

const { combine, timestamp, json, printf, colorize } = winston.format;

// Custom console format for development
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `[${timestamp}] ${level}: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { service: 'outreachiq-api' },
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production'
        ? combine(timestamp(), json()) // Structured JSON in production for log aggregators
        : combine(colorize(), timestamp({ format: 'HH:mm:ss' }), consoleFormat), // Readable in dev
    }),
  ],
});

module.exports = logger;
