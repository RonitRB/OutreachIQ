const express = require('express');
const router = express.Router();
const trackerController = require('../controllers/trackerController');
const { isAuthenticated } = require('../middleware/auth');

// POST /tracker/save — Save a new application record
router.post('/save', isAuthenticated, trackerController.saveApplication);

// GET /tracker — Get all applications for current user
router.get('/', isAuthenticated, trackerController.getApplications);

// PATCH /tracker/:id — Update application status
router.patch('/:id', isAuthenticated, trackerController.updateStatus);

// DELETE /tracker/:id — Delete application record
router.delete('/:id', isAuthenticated, trackerController.deleteApplication);

module.exports = router;
