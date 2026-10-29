/* Özel Dans — oyun verisi.
   İçerik (mesajlar, olaylar, mağaza, hikâye) burada durur; kod değiştirmeden güncellenebilir.
   Tüm hesaplar ve kişiler kurmacadır. */
'use strict';
window.VERI = {
  SURUM: 1,
  SON_GUN: 3,            // dikey dilim: 3 gün. Tam oyun ~30 gün olacak.
  YAYIN_SURE: 180,       // canlı yayın, gerçek saniye
  KUR_BASLANGIC: 42.8,   // 1 $ = TL
  ASGARI_UCRET: 28075.5, // 2026 net asgari ücret
  PLATFORM_KESINTI: 0.2,
  ABONE_UCRET: 4.99,
  GIDER: { kira: 500, internet: 35 }, // günlük TL

  /* ---------- karakter ---------- */
  KIMLIK: [
    { id: 'kadin', ad: 'Kadın', hitap: 'abla', unvan: 'kraliçe' },
    { id: 'erkek', ad: 'Erkek', hitap: 'abi', unvan: 'kral' },
    { id: 'transkadin', ad: 'Trans kadın', hitap: 'abla', unvan: 'kraliçe' },
    { id: 'transerkek', ad: 'Trans erkek', hitap: 'abi', unvan: 'kral' },
    { id: 'nonbinary', ad: 'Non-binary', hitap: 'hocam', unvan: 'efsane' }
  ],
  YONELIM: [
    { id: 'hetero', ad: 'Hetero' }, { id: 'gay', ad: 'Gay' },
    { id: 'lezbiyen', ad: 'Lezbiyen' }, { id: 'biseksuel', ad: 'Biseksüel' }
  ],
  SILUET: [
    { id: 'a', ad: 'Kıvrımlı' }, { id: 'b', ad: 'Geniş omuzlu' }
  ],
  TEN: ['#f6d7c3', '#eac0a0', '#d9a07a', '#b97a52', '#8d5634', '#5e3a24'],
  SAC: [
    { id: 'kisa', ad: 'Yandan ayrık' }, { id: 'uzun', ad: 'Uzun' }, { id: 'topuz', ad: 'Topuz' },
    { id: 'kisakesim', ad: 'Kısa kesim' }, { id: 'kazinmis', ad: 'Kazınmış' }, { id: 'kel', ad: 'Kel' }
  ],
  SAC_RENK: ['#1d1512', '#4a2e1f', '#8a5a33', '#d6a85c', '#a8322d', '#e7e2da', '#6d4bd1'],
  SAKAL: [
    { id: 'yok', ad: 'Yok' }, { id: 'kirli', ad: 'Kirli sakal' }, { id: 'tam', ad: 'Sakal' }
  ],
  GOZLUK: [
    { id: 'yok', ad: 'Yok' }, { id: 'yuvarlak', ad: 'Yuvarlak' }, { id: 'kalin', ad: 'Kalın çerçeve' }, { id: 'gunes', ad: 'Güneş gözlüğü' }
  ],
  MAKYAJ: [
    { id: 'yok', ad: 'Yok' }, { id: 'dogal', ad: 'Doğal' }, { id: 'pembe', ad: 'Pembe parlak' },
    { id: 'smokey', ad: 'Smokey göz' }, { id: 'glam', ad: 'Kırmızı ruj' }
  ],
  GOZ_RENK: [
    { id: 'kahve', ad: 'Kahve', renk: '#5a3420' }, { id: 'ela', ad: 'Ela', renk: '#8a6a2a' }, { id: 'yesil', ad: 'Yeşil', renk: '#3f8a4f' },
    { id: 'mavi', ad: 'Mavi', renk: '#3f7cc4' }, { id: 'gri', ad: 'Gri', renk: '#8593a3' }, { id: 'siyah', ad: 'Siyah', renk: '#1a1210' }
  ],
  AKSESUAR: [
    { id: 'yok', ad: 'Yok' }, { id: 'kolye', ad: 'Kolye' }, { id: 'kupe', ad: 'Küpe' }, { id: 'bere', ad: 'Bere' }
  ],
  /* Kazancı etkileyen iki seçimden biri. Hepsi eşit güçte; günün trendi eşit olasılıkla birini öne çıkarır. */
  TARZ: [
    { id: 'tatli', ad: 'Tatlı', acik: 'Herkesin kankası. Bahşişi "sen çok iyisin" diye atarlar.' },
    { id: 'gizemli', ad: 'Gizemli', acik: 'Az konuşur, çok bakar. İzleyici ne olduğunu çözmeye çalışır.' },
    { id: 'entel', ad: 'Entel', acik: 'Arkada kitaplık, ağızda Dostoyevski. Okumadı ama biliyor.' },
    { id: 'sporcu', ad: 'Sporcu', acik: 'Yayından önce şınav, yayın sırasında protein.' },
    { id: 'komik', ad: 'Komik', acik: 'İzleyici gülmeye gelir, bahşiş bırakır.' }
  ],
  YAS_GRUBU: [
    { id: 'genc', ad: 'Genç', min: 18, max: 24 },
    { id: 'yetiskin', ad: 'Yetişkin', min: 25, max: 34 },
    { id: 'olgun', ad: 'Olgun', min: 35, max: 60 }
  ],
  GECMIS: [
    { id: 'plaza', ad: 'İşten çıkarılan plaza çalışanı', acik: 'Tazminat bitti, takım elbise kaldı.', esya: 'sik' },
    { id: 'kpss', ad: "KPSS'ye 4. kez giren mezun", acik: 'Kitaplar hâlâ masada. En azından dekor oluyor.', esya: 'tarz' },
    { id: 'ogrenci', ad: 'Kirası %80 artan öğrenci', acik: 'Yurttan çıktın, odanı süsledin.', esya: 'led' },
    { id: 'fon', ad: 'Fon mağduru', acik: 'Ana para fonda. Elde kalan son birikimle bir tripod aldın.', esya: 'tripod' }
  ],
  BASLANGIC_PARA: 6000,

  /* ---------- yayın ---------- */
  /* tema.gerek: kıyafet etiketi ya da eşya. Eksikse bahşiş düşer. */
  TEMALAR: [
    { id: 'sohbet', ad: 'Sohbet gecesi', acik: 'Dertleş, gündemi konuş, biraz da cilveleş.', agirlik: { konus: 4, opucuk: 2, tesekkur: 1, poz: 1, ozel: 0.6, dans: 1 } },
    { id: 'dans', ad: 'Dans gecesi 🔥', acik: 'Trend dansları, göbek dansı, ne gelirse.', agirlik: { dans: 4, ozel: 2, poz: 1.5, opucuk: 1, konus: 1, tesekkur: 1 } },
    { id: 'ozelgece', ad: 'Gece yarısı özel', acik: 'Işıklar kısık, istekler cesur. Cesur kıyafet ister.', gerek: 'cesur', agirlik: { ozel: 4, poz: 2, opucuk: 2, dans: 1, konus: 1, tesekkur: 1 } },
    { id: 'havuz', ad: 'Havuz başı (balkon)', acik: 'Şişme havuz, balkon, bikini ya da mayo şart.', gerek: 'havuz', agirlik: { poz: 3, dans: 2, ozel: 1.5, opucuk: 1, konus: 1, tesekkur: 1 } },
    { id: 'fitness', ad: 'Fitness gecesi', acik: 'Esneme, mekik, "formda kal" sohbeti. Spor kıyafeti ister.', gerek: 'fitness', agirlik: { dans: 2, poz: 2.5, konus: 1.5, ozel: 1, opucuk: 0.6, tesekkur: 1 } },
    { id: 'asmr', ad: 'ASMR gecesi', acik: 'Fısılda. Mikrofon varsa tam verim.', gerek: 'mikrofon', agirlik: { konus: 4, opucuk: 2, tesekkur: 1, poz: 1, ozel: 1, dans: 0.4 } }
  ],
  /* cesaret: 0 gündelik, 1 iddialı, 2 cesur, 3 iç giyim, 4 en cüretkâr. Bahşişi artırır, riski de. */
  KIYAFETLER: [
    { id: 'tisort', ad: 'Tişört + kot', cesaret: 0, etiket: [] },
    { id: 'esofman', ad: 'Eşofman', cesaret: 0, etiket: [] },
    { id: 'atlet', ad: 'Atlet + şort', cesaret: 1, etiket: ['fitness'] },
    { id: 'croptop', ad: 'Crop top + kot şort', cesaret: 1, etiket: [] },
    { id: 'forma', ad: 'Forma + şort', cesaret: 0, etiket: ['kostum'] },
    { id: 'sik', ad: 'Şık gömlek', cesaret: 0, etiket: ['kostum'] },
    { id: 'fitness', ad: 'Spor sütyeni + tayt', cesaret: 1, etiket: ['fitness'] },
    { id: 'acikgomlek', ad: 'Açık saten gömlek', cesaret: 2, etiket: ['cesur'] },
    { id: 'mini', ad: 'Dekolteli body + mini etek + file çorap', cesaret: 2, etiket: ['cesur'] },
    { id: 'gece', ad: 'Straplez gece elbisesi', cesaret: 2, etiket: ['cesur'] },
    { id: 'mayo', ad: 'Mayo şort', cesaret: 2, etiket: ['havuz'] },
    { id: 'bikini', ad: 'Üçgen bikini', cesaret: 2, etiket: ['havuz', 'cesur'] },
    { id: 'leopar', ad: 'Leopar bikini', cesaret: 2, etiket: ['havuz', 'cesur'] },
    { id: 'tekparca', ad: 'Derin V mayo', cesaret: 2, etiket: ['havuz', 'cesur'] },
    { id: 'slip', ad: 'Slip mayo', cesaret: 2, etiket: ['havuz', 'cesur'] },
    { id: 'lateks', ad: 'Lateks tulum', cesaret: 2, etiket: ['cesur', 'kostum'] },
    { id: 'boxer', ad: 'Boxer + spor sütyeni', cesaret: 3, etiket: ['cesur'] },
    { id: 'ictakim', ad: 'Saten iç çamaşırı takımı', cesaret: 3, etiket: ['cesur'] },
    { id: 'jartiyer', ad: 'Jartiyerli dantel takım + çorap', cesaret: 4, etiket: ['cesur'] },
    { id: 'filebody', ad: 'File body + çizme', cesaret: 4, etiket: ['cesur'] },
    { id: 'gecelik', ad: 'Saten gecelik', cesaret: 3, etiket: ['cesur'] },
    { id: 'dantel', ad: 'Dantel iç çamaşırı + file çorap', cesaret: 3, etiket: ['cesur'] },
    { id: 'havlu', ad: 'Sadece havlu (duştan yeni çıktım)', cesaret: 3, etiket: ['cesur', 'havuz'] },
    { id: 'gomlek', ad: 'Sadece bol gömlek', cesaret: 2, etiket: ['cesur'] },
    { id: 'korse', ad: 'Deri korse + mini etek', cesaret: 3, etiket: ['cesur'] }
  ],
  /* ---------- içerik çekimi (kilitli içerik) ---------- */
  CEKIM_SET: [
    { id: 'ayna', ad: 'Ayna karşısı', acik: 'Klasik. Telefon elde, yandan açı.', bonus: 0 },
    { id: 'yatak', ad: 'Yatak başı', acik: 'Saten çarşaf, alçak açı. Abonelerin favorisi.', bonus: 0.08 },
    { id: 'mum', ad: 'Mum ışığı', acik: 'Loş, yakın plan. "Bu gece sadece sen ve ben" havası.', bonus: 0.1 },
    { id: 'neon', ad: 'Neon altında', acik: 'Pembe ışık, gece kulübü havası.', bonus: 0.05 }
  ],
  CEKIM_POZ: [
    { id: 'poz', ad: 'Poz' }, { id: 'opucuk', ad: 'Öpücük' }, { id: 'ozel', ad: 'Dans karesi' }, { id: 'sergile', ad: 'Bel kırma' }
  ],
  ALTYAZI: ['Kilidi açan bilir 😏', 'Bu gece sadece sen ve ben 🕯️', 'Yayında gösteremediğim kare 🙈', 'Yatağın sol tarafı boş 🥀',
    'Duştan yeni çıktım… 🚿', 'Sadece abonelere 🔒', 'Bunu annem görmesin 🤫', 'Saat 02.00 kafası 🌙', 'Özel isteğiniz üzerine 💋'],
  /* ---------- DM: istekler, özel siparişler, flört, tacizciler ---------- */
  DM_ISTEK: [
    { t: 'Bugünkü yayından sonra uyuyamadım. Kilitli bir şey var mı? 👀', ces: 1, teklif: [5, 12] },
    { t: 'Gecelikli bir fotoğrafın var mı… sadece bakmak için 🥺', ces: 3, teklif: [15, 30] },
    { t: 'Havluyla bir kare? Duştan yeni çıkmış gibi 😳', ces: 3, teklif: [12, 26] },
    { t: 'Dantelli olanlardan bir set? Fiyat sorun değil (sorun)', ces: 3, teklif: [20, 45] },
    { t: 'Mum ışığında bir fotoğraf… sadece benim için.', ces: 2, set: 'mum', teklif: [12, 28] },
    { t: 'Fitness kıyafetiyle bir kare, motivasyon için 💪 (motivasyon değil)', ces: 1, teklif: [6, 14] },
    { t: 'Eşim uyuyor, sessiz bir şey at 🤫', ces: 2, teklif: [10, 22] },
    { t: 'Bikinili? Yaz bitti ama ben bitmedim ☀️', ces: 2, teklif: [9, 20] },
    { t: 'Yatakta çekilmiş bir şey var mı? Saten çarşaflı olan 🔥', ces: 2, set: 'yatak', teklif: [12, 30] },
    { t: 'Sadece gömlekle bir sabah karesi… kahve benden ☕', ces: 2, teklif: [10, 24] },
    { t: 'Leopar bikinili olanı gördüm tanıtımda. Kilidini açayım, sen de bana daha yakından bir tane çek 🐆', ces: 2, teklif: [12, 26] },
    { t: 'Jartiyer. Tek kelime. Fiyatı sen söyle.', ces: 4, teklif: [35, 70] },
    { t: 'File body ile ayna karşısında bir kare… dün gece rüyamdaydı aynen o 😵', ces: 4, set: 'ayna', teklif: [30, 60] },
    { t: 'Saten takımla yatakta, telefonu tutarken bir selfie? Uyumadan önce bakacağım 🌙', ces: 3, set: 'yatak', teklif: [18, 38] },
    { t: 'Yayında askın düştü, bir saniye. Ondan bir kare kaldı mı 😳', ces: 3, teklif: [15, 32] },
    { t: 'Neon altında iç çamaşırıyla. Pembe ışık. Başka bir şey istemiyorum.', ces: 3, set: 'neon', teklif: [20, 42] },
    { t: 'Abone oldum, VIP de oldum, şimdi sıra sende 😏 cesur bir şey', ces: 3, teklif: [16, 34] },
    { t: 'Mayolu bir tane… havuz yok biliyorum, küvet de olur 🛁', ces: 2, teklif: [9, 18] }
  ],
  DM_OZEL: [
    { t: 'Adımı kâğıda yazıp tut, öyle bir fotoğraf. Sadece benim. $40 veririm.', ces: 1, teklif: 40 },
    { t: 'Doğum günüm 🎂 Sadece bana özel, mum ışığında bir kare? $60', ces: 2, set: 'mum', teklif: 60 },
    { t: 'Kırmızı elbiseyle, yatak başında. Kimseye gösterme. $80', ces: 2, set: 'yatak', teklif: 80 },
    { t: 'Dantelli, neon altında, adımı söyleyen bir kare. $120. Ciddiyim.', ces: 3, set: 'neon', teklif: 120 },
    { t: 'Jartiyerli takım, mum ışığı, kameraya omzunun üstünden bak. Sadece ben. $180.', ces: 4, set: 'mum', teklif: 180 },
    { t: 'Ayna karşısında file body. Telefonun ekranında benim adım yazsın. $150, peşin.', ces: 4, set: 'ayna', teklif: 150 },
    { t: 'Evliyim, karım bilmeyecek. Saten takımla yatakta, iyi geceler de. $95', ces: 3, set: 'yatak', teklif: 95 }
  ],
  DM_FLORT: ['Bu gece rüyamdaydın. Kötü bir şey yoktu (vardı) 😇', 'Gülüşün beni bitiriyor', 'Bir kahveye ne dersin? Sadece kahve. Kahve.',
    'Uyuyamıyorum, senin yüzünden 🌙', 'O kombin hâlâ aklımda 🔥', 'Bugün sesini duymadan uyuyamam', 'Bana bir sesli mesaj at, bahşişi ben bilirim',
    'Dün gece o ruj… sabaha kadar düşündüm 💋', 'Yayında bana baktığını hissettim. Baktın mı? Söyle baktın', 'Telefonun kilit ekranı sensin, sorun olur mu 🙈',
    'Şu an yataktayım ve aklımda sadece o dans var', 'İtiraf: bütün yayınları kaydediyorum. Kötü bir şey için değil (iyi bir şey için de değil)',
    'Bir gece sadece benim için yayın açsan ne istersin? Fiyat değil, gerçekten', 'Sesini duymak istiyorum, fısıltıyla. Tek kelime yeter.'],
  DM_SAPIK: [
    { t: 'Önce bedava at, beğenirsem öderim 😏', tur: 'bedava' },
    { t: 'Gerçek adın ne? Hangi semttesin? Tanışalım.', tur: 'ifsa' },
    { t: 'Ekran görüntülerin bende. $200 atmazsan ailene gönderirim.', tur: 'santaj' },
    { t: 'Abone olmayacağım ama bir tane at, sonra belki 😏 herkes atıyor', tur: 'bedava' },
    { t: 'Sen benim komşumsun bence. Balkondaki çamaşırlar aynı. Kaçıncı kattasın?', tur: 'ifsa' },
    { t: 'Kuzenin benim arkadaşım. Seni tanıyorlar mı merak ediyorum 🙂 $150 konuşur muyuz', tur: 'santaj' },
    { t: 'Fotoğrafı yapay zekâyla açtım, ister misin görmek? Bedava bir tane daha at da karşılaştırayım', tur: 'bedava' }
  ],
  AILE: {
    dusuk: [['Annem', 'Günaydın 🌸 kahvaltı hazır, soğumadan gel'], ['Teyzem', '(İletildi) Bu mesajı 10 kişiye gönderin yoksa…'], ['Babam', 'Doğalgaz faturası geldi 💸 kimse kombiye dokunmasın'], ['Kardeşim', '😏']],
    orta: [['Annem', 'Gece 2\'de odanın ışığı yanıyordu. Ne yapıyorsun o saatte?'], ['Kardeşim', 'Odandan yine müzik geliyordu… 200 TL ve unuttum'], ['Teyzem', 'Kızım/oğlum seni internette gördüm galiba?? 🤔'], ['Babam', 'Kargo geldi, senin adına. Kutuda ne var?']],
    yuksek: [['Babam', 'Banka aradı. Hesabına yurt dışından para giriyormuş?'], ['Annem', 'Akşam hepimiz evdeyiz. Konuşacağız.'], ['Kardeşim', 'Kuzen Burak bir link attı gruba… sildim ama herkes gördü'], ['Teyzem', 'Komşu Saadet bir şeyler anlattı, inanmadım tabii 🙄']]
  },
  SAATLER: [
    { id: '21', ad: '21.00 · Akşam kuşağı', acik: 'Çok izleyici. Ev uyanık, annen kapıyı çalabilir.', izleyici: 1.2, bahsis: 1, anne: 2, yorgunluk: 0 },
    { id: '23', ad: '23.00 · Gece', acik: 'Dengeli.', izleyici: 1, bahsis: 1, anne: 1, yorgunluk: 0 },
    { id: '02', ad: '02.00 · Uykusuzlar', acik: 'Az ama cömert izleyici. Yarın yorgun uyanırsın.', izleyici: 0.75, bahsis: 1.45, anne: 0.3, yorgunluk: 15 }
  ],
  AKSIYONLAR: [
    { id: 'konus', ad: 'Sohbet', tus: '1', sure: 1.6, enerji: 3 },
    { id: 'dans', ad: 'Dans', tus: '2', sure: 2.4, enerji: 7 },
    { id: 'ozel', ad: 'Özel dans', tus: '3', sure: 2.8, enerji: 8 },
    { id: 'opucuk', ad: 'Öpücük', tus: '4', sure: 1.3, enerji: 2 },
    { id: 'poz', ad: 'Poz', tus: '5', sure: 1.5, enerji: 3 },
    { id: 'tesekkur', ad: 'Teşekkür', tus: '6', sure: 1.4, enerji: 2 }
  ],
  ISTEK: {
    konus: ['{hitap} bugün nasıl geçti?', 'sizde kira ne kadar oldu?', 'sevgilin var mı? (soruyorum sadece)', 'ilk aşkını anlat 🙈',
      '690 liralık mercimek çorbası hakkında yorum?', 'bana hayat tavsiyesi ver', "Grok'a sordum bilmedi, sen söyle: aşk nedir?", 'en utandığın anı anlat'],
    konus_asmr: ['fısıldayarak vergi beyannamesi oku 🎧', 'kulağıma "iyi geceler" fısılda', 'fısıltıyla kira sözleşmesi oku', 'bana fısıltıyla "ana para gelecek" de'],
    dans: ['dans et dans 💃', 'o trend dansını yap', 'halay çek!', '90lar pop dansı lütfen', 'omuz dansı 🔥', 'aura farming dansı'],
    ozel: ['göbek dansı yap 🔥', 'yavaş yavaş dans et 👀', 'saçlarını savur', 'bu şarkıda bir özel dans?', 'kalçayla ritim tut 💃', 'sadece benim için dans et 🥺'],
    opucuk: ["Kayseri'ye öpücük gönder 💋", "Almanya'dan selamlar, bize de bir öpücük 🇩🇪", 'doğum günüm, bir öpücük 🎂', 'işyerindeyim, çaktırmadan öpücük', 'eşim yanımda, sessiz bir öpücük 🤫'],
    poz: ['kameraya göz kırp 😉', 'o ateşli pozu ver 🔥', 'aura farming yap', 'yandan poz lütfen', 'dudak büzme pozu 😗', 'kombini göster 👀'],
    kombin: ['kombin değiştir 👗', 'o elbiseyi giy', 'daha cesur bir şey giy', 'bikiniyi görelim', 'geceliği giy 🙏', 'başka kombin var mı'],
    tesekkur: ['ilk kez abone oldum 🥹', 'bahşiş attım, teşekkür bekliyorum', 'ana paramdan arttırdım, teşekkür et', '3 yayındır buradayım, bir teşekkür?']
  },
  /* bahşiş menüsü (jeton). Menüden gelen istekler önceden ödenir. 1 jeton = $0,05 */
  MENU: [
    { aks: 'opucuk', ad: 'Öpücük', jeton: 25 },
    { aks: 'konus', ad: 'İsmimi söyle / sohbet', jeton: 35 },
    { aks: 'poz', ad: 'Poz', jeton: 50 },
    { aks: 'dans', ad: 'Dans', jeton: 80 },
    { aks: 'ozel', ad: 'Özel dans', jeton: 180 },
    { aks: 'kombin', ad: 'Kombin değiştir', jeton: 350 }
  ],
  /* cesur kıyafet ya da tema varken arada gelen "özel istek"ler: Özel dans ile karşılanır, bahşiş 3 kat, ardından sansür gelir */
  CESUR_ISTEK: ['üstünü değiştir 👀', 'o geceliği giy lütfen 🙏', 'kameraya biraz yaklaş 😏', 'ışıkları kıs 🕯️', 'file çoraplar nerede 👀',
    'yatağın üstünde dans 😳', 'bir tur dön 💃', 'sadece 5 saniye, ciddiyim 🥺'],
  SANSUR: [
    { tip: 'etiket', metin: 'SANSÜR', sohbet: ['SANSÜR NE YAAA 😭', 'tam o an...', 'bahşişimi geri istiyorum (istemiyorum)'] },
    { tip: 'kedi', metin: 'Kedi kameranın önüne oturdu', sohbet: ['kedi bile utandı 😹', 'KEDİ ÇEKİL', 'kedi kıskanıyor'] },
    { tip: 'net', metin: 'Tam o an internet gitti', sohbet: ['ŞAKA MISIN', 'bant daraltması ahlak polisi çıktı', 'VPN VPN VPN'] },
    { tip: 'anne', metin: 'Kapıdan ses geldi', sohbet: ['ANNE GELİYOR 💀', 'kapıyı kilitle kapıyı', 'hayatımın en gergin 5 saniyesi'] }
  ],
  KULLANICI: ['Kayserili_Mehmet', 'muhasebeci_ilker', 'gececi_34', 'KPSSci_Elif', 'fonmagduru_77', 'plaza_ruhu', 'AnkaraKedisi',
    'uykusuz_umut', 'emekli_hakan_58', 'tir_soforu_06', 'Hans_aus_Koeln', 'ChenWei_88', 'dubai_emlakci', 'sessiz_izleyici',
    'ibo_kombici', 'sigma_baris', 'aura_farmer_06', 'delulu_deniz', 'bitcoinci_cem', 'Tokatli_Ayhan', 'Rizeli_Kader', 'nobetci_eczaci'],
  SOHBET: {
    genel: ['selam {hitap} 👋', 'bu ışıkta çok tehlikelisin 🔥', 'özel yayın ne zaman 👀', 'ben sadece dansa bakıyorum (yalan)',
      '{unvan} kalbim duracak', 'ekranı sildim yine buğulandı', 'annem ne izliyorsun dedi, belgesel dedim', 'o kombin bahşişi hak ediyor 💸',
      'ses kapalı izliyorum, işteyim 🤫', "DM'den özel paket var mı", 'kombin 10/10 🔥', 'evli değilim (evliyim)', 'nefesim kesildi (merdiven çıktım)', 'ilk defa geldim', 'keşfetten geldim', 'ses geliyor mu?', 'arkadaki çamaşırlar 💀', 'kedi nerede kedi',
      'işten yeni geldim', 'asgari ücretle abone oldum, değerini bil', "VPN'siz giremedim", "Grok'a sordum seni tanımıyor",
      'annem uyudu mu diye kontrol ettim 🤫', 'çay koydum geliyorum', '6-7', 'aura +100', 'delulu ama mutluyum', 'bu ışık ne {hitap}',
      'yayın kaçta bitiyor', '{unvan} 👑', 'yarın erken kalkacağım ama buradayım', 'ekran donuyor mu bende mi'],
    troll: ['bu ne ya ahlak kalmadı', 'ahlak bekçisi geldi 🚨 (bahşiş attı)', "bunu RTÜK'e şikâyet ediyorum (abone oldum)", 'çalışsana, iş mi bu', 'KRİPTO SİNYAL İÇİN DM 🚀🚀', 'annene söyleyeceğim', 'İFŞA EDİYORUM (hiçbir şey bilmiyorum)', 'bunlar hep dış güçlerin oyunu'],
    bahsis: ['kombin parası 🔥', 'o dans için', 'gözlerine', 'kira katkısı', 'çorba parası', 'ana para gelince daha fazla', "KPSS'yi kazanınca bir daha", 'kur arttı, bahşiş değerlendi', 'sadece iyi hisset diye']
  },
  GUNDEM: {
    derbi: ['dünkü derbiden sonra moralim bozuk, beni neşelendir', 'forma giysene', 'derbi kaç bitti biri söylesin', 'hakem yine...'],
    siber: ['otomatik çeviri beni Çinliyle kavga ettirdi', 'Japonlar da girdi kavgaya 😂', 'ChenWei_88: Merhaba Türk arkadaş, savaş bitti mi?', 'siber dünya savaşından geldim'],
    anapara: ['ana param fonda, bahşişi gönülden atıyorum', 'ana para gelince büyük bahşiş söz 🤝', 'fon mağdurları burada mı'],
    corba: ['690 TL çorba içtim, bahşiş kalmadı', 'mercimek çorbası borsaya girsin'],
    tatil: ['29 Ekim tatili, sabaha kadar buradayım 🇹🇷', 'yarın yarım gün, uyumuyorum'],
    bant: ['görüntü dondu, bant daraltması mı', 'VPN açtım geldim']
  },
  TEHLIKE: {
    anne:   { metin: 'Kapı çalıyor: "Uyumadın mı hâlâ?"', buton: 'Kapıyı tut', sure: 5, onlem: 'kilit' },
    net:    { metin: 'Bağlantı zayıf. Bant daraltması!', buton: 'VPN aç', sure: 6, azalt: 'modem' },
    sarj:   { metin: 'Şarj %8. Telefon kapanmak üzere!', buton: 'Şarjı tak', sure: 6, onlem: 'powerbank' },
    troll:  { metin: 'Bir troll sohbeti kirletiyor.', buton: 'Banla', sure: 7 },
    kedi:   { metin: 'Kedi kameraya yürüdü.', buton: 'Kediyi göster', sure: 6, secmeli: true },
    matkap: { metin: 'Komşu matkaba başladı.', buton: 'Müziği aç', sure: 6 },
    isik:   { metin: 'Lamba titriyor, görüntü karanlık.', buton: 'Lambayı düzelt', sure: 5, onlem: 'ringlight' },
    tripod: { metin: 'Telefon kayıyor!', buton: 'Telefonu tut', sure: 4, onlem: 'tripod' }
  },

  /* ---------- yayın sonrası X paylaşımı ---------- */
  TWEET: {
    link: { metin: 'Bugünkü yayın {sifat}. Kaçıranlar için link bio\'da 🔗', etki: { takipciKat: 1.5, yarin: 0.15, risk: 3 } },
    anne: { metin: 'Annem yayına girdi. Hayatım bitti ama izlenme rekoru kırdım 💀', etki: { takipciKat: 3, yarin: 0.3, aile: 10, viral: 0.5 } },
    tesekkur: { metin: '{bahsisci} 3 yayındır ilk bahşişçi. Sen bir efsanesin 👑', etki: { takipciKat: 0.8, sadakat: 8 } },
    durust: { metin: 'İnsanlar beni yargılıyor ama kira %80 arttı, onu kimse yargılamıyor 🙂', etki: { takipciKat: 2.2, yarin: 0.2, risk: 6, aile: 5 } },
    cesur: { metin: 'Bu gece özel yayın var 🔥 Sadece cesur olanlar. Link bio\'da 🔗', etki: { takipciKat: 3.2, yarin: 0.45, risk: 9, aile: 6, viral: 0.35 } },
    kombin: { metin: 'Bugünkü kombin nasıl? 👀 (cevap vermeyen 7 yıl şanssız)', etki: { takipciKat: 2, yarin: 0.25, risk: 3 } },
    gundem: { metin: '{gundemTweet}', etki: { takipciKat: 2.5, yarin: 0.35, kumar: 0.4 } },
    hic: { metin: '', etki: { risk: -2 } }
  },
  GUNDEM_TWEET: {
    derbi: 'Derbi hakkında tek kelime etmeyeceğim. (Forma linki bio\'da)',
    anapara: 'Ana param fonda değil ama abonelerimin ana parası benim kalbimde 🤝',
    tatil: 'Herkes tatilde, ben mesaideyim. 29 Ekim akşamı özel yayın 🇹🇷',
    siber: 'Çinli abonelerim de var, savaşı ben bitirdim. Nobel bekliyorum.'
  },
  SIFAT: ['efsaneydi', 'kaostu', 'beklentinin üstündeydi', 'annemsiz geçti, mucize'],
  X_YANIT: {
    genel: [
      { n: 'DM Avcısı', h: '@dm_avcisi', t: "DM'ye bak {unvan}" },
      { n: 'Ahlak Bekçisi', h: '@AileDegerleriTR', t: 'Bu ahlaksızlığa dur denmeli. Gençlerimiz ne olacak?', v: true },
      { n: 'Ekonomist Dayı', h: '@ekonomist_dayi', t: 'Asgari ücret bu seviyedeyken insanlar ne yapsın. Sistem çökmüş.', v: true },
      { n: 'Sigma Koç', h: '@SigmaErkekKocu', t: 'Bu, toplumun çöküşüdür. (Abone olmadım, araştırma için baktım.)', v: true },
      { n: 'Meraklı Vatandaş', h: '@merakli_vatandas', t: 'Grok bu doğru mu? (erişim engeli var, kendim karar verdim: doğru)' },
      { n: 'Kapitalizm Eleştirisi', h: '@KapitalizmElestirisi', t: 'Bedenin metalaşması üzerine bir thread 🧵 1/34' },
      { n: 'Bot', h: '@user84736291', t: 'Harika içerik! Profilimdeki linke tıkla 💋' },
      { n: 'Plaza Ruhu', h: '@plaza_ruhu', t: 'Ben 9 saat Excel\'e bakıyorum, o 3 saatte benim aylığımı kazanıyor. Mesaj alındı.' },
      { n: 'Ratio', h: '@ratiokral', t: 'ratio + link bio\'da + annen haklı' },
      { n: 'Fon Mağduru', h: '@anapara_bekliyorum', t: 'Ana paramız fonda, gündem bu mu? (abone oldum bu arada)' }
    ],
    cesur: [
      { n: 'Ahlak Bekçisi', h: '@AileDegerleriTR', t: 'Böyle paylaşımlara dur denmeli! Saat kaçta demiştiniz?', v: true },
      { n: 'Sigma Koç', h: '@SigmaErkekKocu', t: 'Değer kaybı. (Bildirimleri açtım, araştırma için.)', v: true },
      { n: 'Fitness Dayı', h: '@fit_dayi_44', t: 'Form güzel. Antrenman programı atayım mı, DM 💪' },
      { n: 'Ekşi Botu', h: '@eksi_gundem', t: 'başlık açıldı: "özel dans yapan @{kullanici}" (14 entry)' },
      { n: 'Evli Hesap', h: '@mutlu_aile_babasi', t: 'Rezalet. (Bu yanıtı eşime göstermek için yazıyorum)' }
    ],
    kombin: [
      { n: 'Moda Polisi', h: '@kombin_polisi', t: 'File çorap + bot kombini 2014 Kadıköy. Yine de 9/10.' },
      { n: 'Teyze Hesap', h: '@nurten_59', t: 'Üşütme kızım/oğlum 🧣🌹' }
    ],
    anne: [
      { n: 'Anneler Birliği', h: '@annelerbirligi', t: 'Anne haklı. Saat kaç olmuş.' },
      { n: 'Gece 3', h: '@uyuyamayan', t: 'Annenin "uyumadın mı" sesi beni de uyandırdı 😭' }
    ],
    gundem: [
      { n: 'Taraftar', h: '@tribun_sesi', t: 'Gündeme atlamış, bunu da kullanıyor. Ama haklı.' },
      { n: 'Karşı Taraftar', h: '@ezeli_rakip', t: 'Aboneliğimi iptal ettim. (Etmedim)' }
    ]
  },

  /* ---------- gece: mesaj kutusu ---------- */
  DM: [
    { id: 'fatura', from: 'muhasebeci_ilker', t: 'Fatura kesebilir misiniz? Şirketten gider göstereceğim.',
      s: [{ l: 'Açıklamaya "danışmanlık" yazarım', fx: { para: 800, risk: 6 }, c: 'İlker: Harika, "stratejik danışmanlık" yazın lütfen.' },
          { l: 'Fatura yok, gönül var', fx: { sadakat: 3 }, c: 'İlker: Anlıyorum. Müdürüme ne diyeceğimi bilmiyorum ama.' }] },
    { id: 'taksit', from: 'fonmagduru_77', t: 'Ana param fonda kaldı. Aboneliği taksitle ödeyebilir miyim?',
      s: [{ l: 'Ana para gelince ödersin', fx: { sadakat: 6 }, c: '"Tam ana para yoksa abonelik de yok" diyeceksin sandım 🥹' },
          { l: 'Taksit yok kanka', fx: { para: 200, sadakat: -3 }, c: 'Peki. Kredi kartına 9 taksit yaptım. Bankaya selam.' }] },
    { id: 'kpss', from: 'KPSSci_Elif', t: 'Yarın deneme sınavım var. Motive edici bir şey yazar mısın?',
      s: [{ l: 'Paragraf sorusu gibi cevap ver', fx: { takipci: 40 }, c: 'Elif: "Yazarın asıl anlatmak istediği nedir?" 😭 Teşekkürler.' },
          { l: '"Uyu, ben de uyuyorum"', fx: { enerji: 5 }, c: 'Elif: Haklısın. İkimiz de uyumuyoruz ama.' }] },
    { id: 'chen', from: 'ChenWei_88', t: '(otomatik çeviri) Merhaba Türk arkadaş. Bayrak kavgası bitti mi? Ben barış için abone oldum.',
      s: [{ l: 'Barış! 🤝', fx: { takipci: 80 }, c: '(otomatik çeviri) Çok güzel. Annem de sizi sevdi. Annem kim?' },
          { l: '"Sen başlattın"', fx: { takipci: 150, risk: 4 }, c: 'Kavga X\'e taşındı. Arjantinliler de katıldı.' }] },
    { id: 'sigma', from: 'sigma_baris', t: 'Seni analiz ettim. Aura farming yapıyorsun ama sigma değilsin.',
      s: [{ l: '6-7', fx: { sadakat: 2 }, c: 'Barış: ... bu ne demek, kimse bilmiyor.' },
          { l: '"Abone olmuşsun ama Barış"', fx: { kanit: 1 }, c: 'Barış: Araştırma amaçlı. (Yıllık paket almış.)' }] },
    { id: 'ogretmen', from: 'eski_ogretmenin', t: 'Ben senin ilkokul öğretmeninim aslında. Kompozisyonların hep iyiydi.',
      s: [{ l: 'Engelle', fx: { risk: -2 }, c: 'Engellendi. İçin rahat değil ama.' },
          { l: '"Teşekkür ederim hocam 🙏"', fx: { aile: 8, sadakat: 4 }, c: 'Hocam: Annene selam söyle. (Söyleme.)' }] },
    { id: 'aile', from: 'Tokatli_Ayhan', t: 'Yanlışlıkla ekran görüntünü aile grubuna attım. Nasıl silinir??',
      s: [{ l: '"Herkesten sil\'e bas, HEMEN"', fx: { sadakat: 5 }, c: 'Silindi. Ama halası görmüş, "bu kim" diye soruyor.' },
          { l: '"Kendi problemin"', fx: { sadakat: -5, takipci: 30 }, c: 'Aile grubu sana abone oldu. 4 kişi.' }] },
    { id: 'ayak', from: 'ayak_sever_58', t: 'Sadece ayak fotoğrafı istiyorum. Başka bir şey değil. Muhasebeciyim, ciddiyim.',
      s: [{ l: 'Fiyatı ikiye katla', fx: { para: 900, risk: 3 }, c: 'Ödedi. Faturayı "kırtasiye gideri" diye kesti.' },
          { l: '"Kedimin patisini atayım mı?"', fx: { sadakat: 3, takipci: 20 }, c: 'Kabul etti. Kediye de abone oldu.' }] },
    { id: 'evli', from: 'sadik_koca_34', t: 'Sadece benim için dans et. Eşim yanımda uyuyor, sesi kıstım.',
      s: [{ l: '"Özel dans 500 TL"', fx: { para: 500, risk: 2 }, c: 'Ödedi. Bir saat sonra eşi de abone oldu, aynı karttan.' },
          { l: '"Eşine selam söyle"', fx: { sadakat: -2, kanit: 1 }, c: 'Engelledi. Profil fotoğrafı düğün fotoğrafıydı. Ekran görüntüsü aldın.' }] },
    { id: 'ahlakci', from: 'ailedeg_gizli42', t: 'Bu kıyafetle yayın yapmanız çok yanlış. Bir daha ne zaman giyeceksiniz? (sormak için soruyorum)',
      s: [{ l: '"Cuma 23.00"', fx: { para: 400, kanit: 1 }, c: 'Bildirimleri açtı. 400 TL "hayır duası" bahşişi geldi.' },
          { l: 'Ekran görüntüsü al', fx: { kanit: 1, risk: 2 }, c: '"Gerçek yüz" dosyasına bir sayfa daha eklendi.' }] },
    { id: 'kostum', from: 'cosplay_cem', t: 'Kedi kulağıyla dans eder misin? Kedim de izliyor, o da istiyor.',
      s: [{ l: '"Kediye özel dans"', fx: { para: 250, takipci: 30 }, c: 'Cem: Kedim mırladı. Bu bir onaydır.' },
          { l: '"Kedin abone olsun"', fx: { takipci: 15 }, c: 'Kedi abone oldu. Hesabın en sadık izleyicisi artık bir tekir.' }] },
    { id: 'sahte', from: 'user_0093', t: 'Yapay zekâyla senin fotoğrafını ürettim, bak 😏',
      s: [{ l: 'Engelle ve şikâyet et', fx: { risk: -3 }, c: 'Platform hesabı kapattı. Doğru hamle.' },
          { l: '"Avukatıma iletiyorum"', fx: { risk: -1 }, c: 'Avukatın yok ama blöf işe yaradı. Hesabını sildi.' }] }
  ],

  /* ---------- mağaza ---------- */
  MAGAZA: [
    { id: 'tripod', kat: 'Ekipman', ad: 'Tripod', fiyat: 1200, acik: 'Telefon artık kaymaz. Kitap yığınına veda.' },
    { id: 'ringlight', kat: 'Ekipman', ad: 'Ring light', fiyat: 3500, acik: 'Işık sorunu biter, izleyici +%10.' },
    { id: 'powerbank', kat: 'Ekipman', ad: 'Powerbank', fiyat: 900, acik: 'Şarj krizi kendiliğinden çözülür.' },
    { id: 'mikrofon', kat: 'Ekipman', ad: 'Mikrofon', fiyat: 2800, acik: 'ASMR gecelerinde tam verim.' },
    { id: 'modem', kat: 'Ekipman', ad: 'Yeni modem', fiyat: 2200, acik: 'Bağlantı sorunları yarıya iner.' },
    { id: 'led', kat: 'Oda', ad: 'LED şerit', fiyat: 1500, acik: 'İlgi daha yavaş düşer. Komşu teyze fark eder.' },
    { id: 'kilit', kat: 'Oda', ad: 'Kapı kilidi', fiyat: 600, acik: 'Annen kapıyı açamaz. Ama şüphelenir.' },
    { id: 'tarz_entel', kat: 'Oda', tarz: 'entel', ad: 'Kitaplık', fiyat: 1000, acik: 'Entel tarzında bahşiş +%15.' },
    { id: 'tarz_tatli', kat: 'Oda', tarz: 'tatli', ad: 'Dev peluş ayı', fiyat: 1000, acik: 'Tatlı tarzında bahşiş +%15.' },
    { id: 'tarz_gizemli', kat: 'Oda', tarz: 'gizemli', ad: 'Mor lav lambası', fiyat: 1000, acik: 'Gizemli tarzında bahşiş +%15.' },
    { id: 'tarz_sporcu', kat: 'Oda', tarz: 'sporcu', ad: 'Dambıl seti', fiyat: 1000, acik: 'Sporcu tarzında bahşiş +%15.' },
    { id: 'tarz_komik', kat: 'Oda', tarz: 'komik', ad: 'Lastik tavuk', fiyat: 1000, acik: 'Komik tarzında bahşiş +%15.' },
    { id: 'kedikulak', kat: 'Gardırop', ad: 'Kedi kulağı bandı', fiyat: 350, aksesuar: true, acik: 'Gece yarısı özelde bahşiş +%10.' },
    { id: 'croptop', kat: 'Gardırop', ad: 'Crop top + kot şort', fiyat: 900, kiyafet: true, acik: 'İddialı. Bahşiş +%8.' },
    { id: 'fitness', kat: 'Gardırop', ad: 'Spor sütyeni + tayt', fiyat: 1100, kiyafet: true, acik: 'Fitness gecesi için. Bahşiş +%8.' },
    { id: 'forma', kat: 'Gardırop', ad: 'Mahalle takımı forması', fiyat: 1200, kiyafet: true, acik: 'Derbi günleri için.' },
    { id: 'mayo', kat: 'Gardırop', ad: 'Mayo şort', fiyat: 700, kiyafet: true, acik: 'Havuz başı için. Cesur: bahşiş +%16, risk artar.' },
    { id: 'bikini', kat: 'Gardırop', ad: 'Üçgen bikini', fiyat: 1300, kiyafet: true, acik: 'Boyundan bağlamalı, mercan rengi. Havuz başı ve gece yarısı özel için. Bahşiş +%16, risk artar.' },
    { id: 'leopar', kat: 'Gardırop', ad: 'Leopar bikini', fiyat: 1600, kiyafet: true, acik: '"Vahşi taraf." Havuz başı ve özel gece. Bahşiş +%16, risk artar.' },
    { id: 'tekparca', kat: 'Gardırop', ad: 'Derin V mayo', fiyat: 1800, kiyafet: true, acik: 'Göbeğe inen V yaka, yüksek bacak kesimi. Bahşiş +%16, risk artar.' },
    { id: 'slip', kat: 'Gardırop', ad: 'Slip mayo', fiyat: 800, kiyafet: true, acik: 'Mavi, dar, kısa. Havuz başı için. Bahşiş +%16, risk artar.' },
    { id: 'lateks', kat: 'Gardırop', ad: 'Lateks tulum', fiyat: 3400, kiyafet: true, acik: 'Kapalı ama ayna gibi parlıyor. Kostüm istekleri de karşılar. Bahşiş +%16.' },
    { id: 'boxer', kat: 'Gardırop', ad: 'Boxer + spor sütyeni', fiyat: 1000, kiyafet: true, acik: '"Yeni uyandım" iç giyimi. Bahşiş +%24, risk çok artar.' },
    { id: 'ictakim', kat: 'Gardırop', ad: 'Saten iç çamaşırı takımı', fiyat: 2400, kiyafet: true, acik: 'Bordo saten, pudra biye. Bahşiş +%24, risk çok artar.' },
    { id: 'jartiyer', kat: 'Gardırop', ad: 'Jartiyerli dantel takım', fiyat: 4200, kiyafet: true, acik: 'Siyah dantel, jartiyer, opak çorap. En cüretkâr: bahşiş +%32, risk uçar.' },
    { id: 'filebody', kat: 'Gardırop', ad: 'File body + çizme', fiyat: 3800, kiyafet: true, acik: 'Boyundan bileğe file. En cüretkâr: bahşiş +%32, risk uçar.' },
    { id: 'yag', kat: 'Bakım', ad: 'Vücut parıltı yağı', fiyat: 1100, acik: 'Ten ışıkta parlar. Poz ve havuz isteklerinde bahşiş +%10.' },
    { id: 'acikgomlek', kat: 'Gardırop', ad: 'Açık saten gömlek', fiyat: 1400, kiyafet: true, acik: 'Düğmeler göbeğe kadar açık. Bahşiş +%16, risk artar.' },
    { id: 'mini', kat: 'Gardırop', ad: 'Dekolteli body + mini etek + file çorap', fiyat: 1900, kiyafet: true, acik: 'Gece yarısı özel için. Bahşiş +%16, risk artar.' },
    { id: 'gece', kat: 'Gardırop', ad: 'Straplez gece elbisesi', fiyat: 2600, kiyafet: true, acik: 'Kırmızı saten. Bahşiş +%16, risk artar.' },
    { id: 'gecelik', kat: 'Gardırop', ad: 'Saten gecelik', fiyat: 1700, kiyafet: true, acik: 'İç giyim. Bahşiş +%24. Annen görürse her şey biter.' },
    { id: 'dantel', kat: 'Gardırop', ad: 'Dantel iç çamaşırı + file çorap', fiyat: 2200, kiyafet: true, acik: 'İç giyim. Bahşiş +%24, risk çok artar.' },
    { id: 'gomlek', kat: 'Gardırop', ad: 'Sadece bol gömlek', fiyat: 900, kiyafet: true, acik: '"Sabah kahvesi" karesi. Bahşiş +%16.' },
    { id: 'havlu', kat: 'Gardırop', ad: 'Pamuklu havlu', fiyat: 400, kiyafet: true, acik: '"Duştan yeni çıktım." En cüretkâr ucuz eşya. Bahşiş +%24, risk çok artar.' },
    { id: 'korse', kat: 'Gardırop', ad: 'Deri korse + mini etek', fiyat: 2900, kiyafet: true, acik: 'Parlak deri. Bahşiş +%24, risk çok artar.' },
    { id: 'sik', kat: 'Gardırop', ad: 'Şık gömlek', fiyat: 2500, kiyafet: true, acik: 'Annen "nereye gidiyorsun" der.' },
    { id: 'enerji', kat: 'Tüketim', ad: 'Enerji içeceği (3\'lü)', fiyat: 150, stok: 3, acik: 'Yayında +35 enerji.' },
    { id: 'bulasik', kat: 'Hayat', ad: 'Annene bulaşık makinesi', fiyat: 18000, acik: 'Aile radarı −30. Ama "parayı nereden buldun?"', fx: { aile: -30, risk: 8 } },
    { id: 'altin', kat: 'Hayat', ad: 'Gram altın', fiyat: 4000, acik: 'Birikim. Risk +3.', fx: { risk: 3 }, birikir: true }
  ],

  /* ---------- hikâye ---------- */
  GUNLER: [
    { gundem: ['derbi', 'siber'],
      sabah: { from: 'Kuzen Deniz', t: 'DansKasa hesabını açtın mı? İlk yayında panik yapma, isteklere bak, doğru tuşa bas. Altın renkli "özel istek" gelirse Özel dans ile karşıla, bahşişi üç katı. Kapıyı da kilitle 😅' },
      gece: { from: 'Kardeşin', t: 'Odandan gece müzik sesi geliyordu. Ne yapıyorsun?',
        s: [{ l: '"Ders çalışıyorum, müzikli"', fx: { aile: 5 }, c: 'Kardeşin: "Sen hiç ders çalışmadın ki." Annene söylemedi. Henüz.' },
            { l: '"Sus, al sana 200 TL"', fx: { para: -200, aile: -5, bayrak: 'kardesHarclik' }, c: 'Kardeşin parayı aldı. "Haftaya yine konuşuruz" dedi.' }] } },
    { gundem: ['anapara', 'corba'],
      sabah: { from: 'Ev sahibi Nuri Bey', t: 'Önümüzdeki aydan itibaren kiraya %60 zam. Piyasa böyle, kusura bakma. Bu arada ev nasıl, her şey yolunda mı?' },
      ek: { from: 'Annen', t: 'Akşam teyzenler geliyor. Odanda ne yapıyorsan sessiz yap.', etki: { anneKat: 2 } },
      gece: { from: 'Apartman grubu · Komşu Saadet', t: '3 numaradan her gece ışıklar yanıp sönüyor, hayırdır?',
        s: [{ l: '"LED ışık teyze, oyun oynuyorum"', fx: { aile: 3 }, c: 'Saadet teyze: "Torunum da oynuyor, adı ne bu oyunun?"' },
            { l: '"Astroloji yayını yapıyorum"', fx: { takipci: 60, risk: 2 }, c: 'Saadet teyze abone olmak istiyor. Burcu sorulmadan söyledi: Akrep.' }] } },
    { gundem: ['tatil', 'bant'],
      sabah: { from: 'Kuzen Deniz', t: 'X\'te biri senin hakkında yazmaya başlamış: @AileDegerleriTR. Takma kafana. Ama paylaşımlarına dikkat.' },
      gece: { from: 'DansKasa', t: 'Yeni abone listende tanıdık bir hesap var: @ailedeg_gizli42. Profil fotoğrafı, @AileDegerleriTR ile aynı kedi.',
        s: [{ l: 'Ekran görüntüsü al, sakla', fx: { kanit: 1 }, c: '"Gerçek yüz" dosyası açıldı (1/3). Daha fazla kanıt lazım.' },
            { l: 'Görmezden gel', fx: { para: 300 }, c: 'Gece 03.12\'de 300 TL bahşiş geldi. Not: "Allah ıslah etsin."' }] } }
  ]
};
