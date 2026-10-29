/* Kuruluş 1299 — oyun verisi: binalar, kaynaklar, görevler, zaman.
   Tarihî olaylar ayrı dosyada (tarih.js); burada yalnızca oynanış dengesi. */
'use strict';
window.VERI = {
  BASLANGIC: { yil: 1299, ay: 4 },   // Nisan 1299, Söğüt
  AY_SURE: 7.5,                      // 1 ay = 7,5 gerçek saniye (1×) → 1 yıl 90 sn
  AYLAR: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  // mevsim çarpanı: tarla hasadı (aya göre)
  HASAT: [0.1, 0.1, 0.4, 0.8, 1.1, 1.3, 1.4, 1.5, 1.4, 1.0, 0.4, 0.1],

  KAYNAK: {
    yiyecek: { ad: 'Yiyecek', ikon: '🌾' },
    odun: { ad: 'Odun', ikon: '🪵' },
    tas: { ad: 'Taş', ikon: '🪨' },
    akce: { ad: 'Akçe', ikon: '🪙' },
    ipek: { ad: 'İpek', ikon: '🧵' }
  },
  // ipek böceği mevsimi (dut yaprağı: Mayıs–Ağustos)
  IPEK_MEVSIM: [0, 0, 0, 0.2, 1.2, 1.6, 1.6, 1.2, 0.4, 0, 0, 0],
  BASLANGIC_KAYNAK: { yiyecek: 140, odun: 90, tas: 20, akce: 40, ipek: 0 },
  BASLANGIC_NUFUS: 20,

  /* binalar
     boy: kaç karo kaplar (kare); maliyet; isci: çalışan sayısı; uretim: işçi başına aylık;
     konut: barınma; zemin: 'duz' (eğimsiz çayır), 'orman' (ağaca yakın), 'kaya' (kayaya yakın);
     kilit: açılması için gereken bina; sure: inşaat süresi (ay) */
  BINALAR: [
    { id: 'cadir', ad: 'Alaçık çadır', acik: 'Kayı obasının keçe çadırı. 5 kişi barınır.', boy: 1, maliyet: { odun: 8 }, konut: 5, sure: 0.5, grup: 'Konut', sehir: 'sogut' },
    { id: 'ev', ad: 'Ahşap ev', acik: 'Yerleşik hayata geçiş. 9 kişi barınır, memnuniyet artar.', boy: 1, maliyet: { odun: 25, tas: 6 }, konut: 9, sure: 1.5, kilit: 'mescit', grup: 'Konut', memnun: 1 },
    { id: 'tarla', ad: 'Tarla', acik: 'Buğday. Yazın bol, kışın az ürün verir.', boy: 2, maliyet: { odun: 12 }, isci: 4, uretim: { yiyecek: 2.4 }, hasat: true, zemin: 'duz', sure: 1, grup: 'Üretim' },
    { id: 'agil', ad: 'Koyun ağılı', acik: 'Konar-göçer Kayı\'nın sürüsü. Her mevsim yiyecek.', boy: 2, maliyet: { odun: 18 }, isci: 2, uretim: { yiyecek: 2.2 }, sure: 1, grup: 'Üretim' },
    { id: 'oduncu', ad: 'Oduncu', acik: 'Ormana yakın kurulmalı. Etrafındaki ağaçları keser.', boy: 1, maliyet: { odun: 10 }, isci: 3, uretim: { odun: 2.6 }, zemin: 'orman', sure: 0.7, grup: 'Üretim' },
    { id: 'tasocagi', ad: 'Taş ocağı', acik: 'Kayalık yamaca yakın kurulmalı.', boy: 1, maliyet: { odun: 16 }, isci: 3, uretim: { tas: 1.4 }, zemin: 'kaya', sure: 1, grup: 'Üretim' },
    { id: 'pazar', ad: 'Pazar yeri', acik: 'Komşu köylerle alışveriş. Nüfus arttıkça akçe getirir.', boy: 2, maliyet: { odun: 30, tas: 8 }, isci: 2, uretim: { akce: 1.2 }, nufusAkce: 0.06, sure: 1.5, grup: 'Ticaret' },
    { id: 'mescit', ad: 'Mescit', acik: 'Obanın ilk mescidi. Memnuniyet artar, ahşap ev açılır.', boy: 2, maliyet: { odun: 40, tas: 20, akce: 25 }, sure: 3, grup: 'Külliye', memnun: 12, tekil: true },
    { id: 'meydan', ad: 'Alay meydanı', acik: 'Gazilerin talim yeri. Yaya ve okçu yetiştirir.', boy: 2, maliyet: { odun: 35, tas: 10 }, sure: 1.5, grup: 'Askerî', tekil: true },
    { id: 'ahir', ad: 'Ahır', acik: 'Atlar ve akıncılar için. Akıncı yetiştirmeyi açar.', boy: 2, maliyet: { odun: 45, tas: 10, akce: 20 }, sure: 2, kilit: 'meydan', grup: 'Askerî', tekil: true },
    // Bursa (başkent olduktan sonra açılır)
    { id: 'tasev', ad: 'Taş ev', acik: 'Taş zemin kat, ahşap cumbalı üst kat. 12 kişi barınır.', boy: 1, maliyet: { odun: 15, tas: 25 }, konut: 12, sure: 2, grup: 'Konut', memnun: 1, sehir: 'bursa' },
    { id: 'cami', ad: 'Cami', acik: 'Zaviyeli, iki kubbeli erken Osmanlı camisi. Külliyenin kalbi.', boy: 2, maliyet: { odun: 60, tas: 80, akce: 60 }, sure: 5, grup: 'Külliye', memnun: 14, sehir: 'bursa' },
    { id: 'imaret', ad: 'İmaret', acik: 'Yoksula, talebeye, yolcuya aş. Her ay yiyecek harcar, nüfus artışını hızlandırır.', boy: 2, maliyet: { odun: 40, tas: 40, akce: 30 }, isci: 3, tuketim: { yiyecek: 8 }, sure: 3, grup: 'Külliye', memnun: 8, sehir: 'bursa' },
    { id: 'medrese', ad: 'Medrese', acik: 'Hücreli avlu ve dershane. Her medrese tüm üretimi %8 artırır (en çok 2).', boy: 2, maliyet: { odun: 40, tas: 50, akce: 50 }, isci: 2, sure: 4, grup: 'Külliye', memnun: 4, ilim: 0.08, sehir: 'bursa' },
    { id: 'hamam', ad: 'Hamam', acik: 'Kubbeli hamam. Kaplıca yakınına kurulursa iki kat gelir.', boy: 2, maliyet: { odun: 30, tas: 50, akce: 40 }, isci: 2, uretim: { akce: 1.4 }, sure: 3, grup: 'Külliye', memnun: 6, kaplicaBonus: 2, sehir: 'bursa' },
    { id: 'dutluk', ad: 'Dutluk', acik: 'Dut ağaçları ve ipek böceği. Yazın ipek verir; ovada daha verimli.', boy: 2, maliyet: { odun: 15 }, isci: 3, uretim: { ipek: 0.9 }, ipekMevsim: true, zemin: 'duz', ovaBonus: 1.3, sure: 1.5, grup: 'Üretim', sehir: 'bursa' },
    { id: 'bedesten', ad: 'Bedesten', acik: 'Kubbeli kapalı çarşı. İpeği akçeye çevirir: ipek başına 6 akçe.', boy: 2, maliyet: { odun: 50, tas: 90, akce: 80 }, isci: 4, uretim: { akce: 2 }, ipekTuketim: 8, ipekAkce: 6, sure: 5, kilit: 'pazar', grup: 'Ticaret', memnun: 3, sehir: 'bursa' },
    { id: 'han', ad: 'Han', acik: 'Kervanlar konaklar. Akçe ve ün getirir.', boy: 2, maliyet: { odun: 60, tas: 40, akce: 30 }, isci: 3, uretim: { akce: 2.2 }, sure: 4, kilit: 'pazar', grup: 'Ticaret', memnun: 3 }
  ],

  /* ---------- ordu ----------
     saldiri/savunma: muharebe gücü; kusatma: sur karşısındaki etkinlik; bakim: aylık yiyecek ve akçe */
  BIRLIKLER: [
    { id: 'yaya', ad: 'Yaya', ikon: '🗡️', acik: 'Mızraklı ve kalkanlı piyade. Ucuz, dayanıklı.', saldiri: 3, savunma: 4, kusatma: 1, maliyet: { yiyecek: 12, odun: 4, akce: 4 }, gerek: 'meydan' },
    { id: 'okcu', ad: 'Okçu', ikon: '🏹', acik: 'Türkmen okçusu. Kuşatmada surlardaki askeri avlar.', saldiri: 4, savunma: 2, kusatma: 1.6, maliyet: { yiyecek: 12, odun: 10, akce: 7 }, gerek: 'meydan' },
    { id: 'akinci', ad: 'Akıncı', ikon: '🐎', acik: 'Hafif süvari. Açık arazide çok güçlü, hızlı yürür, ganimet getirir.', saldiri: 6, savunma: 3, kusatma: 0.6, maliyet: { yiyecek: 20, akce: 16 }, gerek: 'ahir' }
  ],
  BAKIM: { yiyecek: 0.45, akce: 0.3 },   // asker başı aylık

  /* ---------- sefer haritası (yaklaşık koordinatlar, 1300 civarı) ----------
     sahip: 'osm' Osmanlı, 'biz' Bizans, 'ger' Germiyan, 'kar' Karesi; garnizon: savunan güç; sur: sur çarpanı;
     fetih: gerçek tarihte Osmanlı'ya geçiş yılı (yaklaşık); bu yıl geçince kale zayıflar (tarih ivmesi) */
  HARITA: {
    sinir: { enlemMin: 39.6, enlemMax: 41.12, boylamMin: 28.45, boylamMax: 30.75 },
    yerler: [
      { id: 'sogut', ad: 'Söğüt', e: 40.02, b: 30.18, sahip: 'osm', baskent: true, lx: 18, ly: 4 },
      { id: 'bilecik', ad: 'Bilecik', eski: 'Belokoma', e: 40.14, b: 29.98, lx: 26, ly: -14, sahip: 'osm', garnizon: 0, fetih: 1299, not: "1298–99'da alındı (rivayet: düğün tuzağı)." },
      { id: 'yarhisar', ad: 'Yarhisar', e: 40.16, b: 29.78, lx: 4, ly: -30, sahip: 'osm', garnizon: 0, fetih: 1299, not: "Bilecik'le aynı dönemde alındı. Yeri yaklaşık." },
      { id: 'karacahisar', ad: 'Karacahisar', e: 39.77, b: 30.55, sahip: 'osm', garnizon: 0, fetih: 1288, not: "c. 1286–91 arasında alındığı düşünülür (tarih tartışmalı)." },
      { id: 'inegol', ad: 'İnegöl', eski: 'Angelokoma', e: 40.08, b: 29.51, lx: -16, ly: 2, sahip: 'biz', garnizon: 26, sur: 1.3, fetih: 1299, not: "Turgut Alp İnegöl'ü aldı (1298–99, kaynaklarda tarih tartışmalı)." },
      { id: 'yenisehir', ad: 'Yenişehir', e: 40.26, b: 29.65, lx: -26, ly: -30, sahip: 'biz', garnizon: 22, sur: 1.1, fetih: 1301, not: "1301'de beyliğin merkezi oldu." },
      { id: 'lefke', ad: 'Lefke', e: 40.36, b: 30.01, sahip: 'biz', garnizon: 20, sur: 1.2, fetih: 1313, not: "Sakarya kıyısındaki kale. Fetih yılı yaklaşık." },
      { id: 'koyunhisar', ad: 'Koyunhisar', e: 40.6, b: 29.55, sahip: 'biz', garnizon: 34, sur: 1.0, fetih: 1302, savas: true, not: "Bapheus Savaşı (27 Temmuz 1302 ya da 1299). Yeri bilinmiyor; İzmit ile İznik arası bir ova." },
      { id: 'gemlik', ad: 'Gemlik', eski: 'Kios', e: 40.43, b: 29.15, sahip: 'biz', garnizon: 34, sur: 1.4, fetih: 1302, not: "Koyunhisar zaferinden sonra alındı." },
      { id: 'iznik', ad: 'İznik', eski: 'Nikaia', e: 40.43, b: 29.72, sahip: 'biz', garnizon: 110, sur: 2.6, fetih: 1331, not: "Uzun kuşatmadan sonra 1331'de Orhan Bey'e teslim oldu." },
      { id: 'mudanya', ad: 'Mudanya', e: 40.38, b: 28.88, sahip: 'biz', garnizon: 40, sur: 1.4, fetih: 1321, not: "1321'de Orhan Bey aldı." },
      { id: 'bursa', ad: 'Bursa', eski: 'Prusa', e: 40.19, b: 29.06, sahip: 'biz', garnizon: 95, sur: 2.6, abluka: 1317, fetih: 1326, not: "1317–1326 kuşatması; 6 Nisan 1326'da teslim oldu." },
      { id: 'izmit', ad: 'İzmit', eski: 'Nikomedia', e: 40.77, b: 29.93, sahip: 'biz', garnizon: 160, sur: 2.5, fetih: 1337, not: "Bithynia'daki son Bizans kalesi, 1337'de alındı." },
      { id: 'kostantiniye', ad: 'Konstantinopolis', e: 41.01, b: 28.98, sahip: 'biz', garnizon: 2000, sur: 5, fetih: 1453, kapali: true, not: "Bizans'ın başkenti. Fethi 1453'te." },
      { id: 'kutahya', ad: 'Kütahya ↓', e: 39.66, b: 29.98, sahip: 'ger', kapali: true, not: "Germiyanoğulları'nın merkezi. Bu dönemin en güçlü beyliklerinden." },
      { id: 'balikesir', ad: '← Karesi', e: 39.95, b: 28.5, sahip: 'kar', garnizon: 40, sur: 1.2, fetih: 1345, donanma: true, not: "Karesioğulları (Balıkesir). İlhak tarihi tartışmalı: 1335, 1336, 1345 ya da 1348/49. Alınırsa Karesi donanmasıyla Rumeli'ye geçiş açılır." },
      { id: 'pelekanon', ad: 'Pelekanon', e: 40.93, b: 29.15, sahip: 'biz', garnizon: 45, sur: 1.0, fetih: 1329, savas: true, dusman: 'biz', komutan: 'III. Andronikos ve Kantakuzenos', not: "10–11 Haziran 1329 (gün tartışmalı). Orhan Bey yaklaşık 8.000 kişiyle yaklaşık 4.000 kişilik Bizans ordusunu yendi; imparator yaralandı." },
      // Rumeli (bolge: rumeli). Geçiş için Karesi donanması gerekir.
      { id: 'cimpe', ad: 'Çimpe', bolge: 'rumeli', e: 40.5, b: 26.73, sahip: 'biz', garnizon: 18, sur: 1.1, fetih: 1352, ly: 4, lx: 22, not: "c. 1352'de VI. Kantakuzenos tarafından Osmanlılara verildi; geleneksel anlatıya göre Süleyman Paşa 1356'da 39 akıncıyla aldı (tartışmalı). Rumeli'deki ilk dayanak." },
      { id: 'gelibolu', ad: 'Gelibolu', eski: 'Kallipolis', bolge: 'rumeli', e: 40.41, b: 26.67, sahip: 'biz', garnizon: 50, sur: 2.0, fetih: 1354, lx: -26, not: "1–2 Mart 1354 gecesi depremde surları yıkıldı; Süleyman Paşa bir ay içinde şehri aldı. Avrupa'daki ilk Osmanlı kalesi." },
      { id: 'dimetoka', ad: 'Dimetoka', eski: 'Didymoteichon', bolge: 'rumeli', e: 41.35, b: 26.5, sahip: 'biz', garnizon: 40, sur: 1.6, fetih: 1361, not: "1360 ya da 1361'de alındı. I. Murad'ın sarayı bir süre burada ve Bursa'daydı." },
      { id: 'edirne', ad: 'Edirne', eski: 'Adrianopolis', bolge: 'rumeli', lx: 40, ly: -14, e: 41.68, b: 26.56, sahip: 'biz', garnizon: 90, sur: 2.2, fetih: 1369, not: "Lala Şahin Paşa aldı. Tarih tartışmalı: 1361–62, 1367, 1369 ya da 1371 önerilir; modern akademisyenlerin çoğu 1369'u kabul eder. Murad 1376/77 kışında Edirne'ye girdi." },
      { id: 'sirpsindigi', ad: 'Sırpsındığı', bolge: 'rumeli', lx: -46, ly: -30, e: 41.85, b: 26.4, sahip: 'biz', garnizon: 55, sur: 1.0, fetih: 1364, savas: true, dusman: 'sirp', komutan: 'Sırp, Bulgar ve Macar kuvvetleri', not: "1364: Hacı İlbey'in meşalelerle sayıca kalabalık görünen gece baskını. Avrupa kaynaklarında bu savaşın kaydı yoktur (tartışmalı)." },
      { id: 'filibe', ad: 'Filibe', eski: 'Philippopolis', bolge: 'rumeli', e: 42.15, b: 24.75, sahip: 'biz', garnizon: 60, sur: 1.8, fetih: 1363, not: "1363'te alındı." },
      { id: 'sofya', ad: 'Sofya', bolge: 'rumeli', e: 42.7, b: 23.33, sahip: 'biz', garnizon: 70, sur: 1.8, fetih: 1382, not: "1380–82 arası iki kuşatmayla alındı (bazı kaynaklar 1385 der). Savunmayı Yanuka yönetti." },
      { id: 'kosova', ad: 'Kosova', bolge: 'rumeli', e: 42.72, b: 21.09, sahip: 'biz', garnizon: 150, sur: 1.0, fetih: 1389, savas: true, dusman: 'sirp', komutan: 'Knez Lazar', not: "15 Haziran 1389. I. Murad ve Knez Lazar savaşta öldü; sonuç kaynaklara göre belirsiz. Osmanlı 27–40 bin, karşı taraf 12–25 bin (tartışmalı)." },
      { id: 'nigbolu', ad: 'Niğbolu', eski: 'Nikopolis', bolge: 'rumeli', e: 43.71, b: 24.9, sahip: 'biz', garnizon: 170, sur: 1.0, fetih: 1396, savas: true, dusman: 'hacli', komutan: 'Macar Kralı Sigismund', not: "25 Eylül 1396. Yıldırım Bayezid haçlı ordusunu yendi; Nevers Kontu esir düştü, Sigismund kayıkla kaçtı." }
    ],
    bolgeler: {
      anadolu: { ad: 'Anadolu', enlemMin: 39.6, enlemMax: 41.12, boylamMin: 28.45, boylamMax: 30.75 },
      rumeli: { ad: 'Rumeli', enlemMin: 40.0, enlemMax: 44.2, boylamMin: 20.6, boylamMax: 29.6 }
    },
    // Rumeli denizleri (yaklaşık kıyılar)
    rumeli: {
      denizler: [
        [[41.0, 28.98], [41.07, 28.25], [40.98, 27.95], [40.97, 27.5], [40.75, 27.3], [40.6, 27.1], [40.42, 26.67], [40.25, 26.48], [40.05, 26.2], [40.15, 26.42], [40.35, 26.68], [40.42, 27.0], [40.35, 27.4], [40.35, 27.97], [40.38, 28.5], [40.38, 28.88], [40.45, 29.2], [40.6, 29.05], [40.69, 29.6], [40.76, 29.6], [40.87, 29.2], [40.98, 29.03]],
        [[40.05, 26.2], [40.4, 26.25], [40.6, 26.5], [40.65, 26.3], [40.72, 26.05], [40.85, 25.87], [40.95, 25.3], [40.94, 24.4], [40.8, 23.9], [40.64, 22.94], [40.3, 22.6], [40.0, 22.5], [39.5, 22.5], [39.5, 26.6], [39.95, 26.1]],
        [[41.2, 29.1], [41.25, 28.6], [41.6, 28.1], [42.0, 27.95], [42.5, 27.6], [43.0, 27.95], [43.4, 28.15], [43.8, 28.6], [44.5, 28.7], [44.5, 30.0], [41.2, 30.0]]
      ],
      nehirler: [
        [[42.15, 24.75], [42.05, 25.4], [41.8, 26.1], [41.68, 26.56], [41.4, 26.45], [41.1, 26.3], [40.75, 26.05]],
        [[44.3, 20.6], [44.0, 22.4], [43.99, 22.88], [43.75, 23.8], [43.71, 24.9], [43.85, 25.97], [44.11, 27.26], [44.25, 28.0], [44.5, 28.3]]
      ],
      nehirAd: [[42.0, 25.6, 'Meriç'], [43.85, 23.5, 'Tuna']],
      daglar: [[42.6, 25.0, 'Balkan dağları'], [41.6, 24.2, 'Rodoplar'], [42.4, 22.4, '']],
      denizAd: [[40.45, 25.0, 'Ege'], [42.8, 28.6, 'Karadeniz'], [40.72, 28.3, 'Marmara']]
    },
    yollar: [['sogut', 'bilecik'], ['bilecik', 'yarhisar'], ['yarhisar', 'inegol'], ['yarhisar', 'yenisehir'], ['sogut', 'karacahisar'], ['bilecik', 'lefke'], ['yenisehir', 'iznik'], ['lefke', 'iznik'], ['iznik', 'koyunhisar'], ['koyunhisar', 'izmit'], ['iznik', 'gemlik'], ['gemlik', 'mudanya'], ['inegol', 'bursa'], ['yenisehir', 'bursa'], ['mudanya', 'bursa'], ['karacahisar', 'kutahya'], ['bursa', 'balikesir'], ['izmit', 'kostantiniye'], ['bursa', 'balikesir'], ['izmit', 'pelekanon'],
      ['cimpe', 'gelibolu'], ['gelibolu', 'dimetoka'], ['dimetoka', 'edirne'], ['edirne', 'sirpsindigi'], ['edirne', 'filibe'], ['filibe', 'sofya'], ['sofya', 'kosova'], ['sofya', 'nigbolu'], ['edirne', 'kostantiniye']],
    // Marmara kıyı şeridi (yaklaşık), İznik ve Sapanca gölleri, Sakarya nehri
    marmara: [[41.25, 27.75], [41.25, 28.0], [41.07, 28.25], [41.02, 28.58], [41.0, 28.98], [40.98, 29.03], [40.87, 29.2], [40.82, 29.3], [40.78, 29.42], [40.77, 29.6], [40.76, 29.93], [40.72, 29.8], [40.69, 29.6], [40.66, 29.3], [40.6, 29.05], [40.52, 28.8], [40.45, 29.0], [40.43, 29.15], [40.4, 29.0], [40.38, 28.88], [40.4, 28.6], [40.37, 28.2], [40.35, 27.97], [40.45, 27.86], [40.4, 27.75]],
    gol: [{ e: 40.44, b: 29.53, re: 0.06, rb: 0.17 }, { e: 40.71, b: 30.26, re: 0.02, rb: 0.08 }],
    nehir: [[39.55, 31.0], [39.8, 30.7], [40.0, 30.35], [40.12, 30.2], [40.36, 30.03], [40.5, 30.28], [40.75, 30.4], [41.0, 30.62], [41.25, 30.65]],
    daglar: [[40.07, 29.22, 'Uludağ'], [39.85, 29.6, 'Domaniç'], [40.3, 30.45, ''], [39.6, 30.2, ''], [40.55, 29.3, '']]
  },

  // görevler: sırayla açılır, tamamlanınca ödül
  GOREVLER: [
    { id: 'g1', ad: 'Obayı kur: 3 alaçık çadır daha', kosul: s => s.say('cadir') >= 7, odul: { yiyecek: 30 } },
    { id: 'g2', ad: 'Bir tarla ve bir koyun ağılı kur', kosul: s => s.say('tarla') >= 1 && s.say('agil') >= 1, odul: { odun: 30 } },
    { id: 'g3', ad: 'Ormanın kenarına oduncu kur', kosul: s => s.say('oduncu') >= 1, odul: { tas: 15 } },
    { id: 'g4', ad: 'Kayalığa taş ocağı kur', kosul: s => s.say('tasocagi') >= 1, odul: { akce: 20 } },
    { id: 'g5', ad: 'Nüfusu 50\'ye çıkar', kosul: s => s.nufus >= 50, odul: { odun: 40, tas: 10 } },
    { id: 'g6', ad: 'Obanın ilk mescidini yap', kosul: s => s.say('mescit') >= 1, odul: { akce: 30 } },
    { id: 'g7', ad: 'Pazar yeri kur', kosul: s => s.say('pazar') >= 1, odul: { yiyecek: 60 } },
    { id: 'g8', ad: 'Nüfusu 100\'e çıkar', kosul: s => s.nufus >= 100, odul: { akce: 60 } },
    { id: 'g9', ad: 'Alay meydanı kur, 10 asker yetiştir', kosul: s => s.say('meydan') >= 1 && s.asker >= 10, odul: { akce: 40 } },
    { id: 'g10', ad: 'Haritadan ilk seferi yap: İnegöl ya da Yenişehir', kosul: s => s.fetih >= 1, odul: { akce: 80, yiyecek: 60 } },
    { id: 'g11', ad: 'Han kur, kervan yolunu aç', kosul: s => s.say('han') >= 1, odul: { akce: 80 } },
    { id: 'g12', ad: 'Bursa\'yı al ve başkenti oraya taşı', kosul: s => s.sehir === 'bursa', odul: { akce: 100, tas: 60 } },
    { id: 'g13', ad: 'Bursa\'nın ilk camisini yap', kosul: s => s.say('cami') >= 1, odul: { akce: 80 } },
    { id: 'g14', ad: 'İpek ticareti: dutluk ve bedesten kur', kosul: s => s.say('dutluk') >= 1 && s.say('bedesten') >= 1, odul: { akce: 120 } },
    { id: 'g15', ad: 'Külliye: cami, imaret, medrese ve hamamı yan yana kur', kosul: s => s.kulliye >= 1, odul: { akce: 150, memnun: 10 } },
    { id: 'g16', ad: 'Bursa\'yı 300 kişilik bir şehir yap', kosul: s => s.nufus >= 300, odul: { akce: 200 } }
  ],

  // tüketim
  YEMEK: 0.38,       // kişi başı aylık yiyecek
  VERGI: 0.08,       // kişi başı aylık akçe (öşür, bac)
  DOGUM: 0.035,      // aylık nüfus artışı (yiyecek ve yer varsa)
  GOC: 0.9           // memnuniyet yüksekse aylık gelen göçmen (kişi)
};
