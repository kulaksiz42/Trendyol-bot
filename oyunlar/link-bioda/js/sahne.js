/* Link Bio'da — 3D sahne (Three.js r149).
   Oda, karakter, kedi, anne, kamera modları ve prosedürel animasyonlar. */
'use strict';
(function () {
  const T = THREE;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const azalt = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer, scene, camera, kap, saat;
  let oyuncu = null, anne = null, kedi = null;
  const O = {};                  // oda nesneleri
  let kameraMod = 'oda';
  const kamPos = new T.Vector3(2.6, 2.2, 3.2), kamBak = new T.Vector3(0, 1, 0);
  const hedefPos = new T.Vector3(), hedefBak = new T.Vector3();
  let donus = 0, surukle = null, egiklik = 0, egiklikHedef = 0;
  let isikTitreme = 0, karanlik = 0;
  let kediYuru = null, anneDurum = null;
  let calisiyor = false;
  let kompozit = null, kameraEfekt = null, bloom = null, fotoIste = null, mumModu = 0;

  /* ---------- yardımcılar ---------- */
  const malz = (renk, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: renk, roughness: 0.85, metalness: 0 }, o));
  const parlak = renk => new T.MeshBasicMaterial({ color: renk, toneMapped: false });
  function golge(m) { m.castShadow = true; m.receiveShadow = true; return m; }
  const kapsul = (r, l, m) => golge(new T.Mesh(new T.CapsuleGeometry(r, Math.max(0.001, l), 6, 14), m));
  const kure = (r, m, w = 18, h = 14) => golge(new T.Mesh(new T.SphereGeometry(r, w, h), m));
  const kutu = (w, h, d, m) => golge(new T.Mesh(new T.BoxGeometry(w, h, d), m));
  const silindir = (rt, rb, h, m, s = 16) => golge(new T.Mesh(new T.CylinderGeometry(rt, rb, h, s), m));
  function doku(w, h, ciz) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    ciz(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
  }
  function renkKaristir(a, b, k) { return new T.Color(a).lerp(new T.Color(b), clamp(k, 0, 1)); }
  function koyulas(r, k) { return new T.Color(r).multiplyScalar(k); }

  /* ---------- kıyafetler ---------- */
  const formaDoku = () => doku(128, 128, (g, w, h) => {
    g.fillStyle = '#f2f2ee'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1f7a4c'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 16, h);
    g.fillStyle = '#111'; g.font = 'bold 34px sans-serif'; g.textAlign = 'center'; g.fillText('10', w / 2, 80);
  });
  const tisortDoku = () => doku(128, 128, (g, w, h) => {
    g.fillStyle = '#ece6da'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ff4f8b'; g.beginPath(); g.arc(w / 2, 62, 18, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ece6da'; g.font = 'bold 22px sans-serif'; g.textAlign = 'center'; g.fillText('F', w / 2, 70);
  });
  const KIYAFET = {
    esofman: { ust: '#6d7280', alt: '#5b606c', uzunKol: true, ayakkabi: '#f0f0f0' },
    tisort: { ust: '#ece6da', ustDoku: tisortDoku, alt: '#3d5a80', uzunKol: false, ayakkabi: '#2b2b33' },
    sik: { ust: '#7a1f3d', alt: '#1d1d24', uzunKol: true, ayakkabi: '#151515', parlak: true, yaka: true },
    forma: { ust: '#ffffff', ustDoku: formaDoku, alt: '#1d1d24', uzunKol: false, ayakkabi: '#f0f0f0' }
  };

  /* ---------- karakter ---------- */
  function karakterKur(c) {
    const h = c.boy / 170;
    const bmi = c.kilo / Math.pow(c.boy / 100, 2);
    const w = clamp(Math.sqrt(bmi / 22), 0.82, 1.5);
    const omuz = { dar: 0.9, dengeli: 1, genis: 1.14 }[c.siluet] || 1;
    const kalcaK = { dar: 1.1, dengeli: 1, genis: 0.94 }[c.siluet] || 1;
    const k = KIYAFET[c.kiyafet] || KIYAFET.esofman;

    const ten = malz(c.ten, { roughness: 0.6 });
    const ust = malz(k.ust, { roughness: k.parlak ? 0.35 : 0.85, map: k.ustDoku ? k.ustDoku() : null });
    if (k.ustDoku) ust.color.set('#ffffff');
    const kol = k.uzunKol ? malz(k.ust, { roughness: k.parlak ? 0.35 : 0.85 }) : ten;
    const alt = malz(k.alt);
    const ayk = malz(k.ayakkabi, { roughness: 0.5 });
    const yasK = c.yas >= 45 ? (c.yas - 42) / 22 : 0;
    const sacRenk = renkKaristir(c.sacRenk, '#c9c6c0', yasK);
    const sac = malz(sacRenk, { roughness: 0.9 });

    const G = new T.Group();
    const J = {};
    const kalca = new T.Group(); kalca.position.y = 0.92 * h; G.add(kalca); J.kalca = kalca; J.kalcaY = 0.92 * h;
    const pelvis = kure(0.16, alt); pelvis.scale.set(1.05 * w * kalcaK, 0.72, 0.8 * w); kalca.add(pelvis);

    for (const s of [-1, 1]) {
      const bacak = new T.Group(); bacak.position.set(s * 0.085 * w * kalcaK, 0, 0); kalca.add(bacak);
      const ur = 0.075 * Math.min(w, 1.35);
      const uyluk = kapsul(ur, 0.42 * h - 2 * ur, alt); uyluk.position.y = -0.21 * h; bacak.add(uyluk);
      const diz = new T.Group(); diz.position.y = -0.42 * h; bacak.add(diz);
      const br = 0.06 * Math.min(w, 1.3);
      const baldir = kapsul(br, 0.42 * h - 2 * br, alt); baldir.position.y = -0.21 * h; diz.add(baldir);
      const ayak = kutu(0.11, 0.07, 0.24, ayk); ayak.position.set(0, 0.035 - 0.5 * h, 0.045); diz.add(ayak);
      J['bacak' + s] = bacak; J['diz' + s] = diz;
    }

    const govde = new T.Group(); govde.position.y = 0.04; kalca.add(govde); J.govde = govde;
    const g1 = kapsul(0.15, 0.26 * h, ust); g1.scale.set(1.12 * w * omuz, 1, 0.74 * w); g1.position.y = 0.25 * h; govde.add(g1);
    if (k.yaka) {
      const yaka = new T.Mesh(new T.ConeGeometry(0.06, 0.16, 3), malz('#f4f1ea'));
      yaka.rotation.x = Math.PI; yaka.position.set(0, 0.46 * h, 0.1 * w + 0.02); yaka.scale.z = 0.3; govde.add(yaka);
    }
    if (c.kiyafet === 'esofman') {
      const fer = kutu(0.012, 0.3 * h, 0.01, malz('#d8d8d8')); fer.position.set(0, 0.28 * h, 0.11 * w + 0.005); govde.add(fer);
    }
    const boyun = kapsul(0.05, 0.05, ten); boyun.position.y = 0.53 * h + 0.03; govde.add(boyun);

    // kollar
    for (const s of [-1, 1]) {
      const om = new T.Group(); om.position.set(s * (0.16 * w * omuz + 0.035), 0.47 * h, 0); govde.add(om);
      const kr = 0.05 * Math.min(w, 1.3);
      const pazu = kapsul(kr, 0.3 * h - 2 * kr, kol === ten ? ust : kol); pazu.position.y = -0.15 * h; om.add(pazu);
      if (kol === ten) { pazu.scale.y = 0.55; pazu.position.y = -0.08 * h; const ic = kapsul(kr * 0.92, 0.3 * h - 2 * kr, ten); ic.position.y = -0.15 * h; om.add(ic); }
      const dir = new T.Group(); dir.position.y = -0.3 * h; om.add(dir);
      const on = kapsul(0.043 * Math.min(w, 1.25), 0.27 * h - 0.09, kol); on.position.y = -0.135 * h; dir.add(on);
      const el = kure(0.048, ten); el.scale.set(0.9, 1.1, 0.7); el.position.y = -0.29 * h; dir.add(el);
      J['omuz' + s] = om; J['dirsek' + s] = dir;
    }

    // baş
    const bas = new T.Group(); bas.position.y = 0.53 * h + 0.17; govde.add(bas); J.bas = bas;
    const kafa = kure(0.13, ten, 24, 18); kafa.scale.set(1, 1.08, 1); bas.add(kafa);
    for (const s of [-1, 1]) { const kulak = kure(0.03, ten); kulak.scale.set(0.5, 1, 0.7); kulak.position.set(s * 0.128, 0, 0); bas.add(kulak); }
    const gozler = new T.Group(); bas.add(gozler); J.gozler = gozler;
    const beyaz = malz('#ffffff', { roughness: 0.3 }), siyah = malz('#1a1414', { roughness: 0.2 });
    for (const s of [-1, 1]) {
      const g = kure(0.024, beyaz, 12, 10); g.scale.z = 0.6; g.position.set(s * 0.046, 0.015, 0.112); gozler.add(g);
      const b = kure(0.014, siyah, 10, 8); b.position.set(s * 0.046, 0.013, 0.127); gozler.add(b);
      const kas = kutu(0.05, 0.011, 0.012, malz(koyulas(sacRenk, 0.8))); kas.position.set(s * 0.046, 0.058, 0.118); kas.rotation.z = -s * 0.12; bas.add(kas);
      J['kas' + s] = kas;
    }
    const burun = kure(0.019, malz(koyulas(c.ten, 0.92), { roughness: 0.6 })); burun.position.set(0, -0.012, 0.13); bas.add(burun);
    const gulus = new T.Mesh(new T.TorusGeometry(0.028, 0.006, 6, 14, Math.PI), malz('#7a2e2e'));
    gulus.rotation.z = Math.PI; gulus.position.set(0, -0.05, 0.122); bas.add(gulus); J.gulus = gulus;
    const acik = kure(0.022, malz('#4a1616')); acik.scale.set(1, 0.7, 0.35); acik.position.set(0, -0.058, 0.12); acik.visible = false; bas.add(acik); J.agiz = acik;

    sacEkle(bas, c.sac, sac);
    sakalEkle(bas, c.sakal, sac, c.ten);
    gozlukEkle(bas, c.gozluk);
    aksesuarEkle(bas, govde, c.aksesuar, h);
    if (c.kedikulak) aksesuarEkle(bas, govde, 'kedikulak', h);

    G.userData = { J, h, poz: {}, anim: { ad: 'bekle', t: 0, sure: 0 }, kirp: 2 + Math.random() * 3, konusma: 0 };
    return G;
  }

  function sacEkle(bas, stil, m) {
    if (stil === 'kel') return;
    const kep = new T.Mesh(new T.SphereGeometry(0.139, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.52), m);
    kep.rotation.x = -0.45; kep.position.y = 0.028; kep.scale.set(1, 0.92, 1.03); golge(kep); bas.add(kep);
    if (stil === 'kisa') {
      const kakul = kure(0.06, m); kakul.scale.set(1.6, 0.45, 0.6); kakul.position.set(0.02, 0.1, 0.1); bas.add(kakul);
    } else if (stil === 'uzun') {
      const arka = kapsul(0.13, 0.2, m); arka.scale.set(1.02, 1, 0.42); arka.position.set(0, -0.11, -0.075); bas.add(arka);
      for (const s of [-1, 1]) { const tel = kapsul(0.032, 0.17, m); tel.position.set(s * 0.122, -0.09, 0.03); bas.add(tel); }
    } else if (stil === 'topuz') {
      const topuz = kure(0.062, m); topuz.position.set(0, 0.135, -0.07); bas.add(topuz);
    } else if (stil === 'kivircik') {
      const n = 46;
      for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 1.25, r = Math.sqrt(Math.max(0, 1 - y * y)), a = i * 2.399;
        const p = new T.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
        if (p.z > 0.55 && p.y < 0.45) continue;
        const b = kure(0.045, m, 8, 6); b.position.copy(p.multiplyScalar(0.14)); b.position.y += 0.02; bas.add(b);
      }
    } else if (stil === 'atkuyrugu') {
      const kuyruk = kapsul(0.036, 0.17, m); kuyruk.position.set(0, -0.03, -0.16); kuyruk.rotation.x = 0.45; bas.add(kuyruk);
      const lastik = new T.Mesh(new T.TorusGeometry(0.036, 0.01, 6, 12), malz('#ff4f8b')); lastik.position.set(0, 0.06, -0.135); lastik.rotation.x = 0.45 + Math.PI / 2; bas.add(lastik);
    }
  }
  function sakalEkle(bas, stil, m, tenRenk) {
    if (stil === 'yok') return;
    if (stil === 'kirli' || stil === 'tam') {
      const mm = stil === 'tam' ? m : malz(koyulas(tenRenk, 0.62), { transparent: true, opacity: 0.55, roughness: 1 });
      const s = new T.Mesh(new T.SphereGeometry(stil === 'tam' ? 0.137 : 0.132, 20, 12, Math.PI * 0.05, Math.PI * 0.9, Math.PI * 0.55, Math.PI * 0.35), mm);
      s.rotation.y = 0; s.scale.set(1, 1.08, 1); s.position.y = stil === 'tam' ? -0.005 : 0; bas.add(golge(s));
    }
    if (stil === 'biyik' || stil === 'tam') {
      const b = kapsul(0.012, 0.05, m); b.rotation.z = Math.PI / 2; b.position.set(0, -0.035, 0.128); bas.add(b);
    }
  }
  function gozlukEkle(bas, stil) {
    if (stil === 'yok') return;
    const cerceve = malz(stil === 'yuvarlak' ? '#b8963e' : '#1b1b1f', { roughness: 0.3, metalness: stil === 'yuvarlak' ? 0.8 : 0 });
    for (const s of [-1, 1]) {
      const kare = stil !== 'yuvarlak';
      const halka = new T.Mesh(new T.TorusGeometry(kare ? 0.034 : 0.029, kare ? 0.006 : 0.004, kare ? 6 : 8, kare ? 4 : 24), cerceve);
      if (kare) halka.rotation.z = Math.PI / 4;
      halka.position.set(s * 0.047, 0.014, 0.133); bas.add(halka);
      if (stil === 'gunes') { const cam = new T.Mesh(new T.PlaneGeometry(0.046, 0.046), malz('#101018', { roughness: 0.1 })); cam.position.set(s * 0.047, 0.014, 0.131); bas.add(cam); }
      const sap = kutu(0.005, 0.005, 0.13, cerceve); sap.position.set(s * 0.123, 0.016, 0.07); bas.add(sap);
    }
    const kopru = kutu(0.03, 0.005, 0.005, cerceve); kopru.position.set(0, 0.02, 0.135); bas.add(kopru);
  }
  function aksesuarEkle(bas, govde, stil, h) {
    if (stil === 'kolye') {
      const k = new T.Mesh(new T.TorusGeometry(0.075, 0.006, 6, 24), malz('#d4af37', { metalness: 0.9, roughness: 0.25 }));
      k.rotation.x = Math.PI / 2 + 0.25; k.position.set(0, 0.52 * h, 0.02); govde.add(k);
    } else if (stil === 'kupe') {
      for (const s of [-1, 1]) { const k = kure(0.011, malz('#d4af37', { metalness: 0.9, roughness: 0.2 })); k.position.set(s * 0.13, -0.035, 0.005); bas.add(k); }
    } else if (stil === 'bere') {
      const b = new T.Mesh(new T.SphereGeometry(0.147, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), malz('#c8553d'));
      b.position.y = 0.02; b.scale.y = 1.15; bas.add(golge(b));
      const kenar = new T.Mesh(new T.TorusGeometry(0.143, 0.018, 8, 26), malz('#a94530')); kenar.rotation.x = Math.PI / 2; kenar.position.y = 0.02; bas.add(kenar);
    } else if (stil === 'kedikulak') {
      const m = malz('#26232b'), ic = malz('#ff8fb1');
      const bant = new T.Mesh(new T.TorusGeometry(0.142, 0.008, 6, 24, Math.PI), m); bant.rotation.z = 0; bant.position.y = 0.02; bas.add(bant);
      for (const s of [-1, 1]) {
        const kk = new T.Mesh(new T.ConeGeometry(0.045, 0.08, 4), m); kk.position.set(s * 0.085, 0.15, 0); kk.rotation.z = -s * 0.35; bas.add(golge(kk));
        const ki = new T.Mesh(new T.ConeGeometry(0.028, 0.05, 4), ic); ki.position.set(s * 0.085, 0.142, 0.012); ki.rotation.z = -s * 0.35; bas.add(ki);
      }
    }
  }

  /* ---------- pozlar ---------- */
  function pozHesapla(ad, t, sure, zaman) {
    const nefes = Math.sin(zaman * 1.6) * 0.02;
    const P = {
      o1: [0.05, 0, 0.12], o_1: [0.05, 0, -0.12], d1: -0.15, d_1: -0.15,
      b1: 0, b_1: 0, k1: 0, k_1: 0, g: [nefes, 0, 0], bas: [Math.sin(zaman * 0.7) * 0.04, Math.sin(zaman * 0.5) * 0.12, 0],
      y: 0, ry: 0, agiz: 0, kas: 0
    };
    const u = sure ? clamp(t / sure, 0, 1) : 0;
    const zarf = Math.sin(u * Math.PI);
    switch (ad) {
      case 'konus':
        P.o1 = [-0.55 + Math.sin(t * 6) * 0.25, 0.2, 0.25]; P.d1 = -1.3 + Math.sin(t * 7) * 0.2;
        P.bas = [Math.sin(t * 9) * 0.06, Math.sin(t * 3) * 0.12, 0]; P.agiz = (Math.sin(t * 18) > 0) ? 1 : 0; break;
      case 'dans': {
        const v = t * 8.5;
        P.o_1 = [-0.3, 0, -(1.3 + Math.sin(v) * 0.5)]; P.o1 = [-0.3, 0, 1.3 + Math.sin(v + Math.PI) * 0.5];
        P.d_1 = -0.8 + Math.sin(v) * 0.4; P.d1 = -0.8 + Math.sin(v + Math.PI) * 0.4;
        P.y = -Math.abs(Math.sin(v)) * 0.05; P.g = [0.05, Math.sin(v / 2) * 0.35, Math.sin(v) * 0.08];
        P.k1 = Math.max(0, Math.sin(v)) * 0.35; P.k_1 = Math.max(0, -Math.sin(v)) * 0.35; P.b1 = -P.k1 * 0.5; P.b_1 = -P.k_1 * 0.5;
        P.bas = [0, Math.sin(v / 2) * -0.25, Math.sin(v) * 0.12]; P.agiz = 0.6; break;
      }
      case 'sarki':
        P.o1 = [-1.25, 0.1, 0.35]; P.d1 = -1.75; P.o_1 = [-0.3, 0, -1.0 - Math.sin(t * 3) * 0.2]; P.d_1 = -0.3;
        P.bas = [-0.18, Math.sin(t * 2) * 0.15, Math.sin(t * 2) * 0.1]; P.g = [-0.06, Math.sin(t * 2) * 0.12, 0];
        P.agiz = 0.6 + Math.sin(t * 10) * 0.4; break;
      case 'selam':
        P.o1 = [0, 0, 2.6 + Math.sin(t * 13) * 0.3]; P.d1 = -0.4; P.bas = [0, 0, 0.12]; P.agiz = 0.4; break;
      case 'poz':
        P.o_1 = [0.3, 0, -0.75]; P.d_1 = -1.7; P.o1 = [-0.4, 0, 2.2]; P.d1 = -2.1;
        P.bas = [0.05, 0.15, -0.18]; P.g = [0, 0.1, 0.08]; P.k1 = 0.3; P.b1 = -0.15; P.kas = 1; break;
      case 'tesekkur':
        P.g = [0.5 * zarf, 0, 0]; P.o1 = [-0.9, 0, -0.35]; P.o_1 = [-0.9, 0, 0.35]; P.d1 = -1.3; P.d_1 = -1.3; P.bas = [0.2 * zarf, 0, 0]; break;
      case 'ic':
        P.o1 = [-1.35, 0.1, 0.3]; P.d1 = -2.2; P.bas = [-0.35 * zarf, 0, 0]; break;
      case 'panik': {
        const z = Math.sin(t * 22) * 0.25;
        P.o1 = [0, 0, 2.7 + z]; P.o_1 = [0, 0, -2.7 - z]; P.d1 = -0.5; P.d_1 = -0.5; P.bas = [0, Math.sin(t * 16) * 0.35, 0]; P.agiz = 1; P.y = Math.abs(Math.sin(t * 11)) * 0.03; break;
      }
      case 'sok':
        P.o1 = [-1.5, 0, 0.35]; P.o_1 = [-1.5, 0, -0.35]; P.d1 = -2.35; P.d_1 = -2.35; P.agiz = 1; P.bas = [-0.1, 0, 0]; P.kas = 1; break;
      case 'gul':
        P.g = [-0.12 + Math.sin(t * 20) * 0.03, 0, 0]; P.bas = [-0.25, 0, 0]; P.agiz = 1; P.o1 = [0.1, 0, 0.3]; P.o_1 = [0.1, 0, -0.3]; break;
      case 'sergile': // karakter oluşturucuda poz
        P.o_1 = [0.2, 0, -0.6]; P.d_1 = -1.5; P.o1 = [-0.2, 0, 0.35]; P.bas = [0, 0.2, -0.08]; P.k1 = 0.2; P.kas = 1; break;
    }
    return P;
  }

  function karakterGuncelle(K, dt, zaman) {
    const U = K.userData, J = U.J, A = U.anim;
    A.t += dt;
    if (A.sure && A.t >= A.sure) { A.ad = 'bekle'; A.t = 0; A.sure = 0; }
    const P = pozHesapla(A.ad, A.t, A.sure, zaman);
    const k = 1 - Math.exp(-14 * dt);
    const rot = (o, v) => { o.rotation.x += (v[0] - o.rotation.x) * k; o.rotation.y += (v[1] - o.rotation.y) * k; o.rotation.z += (v[2] - o.rotation.z) * k; };
    rot(J.omuz1, P.o1); rot(J['omuz-1'], P.o_1);
    J.dirsek1.rotation.x += (P.d1 - J.dirsek1.rotation.x) * k; J['dirsek-1'].rotation.x += (P.d_1 - J['dirsek-1'].rotation.x) * k;
    J.bacak1.rotation.x += (P.b1 - J.bacak1.rotation.x) * k; J['bacak-1'].rotation.x += (P.b_1 - J['bacak-1'].rotation.x) * k;
    J.diz1.rotation.x += (P.k1 - J.diz1.rotation.x) * k; J['diz-1'].rotation.x += (P.k_1 - J['diz-1'].rotation.x) * k;
    rot(J.govde, P.g); rot(J.bas, P.bas);
    J.kalca.position.y += (J.kalcaY + P.y - J.kalca.position.y) * k;
    // ağız ve göz kırpma
    U.konusma += (P.agiz - U.konusma) * Math.min(1, dt * 20);
    J.agiz.visible = U.konusma > 0.25; J.gulus.visible = !J.agiz.visible;
    J.agiz.scale.y = 0.4 + U.konusma * 0.6;
    U.kirp -= dt;
    let g = 1; if (U.kirp < 0) { g = 0.1; if (U.kirp < -0.12) U.kirp = 2 + Math.random() * 3.5; }
    J.gozler.scale.y += (g - J.gozler.scale.y) * Math.min(1, dt * 30);
    const kas = 0.058 + P.kas * 0.012; J.kas1.position.y = kas; J['kas-1'].position.y = kas;
  }

  /* ---------- hazır model için gözlük ve aksesuar ---------- */
  function aksesuar3(g, L, c) {
    const gx = L.gozGen * 0.27, gz = L.goz.z + 0.022, gy = L.goz.y;
    if (c.gozluk && c.gozluk !== 'yok') {
      const kare = c.gozluk !== 'yuvarlak';
      const cer = malz(kare ? '#1b1b1f' : '#b8963e', { roughness: 0.3, metalness: kare ? 0 : 0.8 });
      for (const s of [-1, 1]) {
        const h = new T.Mesh(new T.TorusGeometry(kare ? 0.024 : 0.021, kare ? 0.0045 : 0.003, kare ? 6 : 8, kare ? 4 : 24), cer);
        if (kare) h.rotation.z = Math.PI / 4;
        h.position.set(s * gx, gy, gz); g.add(h);
        if (c.gozluk === 'gunes') { const cam = new T.Mesh(new T.PlaneGeometry(0.033, 0.033), malz('#101018', { roughness: 0.1 })); cam.position.set(s * gx, gy, gz - 0.002); g.add(cam); }
        const sap = kutu(0.004, 0.004, 0.1, cer); sap.position.set(s * (gx + 0.03), gy + 0.004, gz - 0.05); g.add(sap);
      }
      const kopru = kutu(gx * 2 - 0.045, 0.004, 0.004, cer); kopru.position.set(0, gy + 0.006, gz + 0.002); g.add(kopru);
    }
    const altin = malz('#d4af37', { metalness: 0.9, roughness: 0.25 });
    if (c.aksesuar === 'kolye') { const k = new T.Mesh(new T.TorusGeometry(0.068, 0.005, 6, 28), altin); k.rotation.x = Math.PI / 2 + 0.3; k.position.set(0, L.boyun.y - 0.005, L.boyun.z + 0.035); g.add(k); }
    if (c.aksesuar === 'kupe') for (const s of [-1, 1]) { const k = kure(0.008, altin); k.position.set(s * (L.gozGen * 0.5 + 0.035), gy - 0.045, L.goz.z - 0.085); g.add(k); }
    if (c.aksesuar === 'bere') {
      const b = new T.Mesh(new T.SphereGeometry(0.112, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), malz('#c8553d'));
      b.position.set(0, L.tepeY - 0.075, L.goz.z - 0.085); b.scale.y = 1.05; g.add(golge(b));
      const kenar = new T.Mesh(new T.TorusGeometry(0.11, 0.014, 8, 26), malz('#a94530')); kenar.rotation.x = Math.PI / 2; kenar.position.copy(b.position); g.add(kenar);
    }
    if (c.kedikulak) {
      const m = malz('#26232b'), ic = malz('#ff8fb1'), y = L.tepeY - 0.02, z = L.goz.z - 0.08;
      const bant = new T.Mesh(new T.TorusGeometry(0.1, 0.006, 6, 24, Math.PI), m); bant.position.set(0, y - 0.09, z); g.add(bant);
      for (const s of [-1, 1]) {
        const kk = new T.Mesh(new T.ConeGeometry(0.035, 0.07, 4), m); kk.position.set(s * 0.06, y + 0.015, z); kk.rotation.z = -s * 0.35; g.add(golge(kk));
        const ki = new T.Mesh(new T.ConeGeometry(0.022, 0.045, 4), ic); ki.position.set(s * 0.06, y + 0.008, z + 0.01); ki.rotation.z = -s * 0.35; g.add(ki);
      }
    }
  }
  function modelVarMi() { return !!(window.Model && Model.hazir()); }
  function kisiKur(cfg) {
    if (modelVarMi()) { try { return Model.kur(cfg, aksesuar3); } catch (e) { console.warn('model kurulamadı', e); } }
    return karakterKur(cfg);
  }
  function kisiGuncelle(K, dt, z) { if (K.userData.model) Model.guncelle(K, dt); else karakterGuncelle(K, dt, z); }
  function kisiOynat(K, ad, sure) { if (!K) return; if (K.userData.model) Model.oynat(K, ad, sure); else K.userData.anim = { ad, t: 0, sure: sure || 0 }; }
  const ANNE = { boy: 162, kilo: 72, siluet: 'a', ten: '#eac0a0', sac: 'topuz', sacRenk: '#3b2a22', sakal: 'yok', gozluk: 'yuvarlak', aksesuar: 'yok', kiyafet: 'hirka', yas: 56 };
  let sonCfg = null;
  function anneKur() {
    const eski = anne;
    anne = kisiKur(ANNE);
    if (!anne.userData.model) anne.traverse(o => { if (o.material && o.material.color && o.material.color.getHexString() === '6d7280') o.material.color.set('#7d4e57'); });
    anne.position.set(0.82, 0, -1.95); anne.visible = eski ? eski.visible : false;
    if (eski) { anne.position.copy(eski.position); scene.remove(eski); }
    scene.add(anne);
  }

  /* ---------- kedi ---------- */
  function kediKur() {
    const G = new T.Group();
    const m = malz('#e0883a'), b = malz('#fff4e6'), ko = malz('#1a1414');
    const govde = kapsul(0.085, 0.2, m); govde.rotation.z = Math.PI / 2; govde.position.y = 0.2; G.add(govde);
    const gogus = kure(0.07, b); gogus.position.set(0.13, 0.19, 0); G.add(gogus);
    const bas = new T.Group(); bas.position.set(0.22, 0.3, 0); G.add(bas);
    const kafa = kure(0.08, m); kafa.scale.set(1, 0.9, 1.05); bas.add(kafa);
    for (const s of [-1, 1]) {
      const k = new T.Mesh(new T.ConeGeometry(0.03, 0.06, 4), m); k.position.set(0, 0.075, s * 0.045); k.rotation.x = s * 0.3; bas.add(golge(k));
      const g = kure(0.012, ko, 8, 6); g.position.set(0.07, 0.015, s * 0.03); bas.add(g);
    }
    const ayaklar = [];
    for (const [x, z] of [[0.11, 0.05], [0.11, -0.05], [-0.11, 0.05], [-0.11, -0.05]]) {
      const a = kapsul(0.025, 0.1, m); a.position.set(x, 0.08, z); G.add(a); ayaklar.push(a);
    }
    const kuyruk = kapsul(0.02, 0.22, m); kuyruk.position.set(-0.2, 0.33, 0); kuyruk.rotation.z = -0.5; G.add(kuyruk);
    G.userData = { ayaklar, kuyruk, bas };
    return G;
  }

  /* ---------- oda ---------- */
  function odaKur() {
    const zemin = new T.Mesh(new T.PlaneGeometry(7, 6), malz('#ffffff', {
      map: doku(256, 256, (g, w, h) => {
        for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#3b2a22' : '#33251e'; g.fillRect(0, i * 32, w, 32); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, i * 32, w, 2); g.fillRect((i * 97) % w, i * 32, 2, 32); }
        g.fillStyle = 'rgba(255,255,255,.025)'; for (let i = 0; i < 400; i++) g.fillRect((i * 53) % w, (i * 97) % h, 30, 1);
      }), roughness: 0.45
    }));
    zemin.material.map.wrapS = zemin.material.map.wrapT = T.RepeatWrapping; zemin.material.map.repeat.set(3, 3);
    zemin.rotation.x = -Math.PI / 2; zemin.receiveShadow = true; scene.add(zemin);

    // koyu, kadifemsi duvar: ince damask deseni
    const duvarMalz = malz('#ffffff', {
      map: doku(256, 256, (g, w, h) => {
        g.fillStyle = '#2a2030'; g.fillRect(0, 0, w, h);
        g.strokeStyle = 'rgba(255,190,230,.045)'; g.lineWidth = 2;
        for (let x = 0; x < w; x += 64) for (let y = 0; y < h; y += 64) {
          g.beginPath(); g.moveTo(x + 32, y + 6); g.quadraticCurveTo(x + 56, y + 32, x + 32, y + 58); g.quadraticCurveTo(x + 8, y + 32, x + 32, y + 6); g.stroke();
        }
      }), roughness: 0.95
    });
    duvarMalz.map.wrapS = duvarMalz.map.wrapT = T.RepeatWrapping; duvarMalz.map.repeat.set(4, 2);
    const arka = new T.Mesh(new T.PlaneGeometry(7, 2.8), duvarMalz); arka.position.set(0, 1.4, -1.6); arka.receiveShadow = true; scene.add(arka);
    const sol = new T.Mesh(new T.PlaneGeometry(6, 2.8), duvarMalz); sol.rotation.y = Math.PI / 2; sol.position.set(-3, 1.4, 1.4); sol.receiveShadow = true; scene.add(sol);
    const supurge = kutu(7, 0.1, 0.03, malz('#17111b')); supurge.position.set(0, 0.05, -1.585); scene.add(supurge);

    // pencere ve gece manzarası
    const manzara = doku(512, 320, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0b0a24'); gr.addColorStop(1, '#3b2353'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = '#fff'; for (let i = 0; i < 60; i++) g.fillRect((i * 137) % w, (i * 53) % (h * 0.5), 1.5, 1.5);
      g.fillStyle = '#f4e9c8'; g.beginPath(); g.arc(410, 60, 22, 0, 7); g.fill(); g.fillStyle = '#0d0b26'; g.beginPath(); g.arc(420, 54, 20, 0, 7); g.fill();
      g.fillStyle = '#171225';
      g.fillRect(250, 150, 26, 120); g.beginPath(); g.moveTo(246, 150); g.lineTo(263, 110); g.lineTo(280, 150); g.fill();
      for (let x = 0; x < w; x += 34) { const bh = 60 + ((x * 31) % 90); g.fillStyle = '#171225'; g.fillRect(x, h - bh, 30, bh);
        for (let y = h - bh + 8; y < h - 6; y += 14) for (let wx = x + 5; wx < x + 26; wx += 9) if (((wx * y) % 7) < 3) { g.fillStyle = '#ffcf6b'; g.fillRect(wx, y, 4, 6); } }
      g.strokeStyle = '#ff9fd1'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 230); g.quadraticCurveTo(160, 205, 330, 232); g.stroke();
      g.fillStyle = '#ff9fd1'; for (let x = 10; x < 330; x += 20) g.fillRect(x, 222 + Math.abs(x - 165) * 0.06, 3, 3);
    });
    const WX = -0.75, WW = 1.2;
    const pencere = new T.Mesh(new T.PlaneGeometry(WW, 0.9), parlak('#ffffff')); pencere.material.map = manzara; pencere.position.set(WX, 1.6, -1.59); scene.add(pencere);
    const cer = malz('#241b28', { roughness: 0.6 });
    for (const [w, h, x, y] of [[WW + 0.1, 0.06, WX, 2.06], [WW + 0.1, 0.06, WX, 1.14], [0.06, 0.98, WX - WW / 2 - 0.03, 1.6], [0.06, 0.98, WX + WW / 2 + 0.03, 1.6], [0.04, 0.9, WX, 1.6]]) {
      const p = kutu(w, h, 0.06, cer); p.position.set(x, y, -1.56); scene.add(p);
    }
    const pervaz = kutu(WW + 0.3, 0.04, 0.24, cer); pervaz.position.set(WX, 1.1, -1.48); scene.add(pervaz);
    O.pervaz = { x: WX, w: WW };
    // kadife perde: pencerenin çoğunu kapatır, ortada şehir ışığı sızar
    const perde = malz('#ffffff', { roughness: 0.9, map: doku(128, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); for (let i = 0; i <= 8; i++) gr.addColorStop(i / 8, i % 2 ? '#5a0f22' : '#360814'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) });
    for (const [x, gen] of [[WX - WW / 2 + 0.2, 0.7], [WX + WW / 2 - 0.2, 0.7]]) { const p = kutu(gen, 2.3, 0.05, perde); p.position.set(x, 1.4, -1.545); scene.add(p); }
    const kornis = silindir(0.015, 0.015, WW + 0.8, malz('#b8963e', { metalness: 0.8, roughness: 0.3 }), 8); kornis.rotation.z = Math.PI / 2; kornis.position.set(WX, 2.56, -1.48); scene.add(kornis);
    // neon kalp ve tabela (parlama efektiyle ışır)
    const kalp = new T.Shape(); const ks = 0.17;
    kalp.moveTo(0, -ks); kalp.bezierCurveTo(-ks * 1.6, -ks * 0.1, -ks * 0.9, ks * 1.2, 0, ks * 0.45); kalp.bezierCurveTo(ks * 0.9, ks * 1.2, ks * 1.6, -ks * 0.1, 0, -ks);
    const noktalar = kalp.getSpacedPoints(80).map(p => new T.Vector3(p.x, p.y, 0));
    const neonMalz = new T.MeshBasicMaterial({ color: new T.Color(3.2, 0.35, 1.5), toneMapped: false });
    const neonKalp = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(noktalar, true), 120, 0.011, 8, true), neonMalz);
    neonKalp.position.set(0.05, 2.25, -1.57); scene.add(neonKalp); O.neon = neonKalp;
    const tabela = new T.Mesh(new T.PlaneGeometry(0.9, 0.22), new T.MeshBasicMaterial({ transparent: true, toneMapped: false, color: new T.Color(2.4, 1.6, 2.6),
      map: doku(512, 128, (g, w, h) => { g.font = 'italic 700 74px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ff4fb0'; g.shadowBlur = 18; g.fillStyle = '#ffd6f0'; g.fillText('DansKasa', w / 2, h / 2 + 4); }) }));
    tabela.position.set(-0.75, 2.33, -1.4); scene.add(tabela);
    const neonIsik = new T.PointLight(0xff3fa4, 1.0, 3.2, 2); neonIsik.position.set(0, 2.1, -1.2); scene.add(neonIsik); O.neonIsik = neonIsik;

    // çerçeveli soyut tablo
    const tablo = new T.Group(); tablo.position.set(1.95, 1.65, -1.58); scene.add(tablo);
    const cerceve = kutu(0.62, 0.82, 0.03, malz('#0d0b10', { roughness: 0.4 })); tablo.add(cerceve);
    const resim = new T.Mesh(new T.PlaneGeometry(0.54, 0.74), malz('#ffffff', { map: doku(220, 300, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1b0f24'); gr.addColorStop(1, '#4a0f2a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#e8b4c8'; g.lineWidth = 3; g.beginPath(); g.moveTo(70, 40); g.bezierCurveTo(150, 90, 40, 160, 120, 210); g.bezierCurveTo(170, 245, 120, 280, 90, 290); g.stroke();
      g.fillStyle = 'rgba(255,200,220,.12)'; g.beginPath(); g.arc(140, 110, 50, 0, 7); g.fill();
    }) }));
    resim.position.z = 0.017; tablo.add(resim);

    // kapı (arkada, izleyici annenin girişini görür)
    const kapiCerceve = malz('#1a1420');
    for (const [w, h, x, y] of [[0.08, 2.1, 0.35, 1.05], [0.08, 2.1, 1.29, 1.05], [1.02, 0.08, 0.82, 2.12]]) { const p = kutu(w, h, 0.08, kapiCerceve); p.position.set(x, y, -1.56); scene.add(p); }
    const mentese = new T.Group(); mentese.position.set(0.39, 0, -1.56); scene.add(mentese); O.kapi = mentese;
    const kanat = kutu(0.86, 2.06, 0.05, malz('#2c2230', { roughness: 0.6 })); kanat.position.set(0.43, 1.03, 0); mentese.add(kanat);
    const kol = kure(0.035, malz('#d4af37', { metalness: 0.8, roughness: 0.3 })); kol.position.set(0.78, 1.0, 0.05); mentese.add(kol);
    const kilit = kutu(0.08, 0.12, 0.04, malz('#9aa0a6', { metalness: 0.7, roughness: 0.3 })); kilit.position.set(0.78, 1.15, 0.05); mentese.add(kilit); O.kilit = kilit;
    const karanlikIc = new T.Mesh(new T.PlaneGeometry(0.88, 2.08), malz('#1a1420')); karanlikIc.position.set(0.82, 1.04, -1.62); scene.add(karanlikIc);

    // yatak: saten çarşaf, kapitone başlık, tüylü örtü
    const yatak = new T.Group(); yatak.position.set(-2.15, 0, -0.45); scene.add(yatak);
    const taban = kutu(1.45, 0.32, 2.05, malz('#17111b', { roughness: 0.7 })); taban.position.y = 0.16; yatak.add(taban);
    const basl = kutu(1.5, 1.05, 0.12, malz('#ffffff', { roughness: 0.85, map: doku(128, 128, (g, w, h) => { g.fillStyle = '#2b1d33'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.45)'; for (let x = 16; x < w; x += 32) for (let y = 16; y < h; y += 32) { g.beginPath(); g.arc(x + (y / 32 % 2) * 16, y, 3, 0, 7); g.fill(); } }) }));
    basl.position.set(0, 0.72, -1.02); yatak.add(basl);
    const saten = malz('#5c0d1d', { roughness: 0.32 });
    const yatakS = kutu(1.38, 0.2, 1.98, saten); yatakS.position.y = 0.42; yatak.add(yatakS);
    const yorgan = kutu(1.42, 0.07, 1.25, saten); yorgan.position.set(0, 0.54, 0.34); yorgan.rotation.x = 0.01; yatak.add(yorgan);
    const kurk = kutu(1.44, 0.06, 0.42, malz('#e9e2dc', { roughness: 1 })); kurk.position.set(0, 0.58, 0.72); yatak.add(kurk);
    [['#0e0b10', -0.36], ['#e6a9bd', 0.34], ['#0e0b10', 0.0]].forEach(([r, x], i) => { const y = kapsul(0.09, 0.32, malz(r, { roughness: 0.35 })); y.rotation.z = Math.PI / 2; y.position.set(x, 0.62 + (i === 2 ? 0.05 : 0), -0.8 + (i === 2 ? 0.12 : 0)); yatak.add(y); });

    // komodin, mumlar
    const komodin = new T.Group(); komodin.position.set(-1.15, 0, -1.25); scene.add(komodin);
    const kmd = kutu(0.45, 0.55, 0.38, malz('#17111b', { roughness: 0.5 })); kmd.position.y = 0.275; komodin.add(kmd);
    O.mumlar = [];
    [[-0.12, 0.16], [0.02, 0.11], [0.13, 0.2]].forEach(([x, uz]) => {
      const m = silindir(0.035, 0.035, uz, malz('#efe3cf', { roughness: 0.8 })); m.position.set(x, 0.55 + uz / 2, 0.02); komodin.add(m);
      const alev = new T.Mesh(new T.SphereGeometry(0.012, 8, 6), new T.MeshBasicMaterial({ color: new T.Color(4, 1.8, 0.4), toneMapped: false })); alev.scale.y = 1.8; alev.position.set(x, 0.55 + uz + 0.02, 0.02); komodin.add(alev); O.mumlar.push(alev);
    });
    const mumIsik = new T.PointLight(0xff9a4a, 0.7, 3.2, 2); mumIsik.position.set(-1.15, 0.85, -1.1); scene.add(mumIsik); O.mumIsik = mumIsik;

    // makyaj masası (ampullü ayna)
    const masa = new T.Group(); masa.position.set(2.3, 0, 0.6); masa.rotation.y = -0.5; scene.add(masa);
    const ust = kutu(1.0, 0.05, 0.45, malz('#e8dfe6', { roughness: 0.35 })); ust.position.y = 0.75; masa.add(ust);
    for (const [x, z] of [[-0.45, -0.18], [0.45, -0.18], [-0.45, 0.18], [0.45, 0.18]]) { const a = silindir(0.015, 0.015, 0.75, malz('#b8963e', { metalness: 0.8, roughness: 0.3 }), 8); a.position.set(x, 0.375, z); masa.add(a); }
    const ayna = kutu(0.7, 0.85, 0.03, malz('#c9d2dc', { metalness: 1, roughness: 0.08 })); ayna.position.set(0, 1.22, -0.2); masa.add(ayna);
    const ampul = new T.MeshBasicMaterial({ color: new T.Color(2.4, 2.1, 1.7), toneMapped: false });
    for (let i = 0; i < 5; i++) for (const s of [-1, 1]) { const b = new T.Mesh(new T.SphereGeometry(0.025, 8, 6), ampul); b.position.set(s * 0.38, 0.85 + i * 0.18, -0.18); masa.add(b); }
    [['#c43c6a', -0.25], ['#1b1b1b', -0.1], ['#f2d1c4', 0.15]].forEach(([r, x]) => { const sise = silindir(0.025, 0.03, 0.12, malz(r, { roughness: 0.3 })); sise.position.set(x, 0.84, 0.05); masa.add(sise); });

    // tüylü beyaz halı
    const hali = new T.Mesh(new T.CircleGeometry(0.95, 48), malz('#ffffff', { roughness: 1, map: doku(256, 256, (g, w) => { g.fillStyle = '#9d948f'; g.fillRect(0, 0, w, w); for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${i % 2 ? 255 : 150},${i % 2 ? 255 : 140},${i % 2 ? 255 : 140},.18)`; g.fillRect((i * 73) % w, (i * 151) % w, 1, 3); } }) }));
    hali.rotation.x = -Math.PI / 2; hali.position.set(0, 0.005, 0.1); hali.receiveShadow = true; scene.add(hali);

    // telefon: tripod ya da kitap yığını
    const tel = new T.Group(); tel.position.set(0, 0, 1.45); scene.add(tel); O.telefon = tel;
    const telefon = kutu(0.08, 0.16, 0.012, malz('#16161c', { roughness: 0.3 })); telefon.name = 'tel'; tel.add(telefon);
    const tripod = new T.Group(); tel.add(tripod); O.tripod = tripod;
    for (let i = 0; i < 3; i++) { const a = silindir(0.01, 0.012, 1.45, malz('#22222a'), 6); const ang = i * 2.094; a.position.set(Math.cos(ang) * 0.15, 0.7, Math.sin(ang) * 0.15); a.rotation.set(Math.sin(ang) * 0.2, 0, -Math.cos(ang) * 0.2); tripod.add(a); }
    const yigin = new T.Group(); tel.add(yigin); O.kitapYigini = yigin;
    const tabure = silindir(0.18, 0.16, 0.7, malz('#1c1620', { roughness: 0.6 }), 20); tabure.position.y = 0.35; yigin.add(tabure);
    const kiskac = silindir(0.008, 0.008, 0.3, malz('#2a2a30', { metalness: 0.6, roughness: 0.4 }), 6); kiskac.position.set(0, 0.84, 0); yigin.add(kiskac);

    // ring light
    const ring = new T.Group(); ring.position.set(0, 1.5, 1.5); scene.add(ring); O.ring = ring;
    const halka = new T.Mesh(new T.TorusGeometry(0.24, 0.022, 10, 40), parlak('#fff7e8')); ring.add(halka); O.ringHalka = halka;
    const ringIsik = new T.PointLight(0xfff2e0, 0, 6, 1.5); ringIsik.position.set(0, 0, -0.1); ring.add(ringIsik); O.ringIsik = ringIsik;

    // LED şerit
    const led = new T.Group(); scene.add(led); O.led = led;
    const ledCubuk = new T.Mesh(new T.BoxGeometry(6.8, 0.035, 0.035), new T.MeshBasicMaterial({ color: new T.Color(2.6, 0.2, 1.1), toneMapped: false })); ledCubuk.position.set(0, 2.72, -1.56); led.add(ledCubuk);
    for (const x of [-2, 2]) { const l = new T.PointLight(0xc2185b, 0.7, 4.5, 2); l.position.set(x, 2.5, -1.2); led.add(l); }

    // tarz eşyaları
    const kitaplik = new T.Group(); kitaplik.position.set(-2.45, 0, -1.4); scene.add(kitaplik); O.tarz_entel = kitaplik;
    const raf = kutu(0.9, 1.9, 0.32, malz('#5a4030')); raf.position.y = 0.95; kitaplik.add(raf);
    for (let s = 0; s < 4; s++) for (let i = 0; i < 7; i++) { const k = kutu(0.08, 0.3 + (i % 3) * 0.04, 0.24, malz(['#c0392b', '#2c3e50', '#d4ac0d', '#1e8449', '#7d3c98'][(i + s) % 5])); k.position.set(-0.33 + i * 0.1, 0.32 + s * 0.45, 0.06); kitaplik.add(k); }
    const ayi = new T.Group(); ayi.position.set(-1.65, 0, -1.1); scene.add(ayi); O.tarz_tatli = ayi;
    const pm = malz('#f4a6c6');
    const ag = kure(0.32, pm); ag.position.y = 0.32; ayi.add(ag);
    const ab = kure(0.22, pm); ab.position.y = 0.78; ayi.add(ab);
    for (const s of [-1, 1]) { const ku = kure(0.08, pm); ku.position.set(s * 0.16, 0.96, 0); ayi.add(ku); const g = kure(0.025, malz('#222')); g.position.set(s * 0.07, 0.82, 0.19); ayi.add(g); }
    const lav = new T.Group(); lav.position.set(1.75, 0, -1.35); scene.add(lav); O.tarz_gizemli = lav;
    const lavA = silindir(0.06, 0.1, 0.12, malz('#2a2233')); lavA.position.y = 0.06; lav.add(lavA);
    const lavC = new T.Mesh(new T.CylinderGeometry(0.05, 0.08, 0.38, 16), parlak('#a24bff')); lavC.position.y = 0.31; lav.add(lavC);
    const lavI = new T.PointLight(0xa24bff, 0.9, 3, 2); lavI.position.y = 0.4; lav.add(lavI);
    const dambil = new T.Group(); dambil.position.set(1.2, 0, -0.5); scene.add(dambil); O.tarz_sporcu = dambil;
    for (const z of [0, 0.3]) { const d = new T.Group(); d.position.z = z; dambil.add(d); const s = silindir(0.02, 0.02, 0.3, malz('#888', { metalness: 0.7 })); s.rotation.z = Math.PI / 2; s.position.y = 0.07; d.add(s); for (const x of [-0.13, 0.13]) { const p = silindir(0.07, 0.07, 0.06, malz('#1a1a1a')); p.rotation.z = Math.PI / 2; p.position.set(x, 0.07, 0); d.add(p); } }
    const tavuk = new T.Group(); tavuk.position.set(-0.45, 1.12, -1.45); scene.add(tavuk); O.tarz_komik = tavuk;
    const tm = malz('#ffd23f', { roughness: 0.4 });
    const tg = kapsul(0.07, 0.35, tm); tg.rotation.z = 1.2; tg.position.set(0, 0.12, 0); tavuk.add(tg);
    const tb = kure(0.06, tm); tb.position.set(0.22, 0.24, 0); tavuk.add(tb);
    const tgag = new T.Mesh(new T.ConeGeometry(0.025, 0.07, 6), malz('#ff7b00')); tgag.rotation.z = -Math.PI / 2; tgag.position.set(0.3, 0.24, 0); tavuk.add(tgag);

    // ışıklar
    scene.add(new T.HemisphereLight(0x8c7cb8, 0x1a1020, 0.32));
    const lamba = new T.PointLight(0xffc28a, 0.9, 9, 1.6); lamba.position.set(-1.2, 2.1, 1.1); lamba.castShadow = true; lamba.shadow.mapSize.set(512, 512); lamba.shadow.bias = -0.002; scene.add(lamba); O.lamba = lamba;
    const ay = new T.DirectionalLight(0xff4fa8, 0.45); ay.position.set(0.5, 2.6, -2.5); scene.add(ay); // pembe arka ışık (saç ve omuz kenarı)
    const dolgu = new T.PointLight(0xffe6d0, 0.35, 5, 2); dolgu.position.set(0, 1.6, 1.6); scene.add(dolgu); O.dolgu = dolgu;
  }

  function odaUygula(env, tarz) {
    if (!O.tripod) return;
    O.tripodVar = !!env.tripod; O.tripod.visible = O.tripodVar; O.kitapYigini.visible = !env.tripod;
    O.telefon.getObjectByName('tel').position.set(0, env.tripod ? 1.48 : 1.02, 0);
    O.ring.visible = !!env.ringlight; O.ringIsik.intensity = env.ringlight ? 1.1 : 0;
    O.led.visible = !!env.led;
    O.kilit.visible = !!env.kilit;
    for (const t of ['entel', 'tatli', 'gizemli', 'sporcu', 'komik']) O['tarz_' + t].visible = !!env['tarz_' + t];
  }

  /* ---------- kamera ---------- */
  function kameraHedef() {
    const h = oyuncu ? oyuncu.userData.h : 1;
    if (kameraMod === 'kabin') { hedefPos.set(0, 1.0 * h + 0.1, 3.1); hedefBak.set(0, 0.95 * h, 0); camera.fov = 32; }
    else if (kameraMod === 'yayin') { hedefPos.set(0, 1.42 * h + 0.12, 1.5); hedefBak.set(0, 1.3 * h + 0.1, -0.3); camera.fov = 44; }
    else if (kameraMod === 'foto_ayna') { hedefPos.set(0.95, 1.42 * h + 0.06, 1.25); hedefBak.set(0, 1.18 * h + 0.06, 0); camera.fov = 36; }
    else if (kameraMod === 'foto_yatak') { hedefPos.set(-0.55, 0.95, 1.55); hedefBak.set(0.05, 1.2 * h + 0.04, -0.2); camera.fov = 40; }
    else if (kameraMod === 'foto_mum') { hedefPos.set(0.35, 1.5 * h + 0.1, 0.95); hedefBak.set(0, 1.42 * h + 0.08, 0); camera.fov = 32; }
    else if (kameraMod === 'foto_neon') { hedefPos.set(0, 1.25 * h + 0.06, 1.75); hedefBak.set(0, 1.55 * h, -0.6); camera.fov = 44; }
    else if (kameraMod === 'yakin') { hedefPos.set(0.5, 1.5 * h + 0.1, 1.2); hedefBak.set(0, 1.45 * h + 0.1, 0); camera.fov = 35; }
    else { hedefPos.set(2.5, 2.25, 3.3); hedefBak.set(-0.3, 1.0, -0.5); camera.fov = 48; }
    camera.updateProjectionMatrix();
  }

  /* ---------- döngü ---------- */
  function kare() {
    if (!calisiyor) return;
    requestAnimationFrame(kare);
    if (document.hidden) return;
    const dt = Math.min(0.05, saat.getDelta()), z = saat.elapsedTime;
    if (oyuncu) {
      // karakter kameraya bakar (mimik katmanı başını ve gözlerini buna göre çevirir)
      oyuncu.userData.bakHedef = kamPos;
      kisiGuncelle(oyuncu, dt, z);
      if (kameraMod === 'kabin') {
        if (!surukle) donus += dt * 0.25;
        oyuncu.rotation.y += (Math.sin(donus) * 0.9 - oyuncu.rotation.y) * Math.min(1, dt * 6);
      } else oyuncu.rotation.y += (0 - oyuncu.rotation.y) * Math.min(1, dt * 6);
    }
    if (anne) {
      kisiGuncelle(anne, dt, z);
      if (anneDurum) {
        anneDurum.t += dt;
        const ac = anneDurum.giris ? clamp(anneDurum.t / 0.6, 0, 1) : 1 - clamp(anneDurum.t / 0.6, 0, 1);
        O.kapi.rotation.y = -ac * 1.35;
        anne.visible = ac > 0.05;
        anne.position.x = 0.82; anne.position.z = -1.95 + ac * 0.75;
        if (!anneDurum.giris && anneDurum.t > 0.7) anneDurum = null;
      }
    }
    if (kedi) {
      const u = kedi.userData;
      u.kuyruk.rotation.z = -0.5 + Math.sin(z * 3) * 0.25;
      if (kediYuru) {
        kediYuru.t += dt;
        const k = clamp(kediYuru.t / kediYuru.sure, 0, 1);
        kedi.position.x = O.pervaz.x - O.pervaz.w / 2 - 0.1 + k * (O.pervaz.w + 0.2); kedi.position.z = -1.45;
        u.ayaklar.forEach((a, i) => { a.rotation.z = Math.sin(z * 12 + i * 1.6) * 0.5; });
        if (k >= 1) { kediYuru = null; kedi.visible = false; }
      }
    }
    // ışık titremesi ve karanlık
    if (O.lamba) {
      const hedefL = 0.95 * (1 - Math.max(karanlik, mumModu) * 0.75);
      O.lamba.intensity = isikTitreme > 0 ? hedefL * (0.3 + Math.random() * 0.8) : hedefL;
      if (isikTitreme > 0) isikTitreme -= dt;
    }
    if (O.ringIsik && O.ring.visible) O.ringIsik.intensity = 1.1;
    // yayında kameranın önündeki telefon ve halka gizlenir
    if (O.telefon) { const y = kameraMod === 'yayin'; O.telefon.visible = kameraMod !== 'kabin' && !kameraMod.startsWith('foto'); O.telefon.getObjectByName('tel').visible = !y; O.ringHalka.visible = !y; O.tripod.visible = O.tripodVar && !y; }
    // kamera
    kameraHedef();
    const kk = 1 - Math.exp(-4 * dt);
    kamPos.lerp(hedefPos, kk); kamBak.lerp(hedefBak, kk);
    camera.position.copy(kamPos);
    if (kameraMod === 'yayin' && !azalt) {
      const sallanma = O.tripodVar ? 0.002 : 0.008;
      camera.position.x += Math.sin(z * 1.3) * sallanma; camera.position.y += Math.sin(z * 1.7) * sallanma;
    }
    camera.lookAt(kamBak);
    egiklik += (egiklikHedef - egiklik) * Math.min(1, dt * 5);
    camera.rotateZ(egiklik);
    if (O.mumlar) { const f = 0.85 + Math.sin(z * 13) * 0.08 + Math.sin(z * 7.3) * 0.07 + (Math.random() - 0.5) * 0.06; O.mumIsik.intensity = 0.7 * f; O.mumlar.forEach((m, i) => { m.scale.y = 1.6 + Math.sin(z * 11 + i) * 0.25; }); }
    if (kompozit) {
      kameraEfekt.uniforms.uZaman.value = z % 100;
      kameraEfekt.uniforms.uGuc.value += ((kameraMod === 'yayin' ? 1 : 0.55) - kameraEfekt.uniforms.uGuc.value) * Math.min(1, dt * 4);
      kompozit.render(dt);
    } else renderer.render(scene, camera);
    // fotoğraf: çizimden hemen sonra tuvali oku ve küçült
    if (fotoIste) {
      const cb = fotoIste; fotoIste = null;
      try {
        const src = renderer.domElement, W = 300, H = 400, c = document.createElement('canvas'); c.width = W; c.height = H;
        const g = c.getContext('2d'), sw = src.width, sh = src.height, oran = Math.min(sw / W, sh / H);
        g.drawImage(src, (sw - W * oran) / 2, (sh - H * oran) / 2, W * oran, H * oran, 0, 0, W, H);
        cb(c.toDataURL('image/jpeg', 0.72));
      } catch (e) { cb(null); }
    }
  }

  function boyutla() {
    if (!kap) return;
    const w = kap.clientWidth, h = kap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    if (kompozit) { kompozit.setSize(w, h); kameraEfekt.uniforms.uCoz.value.set(w, h); }
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  /* ---------- webcam görünümü: parlama, kumlanma, köşe karartması, renk ---------- */
  function kompozitKur() {
    if (!T.EffectComposer || !T.RenderPass || !T.ShaderPass || !T.UnrealBloomPass) return;
    try {
      kompozit = new T.EffectComposer(renderer);
      kompozit.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      kompozit.addPass(new T.RenderPass(scene, camera));
      bloom = new T.UnrealBloomPass(new T.Vector2(256, 256), 0.6, 0.55, 0.85);
      kompozit.addPass(bloom);
      kameraEfekt = new T.ShaderPass({
        uniforms: { tDiffuse: { value: null }, uZaman: { value: 0 }, uGuc: { value: 0.55 }, uCoz: { value: new T.Vector2(512, 512) } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `uniform sampler2D tDiffuse; uniform float uZaman, uGuc; uniform vec2 uCoz; varying vec2 vUv;
          void main(){
            vec2 c = vUv - 0.5; float ca = 0.0035 * uGuc * dot(c, c) * 4.0;
            vec3 col = vec3(texture2D(tDiffuse, vUv + c * ca).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - c * ca).b);
            float l = dot(col, vec3(0.299, 0.587, 0.114));
            col *= mix(vec3(1.0), vec3(1.06, 0.97, 1.05), 0.6);
            col += vec3(0.010, 0.0, 0.016) * (1.0 - l);
            col = mix(vec3(l), col, 1.1);
            // sinematik ton: gölgeler soğuk-mor, ışıklar şeftali; hafif S eğrisi
            col *= mix(vec3(0.93, 0.95, 1.08), vec3(1.07, 1.0, 0.93), smoothstep(0.04, 0.6, l));
            float l2 = clamp(dot(col, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);
            col *= mix(1.0, (l2 * l2 * (3.0 - 2.0 * l2) + 0.002) / (l2 + 0.002), 0.22);
            col *= mix(1.0, smoothstep(0.95, 0.2, length(c * vec2(1.0, 1.15))), 0.6 * uGuc);
            float n = fract(sin(dot(floor(vUv * uCoz) + uZaman * 61.0, vec2(12.9898, 78.233))) * 43758.5453);
            col += (n - 0.5) * 0.016 * uGuc * (0.5 + l);
            gl_FragColor = linearToOutputTexel(vec4(max(col, 0.0), 1.0));
          }`
      });
      kompozit.addPass(kameraEfekt);
    } catch (e) { console.warn('efekt zinciri kurulamadı', e); kompozit = null; }
  }

  /* ---------- dış API ---------- */
  window.Sahne = {
    hazir: false,
    baslat(konteyner) {
      kap = konteyner;
      try {
        renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      } catch (e) { return false; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputEncoding = T.sRGBEncoding;
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
      renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
      kap.prepend(renderer.domElement);
      scene = new T.Scene(); scene.background = new T.Color('#0d0910');
      // yansımalar için yumuşak ortam (saten, cilt): malzemelere düşük şiddetle verilir
      if (T.RoomEnvironment) { try { const pm = new T.PMREMGenerator(renderer); window.__lbdEnv = pm.fromScene(new T.RoomEnvironment(), 0.04).texture; pm.dispose(); } catch (e) { } }
      camera = new T.PerspectiveCamera(45, 1, 0.05, 50);
      saat = new T.Clock();
      odaKur();
      kompozitKur();
      kedi = kediKur(); kedi.visible = false; scene.add(kedi);
      anneKur();
      if (window.ResizeObserver) new ResizeObserver(boyutla).observe(kap); else window.addEventListener('resize', boyutla);
      boyutla();
      // sürükleyerek döndürme (karakter oluşturucu)
      const el = renderer.domElement;
      el.addEventListener('pointerdown', e => { if (kameraMod === 'kabin') { surukle = { x: e.clientX, d: donus }; el.setPointerCapture(e.pointerId); } });
      el.addEventListener('pointermove', e => { if (surukle) donus = surukle.d + (e.clientX - surukle.x) * 0.01; });
      el.addEventListener('pointerup', () => { surukle = null; });
      calisiyor = true; this.hazir = true; kare();
      // hazır modeller arkadan yüklenir; gelince karakterler yenilenir
      if (window.Model) Model.yukle().then(() => { anneKur(); if (sonCfg) this.karakter(sonCfg); if (this.modelGeldi) this.modelGeldi(); }).catch(e => console.warn('3D modeller yüklenemedi, basit karakter kullanılıyor', e));
      return true;
    },
    tasi(konteyner) { if (!renderer || kap === konteyner) return; kap = konteyner; kap.prepend(renderer.domElement); boyutla(); },
    karakter(cfg) {
      if (!scene) return;
      if (oyuncu) { scene.remove(oyuncu); if (!oyuncu.userData.model) oyuncu.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
      sonCfg = cfg;
      const anim = oyuncu ? oyuncu.userData.anim : null;
      oyuncu = kisiKur(cfg); scene.add(oyuncu);
      if (anim && anim.ad !== 'bekle') kisiOynat(oyuncu, anim.ad, anim.sure ? Math.max(0.1, anim.sure - anim.t) : 0);
    },
    oda(env, tarz) { odaUygula(env || {}, tarz); },
    kamera(mod) { kameraMod = mod; },
    oynat(ad, sure) { kisiOynat(oyuncu, ad, sure); },
    anneGir() { anneDurum = { giris: true, t: 0 }; kisiOynat(anne, 'sok', 0); },
    anneCik() { if (anneDurum || (anne && anne.visible)) anneDurum = { giris: false, t: 0 }; },
    kediGec(sure = 6) { if (!kedi) return; kedi.visible = true; kedi.position.set(O.pervaz.x - O.pervaz.w / 2, 1.12, -1.45); kedi.scale.setScalar(0.9); kediYuru = { t: 0, sure }; },
    titret(sn = 5) { isikTitreme = sn; },
    karart(k) { karanlik = clamp(k, 0, 1); },
    egil(v) { egiklikHedef = v; },
    durdur() { calisiyor = false; },
    fotograf(cb) { fotoIste = cb; if (!calisiyor) this.devam(); },
    mum(k) { mumModu = k ? 0.6 : 0; },
    devam() { if (!calisiyor && renderer) { calisiyor = true; saat.getDelta(); kare(); } }
  };
})();
