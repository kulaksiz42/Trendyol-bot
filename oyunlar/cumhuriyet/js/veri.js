/* Cumhuriyet: Sıfırdan — veri. Para birimi bugünkü lira (milyon TL). 1 birim = 10 metre. */
'use strict';
window.VERI = (function () {
  const A = window.ARAZI;
  // enlem/boylam -> dünya koordinatı (x doğu, z güney)
  const yer = (lat, lon) => ({ x: (lon - A.lon0) / A.dlon * (A.boyut / 2), z: -(lat - A.lat0) / A.dlat * (A.boyut / 2) });

  const YOL = {
    toprak: { ad: 'Toprak yol', yil: 1923, genislik: 0.9, maliyet: 0.012, bakim: 0.00002, renk: '#a88b62', hiz: 0.6, bilgi: 'Ucuz ama kışın çamur, yazın toz olur.' },
    parke: { ad: 'Parke taş yol', yil: 1928, genislik: 1.0, maliyet: 0.03, bakim: 0.00003, renk: '#8d8a84', hiz: 0.8, bilgi: 'Cumhuriyet\'in ilk caddeleri. Çamur derdini bitirir.' },
    bulvar: { ad: 'Bulvar', yil: 1932, genislik: 2.4, maliyet: 0.09, bakim: 0.00008, renk: '#6f7276', hiz: 1, agacli: true, bilgi: 'Jansen planının ağaçlı geniş caddeleri. Çevresindeki arsaları değerlendirir.' },
    asfalt: { ad: 'Asfalt cadde', yil: 1950, genislik: 1.4, maliyet: 0.05, bakim: 0.00004, renk: '#4b4e54', hiz: 1, bilgi: '1950\'lerden sonra şehirlerde asfalt yaygınlaştı.' },
    otoyol: { ad: 'Çevre yolu', yil: 1985, genislik: 3, maliyet: 0.2, bakim: 0.0001, renk: '#3e4046', hiz: 1.6, bilgi: 'Hızlı ama yanına bina yapılmaz.', yanBos: true }
  };
  // imar: R konut, C ticaret, I sanayi
  const IMAR = {
    R: { ad: 'Konut', renk: '#5fbf6a', ikon: '🏠' }, Rk: { ad: 'Yoğun konut', renk: '#2e9a52', ikon: '🏢', yil: 1950 },
    C: { ad: 'Ticaret', renk: '#4f8fe0', ikon: '🏪' }, I: { ad: 'Sanayi', renk: '#e0b43a', ikon: '🏭' }
  };
  // seviyeye göre kapasite: konutta kişi, ticaret ve sanayide iş
  const KAPASITE = { R: [0, 6, 14, 30, 55, 90, 160], Rk: [0, 0, 0, 60, 110, 180, 320], C: [0, 4, 9, 16, 30, 55, 90], I: [0, 10, 20, 35, 55, 75, 100] };
  // döneme göre ulaşılabilecek en yüksek bina seviyesi
  const DONEM_SEVIYE = y => y < 1950 ? 2 : y < 1970 ? 3 : y < 1985 ? 4 : y < 2003 ? 5 : 6;

  const HIZMET = {
    su: { ad: 'Su deposu ve kuyu', ikon: '💧', yil: 1923, maliyet: 6, bakim: 0.12, su: 2500, bilgi: 'Ankara 1920\'lerde su sıkıntısı çekiyordu. 2.500 kişiye yeter.' },
    baraj: { ad: 'Baraj ve isale hattı', ikon: '🌊', yil: 1936, maliyet: 60, bakim: 0.6, su: 60000, bilgi: 'Çubuk Barajı 1936\'da Ankara\'ya su vermeye başladı. 60.000 kişiye yeter.' },
    dizel: { ad: 'Dizel santral', ikon: '⚡', yil: 1923, maliyet: 8, bakim: 0.2, elektrik: 3000, kirlilik: 2, bilgi: 'Ankara\'nın ilk elektriği. 3.000 kişiye yeter, gürültülü ve kirli.' },
    termik: { ad: 'Kömürlü termik santral', ikon: '🏭', yil: 1930, maliyet: 45, bakim: 0.5, elektrik: 40000, kirlilik: 6, bilgi: 'Bol elektrik ama kış aylarında hava kirliliği.' },
    okul: { ad: 'İlkokul', ikon: '🏫', yil: 1923, maliyet: 5, bakim: 0.08, menzil: 110, bilgi: 'Çocukların yürüme mesafesinde olmalı (yol üzerinden yaklaşık 1 km).' },
    lise: { ad: 'Lise', ikon: '🎓', yil: 1925, maliyet: 12, bakim: 0.15, menzil: 220, bilgi: 'Eğitimli nüfus ofis ve ticaret işlerini büyütür.' },
    saglik: { ad: 'Sağlık ocağı', ikon: '🩺', yil: 1923, maliyet: 6, bakim: 0.1, menzil: 140, bilgi: 'Sıtma ve verem 1920\'lerin büyük derdiydi.' },
    hastane: { ad: 'Hastane', ikon: '🏥', yil: 1930, maliyet: 30, bakim: 0.4, menzil: 300, bilgi: 'Büyük şehirlerde 1930\'larda modern hastaneler yaygınlaştı.' },
    park: { ad: 'Park', ikon: '🌳', yil: 1923, maliyet: 1.2, bakim: 0.02, menzil: 60, bilgi: 'Çevresindeki evlerin değerini artırır.' },
    cami: { ad: 'Cami', ikon: '🕌', yil: 1923, maliyet: 3, bakim: 0.03, menzil: 90, bilgi: 'Mahallenin toplandığı yer.' },
    karakol: { ad: 'Karakol', ikon: '👮', yil: 1923, maliyet: 4, bakim: 0.08, menzil: 160, bilgi: 'Güvenlik mahallelerin büyümesi için gerekli.' }
  };
  // gerçek projeler: yılı gelince açılır, yerini oyuncu seçer
  const OZEL = {
    meclis2: { ad: '2. Meclis binası', ikon: '🏛️', yil: 1924, maliyet: 25, cazibe: 4, gercek: 'Cumhuriyet Halk Fırkası binası olarak yapılıp 1924\'te Meclis\'e verildi (bugün Cumhuriyet Müzesi).' },
    aoc: { ad: 'Atatürk Orman Çiftliği', ikon: '🌾', yil: 1925, maliyet: 20, cazibe: 3, gercek: '1925\'te bataklık arazide kuruldu; Ankara\'nın ilk büyük yeşil alanı.' },
    genclik: { ad: 'Gençlik Parkı', ikon: '🎡', yil: 1936, maliyet: 18, cazibe: 6, gercek: 'Jansen planındaki bataklık alan kurutularak yapıldı, 1943\'te açıldı.' },
    universite: { ad: 'Dil ve Tarih–Coğrafya Fakültesi', ikon: '🎓', yil: 1935, maliyet: 30, cazibe: 5, gercek: 'Ankara\'nın ilk fakültelerinden; 1935\'te kuruldu.' },
    anitkabir: { ad: 'Anıtkabir', ikon: '🏛️', yil: 1944, maliyet: 80, cazibe: 12, gercek: 'Rasattepe\'de 1944–1953 arasında yapıldı.' }
  };
  // 1923'te hazır yapılar
  const BASLANGIC = {
    kale: Object.assign(yer(39.9409, 32.8640), { ad: 'Ankara Kalesi' }),
    haci: Object.assign(yer(39.9455, 32.8582), { ad: 'Hacı Bayram Camii ve Augustus Tapınağı' }),
    gar: Object.assign(yer(39.9362, 32.8436), { ad: 'Ankara İstasyonu' }),
    meclis1: Object.assign(yer(39.9420, 32.8536), { ad: 'Birinci Meclis binası' })
  };
  // semtler: bir yere bina kurulunca en yakın semtin adını alır
  const SEMT = [
    ['Ulus', 39.9418, 32.8549], ['Hacıbayram', 39.9455, 32.8582], ['Kale', 39.9409, 32.8640], ['Samanpazarı', 39.9377, 32.8606], ['Hamamönü', 39.9334, 32.8618],
    ['Altındağ', 39.9470, 32.8700], ['Dışkapı', 39.9505, 32.8590], ['İstasyon', 39.9362, 32.8436], ['Sıhhiye', 39.9302, 32.8546], ['Kızılay', 39.9208, 32.8541],
    ['Kolej', 39.9282, 32.8655], ['Kurtuluş', 39.9300, 32.8730], ['Cebeci', 39.9293, 32.8848], ['Mamak', 39.9300, 32.9050], ['Bakanlıklar', 39.9135, 32.8510],
    ['Kavaklıdere', 39.9050, 32.8600], ['Esat', 39.9090, 32.8670], ['Gaziosmanpaşa', 39.8960, 32.8770], ['Çankaya', 39.8890, 32.8620], ['Ayrancı', 39.9010, 32.8450],
    ['Dikmen', 39.8880, 32.8350], ['Emek', 39.9150, 32.8180], ['Bahçelievler', 39.9230, 32.8250], ['Maltepe', 39.9290, 32.8410], ['Tandoğan', 39.9330, 32.8320],
    ['Etlik', 39.9640, 32.8450], ['Keçiören', 39.9620, 32.8650], ['Aydınlıkevler', 39.9600, 32.8780], ['Siteler', 39.9520, 32.8900]
  ].map(([ad, la, lo]) => Object.assign({ ad }, yer(la, lo)));

  // görevler (danışman sırayla verir)
  const GOREV = [
    { id: 'yol1', metin: 'Ulus\'tan çıkan toprak yollara yeni bir yol ekle (en az 300 metre).', kosul: S => S.istat.yolUzunluk >= 30 + S.istat.ilkYol, ipucu: 'Alttaki 🛣️ Yol aracını seç. Önce bir noktaya dokun, sonra bitiş noktasına dokun.' },
    { id: 'konut1', metin: 'Yolun kenarına en az 25 konut parseli ayır.', kosul: S => S.istat.parsel.R >= 25, ipucu: '🏠 İmar aracını seç ve yolun yanında parmağını gezdir. Binaları halk kendisi yapar.' },
    { id: 'su1', metin: 'Bir su deposu kur: kasabanın en büyük derdi su.', kosul: S => S.istat.hizmet.su >= 1, ipucu: '💧 Altyapı menüsünden su deposunu bir yolun kenarına koy.' },
    { id: 'elk1', metin: 'Dizel santral kurarak elektrik getir.', kosul: S => S.istat.hizmet.dizel >= 1, ipucu: '⚡ Elektrik yoksa evler kerpiçten kâgire geçemez.' },
    { id: 'is1', metin: 'İş yeri olmadan kimse gelmez: ticaret ve sanayi alanı ayır.', kosul: S => S.istat.parsel.C >= 10 && S.istat.parsel.I >= 8, ipucu: '🏪 Ticareti merkeze, 🏭 sanayiyi evlerden uzağa, istasyon tarafına koy.' },
    { id: 'okul1', metin: 'İlk okulunu aç.', kosul: S => S.istat.hizmet.okul >= 1, ipucu: 'Okul, yol üzerinden yaklaşık 1 km çevresindeki evleri büyütür.' },
    { id: 'nufus5', metin: 'Yeni gelenlerle nüfusu 5.000\'e çıkar.', kosul: S => S.istat.yeniNufus >= 5000, ipucu: 'Halk; su, elektrik, iş ve okul olan yere gelir. Akıştaki şikâyetlere bak.' },
    { id: 'jansen', metin: 'Jansen planı: başkente yakışır ağaçlı bir bulvar aç (1932\'den sonra).', kosul: S => S.istat.bulvar >= 40, ipucu: 'Bulvar, 1932\'den sonra Yol menüsünde açılır. Ulus\'tan güneye, bugünkü Kızılay\'a doğru bir eksen düşün.' },
    { id: 'nufus20', metin: 'Nüfusu 20.000\'e çıkar: Ankara artık bir il merkezi.', kosul: S => S.istat.yeniNufus >= 20000, ipucu: 'Hizmetleri yaygınlaştır, su ve elektriği yetiştir.' }
  ];
  // aşamalar
  const ASAMA = [
    { ad: 'Kasaba', nufus: 0 }, { ad: 'İlçe', nufus: 10000 }, { ad: 'İl merkezi', nufus: 40000 }, { ad: 'Büyük şehir', nufus: 150000 }, { ad: 'Büyükşehir', nufus: 750000 }
  ];
  // tarih olayları (şehri etkileyen)
  const OLAY = [
    { t: '1923-10-29', baslik: 'Cumhuriyet ilan edildi', metin: 'Ankara yeni devletin başkenti. Kasabaya memurlar, elçiler ve göçmenler gelmeye başlıyor.', etki: { goc: 400 } },
    { t: '1925-01-01', baslik: 'Elektrik şebekesi', metin: 'Başkentte elektrik şebekesi büyüyor. Dizel santraller sokakları aydınlatıyor.', etki: {} },
    { t: '1927-10-28', baslik: 'İlk nüfus sayımı', metin: 'Türkiye\'nin ilk nüfus sayımında Ankara\'da 74 bin kişi sayıldı. Senin Ankara\'n kaç kişi?', etki: {} },
    { t: '1929-10-29', baslik: 'Dünya ekonomik buhranı', metin: 'New York borsası çöktü. İhracat ve vergi gelirleri düşüyor.', etki: { gelir: -0.25, ay: 24 } },
    { t: '1932-01-01', baslik: 'Jansen planı onaylandı', metin: 'Hermann Jansen\'in planı Ankara\'nın imar planı oldu: bulvarlar, yeşil kuşaklar, ayrı sanayi bölgeleri. Bulvar yolu açıldı.', etki: {} },
    { t: '1936-01-01', baslik: 'Çubuk Barajı', metin: 'Ankara\'nın su derdine çare: baraj ve isale hattı kurulabilir.', etki: {} },
    { t: '1939-09-01', baslik: 'İkinci Dünya Savaşı', metin: 'Türkiye savaşa girmedi ama karne, kıtlık ve yüksek fiyatlar geldi. Yatırım yapmak zor.', etki: { gelir: -0.3, ay: 72, goc: -200 } },
    { t: '1950-05-14', baslik: 'Köyden kente göç başlıyor', metin: 'Tarımda makineleşme ve yeni yollarla köylerden büyük şehirlere göç başladı. Konut talebi patlıyor; yoğun konut imarı açıldı.', etki: { goc: 3000 } },
    { t: '1960-05-27', baslik: '27 Mayıs', metin: 'Ordu yönetime el koydu. Belediye bütçeleri bir süre donduruldu.', etki: { gelir: -0.1, ay: 12 } },
    { t: '1973-10-17', baslik: 'Petrol krizi', metin: 'Akaryakıt fiyatları katlandı; kuyruklar ve kesintiler başladı.', etki: { gelir: -0.15, ay: 24 } },
    { t: '1980-09-12', baslik: '12 Eylül', metin: 'Askerî yönetim; sokaklar sessiz, inşaatlar yavaş.', etki: { gelir: -0.05, ay: 12 } },
    { t: '1994-04-05', baslik: '5 Nisan kararları', metin: 'Ekonomik kriz: lira değer kaybetti, belediyelerin borçları büyüdü.', etki: { gelir: -0.2, ay: 18 } },
    { t: '1999-08-17', baslik: 'Marmara depremi', metin: 'Gölcük merkezli depremde 17 binden fazla kişi öldü. Yapı denetimi tartışması başladı.', etki: {} },
    { t: '2001-02-21', baslik: '2001 krizi', metin: 'Bankalar battı, işsizlik arttı.', etki: { gelir: -0.25, ay: 18 } }
  ];
  const GUN0 = Date.UTC(1923, 9, 29);
  return { yer, YOL, IMAR, KAPASITE, DONEM_SEVIYE, HIZMET, OZEL, BASLANGIC, SEMT, GOREV, ASAMA, OLAY, GUN0, AYLAR: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'] };
})();
