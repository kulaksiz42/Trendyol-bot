/* Başbakan — oyun verisi. Olaylar ve tarihler gerçek; oyuncunun kararları kurgusaldır.
   Tartışmalı konular iki tarafın görüşüyle verilir. Rakamlar yaklaşık, kaynak: TÜİK, TCMB, YSK, Vikipedi. */
'use strict';
window.VERI = (function () {
  const PARTI = {
    akp: { ad: 'AK Parti', uzun: 'Adalet ve Kalkınma Partisi', renk: '#f2a516' },
    chp: { ad: 'CHP', uzun: 'Cumhuriyet Halk Partisi', renk: '#d7263d' },
    mhp: { ad: 'MHP', uzun: 'Milliyetçi Hareket Partisi', renk: '#3b5bdb' },
    dyp: { ad: 'DYP', uzun: 'Doğru Yol Partisi', renk: '#8e5bd1' },
    gp: { ad: 'GP', uzun: 'Genç Parti', renk: '#1fa99a' },
    dig: { ad: 'DEHAP ve diğer', uzun: 'DEHAP, ANAP, SP, DSP ve bağımsızlar', renk: '#3d9a50' }
  };
  // seçmen kesimleri: w = seçmen içindeki pay (%), v0 = 2002'de bize oy oranı, duyarlılık = ekonomiye tepki
  const KESIM = {
    muh: { ad: 'Muhafazakâr', ikon: '🕌', w: 30, v0: 0.80, duy: 2 },
    sag: { ad: 'Merkez sağ', ikon: '🏪', w: 24, v0: 0.27, duy: 5 },
    mil: { ad: 'Milliyetçi', ikon: '⭐', w: 12, v0: 0.08, duy: 3 },
    laik: { ad: 'Laik / kentli', ikon: '🏙️', w: 23, v0: 0.05, duy: 1.5 },
    kurt: { ad: 'Kürt seçmen', ikon: '🌄', w: 8, v0: 0.22, duy: 3 }
  };
  // Doğu ve Güneydoğu'da "diğer" oyların çoğu DEHAP'a gitti
  const DEHAP_IL = ['Diyarbakır', 'Batman', 'Hakkâri', 'Şırnak', 'Siirt', 'Van', 'Muş', 'Mardin', 'Ağrı', 'Bitlis', 'Iğdır', 'Tunceli', 'Kars', 'Ardahan', 'Şanlıurfa', 'Bingöl', 'Adıyaman'];
  const KURUM = {
    ordu: { ad: 'Ordu (TSK)', ikon: '🎖️', v: 35 }, yargi: { ad: 'Yüksek yargı', ikon: '⚖️', v: 35 },
    medya: { ad: 'Medya', ikon: '📰', v: 45 }, isd: { ad: 'İş dünyası', ikon: '💼', v: 45 }
  };
  const DIS = {
    ab: { ad: 'Avrupa Birliği', ikon: '🇪🇺', v: 50 }, abd: { ad: 'ABD', ikon: '🇺🇸', v: 60 },
    rus: { ad: 'Rusya', ikon: '🇷🇺', v: 50 }, ort: { ad: 'Orta Doğu', ikon: '🕋', v: 55 }
  };

  // 7 coğrafi bölge (teşkilat bölge bölge kurulur)
  const BOLGE = {
    marmara: { ad: 'Marmara', iller: ['Edirne', 'Kırklareli', 'Tekirdağ', 'İstanbul', 'Kocaeli', 'Yalova', 'Sakarya', 'Bilecik', 'Bursa', 'Balıkesir', 'Çanakkale'] },
    ege: { ad: 'Ege', iller: ['İzmir', 'Manisa', 'Aydın', 'Denizli', 'Kütahya', 'Afyon', 'Uşak', 'Muğla'] },
    akdeniz: { ad: 'Akdeniz', iller: ['Antalya', 'Isparta', 'Burdur', 'Adana', 'Mersin', 'Hatay', 'Osmaniye', 'Kahramanmaraş'] },
    ic: { ad: 'İç Anadolu', iller: ['Ankara', 'Konya', 'Kayseri', 'Eskişehir', 'Sivas', 'Kırıkkale', 'Aksaray', 'Karaman', 'Kırşehir', 'Niğde', 'Nevşehir', 'Yozgat', 'Çankırı'] },
    karadeniz: { ad: 'Karadeniz', iller: ['Zonguldak', 'Bartın', 'Karabük', 'Düzce', 'Bolu', 'Kastamonu', 'Sinop', 'Samsun', 'Amasya', 'Tokat', 'Çorum', 'Ordu', 'Giresun', 'Trabzon', 'Rize', 'Artvin', 'Gümüşhane', 'Bayburt'] },
    dogu: { ad: 'Doğu Anadolu', iller: ['Erzurum', 'Erzincan', 'Kars', 'Ardahan', 'Iğdır', 'Ağrı', 'Van', 'Muş', 'Bitlis', 'Bingöl', 'Tunceli', 'Elazığ', 'Malatya', 'Hakkâri'] },
    gdogu: { ad: 'Güneydoğu', iller: ['Gaziantep', 'Kilis', 'Adıyaman', 'Şanlıurfa', 'Diyarbakır', 'Mardin', 'Batman', 'Siirt', 'Şırnak'] }
  };
  // kuruluş günü: yeni partiye oy oranı (kesim içinde)
  const VSTART = { muh: 0.5, sag: 0.08, mil: 0.03, laik: 0.02, kurt: 0.1 };
  // muhalefet dönemi: ekonomiyi koalisyon hükümeti yönetir (yaklaşık gerçek değerler)
  const EKO_GECMIS = [
    ['2001-08-14', { enf: 57, buyume: -7, kur: 1.38, issizlik: 8.4, faiz: 60, borc: 78, acik: 16, guven: 22, kisiBasi: 2900 }],
    ['2001-12-31', { enf: 68.5, buyume: -8.5, kur: 1.44, issizlik: 10.4, faiz: 59, borc: 78, acik: 16, guven: 28, kisiBasi: 2950 }],
    ['2002-06-30', { enf: 42.6, buyume: 5, kur: 1.56, issizlik: 10.5, faiz: 48, borc: 76, acik: 13, guven: 32, kisiBasi: 3300 }],
    ['2002-11-03', { enf: 31.8, buyume: 6.2, kur: 1.60, issizlik: 10.3, faiz: 44, borc: 74, acik: 11.5, guven: 40, kisiBasi: 3600 }]
  ];
  // AK Parti'nin 2011'de illerde aldığı oy (gerçekte ulaştığı zirveye yakın): ilin "tavanı" buna göre
  const AKP_ZIRVE = {"Adana": 37.4, "Adıyaman": 67.3, "Afyon": 60.4, "Ağrı": 47.6, "Aksaray": 66.1, "Amasya": 52.2, "Ankara": 49.2, "Antalya": 39.3, "Ardahan": 40.2, "Artvin": 46.4, "Aydın": 35.5, "Balıkesir": 46.5, "Bartın": 48.2, "Batman": 37.1, "Bayburt": 63.4, "Bilecik": 42.6, "Bingöl": 67.1, "Bitlis": 50.7, "Bolu": 58.5, "Burdur": 49.0, "Bursa": 53.0, "Çanakkale": 41.6, "Çankırı": 65.6, "Çorum": 61.2, "Denizli": 46.6, "Diyarbakır": 32.2, "Düzce": 66.0, "Edirne": 30.4, "Elazığ": 67.4, "Erzincan": 57.1, "Erzurum": 69.2, "Eskişehir": 44.1, "Gaziantep": 61.7, "Giresun": 59.4, "Gümüşhane": 65.0, "Hakkâri": 16.5, "Hatay": 44.4, "Iğdır": 28.3, "Isparta": 52.9, "İstanbul": 49.4, "İzmir": 36.8, "Kahramanmaraş": 69.6, "Karabük": 57.9, "Karaman": 57.3, "Kars": 42.6, "Kastamonu": 55.8, "Kayseri": 64.9, "Kırıkkale": 62.1, "Kırklareli": 27.4, "Kırşehir": 50.2, "Kilis": 59.5, "Kocaeli": 52.7, "Konya": 69.6, "Kütahya": 64.6, "Malatya": 68.0, "Manisa": 47.0, "Mardin": 32.2, "Mersin": 32.0, "Muğla": 32.7, "Muş": 42.8, "Nevşehir": 60.2, "Niğde": 54.2, "Ordu": 60.2, "Osmaniye": 43.1, "Rize": 68.9, "Sakarya": 61.6, "Samsun": 61.5, "Siirt": 48.0, "Sinop": 54.9, "Sivas": 63.3, "Şanlıurfa": 63.5, "Şırnak": 20.6, "Tekirdağ": 35.9, "Tokat": 55.9, "Trabzon": 58.6, "Tunceli": 15.8, "Uşak": 49.8, "Van": 40.2, "Yalova": 47.2, "Yozgat": 66.4, "Zonguldak": 47.2};
  // dönemin siyasi yüzleri (fotoğraflar Wikimedia Commons'tan)
  const KISI = {
    gul: { ad: 'Abdullah Gül', rol: 'Parti kurucusu · Dışişleri Bakanı (2003–2007)', bas: '2001-08-14', son: '2007-08-28' },
    babacan: { ad: 'Ali Babacan', rol: 'Ekonomi Bakanı (2002–2007)', bas: '2002-11-18', son: '2009-05-01' },
    cicek: { ad: 'Cemil Çiçek', rol: 'Adalet Bakanı · Hükümet Sözcüsü', bas: '2002-11-18', son: '2011-06-01' },
    arinc: { ad: 'Bülent Arınç', rol: 'TBMM Başkanı (2002–2007)', bas: '2002-11-19', son: '2007-08-04' },
    sezer: { ad: 'Ahmet Necdet Sezer', rol: 'Cumhurbaşkanı (2000–2007)', bas: '2000-05-16', son: '2007-08-28' },
    ecevit: { ad: 'Bülent Ecevit', rol: 'Başbakan (1999–2002), DSP Genel Başkanı', bas: '1999-01-01', son: '2002-11-18' },
    dervis: { ad: 'Kemal Derviş', rol: 'Ekonomiden Sorumlu Devlet Bakanı (2001–2002)', bas: '2001-03-01', son: '2002-08-10' },
    baykal: { ad: 'Deniz Baykal', rol: 'CHP Genel Başkanı · Ana muhalefet lideri', bas: '1992-09-09', son: '2010-05-10' },
    bahceli: { ad: 'Devlet Bahçeli', rol: 'MHP Genel Başkanı', bas: '1997-07-06', son: '2099-01-01' },
    ciller: { ad: 'Tansu Çiller', rol: 'DYP Genel Başkanı (2002\'ye kadar)', bas: '1993-06-13', son: '2002-12-14' },
    agar: { ad: 'Mehmet Ağar', rol: 'DYP Genel Başkanı (2002–2008)', bas: '2002-12-14', son: '2008-05-01' },
    yilmaz: { ad: 'Mesut Yılmaz', rol: 'ANAP Genel Başkanı (2002\'ye kadar)', bas: '1991-06-15', son: '2002-11-10' },
    uzan: { ad: 'Cem Uzan', rol: 'Genç Parti Genel Başkanı', bas: '2002-07-01', son: '2008-01-01' },
    ozkok: { ad: 'Hilmi Özkök', rol: 'Genelkurmay Başkanı (2002–2006)', bas: '2002-08-28', son: '2006-08-28' },
    buyukanit: { ad: 'Yaşar Büyükanıt', rol: 'Genelkurmay Başkanı (2006–2008)', bas: '2006-08-28', son: '2008-08-28' },
    bush: { ad: 'George W. Bush', rol: 'ABD Başkanı (2001–2009)', bas: '2001-01-20', son: '2009-01-20' },
    annan: { ad: 'Kofi Annan', rol: 'BM Genel Sekreteri (1997–2006)', bas: '1997-01-01', son: '2006-12-31' },
    denktas: { ad: 'Rauf Denktaş', rol: 'KKTC Cumhurbaşkanı (2005\'e kadar)', bas: '1983-11-15', son: '2005-04-24' },
    dink: { ad: 'Hrant Dink', rol: 'Agos Genel Yayın Yönetmeni', bas: '1996-04-05', son: '2007-01-19' }
  };
  // Kasım 2002 başlangıç ekonomisi
  const EKO = { enf: 31.8, faiz: 44, kur: 1.60, buyume: 6.2, issizlik: 10.3, borc: 74, acik: 11.5, guven: 40, kisiBasi: 3600, nufus: 66.4 };
  // yıl sonu gerçekleşmeleri (karşılaştırma için)
  const GERCEK = {
    2002: { enf: 29.7, buyume: 6.2, kur: 1.64, issizlik: 10.3, borc: 74.0 },
    2003: { enf: 18.4, buyume: 5.3, kur: 1.40, issizlik: 10.5, borc: 67.7 },
    2004: { enf: 9.3, buyume: 9.4, kur: 1.34, issizlik: 10.3, borc: 59.6 },
    2005: { enf: 7.7, buyume: 8.4, kur: 1.35, issizlik: 10.3, borc: 52.7 },
    2006: { enf: 9.7, buyume: 6.9, kur: 1.41, issizlik: 9.9, borc: 46.5 },
    2007: { enf: 8.4, buyume: 4.7, kur: 1.17, issizlik: 9.9, borc: 39.9 }
  };
  const ULKE_AD = {
    Greece: 'Yunanistan', Bulgaria: 'Bulgaristan', Georgia: 'Gürcistan', Armenia: 'Ermenistan', Azerbaijan: 'Azerbaycan', Iran: 'İran', Iraq: 'Irak', Syria: 'Suriye',
    'N. Cyprus': 'KKTC', Cyprus: 'Kıbrıs Rum Yönetimi', Russia: 'Rusya', Ukraine: 'Ukrayna', Romania: 'Romanya', Lebanon: 'Lübnan', Israel: 'İsrail', Jordan: 'Ürdün',
    Egypt: 'Mısır', 'Saudi Arabia': 'Suudi Arabistan', Macedonia: 'Makedonya', Albania: 'Arnavutluk', Serbia: 'Sırbistan', Moldova: 'Moldova', Kosovo: 'Kosova'
  };
  const ULKE_ETIKET = ['Greece', 'Bulgaria', 'Georgia', 'Armenia', 'Azerbaijan', 'Iran', 'Iraq', 'Syria', 'N. Cyprus', 'Russia', 'Ukraine', 'Romania'];
  const DENIZ = [{ ad: 'Karadeniz', lon: 34.5, lat: 43.0 }, { ad: 'Akdeniz', lon: 31.5, lat: 34.9 }, { ad: 'Ege Denizi', lon: 25.2, lat: 38.6 }, { ad: 'Marmara', lon: 28.1, lat: 40.72 }];

  // projeler: haritada bir ile kurulur. maliyet milyar YTL, sure ay
  // genel projeler her ilde yapılabilir ama aynı ile ikinci yatırımın etkisi azalır; özel projeler belirli şehirlerde ve yıllarda
  const UNIV_IL = ['Kırşehir', 'Adıyaman', 'Amasya', 'Aksaray', 'Bartın', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Çankırı', 'Düzce', 'Erzincan', 'Giresun', 'Hakkâri', 'Çorum', 'Iğdır', 'Kastamonu', 'Kilis', 'Mardin', 'Muş', 'Nevşehir', 'Ordu', 'Osmaniye', 'Rize', 'Siirt', 'Sinop', 'Şırnak', 'Tunceli', 'Uşak', 'Yalova', 'Karabük', 'Karaman', 'Kırklareli', 'Batman', 'Artvin', 'Ardahan', 'Gümüşhane', 'Yozgat'];
  const PROJE = {
    toki: { ad: 'TOKİ konutları', ikon: '🏘️', maliyet: 1.2, sure: 14, yil: 2003, etki: { sag: 0.3, muh: 0.2 }, yerel: 1.2, buyume: 0.03, bilgi: 'Dar gelirliye uzun vadeli taksitle konut. 2003\'ten sonra TOKİ yüz binlerce konut üretti.' },
    hastane: { ad: 'Devlet hastanesi', ikon: '🏥', maliyet: 0.7, sure: 18, yil: 2003, etki: { sag: 0.2, muh: 0.2, kurt: 0.2 }, yerel: 1.2, buyume: 0.01, bilgi: 'Sağlıkta Dönüşüm Programı (2003) ile hastane yatırımları hızlandı.' },
    okul: { ad: 'Derslik ve okul', ikon: '🏫', maliyet: 0.3, sure: 10, yil: 2003, etki: { laik: 0.1, kurt: 0.1, muh: 0.1 }, yerel: 0.6, buyume: 0.01, bilgi: '2003\'te başlayan "Haydi Kızlar Okula" kampanyası ve derslik seferberliği.' },
    yol: { ad: 'Bölünmüş yol', ikon: '🛣️', maliyet: 1.0, sure: 10, yil: 2003, etki: { sag: 0.3, muh: 0.1 }, yerel: 1, buyume: 0.03, bilgi: '2003–2007 arasında yaklaşık 9.000 km bölünmüş yol yapıldı.', bag: true },
    univ: { ad: 'Devlet üniversitesi', ikon: '🎓', maliyet: 0.5, sure: 12, yil: 2006, iller: UNIV_IL, etki: { laik: 0.2, sag: 0.1, kurt: 0.1 }, yerel: 1.5, buyume: 0.02, bilgi: '2006–2008 yasalarıyla üniversitesi olmayan illerde yeni devlet üniversiteleri kuruldu.' },
    osb: { ad: 'Organize sanayi bölgesi', ikon: '🏭', maliyet: 0.6, sure: 16, yil: 2003, iller: ['Kayseri', 'Gaziantep', 'Denizli', 'Konya', 'Bursa', 'Kocaeli', 'Manisa', 'Çorum', 'Kahramanmaraş', 'Eskişehir', 'Malatya', 'Adana', 'Tekirdağ'], etki: { sag: 0.4 }, yerel: 1.2, buyume: 0.05, bilgi: '"Anadolu kaplanları": Kayseri, Gaziantep, Denizli gibi şehirlerde ihracatçı sanayi hızla büyüdü.' },
    terminal: { ad: 'Havalimanı terminali', ikon: '✈️', maliyet: 0.8, sure: 20, yil: 2003, iller: ['Antalya', 'Muğla', 'İzmir', 'Trabzon', 'Erzurum', 'Diyarbakır', 'Gaziantep', 'Kayseri', 'Adana', 'Van', 'Samsun', 'Malatya'], etki: { sag: 0.3, laik: 0.1 }, yerel: 1, buyume: 0.04, bilgi: '2003\'te iç hatlarda özel şirketlere izin verildi; yolcu sayısı birkaç yılda katlandı, terminaller yap-işlet-devret ile büyütüldü.' },
    marmaray: { ad: 'Marmaray', ikon: '🚇', maliyet: 9, sure: 112, yil: 2004, il: 'İstanbul', tekil: true, etki: { sag: 0.6, laik: 0.4, muh: 0.3 }, yerel: 2, buyume: 0.12, bilgi: 'Boğaz\'ın altından geçen demiryolu tüneli. Kazılar Mayıs 2004\'te başladı, hat 29 Ekim 2013\'te açıldı.' },
    metrobus: { ad: 'Metrobüs', ikon: '🚌', maliyet: 0.5, sure: 14, yil: 2006, il: 'İstanbul', tekil: true, etki: { laik: 0.3, sag: 0.3 }, yerel: 1.5, buyume: 0.03, bilgi: 'Özel yolda giden hızlı otobüs. İlk hat 17 Eylül 2007\'de açıldı.' },
    kartal: { ad: 'Kadıköy–Kartal metrosu', ikon: '🚇', maliyet: 1.5, sure: 84, yil: 2005, il: 'İstanbul', tekil: true, etki: { laik: 0.4, sag: 0.3 }, yerel: 1.5, buyume: 0.04, bilgi: 'Anadolu yakasının ilk metrosu. 2005\'te başladı, 2012\'de açıldı.' },
    yht: { ad: 'Ankara–Eskişehir YHT', ikon: '🚄', maliyet: 4, sure: 70, yil: 2003, il: 'Eskişehir', bagIl: 'Ankara', tekil: true, etki: { sag: 0.5, laik: 0.3 }, yerel: 2, buyume: 0.06, bilgi: 'Türkiye\'nin ilk yüksek hızlı tren hattı. 13 Mart 2009\'da sefere başladı.' },
    yhtkonya: { ad: 'Ankara–Konya YHT', ikon: '🚄', maliyet: 2.5, sure: 60, yil: 2006, il: 'Konya', bagIl: 'Ankara', tekil: true, etki: { sag: 0.4, muh: 0.3 }, yerel: 2, buyume: 0.05, bilgi: 'İnşaatı 2006\'da başladı, Ağustos 2011\'de açıldı.' },
    esenboga: { ad: 'Esenboğa yeni terminali', ikon: '✈️', maliyet: 0.4, sure: 24, yil: 2004, il: 'Ankara', tekil: true, etki: { sag: 0.2, laik: 0.2 }, yerel: 1, buyume: 0.02, bilgi: 'Yap-işlet-devret ile yapılan yeni iç ve dış hatlar terminali 2006\'da açıldı.' },
    izban: { ad: 'İzmir banliyösü (İZBAN)', ikon: '🚆', maliyet: 0.6, sure: 48, yil: 2006, il: 'İzmir', tekil: true, etki: { laik: 0.4 }, yerel: 1.5, buyume: 0.03, bilgi: 'TCDD ile İzmir Büyükşehir ortaklığı. 2006\'da protokol imzalandı, 2010\'da açıldı. CHP\'li belediyeyle ortak proje.' },
    sahilyolu: { ad: 'Karadeniz Sahil Yolu', ikon: '🌊', maliyet: 2, sure: 48, yil: 2003, il: 'Trabzon', tekil: true, bolgeIller: ['Samsun', 'Ordu', 'Giresun', 'Trabzon', 'Rize', 'Artvin'], bagIl: 'Samsun', etki: { sag: 0.4, mil: 0.2 }, yerel: 1.5, buyume: 0.05, bilgi: 'Samsun–Hopa arası 2007\'de tamamlandı. Ulaşımı kısalttı; doğaya ve sahile verdiği zarar eleştirildi.' },
    gap: { ad: 'GAP sulama kanalları', ikon: '💧', maliyet: 1.5, sure: 40, yil: 2003, il: 'Şanlıurfa', tekil: true, bolgeIller: ['Şanlıurfa', 'Diyarbakır', 'Mardin', 'Adıyaman', 'Gaziantep', 'Batman'], etki: { kurt: 0.6, sag: 0.2 }, yerel: 1.5, buyume: 0.05, bilgi: 'Güneydoğu Anadolu Projesi\'nde barajlar bitmişti ama sulama kanalları yarım kalmıştı. GAP Eylem Planı 2008\'de açıklandı.' },
    ilisu: { ad: 'Ilısu Barajı', ikon: '🏞️', maliyet: 1.8, sure: 96, yil: 2006, il: 'Mardin', tekil: true, etki: { kurt: -0.4, sag: 0.2 }, yerel: 0.5, buyume: 0.04, bilgi: 'Temeli 5 Ağustos 2006\'da atıldı. Elektrik üretecek ama tarihî Hasankeyf\'i su altında bırakacak; Avrupalı kredi kuruluşları 2009\'da çekildi.' },
    universiade: { ad: 'Erzurum Universiade tesisleri', ikon: '⛷️', maliyet: 0.6, sure: 36, yil: 2007, il: 'Erzurum', tekil: true, etki: { sag: 0.2, mil: 0.2 }, yerel: 1.5, buyume: 0.02, bilgi: '2011 Kış Üniversite Oyunları Erzurum\'a verildi; kayak atlama kuleleri ve buz pistleri yapıldı.' },
    antalya: { ad: 'Antalya 2. dış hatlar terminali', ikon: '🏖️', maliyet: 0.4, sure: 24, yil: 2003, il: 'Antalya', tekil: true, etki: { sag: 0.3 }, yerel: 1.2, buyume: 0.04, bilgi: 'Turizmin başkentinde ikinci dış hatlar terminali 2005\'te açıldı.' }
  };

  /* Olay kartları. t = tarih (YYYY-AA-GG). etki: k (kesim, puan), i (kurum), d (dış), e (ekonomi şoku), b (bayrak)
     e: guven, enf (şok, puan), kur (% sıçrama), buyume (şok), acik (bir yıllık ek açık), borc (tek sefer), h/v/imf/mb kalıcı politika */
  const OLAY = [
    { id: 'kurulus', kisi: ['gul'], t: '2001-08-14', tur: 'karar', baslik: 'Parti kuruldu', yer: 'Ankara',
      metin: 'Bugün Ankara\'da partini kurdun. Kurucular arasında Milli Görüş geleneğinden ayrılan "yenilikçiler" de var, merkez sağdan gelen isimler de. Ülke Şubat 2001 krizinin enkazında: enflasyon %50\'nin üstünde, yüz binlerce kişi işini kaybetti. Partinin kimliği ne olacak?',
      tarih: 'AK Parti kendini "muhafazakâr demokrat" olarak tanımladı ve Milli Görüş\'ten ayrıldığını açıkladı. Merkez sağ partilerden çok sayıda isim de katıldı.',
      s: [
        { ad: 'Muhafazakâr demokrat: merkeze açıl', etki: { k: { sag: 4, laik: 1, muh: -1 }, i: { ordu: 2, yargi: 2, medya: 3 } }, tarih: true },
        { ad: 'Milli Görüş çizgisini sürdür', etki: { k: { muh: 4, sag: -3, laik: -3 }, i: { ordu: -6, yargi: -6, medya: -3 }, b: { milliGorus: 1 } } },
        { ad: 'Ekonomi odaklı merkez sağ parti', etki: { k: { sag: 5, muh: -3, mil: 1 }, i: { isd: 5 } } }
      ] },
    { id: '11eylul', sure: 7, t: '2001-09-12', tur: 'karar', baslik: '11 Eylül', yer: 'Ankara',
      metin: 'New York ve Washington\'da kaçırılan uçaklarla düzenlenen saldırılarda yaklaşık 3.000 kişi öldü. ABD, El Kaide\'yi sorumlu tutuyor ve Afganistan\'a müdahaleye hazırlanıyor. Dünya basını yeni partinin tavrını merak ediyor.',
      tarih: 'Türkiye\'de iktidar ve muhalefet partileri saldırıyı kınadı. Türkiye NATO müttefiki olarak ABD\'ye destek verdi.',
      s: [
        { ad: 'Saldırıyı kına, terörün dini olmadığını vurgula', etki: { k: { laik: 1, sag: 1 }, d: { abd: 5, ab: 2 }, i: { medya: 2 } }, tarih: true },
        { ad: 'Kına ama ABD\'nin bölge politikalarını eleştir', etki: { k: { muh: 2, mil: 1 }, d: { abd: -6, ort: 4 } } },
        { ad: 'Yorum yapma, iç meselelere odaklan', etki: { k: { sag: 1 }, i: { medya: -2 } } }
      ] },
    { id: 'anayasa2001', sure: 1, t: '2001-10-03', tur: 'karar', baslik: '34 maddelik anayasa değişikliği', yer: 'TBMM',
      metin: 'Meclis\'te AB yolunda büyük bir anayasa paketi oylanıyor: düşünce özgürlüğü genişliyor, idam cezası sınırlanıyor, MGK\'da sivil üye sayısı artıyor.',
      tarih: 'Paket 3 Ekim 2001\'de geniş bir çoğunlukla kabul edildi.',
      s: [
        { ad: 'Destekle', etki: { k: { laik: 1, kurt: 1 }, d: { ab: 4 } } },
        { ad: 'Destekle ama "yetersiz" de, daha fazlasını iste', etki: { k: { kurt: 2, muh: 1 }, d: { ab: 3 }, i: { ordu: -2 } } },
        { ad: 'Karşı çık', etki: { k: { mil: 2, laik: -1 }, d: { ab: -4 } } }
      ] },
    { id: 'dervis', kisi: ['dervis', 'ecevit'], nedir: 'IMF (Uluslararası Para Fonu), krizdeki ülkelere şartlı kredi veren uluslararası kuruluştur. Şartlar genelde harcamaları kısmak ve bankaları düzeltmektir.', sure: 30, t: '2001-12-10', tur: 'karar', baslik: 'Derviş programı', yer: 'Ankara',
      metin: 'Ekonomiyi Dünya Bankası\'ndan gelen Kemal Derviş\'in programı yönetiyor: bankalarda temizlik, dalgalı kur, IMF kredileri. Esnaf kepenk kapatıyor, işsizlik artıyor. Muhalefet lideri olarak tavrın ne?',
      tarih: 'AK Parti programın sosyal maliyetini eleştirdi ama iktidara gelirse IMF ile çalışmayı sürdüreceğini açıkladı.',
      s: [
        { ad: 'Sosyal maliyeti eleştir, IMF ile çalışılacağını söyle', etki: { k: { sag: 2 }, i: { isd: 5 } }, tarih: true },
        { ad: 'IMF\'ye karşı çık: "ekonomik bağımsızlık"', etki: { k: { muh: 2, mil: 2, sag: 1 }, i: { isd: -8 } } },
        { ad: 'Programı açıkça destekle', etki: { k: { sag: -3, muh: -1 }, i: { isd: 8 } } }
      ] },
    { id: 'aday', sure: 30, t: '2002-03-12', tur: 'karar', baslik: 'Aday listeleri', yer: 'Ankara',
      metin: 'Seçim olağan takvimde 2004\'te ama erken seçim konuşuluyor. Milletvekili adaylarını nasıl belirleyeceksin?',
      tarih: 'AK Parti teşkilatta temayül yoklaması yaptı; son sözü genel merkez söyledi.',
      s: [
        { ad: 'Temayül yoklaması, son söz genel merkezde', etki: { k: { sag: 1, muh: 1 }, e: { kasa: 0.4 } }, tarih: true },
        { ad: 'Tam ön seçim: üyeler seçsin', etki: { k: { muh: 1, laik: 1 }, i: { medya: 4 } } },
        { ad: 'Tanınmış isimleri listeye al', etki: { k: { sag: 2, muh: -1 }, i: { medya: 3 }, e: { kasa: 0.6 } } }
      ] },
    { id: 'ecevit', kisi: ['ecevit', 'bahceli'], sure: 15, t: '2002-05-06', tur: 'karar', baslik: 'Başbakan hastanede', yer: 'Ankara',
      metin: 'Başbakan Bülent Ecevit 4 Mayıs\'ta rahatsızlanarak hastaneye kaldırıldı. 77 yaşındaki başbakanın görevi sürdürüp sürdüremeyeceği tartışılıyor; piyasalar gergin.',
      tarih: 'Tartışmalar DSP\'ye sıçradı. Temmuz\'da Hüsamettin Özkan ve İsmail Cem başta olmak üzere çok sayıda milletvekili istifa etti.',
      s: [
        { ad: 'Geçmiş olsun de, siyasi tartışmaya girme', etki: { k: { laik: 1, sag: 1 }, i: { medya: 2 } } },
        { ad: 'Erken seçim çağrısı yap', etki: { k: { sag: 2, muh: 1, laik: -1 } } },
        { ad: '"İktidara hazırız" mesajı ver, ekonomi ekibini tanıt', etki: { k: { sag: 1 }, i: { isd: 5 } } }
      ] },
    { id: 'gencparti', kisi: ['uzan'], sure: 20, t: '2002-07-15', tur: 'karar', baslik: 'Genç Parti yükseliyor', yer: 'İstanbul',
      metin: 'İş insanı Cem Uzan\'ın kurduğu Genç Parti, güçlü televizyon kanalları ve büyük vaatlerle meydanları dolduruyor. Seçmenin bir kısmı yeni yüzlere yöneliyor.',
      tarih: 'Genç Parti 2002 seçiminde %7,2 oy aldı ve barajı geçemedi.',
      s: [
        { ad: 'Görmezden gel, kendi kampanyana bak', etki: { k: { muh: 1 } } },
        { ad: 'Vaatlerin gerçekçi olmadığını anlat', etki: { k: { sag: 2 }, i: { isd: 3 } } },
        { ad: 'Sen de büyük vaatler ver', etki: { k: { sag: 3, mil: 1 }, i: { isd: -5 } } }
      ] },
    { id: 'erkensecim', kisi: ['bahceli', 'ecevit'], t: '2002-07-31', tur: 'haber', baslik: 'Erken seçim: 3 Kasım',
      metin: 'Koalisyondaki çözülmenin ardından Meclis 3 Kasım 2002\'de erken seçime karar verdi (449 kabul). Seçime üç ay var. Teşkilatını ve mitinglerini hızlandırmanın tam zamanı.', etki: { b: { secimTarihi: 1 } } },
    { id: 'uyum3', kisi: ['bahceli'], nedir: 'Uyum paketi: Türkiye\'nin AB üyeliği için yasalarını Avrupa standartlarına uydurmak amacıyla çıkarılan yasa değişiklikleri.', sure: 1, t: '2002-08-02', tur: 'karar', baslik: 'AB uyum paketi', yer: 'TBMM',
      metin: 'Meclis\'te büyük bir AB uyum paketi var: barış zamanında idam cezası kaldırılıyor, Kürtçe yayın ve kursların önü açılıyor. MHP karşı. Oylamada tavrın ne?',
      tarih: 'Paket 3 Ağustos 2002\'de kabul edildi; koalisyon ortağı MHP karşı oy verdi.',
      s: [
        { ad: 'Destekle', etki: { k: { kurt: 4, laik: 1, mil: -3 }, d: { ab: 6 }, i: { ordu: -2 } } },
        { ad: 'Karşı çık', etki: { k: { mil: 3, kurt: -3 }, d: { ab: -6 } } },
        { ad: 'Çekimser kal', etki: { k: { kurt: 1 }, d: { ab: 1 } } }
      ] },
    { id: 'ysk', nedir: 'YSK: Yüksek Seçim Kurulu. Seçimleri yöneten ve adaylıklar hakkında son kararı veren yargı organı.', sure: 10, t: '2002-09-20', tur: 'karar', baslik: 'Adaylık engeli', yer: 'Ankara',
      metin: 'Yüksek Seçim Kurulu, geçmişteki siyasi mahkûmiyetin nedeniyle milletvekili adaylığını kabul etmedi. Partin seçime genel başkanı aday olmadan girecek.',
      tarih: 'AK Parti Genel Başkanı da Eylül 2002\'de aynı nedenle aday gösterilemedi. Kampanyayı aday olmadan sürdürdü; yasak kampanyanın ana temalarından biri oldu.',
      s: [
        { ad: 'Yaşadığın haksızlığı meydanlarda anlat', etki: { k: { muh: 3, sag: 2 }, i: { yargi: -3 } }, tarih: true },
        { ad: 'Karara saygı göster, ekibini öne çıkar', etki: { k: { laik: 2, sag: 1 }, i: { yargi: 4, medya: 2 } } },
        { ad: 'Seçimi boykot etmekle tehdit et', etki: { k: { muh: 1, sag: -4, laik: -2 }, i: { yargi: -6 } } }
      ] },
    { id: 'beyanname', sure: 25, t: '2002-10-01', tur: 'karar', baslik: 'Seçim beyannamesi', yer: 'Ankara',
      metin: 'Son ay. Kampanyanın ana mesajı ne olsun?',
      tarih: 'AK Parti kampanyada "yoksulluk, yolsuzluk ve yasaklarla mücadele" vurgusunu öne çıkardı.',
      s: [
        { ad: 'Yoksulluk, yolsuzluk, yasaklar', etki: { k: { sag: 3, muh: 1, kurt: 1 } }, tarih: true },
        { ad: 'Ekonomik istikrar ve AB üyeliği', etki: { k: { sag: 1, laik: 2 }, i: { isd: 4 }, d: { ab: 3 } } },
        { ad: 'Din ve vicdan özgürlüğü', etki: { k: { muh: 4, laik: -5 }, i: { ordu: -4, yargi: -3 } } }
      ] },
    { id: 'secim2002', t: '2002-11-03', tur: 'secim', secim: 'genel', baslik: 'Genel seçim', gercek: { akp: 34.28, chp: 19.39, mhp: 8.36, dyp: 9.54, gp: 7.25, sandalye: 363 } },
    { id: 'yasak', kisi: ['gul', 'sezer', 'baykal'], sure: 10, t: '2002-11-16', tur: 'karar', baslik: 'Hükümeti kim kuracak?', yer: 'Ankara', kosul: s => s.iktidar,
      metin: 'Partin seçimden birinci çıktı ama sen Meclis\'te değilsin: YSK adaylığını kabul etmemişti. Cumhurbaşkanı Sezer hükümeti kurma görevini kime verecek?',
      tarih: 'Gerçekte AK Parti Genel Başkanı da aynı yasak nedeniyle aday olamadı. 58. hükümeti Abdullah Gül kurdu (18 Kasım 2002). CHP\'nin desteğiyle anayasa değiştirildi; yasak kalktı.',
      s: [
        { ad: 'Abdullah Gül başbakan olsun, yasak için CHP ile uzlaş', etki: { k: { laik: 1, sag: 1 }, i: { medya: 3 }, e: { guven: 3 } }, tarih: true, sonuc: 'Gül hükümeti kuruldu. CHP, yasağı kaldıracak anayasa değişikliğine destek verdi.' },
        { ad: 'Kabineyi perde arkasından sen yönet', etki: { k: { muh: 1, laik: -2 }, i: { medya: -4, yargi: -3 }, e: { guven: -2 } }, sonuc: '"İki başlı hükümet" tartışması başladı ama değişiklik yine Meclis\'ten geçti.' },
        { ad: 'Yasak kalkana dek erken seçim iste', etki: { k: { muh: 2, laik: -2, sag: -2 }, i: { isd: -6 }, e: { guven: -8 } }, sonuc: 'Piyasalar belirsizlikten hoşlanmadı. Meclis yine de anayasa değişikliğini kabul etti.' }
      ] },
    { id: 'kopenhag', nedir: 'Kopenhag kriterleri: AB üyeliği için demokrasi, hukukun üstünlüğü, insan hakları ve işleyen piyasa ekonomisi şartları.', sure: 20, t: '2002-12-13', tur: 'karar', baslik: 'Kopenhag Zirvesi', yer: 'Kopenhag',
      metin: 'AB liderleri Türkiye\'ye müzakere tarihi vermedi; kararı Aralık 2004\'e bıraktı. "Kopenhag kriterlerini karşılarsanız müzakereler gecikmeden başlar" dediler. Reform hızını sen belirleyeceksin.',
      tarih: 'Hükümet uyum paketlerini hızlandırdı; 2003–2004 arasında birçok anayasa ve yasa değişikliği yapıldı.',
      s: [
        { ad: 'Uyum paketlerini hızlandır', etki: { k: { kurt: 2, laik: 1, mil: -2 }, i: { ordu: -3 }, d: { ab: 8 }, e: { guven: 4 }, b: { abReform: 1 } }, tarih: true },
        { ad: 'Dengeli ilerle, ordu ile çatışma', etki: { d: { ab: 2 }, i: { ordu: 2 } } },
        { ad: 'AB\'yi geri plana at, ABD ve bölgeye odaklan', etki: { k: { mil: 2, laik: -1 }, d: { ab: -8, abd: 3, ort: 3 }, e: { guven: -3 } } }
      ] },
    { id: 'imf', kisi: ['babacan'], nedir: 'Faiz dışı fazla: Devletin faiz ödemeleri hariç gelirinin giderinden fazla olması. Borcu azaltmanın yolu; ama okul, yol, maaş için daha az para demek.', t: '2003-01-10', tur: 'karar', baslik: 'IMF programı', yer: 'Ankara',
      metin: '2001 krizinden sonra başlayan IMF stand-by programı sürüyor. Program, faiz ödemeleri hariç bütçede GSYH\'nin %6,5\'i kadar fazla istiyor. Bu, sosyal harcamalara az para kalması demek.',
      tarih: 'Hükümet programa bağlı kaldı. Faiz dışı fazla hedefi tutturuldu, enflasyon 2004\'te tek haneye indi.',
      s: [
        { ad: 'Programa sadık kal, mali disiplin', etki: { k: { sag: -1, muh: -1 }, i: { isd: 6 }, e: { guven: 10, imf: true, h: -1 } }, tarih: true },
        { ad: 'Programı sürdür ama sosyal harcamayı artır', etki: { k: { muh: 1, sag: 1 }, e: { guven: 2, imf: true, h: 0 } } },
        { ad: 'IMF\'den ayrıl, kendi yolumuzu çizelim', etki: { k: { mil: 3, muh: 1 }, i: { isd: -10 }, e: { guven: -15, imf: false, h: 1, kur: 8 } } }
      ] },
    { id: 'tezkere', kisi: ['bush', 'arinc'], nedir: 'Tezkere: Hükümetin yabancı askerin ülkeye gelmesi ya da Türk askerinin yurtdışına gitmesi için Meclis\'ten aldığı izin. Kabul için toplantıdakilerin salt çoğunluğu gerekir.', sure: 1, t: '2003-03-01', tur: 'karar', baslik: '1 Mart tezkeresi', yer: 'TBMM',
      metin: 'ABD, Irak\'a kuzeyden cephe açmak için on binlerce askerinin Türkiye\'de konuşlanmasını istiyor. Karşılığında milyarlarca dolarlık hibe ve kredi paketi var. Kamuoyunun büyük çoğunluğu savaşa karşı. Tezkere bugün Meclis\'te.',
      tarih: 'Parti grubu serbest bırakıldı. 264 kabul, 250 ret, 19 çekimser oy çıktı; salt çoğunluk sağlanamadığı için tezkere kabul edilmedi.',
      s: [
        { ad: 'Grubu serbest bırak, Meclis karar versin', etki: { k: { muh: 3, mil: 3, laik: 3 }, d: { abd: -12, ort: 5, ab: 3 }, e: { guven: -4 } }, tarih: true, sonuc: 'Tezkere 264 kabul oyuna rağmen salt çoğunluğa ulaşamadı. ABD askerleri Türkiye\'den geçmedi.' },
        { ad: 'Grup kararıyla kabul ettir', etki: { k: { muh: -6, mil: -5, laik: -4 }, d: { abd: 12, ort: -8 }, e: { guven: 6 }, b: { kuzeyCephe: 1 } }, sonuc: 'Tezkere kabul edildi. Kuzeyden açılan cephe ve yardım paketi piyasayı rahatlattı ama sokakta öfke büyük.' },
        { ad: 'Hükümet olarak "hayır" de', etki: { k: { muh: 4, mil: 4, laik: 2 }, d: { abd: -18, ort: 6 }, e: { guven: -6 } }, sonuc: 'Tezkere Meclis\'e hiç gelmeden geri çekildi. Washington\'da hayal kırıklığı büyük.' }
      ] },
    { id: 'siirt', kisi: ['gul', 'babacan'], sure: 5, t: '2003-03-10', tur: 'karar', baslik: 'Başbakanlık', yer: 'Siirt',
      metin: '9 Mart\'ta Siirt\'te yenilenen seçimi kazandın ve Meclis\'e girdin. Artık başbakansın. Kabinenin yüzü nasıl olsun?',
      tarih: '59. hükümet 14 Mart 2003\'te kuruldu. Ekonomiden Ali Babacan, maliyeden Kemal Unakıtan, dışişlerinden Abdullah Gül sorumlu oldu.',
      s: [
        { ad: 'Teknokrat ağırlıklı ekonomi ekibi', etki: { k: { muh: -1 }, i: { isd: 5 }, e: { guven: 6 } }, tarih: true },
        { ad: 'Parti tabanından güçlü isimler', etki: { k: { muh: 3, sag: 1 }, e: { guven: -2 } } },
        { ad: 'Farklı kesimlerden geniş bir kabine', etki: { k: { laik: 2, kurt: 1, mil: 1, muh: -1 }, i: { medya: 4 } } }
      ] },
    { id: 'uyum7', kisi: ['ozkok'], nedir: 'MGK: Milli Güvenlik Kurulu. Komutanlarla hükümetin güvenlik konularını görüştüğü kurul; uzun yıllar siyasette ağırlığı büyüktü.', sure: 10, t: '2003-07-30', tur: 'karar', baslik: '7. uyum paketi', yer: 'TBMM',
      metin: 'Pakette MGK Genel Sekreterliği\'nin sivilleşmesi, Kürtçe özel kurs ve yayınların önünün açılması ve askerî harcamaların denetimi var. Ordu rahatsız; AB bekliyor.',
      tarih: '6. ve 7. uyum paketleri 2003 yazında kabul edildi. MGK\'nın yapısı değişti, genel sekreterliğe ilk kez bir sivil atandı (2004).',
      s: [
        { ad: 'Paketin tamamını geçir', etki: { k: { kurt: 4, laik: 1, mil: -3 }, i: { ordu: -7 }, d: { ab: 7 }, e: { guven: 2 }, b: { abReform: 1 } }, tarih: true },
        { ad: 'Kültürel hakları geçir, MGK kısmını sonraya bırak', etki: { k: { kurt: 3 }, i: { ordu: -1 }, d: { ab: 2 } } },
        { ad: 'Paketi ertele', etki: { k: { kurt: -2, mil: 1 }, i: { ordu: 3 }, d: { ab: -6 } } }
      ] },
    { id: 'butce2004', t: '2003-10-15', tur: 'butce', yil: 2004 },
    { id: 'istanbul', sure: 10, t: '2003-11-20', tur: 'karar', baslik: 'İstanbul\'da bombalı saldırılar', yer: 'İstanbul',
      metin: '15 Kasım\'da iki sinagoga, bugün de HSBC genel müdürlüğüne ve İngiltere Başkonsolosluğu\'na bombalı saldırı düzenlendi. 50\'yi aşkın kişi hayatını kaybetti. Saldırıları El Kaide üstlendi.',
      tarih: 'Türkiye, ABD ve İngiltere ile istihbarat paylaşımını artırdı. Saldırganlar ve destekçileri yakalanarak yargılandı.',
      s: [
        { ad: 'Uluslararası istihbarat işbirliğini artır', etki: { d: { abd: 5, ab: 3 }, e: { guven: -3 } }, tarih: true },
        { ad: 'Olağanüstü güvenlik önlemleri, geniş gözaltı', etki: { k: { mil: 2, laik: 1, muh: -1 }, d: { ab: -3 }, e: { guven: -4 } } },
        { ad: 'Birlik çağrısı yap, ekonomiye güven ver', etki: { k: { sag: 1 }, e: { guven: -1 } } }
      ] },
    { id: 'asgari2004', t: '2003-12-20', tur: 'asgari', yil: 2004 },
    { id: 'annan', kisi: ['annan', 'denktas'], nedir: 'Annan Planı: Kıbrıs\'ı Türk ve Rum iki kurucu devletten oluşan bir federasyon olarak birleştirmeyi öneren BM planı.', sure: 45, t: '2004-02-12', tur: 'karar', baslik: 'Kıbrıs: Annan Planı', yer: 'Lefkoşa',
      metin: 'BM Genel Sekreteri Kofi Annan\'ın planı adanın iki toplumunda referanduma gidecek. Plan bir federasyon öngörüyor. KKTC Cumhurbaşkanı Denktaş plana karşı; Türkiye\'nin tutumu belirleyici.',
      tarih: 'Türkiye planı destekledi. 24 Nisan 2004\'te Kıbrıslı Türklerin yaklaşık %65\'i "evet", Rumların yaklaşık %76\'sı "hayır" dedi. Ada bölünmüş olarak 1 Mayıs 2004\'te AB\'ye girdi.',
      s: [
        { ad: 'Planı destekle, "evet" kampanyasına arka çık', etki: { k: { mil: -5, laik: 1 }, i: { ordu: -4 }, d: { ab: 8, abd: 5 }, e: { guven: 3 }, b: { abReform: 1 } }, tarih: true, sonuc: 'Kıbrıslı Türkler "evet", Rumlar "hayır" dedi. Uluslararası kamuoyunda Türkiye\'nin eli güçlendi.' },
        { ad: 'Tarafsız kal, karar Kıbrıslı Türklerin', etki: { d: { ab: -2 } }, sonuc: 'Referandumda iki taraf da planı reddetti. Kıbrıs AB\'ye bölünmüş olarak girdi.' },
        { ad: 'Plana karşı çık', etki: { k: { mil: 5 }, i: { ordu: 3 }, d: { ab: -10, abd: -4 }, e: { guven: -3 } }, sonuc: 'Plan iki tarafta da reddedildi. Brüksel\'de Türkiye eleştiriliyor.' }
      ] },
    { id: 'yerel2004', t: '2004-03-28', tur: 'secim', secim: 'yerel', baslik: 'Yerel seçimler', gercek: { akp: 41.7 } },
    { id: 'anayasa2004', nedir: 'DGM: Devlet Güvenlik Mahkemeleri. Terör ve devlet güvenliği davalarına bakan, AB\'nin eleştirdiği özel mahkemeler.', sure: 5, t: '2004-05-07', tur: 'karar', baslik: 'Anayasa değişikliği: DGM\'ler ve idam', yer: 'TBMM',
      metin: 'Devlet Güvenlik Mahkemeleri\'ni kaldıran, idam cezasını her koşulda yasaklayan ve uluslararası insan hakları sözleşmelerini yasaların üstüne koyan paket önünde.',
      tarih: 'Paket 7 Mayıs 2004\'te kabul edildi. Haziran\'da TRT ilk kez Kürtçe dahil farklı dillerde yayına başladı.',
      s: [
        { ad: 'Paketin tamamını geçir, TRT\'de Kürtçe yayın başlasın', etki: { k: { kurt: 5, laik: 1, mil: -3 }, i: { yargi: -2 }, d: { ab: 7 }, b: { abReform: 1 } }, tarih: true },
        { ad: 'Paketi geçir, yayın konusunu ertele', etki: { k: { kurt: 1, mil: -1 }, d: { ab: 4 } } },
        { ad: 'Sadece idam cezasını kaldır', etki: { k: { mil: 1 }, d: { ab: 1 } } }
      ] },
    { id: 'tck', sure: 10, t: '2004-09-14', tur: 'karar', baslik: 'TCK ve zina tartışması', yer: 'Ankara',
      metin: 'Yeni Türk Ceza Kanunu tasarısına zinanın yeniden suç sayılması önerisi eklendi. AB Komisyonu sert tepki gösterdi; ilerleme raporu yaklaşıyor.',
      tarih: 'Öneri geri çekildi; TCK zina düzenlemesi olmadan 26 Eylül 2004\'te kabul edildi.',
      s: [
        { ad: 'Öneriyi geri çek, TCK\'yı çıkar', etki: { k: { muh: -2, laik: 2 }, d: { ab: 5 } }, tarih: true },
        { ad: 'Öneride ısrar et', etki: { k: { muh: 3, laik: -5 }, i: { medya: -4 }, d: { ab: -12 }, e: { guven: -4 } } }
      ] },
    { id: 'butce2005', t: '2004-10-15', tur: 'butce', yil: 2005 },
    { id: 'brüksel', nedir: 'Müzakere: AB\'ye aday ülke ile birliğin 35 konu başlığında (fasıl) yaptığı uzun pazarlık süreci.', sure: 10, t: '2004-12-17', tur: 'karar', baslik: 'Brüksel Zirvesi', yer: 'Brüksel', kosul: s => s.dis.ab >= 45,
      metin: 'AB liderleri, katılım müzakerelerinin 3 Ekim 2005\'te başlamasına karar verdi. Bir şart var: Gümrük Birliği\'ni Kıbrıs dahil yeni üyelere genişleten Ankara Protokolü imzalanmalı.',
      tarih: 'Türkiye kararı kabul etti ve protokolü Temmuz 2005\'te imzaladı; ancak imzaya Kıbrıs\'ı tanımadığını belirten bir deklarasyon ekledi.',
      s: [
        { ad: 'Kabul et; Kıbrıs\'ı tanımadığını deklarasyonla belirt', etki: { k: { mil: -2, sag: 1 }, d: { ab: 6 }, e: { guven: 7 }, b: { abMuzakere: 1 } }, tarih: true },
        { ad: 'Kıbrıs şartını reddet', etki: { k: { mil: 4 }, d: { ab: -12 }, e: { guven: -6 } } }
      ] },
    { id: 'brükselRet', t: '2004-12-17', tur: 'haber', baslik: 'Brüksel Zirvesi: tarih yok', kosul: s => s.dis.ab < 45,
      metin: 'Reformlar yetersiz bulundu; AB liderleri müzakere tarihi vermeyi erteledi. Piyasalar olumsuz tepki verdi.', etki: { e: { guven: -8 }, k: { mil: 1 } } },
    { id: 'asgari2005', t: '2004-12-20', tur: 'asgari', yil: 2005 },
    { id: 'ytl', kisi: ['babacan'], sure: 3, t: '2004-12-28', tur: 'karar', baslik: 'Altı sıfır', yer: 'Ankara',
      metin: 'Bir dolar 1.350.000 lira, bir ekmek 400.000 lira. Paradan altı sıfır atıp Yeni Türk Lirası\'na geçmek için her şey hazır. 1 Ocak\'ta başlayalım mı?',
      tarih: '1 Ocak 2005\'te YTL tedavüle girdi. 2009\'da "Yeni" ibaresi kaldırıldı.',
      s: [
        { ad: 'Evet, 1 Ocak 2005\'te YTL\'ye geç', etki: { e: { guven: 4, enf: -0.5 }, b: { ytl: 1 } }, tarih: true },
        { ad: 'Biraz daha bekleyelim', etki: { e: { guven: -2 } } }
      ] },
    { id: 'ssk', t: '2005-02-15', tur: 'karar', baslik: 'Sağlıkta Dönüşüm: SSK hastaneleri', yer: 'Ankara',
      metin: 'SSK hastanelerini Sağlık Bakanlığı\'na devretmek, sigortalıların devlet hastanelerine de gidebilmesi demek. Sendikalar karşı, kuyruklar uzun.',
      tarih: 'SSK hastaneleri 19 Şubat 2005\'te Sağlık Bakanlığı\'na devredildi. Genel Sağlık Sigortası 2008\'de yürürlüğe girdi.',
      s: [
        { ad: 'Hastaneleri devret, herkes her hastaneye gitsin', etki: { k: { sag: 3, muh: 2, kurt: 1, laik: -1 }, e: { acik: 0.4 } }, tarih: true },
        { ad: 'Kademeli geçiş', etki: { k: { sag: 1, muh: 1 }, e: { acik: 0.2 } } },
        { ad: 'Mevcut sistem kalsın', etki: { k: { sag: -1 } } }
      ] },
    { id: 'ozel', kisi: ['babacan'], nedir: 'Özelleştirme: Devletin sahibi olduğu şirketleri özel sektöre satması.', t: '2005-06-20', tur: 'karar', baslik: 'Büyük özelleştirmeler', yer: 'İstanbul',
      metin: 'Türk Telekom\'un %55\'i, Tüpraş ve Erdemir için ihaleler hazır. Satış borcu azaltır ama sendikalar ve muhalefet "stratejik varlıklar satılmasın" diyor.',
      tarih: 'Türk Telekom 6,55 milyar dolara (2005), Tüpraş 4,1 milyar dolara (2005), Erdemir 2,77 milyar dolara (2006) satıldı.',
      s: [
        { ad: 'Üçünü de sat', etki: { k: { mil: -2, laik: -1 }, i: { isd: 7 }, e: { guven: 6, borc: -3.5 } }, tarih: true },
        { ad: 'Sadece Türk Telekom\'u sat', etki: { i: { isd: 3 }, e: { guven: 2, borc: -1.8 } } },
        { ad: 'Hiçbirini satma', etki: { k: { mil: 2, laik: 1 }, i: { isd: -6 }, e: { guven: -4 } } }
      ] },
    { id: 'muzakere', t: '2005-10-03', tur: 'haber', baslik: 'AB müzakereleri başladı', kosul: s => s.b.abMuzakere,
      metin: 'Lüksemburg\'da son dakikaya kadar süren pazarlığın ardından Türkiye ile katılım müzakereleri resmen başladı.', etki: { d: { ab: 5 }, e: { guven: 6 }, k: { sag: 1, laik: 1 } } },
    { id: 'butce2006', t: '2005-10-15', tur: 'butce', yil: 2006 },
    { id: 'asgari2006', t: '2005-12-20', tur: 'asgari', yil: 2006 },
    { id: 'danistay', sure: 10, t: '2006-05-17', tur: 'karar', baslik: 'Danıştay saldırısı', yer: 'Ankara',
      metin: 'Danıştay 2. Dairesi\'ne düzenlenen silahlı saldırıda bir üye hayatını kaybetti, dört üye yaralandı. Ertesi gün on binler cenazede laiklik için yürüdü.',
      tarih: 'Saldırgan yakalandı. Saldırı, sonraki yıllarda açılan Ergenekon davasında da yer aldı.',
      s: [
        { ad: 'Cenazeye katıl, yargıyla dayanışma göster', etki: { k: { laik: 2 }, i: { yargi: 6 } } },
        { ad: 'Kınama yap, kutuplaşmaya karşı uyar', etki: { k: { laik: -2, muh: 1 }, i: { yargi: -2 } }, tarih: true },
        { ad: 'Güvenlik bürokrasisinde soruşturma başlat', etki: { k: { laik: 1 }, i: { ordu: -2, yargi: 2 }, d: { ab: 2 } } }
      ] },
    { id: 'dalga', kisi: ['babacan'], sure: 7, t: '2006-06-05', tur: 'karar', baslik: 'Piyasada dalgalanma', yer: 'İstanbul',
      metin: 'ABD\'de faizlerin yükselmesiyle yabancı yatırımcı gelişmekte olan ülkelerden çıkıyor. Lira birkaç haftada %20\'ye yakın değer kaybetti, borsa sert düştü.',
      tarih: 'Merkez Bankası Haziran 2006\'da faizi toplam 4,25 puan artırdı. Dalgalanma yaz sonunda yatıştı.', e: { kur: 16, guven: -10 },
      s: [
        { ad: 'Merkez Bankası\'nın faiz artırmasına destek ver', etki: { e: { guven: 8, faiz: 4.25 } }, tarih: true },
        { ad: 'Faiz artışına karşı çık', etki: { k: { sag: 1 }, e: { guven: -6, kur: 6, mb: 'baski' } } },
        { ad: 'Sessiz kal, rezervlerle müdahale', etki: { e: { guven: 2, faiz: 2 } } }
      ] },
    { id: 'butce2007', t: '2006-10-15', tur: 'butce', yil: 2007 },
    { id: 'asgari2007', t: '2006-12-20', tur: 'asgari', yil: 2007 },
    { id: 'dink', kisi: ['dink'], nedir: 'TCK 301: "Türklüğü aşağılama" suçunu düzenleyen madde. Gazeteci ve yazarlara açılan davalar nedeniyle tartışıldı.', sure: 10, t: '2007-01-19', tur: 'karar', baslik: 'Hrant Dink suikastı', yer: 'İstanbul',
      metin: 'Agos gazetesi Genel Yayın Yönetmeni Hrant Dink, gazetesinin önünde silahlı saldırıda öldürüldü. Cenazesinde on binler "Hepimiz Hrant\'ız" diye yürüdü.',
      tarih: 'Tetikçi kısa sürede yakalandı. Kamu görevlilerinin ihmalleri yıllarca yargılandı; TCK 301. madde 2008\'de değiştirildi.',
      s: [
        { ad: 'Devlet içindeki ihmal iddialarını da soruştur', etki: { k: { laik: 2, kurt: 1, mil: -2 }, i: { ordu: -2 }, d: { ab: 5 } } },
        { ad: 'Failleri yakala, 301. maddeyi tartışmaya aç', etki: { k: { laik: 1 }, d: { ab: 3 } }, tarih: true },
        { ad: 'Soruşturmayı yargıya bırak', etki: { d: { ab: -2 } } }
      ] },
    { id: 'cb', kisi: ['sezer', 'gul', 'baykal'], nedir: '367 tartışması: Muhalefet, cumhurbaşkanı seçiminin ilk turunda Meclis\'te en az 367 milletvekilinin (üçte iki) hazır bulunması gerektiğini savundu.', sure: 10, t: '2007-04-10', tur: 'karar', baslik: 'Cumhurbaşkanlığı seçimi', yer: 'Çankaya',
      metin: 'Ahmet Necdet Sezer\'in görev süresi doluyor. Cumhurbaşkanını Meclis seçecek. Muhalefet "ilk turda 367 milletvekili toplantıda olmalı" diyor. Tandoğan\'da yüz binlerce kişi Cumhuriyet Mitingi\'nde.',
      tarih: 'AK Parti, Abdullah Gül\'ü aday gösterdi. 27 Nisan\'da ilk tur yapıldı; Anayasa Mahkemesi 1 Mayıs\'ta 367 şartını kabul ederek turu iptal etti.',
      s: [
        { ad: 'Parti içinden güçlü bir aday (Abdullah Gül)', etki: { k: { muh: 3, laik: -5 }, i: { ordu: -5 } }, tarih: true, sonuc: 'Gül aday oldu. Muhalefet ilk tura katılmadı.' },
        { ad: 'Parti dışından bir uzlaşı adayı', etki: { k: { muh: -4, laik: 4 }, i: { ordu: 5, yargi: 3 }, e: { guven: 4 }, b: { uzlasi: 1 } }, sonuc: 'Uzlaşı adayı ikinci turda seçildi. Gerginlik düştü, seçim Kasım\'daki olağan tarihinde yapılacak.' },
        { ad: 'Kendin aday ol', etki: { k: { muh: 4, laik: -8 }, i: { ordu: -8, yargi: -4 }, e: { guven: -4 }, b: { kendinAday: 1 } }, sonuc: 'Adaylığın açıklanınca miting meydanları daha da kalabalıklaştı.' }
      ] },
    { id: 'muhtira', kisi: ['buyukanit', 'cicek'], nedir: 'Muhtıra: Ordunun hükümeti uyaran açıklaması. Türkiye\'de 1960, 1971, 1980 darbeleri ve 1997 sürecinin hafızası nedeniyle çok ağır bir anlam taşır.', sure: 3, t: '2007-04-27', tur: 'karar', once: 'cb', baslik: '27 Nisan bildirisi', yer: 'Genelkurmay', kosul: s => !s.b.uzlasi,
      metin: 'Gece yarısına doğru Genelkurmay Başkanlığı\'nın internet sitesinde, cumhurbaşkanlığı tartışmaları ve laiklik hakkında sert bir bildiri yayımlandı. Basın buna "e-muhtıra" diyor. Piyasalar açılışta sert düşecek.',
      tarih: 'Hükümet Sözcüsü Cemil Çiçek ertesi gün "Genelkurmay Başkanlığı Başbakanlığa bağlı bir kurumdur" dedi. 1 Mayıs\'ta Anayasa Mahkemesi turu iptal etti; seçim 22 Temmuz\'a alındı.', e: { guven: -8, kur: 4 },
      s: [
        { ad: '"Genelkurmay Başbakanlığa bağlıdır" diye cevap ver', etki: { k: { muh: 5, sag: 5, laik: -2, kurt: 2 }, i: { ordu: -10 }, d: { ab: 6 }, e: { guven: 2 }, b: { erkenSecim: 1 } }, tarih: true, sonuc: 'Cevabın geniş yankı buldu. Anayasa Mahkemesi turu iptal etti, erken seçim 22 Temmuz\'da.' },
        { ad: 'Adayı geri çek, gerginliği düşür', etki: { k: { muh: -8, sag: -3, laik: 3 }, i: { ordu: 8 }, d: { ab: -4 }, e: { guven: 4 } }, sonuc: 'Kriz yatıştı ama tabanında büyük bir hayal kırıklığı var.' },
        { ad: 'Sessiz kal', etki: { k: { muh: -2 }, e: { guven: -5 }, b: { erkenSecim: 1 } }, sonuc: 'Belirsizlik sürdü; Anayasa Mahkemesi turu iptal etti, erken seçim 22 Temmuz\'da.' }
      ] },
    { id: 'secim2007', t: '2007-07-22', tur: 'secim', once: 'cb', secim: 'genel', baslik: 'Genel seçim', kosul: s => s.b.erkenSecim, gercek: { akp: 46.58, chp: 20.88, mhp: 14.27, sandalye: 341 } },
    { id: 'secim2007k', t: '2007-11-04', tur: 'secim', once: 'cb', secim: 'genel', baslik: 'Genel seçim', kosul: s => !s.b.erkenSecim, gercek: { akp: 46.58, chp: 20.88, mhp: 14.27, sandalye: 341 } },
    { id: 'liderler', t: '2002-11-05', tur: 'haber', baslik: 'Liderler istifa ediyor', kisi: ['ciller', 'yilmaz'],
      metin: 'Barajın altında kalan DYP\'nin lideri Tansu Çiller ve ANAP\'ın lideri Mesut Yılmaz genel başkanlığı bırakacaklarını açıkladı. Eski siyasi kuşak sahneden çekiliyor.', etki: { k: { sag: 1 } } },
    { id: 'cuval', sure: 7, t: '2003-07-05', tur: 'karar', baslik: 'Süleymaniye\'de çuval olayı', yer: 'Ankara', kisi: ['bush', 'ozkok'],
      nedir: 'Kuzey Irak: 2003 savaşından sonra ABD\'nin kontrolündeki, Kürt yönetimindeki bölge. Türk askerleri burada PKK\'yı izlemek için bulunuyordu.',
      metin: 'Kuzey Irak\'ın Süleymaniye kentinde ABD askerleri, görevli Türk özel kuvvet askerlerini gözaltına aldı ve başlarına çuval geçirdi. Kamuoyunda büyük öfke var.',
      tarih: 'Hükümet sert tepki gösterdi; askerler yaklaşık 60 saat sonra serbest bırakıldı, olayı inceleyen ortak bir komisyon kuruldu. Olay iki ülke ilişkilerinde uzun süre iz bıraktı.',
      s: [
        { ad: 'Sert diplomatik tepki, askerler hemen serbest bırakılsın', etki: { k: { mil: 3, muh: 1 }, d: { abd: -6 }, i: { ordu: 3 } }, tarih: true },
        { ad: 'Sessiz diplomasiyle çöz', etki: { k: { mil: -3 }, d: { abd: 2 }, i: { ordu: -3 } } },
        { ad: 'ABD ile askerî işbirliğini askıya al', etki: { k: { mil: 5, muh: 2, laik: 1 }, d: { abd: -15 }, e: { guven: -4 } } }
      ] },
    { id: 'resepsiyon', sure: 5, t: '2003-10-25', tur: 'karar', baslik: 'Çankaya\'da resepsiyon krizi', yer: 'Çankaya', kisi: ['sezer'],
      metin: 'Cumhurbaşkanı Sezer, 29 Ekim resepsiyonuna milletvekillerini eşsiz davet etti. Bu, başörtülü eşlerin Köşk\'e gelmemesi anlamına geliyor. Partinden boykot sesleri yükseliyor.',
      tarih: 'AK Parti milletvekillerinin büyük kısmı resepsiyona katılmadı; başörtüsü tartışması yıllarca gündemde kaldı.',
      s: [
        { ad: 'Milletvekilleri resepsiyona katılmasın', etki: { k: { muh: 3, laik: -3 }, i: { yargi: -2, ordu: -2 } }, tarih: true },
        { ad: 'Katıl, devletin zirvesiyle gerginlik çıkarma', etki: { k: { muh: -3, laik: 2 }, i: { ordu: 2 } } },
        { ad: 'Sen git, isteyen gitmesin', etki: { k: { muh: 1 } } }
      ] },
    { id: 'katsayi', sure: 10, t: '2004-05-13', tur: 'karar', baslik: 'YÖK yasası ve katsayı', yer: 'TBMM', kisi: ['sezer', 'ozkok'],
      nedir: 'Katsayı: Meslek lisesi ve imam hatip mezunlarının kendi alanları dışındaki bölümlere girerken puanlarının düşük katsayıyla çarpılması uygulaması (1999).',
      metin: 'Meclis, meslek lisesi ve imam hatip mezunlarının üniversite girişindeki katsayı farkını kaldıran YÖK yasasını kabul etti. YÖK ve Genelkurmay karşı çıktı, Cumhurbaşkanı veto etti.',
      tarih: 'Sezer yasayı 28 Mayıs 2004\'te veto etti; hükümet yasayı Meclis\'e yeniden getirmedi. Katsayı farkı 2011\'de kaldırıldı.',
      s: [
        { ad: 'Yasayı rafa kaldır', etki: { k: { muh: -2 }, i: { yargi: 2, ordu: 2 } }, tarih: true },
        { ad: 'Aynen yeniden Meclis\'ten geçir', etki: { k: { muh: 4, laik: -4 }, i: { ordu: -6, yargi: -5 }, e: { guven: -3 } } },
        { ad: 'YÖK ile uzlaşarak yeni metin hazırla', etki: { k: { muh: 1, laik: 1 }, i: { yargi: 1 } } }
      ] },
    { id: 'pkk2004', sure: 15, t: '2004-06-02', tur: 'karar', baslik: 'PKK ateşkesi bitirdi', yer: 'Ankara', kisi: ['ozkok'],
      nedir: 'PKK: Türkiye, ABD ve AB tarafından terör örgütü olarak tanınan silahlı örgüt. 1984\'ten beri süren çatışmalarda on binlerce kişi hayatını kaybetti.',
      metin: 'PKK, 1999\'dan beri sürdürdüğü tek taraflı ateşkesi bitirdiğini açıkladı. Güneydoğu\'da saldırılar yeniden başlıyor.',
      tarih: 'Çatışmalar 2004\'ten sonra yeniden yoğunlaştı. Hükümet güvenlik önlemlerinin yanında AB reformları ve yatırım vurgusu yaptı.',
      s: [
        { ad: 'Güvenlik önlemleri ve reformlar birlikte', etki: { k: { mil: 1, kurt: 1 }, i: { ordu: 2 } }, tarih: true },
        { ad: 'Askerî operasyon önceliği', etki: { k: { mil: 4, kurt: -4 }, i: { ordu: 6 }, d: { ab: -3 } } },
        { ad: 'Bölgeye büyük sosyal ve ekonomik paket', etki: { k: { kurt: 4, mil: -2 }, e: { acik: 0.3 } } }
      ] },
    { id: 'diyarbakir', sure: 15, t: '2005-08-11', tur: 'karar', baslik: 'Diyarbakır konuşması', yer: 'Diyarbakır',
      metin: 'Yarın Diyarbakır\'da halka konuşacaksın. Danışmanların ikiye bölündü: "Kürt sorunu" demek cesur ama milliyetçi tepki çeker.',
      tarih: 'Başbakan 12 Ağustos 2005\'te Diyarbakır\'da "Kürt sorunu benim sorunumdur" diyerek sorunun varlığını kabul etti; konuşma geniş yankı uyandırdı.',
      s: [
        { ad: '"Kürt sorunu"nu adıyla an, demokratikleşme sözü ver', etki: { k: { kurt: 5, laik: 1, mil: -4 }, i: { ordu: -3 }, d: { ab: 4 } }, tarih: true },
        { ad: 'Ekonomik kalkınmayı anlat', etki: { k: { kurt: 1, sag: 1 } } },
        { ad: 'Terörle mücadeleyi öne çıkar', etki: { k: { mil: 3, kurt: -4 }, i: { ordu: 3 } } }
      ] },
    { id: 'pamuk', sure: 15, t: '2005-12-16', tur: 'karar', baslik: 'Orhan Pamuk davası', yer: 'İstanbul',
      nedir: 'TCK 301: "Türklüğü aşağılama" suçunu düzenleyen madde. Yazar ve gazetecilere açılan davalar nedeniyle AB\'nin eleştirisini çekti.',
      metin: 'Romancı Orhan Pamuk, İsviçre\'de bir gazeteye yaptığı açıklama nedeniyle TCK 301\'den yargılanıyor. Avrupa Parlamentosu üyeleri duruşmayı izlemeye geldi.',
      tarih: 'Dava Ocak 2006\'da usul nedeniyle düştü. 301. madde 2008\'de değiştirildi; dava açılması Adalet Bakanı iznine bağlandı.',
      s: [
        { ad: '301. maddeyi değiştir', etki: { k: { laik: 2, mil: -3 }, d: { ab: 6 } } },
        { ad: 'Yargıya müdahale etme', etki: { d: { ab: -3 } }, tarih: true },
        { ad: 'Maddeyi savun', etki: { k: { mil: 3, laik: -2 }, d: { ab: -8 } } }
      ] },
    { id: 'hamas', sure: 7, t: '2006-02-15', tur: 'karar', baslik: 'Hamas heyeti', yer: 'Ankara', kisi: ['bush'],
      metin: 'Filistin seçimlerini kazanan Hamas\'ın siyasi büro şefi Halid Meşal Ankara\'ya gelmek istiyor. ABD ve İsrail rahatsız; Arap dünyası Türkiye\'yi izliyor.',
      tarih: 'Meşal 16 Şubat 2006\'da Ankara\'ya geldi ve parti merkezinde ağırlandı. ABD ve İsrail ziyareti eleştirdi.',
      s: [
        { ad: 'Kabul et, "barış için arabuluculuk" de', etki: { k: { muh: 2 }, d: { ort: 8, abd: -6, ab: -2 } }, tarih: true },
        { ad: 'Görüşmeyi reddet', etki: { k: { muh: -2 }, d: { abd: 4, ort: -6 } } },
        { ad: 'Dışişleri düzeyinde düşük profilli görüş', etki: { d: { ort: 3, abd: -2 } } }
      ] },
    { id: 'buyukanit', t: '2006-08-28', tur: 'haber', baslik: 'Genelkurmay\'da devir teslim', kisi: ['ozkok', 'buyukanit'],
      metin: 'Orgeneral Hilmi Özkök görevini Orgeneral Yaşar Büyükanıt\'a devretti. Büyükanıt\'ın laiklik konusunda daha sert çizgisi biliniyor.', etki: { i: { ordu: -3 } } },
    { id: 'unifil', sure: 5, t: '2006-09-04', tur: 'karar', baslik: 'Lübnan\'a asker', yer: 'TBMM', kisi: ['annan'],
      metin: 'İsrail–Hizbullah savaşından sonra BM, Lübnan\'a barış gücü (UNIFIL) kuruyor ve Türkiye\'den katkı istiyor. Muhalefet "Türk askeri başkalarının savaşında ne arıyor" diyor.',
      tarih: 'Tezkere 5 Eylül 2006\'da kabul edildi; Türkiye UNIFIL\'e deniz kuvvetleri ve istihkâm birliğiyle katıldı.',
      s: [
        { ad: 'Tezkereyi geçir', etki: { d: { ab: 4, abd: 3, ort: 2 }, k: { mil: -1 } }, tarih: true },
        { ad: 'Sadece insani yardım gönder', etki: { d: { ort: 2, ab: -2 } } },
        { ad: 'Katılma', etki: { k: { mil: 2 }, d: { ab: -4, abd: -2 } } }
      ] },
    { id: 'ecevitvefat', t: '2006-11-05', tur: 'haber', baslik: 'Bülent Ecevit hayatını kaybetti', kisi: ['ecevit'],
      metin: 'Beş kez başbakanlık yapan Bülent Ecevit 81 yaşında hayatını kaybetti. Cenazesine on binler katıldı.', etki: {} },
    { id: 'kuzeyirak', sure: 5, t: '2007-10-16', tur: 'karar', baslik: 'Sınır ötesi operasyon tezkeresi', yer: 'TBMM', kisi: ['buyukanit', 'bush'],
      metin: 'PKK saldırıları arttı. Hükümet, ordunun Kuzey Irak\'taki kamplara sınır ötesi operasyon yapabilmesi için Meclis\'ten bir yıllık izin istiyor. ABD "bölgeyi istikrarsızlaştırmayın" diyor.',
      tarih: 'Tezkere 17 Ekim 2007\'de 507\'ye karşı 19 oyla kabul edildi. Kasım\'da Bush ile anlaşılarak ABD istihbarat paylaşmaya başladı; Şubat 2008\'de kara harekâtı yapıldı.',
      s: [
        { ad: 'Tezkereyi çıkar, ABD ile istihbarat pazarlığı yap', etki: { k: { mil: 4 }, i: { ordu: 5 }, d: { abd: 2 } }, tarih: true },
        { ad: 'Hemen geniş kara harekâtı', etki: { k: { mil: 6, kurt: -4 }, i: { ordu: 8 }, d: { abd: -8, ab: -4 }, e: { guven: -4 } } },
        { ad: 'Diplomasi ve Irak Kürt yönetimiyle temas', etki: { k: { mil: -4, kurt: 3 }, i: { ordu: -5 }, d: { abd: 5, ab: 3 } } }
      ] },
    { id: 'daglica', t: '2007-10-21', tur: 'haber', baslik: 'Dağlıca saldırısı',
      metin: 'Hakkâri Dağlıca\'da PKK saldırısında 12 asker hayatını kaybetti, 8 asker kaçırıldı. Ülkenin dört bir yanında protesto gösterileri yapılıyor.', etki: { k: { mil: 2 }, e: { guven: -3 } } },
    { id: 'referandum2007', t: '2007-10-21', tur: 'haber', baslik: 'Referandum: cumhurbaşkanını halk seçecek',
      metin: 'Cumhurbaşkanının halk tarafından seçilmesini öngören anayasa değişikliği referandumda %69 "evet" oyuyla kabul edildi.', etki: { k: { muh: 1, sag: 1 } } },
    { id: 'son1', t: '2007-12-01', tur: 'son', baslik: 'Birinci dönem tamamlandı' }
  ];
  // olay olmayan günlere haber akışı
  OLAY.sort((a, b) => a.t < b.t ? -1 : a.t > b.t ? 1 : 0);
  const HABER = [
    ['2001-10-07', 'ABD ve İngiltere Afganistan\'a hava saldırılarına başladı'], ['2002-01-01', 'Euro banknotları tedavüle girdi'], ['2002-06-29', 'Millî Takım Dünya Kupası\'nı üçüncü bitirdi'], ['2002-07-22', 'İsmail Cem, Yeni Türkiye Partisi\'ni kurdu'],
    ['2002-11-20', 'Borsa seçim sonrası rekor yükselişle haftayı kapattı'], ['2003-03-20', 'ABD öncülüğündeki koalisyon Irak\'a girdi'],
    ['2003-08-12', 'Bölünmüş yol seferberliği başladı'], ['2004-05-01', 'AB 10 yeni üyeyle genişledi; Kıbrıs Rum Kesimi de üye oldu'],
    ['2004-06-29', 'NATO Zirvesi İstanbul\'da toplandı'], ['2005-03-06', 'Kadınlar Günü yürüyüşüne müdahale AB\'den tepki aldı'],
    ['2005-11-01', 'Kuş gribi virüsü Türkiye\'de görüldü'], ['2006-03-29', 'Türkiye\'de tam güneş tutulması izlendi'],
    ['2006-10-12', 'Orhan Pamuk Nobel Edebiyat Ödülü\'nü kazandı'], ['2006-11-28', 'Papa XVI. Benedictus Türkiye\'yi ziyaret etti'],
    ['2007-04-14', 'Tandoğan\'da Cumhuriyet Mitingi: yüz binler toplandı'], ['2007-08-28', 'Cumhurbaşkanı Meclis\'te seçildi']
  ];
  const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  return { KARAR_CARPAN: 0.6, YIPRANMA: 2005, AKP_ZIRVE, KISI, BOLGE, VSTART, EKO_GECMIS, PARTI, KESIM, DEHAP_IL, KURUM, DIS, EKO, GERCEK, ULKE_AD, ULKE_ETIKET, DENIZ, PROJE, OLAY, HABER, AYLAR, BASLANGIC: '2001-08-14' };
})();
