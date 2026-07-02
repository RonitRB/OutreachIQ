const AppliedJob = require('../models/AppliedJob');

const saveApplication = async (req, res) => {
  try {
    const applicationData = {
      userId: req.user._id,
      jobId: req.body.jobId,
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      applyUrl: req.body.applyUrl,
      status: req.body.status || 'draft_created',
      draftUrl: req.body.draftUrl,
      emailSubject: req.body.emailSubject,
      templateUsed: req.body.templateUsed,
      toneUsed: req.body.toneUsed,
    };

    const application = await AppliedJob.create(applicationData);
    return res.status(201).json(application);
  } catch (error) {
    console.error('Save application error:', error.message);
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
    console.error('Get applications error:', error.message);
    return res.status(500).json({ error: true, message: 'Failed to fetch applications' });
  }
};

const VALID_STATUSES = ['draft_created', 'sent', 'interview', 'rejected', 'no_response'];

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

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
    console.error('Update status error:', error.message);
    return res.status(500).json({ error: true, message: 'Failed to update status' });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

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
    console.error('Delete application error:', error.message);
    return res.status(500).json({ error: true, message: 'Failed to delete application' });
  }
};

module.exports = { saveApplication, getApplications, updateStatus, deleteApplication };
