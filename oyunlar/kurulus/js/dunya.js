/* Kuruluş 1299 — 3D dünya: arazi, doğa, binalar, köylüler, kamera, dokunma.
   Her şey kodla üretilir (model indirilmez); low-poly, düz gölgeli. */
'use strict';
(function () {
  const T = window.THREE;
  const N = 40, K = 2, W = N * K;            // 40×40 karo, karo 2 m → 80 m harita
  const SU_Y = 0.35;
  let sahne, kamera, renderer, kontrol, isik, arazi, araziRenk, su, saat;
  let karo = [];                              // karo[i][j] = { h, egim, tip, dolu, agac:[] }
  let agacKutle, agacGovde, kayaKutle, agacVeri = [];
  const binaNesne = new Map();                // bina id → Group
  let hayalet = null, yerlestir = null;       // yerleştirme modu
  let insanlar = null, insanBas = null, insanYuk = null, insanVeri = [];
  let olay = {};                              // dışarıya bildirimler: onTik, onYer
  let mevsimAy = 3;

  /* ---------- gürültü (tohumlu) ---------- */
  function rastgele(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const rnd = rastgele(1299);
  const izgara = []; for (let i = 0; i < 256; i++) izgara.push(rnd());
  function gurultu(x, z) {
    const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
    const h = (a, b) => izgara[((a * 73856093) ^ (b * 19349663)) & 255];
    const s = t => t * t * (3 - 2 * t);
    const a = h(xi, zi), b = h(xi + 1, zi), c = h(xi, zi + 1), d = h(xi + 1, zi + 1);
    return a + (b - a) * s(xf) + (c - a) * s(zf) + (a - b - c + d) * s(xf) * s(zf);
  }
  const fbm = (x, z) => gurultu(x, z) * 0.55 + gurultu(x * 2.1, z * 2.1) * 0.28 + gurultu(x * 4.3, z * 4.3) * 0.17;
  // dere: vadinin ortasından kıvrılarak geçer
  const dereX = z => Math.sin(z * 0.07) * 7 + Math.sin(z * 0.023 + 1) * 4 - 6;
  function yukseklik(x, z) {
    const dd = Math.abs(x - dereX(z));
    const tepe = Math.pow(Math.min(1, Math.max(0, (Math.hypot(x, z * 0.8) - 20) / 22)), 1.6) * 14;   // kenarlarda tepeler
    const dogu = Math.max(0, x - 18) * 0.35;                                                         // doğuda kayalık yamaç
    let h = 1.2 + fbm(x * 0.05 + 10, z * 0.05) * 3.2 + tepe + dogu;
    if (dd < 3.2) h = Math.min(h, SU_Y - 0.35 + Math.pow(dd / 3.2, 2) * 1.4);                        // dere yatağı
    else if (dd < 7) h = Math.min(h, 0.9 + (dd - 3.2) * 0.45 + fbm(x * 0.05, z * 0.05) * 1.5);
    return h;
  }
  const dunyadan = (i, j) => [(i + 0.5) * K - W / 2, (j + 0.5) * K - W / 2];
  const karoBul = (x, z) => [Math.floor((x + W / 2) / K), Math.floor((z + W / 2) / K)];

  /* ---------- kurulum ---------- */
  function kur(kap, olaylar) {
    olay = olaylar || {};
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    // renkler yazıldığı gibi görünsün (sRGB dönüşümü yok: low-poly paletin doygunluğu korunur)
    renderer.outputEncoding = T.LinearEncoding;
    kap.appendChild(renderer.domElement);
    sahne = new T.Scene();
    sahne.fog = new T.Fog(0xcfe0e8, 70, 170);
    kamera = new T.PerspectiveCamera(42, 1, 0.5, 400);
    kamera.position.set(-18, 46, 52);
    kontrol = new T.MapControls(kamera, renderer.domElement);
    kontrol.target.set(-4, 0, 0); kontrol.enableDamping = true; kontrol.dampingFactor = 0.09;
    kontrol.minDistance = 10; kontrol.maxDistance = 95; kontrol.maxPolarAngle = 1.2; kontrol.screenSpacePanning = false;
    kontrol.update();
    // ışık
    sahne.add(new T.HemisphereLight(0xcfe4ff, 0x4a3a28, 0.62));
    isik = new T.DirectionalLight(0xffe8c4, 0.75); isik.position.set(-30, 50, 25);
    isik.castShadow = true; isik.shadow.mapSize.set(1024, 1024);
    Object.assign(isik.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 140 });
    isik.shadow.bias = -0.0006; sahne.add(isik);
    karolar(); araziKur(); suKur(); daglar(); agaclar(); kayalar(); kale(); insanKur();
    saat = new T.Clock();
    boyut(); window.addEventListener('resize', boyut);
    dokunma(renderer.domElement);
    renderer.setAnimationLoop(kare);
  }
  function boyut() {
    const k = renderer.domElement.parentElement, w = k.clientWidth, h = k.clientHeight;
    renderer.setSize(w, h); kamera.aspect = w / h; kamera.updateProjectionMatrix();
  }

  /* ---------- karolar ---------- */
  function karolar() {
    karo = [];
    for (let i = 0; i < N; i++) {
      karo[i] = [];
      for (let j = 0; j < N; j++) {
        const [x, z] = dunyadan(i, j), h = [];
        for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]]) h.push(yukseklik(x + a * K / 2, z + b * K / 2));
        const enAz = Math.min(...h), enCok = Math.max(...h), egim = enCok - enAz, ort = h[4];
        let tip = 'cayir';
        if (enAz < SU_Y + 0.05) tip = 'su';
        else if (egim > 1.7 || ort > 10.5 || (x > 20 && fbm(x * 0.12, z * 0.12) > 0.52)) tip = 'kaya';
        else if (fbm(x * 0.07 + 40, z * 0.07 - 20) > 0.6 && ort > 1.6) tip = 'orman';
        karo[i][j] = { h: ort, egim, tip, dolu: 0, agac: [] };
      }
    }
  }

  /* ---------- arazi ---------- */
  const RENK = {
    cayir: [new T.Color('#6ea33f'), new T.Color('#74a843')], orman: [new T.Color('#4f8534'), new T.Color('#54893a')],
    kaya: [new T.Color('#9c9586'), new T.Color('#8a8475')], su: [new T.Color('#b7a676'), new T.Color('#c2b383')],
    kar: new T.Color('#f2f5f7'), kuru: new T.Color('#b5a35a')
  };
  let araziTaban;
  function araziKur() {
    let g = new T.PlaneGeometry(W + 40, W + 40, (N + 20), (N + 20));
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, yukseklik(p.getX(i), p.getZ(i)) + (Math.abs(p.getX(i)) > W / 2 || Math.abs(p.getZ(i)) > W / 2 ? 0.3 : 0));
    g = g.toNonIndexed(); g.computeVertexNormals();
    const pp = g.attributes.position, renk = new Float32Array(pp.count * 3);
    araziTaban = [];
    for (let f = 0; f < pp.count; f += 3) {
      const x = (pp.getX(f) + pp.getX(f + 1) + pp.getX(f + 2)) / 3, z = (pp.getZ(f) + pp.getZ(f + 1) + pp.getZ(f + 2)) / 3, y = (pp.getY(f) + pp.getY(f + 1) + pp.getY(f + 2)) / 3;
      const [i, j] = karoBul(x, z);
      let tip = karo[i] && karo[i][j] ? karo[i][j].tip : (y > 6 ? 'kaya' : 'orman');
      if (y < SU_Y + 0.25) tip = 'su';
      const c = RENK[tip][(f / 3) % 2].clone().offsetHSL(0, 0, (fbm(x * 0.3, z * 0.3) - 0.5) * 0.06);
      araziTaban.push({ c, tip, y });
      for (let k = 0; k < 3; k++) c.toArray(renk, (f + k) * 3);
    }
    g.setAttribute('color', new T.BufferAttribute(renk, 3));
    araziRenk = g.attributes.color;
    arazi = new T.Mesh(g, new T.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
    arazi.receiveShadow = true; sahne.add(arazi);
  }
  // mevsime göre arazi rengi: kışın kar, yazın sararan çayır
  function mevsim(ay) {
    mevsimAy = ay;
    const kar = ay === 11 || ay <= 1 ? (ay === 0 ? 1 : 0.7) : ay === 2 ? 0.25 : 0;
    const kuru = ay >= 6 && ay <= 8 ? (ay - 5) * 0.12 : 0;
    const c = new T.Color();
    araziTaban.forEach((t, f) => {
      c.copy(t.c);
      if (t.tip === 'cayir' || t.tip === 'orman') c.lerp(RENK.kuru, kuru);
      if (t.tip !== 'su' || t.y > SU_Y) c.lerp(RENK.kar, kar * (t.tip === 'kaya' ? 0.8 : 1) * (0.85 + (f % 3) * 0.05));
      for (let k = 0; k < 3; k++) c.toArray(araziRenk.array, (f * 3 + k) * 3);
    });
    araziRenk.needsUpdate = true;
    agacMevsim(ay);
    binaNesne.forEach(g => { if (g.userData.mevsim) g.userData.mevsim(ay); });
    sahne.fog.color.set(kar > 0.5 ? 0xe4ebef : 0xcfe0e8);
  }
  function suKur() {
    su = new T.Mesh(new T.PlaneGeometry(W + 40, W + 40), new T.MeshPhongMaterial({ color: 0x4c8fb5, transparent: true, opacity: 0.82, shininess: 80, specular: 0x9fd2ff }));
    su.rotation.x = -Math.PI / 2; su.position.y = SU_Y; sahne.add(su);
  }
  function daglar() {
    const m = new T.MeshLambertMaterial({ color: 0x7d8a6a, flatShading: true }), kar = new T.MeshLambertMaterial({ color: 0xf2f5f7, flatShading: true });
    for (let k = 0; k < 26; k++) {
      const a = k / 26 * Math.PI * 2 + rnd() * 0.2, r = 95 + rnd() * 30, h = 18 + rnd() * 26;
      const d = new T.Mesh(new T.ConeGeometry(16 + rnd() * 14, h, 6 + Math.floor(rnd() * 3)), m);
      d.position.set(Math.cos(a) * r, h / 2 - 2, Math.sin(a) * r); d.rotation.y = rnd() * 3; sahne.add(d);
      if (h > 34) { const z = new T.Mesh(new T.ConeGeometry((16 + 8) * 0.28, h * 0.26, 6), kar); z.position.set(d.position.x, h - 2 - h * 0.13, d.position.z); sahne.add(z); }
    }
    const zemin = new T.Mesh(new T.CircleGeometry(260, 24), new T.MeshLambertMaterial({ color: 0x6f8f4a }));
    zemin.rotation.x = -Math.PI / 2; zemin.position.y = -0.4; sahne.add(zemin);
  }

  /* ---------- ağaçlar ve kayalar (tek çizimde yüzlerce) ---------- */
  function agaclar() {
    const konum = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const k = karo[i][j]; if (k.tip !== 'orman') continue;
      const [x, z] = dunyadan(i, j);
      for (let n = 0; n < 2; n++) konum.push({ x: x + (rnd() - 0.5) * 1.6, z: z + (rnd() - 0.5) * 1.6, i, j, cam: rnd() < 0.55, s: 0.55 + rnd() * 0.4 });
    }
    // harita dışındaki ormanlar (görsel)
    for (let n = 0; n < 380; n++) { const a = rnd() * 6.283, r = W / 2 + 4 + rnd() * 36; konum.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, i: -1, cam: rnd() < 0.6, s: 0.7 + rnd() * 0.6 }); }
    agacVeri = konum;
    const yaprak = new T.ConeGeometry(0.9, 2.6, 6); yaprak.translate(0, 2.2, 0);
    const govde = new T.CylinderGeometry(0.14, 0.2, 1.2, 5); govde.translate(0, 0.6, 0);
    agacKutle = new T.InstancedMesh(yaprak, new T.MeshLambertMaterial({ flatShading: true }), konum.length);
    agacGovde = new T.InstancedMesh(govde, new T.MeshLambertMaterial({ color: 0x6b4a2f }), konum.length);
    agacKutle.castShadow = true; agacGovde.castShadow = true;
    const m = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler();
    konum.forEach((a, n) => {
      const y = yukseklik(a.x, a.z);
      m.compose(new T.Vector3(a.x, y - 0.1, a.z), q.setFromEuler(e.set(0, rnd() * 6, 0)), new T.Vector3(a.s * (a.cam ? 1 : 1.25), a.s * (a.cam ? 1 : 0.75), a.s * (a.cam ? 1 : 1.25)));
      agacKutle.setMatrixAt(n, m); agacGovde.setMatrixAt(n, m);
      a.m = m.clone();
      if (a.i >= 0) karo[a.i][a.j].agac.push(n);
    });
    agacMevsim(3);
    sahne.add(agacKutle, agacGovde);
  }
  function agacMevsim(ay) {
    if (!agacKutle) return;
    const c = new T.Color();
    agacVeri.forEach((a, n) => {
      if (a.cam) c.set(ay === 0 || ay === 11 || ay === 1 ? 0x5f7f5e : 0x2f6b3a);
      else c.set([0x8a9a6a, 0x8a9a6a, 0x9fbf5a, 0x7fb24a, 0x5f9a3a, 0x5a9235, 0x5a8f33, 0x6a9035, 0xb59a3a, 0xc8792e, 0xa0603a, 0x8a8070][ay]);
      if ((ay === 0 || ay === 11) && n % 3 === 0) c.lerp(new T.Color(0xf2f5f7), 0.6);
      agacKutle.setColorAt(n, c.offsetHSL(0, 0, ((n * 37) % 10 - 5) * 0.006));
    });
    agacKutle.instanceColor.needsUpdate = true;
  }
  function agacKes(n) {
    const a = agacVeri[n]; if (!a || a.kesik) return;
    a.kesik = true; const m = new T.Matrix4().makeScale(0, 0, 0);
    agacKutle.setMatrixAt(n, m); agacGovde.setMatrixAt(n, a.m.clone().multiply(new T.Matrix4().makeScale(1, 0.18, 1)));
    agacKutle.instanceMatrix.needsUpdate = true; agacGovde.instanceMatrix.needsUpdate = true;
  }
  function kayalar() {
    const konum = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (karo[i][j].tip === 'kaya' && rnd() < 0.55) { const [x, z] = dunyadan(i, j); konum.push([x + (rnd() - 0.5) * 1.4, z + (rnd() - 0.5) * 1.4]); }
    kayaKutle = new T.InstancedMesh(new T.DodecahedronGeometry(0.7, 0), new T.MeshLambertMaterial({ color: 0x8d877a, flatShading: true }), konum.length);
    const m = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler();
    konum.forEach(([x, z], n) => { const s = 0.6 + rnd() * 1.1; m.compose(new T.Vector3(x, yukseklik(x, z), z), q.setFromEuler(e.set(rnd() * 3, rnd() * 3, 0)), new T.Vector3(s, s * 0.7, s)); kayaKutle.setMatrixAt(n, m); });
    kayaKutle.castShadow = true; kayaKutle.receiveShadow = true; sahne.add(kayaKutle);
  }
  // ufukta Bilecik tekfurunun kalesi (görsel)
  function kale() {
    const tas = new T.MeshLambertMaterial({ color: 0xb8ab90, flatShading: true }), cati = new T.MeshLambertMaterial({ color: 0x8a3b2a, flatShading: true });
    const g = new T.Group(), R = 7;
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * Math.PI * 2;
      const kule = new T.Mesh(new T.CylinderGeometry(1.4, 1.6, 7, 7), tas); kule.position.set(Math.cos(a) * R, 3.5, Math.sin(a) * R); g.add(kule);
      const k2 = new T.Mesh(new T.ConeGeometry(1.7, 2, 7), cati); k2.position.set(kule.position.x, 8, kule.position.z); g.add(k2);
      const b = (k + 1) / 6 * Math.PI * 2, x1 = Math.cos(a) * R, z1 = Math.sin(a) * R, x2 = Math.cos(b) * R, z2 = Math.sin(b) * R;
      const sur = new T.Mesh(new T.BoxGeometry(Math.hypot(x2 - x1, z2 - z1), 4.5, 1), tas);
      sur.position.set((x1 + x2) / 2, 2.25, (z1 + z2) / 2); sur.rotation.y = -Math.atan2(z2 - z1, x2 - x1); g.add(sur);
    }
    const ic = new T.Mesh(new T.BoxGeometry(5, 9, 5), tas); ic.position.y = 4.5; g.add(ic);
    const bayrak = new T.Mesh(new T.PlaneGeometry(2.4, 1.4), new T.MeshLambertMaterial({ color: 0x8b1a2b, side: T.DoubleSide })); bayrak.position.set(1.2, 10.6, 0); g.add(bayrak);
    const dir = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 3), tas); dir.position.set(0, 10.4, 0); g.add(dir);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
    g.position.set(62, yukseklik(44, -40) + 4, -58); g.scale.setScalar(1.1);
    const tepe = new T.Mesh(new T.ConeGeometry(20, 14, 7), new T.MeshLambertMaterial({ color: 0x7a8a5c, flatShading: true }));
    tepe.position.set(62, 1, -58); sahne.add(tepe);
    g.position.y = 7.5; sahne.add(g);
    olay.kale = g;
  }

  /* ---------- binalar ---------- */
  const MZ = {};
  const mz = (renk, ek) => MZ[renk + (ek || '')] || (MZ[renk + (ek || '')] = new T.MeshLambertMaterial(Object.assign({ color: renk, flatShading: true }, ek ? JSON.parse(ek) : {})));
  function kutu(g, w, h, d, renk, x = 0, y = 0, z = 0) { const m = new T.Mesh(new T.BoxGeometry(w, h, d), mz(renk)); m.position.set(x, y + h / 2, z); g.add(m); return m; }
  function silindir(g, r1, r2, h, renk, x = 0, y = 0, z = 0, s = 8) { const m = new T.Mesh(new T.CylinderGeometry(r1, r2, h, s), mz(renk)); m.position.set(x, y + h / 2, z); g.add(m); return m; }
  function koni(g, r, h, renk, x = 0, y = 0, z = 0, s = 8) { const m = new T.Mesh(new T.ConeGeometry(r, h, s), mz(renk)); m.position.set(x, y + h / 2, z); g.add(m); return m; }
  function kubbe(g, r, renk, x = 0, y = 0, z = 0) { const m = new T.Mesh(new T.SphereGeometry(r, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mz(renk)); m.position.set(x, y, z); g.add(m); return m; }
  function cit(g, w, d, renk = 0x7a5a38) {
    for (let k = 0; k <= 8; k++) {
      const u = k / 8;
      for (const [x, z] of [[-w / 2 + u * w, -d / 2], [-w / 2 + u * w, d / 2], [-w / 2, -d / 2 + u * d], [w / 2, -d / 2 + u * d]]) kutu(g, 0.08, 0.6, 0.08, renk, x, 0, z);
    }
    kutu(g, w, 0.06, 0.05, renk, 0, 0.45, -d / 2); kutu(g, w, 0.06, 0.05, renk, 0, 0.45, d / 2);
    kutu(g, 0.05, 0.06, d, renk, -w / 2, 0.45, 0); kutu(g, 0.05, 0.06, d, renk, w / 2, 0.45, 0);
  }
  const YAPICI = {
    cadir(g) {
      silindir(g, 0.85, 0.85, 0.75, 0xe8dcc0, 0, 0, 0, 10); koni(g, 0.95, 0.75, 0xcdbb94, 0, 0.75, 0, 10);
      silindir(g, 0.87, 0.87, 0.08, 0xa3352a, 0, 0.55, 0, 10); kutu(g, 0.32, 0.5, 0.05, 0x5a3a24, 0, 0, 0.84);
    },
    ev(g) {
      kutu(g, 1.5, 0.95, 1.3, 0xc9a574); kutu(g, 1.52, 0.1, 1.32, 0x6b4a2f, 0, 0.95);
      const c = koni(g, 1.25, 0.75, 0x9a4a32, 0, 1.0, 0, 4); c.rotation.y = Math.PI / 4; c.scale.set(1, 1, 0.9);
      kutu(g, 0.3, 0.55, 0.05, 0x5a3a24, 0.3, 0, 0.66); kutu(g, 0.25, 0.22, 0.05, 0x3a4a5a, -0.35, 0.45, 0.66);
    },
    tarla(g) {
      g.userData.ekin = [];
      for (let k = 0; k < 7; k++) { const s = kutu(g, 3.4, 0.12, 0.3, 0x8a6a3a, 0, 0.02, -1.6 + k * 0.53); g.userData.ekin.push(s); }
      cit(g, 3.8, 3.8);
      g.userData.mevsim = ay => {
        const r = [0x7a5a35, 0x7a5a35, 0x6f8a3a, 0x7fae3f, 0x9fbf45, 0xd2b34a, 0xdcc055, 0xc9a548, 0x9a7a40, 0x7a5a35, 0x7a5a35, 0xe8eef0][ay];
        const h = [0.06, 0.06, 0.12, 0.2, 0.32, 0.42, 0.45, 0.4, 0.12, 0.06, 0.06, 0.06][ay];
        g.userData.ekin.forEach(s => { s.material = mz(r); s.scale.y = h / 0.12; });
      };
    },
    agil(g) {
      cit(g, 3.6, 3.4); kutu(g, 1.3, 0.8, 1, 0x8f6a44, -1, 0, -1); const c = kutu(g, 1.45, 0.08, 1.15, 0x6b4a2f, -1, 0.8, -1); c.rotation.z = 0.15;
      g.userData.koyun = [];
      for (let k = 0; k < 6; k++) {
        const k1 = new T.Group(); kutu(k1, 0.42, 0.28, 0.26, 0xf3efe6, 0, 0.12); kutu(k1, 0.14, 0.16, 0.14, 0x2a2622, 0.26, 0.26);
        k1.position.set((rnd() - 0.3) * 2.4, 0, (rnd() - 0.4) * 2.2); k1.rotation.y = rnd() * 6; g.add(k1); g.userData.koyun.push(k1);
      }
      g.userData.anim = (t) => g.userData.koyun.forEach((k1, n) => { k1.position.x += Math.sin(t * 0.7 + n) * 0.002; k1.rotation.y += Math.sin(t * 0.5 + n * 2) * 0.004; });
    },
    oduncu(g) {
      kutu(g, 1.1, 0.75, 0.9, 0x8a6440); const c = koni(g, 0.9, 0.5, 0x5a4a30, 0, 0.75, 0, 4); c.rotation.y = Math.PI / 4;
      for (let k = 0; k < 4; k++) { const l = silindir(g, 0.12, 0.12, 1.1, 0x9a7048, 0.75, 0.12 + (k % 2) * 0.2, -0.3 + k * 0.18, 6); l.rotation.z = Math.PI / 2; }
      silindir(g, 0.25, 0.28, 0.3, 0x7a5638, -0.7, 0, 0.5, 7);
    },
    tasocagi(g) {
      for (let k = 0; k < 5; k++) { const t = new T.Mesh(new T.DodecahedronGeometry(0.35 + rnd() * 0.25, 0), mz(0xa8a090)); t.position.set((rnd() - 0.5) * 1.2, 0.25, (rnd() - 0.5) * 1.2); g.add(t); }
      kutu(g, 0.6, 0.3, 0.4, 0xb8b0a0, 0.5, 0, 0.5); kutu(g, 0.6, 0.3, 0.4, 0xb0a898, 0.5, 0.3, 0.5);
      silindir(g, 0.05, 0.05, 1.6, 0x7a5a38, -0.5, 0, -0.5, 5);
    },
    pazar(g) {
      const r = [0xb83a2a, 0x2f5f9a, 0xd2a032];
      for (let k = 0; k < 3; k++) {
        const x = -1.2 + k * 1.2;
        kutu(g, 0.9, 0.45, 0.6, 0x9a7048, x, 0, 0.3);
        const t = kutu(g, 1.05, 0.06, 0.95, r[k], x, 1.05, 0.2); t.rotation.x = -0.25;
        for (const dx of [-0.42, 0.42]) kutu(g, 0.06, 1.05, 0.06, 0x6b4a2f, x + dx, 0, 0.62);
        kutu(g, 0.25, 0.18, 0.25, [0xd28a32, 0x7fae3f, 0xc94a3a][k], x - 0.2, 0.45, 0.3);
      }
      kutu(g, 0.5, 0.35, 0.5, 0x8a6440, 1.3, 0, -1.2); kutu(g, 0.45, 0.3, 0.45, 0x9a7048, 0.7, 0, -1.3);
    },
    mescit(g) {
      kutu(g, 2.6, 1.7, 2.6, 0xe6dcc8); kutu(g, 2.7, 0.12, 2.7, 0xb8a888, 0, 1.7);
      silindir(g, 0.95, 1.05, 0.35, 0xd8ccb4, 0, 1.82, 0, 12); kubbe(g, 0.98, 0x7a8a96, 0, 2.17, 0);
      silindir(g, 0.05, 0.05, 0.4, 0xc9a548, 0, 3.1, 0, 5);
      silindir(g, 0.28, 0.32, 3.2, 0xd8ccb4, 1.6, 0, -1.2, 8); silindir(g, 0.36, 0.36, 0.15, 0xb8a888, 1.6, 2.6, -1.2, 8);
      koni(g, 0.3, 0.9, 0x7a8a96, 1.6, 3.2, -1.2, 8);
      kutu(g, 0.6, 1.0, 0.08, 0x5a3a24, 0, 0, 1.31);
      for (const x of [-0.8, 0.8]) kutu(g, 0.3, 0.55, 0.06, 0x3a4a5a, x, 0.75, 1.31);
    },
    meydan(g) {
      kutu(g, 3.6, 0.05, 3.6, 0xb59a6a, 0, 0, 0);
      silindir(g, 0.05, 0.06, 3.2, 0x6b4a2f, -1.5, 0, -1.5, 6);
      const f = new T.Mesh(new T.PlaneGeometry(1.1, 0.7), new T.MeshLambertMaterial({ color: 0xa3222f, side: T.DoubleSide })); f.position.set(-0.95, 2.8, -1.5); g.add(f); g.userData.sancak = f;
      kutu(g, 1.4, 0.08, 0.1, 0x7a5a38, 1.0, 0.9, -1.6); for (let k = 0; k < 5; k++) { const m = silindir(g, 0.02, 0.02, 1.4, 0x9a8a70, 0.5 + k * 0.25, 0, -1.55, 4); m.rotation.x = 0.15; }
      const h = silindir(g, 0.45, 0.45, 0.08, 0xe8dcc0, 1.4, 0.7, 1.4, 12); h.rotation.x = Math.PI / 2;
      const h2 = silindir(g, 0.28, 0.28, 0.09, 0xa3222f, 1.4, 0.7, 1.4, 12); h2.rotation.x = Math.PI / 2;
      silindir(g, 0.04, 0.04, 0.75, 0x6b4a2f, 1.4, 0, 1.36, 4);
      g.userData.anim = t => { if (g.userData.sancak) g.userData.sancak.rotation.y = Math.sin(t * 2.2) * 0.25; };
    },
    ahir(g) {
      kutu(g, 3.2, 1.0, 1.2, 0x8a6440, 0, 0, -1.1); const c = kutu(g, 3.4, 0.08, 1.5, 0x5a4a30, 0, 1.05, -1.1); c.rotation.x = 0.12;
      cit(g, 3.6, 3.4);
      for (let k = 0; k < 4; k++) {
        const a = new T.Group(); kutu(a, 0.75, 0.38, 0.26, [0x6b3f22, 0x2a1d15, 0x8a5a32, 0xc8b8a0][k], 0, 0.42); kutu(a, 0.2, 0.42, 0.18, [0x6b3f22, 0x2a1d15, 0x8a5a32, 0xc8b8a0][k], 0.38, 0.62);
        for (const [x, z] of [[-0.28, -0.09], [-0.28, 0.09], [0.28, -0.09], [0.28, 0.09]]) kutu(a, 0.06, 0.42, 0.06, 0x2a1d15, x, 0, z);
        a.position.set(-1.1 + k * 0.75, 0, 0.6 + (k % 2) * 0.5); a.rotation.y = rnd() * 6; g.add(a);
      }
    },
    han(g) {
      const tas = 0xc9b48e;
      kutu(g, 3.6, 1.5, 0.5, tas, 0, 0, -1.55); kutu(g, 3.6, 1.5, 0.5, tas, 0, 0, 1.55); kutu(g, 0.5, 1.5, 3.1, tas, -1.55, 0, 0); kutu(g, 0.5, 1.5, 3.1, tas, 1.55, 0, 0);
      kutu(g, 1.0, 1.9, 0.6, 0xb8a37c, 0, 0, 1.6); kutu(g, 0.55, 1.1, 0.05, 0x4a3424, 0, 0, 1.92);
      for (const [x, z] of [[-1.55, -1.55], [1.55, -1.55], [-1.55, 1.55], [1.55, 1.55]]) kubbe(g, 0.42, 0x7a8a96, x, 1.5, z);
      kutu(g, 2.6, 0.04, 2.6, 0xb5a35a, 0, 0, 0);
      silindir(g, 0.35, 0.45, 0.5, 0x8a9aa0, 0, 0, 0, 8);
    }
  };
  // inşaat iskelesi
  function iskele(g, boy) {
    const s = new T.Group(); s.name = 'iskele';
    const r = boy * K * 0.42;
    for (const [x, z] of [[-r, -r], [r, -r], [-r, r], [r, r]]) kutu(s, 0.08, 1.8, 0.08, 0xa07a50, x, 0, z);
    for (const y of [0.6, 1.2, 1.75]) { kutu(s, r * 2, 0.05, 0.05, 0xa07a50, 0, y, -r); kutu(s, r * 2, 0.05, 0.05, 0xa07a50, 0, y, r); }
    g.add(s);
  }
  function binaGrup(tip, boy) {
    const g = new T.Group(), ic = new T.Group(); ic.name = 'ic';
    (YAPICI[tip] || YAPICI.cadir)(ic);
    ic.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    g.add(ic); g.userData.ic = ic; g.userData.mevsim = ic.userData.mevsim; g.userData.anim = ic.userData.anim;
    g.userData.boy = boy;
    return g;
  }
  function binaKonum(b, boy) {
    const [x0, z0] = dunyadan(b.x, b.z), o = (boy - 1) * K / 2;
    const x = x0 + o, z = z0 + o;
    let h = 0; for (let i = 0; i < boy; i++) for (let j = 0; j < boy; j++) h = Math.max(h, karo[b.x + i][b.z + j].h);
    return [x, h, z];
  }
  function binaEkle(b, v) {
    const g = binaGrup(b.tip, v.boy);
    const [x, h, z] = binaKonum(b, v.boy);
    g.position.set(x, h - 0.05, z); g.rotation.y = (b.rot || 0) * Math.PI / 2;
    g.userData.id = b.id;
    // temel: eğimi kapatan toprak döşeme
    const t = new T.Mesh(new T.BoxGeometry(v.boy * K * 0.96, 1.2, v.boy * K * 0.96), mz(0x9a8a62)); t.position.y = -0.6; t.receiveShadow = true; g.add(t);
    sahne.add(g); binaNesne.set(b.id, g);
    for (let i = 0; i < v.boy; i++) for (let j = 0; j < v.boy; j++) karo[b.x + i][b.z + j].dolu = b.id;
    // yerindeki ağaçlar kesilir
    for (let i = 0; i < v.boy; i++) for (let j = 0; j < v.boy; j++) karo[b.x + i][b.z + j].agac.forEach(agacKes);
    binaGuncelle(b);
    if (g.userData.mevsim) g.userData.mevsim(mevsimAy);
    return g;
  }
  function binaGuncelle(b) {
    const g = binaNesne.get(b.id); if (!g) return;
    const ic = g.userData.ic, ins = Math.min(1, b.insa);
    ic.scale.y = 0.08 + 0.92 * ins;
    const sk = g.getObjectByName('iskele');
    if (ins < 1 && !sk) iskele(g, g.userData.boy);
    if (ins >= 1 && sk) { g.remove(sk); g.userData.bitis = 0.0001; }
  }
  function binaKaldir(b, v) {
    const g = binaNesne.get(b.id); if (g) sahne.remove(g); binaNesne.delete(b.id);
    for (let i = 0; i < v.boy; i++) for (let j = 0; j < v.boy; j++) karo[b.x + i][b.z + j].dolu = 0;
  }
  // üretim çevresi: oduncu ağaç, taş ocağı kaya sayar (0.2–1)
  function cevre(b, v) {
    if (v.zemin === 'orman') {
      let say = 0, ornek = null;
      for (let i = b.x - 4; i <= b.x + 4; i++) for (let j = b.z - 4; j <= b.z + 4; j++) {
        const k = karo[i] && karo[i][j]; if (!k) continue;
        k.agac.forEach(n => { if (!agacVeri[n].kesik) { say++; if (!ornek && Math.random() < 0.3) ornek = n; } });
      }
      // her ay bir ağaç kesilir (oduncu çalışıyorsa)
      if (b.isci && ornek != null && Math.random() < 0.5) agacKes(ornek);
      return Math.max(0.2, Math.min(1, say / 14));
    }
    if (v.zemin === 'kaya') {
      let say = 0;
      for (let i = b.x - 3; i <= b.x + 3; i++) for (let j = b.z - 3; j <= b.z + 3; j++) if (karo[i] && karo[i][j] && karo[i][j].tip === 'kaya') say++;
      return Math.max(0.2, Math.min(1, say / 8));
    }
    return 1;
  }
  // yerleştirme uygun mu? [uygun, neden]
  function uygun(v, i, j) {
    if (i < 0 || j < 0 || i + v.boy > N || j + v.boy > N) return [false, 'Harita dışı'];
    for (let a = 0; a < v.boy; a++) for (let b = 0; b < v.boy; b++) {
      const k = karo[i + a][j + b];
      if (k.dolu) return [false, 'Dolu'];
      if (k.tip === 'su') return [false, 'Su'];
      if (k.tip === 'kaya') return [false, 'Kayalık'];
      if (k.egim > (v.zemin === 'duz' ? 0.9 : 1.4)) return [false, 'Çok eğimli'];
    }
    if (v.zemin === 'orman' || v.zemin === 'kaya') {
      let var_ = false;
      for (let a = i - 2; a <= i + v.boy + 1; a++) for (let b = j - 2; b <= j + v.boy + 1; b++) if (karo[a] && karo[a][b] && karo[a][b].tip === v.zemin) var_ = true;
      if (!var_) return [false, v.zemin === 'orman' ? 'Ormana yakın olmalı' : 'Kayalığa yakın olmalı'];
    }
    return [true, ''];
  }

  /* ---------- yerleştirme modu ---------- */
  function yerlestirmeBasla(v, cb) {
    yerlestirmeBitir();
    const g = binaGrup(v.id, v.boy);
    g.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.62; o.castShadow = false; } });
    const taban = new T.Mesh(new T.PlaneGeometry(v.boy * K, v.boy * K), new T.MeshBasicMaterial({ color: 0x5bff7a, transparent: true, opacity: 0.35, depthWrite: false }));
    taban.rotation.x = -Math.PI / 2; taban.position.y = 0.06; g.add(taban); g.userData.taban = taban;
    hayalet = g; sahne.add(g);
    yerlestir = { v, i: -1, j: -1, rot: 0, cb };
    // ekranın ortasına koy
    const p = isinla(window.innerWidth / 2, window.innerHeight * 0.45);
    if (p) yerlestirKonum(p);
  }
  function yerlestirKonum(p) {
    const v = yerlestir.v, [i0, j0] = karoBul(p.x - (v.boy - 1) * K / 2, p.z - (v.boy - 1) * K / 2);
    yerlestir.i = i0; yerlestir.j = j0;
    const [ok, neden] = uygun(v, i0, j0);
    yerlestir.ok = ok; yerlestir.neden = neden;
    const ii = Math.max(0, Math.min(N - v.boy, i0)), jj = Math.max(0, Math.min(N - v.boy, j0));
    const [x, h, z] = binaKonum({ x: ii, z: jj }, v.boy);
    hayalet.position.set(x, h, z);
    hayalet.userData.taban.material.color.set(ok ? 0x5bff7a : 0xff4a4a);
    if (yerlestir.cb) yerlestir.cb({ ok, neden });
  }
  function yerlestirDondur() { if (!hayalet) return; yerlestir.rot = (yerlestir.rot + 1) % 4; hayalet.rotation.y = yerlestir.rot * Math.PI / 2; }
  function yerlestirmeBitir() { if (hayalet) sahne.remove(hayalet); hayalet = null; const y = yerlestir; yerlestir = null; return y; }

  /* ---------- köylüler ---------- */
  function insanKur() {
    const MAX = 220;
    const govde = new T.CylinderGeometry(0.16, 0.22, 0.62, 6); govde.translate(0, 0.31, 0);
    const bas = new T.SphereGeometry(0.13, 6, 5); bas.translate(0, 0.76, 0);
    const yuk = new T.BoxGeometry(0.26, 0.2, 0.2); yuk.translate(0, 0.68, -0.18);
    insanlar = new T.InstancedMesh(govde, new T.MeshLambertMaterial({ flatShading: true }), MAX);
    insanBas = new T.InstancedMesh(bas, new T.MeshLambertMaterial({ color: 0xe0b48a }), MAX);
    insanYuk = new T.InstancedMesh(yuk, new T.MeshLambertMaterial({ color: 0x9a7048 }), MAX);
    [insanlar, insanBas, insanYuk].forEach(m => { m.count = 0; m.castShadow = true; m.frustumCulled = false; sahne.add(m); });
    const renk = [0x8b2a2a, 0x2f4a7a, 0x5a6b2f, 0x7a4a2a, 0xd8c8a8, 0x4a3a5a, 0xa0603a];
    const c = new T.Color();
    for (let n = 0; n < MAX; n++) { c.set(renk[n % renk.length]); insanlar.setColorAt(n, c); }
  }
  // her köylü: evi ve iş yeri arasında gidip gelir
  function nufusGuncelle(nufus, binalar, V) {
    const evler = binalar.filter(b => b.insa >= 1 && (V(b.tip).konut)), isler = [];
    binalar.forEach(b => { if (b.insa >= 1) for (let k = 0; k < Math.min(b.isci || 0, 3); k++) isler.push(b); });
    const goster = Math.min(insanlar.instanceMatrix.count, Math.round(nufus * 0.55));
    while (insanVeri.length < goster) insanVeri.push({ faz: Math.random(), hiz: 0.85 + Math.random() * 0.3 });
    insanVeri.length = goster;
    insanVeri.forEach((p, n) => {
      const ev = evler.length ? evler[n % evler.length] : null, is = isler.length ? isler[n % isler.length] : null;
      p.ev = ev ? binaNesne.get(ev.id) : null; p.is = is ? binaNesne.get(is.id) : null;
      p.ofs = [(Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6];
    });
    insanlar.count = insanBas.count = insanYuk.count = goster;
  }
  const _m = new T.Matrix4(), _q = new T.Quaternion(), _e = new T.Euler(), _v = new T.Vector3(), _s = new T.Vector3(1, 1, 1), _sifir = new T.Vector3(0, 0, 0);
  function insanAnim(dt, hiz) {
    insanVeri.forEach((p, n) => {
      if (!p.ev) return;
      p.faz = (p.faz + dt * 0.055 * p.hiz * Math.max(0.3, hiz)) % 1;
      const a = p.ev.position, b = (p.is || p.ev).position;
      // 0-0.35 işe yürü, 0.35-0.55 çalış, 0.55-0.9 eve dön (yüklü), 0.9-1 evde
      let u, x, z, yuklu = false, gorun = true;
      if (p.faz < 0.35) u = p.faz / 0.35;
      else if (p.faz < 0.55) u = 1;
      else if (p.faz < 0.9) { u = 1 - (p.faz - 0.55) / 0.35; yuklu = !!p.is; }
      else { u = 0; gorun = p.faz < 0.93; }
      if (!p.is) { u = 0.15 + Math.sin(p.faz * 6.28) * 0.15; }
      x = a.x + (b.x - a.x) * u + p.ofs[0]; z = a.z + (b.z - a.z) * u + p.ofs[1];
      const y = Math.max(SU_Y, yukseklik(x, z));
      const yon = Math.atan2(b.x - a.x, b.z - a.z) + (p.faz >= 0.55 && p.faz < 0.9 ? Math.PI : 0);
      const ad = (p.faz < 0.35 || (p.faz >= 0.55 && p.faz < 0.9)) ? Math.abs(Math.sin(p.faz * 400)) * 0.06 : 0;
      _m.compose(_v.set(x, y + ad, z), _q.setFromEuler(_e.set(0, yon, 0)), gorun ? _s : _sifir);
      insanlar.setMatrixAt(n, _m); insanBas.setMatrixAt(n, _m);
      _m.compose(_v.set(x, y + ad, z), _q, yuklu && gorun ? _s : _sifir); insanYuk.setMatrixAt(n, _m);
    });
    insanlar.instanceMatrix.needsUpdate = insanBas.instanceMatrix.needsUpdate = insanYuk.instanceMatrix.needsUpdate = true;
  }

  /* ---------- dokunma: kaydır = gez, dokun = seç/yerleştir ---------- */
  const isin = new T.Raycaster(), fare = new T.Vector2();
  function isinla(cx, cy) {
    const r = renderer.domElement.getBoundingClientRect();
    fare.set((cx - r.left) / r.width * 2 - 1, -(cy - r.top) / r.height * 2 + 1);
    isin.setFromCamera(fare, kamera);
    const h = isin.intersectObject(arazi, false)[0];
    return h ? h.point : null;
  }
  function dokunma(el) {
    let bas = null;
    el.addEventListener('pointerdown', e => { bas = { x: e.clientX, y: e.clientY, t: performance.now(), say: 1 }; });
    el.addEventListener('pointermove', e => {
      if (!bas || !hayalet) return;
      // yerleştirme modunda tek parmakla hayaleti sürükle
    });
    el.addEventListener('pointerup', e => {
      if (!bas) return;
      const kisa = performance.now() - bas.t < 350 && Math.hypot(e.clientX - bas.x, e.clientY - bas.y) < 9;
      bas = null; if (!kisa) return;
      const p = isinla(e.clientX, e.clientY); if (!p) return;
      if (hayalet) { yerlestirKonum(p); return; }
      // bina seçimi
      const [i, j] = karoBul(p.x, p.z);
      const k = karo[i] && karo[i][j];
      if (k && k.dolu && olay.onTik) olay.onTik(k.dolu);
      else if (olay.onBos) olay.onBos();
    });
  }

  /* ---------- döngü ---------- */
  let zaman = 0, hizCarpan = 1;
  function kare() {
    const dt = Math.min(0.05, saat.getDelta());
    zaman += dt;
    kontrol.update();
    if (olay.onKare) olay.onKare(dt);
    insanAnim(dt, hizCarpan);
    binaNesne.forEach(g => {
      if (g.userData.anim) g.userData.anim(zaman);
      if (g.userData.bitis) { g.userData.bitis += dt; const s = 1 + Math.sin(Math.min(1, g.userData.bitis / 0.5) * Math.PI) * 0.08; g.userData.ic.scale.set(s, s, s); if (g.userData.bitis > 0.5) { g.userData.bitis = 0; g.userData.ic.scale.set(1, 1, 1); } }
    });
    su.material.opacity = 0.8 + Math.sin(zaman * 0.8) * 0.03;
    if (hayalet && hayalet.userData.taban) hayalet.userData.taban.material.opacity = 0.3 + Math.sin(zaman * 5) * 0.1;
    renderer.render(sahne, kamera);
  }
  // kamera: bir binaya yumuşakça odaklan
  function odakla(x, z) { kontrol.target.set(x, 0, z); }
  function ekranKonum(v3) { const p = v3.clone().project(kamera), r = renderer.domElement.getBoundingClientRect(); return { x: (p.x + 1) / 2 * r.width + r.left, y: (1 - p.y) / 2 * r.height + r.top, gorunur: p.z < 1 }; }
  function baslangicYeri() {
    // obanın kurulacağı düz ve geniş yer: haritanın ortasına yakın, dereye yakın çayır
    let en = null, puan = -1e9;
    for (let i = 8; i < N - 8; i++) for (let j = 8; j < N - 8; j++) {
      let ok = true; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const k = karo[i + a][j + b]; if (k.tip !== 'cayir' || k.egim > 0.8) ok = false; }
      if (!ok) continue;
      const [x, z] = dunyadan(i, j), p = -Math.hypot(x + 2, z) - Math.abs(Math.abs(x - dereX(z)) - 9) * 0.8;
      if (p > puan) { puan = p; en = [i, j]; }
    }
    return en || [N / 2, N / 2];
  }

  /* ---------- askerler: alay meydanında saf ---------- */
  let askerler = null, askerBas = null, askerMizrak = null;
  function askerGoster(n, meydan) {
    if (!askerler) {
      const MAX = 60;
      const govde = new T.CylinderGeometry(0.17, 0.23, 0.66, 6); govde.translate(0, 0.33, 0);
      const bas = new T.SphereGeometry(0.16, 6, 5); bas.translate(0, 0.82, 0);
      const miz = new T.BoxGeometry(0.04, 1.6, 0.04); miz.translate(0.22, 0.8, 0.05);
      askerler = new T.InstancedMesh(govde, new T.MeshLambertMaterial({ color: 0x8b1a2b, flatShading: true }), MAX);
      askerBas = new T.InstancedMesh(bas, new T.MeshLambertMaterial({ color: 0xf2ece0 }), MAX);   // beyaz sarık
      askerMizrak = new T.InstancedMesh(miz, new T.MeshLambertMaterial({ color: 0x7a5a38 }), MAX);
      [askerler, askerBas, askerMizrak].forEach(m => { m.castShadow = true; m.frustumCulled = false; sahne.add(m); });
    }
    const g = meydan && binaNesne.get(meydan.id);
    const say = g && meydan.insa >= 1 ? Math.min(60, n) : 0;
    const m = new T.Matrix4(), q = new T.Quaternion();
    for (let k = 0; k < say; k++) {
      const sira = Math.floor(k / 8), sut = k % 8;
      const v = new T.Vector3(-1.4 + sut * 0.42, 0, -0.6 + sira * 0.5).applyAxisAngle(new T.Vector3(0, 1, 0), g.rotation.y).add(g.position);
      m.compose(v, q.setFromAxisAngle(new T.Vector3(0, 1, 0), g.rotation.y + Math.PI), new T.Vector3(1, 1, 1));
      askerler.setMatrixAt(k, m); askerBas.setMatrixAt(k, m); askerMizrak.setMatrixAt(k, m);
    }
    askerler.count = askerBas.count = askerMizrak.count = say;
    [askerler, askerBas, askerMizrak].forEach(x => { x.instanceMatrix.needsUpdate = true; });
  }

  // savaş ekranı açıkken şehir çizimini durdur (pil ve GPU)
  function duraklat(d) { renderer.setAnimationLoop(d ? null : kare); if (!d) saat.getDelta(); }

  window.Dunya = { duraklat, askerGoster,
    kur, mevsim, binaEkle, binaGuncelle, binaKaldir, cevre, uygun, yerlestirmeBasla, yerlestirmeBitir, yerlestirDondur,
    yerlestirme: () => yerlestir, nufusGuncelle, odakla, ekranKonum, baslangicYeri, karo: () => karo, dunyadan,
    hiz: h => { hizCarpan = h; }, kamera: () => kamera, kontrol: () => kontrol
  };
})();
