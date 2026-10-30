/* Cumhuriyet: Sıfırdan — arayüz: açılış, üst çubuk, alt araç çubuğu, araçlar, akış, görevler, bütçe. */
'use strict';
(function () {
  const V = window.VERI, D = window.Dunya, Sim = window.Sim;
  const $ = s => document.querySelector(s), el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const para = v => { const a = Math.abs(v), s = v < 0 ? '−' : ''; return a >= 1000 ? s + '₺' + (a / 1000).toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' mlr' : s + '₺' + a.toLocaleString('tr-TR', { maximumFractionDigits: a < 10 ? 2 : 1 }) + ' mn'; };
  const sayi = v => Math.round(v).toLocaleString('tr-TR');

  D.kur($('#sahne'));
  const kontrol = D.kontrol();
  let sinema = null, arac = null, oncekiHiz = 1;

  /* ---------- açılış sahnesi ---------- */
  const KARTLAR = [
    ['23 Nisan 1920', 'Ankara\'da Büyük Millet Meclisi açıldı. Küçük bir Anadolu kasabası, Kurtuluş Savaşı\'nın merkezi oldu.'],
    ['13 Ekim 1923', 'Ankara yeni devletin başkenti ilan edildi. Kasabada 25 bin kişi yaşıyor; su yok, elektrik yok, bataklıklarda sıtma var.'],
    ['29 Ekim 1923', 'Cumhuriyet ilan edildi. Başkenti sıfırdan kurmak sana düşüyor.']
  ];
  function sinemaBasla(bitti) {
    const u = V.SEMT[0], y = D.yukseklik(u.x, u.z), k = D.kamera();
    const bas = { p: new THREE.Vector3(u.x - 260, y + 420, u.z + 380), t: new THREE.Vector3(u.x, y, u.z) }, son = { p: new THREE.Vector3(u.x + 18, y + 55, u.z + 70), t: new THREE.Vector3(u.x, y, u.z - 4) };
    sinema = { t: 0, sure: 15, bas, son, bitti };
    k.position.copy(bas.p); kontrol.target.copy(bas.t);
    const kap = $('#acilis'), kart = $('#acilis .kart'); kap.classList.add('acik');
    let i = 0;
    const goster = () => { if (i >= KARTLAR.length) return; kart.classList.remove('gor'); setTimeout(() => { kart.innerHTML = '<b>' + KARTLAR[i][0] + '</b><p>' + KARTLAR[i][1] + '</p>'; kart.classList.add('gor'); i++; }, 350); };
    goster(); sinema.zam = setInterval(goster, 4800);
    $('#acilis .gec').onclick = () => { sinema.t = sinema.sure; };
  }
  function sinemaKare(dt) {
    sinema.t += dt; const a = Math.min(1, sinema.t / sinema.sure), e = a < 0.5 ? 2 * a * a : 1 - Math.pow(-2 * a + 2, 2) / 2;
    D.kamera().position.lerpVectors(sinema.bas.p, sinema.son.p, e); kontrol.target.lerpVectors(sinema.bas.t, sinema.son.t, e);
    if (a >= 1) { clearInterval(sinema.zam); $('#acilis').classList.remove('acik'); const f = sinema.bitti; sinema = null; f(); }
  }
  function girisEkrani() {
    const g = $('#giris'); g.classList.add('acik');
    $('#devam').style.display = Sim.kayitVar() ? '' : 'none';
    g.querySelectorAll('[data-zor]').forEach(b => b.onclick = () => {
      g.classList.remove('acik'); Sim.sil(); Sim.yeni(b.dataset.zor); Sim.S.hiz = 0; arayuzKur();
      sinemaBasla(() => { Sim.S.hiz = 1; hizGoster(); gorevGoster(); haberGoster(V.OLAY[0]); });
    });
    $('#devam').onclick = () => {
      g.classList.remove('acik');
      if (!Sim.yukle()) { toast('Kayıt açılamadı, yeni oyun başlıyor.'); Sim.yeni('normal'); }
      arayuzKur(); const u = V.SEMT[0]; D.odakla(u.x, u.z, 90); Sim.S.hiz = 1; hizGoster(); gorevGoster();
    };
  }

  /* ---------- üst çubuk ---------- */
  let sonAy = -1;
  function ustGuncelle() {
    const S = Sim.S, t = Sim.tarih(), ist = S.istat || Sim.istat(), a = V.ASAMA[S.asama], s = V.ASAMA[S.asama + 1];
    $('#para').textContent = para(S.para); $('#para').classList.toggle('eksi', S.para < 0);
    $('#nufus').textContent = sayi(25000 + ist.yeniNufus);
    $('#asama').textContent = a.ad + (s ? ' · ' + sayi(ist.yeniNufus) + '/' + sayi(s.nufus) : '');
    $('#tarih').textContent = t.metin;
    if (t.ay !== sonAy) { sonAy = t.ay; D.mevsim(t.ay); }
    const tl = Sim.talep();
    ['R', 'C', 'I'].forEach(k => { const v = tl[k], b = $('#t' + k); b.style.height = Math.abs(v) * 100 + '%'; b.classList.toggle('neg', v < 0); });
  }
  function hizGoster() { document.querySelectorAll('#hiz button').forEach(b => b.classList.toggle('sec', +b.dataset.h === Sim.S.hiz)); }
  function hizAyarla(h) { if (h === 0 && Sim.S.hiz) oncekiHiz = Sim.S.hiz; Sim.S.hiz = h; hizGoster(); }

  /* ---------- toast, haber, görev, sorun ---------- */
  function toast(m, sure = 2600, dugme) {
    const t = el('div', 'toast', m); if (dugme) { const b = el('button', null, dugme[0]); b.onclick = () => { dugme[1](); t.remove(); }; t.appendChild(b); }
    const tl = $('#toastlar'); tl.appendChild(t); while (tl.children.length > 3) tl.firstChild.remove(); setTimeout(() => t.classList.add('git'), sure); setTimeout(() => t.remove(), sure + 500);
  }
  function haberGoster(o) {
    const k = Sim.kaynak(+o.t.slice(0, 4)), h = $('#haber');
    h.className = 'acik ' + (k.ad === 'Sosyal medya' ? 'sosyal' : 'gazete');
    h.querySelector('.kaynak').textContent = k.ad + ' · ' + new Date(o.t + 'T00:00:00Z').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    h.querySelector('h2').textContent = o.baslik; h.querySelector('p').textContent = o.metin;
    hizAyarla(0);
    h.querySelector('button').onclick = () => { h.className = ''; hizAyarla(oncekiHiz || 1); };
  }
  function gorevGoster() {
    const g = V.GOREV[Sim.S.gorevNo], k = $('#gorev');
    if (!g) { k.style.display = 'none'; return; }
    k.style.display = ''; k.querySelector('.metin').textContent = g.metin; k.querySelector('.ipucu').textContent = g.ipucu;
  }
  function sorunGoster(liste) {
    const s = $('#sorun'); s.innerHTML = '';
    liste.forEach(x => { const d = el('div', 'sorun', x.metin); if (x.katman) { const b = el('button', null, 'Göster'); b.onclick = () => katmanAc(x.katman); d.appendChild(b); } s.appendChild(d); });
  }
  let katmanZam = null;
  function katmanAc(k, sure) {
    Sim.katmanSec(k); document.querySelectorAll('#katmanlar button').forEach(b => b.classList.toggle('sec', b.dataset.k === k));
    clearTimeout(katmanZam); if (sure) katmanZam = setTimeout(() => { if (Sim.katman() === k && !arac) katmanAc(null); }, sure);
  }

  /* ---------- olay dinleyici ---------- */
  let imarKirli = true;
  Sim.on(e => {
    if (e.tur === 'imar' || e.tur === 'yol' || e.tur === 'yik' || e.tur === 'yapi') imarKirli = true;
    if (e.tur === 'olay' && e.o !== V.OLAY[0]) haberGoster(e.o);
    if (e.tur === 'akis') akisToast(e.m);
    if (e.tur === 'gorev') { toast('✅ Görev tamamlandı: ' + e.g.metin + ' <b>+₺8 mn</b>', 4000); gorevGoster(); }
    if (e.tur === 'asama') toast('🎉 Ankara artık bir <b>' + e.a.ad + '</b>!', 6000);
    if (e.tur === 'acilis') toast('🔓 Yeni: ' + e.liste.join(', '), 5000);
    if (e.tur === 'sorun') { sorunGoster(e.liste); const y = e.yeni.find(s => s.katman); if (y && !arac) katmanAc(y.katman, 7000); }
    if (e.tur === 'ay' && $('#panel').dataset.tur === 'butce') butcePanel();
  });
  function akisToast(m) {
    const p = $('#akisMini'), d = el('div', 'mini ' + m.tur, '<i>' + (m.kim || m.kaynak) + (m.semt ? ' · ' + m.semt : '') + '</i>' + m.metin);
    p.prepend(d); while (p.children.length > 2) p.lastChild.remove();
    setTimeout(() => d.classList.add('git'), 7000); setTimeout(() => d.remove(), 7600);
    if ($('#panel').dataset.tur === 'akis') akisPanel();
  }

  /* ---------- paneller ---------- */
  function panelAc(tur, baslik, icerik) {
    const p = $('#panel'); p.dataset.tur = tur; p.classList.add('acik');
    p.querySelector('h3').textContent = baslik; const g = p.querySelector('.govde'); g.innerHTML = ''; g.appendChild(icerik);
  }
  function panelKapat() { const p = $('#panel'); p.classList.remove('acik'); p.dataset.tur = ''; }
  $('#panel .kapat').onclick = panelKapat;
  function akisPanel() {
    const S = Sim.S, d = el('div', 'akis');
    if (!S.akis.length) d.appendChild(el('p', 'bos', 'Henüz ses yok. Şehir büyüdükçe halk konuşmaya başlar.'));
    S.akis.forEach(m => {
      const sos = m.kaynak === 'Sosyal medya', k = el('div', 'msj ' + m.tur + (sos ? ' sos' : ' gaz'));
      k.innerHTML = '<div class="ust"><b>' + (m.kim || m.kaynak) + '</b>' + (m.semt ? '<span>' + m.semt + '</span>' : '') + '<em>' + m.t + (m.kim ? ' · ' + m.kaynak : '') + '</em></div><p>' + m.metin + '</p>';
      d.appendChild(k);
    });
    panelAc('akis', '📰 Halkın sesi', d);
  }
  function butcePanel() {
    const S = Sim.S, b = Sim.butce(), d = el('div', 'butce');
    const satir = (a, v, c) => '<div class="s ' + (c || '') + '"><span>' + a + '</span><b>' + para(v) + '</b></div>';
    d.innerHTML = '<p class="not">Aylık. Para bugünkü lira ile.</p><h4>Gelir</h4>' + satir('Konut vergisi', b.gelir.R) + satir('Ticaret vergisi', b.gelir.C) + satir('Sanayi vergisi', b.gelir.I) + satir('Eski kasaba', b.gelir.eski) + satir('Başkent ödeneği', b.gelir.odenek) +
      '<h4>Gider</h4>' + satir('Hizmet bakımı', -b.gider.hizmet) + satir('Yol bakımı', -b.gider.yol) + satir('Kredi taksitleri', -b.gider.kredi) + satir('Aylık net', b.net, b.net < 0 ? 'eksi top' : 'top') +
      '<h4>Vergi oranları</h4>';
    ['R', 'C', 'I'].forEach(k => {
      const r = el('div', 'vergi', '<span>' + V.IMAR[k].ikon + ' ' + V.IMAR[k].ad + '</span><button>−</button><b>%' + S.vergi[k] + '</b><button>+</button>');
      const [eks, art] = r.querySelectorAll('button');
      eks.onclick = () => { S.vergi[k] = Math.max(1, S.vergi[k] - 1); butcePanel(); }; art.onclick = () => { S.vergi[k] = Math.min(25, S.vergi[k] + 1); butcePanel(); };
      d.appendChild(r);
    });
    d.appendChild(el('p', 'not', 'Vergi %9\'un üstüne çıkınca o türün talebi düşer ve halk şikâyet eder.'));
    d.appendChild(el('div', 's', '<span>😊 Memnuniyet</span><b>%' + Math.round(S.memnun) + '</b>'));
    if (S.borc.length) { d.appendChild(el('h4', null, 'Krediler')); S.borc.forEach(k => d.appendChild(el('div', 's', '<span>' + k.ad + ' (' + k.kalan + ' ay)</span><b>' + para(-k.taksit) + '</b>'))); }
    panelAc('butce', '💰 Bütçe', d);
  }
  const HIZMET_AD = { okul: '🏫 İlkokul', lise: '🎓 Lise', saglik: '🩺 Sağlık', hastane: '🏥 Hastane', park: '🌳 Park', cami: '🕌 Cami', karakol: '👮 Karakol' };
  const TIP_AD = { R: 'Konut', Rk: 'Yoğun konut', C: 'Ticaret', I: 'Sanayi' };
  const SEVIYE_AD = { R: ['', 'Kerpiç ev', 'Kâgir ev', 'Apartman', 'Büyük apartman', 'Yüksek apartman', 'Rezidans'], Rk: ['', '', '', 'Blok', 'Toplu konut', 'Site', 'Gökdelen site'], C: ['', 'Dükkân', 'Çarşı', 'İşhanı', 'Ofis', 'İş merkezi', 'Plaza'], I: ['', 'Atölye', 'Küçük fabrika', 'Fabrika', 'Büyük fabrika', 'Teknoloji', 'Ar-Ge'] };
  function binaPanel(b) {
    const d = el('div', 'bilgi');
    if (b.tip === 'H') {
      const def = Sim.yapiTanim(b.hiz);
      d.innerHTML = '<p class="sem">' + b.semt + '</p><p>' + (def.bilgi || def.gercek || '') + '</p>' + (b.kur < 1 ? '<p class="uyari">🚧 İnşaat sürüyor: %' + Math.round(b.kur * 100) + '</p>' : '') + (!b.bag ? '<p class="uyari">Yola bağlı değil!</p>' : '') +
        (def.menzil ? '<p>Yol üzerinden yaklaşık ' + (def.menzil * 10 / 1000).toLocaleString('tr-TR') + ' km çevresine hizmet verir.</p>' : '') + (def.su ? '<p>Kapasite: ' + sayi(def.su) + ' kişi su</p>' : '') + (def.elektrik ? '<p>Kapasite: ' + sayi(def.elektrik) + ' kişi elektrik</p>' : '') +
        '<p>Bakım: ' + para(def.bakim || 0) + '/ay</p>';
      panelAc('bilgi', (def.ikon || '') + ' ' + def.ad, d);
      if (def.menzil) katmanAc('k:' + b.hiz);
      return;
    }
    const bi = Sim.bilgi(b), sakin = b.sakin ? sayi(b.sakin) + ' kişi oturuyor' : b.is ? sayi(b.is) + ' kişi çalışıyor' : '';
    const ad = (SEVIYE_AD[b.tip] || [])[b.seviye] || '';
    let ht = '<p class="sem">' + b.semt + ' · ' + TIP_AD[b.tip] + ' · Seviye ' + b.seviye + '</p><p><b>' + ad + '</b>' + (sakin ? ' — ' + sakin : '') + '</p>';
    if (b.kur < 1) ht += '<p class="uyari">🚧 İskele kurulu: %' + Math.round(b.kur * 100) + '</p>';
    if (b.terk) ht += '<p class="uyari">🏚️ Terk edildi: su ve elektrik bekliyor.</p>';
    ht += '<div class="rozet"><span class="' + (b.su ? 'var' : 'yok') + '">💧 Su</span><span class="' + (b.elk ? 'var' : 'yok') + '">⚡ Elektrik</span>';
    for (const k in HIZMET_AD) ht += '<span class="' + (bi.k[k] ? 'var' : 'yok') + '">' + HIZMET_AD[k] + '</span>';
    ht += '</div>';
    if (b.sitma) ht += '<p class="uyari">🦟 Dere kenarında sıtma riski. Yakına sağlık ocağı lazım.</p>';
    if ((b.hava || 0) > 1.5) ht += '<p class="uyari">🌫️ Hava kirli.</p>';
    if (b.seviye >= bi.tavan && bi.tavan < 6) ht += '<p class="not">Bu dönemde en fazla seviye ' + bi.tavan + ' yapılabiliyor.</p>';
    else if (bi.hedef <= b.seviye && b.seviye < 6) ht += '<p class="not">Büyümek için: ' + ihtiyac(b) + '</p>';
    d.innerHTML = ht; panelAc('bilgi', V.IMAR[b.tip].ikon + ' ' + ad, d);
  }
  function ihtiyac(b) {
    const k = Sim.bilgi(b).k, s = b.seviye;
    if (b.tip === 'R' || b.tip === 'Rk') return s === 1 ? 'su ve elektrik' : s === 2 ? 'okul ve sağlık ocağı' : s === 3 ? 'lise, karakol ve park ya da cami' : s === 4 ? 'hastane ve temiz hava' : 'park ve yüksek memnuniyet';
    if (b.tip === 'C') return s === 1 ? 'su ve elektrik' : s === 2 ? 'karakol ve eğitimli nüfus (lise)' : 'daha fazla eğitimli nüfus';
    return s === 1 ? 'elektrik' : 'su ve eğitimli nüfus';
  }

  /* ---------- alt araç çubuğu ---------- */
  const GRUP = {
    yol: { ad: 'Yol', ikon: '🛣️', ogeler: () => Object.entries(V.YOL).map(([k, t]) => ({ k, ad: t.ad, ikon: '🛣️', fiyat: para(t.maliyet * 10) + '/100 m', yil: t.yil, bilgi: t.bilgi, renk: t.renk })) },
    imar: { ad: 'İmar', ikon: '🏘️', ogeler: () => [...Object.entries(V.IMAR).map(([k, t]) => ({ k, ad: t.ad, ikon: t.ikon, yil: t.yil, renk: t.renk, bilgi: 'Yolun kenarına parmağını gezdir. Binaları halk yapar.' })), { k: 'sil', ad: 'İmarı kaldır', ikon: '🧽', bilgi: 'Boya ile imarı kaldırır (binayı da yıkar).' }] },
    hizmet: { ad: 'Hizmet', ikon: '🏫', ogeler: () => ['okul', 'lise', 'saglik', 'hastane', 'park', 'cami', 'karakol'].map(k => hizmetOge(k)) },
    altyapi: { ad: 'Altyapı', ikon: '💧', ogeler: () => ['su', 'baraj', 'dizel', 'termik'].map(k => hizmetOge(k)) },
    ozel: { ad: 'Özel', ikon: '🏛️', ogeler: () => Object.keys(V.OZEL).map(k => hizmetOge(k)) },
    yik: { ad: 'Yık', ikon: '🧹', tek: true },
    katman: { ad: 'Harita', ikon: '🗺️', ogeler: () => [['su', '💧 Su'], ['elk', '⚡ Elektrik'], ['hava', '🌫️ Hava'], ['k:okul', '🏫 Okul'], ['k:saglik', '🩺 Sağlık'], ['k:karakol', '👮 Güvenlik'], [null, '✖ Kapat']].map(([k, ad]) => ({ k, ad, katman: true })) },
    butce: { ad: 'Bütçe', ikon: '💰', panel: butcePanel },
    akis: { ad: 'Halk', ikon: '📰', panel: akisPanel }
  };
  function hizmetOge(k) { const d = Sim.yapiTanim(k); return { k, ad: d.ad, ikon: d.ikon, fiyat: para(d.maliyet), yil: d.yil, bilgi: d.bilgi || d.gercek, yapi: true }; }
  let acikGrup = null, imarFirca = 2.4;
  function arayuzKur() {
    const alt = $('#alt'); alt.innerHTML = '';
    Object.entries(GRUP).forEach(([k, g]) => {
      const b = el('button', null, '<span>' + g.ikon + '</span><small>' + g.ad + '</small>'); b.dataset.g = k;
      b.onclick = () => grupAc(k); alt.appendChild(b);
    });
    ustGuncelle(); sorunGoster(Sim.S.sorun || []);
  }
  function grupAc(k) {
    const g = GRUP[k], m = $('#altmenu');
    if (g.panel) { aracBirak(); m.classList.remove('acik'); acikGrup = null; isaretle(); return g.panel(); }
    if (g.tek) { if (arac && arac.tur === 'yik') { aracBirak(); return; } m.classList.remove('acik'); acikGrup = k; aracSec({ tur: 'yik' }); isaretle(); toast('🧹 Yıkmak istediğin binaya ya da yola dokun. Geri alınamaz; yarısı iade edilir.'); return; }
    if (acikGrup === k && m.classList.contains('acik')) { m.classList.remove('acik'); acikGrup = null; aracBirak(); isaretle(); return; }
    acikGrup = k; isaretle(); m.innerHTML = ''; m.classList.add('acik');
    const yil = Sim.yil();
    g.ogeler().forEach(o => {
      const kilit = o.yil && yil < o.yil, b = el('button', 'oge' + (kilit ? ' kilit' : ''), '<span class="ik">' + o.ikon + '</span><b>' + o.ad + '</b>' + (kilit ? '<small>🔒 ' + o.yil + '</small>' : o.fiyat ? '<small>' + o.fiyat + '</small>' : ''));
      if (o.renk) b.style.borderBottomColor = o.renk;
      b.onclick = () => {
        if (kilit) return toast('🔒 ' + o.ad + ' ' + o.yil + ' yılında açılır. ' + (o.bilgi || ''), 3500);
        m.querySelectorAll('.oge').forEach(x => x.classList.remove('sec')); b.classList.add('sec');
        if (o.katman) { aracBirak(); katmanAc(o.k); return; }
        if (k === 'yol') aracSec({ tur: 'yol', yol: o.k });
        else if (k === 'imar') aracSec({ tur: 'imar', imar: o.k === 'sil' ? null : o.k });
        else aracSec({ tur: 'yapi', yapi: o.k });
        ipucu(o.ad + (o.bilgi ? ' — ' + o.bilgi : ''));
      };
      m.appendChild(b);
    });
    if (k === 'imar') { const f = el('button', 'oge firca', '<span class="ik">🖌️</span><b>Fırça</b><small>' + (imarFirca > 3 ? 'Geniş' : 'Dar') + '</small>'); f.onclick = () => { imarFirca = imarFirca > 3 ? 2.4 : 4.8; f.querySelector('small').textContent = imarFirca > 3 ? 'Geniş' : 'Dar'; }; m.appendChild(f); }
  }
  function isaretle() { document.querySelectorAll('#alt button').forEach(b => b.classList.toggle('sec', b.dataset.g === acikGrup)); }
  function ipucu(m) { const i = $('#ipucu'); if (!m) { i.classList.remove('acik'); return; } i.innerHTML = m; i.classList.add('acik'); }
  function aracSec(a) {
    arac = a; yolA = null; D.yolOnizle(null); D.aracModu(true);
    kontrol.touches.TWO = THREE.TOUCH.DOLLY_PAN; kontrol.mouseButtons.RIGHT = THREE.MOUSE.PAN;
    $('#bitir').classList.toggle('acik', true);
    if (a.tur === 'imar') imarKirli = true;
    if (a.tur === 'yapi') { const d = Sim.yapiTanim(a.yapi); katmanAc(d.menzil ? 'k:' + a.yapi : d.su ? 'su' : d.elektrik ? 'elk' : null); }
    if (a.tur === 'yol') ipucu('Başlangıca dokun, sonra bitişe dokun ya da parmağınla çiz. Kamera için iki parmak.');
  }
  function aracBirak() {
    arac = null; yolA = null; D.yolOnizle(null); D.aracModu(false);
    kontrol.touches.TWO = THREE.TOUCH.DOLLY_ROTATE; kontrol.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
    $('#bitir').classList.remove('acik'); ipucu(null); imarKirli = true;
    document.querySelectorAll('#altmenu .oge').forEach(x => x.classList.remove('sec'));
    if (Sim.katman() && Sim.katman().startsWith('k:')) katmanAc(null);
  }
  $('#bitir').onclick = () => { if (arac && arac.tur === 'yol' && yolA) { yolA = null; D.yolOnizle(null); return; } aracBirak(); $('#altmenu').classList.remove('acik'); acikGrup = null; isaretle(); };

  /* ---------- dokunma ---------- */
  const cv = D.canvas(), parmak = new Map();
  let bas = null, yolA = null, surukle = false;
  function yolHedef(p) { const s = Sim.yakala(p.x, p.z); return s; }
  function yolOnizle(b) {
    if (!yolA || !b) { D.yolOnizle(null); return; }
    const h = yolHedef(b), d = Sim.yolDene(yolA, h, arac.yol);
    D.yolOnizle(yolA, h, arac.yol, d.gecerli);
    ipucu(d.gecerli ? '🛣️ ' + Math.round(d.uz * 10) + ' m · ' + para(d.maliyet) + (d.kopru ? ' · köprü' : '') : '⛔ ' + d.neden);
  }
  cv.addEventListener('pointerdown', e => {
    parmak.set(e.pointerId, e);
    if (parmak.size > 1) { bas = null; surukle = false; return; }
    bas = { x: e.clientX, y: e.clientY, t: performance.now() }; surukle = false;
    if (!arac) return;
    const p = D.zemin(e.clientX, e.clientY); if (!p) return;
    if (arac.tur === 'imar') { surukle = true; boya(p); }
    if (arac.tur === 'yol') { bas.a = yolA || Sim.yakala(p.x, p.z); }
  });
  cv.addEventListener('pointermove', e => {
    if (parmak.has(e.pointerId)) parmak.set(e.pointerId, e);
    if (!arac || parmak.size > 1) return;
    const p = D.zemin(e.clientX, e.clientY); if (!p) return;
    if (arac.tur === 'imar' && surukle && bas) boya(p);
    if (arac.tur === 'yol') {
      if (bas && bas.a && Math.hypot(e.clientX - bas.x, e.clientY - bas.y) > 10) { if (!yolA) yolA = bas.a; surukle = true; }
      if (yolA) yolOnizle(p);
    }
  });
  const birak = e => {
    const tek = parmak.size === 1; parmak.delete(e.pointerId);
    if (!bas || !tek) { bas = null; return; }
    const kisa = Math.hypot(e.clientX - bas.x, e.clientY - bas.y) < 10 && performance.now() - bas.t < 600;
    const p = D.zemin(e.clientX, e.clientY), b0 = bas; bas = null;
    if (!p) return;
    if (!arac) { if (kisa) dokun(p); return; }
    if (arac.tur === 'imar') { surukle = false; return; }
    if (arac.tur === 'yol') {
      if (kisa && !yolA) { yolA = b0.a; ipucu('Şimdi bitiş noktasına dokun.'); return; }
      if (!yolA) return;
      const h = yolHedef(p); if (Math.hypot(h.x - yolA.x, h.z - yolA.z) < 1) return;
      const r = Sim.yolYap(yolA, h, arac.yol);
      if (r.gecerli) { yolA = { x: r.son.x, z: r.son.z, dugum: r.son.id }; D.yolOnizle(null); ipucu('Yol yapıldı. Devam etmek için yeni noktaya dokun ya da ✋ Bitir.'); ustGuncelle(); }
      else toast('⛔ ' + r.neden);
      return;
    }
    if (!kisa) return;
    if (arac.tur === 'yapi') {
      const r = Sim.yapiYap(arac.yapi, p.x, p.z);
      if (r.gecerli) { toast('🚧 ' + Sim.yapiTanim(arac.yapi).ad + ' inşaatı başladı.' + (r.kredi ? ' (krediyle)' : '')); ustGuncelle(); }
      else toast('⛔ ' + r.neden);
    }
    if (arac.tur === 'yik') {
      const s = Sim.sec(p.x, p.z); if (!s) return toast('Burada yıkılacak bir şey yok.');
      const ad = s.tur === 'yol' ? V.YOL[s.p.tur].ad : s.b.tip === 'H' ? Sim.yapiTanim(s.b.hiz).ad : TIP_AD[s.b.tip], iade = Sim.yikIade(s);
      toast('🧹 ' + ad + ' yıkılsın mı?' + (iade ? ' İade: ' + para(iade) : ''), 4000, ['Yık', () => { Sim.yik(s); ustGuncelle(); }]);
    }
  };
  cv.addEventListener('pointerup', birak); cv.addEventListener('pointercancel', e => { parmak.delete(e.pointerId); bas = null; });
  cv.addEventListener('pointerleave', () => { if (arac && arac.tur === 'yol' && !bas) D.yolOnizle(null); });
  let sonBoya = 0;
  function boya(p) { const t = performance.now(); if (t - sonBoya < 40) return; sonBoya = t; if (Sim.imarBoya(p.x, p.z, imarFirca, arac.imar)) imarKirli = true; }
  function dokun(p) { const s = Sim.sec(p.x, p.z); if (s && s.tur === 'bina') binaPanel(s.b); else if (s && s.tur === 'yol') toast(V.YOL[s.p.tur].ad + ' · ' + Math.round(s.p.uz * 10) + ' m'); }

  /* ---------- klavye ve hız ---------- */
  document.querySelectorAll('#hiz button').forEach(b => b.onclick = () => hizAyarla(+b.dataset.h));
  addEventListener('keydown', e => {
    if (!Sim.S) return;
    if (e.key === ' ') { hizAyarla(Sim.S.hiz ? 0 : oncekiHiz || 1); e.preventDefault(); }
    if (e.key === '1' || e.key === '2' || e.key === '3') hizAyarla([1, 2, 4][+e.key - 1]);
    if (e.key === 'Escape') { if (yolA) { yolA = null; D.yolOnizle(null); } else { aracBirak(); $('#altmenu').classList.remove('acik'); acikGrup = null; isaretle(); panelKapat(); } }
  });
  $('#gorev').onclick = () => $('#gorev').classList.toggle('ac');
  document.addEventListener('visibilitychange', () => { if (document.hidden && Sim.S) Sim.kaydet(); });

  /* ---------- döngü ---------- */
  let ustZam = 0, imarZam = 0;
  D.basla(dt => {
    if (sinema) sinemaKare(dt);
    if (!Sim.S) return;
    Sim.ilerle(dt);
    ustZam += dt; imarZam += dt;
    if (ustZam > 0.25) { ustZam = 0; ustGuncelle(); }
    if (imarKirli || imarZam > 1.5) { if (imarKirli || imarZam > 1.5) D.imarCiz(Sim.S.hucre, !!(arac && arac.tur === 'imar')); imarKirli = false; imarZam = 0; }
  });
  window.__oyun = { Sim, D, toast, grupAc, aracSec, aracBirak, butcePanel, akisPanel };
  girisEkrani();
})();
