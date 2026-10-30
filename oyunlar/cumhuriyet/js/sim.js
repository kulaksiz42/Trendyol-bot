/* Cumhuriyet: Sıfırdan — şehir simülasyonu: yollar, imar, büyüme, hizmetler, altyapı, bütçe, halkın akışı. */
'use strict';
window.Sim = (function () {
  const V = window.VERI, D = window.Dunya, Z = D.Z, B = D.B;
  const YIL_SN = 600, GUN_SN = YIL_SN / 365, ESKI = 25000, KAYIT = 'cumhuriyet-kayit-v1';
  const AYAK = { okul: 1.4, lise: 1.7, saglik: 1.0, hastane: 1.8, park: 1.5, cami: 1.0, karakol: 0.9, su: 1.0, baraj: 3.0, dizel: 1.1, termik: 2.2, meclis2: 2.0, aoc: 4.0, genclik: 3.2, universite: 2.2, anitkabir: 3.8 };
  const KAPSAMA = ['okul', 'lise', 'saglik', 'hastane', 'park', 'cami', 'karakol'];
  let S = null; const dinle = [];
  const yay = e => dinle.forEach(f => f(e));
  const sinir = (v, a, b) => Math.max(a, Math.min(b, v));
  const ozet = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return ((h % 1000) + 1000) % 1000 / 1000; };

  /* ---------- tarih ---------- */
  function tarih(g = S.gun) { const d = new Date(V.GUN0 + Math.floor(g) * 86400000); return { yil: d.getUTCFullYear(), ay: d.getUTCMonth(), gun: d.getUTCDate(), metin: d.getUTCDate() + ' ' + V.AYLAR[d.getUTCMonth()] + ' ' + d.getUTCFullYear() }; }
  const yil = () => tarih().yil;
  const acikMi = def => !def.yil || yil() >= def.yil;

  /* ---------- hücre ızgarası ---------- */
  let izg = new Map();
  const ik = (x, z) => Math.floor(x / 2) + ',' + Math.floor(z / 2);
  function izgEkle(h) { const k = ik(h.x, h.z); let s = izg.get(k); if (!s) izg.set(k, s = new Set()); s.add(h.id); }
  function izgCikar(h) { const s = izg.get(ik(h.x, h.z)); if (s) s.delete(h.id); }
  function izgSorgu(x, z, r, f) {
    const x0 = Math.floor((x - r) / 2), x1 = Math.floor((x + r) / 2), z0 = Math.floor((z - r) / 2), z1 = Math.floor((z + r) / 2);
    for (let a = x0; a <= x1; a++) for (let b = z0; b <= z1; b++) { const s = izg.get(a + ',' + b); if (!s) continue; for (const id of s) { const h = S.hucre[id]; if (h && Math.hypot(h.x - x, h.z - z) <= r) f(h); } }
  }

  /* ---------- yollar ---------- */
  function izdus(p, x, z) {
    const a = S.dugum[p.a], b = S.dugum[p.b], dx = b.x - a.x, dz = b.z - a.z, L2 = dx * dx + dz * dz || 1e-6;
    const t = sinir(((x - a.x) * dx + (z - a.z) * dz) / L2, 0, 1), px = a.x + dx * t, pz = a.z + dz * t;
    return { d: Math.hypot(x - px, z - pz), t: t * Math.sqrt(L2), px, pz, yan: Math.sign(dx * (z - a.z) - dz * (x - a.x)) || 1 };
  }
  function enYakinParca(x, z, max, haric) {
    let en = null;
    for (const p of Object.values(S.parca)) { if (haric && haric(p)) continue; const q = izdus(p, x, z); if (q.d < max && (!en || q.d < en.d)) en = Object.assign(q, { p }); }
    return en;
  }
  function yakala(x, z) {
    let en = null, ed = 2.2;
    for (const n of Object.values(S.dugum)) { const d = Math.hypot(n.x - x, n.z - z); if (d < ed) { ed = d; en = n; } }
    if (en) return { x: en.x, z: en.z, dugum: en.id };
    const s = enYakinParca(x, z, 1.4);
    if (s) return { x: s.px, z: s.pz, parca: s.p.id };
    return { x, z };
  }
  const dugumYeni = (x, z) => { const id = 'n' + (S.sira++); return S.dugum[id] = { id, x, z }; };
  function parcaYeni(a, b, tur) { const id = 'p' + (S.sira++), A = S.dugum[a], Bn = S.dugum[b]; return S.parca[id] = { id, a, b, tur, uz: Math.hypot(Bn.x - A.x, Bn.z - A.z) }; }
  function parcaCiz(p) { p.kopru = D.yolCiz(p, S.dugum[p.a], S.dugum[p.b]); }
  function parcaBol(p, x, z) {
    const n = dugumYeni(x, z), a = S.dugum[p.a], t0 = Math.hypot(x - a.x, z - a.z);
    const p1 = parcaYeni(p.a, n.id, p.tur), p2 = parcaYeni(n.id, p.b, p.tur);
    for (const h of Object.values(S.hucre)) if (h.p === p.id) { if (h.t < t0) h.p = p1.id; else { h.p = p2.id; h.t -= t0; } }
    delete S.parca[p.id]; D.yolSil(p.id); parcaCiz(p1); parcaCiz(p2);
    return n;
  }
  function noktaDugum(q) {
    const t = yakala(q.x, q.z);
    if (t.dugum) return S.dugum[t.dugum];
    if (t.parca) return parcaBol(S.parca[t.parca], t.x, t.z);
    return dugumYeni(q.x, q.z);
  }
  function yolDene(a, b, tur) {
    const T = V.YOL[tur], L = Math.hypot(b.x - a.x, b.z - a.z), r = { gecerli: false, maliyet: 0, uz: L };
    if (!acikMi(T)) return Object.assign(r, { neden: T.ad + ' ' + T.yil + '\'de açılır' });
    if (L < 2) return Object.assign(r, { neden: 'Çok kısa' });
    let kopru = 0, dik = 0;
    const n = Math.ceil(L);
    for (let i = 0; i <= n; i++) {
      const x = a.x + (b.x - a.x) * i / n, z = a.z + (b.z - a.z) * i / n;
      if (Math.abs(x) > B / 2 - 3 || Math.abs(z) > B / 2 - 3) return Object.assign(r, { neden: 'Harita dışı' });
      for (const k of Object.values(V.BASLANGIC)) if (Math.hypot(x - k.x, z - k.z) < (k === V.BASLANGIC.kale ? 9 : 2.6)) return Object.assign(r, { neden: k.ad + ' yolu kesiyor' });
      for (const bn of Object.values(S.bina)) if (bn.tip === 'H' && Math.hypot(x - bn.x, z - bn.z) < AYAK[bn.hiz] * 0.9) return Object.assign(r, { neden: 'Yapının üstünden geçemez' });
      if (D.dereMi(x, z)) kopru++;
      dik = Math.max(dik, D.egim(x, z));
    }
    if (dik > 0.8) return Object.assign(r, { neden: 'Yamaç çok dik' });
    const ayni = a.dugum && b.dugum && Object.values(S.parca).some(p => (p.a === a.dugum && p.b === b.dugum) || (p.a === b.dugum && p.b === a.dugum));
    if (ayni) return Object.assign(r, { neden: 'Burada zaten yol var' });
    r.maliyet = L * T.maliyet * (1 + dik) + kopru * T.maliyet * 6; r.kopru = kopru;
    if (r.maliyet > S.para) return Object.assign(r, { neden: 'Para yetmiyor' });
    r.gecerli = true; return r;
  }
  function kesisim(ax, az, bx, bz, cx, cz, dx, dz) {
    const r1x = bx - ax, r1z = bz - az, r2x = dx - cx, r2z = dz - cz, den = r1x * r2z - r1z * r2x;
    if (Math.abs(den) < 1e-9) return null;
    const u = ((cx - ax) * r2z - (cz - az) * r2x) / den, v = ((cx - ax) * r1z - (cz - az) * r1x) / den;
    return u > 0 && u < 1 && v > 0 && v < 1 ? { u, v, x: ax + r1x * u, z: az + r1z * u } : null;
  }
  function yolYap(a, b, tur, zorla) {
    if (!zorla) { const d = yolDene(a, b, tur); if (!d.gecerli) return d; S.para -= d.maliyet; }
    const A = noktaDugum(a), Bn = noktaDugum(b), ara = [];
    for (const p of Object.values(S.parca)) {
      if ([p.a, p.b].some(k => k === A.id || k === Bn.id)) continue;
      const pa = S.dugum[p.a], pb = S.dugum[p.b], k = kesisim(A.x, A.z, Bn.x, Bn.z, pa.x, pa.z, pb.x, pb.z);
      if (!k) continue;
      const L = Math.hypot(Bn.x - A.x, Bn.z - A.z);
      if (k.u * L < 1 || (1 - k.u) * L < 1) continue;
      let n;
      if (k.v * p.uz < 1) n = pa; else if ((1 - k.v) * p.uz < 1) n = pb; else n = null;
      ara.push({ u: k.u, p, n, x: k.x, z: k.z });
    }
    ara.sort((x, y) => x.u - y.u);
    const zincir = [A];
    for (const k of ara) { const n = k.n || (S.parca[k.p.id] ? parcaBol(k.p, k.x, k.z) : dugumYeni(k.x, k.z)); if (n !== zincir[zincir.length - 1]) zincir.push(n); }
    zincir.push(Bn);
    const yeni = [];
    for (let i = 0; i < zincir.length - 1; i++) {
      if (zincir[i] === zincir[i + 1]) continue;
      const p = parcaYeni(zincir[i].id, zincir[i + 1].id, tur); if (p.uz < 0.3) { delete S.parca[p.id]; continue; }
      parcaCiz(p); yeni.push(p);
    }
    yeni.forEach(p => yolAltiTemizle(p));
    yeni.forEach(p => hucreUret(p));
    grafKur(); yay({ tur: 'yol' });
    return { gecerli: true, son: Bn };
  }
  // yeni yolun altında kalan parselleri kaldır
  function yolAltiTemizle(p) {
    const w = V.YOL[p.tur].genislik / 2 + Z * 0.5, a = S.dugum[p.a], b = S.dugum[p.b];
    const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
    izgSorgu(mx, mz, p.uz / 2 + w + 2, h => { if (izdus(p, h.x, h.z).d < w) hucreSil(h); });
  }
  function hucreUygun(x, z) {
    if (Math.abs(x) > B / 2 - 3 || Math.abs(z) > B / 2 - 3) return false;
    if (D.dereMi(x, z) || D.egim(x, z) > 0.34 || D.doluMu(x, z)) return false;
    let dolu = false; izgSorgu(x, z, 1.25, () => { dolu = true; }); if (dolu) return false;
    for (const p of Object.values(S.parca)) if (izdus(p, x, z).d < V.YOL[p.tur].genislik / 2 + Z * 0.45) return false;
    for (const bn of Object.values(S.bina)) if (bn.tip === 'H' && Math.hypot(bn.x - x, bn.z - z) < AYAK[bn.hiz] + 0.8) return false;
    return true;
  }
  function hucreUret(p) {
    const T = V.YOL[p.tur]; if (T.yanBos) return;
    const a = S.dugum[p.a], b = S.dugum[p.b], dx = b.x - a.x, dz = b.z - a.z, L = p.uz, ux = dx / L, uz = dz / L, nx = -uz, nz = ux, w = T.genislik / 2;
    const n = Math.floor((L - 0.6) / Z); if (n < 1) return;
    const bas = (L - n * Z) / 2 + Z / 2;
    for (const yan of [1, -1]) for (let i = 0; i < n; i++) for (let d = 0; d < 3; d++) {
      const t = bas + i * Z, off = w + 0.25 + Z / 2 + d * Z, x = a.x + ux * t + nx * off * yan, z = a.z + uz * t + nz * off * yan;
      if (!hucreUygun(x, z)) break;
      const id = 'h' + (S.sira++);
      const h = S.hucre[id] = { id, x, z, y: D.yukseklik(x, z), rot: Math.atan2(-yan * nx, -yan * nz), p: p.id, t, d, imar: null, bina: null };
      izgEkle(h);
    }
  }
  function hucreSil(h) { if (h.bina && S.bina[h.bina]) binaSil(S.bina[h.bina]); izgCikar(h); delete S.hucre[h.id]; }

  /* ---------- imar ---------- */
  const tipGrup = t => t === 'Rk' ? 'R' : t;
  function imarBoya(x, z, r, tur) {
    if (tur && V.IMAR[tur].yil && yil() < V.IMAR[tur].yil) return 0;
    let n = 0;
    izgSorgu(x, z, r, h => {
      if (h.imar === tur) return;
      if (h.bina) { const b = S.bina[h.bina]; if (b && (!tur || tipGrup(b.tip) !== tipGrup(tur))) binaSil(b); }
      h.imar = tur; n++;
    });
    if (n) yay({ tur: 'imar' });
    return n;
  }

  /* ---------- binalar ---------- */
  const modelAd = (tip, sev) => tip === 'Rk' ? 'Rk' + Math.max(3, sev) : tip + sev;
  const KAP = (tip, sev) => V.KAPASITE[tip][tip === 'Rk' ? Math.max(3, sev) : sev];
  function semtBul(x, z) { let en = V.SEMT[0], ed = 1e9; for (const s of V.SEMT) { const d = Math.hypot(s.x - x, s.z - z); if (d < ed) { ed = d; en = s; } } return en.ad; }
  let insa = [];
  function binaKur(h, tip) {
    const id = 'b' + (S.sira++), sev = tip === 'Rk' ? 3 : 1;
    const b = S.bina[id] = { id, h: h.id, tip, seviye: sev, model: modelAd(tip, sev), kur: 0, x: h.x, y: h.y - 0.05, z: h.z, rot: h.rot, olcek: 1.3 + ozet(id) * 0.15, semt: semtBul(h.x, h.z), sakin: 0, is: 0, sure: 18 + sev * 10 };
    b.iskeleH = D.modelYuk(b.model) * b.olcek; b.iskeleG = b.olcek;
    h.bina = id; insa.push(id); D.binaGoster(b);
    return b;
  }
  function binaSil(b) {
    D.binaGizle(b); delete S.bina[b.id];
    if (b.h && S.hucre[b.h]) S.hucre[b.h].bina = null;
    insa = insa.filter(i => i !== b.id);
    if (b.tip === 'H') grafKur();
  }
  function seviyeAtla(b, yeni) {
    b.seviye = yeni; b.model = modelAd(b.tip, yeni); b.kur = 0; b.sure = 20 + yeni * 12;
    b.iskeleH = D.modelYuk(b.model) * b.olcek; insa.push(b.id); D.binaGoster(b);
  }
  function insaat(dg) {
    if (!insa.length) return;
    const kalan = [];
    for (const id of insa) {
      const b = S.bina[id]; if (!b) continue;
      b.kur = Math.min(1, b.kur + dg / b.sure);
      if (b.kur >= 1) { D.binaGoster(b); binaBitti(b); } else { D.binaMatris(b); kalan.push(id); }
    }
    insa = kalan;
  }
  function binaBitti(b) {
    if (b.tip === 'R' || b.tip === 'Rk') b.sakin = KAP(b.tip, b.seviye);
    else if (b.tip === 'C' || b.tip === 'I') b.is = KAP(b.tip, b.seviye);
    else { grafKur(); const def = V.HIZMET[b.hiz] || V.OZEL[b.hiz]; akis({ tur: 'mutlu', semt: b.semt, metin: def.ad + ' hizmete girdi. ' + (V.OZEL[b.hiz] ? 'Bütün şehir bayram ediyor.' : 'Mahalle sevindi.') }); }
    if (b.seviye === 2 && b.tip === 'R' && Math.random() < 0.1) akis({ tur: 'mutlu', semt: b.semt, metin: 'Kerpiç evden kâgir eve taşındık. Musluktan su akıyor, ampul yanıyor!' });
    katmanUygula(b);
  }

  /* ---------- hizmet ve özel yapılar ---------- */
  function yapiTanim(tip) { return V.HIZMET[tip] || V.OZEL[tip]; }
  function yapiDene(tip, x, z) {
    const def = yapiTanim(tip), r = AYAK[tip], o = { gecerli: false, maliyet: def.maliyet, x, z, rot: 0, r };
    if (!acikMi(def)) return Object.assign(o, { neden: def.yil + '\'de açılır' });
    if (V.OZEL[tip] && Object.values(S.bina).some(b => b.hiz === tip)) return Object.assign(o, { neden: 'Bu yapı zaten var' });
    const q = enYakinParca(x, z, r + 4);
    if (!q) return Object.assign(o, { neden: 'Bir yolun yanına koy' });
    const a = S.dugum[q.p.a], b = S.dugum[q.p.b], ux = (b.x - a.x) / q.p.uz, uz = (b.z - a.z) / q.p.uz, nx = -uz * q.yan, nz = ux * q.yan, off = V.YOL[q.p.tur].genislik / 2 + r + 0.3;
    o.x = q.px + nx * off; o.z = q.pz + nz * off; o.rot = Math.atan2(-nx, -nz);
    if (Math.abs(o.x) > B / 2 - r - 2 || Math.abs(o.z) > B / 2 - r - 2) return Object.assign(o, { neden: 'Harita dışı' });
    for (const p of Object.values(S.parca)) if (p !== q.p && izdus(p, o.x, o.z).d < V.YOL[p.tur].genislik / 2 + r * 0.85) return Object.assign(o, { neden: 'Başka bir yolun üstüne geliyor' });
    for (const k of Object.values(V.BASLANGIC)) if (Math.hypot(o.x - k.x, o.z - k.z) < r + (k === V.BASLANGIC.kale ? 9 : 2.5)) return Object.assign(o, { neden: k.ad + ' burada' });
    for (const bn of Object.values(S.bina)) if (bn.tip === 'H' && Math.hypot(bn.x - o.x, bn.z - o.z) < r + AYAK[bn.hiz]) return Object.assign(o, { neden: 'Başka bir yapıya çok yakın' });
    if (tip === 'baraj') { if (!D.dereMi(o.x, o.z, 3)) return Object.assign(o, { neden: 'Baraj bir derenin üstüne kurulur' }); }
    else if (D.dereMi(o.x, o.z)) return Object.assign(o, { neden: 'Dere yatağına yapılmaz' });
    if (D.egim(o.x, o.z) > 0.45) return Object.assign(o, { neden: 'Arazi çok eğimli' });
    o.kredi = def.maliyet > S.para;
    if (o.kredi && !V.OZEL[tip] && !['baraj', 'termik'].includes(tip)) return Object.assign(o, { neden: 'Para yetmiyor' });
    o.gecerli = true; return o;
  }
  function yapiYap(tip, x, z) {
    const o = yapiDene(tip, x, z); if (!o.gecerli) return o;
    const def = yapiTanim(tip);
    if (o.kredi) { S.borc.push({ ad: def.ad, taksit: def.maliyet * 1.3 / 120, kalan: 120 }); akis({ tur: 'haber', metin: def.ad + ' için 10 yıl vadeli kredi alındı.' }); }
    else S.para -= def.maliyet;
    izgSorgu(o.x, o.z, o.r + 0.6, h => hucreSil(h));
    const id = 'b' + (S.sira++), olc = 1.0;
    const b = S.bina[id] = { id, tip: 'H', hiz: tip, seviye: 1, model: tip, kur: 0, x: o.x, y: D.yukseklik(o.x, o.z) - 0.05, z: o.z, rot: o.rot, olcek: olc, semt: semtBul(o.x, o.z), sure: V.OZEL[tip] ? 120 : 40, maliyet: def.maliyet, kredili: !!o.kredi };
    b.iskeleH = D.modelYuk(tip); b.iskeleG = o.r * 1.5;
    insa.push(id); D.binaGoster(b); grafKur(); yay({ tur: 'yapi', b });
    return Object.assign(o, { b });
  }

  /* ---------- seçme ve yıkma ---------- */
  function sec(x, z) {
    let en = null, ed = 1e9;
    for (const b of Object.values(S.bina)) { const r = b.tip === 'H' ? AYAK[b.hiz] : 0.9, d = Math.hypot(b.x - x, b.z - z); if (d < r && d < ed) { ed = d; en = b; } }
    if (en) return { tur: 'bina', b: en };
    const q = enYakinParca(x, z, 1.2);
    if (q && q.d < V.YOL[q.p.tur].genislik / 2 + 0.6) return { tur: 'yol', p: q.p };
    return null;
  }
  function yikIade(sel) {
    if (sel.tur === 'yol') return V.YOL[sel.p.tur].maliyet * sel.p.uz * 0.5;
    if (sel.b.tip === 'H') return sel.b.kredili ? 0 : (sel.b.maliyet || 0) * 0.5;
    return 0;
  }
  function yik(sel) {
    const iade = yikIade(sel); S.para += iade;
    if (sel.tur === 'bina') { const b = sel.b; if (b.h && S.hucre[b.h]) S.hucre[b.h].imar = null; binaSil(b); }
    else {
      const p = sel.p; for (const h of Object.values(S.hucre)) if (h.p === p.id) hucreSil(h);
      delete S.parca[p.id]; D.yolSil(p.id);
      for (const n of [p.a, p.b]) if (!Object.values(S.parca).some(q => q.a === n || q.b === n)) delete S.dugum[n];
      grafKur();
    }
    yay({ tur: 'yik' }); return iade;
  }

  /* ---------- yol ağı: bileşenler ve kapsama (yol üzerinden mesafe) ---------- */
  let komsu = {}, komp = {};
  function grafKur() {
    komsu = {}; komp = {};
    const ata = {}, bul = k => { while (ata[k] !== k) { ata[k] = ata[ata[k]]; k = ata[k]; } return k; };
    for (const n in S.dugum) { komsu[n] = []; ata[n] = n; }
    for (const p of Object.values(S.parca)) { komsu[p.a].push([p.b, p.uz]); komsu[p.b].push([p.a, p.uz]); ata[bul(p.a)] = bul(p.b); }
    for (const n in S.dugum) komp[n] = bul(n);
    // hizmetleri en yakın yola bağla
    for (const b of Object.values(S.bina)) if (b.tip === 'H') { const q = enYakinParca(b.x, b.z, AYAK[b.hiz] + 4.5); b.bag = q ? { p: q.p.id, t: q.t } : null; }
    // her hizmet türü için çok kaynaklı Dijkstra
    const hs = Object.values(S.hucre);
    hs.forEach(h => { h.k = {}; });
    for (const tur of KAPSAMA) {
      const kay = Object.values(S.bina).filter(b => b.hiz === tur && b.kur >= 1 && b.bag);
      if (!kay.length) continue;
      const men = V.HIZMET[tur].menzil, dist = {}, yigin = [];
      const it = (n, d) => { if (d < (dist[n] ?? 1e9) && d <= men) { dist[n] = d; yigin.push([d, n]); } };
      const ayniParca = {};
      kay.forEach(b => { const p = S.parca[b.bag.p]; it(p.a, b.bag.t); it(p.b, p.uz - b.bag.t); (ayniParca[p.id] = ayniParca[p.id] || []).push(b.bag.t); });
      while (yigin.length) {
        let mi = 0; for (let i = 1; i < yigin.length; i++) if (yigin[i][0] < yigin[mi][0]) mi = i;
        const [d, n] = yigin[mi]; yigin[mi] = yigin[yigin.length - 1]; yigin.pop();
        if (d > dist[n]) continue;
        for (const [m, w] of komsu[n]) it(m, d + w);
      }
      for (const h of hs) {
        const p = S.parca[h.p]; if (!p) continue;
        let d = Math.min((dist[p.a] ?? 1e9) + h.t, (dist[p.b] ?? 1e9) + p.uz - h.t);
        if (ayniParca[p.id]) for (const t of ayniParca[p.id]) d = Math.min(d, Math.abs(t - h.t));
        if (d + h.d * Z <= men) h.k[tur] = true;
      }
    }
    altyapi();
  }
  // su ve elektrik: her bağlı yol ağının kendi kapasitesi
  function altyapi() {
    const arz = {}, ist = {}, kk = b => { const h = S.hucre[b.h]; const p = h && S.parca[h.p]; return p ? komp[p.a] : null; };
    for (const b of Object.values(S.bina)) {
      if (b.tip === 'H') { if (b.kur < 1 || !b.bag) continue; const def = V.HIZMET[b.hiz]; if (!def) continue; const k = komp[S.parca[b.bag.p].a], a = arz[k] = arz[k] || { su: 0, elk: 0 }; a.su += def.su || 0; a.elk += def.elektrik || 0; continue; }
      const k = kk(b); b._k = k; if (!k) continue; const i = ist[k] = ist[k] || { su: 0, elk: 0 };
      const yuk = b.sakin || b.is * 0.6 || (b.kur < 1 ? 0 : 0); i.su += yuk; i.elk += yuk;
    }
    let susuz = 0, karanlik = 0;
    for (const b of Object.values(S.bina)) {
      if (b.tip === 'H') continue;
      const a = arz[b._k] || { su: 0, elk: 0 }, i = ist[b._k] || { su: 1, elk: 1 };
      const os = i.su ? a.su / i.su : 1, oe = i.elk ? a.elk / i.elk : 1, r = ozet(b.id);
      b.su = a.su > 0 && r < os; b.elk = a.elk > 0 && r < oe;
      const n = b.sakin || b.is; if (!b.su) susuz += n; if (!b.elk) karanlik += n;
    }
    S._altyapi = { arz, ist, susuz, karanlik };
  }

  /* ---------- talep ---------- */
  function cekim(y) { return y < 1950 ? 900 : y < 1970 ? 3500 : y < 1985 ? 9000 : y < 2003 ? 16000 : 25000; }
  function talep() {
    let pR = 0, jC = 0, jI = 0, pY = 0;
    for (const b of Object.values(S.bina)) {
      if (b.terk) continue;
      if (b.tip === 'R' || b.tip === 'Rk') { pR += KAP(b.tip, b.seviye); pY += b.sakin; }
      else if (b.tip === 'C') jC += KAP('C', b.seviye); else if (b.tip === 'I') jI += KAP('I', b.seviye);
    }
    const caz = (S.memnun - 50) / 50, isler = jC + jI, ver = k => (S.vergi[k] - 9) * 0.06;
    const R = sinir((isler / 0.42 * 0.95 + cekim(yil()) * (1 + caz * 0.8) + S.gocBonus - pR) / 1500 + caz * 0.15 - ver('R'), -1, 1);
    const C = sinir(((pR + ESKI * 0.08) * 0.1 - jC) / 120 - ver('C'), -1, 1);
    const I = sinir((pR * 0.42 - isler) / 150 + 0.12 - ver('I'), -1, 1);
    return { R, C, I, pR, jC, jI, pY };
  }
  // boş imarlı hücre seç (yola ön cephe önce)
  function bosHucre(tip) {
    const aday = [];
    for (const h of Object.values(S.hucre)) if (h.imar === tip && !h.bina) aday.push(h);
    if (!aday.length) return null;
    aday.sort((a, b) => a.d - b.d);
    const ust = aday.filter(h => h.d === aday[0].d);
    return ust[Math.floor(Math.random() * ust.length)];
  }

  /* ---------- seviye ---------- */
  function egitimOrani() { let a = 0, t = 0; for (const b of Object.values(S.bina)) if (b.sakin) { t += b.sakin; const h = S.hucre[b.h]; if (h && h.k && h.k.lise) a += b.sakin; } return t ? a / t : 0; }
  function hedefSeviye(b) {
    const h = S.hucre[b.h], k = (h && h.k) || {}, tavan = V.DONEM_SEVIYE(yil()), eg = S._egitim || 0;
    let s = 1;
    if (b.tip === 'R' || b.tip === 'Rk') {
      if (b.su && b.elk) s = 2;
      if (s === 2 && k.okul && k.saglik) s = 3;
      if (s === 3 && k.lise && k.karakol && (k.park || k.cami)) s = 4;
      if (s === 4 && k.hastane && (b.hava || 0) < 1.5) s = 5;
      if (s === 5 && k.park && S.memnun > 70) s = 6;
    } else if (b.tip === 'C') {
      if (b.su && b.elk) s = 2;
      if (s === 2 && k.karakol && eg > 0.15) s = 3;
      if (s === 3 && eg > 0.3) s = 4;
      if (s === 4 && eg > 0.45) s = 5;
      if (s === 5 && eg > 0.6) s = 6;
    } else if (b.tip === 'I') {
      if (b.elk) s = 2;
      if (s === 2 && b.su && eg > 0.1) s = 3;
      if (s === 3 && eg > 0.25) s = 4;
      if (s === 4 && eg > 0.4) s = 5;
      if (s === 5 && eg > 0.55) s = 6;
    }
    return Math.min(s, tavan);
  }

  /* ---------- hava ve sıtma ---------- */
  function cevre() {
    const kay = [];
    for (const b of Object.values(S.bina)) {
      if (b.kur < 1) continue;
      if (b.tip === 'H') { const def = V.HIZMET[b.hiz]; if (def && def.kirlilik) kay.push([b.x, b.z, def.kirlilik]); }
      else if (b.tip === 'I') kay.push([b.x, b.z, 0.35 * b.seviye]);
      else if ((b.tip === 'R' || b.tip === 'Rk') && b.seviye >= 3 && yil() >= 1955 && yil() < 1995) kay.push([b.x, b.z, 0.05 * b.seviye]); // kömür sobaları
    }
    const sitmaDevri = yil() < 1950;
    for (const b of Object.values(S.bina)) {
      if (b.tip !== 'R' && b.tip !== 'Rk') continue;
      let v = 0; for (const [x, z, k] of kay) { const d = Math.abs(x - b.x) + Math.abs(z - b.z); if (d < 120) v += k * Math.exp(-d / 25); }
      b.hava = v;
      const h = S.hucre[b.h];
      b.sitma = sitmaDevri && D.dereMi(b.x, b.z, 2) && !(h && h.k && h.k.saglik);
    }
  }

  /* ---------- bütçe ---------- */
  function butce() {
    const t = S._talep || talep(), y = yil();
    let sakin = 0, isC = 0, isI = 0, bakim = 0;
    for (const b of Object.values(S.bina)) {
      if (b.terk) continue;
      sakin += b.sakin || 0; if (b.tip === 'C') isC += b.is; if (b.tip === 'I') isI += b.is;
      if (b.tip === 'H') bakim += (yapiTanim(b.hiz).bakim || 0.1);
    }
    const isGucu = sakin * 0.42 + 600, dolu = Math.min(1, isGucu / Math.max(1, isC + isI));
    let carp = 1; S.etki.forEach(e => { carp *= 1 + e.gelir; });
    const g = {
      R: sakin * S.vergi.R / 100 * 0.003 * carp,
      C: isC * dolu * S.vergi.C / 100 * 0.005 * carp,
      I: isI * dolu * S.vergi.I / 100 * 0.004 * carp,
      eski: ESKI * 0.00002 * carp,
      odenek: y < 1950 ? 0.6 : 0.3
    };
    let yolB = 0; for (const p of Object.values(S.parca)) yolB += V.YOL[p.tur].bakim * p.uz;
    const gd = { hizmet: bakim, yol: yolB, kredi: S.borc.reduce((a, k) => a + k.taksit, 0) };
    const gelir = Object.values(g).reduce((a, v) => a + v, 0), gider = Object.values(gd).reduce((a, v) => a + v, 0);
    return { gelir: g, gider: gd, toplamGelir: gelir, toplamGider: gider, net: gelir - gider, sakin, isC, isI };
  }

  /* ---------- halkın akışı ---------- */
  const ISIM0 = ['Kunduracı Hasan Efendi', 'Bakkal Rıza Efendi', 'Hacı Mehmet Ağa', 'Ayşe Hanım', 'Muallim Fikri Bey', 'Arabacı Osman', 'Fatma Hanım', 'Memur Necati Bey', 'Terzi Mustafa Usta', 'Emine Kadın', 'Sakacı Halil', 'Hafız Kâmil Efendi'];
  const AD = ['Hasan', 'Rıza', 'Ayşe', 'Fikri', 'Osman', 'Fatma', 'Necati', 'Mustafa', 'Emine', 'Zehra', 'Kemal', 'Halil', 'Nermin', 'Sabri', 'Gülsüm', 'Turgut'];
  const SOYAD = ['Yılmaz', 'Demir', 'Kaya', 'Arslan', 'Çelik', 'Şahin', 'Aydın', 'Öztürk', 'Kılıç', 'Koç', 'Doğan', 'Yıldız', 'Aksoy', 'Erdem'];
  const sec1 = a => a[Math.floor(Math.random() * a.length)];
  function kisi() { return yil() < 1935 ? sec1(ISIM0) : sec1(AD) + ' ' + sec1(SOYAD); } // 1934 Soyadı Kanunu
  function kaynak(y = yil()) {
    if (y < 1934) return { ad: 'Hâkimiyet-i Milliye', tur: 'gazete' };
    if (y < 1960) return { ad: 'Ulus', tur: 'gazete' };
    if (y < 1990) return { ad: 'Akşam gazetesi', tur: 'gazete' };
    if (y < 2008) return { ad: 'Yerel televizyon', tur: 'tv' };
    return { ad: 'Sosyal medya', tur: 'sosyal' };
  }
  function akis(m) {
    const t = tarih();
    m = Object.assign({ kim: m.tur === 'haber' ? null : kisi(), t: t.metin, yil: t.yil, kaynak: kaynak(t.yil).ad }, m);
    if (m.tur !== 'haber' && S.akis.slice(0, 8).some(x => x.metin === m.metin)) return;
    S.akis.unshift(m); if (S.akis.length > 60) S.akis.length = 60;
    yay({ tur: 'akis', m });
  }
  const SIKAYET = {
    su: ['Çeşmede kuyruk sabahın beşinde başlıyor. Su deposu ne zaman?', 'Mahallede su yok; sakalar fiyatı ikiye katladı.', 'Bu sıcakta testiyi doldurmak için yarım saat yürüyoruz.'],
    elk: ['Akşam olunca sokaklar zifiri karanlık. Elektrik istiyoruz.', 'Gaz lambasıyla çocuklar ders çalışamıyor.', 'Elektrik yine kesildi, dükkânı erken kapattım.'],
    is: ['Ankara\'ya iş için geldim, iş yok. Fabrika lazım.', 'Ustalar boşta geziyor; atölye açılmazsa köye döneceğiz.'],
    ev: ['Kiralık oda bulunmuyor; memurlar hanlarda kalıyor.', 'Bir odada üç aile oturuyoruz. Ev yapılacak yer lazım.'],
    okul: ['Çocuklar okula gitmek için bir saat yürüyor.', 'Mahallemizde okul yok; kızlar okuyamıyor.'],
    sitma: ['Dere kenarında sıtma var; sağlık ocağı lazım.', 'Sivrisinekten uyuyamıyoruz, iki çocuk hasta.'],
    toz: ['Toprak yollar yazın toz, kışın çamur.', 'Çamurdan araba geçmiyor; parke taş döşensin.'],
    hava: ['Kömür dumanından nefes alamıyoruz.', 'Kışın gökyüzü kapkara; çocuklar öksürüyor.'],
    vergi: ['Bu vergilerle dükkân kapatırız.', 'Belediye vergileri yine artırdı, geçinemiyoruz.']
  };
  const MUHTAR_IHTIYAC = { okul: 'okul', saglik: 'sağlık ocağı', cami: 'cami', park: 'park', karakol: 'karakol' };
  function aylikAkis(t) {
    const al = S._altyapi || {}, adaylar = [];
    if (al.susuz > 200) adaylar.push(['su', 3]);
    if (al.karanlik > 200) adaylar.push(['elk', 2]);
    if (t.R > 0.4 && !Object.values(S.hucre).some(h => (h.imar === 'R' || h.imar === 'Rk') && !h.bina)) adaylar.push(['ev', 3]);
    if (t.I > 0.5 && t.pY > 500) adaylar.push(['is', 2]);
    const rb = Object.values(S.bina).filter(b => b.sakin);
    if (rb.length > 20 && rb.filter(b => !(S.hucre[b.h] && S.hucre[b.h].k.okul)).length > rb.length * 0.5) adaylar.push(['okul', 2]);
    if (rb.some(b => b.sitma)) adaylar.push(['sitma', 2]);
    if (rb.some(b => (b.hava || 0) > 2)) adaylar.push(['hava', 2]);
    const ay = tarih().ay, toprak = Object.values(S.parca).filter(p => p.tur === 'toprak').length;
    if (yil() >= 1928 && toprak > 8 && (ay <= 2 || ay >= 10 || (ay >= 6 && ay <= 7))) adaylar.push(['toz', 1]);
    if (S.vergi.R > 12 || S.vergi.C > 12) adaylar.push(['vergi', 2]);
    adaylar.sort((a, b) => b[1] - a[1] + Math.random() - 0.5);
    const semtler = rb.length ? rb : [{ semt: 'Ulus' }];
    adaylar.slice(0, 2).forEach(([k]) => akis({ tur: 'sikayet', konu: k, semt: sec1(semtler).semt, metin: sec1(SIKAYET[k]) }));
    // muhtar istekleri
    if (rb.length > 12 && Math.random() < 0.45) {
      const say = {};
      rb.forEach(b => { const h = S.hucre[b.h]; for (const k in MUHTAR_IHTIYAC) if (!(h && h.k[k])) { const a = b.semt + '|' + k; say[a] = (say[a] || 0) + b.sakin; } });
      const en = Object.entries(say).sort((a, b) => b[1] - a[1])[0];
      if (en && en[1] > 60) { const [semt, k] = en[0].split('|'); akis({ tur: 'muhtar', kim: semt + ' muhtarı', semt, konu: k, metin: 'Mahallemize ' + MUHTAR_IHTIYAC[k] + ' istiyoruz. ' + Math.round(en[1]).toLocaleString('tr-TR') + ' kişi bekliyor.' }); }
    }
    if (!adaylar.length && rb.length > 10 && Math.random() < 0.5) akis({ tur: 'mutlu', semt: sec1(rb).semt, metin: sec1(['Ankara günden güne güzelleşiyor.', 'Yeni mahallede komşular iyi, çocuklar sokakta oynuyor.', 'Pazar yeri kuruldu; fiyatlar uygun.', 'Akşam gezmesine çıktık, sokaklar aydınlık.']) });
  }

  /* ---------- memnuniyet ---------- */
  function memnuniyet() {
    let t = 0, n = 0; const caz = Math.min(15, Object.values(S.bina).filter(b => V.OZEL[b.hiz] && b.kur >= 1).reduce((a, b) => a + V.OZEL[b.hiz].cazibe, 0));
    const tl = S._talep || { I: 0 };
    for (const b of Object.values(S.bina)) {
      if (!b.sakin) continue; const k = (S.hucre[b.h] && S.hucre[b.h].k) || {};
      let s = 50 + (b.su ? 8 : -14) + (b.elk ? 6 : -8) + (k.okul ? 6 : 0) + (k.saglik ? 5 : 0) + (k.park || k.cami ? 4 : 0) + (k.karakol ? 4 : 0) - (b.hava || 0) * 4 - (b.sitma ? 10 : 0);
      t += s * b.sakin; n += b.sakin;
    }
    const temel = n ? t / n : 55;
    S.memnun = sinir(temel + caz - (S.vergi.R - 9) * 2.5 - Math.max(0, tl.I) * 8, 0, 100);
  }

  /* ---------- zaman ---------- */
  function gunluk() {
    const t = S._talep = talep();
    // büyüme
    const tipler = [['R', t.R], ['C', t.C], ['I', t.I]]; if (yil() >= 1950) tipler.push(['Rk', t.R]);
    for (const [tip, v] of tipler) {
      if (v <= 0.04 || Math.random() > v * 0.8 + 0.1) continue;
      const n = 1 + (Math.random() < v * yil() / 4000 ? 1 : 0); // sonraki dönemlerde daha hızlı
      for (let k = 0; k < n; k++) { const h = bosHucre(tip); if (!h) break; binaKur(h, tip); }
    }
    // olaylar
    while (S.olayNo < V.OLAY.length && V.GUN0 + S.gun * 86400000 >= Date.parse(V.OLAY[S.olayNo].t + 'T00:00:00Z')) {
      const o = V.OLAY[S.olayNo++], e = o.etki || {};
      if (e.goc) S.gocBonus += e.goc;
      if (e.gelir) S.etki.push({ gelir: e.gelir, kalan: e.ay || 12, ad: o.baslik });
      yay({ tur: 'olay', o }); akis({ tur: 'haber', metin: o.baslik + ': ' + o.metin });
    }
    gorevKontrol(); asamaKontrol();
    const tr = tarih();
    if (tr.ay !== S.sonAy) { S.sonAy = tr.ay; aylik(tr); }
  }
  function aylik(tr) {
    grafKur(); S._egitim = egitimOrani(); cevre();
    // seviye atlama ve terk
    for (const b of Object.values(S.bina)) {
      if (b.tip === 'H' || b.kur < 1) continue;
      const ihtiyac = b.tip === 'I' ? b.elk : b.su && b.elk;
      if (b.seviye >= 2 && !ihtiyac) { b.sorunAy = (b.sorunAy || 0) + 1; if (b.sorunAy >= 6 && !b.terk) { b.terk = true; b.sakin = 0; b.is = 0; D.binaGoster(b); } }
      else { b.sorunAy = 0; if (b.terk) { b.terk = false; binaBitti(b); D.binaGoster(b); } }
      if (!b.terk) { const hs = hedefSeviye(b); if (hs > b.seviye && Math.random() < 0.18) seviyeAtla(b, b.seviye + 1); }
    }
    memnuniyet();
    const bt = butce(); S.para += bt.net; S.sonButce = bt;
    S.etki = S.etki.filter(e => --e.kalan > 0);
    S.borc = S.borc.filter(k => --k.kalan > 0);
    aylikAkis(S._talep);
    sorunlar(); acilisKontrol(tr);
    S.gecmis.push([Math.round(S.gun), Math.round(bt.sakin), Math.round(S.para * 10) / 10]); if (S.gecmis.length > 600) S.gecmis.shift();
    if (tr.ay % 3 === 0) kaydet();
    yay({ tur: 'ay', bt });
  }
  function sorunlar() {
    const al = S._altyapi, liste = [];
    if (al.susuz > 100) liste.push({ tur: 'su', metin: '💧 ' + Math.round(al.susuz).toLocaleString('tr-TR') + ' kişi susuz. Su deposu ya da baraj gerek.', katman: 'su' });
    if (al.karanlik > 100) liste.push({ tur: 'elk', metin: '⚡ ' + Math.round(al.karanlik).toLocaleString('tr-TR') + ' kişi elektriksiz. Santral kur.', katman: 'elk' });
    if (S.para < 0) liste.push({ tur: 'para', metin: '💰 Kasa ekside! Vergileri artır ya da harcamayı kıs.' });
    const terk = Object.values(S.bina).filter(b => b.terk).length; if (terk) liste.push({ tur: 'terk', metin: '🏚️ ' + terk + ' bina terk edildi (su ya da elektrik yok).', katman: 'su' });
    const once = JSON.stringify((S.sorun || []).map(s => s.tur)), simdi = JSON.stringify(liste.map(s => s.tur));
    S.sorun = liste; if (once !== simdi) yay({ tur: 'sorun', liste, yeni: liste.filter(s => !once.includes('"' + s.tur + '"')) });
  }
  function acilisKontrol(tr) {
    const yeni = [];
    const bak = (grup, k, def, ad) => { const key = grup + ':' + k; if (def.yil && def.yil <= tr.yil && def.yil > 1923 && !S.acilan[key]) { S.acilan[key] = 1; yeni.push(ad); } };
    for (const k in V.YOL) bak('yol', k, V.YOL[k], V.YOL[k].ad);
    for (const k in V.HIZMET) bak('h', k, V.HIZMET[k], V.HIZMET[k].ad);
    for (const k in V.OZEL) bak('o', k, V.OZEL[k], V.OZEL[k].ad);
    for (const k in V.IMAR) bak('i', k, V.IMAR[k], V.IMAR[k].ad + ' imarı');
    if (yeni.length) yay({ tur: 'acilis', liste: yeni });
  }
  function istat() {
    const s = { yolUzunluk: 0, bulvar: 0, ilkYol: S.ilkYol, parsel: { R: 0, Rk: 0, C: 0, I: 0 }, hizmet: {}, yeniNufus: 0 };
    for (const p of Object.values(S.parca)) { s.yolUzunluk += p.uz; if (p.tur === 'bulvar') s.bulvar += p.uz; }
    for (const h of Object.values(S.hucre)) if (h.imar) s.parsel[h.imar]++;
    for (const b of Object.values(S.bina)) { if (b.tip === 'H') s.hizmet[b.hiz] = (s.hizmet[b.hiz] || 0) + 1; s.yeniNufus += b.sakin || 0; }
    return s;
  }
  function gorevKontrol() {
    const g = V.GOREV[S.gorevNo]; if (!g) return;
    S.istat = istat();
    if (g.kosul(S)) { S.gorevNo++; S.para += 8; yay({ tur: 'gorev', g, sonraki: V.GOREV[S.gorevNo] }); }
  }
  function asamaKontrol() {
    const n = (S.istat || istat()).yeniNufus, s = V.ASAMA[S.asama + 1];
    if (s && n >= s.nufus) { S.asama++; yay({ tur: 'asama', a: s }); akis({ tur: 'haber', metin: 'Ankara artık bir ' + s.ad.toLocaleLowerCase('tr-TR') + '! Yeni nüfus ' + n.toLocaleString('tr-TR') + '.' }); }
  }
  function ilerle(dt) {
    if (!S || !(S.hiz > 0)) return;
    const dg = dt * S.hiz / GUN_SN;
    insaat(dg);
    const once = Math.floor(S.gun); S.gun += dg;
    const n = Math.min(4, Math.floor(S.gun) - once);
    for (let i = 0; i < n; i++) gunluk();
  }

  /* ---------- bilgi katmanları ---------- */
  let katman = null;
  const RK = { iyi: new THREE.Color('#7fd36b'), kotu: new THREE.Color('#ff5a4f'), mavi: new THREE.Color('#6fb7ff'), sari: new THREE.Color('#ffd54a'), beyaz: new THREE.Color('#ffffff'), gri: new THREE.Color('#bbbbbb') };
  function katmanUygula(b) {
    if (!b.gor) return;
    let c = RK.beyaz;
    if (katman && b.tip !== 'H') {
      if (katman === 'su') c = b.su ? RK.mavi : RK.kotu;
      else if (katman === 'elk') c = b.elk ? RK.sari : RK.kotu;
      else if (katman === 'hava') c = new THREE.Color().setHSL(0.33 - Math.min(1, (b.hava || 0) / 3) * 0.33, 0.8, 0.55);
      else if (katman.startsWith('k:')) { const h = S.hucre[b.h]; c = h && h.k && h.k[katman.slice(2)] ? RK.iyi : RK.gri; }
    }
    D.binaRenk(b, c);
  }
  function katmanSec(k) { katman = k; Object.values(S.bina).forEach(katmanUygula); }

  /* ---------- başlangıç ---------- */
  function ilkYollar() {
    const y = (la, lo) => V.yer(la, lo), g = V.BASLANGIC.gar;
    const N = {
      gar: { x: g.x + 1, z: g.z - 3.5 }, ulus: y(39.9412, 32.8549), hisar: y(39.9392, 32.8612), haci: y(39.9443, 32.8570), saman: y(39.9377, 32.8603), hamam: y(39.9334, 32.8618),
      sihhiye: y(39.9302, 32.8546), diskapi: y(39.9505, 32.8590), cebeci: y(39.9300, 32.8800), altin: y(39.9460, 32.8690), tandogan: y(39.9340, 32.8330)
    };
    const ciz = (a, b) => { const r = yolYap(N[a], N[b], 'toprak', true); return r; };
    [['gar', 'ulus'], ['ulus', 'hisar'], ['ulus', 'haci'], ['hisar', 'saman'], ['saman', 'hamam'], ['ulus', 'sihhiye'], ['haci', 'diskapi'], ['hamam', 'cebeci'], ['hisar', 'altin'], ['gar', 'tandogan']].forEach(([a, b]) => ciz(a, b));
    return N.ulus;
  }
  function bosDurum(zorluk) {
    return { surum: 1, zorluk, gun: 0, para: { kolay: 300, normal: 150, zor: 80 }[zorluk] || 150, vergi: { R: 9, C: 9, I: 9 }, hiz: 1, dugum: {}, parca: {}, hucre: {}, bina: {}, sira: 1, akis: [], olayNo: 0, gorevNo: 0, asama: 0, etki: [], borc: [], acilan: {}, memnun: 55, gocBonus: 0, gecmis: [], sonAy: 9, ilkYol: 0 };
  }
  function yeni(zorluk) {
    S = bosDurum(zorluk); izg = new Map(); insa = [];
    D.binaKaynak(id => S.bina[id]);
    const u = ilkYollar();
    S.ilkYol = istat().yolUzunluk; S.istat = istat(); S._talep = talep();
    gunluk();
    return u;
  }
  function kaydet() { try { localStorage.setItem(KAYIT, JSON.stringify(S, (k, v) => k === 'gor' || k === 'k' || k[0] === '_' ? undefined : v)); return true; } catch (e) { return false; } }
  function kayitVar() { try { return !!localStorage.getItem(KAYIT); } catch (e) { return false; } }
  function yukle() {
    let j; try { j = JSON.parse(localStorage.getItem(KAYIT)); } catch (e) { return false; }
    if (!j || j.surum !== 1) return false;
    S = j; izg = new Map(); insa = [];
    D.binaKaynak(id => S.bina[id]);
    Object.values(S.parca).forEach(parcaCiz);
    Object.values(S.hucre).forEach(izgEkle);
    Object.values(S.bina).forEach(b => { D.binaGoster(b); if (b.kur < 1) insa.push(b.id); });
    grafKur(); S.istat = istat(); S._talep = talep();
    return true;
  }
  function sil() { try { localStorage.removeItem(KAYIT); } catch (e) { } }

  return {
    get S() { return S; }, on: f => dinle.push(f), yeni, yukle, kaydet, kayitVar, sil, ilerle, tarih, yil, acikMi, yakala, yolDene, yolYap, imarBoya,
    yapiDene, yapiYap, yapiTanim, sec, yik, yikIade, talep: () => S._talep || talep(), butce, istat, kaynak, katmanSec, katman: () => katman, AYAK, YIL_SN,
    bilgi(b) {
      const h = S.hucre[b.h], k = (h && h.k) || {};
      return { k, hedef: b.tip === 'H' ? null : hedefSeviye(b), tavan: V.DONEM_SEVIYE(yil()) };
    }
  };
})();
