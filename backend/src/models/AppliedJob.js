const mongoose = require('mongoose');

const appliedJobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile' },
  jobId: String,
  title: String,
  company: String,
  location: String,
  applyUrl: String,
  status: {
    type: String,
    enum: ['draft_created', 'sent', 'interview', 'rejected', 'no_response'],
    default: 'draft_created',
  },
  draftUrl: String,
  emailSubject: String,
  templateUsed: String,
  toneUsed: String,
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AppliedJob', appliedJobSchema);
