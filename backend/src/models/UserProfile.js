const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: String,
  avatar: String,
  skills: [String],
  projects: [String],
  summary: String,
  rawText: String,
  googleRefreshToken: String,
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
