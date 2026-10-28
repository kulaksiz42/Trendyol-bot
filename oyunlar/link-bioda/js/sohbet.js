/* Özel Dans — canlı yayın sohbet motoru.
   İzleyiciler kişiliklerle yazar (balina, sırnaşık, troll, pazarlıkçı, gizli muhafazakâr, yabancı, düzenli, bot)
   ve yayında olana tepki verir: hareket, kıyafet, bahşiş, sessizlik, olaylar, hedef çubuğu.
   Tüm kişiler kurmacadır. İma ve kabalık var; açık cinsel betimleme yok. */
'use strict';
window.Sohbet = (function () {
  let r = Math.random;
  const sec = a => a[Math.floor(r() * a.length)];
  const sans = p => r() < p;

  /* ---------- yazım tarzı ---------- */
  const ASCII = { 'ş': 's', 'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ö': 'o', 'ç': 'c', 'İ': 'I', 'Ş': 'S', 'Ğ': 'G', 'Ü': 'U', 'Ö': 'O', 'Ç': 'C' };
  const tr2ascii = t => t.replace(/[şığüöçİŞĞÜÖÇ]/g, c => ASCII[c]);
  function uzat(t) { return t.replace(/\b(çok|cok|of|ay|yaa|aman|oha|hadi|offf|ya)\b/gi, w => w + w.slice(-1).repeat(1 + Math.floor(r() * 4))); }
  function harfHatasi(t) {
    if (t.length < 8) return t;
    const i = 2 + Math.floor(r() * (t.length - 4));
    if (/\s/.test(t[i]) || /\s/.test(t[i + 1])) return t;
    return t.slice(0, i) + t[i + 1] + t[i] + t.slice(i + 2);
  }
  const STIL = {
    duz: t => t,
    kucuk: t => t.toLowerCase().replace(/[.!?]+$/, ''),
    ascii: t => tr2ascii(t.toLowerCase()),
    bagir: t => t.toUpperCase() + (sans(0.5) ? '!!!' : ''),
    hatali: t => harfHatasi(uzat(t.toLowerCase())),
    resmi: t => t.charAt(0).toUpperCase() + t.slice(1) + (/[.!?…)]$/.test(t) ? '' : '.')
  };

  /* ---------- kişilikler ---------- */
  // tur: balina, sirnasik, troll, pazarlik, muhafazakar, yabanci, duzenli, esprili, sessiz, yeni, kiskanc
  const KISI = [
    { ad: 'Kayserili_Mehmet', tur: 'duzenli', stil: 'hatali', rozet: 'VIP', renk: '#f5c451', comert: 0.5, emoji: ['💯', '👑', '🔥'] },
    { ad: 'gece_vardiyasi_44', tur: 'sirnasik', stil: 'kucuk', rozet: '3 ay', renk: '#ff7aa8', comert: 0.35, emoji: ['😍', '🥺', '❤️‍🔥'] },
    { ad: 'Emre.Holding', tur: 'balina', stil: 'resmi', rozet: 'VIP', renk: '#7ee0ff', comert: 0.95, emoji: ['🥂', '💎'] },
    { ad: 'dubai_emlakci', tur: 'balina', stil: 'duz', rozet: 'VIP', renk: '#7ee0ff', comert: 0.8, emoji: ['💸', '🏝️'] },
    { ad: 'sadik_koca_34', tur: 'sirnasik', stil: 'ascii', rozet: '1 ay', renk: '#ff9f5a', comert: 0.4, emoji: ['🤫', '😏'] },
    { ad: 'muhasebeci_ilker', tur: 'pazarlik', stil: 'resmi', rozet: '2 ay', renk: '#9ad38f', comert: 0.25, emoji: ['🧾'] },
    { ad: 'tir_soforu_06', tur: 'sirnasik', stil: 'ascii', rozet: null, renk: '#ffb26b', comert: 0.3, emoji: ['🚛', '😘'] },
    { ad: 'gercek_yuzler_44', tur: 'troll', stil: 'bagir', rozet: null, renk: '#ff6161', comert: 0, emoji: ['🤡'] },
    { ad: 'ahlak_polisi_06', tur: 'troll', stil: 'resmi', rozet: null, renk: '#ff6161', comert: 0.05, emoji: ['🚨'] },
    { ad: 'ailedeg_gizli42', tur: 'muhafazakar', stil: 'resmi', rozet: '1 ay', renk: '#c9b6ff', comert: 0.6, emoji: ['🤲'] },
    { ad: 'sigma_baris', tur: 'kiskanc', stil: 'kucuk', rozet: null, renk: '#b0b0b0', comert: 0.1, emoji: ['🗿', '🐺'] },
    { ad: 'Hans_aus_Koeln', tur: 'yabanci', dil: 'de', stil: 'duz', rozet: '2 ay', renk: '#8fb9ff', comert: 0.5, emoji: ['🇩🇪'] },
    { ad: 'ChenWei_88', tur: 'yabanci', dil: 'zh', stil: 'duz', rozet: null, renk: '#8fb9ff', comert: 0.3, emoji: ['🇨🇳'] },
    { ad: 'mike_from_ohio', tur: 'yabanci', dil: 'en', stil: 'kucuk', rozet: null, renk: '#8fb9ff', comert: 0.4, emoji: ['🇺🇸'] },
    { ad: 'delulu_deniz', tur: 'esprili', stil: 'kucuk', rozet: null, renk: '#d9b8ff', comert: 0.2, emoji: ['💀', '😭'] },
    { ad: 'uykusuz_umut', tur: 'esprili', stil: 'hatali', rozet: '1 ay', renk: '#d9b8ff', comert: 0.15, emoji: ['😵‍💫'] },
    { ad: 'aura_farmer_06', tur: 'esprili', stil: 'kucuk', rozet: null, renk: '#d9b8ff', comert: 0.1, emoji: ['🗿'] },
    { ad: 'sessiz_izleyici', tur: 'sessiz', stil: 'kucuk', rozet: '6 ay', renk: '#a99bb4', comert: 0.7, emoji: ['🤍'] },
    { ad: 'nobetci_eczaci', tur: 'duzenli', stil: 'duz', rozet: '4 ay', renk: '#f5c451', comert: 0.45, emoji: ['💊', '🌙'] },
    { ad: 'yeni_geldim_23', tur: 'yeni', stil: 'kucuk', rozet: null, renk: '#cfcfcf', comert: 0.2, emoji: ['👀'] },
    { ad: 'kesfetten_geldim', tur: 'yeni', stil: 'ascii', rozet: null, renk: '#cfcfcf', comert: 0.15, emoji: ['👀', '🙋'] },
    { ad: 'fonmagduru_77', tur: 'esprili', stil: 'duz', rozet: '2 ay', renk: '#d9b8ff', comert: 0.2, emoji: ['📉'] },
    { ad: 'Tokatli_Ayhan', tur: 'sirnasik', stil: 'hatali', rozet: null, renk: '#ff9f5a', comert: 0.3, emoji: ['🌹', '😘'] },
    { ad: 'evli_ama_mutsuz', tur: 'sirnasik', stil: 'kucuk', rozet: '1 ay', renk: '#ff7aa8', comert: 0.45, emoji: ['🥲'] },
    { ad: 'plaza_ruhu', tur: 'pazarlik', stil: 'kucuk', rozet: null, renk: '#9ad38f', comert: 0.2, emoji: ['📊'] },
    { ad: 'bitcoinci_cem', tur: 'pazarlik', stil: 'kucuk', rozet: null, renk: '#9ad38f', comert: 0.35, emoji: ['🚀'] },
    { ad: 'Rizeli_Kader', tur: 'duzenli', stil: 'hatali', rozet: '3 ay', renk: '#f5c451', comert: 0.4, emoji: ['🌊'] },
    { ad: 'kiskanc_burak', tur: 'kiskanc', stil: 'bagir', rozet: '1 ay', renk: '#b0b0b0', comert: 0.25, emoji: ['😤'] }
  ];
  const BOT = { ad: 'DansBot', tur: 'bot', stil: 'duz', rozet: 'BOT', renk: '#46d39a', comert: 0 };

  /* ---------- metinler ---------- */
  // {ad} yayıncı adı, {hitap} abla/abi/hocam, {unvan} kraliçe/kral, {kiyafet} kıyafet adı, {kisi} başka izleyici, {saat} saat
  const M = {
    acilis: ['bildirim geldi koştum', 'geldiiim', 'yayın başlamış ben duşta', 'ilk ben miyim', 'selam {hitap}', 'akşamın en güzel bildirimi',
      'işten çıktım direkt buraya', 'kaçırmadım dimi', 'bugün ne giydin bakalım 👀', 'ışıkları beğendim', 'hoş geldin {unvan}'],
    genel: ['selam {hitap}', 'bugün çok güzelsin', 'sesin geliyor mu bende mi sorun', 'yayın kalitesi iyi bugün', 'kaçta bitiyor', 'nereden yayın yapıyorsun',
      '{kisi} sen de mi buradasın 😂', 'çay koydum geldim', 'yarın iş var ama buradayım', 'bu şarkı ne', 'arka plandaki neon güzelmiş',
      'kombin bugün farklı', 'gözlerine bakıyorum sadece (yalan)', 'annem uyudu mu diye baktım', 'ses kapalı izliyorum işteyim',
      'bu ışık seni çok güzel gösteriyor', 'yorumlar bugün hızlı', 'her gece bu saatte buradayım artık', 'ekranı sildim yine buğulandı',
      'evli değilim (evliyim)', 'nefesim kesildi (merdiven çıktım)', '{kisi} sakin ol kanka', 'kalbim bunu kaldırmaz', 'bu yayın ilaç gibi'],
    sirnasik: ['sen benim her şeyimsin', 'bana bir kere bak lütfen', 'ismimi söyler misin 🥺', "DM'ime bakar mısın", 'seninle kahve içmek istiyorum (sadece kahve)',
      'senden başkasını izlemiyorum', 'bugün seni rüyamda gördüm', 'bir öpücük de bana', 'beni fark etmiyorsun', 'kocam olsan... şey yani',
      'sadece benim için dans etsen', 'sesini kaydedip uyuyorum', 'özel yayın ne zaman', 'yüzüne bakarken başka bir şey göremiyorum'],
    talep: ['daha fazlasını göster', 'kameraya yaklaş', 'bir tur dön', 'sırtını dön bi', 'ayaklarını göster', "DM'den özel at", 'ücretsiz bir tane ne olur',
      'şu askıyı indir', 'yatağa geç', 'ışıkları kıs', 'bacak bacak üstüne at', 'eğil bi kamerayı düzelt', 'göbek dansı yap şimdi'],
    kaba: ['çıkar şunu', 'bu kadar mı', 'paranı verdik oyalanma', 'sıkıcısın', 'açılmadan para yok', 'başka kanala geçiyorum', 'bedava göster',
      'senin işin bu, yap', 'daha cesur ol', 'bu kıyafet ne, eşofmanla mı'],
    troll: ['ahlak kalmadı bu ülkede', 'RTÜK nerede', 'annene söyleyeceğim', 'İFŞA EDİYORUM (hiçbir şey bilmiyorum)', 'kripto sinyal için DM 🚀',
      'bu ne rezillik', 'herkesi tek tek ekran görüntüsü alıyorum', 'yazık size'],
    pazarlik: ['menüdeki özel dans pahalı, indirim var mı', 'öğrenci indirimi var mı', '3 taksit olur mu', 'iki kişiyiz yarı fiyat yapar mısın',
      'jetonum az, borç verir misin', 'özel paketin fiyatı ne', 'kartım limitte, yarın atarım söz', 'fatura kesiyor musunuz'],
    muhafazakar: ['estağfurullah, ne bu kıyafet', 'tövbe tövbe (izlemeye devam)', 'gençlerimiz ne olacak', 'Allah ıslah etsin', 'yarın Cuma, bari bugün kapat (kapatma)',
      'bu kıyafetle olmaz… yarın yine bu saatte mi', 'ben sadece uyarmak için buradayım'],
    kiskanc: ['abartıyorsunuz millet', 'bu kadar para veriliyor mu buna', 'ben daha iyi dans ederim', 'hepiniz simpsiniz', 'alfa olan izlemez',
      'aura farming yapıyor bariz', 'ben sadece analiz için buradayım'],
    esprili: ['kira öder gibi bahşiş atıyorum', 'bu yayın benim terapim, terapist daha pahalı', 'ana param fonda ama kalbim burada', 'Grok bu doğru mu',
      'asgari ücret buraya gidiyor', 'kedi nerede kedi, asıl yıldız o', 'bu odanın kirası ne kadar', '6-7', 'dolar 43 oldu bahşiş değerlendi',
      'annem ne izliyorsun dedi belgesel dedim', 'eşimle aynı yayındayız, ikimiz de birbirimizden saklıyoruz'],
    sessiz: ['🤍', 'iyi geceler', '…', 'buradayım', 'güzel'],
    yeni: ['ilk kez geldim', 'keşfetten geldim, burası ne', 'bu platform ne', 'nasıl bahşiş atılıyor', 'abone olunca ne oluyor', 'merhaba herkese'],
    duzenli: ['dün de buradaydım 💯', 'her yayına geliyorum', 'dünkü dans aklımdan çıkmadı', 'eski yayınlar daha iyiydi (şaka)', 'en eski takipçin benim',
      'bugün geç kaldım pardon', 'hedefi bugün de tamamlarız', 'ailem sanıyor ki maç izliyorum'],
    // tepkiler
    dans: ['o hareket 🔥', 'tekrar tekrar', 'slow motion lazım', 'ritim tam yerinde', 'kalçalar ritim tutuyor', 'bunu döngüye aldım', 'kalbim ritme uydu',
      'bu dansı TikTok görmesin', 'dans hocası mısın', 'bitmesin'],
    ozel: ['İŞTE BU', 'menünün en iyi parası', 'ekran donmasın lütfen', 'nefesimi tuttum', 'yasaklı olmalı bu', 'bahşiş geliyor', 'kimse konuşmasın',
      'bu kadar yavaş olmak zorunda mı 😳', 'saçlar 🔥', 'göbek dansında bir numara'],
    opucuk: ['bana mıydı o 😳', 'kalbim gitti', 'yakaladım 💋', 'ekranı öptüm şu an', 'ben aldım o öpücüğü', 'bir tane daha'],
    poz: ['ekran görüntüsü aldım 📸', 'duvar kağıdı yaptım', 'o açı 🔥', 'poz kraliçesi', 'tam profil fotoğrafı', 'çerçeveletiyorum'],
    konus: ['sesin çok güzel', 'konuşsan da yeter', 'hikayeyi bitir', 'çok tatlı anlatıyorsun', 'ben de aynısını yaşadım'],
    tesekkur: ['rica ederim 🥹', 'senin için her şey', 'ismimi söyledi!!', 'gün güzelleşti'],
    sessizlik: ['uyudun mu', 'hadi bir şey yap', 'bu sessizlik ne', 'donma mı var', 'yayın mı dondu', 'parayı verdik oyalanma', 'sıkıldım', 'hadi ama'],
    bahsis_tepki: ['{kisi} zengin geldi', '{kisi} kral 👑', 'ben de atacaktım ama kira', 'bahşiş yağmuru', 'helal {kisi}', '{kisi} bu ay kirayı buraya yatırdı',
      'balina geldi 🐋', 'bende de para olsa'],
    hedef: ['hedefe az kaldı!!', 'hadi millet hedef', 'son {kalan} jeton', 'hedef dolsun bugün', 'tamamlarız merak etme'],
    kiyafet0: ['bugün eşofman mı 😐', 'kapalı paket bugün', 'rahat görünüyorsun ama…', 'bugün ders çalışma kıyafeti mi', 'kıyafet değiştir menüde var'],
    kiyafet1: ['kombin yakışmış', 'bu {kiyafet} sana çok yakışıyor', 'spor yapıyorsun belli', 'bugün iddialısın'],
    kiyafet2: ['bu {kiyafet} ne öyle 🔥🔥', 'yok artık', 'ekranı kim ısıttı', 'bu kombinle dışarı çıkılmaz', 'saten mi o', 'file çorap 😳'],
    kiyafet3: ['😳😳😳', 'kalbim', 'annen görmesin', 'bu yayın kaydediliyor mu', 'bugün özel gece belli', 'nefes alamıyorum', 'kapıyı kilitledin mi'],
    kiyafetDegisti: ['KOMBİN DEĞİŞTİ', 'bu daha iyi', 'eskisi daha iyiydi (yalan)', 'sansür neden ya', 'perde açıldı 🔥'],
    anne: ['ANNE 💀', 'teyze selam 👋', 'kapıyı kilitle demiştik', 'annen kıyafeti gördü mü', 'hayatımın en gergin 5 saniyesi'],
    kedi: ['KEDİİİ', 'asıl yıldız geldi', 'kedi bahşiş istiyor', 'kedi kıskanıyor'],
    hedefTamam: ['HEDEF TAMAM 🎉', 'başardıııık', 'şimdi ödül 👀', 'tarih yazdık'],
    // yabancılar (otomatik çeviri)
    de: ['(çeviri) Almanya\'dan selamlar, çok güzel dans', '(çeviri) Bahşiş attım, euro ile, kur iyi', '(çeviri) Türkçe öğreniyorum: "çok güzel"', 'wunderschön 😍'],
    en: ['u r so hot 🔥 (çevrilmedi)', 'turkish girls/boys hit different', 'where is the cat', '(çeviri) Ohio\'dan selam, burada saat sabah 7', 'tip menu pls'],
    zh: ['(çeviri) Merhaba Türk arkadaş, bayrak kavgası bitti, barış', '(çeviri) Güzel ay ışığı gibi dans', '(çeviri) Bahşiş göndermek için VPN açtım']
  };
  const BAHSIS_NOT = ['kira katkısı', 'gözlerine', 'o dans için', 'kombin parası 🔥', 'sadece iyi hisset', 'ana para gelince daha fazla', 'bugün maaş yattı',
    'eşim uyuyor 🤫', 'çorba parası', 'beni unutma', 'hedefe katkı', 'özel dans fonu', 'tövbe (50 jeton)'];
  const AYRILIS = ['başka yayına gidiyorum', 'bu kadar mı, gidiyorum', 'ilgi yok bana, bay', 'yarın gelirim belki'];

  /* ---------- durum ---------- */
  let D = null;
  function baslat(ayar) {
    r = ayar.rnd || Math.random;
    D = { ayar, son: {}, sonMetin: [], izleyenler: new Set() };
  }
  function kisiSec(turler) {
    const aday = KISI.filter(k => !turler || turler.includes(k.tur));
    return sec(aday.length ? aday : KISI);
  }
  function doldur(t, k) {
    const a = D.ayar;
    const deger = x => {
      switch (x) {
        case 'ad': return a.ad;
        case 'hitap': return a.hitap;
        case 'unvan': return a.unvan;
        case 'kiyafet': return (a.kiyafetAdi ? a.kiyafetAdi() : '').toLowerCase();
        case 'kisi': return '@' + sec(KISI.filter(z => z !== k)).ad;
        case 'kalan': return a.hedefKalan ? a.hedefKalan() : 'birkaç yüz';
        default: return null;
      }
    };
    return t.replace(/\{(\w+)\}/g, (m, x) => { const v = deger(x); return v != null ? v : m; });
  }
  function bicimle(k, t) {
    let s = (STIL[k.stil] || STIL.duz)(doldur(t, k));
    if (k.emoji && sans(0.45)) s += ' ' + sec(k.emoji) + (sans(0.25) ? sec(k.emoji) : '');
    return s;
  }
  function mesaj(k, havuzAdi, tur) {
    const havuz = M[havuzAdi]; if (!havuz) return null;
    let t = sec(havuz), dene = 0;
    while (D.sonMetin.includes(t) && dene++ < 6) t = sec(havuz);
    D.sonMetin.push(t); if (D.sonMetin.length > 24) D.sonMetin.shift();
    return { u: k.ad, renk: k.renk, rozet: k.rozet, t: bicimle(k, t), tur: tur || '' };
  }

  // Ortam sohbeti: kişiliğe göre havuz seç
  function ortam(C) {
    const k = kisiSec();
    D.izleyenler.add(k.ad);
    if (C.t < 15 && sans(0.6)) return mesaj(k, 'acilis');
    if (k.tur === 'yabanci') return mesaj(k, k.dil);
    if (C.sessiz > 7 && sans(0.55)) return mesaj(kisiSec(['sirnasik', 'troll', 'kiskanc', 'duzenli', 'pazarlik']), 'sessizlik', 'kaba');
    if (C.hedefOran > 0.75 && C.hedefOran < 1 && sans(0.18)) return mesaj(kisiSec(['duzenli', 'sirnasik', 'balina']), 'hedef');
    if (sans(0.16)) return mesaj(k, 'kiyafet' + Math.min(3, C.ces));
    const p = r();
    switch (k.tur) {
      case 'sirnasik': return p < 0.45 ? mesaj(k, 'sirnasik') : p < 0.75 ? mesaj(k, 'talep', 'talep') : mesaj(k, 'genel');
      case 'troll': return p < 0.6 ? mesaj(k, 'troll', 'troll') : mesaj(k, 'kaba', 'kaba');
      case 'pazarlik': return p < 0.6 ? mesaj(k, 'pazarlik') : mesaj(k, 'genel');
      case 'muhafazakar': return mesaj(k, 'muhafazakar');
      case 'kiskanc': return p < 0.6 ? mesaj(k, 'kiskanc') : mesaj(k, 'kaba', 'kaba');
      case 'esprili': return p < 0.65 ? mesaj(k, 'esprili') : mesaj(k, 'genel');
      case 'sessiz': return mesaj(k, 'sessiz');
      case 'yeni': return mesaj(k, 'yeni');
      case 'duzenli': return C.gun > 1 && p < 0.5 ? mesaj(k, 'duzenli') : mesaj(k, 'genel');
      case 'balina': return p < 0.5 ? mesaj(k, 'sirnasik') : mesaj(k, 'genel');
      default: return mesaj(k, 'genel');
    }
  }
  // Bir olaya 1-3 kişinin tepkisi
  function tepki(olay, adet) {
    const n = adet || 1 + Math.floor(r() * 2.5), out = [];
    for (let i = 0; i < n; i++) {
      const m = mesaj(kisiSec(olay === 'sessizlik' ? ['sirnasik', 'troll', 'kiskanc', 'pazarlik'] : null), olay, olay === 'sessizlik' ? 'kaba' : '');
      if (m) out.push(m);
    }
    return out;
  }
  // Bahşiş üreten kişi (cömertliğe göre)
  function bahsisci(buyuk) {
    const aday = KISI.filter(k => k.comert > (buyuk ? 0.75 : 0.15));
    let k = sec(aday);
    for (let i = 0; i < 3; i++) { const z = sec(aday); if (z.comert > k.comert) k = z; }
    return k;
  }
  function bahsisNotu(k) {
    if (k.tur === 'muhafazakar') return sec(['tövbe (bahşiş)', 'hayır duası', 'Allah ıslah etsin']);
    if (k.tur === 'yabanci') return sec(['from ' + (k.dil === 'de' ? 'Köln' : k.dil === 'en' ? 'Ohio' : 'Şanghay'), 'kur iyi']);
    return sec(BAHSIS_NOT);
  }
  function bot(t) { return { u: BOT.ad, renk: BOT.renk, rozet: BOT.rozet, t, tur: 'bot' }; }

  return { baslat, ortam, tepki, bahsisci, bahsisNotu, bot, kisi: ad => KISI.find(k => k.ad === ad), AYRILIS, KISI, mesaj: (k, h, t) => mesaj(k, h, t) };
})();
