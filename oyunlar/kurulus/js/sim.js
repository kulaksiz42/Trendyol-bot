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
    return S;
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
    let bos = Math.floor(S.nufus * 0.62);   // çocuk ve yaşlılar hariç çalışabilir nüfus
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
    if (g && g.kosul({ say, nufus: S.nufus })) {
      for (const [k, m] of Object.entries(g.odul)) S.kaynak[k] += m;
      bitenGorev = g; S.gorev++;
    }
    kaydet();
    return { rapor, bitenGorev };
  }
  function tarihYazi() { return V.AYLAR[S.ay] + ' ' + S.yil; }
  function kaydet() { try { localStorage.setItem(KAYIT, JSON.stringify(S)); } catch (e) { } }
  function yukle() { try { const d = JSON.parse(localStorage.getItem(KAYIT) || 'null'); if (d && d.surum === 1) S = d; return d && d.surum === 1 ? d : null; } catch (e) { return null; } }
  function sil() { try { localStorage.removeItem(KAYIT); } catch (e) { } }

  window.Sim = { yeni, yukle, kaydet, sil, durum: () => S, ayGec, binaEkle, binaYik, say, konut, acikMi, alinabilir, binaV, tarihYazi, isciDagit };
})();
