/* Kuruluş 1299 — ekonomi ve nüfus simülasyonu (çizimden bağımsız). Ay ay işler. */
'use strict';
(function () {
  const V = window.VERI;
  const KAYIT = 'kurulus-1299-v1';
  let S = null;
  const binaV = id => V.BINALAR.find(b => b.id === id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function yeni() {
    S = {
      surum: 1, yil: V.BASLANGIC.yil, ay: V.BASLANGIC.ay - 1, t: 0, hiz: 1,
      kaynak: Object.assign({}, V.BASLANGIC_KAYNAK), nufus: V.BASLANGIC_NUFUS, memnun: 55,
      binalar: [], sonId: 0, gorev: 0, olaylar: [], gunluk: [], aylik: {}, kitlik: 0
    };
    orduAlanlari(S);
    return S;
  }
  // ordu ve harita alanları (eski kayıtlara da eklenir)
  function orduAlanlari(d) {
    if (!d.ordu) d.ordu = { yaya: 0, okcu: 0, akinci: 0 };
    if (!d.egitim) d.egitim = [];
    if (d.sefer === undefined) d.sefer = null;
    if (!d.kaleler) { d.kaleler = {}; V.HARITA.yerler.forEach(y => { d.kaleler[y.id] = { sahip: y.sahip, garnizon: y.garnizon || 0 }; }); }
    if (d.fetih == null) d.fetih = 0;
    if (!d.tarihNot) d.tarihNot = [];
  }
  const birlikV = id => V.BIRLIKLER.find(b => b.id === id);
  const yerV = id => V.HARITA.yerler.find(y => y.id === id);
  function asker() {
    const t = o => Object.values(o).reduce((a, b) => a + b, 0);
    return t(S.ordu) + S.egitim.reduce((a, e) => a + e.adet, 0) + (S.sefer ? t(S.sefer.ordu) : 0);
  }
  function egitimBaslat(tip, adet) {
    const v = birlikV(tip);
    if (!say(v.gerek)) return 'bina';
    if (asker() + adet > Math.floor(S.nufus * 0.35)) return 'nufus';
    for (const [k, m] of Object.entries(v.maliyet)) if (S.kaynak[k] < m * adet) return 'kaynak';
    for (const [k, m] of Object.entries(v.maliyet)) S.kaynak[k] -= m * adet;
    S.egitim.push({ tip, adet, kalan: 1 });
    kaydet(); return 'tamam';
  }
  function mesafe(a, b) { return Math.hypot(a.e - b.e, (a.b - b.b) * 0.76); }
  function seferSuresi(hedef, ordu) {
    const d = mesafe(yerV('sogut'), yerV(hedef));
    const hizli = ordu.akinci && !ordu.yaya && !ordu.okcu;
    return Math.max(1, Math.round(d / (hizli ? 0.5 : 0.25)));
  }
  function seferBaslat(hedef, ordu) {
    const top = Object.values(ordu).reduce((a, b) => a + b, 0);
    if (!top) return 'bos'; if (S.sefer) return 'var';
    for (const k in ordu) { if (ordu[k] > S.ordu[k]) return 'yetersiz'; }
    for (const k in ordu) S.ordu[k] -= ordu[k];
    const sure = seferSuresi(hedef, ordu);
    S.sefer = { hedef, ordu: Object.assign({}, ordu), kalan: sure, sure };
    kaydet(); return 'tamam';
  }
  // kuşatma ya da meydan muharebesi: güç, sur, tarih ivmesi
  function savasCoz(sefer) {
    const y = yerV(sefer.hedef), k = S.kaleler[sefer.hedef];
    const sur = y.sur || 1;
    let guc = 0;
    for (const [id, n] of Object.entries(sefer.ordu)) { const b = birlikV(id); guc += n * b.saldiri * (sur > 1.05 ? Math.pow(b.kusatma, 0.9) : (id === 'akinci' ? 1.25 : 1)); }
    guc *= 0.85 + S.memnun / 400;
    // tarih ivmesi: gerçek fetih yılı geçtiyse savunma zayıflar, çok erkense güçlenir
    const ivme = S.yil >= y.fetih ? 0.6 : 1 + Math.min(1.5, (y.fetih - S.yil) * 0.05);
    const savunma = k.garnizon * 4 * sur * ivme * (0.85 + Math.random() * 0.3);
    const zafer = guc > savunma;
    const oran = zafer ? Math.max(0.05, Math.min(0.55, savunma / guc * 0.4)) : Math.min(0.85, 0.35 + savunma / Math.max(1, guc) * 0.15);
    const kayip = {}, kalan = {};
    for (const [id, n] of Object.entries(sefer.ordu)) { kayip[id] = Math.round(n * oran * (0.8 + Math.random() * 0.4)); kalan[id] = Math.max(0, n - kayip[id]); }
    const sonuc = { hedef: y.id, ad: y.ad, zafer, guc: Math.round(guc), savunma: Math.round(savunma), kayip, kalan, ivme, savas: !!y.savas };
    if (zafer) {
      k.sahip = 'osm'; sonuc.ganimet = Math.round(k.garnizon * 3 + (sefer.ordu.akinci || 0) * 2);
      sonuc.tebaa = Math.round(k.garnizon * 0.25);
      S.kaynak.akce += sonuc.ganimet; S.nufus += sonuc.tebaa; S.fetih++; k.garnizon = 0;
      S.memnun = Math.min(100, S.memnun + 8);
    } else { k.garnizon = Math.max(5, Math.round(k.garnizon * 0.85)); S.memnun = Math.max(0, S.memnun - 8); }
    Object.keys(kalan).forEach(id => { S.ordu[id] += kalan[id]; });
    return sonuc;
  }
  const say = tip => S.binalar.filter(b => b.tip === tip && b.insa >= 1).length;
  const sayHepsi = tip => S.binalar.filter(b => b.tip === tip).length;
  function konut() { return S.binalar.reduce((t, b) => t + (b.insa >= 1 ? binaV(b.tip).konut || 0 : 0), 0); }
  function acikMi(tip) { const v = binaV(tip); return !v.kilit || say(v.kilit) > 0; }
  function alinabilir(tip) {
    const v = binaV(tip);
    if (v.tekil && sayHepsi(tip)) return false;
    return Object.entries(v.maliyet).every(([k, m]) => S.kaynak[k] >= m);
  }
  function binaEkle(tip, x, z, rot, hazir) {
    const v = binaV(tip);
    if (!hazir) for (const [k, m] of Object.entries(v.maliyet)) S.kaynak[k] -= m;
    const b = { id: ++S.sonId, tip, x, z, rot: rot || 0, insa: hazir ? 1 : 0, isci: 0, cevre: 1 };
    S.binalar.push(b); return b;
  }
  function binaYik(id) {
    const b = S.binalar.find(x => x.id === id); if (!b) return;
    const v = binaV(b.tip);
    // yarısı geri gelir
    for (const [k, m] of Object.entries(v.maliyet)) S.kaynak[k] += Math.floor(m * 0.5 * (b.insa >= 1 ? 1 : 1));
    S.binalar = S.binalar.filter(x => x !== b);
  }
  // işçiler: önce yiyecek, sonra diğerleri
  const ONCELIK = ['tarla', 'agil', 'oduncu', 'tasocagi', 'pazar', 'han'];
  function isciDagit() {
    let bos = Math.max(0, Math.floor(S.nufus * 0.62) - asker());   // çocuk, yaşlı ve askerler hariç
    S.binalar.forEach(b => { b.isci = 0; });
    for (const tip of ONCELIK) for (const b of S.binalar) {
      if (b.tip !== tip || b.insa < 1) continue;
      const v = binaV(tip), al = Math.min(v.isci || 0, bos); b.isci = al; bos -= al;
    }
    S.bosIsci = bos;
  }
  // bir ay geçer: dunya.cevre(b) ağaç/kaya yakınlığını 0–1 verir
  function ayGec(cevre) {
    const ay = S.ay, rapor = { yiyecek: 0, odun: 0, tas: 0, akce: 0 };
    // inşaat
    S.binalar.forEach(b => { if (b.insa < 1) b.insa = Math.min(1, b.insa + 1 / binaV(b.tip).sure); });
    isciDagit();
    // üretim
    for (const b of S.binalar) {
      if (b.insa < 1) continue;
      const v = binaV(b.tip); if (!v.uretim) continue;
      b.cevre = cevre ? cevre(b) : 1; b.son = {};
      for (const [k, m] of Object.entries(v.uretim)) {
        const u = m * b.isci * (v.hasat ? V.HASAT[ay] : 1) * b.cevre * (0.8 + S.memnun / 250);
        rapor[k] += u; b.son[k] = u;
      }
      if (v.nufusAkce) { const u = S.nufus * v.nufusAkce * (b.isci / v.isci); rapor.akce += u; b.son.akce = (b.son.akce || 0) + u; }
    }
    rapor.akce += S.nufus * V.VERGI;
    // tımar: fethedilen kalelerin geliri
    const kaleSay = Object.entries(S.kaleler).filter(([id, k]) => k.sahip === 'osm' && id !== 'sogut').length;
    rapor.akce += kaleSay * 3; rapor.yiyecek += kaleSay * 4;
    // ordu bakımı
    const ask = asker();
    rapor.yiyecek -= ask * V.BAKIM.yiyecek; rapor.akce -= ask * V.BAKIM.akce;
    // eğitim ve sefer
    let savas = null;
    S.egitim.forEach(e => { e.kalan--; if (e.kalan <= 0) S.ordu[e.tip] += e.adet; });
    S.egitim = S.egitim.filter(e => e.kalan > 0);
    if (S.sefer) { S.sefer.kalan--; if (S.sefer.kalan <= 0) { savas = savasCoz(S.sefer); S.sefer = null; } }
    // akçe biterse asker kaçar
    if (S.kaynak.akce + rapor.akce < 0 && ask) { for (const id in S.ordu) S.ordu[id] = Math.floor(S.ordu[id] * 0.85); S.gunluk.unshift({ t: tarihYazi(), m: 'Akçe bitti: bazı askerler terhis oldu.' }); }
    // tarih ivmesi bildirimi
    V.HARITA.yerler.forEach(y => { if (y.fetih && S.yil >= y.fetih && S.kaleler[y.id].sahip !== 'osm' && !y.kapali && !S.tarihNot.includes(y.id)) { S.tarihNot.push(y.id); S.gunluk.unshift({ t: tarihYazi(), m: `Tarihte bu yıllarda ${y.ad} Osmanlı'ya geçti. Kalenin savunması zayıfladı.` }); } });
    S._savas = savas;
    const yemek = S.nufus * V.YEMEK;
    rapor.yiyecek -= yemek;
    for (const k in rapor) S.kaynak[k] = Math.max(0, S.kaynak[k] + rapor[k]);
    // kıtlık
    if (S.kaynak.yiyecek <= 0 && rapor.yiyecek < 0) {
      const kayip = Math.max(1, Math.round(S.nufus * 0.05)); S.nufus -= kayip; S.kitlik++;
      S.gunluk.unshift({ t: tarihYazi(), m: `Kıtlık! ${kayip} kişi obayı terk etti.` });
    } else S.kitlik = 0;
    // nüfus
    const yer = konut() - S.nufus;
    if (S.kaynak.yiyecek > S.nufus * 0.5 && yer > 0) {
      const art = Math.max(S.memnun > 45 ? 1 : 0, S.nufus * V.DOGUM * (S.memnun / 60)) + (S.memnun > 62 ? V.GOC * (S.memnun - 60) / 10 : 0);
      S._artKesir = (S._artKesir || 0) + art;
      const tam = Math.min(yer, Math.floor(S._artKesir)); S.nufus += tam; S._artKesir -= tam;
    }
    // memnuniyet: mescit, ev, yiyecek bolluğu, kalabalık
    let hedef = 45;
    S.binalar.forEach(b => { if (b.insa >= 1) hedef += binaV(b.tip).memnun || 0; });
    hedef += clamp((S.kaynak.yiyecek / Math.max(1, S.nufus) - 1) * 8, -15, 12);
    if (yer < 0) hedef += yer * 2;
    if (S.kitlik) hedef -= 15;
    S.memnun = clamp(S.memnun + (clamp(hedef, 5, 98) - S.memnun) * 0.25, 0, 100);
    S.aylik = rapor;
    // takvim
    S.ay++; if (S.ay > 11) { S.ay = 0; S.yil++; }
    // görev
    const g = V.GOREVLER[S.gorev];
    let bitenGorev = null;
    if (g && g.kosul({ say, nufus: S.nufus, asker: asker(), fetih: S.fetih })) {
      for (const [k, m] of Object.entries(g.odul)) S.kaynak[k] += m;
      bitenGorev = g; S.gorev++;
    }
    kaydet();
    const sv = S._savas; delete S._savas;
    return { rapor, bitenGorev, savas: sv };
  }
  function tarihYazi() { return V.AYLAR[S.ay] + ' ' + S.yil; }
  function kaydet() { try { localStorage.setItem(KAYIT, JSON.stringify(S)); } catch (e) { } }
  function yukle() { try { const d = JSON.parse(localStorage.getItem(KAYIT) || 'null'); if (d && d.surum === 1) { S = d; orduAlanlari(S); } return d && d.surum === 1 ? d : null; } catch (e) { return null; } }
  function sil() { try { localStorage.removeItem(KAYIT); } catch (e) { } }

  window.Sim = { asker, egitimBaslat, seferBaslat, seferSuresi, birlikV, yerV, yeni, yukle, kaydet, sil, durum: () => S, ayGec, binaEkle, binaYik, say, konut, acikMi, alinabilir, binaV, tarihYazi, isciDagit };
})();
