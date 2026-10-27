/* Link Bio'da — hazır 3D karakter modelleri (Quaternius, CC0).
   Beden + saç + animasyon dosyalarını yükler, kıyafetleri gölgelendiriciyle boyar
   (paketin ücretsiz sürümünde kıyafet yok; herkes giyinik kuralı burada sağlanır). */
'use strict';
(function () {
  const T = THREE;
  const YOL = 'varlik/';
  let V = null;           // yüklenen varlıklar
  let yukleniyor = null;

  /* ---------- kıyafet tanımları ---------- */
  // desen: 0 düz, 1 çubuklu forma, 2 gömlek+kravat, 3 eşofman fermuarı, 4 tişört logosu
  const KIYAFET = {
    tisort:  { ust: '#ece6da', ust2: '#ff4f8b', alt: '#3d5a80', ayak: '#2b2b33', kol: 'kisa', desen: 0 },
    esofman: { ust: '#5f6573', ust2: '#d9d9d9', alt: '#565b67', ayak: '#f0f0f0', kol: 'uzun', desen: 3 },
    sik:     { ust: '#7a1f3d', ust2: '#1d1d24', alt: '#1d1d24', ayak: '#151515', kol: 'uzun', desen: 2 },
    takim:   { ust: '#2b2f3a', ust2: '#a8323e', alt: '#2b2f3a', ayak: '#151515', kol: 'uzun', desen: 2 },
    forma:   { ust: '#f2f2ee', ust2: '#1f7a4c', alt: '#1d1d24', ayak: '#f0f0f0', kol: 'kisa', desen: 1 },
    hirka:   { ust: '#7d4e57', ust2: '#5d3a41', alt: '#3a3a44', ayak: '#2b2b33', kol: 'uzun', desen: 0 }
  };
  const SAC_DOSYA = { kisa: 'SimpleParted', uzun: 'Long', topuz: 'Buns', kazinmis: 'Buzzed', kisakesim: 'BuzzedFemale' };
  const KLIP = {
    bekle: 'Idle_Loop', konus: 'Idle_Talking_Loop', dans: 'Dance_Loop', sarki: 'Idle_Talking_Loop', selam: 'Idle_Loop',
    poz: 'Idle_Loop', tesekkur: 'Idle_Loop', ic: 'Idle_Loop', panik: 'Jump_Loop', sok: 'Hit_Head', gul: 'Idle_Talking_Loop', sergile: 'Idle_Loop'
  };

  const dogrusal = hex => new T.Color(hex).convertSRGBToLinear();
  // dokudaki ortalama ten (sRGB ~#d99c78); hedef tenin bu renge oranı çarpan olarak kullanılır
  const DOKU_TEN = dogrusal('#d99c78');

  function yukle() {
    if (V) return Promise.resolve(V);
    if (yukleniyor) return yukleniyor;
    if (!T.GLTFLoader || !T.SkeletonUtils) return Promise.reject(new Error('yükleyici yok'));
    const L = new T.GLTFLoader();
    const al = u => new Promise((ok, hata) => L.load(YOL + u, ok, undefined, hata));
    yukleniyor = Promise.all(['govde_a.glb', 'govde_b.glb', 'saclar.glb', 'animasyon.glb'].map(al)).then(([a, b, s, an]) => {
      const saclar = {};
      s.scene.updateMatrixWorld(true);
      s.scene.children.forEach(c => { if (/^sac_/.test(c.name)) saclar[c.name.slice(4)] = c; });
      let mankenPelvis = null;
      an.scene.traverse(o => { if (o.name === 'pelvis') mankenPelvis = o.position.clone(); });
      const klipler = {}; an.animations.forEach(k => { klipler[k.name] = k; });
      V = { a, b, saclar, klipler, mankenPelvis };
      return V;
    });
    return yukleniyor;
  }

  /* ---------- malzemeler ---------- */
  function govdeMalzemesi(asil, lm, kiy, ten) {
    const m = asil.clone();
    const k = KIYAFET[kiy] || KIYAFET.tisort;
    const tenK = dogrusal(ten);
    const u = {
      uBind: { value: lm.bind }, uBelY: { value: lm.belY }, uYakaY: { value: lm.yakaY }, uOmuzX: { value: lm.omuzX },
      uKoltukY: { value: lm.koltukY }, uKolBit: { value: k.kol === 'kisa' ? lm.kisaKolX : lm.bilekX }, uAyakY: { value: lm.ayakY },
      uUst: { value: dogrusal(k.ust) }, uUst2: { value: dogrusal(k.ust2) }, uAlt: { value: dogrusal(k.alt) }, uAyak: { value: dogrusal(k.ayak) },
      uBindInv: { value: lm.bind.clone().invert() }, uZRef: { value: lm.zRef }, uY0: { value: lm.y0 }, uY1: { value: lm.y1 }, uXKenar: { value: lm.xKenar },
      uDesen: { value: k.desen }, uTen: { value: new T.Vector3(tenK.r / DOKU_TEN.r, tenK.g / DOKU_TEN.g, tenK.b / DOKU_TEN.b) }
    };
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, u);
      // bol kıyafet: gövdenin önündeki çıkıntılar (göğüs, kasık) bağlama uzayında düzleştirilir
      sh.vertexShader = `uniform mat4 uBind, uBindInv; uniform float uZRef[40]; uniform float uY0, uY1, uXKenar;
varying vec3 vBind;
vec4 duzlestir(vec3 p, out float rw) {
  vec3 b = (uBind * vec4(p, 1.0)).xyz;
  rw = 0.0;
  if (b.y <= uY0 || b.y >= uY1 || b.z <= -0.02) return vec4(b, 0.0);
  float f = clamp((b.y - uY0) / (uY1 - uY0), 0.0, 1.0) * 39.0;
  float i0 = floor(f);
  float zr = mix(uZRef[int(i0)], uZRef[int(min(i0 + 1.0, 39.0))], f - i0);
  float xw = 1.0 - smoothstep(uXKenar - 0.05, uXKenar, abs(b.x));
  float yw = smoothstep(uY0, uY0 + 0.05, b.y) * (1.0 - smoothstep(uY1 - 0.05, uY1, b.y));
  rw = xw * yw * smoothstep(-0.02, 0.04, b.z);
  float fazla = max(0.0, b.z - zr) * xw * yw;
  b.z -= fazla * 0.95;
  return vec4(b, clamp(fazla * 45.0, 0.0, 1.0));
}
` + sh.vertexShader
        .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nfloat rw;\nvec4 dz = duzlestir(position, rw);\nvBind = (uBind * vec4(position, 1.0)).xyz;\nobjectNormal = normalize(mix(objectNormal, normalize(mat3(uBindInv) * normalize(vec3(dz.x * 1.6, 0.0, max(dz.z, 0.0) + 0.05))), max(rw * 0.8, dz.w)));')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed = (uBindInv * vec4(dz.xyz, 1.0)).xyz;');
      sh.fragmentShader = `uniform float uBelY, uYakaY, uOmuzX, uKoltukY, uKolBit, uAyakY, uDesen;
uniform vec3 uUst, uUst2, uAlt, uAyak, uTen;
varying vec3 vBind;
` + sh.fragmentShader
        .replace('#include <map_fragment>', `#include <map_fragment>
  float kumasMaske = 0.0;
  {
    vec3 kb = vBind; float ax = abs(kb.x), y = kb.y; float on = step(0.0, kb.z);
    float kol = step(uOmuzX - 0.02, ax) * step(uKoltukY, y);
    float ust = (1.0 - kol) * step(uBelY, y) * step(y, uYakaY);
    float kolK = kol * step(ax, uKolBit);
    float alt = (1.0 - kol) * step(uAyakY, y) * step(y, uBelY);
    float ayak = step(y, uAyakY);
    vec3 ustR = uUst;
    if (uDesen > 0.5 && uDesen < 1.5) ustR = mix(uUst, uUst2, step(0.5, fract(kb.x * 13.0 + 0.25)));
    if (uDesen > 1.5 && uDesen < 2.5) {
      float v = step(uYakaY - 0.2, y) * step(ax, (y - (uYakaY - 0.2)) * 0.45) * on;
      ustR = mix(ustR, vec3(0.9, 0.88, 0.84), v);
      float kravat = step(ax, 0.016) * step(uYakaY - 0.32, y) * on * (1.0 - step(uYakaY - 0.02, y));
      ustR = mix(ustR, uUst2, kravat * ust);
    }
    if (uDesen > 2.5 && uDesen < 3.5) ustR = mix(ustR, uUst2, step(ax, 0.004) * on);
    if (uDesen > 3.5) ustR = mix(ustR, uUst2, (1.0 - step(0.032, length(vec2(kb.x + 0.06, y - (uYakaY - 0.13))))) * on);
    float kemer = alt * step(uBelY - 0.025, y);
    vec3 altR = mix(uAlt, uAlt * 0.45, kemer);
    vec3 kumas = ustR * max(ust, kolK) + altR * alt + uAyak * ayak;
    kumasMaske = clamp(max(max(ust, kolK), max(alt, ayak)), 0.0, 1.0);
    diffuseColor.rgb = mix(diffuseColor.rgb * uTen, kumas, kumasMaske);
  }`)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n  roughnessFactor = mix(roughnessFactor, 0.88, kumasMaske);')
        .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n  normal = normalize(mix(normal, geometryNormal, kumasMaske * 0.9));');
    };
    m.customProgramCacheKey = () => 'lbd-govde';
    return m;
  }
  function sacMalzemesi(asil, renk, opaklik = 1) {
    const m = asil.clone();
    const u = { uSac: { value: dogrusal(renk) } };
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, u);
      sh.fragmentShader = 'uniform vec3 uSac;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n  float sl = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11));\n  diffuseColor.rgb = uSac * (0.45 + sl * 2.2);');
    };
    m.customProgramCacheKey = () => 'lbd-sac';
    if (opaklik < 1) { m.transparent = true; m.opacity = opaklik; m.depthWrite = false; }
    return m;
  }

  /* ---------- karakter ---------- */
  function kur(c, ekle) {
    const kaynak = c.siluet === 'b' ? V.b : V.a;
    const G = new T.Group();
    const govde = T.SkeletonUtils.clone(kaynak.scene);
    G.add(govde);
    G.updateMatrixWorld(true);
    const kemik = {};
    let beden = null, gozler = null, kaslar = null;
    govde.traverse(o => {
      if (o.isBone) kemik[o.name] = o;
      if (o.isMesh) {
        // kendi gölgesini almaz: düzleştirilmiş gövdeye düzleştirilmemiş gölge düşmesin
        o.castShadow = true; o.receiveShadow = false; o.frustumCulled = false;
        const n = o.material.name || '';
        if (/Superhero/i.test(n)) beden = o; else if (/Eye/i.test(n)) gozler = o; else if (/Hair/i.test(n)) kaslar = o;
      }
    });
    const nokta = ad => new T.Vector3().setFromMatrixPosition(kemik[ad].matrixWorld);
    // bağlama pozundaki yer işaretleri (karakter kök uzayı, y yukarı, yüz +z)
    const kutu = new T.Box3().setFromBufferAttribute(beden.geometry.attributes.position).applyMatrix4(beden.matrixWorld);
    const lm = {
      bind: beden.matrixWorld.clone(),
      belY: nokta('pelvis').y + 0.05,
      yakaY: nokta('neck_01').y - 0.005,
      omuzX: Math.abs(nokta('upperarm_l').x) + 0.02,
      koltukY: nokta('upperarm_l').y - 0.14,
      kisaKolX: (Math.abs(nokta('upperarm_l').x) + Math.abs(nokta('lowerarm_l').x)) / 2 + 0.03,
      bilekX: Math.abs(nokta('hand_l').x) - 0.035,
      ayakY: nokta('foot_l').y + 0.035,
      tepeY: kutu.max.y
    };
    // önden düzleştirme için referans derinlik: göğüs bandında orta hat, kasık bandında yanlar
    {
      const N = 40, y0 = nokta('thigh_l').y - 0.14, y1 = lm.yakaY - 0.01;
      const orta = new Array(N).fill(-1), yan = new Array(N).fill(-1);
      const pz = beden.geometry.attributes.position, v = new T.Vector3();
      for (let i = 0; i < pz.count; i++) {
        v.fromBufferAttribute(pz, i).applyMatrix4(beden.matrixWorld);
        if (v.y <= y0 || v.y >= y1 || v.z <= 0) continue;
        const b = Math.min(N - 1, Math.floor((v.y - y0) / (y1 - y0) * N)), ax = Math.abs(v.x);
        if (ax < 0.035) orta[b] = Math.max(orta[b], v.z);
        else if (ax > 0.05 && ax < 0.095) yan[b] = Math.max(yan[b], v.z);
      }
      const ref = [];
      for (let b = 0; b < N; b++) {
        const yb = y0 + (b + 0.5) / N * (y1 - y0);
        ref[b] = yb < lm.belY - 0.03 ? (yan[b] > 0 ? yan[b] + 0.012 : -1) : (orta[b] > 0 ? orta[b] + 0.02 : -1);
      }
      for (let b = 0; b < N; b++) if (ref[b] < 0) { let a = b - 1, c2 = b + 1; while (a >= 0 && ref[a] < 0) a--; while (c2 < N && ref[c2] < 0) c2++; ref[b] = a >= 0 && c2 < N ? (ref[a] + ref[c2]) / 2 : a >= 0 ? ref[a] : c2 < N ? ref[c2] : 1; }
      // göğüs bandı: belden üst göğse düz bir çizgi (kumaş göğsün üstünden düz iner)
      const bi = y => Math.max(0, Math.min(N - 1, Math.floor((y - y0) / (y1 - y0) * N)));
      const bA = bi(lm.belY + 0.08), bU = bi(y1 - 0.07);
      for (let b = bA + 1; b < bU; b++) ref[b] = Math.min(ref[b], ref[bA] + (ref[bU] - ref[bA]) * (b - bA) / (bU - bA) + 0.004);
      lm.zRef = ref.map((r, b) => (ref[Math.max(0, b - 1)] + r + ref[Math.min(N - 1, b + 1)]) / 3);
      lm.y0 = y0; lm.y1 = y1; lm.xKenar = lm.omuzX - 0.04;
    }
    beden.material = govdeMalzemesi(beden.material, lm, c.kiyafet, c.ten);
    const yasK = c.yas >= 45 ? Math.min(1, (c.yas - 42) / 22) : 0;
    const sacRenk = '#' + new T.Color(c.sacRenk).lerp(new T.Color('#c9c6c0'), yasK).getHexString();
    if (kaslar) kaslar.material = sacMalzemesi(kaslar.material, sacRenk);

    // göz konumu: gözlük ve aksesuar yerleşimi için
    let gozMerkez = nokta('Head').add(new T.Vector3(0, 0.07, 0.09)), gozGen = 0.065;
    if (gozler) { const gk = new T.Box3().setFromBufferAttribute(gozler.geometry.attributes.position).applyMatrix4(gozler.matrixWorld); gozMerkez = gk.getCenter(new T.Vector3()); gozGen = gk.max.x - gk.min.x; }
    const bas = kemik.Head;

    // saç ve sakal (paketteki konumlarıyla yerleştirilip baş kemiğine bağlanır)
    const takSac = (ad, opak) => {
      const kay = V.saclar[ad]; if (!kay) return;
      const kop = kay.clone(true);
      kay.matrixWorld.decompose(kop.position, kop.quaternion, kop.scale);
      kop.traverse(o => { if (o.isMesh) { o.material = sacMalzemesi(o.material, sacRenk, opak); o.castShadow = true; } });
      G.add(kop); kop.updateMatrixWorld(true); bas.attach(kop);
    };
    if (SAC_DOSYA[c.sac]) takSac(SAC_DOSYA[c.sac]);
    if (c.sakal === 'tam' || c.sakal === 'biyik') takSac('Beard');
    if (c.sakal === 'kirli') takSac('Beard', 0.45);

    // gözlük ve aksesuarlar oyunun kendi parçaları (ekle: sahne.js'den gelen yardımcı)
    const ek = new T.Group(); G.add(ek);
    if (ekle) ekle(ek, { goz: gozMerkez, gozGen, tepeY: lm.tepeY, boyun: nokta('neck_01'), bas: nokta('Head') }, c);
    ek.updateMatrixWorld(true);
    [...ek.children].forEach(ch => bas.attach(ch));
    G.remove(ek);

    // boy ve kilo: bedenin kendi boyuna göre ölçek
    const bmi = c.kilo / Math.pow(c.boy / 100, 2);
    const s = (c.boy / 100) / kutu.max.y;
    const w = Math.max(0.9, Math.min(1.3, 0.86 + (bmi - 21) * 0.028));
    G.scale.set(s * w, s, s * w);

    // animasyonlar: pelvis yüksekliği bu bedene göre kaydırılır
    const mixer = new T.AnimationMixer(govde);
    const fark = kemik.pelvis.position.clone().sub(V.mankenPelvis);
    const eylem = {};
    for (const ad of new Set(Object.values(KLIP))) {
      const asil = V.klipler[ad]; if (!asil) continue;
      const k = asil.clone();
      k.tracks.forEach(t => { if (t.name === 'pelvis.position') for (let i = 0; i < t.values.length; i += 3) { t.values[i] += fark.x; t.values[i + 1] += fark.y; t.values[i + 2] += fark.z; } });
      eylem[ad] = mixer.clipAction(k);
      if (!/_Loop$/.test(ad)) { eylem[ad].setLoop(T.LoopOnce, 1); eylem[ad].clampWhenFinished = true; }
    }
    eylem.Idle_Loop.play();
    const gozY = gozMerkez.y * s;
    G.userData = { model: true, lm, mixer, eylem, aktif: eylem.Idle_Loop, kemik, h: (gozY - 0.21) / 1.45, anim: { ad: 'bekle', t: 0, sure: 0 } };
    return G;
  }

  /* ---------- animasyon ---------- */
  const _q = new T.Quaternion(), _pq = new T.Quaternion(), _r = new T.Quaternion(), _ax = new T.Vector3();
  function dondur(G, kemik, eksen, aci) {
    if (!kemik || !aci) return;
    _ax.copy(eksen).applyQuaternion(G.getWorldQuaternion(_q)).normalize();
    kemik.parent.getWorldQuaternion(_pq);
    _r.setFromAxisAngle(_ax, aci);
    const yerel = _pq.clone().invert().multiply(_r).multiply(_pq);
    kemik.quaternion.premultiply(yerel);
    kemik.updateMatrixWorld(true);
  }
  const X = new T.Vector3(1, 0, 0), Z = new T.Vector3(0, 0, 1), Y = new T.Vector3(0, 1, 0);

  function oynat(G, ad, sure) {
    const U = G.userData;
    U.anim = { ad, t: 0, sure: sure || 0 };
    const hedef = U.eylem[KLIP[ad] || 'Idle_Loop'] || U.eylem.Idle_Loop;
    if (hedef !== U.aktif) {
      hedef.reset().setEffectiveWeight(1).play();
      U.aktif.crossFadeTo(hedef, 0.25, false);
      U.aktif = hedef;
    }
  }
  function guncelle(G, dt) {
    const U = G.userData, A = U.anim;
    A.t += dt;
    if (A.sure && A.t >= A.sure) oynat(G, 'bekle');
    U.mixer.update(dt);
    G.updateMatrixWorld(true);
    // klipte olmayan hareketler: hazır pozun üstüne kemik döndürme
    const k = U.kemik, t = U.anim.t, z = U.anim.sure ? Math.sin(Math.min(1, t / U.anim.sure) * Math.PI) : 1;
    const gir = Math.min(1, t / 0.25);
    switch (U.anim.ad) {
      case 'selam':
        dondur(G, k.upperarm_r, Z, -2.3 * gir); dondur(G, k.lowerarm_r, Z, (-0.3 + Math.sin(t * 12) * 0.45) * gir); break;
      case 'poz':
        dondur(G, k.upperarm_r, X, -1.35 * gir); dondur(G, k.upperarm_r, Z, 0.35 * gir); dondur(G, k.lowerarm_r, X, -1.4 * gir);
        dondur(G, k.spine_03, Z, -0.1 * gir); dondur(G, k.Head, Z, 0.2 * gir); dondur(G, k.Head, Y, -0.15 * gir); break;
      case 'tesekkur':
        dondur(G, k.spine_01, X, 0.35 * z); dondur(G, k.spine_02, X, 0.35 * z); dondur(G, k.spine_03, X, 0.2 * z); dondur(G, k.Head, X, 0.25 * z); break;
      case 'ic':
        dondur(G, k.upperarm_r, X, -1.1 * gir); dondur(G, k.lowerarm_r, X, -1.6 * gir); dondur(G, k.Head, X, -0.35 * z); break;
      case 'sarki':
        dondur(G, k.upperarm_r, X, -1.0 * gir); dondur(G, k.lowerarm_r, X, -1.7 * gir); dondur(G, k.upperarm_l, Z, 0.9 * gir); dondur(G, k.Head, X, -0.2 + Math.sin(t * 2) * 0.08); dondur(G, k.spine_02, Y, Math.sin(t * 2) * 0.12); break;
      case 'sergile':
        dondur(G, k.upperarm_l, Z, 0.45 * gir); dondur(G, k.lowerarm_l, Y, -1.3 * gir); dondur(G, k.Head, Y, 0.25 * gir); break;
    }
  }

  window.Model = { yukle, kur, oynat, guncelle, hazir: () => !!V, KIYAFET };
})();
