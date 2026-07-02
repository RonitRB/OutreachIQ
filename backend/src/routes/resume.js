const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { isAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /resume/parse — Upload and parse PDF resume
router.post('/parse', isAuthenticated, upload.single('resume'), resumeController.parseResume);

// GET /resume/profile — Get current user's parsed profile
router.get('/profile', isAuthenticated, resumeController.getProfile);

module.exports = router;
