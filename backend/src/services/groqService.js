const Groq = require('groq-sdk');

let _groq = null;
const getGroq = () => {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
};

const parseJSON = (text) => {
  // Strip markdown code fences if present (safety net)
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return JSON.parse(cleaned);
};

const parseResume = async (rawText) => {
  const systemPrompt =
    'You are a resume parser. Extract structured information from resume text. Return ONLY a valid JSON object with no markdown, no explanation: { "name": "", "skills": [], "projects": [], "summary": "" } Projects should include context, e.g. "NAIN 2.0 — govt-funded AI project, 1st place IIIT Dharwad". Skills should be individual technologies, not sentences.';

  try {
    const completion = await getGroq().chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: rawText },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    return parseJSON(completion.choices[0].message.content);
  } catch (error) {
    console.error('Groq parseResume error:', error.message);
    throw new Error('Failed to parse resume with AI');
  }
};

const generateEmail = async ({ job, userProfile, template, tone }) => {
  const toneInstructions = {
    formal:
      'Professional and respectful. No contractions. Structured paragraphs.',
    conversational:
      'Warm and direct. Contractions allowed. Read like a human wrote it.',
    assertive:
      'Confident and results-focused. Lead with impact. No filler phrases.',
  };

  const toneGuide = toneInstructions[tone] || toneInstructions.conversational;

  const systemPrompt = `You are a professional job application email writer. Write emails that are specific, confident, and human — not generic. ${template.systemHint} Return ONLY a valid JSON object: { "subject": "", "body": "" } Do not include any markdown, explanation, or text outside the JSON.`;

  const userPrompt = `Write a job application email with the following details:

Job Title: ${job.title}
Company: ${job.company}
Job Description: ${job.description || 'Not provided'}

Candidate Name: ${userProfile.name}
Candidate Skills: ${(userProfile.skills || []).join(', ')}
Candidate Projects: ${(userProfile.projects || []).join('; ')}
Candidate Summary: ${userProfile.summary || 'Not provided'}

Tone: ${tone} — ${toneGuide}

Template Style: ${template.name} — ${template.description}`;

  try {
    const completion = await getGroq().chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    return parseJSON(completion.choices[0].message.content);
  } catch (error) {
    console.error('Groq generateEmail error:', error.message);
    throw new Error('Failed to generate email with AI');
  }
};

module.exports = { parseResume, generateEmail };
