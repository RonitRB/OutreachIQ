const Job = require('../models/Job');
const adzunaService = require('../services/adzunaService');
const logger = require('../utils/logger');


const searchJobs = async (req, res) => {
  try {
    const { keyword, location } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: true, message: 'Keyword is required' });
    }

    const normalizedKeyword = keyword.toLowerCase();
    const normalizedLocation = (location || '').toLowerCase();

    // Check cache: jobs with same keyword + location cached within last 6 hours
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const cacheQuery = {
      keyword: normalizedKeyword,
      cachedAt: { $gt: sixHoursAgo },
    };
    if (normalizedLocation) {
      cacheQuery.searchLocation = normalizedLocation;
    }

    const cachedJobs = await Job.find(cacheQuery);

    if (cachedJobs.length > 0) {
      return res.json({ source: 'cache', jobs: cachedJobs });
    }

    // Fetch fresh results
    const jobs = await adzunaService.searchJobs(keyword, location);

    if (jobs.length > 0) {
      // Bulk upsert to cache
      const bulkOps = jobs.map((job) => ({
        updateOne: {
          filter: { externalId: job.externalId },
          update: {
            $set: {
              ...job,
              keyword: normalizedKeyword,
              searchLocation: normalizedLocation,
              cachedAt: new Date(),
            },
          },
          upsert: true,
        },
      }));

      await Job.bulkWrite(bulkOps);
    }

    return res.json({ source: 'api', jobs });
  } catch (error) {
    logger.error('Search jobs error', { error: error.message, keyword: req.query.keyword, location: req.query.location });
    return res.status(500).json({ error: true, message: 'Failed to search jobs' });
  }
};

const getJob = async (req, res) => {
  try {
    const job = await Job.findOne({ externalId: req.params.externalId });
    if (!job) {
      return res.status(404).json({ error: true, message: 'Job not found' });
    }
    return res.json(job);
  } catch (error) {
    logger.error('Get job error', { error: error.message, externalId: req.params.externalId });
    return res.status(500).json({ error: true, message: 'Failed to fetch job' });
  }
};

module.exports = { searchJobs, getJob };
