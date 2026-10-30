/* Başbakan — 3D Türkiye haritası: 81 il yükseltilmiş, komşular, denizler, projeler. */
'use strict';
window.Harita = (function () {
  const V = window.VERI, G = window.GEO;
  const OLCEK = 6, KOS = Math.cos(39 * Math.PI / 180), LON0 = 35, LAT0 = 39;
  const xy = (lon, lat) => [(lon - LON0) * KOS * OLCEK, (lat - LAT0) * OLCEK]; // şekil düzlemi (y = kuzey)
  const dunya = (lon, lat, y = 0) => new THREE.Vector3((lon - LON0) * KOS * OLCEK, y, -(lat - LAT0) * OLCEK);
  let sahne, kamera, renderer, kontrol, kok, ray = new THREE.Raycaster(), etiketKat, secCb = null;
  const iller = {}; // ad -> { mesh, mat, merkez, h, hedefH, renk, hedefRenk }
  const etiketler = [];
  let projeKat, secili = null, golge = null, hemi = null, kar = 0;
  const KAR = new THREE.Color('#eef3f7'), GECE = new THREE.Color('#04090f'), GUNDUZ = new THREE.Color('#123251');

  function kur(kap, cb) {
    secCb = cb;
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.outputEncoding = THREE.LinearEncoding;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    kap.appendChild(renderer.domElement);
    etiketKat = document.createElement('div'); etiketKat.className = 'etiketler'; kap.appendChild(etiketKat);
    sahne = new THREE.Scene(); sahne.background = new THREE.Color('#0b1a2b'); sahne.fog = new THREE.Fog('#0b1a2b', 220, 420);
    kamera = new THREE.PerspectiveCamera(40, 1, 0.5, 600);
    kontrol = new THREE.MapControls(kamera, renderer.domElement);
    kontrol.enableDamping = true; kontrol.dampingFactor = 0.08; kontrol.screenSpacePanning = false;
    kontrol.minDistance = 18; kontrol.maxDistance = 260; kontrol.maxPolarAngle = 1.12; kontrol.minPolarAngle = 0.15;
    kontrol.rotateSpeed = 0.5;
    hemi = new THREE.HemisphereLight('#cfe3ff', '#1a2433', 0.75); sahne.add(hemi);
    const gun = new THREE.DirectionalLight('#fff4e0', 0.85); gun.position.set(-40, 90, 50); gun.castShadow = true;
    gun.shadow.mapSize.set(2048, 2048); Object.assign(gun.shadow.camera, { left: -90, right: 90, top: 60, bottom: -60, near: 10, far: 250 });
    sahne.add(gun); golge = gun;
    kok = new THREE.Group(); sahne.add(kok);
    denizKur(); komsuKur(); illeriKur(); siluetKur(); bulutKur(); projeKat = new THREE.Group(); kok.add(projeKat);
    boyut(); window.addEventListener('resize', boyut);
    dokunma(renderer.domElement);
    kameraAyarla(true);
    renderer.setAnimationLoop(kare);
  }
  function boyut() {
    const w = renderer.domElement.parentElement.clientWidth, h = renderer.domElement.parentElement.clientHeight;
    renderer.setSize(w, h); kamera.aspect = w / h; kamera.fov = w < h ? 50 : 36; kamera.updateProjectionMatrix();
  }
  // tüm Türkiye ekrana sığsın: yatay görüş açısına göre mesafe
  function genelPoz() {
    const a = kamera.aspect || innerWidth / innerHeight, yfov = kamera.fov * Math.PI / 180;
    const hfov = 2 * Math.atan(Math.tan(yfov / 2) * a), mesafe = Math.max(90, 92 / (2 * Math.tan(hfov / 2)));
    const hedef = new THREE.Vector3(6, 0, a < 1 ? 4 : 3), yon = new THREE.Vector3(0, 0.8, 0.6).normalize();
    return [hedef, hedef.clone().add(yon.multiplyScalar(mesafe))];
  }
  function kameraAyarla() { const [h, p] = genelPoz(); kontrol.target.copy(h); kamera.position.copy(p); kontrol.update(); }
  function odakla(ad, mesafe = 50) {
    const il = iller[ad]; if (!il) return;
    const t = il.merkez.clone(), d = kamera.position.clone().sub(kontrol.target).setLength(mesafe);
    animKamera(t, t.clone().add(d));
  }
  let kamAnim = null;
  function animKamera(hedef, poz, sure = 900) { kamAnim = { t0: performance.now(), sure, h0: kontrol.target.clone(), p0: kamera.position.clone(), hedef, poz }; }
  function genel() { const [h, p] = genelPoz(); animKamera(h, p); }

  /* ---------- deniz ve ızgara ---------- */
  function denizKur() {
    const g = new THREE.PlaneGeometry(700, 500); g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#12304d', roughness: 0.6, metalness: 0.1 }));
    m.position.y = -0.05; m.receiveShadow = true; kok.add(m);
    const p = [];
    for (let lon = 10; lon <= 60; lon += 2) { const a = dunya(lon, 26, 0.02), b = dunya(lon, 50, 0.02); p.push(a, b); }
    for (let lat = 26; lat <= 50; lat += 2) { const a = dunya(10, lat, 0.02), b = dunya(60, lat, 0.02); p.push(a, b); }
    const lg = new THREE.BufferGeometry().setFromPoints(p);
    kok.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: '#2a5277', transparent: true, opacity: 0.35 })));
    V.DENIZ.forEach(d => etiket(dunya(d.lon, d.lat, 0.1), d.ad, 'deniz'));
  }
  /* ---------- komşu ülkeler ---------- */
  function komsuKur() {
    const mat = new THREE.MeshStandardMaterial({ color: '#2b3a4a', roughness: 0.95 });
    const sinir = new THREE.LineBasicMaterial({ color: '#4d6278' });
    G.ulkeler.forEach(u => {
      const kibris = u.ad === 'N. Cyprus';
      u.p.forEach(r => {
        const s = new THREE.Shape(r.map(([lon, lat]) => new THREE.Vector2(...xy(lon, lat))));
        const g = new THREE.ExtrudeGeometry(s, { depth: kibris ? 0.5 : 0.25, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
        const m = new THREE.Mesh(g, kibris ? new THREE.MeshStandardMaterial({ color: '#5c4a3a', roughness: 0.9 }) : mat);
        m.receiveShadow = true; kok.add(m);
        const lp = r.map(([lon, lat]) => dunya(lon, lat, kibris ? 0.52 : 0.27));
        kok.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(lp), sinir));
      });
      if (V.ULKE_ETIKET.includes(u.ad)) {
        const en = u.p.reduce((a, r) => r.length > a.length ? r : a, u.p[0]);
        let [cx, cy] = merkezBul(en);
        if (u.ad === 'Russia') { cx = 42; cy = 45.2; } if (u.ad === 'Iran') { cx = 49; cy = 36.5; } if (u.ad === 'Iraq') { cx = 43.6; cy = 34.6; }
        if (u.ad === 'Ukraine') { cx = 32.5; cy = 46.8; } if (u.ad === 'Greece') { cx = 22.3; cy = 39.6; }
        etiket(dunya(cx, cy, 0.4), V.ULKE_AD[u.ad] || u.ad, 'ulke');
      }
    });
  }
  function merkezBul(r) {
    let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < r.length - 1; i++) { const f = r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1]; a += f; cx += (r[i][0] + r[i + 1][0]) * f; cy += (r[i][1] + r[i + 1][1]) * f; }
    a *= 0.5; return a ? [cx / (6 * a), cy / (6 * a)] : r[0];
  }
  /* ---------- iller ---------- */
  const DUZELT = { 'İstanbul': [28.95, 41.05], 'İzmir': [27.2, 38.45], 'Antalya': [30.7, 36.95], 'Muğla': [28.4, 37.2], 'Çanakkale': [26.85, 40.05], 'Hatay': [36.2, 36.3], 'Mersin': [34.0, 36.85] };
  const BUYUK = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Konya', 'Adana', 'Samsun', 'Trabzon', 'Erzurum', 'Diyarbakır', 'Gaziantep', 'Van', 'Kayseri', 'Eskişehir', 'Sivas', 'Malatya'];
  function illeriKur() {
    G.iller.forEach(il => {
      const mat = new THREE.MeshStandardMaterial({ color: '#5d6b7a', roughness: 0.75, metalness: 0.05, flatShading: true });
      const grup = new THREE.Group(); grup.userData.il = il.ad;
      il.p.forEach(r => {
        const s = new THREE.Shape(r.map(([lon, lat]) => new THREE.Vector2(...xy(lon, lat))));
        const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
        const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; m.userData.il = il.ad; grup.add(m);
        const lp = r.map(([lon, lat]) => dunya(lon, lat, 1.002));
        grup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(lp), new THREE.LineBasicMaterial({ color: '#0d1b2a', transparent: true, opacity: 0.55 })));
      });
      grup.scale.y = 0.6; kok.add(grup);
      const [cx, cy] = DUZELT[il.ad] || merkezBul(il.p[0]);
      const sec = window.SECIM2002[il.ad] || { top: 0 };
      const e = etiket(dunya(cx, cy, 0.6), il.ad, BUYUK.includes(il.ad) ? 'il buyuk' : 'il'); e.il = il.ad;
      iller[il.ad] = { grup, mat, merkez: dunya(cx, cy, 0), lon: cx, lat: cy, h: 0.6, hedefH: 0.6, renk: new THREE.Color('#5d6b7a'), hedefRenk: new THREE.Color('#5d6b7a'), etiket: e, secmen: sec.top };
    });
  }
  // il yükseklik ve rengini ayarla; ani = animasyonsuz
  function ilAyarla(ad, renk, h, ani) {
    const il = iller[ad]; if (!il) return;
    il.hedefRenk.set(renk); il.hedefH = h;
    if (ani) { il.renk.copy(il.hedefRenk); il.h = h; il.mat.color.copy(il.renk); il.grup.scale.y = h; }
  }
  function seciliYap(ad) {
    if (secili && iller[secili]) iller[secili].mat.emissive.set('#000000');
    secili = ad; if (ad && iller[ad]) iller[ad].mat.emissive.set('#3a2a00');
  }

  /* ---------- şehir silüetleri ve geceleri ışıklar ---------- */
  const BINA_MAT = new THREE.MeshStandardMaterial({ color: '#e6e1d6', roughness: 0.7, flatShading: true });
  const GOKDELEN_MAT = new THREE.MeshStandardMaterial({ color: '#9fb6c8', roughness: 0.25, metalness: 0.4, flatShading: true });
  const ISIK_MAT = new THREE.MeshBasicMaterial({ color: '#ffcf6a', transparent: true, opacity: 0 });
  const KUTU = new THREE.BoxGeometry(1, 1, 1); KUTU.translate(0, 0.5, 0);
  const ISIK = new THREE.BoxGeometry(0.09, 0.09, 0.09);
  const siluetler = [];
  function siluetKur() {
    let tohum = 11; const r = () => { tohum = (tohum * 16807) % 2147483647; return (tohum - 1) / 2147483646; };
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = new THREE.Vector3(), pv = new THREE.Vector3();
    Object.entries(iller).forEach(([ad, il]) => {
      const sec = il.secmen || 100000, n = Math.round(Math.max(4, Math.min(90, sec / 55000))), metro = sec > 1500000;
      const g = new THREE.Group(); g.position.copy(il.merkez); g.userData.il = ad;
      const bina = new THREE.InstancedMesh(KUTU, BINA_MAT, n), gok = metro ? new THREE.InstancedMesh(KUTU, GOKDELEN_MAT, 14) : null, isik = new THREE.InstancedMesh(ISIK, ISIK_MAT, n * 2);
      const yaricap = 0.45 + Math.sqrt(n) * 0.2;
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * yaricap, w = 0.2 + r() * 0.18;
        const h = (0.3 + r() * 0.55) * (1 + (1 - d / yaricap) * (metro ? 1.8 : 0.9));
        pv.set(Math.cos(a) * d, 0, Math.sin(a) * d); sv.set(w, h, w); m.compose(pv, q, sv); bina.setMatrixAt(i, m);
        for (let j = 0; j < 2; j++) { m.makeTranslation(pv.x + (r() - 0.5) * w, h * (0.3 + r() * 0.6), pv.z + w / 2 + 0.01); isik.setMatrixAt(i * 2 + j, m); }
      }
      if (gok) for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = r() * 0.45; pv.set(Math.cos(a) * d + 0.2, 0, Math.sin(a) * d - 0.1); sv.set(0.22, 1.4 + r() * 2.2, 0.22); m.compose(pv, q, sv); gok.setMatrixAt(i, m); }
      bina.castShadow = true; g.add(bina); if (gok) { gok.castShadow = true; g.add(gok); } g.add(isik);
      kok.add(g); siluetler.push({ g, il });
    });
  }
  // bulutlar: yavaşça doğuya süzülür
  const bulutlar = [];
  function bulutKur() {
    const mat = new THREE.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: 0.55 });
    for (let i = 0; i < 9; i++) {
      const g = new THREE.Group();
      for (let j = 0; j < 4; j++) { const s = new THREE.Mesh(new THREE.SphereGeometry(2.4 + Math.random() * 2, 10, 8), mat); s.position.set(j * 2.6 - 4, Math.random(), Math.random() * 2); s.scale.y = 0.45; g.add(s); }
      g.position.set(-90 + Math.random() * 170, 16 + Math.random() * 6, -45 + Math.random() * 80); g.userData.hiz = 0.6 + Math.random() * 0.8;
      kok.add(g); bulutlar.push(g);
    }
  }
  // mevsim: kışın Doğu ve yüksek iller karlı
  function mevsim(ay) { kar = ay === 11 || ay <= 1 ? 1 : ay === 2 || ay === 10 ? 0.45 : 0; }

  /* ---------- etiketler (HTML) ---------- */
  function etiket(poz, metin, sinif) {
    const el = document.createElement('div'); el.className = 'etk ' + sinif; el.textContent = metin; etiketKat.appendChild(el);
    const e = { poz, el, sinif }; etiketler.push(e); return e;
  }
  const v3 = new THREE.Vector3();
  function etiketGuncelle() {
    const w = renderer.domElement.clientWidth, h = renderer.domElement.clientHeight, uzak = kamera.position.distanceTo(kontrol.target);
    etiketler.forEach(e => {
      v3.copy(e.poz); if (e.il) v3.y = iller[e.il].h + 0.3;
      v3.project(kamera);
      const gor = v3.z < 1 && Math.abs(v3.x) < 1.1 && Math.abs(v3.y) < 1.1 &&
        (e.sinif.indexOf('il') !== 0 || e.sinif === 'il buyuk' && uzak < 230 || uzak < 80);
      if (!gor) { if (e.gor !== false) { e.el.style.display = 'none'; e.gor = false; } return; }
      if (e.gor !== true) { e.el.style.display = ''; e.gor = true; }
      e.el.style.transform = `translate(${(v3.x * 0.5 + 0.5) * w}px,${(-v3.y * 0.5 + 0.5) * h}px) translate(-50%,-50%)`;
    });
  }

  /* ---------- projeler ---------- */
  const projeler = {}; // anahtar -> grup
  const MAT = {
    beyaz: new THREE.MeshStandardMaterial({ color: '#eef1f4', roughness: 0.6, flatShading: true }),
    cam: new THREE.MeshStandardMaterial({ color: '#7fb6e6', roughness: 0.2, metalness: 0.3, flatShading: true }),
    kirmizi: new THREE.MeshStandardMaterial({ color: '#e63946', roughness: 0.5 }),
    gri: new THREE.MeshStandardMaterial({ color: '#8f9aa6', roughness: 0.8, flatShading: true }),
    asfalt: new THREE.MeshStandardMaterial({ color: '#3b3f46', roughness: 0.9 }),
    yol: new THREE.MeshStandardMaterial({ color: '#ffd166', emissive: '#7a5a00', roughness: 0.5 }),
    ray: new THREE.MeshStandardMaterial({ color: '#ff6b35', emissive: '#a33a10', roughness: 0.4 }),
    tugla: new THREE.MeshStandardMaterial({ color: '#c96f4a', roughness: 0.8, flatShading: true }),
    insaat: new THREE.MeshStandardMaterial({ color: '#ffb703', roughness: 0.6, transparent: true, opacity: 0.85 })
  };
  const kutu = (w, h, d, m, x = 0, y = 0, z = 0) => { const k = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); k.position.set(x, y + h / 2, z); k.castShadow = true; return k; };
  const MODEL = {
    toki() { const g = new THREE.Group(); [[-0.5, 2.2, -0.3], [0.4, 2.8, -0.4], [0, 1.8, 0.5], [-0.6, 1.5, 0.6], [0.7, 2.0, 0.5]].forEach(([x, h, z]) => g.add(kutu(0.45, h, 0.45, MAT.beyaz, x, 0, z))); return g; },
    hastane() { const g = new THREE.Group(); g.add(kutu(1.6, 1, 0.9, MAT.beyaz)); g.add(kutu(0.6, 1.6, 0.6, MAT.beyaz, 0, 0, 0)); g.add(kutu(0.5, 0.15, 0.15, MAT.kirmizi, 0, 1.65, 0.31)); g.add(kutu(0.15, 0.5, 0.15, MAT.kirmizi, 0, 1.5, 0.31)); return g; },
    univ() {
      const g = new THREE.Group(); g.add(kutu(1.8, 0.8, 1, MAT.tugla));
      const k = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), MAT.beyaz); k.position.y = 0.8; g.add(k);
      for (let i = -2; i <= 2; i++) g.add(kutu(0.1, 0.8, 0.1, MAT.beyaz, i * 0.35, 0, 0.55)); return g;
    },
    havalimani() {
      const g = new THREE.Group(); g.add(kutu(3.2, 0.05, 0.5, MAT.asfalt)); g.add(kutu(1.2, 0.5, 0.6, MAT.cam, 0.4, 0, 0.8));
      g.add(kutu(0.18, 1.4, 0.18, MAT.gri, -0.6, 0, 0.8)); g.add(kutu(0.34, 0.25, 0.34, MAT.cam, -0.6, 1.4, 0.8)); return g;
    },
    marmaray() { const g = new THREE.Group(); g.add(kutu(0.7, 0.9, 0.7, MAT.cam)); g.add(kutu(0.9, 0.12, 0.9, MAT.ray, 0, 0.9, 0)); return g; },
    yht() { const g = new THREE.Group(); g.add(kutu(1.4, 0.35, 0.35, MAT.beyaz)); g.add(kutu(1.4, 0.06, 0.37, MAT.kirmizi, 0, 0.18, 0)); return g; },
    yol() { const g = new THREE.Group(); g.add(kutu(0.6, 0.3, 0.6, MAT.yol)); return g; },
    okul() { return MODEL.univ(); }, terminal() { return MODEL.havalimani(); }, esenboga() { return MODEL.havalimani(); }, antalya() { return MODEL.havalimani(); },
    metrobus() { const g = new THREE.Group(); g.add(kutu(2.4, 0.05, 0.4, MAT.asfalt)); g.add(kutu(0.9, 0.35, 0.3, MAT.kirmizi, 0.3, 0.05, 0)); return g; },
    kartal() { return MODEL.marmaray(); }, izban() { return MODEL.yht(); }, yhtkonya() { return MODEL.yht(); }, sahilyolu() { return MODEL.yol(); },
    osb() { const g = new THREE.Group(); [[-0.5, 0.6], [0.4, 0.8]].forEach(([x, h]) => g.add(kutu(0.8, h, 0.7, MAT.gri, x, 0, 0))); g.add(kutu(0.15, 1.6, 0.15, MAT.tugla, 0.75, 0, -0.2)); return g; },
    gap() { const g = new THREE.Group(); g.add(kutu(2.6, 0.06, 0.25, MAT.cam)); g.add(kutu(0.25, 0.06, 1.8, MAT.cam, 0.8, 0, 0)); return g; },
    ilisu() { const g = new THREE.Group(); g.add(kutu(2.2, 0.9, 0.4, MAT.gri)); g.add(kutu(2.2, 0.05, 1.4, MAT.cam, 0, 0, -0.9)); return g; },
    universiade() { const g = new THREE.Group(); g.add(kutu(0.4, 1.8, 0.4, MAT.beyaz)); g.add(kutu(0.3, 0.08, 1.6, MAT.beyaz, 0, 1.4, 0.7)); return g; },
    insaat() {
      const g = new THREE.Group(); g.add(kutu(0.12, 2.4, 0.12, MAT.insaat)); g.add(kutu(1.8, 0.1, 0.1, MAT.insaat, 0.6, 2.4, 0));
      const ip = kutu(0.03, 0.8, 0.03, MAT.gri, 1.3, 1.6, 0); g.add(ip); g.add(kutu(0.9, 0.6, 0.9, MAT.gri, 0.3, 0, 0.4)); return g;
    }
  };
  // bağlantılı projeler için yol/ray hattı
  function hat(a, b, mat, yuk, kalin = 0.22) {
    const pa = a.clone(), pb = b.clone(), orta = pa.clone().lerp(pb, 0.5); orta.y += yuk;
    const egri = new THREE.QuadraticBezierCurve3(pa, orta, pb);
    const m = new THREE.Mesh(new THREE.TubeGeometry(egri, 24, kalin, 6, false), mat); m.castShadow = true; return m;
  }
  function enYakin(ad, n) {
    const m = iller[ad].merkez;
    return Object.entries(iller).filter(([k]) => k !== ad).sort((a, b) => a[1].merkez.distanceTo(m) - b[1].merkez.distanceTo(m)).slice(0, n).map(([k]) => k);
  }
  function projeleriCiz(liste) {
    const var_ = new Set();
    liste.forEach((p, i) => {
      const anahtar = p.tip + '|' + p.il + '|' + (p.bitti ? 1 : 0); var_.add(anahtar);
      if (projeler[anahtar]) return;
      const eski = projeler[p.tip + '|' + p.il + '|0']; if (eski && p.bitti) { projeKat.remove(eski); delete projeler[p.tip + '|' + p.il + '|0']; }
      const il = iller[p.il]; if (!il) return;
      const g = new THREE.Group(), P = V.PROJE[p.tip];
      const ayni = liste.filter(q => q.il === p.il).indexOf(p), aci = ayni * 2.1;
      const off = new THREE.Vector3(Math.cos(aci) * 1.6 * Math.min(1, ayni), 0, Math.sin(aci) * 1.6 * Math.min(1, ayni));
      const yerel = il.merkez.clone().add(off);
      const model = p.bitti ? MODEL[p.tip]() : MODEL.insaat(); model.position.copy(yerel); model.userData.il = p.il; g.add(model);
      if (p.bitti && P.bag) enYakin(p.il, 2).forEach(k => g.add(hat(il.merkez, iller[k].merkez, MAT.yol, 0.4, 0.18)));
      if (p.bitti && P.bagIl && iller[P.bagIl]) g.add(hat(il.merkez, iller[P.bagIl].merkez, p.tip === 'sahilyolu' ? MAT.yol : MAT.ray, p.tip === 'sahilyolu' ? 0.5 : 3, 0.28));
      if (p.bitti && p.tip === 'marmaray') g.add(hat(dunya(28.9, 41.0), dunya(29.06, 41.0), MAT.ray, -0.6, 0.25));
      g.userData = { il: p.il, model };
      projeKat.add(g); projeler[anahtar] = g;
    });
    Object.keys(projeler).forEach(k => { if (!var_.has(k)) { projeKat.remove(projeler[k]); delete projeler[k]; } });
  }

  /* ---------- mitingler: sahne, kalabalık, bayraklar ---------- */
  const mitingler = {};
  const INSAN = new THREE.CylinderGeometry(0.07, 0.09, 0.32, 5); INSAN.translate(0, 0.16, 0);
  const KALABALIK_RENK = ['#f2f2f2', '#e30a17', '#f2a516', '#2b4c7e', '#3b3b3b', '#c9b48a'].map(c => new THREE.Color(c));
  function mitingModel(guc) {
    const g = new THREE.Group(), n = Math.round(60 + guc * 25);
    const im = new THREE.InstancedMesh(INSAN, new THREE.MeshStandardMaterial({ roughness: 0.8 }), n), m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      const r = 0.5 + Math.sqrt(Math.random()) * (1.1 + guc * 0.12), a = -Math.PI * 0.15 + Math.random() * Math.PI * 1.3;
      m.makeTranslation(Math.cos(a) * r, 0, Math.sin(a) * r + 0.2); im.setMatrixAt(i, m); im.setColorAt(i, KALABALIK_RENK[(Math.random() * KALABALIK_RENK.length) | 0]);
    }
    im.castShadow = true; g.add(im);
    g.add(kutu(1.4, 0.35, 0.5, MAT.beyaz, 0, 0, -0.55)); g.add(kutu(1.4, 0.5, 0.06, new THREE.MeshStandardMaterial({ color: '#f2a516', emissive: '#6b4300' }), 0, 0.35, -0.78));
    [-0.9, 0.9].forEach(x => { g.add(kutu(0.04, 1.2, 0.04, MAT.gri, x, 0, -0.6)); g.add(kutu(0.4, 0.26, 0.02, MAT.kirmizi, x + 0.2, 0.92, -0.6)); });
    return g;
  }
  function mitingCiz(liste) {
    Object.keys(mitingler).forEach(il => { if (!liste[il] || liste[il] < 0.6) { projeKat.remove(mitingler[il]); delete mitingler[il]; } });
    Object.entries(liste).forEach(([il, guc]) => {
      if (guc < 0.6 || !iller[il]) return;
      const eski = mitingler[il]; if (eski && Math.abs(eski.userData.guc - guc) < 1.5) return;
      if (eski) projeKat.remove(eski);
      const g = new THREE.Group(), model = mitingModel(guc); model.position.copy(iller[il].merkez).add(new THREE.Vector3(0.6, 0, 0.8));
      g.add(model); g.userData = { il, model, guc }; projeKat.add(g); mitingler[il] = g;
    });
  }

  /* ---------- dokunma ---------- */
  function dokunma(el) {
    let bas = null;
    el.addEventListener('pointerdown', e => { bas = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    el.addEventListener('pointerup', e => {
      if (!bas) return; const d = Math.hypot(e.clientX - bas.x, e.clientY - bas.y); bas = null;
      if (d > 8) return;
      const r = el.getBoundingClientRect();
      ray.setFromCamera({ x: (e.clientX - r.left) / r.width * 2 - 1, y: -(e.clientY - r.top) / r.height * 2 + 1 }, kamera);
      const h = ray.intersectObjects(kok.children, true).find(x => x.object.userData.il || (x.object.parent && x.object.parent.userData.il));
      const ad = h ? (h.object.userData.il || h.object.parent.userData.il) : null;
      if (secCb) secCb(ad);
    });
  }

  /* ---------- döngü ---------- */
  let son = performance.now(), dondur = 0, saatOfs = 0;
  function kare(t) {
    const dt = Math.min(0.05, (t - son) / 1000); son = t;
    if (kamAnim) {
      const k = Math.min(1, (t - kamAnim.t0) / kamAnim.sure), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      kontrol.target.lerpVectors(kamAnim.h0, kamAnim.hedef, e); kamera.position.lerpVectors(kamAnim.p0, kamAnim.poz, e);
      if (k >= 1) kamAnim = null;
    }
    kontrol.update();
    const tx = Math.max(-70, Math.min(80, kontrol.target.x)), tz = Math.max(-45, Math.min(45, kontrol.target.z));
    if (tx !== kontrol.target.x || tz !== kontrol.target.z) { const d = new THREE.Vector3(tx - kontrol.target.x, 0, tz - kontrol.target.z); kontrol.target.add(d); kamera.position.add(d); }
    // gece-gündüz: 4 dakikalık döngü
    const aci = ((t + saatOfs) / 240000) * Math.PI * 2, gunes = Math.sin(aci), gece = Math.max(0, Math.min(1, (0.15 - gunes) / 0.5));
    golge.position.set(Math.cos(aci) * 90, Math.max(12, gunes * 90 + 20), 45); golge.intensity = 0.25 + Math.max(0, gunes) * 0.75;
    golge.color.setHSL(0.1, 0.5 + 0.3 * (1 - Math.abs(gunes)), 0.85); hemi.intensity = 0.35 + 0.45 * (1 - gece);
    sahne.background.copy(GUNDUZ).lerp(GECE, gece); sahne.fog.color.copy(sahne.background); ISIK_MAT.opacity = gece * 0.95;
    Object.values(iller).forEach(il => {
      if (Math.abs(il.h - il.hedefH) > 0.002) { il.h += (il.hedefH - il.h) * Math.min(1, dt * 4); il.grup.scale.y = il.h; }
      il.renk.lerp(il.hedefRenk, Math.min(1, dt * 4)); il.mat.color.copy(il.renk);
      if (kar) { const e = Math.max(0, Math.min(1, (il.lon - 31) / 12)) * 0.75 + Math.max(0, (il.lat - 39.5) / 3) * 0.3; if (e > 0.05) il.mat.color.lerp(KAR, Math.min(0.85, kar * e)); }
    });
    siluetler.forEach(s => { s.g.position.y = s.il.h; });
    bulutlar.forEach(b => { b.position.x += b.userData.hiz * dt; if (b.position.x > 100) b.position.x = -100; });
    dondur += dt;
    projeKat.children.forEach(g => {
      const il = iller[g.userData.il]; if (il) g.userData.model.position.y = il.h;
      g.children.forEach(c => { if (c !== g.userData.model) c.position.y = il ? il.h : 0; });
    });
    renderer.render(sahne, kamera);
    etiketGuncelle();
  }

  return { kur, ilAyarla, iller, seciliYap, odakla, genel, projeleriCiz, mitingCiz, boyut, mevsim, _saat: ms => { saatOfs = ms; } };
})();
