# KolayImar.com Test Raporu

**Test Tarihi:** 2 Şubat 2026
**Tester:** Claude AI
**Website:** https://www.kolayimar.com/

---

## HATA ÖZETİ

| Kategori | Kritik | Orta | Düşük | Toplam |
|----------|--------|------|-------|--------|
| Görsel/UI | 0 | 6 | 0 | 6 |
| Fonksiyonel | 4 | 0 | 1 | 5 |
| Güvenlik | 1 | 0 | 0 | 1 |
| İçerik | 1 | 1 | 0 | 2 |
| **TOPLAM** | **6** | **7** | **1** | **14** |

---

## 1. Logo Tutarsızlığı

| Alan | Değer |
|------|-------|
| Link | / vs /auth/login, /auth/register |
| Başlık/Bölüm | Header - Logo |
| Buton/Element | Logo ikonu |
| Konsol Hatası | - |
| Beklenen Davranış | Tüm sayfalarda aynı logo (ev ikonu) kullanılmalı |
| Mevcut Davranış | Ana sayfada ev ikonu, giriş/kayıt sayfalarında grid ikonu |
| Önem | Orta |
| Kategori | Görsel/UI |

---

## 2. "Exper Form" Yazım Hatası

| Alan | Değer |
|------|-------|
| Link | /exper-form-girisi |
| Başlık/Bölüm | Navigation Menu |
| Buton/Element | Menü linki "Exper Form Girişi" |
| Konsol Hatası | - |
| Beklenen Davranış | "Expert Form Girişi" yazmalı, URL /expert-form-girisi olmalı |
| Mevcut Davranış | "Exper Form Girişi" yazıyor (t harfi eksik) |
| Önem | Orta |
| Kategori | İçerik |

---

## 3. Admin Giriş Linki Görünür (GÜVENLİK)

| Alan | Değer |
|------|-------|
| Link | /auth/admin/login (Footer'dan erişilebilir) |
| Başlık/Bölüm | Footer |
| Buton/Element | "Admin Girişi" linki |
| Konsol Hatası | - |
| Beklenen Davranış | Admin login linki public olarak görünmemeli |
| Mevcut Davranış | Footer'da herkes tarafından görülebilir durumda |
| Önem | **KRİTİK** |
| Kategori | Güvenlik |

---

## 4. Fiyat Gösterim Hatası ($ ve ₺ birlikte)

| Alan | Değer |
|------|-------|
| Link | /ilanlar |
| Başlık/Bölüm | İlan Kartları - Fiyat |
| Buton/Element | Fiyat gösterimi |
| Konsol Hatası | - |
| Beklenen Davranış | "₺3.711.605" veya "3.711.605 TL" formatında gösterilmeli |
| Mevcut Davranış | "$ ₺3.711.605" - iki para birimi sembolü birlikte gösteriliyor |
| Önem | **KRİTİK** |
| Kategori | Fonksiyonel |

---

## 5. Fiyat Format Tutarsızlığı

| Alan | Değer |
|------|-------|
| Link | /ilanlar vs /ilan/[id] |
| Başlık/Bölüm | Fiyat Gösterimi |
| Buton/Element | Fiyat alanı |
| Konsol Hatası | - |
| Beklenen Davranış | Tüm sayfalarda aynı format kullanılmalı (₺ veya TL) |
| Mevcut Davranış | Liste: "$ ₺3.711.605", Detay: "TRY 3,711,605" |
| Önem | Orta |
| Kategori | Görsel/UI |

---

## 6. Tüm İlanlarda Görsel Yok

| Alan | Değer |
|------|-------|
| Link | /ilanlar |
| Başlık/Bölüm | İlan Kartları - Görsel |
| Buton/Element | İlan görselleri |
| Konsol Hatası | Image load error (muhtemelen) |
| Beklenen Davranış | Her ilan kartında ilgili mülk görseli gösterilmeli |
| Mevcut Davranış | Tüm kartlarda "Görsel Yok" placeholder'ı gösteriliyor |
| Önem | **KRİTİK** |
| Kategori | Fonksiyonel |

---

## 7. Test Verisi Canlıda Görünüyor

| Alan | Değer |
|------|-------|
| Link | /ilanlar |
| Başlık/Bölüm | İlan Listesi |
| Buton/Element | İlan kartı |
| Konsol Hatası | - |
| Beklenen Davranış | Sadece gerçek ilanlar görünmeli |
| Mevcut Davranış | "Test property for market analysis" başlıklı test ilanı canlıda görünüyor |
| Önem | **KRİTİK** |
| Kategori | İçerik |

---

## 8. Arama Sonuçları Sayfa Düzeni Bozuk

| Alan | Değer |
|------|-------|
| Link | /parsel-sorgu?q=... |
| Başlık/Bölüm | Arama Sonuçları |
| Buton/Element | Sonuç container'ı |
| Konsol Hatası | - |
| Beklenen Davranış | İçerik tam genişlikte ortalanmış görünmeli |
| Mevcut Davranış | Sağ tarafta geniş gri boşluk var, içerik düzgün yerleşmemiş |
| Önem | Orta |
| Kategori | Görsel/UI |

---

## 9. Arama Kutusunda Autocomplete Yok

| Alan | Değer |
|------|-------|
| Link | Tüm site (Header search) |
| Başlık/Bölüm | Header - Arama Kutusu |
| Buton/Element | Search input |
| Konsol Hatası | - |
| Beklenen Davranış | Yazarken öneri/autocomplete dropdown gösterilmeli |
| Mevcut Davranış | Öneri sistemi yok, sadece boş input |
| Önem | Düşük |
| Kategori | Fonksiyonel |

---

## 10. Çift Header/Menü Sorunu

| Alan | Değer |
|------|-------|
| Link | /imar-durumu-sorgula |
| Başlık/Bölüm | Header |
| Buton/Element | Navigation menüsü |
| Konsol Hatası | - |
| Beklenen Davranış | Tek header görünmeli |
| Mevcut Davranış | İki adet header görünüyor (ana navigasyon + dashboard navigasyonu) |
| Önem | Orta |
| Kategori | Görsel/UI |

---

## 11. Tab Görünürlük Sorunu

| Alan | Değer |
|------|-------|
| Link | /kat-karsiligi-hesaplayici |
| Başlık/Bölüm | Hesaplayıcı Tabları |
| Buton/Element | "Apartman Dairesi" ve "Villa" tabları |
| Konsol Hatası | - |
| Beklenen Davranış | Tablar net ve okunabilir olmalı (WCAG AA kontrast) |
| Mevcut Davranış | Tablar çok soluk, neredeyse görünmüyor |
| Önem | Orta |
| Kategori | Görsel/UI |

---

## 12. İmar Durumu Sorgulama Çalışmıyor

| Alan | Değer |
|------|-------|
| Link | /imar-durumu-sorgula |
| Başlık/Bölüm | İmar Durumu Sorgulama Formu |
| Buton/Element | Sorgulama formu |
| Konsol Hatası | - |
| Beklenen Davranış | Çalışan bir sorgulama formu olmalı |
| Mevcut Davranış | "E-Plan Entegrasyonu Geliştirme Aşamasında" mesajı, form yok |
| Önem | **KRİTİK** |
| Kategori | Fonksiyonel |

---

## 13. E-Plan Sayfası Form Validation Hatası

| Alan | Değer |
|------|-------|
| Link | /eplan |
| Başlık/Bölüm | E-Plan İmar Durumu Sorgulama |
| Buton/Element | "E-Plan Sorgula" butonu + Dropdown'lar |
| Konsol Hatası | Form state güncellenmiyor (React state management issue) |
| Beklenen Davranış | Form doldurulduğunda sorgu çalışmalı |
| Mevcut Davranış | Tüm alanlar doldurulmasına rağmen "Eksik Bilgi - Lütfen İl, İlçe ve Mahalle seçiniz!" hatası |
| Test Verisi | İl: Ankara, İlçe: Yenimahalle, Mahalle: Ergazi, Ada: 64672, Parsel: 3 |
| Önem | **KRİTİK** |
| Kategori | Fonksiyonel |

---

## 14. İletişim Sayfasında Harita Yok

| Alan | Değer |
|------|-------|
| Link | /iletisim |
| Başlık/Bölüm | İletişim Bilgileri |
| Buton/Element | Harita alanı (eksik) |
| Konsol Hatası | - |
| Beklenen Davranış | Adres için Google Maps veya benzeri harita gösterilmeli |
| Mevcut Davranış | Sadece metin adresi var, harita elementi yok |
| Adres | Çiğdem Mahallesi 1552. Sokak No: 1/2 Çankaya/Ankara |
| Önem | Orta |
| Kategori | Görsel/UI |

---

## PARSEL SORGU BUTON TESTLERİ

**Test Verisi:** Ankara / Yenimahalle / Ergazi - Ada: 64672, Parsel: 3

| Buton | Durum | Açıklama |
|-------|-------|----------|
| PDF İndir | ✅ ÇALIŞIYOR | PDF indirme başlatıyor |
| E-posta | ✅ ÇALIŞIYOR | E-posta adresi isteyen modal açılıyor |
| SMS | ✅ ÇALIŞIYOR | Telefon numarası isteyen modal açılıyor |
| WhatsApp | ✅ ÇALIŞIYOR | Telefon numarası isteyen modal açılıyor |
| Favoriler | ✅ ÇALIŞIYOR | Giriş yapılması gerektiğini bildiriyor |
| TKGM Parsel Sorgu | ✅ ÇALIŞIYOR | parselsorgu.tkgm.gov.tr açıyor |
| E-Plan İmar Durumu | ✅ ÇALIŞIYOR | İmar planı katmanlarını gösteriyor |
| Profesyonel Değerleme | ✅ ÇALIŞIYOR | /degerleme-talep sayfasına yönlendiriyor |

---

## ÖNCELİK SIRASI

### ACİL (Bugün)
1. Hata #3: Admin login linki (GÜVENLİK)
2. Hata #13: E-Plan form validation
3. Hata #4: Fiyat gösterim hatası
4. Hata #7: Test verisi canlıda

### Bu Hafta
5. Hata #6: Görsel sorunu
6. Hata #12: İmar durumu sorgulama
7. Hata #10: Çift header
8. Hata #11: Tab görünürlüğü

### İyileştirme
9. Hata #1: Logo tutarsızlığı
10. Hata #2: Yazım hatası
11. Hata #5: Fiyat format tutarsızlığı
12. Hata #8: Sayfa düzeni
13. Hata #9: Autocomplete
14. Hata #14: Harita eksik

---

## GENEL PUAN: 6/10

**Çalışan:** Parsel Sorgu, TKGM/E-Plan entegrasyonu, PDF/E-posta/SMS/WhatsApp paylaşımı
**Kritik Sorunlar:** Form validation, görsel yönetimi, güvenlik açığı
