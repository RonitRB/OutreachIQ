const pdfParse = require('pdf-parse');
const UserProfile = require('../models/UserProfile');
const groqService = require('../services/groqService');
const logger = require('../utils/logger');


const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: true, message: 'No PDF file uploaded' });
    }

    // Extract text from PDF buffer
    const pdfData = await pdfParse(req.file.buffer);
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ error: true, message: 'Could not extract text from PDF' });
    }

    // Parse resume with Groq AI
    const parsed = await groqService.parseResume(rawText);

    // Update user profile with extracted data
    const updatedProfile = await UserProfile.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          name: parsed.name || req.user.name,
          skills: parsed.skills || [],
          projects: parsed.projects || [],
          summary: parsed.summary || '',
          rawText: rawText,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return res.json(updatedProfile);
  } catch (error) {
    logger.error('Resume parse error', { error: error.message, userId: req.user?._id });
    return res.status(500).json({ error: true, message: 'Failed to parse resume' });
  }
};

const getProfile = async (req, res) => {
  try {
    // req.user is already the full UserProfile from passport deserialization
    if (!req.user) {
      return res.status(404).json({ error: true, message: 'Profile not found' });
    }
    return res.json(req.user);
  } catch (error) {
    logger.error('Get profile error', { error: error.message });
    return res.status(500).json({ error: true, message: 'Failed to fetch profile' });
  }
};

module.exports = { parseResume, getProfile };
