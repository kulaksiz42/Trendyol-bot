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
    akce: { ad: 'Akçe', ikon: '🪙' }
  },
  BASLANGIC_KAYNAK: { yiyecek: 140, odun: 90, tas: 20, akce: 40 },
  BASLANGIC_NUFUS: 20,

  /* binalar
     boy: kaç karo kaplar (kare); maliyet; isci: çalışan sayısı; uretim: işçi başına aylık;
     konut: barınma; zemin: 'duz' (eğimsiz çayır), 'orman' (ağaca yakın), 'kaya' (kayaya yakın);
     kilit: açılması için gereken bina; sure: inşaat süresi (ay) */
  BINALAR: [
    { id: 'cadir', ad: 'Alaçık çadır', acik: 'Kayı obasının keçe çadırı. 5 kişi barınır.', boy: 1, maliyet: { odun: 8 }, konut: 5, sure: 0.5, grup: 'Konut' },
    { id: 'ev', ad: 'Ahşap ev', acik: 'Yerleşik hayata geçiş. 9 kişi barınır, memnuniyet artar.', boy: 1, maliyet: { odun: 25, tas: 6 }, konut: 9, sure: 1.5, kilit: 'mescit', grup: 'Konut', memnun: 1 },
    { id: 'tarla', ad: 'Tarla', acik: 'Buğday. Yazın bol, kışın az ürün verir.', boy: 2, maliyet: { odun: 12 }, isci: 4, uretim: { yiyecek: 2.4 }, hasat: true, zemin: 'duz', sure: 1, grup: 'Üretim' },
    { id: 'agil', ad: 'Koyun ağılı', acik: 'Konar-göçer Kayı\'nın sürüsü. Her mevsim yiyecek.', boy: 2, maliyet: { odun: 18 }, isci: 2, uretim: { yiyecek: 2.2 }, sure: 1, grup: 'Üretim' },
    { id: 'oduncu', ad: 'Oduncu', acik: 'Ormana yakın kurulmalı. Etrafındaki ağaçları keser.', boy: 1, maliyet: { odun: 10 }, isci: 3, uretim: { odun: 2.6 }, zemin: 'orman', sure: 0.7, grup: 'Üretim' },
    { id: 'tasocagi', ad: 'Taş ocağı', acik: 'Kayalık yamaca yakın kurulmalı.', boy: 1, maliyet: { odun: 16 }, isci: 3, uretim: { tas: 1.4 }, zemin: 'kaya', sure: 1, grup: 'Üretim' },
    { id: 'pazar', ad: 'Pazar yeri', acik: 'Komşu köylerle alışveriş. Nüfus arttıkça akçe getirir.', boy: 2, maliyet: { odun: 30, tas: 8 }, isci: 2, uretim: { akce: 1.2 }, nufusAkce: 0.06, sure: 1.5, grup: 'Ticaret' },
    { id: 'mescit', ad: 'Mescit', acik: 'Obanın ilk mescidi. Memnuniyet artar, ahşap ev açılır.', boy: 2, maliyet: { odun: 40, tas: 20, akce: 25 }, sure: 3, grup: 'Külliye', memnun: 12, tekil: true },
    { id: 'han', ad: 'Han', acik: 'Kervanlar konaklar. Akçe ve ün getirir.', boy: 2, maliyet: { odun: 60, tas: 40, akce: 30 }, isci: 3, uretim: { akce: 2.2 }, sure: 4, kilit: 'pazar', grup: 'Ticaret', memnun: 3 }
  ],

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
    { id: 'g9', ad: 'Han kur, kervan yolunu aç', kosul: s => s.say('han') >= 1, odul: { akce: 80 } }
  ],

  // tüketim
  YEMEK: 0.38,       // kişi başı aylık yiyecek
  VERGI: 0.08,       // kişi başı aylık akçe (öşür, bac)
  DOGUM: 0.035,      // aylık nüfus artışı (yiyecek ve yer varsa)
  GOC: 0.9           // memnuniyet yüksekse aylık gelen göçmen (kişi)
};
