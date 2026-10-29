/* Kuruluş 1299 — sefer haritası (2D, parşömen). Koordinatlar yaklaşık; kıyılar elle çizildi. */
'use strict';
(function () {
  const V = window.VERI, H = V.HARITA;
  const RENK = { osm: '#a3222f', biz: '#6b3fa0', ger: '#2f6b5a', kar: '#b5762a' };
  const SAHIP_AD = { osm: 'Osmanlı', biz: 'Bizans', ger: 'Germiyanoğulları', kar: 'Karesioğulları' };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let el = null, tuval, ctx, Wd, Hd, secili = null, cb = {};

  function ac(geriCagri) {
    cb = geriCagri || {};
    el = document.createElement('div'); el.className = 'harita';
    el.innerHTML = `<div class="h-ust"><div><b>Sefer haritası · ${V.AYLAR[Sim.durum().ay]} ${Sim.durum().yil}</b><div class="h-lejant">${Object.entries(SAHIP_AD).map(([k, ad]) => `<span><i style="background:${RENK[k]}"></i>${ad}</span>`).join('')}</div></div><button id="hKapat" aria-label="Kapat">✕</button></div>
      <div class="h-tuval"><canvas id="hTuval"></canvas></div><div class="h-bilgi" id="hBilgi"></div>`;
    document.body.appendChild(el);
    tuval = el.querySelector('#hTuval'); ctx = tuval.getContext('2d');
    el.querySelector('#hKapat').onclick = kapat;
    boyut(); window.addEventListener('resize', boyut);
    tuval.addEventListener('click', tik);
    bilgi(Sim.durum().sefer ? Sim.durum().sefer.hedef : null);
  }
  function kapat() { if (el) el.remove(); el = null; window.removeEventListener('resize', boyut); if (cb.kapat) cb.kapat(); }
  function boyut() {
    const k = el.querySelector('.h-tuval'), w = k.clientWidth, h = k.clientHeight, d = Math.min(2, devicePixelRatio || 1);
    const oran = (H.sinir.boylamMax - H.sinir.boylamMin) * 0.76 / (H.sinir.enlemMax - H.sinir.enlemMin);
    Wd = Math.min(w, h * oran); Hd = Wd / oran;
    tuval.width = Wd * d; tuval.height = Hd * d; tuval.style.width = Wd + 'px'; tuval.style.height = Hd + 'px';
    ctx.setTransform(d, 0, 0, d, 0, 0); ciz();
  }
  const px = (e, b) => [(b - H.sinir.boylamMin) / (H.sinir.boylamMax - H.sinir.boylamMin) * Wd, (H.sinir.enlemMax - e) / (H.sinir.enlemMax - H.sinir.enlemMin) * Hd];

  function ciz() {
    const S = Sim.durum();
    // parşömen zemin
    const g = ctx.createRadialGradient(Wd / 2, Hd / 2, 10, Wd / 2, Hd / 2, Math.max(Wd, Hd) * 0.7);
    g.addColorStop(0, '#f3e6c4'); g.addColorStop(1, '#d9c28c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, Wd, Hd);
    // deniz: kıyı şeridinin kuzeyi
    ctx.beginPath(); H.marmara.forEach(([e, b], i) => { const [x, y] = px(e, b); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.lineTo(0, px(40.38, 28.45)[1]); ctx.lineTo(0, 0); ctx.closePath();
    ctx.fillStyle = '#9fc2c9'; ctx.fill(); ctx.strokeStyle = '#6a8f96'; ctx.lineWidth = 1.5; ctx.stroke();
    // Karadeniz (kuzey kıyısı, yaklaşık)
    ctx.beginPath(); const kd = [[41.18, 29.1], [41.2, 29.9], [41.13, 30.5], [41.12, 31.0]];
    kd.forEach(([e, b], i) => { const [x, y] = px(e, b); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.lineTo(Wd, 0); ctx.lineTo(px(41.2, 29.1)[0], 0); ctx.closePath(); ctx.fillStyle = '#9fc2c9'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(40,70,80,.55)'; ctx.font = 'italic 600 13px Cormorant Garamond, Georgia, serif';
    ctx.fillText('Marmara', ...px(40.7, 28.6)); ctx.fillText('Karadeniz', ...px(41.08, 30.3));
    // göller
    H.gol.forEach(l => { const [x, y] = px(l.e, l.b); const rx = l.rb / (H.sinir.boylamMax - H.sinir.boylamMin) * Wd, ry = l.re / (H.sinir.enlemMax - H.sinir.enlemMin) * Hd; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.fillStyle = '#9fc2c9'; ctx.fill(); ctx.stroke(); });
    // nehir
    ctx.beginPath(); H.nehir.forEach(([e, b], i) => { const [x, y] = px(e, b); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.strokeStyle = '#6a9aa3'; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.fillStyle = 'rgba(40,70,80,.55)'; ctx.font = 'italic 600 11px Cormorant Garamond, Georgia, serif'; ctx.fillText('Sakarya', ...px(40.62, 30.42));
    // dağlar
    H.daglar.forEach(([e, b, ad]) => { const [x, y] = px(e, b); ctx.fillStyle = '#b39a6a'; for (const d of [-9, 0, 9]) { ctx.beginPath(); ctx.moveTo(x + d - 8, y + 6); ctx.lineTo(x + d, y - 8 - (d ? 0 : 4)); ctx.lineTo(x + d + 8, y + 6); ctx.fill(); } if (ad) { ctx.fillStyle = '#6b5530'; ctx.font = 'italic 11px Cormorant Garamond, Georgia, serif'; ctx.fillText(ad, x - 14, y + 18); } });
    // yollar
    ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(107,85,48,.7)'; ctx.lineWidth = 1.3;
    H.yollar.forEach(([a, b]) => { const A = Sim.yerV(a), B = Sim.yerV(b); ctx.beginPath(); ctx.moveTo(...px(A.e, A.b)); ctx.lineTo(...px(B.e, B.b)); ctx.stroke(); });
    ctx.setLineDash([]);
    // sefer yolu ve ordu
    if (S.sefer) {
      const A = Sim.yerV('sogut'), B = Sim.yerV(S.sefer.hedef), u = 1 - S.sefer.kalan / S.sefer.sure;
      const [x1, y1] = px(A.e, A.b), [x2, y2] = px(B.e, B.b);
      ctx.strokeStyle = '#a3222f'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      const x = x1 + (x2 - x1) * Math.max(0.12, u), y = y1 + (y2 - y1) * Math.max(0.12, u);
      ctx.font = '20px system-ui'; ctx.textAlign = 'center'; ctx.fillText('⚔️', x, y + 6); ctx.textAlign = 'left';
    }
    // yerler
    H.yerler.forEach(y => {
      const [x, yy] = px(y.e, y.b), k = S.kaleler[y.id], renk = RENK[k.sahip] || '#555';
      const r = y.baskent ? 9 : y.garnizon > 100 || y.kapali ? 8 : 6.5;
      if (secili === y.id) { ctx.beginPath(); ctx.arc(x, yy, r + 6, 0, 7); ctx.strokeStyle = '#2b2016'; ctx.lineWidth = 2; ctx.stroke(); }
      // kale simgesi: dişli kare
      ctx.fillStyle = renk; ctx.strokeStyle = '#2b2016'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.rect(x - r, yy - r * 0.7, r * 2, r * 1.5); ctx.fill(); ctx.stroke();
      for (let d = -1; d <= 1; d++) { ctx.fillRect(x + d * r * 0.75 - r * 0.22, yy - r * 1.1, r * 0.44, r * 0.45); }
      if (k.sahip === 'osm') { ctx.fillStyle = '#f3e6c4'; ctx.font = `700 ${r}px system-ui`; ctx.textAlign = 'center'; ctx.fillText('☾', x, yy + r * 0.45); ctx.textAlign = 'left'; }
      ctx.fillStyle = '#2b2016'; ctx.font = `700 ${y.baskent || y.garnizon > 100 ? 14 : 12.5}px Cormorant Garamond, Georgia, serif`;
      const lx = x + (y.lx || 0), ly = yy + r + 13 + (y.ly || 0);
      ctx.textAlign = 'center'; ctx.fillText(y.ad, lx, ly);
      if (y.eski && Wd > 330) { ctx.font = 'italic 10px Cormorant Garamond, Georgia, serif'; ctx.fillStyle = '#6b5530'; ctx.fillText(y.eski, lx, ly + 11); }
      ctx.textAlign = 'left';
    });

  }
  function tik(e) {
    const r = tuval.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    let en = null, d = 28;
    H.yerler.forEach(y => { const [x, yy] = px(y.e, y.b), m = Math.hypot(x - mx, yy - my); if (m < d) { d = m; en = y.id; } });
    if (en) bilgi(en);
  }
  function tahmin(y) {
    const S = Sim.durum(), k = S.kaleler[y.id];
    const ivme = (S.yil >= y.fetih ? 0.6 : 1 + Math.min(1.5, (y.fetih - S.yil) * 0.05)) * (y.abluka && S.yil >= y.abluka ? 0.75 : 1);
    return Math.round(k.garnizon * 4 * (y.sur || 1) * ivme);
  }
  function orduGucu(o, y) {
    let g = 0; for (const [id, n] of Object.entries(o)) { const b = Sim.birlikV(id); g += n * b.saldiri * ((y.sur || 1) > 1.05 ? Math.pow(b.kusatma, 0.9) : (id === 'akinci' ? 1.25 : 1)); }
    return Math.round(g * (0.85 + Sim.durum().memnun / 400));
  }
  function bilgi(id) {
    secili = id; ciz();
    const S = Sim.durum(), b = el.querySelector('#hBilgi');
    if (!id) { b.innerHTML = `<p class="h-not">Bir kaleye dokun. ${S.sefer ? '' : 'Ordun Söğüt\'te bekliyor.'}</p>`; return; }
    const y = Sim.yerV(id), k = S.kaleler[id];
    let govde = `<h3>${esc(y.ad)}${y.eski ? ` <small>(${esc(y.eski)})</small>` : ''}</h3><p class="h-not"><b style="color:${RENK[k.sahip]}">${SAHIP_AD[k.sahip]}</b>${y.fetih ? ` · Gerçek tarih: ${esc(y.not)}` : ' · ' + esc(y.not || '')}</p>`;
    if (S.sefer && S.sefer.hedef === id) govde += `<p>Ordun yolda: ${S.sefer.kalan} ay sonra ${y.savas ? 'meydan savaşı' : 'kuşatma'} başlayacak.</p>`;
    else if (k.sahip === 'biz' && !y.kapali) {
      const o = S.ordu, top = o.yaya + o.okcu + o.akinci;
      const sec = Object.assign({}, o);
      const ciz2 = () => {
        const sure = Sim.seferSuresi(id, sec), guc = orduGucu(sec, y), sav = tahmin(y);
        b.querySelector('#hSec').innerHTML = V.BIRLIKLER.map(v => `<div class="h-birlik"><span>${v.ikon} ${v.ad}</span><span><button data-a="${v.id}" data-d="-5">−5</button><b>${sec[v.id]}</b><button data-a="${v.id}" data-d="5">+5</button></span></div>`).join('') +
          `<p class="h-not">Ordu gücü <b>${guc}</b> · tahmini savunma <b>${sav}</b>${(y.sur || 1) > 1.05 ? ` · sur ×${y.sur}` : ''} · yürüyüş ${sure} ay ${guc > sav * 1.15 ? '· <b style="color:#2f6b2a">üstünsün</b>' : guc > sav * 0.85 ? '· <b style="color:#8a5a10">denk</b>' : '· <b style="color:#a3222f">zayıfsın</b>'}</p>`;
        b.querySelectorAll('[data-a]').forEach(x => x.onclick = () => { const id2 = x.dataset.a; sec[id2] = Math.max(0, Math.min(o[id2], sec[id2] + +x.dataset.d)); ciz2(); });
      };
      govde += S.sefer ? '<p class="h-not">Başka bir sefer sürüyor.</p>' : top ? `<div id="hSec"></div><button class="btn" id="hGit">${y.savas ? 'Meydan savaşına git' : 'Kuşatmaya git'}</button>` : '<p class="h-not">Ordun yok. Şehirde Alay meydanı kur, ⚔️ Ordu panelinden asker yetiştir.</p>';
      b.innerHTML = govde;
      if (!S.sefer && top) {
        ciz2();
        b.querySelector('#hGit').onclick = () => { const r = Sim.seferBaslat(id, sec); if (r === 'tamam') { if (cb.sefer) cb.sefer(id); bilgi(id); } };
      }
      return;
    } else if (k.sahip === 'osm' && id !== 'sogut') govde += '<p class="h-not">Senin toprağın: her ay 3 akçe ve 4 yiyecek (tımar).</p>';
    if (id === 'bursa' && k.sahip === 'osm' && S.sehir !== 'bursa') govde += '<button class="btn" id="hTasi">Başkenti Bursa\'ya taşı</button>';
    b.innerHTML = govde;
    const t = b.querySelector('#hTasi'); if (t) t.onclick = () => { if (cb.tasi) cb.tasi(); };
  }
  function guncelle() { if (el) { ciz(); bilgi(secili); } }

  window.Harita = { ac, kapat, guncelle, acik: () => !!el };
})();
