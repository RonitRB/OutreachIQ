const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { isAuthenticated } = require('../middleware/auth');

// GET /email/templates — List all email templates
router.get('/templates', isAuthenticated, emailController.getTemplates);

// POST /email/generate — Generate a personalized email using LLM
router.post('/generate', isAuthenticated, emailController.generateEmail);

module.exports = router;
