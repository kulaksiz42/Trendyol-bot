/* Link Bio'da — hazır 3D karakter modelleri (Quaternius, CC0).
   Beden + saç + animasyon dosyalarını yükler, kıyafetleri gölgelendiriciyle boyar
   (paketin ücretsiz sürümünde kıyafet yok; herkes giyinik kuralı burada sağlanır). */
'use strict';
(function () {
  const T = THREE;
  const YOL = 'varlik/';
  let V = null;           // yüklenen varlıklar
  let yukleniyor = null;

  /* ---------- kıyafet tanımları ----------
     ustUst/ustAlt: üst parçanın üst ve alt kenarı (yaka, bra, gobek, bel, uyluk, kalca)
     kol: yok | kisa | uzun · dekolte: önden V derinliği (m) · alt: uzun | sort | mini | kucuk | yok
     ayak: ayakkabi | bot | yok · corap: 0 yok, 1 file, 2 opak · desen: 0 düz, 1 çubuklu, 2 gömlek+kravat,
     3 fermuar, 5 dantel, 6 saten · duz: bol kıyafet için gövde önünü düzleştirme (0-1) */
  const KIYAFET = {
    tisort:     { ust: '#ece6da', ust2: '#ff4f8b', alt: '#3d5a80', ayakR: '#2b2b33', ustUst: 'yaka', ustAlt: 'bel', kol: 'kisa', alt_: 'uzun', ayak: 'ayakkabi', duz: 0.5 },
    esofman:    { ust: '#5f6573', ust2: '#d9d9d9', alt: '#565b67', ayakR: '#f0f0f0', ustUst: 'yaka', ustAlt: 'bel', kol: 'uzun', alt_: 'uzun', ayak: 'ayakkabi', desen: 3, duz: 0.8 },
    sik:        { ust: '#7a1f3d', ust2: '#1d1d24', alt: '#1d1d24', ayakR: '#151515', ustUst: 'yaka', ustAlt: 'bel', kol: 'uzun', alt_: 'uzun', ayak: 'ayakkabi', desen: 2, duz: 0.4 },
    forma:      { ust: '#f2f2ee', ust2: '#1f7a4c', alt: '#1d1d24', ayakR: '#f0f0f0', ustUst: 'yaka', ustAlt: 'bel', kol: 'kisa', alt_: 'sort', ayak: 'ayakkabi', desen: 1, duz: 0.4 },
    hirka:      { ust: '#7d4e57', ust2: '#5d3a41', alt: '#3a3a44', ayakR: '#2b2b33', ustUst: 'yaka', ustAlt: 'bel', kol: 'uzun', alt_: 'uzun', ayak: 'ayakkabi', duz: 0.8 },
    atlet:      { ust: '#f2f2ee', ust2: '#f2f2ee', alt: '#2e3440', ayakR: '#f0f0f0', ustUst: 'yaka', ustAlt: 'bel', kol: 'yok', alt_: 'sort', ayak: 'ayakkabi', dekolte: 0.05 },
    croptop:    { ust: '#ff4f8b', ust2: '#ff4f8b', alt: '#4a6fa5', ayakR: '#f0f0f0', ustUst: 'yaka', ustAlt: 'gobek', kol: 'yok', alt_: 'sort', ayak: 'ayakkabi', dekolte: 0.06 },
    mini:       { ust: '#16141a', ust2: '#16141a', alt: '#16141a', ayakR: '#16141a', ustUst: 'yaka', ustAlt: 'bel', kol: 'yok', alt_: 'mini', ayak: 'bot', corap: 1, dekolte: 0.17, parlak: 0.45 },
    gece:       { ust: '#b0122d', ust2: '#b0122d', alt: '#b0122d', ayakR: '#16141a', ustUst: 'bra', ustAlt: 'kalca', kol: 'yok', alt_: 'yok', ayak: 'ayakkabi', desen: 6 },
    fitness:    { ust: '#2b2b35', ust2: '#46d39a', alt: '#2b2b35', ayakR: '#f0f0f0', ustUst: 'bra', ustAlt: 'gogusAlt', kol: 'yok', alt_: 'uzun', ayak: 'ayakkabi' },
    // ic: mankenin kendi iç çamaşırı kesimi giysi olarak boyanır (üçgen kap, askı, jartiyer eklenebilir)
    bikini:     { ust: '#ff5a4e', ust2: '#ffffff', alt: '#ff5a4e', ayakR: '#000', ustUst: 'yok', ustAlt: 'yok', kol: 'yok', alt_: 'yok', ayak: 'yok', ic: 1, ucgen: 1, parlak: 0.5 },
    leopar:     { ust: '#c99a5b', ust2: '#2a1a10', alt: '#c99a5b', ayakR: '#000', ustUst: 'yok', ustAlt: 'yok', kol: 'yok', alt_: 'yok', ayak: 'yok', ic: 1, ucgen: 1, desen: 8, parlak: 0.6 },
    tekparca:   { ust: '#101014', ust2: '#c9a14a', alt: '#101014', ayakR: '#000', ustUst: 'yaka', ustAlt: 'kasik', kol: 'yok', alt_: 'yok', ayak: 'yok', ic: 1, dekolte: 0.3, parlak: 0.35 },
    dantel:     { ust: '#120a10', ust2: '#7a0f2a', alt: '#120a10', ayakR: '#120a10', ustUst: 'yok', ustAlt: 'yok', kol: 'yok', alt_: 'yok', ayak: 'yok', ic: 1, ucgen: 1, corap: 1, desen: 5 },
    ictakim:    { ust: '#9e0f2c', ust2: '#e8c4cc', alt: '#9e0f2c', ayakR: '#000', ustUst: 'yok', ustAlt: 'yok', kol: 'yok', alt_: 'yok', ayak: 'yok', ic: 1, ucgen: 1, desen: 6 },
    jartiyer:   { ust: '#0b0a0d', ust2: '#5a0f22', alt: '#0b0a0d', ayakR: '#0b0a0d', ustUst: 'yok', ustAlt: 'yok', kol: 'yok', alt_: 'yok', ayak: 'yok', ic: 1, ucgen: 1, desen: 5, corap: 2, jartiyer: 1 },
    filebody:   { ust: '#0b0a0d', ust2: '#0b0a0d', alt: '#0b0a0d', ayakR: '#0b0a0d', ustUst: 'yok', ustAlt: 'yok', kol: 'yok', alt_: 'yok', ayak: 'bot', ic: 1, corap: 1, file: 1, parlak: 0.3 },
    lateks:     { ust: '#08080a', ust2: '#08080a', alt: '#08080a', ayakR: '#08080a', ustUst: 'yaka', ustAlt: 'bel', kol: 'uzun', alt_: 'uzun', ayak: 'bot', dekolte: 0.2, parlak: 0.06, desen: 6 },
    boxer:      { ust: '#22252c', ust2: '#e8e8e8', alt: '#22252c', ayakR: '#000', ustUst: 'yok', ustAlt: 'yok', kol: 'yok', alt_: 'yok', ayak: 'yok', ic: 1, ustsuzB: 1 },
    slip:       { ust: '#1f4fd1', ust2: '#ffffff', alt: '#1f4fd1', ayakR: '#000', ustUst: 'yok', ustAlt: 'yok', kol: 'yok', alt_: 'yok', ayak: 'yok', ic: 1, ustsuzB: 1, parlak: 0.45 },
    gecelik:    { ust: '#c9a0dc', ust2: '#c9a0dc', alt: '#c9a0dc', ayakR: '#000', ustUst: 'bra', ustAlt: 'kalca', kol: 'yok', alt_: 'yok', ayak: 'yok', desen: 6, dekolte: 0.06 },
    acikgomlek: { ust: '#f4f1ea', ust2: '#f4f1ea', alt: '#1d1d24', ayakR: '#151515', ustUst: 'yaka', ustAlt: 'bel', kol: 'uzun', alt_: 'uzun', ayak: 'ayakkabi', dekolte: 0.34, desen: 6 },
    havlu:      { ust: '#f4f1ec', ust2: '#f4f1ec', alt: '#f4f1ec', ayakR: '#000', ustUst: 'bra', ustAlt: 'kalca', kol: 'yok', alt_: 'yok', ayak: 'yok', desen: 7, duz: 0.3 },
    gomlek:     { ust: '#eef1f6', ust2: '#eef1f6', alt: '#eef1f6', ayakR: '#000', ustUst: 'yaka', ustAlt: 'kalca', kol: 'uzun', alt_: 'yok', ayak: 'yok', dekolte: 0.15, duz: 0.6 },
    korse:      { ust: '#0d0b0f', ust2: '#5a0f22', alt: '#0d0b0f', ayakR: '#0d0b0f', ustUst: 'bra', ustAlt: 'bel', kol: 'yok', alt_: 'mini', ayak: 'bot', corap: 1, desen: 6, parlak: 0.18 },
    mayo:       { ust: '#1aa3a3', ust2: '#1aa3a3', alt: '#1aa3a3', ayakR: '#000', ustUst: 'yok', ustAlt: 'yok', kol: 'yok', alt_: 'sort', ayak: 'yok', ic: 1, ustsuzB: 1 }
  };
  const SAC_DOSYA = { kisa: 'SimpleParted', uzun: 'Long', topuz: 'Buns', kazinmis: 'Buzzed', kisakesim: 'BuzzedFemale' };
  const KLIP = {
    bekle: 'Idle_Loop', konus: 'Idle_Talking_Loop', dans: 'Dance_Loop', sarki: 'Idle_Talking_Loop', selam: 'Idle_Loop',
    poz: 'Idle_Loop', ozel: 'Idle_Loop', opucuk: 'Idle_Loop', tesekkur: 'Idle_Loop', ic: 'Idle_Loop', panik: 'Jump_Loop', sok: 'Hit_Head', gul: 'Idle_Talking_Loop', sergile: 'Idle_Loop',
    podyum: 'Walk_Formal_Loop'
  };
  // dans çeşitleri: hazır klip ya da bekleme üstüne işlemsel hareket
  const DANS = ['klip', 'klip', 'dalga', 'kalca'];

  // yüz dokusundaki noktalar (piksel/1024): göz merkezleri, göz yarıçapı, dudak, yanak
  const YUZ = {
    a: { g1: [135, 182], g2: [242, 182], gr: [26, 15], d: [187, 268], dr: [31, 14], y1: [108, 236], y2: [266, 236], yr: [30, 22] },
    b: { g1: [138, 182], g2: [242, 182], gr: [26, 14], d: [190, 272], dr: [31, 11], y1: [110, 236], y2: [270, 236], yr: [30, 22] }
  };
  // ruj, far, eyeliner, allık: [renk, yoğunluk]; parlak: dudak parlatıcısı
  const MAKYAJ = {
    yok:    { ruj: ['#b45a5a', 0], far: ['#6a4a40', 0], liner: 0, allik: 0, parlak: 0 },
    dogal:  { ruj: ['#c0606a', 0.35], far: ['#8a5a4a', 0.22], liner: 0.4, allik: 0.16, parlak: 0.3 },
    pembe:  { ruj: ['#e2578f', 0.7], far: ['#c86a9c', 0.45], liner: 0.55, allik: 0.26, parlak: 0.8 },
    smokey: { ruj: ['#9a5a56', 0.4], far: ['#231a1f', 0.8], liner: 1, allik: 0.12, parlak: 0.2, kanat: 1 },
    glam:   { ruj: ['#a00f26', 0.9], far: ['#5a2236', 0.55], liner: 1, allik: 0.22, parlak: 0.9, kanat: 1 }
  };
  const GOZ = { kahve: null, ela: '#8a6a2a', yesil: '#3f8a4f', mavi: '#3f7cc4', gri: '#8593a3', siyah: '#1a1210' };

  const dogrusal = hex => new T.Color(hex).convertSRGBToLinear();
  // dokudaki ortalama ten (sRGB ~#d99c78); hedef tenin bu renge oranı çarpan olarak kullanılır
  const DOKU_TEN = dogrusal('#d99c78');

  function yukle() {
    if (V) return Promise.resolve(V);
    if (yukleniyor) return yukleniyor;
    if (!T.GLTFLoader || !T.SkeletonUtils) return Promise.reject(new Error('yükleyici yok'));
    const L = new T.GLTFLoader();
    // .glb sunulmayan ortamlarda (ör. Claude sayfası) aynı dosyanın base64 metin kopyası denenir
    const ikili = u => fetch(YOL + u).then(r => { if (!r.ok) throw new Error(u); return r.arrayBuffer(); })
      .catch(() => fetch(YOL + u.replace(/\.glb$/, '.b64.txt')).then(r => { if (!r.ok) throw new Error(u); return r.text(); })
        .then(t => { const s = atob(t.trim()), b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b.buffer; }));
    const al = u => ikili(u).then(buf => new Promise((ok, hata) => L.parse(buf, '', ok, hata)));
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
  function govdeMalzemesi(asil, lm, kiy, ten, c) {
    const m = asil.clone();
    const k = KIYAFET[kiy] || KIYAFET.tisort;
    const tenK = dogrusal(ten);
    const Yk = { yaka: lm.yakaY, bra: lm.yakaY - 0.075, gogusAlt: lm.yakaY - 0.285, gobek: lm.belY + 0.11, bel: lm.belY, kasik: lm.belY - 0.07, kalca: lm.uylukOrtaY + 0.07, yok: -9 };
    const mk = MAKYAJ[c.makyaj] || MAKYAJ.yok, yz = YUZ[c.siluet === 'b' ? 'b' : 'a'];
    const uv = (p, r) => new T.Vector4(p[0] / 1024, p[1] / 1024, r[0] / 1024, r[1] / 1024);
    const altAlt = { uzun: lm.ayakY, sort: lm.uylukOrtaY, mini: lm.uylukOrtaY + 0.08, kucuk: lm.kasikY, yok: 9 }[k.alt_ || 'uzun'];
    const ayakUst = { ayakkabi: lm.ayakY, bot: lm.botY, yok: -9 }[k.ayak || 'ayakkabi'];
    const u = {
      uBind: { value: lm.bind }, uBelY: { value: lm.belY }, uYakaY: { value: lm.yakaY }, uOmuzX: { value: lm.omuzX },
      uKoltukY: { value: lm.koltukY }, uKolBit: { value: k.kol === 'kisa' ? lm.kisaKolX : k.kol === 'uzun' ? lm.bilekX : 0 },
      uUstUst: { value: Yk[k.ustUst || 'yaka'] }, uUstAlt: { value: Yk[k.ustAlt || 'bel'] }, uDekolte: { value: k.dekolte || 0 },
      uAltUst: { value: k.alt_ === 'yok' ? -9 : lm.belY - (k.alt_ === 'kucuk' ? 0.03 : 0) }, uAltAlt: { value: altAlt }, uAyakUst: { value: ayakUst },
      uCorap: { value: k.corap || 0 }, uCorapUst: { value: lm.uylukOrtaY + 0.1 }, uPuruz: { value: k.parlak != null ? k.parlak : (k.desen === 6 ? 0.28 : 0.88) }, uDuz: { value: k.duz || 0 }, uKemer: { value: ['uzun', 'sort'].includes(k.alt_ || 'uzun') ? 1 : 0 },
      uUst: { value: dogrusal(k.ust) }, uUst2: { value: dogrusal(k.ust2) }, uAlt: { value: dogrusal(k.alt) }, uAyak: { value: dogrusal(k.ayakR) },
      uBindInv: { value: lm.bind.clone().invert() }, uZRef: { value: lm.zRef }, uY0: { value: lm.y0 }, uY1: { value: lm.y1 }, uXKenar: { value: lm.xKenar },
      uDesen: { value: k.desen || 0 }, uTen: { value: new T.Vector3(tenK.r / DOKU_TEN.r, tenK.g / DOKU_TEN.g, tenK.b / DOKU_TEN.b) },
      uTenRenk: { value: new T.Vector3(tenK.r, tenK.g, tenK.b) },
      uIc: { value: k.ic ? 1 : 0 }, uIcUst: { value: k.ustsuzB && c.siluet === 'b' ? 0 : 1 }, uUcgen: { value: k.ucgen ? 1 : 0 },
      uGogus: { value: lm.gogus }, uJartiyer: { value: k.jartiyer ? 1 : 0 }, uUylukX: { value: lm.uylukX }, uFile: { value: k.file ? 1 : 0 },
      uG1: { value: uv(yz.g1, yz.gr) }, uG2: { value: uv(yz.g2, yz.gr) }, uDudak: { value: uv(yz.d, yz.dr) },
      uYa1: { value: uv(yz.y1, yz.yr) }, uYa2: { value: uv(yz.y2, yz.yr) },
      uRuj: { value: dogrusal(mk.ruj[0]) }, uRujA: { value: mk.ruj[1] }, uFar: { value: dogrusal(mk.far[0]) }, uFarA: { value: mk.far[1] },
      uLiner: { value: mk.liner }, uKanat: { value: mk.kanat || 0 }, uAllik: { value: mk.allik }, uRujParlak: { value: mk.parlak },
      uParilti: { value: c.parilti != null ? c.parilti : 0.25 },
      // mimik: göz kırpma (sol/sağ), gülümseme, ağız açma, dudak büzme; doku→bağlama ölçeği
      uKirp: { value: new T.Vector2() }, uGulus: { value: 0 }, uAgiz: { value: 0 }, uBuz: { value: 0 }, uYuzOlcek: { value: lm.yuzOlcek || new T.Vector2(0, 0) }
    };
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, u);
      // bol kıyafet: gövdenin önündeki çıkıntılar (göğüs, kasık) bağlama uzayında düzleştirilir
      sh.vertexShader = `uniform mat4 uBind, uBindInv; uniform float uZRef[40]; uniform float uY0, uY1, uXKenar, uDuz;
uniform vec4 uG1, uG2, uDudak; uniform vec2 uKirp, uYuzOlcek; uniform float uGulus, uAgiz, uBuz;
varying vec3 vBind;
// göz kapağı: üst kapak göz çizgisine iner, alt kapak biraz kalkar (k<0: gözler irileşir)
vec3 kapak(vec2 u, vec4 G, float k) {
  vec2 q = (u - G.xy) / G.zw;
  float w = 1.0 - smoothstep(0.9, 1.7, length(q));
  float hy = G.w * abs(uYuzOlcek.y);
  float ust = w * (1.0 - smoothstep(-0.15, 0.2, q.y)) * clamp(-q.y, 0.0, 1.3);
  float alt = w * smoothstep(0.05, 0.4, q.y) * clamp(q.y, 0.0, 1.0);
  return vec3(0.0, -k * ust * hy + max(k, 0.0) * 0.3 * alt * hy, max(k, 0.0) * ust * hy * 0.25);
}
// yüz dokusu koordinatına göre mimik (yalnızca yüz adası)
vec3 yuzDeform(vec2 u) {
  if (u.x > 0.4 || u.y > 0.4 || uYuzOlcek.x == 0.0) return vec3(0.0);
  vec3 d = kapak(u, uG1, uKirp.x) + kapak(u, uG2, uKirp.y);
  vec2 m = (u - uDudak.xy) / uDudak.zw;
  float hx = uDudak.z * uYuzOlcek.x, hy = uDudak.w * abs(uYuzOlcek.y);
  float rm = length(m * vec2(0.75, 1.0));
  float alt = (1.0 - smoothstep(0.8, 2.6, rm)) * smoothstep(-0.25, 0.35, m.y);
  d.y -= uAgiz * alt * hy * 1.6;
  float kose = 1.0 - smoothstep(0.2, 1.1, length(vec2(abs(m.x) - 1.0, m.y * 1.3)));
  d.y += uGulus * kose * hy * 0.9;
  d.x += uGulus * kose * sign(m.x) * hx * 0.18;
  float dud = 1.0 - smoothstep(0.7, 1.4, rm);
  d.x -= uBuz * dud * m.x * hx * 0.35;
  d.z += uBuz * dud * hy * 0.9;
  return d;
}
vec4 duzlestir(vec3 p, out float rw) {
  vec3 b = (uBind * vec4(p, 1.0)).xyz;
  rw = 0.0;
  if (b.y <= uY0 || b.y >= uY1 || b.z <= -0.02) return vec4(b, 0.0);
  float f = clamp((b.y - uY0) / (uY1 - uY0), 0.0, 1.0) * 39.0;
  float i0 = floor(f);
  float zr = mix(uZRef[int(i0)], uZRef[int(min(i0 + 1.0, 39.0))], f - i0);
  float xw = 1.0 - smoothstep(uXKenar - 0.05, uXKenar, abs(b.x));
  float yw = smoothstep(uY0, uY0 + 0.05, b.y) * (1.0 - smoothstep(uY1 - 0.05, uY1, b.y));
  rw = xw * yw * smoothstep(-0.02, 0.04, b.z) * uDuz;
  float fazla = max(0.0, b.z - zr) * xw * yw * uDuz;
  b.z -= fazla * 0.95;
  return vec4(b, clamp(fazla * 45.0, 0.0, 1.0));
}
` + sh.vertexShader
        .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nfloat rw;\nvec4 dz = duzlestir(position, rw);\nvBind = (uBind * vec4(position, 1.0)).xyz;\nobjectNormal = normalize(mix(objectNormal, normalize(mat3(uBindInv) * normalize(vec3(dz.x * 1.6, 0.0, max(dz.z, 0.0) + 0.05))), max(rw * 0.8, dz.w)));')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed = (uBindInv * vec4(dz.xyz + yuzDeform(uv), 1.0)).xyz;');
      sh.fragmentShader = `uniform float uBelY, uYakaY, uOmuzX, uKoltukY, uKolBit, uDesen, uKemer, uUstUst, uUstAlt, uDekolte, uAltUst, uAltAlt, uAyakUst, uCorap, uCorapUst, uPuruz;
uniform vec3 uUst, uUst2, uAlt, uAyak, uTen, uTenRenk, uGogus, uRuj, uFar;
uniform float uIc, uIcUst, uUcgen, uJartiyer, uUylukX, uFile, uRujA, uFarA, uLiner, uKanat, uAllik, uRujParlak, uParilti, uAgiz;
uniform vec4 uG1, uG2, uDudak, uYa1, uYa2;
varying vec3 vBind;
vec3 leopar(vec2 p, vec3 a, vec3 b) {
  vec2 g = p * 70.0, c = floor(g), f = fract(g);
  vec2 o = vec2(fract(sin(dot(c, vec2(127.1, 311.7))) * 43758.5), fract(sin(dot(c, vec2(269.5, 183.3))) * 43758.5));
  float d = length(f - (0.3 + 0.4 * o));
  float halka = smoothstep(0.17, 0.21, d) * (1.0 - smoothstep(0.29, 0.33, d));
  return mix(mix(a, a * 0.62, 1.0 - smoothstep(0.15, 0.19, d)), b, halka * 0.95);
}
// göz makyajı: far kapağın üstünde, eyeliner kirpik çizgisinde, istenirse dışa kanat
vec3 gozMakyaj(vec3 renk, vec2 uv, vec4 G, float sh, float cilt) {
  vec2 d = (uv - G.xy) / G.zw;
  float e = length(d), xo = d.x * sign(G.x - 0.1836);
  float far = (1.0 - smoothstep(0.5, 1.0, length((d - vec2(0.0, -0.7)) / vec2(1.5, 1.05)))) * (1.0 - smoothstep(-0.1, 0.25, d.y));
  float cizgi = smoothstep(0.68, 0.82, e) * (1.0 - smoothstep(0.95, 1.12, e)) * mix(0.35, 1.0, 1.0 - smoothstep(-0.1, 0.3, d.y));
  float kanat = uKanat * step(0.8, xo) * step(xo, 1.75) * step(abs(d.y + (xo - 0.8) * 0.6 + 0.12), 0.03 + 0.14 * (1.75 - xo));
  renk = mix(renk, uFar * sh, far * uFarA * cilt);
  return mix(renk, vec3(0.012, 0.008, 0.01), clamp(max(cizgi, kanat) * uLiner, 0.0, 1.0) * cilt);
}
` + sh.fragmentShader
        .replace('#include <map_fragment>', `#include <map_fragment>
  float kumasMaske = 0.0, rujParlak = 0.0;
  {
    vec3 tex0 = diffuseColor.rgb;
    // mankenin dokusundaki koyu iç çamaşırı kesimi
    float koyu = 1.0 - smoothstep(0.05, 0.11, tex0.r);
    vec3 kb = vBind; float ax = abs(kb.x), y = kb.y; float on = step(0.0, kb.z);
    vec3 tenR = diffuseColor.rgb * uTen;
    float kol = step(uOmuzX - 0.02, ax) * step(uKoltukY, y);
    float govde = 1.0 - kol;
    float v = on * step(uUstUst - uDekolte, y) * step(ax, (y - (uUstUst - uDekolte)) * 0.55 + 0.004) * step(0.001, uDekolte);
    float ust = govde * step(uUstAlt, y) * step(y, uUstUst) * (1.0 - v);
    float kolK = kol * step(ax, uKolBit) * step(0.001, uKolBit);
    float alt = govde * step(uAltAlt, y) * step(y, uAltUst);
    float ayak = step(y, uAyakUst);
    vec3 ustR = uUst;
    if (uDesen > 0.5 && uDesen < 1.5) ustR = mix(uUst, uUst2, step(0.5, fract(kb.x * 13.0 + 0.25)));
    if (uDesen > 1.5 && uDesen < 2.5) {
      float g = step(uYakaY - 0.2, y) * step(ax, (y - (uYakaY - 0.2)) * 0.45) * on;
      ustR = mix(ustR, vec3(0.9, 0.88, 0.84), g);
      float kravat = step(ax, 0.016) * step(uYakaY - 0.32, y) * on * (1.0 - step(uYakaY - 0.02, y));
      ustR = mix(ustR, uUst2, kravat * ust);
    }
    if (uDesen > 2.5 && uDesen < 3.5) ustR = mix(ustR, uUst2, step(ax, 0.004) * on);
    vec2 lp = kb.xy + vec2(kb.z * 0.8, 0.0);
    if (uDesen > 7.5) ustR = leopar(lp, uUst, uUst2);
    vec3 altR = mix(uAlt, uAlt * 0.45, alt * step(uAltUst - 0.025, y) * uKemer);
    if (uDesen > 7.5) altR = leopar(lp, uAlt, uUst2);
    vec3 kumas = ustR * max(ust, kolK) + altR * alt * (1.0 - ust) + uAyak * ayak;
    // dikiş: kumaş kenarlarında koyu çizgi (vücut boyası değil giysi görünsün)
    float kenarU = ust * (1.0 - smoothstep(0.0, 0.009, min(y - uUstAlt, uUstUst - y)));
    float kenarA = alt * (1.0 - ust) * (1.0 - smoothstep(0.0, 0.009, min(y - uAltAlt, uAltUst - y)));
    float kenarK = kolK * (1.0 - smoothstep(0.0, 0.008, uKolBit - ax));
    kumas *= 1.0 - 0.32 * clamp(kenarU + kenarA + kenarK, 0.0, 1.0);
    // örgü dokusu (saten ve dantel hariç)
    if (uDesen < 4.5) kumas *= 1.0 + 0.045 * sin(kb.y * 700.0) * sin(kb.x * 700.0 + kb.z * 500.0);
    if (uDesen > 6.5) kumas *= 0.9 + 0.12 * fract(sin(dot(floor(kb.xy * 900.0), vec2(12.9898, 78.233))) * 43758.5453);
    kumasMaske = clamp(max(max(ust, kolK), max(alt, ayak)), 0.0, 1.0);
    if (uDesen > 4.5 && uDesen < 5.5) {
      // dantel: ince desenden ten görünür, kenarda renkli şerit
      float d = smoothstep(0.55, 0.75, sin(kb.x * 260.0) * sin(kb.y * 260.0) + 0.35 * sin((kb.x + kb.y) * 140.0));
      kumas = mix(kumas, mix(tenR, uUst2, 0.25), d * 0.55);
    }
    vec3 renk = mix(tenR, kumas, kumasMaske);
    if (uIc > 0.5) {
      float ustB = step(uBelY + 0.06, y);
      float ek = 0.0;
      if (uUcgen > 0.5) {
        // üçgen kap: göğüs ucunun çevresinde, tepesinden boyuna ince askı, sırtta bağ
        float gx = ax - uGogus.x + 0.004, gy = y - uGogus.y;
        float t = clamp((0.085 - gy) / 0.14, 0.0, 1.0);
        ek = on * step(-0.055, gy) * step(gy, 0.085) * step(abs(gx), t * 0.082);
        vec2 a = vec2(uGogus.x - 0.004, uGogus.y + 0.085), ba = vec2(0.048, uYakaY + 0.012) - a, pa = vec2(ax, y) - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        ek = max(ek, step(length(pa - ba * h), 0.0045) * step(-0.03, kb.z));
        ek = max(ek, (1.0 - on) * govde * step(abs(y - (uGogus.y - 0.03)), 0.008));
      }
      if (uJartiyer > 0.5) {
        ek = max(ek, govde * step(abs(y - (uBelY - 0.015)), 0.016));
        ek = max(ek, govde * step(abs(ax - uUylukX), 0.0045) * step(uCorapUst - 0.01, y) * step(y, uBelY - 0.015));
      }
      float icK = max(koyu * mix(1.0, uIcUst, ustB), ek) * (1.0 - kumasMaske);
      vec3 icR = mix(uAlt, uUst, ustB);
      if (uDesen > 7.5) icR = leopar(lp, icR, uUst2);
      if (uDesen > 4.5 && uDesen < 5.5) {
        float d = smoothstep(0.55, 0.75, sin(kb.x * 300.0) * sin(kb.y * 300.0) + 0.35 * sin((kb.x + kb.y) * 160.0));
        icR = mix(icR, mix(tenR, uUst2, 0.3), d * 0.42 * koyu);
      }
      // biye: kesimin kenarında ince şerit
      icR = mix(icR, uUst2, clamp(koyu * (1.0 - koyu) * 3.2, 0.0, 1.0) * 0.7);
      renk = mix(renk, uTenRenk, koyu * (1.0 - uIcUst) * ustB * (1.0 - kumasMaske));
      renk = mix(renk, icR, icK);
      kumasMaske = max(kumasMaske, icK);
    }
    // çorap: file desen ya da opak, kumaşın dışında kalan bacaklarda
    float bacak = govde * (1.0 - kumasMaske) * step(y, uCorapUst) * step(0.5, uCorap);
    // file body: boyundan bileklere kadar ağ
    bacak = max(bacak, uFile * (1.0 - kumasMaske) * step(y, uYakaY - 0.03));
    if (uCorap > 0.5 && uCorap < 1.5) {
      float a1 = abs(fract((kb.x + kb.y) * 60.0) - 0.5), a2 = abs(fract((kb.x - kb.y) * 60.0) - 0.5);
      float ag = 1.0 - smoothstep(0.06, 0.12, min(a1, a2));
      renk = mix(renk, vec3(0.02), bacak * ag * 0.9);
    } else if (uCorap > 1.5) renk = mix(renk, vec3(0.03), bacak * mix(0.75, 0.95, uJartiyer * step(uCorapUst - 0.025, y)));
    // makyaj (yüz dokusu koordinatlarında)
    #ifdef USE_UV
    {
      float cilt = 1.0 - kumasMaske;
      float sh = clamp(dot(tex0, vec3(0.3, 0.59, 0.11)) / 0.2, 0.45, 1.3);
      float dud = 1.0 - smoothstep(0.62, 1.0, length((vUv - uDudak.xy) / uDudak.zw));
      renk = mix(renk, uRuj * sh, dud * uRujA * cilt);
      rujParlak = dud * uRujParlak * step(0.01, uRujA);
      float al = max(1.0 - smoothstep(0.15, 1.0, length((vUv - uYa1.xy) / uYa1.zw)), 1.0 - smoothstep(0.15, 1.0, length((vUv - uYa2.xy) / uYa2.zw)));
      renk = mix(renk, renk * vec3(1.12, 0.74, 0.78), al * uAllik * cilt);
      renk = gozMakyaj(renk, vUv, uG1, sh, cilt);
      renk = gozMakyaj(renk, vUv, uG2, sh, cilt);
      // ağız açıkken dudak arası koyu (ağız içi)
      vec2 am = (vUv - uDudak.xy) / uDudak.zw;
      float yarik = (1.0 - smoothstep(0.02, 0.06 + 0.32 * uAgiz, abs(am.y + 0.06))) * (1.0 - smoothstep(0.5, 0.85, abs(am.x))) * smoothstep(0.04, 0.12, uAgiz);
      renk = mix(renk, vec3(0.06, 0.012, 0.016), yarik * cilt);
      rujParlak *= 1.0 - yarik;
    }
    #endif
    diffuseColor.rgb = renk;
  }`)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n  roughnessFactor = mix(roughnessFactor * (1.0 - 0.45 * uParilti), uPuruz, kumasMaske);\n  roughnessFactor = mix(roughnessFactor, 0.16, rujParlak);')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  totalEmissiveRadiance += diffuseColor.rgb * vec3(0.05, 0.016, 0.01) * (1.0 - kumasMaske);')
        .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n  normal = normalize(mix(normal, geometryNormal, kumasMaske * 0.9));');
    };
    if (window.__lbdEnv) { m.envMap = window.__lbdEnv; m.envMapIntensity = 0.4; }
    m.customProgramCacheKey = () => 'lbd-govde5';
    m.userData.mimik = u;
    return m;
  }
  function gozMalzemesi(asil, renk) {
    const m = asil.clone();
    const u = { uGoz: { value: renk ? dogrusal(renk) : new T.Color(0, 0, 0) }, uRenkli: { value: renk ? 1 : 0 }, uBakis: { value: new T.Vector2() } };
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, u);
      sh.fragmentShader = 'uniform vec3 uGoz; uniform float uRenkli; uniform vec2 uBakis;\n' + sh.fragmentShader.replace('#include <map_fragment>', `#ifdef USE_MAP
  diffuseColor *= texture2D(map, vUv - uBakis);
  #endif
  #ifdef USE_UV
  if (uRenkli > 0.5) { float r = length(vUv - uBakis - 0.5);
    float iris = (1.0 - smoothstep(0.095, 0.108, r)) * smoothstep(0.036, 0.05, r);
    float l = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11));
    diffuseColor.rgb = mix(diffuseColor.rgb, uGoz * (0.35 + l * 5.0), iris * 0.9); }
  #endif`);
    };
    // ıslak göz: ışık noktası yansısın
    m.roughness = 0.12; m.metalness = 0;
    if (window.__lbdEnv) { m.envMap = window.__lbdEnv; m.envMapIntensity = 0.7; }
    m.customProgramCacheKey = () => 'lbd-goz2';
    m.userData.goz = u;
    return m;
  }
  function sacMalzemesi(asil, renk, opaklik = 1, kasYon) {
    const m = asil.clone();
    const u = { uSac: { value: dogrusal(renk) }, uKas: { value: 0 }, uKasYon: { value: kasYon || new T.Vector3() } };
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, u);
      if (kasYon) sh.vertexShader = 'uniform float uKas; uniform vec3 uKasYon;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += uKasYon * uKas;');
      sh.fragmentShader = 'uniform vec3 uSac;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n  float sl = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11));\n  diffuseColor.rgb = uSac * (0.45 + sl * 2.2);');
    };
    if (window.__lbdEnv) { m.envMap = window.__lbdEnv; m.envMapIntensity = 0.3; }
    m.customProgramCacheKey = () => kasYon ? 'lbd-kas' : 'lbd-sac';
    m.userData.kas = u;
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
      tepeY: kutu.max.y,
      kasikY: nokta('thigh_l').y - 0.075,
      uylukOrtaY: (nokta('thigh_l').y + nokta('calf_l').y) / 2,
      botY: (nokta('calf_l').y + nokta('foot_l').y) / 2 + 0.06
    };
    lm.uylukX = Math.abs(nokta('thigh_l').x) + 0.005;
    {
      // yüz adası (doku sol üst): bağlama x ~ u, y ~ v için en küçük kareler eğimi
      const pz = beden.geometry.attributes.position, uvA = beden.geometry.attributes.uv, v = new T.Vector3();
      let n = 0, su = 0, sx = 0, suu = 0, sux = 0, sv = 0, sy = 0, svv = 0, svy = 0;
      for (let i = 0; i < pz.count; i++) {
        const u = uvA.getX(i), w = uvA.getY(i);
        if (u > 0.08 && u < 0.3 && w > 0.12 && w < 0.32) {
          v.fromBufferAttribute(pz, i).applyMatrix4(beden.matrixWorld);
          n++; su += u; sx += v.x; suu += u * u; sux += u * v.x; sv += w; sy += v.y; svv += w * w; svy += w * v.y;
        }
      }
      lm.yuzOlcek = n > 20 ? new T.Vector2((n * sux - su * sx) / (n * suu - su * su), (n * svy - sv * sy) / (n * svv - sv * sv)) : null;
    }
    {
      // göğüs ucu (bağlama uzayında en öndeki nokta; üçgen bikini kapları buna göre)
      const pz = beden.geometry.attributes.position, v = new T.Vector3(), en = new T.Vector3(0.09, lm.yakaY - 0.17, 0);
      for (let i = 0; i < pz.count; i++) {
        v.fromBufferAttribute(pz, i).applyMatrix4(beden.matrixWorld);
        if (v.y > lm.belY + 0.12 && v.y < lm.yakaY - 0.06 && v.x > 0.03 && v.x < 0.16 && v.z > en.z) en.set(v.x, v.y, v.z);
      }
      lm.gogus = en;
    }
    // geniş omuzlu bedenin hazır boxer'ı küçük altın dışında kalmasın
    if (c.siluet === 'b') lm.kasikY = Math.min(lm.kasikY, lm.uylukOrtaY + 0.03);
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
    beden.material = govdeMalzemesi(beden.material, lm, c.kiyafet, c.ten, c);
    if (gozler) gozler.material = gozMalzemesi(gozler.material, GOZ[c.goz] || null);
    const yasK = c.yas >= 45 ? Math.min(1, (c.yas - 42) / 22) : 0;
    const sacRenk = '#' + new T.Color(c.sacRenk).lerp(new T.Color('#c9c6c0'), yasK).getHexString();
    if (kaslar) {
      // kaş kaldırma yönü: bağlama uzayında yukarı, kaş mesh'inin yerel ölçeğinde ~7 mm
      const ters = kaslar.matrixWorld.clone().invert();
      const yon = new T.Vector3(0, 1, 0).transformDirection(ters).multiplyScalar(0.007 / kaslar.matrixWorld.getMaxScaleOnAxis());
      kaslar.material = sacMalzemesi(kaslar.material, sacRenk, 1, yon);
    }

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
    G.userData = { model: true, lm, mixer, eylem, aktif: eylem.Idle_Loop, kemik, h: (gozY - 0.21) / 1.45, anim: { ad: 'bekle', t: 0, sure: 0 },
      // mimik durumu: şu anki değerler ve hedefler yumuşak geçer
      yuz: { mimik: beden.material.userData.mimik, goz: gozler && gozler.material.userData.goz, kas: kaslar && kaslar.material.userData.kas,
        kirp: 0, kirpT: 1 + Math.random() * 3, gozKirp: [0, 0], gulus: 0.15, agiz: 0, buz: 0, kasD: 0, bakis: new T.Vector2(), bakisH: new T.Vector2(), bakisT: 1, zaman: Math.random() * 10, yaw: 0, pitch: 0 } };
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
  const X = new T.Vector3(1, 0, 0), Z = new T.Vector3(0, 0, 1), Y = new T.Vector3(0, 1, 0), Y_ = Y;

  function oynat(G, ad, sure) {
    const U = G.userData;
    const cesit = ad === 'ozel' ? ['gobek', 'yavas', 'sac'][Math.floor(Math.random() * 3)] : ad === 'dans' ? DANS[Math.floor(Math.random() * DANS.length)] : null;
    U.anim = { ad, t: 0, sure: sure || 0, cesit, kirpAn: Math.random() };
    const klip = ad === 'dans' && cesit !== 'klip' ? 'Idle_Loop' : KLIP[ad] || 'Idle_Loop';
    const hedef = U.eylem[klip] || U.eylem.Idle_Loop;
    if (hedef !== U.aktif) {
      hedef.reset().setEffectiveWeight(1).play();
      U.aktif.crossFadeTo(hedef, 0.4, false);
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
    // işlemsel katman yumuşak girer ve hareket bitmeden yumuşak çıkar
    const gir = Math.min(1, t / 0.3) * (U.anim.sure ? Math.max(0, Math.min(1, (U.anim.sure - t) / 0.35)) : 1);
    switch (U.anim.ad) {
      case 'dans': {
        const c = U.anim.cesit;
        if (c === 'dalga') {
          // vücut dalgası: kalçadan başa sırayla
          const v = t * 4.2;
          dondur(G, k.pelvis, X, Math.sin(v + 0.8) * 0.1 * gir); dondur(G, k.spine_01, X, Math.sin(v) * 0.14 * gir);
          dondur(G, k.spine_02, X, Math.sin(v - 0.8) * 0.14 * gir); dondur(G, k.spine_03, X, Math.sin(v - 1.6) * 0.11 * gir);
          dondur(G, k.Head, X, Math.sin(v - 2.4) * 0.12 * gir); dondur(G, k.pelvis, Z, Math.sin(v * 0.5) * 0.08 * gir);
          dondur(G, k.upperarm_l, Z, (1.0 + Math.sin(v - 1) * 0.25) * gir); dondur(G, k.lowerarm_l, Z, (0.9 + Math.sin(v - 1.6) * 0.4) * gir);
          dondur(G, k.upperarm_r, Z, -(1.0 + Math.sin(v - 1) * 0.25) * gir); dondur(G, k.lowerarm_r, Z, -(0.9 + Math.sin(v - 1.6) * 0.4) * gir);
          if (k.pelvis) k.pelvis.position.y += Math.sin(v * 2) * 0.012 * gir;
        } else if (c === 'kalca') {
          // kalça salınımı, eller başın üstünde
          const v = t * 3.4;
          dondur(G, k.pelvis, Z, Math.sin(v) * 0.2 * gir); dondur(G, k.pelvis, Y, Math.sin(v * 0.5) * 0.15 * gir);
          dondur(G, k.spine_01, Z, -Math.sin(v) * 0.1 * gir); dondur(G, k.spine_02, Z, -Math.sin(v) * 0.08 * gir);
          dondur(G, k.Head, Z, Math.sin(v - 0.6) * 0.08 * gir);
          dondur(G, k.upperarm_l, Z, 2.45 * gir); dondur(G, k.lowerarm_l, Z, (1.25 + Math.sin(v) * 0.15) * gir);
          dondur(G, k.upperarm_r, Z, -2.45 * gir); dondur(G, k.lowerarm_r, Z, -(1.25 - Math.sin(v) * 0.15) * gir);
          if (k.pelvis) k.pelvis.position.y += -Math.abs(Math.sin(v)) * 0.018 * gir;
        }
        break;
      }
      case 'selam':
        dondur(G, k.upperarm_r, Z, -2.3 * gir); dondur(G, k.lowerarm_r, Z, (-0.3 + Math.sin(t * 12) * 0.45) * gir); break;
      case 'poz':
        dondur(G, k.upperarm_r, X, -1.35 * gir); dondur(G, k.upperarm_r, Z, 0.35 * gir); dondur(G, k.lowerarm_r, X, -1.4 * gir);
        dondur(G, k.spine_03, Z, -0.1 * gir); dondur(G, k.Head, Z, 0.2 * gir); dondur(G, k.Head, Y, -0.15 * gir); break;
      case 'ozel': {
        const c = U.anim.cesit;
        if (c === 'gobek') {
          const v = t * 7;
          dondur(G, k.pelvis, Z, Math.sin(v) * 0.22 * gir); dondur(G, k.spine_02, Z, -Math.sin(v) * 0.18 * gir);
          dondur(G, k.upperarm_l, Z, 2.3 * gir); dondur(G, k.upperarm_r, Z, -2.3 * gir);
          dondur(G, k.lowerarm_l, Z, (0.5 + Math.sin(v * 0.5) * 0.3) * gir); dondur(G, k.lowerarm_r, Z, -(0.5 + Math.cos(v * 0.5) * 0.3) * gir);
          dondur(G, k.Head, Z, Math.sin(v) * 0.12 * gir);
        } else if (c === 'yavas') {
          const v = t * 2.6;
          dondur(G, k.pelvis, Y, Math.sin(v) * 0.4 * gir); dondur(G, k.pelvis, Z, Math.sin(v * 2) * 0.1 * gir);
          dondur(G, k.spine_02, Z, Math.sin(v + 1) * 0.14 * gir);
          dondur(G, k.upperarm_l, Z, 0.6 * gir); dondur(G, k.lowerarm_l, X, -1.3 * gir);
          dondur(G, k.upperarm_r, Z, -0.6 * gir); dondur(G, k.lowerarm_r, X, -1.3 * gir);
          dondur(G, k.Head, X, -0.12 * gir); dondur(G, k.Head, Z, Math.sin(v) * 0.15 * gir);
        } else {
          const v = t * 5;
          dondur(G, k.spine_02, X, Math.sin(v) * 0.22 * gir); dondur(G, k.Head, X, Math.sin(v) * 0.3 * gir); dondur(G, k.Head, Z, Math.cos(v) * 0.3 * gir);
          dondur(G, k.upperarm_l, Z, 2.6 * gir); dondur(G, k.lowerarm_l, Z, 1.3 * gir);
          dondur(G, k.upperarm_r, Z, -2.6 * gir); dondur(G, k.lowerarm_r, Z, -1.3 * gir);
        }
        break;
      }
      case 'opucuk': {
        const u = Math.min(1, t / Math.max(0.1, U.anim.sure || 1.2));
        const atis = Math.max(0, (u - 0.5) * 2);
        dondur(G, k.upperarm_r, X, -1.2 * gir); dondur(G, k.upperarm_r, Z, -0.9 * atis);
        dondur(G, k.lowerarm_r, X, -2.0 * (1 - atis) * gir - 0.4 * atis);
        dondur(G, k.Head, Z, 0.15 * gir); dondur(G, k.Head, X, 0.08 * gir);
        break;
      }
      case 'tesekkur':
        dondur(G, k.spine_01, X, 0.35 * z); dondur(G, k.spine_02, X, 0.35 * z); dondur(G, k.spine_03, X, 0.2 * z); dondur(G, k.Head, X, 0.25 * z); break;
      case 'ic':
        dondur(G, k.upperarm_r, X, -1.1 * gir); dondur(G, k.lowerarm_r, X, -1.6 * gir); dondur(G, k.Head, X, -0.35 * z); break;
      case 'sarki':
        dondur(G, k.upperarm_r, X, -1.0 * gir); dondur(G, k.lowerarm_r, X, -1.7 * gir); dondur(G, k.upperarm_l, Z, 0.9 * gir); dondur(G, k.Head, X, -0.2 + Math.sin(t * 2) * 0.08); dondur(G, k.spine_02, Y, Math.sin(t * 2) * 0.12); break;
      case 'sergile':
        dondur(G, k.upperarm_l, Z, 0.45 * gir); dondur(G, k.lowerarm_l, Y, -1.3 * gir); dondur(G, k.Head, Y, 0.25 * gir); break;
    }
    canlilik(G, dt);
  }

  /* ---------- canlılık: nefes, bakış, göz kırpma, mimik ---------- */
  // hareket başına yüz ifadesi: gülüş, göz kısma (taban), ağız, büzme, kaş
  const IFADE = {
    bekle: { g: 0.18, k: 0.05 }, konus: { g: 0.35, k: 0.08, konus: 1 }, sarki: { g: 0.3, k: 0.15, konus: 1 }, gul: { g: 0.85, k: 0.3, konus: 1, kas: 0.3 },
    dans: { g: 0.55, k: 0.18 }, ozel: { g: 0.22, k: 0.4, kas: 0.25, a: 0.12 }, opucuk: { g: 0.1, k: 0.25, buz: 1 }, poz: { g: 0.6, k: 0.12, goz: 1 },
    tesekkur: { g: 0.95, k: 0.3, kas: 0.4 }, selam: { g: 0.8, k: 0.1, kas: 0.6 }, sergile: { g: 0.5, k: 0.1 }, ic: { g: 0.1, k: 0.2, a: 0.25 },
    sok: { g: 0, k: -0.35, kas: 1, a: 0.5 }, panik: { g: 0, k: -0.3, kas: 1, a: 0.6 }, podyum: { g: 0.3, k: 0.2 }
  };
  const _v1 = new T.Vector3(), _v2 = new T.Vector3(), _q2 = new T.Quaternion();
  const yaklas = (a, b, h, dt) => a + (b - a) * Math.min(1, dt * h);
  function canlilik(G, dt) {
    const U = G.userData, Y = U.yuz, k = U.kemik, A = U.anim, t = A.t;
    if (!Y) return;
    Y.zaman += dt;
    const z = Y.zaman, f = IFADE[A.ad] || IFADE.bekle;
    const sakin = !['dans', 'ozel', 'panik', 'sok'].includes(A.ad);
    // nefes ve ağırlık aktarma (beklerken belirgin)
    const nefes = Math.sin(z * 1.75);
    dondur(G, k.spine_03, X, -nefes * 0.018); dondur(G, k.clavicle_l, Z, nefes * 0.02); dondur(G, k.clavicle_r, Z, -nefes * 0.02);
    if (sakin) {
      const kay = Math.sin(z * 0.42) * (A.ad === 'bekle' ? 1 : 0.4);
      dondur(G, k.pelvis, Z, kay * 0.05); dondur(G, k.spine_02, Z, -kay * 0.035); dondur(G, k.Head, Z, kay * 0.03 + Math.sin(z * 0.9) * 0.015);
    }
    // baş kameraya döner (dans ve panikte serbest)
    let yawH = 0, pitchH = 0;
    if (U.bakHedef && k.Head && sakin) {
      k.Head.getWorldPosition(_v1);
      _v2.copy(U.bakHedef).sub(_v1).applyQuaternion(G.getWorldQuaternion(_q2).invert());
      yawH = Math.max(-0.6, Math.min(0.6, Math.atan2(_v2.x, _v2.z)));
      pitchH = Math.max(-0.3, Math.min(0.3, -Math.atan2(_v2.y, Math.hypot(_v2.x, _v2.z))));
    }
    Y.yaw = yaklas(Y.yaw, yawH, 3, dt); Y.pitch = yaklas(Y.pitch, pitchH, 3, dt);
    dondur(G, k.neck_01, Y_, Y.yaw * 0.4); dondur(G, k.Head, Y_, Y.yaw * 0.6); dondur(G, k.Head, X, Y.pitch * 0.7);
    // göz kırpma: 2–6 sn'de bir, bazen çift
    Y.kirpT -= dt;
    if (Y.kirpT <= 0) { Y.kirp = 0.16; Y.kirpT = Math.random() < 0.2 ? 0.28 : 2 + Math.random() * 4; }
    const kirpAn = Y.kirp > 0 ? 1 - Math.abs(Y.kirp - 0.08) / 0.08 : 0;
    if (Y.kirp > 0) Y.kirp = Math.max(0, Y.kirp - dt);
    // poz: ortasında göz kırp (wink)
    const goz = f.goz && A.sure && t > A.sure * 0.35 && t < A.sure * 0.6 ? 1 : 0;
    const taban = f.k;
    Y.gozKirp[0] = yaklas(Y.gozKirp[0], Math.max(taban, kirpAn), kirpAn > 0 ? 40 : 8, dt);
    Y.gozKirp[1] = yaklas(Y.gozKirp[1], Math.max(taban, kirpAn, goz), kirpAn > 0 || goz ? 40 : 8, dt);
    // ağız: konuşurken açılıp kapanır
    const konus = f.konus ? 0.22 + 0.4 * Math.abs(Math.sin(z * 10.5) * Math.sin(z * 3.3 + 1)) : 0;
    const gulusH = f.g + (A.ad === 'bekle' ? Math.max(0, Math.sin(z * 0.23)) * 0.35 : 0);
    Y.gulus = yaklas(Y.gulus, gulusH, 4, dt);
    Y.agiz = yaklas(Y.agiz, Math.max(f.a || 0, konus), 18, dt);
    Y.buz = yaklas(Y.buz, f.buz && A.sure && t < A.sure * 0.6 ? 1 : 0, 10, dt);
    Y.kasD = yaklas(Y.kasD, f.kas || 0, 6, dt);
    // göz bakışı: küçük sıçramalar; özel dansta aşağı bakıp kameraya döner
    Y.bakisT -= dt;
    if (Y.bakisT <= 0) {
      Y.bakisT = 0.6 + Math.random() * 2;
      const r = Math.random();
      Y.bakisH.set(r < 0.55 ? 0 : (Math.random() - 0.5) * 0.06, r < 0.55 ? 0 : (Math.random() - 0.5) * 0.03);
      if (A.ad === 'ozel' && Math.random() < 0.5) Y.bakisH.set(0, -0.035);
    }
    Y.bakis.x = yaklas(Y.bakis.x, Y.bakisH.x, 25, dt); Y.bakis.y = yaklas(Y.bakis.y, Y.bakisH.y, 25, dt);
    // shader'a aktar
    const M = Y.mimik && Y.mimik.uKirp;
    if (M) {
      Y.mimik.uKirp.value.set(Y.gozKirp[0], Y.gozKirp[1]); Y.mimik.uGulus.value = Y.gulus; Y.mimik.uAgiz.value = Y.agiz; Y.mimik.uBuz.value = Y.buz;
    }
    if (Y.goz) Y.goz.uBakis.value.copy(Y.bakis);
    if (Y.kas) Y.kas.uKas.value = Y.kasD - Y.gozKirp[0] * 0.25;
  }

  window.Model = { yukle, kur, oynat, guncelle, hazir: () => !!V, KIYAFET, MAKYAJ, GOZ };
})();
