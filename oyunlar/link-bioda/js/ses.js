/* Link Bio'da — kodla üretilen ses efektleri (Web Audio). Dosya yok. */
'use strict';
window.Ses = (function () {
  let ac = null, ana = null, acik = true;
  try { acik = localStorage.getItem('lbd-ses') !== '0'; } catch (e) { }
  function hazirla() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ac = new AC(); ana = ac.createGain(); ana.gain.value = 0.5; ana.connect(ac.destination);
    return true;
  }
  function ton(frek, sure, tip = 'sine', ses = 0.3, gecikme = 0, kayma = 0) {
    if (!acik || !hazirla()) return;
    const t = ac.currentTime + gecikme;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = tip; o.frequency.setValueAtTime(frek, t);
    if (kayma) o.frequency.exponentialRampToValueAtTime(Math.max(30, frek + kayma), t + sure);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(ses, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    o.connect(g); g.connect(ana); o.start(t); o.stop(t + sure + 0.05);
  }
  function gurultu(sure, ses = 0.2, gecikme = 0, filtre = 800) {
    if (!acik || !hazirla()) return;
    const t = ac.currentTime + gecikme, n = Math.floor(ac.sampleRate * sure);
    const b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    f.type = 'lowpass'; f.frequency.value = filtre; g.gain.value = ses;
    s.buffer = b; s.connect(f); f.connect(g); g.connect(ana); s.start(t);
  }
  return {
    hazirla,
    get acik() { return acik; },
    degistir() { acik = !acik; try { localStorage.setItem('lbd-ses', acik ? '1' : '0'); } catch (e) { } if (acik) hazirla(); return acik; },
    tik() { ton(900, 0.05, 'square', 0.08); },
    istek() { ton(660, 0.08, 'triangle', 0.18); ton(990, 0.1, 'triangle', 0.15, 0.07); },
    bahsis() { ton(1318, 0.18, 'sine', 0.25); ton(1760, 0.3, 'sine', 0.2, 0.08); },
    abone() { [523, 659, 784, 1046].forEach((f, i) => ton(f, 0.15, 'triangle', 0.18, i * 0.07)); },
    kacti() { ton(300, 0.25, 'sawtooth', 0.12, 0, -140); },
    tehlike() { ton(880, 0.12, 'square', 0.14); ton(660, 0.12, 'square', 0.14, 0.14); ton(880, 0.12, 'square', 0.14, 0.28); },
    kapi() { [0, 0.18, 0.36].forEach(g => gurultu(0.09, 0.6, g, 300)); },
    miyav() { ton(700, 0.35, 'sawtooth', 0.08, 0, 300); ton(1000, 0.25, 'sine', 0.06, 0.12, -400); },
    matkap() { ton(180, 1.5, 'sawtooth', 0.05, 0, 40); },
    bildirim() { ton(1200, 0.07, 'sine', 0.2); ton(1500, 0.12, 'sine', 0.18, 0.08); },
    kasa() { gurultu(0.05, 0.3, 0, 3000); ton(2093, 0.4, 'sine', 0.2, 0.05); ton(2637, 0.5, 'sine', 0.15, 0.1); },
    basari() { [392, 523, 659, 784].forEach((f, i) => ton(f, 0.25, 'triangle', 0.16, i * 0.1)); }
  };
})();
