const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  externalId: { type: String, required: true, unique: true },
  source: { type: String, enum: ['adzuna', 'remotive'] },
  title: String,
  company: String,
  location: String,
  description: String,
  applyUrl: String,
  keyword: String,
  cachedAt: { type: Date, default: Date.now, expires: 21600 },
});

module.exports = mongoose.model('Job', jobSchema);
