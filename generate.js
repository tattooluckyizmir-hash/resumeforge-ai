// api/generate.js
// Vercel Serverless Function — API key stays on server, never in browser

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limit check (simple — Vercel KV can be added later)
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

  try {
    const { type, data } = req.body;

    if (!type || !data) {
      return res.status(400).json({ error: 'Missing type or data' });
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    let prompt = '';
    let maxTokens = 1000;

    // ── BUILD PROMPTS ──────────────────────────────────
    if (type === 'cv') {
      prompt = buildCVPrompt(data);
      maxTokens = 1200;
    } else if (type === 'cover') {
      prompt = buildCoverPrompt(data);
      maxTokens = 600;
    } else if (type === 'linkedin') {
      prompt = buildLinkedInPrompt(data);
      maxTokens = 800;
    } else if (type === 'revision') {
      // data.messages = full chat history array
      const response = await callAnthropic(ANTHROPIC_API_KEY, data.messages, 1000);
      return res.status(200).json({ result: response });
    } else {
      return res.status(400).json({ error: 'Unknown type' });
    }

    const result = await callAnthropic(ANTHROPIC_API_KEY, [
      { role: 'user', content: prompt }
    ], maxTokens);

    return res.status(200).json({ result });

  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

// ── ANTHROPIC CALLER ──────────────────────────────────
async function callAnthropic(apiKey, messages, maxTokens) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages
    })
  });

  const json = await response.json();
  if (json.error) throw new Error(json.error.message);
  return json.content.map(c => c.text || '').join('');
}

// ── PROMPT BUILDERS ──────────────────────────────────
function buildCVPrompt(d) {
  return `You are the world's best career consultant and ATS optimization expert.

Write a professional, ATS-optimized CV in ${d.lang} language.

PERSON:
Name: ${d.name}
Target Position: ${d.position}
Location: ${d.location}
Email: ${d.email}
Phone: ${d.phone || ''}
LinkedIn: ${d.linkedin || 'linkedin.com/in/' + d.name.toLowerCase().replace(/\s/g, '-')}
Portfolio: ${d.portfolio || ''}
Industry: ${d.sector}
Experience Level: ${d.level}
Current/Last Job: ${d.currentJob || 'Not specified'}
Work Experience: ${d.experience || 'Has relevant industry experience'}
Education: ${d.education || 'University graduate'}
Technical Skills: ${d.skills || 'Relevant technical skills'}
Languages Spoken: ${d.languages || ''}
Key Achievements: ${d.achievements || 'Has notable achievements'}
Target: ${d.target || ''}

RULES:
1. ONLY the CV — no explanations
2. Markdown: # name, ## SECTIONS (uppercase), ### company/school
3. ## CONTACT: email, location, phone, linkedin, portfolio
4. ## PROFESSIONAL SUMMARY: 3-4 powerful sentences, keyword-rich
5. ## EXPERIENCE: 3 realistic roles. Each: company, dates, title, 3-4 bullet achievements with numbers (%, $, users)
6. ## EDUCATION
7. ## SKILLS: categorized (Technical / Tools / Soft Skills)
8. ## LANGUAGES
9. Strong action verbs, industry keywords for ATS
10. Culturally appropriate for ${d.country || 'global market'}`;
}

function buildCoverPrompt(d) {
  return `Write a professional cover letter in ${d.lang} for ${d.name} applying for ${d.position}.

Industry: ${d.sector} | Level: ${d.level} | Location: ${d.location}
Skills: ${d.skills} | Achievements: ${d.achievements}
Target: ${d.target || 'ideal company'}

Rules:
- 3 paragraphs: hook opening → why me (achievements with numbers) → CTA closing
- 200-250 words, professional yet warm
- Letter format: Dear Hiring Manager, ... Sincerely, ${d.name}
- Culturally appropriate for ${d.country || 'target market'}
- ONLY the letter`;
}

function buildLinkedInPrompt(d) {
  return `Generate LinkedIn profile optimization in ${d.lang}.

Person: ${d.name}, ${d.position}, ${d.sector}, ${d.level}
Skills: ${d.skills} | Achievements: ${d.achievements}

Return ONLY valid JSON (no markdown, no backticks, no explanation):
{
  "headline": "120-char LinkedIn headline",
  "about": "LinkedIn About (hook first line, keyword-rich, 3 paragraphs, ~300 words)",
  "keywords": ["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8"],
  "missing_keywords": ["add1","add2","add3","add4"],
  "tips": "5 numbered profile improvement tips"
}`;
}
