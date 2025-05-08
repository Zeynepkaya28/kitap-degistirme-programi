# Kitap Takas Uygulaması

Bu uygulama, kullanıcıların kitaplarını takas etmelerini sağlayan bir platformdur. Konum bazlı eşleştirme ve esnek teslimat seçenekleri sunar.

## Özellikler

- Konum seçimi (manuel veya otomatik)
- Google Maps entegrasyonu
- Kargo ve elden teslim seçenekleri
- Kargo firması ve ücret paylaşımı seçenekleri
- Gizlilik odaklı konum paylaşımı

## Kurulum

1. Projeyi klonlayın:
```bash
git clone [repo-url]
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Google Maps API anahtarınızı ayarlayın:
- `src/components/LocationSelector.tsx` dosyasında `YOUR_GOOGLE_MAPS_API_KEY` değerini kendi API anahtarınızla değiştirin.

4. Uygulamayı başlatın:
```bash
npm start
```

## Geliştirme

### Gerekli API Anahtarları

- Google Maps API anahtarı
- (İleride eklenebilecek diğer API'ler için yer tutucu)

### Teknolojiler

- React
- TypeScript
- Styled Components
- Google Maps API
- Formik (form yönetimi)
- Yup (form doğrulama)

## Gizlilik

- Kullanıcı konumları sadece eşleştirme amacıyla kullanılır
- Tam konum bilgisi diğer kullanıcılara gösterilmez
- KVKK uyumlu veri işleme politikası

## Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın. 