# Link Bio'da — Tasarım Taslağı (v0.3)

> Durum: dikey dilim geliştiriliyor. Bu belge konuştukça güncellenecek.

## v0.7 kararları (en günceli): 30 günlük sezon

Yol haritası: Aşama 1 sezon ekonomisi → Aşama 2 yayın kartı ve mekanikler → Aşama 3 haftalık krizler ve sonlar → Aşama 4 oyuncular tablosu.

**Aşama 1 (bu sürüm):**
- **Sezon:** 30 gün, 4 hafta. Her hafta pazartesi yeni sezon kodu (ör. 2026-H44). Tohum sezon kodundan türetilir; aynı hafta başlayan herkes aynı olaylarla, aynı gündemle oynar. Fark sadece kararlardan çıkar.
- **Abonelik haftalık ($2,99):** her abone grubu katıldığı günden 7 gün sonra yeniler ya da bırakır. Yenileme oranı sadakat, son 7 günde yayın yapılan gün sayısı ve riske bağlı (%30–95).
- **Giderler:** günlük yemek/yol/internet; 7., 14., 21. ve 28. günlerde haftalık kira (ilk hafta 4.000 TL, sonra %60 zamlı 6.400 TL).
- **Kasabank kredi kartı:** hesap eksiye 15.000 TL'ye kadar düşebilir, günlük %0,15 faiz. Limit aşılırsa icra: oyun biter. Mağazadan kartla alışveriş yapılabilir.
- **Vergi seçimi (3. gün):** içerik üreticisi hesabı (%15 stopaj, risk −8) ya da kişisel hesap (kesinti yok, gelirin %20'si vergi borcu olarak birikir). 22. gün e-tebligat: öde, muhasebeci tut (−%40) ya da itiraz et (kumar). 2 gün içinde ödenmezse haciz.
- **Kur:** her gün −%0,4 ile +%0,9 arası oynar; 15. gün kur şoku.
**Gerçek Türkiye rakamları (Ekim 2026 araştırması):**
- Net asgari ücret 28.075,50 TL; 1 $ ≈ 49,8 TL (serbest piyasa, Ekim sonu).
- İstanbul 1+1 kira: medyan ~25.000, ortalama ~35.000 TL/ay. Oyunda aile evinin kirası 32.000 TL, yarısı oyuncuda (haftalık 4.000); ayrı 1+1: 28.000 TL/ay.
- Faturalar: elektrik+su+gaz ~3.100, internet ~660 TL/ay → günlük gider 350 TL (yemek, yol, fatura payı).
- Vergi: GVK 20/B içerik üreticisi istisnası, bankada %15 stopaj, 2026 sınırı 5,3 milyon TL. Beyansız gelirde VUK 344 bir kat vergi ziyaı cezası; pişmanlıkla beyanda ceza yok, gecikme faizi %3,7/ay.
- Şubat 2026 İstanbul merkezli operasyon: 25 şüpheli, 17 tutuklama; suçlama müstehcenlik ve kara para aklama; ~257–300 milyon TL varlığa (10 taşınmaz, 14 araç, altın, kripto) el konuldu. Oyundaki risk sonu buna göre yazıldı.
- Kazanç iddiaları (Türk içerik üreticileri, haberler): ayda 100 $'dan 3–4 bin $'a; çok popüler hesaplar 20 bin $. Abonelik 5–45 $/ay. Oyun hedefi: ortalama oyuncu ayda ~1–2 bin $, iyi oyuncu 4–6 bin $.
- Mağaza: dantel takım 150–600 TL, jartiyerli takım ~1.100, bikini ~650, ring light ~2.400, USB mikrofon ~3.500, iPhone 17 Pro 119.999 TL, gram altın ~6.400 TL.
- **Sezon sonu:** puan = kasa + abone×220 + takipçi×3 − aile radarı×90 − risk×70 − ödenmemiş vergi. Duruma göre unvan (Stüdyo Kraliçesi/Kralı, Balina Çobanı, Kasabank Mağduru…) ve X paylaşımı.

## v0.6 kararları

- **Format:** oyunun tamamı bir telefon. Bütçesiz, mobil tarayıcı ve X odaklı. Durum çubuğu (saat, pil = enerji), ana ekran (widget'lar, bildirimler, uygulama rozetleri), "Günü bitir".
- **Uygulamalar:** DansKasa (panel, canlı yayın, kilitli içerik), Mesajlar (DM ekonomisi), X, Aile grubu, Kasabank, Kargola (mağaza), Kamera, Ayarlar.
- **Kilitli içerik (PPV):** set (ayna, yatak başı, mum ışığı, neon) + kıyafet + poz ile 3D sahneden gerçek kare çekilir; fiyat ve altyazı seçilir; abonelere kilitli gönderilir ya da DM'de satılır. Önizlemeler bulanık. Cesaret satışı ve sızma riskini artırır; sızan içerik ertesi sabah X'te çıkar.
- **DM ekonomisi:** istekler (teklifli), özel siparişler (set ve cesaret şartlı, yüksek ücret), flört (bahşiş), tacizciler (bedava isteyen, kişisel bilgi soran, şantajcı; doğru hamle engelle ve bildir), hikâye DM'leri.
- **Aile grubu:** aile radarına göre mesajlar ve sorgulama.
- **Gün sonu:** Kasabank ekstresi (yayın + PPV + DM − kesinti − kira), X için paylaşım kartı (görsel).
- **Yeni kıyafetler:** havlu, sadece bol gömlek, deri korse + mini etek.

## v0.5 kararları

- **Gerçekçilik önceliği:** yayın, gerçek bir abonelik/canlı yayın platformu gibi hissettirmeli.
- **Sohbet motoru (`js/sohbet.js`):** 28 kurmaca izleyici kişiliği (balina, sırnaşık, troll, pazarlıkçı, gizli muhafazakâr, kıskanç, esprili, yabancı, düzenli, yeni, sessiz) ve bot. Yazım tarzları (küçük harf, Türkçe karaktersiz, bağıran, harf hatalı, resmi), tekrar önleme, rozetler (VIP, abonelik ayı, YENİ, BOT). Mesajlar harekete, kıyafetin cesaretine, bahşişe, sessizliğe (8 sn hareketsizlikte sertleşir), hedefe ve olaylara tepki verir.
- **Jeton ekonomisi:** 1 jeton = $0,05. Bahşiş menüsü (öpücük 25, sohbet 35, poz 50, dans 80, özel dans 180, kombin 350). Menüden gelen istekler önceden ödenir; kaçırılırsa iade edilir ve izleyici kızar.
- **Hedef çubuğu:** her yayının bir jeton hedefi ve ödülü var; dolunca kutlama, takipçi ve "hedef ödülü" özel isteği.
- **Balina:** yayında 1-2 kez büyük bahşiş (400-1200 jeton) ve 9 saniyelik teşekkür beklentisi; teşekkür edilmezse yayından ayrılır.
- **Kombin değiştirme:** yayında sahip olunan kıyafetler arasında geçiş (perde/sansür geçişiyle).
- **Oda:** loş yayıncı odası (neon kalp ve tabela, saten yatak, mumlar, kadife perde, makyaj masası, tüylü halı). Çocuksu eşyalar kaldırıldı.
- **Görüntü:** webcam görünümü (parlama, hafif kumlanma, köşe karartması, renk kayması, renk derecelendirme), saten ve cilde ortam yansıması, kıyafetlerde dikiş ve örgü dokusu.
- **Sınır değişmedi:** çıplaklık ve açık cinsel betimleme yok.

## v0.4 kararları (en günceli; aşağıdakilerle çelişirse bu geçerlidir)

- **Ad:** "Özel Dans". Oyun içindeki platformun adı "DansKasa". Repo klasörü şimdilik `link-bioda` olarak kaldı.
- **Ton:** daha cüretkâr ve imalı, yetişkin temalı. Sınır: çıplaklık ve açık cinsel eylem yok. Cesur anlar her zaman komik bir sansürle kesilir: dev "SANSÜR" etiketi, kedi, Wi-Fi kopması ya da kapıdaki anne.
- **Kıyafetler (cesaret 0-3):** tişört, eşofman, atlet, crop top, forma, şık gömlek, spor sütyeni+tayt, açık saten gömlek, dekolteli body+mini etek+file çorap, straplez gece elbisesi, mayo şort, bikini, saten gecelik, dantel iç çamaşırı+file çorap. Cesaret bahşişi (%8/seviye) ve riski artırır. Annen cesur kıyafetle yakalarsa aile radarı daha çok artar.
- **Temalar:** sohbet, dans, gece yarısı özel (cesur kıyafet ister), havuz başı (bikini/mayo), fitness, ASMR.
- **Hareketler:** sohbet, dans, özel dans (göbek dansı, yavaş kalça sallama, saç savurma), öpücük, poz, teşekkür.
- **Özel istek:** cesur kıyafet ya da gece yarısı özelde altın renkli istekler gelir ("üstünü değiştir 👀"). Özel dans ile karşılanır, bahşiş 3 kat, ardından sansür olayı ve risk artışı.
- **X paylaşımı:** "Bu gece özel yayın var 🔥" ve "Bugünkü kombin nasıl? 👀" seçenekleri eklendi.

## v0.3 kararları (bu bölüm aşağıdakilerle çelişirse bu geçerlidir)

- **Süre:** tek oturum değil, kariyer modu. Yaklaşık 30 oyun günü, gün başına 3–4 dakika, toplam 1,5–2 saat. İlerleme kaydedilir, "Devam et" ile sürer.
- **Gün döngüsü (kokoreççi gibi):** Sabah hazırlık → Canlı yayın (gerçek zamanlı) → Yayın sonrası X paylaşımı → Gece seçimi (DM'ler / klip / erken uyku) → Gün sonu raporu ve mağaza → Gece olayı → Ertesi gün.
- **Canlı yayın:** sohbetten süreli istekler gelir (dans, sohbet, şarkı, selam, poz, teşekkür). Doğru hareket bahşiş getirir. Aynı anda ilgi, enerji ve oda olayları yönetilir: annenin kapıyı çalması, bant daraltması, şarj, troll, kedi, komşunun matkabı, ışık, telefonun kayması.
- **Yayın sonrası X paylaşımı:** yayıncı kendi X hesabında yayına göre oluşan seçeneklerden birini paylaşır. Paylaşım ertesi günün izleyicisini, takipçiyi, aile radarını ve operasyon riskini değiştirir. Yanıtlar X tiplerinden gelir.
- **Adalet:** kimlik, yönelim ve görünüm kazancı etkilemez. Kazancı etkileyen iki seçim yaş grubu (genç / yetişkin / olgun) ve yayın tarzıdır (tatlı / gizemli / entel / sporcu / komik). Günün trendi bu gruplardan eşit olasılıkla seçilir, yani her karakterin uzun vadede eşit şansı olur. Her tarzın mağazada eşit fiyatlı bir dekor eşyası var. Haftalık modda herkese aynı tohum (aynı olaylar) verilir.
- **Yayın saati seçimi:** 21.00 (çok izleyici, annenin kapıyı çalma ihtimali yüksek), 23.00 (dengeli), 02.00 (az izleyici, yüksek bahşiş, ertesi gün yorgunluk).
- **Bölümler:** çocukluk odası → kiralık 1+1 → stüdyo daire → Dubai.
- **Dikey dilim (ilk sürüm):** karakter oluşturma, çocukluk odası, 3 günlük döngü, mağaza, 3 günlük hikâye ve dilim sonu ekranı.

## Özet

24 yaşında (ya da oyuncunun seçtiği yaşta, en az 18) bir karakter, geçim derdinden "içerik üreticisi" olmaya karar veriyor. Oyuncu 7 gün boyunca çekim yapıyor, abone mesajlarına cevap veriyor, X'te tanıtım yapıyor, kazandığı parayla bir şeyler alıyor ve bunları yaparken ailesinden, vergi dairesinden ve "sabah 6 operasyonundan" kaçmaya çalışıyor.

- **Platform adı oyunda:** "FanKasa" (parodi; gerçek marka adı kullanılmıyor)
- **Süre:** kariyer modu, ~30 oyun günü (bkz. v0.3 kararları)
- **Ton:** yüzeyde hafif ve absürt; altında "gerçek yüz" teması. Espri karakterin kimliğiyle değil, etrafındaki insanların ikiyüzlülüğüyle yapılır.
- **Görsel:** 3D (Three.js), stilize low-poly karakterler ve oda
- **Kitle:** X kullanıcıları. Göndermeler X dilini, Türkiye gündemini ve X tiplerini bilen birinin güleceği şekilde yazılır.

## Kesin kurallar

1. Tüm karakterler yetişkin. Yaş kaydırıcısı 18'den başlar.
2. Çıplaklık ve açık cinsel içerik yok. "O an" her zaman bir şaka ile kesilir (kedi, kapı zili, sansür etiketi).
3. Gerçek kişi adı yok. Siyasetçi, ünlü, gözaltına alınan gerçek üreticiler ya da gerçek X hesapları kullanılmaz. Tüm hesaplar kurmaca tiplerdir.
4. Gerçek para yok. Oyun içi para yalnızca oyun içinde geçerli.
5. Oyuncular arası serbest mesajlaşma ve fotoğraf yükleme yok.
6. Girişte "18 yaşından büyüğüm" onayı.

## 1. Karakter oluşturma

- **Kimlik:** kadın, erkek, trans kadın, trans erkek, non-binary
- **Yönelim:** hetero, gay, lezbiyen, biseksüel
- **Beden:** yaş (18–60), boy, kilo/vücut tipi, ten rengi
- **Baş:** saç modeli ve rengi, sakal/bıyık, kaş, gözlük
- **Detay:** dövme, piercing, oje, saat, kolye
- **Başlangıç kıyafeti:** eşofman, kot-tişört, takım elbise (eski iş yerinden kalma)
- **Geçmiş (tek seçim):** işten çıkarılmış plaza çalışanı, KPSS'ye 4. kez giren mezun, kirası %80 artmış öğrenci, fon mağduru (ana parası fonda kalmış)
  - Geçmiş, başlangıç parasını ve ilk gün diyaloglarını değiştirir.

**Nişler:** her özellik bir abone kitlesini açar ve mesaj kutusundaki tipleri değiştirir.
- Gözlük: "kütüphaneci" kitlesi
- Sakal: "ayı" kitlesi
- Yaş 35+: "olgun" kitlesi
- Takım elbise: "ofis" kitlesi
- Absürt nişler:
  - Sadece çorap fotoğrafı isteyen abone
  - Vergi beyannamesini ASMR'la okuyan sesi isteyen abone
  - Sadece mercimek çorbası içerken izlemek isteyen abone (690 TL'lik çorba göndermesi)

## 2. Günlük döngü

Her gün dört aşamadan oluşur. Sıralama sabit, içerik değişken.

### 2.1 Çekim (3D oda)
- Oyuncu kıyafet, ışık, açı ve dekor seçer, sonra kısa bir zamanlama/denge mini oyunu oynar.
- Mini oyun sırasında olaylar kesinti yapar:
  - Annenin görüntülü araması
  - Komşunun matkabı
  - Kedi
  - Kargo
  - "Bant daraltması": yükleme çubuğu takılır, VPN düğmesine basman gerekir
- Çekimin sonucu bir "kapak fotoğrafı" olur. Görsel her zaman giyinik ya da sansür etiketli.

### 2.2 Mesaj kutusu (oyunun kalbi)
Her gün 4–6 mesaj gelir. Her mesajda 2–3 cevap seçeneği var. Cevaplar bahşişi, abone mutluluğunu ve riskleri değiştirir. Örnek tipler:

| Tip | Mesaj | Komik seçenek |
|---|---|---|
| Muhasebeci abone | "Fatura kesebilir misiniz, şirketten gider göstereceğim." | "Kesiyorum ama açıklamaya 'danışmanlık' yazıyorum." |
| Fon mağduru abone | "Ana param fonda kaldı. Aboneliği taksitle ödeyebilir miyim?" | "Ana para gelince ödersin." (abone sadakati artar) |
| KPSS'ci | "KPSS'ye çalışıyorum, motive edici bir mesaj atar mısın?" | Paragraf sorusuyla cevap ver |
| Derbi abonesi | "Takımım kazanırsa indirim yapar mısın?" | Derbi günü olayıyla bağlanır |
| Yabancı abone | Otomatik çeviriyle bozuk Türkçe: "Merhaba güzel kişi, sizin bayrak çok kırmızı." | "Siber Dünya Savaşı" göndermesi |
| Sigma koç | "Ben aslında seni analiz ediyorum, aura farming yapıyorsun." | "6-7" yaz |
| Eski öğretmen | "Ben senin ilkokul öğretmeninim. Kompozisyonların hep iyiydi." | Engelle / "Teşekkür ederim hocam" |
| Aile grubuna yanlış atan | "Abla/abi yanlışlıkla aile grubuna attım, nasıl silinir?" | Teknik destek ver (+bahşiş) |
| Grok'çu | "Grok'a soracaktım bu gerçek mi diye, erişim engeli var." | "Ben de bilmiyorum" |
| Pazarlıkçı | "Kapalıçarşı'da olsak 50 lira düşerdin." | Kampanya aç / ret |
| Yapay zekâ ile sahte görsel üreten | "Senin fotoğrafını yapay zekâyla ürettim, bak." | Engelle ve şikâyet et (doğru seçim ödüllendirilir) |

### 2.3 X'te tanıtım
X akışının parodisi. Oyuncu günün tweetini seçer ("link bio'da 🔗", gündeme atlayan tweet, kavga tweeti). Gelen yanıtlar:
- "DM'ye bak kral"
- "Türk kızları/erkekleri bozuldu" (yazan hesap aboneler listesinde)
- "Ahlak bekçisi" alıntıları
- Konuyla alakasız siyaset kavgası
- "Gündem bu mu ya, ana paramız fonda kaldı" yanıtı
- Çinli/Japon hesaplarla otomatik çeviri kavgası

### 2.4 Gece: alışveriş ve olay
- Gün sonu kazanç dolar olarak gelir, kurdan TL'ye çevrilir.
- Kazanç ilk kez asgari ücreti (2026: net 28.075,50 TL) geçince olay çıkar: "Bu ay babanın 30 yıllık emekliliğinden fazla kazandın."
- Sonra mağaza açılır ve rastgele bir olay gelir.

## 3. "Gerçek yüz" mekaniği (imza mekanik)

X'te sana saldıran bazı hesaplar abone listende çıkar. Hepsi kurmaca tiplerdir ve siyasi yelpazenin her yerinden gelir, kimse muaf değil:

| Hesap tipi | X'te yazdığı | Abone listesinde |
|---|---|---|
| @AileDegerleriTR | "Bu ahlaksızlığa dur denmeli." | 3 aydır abone, en çok bahşiş veren 2. kişi |
| @SigmaErkekKocu | "Kadınlar sadece paraya bakar." | Her gün "nasılsın" yazıyor |
| @KapitalizmEleştirisi | "Bedenin metalaşması..." | Yıllık abonelik almış, indirimden |
| @IliskiKocu_Dr | "Sağlıklı ilişki sınır koymaktır." | Sınır tanımıyor |
| @YabanciAjanAvcisi | "Bunlar hep dış güçlerin oyunu." | Ödemeyi yurt dışı kartla yapıyor |

Oyuncunun seçimi:
- **İfşa et:** takipçi ve gündem artar, operasyon riski ve kavga artar
- **Sessiz kal:** bahşiş devam eder
- **Şantaj:** seçenek olarak görünür ama seçilince oyun karakteri "Bu ben değilim" der ve reddeder. Oyun kötüye kullanım fikrini ödüllendirmez.

## 4. Riskler ve göstergeler

- **Para (TL ve $):** kur her gün oynar
- **Abone mutluluğu:** cevap kalitesiyle değişir
- **Enerji:** her eylem harcar, uyku doldurur
- **Aile radarı:** dolarsa "pazar kahvaltısı sorgusu" sahnesi gelir
- **Vergi borcu:** muhasebeci tutulmazsa birikir
- **Operasyon riski:** gösteriş yaptıkça artar. Şubat 2026 operasyonunun hicvi: "Sabah 6, kapı çalıyor." Gerçek kişiler ya da olayın detayları kullanılmaz.

**Ana gerilim:** para kazanmak kolay, harcamak riskli. Pahalı şeyler aldıkça "görünürlük" ve operasyon riski artar.

## 5. Para ve mağaza (kazandıkça al)

Mağazada beş bölüm var. Her ürünün etkisi ve fiyatı tasarım aşamasında dengelenecek.

**Ekipman (çekim kalitesi):**
- Çamaşır mandalıyla sabitlenmiş telefon
- Tripod
- Ring light
- Softbox
- Yeni nesil telefon
- Profesyonel mikrofon (ASMR nişi açılır)

**Oda (3D'de görünür, nişleri açar):**
- Kirli halıdan pembe LED'e, oradan stüdyoya geçiş
- Kütüphane duvar kâğıdı
- Sahte jakuzi
- Ofis dekoru
- Yeşil perde (arka plana Dubai ekle)

**Gardırop:** takım forması (derbi günü bonusu), takım elbise, kedi kulağı bandı, eşofman takımı, abiye.

**Hayat (gösteriş = risk):**
- Annene bulaşık makinesi (aile radarı düşer, "parayı nereden buldun" sorusu gelir)
- Kombi değişimi
- Kiranı 1 yıl peşin ödemek (ev sahibi şüphelenir)
- Gram altın
- Yerli elektrikli otomobil
- Dubai tatili
- En pahalısı: "Dubai'ye taşın" (bitiş seçeneği)

**Hizmetler:**
- Muhasebeci (vergi borcu düşer)
- Avukat (operasyon riski düşer)
- Premium VPN
- "Chatter" (mesajlara senin yerine cevap veren kişi): sektör hicvi. Senin adına yazan kişi Pendik'te yaşayan 52 yaşında bir amca. Cevapları bazen çok tuhaf, abone mutluluğu rastgele değişir.

## 6. Olay günleri (gündem göndermeleri)

| Olay | Etkisi |
|---|---|
| Derbi günü | Forma giyersen bahşiş artar, kaybeden taraftar aboneliği iptal eder |
| 29 Ekim tatili | Aile ziyareti, aile radarı +30 |
| Siber Dünya Savaşı | Yabancı abone akını, otomatik çeviri kaosu |
| Bant daraltması | Yükleme mini oyunu, VPN gerekli |
| Kur şoku | Dolar kazancın bir gecede değerlenir, akrabalar borç istemeye başlar |
| Ana para kararı bekleniyor | Fon mağduru aboneler toplu bahşiş verir ya da toplu iptal eder |

## 7. Sonlar

- **Dubai'ye taşındın:** en yüksek para sonu
- **Sabah 6 operasyonu:** risk dolarsa. "Mal varlığına el konuldu: 1 ring light, 3 kedi kulağı."
- **Pazar kahvaltısı:** aile öğrendi. Ama annen sonunda kendi hesabını açıyor.
- **Muhasebeci sonu:** vergi borcu yüzünden muhasebecine çalışmaya başladın
- **Gerçek yüzleri ifşa eden:** X'in kahramanı oldun, para yok
- **Normal sona dönüş:** KPSS'yi kazandın, hesabı kapattın. 1 hafta sonra memur maaşına bakıp hesabı tekrar açtın.

Sonda X'te paylaşma düğmesi skoru tweet metnine çevirir.

## 8. Çok oyunculu (ikinci sürüm)

- Her oyuncunun karakteri ve en iyi oturumu "Keşfet" vitrininde görünür.
- Diğer oyuncular vitrindeki karakterlere oyun içi parayla abone olabilir. Bu, sahibinin haftalık puanına eklenir.
- Etkileşim sadece hazır tepkilerle olur (🔥, 💀, "link bio'da"). Serbest metin yok.
- **Haftalık liste**, her pazartesi sıfırlanır:
  - En çok kazanan
  - En çok abone
  - Hiç operasyon yemeden en yüksek
  - En çok "gerçek yüz" ifşa eden
- Altyapı: Supabase ya da Cloudflare Worker (ücretsiz kota yeter), kullanıcı adı filtresi, şikâyet düğmesi.

## 9. 3D yaklaşımı

- **Motor:** Three.js
- **Karakterler:** CC0 lisanslı low-poly modüler karakter paketleri (ör. Quaternius) temel alınır.
  - Boy ve kilo kemik ölçekleme ile ayarlanır.
  - Saç, gözlük ve aksesuar takılabilir parçalar.
  - Renkler malzeme renkleriyle değiştirilir.
- **Oda:** tek bir 3D oda. Mağazadan alınan eşyalar odada belirir.
- **Kamera:** çekim sırasında "telefon kamerası" görünümüne geçer.
- **Performans:** düşük poligon, tek ışık ve gölge. Hedef: orta seviye telefonda 60 fps.

## 10. Aşamalar

1. **v1:** karakter oluşturma, 7 günlük tek oyunculu döngü, mağaza, sonlar, X'te paylaşma
2. **v2:** hesaplar, Keşfet vitrini, haftalık liste
3. **v3:** yeni olaylar, gündeme göre güncellenen mesaj paketleri (mesajlar ayrı bir veri dosyasında tutulur, kod değiştirmeden güncellenebilir)

## Açık sorular

- Ana karakterin başlangıç yaşı varsayılan olarak kaç olsun?
- Mesaj tiplerinden hangileri kalsın, hangileri çıksın?
- "Gerçek yüz" hesap tipleri yeterince dengeli mi?
- Oyunun adı "Link Bio'da" uygun mu?
