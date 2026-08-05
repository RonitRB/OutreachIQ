const EmailTemplate = require('../models/EmailTemplate');
const logger = require('../utils/logger');

const templates = [
  {
    templateId: 'cold_outreach',
    name: 'Cold outreach',
    description: 'Reaching out without a prior connection or job posting',
    systemHint:
      'Write a concise, confident cold email. Open with a specific observation about the company. Keep it under 150 words.',
  },
  {
    templateId: 'referral',
    name: 'Referral-based',
    description: 'Applying after being referred by someone at the company',
    systemHint:
      'Mention the referral naturally in the first sentence. Emphasize alignment with the team. Keep it warm but professional.',
  },
  {
    templateId: 'response_to_post',
    name: 'Response to job post',
    description: 'Applying directly to a listed opening',
    systemHint:
      "Reference the specific role in the subject and opening line. Map the candidate's skills directly to the job description requirements.",
  },
];

const seedTemplates = async () => {
  try {
    for (const template of templates) {
      await EmailTemplate.updateOne(
        { templateId: template.templateId },
        { $set: template },
        { upsert: true }
      );
    }
    logger.info('Email templates seeded');
  } catch (error) {
    logger.error('Error seeding templates', { error: error.message });
  }
};

module.exports = seedTemplates;
