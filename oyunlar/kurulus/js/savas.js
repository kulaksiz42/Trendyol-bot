/* Kuruluş 1299 — 3D meydan savaşı. Birlikler (alay) saf düzeninde yürür, çarpışır, moral kaybeder, bozulur.
   Kendi sahnesi ve tuvali vardır; şehir çizimi savaş sürerken durur. */
'use strict';
(function () {
  const T = window.THREE;
  // birlik türleri: hız (m/sn), adam başı saniyelik hasar, savunma, menzil (okçu), renk
  const TUR = {
    yaya:      { ad: 'Yaya', ikon: '🗡️', hiz: 2.4, vur: 0.055, sav: 4, menzil: 0, renk: 0x8b1a2b, bas: 0xf2ece0, mizrak: true },
    okcu:      { ad: 'Okçu', ikon: '🏹', hiz: 2.6, vur: 0.03, sav: 2, menzil: 26, ok: 0.03, renk: 0x6b2a1a, bas: 0xf2ece0 },
    akinci:    { ad: 'Akıncı', ikon: '🐎', hiz: 6.5, vur: 0.085, hucum: 2.2, sav: 3, menzil: 0, renk: 0xa3222f, bas: 0xf2ece0, atli: true },
    skutatos:  { ad: 'Skutatos (kalkanlı piyade)', ikon: '🛡️', hiz: 2.1, vur: 0.05, sav: 5, menzil: 0, renk: 0x4a3a8a, bas: 0x9a9aa8, mizrak: true },
    toksotes:  { ad: 'Toksotes (okçu)', ikon: '🏹', hiz: 2.4, vur: 0.025, sav: 2, menzil: 24, ok: 0.026, renk: 0x5a4a9a, bas: 0x9a9aa8 },
    katafrakt: { ad: 'Katafrakt (ağır süvari)', ikon: '🐴', hiz: 4.8, vur: 0.1, hucum: 1.8, sav: 6, menzil: 0, renk: 0x3a3a5a, bas: 0xb8b8c8, atli: true },
    alan:      { ad: 'Alan paralı askerleri', ikon: '🐴', hiz: 5.5, vur: 0.07, sav: 3, menzil: 0, renk: 0x6a5a3a, bas: 0x8a7a5a, atli: true, bekler: true },
    sirp_piyade:  { ad: 'Sırp piyadesi', ikon: '🛡️', hiz: 2.2, vur: 0.05, sav: 4, menzil: 0, renk: 0x7a2a2a, bas: 0xa8a8b0, mizrak: true },
    sirp_okcu:    { ad: 'Sırp okçuları', ikon: '🏹', hiz: 2.4, vur: 0.025, sav: 2, menzil: 24, ok: 0.026, renk: 0x6a3a2a, bas: 0xa8a8b0 },
    sirp_sovalye: { ad: 'Sırp ağır süvarisi', ikon: '🐴', hiz: 4.6, vur: 0.11, hucum: 2.0, sav: 6, menzil: 0, renk: 0x5a1a1a, bas: 0xc8c8d0, atli: true },
    hacli_piyade: { ad: 'Haçlı piyadesi', ikon: '🛡️', hiz: 2.1, vur: 0.055, sav: 5, menzil: 0, renk: 0x2a3a6a, bas: 0xc0c0c8, mizrak: true },
    arbaletci:    { ad: 'Arbaletçiler', ikon: '🏹', hiz: 2.2, vur: 0.025, sav: 3, menzil: 22, ok: 0.034, renk: 0x3a4a7a, bas: 0xc0c0c8 },
    sovalye:      { ad: 'Haçlı şövalyeleri', ikon: '🐴', hiz: 4.2, vur: 0.13, hucum: 2.4, sav: 7, menzil: 0, renk: 0xe8e8f0, bas: 0xd0d0d8, atli: true }
  };
  // düşman birliklerinin dizilişi (x, z)
  const DUZEN = { skutatos: [0, -18], toksotes: [0, -29], katafrakt: [20, -20], alan: [-26, -34], sirp_piyade: [0, -18], sirp_okcu: [0, -29], sirp_sovalye: [-20, -22], hacli_piyade: [0, -16], arbaletci: [0, -27], sovalye: [0, -38] };
  let el, renderer, sahne, kamera, kontrol, saat, alaylar = [], secili = null, bitti = false, hiz = 1, sure = 0, cb, bilgi, oklar = [], okMesh;
  const _m = new T.Matrix4(), _q = new T.Quaternion(), _v = new T.Vector3(), _s = new T.Vector3(1, 1, 1);

  function baslat(o, bitince) {
    cb = bitince; bilgi = o; bitti = false; hiz = 1; sure = 0; alaylar = []; oklar = []; secili = null;
    el = document.createElement('div'); el.className = 'savas';
    el.innerHTML = `<div class="sv-ust"><div><b>${o.ad}</b><small>${o.alt || ''}</small></div><div class="sv-guc"><span id="svBiz"></span><div class="bar"><i id="svOran"></i></div><span id="svOnlar"></span></div></div>
      <div class="sv-sahne" id="svSahne"></div>
      <div class="sv-alt"><div class="sv-alaylar" id="svAlaylar"></div><div class="sv-emir" id="svEmir"></div>
        <div class="sv-kucuk"><button id="svHiz">1×</button><button id="svOto">Otomatik çöz</button></div></div>`;
    document.body.appendChild(el);
    kur(el.querySelector('#svSahne'));
    // bizim ordu: ortada yaya, arkada okçu, kanatlarda akıncı
    const b = o.ordu;
    if (b.yaya) alayEkle(0, 'yaya', b.yaya, 0, 20, 'Merkez yaya');
    if (b.okcu) alayEkle(0, 'okcu', b.okcu, 0, 31, 'Okçular');
    if (b.akinci >= 4) { alayEkle(0, 'akinci', Math.ceil(b.akinci / 2), -22, 22, 'Sol kanat akıncı'); alayEkle(0, 'akinci', Math.floor(b.akinci / 2), 22, 22, 'Sağ kanat akıncı'); }
    else if (b.akinci) alayEkle(0, 'akinci', b.akinci, -20, 22, 'Akıncılar');
    // Bizans
    for (const [tur, n] of Object.entries(o.dusman)) if (n > 0 && TUR[tur]) alayEkle(1, tur, n, DUZEN[tur][0], DUZEN[tur][1], TUR[tur].ad);
    // varsayılan emirler: okçular ateş eder, diğerleri tutar
    alaylar.forEach(a => { a.emir = a.v.menzil ? 'ates' : 'tut'; });
    secili = alaylar.find(a => a.taraf === 0) || null;
    arayuzCiz(); requestAnimationFrame(boyut);
    el.querySelector('#svHiz').onclick = () => { hiz = hiz === 1 ? 2 : hiz === 2 ? 3 : 1; el.querySelector('#svHiz').textContent = hiz + '×'; };
    el.querySelector('#svOto').onclick = () => { hiz = 6; alaylar.filter(a => a.taraf === 0).forEach(a => { a.emir = a.tur === 'okcu' ? 'ates' : 'saldir'; }); };
    if (o.giris) yazi(o.giris, 5);
  }

  /* ---------- sahne ---------- */
  function kur(kap) {
    renderer = new T.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    kap.appendChild(renderer.domElement);
    sahne = new T.Scene(); sahne.background = new T.Color(0xbcd6e6); sahne.fog = new T.Fog(0xbcd6e6, 90, 220);
    kamera = new T.PerspectiveCamera(45, 1, 0.5, 500); kamera.position.set(0, 40, 54);
    kontrol = new T.MapControls(kamera, renderer.domElement); kontrol.target.set(0, 0, 0); kontrol.maxPolarAngle = 1.25; kontrol.minDistance = 20; kontrol.maxDistance = 150; kontrol.enableDamping = true;
    sahne.add(new T.HemisphereLight(0xdfefff, 0x5a4a30, 0.6));
    const g = new T.DirectionalLight(0xffe8c4, 0.75); g.position.set(-40, 70, 30); g.castShadow = true; g.shadow.mapSize.set(1024, 1024);
    Object.assign(g.shadow.camera, { left: -80, right: 80, top: 80, bottom: -80, far: 200 }); sahne.add(g);
    // ova: hafif dalgalı çayır
    const zg = new T.PlaneGeometry(260, 220, 52, 44); zg.rotateX(-Math.PI / 2);
    const p = zg.attributes.position, renk = [];
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, Math.sin(x * 0.03) * Math.cos(z * 0.025) * 1.2 + Math.max(0, Math.abs(x) - 90) * 0.25); const c = new T.Color(0x7aa848).offsetHSL(0, 0, Math.sin(x * 0.4 + z * 0.3) * 0.02); renk.push(c.r, c.g, c.b); }
    zg.setAttribute('color', new T.Float32BufferAttribute(renk, 3)); zg.computeVertexNormals();
    const zemin = new T.Mesh(zg, new T.MeshLambertMaterial({ vertexColors: true, flatShading: true })); zemin.receiveShadow = true; sahne.add(zemin); sahne.userData.zemin = zemin;
    // kenarlarda ağaçlar ve tepeler
    const yaprak = new T.ConeGeometry(1.2, 3.4, 6); yaprak.translate(0, 2.6, 0);
    const ag = new T.InstancedMesh(yaprak, new T.MeshLambertMaterial({ color: 0x3f7a3a, flatShading: true }), 140);
    for (let k = 0; k < 140; k++) { const a = Math.random() * 6.28, r = 85 + Math.random() * 40; _m.compose(_v.set(Math.cos(a) * r * 1.2, 0, Math.sin(a) * r), _q.identity(), _s.set(1, 1, 1).multiplyScalar(0.7 + Math.random() * 0.8)); ag.setMatrixAt(k, _m); }
    sahne.add(ag);
    for (let k = 0; k < 8; k++) { const t = new T.Mesh(new T.ConeGeometry(30 + Math.random() * 20, 18 + Math.random() * 14, 6), new T.MeshLambertMaterial({ color: 0x7d8a6a, flatShading: true })); const a = k / 8 * 6.28; t.position.set(Math.cos(a) * 170, 4, Math.sin(a) * 150); sahne.add(t); }
    // oklar
    const okG = new T.CylinderGeometry(0.03, 0.03, 0.9, 3); okG.rotateX(Math.PI / 2);
    okMesh = new T.InstancedMesh(okG, new T.MeshBasicMaterial({ color: 0x3a2a1a }), 300); okMesh.count = 0; okMesh.frustumCulled = false; sahne.add(okMesh);
    saat = new T.Clock();
    boyut(); window.addEventListener('resize', boyut);
    // dokun: düşmana dokunursan seçili alayın hedefi olur
    let bas = null;
    renderer.domElement.addEventListener('pointerdown', e => { bas = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    renderer.domElement.addEventListener('pointerup', e => {
      if (!bas) return; const kisa = performance.now() - bas.t < 350 && Math.hypot(e.clientX - bas.x, e.clientY - bas.y) < 9; bas = null; if (!kisa) return;
      const r = renderer.domElement.getBoundingClientRect(), isin = new T.Raycaster();
      isin.setFromCamera(new T.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), kamera);
      const h = isin.intersectObject(sahne.userData.zemin)[0]; if (!h) return;
      let en = null, d = 14;
      alaylar.forEach(a => { if (a.n <= 0) return; const m = Math.hypot(a.x - h.point.x, a.z - h.point.z); if (m < d) { d = m; en = a; } });
      if (!en) return;
      if (en.taraf === 0) { secili = en; arayuzCiz(); }
      else if (secili) { secili.hedef = en; secili.emir = secili.tur === 'okcu' ? 'ates' : 'saldir'; arayuzCiz(); }
    });
    renderer.setAnimationLoop(kare);
  }
  function boyut() { if (!el) return; const k = el.querySelector('#svSahne'); renderer.setSize(k.clientWidth, k.clientHeight, false); kamera.aspect = k.clientWidth / Math.max(1, k.clientHeight); kamera.updateProjectionMatrix(); }

  /* ---------- alaylar ---------- */
  function alayEkle(taraf, tur, n, x, z, ad) {
    const v = TUR[tur], fig = Math.min(48, Math.max(4, n));
    const govde = v.atli ? new T.BoxGeometry(0.42, 0.42, 1.1) : new T.CylinderGeometry(0.2, 0.26, 0.7, 6);
    govde.translate(0, v.atli ? 0.75 : 0.35, 0);
    const bas = new T.SphereGeometry(0.17, 6, 5); bas.translate(0, v.atli ? 1.45 : 0.85, v.atli ? -0.1 : 0);
    const binici = new T.CylinderGeometry(0.17, 0.2, 0.55, 6); binici.translate(0, 1.1, -0.1);
    const gm = new T.InstancedMesh(govde, new T.MeshLambertMaterial({ color: v.atli ? (taraf ? 0x3a2e2a : 0x6b3f22) : v.renk, flatShading: true }), fig);
    const bm = new T.InstancedMesh(bas, new T.MeshLambertMaterial({ color: v.bas }), fig);
    const parca = [gm, bm];
    if (v.atli) parca.push(new T.InstancedMesh(binici, new T.MeshLambertMaterial({ color: v.renk, flatShading: true }), fig));
    if (v.mizrak) { const mz = new T.BoxGeometry(0.04, 2, 0.04); mz.translate(0.25, 1, 0); parca.push(new T.InstancedMesh(mz, new T.MeshLambertMaterial({ color: 0x7a5a38 }), fig)); }
    parca.forEach(m => { m.castShadow = true; m.frustumCulled = false; sahne.add(m); });
    // sancak
    const sancak = new T.Group();
    const dir = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 5.4, 5), new T.MeshLambertMaterial({ color: 0x5a4a30 })); dir.position.y = 2.7; sancak.add(dir);
    const bez = new T.Mesh(new T.PlaneGeometry(2.2, 1.4), new T.MeshLambertMaterial({ color: taraf ? 0x6b3fa0 : 0xa3222f, side: T.DoubleSide })); bez.position.set(1.12, 4.6, 0); sancak.add(bez);
    sahne.add(sancak);
    const halka = new T.Mesh(new T.RingGeometry(6.5, 7.3, 32), new T.MeshBasicMaterial({ color: taraf ? 0xff5a4a : 0xf2d98a, transparent: true, opacity: 0.8, side: T.DoubleSide }));
    halka.rotation.x = -Math.PI / 2; halka.position.y = 0.15; halka.visible = false; sahne.add(halka);
    const a = { taraf, tur, v, n, n0: n, x, z, yon: taraf ? 0 : Math.PI, moral: 100, emir: 'tut', hedef: null, ad, fig, parca, sancak, bez, halka, temas: 0, bozuk: false, salinim: Math.random() * 6, dusen: 0 };
    alaylar.push(a); return a;
  }
  function yakin(a, taraf) {
    let en = null, d = 1e9;
    alaylar.forEach(b => { if (b.taraf !== taraf || b.n <= 0 || b.bozuk) return; const m = Math.hypot(a.x - b.x, a.z - b.z); if (m < d) { d = m; en = b; } });
    return [en, d];
  }
  function guc(taraf) { return alaylar.filter(a => a.taraf === taraf && !a.bozuk).reduce((t, a) => t + a.n * (a.v.vur * 10 + a.v.sav * 0.3) * (a.moral / 100), 0); }

  /* ---------- simülasyon ---------- */
  function adim(dt) {
    sure += dt;
    for (const a of alaylar) {
      if (a.n <= 0) continue;
      const dusmanTaraf = 1 - a.taraf;
      // yapay zekâ (Bizans): skutatos ilerler, katafrakt en yakına hücum eder, okçu menzile girer, Alanlar bekler
      if (a.taraf === 1 && !a.bozuk) {
        if (a.v.bekler) { const ort = ortMoral(1); a.emir = ort < 45 ? 'geri' : (a.temas > 0 ? 'saldir' : 'tut'); }
        else if (a.v.menzil) a.emir = 'ates';
        else a.emir = sure > (a.v.atli ? 6 : 3) ? 'saldir' : 'tut';
      }
      // kaçış
      if (a.bozuk) { yuru(a, a.x + (a.taraf ? 0 : 0), a.taraf ? -140 : 140, a.v.hiz * 1.3, dt); continue; }
      let [hedef, d] = a.hedef && a.hedef.n > 0 && !a.hedef.bozuk ? [a.hedef, Math.hypot(a.x - a.hedef.x, a.z - a.hedef.z)] : yakin(a, dusmanTaraf);
      if (!hedef) continue;
      const temas = d < (a.v.atli || hedef.v.atli ? 8 : 6.5);
      if (a.emir === 'geri') { yuru(a, a.x, a.taraf ? -70 : 70, a.v.hiz, dt); a.temas = 0; continue; }
      if (a.emir === 'ates' && a.v.menzil) {
        if (temas) savas(a, hedef, dt);
        else if (d > a.v.menzil) yuru(a, hedef.x, hedef.z, a.v.hiz, dt, a.v.menzil * 0.9);
        else { a.yon = Math.atan2(hedef.x - a.x, hedef.z - a.z); okAt(a, hedef, dt); }
        continue;
      }
      if (a.emir === 'dolan' && !temas) {
        // kanattan dolan: hedefin yan/arka noktasına git, sonra saldır
        const yan = a.x < hedef.x ? -1 : 1, hx = hedef.x + yan * 9, hz = hedef.z + (hedef.taraf ? -10 : 10);
        if (Math.hypot(a.x - hx, a.z - hz) > 4) { yuru(a, hx, hz, a.v.hiz, dt); continue; }
        a.emir = 'saldir';
      }
      if (a.emir === 'saldir' || temas) {
        if (temas) savas(a, hedef, dt); else { yuru(a, hedef.x, hedef.z, a.v.hiz, dt, 5.5); a.temas = 0; }
      } else a.temas = 0;
    }
    // oklar
    oklar.forEach(o => { o.t += dt / o.sure; });
    oklar = oklar.filter(o => o.t < 1);
    // sonuç
    const bizGuc = guc(0), onlarGuc = guc(1);
    if (!bitti && (onlarGuc < 1 || bizGuc < 1 || sure > 240)) bitir(onlarGuc < 1 || (sure > 240 && bizGuc > onlarGuc));
  }
  function ortMoral(taraf) { const l = alaylar.filter(a => a.taraf === taraf && a.n > 0); return l.length ? l.reduce((t, a) => t + a.moral, 0) / l.length : 0; }
  function yuru(a, x, z, h, dt, dur = 0) {
    const dx = x - a.x, dz = z - a.z, m = Math.hypot(dx, dz); if (m <= dur + 0.1) return;
    const adim = Math.min(m - dur, h * dt); a.x += dx / m * adim; a.z += dz / m * adim; a.yon = Math.atan2(dx, dz); a.yuruyor = 0.3;
  }
  // yakın dövüş: kanattan vuruş ve süvari hücumu bonus
  function savas(a, h, dt) {
    a.temas += dt; a.yon = Math.atan2(h.x - a.x, h.z - a.z);
    const gelis = Math.atan2(a.x - h.x, a.z - h.z), fark = Math.abs(Math.atan2(Math.sin(gelis - h.yon), Math.cos(gelis - h.yon)));
    const kanat = fark > 2.2 ? 2 : fark > 1.2 ? 1.6 : 1;      // arkadan ×2, yandan ×1,6
    const hucum = a.v.hucum && a.temas < 2.5 ? a.v.hucum : 1;
    const hasar = a.n * a.v.vur * kanat * hucum * (0.6 + a.moral / 250) * 3 / (3 + h.v.sav) * dt;
    kayip(h, hasar, kanat > 1 ? 1.8 : 1);
    if (window.Ses && Math.random() < dt * 3) Ses.kilic();
  }
  function okAt(a, h, dt) {
    const hasar = a.n * a.v.ok * (0.6 + a.moral / 250) * 3 / (3 + h.v.sav * 0.5) * dt;
    kayip(h, hasar, 0.7);
    // görsel oklar
    a.okT = (a.okT || 0) - dt;
    if (a.okT <= 0) { a.okT = 0.45; if (window.Ses && a.taraf === 0) Ses.ok(); for (let k = 0; k < Math.min(10, Math.ceil(a.n / 4)); k++) oklar.push({ x0: a.x + (Math.random() - 0.5) * 6, z0: a.z + (Math.random() - 0.5) * 4, x1: h.x + (Math.random() - 0.5) * 7, z1: h.z + (Math.random() - 0.5) * 5, t: -Math.random() * 0.3, sure: 1.1 }); }
  }
  function kayip(h, hasar, moralCarpan) {
    h.yara = (h.yara || 0) + hasar;
    const olen = Math.floor(h.yara); if (olen <= 0) return;
    h.yara -= olen; h.n = Math.max(0, h.n - olen); h.dusen += olen;
    h.moral -= olen / Math.max(1, h.n0) * 110 * moralCarpan;
    if (h.n <= 0 || (h.moral < 18 && !h.bozuk)) { h.bozuk = true; yazi(`${h.ad} bozuldu, kaçıyor!`, 2.2); }
  }

  /* ---------- çizim ---------- */
  function ciz(t) {
    for (const a of alaylar) {
      const goster = Math.min(a.fig, Math.ceil(a.n / Math.max(1, a.n0) * a.fig - 1e-6));
      const sut = Math.ceil(Math.sqrt(a.fig * (a.v.atli ? 1 : 1.8))), ara = (a.v.atli ? 1.5 : 0.95) * 1.5;
      const titre = a.temas > 0 ? 0.12 : 0, adimY = a.yuruyor > 0 ? 0.07 : 0;
      if (a.yuruyor > 0) a.yuruyor -= 0.016;
      for (let k = 0; k < a.fig; k++) {
        const s = k % sut, r = Math.floor(k / sut);
        const lx = (s - (sut - 1) / 2) * ara + (Math.sin(k * 7.1 + t * 9) * titre), lz = (r - 0.5) * ara * 1.1;
        const c = Math.cos(a.yon), sn = Math.sin(a.yon);
        const x = a.x + lx * c + lz * sn, z = a.z - lx * sn + lz * c;
        const yasiyor = k < goster;
        const y = yasiyor ? Math.abs(Math.sin(t * 8 + k)) * adimY : 0.05;
        _q.setFromEuler(new T.Euler(yasiyor ? 0 : Math.PI / 2, a.bozuk && yasiyor ? a.yon + Math.PI : a.yon, 0));
        _m.compose(_v.set(x, y, z), _q, _s.set(1.6, 1.6, 1.6));
        if (!yasiyor) _m.makeScale(0, 0, 0);
        a.parca.forEach(m => m.setMatrixAt(k, _m));
      }
      a.parca.forEach(m => { m.instanceMatrix.needsUpdate = true; });
      a.sancak.position.set(a.x, 0, a.z); a.sancak.visible = a.n > 0 && !a.bozuk; a.bez.rotation.y = Math.sin(t * 3 + a.salinim) * 0.3;
      a.halka.position.set(a.x, 0.2, a.z); a.halka.visible = a === secili || (secili && secili.hedef === a);
      a.halka.material.color.set(a === secili ? 0xf2d98a : 0xff5a4a);
    }
    let n = 0;
    oklar.forEach(o => {
      if (o.t < 0 || n >= 300) return;
      const u = o.t, x = o.x0 + (o.x1 - o.x0) * u, z = o.z0 + (o.z1 - o.z0) * u, y = 1.5 + Math.sin(u * Math.PI) * 9;
      const dy = Math.cos(u * Math.PI) * 9 * Math.PI, yatay = Math.hypot(o.x1 - o.x0, o.z1 - o.z0);
      _q.setFromEuler(new T.Euler(-Math.atan2(dy, yatay), Math.atan2(o.x1 - o.x0, o.z1 - o.z0), 0, 'YXZ'));
      _m.compose(_v.set(x, y, z), _q, _s.set(1, 1, 1)); okMesh.setMatrixAt(n++, _m);
    });
    okMesh.count = n; okMesh.instanceMatrix.needsUpdate = true;
  }
  function kare() {
    if (!el) return;
    const dt = Math.min(0.05, saat.getDelta());
    if (!bitti) for (let k = 0; k < hiz; k++) adim(dt);
    kontrol.update(); ciz(saat.elapsedTime); renderer.render(sahne, kamera);
    durumCiz();
  }

  /* ---------- arayüz ---------- */
  let sonDurum = 0;
  function durumCiz() {
    if (performance.now() - sonDurum < 250) return; sonDurum = performance.now();
    const b = Math.round(guc(0)), o = Math.round(guc(1));
    el.querySelector('#svBiz').textContent = 'Biz ' + alaylar.filter(a => a.taraf === 0).reduce((t, a) => t + a.n, 0);
    el.querySelector('#svOnlar').textContent = alaylar.filter(a => a.taraf === 1).reduce((t, a) => t + a.n, 0) + ' ' + (bilgi.dusmanAd || 'düşman');
    el.querySelector('#svOran').style.width = (b / Math.max(1, b + o) * 100) + '%';
    el.querySelectorAll('[data-alay]').forEach(x => { const a = alaylar[+x.dataset.alay]; x.querySelector('small').textContent = a.bozuk ? 'bozuldu' : `${a.n} · moral ${Math.max(0, Math.round(a.moral))}`; x.classList.toggle('bozuk', a.bozuk || a.n <= 0); });
  }
  function arayuzCiz() {
    const biz = alaylar.map((a, i) => [a, i]).filter(([a]) => a.taraf === 0);
    el.querySelector('#svAlaylar').innerHTML = biz.map(([a, i]) => `<button data-alay="${i}" aria-pressed="${a === secili}"><span>${a.v.ikon}</span><b>${a.ad}</b><small></small></button>`).join('');
    el.querySelectorAll('[data-alay]').forEach(x => x.onclick = () => { secili = alaylar[+x.dataset.alay]; arayuzCiz(); });
    const emirler = !secili ? [] : [['saldir', '⚔️ Saldır'], ...(secili.v.atli ? [['dolan', '↪️ Kanattan dolan']] : []), ...(secili.v.menzil ? [['ates', '🏹 Ok yağdır']] : []), ['tut', '🛡️ Tut'], ['geri', '↩️ Geri çekil']];
    el.querySelector('#svEmir').innerHTML = emirler.map(([id, ad]) => `<button data-emir="${id}" aria-pressed="${secili && secili.emir === id}">${ad}</button>`).join('') + (secili ? `<p>${secili.hedef ? 'Hedef: ' + secili.hedef.ad : 'Düşmana dokunarak hedef gösterebilirsin.'}</p>` : '');
    el.querySelectorAll('[data-emir]').forEach(x => x.onclick = () => { if (!secili) return; secili.emir = x.dataset.emir; arayuzCiz(); });
    durumCiz();
  }
  function yazi(t, sn) {
    const d = document.createElement('div'); d.className = 'sv-yazi'; d.textContent = t; el.appendChild(d);
    setTimeout(() => d.remove(), sn * 1000);
  }
  function bitir(zafer) {
    bitti = true;
    yazi(zafer ? 'ZAFER!' : 'HEZİMET', 3);
    if (window.Ses) zafer ? Ses.mehter() : Ses.yenilgi();
    const kalan = {};
    alaylar.filter(a => a.taraf === 0).forEach(a => { const tur = a.tur; kalan[tur] = (kalan[tur] || 0) + a.n; });
    setTimeout(() => {
      renderer.setAnimationLoop(null); renderer.dispose(); window.removeEventListener('resize', boyut);
      el.remove(); el = null;
      if (cb) cb({ zafer, kalan, guc: Math.round(guc(0)), savunma: Math.round(guc(1)), sure: Math.round(sure) });
    }, 2600);
  }

  window.Savas = { baslat, TUR };
})();
