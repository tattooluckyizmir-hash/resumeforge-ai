export default async function handler(req, res) {
  // CORS ayarları (Vercel ile iletişim için)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST kabul edilir.' });

  try {
    const { data } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: 'API Anahtarı eksik.' });

    // Google Gemini'a giden komutu basitleştirdik ki hata vermesin
    const promptText = `Sen profesyonel bir CV yazarıısın. 
    İsim: ${data.name}
    Pozisyon: ${data.position}
    Yetenekler: ${data.skills}
    Deneyimler: ${data.achievements}
    Bu bilgilerle profesyonel bir profil özeti ve madde madde iş deneyimleri yaz. 
    Lütfen sadece HTML formatında cevap ver.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const result = await response.json();

    // Eğer Google hata döndürürse bunu yakalayalım
    if (result.error) {
      return res.status(500).json({ error: "Google AI Hatası: " + result.error.message });
    }

    const aiText = result.candidates[0].content.parts[0].text;
    return res.status(200).json({ text: aiText });

  } catch (error) {
    console.error("Hata detayı:", error);
    return res.status(500).json({ error: 'Sunucu hatası oluştu, lütfen tekrar deneyin.' });
  }
}
