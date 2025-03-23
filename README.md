# kitap-degistirme-programi
Kitabın kayıtlı kullanıcılar arasında değiş tokuş edildiği program
 Güvenli Kimlik Doğrulama Sistemi

Bu proje, modern ve güvenli bir kimlik doğrulama sistemi sunmaktadır. Aşağıdaki özellikleri içerir:

- Güvenli şifre hashleme (Argon2)
- E-posta doğrulama
- İki faktörlü kimlik doğrulama
- OAuth 2.0 (Google ile giriş)
- JWT tabanlı yetkilendirme
- Refresh token desteği
- Şifre sıfırlama
- Brute force koruması
- reCAPTCHA entegrasyonu
- SQL injection ve XSS koruması
- KVKK ve GDPR uyumluluğu

## Gereksinimler

- Node.js (v14 veya üzeri)
- PostgreSQL
- npm veya yarn

## Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/yourusername/secure-auth-system.git
cd secure-auth-system
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Veritabanını oluşturun:
```bash
npx prisma migrate dev
```

4. .env dosyasını düzenleyin:
- Veritabanı bağlantı bilgilerini
- JWT anahtarlarını
- SMTP ayarlarını
- Google OAuth bilgilerini
- reCAPTCHA anahtarlarını

5. Uygulamayı başlatın:
```bash
npm run dev
```

## Güvenlik Özellikleri

- Şifreler Argon2 ile hashlenir
- E-posta doğrulama zorunludur
- İki faktörlü kimlik doğrulama desteği
- 5 başarısız giriş denemesinden sonra 5 dakika bekleme süresi
- reCAPTCHA ile bot koruması
- SQL injection ve XSS koruması
- Güvenli şifre sıfırlama mekanizması
- KVKK ve GDPR uyumlu veri işleme

## API Endpoints

### Kimlik Doğrulama
- POST /api/auth/register - Yeni kullanıcı kaydı
- POST /api/auth/login - Kullanıcı girişi
- POST /api/auth/forgot-password - Şifre sıfırlama talebi
- POST /api/auth/reset-password - Şifre sıfırlama
- POST /api/auth/verify-email - E-posta doğrulama
- POST /api/auth/refresh-token - Token yenileme

### Kullanıcı İşlemleri
- GET /api/users/me - Kullanıcı bilgilerini getir
- PUT /api/users/me - Kullanıcı bilgilerini güncelle
- DELETE /api/users/me - Hesabı sil

## Lisans

MIT 
