const axios = require('axios');

const ADZUNA_TIMEOUT_MS = 8000;
const REMOTIVE_TIMEOUT_MS = 8000;

const mapAdzunaResult = (result, keyword) => ({
  externalId: result.id.toString(),
  source: 'adzuna',
  title: result.title,
  company: result.company?.display_name || 'Unknown',
  location: result.location?.display_name || 'Not specified',
  description: (result.description || '').substring(0, 600),
  applyUrl: result.redirect_url,
  keyword,
});

const mapRemotiveResult = (job, keyword) => ({
  externalId: job.id.toString(),
  source: 'remotive',
  title: job.title,
  company: job.company_name,
  location: job.candidate_required_location || 'Remote',
  description: (job.description || '')
    .replace(/<[^>]*>/g, '')
    .substring(0, 600),
  applyUrl: job.url,
  keyword,
});

const searchJobs = async (keyword, location) => {
  // Try Adzuna first
  try {
    const response = await axios.get(
      'https://api.adzuna.com/v1/api/jobs/in/search/1',
      {
        params: {
          app_id: process.env.ADZUNA_APP_ID,
          app_key: process.env.ADZUNA_APP_KEY,
          what: keyword,
          where: location || '',
          results_per_page: 20,
          'content-type': 'application/json',
        },
        timeout: ADZUNA_TIMEOUT_MS,
      }
    );

    if (response.data?.results?.length > 0) {
      return response.data.results.map((r) => mapAdzunaResult(r, keyword));
    }
  } catch (error) {
    const reason = error.code === 'ECONNABORTED' ? 'timeout' : error.message;
    console.warn(`Adzuna API error (${reason}), falling back to Remotive`);
  }

  // Fallback to Remotive
  try {
    const response = await axios.get('https://remotive.com/api/remote-jobs', {
      params: {
        search: keyword,
        limit: 20,
      },
      timeout: REMOTIVE_TIMEOUT_MS,
    });

    if (response.data?.jobs) {
      return response.data.jobs.map((j) => mapRemotiveResult(j, keyword));
    }
  } catch (error) {
    const reason = error.code === 'ECONNABORTED' ? 'timeout' : error.message;
    console.warn(`Remotive API error (${reason})`);
  }

  return [];
};

module.exports = { searchJobs };
