const gmailService = require('../services/gmailService');
const googleAuthService = require('../services/googleAuthService');
const logger = require('../utils/logger');


const createDraft = async (req, res) => {
  try {
    const { subject, body, to } = req.body;

    if (!subject || !body) {
      return res.status(400).json({ error: true, message: 'Subject and body are required' });
    }

    let accessToken;
    try {
      accessToken = await googleAuthService.getAccessToken(req.user);
    } catch (tokenError) {
      return res.status(401).json({
        error: true,
        message: 'Gmail session expired, please reconnect',
      });
    }

    const result = await gmailService.createDraft(accessToken, { subject, body, to });
    return res.json(result);
  } catch (error) {
    logger.error('Create draft error', { error: error.message, userId: req.user?._id });

    if (error.code === 401 || error.response?.status === 401) {
      return res.status(401).json({
        error: true,
        message: 'Gmail session expired, please reconnect',
      });
    }

    return res.status(500).json({ error: true, message: 'Failed to create Gmail draft' });
  }
};

module.exports = { createDraft };
