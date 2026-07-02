const pdfParse = require('pdf-parse');
const UserProfile = require('../models/UserProfile');
const groqService = require('../services/groqService');

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

    // Upsert user profile with extracted data
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { googleId: req.user.googleId },
      {
        $set: {
          name: parsed.name || req.user.name,
          skills: parsed.skills || [],
          projects: parsed.projects || [],
          summary: parsed.summary || '',
          rawText,
          updatedAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    return res.json(updatedProfile);
  } catch (error) {
    console.error('Resume parse error:', error.message);
    return res.status(500).json({ error: true, message: 'Failed to parse resume' });
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ googleId: req.user.googleId });
    if (!profile) {
      return res.status(404).json({ error: true, message: 'Profile not found' });
    }
    return res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error.message);
    return res.status(500).json({ error: true, message: 'Failed to fetch profile' });
  }
};

module.exports = { parseResume, getProfile };
