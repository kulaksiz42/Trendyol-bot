/* Başbakan — şehir ziyareti: 3D şehir maketi, noktalarda yürüyüş ve halkla konuşma. */
'use strict';
window.Sehir = (function () {
  const V = window.VERI;
  let R = null, sahne, kamera, kontrol, el, S, il, akt, bitis, mod = 'maket', oyuncu, npcler = [], hedefPOI = null, joy = { x: 0, y: 0 }, tus = {}, konusuldu = 0, son = 0, anim = null;
  const POI = {
    meydan: { ad: 'Meydan', ikon: '📣', x: 0, z: 0 },
    carsi: { ad: 'Çarşı', ikon: '🛍️', x: -26, z: 14 },
    fabrika: { ad: 'Sanayi bölgesi', ikon: '🏭', x: 34, z: -28 },
    univ: { ad: 'Üniversite', ikon: '🎓', x: -30, z: -26 }
  };
  const BOLGE_RENK = { marmara: '#8fae6b', ege: '#b5b46b', akdeniz: '#bfa66a', ic: '#c9b27c', karadeniz: '#5f8d4e', dogu: '#a99a7a', gdogu: '#c6a571' };
  // kıyı şehirlerinde denizin yönü (x, z işareti) ve göl
  const DENIZ = { 'İstanbul': 'bogaz', 'İzmir': 'bati', 'Antalya': 'guney', 'Mersin': 'guney', 'Muğla': 'guney', 'Trabzon': 'kuzey', 'Samsun': 'kuzey', 'Rize': 'kuzey', 'Ordu': 'kuzey', 'Giresun': 'kuzey', 'Zonguldak': 'kuzey', 'Sinop': 'kuzey', 'Artvin': 'kuzey', 'Kocaeli': 'guney', 'Yalova': 'kuzey', 'Tekirdağ': 'guney', 'Çanakkale': 'bati', 'Van': 'dogu', 'Balıkesir': 'bati', 'Aydın': 'bati' };

  /* ---------- yardımcılar ---------- */
  let tohum = 1;
  const rnd = () => { tohum = (tohum * 16807) % 2147483647; return (tohum - 1) / 2147483646; };
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.85, flatShading: true }, o));
  const kutu = (w, h, d, m, x, y, z) => { const k = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); k.position.set(x, y + h / 2, z); k.castShadow = true; k.receiveShadow = true; return k; };
  const silindir = (r1, r2, h, m, x, y, z, s = 10) => { const k = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, s), m); k.position.set(x, y + h / 2, z); k.castShadow = true; return k; };
  const kubbe = (r, m, x, y, z) => { const k = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), m); k.position.set(x, y, z); k.castShadow = true; return k; };
  const koni = (r, h, m, x, y, z, s = 10) => { const k = new THREE.Mesh(new THREE.ConeGeometry(r, h, s), m); k.position.set(x, y + h / 2, z); k.castShadow = true; return k; };
  const M = {
    tas: mat('#e9e2d3'), kurs: mat('#8d969e'), yesil: mat('#2f8f6b'), su: mat('#2d6c9e', { roughness: 0.3, metalness: 0.1, flatShading: false }), yol: mat('#4a4f57'),
    bazalt: mat('#3f3b38'), kirmizi: mat('#b5302a'), beyaz: mat('#f4f1ea'), altin: mat('#d8b24a', { metalness: 0.3 }), kar: mat('#f2f5f7'), dag: mat('#8b8f86'), toprak: mat('#9c8a6a'), cam: mat('#9cc6e8', { roughness: 0.2 })
  };
  function cami(g, x, z, r = 3, minare = 2, m = M.tas) {
    g.add(kutu(r * 2.2, r * 0.9, r * 2.2, m, x, 0, z)); g.add(kubbe(r, M.kurs, x, r * 0.9, z));
    const mk = [[1, 1], [-1, -1], [1, -1], [-1, 1]].slice(0, minare);
    mk.forEach(([a, b]) => { g.add(silindir(0.28, 0.32, r * 3.2, m, x + a * r * 1.3, 0, z + b * r * 1.3, 8)); g.add(koni(0.3, 1.2, M.kurs, x + a * r * 1.3, r * 3.2, z + b * r * 1.3, 8)); });
  }
  function saatKulesi(g, x, z) { g.add(kutu(1.6, 7, 1.6, M.tas, x, 0, z)); g.add(kutu(1.9, 0.4, 1.9, M.kurs, x, 7, z)); g.add(koni(1.2, 2, M.kirmizi, x, 7.4, z, 4)); }
  function dag(g, x, z, r, h, karli) { g.add(koni(r, h, M.dag, x, 0, z, 9)); if (karli) g.add(koni(r * 0.35, h * 0.35, M.kar, x, h * 0.65, z, 9)); }
  // şehirlere özgü simgeler
  const SIMGE = {
    'Konya'(g) { g.add(silindir(2.2, 2.2, 3.5, M.tas, 6, 0, 6, 12)); const k = koni(1.8, 6, mat('#3aa58f'), 6, 3.5, 6, 16); g.add(k); cami(g, 12, 4, 3, 1); g.add(koni(9, 5, M.yesil, -12, 0, 8, 14)); },
    'İstanbul'(g) {
      g.add(kutu(44, 0.8, 3, M.yol, 22, 7.5, -20)); [12, 32].forEach(x => { g.add(kutu(1.2, 16, 1.2, M.kurs, x, 0, -20)); });
      cami(g, -12, 8, 4, 4); cami(g, -22, 18, 3.5, 4, mat('#d9a988')); g.add(silindir(1.6, 1.8, 9, M.tas, 14, 0, 10, 12)); g.add(koni(1.9, 4, M.kurs, 14, 9, 10, 12));
    },
    'Ankara'(g) {
      g.add(kutu(16, 1.2, 10, M.tas, 14, 0, 10)); for (let i = -3; i <= 3; i++) g.add(silindir(0.35, 0.35, 4, M.tas, 14 + i * 2, 1.2, 6));
      g.add(kutu(14, 4.4, 4, M.tas, 14, 1.2, 11)); cami(g, -10, 12, 4, 4); g.add(silindir(0.8, 1.1, 20, M.kurs, -18, 0, -6, 10)); g.add(new THREE.Mesh(new THREE.SphereGeometry(2, 12, 8), M.cam)); g.children[g.children.length - 1].position.set(-18, 21, -6);
    },
    'İzmir'(g) { g.add(kutu(1.4, 6, 1.4, mat('#e6d3a8'), 4, 0, 6)); g.add(kubbe(1, M.kurs, 4, 6, 6)); dag(g, 8, -40, 12, 10, false); },
    'Bursa'(g) { dag(g, 0, -48, 24, 26, true); for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) g.add(kubbe(1.1, M.kurs, 8 + i * 2.3, 2.5, 6 + j * 2.3)); g.add(kutu(10, 2.5, 12, M.tas, 11.5, 0, 10.6)); },
    'Antalya'(g) { g.add(silindir(1.1, 1.3, 11, mat('#c4704f'), 6, 0, 4, 12)); g.add(koni(1, 2, M.kurs, 6, 11, 4, 12)); dag(g, -30, -40, 16, 18, true); },
    'Diyarbakır'(g) { const r = 26; for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; g.add(kutu(3.6, 3.5, 1.4, M.bazalt, Math.cos(a) * r, 0, Math.sin(a) * r)).rotation; g.children[g.children.length - 1].rotation.y = -a; } cami(g, 6, 6, 3, 1, M.bazalt); },
    'Edirne'(g) { cami(g, 8, 8, 5, 4); },
    'Erzurum'(g) { g.add(kutu(8, 4, 3, M.tas, 8, 0, 8)); [-2.5, 2.5].forEach(o => g.add(silindir(0.5, 0.6, 9, mat('#b07a55'), 8 + o, 0, 8, 10))); dag(g, 30, -40, 18, 16, true); },
    'Kayseri'(g) { dag(g, 10, -50, 28, 34, true); g.add(kutu(14, 4, 14, M.bazalt, -10, 0, 10)); },
    'Gaziantep'(g) { g.add(silindir(9, 12, 6, M.toprak, 10, 0, 10, 14)); g.add(kutu(10, 3, 10, M.tas, 10, 6, 10)); },
    'Trabzon'(g) { cami(g, 6, 8, 3, 1); [-30, 0, 30].forEach(x => g.add(koni(14, 12, M.yesil, x, 0, -48, 12))); },
    'Rize'(g) { for (let i = 0; i < 6; i++) g.add(kutu(40, 0.8, 3, M.yesil, -10, i * 1.2, -30 - i * 3)); },
    'Van'(g) { g.add(kutu(12, 6, 5, mat('#a58f6d'), 20, 0, -12)); g.add(kutu(4, 3, 4, M.tas, 20, 6, -12)); },
    'Eskişehir'(g) { g.add(kutu(80, 0.15, 3, M.su, 0, 0.05, 20)); },
    'Mardin'(g) { for (let i = 0; i < 5; i++) for (let j = 0; j < 8; j++) g.add(kutu(3, 2, 3, mat('#d8c39a'), -18 + j * 4, i * 2, -14 - i * 4)); cami(g, 0, -34, 2.5, 1, mat('#d8c39a')); }
  };

  /* ---------- şehri kur ---------- */
  function sehirKur() {
    const g = new THREE.Group(), Sim = window.Sim, bolge = Sim.BOLGE_IL[il], zemin = BOLGE_RENK[bolge] || '#b5a77d';
    tohum = [...il].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 2147483647 || 1;
    const yer = new THREE.Mesh(new THREE.CircleGeometry(75, 48), mat(zemin, { flatShading: false })); yer.rotation.x = -Math.PI / 2; yer.receiveShadow = true; g.add(yer);
    const dis = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), mat('#2a3644', { flatShading: false })); dis.rotation.x = -Math.PI / 2; dis.position.y = -0.1; g.add(dis);
    // deniz ya da göl
    const d = DENIZ[il]; let denizde = () => false;
    if (d) {
      const su = new THREE.Mesh(new THREE.PlaneGeometry(d === 'bogaz' ? 10 : 160, d === 'bogaz' ? 160 : 160), M.su); su.rotation.x = -Math.PI / 2; su.position.y = 0.06;
      if (d === 'bogaz') { su.position.x = 22; denizde = (x) => Math.abs(x - 22) < 7; }
      if (d === 'kuzey') { su.position.z = -40 - 80; su.scale.set(1, 1, 1); denizde = (x, z) => z < -38; su.position.z = -118; }
      if (d === 'guney') { su.position.z = 118; denizde = (x, z) => z > 38; }
      if (d === 'bati') { su.position.x = -118; denizde = (x) => x < -38; }
      if (d === 'dogu') { su.position.x = 118; denizde = (x) => x > 38; }
      g.add(su);
    }
    // ana caddeler
    [[0, 0, 150, 3], [0, 0, 3, 150]].forEach(([x, z, w, dd]) => { const y = kutu(w, 0.05, dd, M.yol, x, 0.02, z); y.castShadow = false; g.add(y); });
    const meydan = new THREE.Mesh(new THREE.CircleGeometry(8, 24), mat('#d9d2c2', { flatShading: false })); meydan.rotation.x = -Math.PI / 2; meydan.position.y = 0.04; g.add(meydan);
    g.add(silindir(0.12, 0.12, 9, M.kurs, 0, 0, -3, 6)); g.add(kutu(2.2, 1.4, 0.05, M.kirmizi, 1.2, 7.4, -3));
    // binalar
    const sec = window.SECIM2002[il] ? window.SECIM2002[il].top : 300000, n = Math.max(160, Math.min(720, sec / 4000)), buyuk = sec > 800000;
    const bina = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat('#ffffff'), n), m4 = new THREE.Matrix4(), renkler = ['#efe6d6', '#e3d2b8', '#d8c6a8', '#cfd6dc', '#e9dcc9', '#f2e3c4', '#dcc9b0'];
    let k = 0, dene = 0;
    const bosMu = (x, z) => Math.abs(x) < 2.6 || Math.abs(z) < 2.6 || Math.hypot(x, z) < 10 || denizde(x, z) || Object.values(POI).some(p => Math.hypot(x - p.x, z - p.z) < 9) || Math.hypot(x - 8, z - 8) < 9;
    while (k < n && dene < n * 8) {
      dene++; const r = Math.sqrt(rnd()) * 66, a = rnd() * Math.PI * 2, x = Math.round(Math.cos(a) * r / 3.2) * 3.2, z = Math.round(Math.sin(a) * r / 3.2) * 3.2;
      if (bosMu(x, z)) continue;
      const yuk = (buyuk ? 3 : 2) + rnd() * (buyuk ? 10 : 5) * Math.max(0.2, 1 - r / 70), w = 2.2 + rnd() * 0.6;
      m4.compose(new THREE.Vector3(x, yuk / 2, z), new THREE.Quaternion(), new THREE.Vector3(w, yuk, w)); bina.setMatrixAt(k, m4);
      bina.setColorAt(k, new THREE.Color(renkler[(rnd() * renkler.length) | 0])); k++;
    }
    bina.count = k; bina.castShadow = true; bina.receiveShadow = true; g.add(bina);
    // ağaçlar
    const agac = new THREE.InstancedMesh(new THREE.ConeGeometry(0.9, 2.6, 7), mat(bolge === 'karadeniz' ? '#2f6b3a' : '#4f7d3e'), 140); let a2 = 0;
    for (let i = 0; i < 400 && a2 < 140; i++) { const r = 20 + rnd() * 52, a = rnd() * Math.PI * 2, x = Math.cos(a) * r, z = Math.sin(a) * r; if (bosMu(x, z) && !denizde(x, z) && Math.hypot(x, z) > 10) { m4.makeTranslation(x, 1.3, z); agac.setMatrixAt(a2++, m4); } }
    agac.count = a2; g.add(agac);
    // simge ya da sıradan merkez
    (SIMGE[il] || (gg => { cami(gg, 8, 8, 3, 2); saatKulesi(gg, -6, 6); }))(g);
    // bu ildeki yatırımlar
    S.projeler.filter(p => p.il === il).forEach((p, i) => {
      const x = -50 + i * 12, z = 46, P = V.PROJE[p.tip];
      if (!p.bitti) { g.add(kutu(0.3, 8, 0.3, mat('#ffb703'), x, 0, z)); g.add(kutu(5, 0.3, 0.3, mat('#ffb703'), x + 2, 8, z)); }
      else if (p.tip === 'toki') for (let j = 0; j < 4; j++) g.add(kutu(3, 9 + j * 2, 3, M.beyaz, x + (j % 2) * 4, 0, z + (j > 1 ? 4 : 0)));
      else if (p.tip === 'hastane') { g.add(kutu(8, 5, 5, M.beyaz, x, 0, z)); g.add(kutu(2, 0.6, 0.2, M.kirmizi, x, 5.2, z + 2.6)); g.add(kutu(0.6, 2, 0.2, M.kirmizi, x, 4.5, z + 2.6)); }
      else g.add(kutu(6, 4, 6, M.cam, x, 0, z));
      POI['proje' + i] = { ad: P.ad + (p.bitti ? '' : ' (inşaat)'), ikon: P.ikon, x, z: z - 6, proje: true };
    });
    return g;
  }

  /* ---------- insanlar ---------- */
  const TEN = ['#e8c5a0', '#d9ad84', '#c69472', '#f0d2b4'], KIYAFET = ['#2b3a4c', '#6b4f3a', '#3f5e3a', '#7a2f3a', '#4b4f7a', '#8a7a5a', '#5a5a5a'];
  function insan(renk, basortu, ten) {
    const g = new THREE.Group();
    const govde = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 1.1, 8), mat(renk)); govde.position.y = 0.95; govde.castShadow = true; g.add(govde);
    [-0.14, 0.14].forEach(x => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 6), mat('#2c2c33')); b.position.set(x, 0.25, 0); g.add(b); });
    const bas = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), mat(ten, { flatShading: false })); bas.position.y = 1.72; bas.castShadow = true; g.add(bas);
    if (basortu) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.29, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), mat(basortu)); o.position.y = 1.7; o.rotation.x = 0.35; g.add(o); }
    else { const s = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.45), mat('#2f2620')); s.position.y = 1.76; s.rotation.x = -0.2; g.add(s); }
    return g;
  }

  /* ---------- konuşmalar ---------- */
  const ERKEK = ['Mehmet', 'Ahmet', 'Mustafa', 'Ali', 'Hüseyin', 'Hasan', 'İbrahim', 'Osman', 'Yusuf', 'Murat', 'Emre', 'Burak', 'Serkan', 'Kemal', 'Halil', 'Ramazan', 'Bayram', 'Cengiz'];
  const KADIN = ['Ayşe', 'Fatma', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Merve', 'Sevgi', 'Gülsüm', 'Esra', 'Derya', 'Selin', 'Büşra', 'Nur'];
  const KURT_AD = ['Ferhat', 'Abdullah', 'Şiar', 'Azad', 'Rojda', 'Berivan', 'Zelal', 'Mehmet Emin', 'Leyla', 'Nesrin'];
  const SOYAD = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Akın'];
  const FINDIK = ['Ordu', 'Giresun', 'Trabzon', 'Samsun', 'Düzce', 'Sakarya'], CAY = ['Rize', 'Artvin', 'Trabzon'], TURIZM = ['Antalya', 'Muğla', 'Aydın', 'İzmir'], MADEN = ['Zonguldak', 'Manisa', 'Bartın', 'Kütahya'];
  const TARIM = ['Konya', 'Şanlıurfa', 'Ankara', 'Eskişehir', 'Adana', 'Edirne', 'Tekirdağ', 'Kırklareli', 'Aksaray', 'Karaman', 'Yozgat', 'Sivas', 'Çorum', 'Afyon', 'Niğde'];
  const DEPREM = ['Hatay', 'Kahramanmaraş', 'Adıyaman', 'Malatya', 'Gaziantep', 'Osmaniye', 'Adana', 'Diyarbakır', 'Şanlıurfa', 'Kilis', 'Elazığ'];
  const SURIYE = ['Gaziantep', 'Hatay', 'Şanlıurfa', 'Kilis', 'İstanbul', 'Mersin', 'Adana', 'Mardin'];
  function konular(poi) {
    const Sim = window.Sim, y = Sim.yil(), e = S.eko, kurt = V.DEHAP_IL.includes(il), L = [];
    const ekle = (o, w = 1) => { for (let i = 0; i < w; i++) L.push(o); };
    if (e.enf > 15) ekle({ rol: poi === 'fabrika' ? 'Fabrika işçisi' : 'Bakkal', kesim: 'sag', metin: `Fiyatlar her hafta değişiyor. Geçen ay ${e.enf > 40 ? 'kira iki katına çıktı' : 'mazot, ekmek, her şey zamlandı'}. Maaş yetmiyor. Bunu nasıl düzelteceksiniz?`,
      s: [{ ad: 'Enflasyonu tek haneye indireceğim, söz', soz: { tip: 'enflasyon', metin: 'enflasyon tek haneye inecek' }, et: { il: 1, k: { sag: 0.3 } }, cevap: 'Göreceğiz. Bu sözü unutmayacağız.' },
        { ad: 'Dünyada da kriz var, sabır', et: { il: -0.5 }, cevap: 'Dünya bizim pazarımıza gelmiyor ama...' },
        { ad: 'Esnafa ucuz kredi ve vergi indirimi geliyor', et: { il: 0.6, k: { sag: 0.2 } }, cevap: 'Kredi iyi de faizi ne olacak?' }] }, 3);
    if (e.issizlik > 10.5) ekle({ rol: 'İşsiz genç', kesim: 'laik', genc: true, metin: 'Üniversiteyi bitirdim, iki yıldır iş arıyorum. Arkadaşlarımın yarısı yurtdışına gitmeyi düşünüyor.',
      s: [{ ad: 'Gençlere istihdam paketi çıkaracağız', et: { il: 0.5, k: { laik: 0.2 } }, cevap: 'Umarım torpilsiz olur.' }, { ad: 'Kendi işini kur, devlet destekliyor', et: { il: 0.2 }, cevap: 'Sermaye nerede?' }, { ad: 'İş beğenmiyorsunuz', et: { il: -1, k: { laik: -0.3 } }, cevap: 'Böyle demeniz çok kırıcı.' }] }, 2);
    // ilde yapılabilecek ama yapılmamış yatırım
    const p = Object.entries(V.PROJE).find(([k, P]) => (P.il ? P.il === il : !P.iller || P.iller.includes(il)) && y >= P.yil - 1 && !S.projeler.some(x => x.tip === k && x.il === il) && !(P.tekil && S.projeler.some(x => x.tip === k)));
    if (p) ekle({ rol: S.iktidar ? 'Belediye meclis üyesi' : 'Mahalle muhtarı', kesim: 'sag', metin: `Şehrimizin en büyük ihtiyacı ${p[1].ad.toLocaleLowerCase('tr')}. Yıllardır söz veriliyor, bir şey yapılmıyor. Bize bir söz verecek misiniz?`,
      s: [{ ad: `Söz: ${p[1].ad} yapılacak`, soz: { tip: p[0], metin: p[1].ad + ' yapılacak' }, et: { il: 1.2 }, cevap: 'Bu sözü herkes duydu. Tutarsanız bu şehir sizi unutmaz.' },
        { ad: 'Bütçe elverirse bakacağız', et: { il: 0.1 }, cevap: 'Hep aynı cevap...' }, { ad: 'Önceliğimiz başka', et: { il: -0.8 }, cevap: 'Anladım. Sandıkta biz de önceliğimizi göstereceğiz.' }] }, 2);
    if (y < 2013.8 && (poi === 'univ' || poi === 'meydan')) ekle({ rol: 'Üniversite öğrencisi', kesim: 'muh', basortu: true, metin: 'Üniversite kapısında başörtümü çıkarmak zorunda kalıyorum. Bazı arkadaşlarım okulu bıraktı, bazıları peruk takıyor.',
      s: [{ ad: 'Bu yasağı kaldıracağız', et: { il: 0.6, k: { muh: 0.5, laik: -0.3 } }, cevap: 'Çok uzun zamandır bu sözü bekliyorduk.' }, { ad: 'Toplumsal uzlaşmayla çözmeliyiz', et: { il: 0.2, k: { muh: 0.1 } }, cevap: 'Uzlaşma ne zaman gelecek?' }, { ad: 'Mahkeme kararları var', et: { il: -0.5, k: { muh: -0.4 } }, cevap: 'Siz de mi böyle düşünüyorsunuz?' }] }, 2);
    if (y > 2008.3 && y < 2010.9 && poi === 'univ') ekle({ rol: 'Bilgisayar mühendisliği öğrencisi', kesim: 'laik', genc: true, metin: 'YouTube iki yıldır kapalı. Herkes yasağı DNS değiştirerek deliyor. Bu ülkeye yakışıyor mu?',
      s: [{ ad: 'Yasakları kaldıracağız', et: { il: 0.4, k: { laik: 0.4 } }, cevap: 'Bunu Meclis\'te de söyleyin.' }, { ad: 'Mahkeme kararı, ben de kullanıyorum', et: { il: 0.1 }, cevap: 'Yani siz de yasağı deliyorsunuz?' }, { ad: 'İnternetin zararları da var', et: { il: -0.4, k: { laik: -0.3 } }, cevap: 'Bu bir cevap değil.' }] });
    if (y > 2013.4 && y < 2014.6 && ['İstanbul', 'Ankara', 'İzmir', 'Eskişehir', 'Antalya'].includes(il) && poi !== 'fabrika') ekle({ rol: 'Gezi\'ye katılmış öğrenci', kesim: 'laik', genc: true, metin: 'Biz sadece ağaçları korumak istedik. Arkadaşım gaz kapsülüyle yaralandı. Bize "çapulcu" dendi.',
      s: [{ ad: 'Gençlerin sesini duyuyorum, aşırı güç soruşturulacak', et: { il: 0.6, k: { laik: 0.6, muh: -0.2 } }, cevap: 'İlk kez biri bizi dinliyor.' }, { ad: 'Kışkırtıcılar vardı', et: { il: -0.6, k: { laik: -0.5, muh: 0.2 } }, cevap: 'Biz kışkırtıcı değiliz.' }, { ad: 'Park ve meydan projeleri halka sorulacak', et: { il: 0.4, k: { laik: 0.3 } }, cevap: 'Gerçekten sorarsanız...' }] }, 2);
    if (kurt && y > 2004) ekle({ rol: 'Anne', kesim: 'kurt', basortu: '#f5f5f5', kurtAd: true, metin: y > 2013.2 && y < 2015.5 ? 'Silahlar sustu, iki yıldır cenaze gelmiyor. Bu süreç bozulmasın. Çocuklarımız kendi dillerinde okuyabilsin.' : 'Oğlum askerde, öbür oğlum dağda mı bilmiyorum. Her gece haberleri izliyorum. Bu savaş bitsin istiyoruz.',
      s: [{ ad: 'Barış için ne gerekiyorsa yapacağız', et: { il: 0.8, k: { kurt: 0.6, mil: -0.2 } }, cevap: 'Allah razı olsun. Sözünüzü tutun.' }, { ad: 'Önce terör bitmeli', et: { il: -0.3, k: { mil: 0.2, kurt: -0.3 } }, cevap: 'Biz de bitsin istiyoruz ama nasıl?' }, { ad: 'Bölgeye yatırım ve iş getireceğiz', et: { il: 0.5, k: { kurt: 0.3 } }, cevap: 'İş iyi, ama bize saygı da lazım.' }] }, 2);
    if (y > 2015 && SURIYE.includes(il) && poi !== 'univ') ekle({ rol: 'Esnaf', kesim: 'mil', metin: 'Mahallede kiralar arttı, karşımda Suriyelilerin açtığı üç dükkân var, vergi vermiyorlar diyorlar. Bu insanlar dönecek mi?',
      s: [{ ad: 'Gönüllü ve güvenli dönüşü sağlayacağız', et: { il: 0.5, k: { mil: 0.4 } }, cevap: 'Ne zaman?' }, { ad: 'Onlar savaştan kaçan misafirlerimiz', et: { il: -0.4, k: { mil: -0.4, muh: 0.2 } }, cevap: 'Misafirlik ne kadar sürer?' }, { ad: 'Kayıt dışı ticareti denetleyeceğiz', et: { il: 0.4, k: { sag: 0.2 } }, cevap: 'Bu adil olur.' }] }, 2);
    if (y > 2023.1 && DEPREM.includes(il)) ekle({ rol: 'Depremzede', kesim: 'sag', metin: 'Evimiz yıkıldı, ailemden dört kişiyi kaybettim. Bir yıldır konteynerde kalıyoruz. Yeni evler ne zaman bitecek?',
      s: [{ ad: 'Söz: kalıcı konutlar yapılacak', soz: { tip: 'toki', metin: 'deprem konutları yapılacak' }, et: { il: 1, k: { sag: 0.3 } }, cevap: 'Bu sözü çok duyduk ama size inanmak istiyorum.' }, { ad: 'Müteahhitlerden hesap soracağız', et: { il: 0.6, k: { laik: 0.2 } }, cevap: 'Asıl izin verenler ne olacak?' }, { ad: 'Kader, sabır', et: { il: -1 }, cevap: 'Kader değil, çürük bina.' }] }, 3);
    if (FINDIK.includes(il) && poi !== 'univ') ekle({ rol: 'Fındık üreticisi', kesim: 'sag', metin: 'Fındık fiyatı açıklanmadı, tüccar ucuza almak için bekliyor. Gübre iki katına çıktı. Bu yıl ne kazanacağız?',
      s: [{ ad: 'TMO alıma girecek, taban fiyat açıklanacak', et: { il: 1, k: { sag: 0.3 }, e: { acik: 0.05 } }, cevap: 'Fiyat iyi olursa bu iş biter.' }, { ad: 'Piyasa belirlesin', et: { il: -0.8 }, cevap: 'Piyasa demek tüccar demek.' }, { ad: 'Gübre desteği vereceğiz', et: { il: 0.5 }, cevap: 'Az da olsa iyi.' }] }, 2);
    if (CAY.includes(il) && poi !== 'univ') ekle({ rol: 'Çay üreticisi', kesim: 'sag', metin: 'ÇAYKUR kota koydu, yaş çayın yarısı elimizde kalıyor. Özel fabrikalar da ucuza alıyor.',
      s: [{ ad: 'Kota kalkacak, alım fiyatı artacak', et: { il: 1 }, cevap: 'İşte bunu bekliyorduk.' }, { ad: 'ÇAYKUR\'u özelleştireceğiz', et: { il: -1, k: { sag: -0.2 } }, cevap: 'O zaman biz ne yapacağız?' }] });
    if (TURIZM.includes(il)) ekle({ rol: 'Otel işletmecisi', kesim: 'sag', metin: y > 2015.9 && y < 2016.6 ? 'Rus turistler gelmiyor, otellerin yarısı boş. Personeli işten çıkarıyoruz.' : 'Sezon iyi gidiyor ama elektrik ve personel maliyeti çok arttı. Kur da istikrarsız.',
      s: [{ ad: 'Turizme enerji ve SGK desteği', et: { il: 0.8, k: { sag: 0.3 } }, cevap: 'Sektör bunu unutmaz.' }, { ad: 'Yeni pazarlar açacağız', et: { il: 0.4 }, cevap: 'İnşallah.' }] });
    if (MADEN.includes(il) && poi === 'fabrika') ekle({ rol: 'Maden işçisi', kesim: 'sag', metin: y > 2014.4 ? 'Soma\'dan sonra her sabah ocağa girerken dua ediyoruz. Taşeron sistemi hâlâ sürüyor.' : 'Ocak derin, havalandırma yetersiz. Ama başka iş yok.',
      s: [{ ad: 'İş güvenliğini sıkılaştıracağız, taşeron kalkacak', et: { il: 1, k: { sag: 0.3 }, i: { isd: -0.5 } }, cevap: 'Taşeron kalkarsa bu ocak sizindir.' }, { ad: 'Bu işin riskleri var', et: { il: -1.2 }, cevap: 'Risk bizim canımız.' }] }, 2);
    if (TARIM.includes(il) && poi === 'meydan') ekle({ rol: 'Çiftçi', kesim: 'sag', metin: 'Mazot, gübre, ilaç... Ürün parası masrafı karşılamıyor. Köyde gençler kalmadı.',
      s: [{ ad: 'Mazot ve gübre desteği artacak', et: { il: 0.8, k: { sag: 0.3 }, e: { acik: 0.05 } }, cevap: 'Destek zamanında gelsin yeter.' }, { ad: 'Sulama projeleri geliyor', et: { il: 0.4 }, cevap: 'Su olursa her şey olur.' }] }, 2);
    if (poi === 'fabrika') ekle({ rol: 'Sanayici', kesim: 'sag', metin: `Kredi faizi %${Math.round(e.faiz + 4)}. Bu faizle yatırım yapılmaz. ${e.kur > 3 ? 'Kur da her ay değişiyor, ithal girdi alamıyoruz.' : 'İhracat siparişleri var ama finansman yok.'}`,
      s: [{ ad: 'Faizleri düşüreceğiz', et: { il: 0.5, k: { sag: 0.3 }, e: { guven: -0.5 } }, cevap: 'Bunu Merkez Bankası\'na da söyleyin.' }, { ad: 'Önce enflasyon, sonra faiz', et: { il: 0.2, i: { isd: 0.5 } }, cevap: 'Mantıklı ama sabrımız sınırlı.' }, { ad: 'İhracata teşvik ve Eximbank kredisi', et: { il: 0.5, i: { isd: 0.5 } }, cevap: 'İşte somut bir şey.' }] }, 2);
    ekle({ rol: 'Emekli', kesim: 'muh', metin: `Emekli maaşı ${e.enf > 20 ? 'kirayı bile karşılamıyor. Torunlara harçlık veremiyorum.' : 'idare ediyor ama ilaç parası çok tuttu.'}`,
      s: [{ ad: 'Emekliye refah payı vereceğiz', et: { il: 0.6, k: { muh: 0.3 }, e: { acik: 0.05 } }, cevap: 'Allah razı olsun.' }, { ad: 'Bütçe dengesi önemli', et: { il: -0.3 }, cevap: 'Bizim dengemiz bozuldu ama.' }] });
    if (!S.iktidar) ekle({ rol: 'Kahvehane sahibi', kesim: 'sag', metin: 'Biz hep merkez sağa oy verdik. Ama bu koalisyon ülkeyi batırdı. Siz farklı mısınız?',
      s: [{ ad: 'Yolsuzluk, yoksulluk ve yasaklarla mücadele', et: { il: 0.8, k: { sag: 0.4 } }, cevap: 'Bunu herkes söylüyor ama siz yenisiniz.' }, { ad: 'Kadrolarımız belediyelerde kendini kanıtladı', et: { il: 0.6, k: { sag: 0.3 } }, cevap: 'İstanbul\'da çöpü, suyu çözdünüz, doğru.' }] }, 2);
    return L;
  }
  function npcUret(poi) {
    const L = konular(poi), sec = [], kurt = V.DEHAP_IL.includes(il);
    const havuz = L.slice(); for (let i = 0; i < 6 && havuz.length; i++) { const j = (rnd() * havuz.length) | 0, k = havuz.splice(j, 1)[0]; if (!sec.some(x => x.metin === k.metin)) sec.push(k); }
    return sec.map(k => {
      const kadin = k.basortu || rnd() < 0.4, ad = (k.kurtAd || (kurt && rnd() < 0.6) ? KURT_AD : kadin ? KADIN : ERKEK)[(rnd() * 10) | 0 % 10] || 'Ali';
      return Object.assign({ ad: ad + ' ' + SOYAD[(rnd() * SOYAD.length) | 0], kadin, renk: KIYAFET[(rnd() * KIYAFET.length) | 0], ten: TEN[(rnd() * TEN.length) | 0], basortu: k.basortu ? (typeof k.basortu === 'string' ? k.basortu : ['#7a4b8a', '#3c6e8f', '#a14a4a', '#d9c7a1'][(rnd() * 4) | 0]) : (kadin && rnd() < 0.5 ? '#8a6a8a' : null) }, k);
    });
  }

  /* ---------- arayüz ---------- */
  function ac(Sd, ilAdi, aktivite, cb) {
    S = Sd; il = ilAdi; akt = aktivite; bitis = cb; mod = 'maket'; konusuldu = 0; npcler = [];
    Object.keys(POI).filter(k => k.startsWith('proje')).forEach(k => delete POI[k]);
    el = document.createElement('div'); el.className = 'sehir';
    const t = window.Sim.gunTarih(S.gun);
    el.innerHTML = `<div class="sh-sahne"></div><div class="sh-etiket"></div>
      <div class="sh-ust"><div><b>${il}</b><span>${t.getUTCDate()} ${V.AYLAR[t.getUTCMonth()]} ${t.getUTCFullYear()} · ${window.Ajanda.SEHIR_ETK[akt] ? window.Ajanda.SEHIR_ETK[akt].ad : 'Ziyaret'}</span></div>
        <button id="shMaket" style="display:none">🗺️ Maket</button><button id="shAyril">✈️ Ayrıl</button></div>
      <div class="sh-ipucu" id="shIpucu">Şehrin maketine bakıyorsun. Bir noktaya dokun ve oraya git.</div>
      <div class="joy" id="joy"><i></i></div><button class="sh-konus" id="shKonus">💬 Konuş</button>
      <div class="sh-diyalog" id="shDiy"></div>`;
    document.body.appendChild(el);
    const kap = el.querySelector('.sh-sahne');
    R = new THREE.WebGLRenderer({ antialias: true }); R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.shadowMap.enabled = true; R.outputEncoding = THREE.LinearEncoding;
    kap.appendChild(R.domElement);
    sahne = new THREE.Scene(); sahne.background = new THREE.Color('#9fc4e0'); sahne.fog = new THREE.Fog('#9fc4e0', 120, 260);
    kamera = new THREE.PerspectiveCamera(50, 1, 0.3, 600);
    sahne.add(new THREE.HemisphereLight('#ffffff', '#6b6150', 0.75));
    const gun = new THREE.DirectionalLight('#fff1d6', 0.9); gun.position.set(-40, 80, 30); gun.castShadow = true; gun.shadow.mapSize.set(2048, 2048);
    Object.assign(gun.shadow.camera, { left: -80, right: 80, top: 80, bottom: -80, near: 10, far: 220 }); sahne.add(gun);
    sahne.add(sehirKur());
    kontrol = new THREE.OrbitControls(kamera, R.domElement); kontrol.enableDamping = true; kontrol.maxPolarAngle = 1.25; kontrol.minDistance = 20; kontrol.maxDistance = 150; kontrol.target.set(0, 0, 0);
    kamera.position.set(0, 70, 85);
    boyut(); window.addEventListener('resize', boyut);
    etiketler();
    el.querySelector('#shAyril').onclick = kapat;
    el.querySelector('#shMaket').onclick = maketeDon;
    el.querySelector('#shKonus').onclick = konus;
    joystick(el.querySelector('#joy'));
    window.addEventListener('keydown', tusBas); window.addEventListener('keyup', tusBirak);
    son = performance.now(); anim = requestAnimationFrame(kare);
    // gelinen etkinliğe göre ilk nokta
    const ilk = { miting: 'meydan', carsi: 'carsi', fabrika: 'fabrika', univ: 'univ', acilis: Object.keys(POI).find(k => k.startsWith('proje')) || 'meydan' }[akt];
    setTimeout(() => { if (el) el.querySelector('#shIpucu').innerHTML = `Bugünkü programın: <b>${POI[ilk] ? POI[ilk].ikon + ' ' + POI[ilk].ad : ''}</b>. Dokun ve git, ya da maketi gez.`; }, 50);
  }
  function boyut() { if (!el) return; const w = innerWidth, h = innerHeight; R.setSize(w, h); kamera.aspect = w / h; kamera.updateProjectionMatrix(); }
  function etiketler() {
    const kat = el.querySelector('.sh-etiket'); kat.innerHTML = '';
    if (mod !== 'maket') return;
    Object.entries(POI).forEach(([k, p]) => {
      const b = document.createElement('button'); b.className = 'sh-poi'; b.innerHTML = `${p.ikon} ${p.ad}`; b.dataset.k = k; b._p = new THREE.Vector3(p.x, 6, p.z);
      b.onclick = () => yuru(k); kat.appendChild(b);
    });
  }
  function etiketGuncelle() {
    if (!el) return;
    el.querySelectorAll('.sh-poi').forEach(b => {
      const v = b._p.clone().project(kamera), gor = v.z < 1;
      b.style.display = gor ? '' : 'none'; b.style.transform = `translate(${(v.x * 0.5 + 0.5) * innerWidth}px,${(-v.y * 0.5 + 0.5) * innerHeight}px) translate(-50%,-100%)`;
    });
    npcler.forEach(n => {
      if (!n.etk) return; const v = n.obj.position.clone().setY(2.6).project(kamera);
      n.etk.style.display = v.z < 1 && mod === 'yuru' ? '' : 'none'; n.etk.style.transform = `translate(${(v.x * 0.5 + 0.5) * innerWidth}px,${(-v.y * 0.5 + 0.5) * innerHeight}px) translate(-50%,-100%)`;
    });
  }
  // bir noktaya git: yürüyüş moduna geç
  function yuru(k) {
    const p = POI[k]; hedefPOI = p; mod = 'yuru'; kontrol.enabled = false;
    el.querySelector('#shMaket').style.display = ''; el.classList.add('yuruyor'); etiketler();
    if (!oyuncu) { oyuncu = insan('#1d2a3a', null, '#e8c5a0'); const kr = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.05), mat('#f2a516')); kr.position.set(0, 1.15, 0.36); oyuncu.add(kr); sahne.add(oyuncu); }
    oyuncu.position.set(p.x, 0, p.z + 8); oyuncu.rotation.y = Math.PI;
    npcler.forEach(n => { sahne.remove(n.obj); if (n.etk) n.etk.remove(); }); npcler = [];
    if (p.proje) { el.querySelector('#shIpucu').innerHTML = `${p.ikon} ${p.ad}. Yatırımın burada. Halk bekliyor.`; }
    const veri = npcUret(k), kat = el.querySelector('.sh-etiket');
    // kalabalık: konuşulabilen insanlar ve arka plandakiler
    veri.forEach((v, i) => {
      const a = i / veri.length * Math.PI * 2 + 0.4, r = 5 + rnd() * 4, o = insan(v.renk, v.basortu, v.ten);
      o.position.set(p.x + Math.cos(a) * r, 0, p.z + Math.sin(a) * r); o.rotation.y = rnd() * 6; sahne.add(o);
      const etk = document.createElement('div'); etk.className = 'sh-npc'; etk.textContent = '💬'; kat.appendChild(etk);
      npcler.push({ obj: o, veri: v, etk, faz: rnd() * 6 });
    });
    for (let i = 0; i < (akt === 'miting' && k === 'meydan' ? 60 : 14); i++) {
      const o = insan(KIYAFET[(rnd() * 7) | 0], rnd() < 0.25 ? '#a14a4a' : null, TEN[(rnd() * 4) | 0]), a = rnd() * 6.28, r = 10 + rnd() * 9;
      o.position.set(p.x + Math.cos(a) * r, 0, p.z + Math.sin(a) * r); o.rotation.y = rnd() * 6; o.scale.setScalar(0.95 + rnd() * 0.1); sahne.add(o); npcler.push({ obj: o, faz: rnd() * 6 });
    }
    if (akt === 'miting' && k === 'meydan') { const kursu = new THREE.Group(); kursu.add(kutu(6, 1.2, 3, mat('#f2a516'), 0, 0, 0)); kursu.position.set(p.x, 0, p.z - 4); sahne.add(kursu); npcler.push({ obj: kursu, sabit: true }); }
    el.querySelector('#shIpucu').innerHTML = `${p.ikon} <b>${p.ad}</b> · Yürü (sol alttaki çubuk ya da WASD), 💬 olanların yanına gidip konuş. Bugün ${3 - konusuldu} kişiyle konuşacak vaktin var.`;
  }
  function maketeDon() {
    mod = 'maket'; kontrol.enabled = true; el.classList.remove('yuruyor'); el.querySelector('#shMaket').style.display = 'none';
    el.querySelector('#shKonus').style.display = 'none'; el.querySelector('#shDiy').style.display = 'none';
    kamera.position.set(0, 70, 85); kontrol.target.set(0, 0, 0); etiketler();
  }
  function enYakin() { let en = null, ed = 3.2; npcler.forEach(n => { if (!n.veri || n.konustu) return; const d = n.obj.position.distanceTo(oyuncu.position); if (d < ed) { ed = d; en = n; } }); return en; }
  function konus() {
    const n = enYakin(); if (!n) return; const v = n.veri, d = el.querySelector('#shDiy');
    n.obj.lookAt(oyuncu.position.x, 0, oyuncu.position.z);
    d.style.display = 'block';
    d.innerHTML = `<div class="dy-kim"><span class="dy-yuz" style="background:${v.renk}">${v.ad[0]}</span><span><b>${v.ad}</b><small>${v.rol}</small></span></div><p>"${v.metin}"</p>
      ${v.s.map((s, i) => `<button class="dy-sec" data-i="${i}">${s.ad}</button>`).join('')}`;
    d.querySelectorAll('.dy-sec').forEach(b => b.onclick = () => {
      const s = v.s[+b.dataset.i], et = s.et || {};
      if (et.il) S.ilEtki[il] = (S.ilEtki[il] || 0) + et.il * 0.6;
      window.Sim.etkiUygula({ k: et.k, i: et.i, e: et.e });
      if (s.soz) window.Ajanda.sozVer(il, s.soz.tip, s.soz.metin);
      n.konustu = true; n.etk.textContent = et.il > 0 ? '🙂' : et.il < 0 ? '😠' : '😐'; konusuldu++;
      (S.log = S.log || []).unshift({ t: '', m: `🗣️ ${il}: ${v.rol} ${v.ad} ile konuştun${s.soz ? ' — söz verdin: ' + s.soz.metin : ''}` });
      d.innerHTML = `<div class="dy-kim"><span class="dy-yuz" style="background:${v.renk}">${v.ad[0]}</span><span><b>${v.ad}</b><small>${v.rol}</small></span></div><p>"${s.cevap || 'Teşekkürler.'}"</p>
        <div class="dy-etki">${et.il > 0 ? `<span class="a">${il}'da destek ▲</span>` : et.il < 0 ? `<span class="e">${il}'da destek ▼</span>` : ''}${s.soz ? '<span class="s">📝 Söz kaydedildi</span>' : ''}</div>
        <button class="dy-sec" id="dyTamam">${konusuldu >= 3 ? 'Günü bitir' : 'Devam'}</button>`;
      d.querySelector('#dyTamam').onclick = () => { d.style.display = 'none'; if (konusuldu >= 3) kapat(); else el.querySelector('#shIpucu').innerHTML = `Bugün ${3 - konusuldu} kişiyle daha konuşabilirsin.`; };
    });
  }
  function joystick(j) {
    const knob = j.querySelector('i'); let id = null, cx = 0, cy = 0;
    j.addEventListener('pointerdown', e => { id = e.pointerId; const r = j.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; j.setPointerCapture(id); hareket(e); });
    j.addEventListener('pointermove', e => { if (e.pointerId === id) hareket(e); });
    const birak = () => { id = null; joy.x = joy.y = 0; knob.style.transform = ''; };
    j.addEventListener('pointerup', birak); j.addEventListener('pointercancel', birak);
    function hareket(e) { let dx = e.clientX - cx, dy = e.clientY - cy; const l = Math.hypot(dx, dy), m = 40; if (l > m) { dx *= m / l; dy *= m / l; } joy.x = dx / m; joy.y = dy / m; knob.style.transform = `translate(${dx}px,${dy}px)`; }
  }
  const tusBas = e => { tus[e.key.toLowerCase()] = true; }, tusBirak = e => { tus[e.key.toLowerCase()] = false; };
  function kare(t) {
    if (!el) return;
    const dt = Math.min(0.05, (t - son) / 1000); son = t;
    if (mod === 'yuru' && oyuncu) {
      let x = joy.x + ((tus.d || tus.arrowright) ? 1 : 0) - ((tus.a || tus.arrowleft) ? 1 : 0), z = joy.y + ((tus.s || tus.arrowdown) ? 1 : 0) - ((tus.w || tus.arrowup) ? 1 : 0);
      const l = Math.hypot(x, z);
      if (l > 0.1) {
        x /= Math.max(1, l); z /= Math.max(1, l); oyuncu.position.x += x * 7 * dt; oyuncu.position.z += z * 7 * dt; oyuncu.rotation.y = Math.atan2(x, z);
        const dx = oyuncu.position.x - hedefPOI.x, dz = oyuncu.position.z - hedefPOI.z, r = Math.hypot(dx, dz); if (r > 22) { oyuncu.position.x = hedefPOI.x + dx / r * 22; oyuncu.position.z = hedefPOI.z + dz / r * 22; }
        oyuncu.position.y = Math.abs(Math.sin(t / 90)) * 0.08;
      }
      const hedef = oyuncu.position.clone().add(new THREE.Vector3(0, 4.6, 7.5)); kamera.position.lerp(hedef, Math.min(1, dt * 4)); kamera.lookAt(oyuncu.position.x, 1.2, oyuncu.position.z);
      const n = enYakin(); el.querySelector('#shKonus').style.display = n && el.querySelector('#shDiy').style.display !== 'block' && konusuldu < 3 ? '' : 'none';
    } else kontrol.update();
    npcler.forEach(n => { if (!n.sabit) n.obj.position.y = Math.max(0, Math.sin(t / 400 + n.faz) * 0.04); });
    R.render(sahne, kamera); etiketGuncelle();
    anim = requestAnimationFrame(kare);
  }
  function kapat() {
    if (!el) return;
    cancelAnimationFrame(anim); window.removeEventListener('resize', boyut); window.removeEventListener('keydown', tusBas); window.removeEventListener('keyup', tusBirak);
    sahne.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    R.dispose(); el.remove(); el = null; oyuncu = null; npcler = [];
    const k = konusuldu; if (bitis) bitis(k);
  }
  return { ac, acik: () => !!el, _t: () => ({ oyuncu, npcler }) };
})();
