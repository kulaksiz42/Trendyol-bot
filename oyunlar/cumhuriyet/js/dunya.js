/* Cumhuriyet: Sıfırdan — 3D dünya: gerçek arazi, yollar, imar, binalar, simge yapılar, gün ışığı. */
'use strict';
window.Dunya = (function () {
  const A = window.ARAZI, V = window.VERI, N = A.n, B = A.boyut, HUC = B / (N - 1), YUK = 1.6, Z = 1.6;
  const ham = new Uint16Array(Uint8Array.from(atob(A.h), c => c.charCodeAt(0)).buffer);
  const dereSet = new Set(A.dere);
  let renderer, sahne, kamera, kontrol, gunes, hemi, arazi, araziRenk, kok, ray = new THREE.Raycaster();
  const ME = THREE.BufferGeometryUtils;

  /* ---------- arazi örnekleme ---------- */
  function hucreH(c, r) { c = Math.max(0, Math.min(N - 1, c)); r = Math.max(0, Math.min(N - 1, r)); return ham[r * N + c] / 10 / 10 * YUK; }
  function yukseklik(x, z) {
    const fx = (x + B / 2) / HUC, fz = (z + B / 2) / HUC, c = Math.floor(fx), r = Math.floor(fz), ax = fx - c, az = fz - r;
    return hucreH(c, r) * (1 - ax) * (1 - az) + hucreH(c + 1, r) * ax * (1 - az) + hucreH(c, r + 1) * (1 - ax) * az + hucreH(c + 1, r + 1) * ax * az;
  }
  function egim(x, z) { const d = 1.5; return Math.hypot(yukseklik(x + d, z) - yukseklik(x - d, z), yukseklik(x, z + d) - yukseklik(x, z - d)) / (2 * d); }
  function dereMi(x, z, pay = 0) {
    const c = Math.round((x + B / 2) / HUC), r = Math.round((z + B / 2) / HUC);
    for (let a = -pay; a <= pay; a++) for (let b = -pay; b <= pay; b++) if (dereSet.has((r + b) * N + c + a)) return true;
    return false;
  }

  /* ---------- kurulum ---------- */
  function kur(kap) {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.85;
    kap.appendChild(renderer.domElement);
    sahne = new THREE.Scene(); sahne.background = new THREE.Color('#9cc3e0'); sahne.fog = new THREE.Fog('#c9dcea', 700, 1700);
    kamera = new THREE.PerspectiveCamera(45, 1, 0.3, 2500);
    kontrol = new THREE.MapControls(kamera, renderer.domElement);
    Object.assign(kontrol, { enableDamping: true, dampingFactor: 0.09, screenSpacePanning: false, minDistance: 4, maxDistance: 650, maxPolarAngle: 1.47, rotateSpeed: 0.6, zoomSpeed: 1.1 });
    hemi = new THREE.HemisphereLight('#dbe9f7', '#7a6a50', 0.55); sahne.add(hemi);
    gunes = new THREE.DirectionalLight('#fff1d8', 1.6); gunes.castShadow = true; gunes.shadow.mapSize.set(2048, 2048); gunes.shadow.bias = -0.0004; gunes.shadow.normalBias = 0.03;
    sahne.add(gunes); sahne.add(gunes.target);
    kok = new THREE.Group(); sahne.add(kok);
    araziKur(); agaclarKur(); simgelerKur(); eskiKasabaKur();
    yolKat = new THREE.Group(); kok.add(yolKat);
    boyut(); window.addEventListener('resize', boyut);
    const u = V.BASLANGIC.meclis1; kontrol.target.set(u.x + 10, yukseklik(u.x, u.z), u.z + 20); kamera.position.set(u.x + 10, yukseklik(u.x, u.z) + 120, u.z + 160); kontrol.update();
  }
  function boyut() { const p = renderer.domElement.parentElement, w = p.clientWidth, h = p.clientHeight; renderer.setSize(w, h); kamera.aspect = w / h; kamera.updateProjectionMatrix(); }

  /* ---------- arazi ve mevsim ---------- */
  const RENK = {
    bozkir: [new THREE.Color('#a48c5e'), new THREE.Color('#8c9e4e'), new THREE.Color('#b39457'), new THREE.Color('#9a7849'), new THREE.Color('#e9eef2')], // kış, ilkbahar, yaz, sonbahar, kar
    vadi: [new THREE.Color('#8f8a5f'), new THREE.Color('#6f9a4a'), new THREE.Color('#9b9a58'), new THREE.Color('#8e7a4a'), new THREE.Color('#e3e9ee')],
    tepe: [new THREE.Color('#948263'), new THREE.Color('#7f8c54'), new THREE.Color('#a38a5d'), new THREE.Color('#8c7452'), new THREE.Color('#f2f5f7')],
    su: new THREE.Color('#4f7f9c')
  };
  let mevsimNo = 2, karVar = 0;
  function araziKur() {
    const g = new THREE.PlaneGeometry(B, B, N - 1, N - 1); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const c = i % N, r = Math.floor(i / N); p.setY(i, hucreH(c, r)); }
    g.computeVertexNormals();
    araziRenk = new Float32Array(p.count * 3); g.setAttribute('color', new THREE.BufferAttribute(araziRenk, 3));
    arazi = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, flatShading: false }));
    arazi.receiveShadow = true; kok.add(arazi);
    // haritanın dışı: uzaklara uzanan bozkır
    const dis = new THREE.Mesh(new THREE.RingGeometry(B * 0.7, B * 3, 48), new THREE.MeshStandardMaterial({ color: '#a89670', roughness: 1 }));
    dis.rotation.x = -Math.PI / 2; dis.position.y = 0; kok.add(dis);
    mevsimBoya(2);
  }
  function mevsimBoya(m) {
    mevsimNo = m; const hmax = Math.max(...ham) / 100 * YUK, nor = arazi.geometry.attributes.normal, c = new THREE.Color();
    for (let i = 0; i < N * N; i++) {
      const col = i % N, row = Math.floor(i / N), h = hucreH(col, row) / hmax, dik = 1 - nor.getY(i);
      const tur = h < 0.18 ? 'vadi' : h > 0.55 ? 'tepe' : 'bozkir';
      c.copy(RENK[tur][m]); if (dik > 0.05) c.lerp(new THREE.Color('#8a7a62'), Math.min(0.5, dik * 3));
      if (m === 0 && karVar) c.lerp(RENK[tur][4], Math.min(1, karVar * (0.5 + h)));
      if (dereSet.has(i)) c.copy(RENK.su);
      else if (dereSet.has(i + 1) || dereSet.has(i - 1) || dereSet.has(i + N) || dereSet.has(i - N)) c.lerp(new THREE.Color(m === 0 ? '#8a8f6a' : '#5f8a45'), 0.6);
      const k = 0.94 + ((i * 7919) % 13) / 100; araziRenk[i * 3] = c.r * k; araziRenk[i * 3 + 1] = c.g * k; araziRenk[i * 3 + 2] = c.b * k;
    }
    arazi.geometry.attributes.color.needsUpdate = true;
  }
  function mevsim(ay) { const m = ay === 11 || ay <= 1 ? 0 : ay <= 4 ? 1 : ay <= 8 ? 2 : 3, k = ay === 0 || ay === 1 ? 1 : ay === 11 ? 0.5 : 0; if (m !== mevsimNo || k !== karVar) { karVar = k; mevsimBoya(m); agacMevsim(m); } }

  // dere boyunca kavak ve söğüt, bozkırda seyrek ağaç
  let agac, agacMat;
  function agaclarKur() {
    const pos = [];
    A.dere.forEach((i, k) => { if (k % 2) return; const c = i % N, r = Math.floor(i / N); for (let j = 0; j < 2; j++) { const x = c * HUC - B / 2 + (Math.random() - 0.5) * 6, z = r * HUC - B / 2 + (Math.random() - 0.5) * 6; if (!dereMi(x, z)) pos.push([x, z, 1.2 + Math.random()]); } });
    for (let i = 0; i < 260; i++) { const x = (Math.random() - 0.5) * B * 0.95, z = (Math.random() - 0.5) * B * 0.95; if (!dereMi(x, z, 1) && egim(x, z) < 0.25) pos.push([x, z, 0.7 + Math.random() * 0.5]); }
    const g = ME.mergeBufferGeometries([parca(new THREE.CylinderGeometry(0.07, 0.1, 0.8, 5).translate(0, 0.4, 0), '#6b5236'), parca(new THREE.ConeGeometry(0.45, 2.2, 7).translate(0, 1.7, 0), '#ffffff')]);
    agacMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 });
    agac = new THREE.InstancedMesh(g, agacMat, pos.length); const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3();
    pos.forEach(([x, z, k], i) => { v.set(x, yukseklik(x, z), z); s.set(k, k * (0.9 + Math.random() * 0.4), k); m.compose(v, q, s); agac.setMatrixAt(i, m); agac.setColorAt(i, new THREE.Color('#4f7a38')); });
    agac.castShadow = true; agac.userData.yer = pos; kok.add(agac);
  }
  function agacMevsim(m) { const r = ['#7d7f6a', '#5e8f3c', '#4f7a38', '#b8862f'][m]; for (let i = 0; i < agac.count; i++) agac.setColorAt(i, new THREE.Color(r).offsetHSL((i % 7) * 0.008, 0, (i % 5) * 0.015)); agac.instanceColor.needsUpdate = true; }

  /* ---------- model yardımcıları ---------- */
  function parca(geo, renk) {
    geo = geo.index ? geo : geo; const c = new THREE.Color(renk), n = geo.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
    geo.setAttribute('color', new THREE.BufferAttribute(a, 3)); if (geo.attributes.uv) geo.deleteAttribute('uv'); return geo;
  }
  const kutuG = (w, h, d, renk, x = 0, y = 0, z = 0) => parca(new THREE.BoxGeometry(w, h, d).translate(x, y + h / 2, z), renk);
  const catiG = (w, d, h, renk, y) => { const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4); g.scale(w, h, d); return parca(g.translate(0, y + h / 2, 0), renk); };
  const silG = (r1, r2, h, renk, x = 0, y = 0, z = 0, s = 10) => parca(new THREE.CylinderGeometry(r1, r2, h, s).translate(x, y + h / 2, z), renk);
  const kubbeG = (r, renk, x, y, z) => parca(new THREE.SphereGeometry(r, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2).translate(x, y, z), renk);
  // pencere bantları: katları belli eder
  function katlar(w, d, kat, katH, renk, koyu) {
    const L = [kutuG(w, kat * katH, d, renk)];
    for (let k = 0; k < kat; k++) L.push(kutuG(w * 1.01, katH * 0.28, d * 1.01, koyu, 0, k * katH + katH * 0.38, 0));
    return L;
  }
  const MODEL = {
    // konut: kerpiç → kâgir → apartman → site
    R1: () => [kutuG(0.9, 0.33, 0.78, '#c9a679'), catiG(1.05, 0.92, 0.28, '#a5482f', 0.33), kutuG(0.14, 0.2, 0.02, '#5a3b22', 0.2, 0, 0.4)],
    R2: () => [...katlar(1.0, 0.85, 2, 0.32, '#eadcc0', '#9a8a70'), catiG(1.14, 0.98, 0.3, '#b3532f', 0.64)],
    R3: () => [...katlar(1.1, 1.0, 4, 0.3, '#efe6d3', '#8d8576'), kutuG(1.12, 0.06, 1.02, '#cfc4ae', 0, 1.2, 0), kutuG(0.25, 0.25, 0.25, '#b9ab90', 0.3, 1.26, 0.2)],
    R4: () => [...katlar(1.15, 1.05, 6, 0.3, '#e6d9c4', '#857d6f'), kutuG(1.17, 0.06, 1.07, '#c9bea9', 0, 1.8, 0)],
    R5: () => [...katlar(1.2, 1.1, 9, 0.3, '#dcd7cf', '#7f8186'), kutuG(0.4, 0.4, 0.4, '#b6b2aa', 0.2, 2.7, 0)],
    R6: () => [...katlar(1.0, 1.0, 18, 0.3, '#d3dae1', '#6f8191'), kutuG(1.02, 0.15, 1.02, '#9fb0bf', 0, 5.4, 0)],
    Rk3: () => [...katlar(1.3, 1.2, 5, 0.3, '#f1e4cc', '#8a826f')], Rk4: () => [...katlar(1.35, 1.25, 8, 0.3, '#e8dcc8', '#7d786c')],
    Rk5: () => [...katlar(1.35, 1.25, 12, 0.3, '#dfdcd6', '#787c82')], Rk6: () => [...katlar(1.1, 1.1, 24, 0.3, '#cfd8df', '#617486')],
    // ticaret: dükkân → çarşı → işhanı → plaza
    C1: () => [kutuG(0.95, 0.36, 0.8, '#e5cfa6'), kutuG(0.95, 0.04, 0.25, '#b8362b', 0, 0.3, 0.48), catiG(1.05, 0.9, 0.22, '#9e4b31', 0.36)],
    C2: () => [...katlar(1.0, 0.85, 2, 0.34, '#e9d8b4', '#8c7b5e'), kutuG(1.0, 0.04, 0.25, '#2f7d5a', 0, 0.3, 0.5)],
    C3: () => [...katlar(1.15, 1.0, 4, 0.32, '#d8c7a5', '#6f6a5f'), kutuG(1.16, 0.05, 0.3, '#8a2f2f', 0, 0.32, 0.55)],
    C4: () => [...katlar(1.2, 1.05, 6, 0.32, '#b3c4d1', '#4f6475')],
    C5: () => [...katlar(1.2, 1.1, 10, 0.32, '#9fb6c8', '#3f566a')], C6: () => [...katlar(1.1, 1.1, 20, 0.32, '#8eaac2', '#33485c')],
    // sanayi: atölye → fabrika
    I1: () => [kutuG(1.15, 0.42, 1.0, '#9c9284'), catiG(1.25, 1.1, 0.2, '#6f6a62', 0.42)],
    I2: () => [kutuG(1.2, 0.55, 1.05, '#8f8a82'), silG(0.08, 0.1, 1.3, '#7a5a48', 0.4, 0, -0.3)],
    I3: () => [kutuG(1.25, 0.7, 1.1, '#878a8f'), silG(0.1, 0.12, 1.6, '#6d4e3e', 0.45, 0, -0.35), kutuG(0.5, 0.25, 0.5, '#9a9da2', -0.3, 0.7, 0.2)],
    I4: () => [kutuG(1.3, 0.8, 1.15, '#7e8590'), silG(0.1, 0.12, 1.9, '#5f4a3d', 0.5, 0, -0.4)],
    I5: () => [kutuG(1.3, 0.9, 1.2, '#9aa1aa'), kutuG(1.3, 0.1, 1.2, '#5d6f7f', 0, 0.9, 0)], I6: () => [kutuG(1.3, 1.0, 1.2, '#a7aeb6'), kutuG(1.3, 0.1, 1.2, '#4f6070', 0, 1.0, 0)],
    // hizmetler
    okul: () => [...katlar(2.2, 1.0, 2, 0.34, '#efe1c0', '#8a7d62'), catiG(2.4, 1.15, 0.3, '#a9472f', 0.68), silG(0.02, 0.02, 1.4, '#cccccc', 1.3, 0, 0.6), kutuG(0.02, 0.18, 0.28, '#d22b2b', 1.3, 1.2, 0.74)],
    lise: () => [...katlar(2.6, 1.4, 3, 0.34, '#e8d6b0', '#83755a'), catiG(2.8, 1.55, 0.35, '#a9472f', 1.02)],
    saglik: () => [...katlar(1.5, 1.0, 2, 0.32, '#f5f3ee', '#9aa3ab'), kutuG(0.12, 0.4, 0.04, '#d22b2b', 0, 0.75, 0.52), kutuG(0.4, 0.12, 0.04, '#d22b2b', 0, 0.89, 0.52)],
    hastane: () => [...katlar(2.6, 1.8, 5, 0.32, '#f2f0ea', '#8e98a2'), kutuG(0.2, 0.6, 0.05, '#d22b2b', 0, 1.0, 0.92), kutuG(0.6, 0.2, 0.05, '#d22b2b', 0, 1.2, 0.92)],
    park: () => [kutuG(2.6, 0.04, 2.6, '#6f9e4a'), silG(0.5, 0.5, 0.05, '#7fb3d1', -0.5, 0.03, 0.4, 16), ...[[0.8, 0.8], [-0.9, -0.7], [0.7, -0.8], [-0.2, 0.9]].map(([x, z]) => parca(new THREE.SphereGeometry(0.38, 8, 6).translate(x, 0.55, z), '#3e7a33'))],
    cami: () => [kutuG(1.4, 0.55, 1.4, '#e7dfd0'), kubbeG(0.62, '#8c939b', 0, 0.55, 0), silG(0.08, 0.09, 1.9, '#e7dfd0', 0.75, 0, 0.75, 8), parca(new THREE.ConeGeometry(0.09, 0.35, 8).translate(0.75, 2.07, 0.75), '#8c939b')],
    karakol: () => [...katlar(1.3, 1.0, 2, 0.32, '#c7cdd4', '#5a6672'), kutuG(0.5, 0.08, 0.04, '#1f4f8a', 0, 0.55, 0.52)],
    su: () => [silG(0.75, 0.75, 1.0, '#bfc6cc', 0, 0, 0, 16), kubbeG(0.75, '#9aa3ab', 0, 1.0, 0), kutuG(0.4, 0.3, 0.4, '#8e959c', 0.9, 0, 0)],
    baraj: () => [kutuG(5, 1.8, 0.8, '#b8b4aa'), kutuG(5, 0.05, 3, '#4f7f9c', 0, 1.2, -1.9)],
    dizel: () => [kutuG(1.6, 0.6, 1.1, '#9c968c'), silG(0.1, 0.12, 1.4, '#5b4a40', 0.5, 0, -0.3), silG(0.1, 0.12, 1.4, '#5b4a40', 0.1, 0, -0.3)],
    termik: () => [kutuG(3, 1.1, 2, '#8d8a85'), silG(0.25, 0.3, 4.5, '#6a5548', 0.8, 0, -0.5, 12), silG(0.25, 0.3, 4.5, '#6a5548', -0.2, 0, -0.5, 12), silG(0.8, 0.6, 1.6, '#c9c5be', -1.0, 0, 0.5, 16)],
    // gerçek projeler
    meclis2: () => [...katlar(3, 1.6, 2, 0.4, '#d9c6a3', '#7c6a4c'), catiG(3.2, 1.8, 0.35, '#9e4b31', 0.8), kutuG(0.9, 0.85, 0.3, '#cdb994', 0, 0, 0.9)],
    aoc: () => [kutuG(6, 0.03, 6, '#9fb05a'), ...[-2, 0, 2].map(x => kutuG(1.6, 0.03, 5.5, '#c8b866', x, 0.01, 0)), kutuG(1.2, 0.5, 0.8, '#e8dcc0', 2.2, 0, -2.2)],
    genclik: () => [kutuG(5, 0.04, 4, '#6f9e4a'), silG(1.4, 1.4, 0.05, '#5b97c2', 0, 0.04, 0, 24), silG(0.05, 0.05, 1.6, '#cccccc', 1.9, 0, 1.4), parca(new THREE.TorusGeometry(0.7, 0.04, 6, 20).rotateY(Math.PI / 2).translate(1.9, 1.6, 1.4), '#d44a3a')],
    universite: () => [...katlar(3.6, 1.6, 3, 0.4, '#e4d2ac', '#7a6a4c'), kutuG(1.0, 1.3, 0.4, '#d8c49c', 0, 0, 0.95)],
    anitkabir: () => [kutuG(6, 0.5, 4, '#d9d2c2'), kutuG(3, 1.3, 1.6, '#e6dfcf', 0, 0.5, 0), ...[-1.3, -0.65, 0, 0.65, 1.3].map(x => silG(0.08, 0.08, 1.2, '#efe9db', x, 0.5, 0.9, 8)), kutuG(3.2, 0.15, 1.8, '#cfc7b5', 0, 1.8, 0)],
    iskele: () => [...[[-0.5, -0.45], [0.5, -0.45], [-0.5, 0.45], [0.5, 0.45]].map(([x, z]) => kutuG(0.05, 1, 0.05, '#c8963a', x, 0, z)), ...[0.33, 0.66, 0.97].map(y => kutuG(1.05, 0.03, 0.95, '#c8963a', 0, y, 0)), kutuG(0.9, 0.06, 0.8, '#9d9d9d', 0, 0, 0)],
    terk: () => [kutuG(1.0, 0.5, 0.9, '#6b6660'), kutuG(0.6, 0.3, 0.5, '#57524c', 0.15, 0.5, 0.1)]
  };
  /* ---------- örnek havuzları: her model tek InstancedMesh ---------- */
  const havuz = {}, MAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, metalness: 0.02 });
  function havuzAl(k) {
    if (havuz[k]) return havuz[k];
    const geo = ME.mergeBufferGeometries(MODEL[k]()), kap = 64, im = new THREE.InstancedMesh(geo, MAT, kap);
    im.count = 0; im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; kok.add(im);
    return havuz[k] = { im, ids: [], geo, kap };
  }
  const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), sv = new THREE.Vector3(), pv = new THREE.Vector3(), yUst = new THREE.Vector3(0, 1, 0), BEYAZ = new THREE.Color('#ffffff');
  // bir binayı modele yerleştir (b.gor = {k, i})
  function binaGoster(b) {
    const k = b.kur < 1 ? 'iskele' : b.terk ? 'terk' : b.model;
    if (b.gor && b.gor.k === k) { binaMatris(b); return; }
    binaGizle(b);
    let h = havuzAl(k);
    if (h.im.count >= h.kap) { const yeni = new THREE.InstancedMesh(h.geo, MAT, h.kap * 2); yeni.castShadow = yeni.receiveShadow = true; yeni.frustumCulled = false; for (let i = 0; i < h.im.count; i++) { h.im.getMatrixAt(i, m4); yeni.setMatrixAt(i, m4); const c = new THREE.Color(); if (h.im.instanceColor) { h.im.getColorAt(i, c); yeni.setColorAt(i, c); } } yeni.count = h.im.count; kok.remove(h.im); kok.add(yeni); h.im = yeni; h.kap *= 2; }
    const i = h.im.count++; h.ids[i] = b.id; b.gor = { k, i }; binaMatris(b); binaRenk(b, b.renk || BEYAZ);
  }
  function binaMatris(b) {
    const h = havuz[b.gor.k], olc = b.olcek || 1, ky = b.kur < 1 ? Math.max(0.15, b.kur) * (b.iskeleH || 1) : olc;
    pv.set(b.x, b.y, b.z); qq.setFromAxisAngle(yUst, b.rot || 0); const gx = b.kur < 1 ? (b.iskeleG || olc * (b.genis || 1)) : olc * (b.genis || 1); sv.set(gx, ky, gx); m4.compose(pv, qq, sv);
    h.im.setMatrixAt(b.gor.i, m4); h.im.instanceMatrix.needsUpdate = true;
  }
  function binaRenk(b, c) { if (!b.gor) return; const h = havuz[b.gor.k]; h.im.setColorAt(b.gor.i, c); if (h.im.instanceColor) h.im.instanceColor.needsUpdate = true; }
  function binaGizle(b) {
    if (!b.gor) return; const h = havuz[b.gor.k], i = b.gor.i, son = h.im.count - 1;
    if (i !== son) { h.im.getMatrixAt(son, m4); h.im.setMatrixAt(i, m4); const c = new THREE.Color(); if (h.im.instanceColor) { h.im.getColorAt(son, c); h.im.setColorAt(i, c); } const tasinan = h.ids[son]; h.ids[i] = tasinan; const tb = binaBul(tasinan); if (tb) tb.gor.i = i; }
    h.im.count = son; h.ids.length = son; h.im.instanceMatrix.needsUpdate = true; if (h.im.instanceColor) h.im.instanceColor.needsUpdate = true; b.gor = null;
  }
  // modelin yüksekliği (iskele boyu için)
  function modelYuk(k) { const g = havuzAl(k).geo; if (!g.boundingBox) g.computeBoundingBox(); return g.boundingBox.max.y; }
  let binaBul = () => null;
  function binaKaynak(f) { binaBul = f; }

  /* ---------- simge yapılar ve eski kasaba ---------- */
  function simgelerKur() {
    const S = V.BASLANGIC, g = new THREE.Group(), tas = '#b7a688';
    const ekle = (geoListe, x, z, rot = 0) => { const m = new THREE.Mesh(ME.mergeBufferGeometries(geoListe), MAT); m.position.set(x, yukseklik(x, z), z); m.rotation.y = rot; m.castShadow = m.receiveShadow = true; g.add(m); };
    // Kale: tepe üstünde surlar ve burçlar
    const k = S.kale, sur = [];
    for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, r = 7 + Math.sin(i * 1.7) * 0.8; sur.push(kutuG(1.9, 1.3, 0.6, tas, Math.cos(a) * r, 0, Math.sin(a) * r).rotateY(0)); if (i % 4 === 0) sur.push(silG(0.7, 0.8, 1.8, '#a8977a', Math.cos(a) * r, 0, Math.sin(a) * r, 8)); }
    for (let i = 0; i < 14; i++) sur.push(kutuG(0.8, 0.35, 0.7, '#c4a77c', (Math.random() - 0.5) * 9, 0, (Math.random() - 0.5) * 9));
    ekle(sur, k.x, k.z);
    // Hacı Bayram ve Augustus Tapınağı
    const h = S.haci; ekle([kutuG(1.6, 0.6, 1.4, '#e3dccd'), catiG(1.8, 1.6, 0.4, '#6f6a62', 0.6), silG(0.09, 0.1, 2.0, '#e3dccd', 0.9, 0, 0.6, 8), parca(new THREE.ConeGeometry(0.1, 0.4, 8).translate(0.9, 2.2, 0.6), '#7f7a72'), kutuG(2.2, 0.9, 0.3, '#c9b48e', -1.8, 0, 0), kutuG(0.3, 0.9, 1.6, '#c9b48e', -2.8, 0, 0.6)], h.x, h.z);
    // istasyon ve demiryolu (batı-doğu)
    const gar = S.gar; ekle([...katlar(4, 1.2, 2, 0.4, '#d8c39c', '#7b6a4a'), catiG(4.3, 1.4, 0.4, '#9e4b31', 0.8)], gar.x, gar.z + 2);
    const ray = []; for (let x = -B / 2; x < B / 2; x += 2) { const z = gar.z + (x - gar.x) * 0.12; ray.push([x, z]); }
    raylar = ray; const rg = [];
    ray.forEach(([x, z], i) => { if (i % 1 === 0) rg.push(kutuG(2.05, 0.06, 0.5, '#5b5249', x, yukseklik(x, z) + 0.02, z)); });
    const rm = new THREE.Mesh(ME.mergeBufferGeometries(rg), MAT); rm.receiveShadow = true; g.add(rm);
    // Birinci Meclis
    const m1 = S.meclis1; ekle([...katlar(2.4, 1.3, 2, 0.38, '#c7a986', '#6e5a40'), catiG(2.6, 1.45, 0.35, '#9e4b31', 0.76)], m1.x, m1.z);
    kok.add(g);
  }
  let raylar = [];
  // 1923'ün kasabası: Kale eteğinde ve Ulus'ta sık kerpiç evler (dokunulmaz)
  let eskiYer = [];
  function eskiKasabaKur() {
    const S = V.BASLANGIC, merkezler = [[S.kale, 26, 260], [S.haci, 18, 120], [V.SEMT[0], 16, 110], [V.SEMT[3], 14, 90], [V.SEMT[4], 14, 80]];
    const geo = ME.mergeBufferGeometries(MODEL.R1()), toplam = merkezler.reduce((a, m) => a + m[2], 0), im = new THREE.InstancedMesh(geo, MAT, toplam);
    let i = 0;
    merkezler.forEach(([m, r, n]) => { for (let k = 0; k < n; k++) { const a = Math.random() * 6.28, d = Math.sqrt(Math.random()) * r, x = m.x + Math.cos(a) * d, z = m.z + Math.sin(a) * d; if (dereMi(x, z) || Math.hypot(x - S.kale.x, z - S.kale.z) < 8.5) continue; pv.set(x, yukseklik(x, z), z); qq.setFromAxisAngle(yUst, Math.random() * 6.28); const s = 0.8 + Math.random() * 0.4; sv.set(s, s, s); m4.compose(pv, qq, sv); im.setMatrixAt(i, m4); im.setColorAt(i, new THREE.Color().setHSL(0.08, 0.2, 0.75 + Math.random() * 0.2)); eskiYer.push([x, z]); i++; } });
    im.count = i; im.castShadow = im.receiveShadow = true; kok.add(im);
  }
  // eski kasaba ya da ray hattı bu noktayı kapatıyor mu?
  function doluMu(x, z) {
    const S = V.BASLANGIC;
    for (const k of Object.values(S)) if (Math.hypot(x - k.x, z - k.z) < (k === S.kale ? 10 : 4)) return true;
    for (const [ex, ez] of eskiYer) if (Math.abs(ex - x) < 1.2 && Math.abs(ez - z) < 1.2) return true;
    const gar = S.gar; if (Math.abs(z - (gar.z + (x - gar.x) * 0.12)) < 1.6) return 'ray';
    return false;
  }

  /* ---------- yollar ---------- */
  let yolKat;
  const yolMesh = {};
  function yolCiz(p, a, b) {
    yolSil(p.id);
    const T = V.YOL[p.tur], w = T.genislik / 2, dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz), nx = -dz / L, nz = dx / L, adim = Math.max(2, Math.ceil(L / 1.2));
    const pos = [], idx = [], kopru = [];
    for (let i = 0; i <= adim; i++) {
      const t = i / adim, x = a.x + dx * t, z = a.z + dz * t;
      const yL = yukseklik(x + nx * w, z + nz * w), yR = yukseklik(x - nx * w, z - nz * w), yc = Math.max(yL, yR, yukseklik(x, z));
      const dere = dereMi(x, z); if (dere) kopru.push([x, z, yc]);
      const y = (dere ? yc + 0.5 : yc) + 0.07;
      pos.push(x + nx * w, Math.max(yL + 0.07, y - 0.05), z + nz * w, x - nx * w, Math.max(yR + 0.07, y - 0.05), z - nz * w);
      if (i < adim) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const grup = new THREE.Group(), m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: T.renk, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2 })); m.receiveShadow = true; grup.add(m);
    if (T.agacli || kopru.length) {
      const L2 = [];
      if (T.agacli) for (let s = 0; s < L; s += 2.4) { const x = a.x + dx * s / L, z = a.z + dz * s / L; [-1, 1].forEach(k => { const ax = x + nx * k * (w + 0.4), az = z + nz * k * (w + 0.4); L2.push(silG(0.03, 0.04, 0.4, '#6b5236', ax, yukseklik(ax, az), az, 5), parca(new THREE.SphereGeometry(0.32, 7, 5).translate(ax, yukseklik(ax, az) + 0.65, az), '#4b7a35')); }); }
      kopru.forEach(([x, z, y]) => { L2.push(kutuG(0.08, 0.25, 0.08, '#8a8a8a', x + nx * w, y + 0.57, z + nz * w), kutuG(0.08, 0.25, 0.08, '#8a8a8a', x - nx * w, y + 0.57, z - nz * w), kutuG(0.3, y - yukseklik(x, z) + 0.5, 0.3, '#9a958c', x, yukseklik(x, z), z)); });
      if (L2.length) { const e = new THREE.Mesh(ME.mergeBufferGeometries(L2), MAT); e.castShadow = true; grup.add(e); }
    }
    yolKat.add(grup); yolMesh[p.id] = grup;
    return kopru.length * (L / adim);
  }
  function yolSil(id) { const m = yolMesh[id]; if (!m) return; yolKat.remove(m); m.traverse(o => { if (o.geometry) o.geometry.dispose(); }); delete yolMesh[id]; }
  // önizleme çizgisi
  let onizleme = null;
  function yolOnizle(a, b, tur, gecerli) {
    if (onizleme) { sahne.remove(onizleme); onizleme.geometry.dispose(); onizleme = null; }
    if (!a || !b) return;
    const T = V.YOL[tur], dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz); if (L < 0.5) return;
    const g = new THREE.PlaneGeometry(T.genislik, L); g.rotateX(-Math.PI / 2); g.rotateY(-Math.atan2(dz, dx) + Math.PI / 2);
    onizleme = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: gecerli ? '#ffd166' : '#ff5d5d', transparent: true, opacity: 0.75, depthTest: false }));
    onizleme.position.set((a.x + b.x) / 2, Math.max(yukseklik(a.x, a.z), yukseklik(b.x, b.z)) + 0.4, (a.z + b.z) / 2); onizleme.renderOrder = 5; sahne.add(onizleme);
  }

  /* ---------- imar katmanı ---------- */
  let imarIm = null; const IMAR_RENK = { R: new THREE.Color(V.IMAR.R.renk), Rk: new THREE.Color(V.IMAR.Rk.renk), C: new THREE.Color(V.IMAR.C.renk), I: new THREE.Color(V.IMAR.I.renk), bos: new THREE.Color('#e9e2d2') };
  function imarCiz(hucreler, goster) {
    if (imarIm) { kok.remove(imarIm); imarIm.dispose(); }
    const liste = Object.entries(hucreler).filter(([, h]) => !h.bina && (h.imar || goster));
    const g = new THREE.PlaneGeometry(Z * 0.9, Z * 0.9); g.rotateX(-Math.PI / 2);
    imarIm = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.62, depthWrite: false, toneMapped: false }), Math.max(1, liste.length));
    liste.forEach(([, h], i) => { pv.set(h.x, h.y + 0.12, h.z); qq.setFromAxisAngle(yUst, h.rot); sv.set(1, 1, 1); m4.compose(pv, qq, sv); imarIm.setMatrixAt(i, m4); imarIm.setColorAt(i, h.imar ? IMAR_RENK[h.imar] : IMAR_RENK.bos); });
    imarIm.count = liste.length; imarIm.renderOrder = 3; imarIm.visible = liste.length > 0; kok.add(imarIm);
    imarIm.material.opacity = 0.62;
  }

  /* ---------- seçim ve dokunma ---------- */
  function zemin(cx, cy) {
    const r = renderer.domElement.getBoundingClientRect();
    ray.setFromCamera({ x: (cx - r.left) / r.width * 2 - 1, y: -(cy - r.top) / r.height * 2 + 1 }, kamera);
    const h = ray.intersectObject(arazi, false)[0]; return h ? { x: h.point.x, z: h.point.z, y: h.point.y } : null;
  }

  /* ---------- gün ışığı ---------- */
  let saatOfs = 0, son = performance.now(), cb = null;
  const GECE = new THREE.Color('#0d1626'), GUNDUZ = new THREE.Color('#9cc3e0'), AKSAM = new THREE.Color('#e7a77a');
  function kare(t) {
    const dt = Math.min(0.05, (t - son) / 1000); son = t;
    kontrol.update();
    const tx = Math.max(-B / 2, Math.min(B / 2, kontrol.target.x)), tz = Math.max(-B / 2, Math.min(B / 2, kontrol.target.z));
    if (tx !== kontrol.target.x || tz !== kontrol.target.z) { const d = new THREE.Vector3(tx - kontrol.target.x, 0, tz - kontrol.target.z); kontrol.target.add(d); kamera.position.add(d); }
    const yer = yukseklik(kamera.position.x, kamera.position.z) + 0.8; if (kamera.position.y < yer) kamera.position.y = yer;
    // 8 dakikalık gün; öğlen uzun, gece kısa
    const a = ((t + saatOfs) / 480000) * Math.PI * 2, sin = Math.sin(a), gece = Math.max(0, Math.min(1, (0.05 - sin) / 0.3)), aksam = Math.max(0, 1 - Math.abs(sin) / 0.3) * (1 - gece);
    const mesafe = kamera.position.distanceTo(kontrol.target), kap = Math.max(40, Math.min(260, mesafe * 1.4));
    gunes.position.set(kontrol.target.x + Math.cos(a) * 200, kontrol.target.y + Math.max(30, sin * 260 + 60), kontrol.target.z + 120);
    gunes.target.position.copy(kontrol.target);
    Object.assign(gunes.shadow.camera, { left: -kap, right: kap, top: kap, bottom: -kap, near: 1, far: 800 }); gunes.shadow.camera.updateProjectionMatrix();
    gunes.intensity = 0.25 + 1.45 * Math.max(0, sin) * (1 - gece); gunes.color.setRGB(1, 0.92 - aksam * 0.2, 0.82 - aksam * 0.35);
    hemi.intensity = 0.2 + 0.4 * (1 - gece);
    sahne.background.copy(GUNDUZ).lerp(AKSAM, aksam * 0.6).lerp(GECE, gece); sahne.fog.color.copy(sahne.background);
    MAT.emissive.setRGB(gece * 0.18, gece * 0.14, gece * 0.06);
    if (cb) cb(dt);
    renderer.render(sahne, kamera);
  }
  function basla(f) { cb = f; renderer.setAnimationLoop(kare); }
  function odakla(x, z, mesafe = 60) { const y = yukseklik(x, z); kontrol.target.set(x, y, z); const d = kamera.position.clone().sub(kontrol.target).setLength(mesafe); kamera.position.copy(kontrol.target).add(d); }
  // araç seçiliyken tek parmak araca, iki parmak kameraya
  function aracModu(acik) {
    kontrol.touches.ONE = acik ? null : THREE.TOUCH.PAN; kontrol.mouseButtons.LEFT = acik ? null : THREE.MOUSE.PAN;
  }

  return {
    kur, basla, yukseklik, egim, dereMi, doluMu, Z, B, mevsim, yolCiz, yolSil, yolOnizle, imarCiz, binaGoster, binaGizle, binaMatris, binaRenk, binaKaynak, modelYuk,
    zemin, odakla, aracModu, kamera: () => kamera, kontrol: () => kontrol, canvas: () => renderer.domElement, _saat: ms => { saatOfs = ms; }, MODEL
  };
})();
