/**
 * Unit tests for adzunaService — data mapping and retry logic.
 * Uses jest mocking for axios to avoid real API calls.
 */

jest.mock('axios');
const axios = require('axios');
const { searchJobs } = require('../../src/services/adzunaService');

// Silence logger output during tests
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  process.env.ADZUNA_APP_ID = 'test-id';
  process.env.ADZUNA_APP_KEY = 'test-key';
});

describe('adzunaService.searchJobs', () => {
  it('returns mapped Adzuna results when API responds successfully', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 12345,
            title: 'Software Engineer',
            company: { display_name: 'Acme Inc' },
            location: { display_name: 'London' },
            description: 'A great role for engineers.',
            redirect_url: 'https://example.com/apply',
          },
        ],
      },
    });

    const jobs = await searchJobs('engineer', 'london');
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toEqual({
      externalId: '12345',
      source: 'adzuna',
      title: 'Software Engineer',
      company: 'Acme Inc',
      location: 'London',
      description: 'A great role for engineers.',
      applyUrl: 'https://example.com/apply',
      keyword: 'engineer',
    });
  });

  it('falls back to Remotive when Adzuna fails', async () => {
    jest.useFakeTimers();
    // fetchWithRetry does initial + 2 retries = 3 Adzuna calls, then 1 Remotive call
    const adzunaError = new Error('Adzuna down');
    adzunaError.code = 'ECONNABORTED'; // timeout triggers retry
    axios.get
      .mockRejectedValueOnce(adzunaError)  // Adzuna attempt 1
      .mockRejectedValueOnce(adzunaError)  // Adzuna retry 1
      .mockRejectedValueOnce(adzunaError)  // Adzuna retry 2 — exhausted
      // Remotive succeeds
      .mockResolvedValueOnce({
        data: {
          jobs: [
            {
              id: 99,
              title: 'Remote Dev',
              company_name: 'Remote Co',
              candidate_required_location: 'Worldwide',
              description: '<b>Remote</b> role',
              url: 'https://remotive.com/99',
            },
          ],
        },
      });

    const jobsPromise = searchJobs('developer', '');

    // Advance timers to resolve retry backoff delays
    for (let i = 0; i < 10; i++) {
      jest.advanceTimersByTime(5000);
      await Promise.resolve();
    }

    const jobs = await jobsPromise;
    expect(jobs).toHaveLength(1);
    expect(jobs[0].source).toBe('remotive');
    expect(jobs[0].description).toBe('Remote role'); // HTML stripped
    jest.useRealTimers();
  }, 15000);

  it('returns empty array when both APIs return non-retryable errors', async () => {
    // Non-timeout, non-5xx errors are NOT retried — they fail immediately
    const clientError = new Error('Bad Request');
    clientError.response = { status: 400 };
    axios.get.mockRejectedValue(clientError);
    const jobs = await searchJobs('nothing', '');
    expect(jobs).toEqual([]);
  });

  it('truncates description to 600 chars max', async () => {
    const longDesc = 'A'.repeat(1000);
    axios.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 1,
            title: 'Test',
            company: { display_name: 'Test' },
            location: { display_name: 'Test' },
            description: longDesc,
            redirect_url: 'https://example.com',
          },
        ],
      },
    });

    const jobs = await searchJobs('test', '');
    expect(jobs[0].description).toHaveLength(600);
  });
});
