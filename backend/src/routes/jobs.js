const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobsController');
const { isAuthenticated } = require('../middleware/auth');

// GET /jobs — Search jobs by keyword and location
router.get('/', isAuthenticated, jobsController.searchJobs);

// GET /jobs/:externalId — Get a single job by external ID
router.get('/:externalId', isAuthenticated, jobsController.getJob);

module.exports = router;
