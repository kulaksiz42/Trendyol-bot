/* Başkan: Türkmenistan — oyun verisi. Olaylar ve tarihler gerçek; lider kurgusaldır.
   Ekonomik rakamlar yaklaşıktır; Türkmenistan'ın resmî istatistikleri bağımsız kuruluşlarca tartışmalı bulunur. */
'use strict';
window.VERI = (function () {
  const PARTILER = ['akp', 'ras', 'bos'];
  const PARTI = {
    akp: { ad: 'Sen', uzun: 'Devlet Başkanı ve destekçileri', renk: '#1fa463' },
    ras: { ad: 'Karşıt', uzun: 'Muhalefet ve rakip adaylar', renk: '#c0392b' },
    bos: { ad: 'Kayıtsız', uzun: 'Boykot, geçersiz, kayıtsız', renk: '#7f8c8d' }
  };
  // destek kaybı: muhalefete ya da kayıtsızlığa gider
  const ALT = { ahal: { ras: 0.5, bos: 0.5 }, mary: { ras: 0.5, bos: 0.5 }, dasoguz: { ras: 0.6, bos: 0.4 }, balkan: { ras: 0.5, bos: 0.5 }, kent: { ras: 0.7, bos: 0.3 } };
  const KESIM = {
    ahal: { ad: 'Ahal (Teke) elitleri', ikon: '🐎', v0: 0.66, duy: 2 },
    mary: { ad: 'Mary–Lebap çiftçileri', ikon: '🌾', v0: 0.6, duy: 4 },
    dasoguz: { ad: 'Daşoguz ve azınlıklar', ikon: '🏺', v0: 0.5, duy: 3 },
    balkan: { ad: 'Balkan enerji işçileri', ikon: '🛢️', v0: 0.58, duy: 4 },
    kent: { ad: 'Aşgabat kentlileri', ikon: '🏙️', v0: 0.52, duy: 3 }
  };
  const IL_KESIM = {
    'Ahal': { ahal: 80, kent: 10, mary: 10 }, 'Aşgabat': { kent: 65, ahal: 35 }, 'Balkan': { balkan: 80, kent: 20 },
    'Daşoguz': { dasoguz: 90, kent: 10 }, 'Lebap': { mary: 75, dasoguz: 15, kent: 10 }, 'Mary': { mary: 90, kent: 10 }
  };
  const ilKesim = ad => Object.assign({ ahal: 0, mary: 0, dasoguz: 0, balkan: 0, kent: 0 }, IL_KESIM[ad]);
  const KURUM = {
    guv: { ad: 'Güvenlik servisleri', ikon: '🛡️', v: 55 }, elit: { ad: 'Bölge elitleri', ikon: '🏛️', v: 50 },
    din: { ad: 'Din kurulu', ikon: '🕌', v: 50 }, isd: { ad: 'Yabancı şirketler', ikon: '💼', v: 40 }
  };
  const DIS = {
    rus: { ad: 'Rusya', ikon: '🇷🇺', v: 65 }, cin: { ad: 'Çin', ikon: '🇨🇳', v: 40 },
    bati: { ad: 'ABD ve AB', ikon: '🇪🇺', v: 45 }, tr: { ad: 'Türkiye', ikon: '🇹🇷', v: 60 }, iran: { ad: 'İran', ikon: '🇮🇷', v: 50 }
  };
  // yıllık temel seyir (yaklaşık; resmî büyüme rakamları tartışmalı). kur: manat/$ resmî (2009 öncesi eski manat)
  const TABLO = {
    1991: { b: -4.7, enf: 100, kur: 0, gazRus: 60, kb: 1500 }, 1992: { b: -5.3, enf: 500, kur: 0, gazRus: 50, kb: 1300 },
    1993: { b: 1.5, enf: 3100, kur: 2, gazRus: 55, kb: 1100 }, 1994: { b: -17, enf: 1750, kur: 75, gazRus: 35, kb: 900 },
    1995: { b: -7, enf: 1000, kur: 200, gazRus: 25, kb: 700 }, 1996: { b: 0.1, enf: 990, kur: 4070, gazRus: 25, kb: 700 },
    1997: { b: -11, enf: 84, kur: 4165, gazRus: 7, kb: 650 }, 1998: { b: 6.7, enf: 17, kur: 5200, gazRus: 2, kb: 650 },
    1999: { b: 16.5, enf: 24, kur: 5200, gazRus: 15, kb: 750 }, 2000: { b: 18.6, enf: 8, kur: 5200, gazRus: 40, kb: 1000 },
    2001: { b: 20, enf: 12, kur: 5200, gazRus: 45, kb: 1200 }, 2002: { b: 15.8, enf: 9, kur: 5200, gazRus: 40, kb: 1400 },
    2003: { b: 17, enf: 6, kur: 5200, gazRus: 43, kb: 1700 }, 2004: { b: 17, enf: 9, kur: 5200, gazRus: 45, kb: 2000 },
    2005: { b: 13, enf: 11, kur: 5200, gazRus: 45, kb: 2700 }, 2006: { b: 11, enf: 8, kur: 5200, gazRus: 50, kb: 3200 },
    2007: { b: 11.6, enf: 6, kur: 5200, gazRus: 50, kb: 3700 }, 2008: { b: 14.7, enf: 13, kur: 14250, gazRus: 50, kb: 4300 },
    2009: { b: 6.1, enf: -2, kur: 2.85, gazRus: 10, kb: 4100 }, 2010: { b: 9.2, enf: 4, kur: 2.85, gazRus: 10, kb: 4400 },
    2011: { b: 14.7, enf: 5, kur: 2.85, gazRus: 10, kb: 5600 }, 2012: { b: 11.1, enf: 5, kur: 2.85, gazRus: 10, kb: 6600 },
    2013: { b: 10.2, enf: 7, kur: 2.85, gazRus: 10, kb: 7300 }, 2014: { b: 10.3, enf: 6, kur: 2.85, gazRus: 10, kb: 8000 },
    2015: { b: 6.5, enf: 7, kur: 3.5, gazRus: 4, kb: 6400 }, 2016: { b: 6.2, enf: 4, kur: 3.5, gazRus: 0, kb: 6400 },
    2017: { b: 6.5, enf: 8, kur: 3.5, gazRus: 0, kb: 6600 }, 2018: { b: 6.2, enf: 13, kur: 3.5, gazRus: 0, kb: 6900 },
    2019: { b: 6.3, enf: 13, kur: 3.5, gazRus: 5, kb: 7300 }, 2020: { b: 5.9, enf: 10, kur: 3.5, gazRus: 5, kb: 7000 },
    2021: { b: 5, enf: 15, kur: 3.5, gazRus: 10, kb: 7500 }, 2022: { b: 6.2, enf: 11, kur: 3.5, gazRus: 10, kb: 8000 },
    2023: { b: 6.3, enf: 8, kur: 3.5, gazRus: 10, kb: 8500 }, 2024: { b: 6.3, enf: 7, kur: 3.5, gazRus: 10, kb: 8900 }
  };
  // gaz fiyatı ($ / 1000 m³, yaklaşık ihracat ortalaması)
  const FIYAT = { 1991: 30, 1995: 40, 2000: 38, 2003: 44, 2006: 65, 2007: 100, 2008: 140, 2009: 250, 2011: 300, 2014: 280, 2015: 200, 2016: 150, 2018: 170, 2020: 140, 2021: 200, 2022: 260, 2024: 220 };
  const BOLGE = { tm: { ad: 'Türkmenistan', iller: ['Ahal', 'Aşgabat', 'Balkan', 'Daşoguz', 'Lebap', 'Mary'] } };
  const VSTART = { ahal: 0.66, mary: 0.6, dasoguz: 0.5, balkan: 0.58, kent: 0.52 };
  const EKO = { enf: 100, faiz: 0, kur: 0, buyume: -4.7, issizlik: 0, borc: 0, acik: 0, guven: 45, kisiBasi: 1500, nufus: 3.8, gaz: 60, rezerv: 0.2, gelir: 1.8 };
  const EKO_GECMIS = [['1991-10-27', EKO]];
  const GERCEK = { 2022: { enf: 11, buyume: 6.2, kur: 3.5, kisiBasi: 8000, gaz: 42 } };
  const ULKE_AD = { Uzbekistan: 'Özbekistan', Kazakhstan: 'Kazakistan', Afghanistan: 'Afganistan', Iran: 'İran', Azerbaijan: 'Azerbaycan', Russia: 'Rusya', Tajikistan: 'Tacikistan', Pakistan: 'Pakistan', Turkey: 'Türkiye', Georgia: 'Gürcistan', China: 'Çin', India: 'Hindistan', Kyrgyzstan: 'Kırgızistan', Armenia: 'Ermenistan', Iraq: 'Irak' };
  const ULKE_ETIKET = ['Uzbekistan', 'Kazakhstan', 'Afghanistan', 'Iran', 'Azerbaijan', 'Tajikistan'];
  const ETIKET_YER = { Uzbekistan: [63.5, 42.2], Kazakhstan: [57, 45.3], Afghanistan: [65.5, 34.8], Iran: [56.5, 34.5], Azerbaijan: [48, 40.4], Tajikistan: [70.5, 38.6] };
  const DENIZ = [{ ad: 'Hazar Denizi', lon: 51.3, lat: 40.4 }, { ad: 'Karakum Çölü', lon: 60.6, lat: 40.25 }];
  const HARITA = { lon0: 59.3, lat0: 39.2, olcek: 6.6, genislik: 64, buyuk: ['Aşgabat', 'Ahal', 'Balkan', 'Daşoguz', 'Lebap', 'Mary'], duzelt: { 'Ahal': [59.6, 38.6], 'Aşgabat': [58.36, 37.94], 'Balkan': [55.3, 39.6], 'Lebap': [63.4, 38.9], 'Mary': [61.9, 37.0], 'Daşoguz': [59.0, 41.3] } };

  // projeler: maliyet milyar $, süre ay. bagNokta: boru hattının sınır noktası
  const PROJE = {
    iran: { ad: 'İran gaz boru hattı', ikon: '🔥', maliyet: 0.3, sure: 18, yil: 1995, il: 'Balkan', tekil: true, gaz: 8, bagNokta: [54.2, 37.3], etki: { balkan: 2 }, yerel: 3, bilgi: 'Korpeje–Kurt Kui hattı. Gerçekte Aralık 1997\'de açıldı; Rusya dışındaki ilk ihracat yolu.' },
    cin: { ad: 'Çin gaz boru hattı', ikon: '🐉', maliyet: 4, sure: 40, yil: 2006, il: 'Lebap', tekil: true, gaz: 35, bagNokta: [65.5, 39.6], etki: { mary: 2, balkan: 1 }, yerel: 4, bilgi: 'Özbekistan ve Kazakistan üzerinden Çin\'e. Gerçekte 14 Aralık 2009\'da açıldı; ihracatın büyük kısmı artık Çin\'e gidiyor.' },
    hazar: { ad: 'Hazar ötesi boru hattı', ikon: '🌊', maliyet: 5, sure: 48, yil: 2008, il: 'Balkan', tekil: true, gaz: 15, bagNokta: [50.5, 40.2], etki: { balkan: 3 }, yerel: 3, bilgi: 'Hazar\'ın altından Azerbaycan\'a, oradan Türkiye ve Avrupa\'ya. Yıllardır konuşuluyor; Rusya ve İran itiraz ediyor. Gerçekte yapılmadı.' },
    tapi: { ad: 'TAPI boru hattı', ikon: '🛤️', maliyet: 8, sure: 60, yil: 2015, il: 'Mary', tekil: true, gaz: 20, bagNokta: [62.4, 35.3], etki: { mary: 3 }, yerel: 3, bilgi: 'Türkmenistan–Afganistan–Pakistan–Hindistan. Temeli 13 Aralık 2015\'te atıldı; Afganistan\'daki güvenlik riskleri nedeniyle henüz tamamlanmadı.' },
    mermer: { ad: 'Beyaz mermer bulvar', ikon: '🏛️', maliyet: 1.2, sure: 20, yil: 1994, il: 'Aşgabat', etki: { kent: 1, ahal: 1 }, yerel: 2, bilgi: 'Aşgabat, 2013\'te en çok beyaz mermer binaya sahip şehir olarak Guinness rekorlar kitabına girdi.' },
    hastane: { ad: 'Hastane', ikon: '🏥', maliyet: 0.25, sure: 14, yil: 1992, etki: { mary: 0.4, dasoguz: 0.4, kent: 0.3 }, yerel: 3, bilgi: 'Sağlık altyapısı. 2004\'te başkent dışındaki birçok hastane kapatıldı; bu karar uluslararası tepki çekti.' },
    okul: { ad: 'Okul ve kolej', ikon: '🏫', maliyet: 0.15, sure: 10, yil: 1992, etki: { kent: 0.4, dasoguz: 0.3 }, yerel: 2, bilgi: '2007 reformuyla eğitim 9 yıldan 10, 2013\'te 12 yıla çıkarıldı.' },
    sulama: { ad: 'Sulama ve kanal', ikon: '💧', maliyet: 0.8, sure: 24, yil: 1993, etki: { mary: 1, dasoguz: 1 }, yerel: 3, bilgi: 'Karakum Kanalı ülkenin can damarı. Altın Asır Gölü projesi 2009\'da başladı.' },
    avaza: { ad: 'Avaza turizm bölgesi', ikon: '🏖️', maliyet: 2, sure: 30, yil: 2007, il: 'Balkan', tekil: true, etki: { balkan: 1, kent: 0.5 }, yerel: 2, bilgi: 'Hazar kıyısında 2007\'de başlayan turizm bölgesi. Yabancı turist sayısı sınırlı kaldı.' },
    demiryolu: { ad: 'Kazakistan–İran demiryolu', ikon: '🚆', maliyet: 1.5, sure: 48, yil: 2007, il: 'Balkan', tekil: true, bagNokta: [55.5, 41.4], etki: { balkan: 1.5 }, yerel: 2, buyume: 0.3, bilgi: 'Kuzey–Güney koridoru. Gerçekte Aralık 2014\'te açıldı.' }
  };
  Object.values(PROJE).forEach(p => { if (p.buyume === undefined) p.buyume = 0.1; });

  /* Olaylar. sure = masada bekleyebileceği gün. etki: k (kesim), i (kurum), d (dış), b (bayrak),
     e: guven, buyume, enf, rezerv, kurx (resmî kur çarpanı), rus (Rusya'ya satış çarpanı), h (harcama), acilim, sub */
  const OLAY = [
    { id: 'kurulus', t: '1991-10-27', tur: 'karar', baslik: 'Bağımsızlık', yer: 'Aşgabat',
      metin: 'Sovyetler Birliği dağılıyor. Dünkü referandumda halkın %94\'ü bağımsızlık dedi (resmî sonuç). Bugün Türkmenistan bağımsızlığını ilan etti ve sen devlet başkanısın. Yeni devlet nasıl yönetilecek?',
      tarih: 'Saparmurat Niyazov güçlü bir başkanlık sistemi kurdu. Komünist Parti, Türkmenistan Demokratik Partisi adını aldı ve uzun yıllar tek parti olarak kaldı.',
      s: [
        { ad: 'Güçlü başkanlık, tek parti', etki: { i: { guv: 10, elit: 6 }, d: { bati: -6, rus: 2 }, e: { acilim: 'kapali' } }, tarih: true },
        { ad: 'Kontrollü geçiş: başkanlık ama sınırlı muhalefet', etki: { k: { kent: 3 }, i: { guv: 2 }, d: { bati: 3 }, e: { acilim: 'kontrollu' } } },
        { ad: 'Çok partili demokrasi ve serbest basın', etki: { k: { kent: 6, dasoguz: 2 }, i: { guv: -10, elit: -8 }, d: { bati: 12, rus: -4 }, e: { acilim: 'acik' } } }
      ] },
    { id: 'secim1992', t: '1992-06-21', tur: 'secim', secim: 'baskan', baslik: 'Başkanlık seçimi', gercek: { akp: 99.5 } },
    { id: 'bedava', sure: 30, t: '1992-12-10', tur: 'karar', baslik: 'Ücretsiz gaz, su, elektrik', yer: 'Aşgabat',
      metin: 'Ülke gaz üzerinde yüzüyor ama halk yoksul. Danışmanların vatandaşlara gaz, su, elektrik ve tuzun ücretsiz verilmesini öneriyor. Bütçeye yükü büyük, israfı da artırabilir.',
      tarih: '1993\'ten itibaren gaz, su, elektrik ve tuz belli miktara kadar ücretsiz oldu. Uygulama 1 Ocak 2019\'da sona erdi.',
      s: [
        { ad: 'Herkese ücretsiz', etki: { k: { mary: 4, dasoguz: 4, kent: 3, balkan: 3, ahal: 2 }, e: { sub: 1, rezerv: -0.2 } }, tarih: true },
        { ad: 'Sadece yoksul ailelere destek', etki: { k: { mary: 2, dasoguz: 2 }, i: { isd: 3 }, e: { sub: 0.4 } } },
        { ad: 'Piyasa fiyatı, gelir yatırıma', etki: { k: { mary: -3, dasoguz: -3, kent: -2 }, i: { isd: 6 }, e: { sub: 0, buyume: 1 } } }
      ] },
    { id: 'manat', sure: 20, t: '1993-08-20', tur: 'karar', baslik: 'Kendi paran: manat', yer: 'Aşgabat',
      metin: 'Rusya yeni ruble basıyor ve eski rubleleri geçersiz kılıyor. Ruble bölgesinde kalmak enflasyonu Moskova\'ya bağlar; kendi paranı çıkarmak riskli ama bağımsız.',
      tarih: 'Türkmen manatı 1 Kasım 1993\'te tedavüle girdi; ilk kur 1 dolar = 2 manattı. Ardından yıllarca yüksek enflasyon yaşandı.',
      s: [
        { ad: 'Manatı çıkar', etki: { k: { ahal: 2, kent: 1 }, d: { rus: -3, tr: 2 } }, tarih: true },
        { ad: 'Ruble bölgesinde kal', etki: { d: { rus: 6 }, k: { kent: 1 }, e: { enf: 0.3 } } },
        { ad: 'Manatı çıkar, dolara sabitle (para kurulu)', etki: { i: { isd: 6 }, d: { bati: 4 }, e: { enf: -0.4, buyume: -2, rezerv: -0.3 } } }
      ] },
    { id: 'enflasyon', sure: 30, t: '1994-02-15', tur: 'karar', baslik: 'Hiperenflasyon', yer: 'Aşgabat',
      metin: 'Fiyatlar bir yılda 30 kat arttı. Çarşıda ekmek kuyrukları var. Ekonomistler ikiye bölündü: fiyatları serbest bırakıp harcamayı kısmak mı, yoksa fiyat kontrolü ve sübvansiyon mu?',
      tarih: 'Hükümet fiyat kontrollerini ve devlet ekonomisini sürdürdü. Enflasyon ancak 1997–98\'de kontrol altına alındı.',
      s: [
        { ad: 'Fiyat kontrolleri ve sübvansiyon', etki: { k: { mary: 2, dasoguz: 2 }, i: { elit: 3 } }, tarih: true },
        { ad: 'Şok terapi: harcamayı kıs, fiyatları serbest bırak', etki: { k: { mary: -5, dasoguz: -4, kent: -2 }, i: { isd: 8 }, d: { bati: 5 }, e: { enf: -0.6, buyume: -4, h: -1 } } },
        { ad: 'IMF ile program yap', etki: { k: { kent: 1, mary: -2 }, i: { isd: 5, elit: -3 }, d: { bati: 8, rus: -2 }, e: { enf: -0.4, buyume: -2, rezerv: 0.5 } } }
      ] },
    { id: 'referandum1994', sure: 10, t: '1994-01-10', tur: 'karar', baslik: 'Görev süresi', yer: 'Aşgabat', kosul: s => s.pol.acilim !== 'acik',
      metin: 'Destekçilerin, görev süreni 2002\'ye kadar uzatmak için referandum öneriyor. Muhalefet ve Batılı diplomatlar buna karşı.',
      tarih: '15 Ocak 1994 referandumunda Niyazov\'un görevi 2002\'ye uzatıldı (resmî sonuç: %99,99 evet).',
      s: [
        { ad: 'Referandumla görevini uzat', etki: { i: { guv: 4, elit: 4 }, d: { bati: -6 }, k: { kent: -2 } }, tarih: true },
        { ad: 'Takvime uy, 1997\'de seçime git', etki: { d: { bati: 6 }, k: { kent: 3 }, b: { secim1997: 1 } } }
      ] },
    { id: 'tarafsizlik', sure: 30, t: '1995-06-15', tur: 'karar', baslik: 'Dış politika', yer: 'Aşgabat',
      metin: 'Komşuda Afganistan iç savaşta, kuzeyde Rusya askeri ittifak (Kolektif Güvenlik Antlaşması) istiyor, Batı NATO ortaklığı öneriyor. Türkmenistan nerede duracak?',
      tarih: 'Türkmenistan "daimi tarafsızlık" politikasını seçti. BM Genel Kurulu bunu 12 Aralık 1995\'te tanıdı.',
      s: [
        { ad: 'Daimi tarafsızlık', etki: { k: { ahal: 2, kent: 1 }, d: { bati: 3, rus: 2, iran: 3 }, b: { tarafsiz: 1 } }, tarih: true },
        { ad: 'Rusya ile askeri ittifak', etki: { d: { rus: 12, bati: -8 }, i: { guv: 4 }, e: { rus: 1.3 } } },
        { ad: 'NATO ortaklığı, Batı\'ya yakınlaş', etki: { d: { bati: 12, rus: -12, iran: -5 }, i: { isd: 4 }, e: { rus: 0.7 } } }
      ] },
    { id: 'bm', t: '1995-12-12', tur: 'haber', baslik: 'BM tarafsızlığı tanıdı', kosul: s => s.b.tarafsiz,
      metin: 'BM Genel Kurulu, Türkmenistan\'ın daimi tarafsızlığını oybirliğiyle tanıdı. 12 Aralık artık resmî tatil.', etki: { k: { ahal: 2, kent: 2 }, d: { bati: 3 } } },
    { id: 'secim1997', t: '1997-06-21', tur: 'secim', secim: 'baskan', baslik: 'Başkanlık seçimi', kosul: s => s.b.secim1997 },
    { id: 'gazprom', sure: 10, t: '1997-03-15', tur: 'karar', baslik: 'Gazprom ile kavga', yer: 'Aşgabat',
      metin: 'Gazprom, Türkmen gazını düşük fiyattan alıp Avrupa\'ya pahalıya satıyor. Ukrayna da aldığı gazın parasını ödemiyor. Tek ihracat yolu Rusya\'nın boru hatları.',
      tarih: 'Türkmenistan Mart 1997\'de Rusya üzerinden ihracatı durdurdu. Ekonomi o yıl yaklaşık %11 küçüldü; ihracat 1999\'da yeniden başladı.',
      s: [
        { ad: 'İhracatı durdur, adil fiyat iste', etki: { d: { rus: -12 }, k: { ahal: 2 }, b: { gazKavga: 1 } }, tarih: true },
        { ad: 'Düşük fiyata razı ol, gaz aksın', etki: { d: { rus: 6 }, k: { balkan: 2 }, b: { gazUzlas: 1 } } },
        { ad: 'Batılı şirketlerle yeni yollar ara', etki: { d: { bati: 6, rus: -8 }, i: { isd: 6 }, b: { gazKavga: 1 } } }
      ] },
    { id: 'omurboyu', sure: 10, t: '1999-12-28', tur: 'karar', baslik: 'Ömür boyu başkanlık', yer: 'Halk Maslahatı', kosul: s => s.pol.acilim !== 'acik',
      metin: 'Halk Maslahatı (Halk Konseyi) seni ömür boyu devlet başkanı ilan etmek istiyor. Kabul edersen seçim yapılmaz.',
      tarih: 'Halk Maslahatı 28 Aralık 1999\'da Niyazov\'u ömür boyu başkan ilan etti.',
      s: [
        { ad: 'Kabul et', etki: { i: { guv: 6, elit: 5 }, d: { bati: -12, tr: -2 }, k: { kent: -4 }, b: { omurBoyu: 1 } }, tarih: true },
        { ad: 'Reddet: seçimler sürsün', etki: { d: { bati: 8 }, k: { kent: 4 }, i: { elit: -2 } } }
      ] },
    { id: 'ruhnama', sure: 30, t: '2001-09-15', tur: 'karar', baslik: 'Ruhnama', yer: 'Aşgabat', kosul: s => s.pol.acilim !== 'acik',
      metin: 'Saray yazarları senin adınla "milletin ruhunu" anlatan bir kitap hazırladı. Okullarda zorunlu ders, devlet sınavlarında soru olsun mu?',
      tarih: 'Niyazov\'un Ruhnama\'sı 2001\'de yayımlandı, okullarda ve devlet sınavlarında zorunlu oldu; sonraki yıllarda etkisi azaltıldı.',
      s: [
        { ad: 'Zorunlu ders olsun', etki: { i: { elit: 3, din: -6 }, d: { bati: -6 }, k: { kent: -4, ahal: 2 } }, tarih: true },
        { ad: 'Sadece bir kültür kitabı olsun', etki: { k: { ahal: 1 } } },
        { ad: 'Yayımlama', etki: { k: { kent: 2 }, i: { din: 2 }, d: { bati: 1 } } }
      ] },
    { id: 'suikast', sure: 7, t: '2002-11-25', tur: 'karar', baslik: 'Konvoya saldırı', yer: 'Aşgabat',
      metin: 'Bu sabah başkanlık konvoyuna silahlı saldırı düzenlendi; kurtuldun. Güvenlik servisleri yurtdışındaki muhalefeti ve eski bakanları sorumlu tutuyor.',
      tarih: 'Hükümet eski Dışişleri Bakanı Boris Şıhmuradov\'u sorumlu tuttu; o ve onlarca kişi ağır cezalara çarptırıldı. Uluslararası kuruluşlar yargılamaların adil olmadığını belirtti.',
      s: [
        { ad: 'Geniş tutuklamalar, olağanüstü önlemler', etki: { i: { guv: 10 }, d: { bati: -12, tr: -3 }, k: { kent: -4, dasoguz: -2 } }, tarih: true },
        { ad: 'Uluslararası gözlemcili bağımsız soruşturma', etki: { i: { guv: -5 }, d: { bati: 8 }, k: { kent: 2 } } },
        { ad: 'Muhalefetle diyalog çağrısı', etki: { i: { guv: -8, elit: -3 }, d: { bati: 10 }, k: { kent: 5 }, e: { acilim: 'kontrollu' } } }
      ] },
    { id: 'rus25', sure: 20, t: '2003-04-10', tur: 'karar', baslik: '25 yıllık gaz anlaşması', yer: 'Moskova',
      metin: 'Rusya 25 yıllık bir anlaşma öneriyor: Türkmen gazının büyük kısmını Gazprom alacak, ama fiyatın bir kısmı mal ile ödenecek.',
      tarih: 'Anlaşma 10 Nisan 2003\'te imzalandı. Fiyat ilk yıllarda düşüktü; 2008\'den sonra Avrupa fiyatlarına yaklaştı.',
      s: [
        { ad: 'İmzala', etki: { d: { rus: 10 }, k: { balkan: 2 }, e: { rus: 1.1 } }, tarih: true },
        { ad: 'Kısa vadeli, piyasa fiyatlı anlaşma iste', etki: { d: { rus: -4 }, e: { rus: 0.9, rezerv: 0.5 } } },
        { ad: 'İmzalama; Çin ve Türkiye\'ye yönel', etki: { d: { rus: -12, cin: 8, tr: 5 }, e: { rus: 0.6 } } }
      ] },
    { id: 'hastaneler', sure: 30, t: '2005-02-20', tur: 'karar', baslik: 'Taşradaki hastaneler', yer: 'Aşgabat',
      metin: 'Maliye, bütçe açığı için başkent dışındaki hastanelerin kapatılmasını, hastaların Aşgabat\'a yönlendirilmesini öneriyor. On binlerce sağlık çalışanının yerine askerler getirilecek.',
      tarih: '2004\'te binlerce sağlık çalışanının yerine askerler getirildi, 2005\'te başkent dışındaki birçok hastane kapatıldı; DSÖ ve insan hakları kuruluşları eleştirdi.',
      s: [
        { ad: 'Hastaneleri kapat', etki: { k: { mary: -5, dasoguz: -5, balkan: -3 }, d: { bati: -6 }, e: { rezerv: 0.3 } }, tarih: true },
        { ad: 'Kapatma; gaz gelirinden finanse et', etki: { k: { mary: 2, dasoguz: 2 }, e: { rezerv: -0.4 } } },
        { ad: 'Uluslararası yardımla modernleştir', etki: { k: { mary: 3, dasoguz: 3 }, d: { bati: 5 }, i: { guv: -2 } } }
      ] },
    { id: 'reform2007', sure: 30, t: '2007-02-20', tur: 'karar', baslik: 'Reform paketi', yer: 'Aşgabat',
      metin: 'Halk değişim bekliyor: eğitim 9 yıla düşürülmüştü, emekli maaşları kesilmişti, internet neredeyse yok. Ne kadar açılalım?',
      tarih: '2007\'de eğitim 10 yıla çıkarıldı, kesilen emekli maaşları geri verildi, ilk internet kafeler açıldı ve Ruhnama\'nın ağırlığı azaltıldı.',
      s: [
        { ad: 'Eğitim, emeklilik ve internette sınırlı reform', etki: { k: { kent: 4, mary: 2, dasoguz: 2 }, d: { bati: 4 } }, tarih: true },
        { ad: 'Kapsamlı açılım: basın ve seyahat özgürlüğü', etki: { k: { kent: 8, dasoguz: 3 }, i: { guv: -8, elit: -4 }, d: { bati: 12 }, e: { acilim: 'kontrollu' } } },
        { ad: 'Değişiklik yok', etki: { k: { kent: -3 }, i: { guv: 3 } } }
      ] },
    { id: 'kur2008', sure: 20, t: '2008-04-20', tur: 'karar', baslik: 'Çift kur', yer: 'Aşgabat',
      metin: 'Resmî kur 1 dolar = 5.200 manat ama karaborsada 24.000. Yabancı yatırımcı gelmiyor, kayıt dışılık büyük. Kurları birleştirelim mi?',
      tarih: 'Mayıs 2008\'de kur 14.250\'de birleştirildi; 1 Ocak 2009\'da paradan üç sıfır atıldı (5.000 eski manat = 1 yeni manat).',
      s: [
        { ad: 'Kurları birleştir, sonra sıfır at', etki: { i: { isd: 8 }, d: { bati: 4 }, e: { enf: 0.1 } }, tarih: true },
        { ad: 'Çift kur sürsün', etki: { i: { elit: 4, isd: -5 }, e: { kurx: 0.37 } } },
        { ad: 'Tam serbest kur', etki: { i: { isd: 12 }, d: { bati: 6 }, k: { mary: -2, kent: -1 }, e: { enf: 0.3, kurx: 1.2 } } }
      ] },
    { id: 'patlama', sure: 10, t: '2009-04-09', tur: 'karar', baslik: 'Boru hattında patlama', yer: 'Balkan',
      metin: 'Rusya\'ya giden ana hatta patlama oldu, gaz akışı durdu. Aşgabat, Gazprom\'un talebin düştüğü kriz döneminde basıncı habersiz düşürdüğünü söylüyor. Gelirinin büyük kısmı bir gecede kesildi.',
      tarih: 'Rusya\'ya ihracat aylarca durdu, 2010\'da çok daha düşük hacimle yeniden başladı. Türkmenistan Çin hattına yöneldi.',
      s: [
        { ad: 'Gazprom\'u suçla, Çin\'e yönel', etki: { d: { rus: -10, cin: 8 }, e: { rezerv: -1 } }, tarih: true },
        { ad: 'Rusya\'yla yeni şartlarla anlaş', etki: { d: { rus: 6 }, e: { rus: 1.6, rezerv: -0.5 } } },
        { ad: 'Hazar ötesi hat için Avrupa\'ya git', etki: { d: { bati: 8, rus: -12, iran: -3 }, b: { hazarDestek: 1 } } }
      ] },
    { id: 'partiler', sure: 30, t: '2012-01-10', tur: 'karar', baslik: 'Siyasi partiler yasası', yer: 'Mejlis', kosul: s => s.pol.acilim !== 'acik',
      metin: 'Yeni yasa, ikinci bir partinin kurulmasına izin veriyor. Gerçek muhalefet mi, yoksa iktidara yakın bir "rakip" mi?',
      tarih: '2012\'de Sanayiciler ve Girişimciler Partisi kuruldu; bağımsız gözlemciler partinin hükümete yakın olduğunu belirtti.',
      s: [
        { ad: 'İktidara yakın ikinci parti', etki: { d: { bati: 2 } }, tarih: true },
        { ad: 'Gerçek muhalefete izin ver', etki: { k: { kent: 6, dasoguz: 3 }, i: { guv: -10, elit: -6 }, d: { bati: 12 }, e: { acilim: 'acik' } } },
        { ad: 'Tek parti kalsın', etki: { d: { bati: -3 }, i: { guv: 2 } } }
      ] },
    { id: 'deval2015', sure: 7, t: '2014-12-28', tur: 'karar', baslik: 'Manat baskı altında', yer: 'Aşgabat',
      metin: 'Petrol ve gaz fiyatları çöktü, Rusya alımı kesiyor. Merkez Bankası manatı 2,85\'te tutmak için döviz yakıyor.',
      tarih: '1 Ocak 2015\'te manat %19 devalüe edildi (2,85 → 3,50). Sonraki yıllarda karaborsa kuru resmî kurun birkaç katına çıktı.',
      s: [
        { ad: 'Devalüasyon: 3,50', etki: { e: { kurx: 1.0, enf: 0.1 }, k: { kent: -2 } }, tarih: true },
        { ad: 'Kuru rezervle savun', etki: { e: { kurx: 0.82, rezerv: -6 } } },
        { ad: 'Serbest kura geç', etki: { e: { kurx: 1.9, enf: 0.4 }, i: { isd: 10 }, d: { bati: 5 }, k: { kent: -4, mary: -3 } } }
      ] },
    { id: 'olimpiyat', sure: 30, t: '2010-12-15', tur: 'karar', baslik: 'Olimpiyat köyü', yer: 'Aşgabat',
      metin: '2017 Asya Salon ve Dövüş Sanatları Oyunları Aşgabat\'a verildi (2010). Plan, milyarlarca dolarlık bir olimpiyat köyü.',
      tarih: 'Oyunlar Eylül 2017\'de yapıldı; olimpiyat köyünün maliyetinin 5 milyar doları aştığı tahmin ediliyor.',
      s: [
        { ad: 'Görkemli bir köy yap', etki: { k: { kent: 3, ahal: 2 }, d: { bati: 1 }, e: { rezerv: -5 } }, tarih: true },
        { ad: 'Mütevazı tesisler', etki: { k: { kent: 1 }, e: { rezerv: -1.5 } } },
        { ad: 'Oyunları iade et', etki: { k: { kent: -2 }, e: { rezerv: 0 } } }
      ] },
    { id: 'gazprom2016', t: '2016-01-04', tur: 'haber', baslik: 'Gazprom alımı durdurdu',
      metin: 'Gazprom, fiyat anlaşmazlığı nedeniyle Türkmen gazı alımını tamamen durdurdu. İhracatın neredeyse tamamı artık Çin\'e gidiyor.', etki: { d: { rus: -6 } } },
    { id: 'bedavason', sure: 20, t: '2018-09-25', tur: 'karar', baslik: 'Ücretsiz hizmetlerin sonu', yer: 'Mejlis', kosul: s => s.pol.sub > 0,
      metin: 'Bütçe zorlanıyor. 25 yıldır ücretsiz olan gaz, su ve elektrik için ücret alınması öneriliyor.',
      tarih: 'Ücretsiz gaz, su ve elektrik 1 Ocak 2019\'da sona erdi.',
      s: [
        { ad: 'Ücretsiz dönemi bitir', etki: { k: { mary: -4, dasoguz: -4, kent: -3, balkan: -3, ahal: -2 }, e: { sub: 0, rezerv: 0.5 } }, tarih: true },
        { ad: 'Sürdür', etki: { e: { rezerv: -1 } } },
        { ad: 'Kademeli ve hedefli', etki: { k: { mary: -1, kent: -1 }, e: { sub: 0.4 } } }
      ] },
    { id: 'covid', sure: 10, t: '2020-04-01', tur: 'karar', baslik: 'Salgın', yer: 'Aşgabat',
      metin: 'Komşu ülkelerde koronavirüs yayılıyor. Hastanelerde zatürre vakaları artıyor. Ne açıklayacaksın?',
      tarih: 'Türkmenistan resmî olarak hiç COVID-19 vakası bildirmedi; DSÖ ve bağımsız kaynaklar bu açıklamayı sorguladı.',
      s: [
        { ad: '"Ülkede vaka yok" de', etki: { d: { bati: -6 }, k: { kent: -3 } }, tarih: true },
        { ad: 'Şeffaf ol, DSÖ ile çalış', etki: { d: { bati: 6, cin: 2 }, i: { guv: -2 }, k: { kent: 3 }, e: { buyume: -1 } } },
        { ad: 'Sınırları kapat, sessiz kal', etki: { d: { bati: -2 }, e: { buyume: -1.5 } } }
      ] },
    { id: 'halef', sure: 20, t: '2022-02-12', tur: 'karar', baslik: 'Halef meselesi', yer: 'Halk Maslahatı',
      metin: 'Otuz yılı geride bıraktın. Elitler geleceği konuşuyor. Erken bir başkanlık seçimi yapılması öneriliyor.',
      tarih: 'Gurbanguli Berdimuhamedov Şubat 2022\'de erken seçim çağrısı yaptı; oğlu Serdar Berdimuhamedov Mart 2022\'de %73 oyla başkan seçildi.',
      s: [
        { ad: 'Oğlunu aday göster', etki: { i: { elit: 4, guv: 3 }, d: { bati: -5 }, k: { kent: -3 }, b: { halef: 'ogul' } }, tarih: true },
        { ad: 'Açık ve rekabetçi bir seçim; sen aday değilsin', etki: { d: { bati: 15 }, k: { kent: 8 }, i: { elit: -6, guv: -6 }, b: { halef: 'acik' }, e: { acilim: 'acik' } } },
        { ad: 'Sen devam et', etki: { i: { guv: 2 }, d: { bati: -3 }, b: { halef: 'sen' } } }
      ] },
    { id: 'secim2022', t: '2022-03-12', tur: 'secim', secim: 'baskan', baslik: 'Başkanlık seçimi', once: 'halef', gercek: { akp: 73 } },
    { id: 'secim2007', t: '2007-02-11', tur: 'secim', secim: 'baskan', baslik: 'Başkanlık seçimi', kosul: s => !s.b.omurBoyu, gercek: { akp: 89.2 } },
    { id: 'secim2012', t: '2012-02-12', tur: 'secim', secim: 'baskan', baslik: 'Başkanlık seçimi', kosul: s => !s.b.omurBoyu, gercek: { akp: 97.1 } },
    { id: 'secim2017', t: '2017-02-12', tur: 'secim', secim: 'baskan', baslik: 'Başkanlık seçimi', kosul: s => !s.b.omurBoyu, gercek: { akp: 97.7 } },
    { id: 'son1', t: '2022-12-01', tur: 'son', baslik: 'Otuz yılın karnesi' }
  ];
  // olaylar tarih sırasına
  OLAY.sort((a, b) => a.t < b.t ? -1 : 1);
  [1993, 1996, 1999, 2002, 2005, 2008, 2011, 2014, 2017, 2020].forEach(y => OLAY.push({ id: 'butce' + y, sure: 60, t: (y - 1) + '-10-20', tur: 'butce', yil: y }));
  OLAY.sort((a, b) => a.t < b.t ? -1 : 1);
  const HABER = [
    ['1991-12-26', 'Sovyetler Birliği resmen sona erdi'], ['1992-03-02', 'Türkmenistan BM\'ye üye oldu'], ['1992-05-18', 'Yeni anayasa kabul edildi'],
    ['1993-11-01', 'Manat tedavüle girdi'], ['1996-05-13', 'Tecen–Serahs–Meşhed demiryolu açıldı'], ['1997-12-29', 'İran\'a giden ilk boru hattı açıldı (gerçekte)'],
    ['2001-09-11', 'ABD\'de 11 Eylül saldırıları'], ['2006-12-21', 'Gerçek tarihte Niyazov öldü; yerine Berdimuhamedov geçti'],
    ['2009-12-14', 'Gerçek tarihte Çin boru hattı bugün açıldı'], ['2013-05-25', 'Aşgabat beyaz mermer rekoruyla Guinness\'e girdi'],
    ['2014-12-03', 'Kazakistan–Türkmenistan–İran demiryolu açıldı (gerçekte)'], ['2015-12-13', 'TAPI\'nin temeli atıldı (gerçekte)'],
    ['2017-09-17', 'Asya Salon Oyunları Aşgabat\'ta başladı'], ['2022-01-08', 'Darvaza "Cehennem Kapısı" kraterinin söndürülmesi gündemde']
  ];
  const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  /* ---------- ekonomi: gaz merkezli model ---------- */
  function tablo(y, alan) {
    const a = Math.floor(y), b = a + 1, k = y - a, A = TABLO[Math.min(2024, Math.max(1991, a))], B = TABLO[Math.min(2024, Math.max(1991, b))];
    return A[alan] + (B[alan] - A[alan]) * k;
  }
  function fiyat(y) {
    const ks = Object.keys(FIYAT).map(Number); let a = ks[0], b = ks[ks.length - 1];
    ks.forEach(k => { if (k <= y) a = k; if (k > y && b === ks[ks.length - 1] && k < b) b = k; });
    const sb = ks.find(k => k > y) || a; return FIYAT[a] + (FIYAT[sb] - FIYAT[a]) * Math.min(1, (y - a) / Math.max(1, sb - a));
  }
  // gerçekte var olan hatlar (temel seyir) ve oyuncunun hatları
  function gazGercek(y) { return tablo(y, 'gazRus') + (y >= 1998 ? 6 : 0) + (y >= 2010 ? Math.min(35, (y - 2010) * 9 + 4) : 0); }
  function gazSen(S, y) {
    const proje = t => S.projeler.find(p => p.tip === t && p.bitti);
    let rus = tablo(y, 'gazRus') * (S.pol.rus || 1);
    if (S.b.gazUzlas && y >= 1997 && y < 1999.5) rus = 25 * (S.pol.rus || 1);
    let g = rus;
    ['iran', 'cin', 'hazar', 'tapi'].forEach(t => { const p = proje(t); if (p) g += PROJE[t].gaz * Math.min(1, (S.gun - p.bitis) / 900 + 0.3); });
    return g;
  }
  function ekonomiAy(S, yil) {
    const e = S.eko, p = S.pol, f = fiyat(yil), g = gazSen(S, yil), gG = gazGercek(yil);
    const gelir = g * f / 1000 * (S.b.gazUzlas && yil < 1999.5 ? 0.7 : 1), gelirG = gG * f / 1000;
    e.gaz = g; e.gelir = gelir;
    const fark = (gelir - gelirG) / Math.max(1, gelirG);
    const sok = k => S.soklar.filter(s => s.k === k).reduce((a, s) => a + s.v, 0);
    const buyHedef = tablo(yil, 'b') + 14 * fark + 1.5 * p.h + sok('buyume') + S.projeler.filter(x => x.bitti).length * 0.05;
    e.buyume += (buyHedef - e.buyume) * 0.15;
    const enfTaban = tablo(yil, 'enf');
    e.enf += (Math.max(-3, enfTaban * (p.enfx || 1) * (1 + 0.25 * p.h) + sok('enf')) - e.enf) * 0.2;
    e.kur = TABLO[Math.min(2024, Math.floor(yil))].kur * (p.kurx || 1);
    e.rezerv = Math.max(0, e.rezerv + (gelir * 0.35 - 0.4 - p.h * 0.25 - (p.sub || 0) * 0.15 * Math.min(1, gelir / 3)) / 12 + sok('rezerv') / 12);
    e.kisiBasi = tablo(yil, 'kb') * Math.max(0.4, 1 + (S.kbOfs || 0)); S.kbOfs = (S.kbOfs || 0) * 0.995 + (e.buyume - tablo(yil, 'b')) / 100 / 12;
    e.nufus = 3.8 + (yil - 1991) * 0.06;
    e.guven = Math.max(0, Math.min(100, 40 + (S.kurum.isd - 40) * 0.5 + (S.dis.bati - 45) * 0.3 + Math.min(20, e.rezerv)));
    S.soklar.forEach(s => s.ay--); S.soklar = S.soklar.filter(s => s.ay > 0);
  }
  function refah(S) {
    const e = S.eko;
    return Math.max(-6, Math.min(6, 0.35 * (e.buyume - 5) - 0.012 * Math.min(e.enf, 400) + 1.5 * (S.pol.sub || 0) + (e.rezerv < 1 ? -1 : 0)));
  }
  return {
    ULKE: 'tm', PARTILER, ALT, ilKesim, BOLGE, VSTART, EKO_GECMIS, PARTI, KESIM, DEHAP_IL: [], KURUM, DIS, EKO, GERCEK, ULKE_AD, ULKE_ETIKET, ETIKET_YER, DENIZ, HARITA,
    PROJE, OLAY, HABER, AYLAR, BASLANGIC: '1991-10-27', BAS_TARIH: [1991, 9, 27], IKTIDAR_BASLA: true, BALAYI: 1991.8, YIPRANMA: 2012,
    TABLO, tablo, fiyat, gazSen, gazGercek, ekonomiAy, refah
  };
})();
