export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST' });

  try {
    const { data } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: 'API Anahtarı bulunamadı.' });

    // Hata veren 'v1beta' yerine en kararlı yol olan 'v1' kapısını kullanıyoruz
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Sen profesyonel bir CV yazarıısın. İsim: ${data.name}, Pozisyon: ${data.position}, Yetenekler: ${data.skills}, Deneyimler: ${data.achievements}. Bu bilgileri kullanarak etkileyici, modern bir dille profesyonel özet ve deneyimler yaz. Sadece HTML formatında cevap ver.` }] }]
      })
    });

    const result = await response.json();

    // Google'dan gelen cevabı güvenli bir şekilde alalım
    if (result.candidates && result.candidates[0].content.parts[0].text) {
      const aiText = result.candidates[0].content.parts[0].text;
      return res.status(200).json({ text: aiText });
    } else {
      throw new Error("AI cevap üretemedi.");
    }

  } catch (error) {
    return res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
  }
}
