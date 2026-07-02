const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'SESSION_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'GROQ_API_KEY',
  'ADZUNA_APP_ID',
  'ADZUNA_APP_KEY',
  'FRONTEND_URL',
];

const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter(
    (key) => !process.env[key] || process.env[key].trim() === ''
  );

  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach((key) => console.error(`  - ${key}`));
    process.exit(1);
  }
};

module.exports = { validateEnv, REQUIRED_ENV_VARS };
