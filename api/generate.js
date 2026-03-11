export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST kabul edilir.' });

  try {
    const { data } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) return res.status(500).json({ error: 'API Key eksik.' });

    const systemPrompt = `Sen profesyonel bir CV yazarı ve tasarım danışmanısın. Kullanıcının girdiği kısa bilgileri alıp, modern ve etkileyici bir CV diliyle genişletmelisin. Çıktıyı SADECE HTML formatında vermelisin. Başka hiçbir açıklama yazma. Şablon şu şekilde olmalı:
    <div class="summary"><b>Profil Özeti:</b> [Etkileyici ve profesyonel bir özet yaz]</div>
    <div class="experience"><b>Deneyim ve Başarılar:</b><br>[Deneyimleri profesyonelce, maddeler halinde ve başarı odaklı yaz]</div>`;
    
    const userPrompt = `Ad: ${data.name}, Pozisyon: ${data.position}, Yetenekler: ${data.skills}, Kısa Deneyim: ${data.achievements}, Dil: ${data.lang}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    const result = await response.json();
    return res.status(200).json({ text: result.content[0].text });

  } catch (error) {
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
}
