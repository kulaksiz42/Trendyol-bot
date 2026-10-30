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
    sag: { ad: 'Merkez sağ', ikon: '🏪', w: 24, v0: 0.27, duy: 6 },
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
  const PROJE = {
    toki: { ad: 'TOKİ konutları', ikon: '🏘️', maliyet: 1.2, sure: 14, yil: 2003, etki: { sag: 0.6, muh: 0.4 }, yerel: 3, buyume: 0.04, bilgi: 'Dar gelirliye uzun vadeli taksitle konut. 2003\'ten sonra TOKİ yüz binlerce konut üretti.' },
    hastane: { ad: 'Devlet hastanesi', ikon: '🏥', maliyet: 0.7, sure: 18, yil: 2003, etki: { sag: 0.4, muh: 0.3, kurt: 0.3 }, yerel: 3, buyume: 0.02, bilgi: 'Sağlıkta Dönüşüm Programı (2003) ile hastane yatırımları hızlandı.' },
    univ: { ad: 'Üniversite', ikon: '🎓', maliyet: 0.5, sure: 12, yil: 2006, etki: { laik: 0.3, sag: 0.2, kurt: 0.2 }, yerel: 2, buyume: 0.02, bilgi: '2006 ve 2007\'de çıkarılan yasalarla 40\'tan fazla ilde yeni devlet üniversitesi kuruldu.' },
    havalimani: { ad: 'Bölgesel havalimanı', ikon: '✈️', maliyet: 1.5, sure: 24, yil: 2003, etki: { sag: 0.5, laik: 0.2 }, yerel: 2, buyume: 0.05, bilgi: '2003\'te iç hatlarda özel şirketlere izin verildi; yolcu sayısı birkaç yılda katlandı.' },
    yol: { ad: 'Bölünmüş yol', ikon: '🛣️', maliyet: 1.0, sure: 10, yil: 2003, etki: { sag: 0.5, muh: 0.2 }, yerel: 2, buyume: 0.04, bilgi: '2003–2007 arasında yaklaşık 9.000 km bölünmüş yol yapıldı.', bag: true },
    marmaray: { ad: 'Marmaray', ikon: '🚇', maliyet: 9, sure: 112, yil: 2004, il: 'İstanbul', tekil: true, etki: { sag: 1, laik: 0.6, muh: 0.5 }, yerel: 4, buyume: 0.15, bilgi: 'Boğaz\'ın altından geçen demiryolu tüneli. Kazılar Mayıs 2004\'te başladı, hat 29 Ekim 2013\'te açıldı.' },
    yht: { ad: 'Ankara–Eskişehir YHT', ikon: '🚄', maliyet: 4, sure: 70, yil: 2003, il: 'Eskişehir', bagIl: 'Ankara', tekil: true, etki: { sag: 0.8, laik: 0.5 }, yerel: 4, buyume: 0.08, bilgi: 'Türkiye\'nin ilk yüksek hızlı tren hattı. 13 Mart 2009\'da sefere başladı.' }
  };

  /* Olay kartları. t = tarih (YYYY-AA-GG). etki: k (kesim, puan), i (kurum), d (dış), e (ekonomi şoku), b (bayrak)
     e: guven, enf (şok, puan), kur (% sıçrama), buyume (şok), acik (bir yıllık ek açık), borc (tek sefer), h/v/imf/mb kalıcı politika */
  const OLAY = [
    { id: 'yasak', t: '2002-11-16', tur: 'karar', baslik: 'Siyasi yasak', yer: 'Ankara',
      metin: 'Partin seçimi açık farkla kazandı ama sen Meclis\'e giremedin: eski bir siyasi mahkûmiyet nedeniyle milletvekili adayı olamamıştın. Hükümeti kim kuracak?',
      tarih: 'Gerçekte AK Parti Genel Başkanı da aynı yasak nedeniyle aday olamadı. 58. hükümeti Abdullah Gül kurdu (18 Kasım 2002). CHP\'nin desteğiyle anayasa değiştirildi; yasak kalktı.',
      s: [
        { ad: 'Abdullah Gül başbakan olsun, yasak için CHP ile uzlaş', etki: { k: { laik: 1, sag: 1 }, i: { medya: 3 }, e: { guven: 3 } }, tarih: true, sonuc: 'Gül hükümeti kuruldu. CHP, yasağı kaldıracak anayasa değişikliğine destek verdi.' },
        { ad: 'Kabineyi perde arkasından sen yönet', etki: { k: { muh: 1, laik: -2 }, i: { medya: -4, yargi: -3 }, e: { guven: -2 } }, sonuc: '"İki başlı hükümet" tartışması başladı ama değişiklik yine Meclis\'ten geçti.' },
        { ad: 'Yasak kalkana dek erken seçim iste', etki: { k: { muh: 2, laik: -2, sag: -2 }, i: { isd: -6 }, e: { guven: -8 } }, sonuc: 'Piyasalar belirsizlikten hoşlanmadı. Meclis yine de anayasa değişikliğini kabul etti.' }
      ] },
    { id: 'kopenhag', t: '2002-12-13', tur: 'karar', baslik: 'Kopenhag Zirvesi', yer: 'Kopenhag',
      metin: 'AB liderleri Türkiye\'ye müzakere tarihi vermedi; kararı Aralık 2004\'e bıraktı. "Kopenhag kriterlerini karşılarsanız müzakereler gecikmeden başlar" dediler. Reform hızını sen belirleyeceksin.',
      tarih: 'Hükümet uyum paketlerini hızlandırdı; 2003–2004 arasında birçok anayasa ve yasa değişikliği yapıldı.',
      s: [
        { ad: 'Uyum paketlerini hızlandır', etki: { k: { kurt: 2, laik: 1, mil: -2 }, i: { ordu: -3 }, d: { ab: 8 }, e: { guven: 4 }, b: { abReform: 1 } }, tarih: true },
        { ad: 'Dengeli ilerle, ordu ile çatışma', etki: { d: { ab: 2 }, i: { ordu: 2 } } },
        { ad: 'AB\'yi geri plana at, ABD ve bölgeye odaklan', etki: { k: { mil: 2, laik: -1 }, d: { ab: -8, abd: 3, ort: 3 }, e: { guven: -3 } } }
      ] },
    { id: 'imf', t: '2003-01-10', tur: 'karar', baslik: 'IMF programı', yer: 'Ankara',
      metin: '2001 krizinden sonra başlayan IMF stand-by programı sürüyor. Program, faiz ödemeleri hariç bütçede GSYH\'nin %6,5\'i kadar fazla istiyor. Bu, sosyal harcamalara az para kalması demek.',
      tarih: 'Hükümet programa bağlı kaldı. Faiz dışı fazla hedefi tutturuldu, enflasyon 2004\'te tek haneye indi.',
      s: [
        { ad: 'Programa sadık kal, mali disiplin', etki: { k: { sag: -1, muh: -1 }, i: { isd: 6 }, e: { guven: 10, imf: true, h: -1 } }, tarih: true },
        { ad: 'Programı sürdür ama sosyal harcamayı artır', etki: { k: { muh: 1, sag: 1 }, e: { guven: 2, imf: true, h: 0 } } },
        { ad: 'IMF\'den ayrıl, kendi yolumuzu çizelim', etki: { k: { mil: 3, muh: 1 }, i: { isd: -10 }, e: { guven: -15, imf: false, h: 1, kur: 8 } } }
      ] },
    { id: 'tezkere', t: '2003-03-01', tur: 'karar', baslik: '1 Mart tezkeresi', yer: 'TBMM',
      metin: 'ABD, Irak\'a kuzeyden cephe açmak için on binlerce askerinin Türkiye\'de konuşlanmasını istiyor. Karşılığında milyarlarca dolarlık hibe ve kredi paketi var. Kamuoyunun büyük çoğunluğu savaşa karşı. Tezkere bugün Meclis\'te.',
      tarih: 'Parti grubu serbest bırakıldı. 264 kabul, 250 ret, 19 çekimser oy çıktı; salt çoğunluk sağlanamadığı için tezkere kabul edilmedi.',
      s: [
        { ad: 'Grubu serbest bırak, Meclis karar versin', etki: { k: { muh: 3, mil: 3, laik: 3 }, d: { abd: -12, ort: 5, ab: 3 }, e: { guven: -4 } }, tarih: true, sonuc: 'Tezkere 264 kabul oyuna rağmen salt çoğunluğa ulaşamadı. ABD askerleri Türkiye\'den geçmedi.' },
        { ad: 'Grup kararıyla kabul ettir', etki: { k: { muh: -6, mil: -5, laik: -4 }, d: { abd: 12, ort: -8 }, e: { guven: 6 }, b: { kuzeyCephe: 1 } }, sonuc: 'Tezkere kabul edildi. Kuzeyden açılan cephe ve yardım paketi piyasayı rahatlattı ama sokakta öfke büyük.' },
        { ad: 'Hükümet olarak "hayır" de', etki: { k: { muh: 4, mil: 4, laik: 2 }, d: { abd: -18, ort: 6 }, e: { guven: -6 } }, sonuc: 'Tezkere Meclis\'e hiç gelmeden geri çekildi. Washington\'da hayal kırıklığı büyük.' }
      ] },
    { id: 'siirt', t: '2003-03-10', tur: 'karar', baslik: 'Başbakanlık', yer: 'Siirt',
      metin: '9 Mart\'ta Siirt\'te yenilenen seçimi kazandın ve Meclis\'e girdin. Artık başbakansın. Kabinenin yüzü nasıl olsun?',
      tarih: '59. hükümet 14 Mart 2003\'te kuruldu. Ekonomiden Ali Babacan, maliyeden Kemal Unakıtan, dışişlerinden Abdullah Gül sorumlu oldu.',
      s: [
        { ad: 'Teknokrat ağırlıklı ekonomi ekibi', etki: { k: { muh: -1 }, i: { isd: 5 }, e: { guven: 6 } }, tarih: true },
        { ad: 'Parti tabanından güçlü isimler', etki: { k: { muh: 3, sag: 1 }, e: { guven: -2 } } },
        { ad: 'Farklı kesimlerden geniş bir kabine', etki: { k: { laik: 2, kurt: 1, mil: 1, muh: -1 }, i: { medya: 4 } } }
      ] },
    { id: 'uyum7', t: '2003-07-30', tur: 'karar', baslik: '7. uyum paketi', yer: 'TBMM',
      metin: 'Pakette MGK Genel Sekreterliği\'nin sivilleşmesi, Kürtçe özel kurs ve yayınların önünün açılması ve askerî harcamaların denetimi var. Ordu rahatsız; AB bekliyor.',
      tarih: '6. ve 7. uyum paketleri 2003 yazında kabul edildi. MGK\'nın yapısı değişti, genel sekreterliğe ilk kez bir sivil atandı (2004).',
      s: [
        { ad: 'Paketin tamamını geçir', etki: { k: { kurt: 4, laik: 1, mil: -3 }, i: { ordu: -7 }, d: { ab: 7 }, e: { guven: 2 }, b: { abReform: 1 } }, tarih: true },
        { ad: 'Kültürel hakları geçir, MGK kısmını sonraya bırak', etki: { k: { kurt: 3 }, i: { ordu: -1 }, d: { ab: 2 } } },
        { ad: 'Paketi ertele', etki: { k: { kurt: -2, mil: 1 }, i: { ordu: 3 }, d: { ab: -6 } } }
      ] },
    { id: 'butce2004', t: '2003-10-15', tur: 'butce', yil: 2004 },
    { id: 'istanbul', t: '2003-11-20', tur: 'karar', baslik: 'İstanbul\'da bombalı saldırılar', yer: 'İstanbul',
      metin: '15 Kasım\'da iki sinagoga, bugün de HSBC genel müdürlüğüne ve İngiltere Başkonsolosluğu\'na bombalı saldırı düzenlendi. 50\'yi aşkın kişi hayatını kaybetti. Saldırıları El Kaide üstlendi.',
      tarih: 'Türkiye, ABD ve İngiltere ile istihbarat paylaşımını artırdı. Saldırganlar ve destekçileri yakalanarak yargılandı.',
      s: [
        { ad: 'Uluslararası istihbarat işbirliğini artır', etki: { d: { abd: 5, ab: 3 }, e: { guven: -3 } }, tarih: true },
        { ad: 'Olağanüstü güvenlik önlemleri, geniş gözaltı', etki: { k: { mil: 2, laik: 1, muh: -1 }, d: { ab: -3 }, e: { guven: -4 } } },
        { ad: 'Birlik çağrısı yap, ekonomiye güven ver', etki: { k: { sag: 1 }, e: { guven: -1 } } }
      ] },
    { id: 'asgari2004', t: '2003-12-20', tur: 'asgari', yil: 2004 },
    { id: 'annan', t: '2004-02-12', tur: 'karar', baslik: 'Kıbrıs: Annan Planı', yer: 'Lefkoşa',
      metin: 'BM Genel Sekreteri Kofi Annan\'ın planı adanın iki toplumunda referanduma gidecek. Plan bir federasyon öngörüyor. KKTC Cumhurbaşkanı Denktaş plana karşı; Türkiye\'nin tutumu belirleyici.',
      tarih: 'Türkiye planı destekledi. 24 Nisan 2004\'te Kıbrıslı Türklerin yaklaşık %65\'i "evet", Rumların yaklaşık %76\'sı "hayır" dedi. Ada bölünmüş olarak 1 Mayıs 2004\'te AB\'ye girdi.',
      s: [
        { ad: 'Planı destekle, "evet" kampanyasına arka çık', etki: { k: { mil: -5, laik: 1 }, i: { ordu: -4 }, d: { ab: 8, abd: 5 }, e: { guven: 3 }, b: { abReform: 1 } }, tarih: true, sonuc: 'Kıbrıslı Türkler "evet", Rumlar "hayır" dedi. Uluslararası kamuoyunda Türkiye\'nin eli güçlendi.' },
        { ad: 'Tarafsız kal, karar Kıbrıslı Türklerin', etki: { d: { ab: -2 } }, sonuc: 'Referandumda iki taraf da planı reddetti. Kıbrıs AB\'ye bölünmüş olarak girdi.' },
        { ad: 'Plana karşı çık', etki: { k: { mil: 5 }, i: { ordu: 3 }, d: { ab: -10, abd: -4 }, e: { guven: -3 } }, sonuc: 'Plan iki tarafta da reddedildi. Brüksel\'de Türkiye eleştiriliyor.' }
      ] },
    { id: 'yerel2004', t: '2004-03-28', tur: 'secim', secim: 'yerel', baslik: 'Yerel seçimler', gercek: { akp: 41.7 } },
    { id: 'anayasa2004', t: '2004-05-07', tur: 'karar', baslik: 'Anayasa değişikliği: DGM\'ler ve idam', yer: 'TBMM',
      metin: 'Devlet Güvenlik Mahkemeleri\'ni kaldıran, idam cezasını her koşulda yasaklayan ve uluslararası insan hakları sözleşmelerini yasaların üstüne koyan paket önünde.',
      tarih: 'Paket 7 Mayıs 2004\'te kabul edildi. Haziran\'da TRT ilk kez Kürtçe dahil farklı dillerde yayına başladı.',
      s: [
        { ad: 'Paketin tamamını geçir, TRT\'de Kürtçe yayın başlasın', etki: { k: { kurt: 5, laik: 1, mil: -3 }, i: { yargi: -2 }, d: { ab: 7 }, b: { abReform: 1 } }, tarih: true },
        { ad: 'Paketi geçir, yayın konusunu ertele', etki: { k: { kurt: 1, mil: -1 }, d: { ab: 4 } } },
        { ad: 'Sadece idam cezasını kaldır', etki: { k: { mil: 1 }, d: { ab: 1 } } }
      ] },
    { id: 'tck', t: '2004-09-14', tur: 'karar', baslik: 'TCK ve zina tartışması', yer: 'Ankara',
      metin: 'Yeni Türk Ceza Kanunu tasarısına zinanın yeniden suç sayılması önerisi eklendi. AB Komisyonu sert tepki gösterdi; ilerleme raporu yaklaşıyor.',
      tarih: 'Öneri geri çekildi; TCK zina düzenlemesi olmadan 26 Eylül 2004\'te kabul edildi.',
      s: [
        { ad: 'Öneriyi geri çek, TCK\'yı çıkar', etki: { k: { muh: -2, laik: 2 }, d: { ab: 5 } }, tarih: true },
        { ad: 'Öneride ısrar et', etki: { k: { muh: 3, laik: -5 }, i: { medya: -4 }, d: { ab: -12 }, e: { guven: -4 } } }
      ] },
    { id: 'butce2005', t: '2004-10-15', tur: 'butce', yil: 2005 },
    { id: 'brüksel', t: '2004-12-17', tur: 'karar', baslik: 'Brüksel Zirvesi', yer: 'Brüksel', kosul: s => s.dis.ab >= 45,
      metin: 'AB liderleri, katılım müzakerelerinin 3 Ekim 2005\'te başlamasına karar verdi. Bir şart var: Gümrük Birliği\'ni Kıbrıs dahil yeni üyelere genişleten Ankara Protokolü imzalanmalı.',
      tarih: 'Türkiye kararı kabul etti ve protokolü Temmuz 2005\'te imzaladı; ancak imzaya Kıbrıs\'ı tanımadığını belirten bir deklarasyon ekledi.',
      s: [
        { ad: 'Kabul et; Kıbrıs\'ı tanımadığını deklarasyonla belirt', etki: { k: { mil: -2, sag: 1 }, d: { ab: 6 }, e: { guven: 7 }, b: { abMuzakere: 1 } }, tarih: true },
        { ad: 'Kıbrıs şartını reddet', etki: { k: { mil: 4 }, d: { ab: -12 }, e: { guven: -6 } } }
      ] },
    { id: 'brükselRet', t: '2004-12-17', tur: 'haber', baslik: 'Brüksel Zirvesi: tarih yok', kosul: s => s.dis.ab < 45,
      metin: 'Reformlar yetersiz bulundu; AB liderleri müzakere tarihi vermeyi erteledi. Piyasalar olumsuz tepki verdi.', etki: { e: { guven: -8 }, k: { mil: 1 } } },
    { id: 'asgari2005', t: '2004-12-20', tur: 'asgari', yil: 2005 },
    { id: 'ytl', t: '2004-12-28', tur: 'karar', baslik: 'Altı sıfır', yer: 'Ankara',
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
    { id: 'ozel', t: '2005-06-20', tur: 'karar', baslik: 'Büyük özelleştirmeler', yer: 'İstanbul',
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
    { id: 'danistay', t: '2006-05-17', tur: 'karar', baslik: 'Danıştay saldırısı', yer: 'Ankara',
      metin: 'Danıştay 2. Dairesi\'ne düzenlenen silahlı saldırıda bir üye hayatını kaybetti, dört üye yaralandı. Ertesi gün on binler cenazede laiklik için yürüdü.',
      tarih: 'Saldırgan yakalandı. Saldırı, sonraki yıllarda açılan Ergenekon davasında da yer aldı.',
      s: [
        { ad: 'Cenazeye katıl, yargıyla dayanışma göster', etki: { k: { laik: 2 }, i: { yargi: 6 } } },
        { ad: 'Kınama yap, kutuplaşmaya karşı uyar', etki: { k: { laik: -2, muh: 1 }, i: { yargi: -2 } }, tarih: true },
        { ad: 'Güvenlik bürokrasisinde soruşturma başlat', etki: { k: { laik: 1 }, i: { ordu: -2, yargi: 2 }, d: { ab: 2 } } }
      ] },
    { id: 'dalga', t: '2006-06-05', tur: 'karar', baslik: 'Piyasada dalgalanma', yer: 'İstanbul',
      metin: 'ABD\'de faizlerin yükselmesiyle yabancı yatırımcı gelişmekte olan ülkelerden çıkıyor. Lira birkaç haftada %20\'ye yakın değer kaybetti, borsa sert düştü.',
      tarih: 'Merkez Bankası Haziran 2006\'da faizi toplam 4,25 puan artırdı. Dalgalanma yaz sonunda yatıştı.', e: { kur: 16, guven: -10 },
      s: [
        { ad: 'Merkez Bankası\'nın faiz artırmasına destek ver', etki: { e: { guven: 8, faiz: 4.25 } }, tarih: true },
        { ad: 'Faiz artışına karşı çık', etki: { k: { sag: 1 }, e: { guven: -6, kur: 6, mb: 'baski' } } },
        { ad: 'Sessiz kal, rezervlerle müdahale', etki: { e: { guven: 2, faiz: 2 } } }
      ] },
    { id: 'butce2007', t: '2006-10-15', tur: 'butce', yil: 2007 },
    { id: 'asgari2007', t: '2006-12-20', tur: 'asgari', yil: 2007 },
    { id: 'dink', t: '2007-01-19', tur: 'karar', baslik: 'Hrant Dink suikastı', yer: 'İstanbul',
      metin: 'Agos gazetesi Genel Yayın Yönetmeni Hrant Dink, gazetesinin önünde silahlı saldırıda öldürüldü. Cenazesinde on binler "Hepimiz Hrant\'ız" diye yürüdü.',
      tarih: 'Tetikçi kısa sürede yakalandı. Kamu görevlilerinin ihmalleri yıllarca yargılandı; TCK 301. madde 2008\'de değiştirildi.',
      s: [
        { ad: 'Devlet içindeki ihmal iddialarını da soruştur', etki: { k: { laik: 2, kurt: 1, mil: -2 }, i: { ordu: -2 }, d: { ab: 5 } } },
        { ad: 'Failleri yakala, 301. maddeyi tartışmaya aç', etki: { k: { laik: 1 }, d: { ab: 3 } }, tarih: true },
        { ad: 'Soruşturmayı yargıya bırak', etki: { d: { ab: -2 } } }
      ] },
    { id: 'cb', t: '2007-04-10', tur: 'karar', baslik: 'Cumhurbaşkanlığı seçimi', yer: 'Çankaya',
      metin: 'Ahmet Necdet Sezer\'in görev süresi doluyor. Cumhurbaşkanını Meclis seçecek. Muhalefet "ilk turda 367 milletvekili toplantıda olmalı" diyor. Tandoğan\'da yüz binlerce kişi Cumhuriyet Mitingi\'nde.',
      tarih: 'AK Parti, Abdullah Gül\'ü aday gösterdi. 27 Nisan\'da ilk tur yapıldı; Anayasa Mahkemesi 1 Mayıs\'ta 367 şartını kabul ederek turu iptal etti.',
      s: [
        { ad: 'Parti içinden güçlü bir aday (Abdullah Gül)', etki: { k: { muh: 3, laik: -5 }, i: { ordu: -5 } }, tarih: true, sonuc: 'Gül aday oldu. Muhalefet ilk tura katılmadı.' },
        { ad: 'Parti dışından bir uzlaşı adayı', etki: { k: { muh: -4, laik: 4 }, i: { ordu: 5, yargi: 3 }, e: { guven: 4 }, b: { uzlasi: 1 } }, sonuc: 'Uzlaşı adayı ikinci turda seçildi. Gerginlik düştü, seçim Kasım\'daki olağan tarihinde yapılacak.' },
        { ad: 'Kendin aday ol', etki: { k: { muh: 4, laik: -8 }, i: { ordu: -8, yargi: -4 }, e: { guven: -4 }, b: { kendinAday: 1 } }, sonuc: 'Adaylığın açıklanınca miting meydanları daha da kalabalıklaştı.' }
      ] },
    { id: 'muhtira', t: '2007-04-27', tur: 'karar', baslik: '27 Nisan bildirisi', yer: 'Genelkurmay', kosul: s => !s.b.uzlasi,
      metin: 'Gece yarısına doğru Genelkurmay Başkanlığı\'nın internet sitesinde, cumhurbaşkanlığı tartışmaları ve laiklik hakkında sert bir bildiri yayımlandı. Basın buna "e-muhtıra" diyor. Piyasalar açılışta sert düşecek.',
      tarih: 'Hükümet Sözcüsü Cemil Çiçek ertesi gün "Genelkurmay Başkanlığı Başbakanlığa bağlı bir kurumdur" dedi. 1 Mayıs\'ta Anayasa Mahkemesi turu iptal etti; seçim 22 Temmuz\'a alındı.', e: { guven: -8, kur: 4 },
      s: [
        { ad: '"Genelkurmay Başbakanlığa bağlıdır" diye cevap ver', etki: { k: { muh: 5, sag: 5, laik: -2, kurt: 2 }, i: { ordu: -10 }, d: { ab: 6 }, e: { guven: 2 }, b: { erkenSecim: 1 } }, tarih: true, sonuc: 'Cevabın geniş yankı buldu. Anayasa Mahkemesi turu iptal etti, erken seçim 22 Temmuz\'da.' },
        { ad: 'Adayı geri çek, gerginliği düşür', etki: { k: { muh: -8, sag: -3, laik: 3 }, i: { ordu: 8 }, d: { ab: -4 }, e: { guven: 4 } }, sonuc: 'Kriz yatıştı ama tabanında büyük bir hayal kırıklığı var.' },
        { ad: 'Sessiz kal', etki: { k: { muh: -2 }, e: { guven: -5 }, b: { erkenSecim: 1 } }, sonuc: 'Belirsizlik sürdü; Anayasa Mahkemesi turu iptal etti, erken seçim 22 Temmuz\'da.' }
      ] },
    { id: 'secim2007', t: '2007-07-22', tur: 'secim', secim: 'genel', baslik: 'Genel seçim', kosul: s => s.b.erkenSecim, gercek: { akp: 46.58, chp: 20.88, mhp: 14.27, sandalye: 341 } },
    { id: 'secim2007k', t: '2007-11-04', tur: 'secim', secim: 'genel', baslik: 'Genel seçim', kosul: s => !s.b.erkenSecim, gercek: { akp: 46.58, chp: 20.88, mhp: 14.27, sandalye: 341 } },
    { id: 'son1', t: '2007-12-01', tur: 'son', baslik: 'Birinci dönem tamamlandı' }
  ];
  // olay olmayan günlere haber akışı
  const HABER = [
    ['2002-11-20', 'Borsa seçim sonrası rekor yükselişle haftayı kapattı'], ['2003-03-20', 'ABD öncülüğündeki koalisyon Irak\'a girdi'],
    ['2003-08-12', 'Bölünmüş yol seferberliği başladı'], ['2004-05-01', 'AB 10 yeni üyeyle genişledi; Kıbrıs Rum Kesimi de üye oldu'],
    ['2004-06-29', 'NATO Zirvesi İstanbul\'da toplandı'], ['2005-03-06', 'Kadınlar Günü yürüyüşüne müdahale AB\'den tepki aldı'],
    ['2005-11-01', 'Kuş gribi virüsü Türkiye\'de görüldü'], ['2006-03-29', 'Türkiye\'de tam güneş tutulması izlendi'],
    ['2006-10-12', 'Orhan Pamuk Nobel Edebiyat Ödülü\'nü kazandı'], ['2006-11-28', 'Papa XVI. Benedictus Türkiye\'yi ziyaret etti'],
    ['2007-04-14', 'Tandoğan\'da Cumhuriyet Mitingi: yüz binler toplandı'], ['2007-08-28', 'Cumhurbaşkanı Meclis\'te seçildi']
  ];
  const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  return { PARTI, KESIM, DEHAP_IL, KURUM, DIS, EKO, GERCEK, ULKE_AD, ULKE_ETIKET, DENIZ, PROJE, OLAY, HABER, AYLAR, BASLANGIC: '2002-11-03' };
})();
