# Grammar Corrector Chrome Extension

Bu Chrome uzantısı, herhangi bir web sitesinde yazdığınız metinlerin dilbilgisini ChatGPT veya Google Gemini yardımıyla düzeltmenizi sağlar.

## Özellikler

- Herhangi bir web sitesinde çalışır (Twitter, Facebook, Gmail vb.)
- Düzeltilecek metni seçerek (highlight) kullanabilirsiniz
- Seçilen metni OpenAI ChatGPT veya Google Gemini API kullanarak düzeltir
- Kullanımı kolay arayüz

## Kurulum

1. Bu repository'yi bilgisayarınıza indirin
2. Chrome tarayıcınızı açın ve `chrome://extensions` adresine gidin
3. Sağ üst köşedeki "Geliştirici modu"nu etkinleştirin
4. "Paketlenmemiş öğe yükle" butonuna tıklayın
5. İndirdiğiniz klasörü seçin

## Kullanım

1. API anahtarınızı uzantı ayarlarına girin:
   - Uzantı simgesine tıklayın
   - API tipini seçin (OpenAI veya Gemini)
   - İlgili API anahtarınızı girin ve "API Anahtarını Kaydet" butonuna tıklayın
2. Herhangi bir web sitesinde düzeltmek istediğiniz metni seçin (mavi ile vurgulayın)
3. Beliren "Correct Grammar" (Dilbilgisini Düzelt) butonuna tıklayın
4. Metin otomatik olarak düzeltilecektir

## Gereksinimler

- Google Chrome tarayıcısı
- API anahtarı:
  - OpenAI API anahtarı ([OpenAI](https://platform.openai.com/account/api-keys) üzerinden alabilirsiniz)
  - Veya Google Gemini API anahtarı ([Google AI](https://ai.google.dev) üzerinden alabilirsiniz)

## Notlar

- Bu uzantı, API kullanım kurallarına uygun olarak kullanılmalıdır
- API çağrıları, kredi/kullanım limitinizi kullanacaktır
- Uzantı, API anahtarlarınızı yerel tarayıcı depolamanızda saklar ve başka bir yere göndermez

## İkon Oluşturma

Extension için gerekli ikonları oluşturmak için:

1. `images/create_icons.html` dosyasını tarayıcınızda açın
2. Her boyuttaki ikon için "İndir" butonuna tıklayın
3. İndirilen ikonları `images` klasörüne aşağıdaki adlarla kaydedin:
   - icon16.png
   - icon48.png
   - icon128.png
