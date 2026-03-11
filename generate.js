// api/generate.js
// Vercel Serverless Function — "Premium GhostSaaS Engine"

export default async function handler(req, res) {
  // 1. CORS & Güvenlik Duvarı
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Pre-flight isteklerine anında yanıt ver
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sadece POST isteklerine izin ver
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir.' });
  }

  try {
    const { type, data } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // 2. API Key Kontrolü (Müşteri hata yaparsa düzgün uyar)
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Sunucu yapılandırma hatası: ANTHROPIC_API_KEY bulunamadı. Lütfen Vercel panelinden ekleyin.' 
      });
    }

    if (!data) {
      return res.status(400).json({ error: 'Geçersiz veri gönderildi.' });
    }

    // 3. Profesyonel Prompt Mühendisliği (Ajan Mantığı)
    const systemPrompt = `Sen üst düzey bir İK uzmanı ve Global Kariyer Koçusun. Verilen bilgilere dayanarak, ATS (Aday Takip Sistemi) uyumlu, profesyonel ve son derece etkileyici bir CV içeriği oluştur. Çıktı dili kesinlikle ${data.lang} olmalıdır. Hedef ülkenin (${data.country}) iş standartlarına uygun bir ton kullan. Sonuç olarak sadece CV içeriğini düz metin olarak ver, ekstra giriş veya sonuç cümlesi kurma.`;
    
    const userPrompt = `
      Ad: ${data.name}
      Hedef Pozisyon: ${data.position}
      Sektör: ${data.sector}
      Yetenekler: ${data.skills}
      Deneyimler ve Başarılar: ${data.achievements}
      
      Lütfen bu profili profesyonel bir "Profesyonel Özet, Yetenekler, İş Deneyimi ve Eğitim" formatında yapılandır. Deneyimler kısmındaki başarıları metriklerle (%, sayı vb.) güçlendiren, eylem odaklı kelimeler (action verbs) kullanarak yeniden yaz.
    `;

    // 4. Anthropic (Claude) API'sine Güvenli Çağrı
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // CV oluşturmak için en hızlı ve en etkili model
        max_tokens: 1500,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      })
    });

    const result = await response.json();

    // Hata yönetimi
    if (!response.ok) {
      console.error('Anthropic API Hatası:', result);
      return res.status(500).json({ error: 'Yapay zeka motoru yanıt vermedi veya API limitine ulaşıldı.' });
    }

    // Başarılı yanıtı Frontend'e gönder
    return res.status(200).json({ text: result.content[0].text });

  } catch (error) {
    console.error('Sunucu Hatası:', error);
    return res.status(500).json({ error: 'İşlem sırasında beklenmeyen bir hata oluştu.' });
  }
}
