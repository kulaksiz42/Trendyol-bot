/* Başbakan — haftalık ajanda, danışman, gazete ve verilen sözler. */
'use strict';
window.Ajanda = (function () {
  const V = window.VERI;
  const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
  // Ankara ve yurtdışı etkinlikleri
  const ETK = {
    kabine: { ad: 'Kabine toplantısı', ikon: '🏛️', yer: 'Ankara', iktidar: true, enerji: 15, bilgi: 'Bakanlarla ekonomiyi ve gündemi masaya yatır. Piyasaya güven verir.' },
    meclis: { ad: 'Meclis\'te grup toplantısı', ikon: '⚖️', yer: 'Ankara', enerji: 15, bilgi: 'Grup konuşması televizyondan canlı yayımlanır; tabanı coşturur, muhalefeti kızdırır.' },
    merkez: { ad: 'Genel merkez', ikon: '🏢', yer: 'Ankara', enerji: 10, bilgi: 'Teşkilatla çalış, bağış topla, il başkanlarını dinle.' },
    basin: { ad: 'Basın toplantısı', ikon: '🎤', yer: 'Ankara', enerji: 10, bilgi: 'Medyayla ilişkini düzeltir; yanlış bir söz gündemi ters çevirebilir.' },
    isdunya: { ad: 'İş dünyasıyla yemek', ikon: '💼', yer: 'İstanbul', enerji: 15, bilgi: 'Patronlar ve sanayicilerle görüş. İş dünyası ve piyasa güveni artar.' },
    bruksel: { ad: 'Brüksel ziyareti', ikon: '🇪🇺', yer: 'Brüksel', yurtdisi: true, enerji: 25, bilgi: 'AB ile ilişkiler.' },
    washington: { ad: 'Washington ziyareti', ikon: '🇺🇸', yer: 'Washington', yurtdisi: true, enerji: 25, bilgi: 'ABD ile ilişkiler.' },
    moskova: { ad: 'Moskova ziyareti', ikon: '🇷🇺', yer: 'Moskova', yurtdisi: true, enerji: 25, bilgi: 'Rusya ile ilişkiler, enerji ve turizm.' },
    korfez: { ad: 'Körfez turu', ikon: '🕋', yer: 'Körfez', yurtdisi: true, enerji: 25, bilgi: 'Orta Doğu ve Körfez ülkeleriyle ilişkiler, yatırım.' },
    dinlen: { ad: 'Dinlen', ikon: '🛌', yer: '', enerji: -25, bilgi: 'Enerjini topla. Yorgun bir lider hata yapar.' }
  };
  // şehirde yapılabilecekler
  const SEHIR_ETK = {
    miting: { ad: 'Miting', ikon: '📣', enerji: 25 },
    carsi: { ad: 'Çarşı ve esnaf', ikon: '🛍️', enerji: 15 },
    fabrika: { ad: 'Fabrika ziyareti', ikon: '🏭', enerji: 15 },
    univ: { ad: 'Üniversite', ikon: '🎓', enerji: 15 },
    acilis: { ad: 'Açılış töreni', ikon: '✂️', enerji: 15 }
  };

  let S = null, ctx = null;
  function kur(c) { ctx = c; }
  function durum(s) {
    S = s;
    S.ajanda = S.ajanda || { plan: [null, null, null, null, null], enerji: 100, hafta: 0, otomatik: false, gidildi: {} };
    S.sozler = S.sozler || [];
    return S.ajanda;
  }
  const iktidarda = () => S.iktidar;
  const bugunIndex = () => { const d = window.Sim.gunTarih(S.gun).getUTCDay(); return d >= 1 && d <= 5 ? d - 1 : -1; };

  /* ---------- etkinliğin sonucu (gün geldiğinde) ---------- */
  function uygula(p) {
    const A = S.ajanda, yorgun = A.enerji < 25 ? 0.5 : 1, Sim = window.Sim;
    if (!p) return null;
    if (p.tur === 'ankara' || p.tur === 'yurtdisi') {
      const E = ETK[p.id]; A.enerji = Math.max(0, Math.min(100, A.enerji - E.enerji));
      const et = {
        kabine: { e: { guven: 1.5 * yorgun }, i: { isd: 1 } }, meclis: { k: { muh: 0.4 * yorgun, sag: 0.2 * yorgun }, i: { medya: -0.5 } },
        merkez: iktidarda() ? { k: { muh: 0.2, sag: 0.2 } } : { e: { kasa: 0.25 * yorgun } }, basin: { i: { medya: 2 * yorgun } },
        isdunya: { i: { isd: 2.5 * yorgun }, e: iktidarda() ? { guven: 1 } : { kasa: 0.35 * yorgun } },
        bruksel: { d: { ab: 3 * yorgun } }, washington: { d: { abd: 3 * yorgun } }, moskova: { d: { rus: 3 * yorgun } }, korfez: { d: { ort: 3 * yorgun }, e: { guven: 0.5 } }, dinlen: {}
      }[p.id];
      Sim.etkiUygula(et);
      return `${E.ikon} ${E.ad}${E.yer ? ' · ' + E.yer : ''}`;
    }
    if (p.tur === 'sehir') {
      const E = SEHIR_ETK[p.akt]; A.enerji = Math.max(0, A.enerji - E.enerji);
      A.gidildi[p.il] = S.gun;
      if (p.akt === 'miting') {
        if (!S.iktidar) { S.mitingSon = -99; Sim.mitingYap(p.il); }
        else { S.ilEtki[p.il] = (S.ilEtki[p.il] || 0) + 0.8 * yorgun; S.kesim.muh.m += 0.1; }
      } else if (p.akt === 'acilis') {
        const pr = S.projeler.find(x => x.il === p.il && x.bitti && !x.acildi);
        if (pr) { pr.acildi = true; S.ilEtki[p.il] = (S.ilEtki[p.il] || 0) + 1.2 * yorgun; S.kesim.sag.m += 0.3; }
      } else {
        S.ilEtki[p.il] = (S.ilEtki[p.il] || 0) + 0.3 * yorgun;
        const k = { carsi: 'sag', fabrika: 'sag', univ: 'laik' }[p.akt]; S.kesim[k].m += 0.1 * yorgun;
      }
      return `${E.ikon} ${p.il} · ${E.ad}`;
    }
    return null;
  }

  /* ---------- danışmanın önerisi ---------- */
  function oneri() {
    const Sim = window.Sim, a = Sim.anketHesap().iller, plan = [];
    // sözü verilip yatırımı bekleyen ve uzun süredir gidilmeyen büyük iller
    const iller = Object.values(Sim.IL).map(il => ({ ad: il.ad, puan: il.secmen / 1e5 * (S.iktidar ? 1 : (S.teskilat[Sim.BOLGE_IL[il.ad]] !== undefined ? 1.3 : 0.6)) + Math.min(10, (S.gun - (S.ajanda.gidildi[il.ad] || -999)) / 60) - Math.abs(a[il.ad].akp - 40) / 10 }))
      .sort((x, y) => y.puan - x.puan);
    const bitmis = S.projeler.find(p => p.bitti && !p.acildi);
    if (S.iktidar) {
      plan.push({ tur: 'ankara', id: 'kabine' });
      plan.push(bitmis ? { tur: 'sehir', il: bitmis.il, akt: 'acilis' } : { tur: 'sehir', il: iller[0].ad, akt: 'carsi' });
      plan.push({ tur: 'ankara', id: 'meclis' });
      plan.push({ tur: 'sehir', il: iller[1].ad, akt: S.ajanda.enerji > 50 ? 'miting' : 'fabrika' });
      const dis = Object.entries(S.dis).sort((x, y) => x[1] - y[1])[0][0];
      plan.push(S.ajanda.enerji < 40 ? { tur: 'ankara', id: 'dinlen' } : { tur: 'yurtdisi', id: { ab: 'bruksel', abd: 'washington', rus: 'moskova', ort: 'korfez' }[dis] });
    } else {
      plan.push({ tur: 'ankara', id: 'merkez' });
      plan.push({ tur: 'sehir', il: iller[0].ad, akt: 'miting' });
      plan.push({ tur: 'ankara', id: 'isdunya' });
      plan.push({ tur: 'sehir', il: iller[1].ad, akt: 'carsi' });
      plan.push(S.ajanda.enerji < 40 ? { tur: 'ankara', id: 'dinlen' } : { tur: 'sehir', il: iller[2].ad, akt: 'carsi' });
    }
    return plan;
  }

  /* ---------- sözler ---------- */
  function sozVer(il, tip, metin) {
    if (S.sozler.some(s => s.il === il && s.tip === tip && s.durum === 'bekliyor')) return;
    S.sozler.push({ il, tip, metin, gun: S.gun, son: S.gun + (tip === 'enflasyon' ? 1460 : 730), durum: 'bekliyor' });
  }
  // her ay kontrol: tutulan ve tutulmayan sözler
  function sozKontrol() {
    const sonuc = [];
    S.sozler.forEach(s => {
      if (s.durum !== 'bekliyor') return;
      const yapildi = s.tip === 'enflasyon' ? S.eko.enf < 10 : S.projeler.some(p => p.il === s.il && p.tip === s.tip);
      if (yapildi) { s.durum = 'tutuldu'; S.ilEtki[s.il] = (S.ilEtki[s.il] || 0) + 1.5; sonuc.push(`✅ ${s.il}: "${s.metin}" sözü tutuldu`); }
      else if (S.gun > s.son) { s.durum = 'tutulmadı'; S.ilEtki[s.il] = (S.ilEtki[s.il] || 0) - 2; S.kesim.sag.m -= 0.4; sonuc.push(`❌ ${s.il}: "${s.metin}" sözü tutulmadı`); }
    });
    return sonuc;
  }

  /* ---------- danışman ve gazete ---------- */
  const DANISMAN = { ad: 'Selim Aydın', rol: 'Başdanışman' };
  const danismanYuz = () => `<svg class="yuz" viewBox="0 0 46 46"><circle cx="23" cy="23" r="23" fill="#b9c7d6"/><circle cx="23" cy="19" r="9" fill="#e8c5a0"/><path d="M14 17c1-7 17-7 18 0-3-3-15-3-18 0z" fill="#5a4636"/><rect x="18" y="18" width="4" height="2.5" rx="1" fill="none" stroke="#333" stroke-width="1"/><rect x="24" y="18" width="4" height="2.5" rx="1" fill="none" stroke="#333" stroke-width="1"/><path d="M9 46c1-10 7-14 14-14s13 4 14 14z" fill="#2b3a4c"/><path d="M21 32l2 8 2-8z" fill="#b51c2c"/></svg>`;
  function brifing(onceki) {
    const Sim = window.Sim, a = Sim.anketHesap(), sat = [];
    const fark = S.anket - (onceki || S.anket);
    if (Math.abs(fark) >= 0.2) {
      const r = Sim.refah(), neden = r < -1 ? 'ekonomideki sıkıntı' : r > 1 ? 'ekonomideki iyi gidiş' : 'gündemdeki kararların';
      sat.push(`Anket geçen haftaya göre ${fark > 0 ? 'yükseldi' : 'düştü'}: ${fark > 0 ? '+' : ''}${fark.toFixed(1).replace('.', ',')} puan. Bunun ana sebebi ${neden}.`);
    } else sat.push(`Anket yerinde sayıyor: %${S.anket.toFixed(1).replace('.', ',')}.`);
    const sonraki = V.OLAY.find(o => o.tur === 'secim' && !S.bitti.includes(o.id) && (!o.kosul || o.kosul(S)) && o.t >= Sim.iso(Sim.gunTarih(S.gun)));
    if (sonraki) { const g = Sim.tarihGun(sonraki.t) - S.gun; sat.push(`${sonraki.baslik} ${g < 60 ? g + ' gün' : Math.round(g / 30) + ' ay'} sonra. ${sonraki.secim === 'yerel' ? 'Büyük şehirler kritik.' : sonraki.secim === 'ref' ? 'Evet oyu için %50 lazım.' : 'Tek başına iktidar için 276 sandalye, sonra 301 lazım.'}`); }
    else if (!S.iktidar) sat.push('Seçim tarihi henüz belli değil; olağan seçim 2004\'te. Teşkilatı tamamlamak için vaktimiz var.');
    if (!S.iktidar) {
      const eksik = Object.entries(V.BOLGE).filter(([k]) => S.teskilat[k] === undefined).map(([, b]) => b.ad);
      if (eksik.length) sat.push(`Teşkilatımız olmayan bölgeler: ${eksik.join(', ')}. Oralarda oy kaybediyoruz. Kasa: $${S.kasa.toFixed(1).replace('.', ',')} milyon.`);
    } else {
      const zayif = Object.entries(a.iller).filter(([il]) => Sim.IL[il].secmen > 500000).sort((x, y) => x[1].akp - y[1].akp)[0];
      if (zayif) sat.push(`Büyük şehirler arasında en zayıf olduğumuz yer ${zayif[0]} (%${zayif[1].akp.toFixed(0)}). Gidip insanlarla konuşmak iyi olur.`);
      if (S.eko.enf > 20) sat.push(`Enflasyon %${S.eko.enf.toFixed(0)}. Çarşıda en çok bunu konuşuyorlar.`);
    }
    const bekleyen = S.sozler.filter(s => s.durum === 'bekliyor');
    if (bekleyen.length) sat.push(`Verdiğin ${bekleyen.length} söz bekliyor. En yakını: ${bekleyen.sort((x, y) => x.son - y.son)[0].il} — "${bekleyen[0].metin}".`);
    if (S.ajanda.enerji < 30) sat.push('Çok yoruldun. Bu hafta bir gün dinlenmeni öneririm.');
    if ((S.masa || []).length) sat.push(`Masanda ${S.masa.length} dosya karar bekliyor.`);
    return sat;
  }
  function gazete(log) {
    const Sim = window.Sim, t = Sim.gunTarih(S.gun), e = S.eko;
    const ad = S.ad, unvan = S.iktidar ? (S.b.cb ? 'Cumhurbaşkanı' : 'Başbakan') : 'Genel Başkan';
    const cevir = m => { const x = m.match(/^(.+?) · (Miting|Çarşı ve esnaf|Fabrika ziyareti|Üniversite|Açılış töreni)/); if (!x) return m.replace(/^[^A-Za-zÇĞİÖŞÜçğıöşü0-9"]+/, ''); return { 'Miting': `${unvan} ${ad}, ${x[1]}'da on binlere seslendi`, 'Çarşı ve esnaf': `${ad} ${x[1]} çarşısında esnafı dinledi`, 'Fabrika ziyareti': `${ad} ${x[1]}'da fabrika işçileriyle buluştu`, 'Üniversite': `${ad} ${x[1]}'da öğrencilerle tartıştı`, 'Açılış töreni': `${x[1]}'da açılış: ${ad} kurdeleyi kesti` }[x[2]]; };
    const onem = m => /^(🔴|✍️|🗳️|✅|❌|💰|👷)/.test(m) ? 0 : /Miting|Açılış/.test(m) ? 1 : 2;
    const man = log.slice().sort((a, b) => onem(a) - onem(b)).slice(0, 4).map(cevir);
    const kur = S.b.ytl ? e.kur.toFixed(2).replace('.', ',') : Math.round(e.kur * 1e6).toLocaleString('tr-TR');
    return `<div class="gazete"><div class="gz-ust"><b>GÜNDEM</b><span>${t.getUTCDate()} ${V.AYLAR[t.getUTCMonth()]} ${t.getUTCFullYear()} · ${GUNLER[0]}</span></div>
      ${man.length ? `<h2>${esc(man[0])}</h2>${man.slice(1).map(m => `<p class="gz-alt">• ${esc(m)}</p>`).join('')}` : '<h2>Ankara\'da sakin bir hafta</h2>'}
      <div class="gz-kutu"><span>Anket <b>%${S.anket.toFixed(1).replace('.', ',')}</b></span><span>Enflasyon <b>%${e.enf.toFixed(1).replace('.', ',')}</b></span><span>Dolar <b>${kur}</b></span></div></div>`;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- planlama ekranı ---------- */
  function aciklama(p) {
    if (!p) return '<span class="bos">Boş — dokun, bir şey seç</span>';
    if (p.tur === 'sehir') { const E = SEHIR_ETK[p.akt]; return `<b>${E.ikon} ${esc(p.il)}</b><small>${E.ad}</small>`; }
    const E = ETK[p.id]; return `<b>${E.ikon} ${E.ad}</b><small>${E.yer || ''}</small>`;
  }
  function planEkrani(el, cb) {
    const A = S.ajanda;
    el.innerHTML = `<div class="ajanda"><div class="aj-ust"><b>Bu haftanın ajandası</b><span>Enerji ${Math.round(A.enerji)}<i style="width:${A.enerji}%"></i></span></div>
      ${GUNLER.map((g, i) => `<button class="aj-gun" data-g="${i}"><span class="gn">${g}</span><span class="ak">${aciklama(A.plan[i])}</span></button>`).join('')}
      <div class="aj-alt"><button class="btn ikincil" id="ajOner">🧑‍💼 Danışman doldursun</button><button class="btn" id="ajBasla">▶ Haftayı başlat</button></div>
      <label class="aj-oto"><input type="checkbox" id="ajOto" ${A.otomatik ? 'checked' : ''}> Şehir ziyaretlerini otomatik geç (şehre girmeden)</label></div>`;
    el.querySelectorAll('[data-g]').forEach(b => b.onclick = () => secimEkrani(el, +b.dataset.g, () => planEkrani(el, cb)));
    el.querySelector('#ajOner').onclick = () => { A.plan = oneri(); planEkrani(el, cb); };
    el.querySelector('#ajOto').onchange = e => { A.otomatik = e.target.checked; };
    el.querySelector('#ajBasla').onclick = () => { if (A.plan.every(p => !p)) A.plan = oneri(); cb(); };
  }
  function secimEkrani(el, g, geri) {
    const A = S.ajanda, Sim = window.Sim;
    const buyuk = Object.values(Sim.IL).sort((a, b) => b.secmen - a.secmen).slice(0, 24).map(i => i.ad);
    const bitmis = S.projeler.filter(p => p.bitti && !p.acildi).map(p => p.il);
    el.innerHTML = `<div class="ajanda"><div class="aj-ust"><b>${GUNLER[g]}</b><button class="aj-geri">← Geri</button></div>
      <div class="baslik2">Ankara</div><div class="aj-sec">${['kabine', 'meclis', 'merkez', 'basin', 'isdunya', 'dinlen'].filter(k => !ETK[k].iktidar || S.iktidar).map(k => `<button data-e="${k}"><b>${ETK[k].ikon} ${ETK[k].ad}</b><small>${ETK[k].bilgi}</small></button>`).join('')}</div>
      <div class="baslik2">Şehir ziyareti</div>
      <div class="aj-akt">${Object.entries(SEHIR_ETK).filter(([k]) => k !== 'acilis' || bitmis.length).map(([k, E], i) => `<button data-akt="${k}" aria-pressed="${i === 0}">${E.ikon} ${E.ad}</button>`).join('')}</div>
      <div class="aj-iller">${(bitmis.length ? [...new Set(bitmis)] : []).map(il => `<button data-il="${il}" class="acilisli">✂️ ${il}</button>`).join('')}${buyuk.map(il => `<button data-il="${il}">${il}${A.gidildi[il] ? '' : ' •'}</button>`).join('')}</div>
      <p class="kucuk">• hiç gitmediğin şehir · Diğer iller için haritada bir ile dokunup "Ajandaya ekle" diyebilirsin.</p>
      ${S.iktidar ? `<div class="baslik2">Yurtdışı</div><div class="aj-sec">${['bruksel', 'washington', 'moskova', 'korfez'].map(k => `<button data-e="${k}"><b>${ETK[k].ikon} ${ETK[k].ad}</b><small>${ETK[k].bilgi}</small></button>`).join('')}</div>` : ''}
      <button class="btn ikincil" id="ajSil" style="margin-top:10px">Bu günü boşalt</button></div>`;
    let akt = 'miting';
    el.querySelector('.aj-geri').onclick = geri;
    el.querySelectorAll('[data-akt]').forEach(b => b.onclick = () => { akt = b.dataset.akt; el.querySelectorAll('[data-akt]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    el.querySelectorAll('[data-e]').forEach(b => b.onclick = () => { A.plan[g] = { tur: ETK[b.dataset.e].yurtdisi ? 'yurtdisi' : 'ankara', id: b.dataset.e }; geri(); });
    el.querySelectorAll('[data-il]').forEach(b => b.onclick = () => { A.plan[g] = { tur: 'sehir', il: b.dataset.il, akt: b.classList.contains('acilisli') ? 'acilis' : akt }; geri(); });
    el.querySelector('#ajSil').onclick = () => { A.plan[g] = null; geri(); };
  }
  function ileEkle(il) {
    const A = S.ajanda, i = A.plan.findIndex(p => !p);
    A.plan[i < 0 ? 4 : i] = { tur: 'sehir', il, akt: S.iktidar ? 'carsi' : 'miting' };
    return i < 0 ? 4 : i;
  }

  return { kur, durum, uygula, oneri, sozVer, sozKontrol, brifing, gazete, planEkrani, ileEkle, bugunIndex, DANISMAN, danismanYuz, GUNLER, SEHIR_ETK, ETK };
})();
