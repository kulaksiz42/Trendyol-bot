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
  const BAYRAK = `<svg class="bayrak" viewBox="0 0 30 20"><rect width="30" height="20" fill="#e30a17"/><circle cx="11" cy="10" r="5" fill="#fff"/><circle cx="12.3" cy="10" r="4" fill="#e30a17"/><path fill="#fff" d="M16.2 10l3.6-1.2-2.2 3.1V8.1l2.2 3.1z"/></svg>`;
  const ARMA = `<svg class="armasi" viewBox="0 0 80 80"><circle cx="40" cy="40" r="38" fill="#e30a17"/><circle cx="40" cy="40" r="34" fill="none" stroke="#f2a516" stroke-width="1.5"/><circle cx="34" cy="40" r="15" fill="#fff"/><circle cx="38" cy="40" r="12" fill="#e30a17"/><path fill="#fff" d="M49 40l10.4-3.4-6.4 8.9V34.5l6.4 8.9z"/></svg>`;
  function amblem(k, b = 26) {
    const r = V.PARTI[k].renk, w = `width="${b}" height="${b}"`;
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
    ui.innerHTML = `<div class="acilis"><div class="k">${ARMA}<h1>BAŞBAKAN</h1><div class="alt-b">Türkiye · 2002'den bugüne</div>
      <p>3 Kasım 2002. Seçim gecesi. Ülke 2001 krizinin yaralarını sarıyor. Bu gece kazanan partinin genel başkanı sensin. Olaylar gerçek, kararlar senin.</p>
      <input id="ad" maxlength="24" placeholder="Adın (ör. Ahmet Yılmaz)" autocomplete="off">
      <button class="btn" id="basla">Seçim gecesi başlasın</button>
      ${varK ? '<button class="btn ikincil" id="devam" style="margin-top:8px">Kayıtlı oyuna devam et</button>' : ''}
      <div class="uyari">Oyundaki başbakan kurgusal bir karakterdir. Tarihî olaylar kaynaklara göre özetlenmiştir; tartışmalı konular tarafsız biçimde aktarılır.</div></div></div>`;
    ui.querySelector('#basla').onclick = () => { S = Sim.yeni(ui.querySelector('#ad').value.trim() || 'Başbakan'); secimGecesi(); };
    if (varK) ui.querySelector('#devam').onclick = () => { S = Sim.yukle(); anaEkran(); modal = false; haritaRenk(true); Harita.projeleriCiz(S.projeler); };
    Object.keys(Harita.iller).forEach(ad => Harita.ilAyarla(ad, '#4a5a6c', 0.5, true));
  }

  /* ---------- seçim gecesi (2002, gerçek sonuçlar) ---------- */
  function secimGecesi() {
    const sira = Object.keys(SEC).sort(() => Math.random() - 0.5), P = Sim.PARTILER;
    const acik = {}; let i = 0, bitti = false;
    ui.innerHTML = `<div class="secim-ekran"><div class="secim-kutu"><div class="bas"><span>3 Kasım 2002 · Genel seçim</span><b>● CANLI</b></div>
      <div class="sandik" id="sk">Açılan sandık %0</div><div id="prt"></div><div id="mc"></div></div></div>
      <div class="secim-alt"><button class="btn ikincil" id="atla">Sonuca geç</button></div>`;
    Harita.genel();
    function ciz() {
      const top = Object.fromEntries(P.map(k => [k, 0])); let n = 0;
      Object.keys(acik).forEach(il => { P.forEach(k => top[k] += SEC[il].oy[k]); n += SEC[il].top; });
      const T = P.reduce((a, k) => a + top[k], 0) || 1, toplam = Object.values(SEC).reduce((a, r) => a + r.top, 0);
      ui.querySelector('#sk').textContent = bitti ? 'Sonuçlar kesinleşti' : 'Açılan sandık ' + yz(n / toplam * 100, 0);
      ui.querySelector('#prt').innerHTML = P.map(k => `<div class="prt"><span class="amb">${amblem(k)}</span><span class="nm">${V.PARTI[k].ad}</span><span class="cb"><i style="width:${top[k] / T * 100 * 2}%;background:${V.PARTI[k].renk}"></i></span><span class="yz">${yz(top[k] / T * 100)}</span></div>`).join('');
    }
    function ac(il) {
      acik[il] = 1; const r = SEC[il]; let en = 'akp'; P.forEach(k => { if (r.oy[k] > r.oy[en]) en = k; });
      Harita.ilAyarla(il, V.PARTI[en].renk, 0.6 + r.oy[en] / r.top * 7);
    }
    const zam = setInterval(() => { if (i < sira.length) { ac(sira[i++]); ac(sira[i] ? sira[i++] : sira[0]); ciz(); } else son(); }, 170);
    function son() {
      if (bitti) return; bitti = true; clearInterval(zam); sira.forEach(ac); ciz();
      ui.querySelector('#mc').innerHTML = meclis({ akp: 363, chp: 178, dig: 9 }) + `<p class="not" style="text-align:center;margin:4px 0 0">Yalnızca iki parti %10 barajını geçti. Partin <b style="color:var(--altin)">363 sandalyeyle</b> tek başına iktidar. Geçerli oyların yaklaşık %45'i Meclis'e yansımadı.</p>`;
      const b = ui.querySelector('#atla'); b.className = 'btn'; b.textContent = 'Göreve başla';
      b.onclick = () => { anaEkran(); modal = false; haritaRenk(); bildirim('Hükümeti kurmak için Çankaya\'dan haber bekleniyor…'); };
    }
    ui.querySelector('#atla').onclick = son;
    ciz();
  }

  /* ---------- ana ekran ---------- */
  function anaEkran() {
    ui.innerHTML = `<div class="ust"><div class="bar">${BAYRAK}<div class="tarih"><b id="trh"></b><span id="unvan"></span></div>
      <div class="hiz"><button data-h="0" aria-label="Duraklat">❚❚</button><button data-h="1">1×</button><button data-h="2">2×</button><button data-h="4">4×</button></div></div>
      <div class="gostergeler" id="gos"></div><div class="serit"><em>GÜNDEM</em><div><span id="hbr"></span></div></div></div>
      <div class="lejant" id="lej"></div>
      <nav class="alt"><button data-p="ekonomi"><span>📊</span>Ekonomi</button><button data-p="yatirim"><span>🏗️</span>Yatırım</button><button data-p="halk"><span>👥</span>Halk</button><button data-p="dunya"><span>🌍</span>Dünya</button><button data-p="gorunum"><span>🗺️</span>Harita</button></nav>`;
    ui.querySelectorAll('[data-h]').forEach(b => b.onclick = () => hiz(+b.dataset.h));
    ui.querySelectorAll('[data-p]').forEach(b => b.onclick = () => panelAc(b.dataset.p));
    hiz(S.hiz || 1); hud(); haberEkle(null); lejant();
  }
  function hiz(h) { S.hiz = h; ui.querySelectorAll('[data-h]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.h === h)); }
  let onceki = null;
  function hud() {
    const t = Sim.gunTarih(S.gun), e = S.eko;
    const trh = ui.querySelector('#trh'); if (!trh) return;
    trh.textContent = `${t.getUTCDate()} ${V.AYLAR[t.getUTCMonth()]} ${t.getUTCFullYear()}`;
    ui.querySelector('#unvan').textContent = (S.b.basbakan ? 'Başbakan ' : 'Genel Başkan ') + S.ad;
    const o = onceki || {};
    const ok = (v, a, iyiArtis) => a === undefined || Math.abs(v - a) < 0.05 ? '' : (v > a) === iyiArtis ? `<i class="iyi">▲</i>` : `<i class="kotu">▼</i>`;
    const kur = S.b.ytl ? e.kur.toFixed(2).replace('.', ',') : sayi(e.kur * 1e6);
    ui.querySelector('#gos').innerHTML = [
      ['anket', 'Anket', yz(S.anket), ok(S.anket, o.anket, true)],
      ['', 'Enflasyon', yz(e.enf), ok(e.enf, o.enf, false)],
      ['', 'Büyüme', yz(e.buyume), ok(e.buyume, o.buyume, true)],
      ['', S.b.ytl ? 'Dolar (YTL)' : 'Dolar (TL)', kur, ok(e.kur, o.kur, false)],
      ['', 'İşsizlik', yz(e.issizlik), ok(e.issizlik, o.issizlik, false)],
      ['', 'Faiz', yz(e.faiz, 0), ''],
      ['', 'Borç/GSYH', yz(e.borc, 0), ok(e.borc, o.borc, false)],
      ['', 'Kişi başı', '$' + sayi(e.kisiBasi), '']
    ].map(([c, ad, v, ar]) => `<div class="gos ${c}"><small>${ad}</small><b>${v}${ar}</b></div>`).join('');
  }
  function aylikHud() { onceki = { anket: S.anket, enf: S.eko.enf, buyume: S.eko.buyume, kur: S.eko.kur, issizlik: S.eko.issizlik, borc: S.eko.borc }; }
  function haberEkle(m) {
    if (m) haberler.unshift(m); haberler = haberler.slice(0, 3);
    const el = ui.querySelector('#hbr'); if (!el) return;
    const metin = haberler.length ? haberler.join('   •   ') : 'Ankara\'da yeni hükümetin ilk günleri. Piyasalar sakin.';
    if (el.textContent !== metin) { el.textContent = metin; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; el.style.animationDuration = Math.max(14, metin.length / 7) + 's'; }
  }
  function lejant() {
    const el = ui.querySelector('#lej'); if (!el) return;
    el.innerHTML = mod === 'destek' ? `Bize destek <i style="background:linear-gradient(90deg,#2f4257,#c9b48a,#e8590c)"></i>` : 'Önde giden parti: ' + ['akp', 'chp', 'mhp', 'dyp', 'dig'].map(k => `<span style="color:${V.PARTI[k].renk}">■</span>`).join('');
  }
  function bildirim(m, sure = 2600) {
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
    if (S && !modal && !panelModal() && S.hiz > 0) {
      acc += dt * S.hiz;
      while (acc >= GUN_SURE && !modal) {
        acc -= GUN_SURE;
        const o = Sim.gunGec();
        if (o.ay) {
          haritaRenk(false, o.anket); hud(); aylikHud(); Harita.projeleriCiz(S.projeler); Sim.kaydet();
          o.biten.forEach(p => { const P = V.PROJE[p.tip]; bildirim(`${P.ikon} ${P.ad} ${p.il}'de hizmete açıldı`); haberEkle(`${p.il}: ${P.ad} açıldı`); });
          if (o.yil) bildirim(`Yeni yıl: yatırım ödeneği ${S.odenek.toFixed(1).replace('.', ',')} milyar`);
        }
        const tStr = Sim.iso(Sim.gunTarih(S.gun)), h = V.HABER.find(x => x[0] === tStr); if (h) haberEkle(h[1]);
        const ol = Sim.bekleyenOlay(); if (ol) { acc = 0; olayAc(ol); }
      }
      hud();
    } else acc = 0;
    requestAnimationFrame(dongu);
  }
  const panelModal = () => !!ilSecimi && false;

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
  function olayAc(o) {
    if (o.yer === 'Siirt') S.b.basbakan = 1;
    if (o.tur === 'karar') return kararKart(o);
    if (o.tur === 'haber') return haberKart(o);
    if (o.tur === 'butce') return butceKart(o);
    if (o.tur === 'asgari') return asgariKart(o);
    if (o.tur === 'secim') return secimEkrani(o);
    if (o.tur === 'son') return sonKart(o);
  }
  function kapatVeDevam(el, o) { el.remove(); Sim.olayBitti(o); modal = false; haritaRenk(); hud(); Sim.kaydet(); }
  function kararKart(o) {
    const el = kartAc(`<div class="ust-serit"><span>Başbakanlık · Karar</span><span class="yer">${esc(o.yer || '')} · ${tarihYazi(o.t)}</span></div>
      <div class="govde"><h2>${esc(o.baslik)}</h2><p>${esc(o.metin)}</p>
      ${o.s.map((s, i) => `<button class="secenek" data-i="${i}">${esc(s.ad)}<div class="ip">${ipuclari(s.etki)}</div></button>`).join('')}</div>`);
    if (o.yer && Harita.iller[o.yer]) Harita.odakla(o.yer, 70);
    el.querySelectorAll('.secenek').forEach(b => b.onclick = () => {
      const s = o.s[+b.dataset.i]; if (o.e) Sim.etkiUygula({ e: o.e }); Sim.etkiUygula(s.etki);
      S.kararlar = (S.kararlar || 0) + 1; if (s.tarih) S.tarihle = (S.tarihle || 0) + 1;
      haberEkle(o.baslik + ': ' + s.ad);
      el.querySelector('.kart').innerHTML = `<div class="ust-serit"><span>Kararın</span><span class="yer">${tarihYazi(o.t)}</span></div><div class="govde"><h2>${esc(s.ad)}</h2>
        ${s.sonuc ? `<p>${esc(s.sonuc)}</p>` : ''}<div class="ip">${ipuclari(s.etki)}</div>
        <div class="tarihte"><b>${s.tarih ? 'Tarihteki kararla aynı' : 'Gerçekte ne oldu?'}</b>${esc(o.tarih)}</div>
        <button class="btn" id="dv">Devam</button></div>`;
      el.querySelector('#dv').onclick = () => { kapatVeDevam(el, o); Harita.genel(); };
    });
  }
  function haberKart(o) {
    Sim.etkiUygula(o.etki);
    const el = kartAc(`<div class="ust-serit son"><span>Son dakika</span><span class="yer" style="color:#fff">${tarihYazi(o.t)}</span></div>
      <div class="govde"><h2>${esc(o.baslik)}</h2><p>${esc(o.metin)}</p><div class="ip">${ipuclari(o.etki)}</div><button class="btn" id="dv">Devam</button></div>`);
    haberEkle(o.baslik);
    el.querySelector('#dv').onclick = () => kapatVeDevam(el, o);
  }
  function butceKart(o) {
    const SEC_B = [
      { ad: 'Sıkı bütçe', h: -1, a: 'Faiz dışı fazla, düşük harcama. Enflasyon hızla düşer, piyasa güvenir; halk sıkılır.' },
      { ad: 'Dengeli bütçe', h: 0, a: 'Programla uyumlu, sınırlı sosyal harcama.' },
      { ad: 'Genişletici bütçe', h: 1, a: 'Yatırım ve sosyal harcama artar. Büyüme hızlanır, enflasyon ve açık yükselir.' },
      { ad: 'Seçim bütçesi', h: 2, a: 'Bol harcama. Kısa vadede çok sevilir, faturası ağır gelir.' }
    ];
    const el = kartAc(`<div class="ust-serit"><span>Maliye · ${o.yil} bütçesi</span><span class="yer">${tarihYazi(o.t)}</span></div>
      <div class="govde"><h2>${o.yil} bütçesi</h2><p>Bütçe açığı GSYH'nin ${yz(S.eko.acik)}'i, borç ${yz(S.eko.borc, 0)}. ${S.pol.imf ? 'IMF programı sürüyor; gevşek bir bütçe programla çatışır.' : 'IMF programı yok; piyasalar bütçeye dikkatle bakıyor.'}</p>
      ${SEC_B.map((s, i) => `<button class="secenek" data-i="${i}">${s.ad}${S.pol.h === s.h ? ' <small style="color:#8a6a10">(şu anki)</small>' : ''}<div class="ip"><span>${esc(s.a)}</span></div></button>`).join('')}
      <div class="tarihte"><b>Gerçekte</b>2003–2007 bütçeleri IMF programına uygun, faiz dışı fazla veren sıkı bütçelerdi.</div></div>`);
    el.querySelectorAll('.secenek').forEach(b => b.onclick = () => {
      const s = SEC_B[+b.dataset.i], et = { e: { h: s.h } };
      if (S.pol.imf && s.h > 0) { et.e.guven = -5 * s.h; et.i = { isd: -3 * s.h }; }
      if (s.h === 2) et.k = { sag: 2, muh: 1 };
      Sim.etkiUygula(et); bildirim(`${o.yil} bütçesi: ${s.ad}`); kapatVeDevam(el, o);
    });
  }
  const ASGARI_GERCEK = { 2004: 303.68, 2005: 350.15, 2006: 380.46, 2007: 403.03 };
  function asgariKart(o) {
    const enf = Math.max(3, S.eko.enf), A = S.asgari, para = v => v.toFixed(2).replace('.', ',') + (S.b.ytl ? ' YTL' : ' YTL');
    const SEC_A = [
      { ad: 'Enflasyon kadar artır', o: enf, et: {} },
      { ad: 'Refah payı ekle', o: enf + 8, et: { k: { sag: 2, muh: 1, kurt: 1 }, i: { isd: -3 }, e: { enf: 0.6 } } },
      { ad: 'Sınırlı artış, istihdamı koru', o: Math.max(2, enf - 6), et: { k: { sag: -2, muh: -1 }, i: { isd: 3 }, e: { guven: 2 } } }
    ];
    const el = kartAc(`<div class="ust-serit"><span>Çalışma · Asgari ücret</span><span class="yer">${tarihYazi(o.t)}</span></div>
      <div class="govde"><h2>${o.yil} asgari ücreti</h2><p>Net asgari ücret şu an ${para(A)}. Enflasyon ${yz(S.eko.enf)}. Sendikalar refah payı, işverenler sınırlı artış istiyor.</p>
      ${SEC_A.map((s, i) => `<button class="secenek" data-i="${i}">${s.ad} <b>→ ${para(A * (1 + s.o / 100))}</b><div class="ip">${ipuclari(s.et) || '<span>Dengeli</span>'}</div></button>`).join('')}
      <div class="tarihte"><b>Gerçekte</b>${o.yil}'te net asgari ücret ${String(ASGARI_GERCEK[o.yil]).replace('.', ',')} YTL oldu.</div></div>`);
    el.querySelectorAll('.secenek').forEach(b => b.onclick = () => {
      const s = SEC_A[+b.dataset.i]; S.asgari = A * (1 + s.o / 100); Sim.etkiUygula(s.et);
      haberEkle(`Asgari ücret ${para(S.asgari)} oldu`); kapatVeDevam(el, o);
    });
  }
  function sonKart(o) {
    const e = S.eko, g = V.GERCEK[2007], c = (ad, sen, ger, d = 1) => `<div class="satir"><span class="ad">${ad}</span><b style="width:70px;text-align:right">${sen}</b><span class="kucuk" style="width:70px;text-align:right">${ger}</span></div>`;
    const el = kartAc(`<div class="ust-serit"><span>Birinci dönem</span><span class="yer">Aralık 2007</span></div><div class="govde"><h2>Beş yılın karnesi</h2>
      <p>${esc(S.ad)}, partini 2002'deki %34'ten bugün ${yz(S.anket)} desteğe taşıdın. ${S.kararlar || 0} kararın ${S.tarihle || 0} tanesi tarihteki kararla aynıydı.</p>
      <div class="satir kucuk"><span class="ad"></span><span style="width:70px;text-align:right">Sen</span><span style="width:70px;text-align:right">Gerçek</span></div>
      ${c('Enflasyon', yz(e.enf), yz(g.enf))}${c('Büyüme', yz(e.buyume), yz(g.buyume))}${c('Dolar', e.kur.toFixed(2).replace('.', ','), String(g.kur).replace('.', ','))}${c('İşsizlik', yz(e.issizlik), yz(g.issizlik))}${c('Borç/GSYH', yz(e.borc, 0), yz(g.borc, 0))}
      <div class="tarihte"><b>Sırada</b>2008 küresel krizi, Ergenekon davaları, 2010 referandumu, YHT'nin açılışı, "çözüm süreci" ve 2011 seçimi. Bir sonraki adımda geliyor.</div>
      <button class="btn" id="dv">Haritada dolaş</button><button class="btn ikincil" id="yb" style="margin-top:8px">Baştan başla</button></div>`);
    el.querySelector('#dv').onclick = () => { el.remove(); Sim.olayBitti(o); hiz(0); modal = false; Sim.kaydet(); };
    el.querySelector('#yb').onclick = () => { Sim.sil(); location.reload(); };
  }

  /* ---------- seçim ekranı ---------- */
  function secimEkrani(o) {
    modal = true; panelKapat();
    const r = Sim.secimYap(o), P = Sim.PARTILER, sira = Object.keys(r.iller).sort(() => Math.random() - 0.5);
    const kat = document.createElement('div');
    kat.innerHTML = `<div class="secim-ekran"><div class="secim-kutu"><div class="bas"><span>${tarihYazi(r.t)} · ${o.secim === 'yerel' ? 'Yerel seçim (il genel meclisi)' : 'Genel seçim'}</span><b>● CANLI</b></div>
      <div class="sandik" id="sk">Açılan sandık %0</div><div id="prt"></div><div id="mc"></div></div></div><div class="secim-alt"><button class="btn ikincil" id="atla">Sonuca geç</button></div>`;
    document.body.appendChild(kat); document.body.classList.add('secimde'); Harita.genel();
    let i = 0, bitti = false;
    const ac = il => { const p = r.iller[il], en = r.kazanan[il]; Harita.ilAyarla(il, V.PARTI[en].renk, 0.4 + p[en] / 100 * 7); };
    Object.keys(r.iller).forEach(il => Harita.ilAyarla(il, '#3a4757', 0.3));
    function ciz(oran) {
      kat.querySelector('#sk').textContent = bitti ? 'Sonuçlar kesinleşti' : 'Açılan sandık ' + yz(oran * 100, 0);
      const g = r.gercek || {};
      kat.querySelector('#prt').innerHTML = P.map(k => `<div class="prt"><span class="amb">${amblem(k)}</span><span class="nm">${V.PARTI[k].ad}</span><span class="cb"><i style="width:${r.ulusal[k] * Math.min(1, oran * 1.4) * 2}%;background:${V.PARTI[k].renk}"></i></span><span class="yz">${yz(r.ulusal[k] * (bitti ? 1 : 0.92 + 0.08 * oran))}</span><span class="gr">${bitti && g[k] ? 'gerçek ' + String(g[k]).replace('.', ',') : ''}</span></div>`).join('');
    }
    const zam = setInterval(() => { if (i < sira.length) { ac(sira[i++]); if (sira[i]) ac(sira[i++]); ciz(i / sira.length); } else son(); }, 150);
    function son() {
      if (bitti) return; bitti = true; clearInterval(zam); sira.forEach(ac); ciz(1);
      let mesaj, kayip = false;
      if (o.secim === 'genel') {
        const s = r.sandalye; kayip = s.akp < 276;
        kat.querySelector('#mc').innerHTML = meclis(s) + `<p class="not" style="text-align:center;margin:4px 0 0">${kayip ? `<b style="color:var(--kotu)">Tek başına iktidar kaybedildi.</b> ${s.akp} sandalye.` : `<b style="color:var(--altin)">${s.akp} sandalyeyle tek başına iktidar.</b>`} Barajı geçen: ${r.gecen.map(k => V.PARTI[k].ad).join(', ')}${s.dig ? `; ${s.dig} bağımsız` : ''}. Gerçekte: AK Parti 341 sandalye.</p>`;
        mesaj = `Seçim: ${yz(r.ulusal.akp)} oy, ${s.akp} sandalye`;
      } else {
        const n = Object.values(r.kazanan).filter(k => k === 'akp').length;
        kat.querySelector('#mc').innerHTML = `<p class="not" style="text-align:center">Partin ${n} ilde birinci çıktı. Gerçekte AK Parti il genel meclisi seçimlerinde %41,7 aldı.</p>`;
        mesaj = `Yerel seçim: ${yz(r.ulusal.akp)} oy, ${n} il`;
      }
      haberEkle(mesaj);
      const b = kat.querySelector('#atla'); b.className = 'btn'; b.textContent = kayip ? 'Sonucu gör' : 'Devam';
      b.onclick = () => {
        kat.remove(); document.body.classList.remove('secimde'); Sim.olayBitti(o);
        if (kayip) return kaybettin(r);
        modal = false; haritaRenk(); hud(); Sim.kaydet();
      };
    }
    kat.querySelector('#atla').onclick = son; ciz(0);
  }
  function kaybettin(r) {
    const el = kartAc(`<div class="ust-serit son"><span>Seçim sonucu</span><span class="yer" style="color:#fff">${tarihYazi(r.t)}</span></div><div class="govde"><h2>Muhalefete düştün</h2>
      <p>Partin ${yz(r.ulusal.akp)} oyla ${r.sandalye.akp} sandalyede kaldı. Meclis'te çoğunluk yok; yeni hükümeti başkaları kuracak. Gerçekte AK Parti 2007'de %46,6 oyla 341 sandalye kazanmıştı.</p>
      <button class="btn" id="yb">Baştan başla</button><button class="btn ikincil" id="dv" style="margin-top:8px">Haritaya bak</button></div>`);
    el.querySelector('#yb').onclick = () => { Sim.sil(); location.reload(); };
    el.querySelector('#dv').onclick = () => { el.remove(); hiz(0); modal = false; };
  }

  /* ---------- paneller ---------- */
  function panelKapat() { if (panel) { panel.remove(); panel = null; } ui.querySelectorAll('[data-p]').forEach(b => b.setAttribute('aria-pressed', 'false')); Harita.seciliYap(null); }
  function panelAc(ad, veri) {
    const ayni = panel && panel.dataset.ad === ad && !veri; panelKapat(); if (ayni) return;
    const b = ui.querySelector(`[data-p="${ad}"]`); if (b) b.setAttribute('aria-pressed', 'true');
    panel = document.createElement('div'); panel.className = 'panel'; panel.dataset.ad = ad; document.body.appendChild(panel);
    ciz();
    function ciz() {
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
    h: { ad: 'Kamu harcaması', s: [[-1, 'Sıkı'], [0, 'Dengeli'], [1, 'Genişletici']], not: 'Harcama büyümeyi ve sevgiyi artırır; enflasyonu ve açığı da.' },
    vergi: { ad: 'Vergi', s: [[-1, 'İndirim'], [0, 'Sabit'], [1, 'Artış']], not: 'Vergi artışı açığı kapatır, büyümeyi yavaşlatır.' },
    mb: { ad: 'Merkez Bankası', s: [['bagimsiz', 'Bağımsız'], ['baski', 'Faiz indirsin']], not: 'Baskı faizi düşürür; güveni ve lirayı zayıflatır.' },
    imf: { ad: 'IMF programı', s: [[true, 'Devam'], [false, 'Bitir']], not: 'Program güven verir ama harcamayı sınırlar.' }
  };
  const PANEL = {
    ekonomi() {
      const e = S.eko;
      return ['Ekonomi', `<div class="satir"><span class="ad">Enflasyon<small>Yıllık TÜFE</small>${grafik('enf', '#ff8a5b')}</span><b>${yz(e.enf)}</b></div>
        <div class="satir"><span class="ad">Büyüme<small>Yıllık GSYH</small>${grafik('buyume', '#3ecf8e')}</span><b>${yz(e.buyume)}</b></div>
        <div class="satir"><span class="ad">Dolar kuru${grafik('kur', '#7fb6e6')}</span><b>${e.kur.toFixed(2).replace('.', ',')}</b></div>
        <div class="satir"><span class="ad">Bütçe açığı<small>GSYH'ye oran</small></span><b>${yz(e.acik)}</b></div>
        <div class="satir"><span class="ad">Piyasa güveni${cubuk(e.guven, '#7fb6e6')}</span><b>${Math.round(e.guven)}</b></div>
        <div class="baslik2">Politikalar</div>
        ${Object.entries(POL).map(([k, p]) => `<div class="satir" style="display:block"><b>${p.ad}</b><div class="secim3">${p.s.map(([v, a]) => `<button data-pol="${k}" data-v="${v}" aria-pressed="${String(S.pol[k]) === String(v)}">${a}</button>`).join('')}</div><div class="kucuk" style="margin-top:4px">${p.not}</div></div>`).join('')}`];
    },
    halk() {
      const a = Sim.anketHesap().ulusal;
      return ['Kamuoyu', `<div class="baslik2" style="margin-top:0">Anket</div>${Sim.PARTILER.map(k => `<div class="prt"><span class="amb">${amblem(k)}</span><span class="nm">${V.PARTI[k].ad}</span><span class="cb"><i style="width:${a[k] * 2}%;background:${V.PARTI[k].renk}"></i></span><span class="yz">${yz(a[k])}</span></div>`).join('')}
        <div class="baslik2">Seçmen kesimleri · bize oy oranı</div>
        ${Object.entries(V.KESIM).map(([k, K]) => { const s = S.kesim[k]; return `<div class="satir"><span style="font-size:22px">${K.ikon}</span><span class="ad">${K.ad}<small>${s.m > 1 ? 'Kararlarından memnun' : s.m < -1 ? 'Kararlarından rahatsız' : 'Kararsız'}</small>${cubuk(s.v * 100, V.PARTI.akp.renk)}</span><b>${yz(s.v * 100, 0)}</b></div>`; }).join('')}
        <div class="baslik2">Kurumlarla ilişki</div>
        ${Object.entries(V.KURUM).map(([k, K]) => `<div class="satir"><span style="font-size:20px">${K.ikon}</span><span class="ad">${K.ad}${cubuk(S.kurum[k], S.kurum[k] < 30 ? '#ff5d5d' : '#7fb6e6')}</span><b>${Math.round(S.kurum[k])}</b></div>`).join('')}`];
    },
    dunya() {
      const ab = S.b.abMuzakere ? 'Katılım müzakereleri başladı.' : S.b.abReform ? `${S.b.abReform} reform paketi çıktı. Müzakere tarihi bekleniyor.` : 'Aday ülke; müzakere tarihi yok.';
      return ['Dış ilişkiler', `${Object.entries(V.DIS).map(([k, K]) => `<div class="satir"><span style="font-size:22px">${K.ikon}</span><span class="ad">${K.ad}${cubuk(S.dis[k], S.dis[k] < 35 ? '#ff5d5d' : '#3ecf8e')}</span><b>${Math.round(S.dis[k])}</b></div>`).join('')}
        <div class="baslik2">AB süreci</div><p class="not">${ab}</p><p class="not">Dünya haritası ve diplomasi ziyaretleri bir sonraki adımda geliyor.</p>`];
    },
    yatirim() {
      const yil = 2002.85 + S.gun / 365;
      const liste = S.projeler.slice().reverse().slice(0, 12).map(p => { const P = V.PROJE[p.tip], k = Math.min(1, (S.gun - p.bas) / (p.bitis - p.bas)); return `<div class="satir"><span style="font-size:20px">${P.ikon}</span><span class="ad">${P.ad} · ${p.il}${cubuk(k * 100, p.bitti ? '#3ecf8e' : '#ffb703')}</span><span class="kucuk">${p.bitti ? 'Açıldı' : Math.round(k * 100) + '%'}</span></div>`; }).join('');
      return ['Yatırımlar', `<p class="not">Yatırım ödeneği: <b style="color:${S.odenek < 0 ? 'var(--kotu)' : 'var(--altin)'}">${S.odenek.toFixed(1).replace('.', ',')} milyar YTL</b>. Ödeneği aşarsan bütçe açığı büyür.</p>
        ${Object.entries(V.PROJE).map(([k, P]) => { const erken = yil < P.yil, var_ = P.tekil && S.projeler.some(p => p.tip === k); return `<div class="proje"><span class="em">${P.ikon}</span><span class="ad"><b>${P.ad}</b><span class="kucuk">${P.maliyet.toString().replace('.', ',')} milyar · ${P.sure} ay${P.il ? ' · ' + P.il : ''}</span><br><span class="kucuk">${esc(P.bilgi)}</span></span><button data-proje="${k}" ${erken || var_ ? 'disabled' : ''}>${erken ? P.yil : var_ ? 'Var' : 'Kur'}</button></div>`; }).join('')}
        ${liste ? '<div class="baslik2">Projelerin</div>' + liste : ''}`];
    },
    gorunum() {
      return ['Harita', `<div class="secim3"><button data-mod="destek" aria-pressed="${mod === 'destek'}">Bize destek</button><button data-mod="kazanan" aria-pressed="${mod === 'kazanan'}">Önde giden parti</button></div>
        <p class="not">İllerin yüksekliği oy oranını gösterir. Bir ile dokunarak ayrıntısını gör; iki parmakla yakınlaş, çevir.</p>
        <button class="btn ikincil" id="tr">Türkiye'nin tamamına dön</button>
        ${S.secimler.length ? '<div class="baslik2">Geçmiş seçimler</div>' + S.secimler.map(s => `<div class="satir"><span class="ad">${tarihYazi(s.t)} · ${s.tur === 'genel' ? 'Genel' : 'Yerel'}</span><b>${yz(s.ulusal.akp)}${s.sandalye ? ' · ' + s.sandalye.akp + ' MV' : ''}</b></div>`).join('') : ''}`];
    },
    il(ad) {
      const a = Sim.anketHesap().iller[ad], il = Sim.IL[ad], pr = S.projeler.filter(p => p.il === ad), yil = 2002.85 + S.gun / 365;
      const son = S.secimler.length ? S.secimler[S.secimler.length - 1] : null;
      return [esc(ad), `<p class="not">${sayi(il.secmen)} geçerli oy (2002) · ${il.mv} milletvekili · 2002'de birinci: ${V.PARTI[Object.keys(il.taban).reduce((e, k) => il.taban[k] > il.taban[e] ? k : e, 'akp')].ad}${son ? ` · ${tarihYazi(son.t)}: ${V.PARTI[son.kazanan[ad]].ad}` : ''}</p>
        <div class="baslik2" style="margin-top:4px">Bugünkü anket</div>${Sim.PARTILER.map(k => `<div class="prt"><span class="amb">${amblem(k, 22)}</span><span class="nm">${V.PARTI[k].ad}</span><span class="cb"><i style="width:${a[k] * 1.6}%;background:${V.PARTI[k].renk}"></i></span><span class="yz">${yz(a[k])}</span><span class="gr">${yz(il.taban[k], 0)}</span></div>`).join('')}
        <p class="kucuk" style="text-align:right;margin:0">sağdaki: 2002</p>
        <div class="baslik2">Bu ile yatırım</div>
        ${Object.entries(V.PROJE).filter(([, P]) => !P.il || P.il === ad).map(([k, P]) => { const erken = yil < P.yil, var_ = pr.some(p => p.tip === k) || (P.tekil && S.projeler.some(p => p.tip === k)); return `<div class="proje"><span class="em">${P.ikon}</span><span class="ad"><b>${P.ad}</b><span class="kucuk">${String(P.maliyet).replace('.', ',')} milyar · ${P.sure} ay</span></span><button data-kur="${k}" ${erken || var_ ? 'disabled' : ''}>${erken ? P.yil : var_ ? 'Var' : 'Kur'}</button></div>`; }).join('')}`];
    }
  };
  const PANEL_KUR = {
    ekonomi(el, v, ciz) {
      el.querySelectorAll('[data-pol]').forEach(b => b.onclick = () => {
        const k = b.dataset.pol, raw = b.dataset.v, val = raw === 'true' ? true : raw === 'false' ? false : isNaN(+raw) ? raw : +raw;
        if (String(S.pol[k]) === String(val)) return;
        const et = { e: {} }; et.e[k] = val;
        if (k === 'mb' && val === 'baski') { et.e.guven = -8; et.i = { isd: -4 }; }
        if (k === 'imf' && val === false) { et.e.guven = -12; et.i = { isd: -6 }; et.k = { mil: 2 }; }
        if (k === 'imf' && val === true) { et.e.guven = 6; }
        if (k === 'vergi' && val === 1) et.k = { sag: -2, laik: -1 };
        if (k === 'vergi' && val === -1) et.k = { sag: 1 };
        Sim.etkiUygula(et); hud(); ciz(); bildirim(POL[k].ad + ': ' + b.textContent);
      });
    },
    yatirim(el) {
      el.querySelectorAll('[data-proje]').forEach(b => b.onclick = () => {
        const k = b.dataset.proje, P = V.PROJE[k];
        if (P.il) return projeKur(k, P.il);
        panelKapat(); ilSecimi = k;
        const ban = document.createElement('div'); ban.className = 'ilsec'; ban.id = 'ilsec'; ban.innerHTML = `${P.ikon} Bir il seç <button>Vazgeç</button>`;
        document.body.appendChild(ban); ban.querySelector('button').onclick = () => { ilSecimi = null; ban.remove(); };
      });
    },
    gorunum(el, v, ciz) {
      el.querySelectorAll('[data-mod]').forEach(b => b.onclick = () => { mod = b.dataset.mod; haritaRenk(); lejant(); ciz(); });
      el.querySelector('#tr').onclick = () => { Harita.genel(); panelKapat(); };
    },
    il(el, ad, ciz) {
      Harita.seciliYap(ad);
      el.querySelectorAll('[data-kur]').forEach(b => b.onclick = () => { if (projeKur(b.dataset.kur, ad)) ciz(); });
    }
  };
  function projeKur(tip, il) {
    const r = Sim.projeKur(tip, il), P = V.PROJE[tip];
    if (r !== 'tamam') { bildirim(r === 'erken' ? `${P.ad} ${P.yil}'ten itibaren` : 'Bu proje zaten var'); return false; }
    Harita.projeleriCiz(S.projeler); haritaRenk(); bildirim(`${P.ikon} ${P.il || il}: ${P.ad} için temel atıldı`); haberEkle(`${P.il || il}'de ${P.ad} için temel atıldı`);
    Sim.kaydet(); return true;
  }
  function ilSecildi(ad) {
    if (modal) return;
    if (ilSecimi) {
      if (!ad) return; const k = ilSecimi; ilSecimi = null; const b = document.getElementById('ilsec'); if (b) b.remove();
      projeKur(k, ad); return;
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
