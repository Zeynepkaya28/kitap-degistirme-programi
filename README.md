# Veri Doğrulama ve Temizleme Örneği

Bu proje, Python kullanarak veri doğrulama ve temizleme işlemlerini gösteren bir örnektir.

## Kurulum

1. Gerekli paketleri yükleyin:
```bash
pip install -r requirements.txt
```

## Kullanım

1. Uygulamayı başlatın:
```bash
python app.py
```

2. API Endpoint'leri:

### Form Doğrulama
- URL: `/form-dogrula`
- Method: POST
- Örnek veri:
```json
{
    "email": "ornek@email.com",
    "sifre": "12345678",
    "kitap_durumu": "iyi"
}
```

### JSON Doğrulama
- URL: `/json-dogrula`
- Method: POST
- Örnek veri:
```json
{
    "isbn": "978-3-16-148410-0",
    "baslik": "Örnek Kitap",
    "durum": "iyi"
}
```

## Doğrulama Kuralları

### Form Doğrulama (WTForms)
- E-posta: Geçerli e-posta formatı
- Şifre: En az 8 karakter
- Kitap Durumu: Sadece "iyi", "orta", "kötü" değerleri

### JSON Doğrulama (Cerberus)
- ISBN: 10 veya 13 karakter, sadece rakamlar ve tire
- Başlık: Boş olmamalı
- Durum: Sadece "iyi", "orta", "kötü" değerleri 