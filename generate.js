// generate.js — Vercel Serverless Function
// Uses Google Gemini API (FREE)

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { type, data } = req.body;
    if (!type || !data) return res.status(400).json({ error: 'Missing type or data' });

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    if (!GOOGLE_API_KEY) return res.status(500).json({ error: 'Server configuration error' });

    let prompt = '';
    let messages = null;

    if (type === 'cv') {
      prompt = buildCVPrompt(data);
    } else if (type === 'cover') {
      prompt = buildCoverPrompt(data);
    } else if (type === 'linkedin') {
      prompt = buildLinkedInPrompt(data);
    } else if (type === 'revision') {
      messages = data.messages;
    } else {
      return res.status(400).json({ error: 'Unknown type' });
    }

    const result = await callGemini(GOOGLE_API_KEY, messages ? buildRevisionPrompt(messages) : prompt);
    return res.status(200).json({ result });

  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

// ── GEMINI CALLER ──────────────────────────
async function callGemini(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    })
  });

  const json = await response.json();
  
  if (json.error) throw new Error(json.error.message);
  
  return json.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ── PROMPT BUILDERS ──────────────────────────
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

STRICT RULES:
1. Write ONLY the CV — no explanations, no preamble
2. Use markdown: # for name, ## for SECTION TITLES (uppercase), ### for company/school
3. ## CONTACT: email, location, phone, linkedin, portfolio
4. ## PROFESSIONAL SUMMARY: 3-4 powerful sentences, keyword-rich, impact-focused
5. ## EXPERIENCE: 3 realistic roles. Each: company, dates, title, 3-4 bullet achievements with numbers (%, $, users)
6. ## EDUCATION: appropriate university and degree
7. ## SKILLS: categorized (Technical / Tools / Soft Skills)
8. ## LANGUAGES: spoken languages with proficiency
9. Start bullet points with strong action verbs
10. Use industry-specific keywords for ATS
11. Culturally appropriate for ${d.country || 'global market'}`;
}

function buildCoverPrompt(d) {
  return `Write a professional cover letter in ${d.lang} for ${d.name} applying for ${d.position}.

Industry: ${d.sector} | Level: ${d.level} | Location: ${d.location}
Skills: ${d.skills} | Achievements: ${d.achievements}
Target: ${d.target || 'ideal company'}

Rules:
- 3 paragraphs: hook opening → why me (achievements with numbers) → CTA closing
- 200-250 words, professional yet warm tone
- Letter format: Dear Hiring Manager, ... Sincerely, ${d.name}
- Culturally appropriate for ${d.country || 'target market'}
- ONLY the letter, no extra commentary`;
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

function buildRevisionPrompt(messages) {
  // Convert chat history to single prompt for Gemini
  const history = messages.map(m => 
    `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
  ).join('\n\n');
  
  return `You are a professional CV writing assistant. Continue this conversation and apply the requested revision.

${history}

Apply the user's latest request and return ONLY the updated CV in markdown format.`;
