const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  templateId: { type: String, unique: true },
  name: String,
  description: String,
  systemHint: String,
});

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
