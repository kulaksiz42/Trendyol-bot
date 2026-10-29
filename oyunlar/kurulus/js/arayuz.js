/* Kuruluş 1299 — arayüz: kaynak çubuğu, bina çubuğu, yerleştirme, ferman, zaman. */
'use strict';
(function () {
  const V = window.VERI, $ = s => document.querySelector(s);
  const IKON = { cadir: '⛺', ev: '🏠', tarla: '🌾', agil: '🐑', oduncu: '🪓', tasocagi: '⛏️', pazar: '🏪', mescit: '🕌', han: '🐫', meydan: '🚩', ahir: '🐎' };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tam = x => Math.floor(x).toLocaleString('tr-TR');
  let S = null, modal = false, secili = null, sonAylik = {};

  Dunya.kur($('#sahne'), { onTik: binaBilgi, onKare: kare });

  /* ---------- açılış ---------- */
  function acilis() {
    const kayit = Sim.yukle();
    const el = document.createElement('div'); el.className = 'acilis';
    el.innerHTML = `<div><h1><span>KURULUŞ</span>1299</h1>
      <p>Söğüt, ilkbahar 1299. Kayı boyunun küçük obası Sakarya'ya inen bir vadide konaklıyor. Ufukta Bizans tekfurlarının kaleleri. Bir beylik doğmak üzere.</p>
      ${kayit ? `<button class="btn" id="devam">Devam et · ${esc(V.AYLAR[kayit.ay])} ${kayit.yil}</button>` : ''}
      <button class="btn ${kayit ? 'ikincil' : ''}" id="yeni">Obayı kur</button>
      <small>Bir parmakla kaydır: gez · İki parmakla: yakınlaştır ve döndür. Olaylar Wikipedia'daki tarih çizelgesine dayanır; tartışmalı tarihler belirtilir.</small></div>`;
    document.body.appendChild(el);
    if (kayit) $('#devam').onclick = () => { el.remove(); S = kayit; dunyayiKur(); basla(); };
    $('#yeni').onclick = () => { if (kayit && !confirm('Kayıtlı oyun silinsin mi?')) return; el.remove(); Sim.sil(); S = Sim.yeni(); obayiKur(); basla(); };
  }
  // başlangıç: 4 çadır ve bir ağıl hazır gelir
  function obayiKur() {
    const [ci, cj] = Dunya.baslangicYeri();
    const koy = (tip, di, dj) => {
      const v = Sim.binaV(tip);
      // hedef noktanın çevresinde halka halka uygun yer ara
      for (let r = 0; r < 6; r++) for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) {
        if (Math.max(Math.abs(a), Math.abs(b)) !== r) continue;
        const i = ci + di + a, j = cj + dj + b;
        if (Dunya.uygun(v, i, j)[0]) { const bina = Sim.binaEkle(tip, i, j, 0, true); Dunya.binaEkle(bina, v); return; }
      }
    };
    koy('cadir', 0, 0); koy('cadir', 2, 0); koy('cadir', 0, 2); koy('cadir', 2, 2); koy('agil', -3, 0);
    S.merkez = [ci, cj];
  }
  function dunyayiKur() { S.binalar.forEach(b => Dunya.binaEkle(b, Sim.binaV(b.tip))); }
  function basla() {
    ['#ust', '#gorev', '#alt', '#yan'].forEach(s => { $(s).hidden = false; });
    $('#btnOrdu').onclick = orduPaneli;
    $('#btnHarita').onclick = haritaAc;
    Dunya.askerGoster(S.ordu.yaya + S.ordu.okcu + S.ordu.akinci, S.binalar.find(b => b.tip === 'meydan'));
    const [ci, cj] = S.merkez || Dunya.baslangicYeri(), [x, z] = Dunya.dunyadan(ci, cj);
    Dunya.odakla(x, z);
    const k = Dunya.kamera(); k.position.set(x - 20, 40, z + 38);
    Dunya.mevsim(S.ay);
    Sim.isciDagit();
    Dunya.nufusGuncelle(S.nufus, S.binalar, Sim.binaV);
    hiz(S.hiz || 1); binaCubugu(); ciz();
    if (S.sefer && S.sefer.bekliyor) setTimeout(() => meydanSavasi(S.sefer.hedef), 600);
    if (!S.binalar.some(b => !['cadir', 'agil'].includes(b.tip))) ipucu('Alttan bir bina seç, haritada yerine dokun, ✓ ile kur.');
  }

  /* ---------- zaman ---------- */
  function kare(dt) {
    if (!S || modal || !S.hiz) return;
    S.t += dt * S.hiz;
    if (S.t >= V.AY_SURE) { S.t -= V.AY_SURE; ayGecti(); }
  }
  function ayGecti() {
    const onceki = Object.assign({}, S.kaynak);
    const { rapor, bitenGorev, savas } = Sim.ayGec(b => Dunya.cevre(b, Sim.binaV(b.tip)));
    sonAylik = rapor;
    S.binalar.forEach(b => Dunya.binaGuncelle(b));
    Dunya.mevsim(S.ay);
    Dunya.nufusGuncelle(S.nufus, S.binalar, Sim.binaV);
    uretimGoster();
    if (bitenGorev) bildirim(`Görev tamam: <b>${esc(bitenGorev.ad)}</b> · ${fxYazi(bitenGorev.odul)}`);
    if (S.gunluk.length && S.gunluk[0].t === Sim.tarihYazi()) bildirim(esc(S.gunluk[0].m));
    Dunya.askerGoster(S.ordu.yaya + S.ordu.okcu + S.ordu.akinci, S.binalar.find(b => b.tip === 'meydan'));
    binaCubugu(); ciz();
    if (window.Harita.acik()) Harita.guncelle();
    if (savas && savas.meydan) meydanSavasi(savas.hedef);
    else if (savas) savasRaporu(savas); else tarihKontrol();
  }

  /* ---------- ordu ---------- */
  function orduPaneli() {
    const o = S.ordu, top = o.yaya + o.okcu + o.akinci, limit = Math.floor(S.nufus * 0.35), ask = Sim.asker();
    const egt = S.egitim.map(e => `${Sim.birlikV(e.tip).ikon} ${e.adet}`).join(' ');
    sayfa(`<h2>⚔️ Ordu</h2><p class="alt-baslik">Askerler nüfustan çıkar ve çalışmaz. Her asker ayda ${String(V.BAKIM.yiyecek).replace('.', ',')} 🌾 ve ${String(V.BAKIM.akce).replace('.', ',')} 🪙 yer. Sınır: nüfusun %35'i (${limit}).</p>
      <div class="dokum"><div><span>Hazır</span><span>🗡️ ${o.yaya} · 🏹 ${o.okcu} · 🐎 ${o.akinci}</span></div>
      ${S.egitim.length ? `<div><span>Eğitimde (1 ay)</span><span>${egt}</span></div>` : ''}
      ${S.sefer ? `<div><span>Seferde</span><span>${esc(Sim.yerV(S.sefer.hedef).ad)} · ${S.sefer.kalan} ay</span></div>` : ''}
      <div><span>Toplam asker / sınır</span><span>${ask} / ${limit}</span></div></div>
      ${V.BIRLIKLER.map(v => { const acik = Sim.say(v.gerek) > 0; return `<div class="birlik ${acik ? '' : 'kapali'}"><div><b>${v.ikon} ${esc(v.ad)}</b><small>${esc(v.acik)} · saldırı ${v.saldiri}, kuşatma ×${String(v.kusatma).replace('.', ',')}</small><small>${Object.entries(v.maliyet).map(([k, m]) => V.KAYNAK[k].ikon + m).join(' ')} / asker${acik ? '' : ' · 🔒 ' + esc(Sim.binaV(v.gerek).ad)}</small></div>
        <div class="adet">${[1, 5].map(n => `<button data-yetis="${v.id}" data-n="${n}" ${acik ? '' : 'disabled'}>+${n}</button>`).join('')}</div></div>`; }).join('')}
      <button class="btn ikincil" id="hBtn">🗺️ Sefer haritası</button>`, p => {
      p.querySelectorAll('[data-yetis]').forEach(b => b.onclick = () => {
        const r = Sim.egitimBaslat(b.dataset.yetis, +b.dataset.n);
        if (r === 'nufus') bildirim('Asker sınırına ulaştın: nüfus artmalı.'); else if (r === 'kaynak') bildirim('Kaynak yetmiyor.'); else if (r === 'bina') bildirim('Önce gereken binayı kur.');
        p.remove(); ciz(); orduPaneli();
      });
      p.querySelector('#hBtn').onclick = () => { p.remove(); haritaAc(); };
    });
  }
  function haritaAc() {
    modal = true;
    Harita.ac({ kapat: () => { modal = false; ciz(); }, sefer: hedef => { Dunya.askerGoster(S.ordu.yaya + S.ordu.okcu + S.ordu.akinci, S.binalar.find(b => b.tip === 'meydan')); bildirim(`Ordu ${esc(Sim.yerV(hedef).ad)} yolunda.`); ciz(); } });
  }
  // tarihî meydan savaşı: 3D savaş ekranı
  function meydanSavasi(hedef) {
    modal = true;
    const y = Sim.yerV(hedef), d = Sim.dusmanOrdusu(hedef);
    Dunya.duraklat(true);
    Savas.baslat({
      ad: y.id === 'koyunhisar' ? 'Koyunhisar (Bapheus) Savaşı' : y.ad + ' meydan savaşı',
      alt: `${V.AYLAR[S.ay]} ${S.yil} · Bizans komutanı: Georgios Muzalon`,
      ordu: S.sefer.ordu, dusman: d,
      giris: 'Bir alay seç, emir ver. Düşmana dokunarak hedef göster. Akıncılarla kanattan dolanmak çok etkilidir.'
    }, sonuc => {
      Dunya.duraklat(false);
      const r = Sim.meydanBitir(Object.assign(sonuc, { ivme: d.ivme }));
      if (r) savasRaporu(r); else { modal = false; }
    });
  }
  function savasRaporu(r) {
    modal = true;
    const el = document.createElement('div'); el.className = 'ferman';
    const kayip = Object.entries(r.kayip).filter(([, n]) => n).map(([id, n]) => Sim.birlikV(id).ikon + ' ' + n).join(' · ') || 'yok';
    const anlat = r.meydan
      ? (r.zafer ? 'Bizans safları dağıldı. Kaynaklara göre Alan paralı askerleri savaşa girmeden Bizans\'ın geri çekilmesini korudu. Halil İnalcık\'a göre beylik bu zaferle devlet niteliği kazandı.' : 'Bizans safları dayandı. Ordu geri çekildi; tarih bir sonraki seferi bekliyor.')
      : r.zafer
      ? (r.savas ? `Bizans ordusu ovada saf tuttu. Akıncılar kanatlardan dolandı, okçular merkezi dağıttı. Bizans kumandanı geri çekildi.` : `Kuşatma sürdü; ${r.ivme < 1 ? 'kalenin erzakı tükenmişti ve' : ''} surlar sonunda teslim oldu. Halk vergiyi artık Osmanlı'ya ödeyecek.`)
      : (r.savas ? 'Bizans saflarını yaramadık. Ordu dağınık halde geri döndü.' : 'Surlar fazla güçlüydü. Kuşatma kaldırıldı, ordu kayıplarla döndü.');
    el.innerHTML = `<div class="kag"><p class="yil">${V.AYLAR[S.ay].toUpperCase()} ${S.yil}</p><h2>${r.zafer ? 'Zafer: ' : 'Hezimet: '}${esc(r.ad)}</h2><p>${anlat}</p>
      <div class="fx"><span>Ordu gücü ${r.guc}</span><span>Savunma ${r.savunma}</span><span>Kayıp: ${kayip}</span>${r.zafer ? `<span>🪙+${r.ganimet}</span><span>👥+${r.tebaa}</span>` : ''}</div>
      ${r.ivme < 1 ? '<p class="kaynak">Tarihte bu kale bu yıllarda Osmanlı\'ya geçti; savunması zayıflamıştı.</p>' : r.ivme > 1.2 ? '<p class="kaynak">Tarihin önüne geçtin: bu kale gerçekte daha sonra alındı, savunması çok güçlüydü.</p>' : ''}
      <button class="btn" id="tm">Devam</button></div>`;
    document.body.appendChild(el);
    el.querySelector('#tm').onclick = () => { el.remove(); modal = false; Dunya.askerGoster(S.ordu.yaya + S.ordu.okcu + S.ordu.akinci, S.binalar.find(b => b.tip === 'meydan')); ciz(); tarihKontrol(); };
  }
  function hiz(h) {
    S.hiz = h; Dunya.hiz(h);
    document.querySelectorAll('[data-hiz]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.hiz === h));
  }

  /* ---------- üst çubuk ---------- */
  function ciz() {
    const k = S.kaynak, r = sonAylik || {}, konut = Sim.konut();
    const fark = n => { const d = r[n] || 0; return Math.abs(d) < 0.5 ? '' : `<small class="${d > 0 ? 'art' : 'eks'}">${d > 0 ? '+' : ''}${Math.round(d)}</small>`; };
    const kitlik = k.yiyecek < S.nufus * 1.5 && (r.yiyecek || 0) < 0;
    $('#ust').innerHTML = `<div class="kaynaklar">
        <span class="kay ${kitlik ? 'uyari' : ''}"><i>🌾</i>${tam(k.yiyecek)}${fark('yiyecek')}</span>
        <span class="kay"><i>🪵</i>${tam(k.odun)}${fark('odun')}</span>
        <span class="kay"><i>🪨</i>${tam(k.tas)}${fark('tas')}</span>
        <span class="kay"><i>🪙</i>${tam(k.akce)}${fark('akce')}</span>
        <span class="kay ${S.nufus >= konut ? 'uyari' : ''}"><i>👥</i>${S.nufus}<small>/${konut}</small></span>
        <span class="kay"><i>${S.memnun > 65 ? '😊' : S.memnun > 40 ? '😐' : '😠'}</i>${Math.round(S.memnun)}</span></div>
      <div class="zaman"><div class="tarih">${V.AYLAR[S.ay]} ${S.yil}<small>${mevsimAdi(S.ay)} · boşta ${S.bosIsci || 0} kişi</small></div>
        <div class="hiz">${[[0, '❚❚'], [1, '▶'], [2, '▶▶'], [4, '▶▶▶']].map(([h, t]) => `<button data-hiz="${h}" aria-pressed="${S.hiz === h}" aria-label="Hız ${h}">${t}</button>`).join('')}</div></div>`;
    document.querySelectorAll('[data-hiz]').forEach(b => b.onclick = () => hiz(+b.dataset.hiz));
    const g = V.GOREVLER[S.gorev];
    $('#gorev').innerHTML = g ? `<b>Görev</b>${esc(g.ad)}` : '<b>Görevler bitti</b>Bursa\'ya giden yol açık.';
  }
  const mevsimAdi = ay => ay === 11 || ay <= 1 ? 'Kış' : ay <= 4 ? 'İlkbahar' : ay <= 7 ? 'Yaz' : 'Sonbahar';
  const fxYazi = fx => Object.entries(fx).map(([k, m]) => (V.KAYNAK[k] ? V.KAYNAK[k].ikon : k === 'nufus' ? '👥' : k === 'memnun' ? '😊' : '') + (m > 0 ? '+' : '') + m).join(' ');

  /* ---------- bina çubuğu ve yerleştirme ---------- */
  function binaCubugu() {
    const yer = Dunya.yerlestirme();
    $('#binalar').innerHTML = V.BINALAR.map(v => {
      const acik = Sim.acikMi(v.id), al = Sim.alinabilir(v.id);
      const maliyet = Object.entries(v.maliyet).map(([k, m]) => V.KAYNAK[k].ikon + m).join(' ');
      return `<button class="bina" data-bina="${v.id}" aria-pressed="${!!(yer && yer.v.id === v.id)}" ${!acik ? 'disabled' : ''}>
        <span class="ik">${IKON[v.id]}</span><b>${esc(v.ad)}</b>${acik ? `<small style="${al ? '' : 'color:var(--kirmizi)'}">${maliyet}</small>` : `<span class="kilit">🔒 ${esc(Sim.binaV(v.kilit).ad)}</span>`}</button>`;
    }).join('');
    document.querySelectorAll('[data-bina]').forEach(b => b.onclick = () => yerlestirmeBasla(b.dataset.bina));
  }
  function yerlestirmeBasla(tip) {
    const v = Sim.binaV(tip);
    if (v.tekil && S.binalar.some(b => b.tip === tip)) return bildirim(`Sadece bir ${esc(v.ad)} yapılabilir.`);
    const durum = { ok: false, neden: '' };
    Dunya.yerlestirmeBasla(v, d => { Object.assign(durum, d); yerlesCubugu(v, durum); });
    yerlesCubugu(v, durum); binaCubugu();
  }
  function yerlesCubugu(v, d) {
    const al = Sim.alinabilir(v.id);
    const el = $('#yerles'); el.hidden = false;
    el.innerHTML = `<p>${IKON[v.id]} <strong>${esc(v.ad)}</strong> · ${esc(v.acik)}<br>${!al ? '<b>Kaynak yetmiyor</b>' : d.ok ? 'Yerine dokun, sonra ✓' : `<b>${esc(d.neden || 'Haritada bir yere dokun')}</b>`}</p>
      <button id="yDon" aria-label="Döndür">↻</button><button id="yIptal" aria-label="İptal">✕</button><button class="kur" id="yKur" ${d.ok && al ? '' : 'disabled'}>✓ Kur</button>`;
    $('#yDon').onclick = () => Dunya.yerlestirDondur();
    $('#yIptal').onclick = yerlestirmeBitir;
    $('#yKur').onclick = () => {
      const y = Dunya.yerlestirme(); if (!y || !y.ok || !Sim.alinabilir(v.id)) return;
      const b = Sim.binaEkle(v.id, y.i, y.j, y.rot);
      Dunya.binaEkle(b, v); Sim.kaydet();
      Dunya.nufusGuncelle(S.nufus, S.binalar, Sim.binaV);
      ciz();
      // aynı binadan bir tane daha koymaya devam (para yetiyorsa)
      if (v.tekil || !Sim.alinabilir(v.id)) yerlestirmeBitir();
      else { y.ok = false; yerlesCubugu(v, { ok: false, neden: 'Bir tane daha koymak için yere dokun' }); }
      binaCubugu();
    };
  }
  function yerlestirmeBitir() { Dunya.yerlestirmeBitir(); $('#yerles').hidden = true; binaCubugu(); }

  /* ---------- bina bilgisi ---------- */
  function binaBilgi(id) {
    if (Dunya.yerlestirme()) return;
    const b = S.binalar.find(x => x.id === id); if (!b) return;
    const v = Sim.binaV(b.tip);
    const uretim = v.uretim ? Object.entries(v.uretim).map(([k, m]) => `${V.KAYNAK[k].ikon} ${(m * b.isci * (v.hasat ? V.HASAT[S.ay] : 1) * (b.cevre || 1)).toFixed(1).replace('.', ',')}/ay`).join(' ') : '';
    sayfa(`<h2>${IKON[b.tip]} ${esc(v.ad)}</h2><p class="alt-baslik">${esc(v.acik)}</p>
      <div class="dokum">
        ${b.insa < 1 ? `<div><span>İnşaat</span><span>%${Math.round(b.insa * 100)}</span></div>` : ''}
        ${v.isci ? `<div><span>Çalışan</span><span>${b.isci} / ${v.isci}</span></div>` : ''}
        ${uretim ? `<div><span>Bu ayki üretim</span><span>${uretim}</span></div>` : ''}
        ${v.zemin === 'orman' || v.zemin === 'kaya' ? `<div><span>${v.zemin === 'orman' ? 'Çevredeki orman' : 'Çevredeki kayalık'}</span><span>%${Math.round((b.cevre || 1) * 100)}</span></div>` : ''}
        ${v.konut ? `<div><span>Barınan</span><span>${v.konut} kişi</span></div>` : ''}
        ${v.hasat ? `<div><span>Hasat</span><span>${mevsimAdi(S.ay)}: ×${V.HASAT[S.ay].toString().replace('.', ',')}</span></div>` : ''}
      </div>
      ${v.isci && b.isci < v.isci ? '<p class="alt-baslik" style="margin-top:8px">Çalışan eksik: nüfus artınca dolar. Önce yiyecek binaları dolar.</p>' : ''}
      <button class="btn tehlike" id="yik">Yık (malzemenin yarısı geri gelir)</button>`, p => {
      p.querySelector('#yik').onclick = () => { Sim.binaYik(b.id); Dunya.binaKaldir(b, v); Dunya.nufusGuncelle(S.nufus, S.binalar, Sim.binaV); Sim.kaydet(); p.remove(); ciz(); binaCubugu(); };
    });
  }
  // alt sayfa: açıkken zaman durur (ferman panelin üstüne binmesin)
  function sayfa(html, bagla) {
    const p = document.createElement('div'); p.className = 'perde';
    p.innerHTML = `<div class="sayfa panel">${html}</div>`;
    modal = true;
    const kaldir = p.remove.bind(p); p.remove = () => { kaldir(); modal = !!document.querySelector('.ferman, .harita, .perde'); };
    p.onclick = e => { if (e.target === p) p.remove(); };
    document.body.appendChild(p); if (bagla) bagla(p);
  }

  /* ---------- tarih: fermanlar ---------- */
  function tarihKontrol() {
    S.okunan = S.okunan || [];
    const simdi = S.yil * 12 + S.ay;
    const e = window.TARIH.find(t => !S.okunan.includes(t.baslik) && t.yil * 12 + t.ay <= simdi);
    if (e) ferman(e);
  }
  function fxUygula(fx) {
    if (!fx) return;
    for (const k of ['yiyecek', 'odun', 'tas', 'akce']) if (fx[k]) S.kaynak[k] = Math.max(0, S.kaynak[k] + fx[k]);
    if (fx.memnun) S.memnun = Math.max(0, Math.min(100, S.memnun + fx.memnun));
    if (fx.nufus) S.nufus = Math.min(Sim.konut() + 4, S.nufus + fx.nufus);
  }
  function ferman(e) {
    modal = true; S.okunan.push(e.baslik); Sim.kaydet();
    if (e.savas && S.kaleler.koyunhisar.sahip !== 'osm') {
      e = Object.assign({}, e, { fx: {}, metin: e.metin + ' Tarih seni bekliyor: haritadan Koyunhisar\'a sefer düzenle. Bizans ordusu ovada.' });
    }
    const el = document.createElement('div'); el.className = 'ferman';
    const kapat = () => { el.remove(); modal = false; Dunya.nufusGuncelle(S.nufus, S.binalar, Sim.binaV); ciz(); binaCubugu(); Sim.kaydet(); if (e.son) bolumSonu(); else tarihKontrol(); };
    const govde = sonuc => `<p class="yil">${V.AYLAR[e.ay].toUpperCase()} ${e.yil}</p><h2>${esc(e.baslik)}</h2><p>${esc(e.metin)}</p><p class="kaynak">Kaynak: ${esc(e.kaynak)}</p>${sonuc || ''}`;
    if (e.secim) {
      el.innerHTML = `<div class="kag">${govde()}<div class="sec">${e.secim.map((s, i) => `<button data-s="${i}">${esc(s.l)}<div class="fx">${Object.entries(s.fx).map(([k, m]) => `<span>${fxYazi({ [k]: m })}</span>`).join('')}</div></button>`).join('')}</div></div>`;
      el.querySelectorAll('[data-s]').forEach(b => b.onclick = () => {
        const s = e.secim[+b.dataset.s]; fxUygula(s.fx);
        el.querySelector('.kag').innerHTML = govde(`<p class="sonuc">${esc(s.c)}</p><button class="btn" id="tm">Devam</button>`);
        el.querySelector('#tm').onclick = kapat;
      });
    } else {
      fxUygula(e.fx);
      el.innerHTML = `<div class="kag">${govde(e.fx && Object.keys(e.fx).length ? `<div class="fx">${Object.entries(e.fx).map(([k, m]) => `<span>${fxYazi({ [k]: m })}</span>`).join('')}</div>` : '')}<button class="btn" id="tm">${e.savas ? 'Zafer! Devam' : 'Devam'}</button></div>`;
      el.querySelector('#tm').onclick = kapat;
    }
    document.body.appendChild(el);
  }
  function bolumSonu() {
    modal = true;
    const el = document.createElement('div'); el.className = 'ferman';
    el.innerHTML = `<div class="kag"><p class="yil">1326</p><h2>Birinci bölümün sonu</h2><p>Söğüt'teki obadan ${S.nufus} kişilik bir beyliğe, ${S.binalar.length} yapıya ulaştın. Bursa artık başkent.</p><p>Sonraki adımlarda: haritada ordu ve fetihler, 3D meydan savaşları, Bursa'nın inşası.</p><button class="btn" id="tm">Söğüt'te devam et</button></div>`;
    document.body.appendChild(el);
    el.querySelector('#tm').onclick = () => { el.remove(); modal = false; };
  }

  /* ---------- geri bildirim ---------- */
  function bildirim(html) {
    const el = document.createElement('div'); el.className = 'bildirim panel'; el.innerHTML = html;
    document.body.appendChild(el); setTimeout(() => el.remove(), 3000);
  }
  function ipucu(metin) {
    const el = document.createElement('div'); el.className = 'ipucu panel'; el.textContent = metin;
    document.body.appendChild(el); setTimeout(() => el.remove(), 7000);
    el.onclick = () => el.remove();
  }
  // üreten binaların üstünde "+3 🌾"
  function uretimGoster() {
    const T = window.THREE;
    let n = 0;
    for (const b of S.binalar) {
      if (n >= 6 || !b.son) continue;
      const [k, m] = Object.entries(b.son).sort((x, y) => y[1] - x[1])[0] || [];
      if (!k || m < 0.5) continue;
      const [i, j] = [b.x, b.z], v = Sim.binaV(b.tip), [x, z] = Dunya.dunyadan(i + (v.boy - 1) / 2, j + (v.boy - 1) / 2);
      const p = Dunya.ekranKonum(new T.Vector3(x, 3, z)); if (!p.gorunur) continue;
      const el = document.createElement('div'); el.className = 'ucan'; el.style.left = p.x + 'px'; el.style.top = p.y + 'px';
      el.textContent = '+' + Math.round(m) + ' ' + V.KAYNAK[k].ikon; document.body.appendChild(el); setTimeout(() => el.remove(), 1700); n++;
    }
  }

  acilis();
})();
