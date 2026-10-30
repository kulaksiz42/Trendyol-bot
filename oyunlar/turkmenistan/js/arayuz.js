/* Başbakan — arayüz: açılış, seçim gecesi, göstergeler, kartlar, paneller. */
'use strict';
(function () {
  const V = window.VERI, SEC = window.SECIM2002, ui = document.getElementById('ui');
  const GUN_SURE = 0.11; // 1× hızda bir gün (sn)
  let S = null, modal = true, acc = 0, sonT = performance.now(), mod = 'destek', panel = null, ilSecimi = null, haberler = [];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const yz = (v, d = 1) => '%' + v.toFixed(d).replace('.', ',');
  const sayi = v => Math.round(v).toLocaleString('tr-TR');

  /* ---------- simgeler ---------- */
  const BAYRAK = `<svg class="bayrak" viewBox="0 0 30 20"><rect width="30" height="20" fill="#28ae66"/><rect x="4" width="5" height="20" fill="#b5172f"/>${[2.5, 6.5, 10.5, 14.5, 18].map(y => `<circle cx="6.5" cy="${y}" r="1.3" fill="#f2c94c"/>`).join('')}<circle cx="16" cy="6" r="3.2" fill="#fff"/><circle cx="17.2" cy="5.6" r="2.7" fill="#28ae66"/>${[[19, 3.5], [21, 4.5], [21.5, 6.8], [20, 8.6], [18, 9.3]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".6" fill="#fff"/>`).join('')}</svg>`;
  const ARMA = `<svg class="armasi" viewBox="0 0 80 80"><circle cx="40" cy="40" r="38" fill="#28ae66"/><circle cx="40" cy="40" r="34" fill="none" stroke="#f2c94c" stroke-width="1.5"/><circle cx="40" cy="40" r="22" fill="#b5172f"/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${40 + 13 * Math.cos((a - 90) * Math.PI / 180)}" cy="${40 + 13 * Math.sin((a - 90) * Math.PI / 180)}" r="4.5" fill="#f2c94c"/>`).join('')}<circle cx="40" cy="40" r="5" fill="#fff"/></svg>`;
  function amblem(k, b = 26) {
    const r = V.PARTI[k].renk, w = `width="${b}" height="${b}"`;
    if (V.ULKE === 'tm') return `<svg ${w} viewBox="0 0 26 26"><rect width="26" height="26" rx="6" fill="${r}"/><text x="13" y="17.5" text-anchor="middle" font-family="Inter" font-weight="800" font-size="11" fill="#fff">${{ akp: '★', ras: '✕', bos: '○' }[k]}</text></svg>`;
    const ic = {
      akp: `<path d="M13 4.5a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V18h5.2v-.7c0-.8.4-1.5 1-2A6 6 0 0 0 13 4.5z" fill="#fff"/><rect x="10.6" y="19" width="4.8" height="2.2" rx="1" fill="#fff"/><path d="M13 8v4.5M11.3 10.2h3.4" stroke="${r}" stroke-width="1.2"/>`,
      chp: [0, 60, 120, 180, 240, 300].map(a => `<g transform="rotate(${a} 13 13)"><path d="M13 13V4.2" stroke="#fff" stroke-width="1.6"/><path d="M13 3l-2 2.6h4z" fill="#fff"/></g>`).join(''),
      mhp: [[13, 8], [8.5, 16], [17.5, 16]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#fff"/><circle cx="${x + 1.3}" cy="${y}" r="2.9" fill="${r}"/>`).join('')
    }[k] || `<text x="13" y="17.5" text-anchor="middle" font-family="Inter" font-weight="800" font-size="${k === 'dig' ? 9 : 10}" fill="#fff">${k === 'dig' ? 'DİĞ' : V.PARTI[k].ad}</text>`;
    return `<svg ${w} viewBox="0 0 26 26"><rect width="26" height="26" rx="6" fill="${r}"/>${ic}</svg>`;
  }
  function meclis(sandalye) {
    const sira = ['dig', 'chp', 'dyp', 'gp', 'akp', 'mhp'], noktalar = [], R = 12, yarlar = [...Array(R)].map((_, r) => 36 + r * 8.5);
    const topY = yarlar.reduce((a, b) => a + b, 0); let kalan = 550;
    yarlar.forEach((yar, r) => {
      const n = r === R - 1 ? kalan : Math.round(yar * 550 / topY); kalan -= n;
      for (let i = 0; i < n; i++) { const a = Math.PI - Math.PI * i / (n - 1); noktalar.push({ a, x: 150 + yar * Math.cos(a), y: 140 - yar * Math.sin(a) }); }
    });
    noktalar.sort((p, q) => q.a - p.a); const top = Math.min(550, noktalar.length);
    let i = 0, s = '';
    sira.forEach(k => { for (let j = 0; j < (sandalye[k] || 0) && i < top; j++, i++) s += `<circle cx="${noktalar[i].x.toFixed(1)}" cy="${noktalar[i].y.toFixed(1)}" r="2.5" fill="${V.PARTI[k].renk}"/>`; });
    for (; i < top; i++) s += `<circle cx="${noktalar[i].x.toFixed(1)}" cy="${noktalar[i].y.toFixed(1)}" r="2.5" fill="#2a3a4c"/>`;
    return `<svg class="meclis" viewBox="0 0 300 150">${s}<text x="150" y="132" text-anchor="middle" fill="#fff" font-family="Barlow Condensed" font-weight="700" font-size="26">${sandalye.akp || 0}</text><text x="150" y="146" text-anchor="middle" fill="#93a6ba" font-family="Inter" font-size="9">çoğunluk 276</text></svg>`;
  }

  /* ---------- açılış ---------- */
  function acilis() {
    const varK = Sim.kayitVar();
    ui.innerHTML = `<div class="acilis"><div class="k">${ARMA}<h1>BAŞKAN</h1><div class="alt-b">Türkmenistan · 1991'den bugüne</div>
      <p>27 Ekim 1991, Aşgabat. Sovyetler Birliği çöküyor ve Türkmenistan bağımsız. Dünyanın en büyük gaz rezervlerinden birinin üstündesin, ama boru hatlarının hepsi Rusya'dan geçiyor. Devlet başkanı sensin. Olaylar gerçek; kararlar senin.</p>
      <input id="ad" maxlength="24" placeholder="Adın (ör. Serdar Atayev)" autocomplete="off">
      <button class="btn" id="basla">Bağımsızlığı ilan et</button>
      ${varK ? '<button class="btn ikincil" id="devam" style="margin-top:8px">Kayıtlı oyuna devam et</button>' : ''}
      <div class="uyari">Oyundaki lider kurgusaldır. Olaylar kaynaklara göre özetlenmiştir; Türkmenistan'ın resmî istatistikleri bağımsız kuruluşlarca tartışmalıdır, rakamlar yaklaşıktır.</div></div></div>`;
    ui.querySelector('#basla').onclick = () => { S = Sim.yeni(ui.querySelector('#ad').value.trim() || 'Başkan'); anaEkran(); modal = false; haritaRenk(); };
    if (varK) ui.querySelector('#devam').onclick = () => { S = Sim.yukle(); anaEkran(); modal = false; haritaRenk(true); Harita.projeleriCiz(S.projeler); };
    Object.keys(Harita.iller).forEach(ad => Harita.ilAyarla(ad, '#4a5a6c', 0.5, true));
    document.body.classList.add('basta');
  }

  /* ---------- ana ekran ---------- */
  function anaEkran() {
    ui.innerHTML = `<div class="ust"><div class="bar">${BAYRAK}<div class="tarih"><b id="trh"></b><span id="unvan"></span></div>
      <div class="hiz"><button data-h="0" aria-label="Duraklat">❚❚</button><button data-h="1">1×</button><button data-h="2">2×</button><button data-h="4">4×</button></div></div>
      <div class="gostergeler" id="gos"></div><div class="serit"><em>GÜNDEM</em><div><span id="hbr"></span></div></div></div>
      <div class="lejant" id="lej"></div><button class="gundem-btn" id="gundem">📨 Gündem <b>0</b></button>
      <nav class="alt"><button data-p="ekonomi"><span>📊</span>Ekonomi</button><button data-p="yatirim" id="btnYat"><span>🏗️</span>Yatırım</button><button data-p="halk"><span>👥</span>Halk</button><button data-p="dunya"><span>🌍</span>Dünya</button><button data-p="gorunum"><span>🗺️</span>Harita</button></nav>`;
    ui.querySelectorAll('[data-h]').forEach(b => b.onclick = () => hiz(+b.dataset.h));
    ui.querySelectorAll('[data-p]').forEach(b => b.onclick = () => panelAc(b.dataset.p));
    S.masa = S.masa || []; S.log = S.log || [];
    ui.querySelector('#gundem').onclick = () => panelAc('gundem');
    hiz(S.hiz || 1); hud(); haberEkle(null); lejant(); gundemRozet();
  }
  function hiz(h) { S.hiz = h; ui.querySelectorAll('[data-h]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.h === h)); }
  let onceki = null;
  function hud() {
    const t = Sim.gunTarih(S.gun), e = S.eko;
    const trh = ui.querySelector('#trh'); if (!trh) return;
    trh.textContent = `${t.getUTCDate()} ${V.AYLAR[t.getUTCMonth()]} ${t.getUTCFullYear()}`;
    ui.querySelector('#unvan').textContent = 'Devlet Başkanı ' + S.ad + ' · ' + { kapali: 'Tek parti', kontrollu: 'Kontrollü açılım', acik: 'Çok partili' }[S.pol.acilim]; if (0) ui.querySelector('#unvan').textContent = S.iktidar ? (S.b.basbakan ? 'Başbakan ' : 'Genel Başkan ') + S.ad + (S.b.koalisyon ? ' · Koalisyon' : '') : 'Genel Başkan ' + S.ad + ' · Muhalefet';
    const by = ui.querySelector('#btnYat'); if (by) by.innerHTML = S.iktidar ? '<span>🏗️</span>Yatırım' : '<span>📣</span>Kampanya';
    const o = onceki || {};
    document.body.classList.remove('basta');
    const ok = (v, a, iyiArtis) => a === undefined || Math.abs(v - a) < 0.05 ? '' : (v > a) === iyiArtis ? `<i class="iyi">▲</i>` : `<i class="kotu">▼</i>`;
    const kur = S.b.ytl ? e.kur.toFixed(2).replace('.', ',') : sayi(e.kur * 1e6);
    const kasa = ['anket', 'Parti kasası', '$' + S.kasa.toFixed(1).replace('.', ',') + ' mn', ''];
    const kurY = Sim.yil() < 1993.84 ? 'ruble' : e.kur >= 100 ? sayi(e.kur) : e.kur.toFixed(2).replace('.', ',');
    ui.querySelector('#gos').innerHTML = [
      ['anket', 'Gerçek destek', yz(S.anket), ok(S.anket, o.anket, true)],
      ['', 'Büyüme', yz(e.buyume), ok(e.buyume, o.buyume, true)],
      ['', 'Enflasyon', e.enf > 100 ? '%' + sayi(e.enf) : yz(e.enf), ok(e.enf, o.enf, false)],
      ['', 'Manat/$ resmî', kurY, ''],
      ['', 'Gaz ihracatı', Math.round(e.gaz) + ' mlr m³', ok(e.gaz, o.gaz, true)],
      ['', 'Rezerv', '$' + e.rezerv.toFixed(1).replace('.', ',') + ' mlr', ok(e.rezerv, o.rezerv, true)],
      ['', 'Kişi başı', '$' + sayi(e.kisiBasi), '']
    ].map(([c, ad, v, ar]) => `<div class="gos ${c}"><small>${ad}</small><b>${v}${ar}</b></div>`).join('');
  }
  function aylikHud() { onceki = { gaz: S.eko.gaz, rezerv: S.eko.rezerv, anket: S.anket, enf: S.eko.enf, buyume: S.eko.buyume, kur: S.eko.kur, issizlik: S.eko.issizlik, borc: S.eko.borc }; }
  function haberEkle(m) {
    if (m) haberler.unshift(m); haberler = haberler.slice(0, 3);
    const el = ui.querySelector('#hbr'); if (!el) return;
    const metin = haberler.length ? haberler.join('   •   ') : 'Aşgabat\'ta bağımsızlığın ilk günleri.';
    if (el.textContent !== metin) { el.textContent = metin; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; el.style.animationDuration = Math.max(14, metin.length / 7) + 's'; }
  }
  function lejant() {
    const el = ui.querySelector('#lej'); if (!el) return;
    el.innerHTML = mod === 'destek' ? `Sana destek <i style="background:linear-gradient(90deg,#2f4257,#c9b48a,#e8590c)"></i>` : 'Önde giden parti: ' + ['akp', 'chp', 'mhp', 'dyp', 'dig'].map(k => `<span style="color:${V.PARTI[k].renk}">■</span>`).join('');
  }
  function bildirim(m, sure = 2600) {
    document.querySelectorAll('.bildirim').forEach(x => x.remove());
    const el = document.createElement('div'); el.className = 'bildirim'; el.textContent = m; document.body.appendChild(el);
    setTimeout(() => el.remove(), sure);
  }

  /* ---------- harita renkleri ---------- */
  const DUSUK = new THREE.Color('#2f4257'), ORTA = new THREE.Color('#c9b48a'), YUKSEK = new THREE.Color('#e8590c');
  function haritaRenk(ani, anket) {
    const a = anket || Sim.anketHesap();
    Object.entries(a.iller).forEach(([il, p]) => {
      if (mod === 'destek') {
        const k = Math.max(0, Math.min(1, (p.akp - 15) / 50));
        const c = k < 0.5 ? DUSUK.clone().lerp(ORTA, k * 2) : ORTA.clone().lerp(YUKSEK, k * 2 - 1);
        Harita.ilAyarla(il, c.getStyle(), 0.4 + p.akp / 100 * 7, ani);
      } else {
        let en = 'akp'; Sim.PARTILER.forEach(k => { if (p[k] > p[en]) en = k; });
        Harita.ilAyarla(il, V.PARTI[en].renk, 0.4 + p[en] / 100 * 7, ani);
      }
    });
  }

  /* ---------- zaman döngüsü ---------- */
  function dongu(t) {
    const dt = Math.min(0.2, (t - sonT) / 1000); sonT = t;
    if (S && !modal && !panel && S.hiz > 0) {
      acc += dt * S.hiz;
      while (acc >= GUN_SURE && !modal) {
        acc -= GUN_SURE;
        const o = Sim.gunGec();
        if (o.ay) {
          haritaRenk(false, o.anket); hud(); aylikHud(); Harita.projeleriCiz(S.projeler); Harita.mitingCiz(S.iktidar ? {} : S.miting); Sim.kaydet();
          o.biten.forEach(p => { const P = V.PROJE[p.tip]; bildirim(`${P.ikon} ${P.ad} ${p.il}'de hizmete açıldı`); haberEkle(`${p.il}: ${P.ad} açıldı`); logla(`${P.ikon} ${p.il}: ${P.ad} açıldı`); });
          if (o.yil) bildirim(`Yeni yıl: yatırım ödeneği ${S.odenek.toFixed(1).replace('.', ',')} milyar`);
        }
        const tStr = Sim.iso(Sim.gunTarih(S.gun)), h = V.HABER.find(x => x[0] === tStr); if (h) haberEkle(h[1]);
        const ol = Sim.bekleyenOlay(); if (ol) olayIsle(ol);
        const gec = !modal && ((S.masa || []).find(m => S.gun - m.gelis >= sureOf(m.id)) || (S.masa.length >= DOSYA_MAX && S.masa[0]));
        if (gec) { acc = 0; dosyaAc(gec.id, true); }
      }
      hud();
    } else acc = 0;
    requestAnimationFrame(dongu);
  }
  const DOSYA_SURE = 60, DOSYA_MAX = 3;
  const sureOf = id => { const o = V.OLAY.find(x => x.id === id); return o && o.sure !== undefined ? o.sure : DOSYA_SURE; };
  const KARAR_TUR = ['karar', 'butce', 'asgari'];
  function logla(m) { S.log = S.log || []; const t = Sim.gunTarih(S.gun); S.log.unshift({ t: `${t.getUTCDate()} ${V.AYLAR[t.getUTCMonth()].slice(0, 3)} ${t.getUTCFullYear()}`, m }); S.log = S.log.slice(0, 40); }
  function olayIsle(ol) {
    S.masa = S.masa || [];
    if (ol.tur === 'haber') {
      Sim.etkiUygula(ol.etki); Sim.olayBitti(ol); haberEkle(ol.baslik); logla('🔴 ' + ol.baslik + ': ' + ol.metin);
      bildirim('🔴 Son dakika: ' + ol.baslik); return;
    }
    if (KARAR_TUR.includes(ol.tur) && ol.id !== 'kurulus') {
      S.masa.push({ id: ol.id, gelis: S.gun }); gundemRozet();
      const ad = ol.baslik || (ol.tur === 'butce' ? ol.yil + ' bütçesi' : ol.yil + ' asgari ücreti');
      bildirim('📨 Masanda yeni dosya: ' + ad); haberEkle(ad); return;
    }
    acc = 0; olayAc(ol);
  }
  function gundemRozet() {
    const b = ui.querySelector('#gundem'); if (!b) return; const n = (S.masa || []).length;
    b.classList.toggle('var', n > 0); b.querySelector('b').textContent = n;
  }
  function dosyaAc(id, zorunlu) { if (document.querySelector('.kart-ort')) return; const o = V.OLAY.find(x => x.id === id); if (o) olayAc(o, zorunlu); }

  /* ---------- olay kartları ---------- */
  function kartAc(html, kur) {
    modal = true; panelKapat();
    const el = document.createElement('div'); el.className = 'kart-ort'; el.innerHTML = `<div class="kart">${html}</div>`;
    document.body.appendChild(el); if (kur) kur(el); return el;
  }
  const tarihYazi = s => { const [y, a, g] = s.split('-'); return `${+g} ${V.AYLAR[+a - 1]} ${y}`; };
  function ipuclari(et) {
    const o = [];
    const ekle = (ad, v) => { if (!v) return; o.push(`<span class="${v > 0 ? 'a' : 'e'}">${ad} ${v > 0 ? '▲' : '▼'}</span>`); };
    Object.entries(et.k || {}).forEach(([k, v]) => ekle(V.KESIM[k].ad, v));
    Object.entries(et.i || {}).forEach(([k, v]) => ekle(V.KURUM[k].ad, v));
    Object.entries(et.d || {}).forEach(([k, v]) => ekle(V.DIS[k].ad, v));
    if (et.e && et.e.guven) ekle('Piyasa', et.e.guven);
    return o.join('');
  }
  // karar kartının üstü: sonraya bırak / süre doldu
  function dosyaUst(o, z) {
    if (o.id === 'kurulus') return '';
    const m = (S.masa || []).find(x => x.id === o.id); if (!m) return '';
    if (S.gun - m.gelis >= sureOf(o.id)) z = true;
    if (z && S.masa.length >= DOSYA_MAX && S.gun - m.gelis < sureOf(o.id)) return '<span class="zorunlu">📚 Masan doldu, önce bu dosyaya karar ver</span>';
    return z ? '<span class="zorunlu">⏰ Süre doldu, karar vermen gerekiyor</span>' : `<button class="sonra" data-sonra>Sonraya bırak · ${Math.max(0, sureOf(o.id) - (S.gun - m.gelis))} gün</button>`;
  }
  function sonraBagla(el) { const b = el.querySelector('[data-sonra]'); if (b) b.onclick = () => { el.remove(); modal = false; gundemRozet(); }; }
  function olayAc(o, z) {
    if (o.yer === 'Siirt') S.b.basbakan = 1;
    if (o.tur === 'karar') return kararKart(o, z);
    if (o.tur === 'haber') return haberKart(o);
    if (o.tur === 'butce') return butceKart(o, z);
    if (o.tur === 'asgari') return asgariKart(o, z);
    if (o.tur === 'secim') return secimEkrani(o);
    if (o.tur === 'son') return sonKart(o);
  }
  function kapatVeDevam(el, o) {
    el.remove(); Sim.olayBitti(o); modal = false; haritaRenk(); hud(); gundemRozet(); Sim.kaydet();
    if (o.id === 'kurulus') setTimeout(() => bildirim('🏗️ Yatırım menüsünden boru hattı kur: gaz geliri her şeyin anahtarı', 5000), 400);
  }
  function kararKart(o, z) {
    const el = kartAc(`<div class="ust-serit"><span>Türkmenbaşı Sarayı · Karar</span><span class="yer">${esc(o.yer || '')} · ${tarihYazi(o.t)}</span></div>
      <div class="govde">${dosyaUst(o, z)}<h2>${esc(o.baslik)}</h2><p>${esc(o.metin)}</p>
      ${o.s.map((s, i) => `<button class="secenek" data-i="${i}">${esc(s.ad)}<div class="ip">${ipuclari(s.etki)}</div></button>`).join('')}</div>`);
    sonraBagla(el);
    el.querySelectorAll('.secenek').forEach(b => b.onclick = () => {
      const s = o.s[+b.dataset.i]; if (o.e) Sim.etkiUygula({ e: o.e }); Sim.etkiUygula(s.etki);
      S.kararlar = (S.kararlar || 0) + 1; if (s.tarih) S.tarihle = (S.tarihle || 0) + 1;
      haberEkle(o.baslik + ': ' + s.ad); logla('✍️ ' + o.baslik + ': ' + s.ad);
      el.querySelector('.kart').innerHTML = `<div class="ust-serit"><span>Kararın</span><span class="yer">${tarihYazi(o.t)}</span></div><div class="govde"><h2>${esc(s.ad)}</h2>
        ${s.sonuc ? `<p>${esc(s.sonuc)}</p>` : ''}<div class="ip">${ipuclari(s.etki)}</div>
        <div class="tarihte"><b>${s.tarih ? 'Tarihteki kararla aynı' : 'Gerçekte ne oldu?'}</b>${esc(o.tarih)}</div>
        <button class="btn" id="dv">Devam</button></div>`;
      el.querySelector('#dv').onclick = () => kapatVeDevam(el, o);
    });
  }
  function haberKart(o) {
    Sim.etkiUygula(o.etki);
    const el = kartAc(`<div class="ust-serit son"><span>Son dakika</span><span class="yer" style="color:#fff">${tarihYazi(o.t)}</span></div>
      <div class="govde"><h2>${esc(o.baslik)}</h2><p>${esc(o.metin)}</p><div class="ip">${ipuclari(o.etki)}</div><button class="btn" id="dv">Devam</button></div>`);
    haberEkle(o.baslik);
    el.querySelector('#dv').onclick = () => kapatVeDevam(el, o);
  }
  function butceKart(o, z) {
    const SEC_B = [
      { ad: 'Sıkı bütçe', h: -1, a: 'Faiz dışı fazla, düşük harcama. Enflasyon hızla düşer, piyasa güvenir; halk sıkılır.' },
      { ad: 'Dengeli bütçe', h: 0, a: 'Programla uyumlu, sınırlı sosyal harcama.' },
      { ad: 'Genişletici bütçe', h: 1, a: 'Yatırım ve sosyal harcama artar. Büyüme hızlanır, enflasyon ve açık yükselir.' },
      { ad: 'Seçim bütçesi', h: 2, a: 'Bol harcama. Kısa vadede çok sevilir, faturası ağır gelir.' }
    ];
    const el = kartAc(`<div class="ust-serit"><span>Maliye · ${o.yil} bütçesi</span><span class="yer">${tarihYazi(o.t)}</span></div>
      <div class="govde">${dosyaUst(o, z)}<h2>${o.yil}–${o.yil + 2} bütçesi</h2><p>Gaz geliri yılda yaklaşık $${S.eko.gelir.toFixed(1).replace('.', ',')} milyar, rezerv $${S.eko.rezerv.toFixed(1).replace('.', ',')} milyar. Harcama ne olsun?</p>
      ${SEC_B.map((s, i) => `<button class="secenek" data-i="${i}">${s.ad}${S.pol.h === s.h ? ' <small style="color:#8a6a10">(şu anki)</small>' : ''}<div class="ip"><span>${esc(s.a)}</span></div></button>`).join('')}
      <div class="tarihte"><b>Gerçekte</b>Gaz gelirinin büyük kısmı bütçe dışı fonlarda tutuldu; şeffaflık sınırlıydı.</div></div>`);
    el.querySelectorAll('.secenek').forEach(b => b.onclick = () => {
      const s = SEC_B[+b.dataset.i], et = { e: { h: s.h } };
      if (s.h === 2) et.k = { mary: 2, dasoguz: 2, kent: 1 }; if (s.h === -1) et.k = { mary: -1, dasoguz: -1 };
      Sim.etkiUygula(et); bildirim(`${o.yil} bütçesi: ${s.ad}`); logla(`💰 ${o.yil} bütçesi: ${s.ad}`); kapatVeDevam(el, o);
    });
    sonraBagla(el);
  }
  const ASGARI_GERCEK = { 2004: 303.68, 2005: 350.15, 2006: 380.46, 2007: 403.03 };
  function asgariKart(o, z) {
    const enf = Math.max(3, S.eko.enf), A = S.asgari, para = v => v.toFixed(2).replace('.', ',') + (S.b.ytl ? ' YTL' : ' YTL');
    const SEC_A = [
      { ad: 'Enflasyon kadar artır', o: enf, et: {} },
      { ad: 'Refah payı ekle', o: enf + 8, et: { k: { sag: 2, muh: 1, kurt: 1 }, i: { isd: -3 }, e: { enf: 0.6 } } },
      { ad: 'Sınırlı artış, istihdamı koru', o: Math.max(2, enf - 6), et: { k: { sag: -2, muh: -1 }, i: { isd: 3 }, e: { guven: 2 } } }
    ];
    const el = kartAc(`<div class="ust-serit"><span>Çalışma · Asgari ücret</span><span class="yer">${tarihYazi(o.t)}</span></div>
      <div class="govde">${dosyaUst(o, z)}<h2>${o.yil} asgari ücreti</h2><p>Net asgari ücret şu an ${para(A)}. Enflasyon ${yz(S.eko.enf)}. Sendikalar refah payı, işverenler sınırlı artış istiyor.</p>
      ${SEC_A.map((s, i) => `<button class="secenek" data-i="${i}">${s.ad} <b>→ ${para(A * (1 + s.o / 100))}</b><div class="ip">${ipuclari(s.et) || '<span>Dengeli</span>'}</div></button>`).join('')}
      <div class="tarihte"><b>Gerçekte</b>${o.yil}'te net asgari ücret ${String(ASGARI_GERCEK[o.yil]).replace('.', ',')} YTL oldu.</div></div>`);
    el.querySelectorAll('.secenek').forEach(b => b.onclick = () => {
      const s = SEC_A[+b.dataset.i]; S.asgari = A * (1 + s.o / 100); Sim.etkiUygula(s.et);
      haberEkle(`Asgari ücret ${para(S.asgari)} oldu`); logla(`👷 Asgari ücret ${para(S.asgari)}`); kapatVeDevam(el, o);
    });
    sonraBagla(el);
  }
  function sonKart(o) {
    const e = S.eko, g = V.GERCEK[2022], c = (ad, sen, ger) => `<div class="satir"><span class="ad">${ad}</span><b style="width:80px;text-align:right">${sen}</b><span class="kucuk" style="width:80px;text-align:right">${ger}</span></div>`;
    const el = kartAc(`<div class="ust-serit"><span>Otuz yıl</span><span class="yer">2022</span></div><div class="govde"><h2>Türkmenistan'ın karnesi</h2>
      <p>${esc(S.ad)}, ${S.kararlar || 0} kararının ${S.tarihle || 0} tanesi tarihtekiyle aynıydı. Ülke ${{ kapali: 'tek partiyle', kontrollu: 'kontrollü bir açılımla', acik: 'çok partili bir demokrasi olarak' }[S.pol.acilim]} bugüne geldi.</p>
      <div class="satir kucuk"><span class="ad"></span><span style="width:80px;text-align:right">Sen</span><span style="width:80px;text-align:right">Gerçek</span></div>
      ${c('Kişi başı gelir', '$' + sayi(e.kisiBasi), '$' + sayi(g.kisiBasi))}${c('Gaz ihracatı', Math.round(e.gaz) + ' mlr m³', g.gaz + ' mlr m³')}${c('Enflasyon', yz(e.enf), yz(g.enf))}${c('Manat/$', e.kur.toFixed(2).replace('.', ','), '3,50')}${c('Batı ile ilişki', Math.round(S.dis.bati), '–')}
      <div class="tarihte"><b>Boru hatların</b>${['iran', 'cin', 'hazar', 'tapi'].map(t => V.PROJE[t].ad + ': ' + (S.projeler.some(p => p.tip === t && p.bitti) ? '✓' : '—')).join(' · ')}. Gerçekte Hazar ötesi hat ve TAPI tamamlanmadı.</div>
      <button class="btn" id="dv">Haritada dolaş</button><button class="btn ikincil" id="yb" style="margin-top:8px">Baştan başla</button></div>`);
    el.querySelector('#dv').onclick = () => { el.remove(); Sim.olayBitti(o); hiz(0); modal = false; Sim.kaydet(); };
    el.querySelector('#yb').onclick = () => { Sim.sil(); location.reload(); };
  }

  /* ---------- seçim ekranı ---------- */
  function secimEkrani(o) {
    modal = true; panelKapat();
    const r = Sim.secimYap(o), gercek = r.ulusal.akp, ac = S.pol.acilim, halef = o.id === 'secim2022' ? S.b.halef : null;
    const resmi = halef === 'acik' ? Math.min(99, gercek + 4) : ac === 'kapali' ? 95 + Math.random() * 4.5 : ac === 'kontrollu' ? Math.min(96, gercek + 26) : gercek;
    const aday = halef === 'ogul' ? 'Oğlun' : halef === 'acik' ? 'Senin desteklediğin aday' : 'Sen';
    const sira = Object.keys(r.iller).sort(() => Math.random() - 0.5), kat = document.createElement('div');
    kat.innerHTML = `<div class="secim-ekran"><div class="secim-kutu"><div class="bas"><span>${tarihYazi(r.t)} · Başkanlık seçimi</span><b>● CANLI</b></div>
      <div class="sandik" id="sk">Sandıklar açılıyor</div><div id="prt"></div><div id="mc"></div></div></div><div class="secim-alt"><button class="btn ikincil" id="atla">Sonuca geç</button></div>`;
    document.body.appendChild(kat); document.body.classList.add('secimde'); Harita.genel();
    Object.keys(r.iller).forEach(il => Harita.ilAyarla(il, '#3a4757', 0.3));
    let i = 0, bitti = false;
    const acIl = il => { const p = r.iller[il].akp; Harita.ilAyarla(il, DUSUK.clone().lerp(p > 50 ? YUKSEK : ORTA, Math.min(1, p / 70)).getStyle(), 0.4 + p / 100 * 7); };
    function ciz(oran) {
      kat.querySelector('#sk').textContent = bitti ? 'Sonuçlar açıklandı' : 'Sayım sürüyor · ' + yz(oran * 100, 0);
      kat.querySelector('#prt').innerHTML = `<div class="prt"><span class="amb">${amblem('akp')}</span><span class="nm">${aday}</span><span class="cb"><i style="width:${resmi * Math.min(1, oran * 1.3)}%;background:${V.PARTI.akp.renk}"></i></span><span class="yz">${yz(resmi * (bitti ? 1 : Math.min(1, 0.9 + oran * 0.1)))}</span></div>
        <div class="prt"><span class="amb">${amblem('ras')}</span><span class="nm">Rakipler</span><span class="cb"><i style="width:${(100 - resmi) * Math.min(1, oran * 1.3)}%;background:${V.PARTI.ras.renk}"></i></span><span class="yz">${yz(100 - resmi)}</span></div>`;
    }
    const zam = setInterval(() => { if (i < sira.length) { acIl(sira[i++]); ciz(i / sira.length); } else son(); }, 380);
    function son() {
      if (bitti) return; bitti = true; clearInterval(zam); sira.forEach(acIl); ciz(1);
      const kayip = resmi < 50 && halef !== 'ogul', g = (o.gercek || {}).akp;
      if (ac === 'kapali') S.dis.bati = Math.max(0, S.dis.bati - 4); if (ac === 'acik') S.dis.bati = Math.min(100, S.dis.bati + 5);
      kat.querySelector('#mc').innerHTML = `<p class="not" style="margin:6px 0 0">Resmî sonuç <b style="color:var(--altin)">${yz(resmi)}</b> · Gerçek desteğin (bağımsız tahmin) <b>${yz(gercek)}</b>.
        ${ac === 'kapali' ? 'Rakipler göstermelik; uluslararası gözlemciler seçimi rekabetçi bulmadı.' : ac === 'kontrollu' ? 'Muhalefet sınırlı ölçüde yarışabildi; AGİT seçimi kısmen rekabetçi buldu.' : 'Seçim serbest ve rekabetçiydi; sonuçlar gerçek desteği yansıtıyor.'}
        ${g ? `Gerçekte resmî sonuç %${String(g).replace('.', ',')}'di.` : ''}</p>`;
      const mesaj = `${aday}: resmî ${yz(resmi)}`; haberEkle(mesaj); logla('🗳️ ' + mesaj);
      const b = kat.querySelector('#atla'); b.className = 'btn'; b.textContent = kayip ? 'Sonucu gör' : 'Devam';
      b.onclick = () => {
        kat.remove(); document.body.classList.remove('secimde'); Sim.olayBitti(o);
        if (kayip) return kaybettin(r, o, resmi);
        modal = false; haritaRenk(); hud(); Sim.kaydet();
      };
    }
    kat.querySelector('#atla').onclick = son; ciz(0);
  }
  function kaybettin(r, o, resmi) {
    const el = kartAc(`<div class="ust-serit son"><span>Seçim sonucu</span><span class="yer" style="color:#fff">${tarihYazi(r.t)}</span></div><div class="govde"><h2>Seçimi kaybettin</h2>
      <p>Serbest bir seçimde ${yz(resmi)} oyda kaldın ve görevi barışçıl biçimde devrettin. Türkmenistan tarihinde ilk kez iktidar sandıkla el değiştirdi. Gerçekte ülkede hiçbir zaman rekabetçi bir seçim yapılmadı.</p>
      <button class="btn" id="yb">Baştan başla</button><button class="btn ikincil" id="dv" style="margin-top:8px">Haritaya bak</button></div>`);
    el.querySelector('#yb').onclick = () => { Sim.sil(); location.reload(); };
    el.querySelector('#dv').onclick = () => { el.remove(); hiz(0); modal = false; };
  }
  const KOALISYON = {
    chp: { k: { laik: 3, muh: -4 }, i: { ordu: 4, yargi: 3 }, d: { ab: 2 }, e: { guven: -3 } },
    mhp: { k: { mil: 4, kurt: -3, laik: -1 }, d: { ab: -3 }, e: { guven: -3 } },
    dyp: { k: { sag: 3, muh: -1 }, i: { isd: 2 }, e: { guven: -4 } },
    gp: { k: { sag: 1, laik: -1 }, i: { isd: -4, medya: -2 }, e: { guven: -6 } }
  };
  function koalisyonKart(ortaklar, r) {
    const el = kartAc(`<div class="ust-serit"><span>Çankaya · Hükümet kurma</span><span class="yer">${tarihYazi(r.t)}</span></div><div class="govde"><h2>Koalisyon</h2>
      <p>Partin birinci ama ${r.sandalye.akp} sandalye tek başına yetmiyor. Cumhurbaşkanı hükümeti kurma görevini sana verdi. Kiminle?</p>
      ${ortaklar.map(k => `<button class="secenek" data-k="${k}"><span style="display:inline-flex;vertical-align:middle;margin-right:8px">${amblem(k, 22)}</span>${V.PARTI[k].uzun} ile (${r.sandalye.akp + r.sandalye[k]} sandalye)<div class="ip">${ipuclari(KOALISYON[k] || {})}</div></button>`).join('')}
      <div class="tarihte"><b>Gerçekte</b>AK Parti 2002'den 2015 Haziran'ına kadar hep tek başına iktidar oldu.</div></div>`);
    el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
      const k = b.dataset.k; Sim.etkiUygula(KOALISYON[k]); S.b.koalisyon = k;
      haberEkle(`${V.PARTI.akp.ad}–${V.PARTI[k].ad} koalisyonu kuruldu`); el.remove(); modal = false; haritaRenk(); hud(); Sim.kaydet();
    });
  }

  /* ---------- paneller ---------- */
  function panelKapat() { if (panel) { panel.remove(); panel = null; } ui.querySelectorAll('[data-p]').forEach(b => b.setAttribute('aria-pressed', 'false')); Harita.seciliYap(null); }
  function panelAc(ad, veri) {
    const ayni = panel && panel.dataset.ad === ad && !veri; panelKapat(); if (ayni) return;
    const b = ui.querySelector(`[data-p="${ad}"]`); if (b) b.setAttribute('aria-pressed', 'true');
    panel = document.createElement('div'); panel.className = 'panel'; panel.dataset.ad = ad; document.body.appendChild(panel);
    const bu = panel;
    ciz();
    function ciz() {
      if (panel !== bu) return;
      const [baslik, ic] = PANEL[ad](veri, ciz);
      panel.innerHTML = `<header><h3>${baslik}</h3><button aria-label="Kapat">✕</button></header><div class="ic">${ic}</div>`;
      panel.querySelector('header button').onclick = panelKapat;
      const kur = PANEL_KUR[ad]; if (kur) kur(panel, veri, ciz);
    }
  }
  function grafik(alan, renk) {
    const v = S.gecmis.slice(-60).map(g => g[alan]); if (v.length < 2) return '';
    const mn = Math.min(...v), mx = Math.max(...v), w = 300, h = 46, f = i => (i / (v.length - 1) * w).toFixed(1), y = x => (h - 4 - (x - mn) / (mx - mn || 1) * (h - 8)).toFixed(1);
    return `<svg class="grafik" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline fill="none" stroke="${renk}" stroke-width="2" points="${v.map((x, i) => f(i) + ',' + y(x)).join(' ')}"/></svg>`;
  }
  const cubuk = (v, renk) => `<div class="cubuk"><i style="width:${Math.max(2, Math.min(100, v))}%;background:${renk}"></i></div>`;
  const POL = {
    h: { ad: 'Kamu harcaması', s: [[-1, 'Sıkı'], [0, 'Dengeli'], [1, 'Cömert']], not: 'Cömert harcama halkı memnun eder; enflasyonu artırır, rezervi eritir.' },
    sub: { ad: 'Ücretsiz gaz, su, elektrik', s: [[1, 'Herkese'], [0.4, 'Yoksula'], [0, 'Yok']], not: 'Sübvansiyon sevilir ama gaz gelirinin bir kısmını yer.' },
    acilim: { ad: 'Siyasi rejim', s: [['kapali', 'Tek parti'], ['kontrollu', 'Kontrollü'], ['acik', 'Çok partili']], not: 'Açıldıkça Batı ile ilişkiler ve kentliler iyileşir; seçimler gerçek olur, kaybedebilirsin.' }
  };
  const PANEL = {
    ekonomi() {
      const e = S.eko, y = Sim.yil();
      return ['Ekonomi', `<p class="not">Gaz fiyatı ~$${Math.round(V.fiyat(y))}/1000 m³ · Yıllık gaz geliri ~$${e.gelir.toFixed(1).replace('.', ',')} milyar</p>
        <div class="satir"><span class="ad">Büyüme<small>Resmî rakamlar tartışmalı</small>${grafik('buyume', '#3ecf8e')}</span><b>${yz(e.buyume)}</b></div>
        <div class="satir"><span class="ad">Enflasyon${grafik('enf', '#ff8a5b')}</span><b>${e.enf > 100 ? '%' + sayi(e.enf) : yz(e.enf)}</b></div>
        <div class="satir"><span class="ad">Gaz ihracatı<small>Rusya: ${Math.round(V.tablo(y, 'gazRus') * (S.pol.rus || 1))} mlr m³ · diğer hatlar: ${Math.max(0, Math.round(e.gaz - V.tablo(y, 'gazRus') * (S.pol.rus || 1)))}</small></span><b>${Math.round(e.gaz)}</b></div>
        <div class="satir"><span class="ad">Döviz rezervi${cubuk(e.rezerv * 2, '#7fb6e6')}</span><b>$${e.rezerv.toFixed(1).replace('.', ',')} mlr</b></div>
        <div class="baslik2">Politikalar</div>
        ${Object.entries(POL).map(([k, p]) => `<div class="satir" style="display:block"><b>${p.ad}</b><div class="secim3">${p.s.map(([v, a]) => `<button data-pol="${k}" data-v="${v}" aria-pressed="${String(S.pol[k]) === String(v)}">${a}</button>`).join('')}</div><div class="kucuk" style="margin-top:4px">${p.not}</div></div>`).join('')}`];
    },
    halk() {
      const a = Sim.anketHesap().ulusal;
      return ['Halk', `<div class="baslik2" style="margin-top:0">Gerçek destek (bağımsız tahmin)</div>${Sim.PARTILER.map(k => `<div class="prt"><span class="amb">${amblem(k)}</span><span class="nm">${V.PARTI[k].ad}</span><span class="cb"><i style="width:${a[k] * 2}%;background:${V.PARTI[k].renk}"></i></span><span class="yz">${yz(a[k])}</span></div>`).join('')}
        <div class="baslik2">Toplum kesimleri · sana destek</div>
        ${Object.entries(V.KESIM).map(([k, K]) => { const s = S.kesim[k]; return `<div class="satir"><span style="font-size:22px">${K.ikon}</span><span class="ad">${K.ad}<small>${s.m > 1 ? 'Kararlarından memnun' : s.m < -1 ? 'Kararlarından rahatsız' : 'Kararsız'}</small>${cubuk(s.v * 100, V.PARTI.akp.renk)}</span><b>${yz(s.v * 100, 0)}</b></div>`; }).join('')}
        <div class="baslik2">Kurumlarla ilişki</div>
        ${Object.entries(V.KURUM).map(([k, K]) => `<div class="satir"><span style="font-size:20px">${K.ikon}</span><span class="ad">${K.ad}${cubuk(S.kurum[k], S.kurum[k] < 30 ? '#ff5d5d' : '#7fb6e6')}</span><b>${Math.round(S.kurum[k])}</b></div>`).join('')}`];
    },
    dunya() {
      return ['Dış ilişkiler', `${Object.entries(V.DIS).map(([k, K]) => `<div class="satir"><span style="font-size:22px">${K.ikon}</span><span class="ad">${K.ad}${cubuk(S.dis[k], S.dis[k] < 35 ? '#ff5d5d' : '#3ecf8e')}</span><b>${Math.round(S.dis[k])}</b></div>`).join('')}
        <div class="baslik2">Statü</div><p class="not">${S.b.tarafsiz ? 'BM tarafından tanınan daimi tarafsız ülke.' : 'Tarafsızlık ilan edilmedi.'} ${S.pol.acilim === 'kapali' ? 'Uluslararası kuruluşlar basın ve ifade özgürlüğünü en kısıtlı ülkeler arasında sayıyor.' : ''}</p>`];
    },
    yatirim() {
      const yil = Sim.yil();
      const liste = S.projeler.slice().reverse().slice(0, 12).map(p => { const P = V.PROJE[p.tip], k = Math.min(1, (S.gun - p.bas) / (p.bitis - p.bas)); return `<div class="satir"><span style="font-size:20px">${P.ikon}</span><span class="ad">${P.ad} · ${p.il}${cubuk(k * 100, p.bitti ? '#3ecf8e' : '#ffb703')}</span><span class="kucuk">${p.bitti ? 'Açıldı' : Math.round(k * 100) + '%'}</span></div>`; }).join('');
      return ['Yatırımlar', `<p class="not">Döviz rezervi: <b style="color:var(--altin)">$${S.eko.rezerv.toFixed(1).replace('.', ',')} milyar</b>. Boru hatları gaz gelirini artırır; diğer projeler halkı memnun eder.</p>
        ${Object.entries(V.PROJE).map(([k, P]) => { const erken = yil < P.yil, var_ = P.tekil && S.projeler.some(p => p.tip === k); return `<div class="proje"><span class="em">${P.ikon}</span><span class="ad"><b>${P.ad}</b><span class="kucuk">$${String(P.maliyet).replace('.', ',')} mlr · ${P.sure} ay${P.il ? ' · ' + P.il : ''}${P.gaz ? ' · +' + P.gaz + ' mlr m³' : ''}</span><br><span class="kucuk">${esc(P.bilgi)}</span></span><button data-proje="${k}" ${erken || var_ ? 'disabled' : ''}>${erken ? P.yil : var_ ? 'Var' : 'Kur'}</button></div>`; }).join('')}
        ${liste ? '<div class="baslik2">Projelerin</div>' + liste : ''}`];
    },
    gundem() {
      const masa = (S.masa || []).map(m => { const o = V.OLAY.find(x => x.id === m.id); const ad = o.baslik || (o.tur === 'butce' ? o.yil + ' bütçesi' : o.yil + ' asgari ücreti'); return `<button class="dosya" data-dosya="${o.id}"><span style="font-size:22px">📁</span><span class="ad"><b>${esc(ad)}</b><span class="kucuk">${tarihYazi(o.t)}${o.yer ? ' · ' + esc(o.yer) : ''}</span></span><span class="sure">${Math.max(0, sureOf(o.id) - (S.gun - m.gelis))} gün</span></button>`; }).join('');
      return ['Gündem', `<div class="baslik2" style="margin-top:0">Masandaki dosyalar</div>${masa || '<p class="not">Bekleyen karar yok. Zaman aktıkça yeni dosyalar gelecek.</p>'}
        <p class="kucuk">Panel açıkken zaman durur. Bir dosyayı süresi içinde açmazsan kendiliğinden önüne gelir.</p>
        <div class="baslik2">Son gelişmeler</div>${(S.log || []).map(l => `<div class="log"><small>${l.t}</small>${esc(l.m)}</div>`).join('') || '<p class="not">Henüz bir şey yok.</p>'}`];
    },
    kampanya() {
      const T = Sim.teskilatOrani(), tarih = S.b.secimTarihi ? Math.max(0, Sim.tarihGun('2002-11-03') - S.gun) + ' gün kaldı (3 Kasım 2002)' : 'Seçim tarihi belli değil; olağan seçim 2004\'te';
      const bekle = Math.max(0, 7 - (S.gun - S.mitingSon));
      return ['Kampanya', `<p class="not">Parti kasası: <b style="color:var(--altin)">$${S.kasa.toFixed(2).replace('.', ',')} milyon</b> · Seçim: ${tarih}</p>
        <div class="baslik2" style="margin-top:4px">Teşkilat · seçmenin ${yz(T * 100, 0)}'ine ulaşıyorsun</div>
        <p class="kucuk" style="margin:0 0 4px">Teşkilatın olmayan bölgede oyunun beşte birini kaybedersin.</p>
        <div class="tes">${Object.entries(V.BOLGE).map(([k, B]) => { const v = S.teskilat[k] !== undefined; return `<button data-tes="${k}" class="${v ? 'var' : ''}"><b>${v ? '🏢' : '➕'} ${B.ad}</b><span>${v ? 'Teşkilat kuruldu' : B.iller.length + ' il · $' + String(Sim.TESKILAT_MALIYET).replace('.', ',') + ' mn'}</span></button>`; }).join('')}</div>
        <div class="baslik2">Miting</div>
        <p class="kucuk" style="margin:0 0 6px">Haftada bir miting yapabilirsin ($${String(Sim.MITING_MALIYET).replace('.', ',')} mn). Büyük şehirler ulusal yayına çıkar; etkisi birkaç ayda söner.${bekle ? ` Sonraki miting için ${bekle} gün.` : ''}</p>
        <button class="btn" id="mitingSec" ${bekle ? 'disabled style="opacity:.5"' : ''}>📣 Haritadan il seç</button>
        <div class="secim3" style="flex-wrap:wrap">${['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Konya', 'Adana', 'Diyarbakır', 'Trabzon'].map(il => `<button data-mit="${il}" ${bekle ? 'disabled' : ''}>${il}${S.miting[il] ? ' ✓' : ''}</button>`).join('')}</div>`];
    },
    gorunum() {
      return ['Harita', `<div class="secim3"><button data-mod="destek" aria-pressed="${mod === 'destek'}">Bize destek</button><button data-mod="kazanan" aria-pressed="${mod === 'kazanan'}">Önde giden parti</button></div>
        <p class="not">İllerin yüksekliği oy oranını gösterir. Bir ile dokunarak ayrıntısını gör; iki parmakla yakınlaş, çevir.</p>
        <button class="btn ikincil" id="tr">Türkiye'nin tamamına dön</button>
        ${S.secimler.length ? '<div class="baslik2">Geçmiş seçimler</div>' + S.secimler.map(s => `<div class="satir"><span class="ad">${tarihYazi(s.t)} · ${s.tur === 'genel' ? 'Genel' : 'Yerel'}</span><b>${yz(s.ulusal.akp)}${s.sandalye ? ' · ' + s.sandalye.akp + ' MV' : ''}</b></div>`).join('') : ''}`];
    },
    il(ad) {
      const a = Sim.anketHesap().iller[ad], il = Sim.IL[ad], pr = S.projeler.filter(p => p.il === ad), yil = Sim.yil(), b = Sim.BOLGE_IL[ad];
      const son = S.secimler.length ? S.secimler[S.secimler.length - 1] : null;
      return [esc(ad), `<p class="not">Nüfus yaklaşık ${String(window.SECIM2002[ad].nufus).replace('.', ',')} milyon (1995)</p>
        <div class="baslik2" style="margin-top:4px">Bugünkü anket</div>${Sim.PARTILER.map(k => `<div class="prt"><span class="amb">${amblem(k, 22)}</span><span class="nm">${V.PARTI[k].ad}</span><span class="cb"><i style="width:${a[k] * 1.6}%;background:${V.PARTI[k].renk}"></i></span><span class="yz">${yz(a[k])}</span><span class="gr">${yz(il.taban[k], 0)}</span></div>`).join('')}
        <p class="kucuk" style="text-align:right;margin:0">sağdaki: 1991</p>
        ${!S.iktidar ? `<div class="baslik2">Kampanya</div><p class="not">${V.BOLGE[b].ad} teşkilatı: ${S.teskilat[b] !== undefined ? '<b style="color:var(--yesil)">kuruldu</b>' : '<b style="color:var(--kotu)">yok</b>'}${S.miting[ad] ? ' · Miting etkisi sürüyor' : ''}</p>
          <button class="btn" data-mitil="${esc(ad)}" ${S.gun - S.mitingSon < 7 ? 'disabled style="opacity:.5"' : ''}>📣 ${esc(ad)}'da miting yap ($${String(Sim.MITING_MALIYET).replace('.', ',')} mn)</button>` : `<div class="baslik2">Bu ile yatırım</div>
        ${Object.entries(V.PROJE).filter(([, P]) => !P.il || P.il === ad).map(([k, P]) => { const erken = yil < P.yil, var_ = pr.some(p => p.tip === k) || (P.tekil && S.projeler.some(p => p.tip === k)); return `<div class="proje"><span class="em">${P.ikon}</span><span class="ad"><b>${P.ad}</b><span class="kucuk">$${String(P.maliyet).replace('.', ',')} mlr · ${P.sure} ay</span></span><button data-kur="${k}" ${erken || var_ ? 'disabled' : ''}>${erken ? P.yil : var_ ? 'Var' : 'Kur'}</button></div>`; }).join('')}`}`];
    }
  };
  const PANEL_KUR = {
    ekonomi(el, v, ciz) {
      el.querySelectorAll('[data-pol]').forEach(b => b.onclick = () => {
        const k = b.dataset.pol, raw = b.dataset.v, val = raw === 'true' ? true : raw === 'false' ? false : isNaN(+raw) ? raw : +raw;
        if (String(S.pol[k]) === String(val)) return;
        const et = { e: {} }; et.e[k] = val;
        if (k === 'acilim') { const yon = { kapali: 0, kontrollu: 1, acik: 2 }[val] - { kapali: 0, kontrollu: 1, acik: 2 }[S.pol.acilim]; et.d = { bati: 7 * yon }; et.i = { guv: -6 * yon, elit: -3 * yon }; et.k = { kent: 3 * yon }; }
        if (k === 'sub') { const f = val - S.pol.sub; et.k = { mary: 4 * f, dasoguz: 4 * f, kent: 3 * f, balkan: 3 * f }; }
        Sim.etkiUygula(et); hud(); ciz(); bildirim(POL[k].ad + ': ' + b.textContent);
      });
    },
    yatirim(el, v, ciz) {
      el.querySelectorAll('[data-tes]').forEach(b => b.onclick = () => {
        const r = Sim.teskilatKur(b.dataset.tes); if (r === 'var') return; if (r === 'para') return bildirim('Kasada yeterli para yok');
        bildirim(`🏢 ${V.BOLGE[b.dataset.tes].ad} teşkilatı kuruldu`); haberEkle(`${V.BOLGE[b.dataset.tes].ad} il başkanlıkları açıldı`); haritaRenk(); hud(); ciz(); Sim.kaydet();
      });
      el.querySelectorAll('[data-mit]').forEach(b => b.onclick = () => { miting(b.dataset.mit); ciz(); });
      const ms = el.querySelector('#mitingSec');
      if (ms) ms.onclick = () => {
        panelKapat(); ilSecimi = 'miting';
        const ban = document.createElement('div'); ban.className = 'ilsec'; ban.id = 'ilsec'; ban.innerHTML = `📣 Miting için il seç <button>Vazgeç</button>`;
        document.body.appendChild(ban); ban.querySelector('button').onclick = () => { ilSecimi = null; ban.remove(); };
      };
      el.querySelectorAll('[data-proje]').forEach(b => b.onclick = () => {
        const k = b.dataset.proje, P = V.PROJE[k];
        if (P.il) return projeKur(k, P.il);
        panelKapat(); ilSecimi = k;
        const ban = document.createElement('div'); ban.className = 'ilsec'; ban.id = 'ilsec'; ban.innerHTML = `${P.ikon} Bir il seç <button>Vazgeç</button>`;
        document.body.appendChild(ban); ban.querySelector('button').onclick = () => { ilSecimi = null; ban.remove(); };
      });
    },
    gundem(el) { el.querySelectorAll('[data-dosya]').forEach(b => b.onclick = () => dosyaAc(b.dataset.dosya, false)); },
    gorunum(el, v, ciz) {
      el.querySelectorAll('[data-mod]').forEach(b => b.onclick = () => { mod = b.dataset.mod; haritaRenk(); lejant(); ciz(); });
      el.querySelector('#tr').onclick = () => { Harita.genel(); panelKapat(); };
    },
    il(el, ad, ciz) {
      Harita.seciliYap(ad);
      el.querySelectorAll('[data-kur]').forEach(b => b.onclick = () => { if (projeKur(b.dataset.kur, ad)) ciz(); });
      const m = el.querySelector('[data-mitil]'); if (m) m.onclick = () => { miting(ad); ciz(); };
    }
  };
  function projeKur(tip, il) {
    const r = Sim.projeKur(tip, il), P = V.PROJE[tip];
    if (r !== 'tamam') { bildirim(r === 'erken' ? `${P.ad} ${P.yil}'den itibaren` : r === 'para' ? 'Rezerv yetersiz' : 'Bu proje zaten var'); return false; }
    Harita.projeleriCiz(S.projeler); haritaRenk(); bildirim(`${P.ikon} ${P.il || il}: ${P.ad} için temel atıldı`); haberEkle(`${P.il || il}'de ${P.ad} için temel atıldı`);
    Sim.kaydet(); return true;
  }
  function miting(il) {
    const r = Sim.mitingYap(il);
    if (r === 'yorgun') return bildirim(`Sonraki miting için ${7 - (S.gun - S.mitingSon)} gün bekle`);
    if (r === 'para') return bildirim('Kasada yeterli para yok');
    panelKapat(); Harita.mitingCiz(S.miting); haritaRenk(); hud(); Sim.kaydet();
    bildirim(`📣 ${il} mitingi: meydan doldu`); logla(`📣 ${il} mitingi`); haberEkle(`${S.ad}, ${il}'da on binlere seslendi`);
    Harita.odakla(il, 40);
  }
  function ilSecildi(ad) {
    if (modal) return;
    if (ilSecimi) {
      if (!ad) return; const k = ilSecimi; ilSecimi = null; const b = document.getElementById('ilsec'); if (b) b.remove();
      if (k === 'miting') miting(ad); else projeKur(k, ad); return;
    }
    if (!ad) { if (panel && panel.dataset.ad === 'il') panelKapat(); return; }
    panelAc('il', ad);
  }

  /* ---------- başlat ---------- */
  Harita.kur(document.getElementById('sahne'), ilSecildi);
  acilis();
  requestAnimationFrame(dongu);
  window.__oyun = { durum: () => S, olayAc, hiz: h => hiz(h), modal: () => modal };
})();
