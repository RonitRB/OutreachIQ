const axios = require('axios');

const searchJobs = async (keyword, location) => {
  let results = [];

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
      }
    );

    if (response.data && response.data.results && response.data.results.length > 0) {
      results = response.data.results.map((result) => ({
        externalId: result.id.toString(),
        source: 'adzuna',
        title: result.title,
        company: result.company?.display_name || 'Unknown',
        location: result.location?.display_name || 'Not specified',
        description: (result.description || '').substring(0, 600),
        applyUrl: result.redirect_url,
        keyword,
      }));

      return results;
    }
  } catch (error) {
    console.warn('Adzuna API error, falling back to Remotive:', error.message);
  }

  // Fallback to Remotive
  try {
    const response = await axios.get('https://remotive.com/api/remote-jobs', {
      params: {
        search: keyword,
        limit: 20,
      },
    });

    if (response.data && response.data.jobs) {
      results = response.data.jobs.map((job) => ({
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
      }));
    }
  } catch (error) {
    console.warn('Remotive API error:', error.message);
  }

  return results;
};

module.exports = { searchJobs };
