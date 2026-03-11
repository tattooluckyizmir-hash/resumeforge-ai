# ResumeForge AI — Deploy Guide

## 🚀 Vercel'e 10 Dakikada Deploy

### Adım 1: GitHub'a Yükle (Ücretsiz)
1. https://github.com adresine git → "New repository" tıkla
2. Repo adı: `resumeforge-ai` → "Create repository"
3. Bu klasördeki tüm dosyaları yükle:
   - `api/generate.js`
   - `public/index.html`
   - `vercel.json`
   - `package.json`

### Adım 2: Anthropic API Key Al (Ücretsiz Başlar)
1. https://console.anthropic.com adresine git
2. Kayıt ol → "API Keys" → "Create Key"
3. Key'i kopyala: `sk-ant-...`
4. Kredi kartı gir — **ilk $5 ücretsiz, sonra kullandıkça öde**
   - Her CV oluşturma = ~$0.02
   - 100 kullanıcı/ay = ~$2 maliyet

### Adım 3: Vercel'e Deploy Et (Ücretsiz)
1. https://vercel.com adresine git
2. GitHub ile giriş yap
3. "New Project" → GitHub repo'nu seç → "Import"
4. **Environment Variables** bölümüne ekle:
   ```
   Name:  ANTHROPIC_API_KEY
   Value: sk-ant-xxxxxxxxxxxxxxxx  (senin key'in)
   ```
5. "Deploy" tıkla → 2 dakikada canlı!

### Adım 4: Custom Domain (Opsiyonel, ~$10/yıl)
- Vercel dashboard → "Domains" → resumeforge.ai gibi bir domain bağla
- Yoksa Vercel sana ücretsiz `resumeforge-ai.vercel.app` verir

---

## 💰 Gumroad Entegrasyonu

1. https://gumroad.com → Hesap aç
2. "New Product" → "Digital Product"
3. Fiyat: $29 (Pro tier için)
4. Product URL: Vercel'deki URL'ini yaz
5. "After Purchase" mesajına şunu yaz:
   > "Thank you! Access your ResumeForge AI here: [vercel-url]"

### Lisans Sistemi (İleride)
Daha gelişmiş bir lisans sistemi için Gumroad'ın webhook'unu kullanabilirsin.
Şimdilik basit tutmak için: ödeme yapan müşteriye URL'i gönder.

---

## 📁 Dosya Yapısı

```
resumeforge-ai/
├── api/
│   └── generate.js    ← Güvenli backend (API key burada)
├── public/
│   └── index.html     ← Frontend (API key YOK)
├── vercel.json        ← Vercel config
└── package.json       ← Bağımlılıklar
```

---

## 🔒 Güvenlik

- API key sadece Vercel'in sunucusunda, tarayıcıda asla görünmez
- Her istek sunucu üzerinden geçer
- Kullanıcılar API key'ini çalamaz

---

## 💡 Özellikler

- ✅ 22 dil desteği
- ✅ 22 ülke → İl/Eyalet → Şehir seçimi
- ✅ 6 profesyonel CV şablonu
- ✅ ATS skoru analizi
- ✅ Cover letter oluşturma
- ✅ LinkedIn profil optimizasyonu
- ✅ AI revizyon chat
- ✅ PDF indirme (A4)

---

## 📞 Sorun Yaşarsan

Vercel deploy loglarını kontrol et:
Vercel Dashboard → Project → "Functions" → "generate" → Logs
