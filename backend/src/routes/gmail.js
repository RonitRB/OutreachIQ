const express = require('express');
const router = express.Router();
const gmailController = require('../controllers/gmailController');
const { isAuthenticated } = require('../middleware/auth');

// POST /gmail/draft — Create a Gmail draft
router.post('/draft', isAuthenticated, gmailController.createDraft);

module.exports = router;
