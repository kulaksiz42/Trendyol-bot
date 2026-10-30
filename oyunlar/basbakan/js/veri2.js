/* Başbakan — 2008'den bugüne. Olaylar ve tarihler gerçek; lider kurgusal. Tartışmalı olaylarda tarafların görüşleri birlikte verilir. */
'use strict';
(function (V) {
  // partilerin yıllara göre adı (oyundaki 6 "koltuk" dönem dönem farklı partileri temsil eder)
  V.PARTI_AD = y => ({
    akp: 'AK Parti', chp: 'CHP', mhp: 'MHP',
    dyp: y < 2007.5 ? 'DYP' : y < 2017.8 ? 'DP' : 'İYİ Parti',
    gp: y < 2008 ? 'GP' : 'Diğerleri',
    dig: y < 2005.9 ? 'DEHAP' : y < 2008.5 ? 'DTP' : y < 2012.5 ? 'BDP' : y < 2023.3 ? 'HDP' : 'DEM Parti'
  });
  // gerçek seçimlerde diğer partilerin ulusal oyları (AK Parti dışındakilerin oranını belirler)
  V.DIGER_GERCEK = [
    [2002.84, { chp: 19.4, mhp: 8.4, dyp: 9.5, gp: 7.2, dig: 21.2 }],
    [2007.56, { chp: 20.9, mhp: 14.3, dyp: 5.4, gp: 3.0, dig: 9.8 }],
    [2011.45, { chp: 26.0, mhp: 13.0, dyp: 0.6, gp: 3.6, dig: 7.0 }],
    [2015.44, { chp: 25.0, mhp: 16.3, dyp: 0.2, gp: 4.5, dig: 13.1 }],
    [2015.84, { chp: 25.3, mhp: 11.9, dyp: 0.1, gp: 2.4, dig: 10.8 }],
    [2018.48, { chp: 22.6, mhp: 11.1, dyp: 10.0, gp: 3.8, dig: 11.7 }],
    [2023.37, { chp: 25.3, mhp: 10.1, dyp: 9.7, gp: 9.0, dig: 8.8 }],
    [2024.25, { chp: 37.8, mhp: 5.0, dyp: 3.8, gp: 12.2, dig: 5.7 }]
  ];
  // yıl sonu gerçekleşmeleri (yaklaşık; 2025 tahmini)
  Object.assign(V.GERCEK, {
    2008: { enf: 10.1, buyume: 0.8, kur: 1.52, issizlik: 11.0, borc: 40.0 }, 2009: { enf: 6.5, buyume: -4.8, kur: 1.51, issizlik: 14.0, borc: 46.0 },
    2010: { enf: 6.4, buyume: 8.4, kur: 1.55, issizlik: 11.1, borc: 42.3 }, 2011: { enf: 10.4, buyume: 11.2, kur: 1.89, issizlik: 9.1, borc: 39.1 },
    2012: { enf: 6.2, buyume: 4.8, kur: 1.78, issizlik: 8.4, borc: 36.2 }, 2013: { enf: 7.4, buyume: 8.5, kur: 2.15, issizlik: 9.0, borc: 34.0 },
    2014: { enf: 8.2, buyume: 4.9, kur: 2.33, issizlik: 9.9, borc: 32.1 }, 2015: { enf: 8.8, buyume: 6.1, kur: 2.92, issizlik: 10.3, borc: 31.2 },
    2016: { enf: 8.5, buyume: 3.3, kur: 3.53, issizlik: 10.9, borc: 31.8 }, 2017: { enf: 11.9, buyume: 7.5, kur: 3.79, issizlik: 10.9, borc: 30.2 },
    2018: { enf: 20.3, buyume: 3.0, kur: 5.29, issizlik: 11.0, borc: 32.2 }, 2019: { enf: 11.8, buyume: 0.8, kur: 5.95, issizlik: 13.7, borc: 34.4 },
    2020: { enf: 14.6, buyume: 1.9, kur: 7.43, issizlik: 13.1, borc: 39.7 }, 2021: { enf: 36.1, buyume: 11.4, kur: 13.3, issizlik: 12.0, borc: 41.8 },
    2022: { enf: 64.3, buyume: 5.5, kur: 18.7, issizlik: 10.4, borc: 31.7 }, 2023: { enf: 64.8, buyume: 5.1, kur: 29.5, issizlik: 9.4, borc: 29.3 },
    2024: { enf: 44.4, buyume: 3.2, kur: 35.4, issizlik: 8.7, borc: 24.7 }, 2025: { enf: 31, buyume: 3.5, kur: 43, issizlik: 8.5, borc: 24 }
  });
  // dünya ekonomisinin etkisi (büyümeye, puan)
  V.DUNYA = y => y < 2008.6 ? 1.2 : y < 2009.5 ? -10 : y < 2014 ? 3.5 : y < 2018 ? 2 : y < 2020.15 ? -1 : y < 2020.6 ? -10 : y < 2021.9 ? 7 : 0.5;

  Object.assign(V.KISI, {
    kilicdaroglu: { ad: 'Kemal Kılıçdaroğlu', rol: 'CHP Genel Başkanı (2010–2023)', bas: '2010-05-22', son: '2023-11-05' },
    ozel: { ad: 'Özgür Özel', rol: 'CHP Genel Başkanı (2023–)', bas: '2023-11-05', son: '2099-01-01' },
    imamoglu: { ad: 'Ekrem İmamoğlu', rol: 'İstanbul Büyükşehir Belediye Başkanı (2019–2025)', bas: '2019-06-23', son: '2099-01-01' },
    yavas: { ad: 'Mansur Yavaş', rol: 'Ankara Büyükşehir Belediye Başkanı (2019–)', bas: '2019-04-08', son: '2099-01-01' },
    aksener: { ad: 'Meral Akşener', rol: 'İYİ Parti Genel Başkanı (2017–2024)', bas: '2017-10-25', son: '2024-04-27' },
    demirtas: { ad: 'Selahattin Demirtaş', rol: 'HDP Eş Genel Başkanı (2014–2018)', bas: '2014-06-22', son: '2018-02-11' },
    davutoglu: { ad: 'Ahmet Davutoğlu', rol: 'Dışişleri Bakanı (2009–2014), sonra Gelecek Partisi', bas: '2009-05-01', son: '2099-01-01' },
    obama: { ad: 'Barack Obama', rol: 'ABD Başkanı (2009–2017)', bas: '2009-01-20', son: '2017-01-20' },
    trump: { ad: 'Donald Trump', rol: 'ABD Başkanı (2017–2021, 2025–)', bas: '2017-01-20', son: '2099-01-01' },
    putin: { ad: 'Vladimir Putin', rol: 'Rusya lideri', bas: '2000-01-01', son: '2099-01-01' },
    merkel: { ad: 'Angela Merkel', rol: 'Almanya Başbakanı (2005–2021)', bas: '2005-11-22', son: '2021-12-08' },
    esad: { ad: 'Beşar Esad', rol: 'Suriye Devlet Başkanı (2000–2024)', bas: '2000-07-17', son: '2024-12-08' },
    peres: { ad: 'Şimon Peres', rol: 'İsrail Cumhurbaşkanı (2007–2014)', bas: '2007-07-15', son: '2014-07-24' },
    gulen: { ad: 'Fethullah Gülen', rol: 'Gülen hareketinin lideri (Türkiye\'de FETÖ olarak anılır)', bas: '1999-01-01', son: '2024-10-20' },
    oz: { ad: 'Öcalan', rol: 'PKK\'nın tutuklu lideri', bas: '1999-02-15', son: '2099-01-01' }
  });
  delete V.KISI.oz;

  const O = [
    { id: 'kapatma', sure: 10, t: '2008-03-14', tur: 'karar', baslik: 'Kapatma davası', yer: 'Ankara', kisi: ['baykal'],
      nedir: 'Kapatma davası: Anayasa Mahkemesi\'nin bir partiyi anayasaya aykırı faaliyet gerekçesiyle kapatabildiği dava. Türkiye\'de daha önce birçok parti kapatıldı.',
      metin: 'Yargıtay Cumhuriyet Başsavcısı, partinin "laiklik karşıtı eylemlerin odağı" olduğu gerekçesiyle kapatılması ve 71 üyesine siyasi yasak getirilmesi için Anayasa Mahkemesi\'ne dava açtı. Senin adın da listede.',
      tarih: 'Anayasa Mahkemesi 30 Temmuz 2008\'de kapatma talebini reddetti ama partinin hazine yardımının yarısını kesti; altı üye kapatma yönünde oy kullandı (yedi gerekiyordu).',
      s: [
        { ad: 'Hukuki savunma yap, reformlara devam de', etki: { k: { muh: 2, sag: 2 }, i: { yargi: -3 }, d: { ab: 3 } }, tarih: true },
        { ad: 'Davayı "yargı darbesi" diye meydanlara taşı', etki: { k: { muh: 5, laik: -4 }, i: { yargi: -10, ordu: -4 }, e: { guven: -5 } } },
        { ad: 'Laiklik vurgusuyla gerginliği düşür', etki: { k: { muh: -3, laik: 2 }, i: { yargi: 4 } } }
      ] },
    { id: 'ergenekon', sure: 15, t: '2008-07-14', tur: 'karar', baslik: 'Ergenekon iddianamesi', yer: 'İstanbul', kisi: ['baykal'],
      nedir: 'Ergenekon davası: Darbe planladığı iddia edilen bir yapılanmaya karşı açılan dava. Yüzlerce kişi yargılandı; mahkûmiyetler 2016\'da Yargıtay\'ca bozuldu. Hükümet sonradan davaların Gülen yapılanmasınca yönlendirildiğini söyledi.',
      metin: 'Savcılık, darbe planladığı iddia edilen "Ergenekon" yapılanmasına ilişkin 2.455 sayfalık iddianameyi açıkladı. Sanıklar arasında emekli generaller, gazeteciler ve akademisyenler var. Muhalefet davanın muhalifleri susturmak için kullanıldığını söylüyor.',
      tarih: 'Hükümet davaya destek verdi. Davalar yıllarca sürdü; 2016\'da Yargıtay mahkûmiyetleri bozdu ve sanıklar beraat etti. Hükümet daha sonra davaların Gülen yapılanmasına bağlı polis ve yargı mensuplarınca yönlendirildiğini açıkladı.',
      s: [
        { ad: 'Davayı açıkça destekle', etki: { k: { muh: 2, laik: -4, kurt: 1 }, i: { ordu: -6, medya: -2 }, b: { cemaatYakin: 1 } }, tarih: true },
        { ad: 'Yargıya güven de, mesafeli dur', etki: { k: { laik: 1 } } },
        { ad: 'Tutukluluk sürelerini ve delilleri sorgula', etki: { k: { laik: 3, muh: -1 }, i: { ordu: 3 }, b: { cemaatUzak: 1 } } }
      ] },
    { id: 'kriz2008', sure: 10, t: '2008-10-10', tur: 'karar', baslik: 'Küresel kriz', yer: 'Ankara', kisi: ['babacan'],
      nedir: 'Küresel kriz: ABD\'de konut kredilerinin çökmesiyle başlayan, dünya bankacılık sistemini sarsan 2008 krizi. Türkiye ekonomisi 2009\'da %4,8 küçüldü.',
      metin: 'Lehman Brothers battı, dünya borsaları çöküyor. İhracat siparişleri iptal ediliyor. IMF ile yeni bir anlaşma mı, yoksa kendi teşvik paketimiz mi?',
      tarih: 'Hükümet "kriz bizi teğet geçer" dedi; IMF ile görüşmeler sonuçsuz kaldı. Vergi indirimleri ve teşviklerle 2010\'da hızlı bir toparlanma yaşandı.',
      s: [
        { ad: 'Kendi teşvik paketimiz: vergi indirimi, kredi', etki: { k: { sag: 2 }, e: { h: 1, guven: -2 } }, tarih: true },
        { ad: 'IMF ile ihtiyati anlaşma', etki: { k: { mil: -2 }, i: { isd: 6 }, e: { guven: 6, imf: true } } },
        { ad: 'Kemer sık, bütçeyi koru', etki: { k: { sag: -3, muh: -1 }, e: { h: -1, buyume: -1.5, guven: 3 } } }
      ] },
    { id: 'davos', sure: 3, t: '2009-01-29', tur: 'karar', baslik: 'Davos', yer: 'Davos', kisi: ['peres'],
      metin: 'Dünya Ekonomik Forumu\'nda Gazze panelindesin. İsrail Cumhurbaşkanı Şimon Peres Gazze operasyonunu hararetle savundu; moderatör sana cevap için çok az süre veriyor.',
      tarih: 'Başbakan "one minute" diyerek moderatöre itiraz etti ve paneli terk etti. Türkiye\'de ve Arap dünyasında coşkuyla karşılandı; İsrail ile ilişkiler gerildi.',
      s: [
        { ad: 'Söz iste, sert konuş ve paneli terk et', etki: { k: { muh: 4, mil: 3, laik: -1 }, d: { ort: 12, abd: -4, ab: -2 } }, tarih: true },
        { ad: 'Diplomatik dille itiraz et, kal', etki: { d: { ab: 2, abd: 2, ort: 2 } } },
        { ad: 'Panelden sonra basına açıklama yap', etki: { k: { muh: 1 }, d: { ort: 4 } } }
      ] },
    { id: 'yerel2009', t: '2009-03-29', tur: 'secim', secim: 'yerel', baslik: 'Yerel seçimler', gercek: { akp: 38.8, chp: 23.1, mhp: 16.1 } },
    { id: 'acilim', sure: 20, t: '2009-07-29', tur: 'karar', baslik: 'Demokratik açılım', yer: 'Ankara', kisi: ['bahceli', 'baykal'],
      metin: 'Kürt meselesinde yeni bir dönem başlatmak istiyorsun: Kürtçe yayın ve eğitimde genişleme, köy adlarının iadesi, silah bırakanlara yol. MHP "bölücülüğe teslimiyet" diyor.',
      tarih: '"Demokratik açılım" Temmuz 2009\'da başladı. Ekim\'de Habur\'dan giriş yapan PKK\'lıların karşılanma törenleri büyük tepki çekti; süreç durakladı. Aralık\'ta Anayasa Mahkemesi DTP\'yi kapattı.',
      s: [
        { ad: 'Açılımı başlat', etki: { k: { kurt: 6, laik: 2, mil: -6 }, i: { ordu: -3 }, d: { ab: 5 } }, tarih: true },
        { ad: 'Sadece kültürel haklar, sessizce', etki: { k: { kurt: 3, mil: -1 } } },
        { ad: 'Güvenlik politikasıyla devam', etki: { k: { mil: 3, kurt: -4 }, i: { ordu: 3 } } }
      ] },
    { id: 'zurih', sure: 10, t: '2009-10-09', tur: 'karar', baslik: 'Ermenistan protokolleri', yer: 'Zürih', kisi: ['davutoglu'],
      metin: 'Ermenistan ile diplomatik ilişki kurmayı ve sınırı açmayı öngören protokoller Zürih\'te imzaya hazır. Azerbaycan, Karabağ sorunu çözülmeden sınırın açılmasına çok kızgın.',
      tarih: 'Protokoller 10 Ekim 2009\'da imzalandı ama iki ülkenin meclisleri onaylamadı; sınır kapalı kaldı.',
      s: [
        { ad: 'İmzala ama onayı Karabağ\'a bağla', etki: { d: { ab: 3, abd: 3 }, k: { mil: -1 } }, tarih: true },
        { ad: 'İmzala ve sınırı aç', etki: { d: { ab: 8, abd: 6, rus: 2 }, k: { mil: -5 } } },
        { ad: 'İmzalama', etki: { k: { mil: 2 }, d: { abd: -3, ab: -3 } } }
      ] },
    { id: 'balyoz', t: '2010-02-22', tur: 'haber', baslik: 'Balyoz operasyonu', kisi: [],
      metin: 'Darbe planı iddiasıyla emekli ve muvazzaf çok sayıda subay gözaltına alındı. Sanıklar delillerin sahte olduğunu savunuyor. (Mahkûmiyetler 2015\'te Anayasa Mahkemesi kararıyla bozuldu, sanıklar beraat etti.)', etki: { i: { ordu: -5 }, k: { laik: -1 } } },
    { id: 'marmara', sure: 3, t: '2010-05-31', tur: 'karar', baslik: 'Mavi Marmara', yer: 'Doğu Akdeniz', kisi: ['davutoglu'],
      metin: 'Gazze\'ye yardım götüren filoya uluslararası sularda İsrail askerleri baskın düzenledi; Mavi Marmara gemisinde 9 Türk vatandaşı hayatını kaybetti (bir yaralı daha sonra öldü).',
      tarih: 'Türkiye büyükelçisini geri çağırdı, İsrail\'den özür, tazminat ve ablukanın kaldırılmasını istedi. İsrail 2013\'te özür diledi; 2016\'da tazminat anlaşmasıyla ilişkiler normalleşti.',
      s: [
        { ad: 'Büyükelçiyi çek, özür ve tazminat iste', etki: { k: { muh: 4, mil: 3 }, d: { ort: 10, abd: -5, ab: -2 } }, tarih: true },
        { ad: 'İlişkileri tamamen kes', etki: { k: { muh: 5, mil: 3, laik: -2 }, d: { ort: 12, abd: -10, ab: -5 } } },
        { ad: 'BM soruşturmasını bekle', etki: { k: { muh: -3 }, d: { abd: 3, ab: 2 } } }
      ] },
    { id: 'ref2010', t: '2010-09-12', tur: 'secim', secim: 'ref', baslik: 'Anayasa referandumu', konu: 'Yargı yapısı (HSYK, Anayasa Mahkemesi) ve 12 Eylül\'cülerin yargılanmasını içeren 26 maddelik değişiklik', gercek: { evet: 57.9 },
      nedir: 'HSYK: Hâkim ve savcıların atanmasından sorumlu kurul. Değişiklikle üye sayısı artırıldı; destekçiler "yargı demokratikleşti", karşı çıkanlar "yargı hükümete bağlanıyor" dedi.' },
    { id: 'secim2011', t: '2011-06-12', tur: 'secim', secim: 'genel', baslik: 'Genel seçim', gercek: { akp: 49.8, chp: 26.0, mhp: 13.0, sandalye: 327 } },
    { id: 'suriye', sure: 20, t: '2011-08-09', tur: 'karar', baslik: 'Suriye\'de iç savaş', yer: 'Şam', kisi: ['esad', 'davutoglu'],
      metin: 'Suriye\'de gösterilere sert müdahale sürüyor; yüzlerce kişi öldü. Esad ile yakın bir dostluk kurmuştun. Dışişleri Bakanı Şam\'a gidip son kez reform çağrısı yapacak.',
      tarih: 'Türkiye Eylül 2011\'de Esad yönetimiyle ilişkileri kesti ve muhalefeti destekledi. Savaş 13 yıl sürdü; Türkiye 3,5 milyondan fazla Suriyeliye ev sahipliği yaptı. Esad Aralık 2024\'te devrildi.',
      s: [
        { ad: 'Esad\'la ilişkiyi kes, muhalefeti destekle', etki: { k: { muh: 2 }, d: { ort: 4, abd: 4, rus: -4 }, b: { suriyeMuhalif: 1 } }, tarih: true },
        { ad: 'Arabulucu ol, Esad\'la diyaloğu sürdür', etki: { d: { rus: 4, abd: -3, ort: -2 } } },
        { ad: 'Sınırı kapat, karışma', etki: { k: { mil: 2 }, d: { ab: -2, abd: -2 } } }
      ] },
    { id: 'van', sure: 5, t: '2011-10-24', tur: 'karar', baslik: 'Van depremi', yer: 'Van',
      metin: 'Van\'da 7,2 büyüklüğünde deprem. Erciş\'te binalar çöktü; yüzlerce kişi enkaz altında. Kış yaklaşıyor ve on binlerce kişi evsiz.',
      tarih: 'Depremlerde 644 kişi hayatını kaybetti. Konteyner kentler kuruldu, TOKİ bölgede on binlerce konut yaptı. İlk günlerdeki koordinasyon eksiklikleri eleştirildi.',
      s: [
        { ad: 'Bütün imkânları seferber et, bölgeye git', etki: { k: { kurt: 4, sag: 1 }, e: { acik: 0.3 } }, tarih: true },
        { ad: 'Uluslararası yardımı da kabul et', etki: { k: { kurt: 3 }, d: { ab: 3, ort: 2 }, e: { acik: 0.2 } } },
        { ad: 'AFAD\'a bırak, Ankara\'dan yönet', etki: { k: { kurt: -3 } } }
      ] },
    { id: 'roboski', sure: 10, t: '2011-12-29', tur: 'karar', baslik: 'Uludere', yer: 'Şırnak',
      metin: 'Şırnak Uludere\'de, Irak sınırında savaş uçaklarının bombardımanında 34 köylü hayatını kaybetti; çoğu gençti ve kaçakçılıktan dönüyordu. Bölgede büyük öfke var.',
      tarih: 'Hükümet olayı "talihsiz bir istihbarat hatası" olarak niteledi. Askerî savcılık 2014\'te kovuşturmaya yer olmadığına karar verdi; bu karar eleştirildi.',
      s: [
        { ad: 'Taziye, tazminat ve idari soruşturma', etki: { k: { kurt: -2 } }, tarih: true },
        { ad: 'Bağımsız komisyon, sorumlular yargılansın', etki: { k: { kurt: 4, laik: 1 }, i: { ordu: -5 }, d: { ab: 3 } } },
        { ad: 'Güvenlik operasyonunu savun', etki: { k: { mil: 2, kurt: -6 }, i: { ordu: 3 } } }
      ] },
    { id: 'mit', sure: 7, t: '2012-02-08', tur: 'karar', baslik: 'MİT krizi', yer: 'Ankara',
      metin: 'Bir özel yetkili savcı, MİT Müsteşarı Hakan Fidan\'ı PKK ile yürütülen görüşmeler gerekçesiyle ifadeye çağırdı. Hükümete yakın çevreler bunu hükümete yönelik bir operasyon olarak görüyor.',
      tarih: 'Hükümet MİT mensuplarının yargılanmasını Başbakan iznine bağlayan yasayı birkaç gün içinde çıkardı. Olay, hükümet ile Gülen hareketi arasındaki ilk açık kırılma olarak anılır.',
      s: [
        { ad: 'Yasayla MİT\'i koru', etki: { i: { yargi: -4 }, b: { cemaatUzak: 1 } }, tarih: true },
        { ad: 'Fidan ifade versin, yargıya saygı', etki: { i: { yargi: 3 }, b: { cemaatYakin: 1 } } },
        { ad: 'Savcıyı görevden aldır, soruşturma başlat', etki: { i: { yargi: -6 }, k: { laik: -1 }, b: { cemaatUzak: 1 } } }
      ] },
    { id: 'cozum', sure: 20, t: '2013-03-21', tur: 'karar', baslik: 'Çözüm süreci', yer: 'Diyarbakır', kisi: ['bahceli'],
      metin: 'Nevruz\'da Diyarbakır\'da, İmralı\'daki PKK lideri Öcalan\'ın "silahların susması" çağrısı okundu. PKK militanlarının Türkiye\'den çekilmesi konuşuluyor. Süreç devam etsin mi?',
      tarih: 'Çözüm süreci 2013–2015 arasında sürdü; çatışmalar büyük ölçüde durdu. Temmuz 2015\'te Suruç saldırısı ve ardından iki polisin öldürülmesiyle süreç çöktü.',
      s: [
        { ad: 'Süreci yasal çerçeveye bağla ve sürdür', etki: { k: { kurt: 6, mil: -5, laik: 1 }, d: { ab: 4 }, b: { cozumSureci: 1 } }, tarih: true },
        { ad: 'Önce silah bıraksınlar, sonra konuşuruz', etki: { k: { mil: 2, kurt: -2 } } },
        { ad: 'Süreci kapat', etki: { k: { mil: 4, kurt: -6 }, i: { ordu: 3 } } }
      ] },
    { id: 'gezi', sure: 5, t: '2013-05-31', tur: 'karar', baslik: 'Gezi Parkı', yer: 'İstanbul', kisi: ['kilicdaroglu'],
      nedir: 'Gezi protestoları: Taksim Gezi Parkı\'na kışla yapılması planına karşı başlayan, polis müdahalesinden sonra ülke geneline yayılan gösteriler. Destekçileri demokratik bir halk hareketi, hükümet ise bir kalkışma girişimi olarak gördü.',
      metin: 'Taksim Gezi Parkı\'nda ağaç kesimine karşı oturma eylemi yapan gruplara polis sabaha karşı biber gazıyla müdahale etti. Görüntüler yayıldı; on binler Taksim\'e yürüyor, eylemler başka şehirlere sıçrıyor.',
      tarih: 'Hükümet projede ısrar etti, protestolara sert müdahale edildi; aylar süren eylemlerde en az 8 kişi hayatını kaybetti. Mahkeme kışla projesini iptal etti. Hükümet olayları yurtiçi ve yurtdışı odakların bir kalkışma girişimi olarak nitelendirdi.',
      s: [
        { ad: 'Projede ısrar et, düzeni sağla', etki: { k: { muh: 3, laik: -8 }, d: { ab: -8, abd: -3 }, i: { medya: -4 }, e: { guven: -4 } }, tarih: true },
        { ad: 'Projeyi askıya al, gençlerle görüş', etki: { k: { laik: 4, muh: -1 }, d: { ab: 4 }, e: { guven: 2 } } },
        { ad: 'Polisi çek, park referandumunu öner', etki: { k: { laik: 2, muh: 1 }, d: { ab: 2 } } }
      ] },
    { id: 'aralik17', sure: 5, t: '2013-12-17', tur: 'karar', baslik: '17–25 Aralık', yer: 'İstanbul', kisi: ['gulen', 'kilicdaroglu'],
      nedir: 'Gülen hareketi: Fethullah Gülen\'in liderliğindeki dinî cemaat. Hükümetle 2000\'lerde yakın çalıştı; 2012\'den sonra çatıştı. Türkiye 2016\'da terör örgütü (FETÖ) ilan etti; hareket bunu reddetti.',
      metin: 'Sabah operasyonlarında üç bakanın oğlu, bir kamu bankasının genel müdürü ve iş insanları rüşvet ve yolsuzluk iddiasıyla gözaltına alındı. Hükümete yakın çevreler bunu Gülen hareketinin "yargı darbesi" olarak görüyor; muhalefet iddiaların soruşturulmasını istiyor.',
      tarih: 'Hükümet operasyonları Gülen yapılanmasının bir darbe girişimi olarak niteledi; dört bakan görevden ayrıldı, binlerce polis ve savcının yeri değiştirildi, soruşturmalara takipsizlik verildi. Muhalefet bunu yolsuzluğun örtbas edilmesi olarak eleştirdi.',
      s: [
        { ad: '"Yargı darbesi" de, emniyet ve yargıda tasfiye', etki: { k: { muh: 3, laik: -5 }, i: { yargi: -10, medya: -6 }, d: { ab: -8 }, e: { guven: -6 }, b: { cemaatUzak: 1 } }, tarih: true },
        { ad: 'Bakanları görevden al, bağımsız soruşturma', etki: { k: { laik: 4, sag: 2, muh: -3 }, i: { yargi: 4 }, d: { ab: 6 }, e: { guven: 3 } } },
        { ad: 'Meclis araştırması aç, bakanlar istifa etsin', etki: { k: { laik: 2, sag: 1 }, i: { yargi: 1 }, d: { ab: 3 } } }
      ] },
    { id: 'yerel2014', t: '2014-03-30', tur: 'secim', secim: 'yerel', baslik: 'Yerel seçimler', gercek: { akp: 42.9, chp: 26.3, mhp: 17.8 } },
    { id: 'soma', sure: 3, t: '2014-05-14', tur: 'karar', baslik: 'Soma', yer: 'Manisa',
      metin: 'Soma\'da bir kömür madeninde çıkan yangında yüzlerce madenci mahsur kaldı. Ölü sayısı her saat artıyor. Aileler maden önünde bekliyor; denetimlerin yetersiz olduğu söyleniyor.',
      tarih: 'Türkiye\'nin en büyük maden faciasında 301 madenci hayatını kaybetti. Şirket yöneticileri yargılandı; iş güvenliği mevzuatı sertleştirildi. Ziyaret sırasındaki sözler ve olaylar tartışma yarattı.',
      s: [
        { ad: 'Bölgeye git, ailelerle ol, iş güvenliği yasası sözü ver', etki: { k: { sag: 2, laik: 1 } } },
        { ad: 'Maden şirketlerine sert denetim, ruhsat iptalleri', etki: { k: { sag: 2, laik: 2 }, i: { isd: -4 } } },
        { ad: '"Bu işin fıtratında var" diyerek açıklama yap', etki: { k: { laik: -5, sag: -3 }, i: { medya: -3 } }, tarih: true }
      ] },
    { id: 'cbaday', sure: 10, t: '2014-05-20', tur: 'karar', baslik: 'Cumhurbaşkanlığı adaylığı', yer: 'Ankara', kisi: ['gul'],
      metin: 'Cumhurbaşkanı ilk kez halk tarafından seçilecek. Partin senin aday olmanı istiyor; Abdullah Gül\'ün ikinci dönemi de konuşuluyor.',
      tarih: 'Başbakan aday oldu ve 10 Ağustos 2014\'te ilk turda %51,8 ile seçildi; Ahmet Davutoğlu başbakan ve genel başkan oldu.',
      s: [
        { ad: 'Aday ol', etki: { k: { muh: 2 }, b: { cbAday: 1 } }, tarih: true },
        { ad: 'Başbakan kal, Gül\'ü destekle', etki: { k: { laik: 2, muh: -1 }, d: { ab: 2 }, b: { gulCB: 1 } } }
      ] },
    { id: 'cb2014', t: '2014-08-10', tur: 'secim', secim: 'cb', baslik: 'Cumhurbaşkanlığı seçimi', kosul: s => s.b.cbAday, rakip: 'Ekmeleddin İhsanoğlu (CHP–MHP ortak adayı) · Selahattin Demirtaş', gercek: { akp: 51.8 } },
    { id: 'kobani', sure: 10, t: '2014-10-06', tur: 'karar', baslik: 'Kobani', yer: 'Suruç', kisi: ['demirtas'],
      metin: 'Suriye\'de Türkiye sınırındaki Kürt kenti Kobani\'yi IŞİD kuşattı. Kentteki PYD güçleri yardım istiyor. HDP, Türkiye\'nin geçiş izni vermesini istiyor ve sokak çağrısı yaptı.',
      tarih: '6–8 Ekim olaylarında birçok kentte çıkan şiddette 30\'dan fazla kişi öldü. Türkiye daha sonra Irak\'tan peşmergenin Kobani\'ye geçişine izin verdi.',
      s: [
        { ad: 'Peşmerge geçişine izin ver, PYD\'ye mesafe', etki: { k: { kurt: 1, mil: 1 }, d: { abd: 3 } }, tarih: true },
        { ad: 'Koridor aç, Kobani\'ye doğrudan yardım', etki: { k: { kurt: 5, mil: -5 }, d: { abd: 5, ab: 3 } } },
        { ad: 'Karışma, sınırda güvenlik', etki: { k: { mil: 3, kurt: -5 }, d: { abd: -4 } } }
      ] },
    { id: 'hdpparti', t: '2015-01-20', tur: 'haber', baslik: 'HDP parti olarak giriyor', kisi: ['demirtas'],
      metin: 'HDP, %10 barajına rağmen seçime bağımsız adaylarla değil parti olarak girme kararı aldı. Barajı geçerse Meclis aritmetiği değişecek.', etki: { k: { kurt: -9, laik: -1 } } },
    { id: 'secim2015', t: '2015-06-07', tur: 'secim', secim: 'genel', baslik: 'Genel seçim', gercek: { akp: 40.9, chp: 25.0, mhp: 16.3, sandalye: 258 } },
    { id: 'suruc', sure: 7, t: '2015-07-22', tur: 'karar', baslik: 'Suruç ve sonrası', yer: 'Şanlıurfa',
      metin: 'Suruç\'ta Kobani\'ye yardım götürmek isteyen gençlere IŞİD bombalı saldırı düzenledi, 33 kişi öldü. İki gün sonra Ceylanpınar\'da iki polis evlerinde öldürüldü; PKK sorumluluğu üstlendi.',
      tarih: 'Çözüm süreci çöktü. Hükümet PKK\'ya ve IŞİD\'e yönelik operasyonlar başlattı; Güneydoğu\'da hendek ve sokağa çıkma yasağı dönemi yaşandı.',
      s: [
        { ad: 'Süreci bitir, kapsamlı operasyon', etki: { k: { mil: 6, kurt: -7 }, i: { ordu: 6 }, d: { ab: -3 }, b: { cozumSureci: -1 } }, tarih: true },
        { ad: 'IŞİD\'e karşı operasyon, süreci kurtarmaya çalış', etki: { k: { kurt: 2, mil: -2 }, d: { abd: 4 } } },
        { ad: 'Sınırlı karşılık, siyasi temas sürsün', etki: { k: { kurt: 3, mil: -4 }, i: { ordu: -3 } } }
      ] },
    { id: 'secim2015k', t: '2015-11-01', tur: 'secim', secim: 'genel', baslik: 'Yenilenen genel seçim', kosul: s => s.b.tekrarSecim, gercek: { akp: 49.5, chp: 25.3, mhp: 11.9, sandalye: 317 } },
    { id: 'rusucak', sure: 3, t: '2015-11-24', tur: 'karar', baslik: 'Rus uçağı', yer: 'Hatay', kisi: ['putin'],
      metin: 'Suriye sınırında hava sahasını ihlal ettiği belirtilen bir Rus savaş uçağı F-16\'larımızca düşürüldü. Pilotlardan biri öldü. Putin "sırtımızdan bıçaklandık" dedi.',
      tarih: 'Rusya yaptırımlar uyguladı: turist akışı durdu, tarım ihracatı yasaklandı. Haziran 2016\'da mektupla özür dilendi ve ilişkiler normalleşti.',
      s: [
        { ad: 'Kurallar açıktı de, geri adım atma', etki: { k: { mil: 3 }, d: { rus: -20, abd: 2 }, e: { buyume: -0.6 } }, tarih: true },
        { ad: 'Üzüntü bildir, ortak soruşturma öner', etki: { d: { rus: -8 }, e: { buyume: -0.2 } } },
        { ad: 'Hemen özür dile', etki: { k: { mil: -4 }, d: { rus: -2 } } }
      ] },
    { id: 'gocmutabakat', sure: 10, t: '2016-03-18', tur: 'karar', baslik: 'AB ile göç mutabakatı', yer: 'Brüksel', kisi: ['merkel'],
      metin: 'Ege\'den Yunan adalarına bir yılda bir milyondan fazla göçmen geçti. AB, Türkiye\'nin geçişleri durdurması karşılığında mali destek ve vize serbestisi sözü veriyor.',
      tarih: '18 Mart 2016 mutabakatıyla geçişler büyük ölçüde azaldı; AB 6 milyar euro destek verdi. Vize serbestisi gerçekleşmedi.',
      s: [
        { ad: 'Mutabakatı imzala', etki: { d: { ab: 6 }, k: { mil: -1 } }, tarih: true },
        { ad: 'Kapıları aç, Avrupa da yük alsın', etki: { d: { ab: -15 }, k: { mil: 2 } } },
        { ad: 'Önce vize serbestisi', etki: { d: { ab: -3 } } }
      ] },
    { id: 'temmuz15', sure: 1, t: '2016-07-15', tur: 'karar', baslik: '15 Temmuz', yer: 'Ankara–İstanbul', kisi: ['gulen'],
      nedir: 'Darbe girişimi: Ordunun bir kısmının hükümeti silah zoruyla devirme girişimi. Türkiye\'nin resmî görüşüne göre girişim Gülen yapılanmasınca (FETÖ) organize edildi; Gülen suçlamaları reddetti.',
      metin: 'Gece yarısı ordu içinden bir grup Boğaziçi Köprüsü\'nü kapattı, TRT\'yi bastı, Meclis\'i ve polis merkezlerini bombalıyor. Tatildesin. Telefonla halka seslenme imkânın var.',
      tarih: 'Halkın sokağa çıkması ve güvenlik güçlerinin direnişiyle darbe girişimi bastırıldı; 251 kişi şehit oldu. Hükümet girişimi Gülen yapılanmasına bağladı; ardından ilan edilen olağanüstü halde yaklaşık 125 bin kamu görevlisi ihraç edildi.',
      s: [
        { ad: 'Canlı yayında halkı sokağa çağır', etki: { k: { muh: 6, sag: 5, mil: 5, laik: 2 }, i: { ordu: -10 }, b: { darbePus: 1 } }, tarih: true },
        { ad: 'Güvenli yere geç, ordu içindeki sadık birliklere güven', etki: { k: { muh: 2, sag: 2 }, b: { darbePus: 1 } } }
      ] },
    { id: 'ohal', sure: 5, t: '2016-07-20', tur: 'karar', baslik: 'Olağanüstü hal', yer: 'Ankara', kisi: ['kilicdaroglu', 'bahceli'],
      metin: 'Darbe girişiminin ardından olağanüstü hal ilan edilmesi ve kararnamelerle kamudaki Gülen yapılanmasının tasfiyesi öneriliyor. Muhalefet tasfiyenin hukuk dışına taşmasından endişeli.',
      tarih: 'OHAL iki yıl sürdü; kararnamelerle yaklaşık 125 bin kişi kamudan ihraç edildi, binlerce kurum kapatıldı. İnsan hakları kuruluşları ve muhalefet bazı ihraçları eleştirdi.',
      s: [
        { ad: 'OHAL ilan et, kararnamelerle tasfiye', etki: { k: { muh: 2, mil: 2, laik: -3 }, i: { yargi: -4, medya: -4 }, d: { ab: -10 } }, tarih: true },
        { ad: 'OHAL yok; yargı yoluyla, delile dayalı soruşturma', etki: { k: { laik: 4, muh: -1 }, d: { ab: 8 }, i: { yargi: 4 } } },
        { ad: 'Kısa süreli OHAL, bağımsız inceleme komisyonu', etki: { k: { laik: 1 }, d: { ab: 2 } } }
      ] },
    { id: 'firat', sure: 7, t: '2016-08-23', tur: 'karar', baslik: 'Fırat Kalkanı', yer: 'Kilis', kisi: ['obama'],
      metin: 'IŞİD Gaziantep\'te bir düğünü bombaladı, 57 kişi öldü. Sınırın öbür yanındaki Cerablus IŞİD\'in elinde; ayrıca YPG\'nin batıya ilerlemesinden endişe var.',
      tarih: '24 Ağustos 2016\'da Fırat Kalkanı Harekâtı başladı; Cerablus ve El Bab IŞİD\'den alındı.',
      s: [
        { ad: 'Sınır ötesi harekât', etki: { k: { mil: 5, kurt: -3 }, i: { ordu: 5 }, d: { abd: -2 } }, tarih: true },
        { ad: 'Koalisyonla ortak hava operasyonu', etki: { d: { abd: 4 }, k: { mil: 1 } } },
        { ad: 'Sınır güvenliği yeterli', etki: { k: { mil: -2 } } }
      ] },
    { id: 'ref2017', t: '2017-04-16', tur: 'secim', secim: 'ref', baslik: 'Hükümet sistemi referandumu', konu: 'Cumhurbaşkanlığı Hükümet Sistemi: başbakanlık kalkıyor, yürütme cumhurbaşkanında toplanıyor', gercek: { evet: 51.4 },
      nedir: 'Cumhurbaşkanlığı Hükümet Sistemi: Yürütmenin halkın seçtiği cumhurbaşkanında toplandığı, başbakanlığın kaldırıldığı sistem. Destekçiler istikrar, karşıtlar denge ve denetimin zayıflaması vurgusu yaptı.' },
    { id: 'katar', sure: 10, t: '2017-06-06', tur: 'karar', baslik: 'Katar krizi', yer: 'Doha',
      metin: 'Suudi Arabistan, BAE, Bahreyn ve Mısır Katar\'a abluka başlattı. Katar müttefikin; askerî üs anlaşmamız var.',
      tarih: 'Türkiye Katar\'a gıda gönderdi ve asker sayısını artırdı; Körfez ülkeleriyle ilişkiler 2021\'e kadar gergin kaldı.',
      s: [
        { ad: 'Katar\'ın yanında dur, asker ve gıda gönder', etki: { d: { ort: 2 }, k: { muh: 1 } }, tarih: true },
        { ad: 'Arabulucu ol', etki: { d: { ort: 4, abd: 2 } } },
        { ad: 'Suudi Arabistan ile hizalan', etki: { d: { ort: 1, abd: 2 } } }
      ] },
    { id: 'afrin', sure: 7, t: '2018-01-19', tur: 'karar', baslik: 'Afrin', yer: 'Hatay', kisi: ['trump'],
      metin: 'ABD, YPG ağırlıklı bir "sınır güvenlik gücü" kuracağını açıkladı. Afrin\'deki YPG\'nin Hatay ve Kilis\'e tehdit oluşturduğu söyleniyor.',
      tarih: '20 Ocak 2018\'de Zeytin Dalı Harekâtı başladı; Afrin Mart\'ta alındı.',
      s: [
        { ad: 'Harekâtı başlat', etki: { k: { mil: 5, kurt: -3 }, i: { ordu: 4 }, d: { abd: -5, ab: -3 } }, tarih: true },
        { ad: 'ABD ve Rusya ile pazarlık', etki: { d: { abd: 2, rus: 2 } } },
        { ad: 'Sınırı tahkim et, bekle', etki: { k: { mil: -2 } } }
      ] },
    { id: 'secim2018', t: '2018-06-24', tur: 'secim', secim: 'genel', baslik: 'Cumhurbaşkanlığı ve milletvekili seçimi', gercek: { akp: 42.6, chp: 22.6, mhp: 11.1, sandalye: 295 } },
    { id: 'kur2018', sure: 7, t: '2018-08-10', tur: 'karar', baslik: 'Kur krizi', yer: 'Ankara', kisi: ['trump'],
      metin: 'Tutuklu Amerikalı papaz Brunson nedeniyle ABD iki bakana yaptırım uyguladı, çelik ve alüminyum vergisini ikiye katladı. Lira bir günde %15 düştü; dolar 7 lirayı gördü.',
      tarih: 'Merkez Bankası Eylül\'de faizi 6,25 puan artırarak %24\'e çıkardı; Brunson Ekim\'de serbest bırakıldı. Ekonomi 2019\'da neredeyse durdu.',
      e: { kur: 25, guven: -12 },
      s: [
        { ad: 'Merkez Bankası faizi sert artırsın', etki: { e: { faiz: 6.25, guven: 8 }, k: { sag: -2 } }, tarih: true },
        { ad: '"Faiz sebeptir": faiz artırma', etki: { e: { mb: 'baski', guven: -8 }, k: { sag: 1 } } },
        { ad: 'ABD ile uzlaş, papazı yargı serbest bıraksın', etki: { d: { abd: 10 }, k: { mil: -3 }, e: { guven: 6 } } }
      ] },
    { id: 'yerel2019', t: '2019-03-31', tur: 'secim', secim: 'yerel', baslik: 'Yerel seçimler', gercek: { akp: 44.3, chp: 30.1 }, buyuksehir: true },
    { id: 'istanbul2019', sure: 5, t: '2019-04-17', tur: 'karar', baslik: 'İstanbul sonucu', yer: 'İstanbul', kisi: ['imamoglu'], kosul: s => s.b.istanbulKaybi,
      metin: 'İstanbul\'u yaklaşık 13 bin oy farkla kaybettin. Partin, bazı sandık görevlilerinin kamu görevlisi olmaması gerekçesiyle seçimin iptalini YSK\'dan istemek istiyor.',
      tarih: 'YSK 6 Mayıs 2019\'da İstanbul seçimini iptal etti. 23 Haziran\'daki yenilenen seçimi Ekrem İmamoğlu %54 ile, aradaki farkı 800 bine çıkararak kazandı.',
      s: [
        { ad: 'İptal için başvur', etki: { k: { laik: -4, sag: -3 }, i: { yargi: -3 }, b: { istanbulTekrar: 1 } }, tarih: true },
        { ad: 'Sonucu kabul et, tebrik et', etki: { k: { laik: 3, sag: 2 }, d: { ab: 3 } } }
      ] },
    { id: 's400', sure: 15, t: '2019-07-12', tur: 'karar', baslik: 'S-400', yer: 'Ankara', kisi: ['putin', 'trump'],
      metin: 'Rusya\'dan alınan S-400 hava savunma sisteminin ilk parçaları Mürted Hava Üssü\'ne iniyor. ABD, Türkiye\'yi F-35 programından çıkarmak ve yaptırım uygulamakla tehdit ediyor.',
      tarih: 'Türkiye F-35 programından çıkarıldı; ABD Aralık 2020\'de CAATSA yaptırımı uyguladı. S-400\'ler depoda bekletildi.',
      s: [
        { ad: 'Teslimatı al', etki: { d: { rus: 8, abd: -12 }, k: { mil: 2 } }, tarih: true },
        { ad: 'Teslimatı ertele, Patriot için pazarlık', etki: { d: { rus: -8, abd: 6 } } },
        { ad: 'Al ama aktive etme, depoda tut', etki: { d: { rus: 2, abd: -5 } } }
      ] },
    { id: 'barispinari', sure: 7, t: '2019-10-08', tur: 'karar', baslik: 'Barış Pınarı', yer: 'Şanlıurfa', kisi: ['trump'],
      metin: 'ABD Suriye\'nin kuzeyinden çekiliyor. Fırat\'ın doğusunda YPG kontrolündeki bölgeye harekât için "güvenli bölge" planı hazır.',
      tarih: '9 Ekim 2019\'da Barış Pınarı Harekâtı başladı; ABD ve Rusya ile yapılan anlaşmalarla durduruldu.',
      s: [
        { ad: 'Harekâtı başlat', etki: { k: { mil: 4, kurt: -3 }, d: { ab: -6, abd: -4 } }, tarih: true },
        { ad: 'ABD ile ortak devriye', etki: { d: { abd: 4 } } },
        { ad: 'Bekle', etki: { k: { mil: -2 } } }
      ] },
    { id: 'covid', sure: 5, t: '2020-03-11', tur: 'karar', baslik: 'Salgın', yer: 'Ankara',
      metin: 'Türkiye\'de ilk koronavirüs vakası doğrulandı. Okullar ve sınırlar konuşuluyor; esnaf kapanmadan korkuyor.',
      tarih: 'Okullar kapatıldı, hafta sonu sokağa çıkma yasakları uygulandı; 2021\'de "tam kapanma" yapıldı. Aşılama 2021 başında başladı.',
      s: [
        { ad: 'Hafta sonu yasakları, kısmi kapanma', etki: { k: { sag: -1 }, e: { buyume: -1 } }, tarih: true },
        { ad: 'Tam kapanma ve esnafa güçlü destek', etki: { k: { sag: 2, laik: 2 }, e: { buyume: -2, acik: 2 } } },
        { ad: 'Ekonomi açık kalsın', etki: { k: { laik: -3 }, e: { buyume: 1 } } }
      ] },
    { id: 'ayasofya', sure: 10, t: '2020-07-10', tur: 'karar', baslik: 'Ayasofya', yer: 'İstanbul',
      metin: 'Danıştay, Ayasofya\'yı müzeye çeviren 1934 kararını iptal etti. Camiye dönüştürmek için kararname imzalaman bekleniyor. Yunanistan ve UNESCO tepkili.',
      tarih: 'Ayasofya 24 Temmuz 2020\'de cuma namazıyla ibadete açıldı.',
      s: [
        { ad: 'Camiye çevir', etki: { k: { muh: 5, mil: 3, laik: -3 }, d: { ab: -5 } }, tarih: true },
        { ad: 'Cami olsun, ziyaret saatleri müze gibi sürsün', etki: { k: { muh: 3, laik: -1 }, d: { ab: -2 } } },
        { ad: 'Müze kalsın', etki: { k: { muh: -4, laik: 3 }, d: { ab: 3 } } }
      ] },
    { id: 'faiz2021', sure: 7, t: '2021-09-20', tur: 'karar', baslik: 'Yeni ekonomi modeli', yer: 'Ankara',
      nedir: 'Faiz ve enflasyon: Merkez bankaları enflasyonu düşürmek için genellikle faizi artırır. Faizi enflasyonun altında tutmak parayı ucuzlatır, lirayı değersizleştirir.',
      metin: 'Enflasyon %19. Ekonomistlerin çoğu faiz artışı öneriyor; sen ise faizi düşürerek yatırımı, üretimi ve ihracatı artırmak istiyorsun.',
      tarih: 'Merkez Bankası Eylül–Aralık 2021\'de faizi 19\'dan 14\'e indirdi. Dolar Kasım–Aralık\'ta 18 lirayı aştı; enflasyon Ekim 2022\'de %85\'e çıktı. Haziran 2023\'ten sonra politika tersine çevrildi.',
      s: [
        { ad: 'Faizi indir', etki: { e: { mb: 'baski', guven: -10 }, k: { sag: 1 } }, tarih: true },
        { ad: 'Merkez Bankası bağımsız karar versin', etki: { e: { mb: 'bagimsiz', guven: 6 }, k: { sag: -1 } } },
        { ad: 'Faizi artır, sıkı para politikası', etki: { e: { faiz: 5, guven: 8, buyume: -1.5 }, k: { sag: -3 } } }
      ] },
    { id: 'ukrayna', sure: 7, t: '2022-02-24', tur: 'karar', baslik: 'Ukrayna savaşı', yer: 'Ankara', kisi: ['putin'],
      metin: 'Rusya Ukrayna\'yı işgal etti. Ukrayna Boğazlar\'ın savaş gemilerine kapatılmasını istiyor; Batı yaptırım çağrısı yapıyor. Rusya enerji ve turizmde büyük ortağın.',
      tarih: 'Türkiye Montrö Sözleşmesi\'ni uygulayarak Boğazlar\'ı savaş gemilerine kapattı, yaptırımlara katılmadı, İstanbul\'da müzakereler ve Temmuz 2022\'de tahıl koridoru anlaşmasına ev sahipliği yaptı.',
      s: [
        { ad: 'Montrö\'yü uygula, arabulucu ol', etki: { d: { ab: 4, abd: 4, rus: 1 } }, tarih: true },
        { ad: 'Batı yaptırımlarına katıl', etki: { d: { ab: 8, abd: 8, rus: -15 }, e: { buyume: -1 } } },
        { ad: 'Rusya ile ticareti artır', etki: { d: { rus: 6, ab: -6, abd: -6 }, e: { buyume: 0.5 } } }
      ] },
    { id: 'deprem2023', sure: 3, t: '2023-02-06', tur: 'karar', baslik: '6 Şubat depremleri', yer: 'Kahramanmaraş',
      metin: 'Kahramanmaraş merkezli 7,7 ve 7,6 büyüklüğünde iki deprem 11 ili yıktı. Enkaz altında on binler var; ilk saatlerde arama kurtarma ekipleri bazı ilçelere ulaşamadı.',
      tarih: '50 binden fazla kişi hayatını kaybetti. Üç ay olağanüstü hal ilan edildi; bölgede yüz binlerce konutun yapımına başlandı. İlk günlerdeki koordinasyon ve imar affı eleştirildi.',
      s: [
        { ad: 'Orduyu da seferber et, OHAL ve bir yılda konut sözü', etki: { k: { sag: 1, kurt: 1 }, e: { acik: 3 } }, tarih: true },
        { ad: 'Uluslararası ekiplere tam izin, bağımsız inceleme', etki: { k: { laik: 2, kurt: 1 }, d: { ab: 4 }, e: { acik: 3 } } },
        { ad: 'Müteahhitlere ve imar affına hesap sorulsun', etki: { k: { laik: 2, sag: 1 }, i: { isd: -3 }, e: { acik: 2.5 } } }
      ] },
    { id: 'secim2023', t: '2023-05-14', tur: 'secim', secim: 'genel', baslik: 'Cumhurbaşkanlığı ve milletvekili seçimi', gercek: { akp: 35.6, chp: 25.3, mhp: 10.1, sandalye: 268 } },
    { id: 'simsek', sure: 10, t: '2023-06-03', tur: 'karar', baslik: 'Ekonomide dönüş', yer: 'Ankara',
      metin: 'Seçimden sonra enflasyon %40\'ın üstünde, rezervler eksiye düşmüş. Piyasaların güvendiği bir ekonomi ekibi ve faiz artışı öneriliyor.',
      tarih: 'Mehmet Şimşek Hazine ve Maliye Bakanı oldu; Merkez Bankası faizi Haziran 2023–Mart 2024 arasında %8,5\'ten %50\'ye çıkardı. Enflasyon 2024 ortasından itibaren düşmeye başladı.',
      s: [
        { ad: 'Ortodoks politika: faiz artışı, sıkı bütçe', etki: { e: { mb: 'sikilastir', faiz: 15, guven: 12, h: -1 }, k: { sag: -2 } }, tarih: true },
        { ad: 'Kademeli normalleşme', etki: { e: { mb: 'bagimsiz', faiz: 5, guven: 4 } } },
        { ad: 'Düşük faize devam', etki: { e: { mb: 'baski', guven: -8 } } }
      ] },
    { id: 'yerel2024', t: '2024-03-31', tur: 'secim', secim: 'yerel', baslik: 'Yerel seçimler', gercek: { akp: 35.5, chp: 37.8 }, buyuksehir: true },
    { id: 'terorsuz', sure: 15, t: '2024-10-22', tur: 'karar', baslik: 'Yeni süreç', yer: 'TBMM', kisi: ['bahceli'],
      metin: 'MHP Genel Başkanı Bahçeli, Meclis\'te Öcalan\'ın PKK\'nın feshini ilan etmesi çağrısında bulundu. Yeni bir barış süreci mi başlıyor?',
      tarih: 'Öcalan Şubat 2025\'te PKK\'ya silah bırakma çağrısı yaptı; PKK Mayıs 2025\'te kendini feshetti, Temmuz 2025\'te ilk silah yakma töreni yapıldı. Meclis\'te bir komisyon kuruldu.',
      s: [
        { ad: 'Süreci destekle', etki: { k: { kurt: 5, mil: -1 }, b: { yeniSurec: 1 } }, tarih: true },
        { ad: 'Temkinli ol, önce silahlar', etki: { k: { mil: 1 } } },
        { ad: 'Karşı çık', etki: { k: { mil: 2, kurt: -5 } } }
      ] },
    { id: 'esad2024', t: '2024-12-08', tur: 'haber', baslik: 'Esad devrildi', kisi: ['esad'],
      metin: 'Suriye\'de muhalif güçler Şam\'a girdi; Beşar Esad Rusya\'ya kaçtı. 13 yıllık iç savaşın ardından Suriyelilerin dönüşü konuşuluyor.', etki: { d: { ort: 3 }, k: { mil: 1 } } },
    { id: 'imamoglu2025', sure: 5, t: '2025-03-19', tur: 'karar', baslik: 'İmamoğlu soruşturması', yer: 'İstanbul', kisi: ['imamoglu', 'ozel'],
      metin: 'CHP\'nin cumhurbaşkanı adayı olması beklenen İstanbul Büyükşehir Belediye Başkanı Ekrem İmamoğlu yolsuzluk ve terör soruşturmalarında gözaltına alındı; diploması da iptal edildi. Muhalefet bunu siyasi bir operasyon olarak görüyor, hükümet yargının bağımsız olduğunu söylüyor. Büyük protestolar başladı.',
      tarih: 'İmamoğlu tutuklandı ve görevden uzaklaştırıldı. Protestolarda binlerce kişi gözaltına alındı; lira sert değer kaybetti, Merkez Bankası rezerv sattı ve faiz artırdı. CHP İmamoğlu\'nu cumhurbaşkanı adayı ilan etti.',
      e: { kur: 5, guven: -8 },
      s: [
        { ad: '"Yargı bağımsızdır" de, süreci izle', etki: { k: { laik: -6, sag: -2 }, i: { yargi: -2 }, d: { ab: -6 } }, tarih: true },
        { ad: 'Tutuksuz yargılama çağrısı yap', etki: { k: { laik: 3, sag: 1, muh: -1 }, d: { ab: 3 }, e: { guven: 4 } } },
        { ad: 'Protestolara sert müdahale', etki: { k: { laik: -8, muh: 1 }, d: { ab: -8 }, e: { guven: -4 } } }
      ] },
    { id: 'pkkfesih', t: '2025-05-12', tur: 'haber', baslik: 'PKK kendini feshetti',
      metin: 'PKK, kongresinde örgütü feshetme ve silahlı mücadeleyi bitirme kararı aldığını açıkladı. Temmuz\'da Süleymaniye\'de ilk silah bırakma töreni yapıldı.', etki: { k: { kurt: 2, mil: 1 }, e: { guven: 2 } } }
  ];
  V.OLAY.push(...O);
  // eski "son" kartını 2025 sonuna taşı
  const son = V.OLAY.find(o => o.id === 'son1'); if (son) { son.t = '2025-12-15'; son.baslik = 'Bugüne kadar'; }
  V.OLAY.sort((a, b) => a.t < b.t ? -1 : a.t > b.t ? 1 : 0);
  // yıllık bütçe ve asgari ücret (2008 sonrası)
  for (let y = 2008; y <= 2025; y++) {
    V.OLAY.push({ id: 'butce' + y, sure: 60, t: (y - 1) + '-10-15', tur: 'butce', yil: y, kosul: s => s.iktidar });
  }
  V.OLAY.sort((a, b) => a.t < b.t ? -1 : a.t > b.t ? 1 : 0);
  V.HABER.push(['2008-05-01', 'IMF ile stand-by programı sona erdi'], ['2009-01-01', 'YTL\'deki "Yeni" ibaresi kaldırıldı'], ['2009-03-13', 'İlk yüksek hızlı tren Ankara–Eskişehir seferlerine başladı'],
    ['2010-12-17', 'Tunus\'ta Arap Baharı başladı'], ['2013-10-29', 'Marmaray açıldı'], ['2016-08-26', 'Yavuz Sultan Selim Köprüsü açıldı'], ['2016-12-20', 'Avrasya Tüneli açıldı'],
    ['2018-10-29', 'İstanbul Havalimanı açıldı'], ['2019-06-23', 'İstanbul yenilenen seçimde Ekrem İmamoğlu %54 ile kazandı'], ['2022-03-18', '1915 Çanakkale Köprüsü açıldı'],
    ['2022-07-22', 'İstanbul\'da tahıl koridoru anlaşması imzalandı'], ['2023-04-27', 'Akkuyu Nükleer Santrali\'ne ilk yakıt geldi'], ['2024-01-25', 'TBMM İsveç\'in NATO üyeliğini onayladı']);
})(window.VERI);
