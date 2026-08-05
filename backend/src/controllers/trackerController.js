const mongoose = require('mongoose');
const AppliedJob = require('../models/AppliedJob');
const logger = require('../utils/logger');


// Strip HTML tags to prevent XSS in stored data
const sanitize = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const saveApplication = async (req, res) => {
  try {
    const applicationData = {
      userId: req.user._id,
      jobId: sanitize(req.body.jobId),
      title: sanitize(req.body.title),
      company: sanitize(req.body.company),
      location: sanitize(req.body.location),
      applyUrl: sanitize(req.body.applyUrl),
      status: req.body.status || 'draft_created',
      draftUrl: sanitize(req.body.draftUrl),
      emailSubject: sanitize(req.body.emailSubject),
      templateUsed: sanitize(req.body.templateUsed),
      toneUsed: sanitize(req.body.toneUsed),
    };

    const application = await AppliedJob.create(applicationData);
    return res.status(201).json(application);
  } catch (error) {
    logger.error('Save application error', { error: error.message, userId: req.user?._id });
    return res.status(500).json({ error: true, message: 'Failed to save application' });
  }
};

const getApplications = async (req, res) => {
  try {
    const applications = await AppliedJob.find({ userId: req.user._id }).sort({
      appliedAt: -1,
    });
    return res.json(applications);
  } catch (error) {
    logger.error('Get applications error', { error: error.message, userId: req.user?._id });
    return res.status(500).json({ error: true, message: 'Failed to fetch applications' });
  }
};

const VALID_STATUSES = ['draft_created', 'sent', 'interview', 'rejected', 'no_response'];

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: true, message: 'Invalid application ID' });
    }

    if (!status) {
      return res.status(400).json({ error: true, message: 'Status is required' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: true,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const application = await AppliedJob.findById(id);

    if (!application) {
      return res.status(404).json({ error: true, message: 'Application not found' });
    }

    // Verify ownership
    if (application.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: true, message: 'Unauthorized' });
    }

    application.status = status;
    application.updatedAt = new Date();
    await application.save();

    return res.json(application);
  } catch (error) {
    logger.error('Update status error', { error: error.message, applicationId: req.params.id });
    return res.status(500).json({ error: true, message: 'Failed to update status' });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: true, message: 'Invalid application ID' });
    }

    const application = await AppliedJob.findById(id);

    if (!application) {
      return res.status(404).json({ error: true, message: 'Application not found' });
    }

    // Verify ownership
    if (application.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: true, message: 'Unauthorized' });
    }

    await AppliedJob.findByIdAndDelete(id);

    return res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    logger.error('Delete application error', { error: error.message, applicationId: req.params.id });
    return res.status(500).json({ error: true, message: 'Failed to delete application' });
  }
};

module.exports = { saveApplication, getApplications, updateStatus, deleteApplication };
