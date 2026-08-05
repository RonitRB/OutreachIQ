const Job = require('../models/Job');
const EmailTemplate = require('../models/EmailTemplate');
const groqService = require('../services/groqService');
const logger = require('../utils/logger');


const getTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find({});
    return res.json(templates);
  } catch (error) {
    logger.error('Get templates error', { error: error.message });
    return res.status(500).json({ error: true, message: 'Failed to fetch templates' });
  }
};

const generateEmail = async (req, res) => {
  try {
    const { jobId, templateId, tone } = req.body;

    if (!jobId || !templateId || !tone) {
      return res.status(400).json({
        error: true,
        message: 'jobId, templateId, and tone are required',
      });
    }

    // Fetch job by externalId
    const job = await Job.findOne({ externalId: jobId });
    if (!job) {
      return res.status(404).json({ error: true, message: 'Job not found' });
    }

    // User profile is already loaded by passport deserialization
    const userProfile = req.user;
    if (!userProfile.skills?.length && !userProfile.projects?.length) {
      return res.status(400).json({
        error: true,
        message: 'Please upload your resume first so we can personalize the email.',
      });
    }

    // Fetch template
    const template = await EmailTemplate.findOne({ templateId });
    if (!template) {
      return res.status(404).json({ error: true, message: 'Email template not found' });
    }

    // Generate email with Groq
    const email = await groqService.generateEmail({
      job,
      userProfile,
      template,
      tone,
    });

    return res.json(email);
  } catch (error) {
    logger.error('Generate email error', { error: error.message, jobId: req.body.jobId, templateId: req.body.templateId });
    return res.status(500).json({ error: true, message: 'Failed to generate email' });
  }
};

module.exports = { getTemplates, generateEmail };
