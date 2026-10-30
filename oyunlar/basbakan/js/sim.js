/* Başbakan — simülasyon: ekonomi, kamuoyu, seçim, projeler. Saf veri; çizim yok. */
'use strict';
window.Sim = (function () {
  const V = window.VERI, SEC = window.SECIM2002;
  const KAYIT = 'basbakan-kayit-1';
  const PARTILER = ['akp', 'chp', 'mhp', 'dyp', 'gp', 'dig'];
  // kesimden kaçan oy hangi partilere gider
  const ALT = {
    laik: { chp: 0.8, dig: 0.2 }, mil: { mhp: 0.8, dyp: 0.2 }, sag: { dyp: 0.45, gp: 0.35, dig: 0.2 },
    kurt: { dig: 1 }, muh: { dig: 0.6, mhp: 0.2, dyp: 0.2 }
  };
  let S = null;

  /* ---------- il yapısı (2002 sonuçlarından) ---------- */
  const IL = {};
  Object.entries(SEC).forEach(([ad, r]) => {
    const p = {}; PARTILER.forEach(k => p[k] = r.oy[k] / r.top * 100);
    const dehap = V.DEHAP_IL.includes(ad), K = p.dig * (dehap ? 0.75 : 0.05), rest = p.dig - K;
    IL[ad] = {
      ad, mv: r.mv, secmen: r.top, taban: p, dehap,
      kesim: { laik: p.chp + rest * 0.35, mil: p.mhp + rest * 0.1, sag: p.dyp + p.gp + rest * 0.45, kurt: K, muh: p.akp + rest * 0.1 }
    };
  });
  const TOPLAM_SECMEN = Object.values(IL).reduce((a, i) => a + i.secmen, 0);

  /* ---------- tarih yardımcıları ---------- */
  const gunTarih = g => { const d = new Date(Date.UTC(2002, 10, 3)); d.setUTCDate(d.getUTCDate() + g); return d; };
  const iso = d => d.toISOString().slice(0, 10);
  const tarihGun = s => Math.round((Date.parse(s + 'T00:00:00Z') - Date.UTC(2002, 10, 3)) / 864e5);

  function yeni(ad) {
    S = {
      ad: ad || 'Başbakan', gun: 0, eko: Object.assign({ kurDeg: 0 }, V.EKO),
      pol: { h: 0, vergi: 0, imf: true, mb: 'bagimsiz' },
      kesim: Object.fromEntries(Object.entries(V.KESIM).map(([k, s]) => [k, { v: s.v0, m: 0 }])),
      kurum: Object.fromEntries(Object.entries(V.KURUM).map(([k, s]) => [k, s.v])),
      dis: Object.fromEntries(Object.entries(V.DIS).map(([k, s]) => [k, s.v])),
      b: {}, bitti: [], projeler: [], ilEtki: {}, secimler: [], soklar: [], odenek: 8, asgari: 226,
      anket: 34.3, gecmis: [], hiz: 1, baskan: false
    };
    S.anket = anketHesap().ulusal.akp;
    return S;
  }

  /* ---------- kamuoyu ---------- */
  function ilPaylari(il) {
    const p = Object.assign({}, il.taban), yil = 2002.85 + S.gun / 365;
    // Genç Parti'nin zamanla erimesi (gerçekte 2007'de %3)
    const erime = Math.max(0, Math.min(0.6, (yil - 2003.5) * 0.17)) * p.gp;
    p.gp -= erime; p.mhp += erime * 0.55; p.dyp += erime * 0.1; p.chp += erime * 0.1; p.akp += erime * 0.25;
    // ANAP, DSP, SP gibi küçük partilerin oyları dağılıyor (Doğu dışındaki 'diğer')
    if (!il.dehap) { const d = Math.max(0, Math.min(0.5, (yil - 2003.5) * 0.14)) * p.dig; p.dig -= d; p.mhp += d * 0.35; p.chp += d * 0.3; p.dyp += d * 0.1; p.akp += d * 0.25; }
    // DYP'nin zayıflaması (2007'de DP adıyla %5,4)
    const dz = Math.max(0, Math.min(0.45, (yil - 2004) * 0.14)) * p.dyp; p.dyp -= dz; p.akp += dz * 0.4; p.mhp += dz * 0.3; p.chp += dz * 0.3;
    Object.entries(S.kesim).forEach(([k, s]) => {
      const d = (s.v - V.KESIM[k].v0) * il.kesim[k];
      p.akp += d; Object.entries(ALT[k]).forEach(([pa, o]) => p[pa] -= d * o);
    });
    p.akp += S.ilEtki[il.ad] || 0;
    PARTILER.forEach(k => p[k] = Math.max(0.3, p[k]));
    const t = PARTILER.reduce((a, k) => a + p[k], 0); PARTILER.forEach(k => p[k] = p[k] / t * 100);
    return p;
  }
  function anketHesap() {
    const ulusal = Object.fromEntries(PARTILER.map(k => [k, 0])), iller = {};
    Object.values(IL).forEach(il => {
      const p = ilPaylari(il); iller[il.ad] = p;
      PARTILER.forEach(k => ulusal[k] += p[k] * il.secmen / TOPLAM_SECMEN);
    });
    return { ulusal, iller };
  }
  // d'Hondt, %10 ülke barajı; bağımsızlar (2007'den itibaren) DEHAP illerinde aday
  function sandalye(a) {
    const bag = 2002.85 + S.gun / 365 > 2006.5, sonuc = Object.fromEntries(PARTILER.map(k => [k, 0])), ilSonuc = {};
    const gecen = PARTILER.filter(k => k !== 'dig' && a.ulusal[k] >= 10);
    Object.values(IL).forEach(il => {
      const p = a.iller[il.ad], s = Object.fromEntries(PARTILER.map(k => [k, 0]));
      let kalan = il.mv;
      if (bag && il.dehap) { const n = Math.min(kalan, Math.floor(p.dig / (100 / (il.mv + 1)))); s.dig = n; kalan -= n; }
      for (let i = 0; i < kalan; i++) {
        let en = null, eb = -1;
        gecen.forEach(k => { const b = p[k] / (s[k] + 1); if (b > eb) { eb = b; en = k; } });
        if (en) s[en]++;
      }
      PARTILER.forEach(k => sonuc[k] += s[k]); ilSonuc[il.ad] = s;
    });
    return { sonuc, ilSonuc, gecen };
  }

  /* ---------- ekonomi (aylık) ---------- */
  function ekonomiAy() {
    const e = S.eko, p = S.pol, yil = 2002.85 + S.gun / 365;
    const sok = k => S.soklar.filter(s => s.k === k).reduce((a, s) => a + s.v, 0);
    const risk = 50 - e.guven;
    const toparlanma = 4.2 * Math.exp(-(yil - 2002.8) / 2.0);
    const dunya = yil < 2008.6 ? 1.2 : -2;
    const enfHedef = 6.5 + 3 * p.h + 0.25 * Math.max(0, e.kurDeg) + (p.mb === 'baski' ? 6 : 0) - 0.05 * (e.guven - 50) + sok('enf');
    e.enf += (Math.max(1, enfHedef) - e.enf) * 0.055;
    const faizHedef = p.mb === 'baski' ? e.enf + 2 : e.enf + 8 + risk * 0.1;
    e.faiz += (faizHedef - e.faiz) * 0.14 + sok('faiz'); e.faiz = Math.max(4, e.faiz);
    const reel = e.faiz - e.enf;
    e.kurDeg = 0.45 * e.enf - 1.4 * (reel - 4) + 0.3 * risk + sok('kurDeg');
    e.kur *= Math.pow(1 + e.kurDeg / 100, 1 / 12);
    const buyHedef = 2.6 + 1.6 * p.h - 0.6 * p.vergi + 0.11 * (e.guven - 50) - 0.1 * (reel - 6) + toparlanma + dunya + sok('buyume') + projeBuyume();
    e.buyume += (buyHedef - e.buyume) * 0.12;
    e.issizlik += ((10.4 - 0.32 * (e.buyume - 5)) - e.issizlik) * 0.05;
    const acikHedef = 2.4 + 2.2 * p.h - 1.4 * p.vergi + e.borc * e.faiz / 100 * 0.32 - (p.imf ? 4 : 0) + sok('acik') + Math.max(0, -S.odenek) * 0.05;
    e.acik += (acikHedef - e.acik) * 0.1;
    e.borc = Math.max(5, e.borc + (e.acik - e.borc * (e.buyume + e.enf) / (100 + e.buyume + e.enf) * 0.95) / 12);
    const kurum = (S.kurum.ordu + S.kurum.yargi + S.kurum.isd) / 3;
    const guvenHedef = 42 + (p.imf ? 10 : 0) + (S.dis.ab - 50) * 0.3 + (kurum - 40) * 0.25 - Math.max(0, e.acik - 3) * 1.2 - Math.max(0, e.enf - 10) * 0.3 + (p.mb === 'baski' ? -10 : 0);
    e.guven += (guvenHedef - e.guven) * 0.06; e.guven = Math.max(0, Math.min(100, e.guven));
    e.kisiBasi *= Math.pow(1 + (e.buyume + e.enf - e.kurDeg) / 100, 1 / 12);
    e.nufus *= Math.pow(1.013, 1 / 12);
    S.soklar.forEach(s => s.ay--); S.soklar = S.soklar.filter(s => s.ay > 0);
  }
  function refah() { const e = S.eko; return 0.6 * (e.buyume - 4) - 0.22 * (e.enf - 12) - 0.8 * (e.issizlik - 10); }
  function kamuoyuAy() {
    const r = refah(), yil = 2002.85 + S.gun / 365, yip = Math.max(0, yil - 2009) * 0.01;
    Object.entries(S.kesim).forEach(([k, s]) => {
      const K = V.KESIM[k];
      const balayi = 0.12 * Math.max(0, 1 - (yil - 2002.85) / 3.5) * K.duy / 4;
      const hedef = Math.max(0.01, Math.min(0.97, K.v0 + s.m / 100 + K.duy * r / 100 + balayi - yip));
      s.v += (hedef - s.v) * 0.1; s.m *= 0.985;
    });
    Object.keys(S.ilEtki).forEach(k => { S.ilEtki[k] *= 0.99; });
    const a = anketHesap(); S.anket = a.ulusal.akp;
    return a;
  }

  /* ---------- projeler ---------- */
  function projeBuyume() { return S.projeler.filter(p => p.bitti).reduce((a, p) => a + V.PROJE[p.tip].buyume * Math.max(0, 1 - (S.gun - p.bitis) / 1500), 0); }
  function projeKur(tip, il) {
    const P = V.PROJE[tip], yil = 2002.85 + S.gun / 365;
    if (yil < P.yil) return 'erken';
    if (P.tekil && S.projeler.some(p => p.tip === tip)) return 'var';
    if (S.projeler.some(p => p.tip === tip && p.il === il)) return 'ilde';
    S.odenek -= P.maliyet;
    S.projeler.push({ tip, il: P.il || il, bas: S.gun, bitis: S.gun + Math.round(P.sure * 30.4), bitti: false });
    S.ilEtki[P.il || il] = (S.ilEtki[P.il || il] || 0) + P.yerel * 0.3;
    return 'tamam';
  }
  function projeAy() {
    const biten = [];
    S.projeler.forEach(p => {
      if (!p.bitti && S.gun >= p.bitis) {
        p.bitti = true; biten.push(p); const P = V.PROJE[p.tip];
        S.ilEtki[p.il] = (S.ilEtki[p.il] || 0) + P.yerel;
        Object.entries(P.etki).forEach(([k, v]) => S.kesim[k].m += v);
      }
    });
    return biten;
  }

  /* ---------- kararlar ---------- */
  function etkiUygula(et) {
    if (!et) return;
    Object.entries(et.k || {}).forEach(([k, v]) => S.kesim[k].m += v);
    Object.entries(et.i || {}).forEach(([k, v]) => S.kurum[k] = clamp(S.kurum[k] + v));
    Object.entries(et.d || {}).forEach(([k, v]) => S.dis[k] = clamp(S.dis[k] + v));
    Object.entries(et.b || {}).forEach(([k, v]) => S.b[k] = (S.b[k] || 0) + v);
    const e = et.e || {};
    if (e.guven) S.eko.guven = clamp(S.eko.guven + e.guven);
    if (e.kur) { S.eko.kur *= 1 + e.kur / 100; S.soklar.push({ k: 'enf', v: e.kur * 0.25, ay: 8 }); }
    if (e.enf) S.soklar.push({ k: 'enf', v: e.enf * 4, ay: 6 });
    if (e.acik) S.soklar.push({ k: 'acik', v: e.acik, ay: 12 });
    if (e.buyume) S.soklar.push({ k: 'buyume', v: e.buyume, ay: 9 });
    if (e.faiz) S.eko.faiz += e.faiz;
    if (e.borc) S.eko.borc += e.borc;
    if (e.h !== undefined) S.pol.h = e.h;
    if (e.vergi !== undefined) S.pol.vergi = e.vergi;
    if (e.imf !== undefined) S.pol.imf = e.imf;
    if (e.mb) { S.pol.mb = e.mb; if (e.mb === 'baski') S.soklar.push({ k: 'mbBaski', v: 0, ay: 10 }); }
    if (e.odenek) S.odenek += e.odenek;
  }
  const clamp = v => Math.max(0, Math.min(100, v));
  function bekleyenOlay() {
    const bugun = iso(gunTarih(S.gun));
    return V.OLAY.find(o => o.t <= bugun && !S.bitti.includes(o.id) && (!o.kosul || o.kosul(S))) || null;
  }
  function olayBitti(o) { S.bitti.push(o.id); }

  /* ---------- zaman ---------- */
  // bir gün ilerlet; ay değişirse aylık hesapları yap
  function gunGec() {
    const once = gunTarih(S.gun); S.gun++;
    const simdi = gunTarih(S.gun), olay = { ay: false, biten: [], yil: false };
    if (simdi.getUTCMonth() !== once.getUTCMonth()) {
      olay.ay = true;
      if (S.pol.mb === 'baski' && !S.soklar.some(s => s.k === 'mbBaski')) S.pol.mb = 'bagimsiz';
      ekonomiAy(); olay.anket = kamuoyuAy(); olay.biten = projeAy();
      S.gecmis.push({ g: S.gun, anket: +S.anket.toFixed(1), enf: +S.eko.enf.toFixed(1), buyume: +S.eko.buyume.toFixed(1), kur: +S.eko.kur.toFixed(3) });
      if (simdi.getUTCMonth() === 0) { olay.yil = true; S.odenek += 10 + 4 * S.pol.h + S.eko.kisiBasi / 1500; }
    }
    return olay;
  }
  function secimYap(o) {
    const a = anketHesap(), r = { id: o.id, tur: o.secim, t: iso(gunTarih(S.gun)), ulusal: a.ulusal, iller: a.iller, gercek: o.gercek };
    if (o.secim === 'genel') { const s = sandalye(a); r.sandalye = s.sonuc; r.gecen = s.gecen; }
    r.kazanan = Object.fromEntries(Object.entries(a.iller).map(([il, p]) => [il, PARTILER.reduce((en, k) => p[k] > p[en] ? k : en, 'akp')]));
    S.secimler.push({ id: r.id, tur: r.tur, t: r.t, ulusal: r.ulusal, sandalye: r.sandalye, kazanan: r.kazanan });
    // seçim sonrası: tabanın moral etkisi
    if (o.secim === 'genel' && r.sandalye && r.sandalye.akp < 276) S.b.iktidarKayip = 1;
    return r;
  }

  function kaydet() { try { localStorage.setItem(KAYIT, JSON.stringify(S)); } catch (e) { } }
  function yukle() { try { const j = localStorage.getItem(KAYIT); if (j) { S = JSON.parse(j); return S; } } catch (e) { } return null; }
  function kayitVar() { try { return !!localStorage.getItem(KAYIT); } catch (e) { return false; } }
  function sil() { try { localStorage.removeItem(KAYIT); } catch (e) { } }

  return {
    yeni, yukle, kaydet, kayitVar, sil, durum: () => S, IL, PARTILER, gunTarih, iso, tarihGun,
    gunGec, anketHesap, sandalye, secimYap, etkiUygula, bekleyenOlay, olayBitti, projeKur, refah
  };
})();
