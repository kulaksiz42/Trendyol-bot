/* Özel Dans — oyun mantığı ve ekranlar. */
'use strict';
(function () {
  const V = window.VERI;
  const $ = s => document.querySelector(s);
  const panel = $('#panel'), hud = $('#hud'), ust = $('#ust'), perde = $('#perde');
  const KAYIT = 'lbd-kayit-v1';

  /* ---------- yardımcılar ---------- */
  function tohumlu(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  let rnd = Math.random;
  const R = (a, b) => a + rnd() * (b - a);
  const sec = a => a[Math.floor(rnd() * a.length)];
  const karistir = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const agirlikliSec = ob => { const top = Object.values(ob).reduce((s, v) => s + v, 0); let r = rnd() * top; for (const [k, v] of Object.entries(ob)) { r -= v; if (r <= 0) return k; } return Object.keys(ob)[0]; };
  const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
  const tl = n => Math.round(n).toLocaleString('tr-TR') + ' TL';
  const usd = n => '$' + (Math.round(n * 100) / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sayi = n => Math.round(n).toLocaleString('tr-TR');
  const kisa = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + ' Mn' : n >= 1e4 ? Math.round(n / 1e3) + ' B' : n >= 1e3 ? (n / 1e3).toFixed(1).replace('.', ',') + ' B' : String(Math.round(n));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const bul = (liste, id) => liste.find(x => x.id === id);
  const AV_RENK = ['#ff4f8b', '#f5c451', '#46d39a', '#7aa8ff', '#c79bff', '#ff9f5a'];
  const avatar = ad => `<div class="av" style="background:${AV_RENK[[...ad].reduce((s, c) => s + c.charCodeAt(0), 0) % AV_RENK.length]}">${esc([...ad.replace(/^@/, '')][0].toUpperCase())}</div>`;
  const EMOJI = { konus: '💬', dans: '💃', ozel: '🔥', opucuk: '💋', poz: '📸', tesekkur: '🙏', kombin: '👗' };
  const GUN_ADI = ['Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar', 'Pazartesi'];
  const TARIH = gun => { const d = new Date(2026, 9, 26 + gun); return d.getDate() + ' ' + ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'][d.getMonth()]; };

  function bildir(metin, sure = 2600) {
    const el = document.createElement('div'); el.className = 'toast'; el.textContent = metin; (document.getElementById('telefon') || document.body).appendChild(el);
    setTimeout(() => el.remove(), sure);
  }

  /* ---------- kayıt ---------- */
  let S = null;
  function kaydet() { try { localStorage.setItem(KAYIT, JSON.stringify(S)); } catch (e) { } }
  function yukle() {
    try {
      const r = localStorage.getItem(KAYIT); const d = r ? JSON.parse(r) : null;
      if (!d || d.surum !== V.SURUM) return null;
      // eski kayıtlardaki artık olmayan görünüm seçeneklerini karşılıklarına çevir
      const k = d.karakter;
      if (k.siluet !== 'a' && k.siluet !== 'b') k.siluet = /erkek/.test(k.kimlik) ? 'b' : 'a';
      if (!V.SAC.some(x => x.id === k.sac)) k.sac = k.sac === 'kivircik' ? 'kisakesim' : 'uzun';
      if (k.sakal === 'biyik') k.sakal = 'tam';
      telefonAlanlari(d);
      return d;
    } catch (e) { return null; }
  }
  // telefon sürümüyle gelen alanlar (eski kayıtlar için de)
  function telefonAlanlari(d) {
    const v = { saat: '09:12', bildirim: [], okunmamis: {}, icerikler: [], dmler: [], aileM: [], aileSoru: null, xAkis: [], islemler: [], gunluk: { ppv: 0, dm: 0, tl: 0, cekim: 0, ppvSatis: 0 }, yayinBitti: false, xBugun: false, sizinti: null };
    for (const k in v) if (d[k] == null) d[k] = v[k];
    d.dmler.forEach(m => { m.yaziyor = 0; });
    return d;
  }
  function sil() { try { localStorage.removeItem(KAYIT); } catch (e) { } }

  function yeniDurum(k) {
    const d = {
      surum: V.SURUM, tohum: (Math.random() * 2 ** 31) | 0, gun: 1, para: V.BASLANGIC_PARA, kur: V.KUR_BASLANGIC,
      takipci: 140, abone: 12, enerji: 100, aile: 10, risk: 5, sadakat: 50, kanit: 0, yarin: 1, altin: 0,
      env: {}, stok: { enerji: 1 }, kiyafetler: ['tisort', 'esofman', 'atlet'], aksesuarlar: [],
      karakter: k, secim: null, bugun: null, bayrak: {}, kullanilanDM: [], gunler: [], toplamNet: 0, asama: 'ana'
    };
    telefonAlanlari(d);
    const g = k.gecmis;
    if (g === 'plaza') d.kiyafetler.push('sik');
    if (g === 'kpss') d.env['tarz_' + k.tarz] = true;
    if (g === 'ogrenci') d.env.led = true;
    if (g === 'fon') d.env.tripod = true;
    return d;
  }
  const K = () => S.karakter;
  const kimlik = () => bul(V.KIMLIK, K().kimlik) || V.KIMLIK[0];
  const yasGrubu = yas => (V.YAS_GRUBU.find(g => yas >= g.min && yas <= g.max) || V.YAS_GRUBU[1]).id;
  function sablon(t, ek = {}) {
    const kim = kimlik();
    return t.replace(/\{(\w+)\}/g, (m, k) => ek[k] != null ? ek[k] : k === 'hitap' ? kim.hitap : k === 'unvan' ? kim.unvan : k === 'kullanici' ? K().kullanici : m);
  }
  function gunTrend() {
    const r = tohumlu(S.tohum + S.gun * 7919);
    const s = a => a[Math.floor(r() * a.length)];
    return { yas: s(V.YAS_GRUBU).id, tarz: s(V.TARZ).id, tema: s(V.TEMALAR).id };
  }
  function gorunum() {
    const k = Object.assign({}, K());
    if (S.secim) { k.kiyafet = S.secim.kiyafet; k.kedikulak = !!S.secim.kedikulak; }
    k.parilti = S.env && S.env.yag ? 0.9 : 0.25;
    return k;
  }

  /* ---------- etkiler ---------- */
  function etkiUygula(fx) {
    if (!fx) return '';
    const c = [];
    const ekle = (d, ad, iyi, bicim) => { if (!d) return; c.push(`<span class="cip ${(d > 0) === iyi ? 'art' : 'eks'}">${ad} ${d > 0 ? '+' : '−'}${bicim ? bicim(Math.abs(d)) : Math.abs(d)}</span>`); };
    if (fx.para) { S.para += fx.para; ekle(fx.para, 'Kasa', true, tl); }
    if (fx.takipci) { S.takipci = Math.max(0, S.takipci + fx.takipci); ekle(fx.takipci, 'Takipçi', true, sayi); }
    if (fx.aile) { S.aile = clamp(S.aile + fx.aile); ekle(fx.aile, 'Aile radarı', false); }
    if (fx.risk) { S.risk = clamp(S.risk + fx.risk); ekle(fx.risk, 'Risk', false); }
    if (fx.sadakat) { S.sadakat = clamp(S.sadakat + fx.sadakat); ekle(fx.sadakat, 'Sadakat', true); }
    if (fx.enerji) { S.enerji = clamp(S.enerji + fx.enerji); ekle(fx.enerji, 'Enerji', true); }
    if (fx.kanit) { S.kanit += fx.kanit; c.push(`<span class="cip not">Gerçek yüz dosyası ${S.kanit}/3</span>`); }
    if (fx.bayrak) S.bayrak[fx.bayrak] = true;
    hudCiz();
    return c.length ? `<div class="cipler etki">${c.join('')}</div>` : '';
  }

  /* ---------- durum çubuğu ---------- */
  function hudCiz() {
    if (!S || document.body.dataset.ekran !== 'eski') { hud.hidden = true; return; }
    hud.hidden = false;
    hud.innerHTML = `<div class="hud-ust"><span class="gun">GÜN ${S.gun} · ${GUN_ADI[(S.gun - 1) % 7].toUpperCase()} ${TARIH(S.gun)}</span>
      <span class="para"><b>${tl(S.para)}</b></span><span><b>${sayi(S.takipci)}</b> tkp</span>
      <button class="ikon-btn" id="sesBtn" aria-label="Sesi aç/kapat">${Ses.acik ? 'Ses açık' : 'Ses kapalı'}</button></div>
      <div class="olcer">
        <div class="olc"><div><span>Enerji</span><b>${Math.round(S.enerji)}</b></div><div class="bar enerji"><i style="width:${S.enerji}%"></i></div></div>
        <div class="olc"><div><span>Aile radarı</span><b>${Math.round(S.aile)}</b></div><div class="bar aile"><i style="width:${S.aile}%"></i></div></div>
        <div class="olc"><div><span>Risk</span><b>${Math.round(S.risk)}</b></div><div class="bar risk"><i style="width:${S.risk}%"></i></div></div>
      </div>`;
    $('#sesBtn').onclick = () => { Ses.degistir(); hudCiz(); };
  }

  // ekran geçişleri: uygulama dokunulan simgeden büyüyerek açılır, ana ekrana dönüşte küçülür
  let sonEkran = null, sonDokunus = null, istenenGecis = null;
  document.addEventListener('pointerdown', e => { sonDokunus = { x: e.clientX, y: e.clientY }; }, true);
  function gecis(eski, yeni) {
    const yon = istenenGecis; istenenGecis = null;
    const kok = ekranIc && ekranIc.firstElementChild;
    if (!kok || !kok.animate || !eski || (eski === yeni && !yon)) return;
    try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) { }
    const tel = (telefonEl || document.body).getBoundingClientRect();
    const kolay = 'cubic-bezier(.2,.85,.25,1)';
    if (eski === 'ana' && yeni !== 'ana' && sonDokunus) {
      const o = `${sonDokunus.x - tel.left}px ${sonDokunus.y - tel.top}px`;
      kok.animate([{ transform: 'scale(.18)', opacity: 0, borderRadius: '40px', transformOrigin: o }, { transform: 'scale(1)', opacity: 1, borderRadius: '0px', transformOrigin: o }], { duration: 340, easing: kolay });
    } else if (yeni === 'ana') {
      kok.animate([{ transform: 'scale(1.06)', opacity: 0, filter: 'blur(6px)' }, { transform: 'none', opacity: 1, filter: 'none' }], { duration: 300, easing: kolay });
    } else if (yon === 'geri') {
      kok.animate([{ transform: 'translateX(-30%)', opacity: 0.2 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: kolay });
    } else {
      kok.animate([{ transform: 'translateX(34%)', opacity: 0.2 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: kolay });
    }
  }
  function ekran(ad, kamera) {
    const eski = sonEkran; sonEkran = ad;
    requestAnimationFrame(() => gecis(eski, ad));
    document.body.dataset.ekran = ad;
    ust.innerHTML = '';
    perde.hidden = true;
    if (window.Sahne && Sahne.hazir) {
      // 3D sahnenin görünmediği uygulamalarda çizimi durdur (pil)
      if (['ana', 'mesaj', 'x', 'aile', 'banka', 'kargo', 'ayar', 'icerik'].includes(ad)) Sahne.durdur(); else Sahne.devam();
      if (kamera) Sahne.kamera(kamera);
    }
    hudCiz(); durumCiz();
    if (ekranIc) ekranIc.scrollTop = 0; else window.scrollTo(0, 0);
  }

  /* ---------- giriş ---------- */
  function giris() {
    S = yukle();
    ekran('giris', 'oda');
    const demo = S ? S.karakter : { boy: 168, kilo: 60, siluet: 'a', ten: V.TEN[2], sac: 'uzun', sacRenk: V.SAC_RENK[4], sakal: 'yok', gozluk: 'yok', aksesuar: 'kupe', kiyafet: 'mini', yas: 26, makyaj: 'glam', goz: 'yesil' };
    if (Sahne.hazir) { Sahne.karakter(S ? gorunum() : demo); Sahne.oda(S ? S.env : { led: true }); Sahne.oynat('ozel', 4); }
    let onay = false; try { onay = localStorage.getItem('lbd-18') === '1'; } catch (e) { }
    panel.innerHTML = `
      <p class="etiket">Gece yayıncılığı simülatörü · 18+</p>
      <h1 class="logo"><span class="logo-im">${LOGO_DK}</span>Özel<br><span>Dans</span></h1>
      <p class="logo-alt">Geçim derdi seni DansKasa'ya itti. Işıkları kıs, kombini seç, özel istekleri karşıla. Ama tam o an hep bir şey olur: kedi, Wi-Fi ya da annen. Link bio'da 🔗</p>
      <label class="onay" for="onay18"><input type="checkbox" id="onay18" ${onay ? 'checked' : ''}><span>18 yaşından büyüğüm. Bu oyun yetişkin temalı, imalı ve kurmaca bir hicivdir; çıplaklık ve açık cinsel içerik yoktur.</span></label>
      ${S ? `<button class="btn" id="devamBtn">Devam et · Gün ${S.gun}, ${tl(S.para)}</button>` : ''}
      <button class="btn ${S ? 'ikincil' : ''}" id="yeniBtn">${S ? 'Yeni karakter' : 'Karakterini oluştur'}</button>
      <details><summary>Nasıl oynanır?</summary><ul>
        <li>Sabah yayının temasını, saatini ve kıyafetini seç.</li>
        <li>Yayında sohbetten gelen isteklere doğru hareketle cevap ver. Doğru hareket bahşiş getirir.</li>
        <li>Annenin kapıyı çalması, bant daraltması, şarj, troll, kedi gibi olaylara zamanında müdahale et.</li>
        <li>Yayından sonra X'te bir şey paylaş. Paylaşım ertesi günü değiştirir.</li>
        <li>Gece raporuna bak, mağazadan eşya al, uyu. Ertesi gün yeniden.</li>
      </ul></details>
      <p class="dipnot">Tüm kişiler, hesaplar ve platformlar kurmacadır. Bu sürüm ilk ${V.SON_GUN} günü içeren oynanabilir bir dilimdir.</p>`;
    const kutu = $('#onay18');
    const guncelle = () => { panel.querySelectorAll('.btn').forEach(b => b.disabled = !kutu.checked); try { localStorage.setItem('lbd-18', kutu.checked ? '1' : '0'); } catch (e) { } };
    kutu.onchange = guncelle; guncelle();
    if (S) $('#devamBtn').onclick = () => { Ses.hazirla(); devamEt(); };
    $('#yeniBtn').onclick = () => { Ses.hazirla(); karakterOlustur(); };
  }

  function devamEt() {
    const a = S.asama;
    if (a === 'rapor') return rapor();
    if (a === 'sonra' && S.bugun && !S.bugun.tweet) return yayinSonu();
    if (a === 'yayin') { S.yayinBitti = false; S.bugun = null; }
    ana();
  }

  /* ---------- karakter oluşturma ---------- */
  function karakterOlustur() {
    ekran('karakter', 'kabin');
    const k = {
      ad: '', kullanici: '', kimlik: 'kadin', yonelim: 'hetero', yas: 24, boy: 168, kilo: 62, siluet: 'a',
      ten: V.TEN[1], sac: 'uzun', sacRenk: V.SAC_RENK[1], sakal: 'yok', gozluk: 'yok', aksesuar: 'yok', makyaj: 'dogal', goz: 'kahve',
      tarz: 'tatli', gecmis: 'ogrenci', kiyafet: 'tisort'
    };
    let sekme = 'kimlik', bekleyen = 0;
    if (Sahne.hazir) Sahne.oda({});
    const ciz3d = () => { cancelAnimationFrame(bekleyen); bekleyen = requestAnimationFrame(() => Sahne.hazir && Sahne.karakter(k)); };
    const cipler = (alan, liste) => `<div class="cipler" role="group">${liste.map(x => `<button class="cip" data-alan="${alan}" data-deger="${x.id}" aria-pressed="${k[alan] === x.id}">${esc(x.ad)}</button>`).join('')}</div>`;
    const renkler = (alan, liste) => `<div class="renkler" role="group">${liste.map(r => `<button class="renk" data-alan="${alan}" data-deger="${r}" style="background:${r}" aria-pressed="${k[alan] === r}" aria-label="Renk ${r}"></button>`).join('')}</div>`;
    const kaydir = (alan, ad, min, max, birim) => `<div class="grup kaydir"><label for="k_${alan}">${ad}</label><b id="d_${alan}">${k[alan]} ${birim}</b><input type="range" id="k_${alan}" min="${min}" max="${max}" value="${k[alan]}" data-alan="${alan}" data-birim="${birim}"></div>`;
    function ciz() {
      const yg = bul(V.YAS_GRUBU, yasGrubu(k.yas));
      let ic = '';
      if (sekme === 'kimlik') ic = `
        <div class="grup"><label for="k_ad">Sahne adı</label><div class="metin"><input id="k_ad" maxlength="20" placeholder="Örn. Gece Kuşu" value="${esc(k.ad)}" autocomplete="off"></div></div>
        <div class="grup"><label for="k_kullanici">X kullanıcı adı</label><div class="metin"><span>@</span><input id="k_kullanici" maxlength="18" placeholder="gecekusu" value="${esc(k.kullanici)}" autocomplete="off" spellcheck="false"></div></div>
        <div class="grup"><span class="etiket">Kimlik</span>${cipler('kimlik', V.KIMLIK)}</div>
        <div class="grup"><span class="etiket">Yönelim</span>${cipler('yonelim', V.YONELIM)}</div>
        ${kaydir('yas', 'Yaş', 18, 60, '')}
        <p class="ipucu">Yaş grubun: <b>${yg.ad}</b>. Kimlik, yönelim ve görünüm kazancını etkilemez. Kazancı etkileyen yaş grubun ve tarzındır; her grup günün trendi olarak eşit sıklıkta öne çıkar.</p>`;
      else if (sekme === 'gorunum') ic = `
        ${kaydir('boy', 'Boy', 150, 200, 'cm')}${kaydir('kilo', 'Kilo', 45, 130, 'kg')}
        <div class="grup"><span class="etiket">Silüet</span>${cipler('siluet', V.SILUET)}</div>
        <div class="grup"><span class="etiket">Ten</span>${renkler('ten', V.TEN)}</div>
        <div class="grup"><span class="etiket">Saç</span>${cipler('sac', V.SAC)}</div>
        <div class="grup"><span class="etiket">Saç rengi</span>${renkler('sacRenk', V.SAC_RENK)}</div>
        <div class="grup"><span class="etiket">Makyaj</span>${cipler('makyaj', V.MAKYAJ)}</div>
        <div class="grup"><span class="etiket">Göz rengi</span><div class="cipler" role="group">${V.GOZ_RENK.map(g => `<button class="cip" data-alan="goz" data-deger="${g.id}" aria-pressed="${k.goz === g.id}"><i class="gnokta" style="background:${g.renk}"></i>${esc(g.ad)}</button>`).join('')}</div></div>
        <div class="grup"><span class="etiket">Sakal / bıyık</span>${cipler('sakal', V.SAKAL)}</div>
        <div class="grup"><span class="etiket">Gözlük</span>${cipler('gozluk', V.GOZLUK)}</div>
        <div class="grup"><span class="etiket">Aksesuar</span>${cipler('aksesuar', V.AKSESUAR)}</div>`;
      else ic = `
        <div class="grup"><span class="etiket">Yayın tarzı</span><div class="secenekler">${V.TARZ.map(t => `<button class="secenek" data-alan="tarz" data-deger="${t.id}" aria-pressed="${k.tarz === t.id}"><b>${t.ad}</b><span>${esc(t.acik)}</span></button>`).join('')}</div></div>
        <div class="grup"><span class="etiket">Geçmiş</span><div class="secenekler">${V.GECMIS.map(g => `<button class="secenek" data-alan="gecmis" data-deger="${g.id}" aria-pressed="${k.gecmis === g.id}"><b>${esc(g.ad)}</b><span>${esc(g.acik)}</span><span class="ek">Başlangıç eşyası: ${esc(gecmisEsya(g, k))}</span></button>`).join('')}</div></div>`;
      panel.innerHTML = `
        <h2 class="baslik">Karakterini oluştur</h2>
        <p class="alt">Sürükleyerek çevir. Herkes yetişkin. İma var, çıplaklık yok.</p>
        <div class="sekme" role="tablist">${[['kimlik', 'Kimlik'], ['gorunum', 'Görünüm'], ['hikaye', 'Tarz ve geçmiş']].map(([id, ad]) => `<button role="tab" data-sekme="${id}" aria-selected="${sekme === id}">${ad}</button>`).join('')}</div>
        ${ic}
        <div class="yapiskan satir"><button class="btn ikincil" id="rastgeleBtn">Rastgele</button><button class="btn" id="hazirBtn">Hazırım</button></div>`;
      panel.querySelectorAll('[data-sekme]').forEach(b => b.onclick = () => { sekme = b.dataset.sekme; ciz(); });
      panel.querySelectorAll('[data-alan][data-deger]').forEach(b => b.onclick = () => {
        k[b.dataset.alan] = b.dataset.deger; Ses.tik();
        if (b.dataset.alan === 'kimlik') varsayilanGorunum(k);
        ciz(); ciz3d(); if (Sahne.hazir) Sahne.oynat('sergile', 1.3);
      });
      panel.querySelectorAll('input[type=range]').forEach(r => r.oninput = () => {
        k[r.dataset.alan] = +r.value; $('#d_' + r.dataset.alan).textContent = r.value + ' ' + r.dataset.birim; ciz3d();
        if (r.dataset.alan === 'yas') { const p = panel.querySelector('.ipucu b'); if (p) p.textContent = bul(V.YAS_GRUBU, yasGrubu(k.yas)).ad; }
      });
      const ad = $('#k_ad'), ku = $('#k_kullanici');
      if (ad) ad.oninput = () => { k.ad = ad.value; };
      if (ku) ku.oninput = () => { k.kullanici = ku.value.replace(/[^\p{L}\p{N}_]/gu, ''); };
      $('#rastgeleBtn').onclick = () => { rastgeleKarakter(k); ciz(); ciz3d(); };
      $('#hazirBtn').onclick = () => {
        k.ad = (k.ad || '').trim() || 'Gece Kuşu';
        k.kullanici = (k.kullanici || '').replace(/[^\p{L}\p{N}_]/gu, '').slice(0, 18) || 'gecekusu' + Math.floor(Math.random() * 90 + 10);
        S = yeniDurum(Object.assign({}, k));
        Ses.basari(); gunBasla();
      };
    }
    ciz(); ciz3d();
  }
  function gecmisEsya(g, k) {
    if (g.esya === 'tarz') return (V.MAGAZA.find(m => m.tarz === k.tarz) || {}).ad || 'Tarz dekoru';
    return (bul(V.MAGAZA, g.esya) || {}).ad || '';
  }
  function varsayilanGorunum(k) {
    // kimlik seçimi sadece başlangıç görünümünü önerir; her şey sonradan değiştirilebilir
    const m = { kadin: ['uzun', 'yok', 'a', 'dogal'], erkek: ['kisa', 'kirli', 'b', 'yok'], transkadin: ['uzun', 'yok', 'a', 'pembe'], transerkek: ['kisa', 'tam', 'b', 'yok'], nonbinary: ['kisakesim', 'yok', 'a', 'smokey'] }[k.kimlik];
    if (m) { k.sac = m[0]; k.sakal = m[1]; k.siluet = m[2]; k.makyaj = m[3]; }
  }
  function rastgeleKarakter(k) {
    const r = Math.random, s = a => a[Math.floor(r() * a.length)];
    k.kimlik = s(V.KIMLIK).id; k.yonelim = s(V.YONELIM).id; k.yas = 18 + Math.floor(r() * 40);
    k.boy = 152 + Math.floor(r() * 42); k.kilo = 48 + Math.floor(r() * 60); k.siluet = s(V.SILUET).id;
    k.ten = s(V.TEN); k.sac = s(V.SAC).id; k.sacRenk = s(V.SAC_RENK); k.sakal = s(V.SAKAL).id; k.gozluk = s(V.GOZLUK).id;
    k.aksesuar = s(V.AKSESUAR).id; k.tarz = s(V.TARZ).id; k.gecmis = s(V.GECMIS).id;
    k.makyaj = s(V.MAKYAJ).id; k.goz = s(V.GOZ_RENK).id;
  }

  /* ---------- sabah ---------- */
  function yayinHazirlik() {
    S.asama = 'ana';
    ekran('sabah', 'oda');
    const trend = gunTrend();
    const gunV = V.GUNLER[S.gun - 1] || {};
    if (!S.secim) S.secim = { tema: 'sohbet', saat: '23', kiyafet: S.kiyafetler.includes('tisort') ? 'tisort' : S.kiyafetler[0], kedikulak: false };
    const kk = S.aksesuarlar.includes('kedikulak');
    if (Sahne.hazir) { Sahne.karakter(gorunum()); Sahne.oda(S.env); Sahne.oynat('bekle'); }
    const yasEs = yasGrubu(K().yas) === trend.yas, tarzEs = K().tarz === trend.tarz;
    const msj = [gunV.sabah, gunV.ek].filter(Boolean);
    function ciz() {
      const temaEs = S.secim.tema === trend.tema;
      const tahmin = tabanIzleyici(trend);
      panel.innerHTML = `
        ${dkBas('canli')}
        <div class="kart"><p class="etiket">Bugünün trendi</p>
          <div class="trend"><span class="cip ${yasEs ? 'es' : ''}">#${bul(V.YAS_GRUBU, trend.yas).ad.toLowerCase()}</span><span class="cip ${tarzEs ? 'es' : ''}">#${bul(V.TARZ, trend.tarz).ad.toLowerCase()}</span><span class="cip ${temaEs ? 'es' : ''}">${bul(V.TEMALAR, trend.tema).ad}</span></div>
          <p class="alt">${yasEs || tarzEs ? 'Trend seninle örtüşüyor. ' : 'Bugün trend senden yana değil. '}Yeşil olanlar izleyici getirir. Temayı sen seçersin.</p></div>
        <div class="grup"><span class="etiket">Yayın teması</span><div class="secenekler">${V.TEMALAR.map(t => { const eksik = temaEksik(t); return `<button class="secenek" data-tema="${t.id}" aria-pressed="${S.secim.tema === t.id}"><b>${t.ad}${t.id === trend.tema ? ' · trend' : ''}</b><span>${esc(t.acik)}</span>${eksik ? `<span class="ek">${eksik}</span>` : ''}</button>`; }).join('')}</div></div>
        <div class="grup"><span class="etiket">Yayın saati</span><div class="secenekler">${V.SAATLER.map(s => `<button class="secenek" data-saat="${s.id}" aria-pressed="${S.secim.saat === s.id}"><b>${s.ad}</b><span>${esc(s.acik)}</span></button>`).join('')}</div></div>
        <div class="grup"><span class="etiket">Kıyafet</span><div class="cipler">${S.kiyafetler.map(id => `<button class="cip" data-kiyafet="${id}" aria-pressed="${S.secim.kiyafet === id}">${kiyafetAdi(id)}</button>`).join('')}
          ${kk ? `<button class="cip" id="kkBtn" aria-pressed="${!!S.secim.kedikulak}">Kedi kulağı</button>` : ''}</div></div>
        <div class="kart"><div class="dokum">
          <div><span>Tahmini başlangıç izleyicisi</span><span>~${sayi(tahmin)}</span></div>
          <div><span>Enerji içeceği</span><span>${S.stok.enerji || 0} adet</span></div>
          ${S.gun === 1 ? '' : `<div><span>Dünkü paylaşımın etkisi</span><span>×${S.yarin.toFixed(2).replace('.', ',')}</span></div>`}
        </div></div>
        ${S.gun === 1 ? '<p class="ipucu">İlk yayın: sohbetten gelen istek kartlarındaki simgeye bak, aynı simgeli tuşa bas. Kırmızı uyarı çıkarsa üstündeki düğmeye bas.</p>' : ''}
        <div class="yapiskan"><button class="btn" id="basBtn">Yayına başla</button></div>`;
      panel.querySelectorAll('[data-tema]').forEach(b => b.onclick = () => { S.secim.tema = b.dataset.tema; Ses.tik(); ciz(); });
      panel.querySelectorAll('[data-saat]').forEach(b => b.onclick = () => { S.secim.saat = b.dataset.saat; Ses.tik(); ciz(); });
      panel.querySelectorAll('[data-kiyafet]').forEach(b => b.onclick = () => { S.secim.kiyafet = b.dataset.kiyafet; Ses.tik(); Sahne.karakter(gorunum()); Sahne.oynat('sergile', 1.2); ciz(); });
      const kb = $('#kkBtn'); if (kb) kb.onclick = () => { S.secim.kedikulak = !S.secim.kedikulak; Sahne.karakter(gorunum()); ciz(); };
      dkBagla();
      $('#basBtn').onclick = () => { kaydet(); yayin(); };
    }
    ciz();
  }
  const kiyafetBilgi = id => bul(V.KIYAFETLER, id) || { id, ad: id, cesaret: 0, etiket: [] };
  function kiyafetAdi(id) { const k = kiyafetBilgi(id); return k.ad + (k.cesaret ? ' ' + '🔥'.repeat(k.cesaret) : ''); }
  const cesaret = () => kiyafetBilgi(S.secim ? S.secim.kiyafet : 'tisort').cesaret;
  function temaEksik(t) {
    if (t.gerek === 'mikrofon' && !S.env.mikrofon) return 'Mikrofonun yok: bahşiş −%40';
    const ad = { cesur: 'Cesur bir kıyafetin', havuz: 'Bikini ya da mayon', fitness: 'Spor kıyafetin' }[t.gerek];
    if (ad && !kostumVar(t.gerek)) return ad + ' yok ya da giymedin: bahşiş −%40';
    return '';
  }
  function kostumVar(etiket) { return !!(S.secim && kiyafetBilgi(S.secim.kiyafet).etiket.includes(etiket)); }
  function tabanIzleyici(trend) {
    const saat = bul(V.SAATLER, S.secim.saat);
    const tk = 1 + (yasGrubu(K().yas) === trend.yas ? 0.35 : 0) + (K().tarz === trend.tarz ? 0.25 : 0) + (S.secim.tema === trend.tema ? 0.3 : 0);
    return (10 + S.takipci * 0.05 + S.abone * 0.5) * saat.izleyici * tk * (S.env.ringlight ? 1.1 : 1) * S.yarin;
  }

  /* ---------- canlı yayın ---------- */
  const JETON = 0.05; // 1 jeton = $0,05
  const jeton = n => sayi(n) + ' jeton';
  let Y = null;
  function yayin() {
    ekran('yayin', 'yayin');
    S.asama = 'yayin';
    const trend = gunTrend(), tema = bul(V.TEMALAR, S.secim.tema), saat = bul(V.SAATLER, S.secim.saat);
    const gunV = V.GUNLER[S.gun - 1] || {};
    const temaEs = S.secim.tema === trend.tema;
    Y = {
      t: 0, izl: 1, ilgi: 60, enerji: S.enerji, bahsis: 0, jeton: 0, abone: 0, istekler: [], sonraki: S.gun === 1 ? 3.5 : 2, sohbetT: 0.4, botT: 12,
      mesgul: 0, aktifAks: null, sonAks: null, sonAksT: -99, sonEylemT: 0, karsilanan: 0, kacan: 0, enYuksek: 0, bahsisciler: {},
      tehlike: null, plan: [], basarili: 0, basarisiz: 0, anneGirdi: false, karanlik: false, bitti: false, mola: false, sarjBitti: false,
      taban: tabanIzleyici(trend), saat, tema, temaEs, gundem: gunV.gundem || [], ilkIstek: S.gun === 1, yonlendirme: S.gun === 1 ? 'istek' : null,
      cesurSay: 0, iade: 0, balinaT: R(35, 70), balinaKac: 0, sonCiz: 0, sessizUyari: 0,
      hedef: { jeton: 500 + S.gun * 250, ad: sec(['Saç savurma maratonu', 'Kameraya yakın çekim', 'Gecelik gecesi 👀', 'Yatakta özel dans', '10 dakika ASMR']), tamam: false }
    };
    bahsisKatsayi();
    // tehlike planı (tohumlu): her günün olayları aynı tohumla aynıdır
    const ag = { anne: 2 * saat.anne * ((gunV.ek && gunV.ek.etki && gunV.ek.etki.anneKat) || 1), net: S.env.modem ? 0.5 : 1, sarj: 1, troll: 1.4, kedi: 1.2, matkap: 0.8, isik: S.env.ringlight ? 0.3 : 1, tripod: S.env.tripod ? 0.3 : 1 };
    const adet = S.gun === 1 ? 3 : 4;
    const zamanlar = Array.from({ length: adet }, (_, i) => 25 + i * ((V.YAYIN_SURE - 45) / adet) + R(0, (V.YAYIN_SURE - 45) / adet - 10));
    const secilen = [];
    for (let i = 0; i < adet; i++) { const a = Object.assign({}, ag); secilen.forEach(s => { if (s !== 'anne') delete a[s]; }); secilen.push(agirlikliSec(a)); }
    Y.plan = zamanlar.map((z, i) => ({ z, tip: secilen[i] }));
    const kim = kimlik();
    Sohbet.baslat({ rnd, ad: K().ad, hitap: kim.hitap, unvan: kim.unvan, kiyafetAdi: () => kiyafetBilgi(S.secim.kiyafet).ad, hedefKalan: () => sayi(Math.max(0, Y.hedef.jeton - Y.jeton)) });
    if (Sahne.hazir) { Sahne.karakter(gorunum()); Sahne.oda(S.env); Sahne.karart(0); Sahne.egil(0); Sahne.oynat('opucuk', 1.5); }

    ust.innerHTML = `
      <div class="profil"><div class="pav">${esc([...K().ad][0].toUpperCase())}</div><div class="pbil"><b>${esc(K().ad)} <span class="tik2">✓</span></b><span>@${esc(K().kullanici)} · DansKasa</span></div>
        <span class="rozet kirmizi"><span class="nokta"></span>CANLI</span></div>
      <div class="ust-sag"><span class="rozet" id="yIzl">👁 0</span><span class="rozet" id="ySaat">--:--</span></div>
      <div class="hedefk"><div class="hedef-ust"><span>🎯 ${esc(Y.hedef.ad)}</span><b id="yHedefS">0 / ${sayi(Y.hedef.jeton)}</b></div><div class="bar hedefbar"><i id="yHedef"></i></div></div>
      <button class="menu-btn" id="menuBtn" aria-label="Bahşiş menüsü">💸 Menü</button>
      <div class="istekler" id="yIstek" aria-live="polite"></div>
      <div class="sohbet" id="ySohbet"></div>
      <div class="ucan" id="yUcan"></div>
      <div class="tehlike" id="yTeh" hidden></div>
      ${Y.yonlendirme ? '<div class="yonlendir" id="yYon">İstek gelince aynı simgeli tuşa bas. 💸 jetonlu istekler önceden ödenmiştir.</div>' : ''}`;
    panel.innerHTML = `
      <div class="yayin-durum"><span class="para"><span id="yJeton">0</span><small> jeton</small><em id="yPara">$0,00</em></span>
        <div class="olc"><div><span>İlgi</span><b id="yIlgiS">60</b></div><div class="bar ilgi"><i id="yIlgi"></i></div></div>
        <div class="olc"><div><span>Enerji</span><b id="yEnS">0</b></div><div class="bar enerji"><i id="yEn"></i></div></div></div>
      <div class="aksiyonlar">${V.AKSIYONLAR.map(a => `<button class="aks" data-aks="${a.id}" aria-label="${a.ad} (${a.tus})"><kbd>${a.tus}</kbd><span class="em">${EMOJI[a.id]}</span><span class="ad">${a.ad}</span><i class="dolum"></i></button>`).join('')}</div>
      <div class="kucuk-sira dort"><button class="btn ikincil" id="kombinBtn" data-aks="kombin">👗 Kombin<i class="dolum"></i></button><button class="btn ikincil" id="icBtn">⚡ İçecek (${S.stok.enerji || 0})</button><button class="btn ikincil" id="molaBtn">Mola</button><button class="btn ikincil" id="bitirBtn">Bitir</button></div>`;
    panel.querySelectorAll('.aks[data-aks]').forEach(b => b.onclick = () => aksiyon(b.dataset.aks));
    $('#kombinBtn').onclick = kombin;
    $('#icBtn').onclick = ic;
    $('#molaBtn').onclick = mola;
    $('#menuBtn').onclick = menuGoster;
    $('#bitirBtn').onclick = () => onayla('Yayını şimdi bitirmek istiyor musun?', 'Bitir', () => bitir());
    document.onkeydown = e => {
      if (!Y || Y.bitti) return;
      if (e.key >= '1' && e.key <= '6') { aksiyon(V.AKSIYONLAR[+e.key - 1].id); e.preventDefault(); }
      else if (e.code === 'Space') { const b = document.querySelector('#yTeh:not([hidden]) .btn'); if (b) { b.click(); e.preventDefault(); } }
      else if (e.key === 'k' || e.key === 'K') kombin();
      else if (e.key === 'e' || e.key === 'E') ic();
      else if (e.key === 'Escape' || e.key === 'p') mola();
    };
    document.onvisibilitychange = () => { if (document.hidden && Y && !Y.bitti && !Y.mola) mola(); };
    sohbetMesaj(Sohbet.bot(`${K().ad} yayında 🔴 Bahşiş menüsü için 💸 Menü'ye dokun. Bugünkü hedef: ${Y.hedef.ad}`));
    let son = performance.now();
    const dongu = now => {
      if (!Y || Y.bitti) return;
      const dt = Math.min(0.1, (now - son) / 1000); son = now;
      if (!Y.mola) guncelle(dt);
      Y.raf = requestAnimationFrame(dongu);
    };
    Y.raf = requestAnimationFrame(dongu);
  }
  function bahsisKatsayi() {
    const tema = Y.tema;
    let temaK = 1;
    if (tema.gerek === 'mikrofon' && !S.env.mikrofon) temaK = 0.6;
    if (tema.gerek && tema.gerek !== 'mikrofon' && !kostumVar(tema.gerek)) temaK = 0.6;
    if (tema.id === 'ozelgece' && S.secim.kedikulak) temaK *= 1.1;
    Y.ces = cesaret(); Y.temaK = temaK;
    Y.bahsisK = Y.saat.bahsis * (S.env['tarz_' + K().tarz] ? 1.15 : 1) * (1 + Y.ces * 0.08) * temaK * (S.env.yag ? (tema.id === 'havuz' ? 1.1 : 1.04) : 1);
  }
  function menuGoster() {
    if (!Y || Y.bitti) return;
    Y.mola = true;
    perde.innerHTML = `<div class="kart"><p class="etiket">Bahşiş menüsü · ${esc(K().ad)}</p>
      <div class="dokum">${V.MENU.map(m => `<div><span>${EMOJI[m.aks] || '👗'} ${esc(m.ad)}</span><span>${jeton(m.jeton)}</span></div>`).join('')}</div>
      <p class="dipnot">İzleyiciler bu menüden jeton gönderip ister. Jeton önceden ödenir; istek süresinde yapılmazsa izleyici parasını geri ister. 1 jeton = $0,05.</p>
      <button class="btn" id="menuKapat">Yayına dön</button></div>`;
    perde.hidden = false;
    $('#menuKapat').onclick = () => { perde.hidden = true; Y.mola = false; };
  }

  function guncelle(dt) {
    Y.t += dt;
    const T = V.YAYIN_SURE;
    // ilgi ve enerji
    let dusus = 1.5 * (S.env.led ? 0.75 : 1) * (Y.karanlik ? 1.3 : 1);
    const th = Y.tehlike;
    if (th && th.tip === 'matkap') dusus += 2;
    if (th && th.tip === 'troll') dusus += 1;
    const sessiz = Y.mesgul > 0 ? 0 : Y.t - Y.sonEylemT;
    if (sessiz > 8) dusus += 1.5;
    Y.ilgi = clamp(Y.ilgi - dusus * dt);
    Y.enerji = clamp(Y.enerji - 0.1 * dt);
    // izleyici
    const rampa = Math.min(1, 0.25 + Y.t / 25);
    let hedef = Y.taban * (0.3 + Y.ilgi / 100 * 0.95) * rampa * (1 + Y.ces * 0.06);
    if (th && th.tip === 'net') hedef *= 0.4;
    Y.izl += (hedef - Y.izl) * Math.min(1, dt * 0.6) + (rnd() - 0.5) * dt * 2;
    Y.izl = Math.max(1, Y.izl);
    Y.enYuksek = Math.max(Y.enYuksek, Y.izl);
    // istekler
    Y.sonraki -= dt;
    if (Y.sonraki <= 0 && Y.istekler.length < 3 && !(th && th.tip === 'sarj')) {
      istekEkle();
      Y.sonraki = R(3.8, 6.8) * (Y.t > T * 0.6 ? 0.8 : 1) * (Y.ilkIstek && Y.karsilanan < 2 ? 1.6 : 1);
    }
    for (const ist of Y.istekler) ist.kalan -= dt;
    const kacanlar = Y.istekler.filter(i => i.kalan <= 0);
    if (kacanlar.length) {
      Y.istekler = Y.istekler.filter(i => i.kalan > 0);
      kacanlar.forEach(istekKacti);
      Ses.kacti(); istekCiz();
    }
    // abone ve küçük bahşişler
    const aboneP = Y.izl * 0.0016 * (Y.ilgi / 100) * (0.7 + S.sadakat / 170) * (1 + Y.ces * 0.1);
    if (rnd() < aboneP * dt) {
      Y.abone++; const k = Sohbet.bahsisci(false); sohbetMesaj({ u: k.ad, renk: k.renk, rozet: 'YENİ', t: 'abone oldu! 🎉 ($' + V.ABONE_UCRET.toFixed(2).replace('.', ',') + ')', tur: 'abone' }); Ses.abone();
      if (rnd() < 0.45 && Y.istekler.length < 3) istekEkle('tesekkur', k.ad);
    }
    if (rnd() < Y.izl * 0.0016 * dt * (Y.ilgi / 60)) { const k = Sohbet.bahsisci(false); bahsisAl(k.ad, Math.round(R(10, 60) * Y.bahsisK), Sohbet.bahsisNotu(k)); }
    // balina
    Y.balinaT -= dt;
    if (Y.balinaT <= 0 && !Y.tehlike) { balinaGeldi(); Y.balinaT = R(55, 95); }
    // sohbet akışı: izleyici çoğaldıkça hızlanır
    Y.sohbetT -= dt;
    if (Y.sohbetT <= 0) {
      Y.sohbetT = Math.max(0.45, 2.2 - Y.izl * 0.035) * R(0.6, 1.4);
      if (Y.gundem.length && rnd() < 0.12) { const sat = sec(V.GUNDEM[sec(Y.gundem)]); const m = sat.match(/^(\w+): (.*)$/); sohbetEkle(m ? m[1] : sec(V.KULLANICI), m ? m[2] : sablon(sat)); }
      else { const m = Sohbet.ortam({ t: Y.t, sessiz, ces: Y.ces, gun: S.gun, hedefOran: Y.jeton / Y.hedef.jeton, makyaj: K().makyaj && K().makyaj !== 'yok' }); if (m) sohbetMesaj(m); }
    }
    if (sessiz > 9 && Y.t - Y.sessizUyari > 9) { Y.sessizUyari = Y.t; Sohbet.tepki('sessizlik', 2).forEach((m, i) => setTimeout(() => sohbetMesaj(m), i * 400)); }
    // bot duyuruları
    Y.botT -= dt;
    if (Y.botT <= 0) {
      Y.botT = R(22, 34);
      sohbetMesaj(Sohbet.bot(sec([`🎯 Hedef: ${sayi(Y.jeton)} / ${sayi(Y.hedef.jeton)} jeton · ödül: ${Y.hedef.ad}`, '💸 Menü: öpücük 25 · poz 50 · dans 80 · özel dans 180 · kombin 350',
        `👥 ${sayi(Y.izl)} kişi izliyor. Abone olmak ${usd(V.ABONE_UCRET)}.`, '🔇 Kaba mesajlar otomatik siliniyor (bazen)', '⏱️ Yavaş mod: 2 saniye'])));
    }
    // tehlikeler
    if (!Y.tehlike && Y.plan.length && Y.t >= Y.plan[0].z) tehlikeBasla(Y.plan.shift().tip);
    if (Y.tehlike) {
      Y.tehlike.kalan -= dt;
      const b = document.querySelector('#yTeh .bar i'); if (b) b.style.width = clamp(Y.tehlike.kalan / Y.tehlike.sure * 100) + '%';
      if (Y.tehlike.kalan <= 0) tehlikeBit(false);
    }
    // aksiyon
    if (Y.mesgul > 0) {
      Y.mesgul -= dt;
      const d = document.querySelector(`[data-aks="${Y.aktifAks}"] .dolum`);
      if (d) d.style.width = clamp((1 - Y.mesgul / Y.aksSure) * 100) + '%';
      if (Y.mesgul <= 0) aksiyonBit();
    }
    Y.sonCiz -= dt;
    if (Y.sonCiz <= 0) { Y.sonCiz = 0.08; yayinCiz(); }
    if (Y.t >= T) bitir();
  }

  function yayinCiz() {
    const bas = { '21': 21 * 60, '23': 23 * 60, '02': 2 * 60 }[Y.saat.id];
    const dk = Math.floor(bas + Y.t / V.YAYIN_SURE * 240) % 1440;
    $('#ySaat').textContent = String(Math.floor(dk / 60)).padStart(2, '0') + ':' + String(dk % 60).padStart(2, '0');
    $('#yIzl').textContent = '👁 ' + sayi(Y.izl);
    $('#yJeton').textContent = sayi(Y.jeton);
    $('#yPara').textContent = usd(Y.bahsis + Y.abone * V.ABONE_UCRET);
    $('#yIlgi').style.width = Y.ilgi + '%'; $('#yIlgiS').textContent = Math.round(Y.ilgi);
    $('#yEn').style.width = Y.enerji + '%'; $('#yEnS').textContent = Math.round(Y.enerji);
    $('#yHedef').style.width = clamp(Y.jeton / Y.hedef.jeton * 100) + '%';
    $('#yHedefS').textContent = Y.hedef.tamam ? 'TAMAM 🎉' : sayi(Y.jeton) + ' / ' + sayi(Y.hedef.jeton);
    for (const ist of Y.istekler) {
      const el = document.getElementById('ist' + ist.id); if (!el) continue;
      el.querySelector('.sure i').style.width = clamp(ist.kalan / ist.sure * 100) + '%';
      el.classList.toggle('acil', ist.kalan < 4);
    }
    const istenen = new Set(Y.istekler.map(i => i.aks));
    panel.querySelectorAll('[data-aks]').forEach(b => b.classList.toggle('istenen', istenen.has(b.dataset.aks)));
  }

  /* istek türleri: menu (jeton önceden ödendi), istek (ücretsiz, yapılırsa bahşiş gelebilir), cesur (özel istek: menü fiyatının katları, ardından sansür) */
  let istekSayac = 0;
  function istekEkle(zorla, kullanici) {
    let aks = zorla || agirlikliSec(Object.assign({ kombin: 0.35 + Y.ces * 0.1 }, Y.tema.agirlik));
    let k = kullanici ? (Sohbet.kisi(kullanici) || { ad: kullanici, renk: '#d9b8ff' }) : (rnd() < 0.55 ? Sohbet.bahsisci(false) : sec(Sohbet.KISI));
    let havuz = V.ISTEK[aks] || V.ISTEK.poz, tur = 'istek', jet = 0;
    const cesurSans = (Y.ces >= 1 || Y.tema.id === 'ozelgece') && !zorla ? 0.08 + Y.ces * 0.06 + (Y.tema.id === 'ozelgece' ? 0.1 : 0) : 0;
    const menu = bul(V.MENU, aks);
    if (rnd() < cesurSans) { aks = 'ozel'; havuz = V.CESUR_ISTEK; tur = 'cesur'; jet = Math.round(R(2, 3.5) * 180 / 10) * 10; k = Sohbet.bahsisci(true); }
    else if (aks === 'kombin' || (menu && !zorla && rnd() < 0.5)) { tur = 'menu'; jet = menu ? menu.jeton : 350; }
    if (aks === 'konus' && Y.tema.id === 'asmr') havuz = V.ISTEK.konus_asmr;
    const sure = R(12, 16) * (Y.ilkIstek ? 1.4 : 1) * (tur === 'cesur' ? 1.2 : 1);
    const ist = { id: ++istekSayac, aks, u: k.ad, renk: k.renk, t: sablon(sec(havuz)), kalan: sure, sure, tur, jet, cesur: tur === 'cesur' };
    Y.istekler.push(ist);
    if (jet) jetonAl(k.ad, jet, (tur === 'cesur' ? '🔥 ÖZEL İSTEK: ' : '') + ist.t, true);
    Ses.istek(); istekCiz();
  }
  function istekKacti(i) {
    if (i.tur === 'balina') { Y.kacan++; Y.balinaKac++; Y.izl *= 0.9; S.sadakat = clamp(S.sadakat - 4); sohbetMesaj({ u: i.u, renk: i.renk, rozet: 'VIP', t: sec(Sohbet.AYRILIS), tur: 'kaba' }); sohbetMesaj(Sohbet.bot(`👋 ${i.u} yayından ayrıldı`)); return; }
    Y.kacan++; Y.ilgi = clamp(Y.ilgi - (i.jet ? 12 : 6));
    if (i.jet) {
      Y.jeton = Math.max(0, Y.jeton - i.jet); Y.bahsis = Math.max(0, Y.bahsis - i.jet * JETON); Y.iade += i.jet;
      sohbetMesaj({ u: i.u, renk: i.renk, t: sec(['parayı aldı yapmadı 😡 iade istiyorum', 'jetonumu geri ver', 'dolandırıcı mısın', 'bir daha bahşiş yok']), tur: 'kaba' });
      sohbetMesaj(Sohbet.bot(`↩️ ${i.u} kullanıcısına ${jeton(i.jet)} iade edildi`));
    } else sohbetMesaj({ u: i.u, renk: i.renk, t: sec(['tamam ya boşver 🙄', 'beni görmedi bile', 'başka yayına geçiyorum', 'hiç takmadı 😒']) });
  }
  function istekCiz() {
    const kap = $('#yIstek'); if (!kap) return;
    const var_ = new Set(Y.istekler.map(i => 'ist' + i.id));
    [...kap.children].forEach(c => { if (!var_.has(c.id)) c.remove(); });
    for (const ist of Y.istekler) {
      if (document.getElementById('ist' + ist.id)) continue;
      const ad = ist.aks === 'kombin' ? 'Kombin' : bul(V.AKSIYONLAR, ist.aks).ad;
      const etiket = ist.tur === 'cesur' ? `ÖZEL İSTEK · ${jeton(ist.jet)}` : ist.tur === 'menu' ? `💸 ${jeton(ist.jet)}` : 'istek';
      kap.insertAdjacentHTML('beforeend', `<div class="istek ${ist.tur}" id="ist${ist.id}"><span class="ik" aria-hidden="true">${EMOJI[ist.aks] || '👗'}</span><div class="ic"><span class="u">${etiket} · ${esc(ist.u)} · ${ad}</span><span class="t">${esc(ist.t)}</span><span class="sure"><i style="width:100%"></i></span></div></div>`);
    }
  }
  function sohbetMesaj(m) {
    const kap = $('#ySohbet'); if (!kap || !m) return;
    const roz = m.rozet ? `<span class="roz ${m.rozet === 'VIP' ? 'vip' : m.rozet === 'BOT' ? 'bot' : ''}">${esc(m.rozet)}</span>` : '';
    kap.insertAdjacentHTML('beforeend', `<p class="${m.tur || ''}">${roz}${m.u ? `<b style="color:${m.renk || '#d9b8ff'}">${esc(m.u)}</b> ` : ''}${esc(m.t)}</p>`);
    while (kap.children.length > 7) kap.firstElementChild.remove();
  }
  function sohbetEkle(u, t, tip = '') { const k = u && Sohbet.kisi(u); sohbetMesaj({ u, t, tur: tip, renk: k ? k.renk : null, rozet: k ? k.rozet : null }); }
  function ucanYazi(metin, buyuk) {
    const kap = $('#yUcan'); if (!kap) return;
    const s = document.createElement('span'); s.textContent = metin; if (buyuk) s.className = 'buyuk';
    s.style.left = (25 + rnd() * 40) + '%'; s.style.top = (35 + rnd() * 25) + '%';
    kap.appendChild(s); setTimeout(() => s.remove(), 1300);
  }
  // jeton gelişi: hedef çubuğu, sohbet satırı, uçan yazı
  function jetonAl(u, j, not, istekle) {
    Y.jeton += j; Y.bahsis += j * JETON; Y.bahsisciler[u] = (Y.bahsisciler[u] || 0) + j * JETON;
    const k = Sohbet.kisi(u) || {};
    sohbetMesaj({ u, renk: k.renk, rozet: k.rozet, t: `💸 ${jeton(j)}${not ? ' · ' + not : ''}`, tur: j >= 300 ? 'bahsis buyuk' : 'bahsis' });
    ucanYazi('+' + sayi(j), j >= 300); Ses.bahsis();
    if (j >= 150 && !istekle && rnd() < 0.6) setTimeout(() => Sohbet.tepki('bahsis_tepki', 1).forEach(sohbetMesaj), 600);
    if (!Y.hedef.tamam && Y.jeton >= Y.hedef.jeton) hedefTamam();
  }
  function bahsisAl(u, jet, not) { jetonAl(u, jet, not); }
  function hedefTamam() {
    Y.hedef.tamam = true; Ses.basari();
    sohbetMesaj(Sohbet.bot(`🎉 HEDEF TAMAM! Ödül: ${Y.hedef.ad}`));
    Sohbet.tepki('hedefTamam', 3).forEach((m, i) => setTimeout(() => sohbetMesaj(m), 300 + i * 300));
    S.takipci += Math.round(Y.izl * 2); Y.ilgi = clamp(Y.ilgi + 20);
    Y.istekler = Y.istekler.slice(0, 2);
    const ist = { id: ++istekSayac, aks: 'ozel', u: 'HEDEF', renk: '#f5c451', t: 'Hedef ödülü: ' + Y.hedef.ad, kalan: 18, sure: 18, tur: 'cesur', jet: 0, cesur: true };
    Y.istekler.push(ist); istekCiz();
  }
  function balinaGeldi() {
    const k = Sohbet.bahsisci(true);
    const j = Math.round(R(4, 12)) * 100;
    jetonAl(k.ad, j, sec(['sen bunu hak ediyorsun 👑', 'bu gece benden', 'sadece bir teşekkür yeter', 'en sevdiğim yayıncı']));
    Y.istekler = Y.istekler.filter(i => i.aks !== 'tesekkur' || i.u !== k.ad).slice(0, 2);
    Y.istekler.push({ id: ++istekSayac, aks: 'tesekkur', u: k.ad, renk: k.renk, t: `${k.ad} ${sayi(j)} jeton attı, teşekkür bekliyor`, kalan: 9, sure: 9, tur: 'balina', jet: 0, balina: j });
    istekCiz();
  }

  function sansurOlayi() {
    Y.cesurSay++;
    S.risk = clamp(S.risk + 1 + Y.ces);
    let o = sec(V.SANSUR);
    if (o.tip === 'anne' && (S.env.kilit || Y.tehlike)) o = V.SANSUR[0];
    o.sohbet.slice(0, 2).forEach((t, i) => setTimeout(() => sohbetEkle(sec(V.KULLANICI), t), 300 + i * 500));
    if (o.tip === 'anne') { tehlikeBasla('anne'); return; }
    if (o.tip === 'kedi') { Sahne.kediGec(4); Ses.miyav(); }
    if (o.tip === 'net') Y.izl *= 0.85;
    perdeYazi(o.tip === 'etiket' ? 'SANSÜR' : o.metin, o.tip !== 'etiket');
  }
  function perdeYazi(metin, kucuk) {
    const el = document.createElement('div'); el.className = 'sansur' + (kucuk ? ' kucuk' : '');
    el.innerHTML = `<span>${esc(metin)}</span>`;
    ust.appendChild(el); setTimeout(() => el.remove(), 1800);
  }
  const ANIM = { konus: 'konus', dans: 'dans', ozel: 'ozel', opucuk: 'opucuk', poz: 'poz', tesekkur: 'tesekkur' };
  function aksiyon(id) {
    if (!Y || Y.bitti || Y.mola) return;
    const btn = panel.querySelector(`[data-aks="${id}"]`);
    if (Y.mesgul > 0) { if (btn) { btn.classList.remove('salla'); void btn.offsetWidth; btn.classList.add('salla'); } return; }
    const a = bul(V.AKSIYONLAR, id);
    const sure = a.sure * (Y.enerji < 15 ? 1.6 : 1);
    Y.mesgul = sure; Y.aksSure = sure; Y.aktifAks = id; Y.enerji = clamp(Y.enerji - a.enerji);
    Ses.tik();
    if (Sahne.hazir) Sahne.oynat(ANIM[id], sure);
  }
  // yayında kıyafet değiştir: sahip olunan kıyafetler arasında bir sonrakine (daha cesura doğru) geçer
  function kombin() {
    if (!Y || Y.bitti || Y.mola || Y.mesgul > 0) return;
    const sirali = S.kiyafetler.slice().sort((a, b) => kiyafetBilgi(a).cesaret - kiyafetBilgi(b).cesaret);
    if (sirali.length < 2) { bildir('Başka kıyafetin yok. Mağazadan alabilirsin.'); return; }
    // dolap: yayın beklerken sahip olunan kıyafetlerden biri seçilir
    Y.mola = true;
    perde.innerHTML = `<div class="kart dolap"><p class="etiket">Dolap · sohbet bekliyor</p>
      <div class="dolap-izgara">${sirali.map(id => { const kb = kiyafetBilgi(id); return `<button class="dolap-oge ${id === S.secim.kiyafet ? 'giyili' : ''}" data-giy="${id}" ${id === S.secim.kiyafet ? 'disabled' : ''}><b>${esc(kb.ad)}</b><span>${'🔥'.repeat(kb.cesaret) || 'gündelik'}</span></button>`; }).join('')}</div>
      <p class="dipnot">Daha cesur kıyafet = daha çok bahşiş ve abone, ama risk ve annenin kapıyı açma ihtimali artar.</p>
      <button class="btn ikincil" id="dolapKapat">Vazgeç</button></div>`;
    perde.hidden = false;
    $('#dolapKapat').onclick = () => { perde.hidden = true; Y.mola = false; };
    perde.querySelectorAll('[data-giy]').forEach(b => b.onclick = () => { perde.hidden = true; Y.mola = false; giyin(b.dataset.giy); });
  }
  function giyin(yeni) {
    if (!Y || Y.bitti) return;
    Y.mesgul = 2; Y.aksSure = 2; Y.aktifAks = 'kombin'; Y.enerji = clamp(Y.enerji - 3);
    perdeYazi('KOMBİN DEĞİŞİYOR…', true);
    setTimeout(() => {
      if (!Y || Y.bitti) return;
      S.secim.kiyafet = yeni;
      bahsisKatsayi();
      if (Sahne.hazir) { Sahne.karakter(gorunum()); Sahne.oynat('poz', 1.2); }
      Sohbet.tepki('kiyafetDegisti', 2).forEach((m, k) => setTimeout(() => sohbetMesaj(m), k * 400));
      sohbetMesaj(Sohbet.bot('👗 Yeni kombin: ' + kiyafetBilgi(S.secim.kiyafet).ad));
    }, 700);
  }
  function aksiyonBit() {
    const id = Y.aktifAks; Y.aktifAks = null; Y.mesgul = 0; Y.sonEylemT = Y.t;
    panel.querySelectorAll('.dolum').forEach(d => d.style.width = '0');
    if (id === 'ic') return;
    const i = Y.istekler.findIndex(x => x.aks === id);
    if (i >= 0) {
      const ist = Y.istekler.splice(i, 1)[0];
      Y.karsilanan++; Y.ilgi = clamp(Y.ilgi + 14 + (Y.temaEs ? 3 : 0) + (id === 'tesekkur' ? 4 : 0) + (ist.jet ? 4 : 0));
      if (ist.tur === 'istek' && rnd() < 0.65) jetonAl(ist.u, Math.round(R(15, 70) * Y.bahsisK), sec(['teşekkürler 💕', 'harikaydı', 'bir daha!', '']));
      if (ist.tur === 'balina') { sohbetMesaj({ u: ist.u, renk: ist.renk, rozet: 'VIP', t: sec(['ismimi söyledi 🥹 yarın da buradayım', 'işte bu yüzden buradayım 👑', 'bir dahakine daha fazlası']) }); S.sadakat = clamp(S.sadakat + 3); }
      if (ist.cesur) sansurOlayi();
      if (rnd() < 0.18) { Y.abone++; sohbetMesaj({ u: ist.u, renk: ist.renk, rozet: 'YENİ', t: 'abone oldu! 🎉', tur: 'abone' }); Ses.abone(); }
      istekCiz();
      if (Y.yonlendirme === 'istek') { Y.yonlendirme = null; const y = $('#yYon'); if (y) y.remove(); }
    } else if (Y.sonAks === id && Y.t - Y.sonAksT < 10) {
      Y.ilgi = clamp(Y.ilgi - 5); sohbetEkle(sec(V.KULLANICI), `yine mi ${(bul(V.AKSIYONLAR, id) || { ad: id }).ad.toLowerCase()} 🥱`);
    } else Y.ilgi = clamp(Y.ilgi + 3);
    // izleyicilerin harekete tepkisi
    if (id !== 'kombin' && rnd() < 0.85) Sohbet.tepki(id).forEach((m, k) => setTimeout(() => sohbetMesaj(m), 250 + k * 450));
    Y.sonAks = id; Y.sonAksT = Y.t;
  }
  function ic() {
    if (!Y || Y.bitti || Y.mola || Y.mesgul > 0) return;
    if (!(S.stok.enerji > 0)) { bildir('Enerji içeceğin kalmadı. Mağazadan alabilirsin.'); return; }
    S.stok.enerji--; Y.enerji = clamp(Y.enerji + 35); Y.mesgul = 1.2; Y.aksSure = 1.2; Y.aktifAks = 'ic';
    if (Sahne.hazir) Sahne.oynat('ic', 1.2);
    $('#icBtn').textContent = `⚡ İçecek (${S.stok.enerji})`;
  }

  /* ---------- tehlikeler ---------- */
  function tehlikeBasla(tip) {
    const d = V.TEHLIKE[tip];
    if (d.onlem && S.env[d.onlem]) {
      const not = { anne: 'Kapı kilitli. Annen: "Kilit mi taktın sen?" 🔒', sarj: 'Şarj azaldı, powerbank devraldı 🔋', isik: 'Lamba titredi ama ring light idare etti 💡', tripod: 'Telefon sallandı ama tripod sağlam 📱' }[tip];
      if (tip === 'anne') { S.aile = clamp(S.aile + 3); Ses.kapi(); }
      bildir(not); Y.basarili++; return;
    }
    Y.tehlike = { tip, kalan: d.sure, sure: d.sure };
    const kap = $('#yTeh');
    const ikinci = tip === 'kedi' ? '<button class="btn ikincil" id="tehHayir">Kediyi çıkar</button>' : '';
    kap.innerHTML = `<p>${esc(d.metin)}</p><div class="bar"><i style="width:100%"></i></div><div class="ikili"><button class="btn" id="tehEvet">${esc(d.buton)} <small>(boşluk)</small></button>${ikinci}</div>`;
    kap.hidden = false;
    $('#tehEvet').onclick = () => tehlikeBit(true);
    if (ikinci) $('#tehHayir').onclick = () => tehlikeBit(false, true);
    Ses.tehlike();
    if (tip === 'anne') Ses.kapi();
    if (tip === 'kedi') { Sahne.kediGec(d.sure + 1); Ses.miyav(); }
    if (tip === 'matkap') Ses.matkap();
    if (tip === 'isik') { Sahne.titret(d.sure); Sahne.karart(0.5); }
    if (tip === 'tripod') Sahne.egil(0.18);
    if (tip === 'troll') sohbetEkle('gercek_yuzler_44', sablon(sec(V.SOHBET.troll)), 'troll');
    if (tip === 'net') sohbetEkle(sec(V.KULLANICI), sec(V.GUNDEM.bant));
  }
  function tehlikeBit(basari, kediCikar) {
    const th = Y.tehlike; if (!th) return;
    Y.tehlike = null; $('#yTeh').hidden = true;
    const tip = th.tip;
    if (basari) {
      Y.basarili++;
      if (tip === 'anne') { Sahne.oynat('panik', 1.2); sohbetEkle(sec(V.KULLANICI), 'annen mi o 😅'); S.aile = clamp(S.aile + 2); }
      if (tip === 'kedi') { Y.ilgi = clamp(Y.ilgi + 15); sohbetEkle(sec(V.KULLANICI), 'KEDİİİ 😻 asıl yayıncı geldi'); Ses.miyav(); }
      if (tip === 'troll') sohbetEkle(null, 'gercek_yuzler_44 banlandı 🔨');
      if (tip === 'isik') Sahne.karart(0);
      if (tip === 'tripod') Sahne.egil(0);
      if (tip === 'net') sohbetEkle(sec(V.KULLANICI), 'VPN açtım geldim, görüntü düzeldi');
      if (tip === 'matkap') sohbetEkle(sec(V.KULLANICI), 'müzik iyi geldi, matkap kim');
      if (tip === 'sarj') sohbetEkle(null, 'Şarj takıldı 🔌');
      Ses.basari();
      return;
    }
    Y.basarisiz++;
    if (tip === 'anne') {
      Y.anneGirdi = true; S.aile = clamp(S.aile + 20 + Y.ces * 6);
      if (Y.ces >= 2) setTimeout(() => sohbetEkle('Kayserili_Mehmet', 'annen kıyafeti gördü mü 💀💀'), 900); Y.ilgi = clamp(Y.ilgi + 15); Y.izl *= 1.3;
      Sahne.anneGir(); Sahne.oynat('sok', 2.6); Ses.kapi();
      sohbetEkle('Kayserili_Mehmet', 'ANNE GİRDİ 💀💀💀'); sohbetEkle(sec(V.KULLANICI), 'teyze selam 👋');
      setTimeout(() => Sahne.anneCik(), 3200);
    } else if (tip === 'kedi') {
      if (kediCikar) sohbetEkle(sec(V.KULLANICI), 'kediyi neden çıkardın 😿'); else { sohbetEkle(sec(V.KULLANICI), 'kedi klavyeye oturdu: aaaaaaaaaa'); Y.ilgi = clamp(Y.ilgi + 4); }
    } else if (tip === 'net') { Y.ilgi = clamp(Y.ilgi - 15); Y.izl *= 0.6; sohbetEkle(sec(V.KULLANICI), 'yayın dondu, çıkıyorum'); }
    else if (tip === 'sarj') { Y.sarjBitti = true; Sahne.oynat('sok', 2); bildir('Telefon kapandı. Yayın bitti.', 3000); setTimeout(() => bitir(), 900); }
    else if (tip === 'troll') { Y.ilgi = clamp(Y.ilgi - 10); sohbetEkle('gercek_yuzler_44', 'KİMSE BENİ BANLAYAMAZ', 'troll'); }
    else if (tip === 'matkap') { Y.ilgi = clamp(Y.ilgi - 8); sohbetEkle(sec(V.KULLANICI), 'arkada inşaat mı var'); }
    else if (tip === 'isik') { Y.karanlik = true; Sahne.karart(0.35); sohbetEkle(sec(V.KULLANICI), 'karanlıkta yayın, gizemli 🕯️'); }
    else if (tip === 'tripod') { Y.ilgi = clamp(Y.ilgi - 8); Sahne.egil(0.4); setTimeout(() => Sahne.egil(0), 4000); sohbetEkle(sec(V.KULLANICI), 'boynum tutuldu'); }
    Ses.kacti();
  }

  function mola() {
    if (!Y || Y.bitti || Y.mola) return;
    Y.mola = true;
    perde.innerHTML = `<div class="kart"><h2 class="baslik">Mola</h2><p class="alt">Sohbet seni bekliyor. İzleyiciler sabırsız.</p>
      <button class="btn" id="molaDevam">Yayına dön</button><button class="btn ikincil" id="molaMenu">Ana menü</button>
      <p class="dipnot">Ana menüye dönersen bugünkü yayın kaydedilmez, sabahtan başlarsın.</p></div>`;
    perde.hidden = false;
    $('#molaDevam').onclick = () => { perde.hidden = true; Y.mola = false; };
    $('#molaMenu').onclick = () => { perde.hidden = true; cancelAnimationFrame(Y.raf); Y.bitti = true; document.onkeydown = null; S.asama = 'sabah'; S.stok = S.stok || {}; giris(); };
  }
  function onayla(metin, evet, fn) {
    if (Y && !Y.bitti) Y.mola = true;
    perde.innerHTML = `<div class="kart"><p style="margin:0;font-weight:700">${esc(metin)}</p><div class="satir"><button class="btn ikincil" id="onayHayir">Vazgeç</button><button class="btn" id="onayEvet">${esc(evet)}</button></div></div>`;
    perde.hidden = false;
    $('#onayHayir').onclick = () => { perde.hidden = true; if (Y) Y.mola = false; };
    $('#onayEvet').onclick = () => { perde.hidden = true; if (Y) Y.mola = false; fn(); };
  }

  function bitir() {
    if (!Y || Y.bitti) return;
    Y.bitti = true; cancelAnimationFrame(Y.raf);
    document.onkeydown = null; document.onvisibilitychange = null;
    if (Sahne.hazir) { Sahne.karart(0); Sahne.egil(0); Sahne.anneCik(); Sahne.oynat('tesekkur', 1.6); }
    const enB = Object.entries(Y.bahsisciler).sort((a, b) => b[1] - a[1])[0];
    S.bugun = {
      bahsis: Y.bahsis, abone: Y.abone, aboneGelir: Y.abone * V.ABONE_UCRET, enYuksek: Math.round(Y.enYuksek),
      karsilanan: Y.karsilanan, kacan: Y.kacan, basarili: Y.basarili, basarisiz: Y.basarisiz, anneGirdi: Y.anneGirdi,
      enBahsisci: enB ? enB[0] : null, sarjBitti: Y.sarjBitti, klip: 0, tweet: null, gece: null, ces: Y.ces, cesurSay: Y.cesurSay, jeton: Y.jeton, iade: Y.iade, hedef: Y.hedef.tamam ? Y.hedef.ad : null
    };
    S.enerji = Y.enerji; S.abone += Y.abone; S.risk = clamp(S.risk + Y.ces * 1.5);
    S.takipci += Math.round(Y.enYuksek * 0.6 + Y.abone * 3);
    S.asama = 'sonra'; S.yayinBitti = true;
    { const bas = { '21': 21, '23': 23, '02': 2 }[Y.saat.id]; S.saat = String((bas + 4) % 24).padStart(2, '0') + ':0' + Math.floor(rnd() * 9); }
    kaydet();
    Ses.kasa();
    setTimeout(yayinSonu, 700);
  }

  /* ---------- yayın sonrası: X paylaşımı ---------- */
  function yayinSonu() {
    ekran('sonra', 'yakin');
    if (Sahne.hazir) { Sahne.karakter(gorunum()); Sahne.oda(S.env); }
    const B = S.bugun;
    if (B.tweet) return ana();
    const gunV = V.GUNLER[S.gun - 1] || {};
    const secenek = ['link'];
    if (B.anneGirdi) secenek.push('anne'); else if (B.enBahsisci) secenek.push('tesekkur');
    const gk = (gunV.gundem || []).find(g => V.GUNDEM_TWEET[g]);
    if ((B.ces || 0) >= 2 || B.cesurSay) secenek.push('cesur'); else if ((B.ces || 0) >= 1) secenek.push('kombin');
    if (gk) secenek.push('gundem'); else if (S.gun >= 2) secenek.push('durust');
    if (S.gun >= 2 && secenek.length < 4 && !secenek.includes('durust')) secenek.push('durust');
    secenek.push('hic');
    const metinler = {};
    secenek.forEach(s => {
      metinler[s] = sablon(V.TWEET[s].metin, { sifat: sec(V.SIFAT), bahsisci: '@' + (B.enBahsisci || 'Kayserili_Mehmet'), gundemTweet: gk ? V.GUNDEM_TWEET[gk] : '' });
    });
    const toplam = B.bahsis + B.aboneGelir;
    panel.innerHTML = `
      <p class="etiket">Yayın bitti</p>
      <h2 class="baslik">${B.sarjBitti ? 'Telefon kapandı ama gece bitmedi' : toplam > 60 ? 'Güzel geceydi' : 'Başlangıç böyle olur'}</h2>
      <div class="sayilar">
        <div class="sayi"><small>Kazanç</small><b>${usd(toplam)}</b></div>
        <div class="sayi"><small>En yüksek izleyici</small><b>${sayi(B.enYuksek)}</b></div>
        <div class="sayi"><small>Yeni abone</small><b>${B.abone}</b></div>
        <div class="sayi"><small>Karşılanan istek</small><b>${B.karsilanan}</b></div>
        <div class="sayi"><small>Kaçan istek</small><b>${B.kacan}</b></div>
        <div class="sayi"><small>Olaylar</small><b>${B.basarili}/${B.basarili + B.basarisiz}</b></div>
      </div>
      <p class="ipucu">${sayi(B.jeton || 0)} jeton toplandı${B.hedef ? ' · 🎯 hedef tamam: ' + esc(B.hedef) : ''}${B.iade ? ' · ↩️ ' + sayi(B.iade) + ' jeton iade edildi (ödenen istekleri kaçırdın)' : ''}.</p>
      <div class="grup"><span class="etiket">X'te ne paylaşacaksın? (@${esc(K().kullanici)})</span>
        <div class="secenekler">${secenek.map(s => `<button class="secenek" data-tweet="${s}"><b>${s === 'hic' ? 'Hiçbir şey paylaşma' : esc(metinler[s])}</b><span>${tweetIpucu(s)}</span></button>`).join('')}</div></div>`;
    panel.querySelectorAll('[data-tweet]').forEach(b => b.onclick = () => xPaylas(b.dataset.tweet, metinler[b.dataset.tweet]));
  }
  function tweetIpucu(s) {
    return { link: 'Güvenli tanıtım. Az risk.', anne: 'Herkes güler. Kuzenin de görür.', tesekkur: 'Sadık izleyiciler sever.', durust: 'Tartışma çıkar, çok yayılır. Risk artar.', cesur: 'Çok yayılır, abone patlar. Risk ve aile radarı ciddi artar.', kombin: 'Görsel paylaşım. Takipçi getirir, az risk.', gundem: 'Kumar: ya patlar ya ters teper.', hic: 'Sessiz kal. Risk biraz düşer.' }[s];
  }
  function xPaylas(tip, metin) {
    const B = S.bugun, e = V.TWEET[tip].etki;
    const fx = {};
    let viral = false, ters = false;
    if (e.viral && rnd() < e.viral) viral = true;
    if (e.kumar) { if (rnd() < e.kumar) ters = true; else viral = rnd() < 0.5; }
    if (tip !== 'hic') {
      const baz = (B.enYuksek * 2 + 15) * (e.takipciKat || 1) * R(0.8, 1.2) * (viral ? 4 : 1);
      fx.takipci = Math.round(ters ? -baz * 0.4 : baz);
      S.yarin = clamp(1 + (e.yarin || 0) * (viral ? 2 : 1) * (ters ? -0.5 : 1), 0.6, 2.5);
    } else S.yarin = 1;
    if (e.aile) fx.aile = e.aile;
    if (e.risk) fx.risk = e.risk + (viral ? 3 : 0);
    if (e.sadakat) fx.sadakat = e.sadakat;
    B.tweet = { tip, metin, viral, ters }; S.xBugun = tip !== 'hic'; S.asama = 'ana';
    const cipler = etkiUygula(fx);
    kaydet();
    if (tip === 'hic') { Ses.tik(); return ana(); }
    Ses.bildirim();
    // yanıtlar
    const havuz = V.X_YANIT.genel.slice();
    let yanit = karistir(havuz).slice(0, 3);
    if (V.X_YANIT[tip]) yanit = karistir(V.X_YANIT[tip]).slice(0, tip === 'cesur' ? 3 : 1).concat(yanit.slice(0, tip === 'cesur' ? 1 : 2));
    if (S.gun === 3 && !yanit.some(y => y.h === '@AileDegerleriTR')) yanit.unshift(V.X_YANIT.genel.find(y => y.h === '@AileDegerleriTR'));
    const gor = (B.enYuksek * 60 + S.takipci * 3) * R(0.8, 1.3) * (viral ? 12 : 1) * (ters ? 2 : 1);
    const k = K();
    S.xAkis.unshift({ t: metin, gor });
    yanit.slice(0, 3).forEach(y => S.xAkis.splice(1, 0, { kim: y.n, h: y.h, t: sablon(y.t), gor: gor * 0.04 }));
    kaydet();
    const tw = (ad, h, t, v, meta) => `<div class="tw">${avatar(ad)}<div style="min-width:0"><div class="kim"><b>${esc(ad)}</b>${v ? '<span class="tik">✓</span>' : ''} <span>${esc(h)} · ${Math.floor(R(1, 50))} dk</span></div><div class="tx">${esc(t)}</div>${meta || ''}</div></div>`;
    const meta = `<div class="meta"><span>💬 ${kisa(gor * 0.006)}</span><span>🔁 ${kisa(gor * 0.01)}</span><span>♡ ${kisa(gor * 0.04)}</span><span>📊 ${kisa(gor)}</span></div>`;
    panel.innerHTML = `
      <p class="etiket">${viral ? 'Gündemdesin' : ters ? 'Ters tepti' : 'Paylaşıldı'}</p>
      <div class="xkap"><div class="xbas">Gönderi</div>
        ${tw(k.ad, '@' + k.kullanici, metin, false, meta)}
        ${yanit.map(y => tw(y.n, y.h, sablon(y.t), y.v)).join('')}
      </div>
      ${cipler}
      ${S.gun === 3 ? '<p class="ipucu">@AileDegerleriTR sana yazdı. Profil fotoğrafındaki kedi bir yerden tanıdık geliyor.</p>' : ''}
      <button class="btn" id="ileri">Devam</button>`;
    $('#ileri').onclick = () => ana();
  }

  /* ---------- gece seçimi ---------- */
  function gece(onceki) {
    const B = S.bugun;
    if (B.gece) return rapor();
    ekran('sonra', 'oda');
    panel.innerHTML = `
      ${onceki || ''}
      <h2 class="baslik">Gece 01.40. Ne yapacaksın?</h2>
      <div class="secenekler">
        <button class="secenek" data-gece="dm"><b>DM'lere cevap ver</b><span>Abonelerin mesajları birikti. Sadakat artar, biraz enerji gider.</span></button>
        <button class="secenek" data-gece="klip"><b>Klip kes, sat</b><span>Yayından klip çıkar. Ek para ve takipçi, ama yorulursun ve risk artar.</span></button>
        <button class="secenek" data-gece="uyu"><b>Erken uyu</b><span>Yarın tam enerjiyle başla.</span></button>
      </div>`;
    panel.querySelectorAll('[data-gece]').forEach(b => b.onclick = () => {
      const g = b.dataset.gece; B.gece = g;
      if (g === 'dm') return dmEkrani();
      if (g === 'klip') { const p = Math.round(R(300, 600) + B.enYuksek * 15); B.klip = p; const c = etkiUygula({ para: p, takipci: 30, enerji: -15, risk: 3 }); kaydet(); Ses.kasa(); return araSonuc('Klip satıldı. Biri 30 saniyelik kliple fan sayfası açtı.', c, rapor); }
      S.bayrak.erkenUyku = true; kaydet(); rapor();
    });
  }
  function dmEkrani() {
    const kalan = V.DM.filter(d => !S.kullanilanDM.includes(d.id));
    const liste = karistir(kalan.length >= 2 ? kalan : V.DM).slice(0, 2);
    let i = 0;
    const ciz = () => {
      if (i >= liste.length) { etkiUygula({ enerji: -10 }); kaydet(); return rapor(); }
      const d = liste[i];
      panel.innerHTML = `<p class="etiket">Mesaj kutusu · ${i + 1}/${liste.length}</p>
        <div class="bildirim"><div class="kim"><b>${esc(d.from)}</b><span>DansKasa DM</span></div><p>${esc(sablon(d.t))}</p></div>
        <div class="secenekler" id="dmSec">${d.s.map((s, j) => `<button class="secenek" data-j="${j}"><b>${esc(s.l)}</b></button>`).join('')}</div><div id="dmSon"></div>`;
      panel.querySelectorAll('[data-j]').forEach(b => b.onclick = () => {
        const s = d.s[+b.dataset.j]; S.kullanilanDM.push(d.id);
        const c = etkiUygula(s.fx); kaydet(); Ses.bildirim();
        $('#dmSec').remove();
        $('#dmSon').innerHTML = `<p class="cevap">${esc(sablon(s.c))}</p>${c}<button class="btn" id="dmIleri" style="margin-top:12px">${i + 1 < liste.length ? 'Sonraki mesaj' : 'Rapora geç'}</button>`;
        $('#dmIleri').onclick = () => { i++; ciz(); };
      });
    };
    ciz();
  }
  function araSonuc(metin, cipler, sonra) {
    panel.innerHTML = `<p class="cevap">${esc(metin)}</p>${cipler}<button class="btn" id="ileri">Devam</button>`;
    $('#ileri').onclick = sonra;
  }

  /* ---------- rapor ve mağaza ---------- */
  function rapor() {
    ekran('rapor', 'oda');
    S.asama = 'rapor';
    const B = S.bugun || { bahsis: 0, aboneGelir: 0, abone: 0, enYuksek: 0 };
    if (!S.gunHesap || S.gunHesap.gun !== S.gun) {
      const yayin$ = B.bahsis + B.aboneGelir, ppv$ = S.gunluk.ppv, dm$ = S.gunluk.dm;
      const brut = yayin$ + ppv$ + dm$, kes = brut * V.PLATFORM_KESINTI, net$ = brut - kes, tlNet = net$ * S.kur;
      const gider = V.GIDER.kira + V.GIDER.internet;
      const sonuc = tlNet - gider + S.gunluk.tl;
      S.gunHesap = { gun: S.gun, yayin$, ppv$, dm$, kes, tlNet, gider, kur: S.kur, ek: S.gunluk.tl, sonuc };
      S.para += sonuc; S.toplamNet += sonuc;
      if (tlNet) S.islemler.unshift({ gun: S.gun, ad: 'DansKasa ödemesi (' + usd(net$) + ')', tutar: Math.round(tlNet) });
      if (S.gunluk.tl) S.islemler.unshift({ gun: S.gun, ad: 'Diğer', tutar: Math.round(S.gunluk.tl) });
      S.islemler.unshift({ gun: S.gun, ad: 'Kira + internet', tutar: -gider });
      S.islemler = S.islemler.slice(0, 40);
      S.gunler.push({ gun: S.gun, net: sonuc, izleyici: B.enYuksek || 0 });
      kaydet();
    }
    const H = S.gunHesap;
    const oran = Math.round(H.sonuc / V.ASGARI_UCRET * 100);
    panel.innerHTML = uygBas('Kasabank · gün sonu', '#c47d10') + `
      <h2 class="baslik">${H.sonuc > 0 ? 'Hesabına ' + tl(H.sonuc) + ' yattı' : 'Bugün zarar ettin'}</h2>
      <div class="kart"><div class="dokum">
        <div><span>Canlı yayın (bahşiş + abonelik)</span><span>${usd(H.yayin$)}</span></div>
        <div><span>Kilitli içerik (${S.gunluk.ppvSatis} satış)</span><span>${usd(H.ppv$)}</span></div>
        <div><span>DM satışları ve bahşişler</span><span>${usd(H.dm$)}</span></div>
        <div class="eksi"><span>DansKasa kesintisi (%${V.PLATFORM_KESINTI * 100})</span><span>−${usd(H.kes)}</span></div>
        <div><span>Kur: 1 $ = ${H.kur.toFixed(2).replace('.', ',')} TL</span><span>${tl(H.tlNet)}</span></div>
        ${H.ek ? `<div class="${H.ek < 0 ? 'eksi' : 'arti'}"><span>Diğer (şantaj, klip vb.)</span><span>${tl(H.ek)}</span></div>` : ''}
        <div class="eksi"><span>Kira + internet</span><span>−${tl(H.gider)}</span></div>
        <div class="top"><span>Bugünkü net</span><span>${tl(H.sonuc)}</span></div>
        <div class="top"><span>Hesap</span><span>${tl(S.para)}</span></div>
      </div></div>
      <p class="ipucu">Bugünkü net kazancın aylık asgari ücretin %${oran}'i. ${oran >= 25 ? 'Babanın emekli ikramiyesini bir haftada geçiyorsun. Bu yüzden banka seni arıyor.' : oran >= 10 ? 'Ev sahibi kirayı neden zamlamadığını sorguluyor.' : 'Henüz kimseye "iş" diyemezsin.'}</p>
      <div class="satir"><button class="btn ikincil" id="kartBtn">Paylaşım kartı</button><button class="btn" id="uyuBtn">🌙 Uyu</button></div>`;
    $('#geriBtn').style.visibility = 'hidden';
    $('#kartBtn').onclick = () => paylasimKarti();
    $('#uyuBtn').onclick = geceOlayi;
  }
  function sahipMi(u) {
    if (u.stok) return false;
    if (u.kiyafet) return S.kiyafetler.includes(u.id);
    if (u.aksesuar) return S.aksesuarlar.includes(u.id);
    if (u.birikir) return false;
    if (u.fx) return !!S.bayrak['aldi_' + u.id];
    return !!S.env[u.id];
  }
  function magazaCiz() {
    const kap = $('#magaza');
    const kats = [...new Set(V.MAGAZA.map(m => m.kat))];
    kap.innerHTML = kats.map(kat => `<p class="etiket kat-baslik">${kat}</p>` + V.MAGAZA.filter(m => m.kat === kat && (!m.tarz || m.tarz === K().tarz)).map(u => {
      const var_ = sahipMi(u);
      return `<div class="urun ${var_ ? 'alindi' : ''}"><b>${esc(u.ad)}${u.id === 'enerji' ? ` <small>(elde ${S.stok.enerji || 0})</small>` : ''}${u.id === 'altin' && S.altin ? ` <small>(${S.altin} gr)</small>` : ''}</b><span>${esc(u.acik)}</span>
        <button data-al="${u.id}" ${var_ || S.para < u.fiyat ? 'disabled' : ''}>${var_ ? 'Sende' : tl(u.fiyat)}</button></div>`;
    }).join('')).join('');
    kap.querySelectorAll('[data-al]').forEach(b => b.onclick = () => satinAl(bul(V.MAGAZA, b.dataset.al)));
  }
  function satinAl(u) {
    if (S.para < u.fiyat || sahipMi(u)) return;
    S.para -= u.fiyat;
    if (u.stok) S.stok.enerji = (S.stok.enerji || 0) + u.stok;
    else if (u.kiyafet) S.kiyafetler.push(u.id);
    else if (u.aksesuar) S.aksesuarlar.push(u.id);
    else if (u.birikir) S.altin += 1;
    else if (u.fx) S.bayrak['aldi_' + u.id] = true;
    else S.env[u.id] = true;
    let c = '';
    if (u.fx) c = etkiUygula(u.fx);
    if (u.id === 'bulasik') bildir('Annen çok sevindi. Sonra durdu: "Bu parayı nereden buldun?"', 3500);
    else bildir(u.ad + ' alındı.');
    Ses.kasa(); kaydet(); hudCiz();
    if (Sahne.hazir) Sahne.oda(S.env);
    magazaCiz();
  }

  /* ---------- gece olayı ve gün geçişi ---------- */
  function geceOlayi() {
    const ol = (V.GUNLER[S.gun - 1] || {}).gece;
    if (!ol || S.bayrak['olay' + S.gun]) return gunGec();
    panel.innerHTML = `<p class="etiket">Gece 03.12 · yeni bildirim</p>
      <div class="bildirim"><div class="kim"><b>${esc(ol.from)}</b><span>şimdi</span></div><p>${esc(ol.t)}</p></div>
      <div class="secenekler" id="olSec">${ol.s.map((s, j) => `<button class="secenek" data-j="${j}"><b>${esc(s.l)}</b></button>`).join('')}</div><div id="olSon"></div>`;
    Ses.bildirim(); window.scrollTo(0, 0);
    panel.querySelectorAll('[data-j]').forEach(b => b.onclick = () => {
      const s = ol.s[+b.dataset.j]; S.bayrak['olay' + S.gun] = true;
      const c = etkiUygula(s.fx); kaydet();
      $('#olSec').remove();
      $('#olSon').innerHTML = `<p class="cevap">${esc(s.c)}</p>${c}<button class="btn" id="olIleri" style="margin-top:12px">Uyu</button>`;
      $('#olIleri').onclick = gunGec;
    });
  }
  function gunGec() {
    if (S.aile >= 100) return oyunSonu('aile');
    if (S.risk >= 100) return oyunSonu('risk');
    if (S.gun >= V.SON_GUN) return dilimSonu();
    const saat = bul(V.SAATLER, (S.secim && S.secim.saat) || '23');
    S.enerji = clamp(85 - (S.yayinBitti ? saat.yorgunluk : 0));
    S.bayrak.erkenUyku = false;
    S.aile = clamp(S.aile - 3); S.risk = clamp(S.risk - 2);
    S.kur = Math.round(S.kur * (1 + R(0.001, 0.007)) * 100) / 100;
    S.gun++; S.bugun = null; S.xBugun = false;
    kaydet(); Ses.basari(); gunBasla();
  }

  /* ---------- sonlar ---------- */
  function oyunSonu(tip) {
    ekran('rapor', 'oda');
    const m = tip === 'aile'
      ? ['Pazar kahvaltısı sorgusu', 'Aile radarı doldu. Annen menemeni bıraktı, babam gazeteyi kapattı. "Oturalım, konuşalım." Telefonun masanın ortasında.']
      : ['Sabah 06.00', 'Kapı çalındı. Mal varlığına el konuldu: 1 ring light, 3 kedi kulağı, 2 gram altın. Avukatın yoktu.'];
    sil();
    panel.innerHTML = `<p class="etiket">Oyun bitti</p><h2 class="baslik">${m[0]}</h2><p class="cevap">${esc(m[1])}</p><button class="btn" id="bas">Baştan başla</button>`;
    $('#bas').onclick = giris;
  }
  function dilimSonu() {
    ekran('rapor', 'oda');
    if (Sahne.hazir) Sahne.oynat('dans', 3);
    const enIyi = S.gunler.slice().sort((a, b) => b.net - a.net)[0] || { gun: 1, net: 0 };
    const metin = `Özel Dans'ta ${S.gun} günde ${tl(S.toplamNet)} kazandım, ${sayi(S.takipci)} takipçiye ulaştım. Annem hâlâ bilmiyor (aile radarı %${Math.round(S.aile)}) 🔗`;
    const url = /^https?:$/.test(location.protocol) && !/claude\.(ai|site)|claudeusercontent/.test(location.hostname) ? location.href.split('#')[0] : '';
    const xLink = 'https://x.com/intent/tweet?text=' + encodeURIComponent(metin) + (url ? '&url=' + encodeURIComponent(url) : '');
    panel.innerHTML = `
      <p class="etiket">${V.SON_GUN} günlük dilimin sonu</p>
      <h2 class="baslik">${esc(K().ad)} ilk haftasını yarıladı</h2>
      <div class="sayilar">
        <div class="sayi"><small>Toplam net</small><b>${tl(S.toplamNet)}</b></div>
        <div class="sayi"><small>Takipçi</small><b>${sayi(S.takipci)}</b></div>
        <div class="sayi"><small>Abone</small><b>${sayi(S.abone)}</b></div>
        <div class="sayi"><small>En iyi gün</small><b>Gün ${enIyi.gun}</b></div>
        <div class="sayi"><small>Aile radarı</small><b>%${Math.round(S.aile)}</b></div>
        <div class="sayi"><small>Gerçek yüz</small><b>${S.kanit}/3</b></div>
      </div>
      <p class="cevap">Devamı geliyor: ev sahibinin %60 zammı, @AileDegerleriTR dosyası, kiralık 1+1 ve kardeşinin haftalık "susma ücreti".</p>
      <a class="btn x" href="${xLink}" target="_blank" rel="noopener">X'te paylaş</a>
      <div class="satir"><button class="btn ikincil" id="menu">Ana menü</button><button class="btn ikincil" id="bas">Baştan başla</button></div>`;
    $('#menu').onclick = giris;
    $('#bas').onclick = () => onayla('Kayıt silinsin ve yeni karakter oluşturulsun mu?', 'Sil ve başla', () => { sil(); S = null; karakterOlustur(); });
  }

  /* ================= TELEFON ================= */
  const telefonEl = $('#telefon'), durumEl = $('#durum'), ekranIc = $('#ekranIc');
  // uygulama simgeleri: kendi çizimimiz (beyaz glif, renkli zemin)
  const svg = (ic, vb = '0 0 24 24') => `<svg class="ik" viewBox="${vb}" aria-hidden="true">${ic}</svg>`;
  const LOGO_DK = svg('<path fill="#fff" d="M12 21.3l-1.4-1.3C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.6 11.5z"/><circle cx="12" cy="10" r="2.3" fill="#b02a7a"/><path d="M11 11.5h2l.8 4.2h-3.6z" fill="#b02a7a"/>');
  const IKON = {
    dans: LOGO_DK,
    mesaj: svg('<path fill="#fff" d="M12 3.5c5 0 9 3.4 9 7.7s-4 7.7-9 7.7c-1 0-2-.1-2.9-.4L4.5 20.3l1.2-3.6C4 15.3 3 13.3 3 11.2 3 6.9 7 3.5 12 3.5z"/>'),
    x: '<b class="ik-x">𝕏</b>',
    aile: svg('<path fill="#fff" d="M12 3.2 2.8 10.4h2.6V20h5v-5h3.2v5h5v-9.6h2.6z"/><path fill="#128c4a" d="M12 16.6l-.6-.5c-1.8-1.6-3-2.6-3-3.9 0-1 .8-1.8 1.8-1.8.6 0 1.3.3 1.8.8.5-.5 1.2-.8 1.8-.8 1 0 1.8.8 1.8 1.8 0 1.3-1.2 2.3-3 3.9z" transform="translate(0 -2)"/>'),
    banka: svg('<rect x="2.5" y="5.5" width="19" height="13" rx="2.5" fill="#fff"/><rect x="2.5" y="8.5" width="19" height="2.6" fill="#c47d10"/><rect x="5" y="13.5" width="5" height="2" rx="1" fill="#c47d10"/>'),
    kargo: svg('<path fill="#fff" d="M12 2.5l8.5 4.3v10.4L12 21.5l-8.5-4.3V6.8z"/><path fill="none" stroke="#e0491b" stroke-width="1.6" d="M3.8 7 12 11.2 20.2 7M12 11.2V21M7.8 4.7l8.3 4.3"/>'),
    kamera: svg('<path fill="#fff" d="M8.5 5h7l1.4 2H20a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4 7h3.1z"/><circle cx="12" cy="12.8" r="3.6" fill="#2a2a33"/><circle cx="12" cy="12.8" r="2.2" fill="#6b6b78"/><circle cx="18.2" cy="9.4" r=".9" fill="#ff4f8b"/>'),
    ayar: svg('<g fill="#fff">' + [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="10.5" y="1.8" width="3" height="5" rx="1" transform="rotate(${i * 45} 12 12)"/>`).join('') + '<circle cx="12" cy="12" r="7"/></g><circle cx="12" cy="12" r="2.8" fill="#4b4b55"/>')
  };
  const UYG = [
    { id: 'dans', ad: 'DansKasa', ik: IKON.dans, renk: 'linear-gradient(135deg,#ff4f8b,#7a2bff)' },
    { id: 'mesaj', ad: 'Mesajlar', ik: IKON.mesaj, renk: 'linear-gradient(135deg,#3ad1ff,#2a6bff)' },
    { id: 'x', ad: 'X', ik: IKON.x, renk: '#0b0b0b' },
    { id: 'aile', ad: 'Aile', ik: IKON.aile, renk: 'linear-gradient(135deg,#2bd96b,#128c4a)' },
    { id: 'banka', ad: 'Kasabank', ik: IKON.banka, renk: 'linear-gradient(135deg,#f5c451,#c47d10)' },
    { id: 'kargo', ad: 'Kargola', ik: IKON.kargo, renk: 'linear-gradient(135deg,#ff8a3d,#e0491b)' },
    { id: 'kamera', ad: 'Kamera', ik: IKON.kamera, renk: 'linear-gradient(135deg,#5b5b66,#2a2a33)' },
    { id: 'ayar', ad: 'Ayarlar', ik: IKON.ayar, renk: 'linear-gradient(135deg,#8a8a95,#4b4b55)' }
  ];
  const UYG_EKRAN = ['ana', 'mesaj', 'x', 'aile', 'banka', 'kargo', 'ayar', 'dk'];
  function durumCiz() {
    if (!durumEl) return;
    const pil = S ? Math.round(clamp(S.enerji, 1, 100)) : 87;
    durumEl.innerHTML = `<b>${esc(S && S.saat ? S.saat : '09:41')}</b><span class="d-sag"><span class="sinyal"><i></i><i></i><i></i><i></i></span><span>5G</span><span class="pil${pil < 20 ? ' az' : ''}"><i style="width:${pil}%"></i></span><span>${pil}</span></span>`;
  }
  function saatIleri(dk) {
    if (!S) return;
    const [h, m] = (S.saat || '09:00').split(':').map(Number);
    const t = (h * 60 + m + dk) % 1440;
    S.saat = String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
    durumCiz();
  }
  function bildirimEkle(app, kim, metin, sessiz) {
    S.bildirim.unshift({ app, kim, metin, saat: S.saat });
    S.bildirim = S.bildirim.slice(0, 25);
    if (app === 'mesaj' || app === 'aile' || app === 'x') S.okunmamis[app] = (S.okunmamis[app] || 0) + 1;
    if (!sessiz) {
      const u = bul(UYG, app) || UYG[0];
      const el = document.createElement('div'); el.className = 'banner';
      el.innerHTML = `<span class="b-ik" style="background:${u.renk}">${u.ik}</span><div><b>${esc(kim)}</b><span>${esc(metin)}</span></div>`;
      (telefonEl || document.body).appendChild(el); setTimeout(() => el.remove(), 3200);
      Ses.bildirim();
    }
  }
  function uygBas(baslik, renk, sag) {
    return `<div class="uyg-bas" style="--uc:${renk}"><button class="geri" id="geriBtn" aria-label="Ana ekran">‹</button><b>${baslik}</b><span class="uyg-sag">${sag || ''}</span></div>`;
  }
  function geriBagla(fn) { const g = $('#geriBtn'); if (g) g.onclick = () => { Ses.tik(); if (fn) istenenGecis = 'geri'; (fn || ana)(); }; }

  /* ---------- gün başlangıcı: bildirimler, DM'ler, aile grubu ---------- */
  function gunBasla() {
    S.asama = 'ana'; S.bugun = null; S.yayinBitti = false; S.saat = '09:' + String(5 + (S.gun * 7) % 40).padStart(2, '0');
    S.gunluk = { ppv: 0, dm: 0, tl: 0, cekim: 0, ppvSatis: 0 };
    rnd = tohumlu(S.tohum + S.gun * 101);
    if (!S.secim) S.secim = { tema: 'sohbet', saat: '23', kiyafet: 'tisort', kedikulak: false };
    const gunV = V.GUNLER[S.gun - 1] || {};
    // hikâye mesajları
    if (gunV.sabah) {
      const aile = /Annen|Kardeşin|Babam/.test(gunV.sabah.from);
      if (aile) { S.aileM.push({ kim: gunV.sabah.from.replace('Annen', 'Annem').replace('Kardeşin', 'Kardeşim'), t: gunV.sabah.t, saat: S.saat }); bildirimEkle('aile', gunV.sabah.from, gunV.sabah.t, true); }
      else { dmEkle({ kim: gunV.sabah.from, renk: '#7ee0ff', tur: 'bilgi', mesajlar: [{ t: gunV.sabah.t }] }); bildirimEkle('mesaj', gunV.sabah.from, gunV.sabah.t, true); }
    }
    if (gunV.ek) { S.aileM.push({ kim: 'Annem', t: gunV.ek.t, saat: S.saat }); bildirimEkle('aile', 'Annem', gunV.ek.t, true); }
    // aile grubu: aile radarına göre
    const seviye = S.aile < 30 ? 'dusuk' : S.aile < 60 ? 'orta' : 'yuksek';
    karistir(V.AILE[seviye]).slice(0, 2).forEach(([kim, t]) => { S.aileM.push({ kim, t: sablon(t), saat: S.saat }); bildirimEkle('aile', kim, t, true); });
    S.aileSoru = seviye === 'dusuk' ? null : { kim: 'Annem', t: seviye === 'orta' ? 'Cevap versene, gece ne yapıyorsun?' : 'Bu akşam konuşacağız. Bir açıklaman var mı?' };
    S.aileM = S.aileM.slice(-40);
    // gece sızan içerik (dünkü satışlardan)
    if (S.sizinti) { bildirimEkle('x', '@ifsa_arsivi_tr', S.sizinti, true); S.xAkis.unshift({ ben: false, kim: 'İfşa Arşivi', h: '@ifsa_arsivi_tr', t: S.sizinti, gor: 4000 + S.takipci * 20 }); S.sizinti = null; }
    // günün DM'leri
    dmGunluk();
    kaydet();
    ana();
  }

  /* ---------- ana ekran ---------- */
  function ana() {
    if (!S) return giris();
    S.asama = 'ana';
    ekran('ana');
    const B = S.bugun;
    const bugunGelir = (B ? B.bahsis + B.aboneGelir : 0) + S.gunluk.ppv + S.gunluk.dm;
    const rozet = id => { const n = S.okunmamis[id] || (id === 'mesaj' ? S.dmler.filter(d => !d.okundu).length : 0); return n ? `<i class="uyg-rozet">${n > 9 ? '9+' : n}</i>` : ''; };
    panel.innerHTML = `
      <div class="kilit-saat"><b>${esc(S.saat)}</b><span>${GUN_ADI[(S.gun - 1) % 7]}, ${TARIH(S.gun)}</span></div>
      <div class="widgetlar">
        <button class="widget dk" data-uyg="dans"><small>DansKasa · bugün</small><b>${usd(bugunGelir)}</b><span>${sayi(S.abone)} abone · ${sayi(S.takipci)} takipçi</span><span class="w-durum">${S.yayinBitti ? '✅ yayın yapıldı' : '🔴 akşam yayını bekliyor'}</span></button>
        <div class="widget"><small>Kasabank</small><b>${tl(S.para)}</b>
          <div class="w-bar"><span>Aile radarı</span><div class="bar aile"><i style="width:${S.aile}%"></i></div></div>
          <div class="w-bar"><span>Risk</span><div class="bar risk"><i style="width:${S.risk}%"></i></div></div></div>
      </div>
      ${S.bildirim.length ? `<div class="bildirimler">${S.bildirim.slice(0, 3).map(b => { const u = bul(UYG, b.app) || UYG[0]; return `<button class="bld" data-uyg="${b.app}"><span class="b-ik" style="background:${u.renk}">${u.ik}</span><div><b>${esc(b.kim)}</b><span>${esc(b.metin)}</span></div><small>${esc(b.saat)}</small></button>`; }).join('')}</div>` : ''}
      <div class="uygulamalar">${UYG.map(u => `<button class="uyg" data-uyg="${u.id}"><span class="uyg-ik" style="background:${u.renk}">${u.ik}${rozet(u.id)}</span><span>${u.ad}</span></button>`).join('')}</div>
      <div class="dock"><button class="btn gece-btn" id="gunBitir">🌙 Günü bitir · Gün ${S.gun}/${V.SON_GUN}</button></div>`;
    panel.querySelectorAll('[data-uyg]').forEach(b => b.onclick = () => { Ses.tik(); uygAc(b.dataset.uyg); });
    $('#gunBitir').onclick = gunBitir;
    kaydet();
  }
  function uygAc(id) {
    if (id === 'dans') return dansKasa('panel');
    if (id === 'kamera') return dansKasa('icerik');
    if (id === 'mesaj') return mesajlar();
    if (id === 'x') return xUyg();
    if (id === 'aile') return aileUyg();
    if (id === 'banka') return banka();
    if (id === 'kargo') return kargola();
    if (id === 'ayar') return ayarlar();
  }

  /* ---------- DansKasa ---------- */
  function dkBas(sekme) {
    return uygBas('DansKasa', '#ff4f8b', `<span class="dk-kasa">${usd((S.bugun ? S.bugun.bahsis + S.bugun.aboneGelir : 0) + S.gunluk.ppv + S.gunluk.dm)}</span>`) +
      `<div class="sekme dk-sekme" role="tablist">${[['panel', 'Panel'], ['canli', 'Canlı yayın'], ['icerik', 'Kilitli içerik']].map(([i, a]) => `<button role="tab" data-dk="${i}" aria-selected="${sekme === i}">${a}</button>`).join('')}</div>`;
  }
  function dkBagla() { geriBagla(); panel.querySelectorAll('[data-dk]').forEach(b => b.onclick = () => { Ses.tik(); dansKasa(b.dataset.dk); }); }
  function dansKasa(sekme) {
    if (sekme === 'canli') return S.yayinBitti ? yayinOzet() : yayinHazirlik();
    if (sekme === 'icerik') return icerikSekme();
    ekran('dk', 'yakin');
    if (Sahne.hazir) { Sahne.karakter(gorunum()); Sahne.oda(S.env); Sahne.oynat('poz', 1.5); }
    const trend = gunTrend();
    const satan = S.icerikler.reduce((s, i) => s + i.satis, 0);
    panel.innerHTML = dkBas('panel') + `
      <div class="profil-kart"><div class="pav buyuk">${esc([...K().ad][0].toUpperCase())}</div><div><b>${esc(K().ad)} <span class="tik2">✓</span></b><span>@${esc(K().kullanici)} · ${bul(V.TARZ, K().tarz).ad} · 18+</span></div></div>
      <div class="sayilar">
        <div class="sayi"><small>Abone</small><b>${sayi(S.abone)}</b></div>
        <div class="sayi"><small>Takipçi</small><b>${sayi(S.takipci)}</b></div>
        <div class="sayi"><small>Abonelik</small><b>${usd(V.ABONE_UCRET)}</b></div>
        <div class="sayi"><small>Kilitli satış</small><b>${sayi(satan)}</b></div>
        <div class="sayi"><small>Bugün PPV</small><b>${usd(S.gunluk.ppv)}</b></div>
        <div class="sayi"><small>Bugün DM</small><b>${usd(S.gunluk.dm)}</b></div>
      </div>
      <div class="kart"><p class="etiket">Bugünün trendi</p><div class="trend"><span class="cip ${yasGrubu(K().yas) === trend.yas ? 'es' : ''}">#${bul(V.YAS_GRUBU, trend.yas).ad.toLowerCase()}</span><span class="cip ${K().tarz === trend.tarz ? 'es' : ''}">#${bul(V.TARZ, trend.tarz).ad.toLowerCase()}</span><span class="cip">${bul(V.TEMALAR, trend.tema).ad}</span></div></div>
      <div class="satir"><button class="btn" id="dkCanli">${S.yayinBitti ? 'Yayın özeti' : '🔴 Yayın hazırlığı'}</button><button class="btn ikincil" id="dkIcerik">📸 Kilitli içerik çek</button></div>
      <button class="btn ikincil" id="dkKart">Paylaşım kartı oluştur</button>`;
    dkBagla();
    $('#dkCanli').onclick = () => dansKasa('canli'); $('#dkIcerik').onclick = () => dansKasa('icerik'); $('#dkKart').onclick = () => paylasimKarti();
  }
  function yayinOzet() {
    ekran('dk', 'yakin');
    const B = S.bugun;
    panel.innerHTML = dkBas('canli') + `
      <div class="kart"><p class="etiket">Bugünkü yayın bitti</p><div class="dokum">
        <div><span>Bahşiş</span><span>${usd(B.bahsis)} · ${sayi(B.jeton || 0)} jeton</span></div>
        <div><span>Yeni abone</span><span>${B.abone}</span></div><div><span>En yüksek izleyici</span><span>${sayi(B.enYuksek)}</span></div>
        <div><span>En çok bahşiş</span><span>${B.enBahsisci ? '@' + esc(B.enBahsisci) : '-'}</span></div>
        ${B.hedef ? `<div><span>Hedef</span><span>🎯 ${esc(B.hedef)}</span></div>` : ''}${B.iade ? `<div class="eksi"><span>İade</span><span>${sayi(B.iade)} jeton</span></div>` : ''}
      </div></div>
      <p class="ipucu">Bir gün bir yayın. Gece kilitli içerik satabilir, DM'lere cevap verebilir, X'te paylaşım yapabilirsin.</p>
      <div class="satir"><button class="btn" id="ozX">${B.tweet ? "X'e git" : "X'te paylaş"}</button><button class="btn ikincil" id="ozKart">Paylaşım kartı</button></div>`;
    dkBagla(); $('#ozX').onclick = () => B.tweet ? xUyg() : yayinSonu(); $('#ozKart').onclick = () => paylasimKarti();
  }

  /* ---------- kilitli içerik: çekim, galeri, toplu satış ---------- */
  function icerikCesaret(ic) { return kiyafetBilgi(ic.kiyafet).cesaret + ((bul(V.CEKIM_SET, ic.set) || {}).bonus > 0.07 ? 1 : 0); }
  function icerikSekme() {
    ekran('dk', 'yakin');
    if (Sahne.hazir) { Sahne.karakter(gorunum()); Sahne.oda(S.env); }
    const kalan = 3 - S.gunluk.cekim;
    panel.innerHTML = dkBas('icerik') + `
      <div class="kart"><p class="etiket">Kilitli içerik (PPV)</p><p class="alt">Çek, fiyat koy, abonelerine kilitli gönder ya da DM'de sat. Önizleme bulanık gider; kilidi açan görür. Cesur kare daha çok satar ama sızma riski de büyür.</p>
        <button class="btn" id="yeniCekim" ${kalan <= 0 || S.enerji < 10 ? 'disabled' : ''}>📸 Yeni çekim (${Math.max(0, kalan)} hakkın kaldı · −10 enerji)</button></div>
      <p class="etiket">Galeri (${S.icerikler.length})</p>
      <div class="galeri">${S.icerikler.length ? S.icerikler.slice().reverse().map(i => `<button class="g-oge" data-ic="${i.id}"><img src="${i.img || ''}" alt=""><span class="g-fiyat">${usd(i.fiyat)}</span><span class="g-alt">${'🔥'.repeat(icerikCesaret(i))} · ${i.satis} satış</span>${i.sizdi ? '<span class="g-sizdi">SIZDI</span>' : ''}</button>`).join('') : '<p class="alt">Henüz içerik yok.</p>'}</div>`;
    dkBagla();
    const y = $('#yeniCekim'); if (y) y.onclick = cekim;
    panel.querySelectorAll('[data-ic]').forEach(b => b.onclick = () => icerikDetay(S.icerikler.find(i => i.id === b.dataset.ic)));
  }
  function cekim() {
    const c = { set: 'yatak', poz: 'poz', kiyafet: S.secim.kiyafet || 'tisort' };
    function ciz() {
      ekran('cekim', 'foto_' + c.set);
      if (Sahne.hazir) { Sahne.karakter(Object.assign(gorunum(), { kiyafet: c.kiyafet })); Sahne.oda(S.env); Sahne.mum(c.set === 'mum'); Sahne.oynat(c.poz === 'sergile' ? 'sergile' : c.poz, 99); }
      ust.innerHTML = '<div class="vizor"><span></span><span></span><span></span><span></span><b>● REC</b></div>';
      panel.innerHTML = uygBas('Kamera', '#5b5b66') + `
        <div class="grup"><span class="etiket">Set</span><div class="cipler">${V.CEKIM_SET.map(s => `<button class="cip" data-set="${s.id}" aria-pressed="${c.set === s.id}">${s.ad}</button>`).join('')}</div><p class="alt">${esc(bul(V.CEKIM_SET, c.set).acik)}</p></div>
        <div class="grup"><span class="etiket">Kıyafet</span><div class="cipler">${S.kiyafetler.map(id => `<button class="cip" data-k="${id}" aria-pressed="${c.kiyafet === id}">${kiyafetAdi(id)}</button>`).join('')}</div></div>
        <div class="grup"><span class="etiket">Poz</span><div class="cipler">${V.CEKIM_POZ.map(p => `<button class="cip" data-p="${p.id}" aria-pressed="${c.poz === p.id}">${p.ad}</button>`).join('')}</div></div>
        <div class="yapiskan"><button class="btn" id="cek">📸 Çek</button></div>`;
      geriBagla(() => { Sahne.mum(false); icerikSekme(); });
      panel.querySelectorAll('[data-set]').forEach(b => b.onclick = () => { c.set = b.dataset.set; ciz(); });
      panel.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { c.kiyafet = b.dataset.k; ciz(); });
      panel.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { c.poz = b.dataset.p; ciz(); });
      $('#cek').onclick = () => {
        $('#cek').disabled = true; Ses.kasa();
        const flas = document.createElement('div'); flas.className = 'flas'; ust.appendChild(flas);
        setTimeout(() => Sahne.fotograf(img => { Sahne.mum(false); fiyatla(c, img); }), Sahne.hazir ? 350 : 0);
        if (!Sahne.hazir) fiyatla(c, null);
      };
    }
    ciz();
  }
  function fiyatla(c, img) {
    S.gunluk.cekim++; S.enerji = clamp(S.enerji - 10); saatIleri(40);
    const ic = { id: 'i' + Date.now().toString(36), gun: S.gun, set: c.set, kiyafet: c.kiyafet, img, fiyat: 8, satis: 0, gelir: 0, altyazi: sec(V.ALTYAZI), sizdi: false };
    const ces = icerikCesaret(ic);
    ic.fiyat = [5, 8, 12, 18, 25][Math.min(4, ces)];
    S.icerikler.push(ic);
    // depolama sınırı: eski görselleri at
    S.icerikler.forEach((x, i) => { if (i < S.icerikler.length - 10) x.img = null; });
    kaydet();
    icerikDetay(ic, true);
  }
  function icerikDetay(ic, yeni) {
    ekran('icerik', null);
    const ces = icerikCesaret(ic);
    panel.innerHTML = uygBas(yeni ? 'Yeni içerik' : 'İçerik', '#ff4f8b') + `
      <div class="ic-onizle"><img src="${ic.img || ''}" alt="Çekilen kare"><span class="ic-etiket">${'🔥'.repeat(ces) || 'gündelik'} · ${esc(bul(V.CEKIM_SET, ic.set).ad)} · ${esc(kiyafetBilgi(ic.kiyafet).ad)}</span></div>
      <div class="grup kaydir"><label for="fiyatK">Kilit fiyatı</label><b id="fiyatD">${usd(ic.fiyat)}</b><input type="range" id="fiyatK" min="3" max="60" step="1" value="${ic.fiyat}"></div>
      <div class="grup"><span class="etiket">Altyazı</span><div class="cipler">${V.ALTYAZI.slice(0, 6).map(a => `<button class="cip" data-a="${esc(a)}" aria-pressed="${ic.altyazi === a}">${esc(a)}</button>`).join('')}</div></div>
      <p class="ipucu">Tahmini alıcı: <b id="tahmin">-</b> abone · tahmini gelir <b id="tahminG">-</b>. ${ces >= 3 ? 'İç giyim karesi: sızarsa aile radarı fırlar.' : ''}</p>
      <div class="satir"><button class="btn" id="topluGonder" ${ic.gonderildi ? 'disabled' : ''}>${ic.gonderildi ? 'Abonelere gönderildi' : '🔒 Abonelere kilitli gönder'}</button><button class="btn ikincil" id="geriGaleri">Galeri</button></div>`;
    geriBagla(icerikSekme); $('#geriGaleri').onclick = icerikSekme;
    const tahmin = () => { const p = satinAlmaOrani(ic); const n = Math.round(S.abone * p); $('#tahmin').textContent = sayi(n); $('#tahminG').textContent = usd(n * ic.fiyat * (1 - V.PLATFORM_KESINTI)); };
    const k = $('#fiyatK'); k.oninput = () => { ic.fiyat = +k.value; $('#fiyatD').textContent = usd(ic.fiyat); tahmin(); };
    panel.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { ic.altyazi = b.dataset.a; panel.querySelectorAll('[data-a]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    tahmin();
    const t = $('#topluGonder'); if (t && !ic.gonderildi) t.onclick = () => topluSat(ic);
  }
  function satinAlmaOrani(ic) {
    const ces = icerikCesaret(ic), set = bul(V.CEKIM_SET, ic.set);
    const deger = 4 + ces * 7 + set.bonus * 40 + (S.env.ringlight ? 3 : 0);
    return clamp(0.06 + ces * 0.06 + set.bonus - Math.max(0, ic.fiyat - deger) * 0.012 + (S.sadakat - 50) * 0.002, 0.01, 0.7) / 100 * 100;
  }
  function topluSat(ic) {
    ic.gonderildi = true;
    const ces = icerikCesaret(ic);
    const n = Math.round(S.abone * satinAlmaOrani(ic) * R(0.75, 1.25));
    const gelir = n * ic.fiyat;
    ic.satis += n; ic.gelir += gelir; S.gunluk.ppv += gelir; S.gunluk.ppvSatis += n;
    S.risk = clamp(S.risk + ces * 1.5); S.takipci += Math.round(n * 0.5);
    // sızma riski: alıcı sayısı ve cesaretle artar, bir sonraki sabah X'te çıkar
    if (n > 0 && rnd() < Math.min(0.5, 0.03 * ces * (1 + n / 15)) && !S.sizinti) {
      ic.sizdi = true; S.sizinti = `DansKasa'dan sızdı: @${K().kullanici} "${ic.altyazi}" 👀 (bulanık değil artık)`; S.aile = clamp(S.aile + 8 + ces * 3); S.takipci += 80 + ces * 40;
    }
    kaydet();
    // satışlar damla damla bildirim olarak gelir
    const alicilar = karistir(Sohbet.KISI).slice(0, Math.min(5, n));
    alicilar.forEach((k, i) => setTimeout(() => bildirimEkle('dans', 'DansKasa', `🔓 ${k.ad} kilidi açtı · ${usd(ic.fiyat)}`), 600 + i * 900));
    panel.querySelector('.ipucu').innerHTML = n ? `<b>${sayi(n)}</b> abone kilidi açtı · ${usd(gelir)} (kesinti öncesi). ${ic.sizdi ? 'Ama birisi ekran görüntüsü aldı… 😬' : ''}` : 'Kimse almadı. Fiyat yüksek ya da kare fazla sıradan.';
    const t = $('#topluGonder'); t.disabled = true; t.textContent = 'Abonelere gönderildi';
  }

  /* ---------- Mesajlar: DM ekonomisi ---------- */
  function dmEkle(d) { d.id = d.id || 'd' + Math.random().toString(36).slice(2, 8); d.okundu = false; d.bitti = d.bitti || false; d.saat = S.saat; S.dmler.unshift(d); S.dmler = S.dmler.slice(0, 18); return d; }
  function dmGunluk() {
    const kisiler = karistir(Sohbet.KISI.filter(k => k.tur !== 'troll' && k.tur !== 'bot'));
    const istek = karistir(V.DM_ISTEK).slice(0, 2);
    istek.forEach((q, i) => { const k = kisiler[i]; dmEkle({ kim: k.ad, renk: k.renk, tur: 'istek', istek: { ces: q.ces, set: q.set, teklif: Math.round(R(q.teklif[0], q.teklif[1])) }, mesajlar: [{ t: q.t }] }); });
    if (S.gun >= 2 || rnd() < 0.5) { const q = sec(V.DM_OZEL), k = kisiler[3]; dmEkle({ kim: k.ad, renk: k.renk, tur: 'ozel', istek: { ces: q.ces, set: q.set, teklif: q.teklif }, mesajlar: [{ t: q.t }] }); }
    const fk = kisiler[4]; dmEkle({ kim: fk.ad, renk: fk.renk, tur: 'flort', mesajlar: [{ t: sec(V.DM_FLORT) }] });
    if (S.gun >= 2 && rnd() < 0.7) { const q = sec(V.DM_SAPIK), k = { ad: 'user_' + Math.floor(R(1000, 9999)), renk: '#ff6161' }; dmEkle({ kim: k.ad, renk: k.renk, tur: 'sapik', alt: q.tur, mesajlar: [{ t: q.t }] }); }
    const hik = V.DM.filter(d => !S.kullanilanDM.includes(d.id));
    if (hik.length) { const d = sec(hik); dmEkle({ kim: d.from, renk: '#c79bff', tur: 'hikaye', hid: d.id, mesajlar: [{ t: sablon(d.t) }] }); }
    S.dmler.filter(d => !d.okundu).slice(0, 3).forEach(d => bildirimEkle('mesaj', d.kim, d.mesajlar[0].t, true));
  }
  function mesajlar() {
    ekran('mesaj'); S.okunmamis.mesaj = 0;
    panel.innerHTML = uygBas('Mesajlar', '#2a6bff', `<small>${S.dmler.filter(d => !d.okundu).length} yeni</small>`) + `
      <div class="dm-liste">${S.dmler.length ? S.dmler.map(d => `<button class="dm-oge${d.okundu ? '' : ' yeni'}${d.bitti ? ' bitti' : ''}" data-dm="${d.id}">${avatar(d.kim)}<div><b style="color:${d.renk}">${esc(d.kim)}</b><span>${esc(d.mesajlar[d.mesajlar.length - 1].t || (d.mesajlar[d.mesajlar.length - 1].kilit ? '🔒 Kilitli içerik' : ''))}</span></div><small>${d.tur === 'ozel' ? '💎' : d.tur === 'istek' ? '💸' : d.tur === 'sapik' ? '⚠️' : ''} ${esc(d.saat)}</small></button>`).join('') : '<p class="alt">Mesaj yok.</p>'}</div>`;
    geriBagla(); panel.querySelectorAll('[data-dm]').forEach(b => b.onclick = () => { istenenGecis = 'ileri'; dmAc(S.dmler.find(d => d.id === b.dataset.dm)); });
    kaydet();
  }
  function dmAc(d) {
    ekran('mesaj'); d.okundu = true; kaydet();
    // son karşı mesajdan önceki kendi mesajlarım okundu sayılır
    let sonKarsi = -1; d.mesajlar.forEach((m, i) => { if (!m.ben) sonKarsi = i; });
    const alt = (m, i) => `<small class="b-saat">${esc(m.saat || d.saat || '')}${m.ben ? `<i class="tik${i < sonKarsi || d.yaziyor ? ' okundu' : ''}">✓✓</i>` : ''}</small>`;
    const balon = (m, i) => m.kilit ? `<div class="balon ben kilit"><img src="${(S.icerikler.find(x => x.id === m.kilit) || {}).img || ''}" alt=""><span>🔒 ${usd(m.fiyat)}${m.acildi ? ' · açıldı ✓' : ''}</span>${alt(m, i)}</div>` : `<div class="balon ${m.ben ? 'ben' : ''}${/^💸|^🔓/.test(m.t) ? ' para' : ''}">${esc(m.t)}${alt(m, i)}</div>`;
    const durum = d.yaziyor ? '<em class="yaziyor-yazi">yazıyor…</em>' : d.bitti ? 'son görülme ' + esc(S.saat) : 'çevrimiçi';
    let secenek = [];
    if (!d.bitti) {
      if (d.tur === 'istek' || d.tur === 'ozel') secenek = [['gonder', `🔒 Galeriden kilitli gönder (teklif ${usd(d.istek.teklif)})`], ['pazarlik', `💬 Pazarlık: ${usd(Math.round(d.istek.teklif * 1.6))} iste`], ['flort', '😘 Flört et, oyala'], ['red', 'Reddet']];
      else if (d.tur === 'flort') secenek = [['flort', '😘 Flört et (bahşiş gelebilir)'], ['sesli', '🎧 Sesli mesaj at (−5 enerji)'], ['red', 'Görmezden gel']];
      else if (d.tur === 'sapik') secenek = d.alt === 'bedava' ? [['engelle', '🚫 Engelle'], ['bedava', 'Bir tane bedava at']] : d.alt === 'ifsa' ? [['engelle', '🚫 Engelle ve şikâyet et'], ['cevap', 'Semtini söyle']] : [['bildir', '🚫 Engelle, platforma bildir'], ['ode', `$200 öde`]];
      else if (d.tur === 'hikaye') { const h = V.DM.find(x => x.id === d.hid); if (h) secenek = h.s.map((s, j) => ['h' + j, s.l]); }
    }
    panel.innerHTML = uygBas(`<span class="dm-bas">${avatar(d.kim)}<span><b style="color:${d.renk || '#fff'}">${esc(d.kim)}</b><small>${durum}</small></span></span>`, d.renk || '#2a6bff', d.tur === 'ozel' ? '<small>💎 VIP</small>' : d.tur === 'sapik' ? '<small class="uyari">⚠️ şüpheli</small>' : '')
      + `<div class="dm-akis"><p class="gun-ayrac">Bugün</p>${d.mesajlar.map(balon).join('')}${d.yaziyor ? '<div class="balon yaziyor"><i></i><i></i><i></i></div>' : ''}</div>
      <div class="dm-sec">${secenek.length ? `<div class="hizli">${secenek.map(([id, l]) => `<button class="hizli-c" data-s="${id}">${esc(l)}</button>`).join('')}</div>` : ''}
        <div class="dm-yaz"><span>${d.bitti ? 'Sohbet kapandı' : 'Mesaj yaz…'}</span><b>${secenek.length ? '➤' : '🎤'}</b></div></div>`;
    geriBagla(mesajlar);
    panel.querySelectorAll('[data-s]').forEach(b => b.onclick = () => dmSecim(d, b.dataset.s));
    ekranIc.scrollTop = ekranIc.scrollHeight;
  }
  function dmCevap(d, t, gecikme = 700) {
    // önce "yazıyor…", sonra mesaj; uzun mesaj daha uzun yazılır
    const acik = () => document.body.dataset.ekran === 'mesaj' && panel.querySelector('.dm-akis');
    setTimeout(() => { d.yaziyor = (d.yaziyor || 0) + 1; if (acik()) dmAc(d); }, Math.min(400, gecikme / 2));
    setTimeout(() => {
      d.yaziyor = Math.max(0, (d.yaziyor || 1) - 1); d.mesajlar.push({ t, saat: S.saat }); kaydet(); Ses.bildirim();
      if (acik()) dmAc(d);
    }, gecikme + 500 + Math.min(1400, t.length * 18));
  }
  function dmSecim(d, s) {
    const k = Sohbet.kisi(d.kim) || { comert: 0.4 };
    Ses.tik();
    if (s === 'gonder') return galeriSec(d);
    if (s === 'pazarlik') {
      d.mesajlar.push({ ben: true, saat: S.saat, t: `Bu kadar özel bir şey için ${usd(Math.round(d.istek.teklif * 1.6))} olur 😏` });
      if (rnd() < 0.3 + k.comert * 0.5) { d.istek.teklif = Math.round(d.istek.teklif * 1.6); dmCevap(d, sec(['Tamam… ikna oldum 🥵 gönder', 'Pahalısın ama değersin 💸', 'Of tamam, ama iyi bir şey olsun'])); }
      else { d.bitti = true; dmCevap(d, sec(['Bu fiyata başkası var', 'Çok pahalı, boşver 🙄', 'Kartım limitte, başka zaman'])); }
      kaydet(); return dmAc(d);
    }
    if (s === 'flort') {
      d.mesajlar.push({ ben: true, saat: S.saat, t: sec(['Belki… sabırlı olana 😘', 'Sen hep böyle tatlı mısın?', 'Bu gece yayında bekliyorum 🔥', 'Kilidi açan bilir 😏']) });
      if (rnd() < 0.35 + k.comert * 0.3) { const b = Math.round(R(2, 9)); S.gunluk.dm += b; dmCevap(d, `💸 ${usd(b)} bahşiş gönderdi: "${sec(['sadece cevap verdin diye', 'kalbim', 'yarın da yaz'])}"`); }
      else dmCevap(d, sec(['😳😳', 'ben eridim', 'uyuyamayacağım şimdi']));
      S.sadakat = clamp(S.sadakat + 1); if (d.tur === 'flort') d.bitti = true; kaydet(); return dmAc(d);
    }
    if (s === 'sesli') { S.enerji = clamp(S.enerji - 5); d.mesajlar.push({ ben: true, saat: S.saat, t: '🎧 Sesli mesaj (0:14) · fısıltıyla "iyi geceler"' }); const b = Math.round(R(5, 15)); S.gunluk.dm += b; dmCevap(d, `💸 ${usd(b)} gönderdi: "bunu her gece dinleyeceğim"`); d.bitti = true; kaydet(); return dmAc(d); }
    if (s === 'red') { d.bitti = true; d.mesajlar.push({ ben: true, saat: S.saat, t: 'Bu sefer olmaz 🙂' }); dmCevap(d, sec(['tamam 💔', 'ben de seni çok seviyordum', 'neyse, başka yayıncı mı yok'])); kaydet(); return dmAc(d); }
    if (s === 'engelle' || s === 'bildir') { d.bitti = true; d.mesajlar.push({ ben: true, saat: S.saat, t: '🚫 Engellendi ve bildirildi' }); S.risk = clamp(S.risk - 2); d.mesajlar.push({ t: 'DansKasa Güvenlik: Hesap incelemeye alındı. Kişisel bilgilerini asla paylaşma.' }); kaydet(); return dmAc(d); }
    if (s === 'bedava') { d.bitti = true; d.mesajlar.push({ ben: true, saat: S.saat, t: '🔓 Bedava bir kare gönderildi' }); S.sizinti = `Bedava diye atılan kare dolaşıyor: @${K().kullanici} 👀`; S.aile = clamp(S.aile + 6); dmCevap(d, 'teşekkürler 😏 (ödeme yapmadı, kareyi 12 gruba attı)'); kaydet(); return dmAc(d); }
    if (s === 'cevap') { d.bitti = true; d.mesajlar.push({ ben: true, saat: S.saat, t: 'Kadıköy taraflarındayım' }); S.risk = clamp(S.risk + 12); S.aile = clamp(S.aile + 5); dmCevap(d, 'harika, yakındayız 🙂 (bu iyi bir fikir değildi)'); kaydet(); return dmAc(d); }
    if (s === 'ode') { d.bitti = true; S.gunluk.tl -= Math.round(200 * S.kur); d.mesajlar.push({ ben: true, saat: S.saat, t: `💸 $200 gönderildi` }); dmCevap(d, 'güzel. haftaya yine konuşuruz.'); kaydet(); return dmAc(d); }
    if (s[0] === 'h') {
      const h = V.DM.find(x => x.id === d.hid), sc = h.s[+s.slice(1)];
      S.kullanilanDM.push(h.id); d.bitti = true; d.mesajlar.push({ ben: true, saat: S.saat, t: sc.l.replace(/^"|"$/g, '') });
      const c = etkiUygula(sc.fx); dmCevap(d, sablon(sc.c)); kaydet(); dmAc(d);
      if (c) panel.insertAdjacentHTML('beforeend', c);
    }
  }
  function galeriSec(d) {
    const liste = S.icerikler.filter(i => i.img || true).slice().reverse();
    perde.innerHTML = `<div class="kart"><p class="etiket">Galeriden seç · ${esc(d.kim)} istiyor: ${'🔥'.repeat(d.istek.ces)}${d.istek.set ? ' · ' + esc(bul(V.CEKIM_SET, d.istek.set).ad) : ''}</p>
      <div class="galeri kucuk">${liste.length ? liste.map(i => `<button class="g-oge" data-ic="${i.id}"><img src="${i.img || ''}" alt=""><span class="g-alt">${'🔥'.repeat(icerikCesaret(i))} · ${esc(bul(V.CEKIM_SET, i.set).ad)}</span></button>`).join('') : '<p class="alt">Galeri boş. Önce DansKasa > Kilitli içerik ile çekim yap.</p>'}</div>
      <button class="btn ikincil" id="gsKapat">Vazgeç</button></div>`;
    perde.hidden = false;
    $('#gsKapat').onclick = () => { perde.hidden = true; };
    perde.querySelectorAll('[data-ic]').forEach(b => b.onclick = () => { perde.hidden = true; kilitliGonder(d, S.icerikler.find(i => i.id === b.dataset.ic)); });
  }
  function kilitliGonder(d, ic) {
    const ces = icerikCesaret(ic), q = d.istek;
    d.mesajlar.push({ ben: true, saat: S.saat, kilit: ic.id, fiyat: q.teklif, acildi: false });
    const uygun = ces >= q.ces && (!q.set || q.set === ic.set);
    if (uygun) {
      d.bitti = true; const m = d.mesajlar[d.mesajlar.length - 1]; m.acildi = true;
      ic.satis++; ic.gelir += q.teklif; S.gunluk.dm += q.teklif; S.risk = clamp(S.risk + ces * 0.8); S.sadakat = clamp(S.sadakat + 2);
      dmCevap(d, `🔓 Kilidi açtı · ${usd(q.teklif)}`, 500);
      dmCevap(d, d.tur === 'ozel' ? sec(['Bu… beklediğimden de iyi. Haftaya yine sipariş 💎', 'Adımı görünce kalbim durdu 🥵', 'Kimseye göstermeyeceğim. Söz. (Muhtemelen)']) : sec(['Değdi 🔥', 'Uyuyamayacağım şimdi', 'Bir tane daha olur mu? 😳', 'Sen bir sanatçısın']), 1300);
      if (rnd() < 0.05 * ces && !S.sizinti) { ic.sizdi = true; S.sizinti = `Bir "sadık hayran" paylaştı: @${K().kullanici} özel kare 👀`; S.aile = clamp(S.aile + 6); }
    } else dmCevap(d, q.set && q.set !== ic.set ? `Bu değil… ${bul(V.CEKIM_SET, q.set).ad} istemiştim 🥺` : sec(['Bu biraz fazla masum 😅 daha cesur bir şey yok mu?', 'Ben daha özel bir şey bekliyordum 👀', 'Bunu yayında da gördüm zaten']));
    kaydet(); dmAc(d);
  }

  /* ---------- Aile grubu ---------- */
  function aileUyg() {
    ekran('aile'); S.okunmamis.aile = 0;
    const soru = S.aileSoru;
    panel.innerHTML = uygBas('Aile 🏠❤️', '#128c4a', `<small>${4} kişi</small>`) + `<div class="wa">${S.aileM.slice(-14).map(m => `<div class="wa-m${m.ben ? ' ben' : ''}">${m.ben ? '' : `<b>${esc(m.kim)}</b>`}<span>${esc(m.t)}</span><small>${esc(m.saat || '')}</small></div>`).join('')}</div>
      ${soru ? `<div class="secenekler dm-sec"><button class="secenek" data-a="0"><b>"Ders çalışıyordum / film izliyordum 🙂"</b></button><button class="secenek" data-a="1"><b>"Ben de çalışıyorum anne, internetten iş"</b></button><button class="secenek" data-a="2"><b>Mesajı görüldü bırak</b></button></div>` : ''}`;
    geriBagla();
    panel.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const i = +b.dataset.a; S.aileSoru = null;
      const cev = [['Ders çalışıyordum / film izliyordum 🙂', 'Annem', 'Gece 2\'de mi? Peki… 🤨', -4], ['Ben de çalışıyorum, internetten iş', 'Babam', 'Ne işi bu? Vergisi ödeniyor mu?', 6], [null, 'Annem', 'Görüldü atıyor bir de 😤', 3]][i];
      if (cev[0]) S.aileM.push({ ben: true, kim: 'Ben', t: cev[0], saat: S.saat });
      S.aileM.push({ kim: cev[1], t: cev[2], saat: S.saat }); S.aile = clamp(S.aile + cev[3]); kaydet(); aileUyg();
    });
    kaydet();
  }

  /* ---------- X ---------- */
  function xUyg() {
    ekran('x'); S.okunmamis.x = 0;
    const B = S.bugun;
    const tw = p => `<div class="tw">${avatar(p.kim || K().ad)}<div style="min-width:0"><div class="kim"><b>${esc(p.kim || K().ad)}</b> <span>${esc(p.h || '@' + K().kullanici)}</span></div><div class="tx">${esc(p.t)}</div>${p.img ? `<div class="tw-img"><img src="${p.img}" alt=""><span>🔒 link bio'da</span></div>` : ''}<div class="meta"><span>💬 ${kisa((p.gor || 100) * 0.006)}</span><span>🔁 ${kisa((p.gor || 100) * 0.01)}</span><span>♡ ${kisa((p.gor || 100) * 0.04)}</span><span>📊 ${kisa(p.gor || 100)}</span></div></div></div>`;
    panel.innerHTML = uygBas('X', '#0b0b0b') + `
      <div class="x-profil">${avatar(K().ad)}<div><b>${esc(K().ad)}</b><span>@${esc(K().kullanici)} · ${sayi(S.takipci)} takipçi</span><span class="x-bio">🔞 link bio'da 🔗 · özel dans · DM kapalı (değil)</span></div></div>
      <div class="satir"><button class="btn x" id="xYaz" ${S.xBugun ? 'disabled' : ''}>${S.xBugun ? 'Bugün paylaştın' : B && !B.tweet ? 'Yayın hakkında paylaş' : 'Kilitli kare tanıt'}</button></div>
      <div class="xkap">${S.xAkis.length ? S.xAkis.slice(0, 12).map(tw).join('') : '<p class="alt" style="padding:14px">Henüz paylaşım yok.</p>'}</div>`;
    geriBagla();
    const y = $('#xYaz'); if (y && !S.xBugun) y.onclick = () => (B && !B.tweet) ? yayinSonu() : xKareTanit();
    kaydet();
  }
  function xKareTanit() {
    const ic = S.icerikler.slice().reverse().find(i => i.img);
    if (!ic) { bildir('Tanıtacak kare yok. Önce çekim yap.'); return; }
    const ces = icerikCesaret(ic);
    const metin = ic.altyazi + ' Kilidi açan bilir. Link bio\'da 🔗';
    const gor = (S.takipci * 4 + 300) * R(0.8, 1.4) * (1 + ces * 0.6);
    S.xAkis.unshift({ t: metin, img: ic.img, gor });
    S.xBugun = true; S.takipci += Math.round(gor * 0.012); S.risk = clamp(S.risk + 2 + ces * 1.5); S.aile = clamp(S.aile + ces);
    const yanit = karistir(V.X_YANIT.cesur.concat(V.X_YANIT.genel)).slice(0, 3);
    yanit.forEach(y => S.xAkis.splice(1, 0, { kim: y.n, h: y.h, t: sablon(y.t), gor: gor * 0.05 }));
    // tanıtım, toplu satışa ek alıcı getirir
    const ek = Math.round(gor * 0.002 * (1 + ces)); ic.satis += ek; S.gunluk.ppv += ek * ic.fiyat; S.gunluk.ppvSatis += ek;
    bildirimEkle('x', 'X', `Paylaşımın ${kisa(gor)} görüntülendi · ${ek} kişi kilidi açtı`);
    kaydet(); xUyg();
  }

  /* ---------- Kasabank, Kargola, Ayarlar ---------- */
  function banka() {
    ekran('banka');
    panel.innerHTML = uygBas('Kasabank', '#c47d10') + `
      <div class="kart banka-kart"><small>Vadesiz hesap</small><b>${tl(S.para)}</b><span>Kur: 1 $ = ${S.kur.toFixed(2).replace('.', ',')} TL${S.altin ? ' · ' + S.altin + ' gr altın' : ''}</span></div>
      ${S.risk > 50 ? '<p class="ipucu">⚠️ Hesabınıza yurt dışından düzenli para girişi tespit edildi. Bilgi talebi gelebilir.</p>' : ''}
      <p class="etiket">Hesap hareketleri</p>
      <div class="dokum">${S.islemler.length ? S.islemler.slice(0, 20).map(x => `<div class="${x.tutar < 0 ? 'eksi' : 'arti'}"><span>Gün ${x.gun} · ${esc(x.ad)}</span><span>${x.tutar < 0 ? '−' : '+'}${tl(Math.abs(x.tutar))}</span></div>`).join('') : '<p class="alt">Henüz hareket yok. DansKasa ödemeleri gün sonunda yatar.</p>'}</div>`;
    geriBagla();
  }
  function kargola() {
    ekran('kargo');
    panel.innerHTML = uygBas('Kargola', '#e0491b', `<small>${tl(S.para)}</small>`) + '<p class="alt">Aynı gün kargo. Paket kapıya gelir, annen açmadan yetiş.</p><div class="magaza" id="magaza"></div>';
    geriBagla(); magazaCiz();
  }
  function ayarlar() {
    ekran('ayar');
    panel.innerHTML = uygBas('Ayarlar', '#4b4b55') + `
      <div class="secenekler"><button class="secenek" id="aySes"><b>Ses: ${Ses.acik ? 'açık' : 'kapalı'}</b><span>Bildirim, bahşiş ve kapı sesleri</span></button>
        <button class="secenek" id="ayMenu"><b>Ana menüye dön</b><span>Kayıt korunur</span></button>
        <button class="secenek" id="aySil"><b>Kaydı sil, baştan başla</b><span>Geri alınamaz</span></button></div>
      <p class="dipnot">Özel Dans kurmaca bir hicivdir. Tüm kişiler, hesaplar ve platformlar hayal ürünüdür. Çıplaklık ve açık cinsel içerik yoktur.</p>`;
    geriBagla();
    $('#aySes').onclick = () => { Ses.degistir(); ayarlar(); };
    $('#ayMenu').onclick = giris;
    $('#aySil').onclick = () => onayla('Kayıt silinsin mi?', 'Sil', () => { sil(); S = null; giris(); });
  }

  /* ---------- gün sonu ---------- */
  function gunBitir() {
    if (!S.yayinBitti) return onayla('Bugün yayın yapmadın. Yine de günü bitirmek istiyor musun?', 'Bitir', () => { S.bugun = S.bugun || null; saatIleri(600); rapor(); });
    saatIleri(120); rapor();
  }

  /* ---------- paylaşım kartı (X için görsel) ---------- */
  function paylasimKarti() {
    const B = S.bugun || { bahsis: 0, aboneGelir: 0, abone: 0, enBahsisci: null, jeton: 0 };
    const gelir = B.bahsis + B.aboneGelir + S.gunluk.ppv + S.gunluk.dm;
    const c = document.createElement('canvas'); c.width = 720; c.height = 900; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 720, 900); gr.addColorStop(0, '#1a0f22'); gr.addColorStop(1, '#3a0d2a'); g.fillStyle = gr; g.fillRect(0, 0, 720, 900);
    g.fillStyle = 'rgba(255,79,139,.18)'; g.beginPath(); g.arc(600, 120, 220, 0, 7); g.fill();
    g.fillStyle = '#ff4f8b'; g.font = '800 34px system-ui, sans-serif'; g.fillText('DansKasa', 56, 92);
    g.fillStyle = '#cbbfd6'; g.font = '500 24px system-ui, sans-serif'; g.fillText(`Gün ${S.gun} · ${TARIH(S.gun)} · @${K().kullanici}`, 56, 136);
    g.fillStyle = '#fff'; g.font = '800 120px system-ui, sans-serif'; g.fillText(usd(gelir), 56, 300);
    g.fillStyle = '#cbbfd6'; g.font = '500 28px system-ui, sans-serif'; g.fillText('bugünkü kazanç (≈ ' + tl(gelir * S.kur) + ')', 56, 350);
    const satir = [['Yeni abone', String(B.abone || 0)], ['Kilitli satış', String(S.gunluk.ppvSatis)], ['En cömert hayran', B.enBahsisci ? '@' + B.enBahsisci : '—'], ['Aile radarı', '%' + Math.round(S.aile)], ['Asgari ücretin', '%' + Math.round(gelir * S.kur / V.ASGARI_UCRET * 100)]];
    satir.forEach(([a, b], i) => { const y = 450 + i * 74; g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(56, y - 46, 608, 62); g.fillStyle = '#cbbfd6'; g.font = '500 26px system-ui, sans-serif'; g.fillText(a, 76, y - 6); g.fillStyle = '#fff'; g.font = '700 28px system-ui, sans-serif'; const w = g.measureText(b).width; g.fillText(b, 644 - w, y - 6); });
    g.fillStyle = '#f5c451'; g.font = '700 26px system-ui, sans-serif'; g.fillText('Özel Dans · tarayıcıda oyna · 18+ hiciv', 56, 860);
    const url = c.toDataURL('image/png');
    const metin = `Özel Dans'ta bugün ${usd(gelir)} kazandım, annem hâlâ bilmiyor (aile radarı %${Math.round(S.aile)}) 💃🔒 #ÖzelDans`;
    const adres = /^https?:$/.test(location.protocol) && !/claude\.(ai|site)|claudeusercontent/.test(location.hostname) ? location.href.split('#')[0] : '';
    perde.innerHTML = `<div class="kart"><p class="etiket">Paylaşım kartı</p><img class="kart-img" src="${url}" alt="Bugünkü kazanç kartı"><p class="dipnot">Görseli kaydetmek için üstüne uzun bas. Sonra X'te paylaş.</p>
      <a class="btn x" href="https://x.com/intent/tweet?text=${encodeURIComponent(metin)}${adres ? '&url=' + encodeURIComponent(adres) : ''}" target="_blank" rel="noopener">X'te paylaş</a><button class="btn ikincil" id="kartKapat">Kapat</button></div>`;
    perde.hidden = false; $('#kartKapat').onclick = () => { perde.hidden = true; };
  }

  /* ---------- başlat ---------- */
  function baslat() {
    let ok = false;
    try { ok = !!window.THREE && window.Sahne.baslat($('#sahne')); } catch (e) { ok = false; }
    if (!ok) {
      const el = document.createElement('div'); el.className = 'sahne-hata';
      el.textContent = '3D sahne bu cihazda açılamadı. Oyun yine de oynanır.'; $('#sahne').appendChild(el);
      window.Sahne = new Proxy({ hazir: false }, { get: (t, k) => k in t ? t[k] : () => { } });
    }
    giris();
  }
  baslat();
})();
