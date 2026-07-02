const { google } = require('googleapis');
const UserProfile = require('../models/UserProfile');
const { encrypt, decrypt } = require('./cryptoService');

const createOAuth2Client = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

const getAccessToken = async (user) => {
  if (!user?.googleRefreshToken) {
    throw new Error('Gmail not connected. Please sign in again.');
  }

  const oauth2Client = createOAuth2Client();
  const decryptedToken = decrypt(user.googleRefreshToken);
  oauth2Client.setCredentials({ refresh_token: decryptedToken });

  const { token } = await oauth2Client.getAccessToken();
  if (!token) {
    throw new Error('Failed to refresh Gmail access token');
  }

  return token;
};

const persistRefreshToken = async (userId, refreshToken) => {
  if (!refreshToken) return;

  const encryptedToken = encrypt(refreshToken);
  await UserProfile.findByIdAndUpdate(userId, {
    googleRefreshToken: encryptedToken,
  });
};

module.exports = { getAccessToken, persistRefreshToken, createOAuth2Client };
