const { google } = require('googleapis');

const createDraft = async (accessToken, { subject, body, to = '' }) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Build RFC 2822 email
  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    body,
  ];

  const rawEmail = emailLines.join('\r\n');

  // Base64url encode
  const encodedEmail = Buffer.from(rawEmail)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: {
        raw: encodedEmail,
      },
    },
  });

  return {
    draftId: response.data.id,
    draftUrl: `https://mail.google.com/mail/#drafts/${response.data.id}`,
  };
};

module.exports = { createDraft };
