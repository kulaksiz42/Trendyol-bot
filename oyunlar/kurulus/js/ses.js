/* Kuruluş 1299 — sesler. Hepsi WebAudio ile üretilir (dosya indirilmez).
   Ortam: kuşlar, dere, rüzgâr. Olaylar: inşaat, para, ferman, savaş, mehter. */
'use strict';
(function () {
  let ctx = null, ana = null, ortamGain = null, acik = true, ortamT = null, mevsim = 'yaz';
  try { acik = localStorage.getItem('kurulus-ses') !== '0'; } catch (e) { }

  // ilk dokunuşta başlar (tarayıcı izin politikası)
  function hazirla() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); ana = ctx.createGain(); ana.gain.value = acik ? 0.8 : 0; ana.connect(ctx.destination);
    ortamGain = ctx.createGain(); ortamGain.gain.value = 0.5; ortamGain.connect(ana);
    dere(); ortamDongu();
  }
  function gurultuTampon(sn = 2) {
    const b = ctx.createBuffer(1, ctx.sampleRate * sn, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  // sürekli dere/rüzgâr: süzülmüş gürültü
  let dereFiltre = null, dereGain = null;
  function dere() {
    const k = ctx.createBufferSource(); k.buffer = gurultuTampon(3); k.loop = true;
    dereFiltre = ctx.createBiquadFilter(); dereFiltre.type = 'bandpass'; dereFiltre.frequency.value = 900; dereFiltre.Q.value = 0.6;
    dereGain = ctx.createGain(); dereGain.gain.value = 0.05;
    k.connect(dereFiltre).connect(dereGain).connect(ortamGain); k.start();
  }
  // kuş cıvıltısı: hızlı frekans kaymalı kısa sinüsler
  function kus() {
    const t = ctx.currentTime, say = 2 + Math.floor(Math.random() * 4), taban = 2400 + Math.random() * 1800;
    for (let k = 0; k < say; k++) {
      const o = ctx.createOscillator(), g = ctx.createGain(), b = t + k * (0.09 + Math.random() * 0.05);
      o.type = 'sine'; o.frequency.setValueAtTime(taban, b); o.frequency.exponentialRampToValueAtTime(taban * (1.2 + Math.random() * 0.5), b + 0.06);
      g.gain.setValueAtTime(0, b); g.gain.linearRampToValueAtTime(0.05, b + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, b + 0.08);
      o.connect(g).connect(ortamGain); o.start(b); o.stop(b + 0.1);
    }
  }
  function ortamDongu() {
    clearTimeout(ortamT);
    if (mevsim !== 'kis' && Math.random() < 0.8) kus();
    ortamT = setTimeout(ortamDongu, 1500 + Math.random() * 3500);
  }
  function mevsimAyarla(ay) {
    mevsim = ay === 11 || ay <= 1 ? 'kis' : 'yaz';
    if (dereFiltre) { dereFiltre.frequency.value = mevsim === 'kis' ? 420 : 900; dereGain.gain.value = mevsim === 'kis' ? 0.08 : 0.05; }
  }

  /* ---------- tek seferlik sesler ---------- */
  function ton(f, sure, tip = 'sine', ses = 0.15, gecikme = 0, hedef) {
    if (!ctx || !acik) return;
    const t = ctx.currentTime + gecikme, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tip; o.frequency.setValueAtTime(f, t); if (hedef) o.frequency.exponentialRampToValueAtTime(hedef, t + sure);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(ses, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    o.connect(g).connect(ana); o.start(t); o.stop(t + sure + 0.02);
  }
  function patlama(sure, frekans, ses = 0.2, gecikme = 0, tip = 'lowpass') {
    if (!ctx || !acik) return;
    const t = ctx.currentTime + gecikme, k = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    k.buffer = gurultuTampon(Math.max(0.2, sure)); f.type = tip; f.frequency.value = frekans;
    g.gain.setValueAtTime(ses, t); g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    k.connect(f).connect(g).connect(ana); k.start(t); k.stop(t + sure + 0.05);
  }
  const S = {
    hazirla,
    tik: () => ton(1200, 0.05, 'triangle', 0.06),
    insaat: () => { for (let k = 0; k < 3; k++) { patlama(0.07, 1800, 0.25, k * 0.22, 'bandpass'); ton(320, 0.06, 'square', 0.03, k * 0.22); } },
    bitti: () => { ton(880, 0.5, 'sine', 0.1); ton(1320, 0.6, 'sine', 0.06, 0.08); },
    para: () => { for (let k = 0; k < 4; k++) ton(2200 + Math.random() * 900, 0.12, 'triangle', 0.05, k * 0.06); },
    ferman: () => { patlama(0.25, 3000, 0.08, 0, 'highpass'); ton(196, 1.6, 'sine', 0.12, 0.1); ton(294, 1.4, 'sine', 0.05, 0.1); },
    bildirim: () => { ton(660, 0.12, 'sine', 0.07); ton(990, 0.18, 'sine', 0.05, 0.1); },
    kilic: () => { patlama(0.12, 3500, 0.12, 0, 'bandpass'); ton(2600 + Math.random() * 800, 0.25, 'square', 0.02); },
    ok: () => patlama(0.35, 1200, 0.05, 0, 'bandpass'),
    davul: (g = 0) => { ton(90, 0.35, 'sine', 0.35, g, 45); patlama(0.15, 300, 0.15, g); },
    // mehter: davul vuruşları ve zurnanın kısa motifi (kare dalga, vibratolu)
    mehter: () => {
      if (!ctx || !acik) return;
      [0, 0.45, 0.9, 1.15, 1.35, 1.8].forEach(t => S.davul(t));
      const nota = [392, 440, 494, 440, 392, 349, 392];
      nota.forEach((f, i) => {
        const t = ctx.currentTime + 0.2 + i * 0.28, o = ctx.createOscillator(), v = ctx.createOscillator(), vg = ctx.createGain(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
        o.type = 'square'; o.frequency.value = f * 2; v.frequency.value = 6; vg.gain.value = 9; v.connect(vg).connect(o.frequency);
        fl.type = 'lowpass'; fl.frequency.value = 2200;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 0.03); g.gain.setValueAtTime(0.05, t + 0.22); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.connect(fl).connect(g).connect(ana); o.start(t); v.start(t); o.stop(t + 0.32); v.stop(t + 0.32);
      });
    },
    yenilgi: () => { ton(220, 1.2, 'sawtooth', 0.05, 0, 150); ton(165, 1.4, 'sawtooth', 0.04, 0.3, 110); },
    mevsim: mevsimAyarla,
    acik: () => acik,
    degistir() {
      acik = !acik; try { localStorage.setItem('kurulus-ses', acik ? '1' : '0'); } catch (e) { }
      if (ana) ana.gain.value = acik ? 0.8 : 0;
      return acik;
    }
  };
  window.Ses = S;
})();
