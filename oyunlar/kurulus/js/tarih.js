/* Kuruluş 1299 — tarih çizelgesi (1299–1326).
   Kaynak: Wikipedia (Osman I, Battle of Bapheus, Siege of Bursa, Battle of Dimbos, Anatolian beyliks; tr Osman Gazi).
   Tartışmalı noktalar metinde belirtilir. ay: 0 = Ocak. */
'use strict';
window.TARIH = [
  { yil: 1299, ay: 5, baslik: 'Bilecik ve Yarhisar', kaynak: 'tr Vikipedi: Osman Gazi',
    metin: 'Kroniklere göre 1298–99\'da Bilecik bir hileyle alındı, Yarhisar da Osman Bey\'in denetimine girdi. Bilecik tekfurunun düğün tuzağı hikâyesinin ne kadar gerçek olduğu tartışmalıdır. Obanın ufkundaki kale artık sana bakıyor.',
    secim: [{ l: 'Kaleye bir elçi yolla, ticaret yolu aç', fx: { akce: 25, memnun: 3 }, c: 'Tekfurun adamları kumaş ve tuz getirdi. Pazar canlandı.' },
            { l: 'Gazilere ganimet dağıt', fx: { akce: -15, memnun: 8, nufus: 4 }, c: 'Etraftaki Türkmen aileleri obaya katıldı.' }] },
  { yil: 1300, ay: 2, baslik: 'İlk akçe', kaynak: 'tr Vikipedi: Osman Gazi (H. Yılmaz, 2018)',
    metin: 'Bir görüşe göre hicri 699/miladi 1300\'de Söğüt\'te ilk Osmanlı gümüş akçesi basıldı. Tarih ve darp yeri tartışmalıdır. Kendi parasını basan oba, artık bir beyliktir.',
    fx: { akce: 40 } },
  { yil: 1301, ay: 4, baslik: 'Yenişehir ve İznik', kaynak: 'en Wikipedia: Battle of Bapheus; tr Osman Gazi',
    metin: '1301\'de Yenişehir merkez oldu. Osmanlı akıncıları İznik\'i (Nikaia) kuşatıyor, Bursa (Prusa) çevresine akınlar yapıyor. Bizans İmparatoru II. Andronikos endişeli.',
    secim: [{ l: 'Akınları destekle: yiyecek gönder', fx: { yiyecek: -40, akce: 45 }, c: 'Akıncılar ganimetle döndü.' },
            { l: 'Obayı güçlendir, akınlara karışma', fx: { odun: 30, tas: 10 }, c: 'Yeni tarlalar açıldı, evler onarıldı.' }] },
  { yil: 1302, ay: 6, baslik: 'Koyunhisar (Bapheus) Savaşı', kaynak: 'en Wikipedia: Battle of Bapheus',
    metin: 'Yaygın görüşe göre 27 Temmuz 1302\'de (bazı tarihçilere göre 1299) Osman Bey yaklaşık 5.000 hafif süvariyle, Georgios Muzalon komutasındaki yaklaşık 2.000 kişilik Bizans ordusunu yendi. Savaşın tam yeri bilinmiyor; İzmit ile İznik arasındaki bir ova olduğu düşünülüyor. Halil İnalcık\'a göre beylik bu zaferle devlet niteliği kazandı.',
    savas: true, fx: { akce: 60, memnun: 10, nufus: 8 } },
  { yil: 1303, ay: 3, baslik: 'Dimbos', kaynak: 'en Wikipedia: Battle of Dimbos',
    metin: 'Rivayete göre 1303 baharında Bursa, Kite, Kestel, Atranos ve Ulubat tekfurları Yenişehir üzerine yürüdü ve Dimbos geçidinde yenildi. Bu savaş yalnızca sonraki dönem anlatılarından bilinir ve yarı efsanevidir.',
    fx: { akce: 30 } },
  { yil: 1308, ay: 5, baslik: 'Marmara\'ya ulaşıldı', kaynak: 'en Wikipedia: Osman I',
    metin: 'Beylik Sakarya\'ya ve Marmara Denizi kıyısına ulaştı. Ticaret yolları genişliyor.', fx: { akce: 40 } },
  { yil: 1317, ay: 4, baslik: 'Bursa kuşatması başladı', kaynak: 'en Wikipedia: Siege of Bursa',
    metin: 'Bursa (Prusa) kuşatma altında. Kaynaklara göre kuşatma altı ya da dokuz yıl sürecek. Şehre çevredeki kalelerden giden yollar tek tek kesiliyor.', fx: {} },
  { yil: 1321, ay: 5, baslik: 'Mudanya', kaynak: 'en Wikipedia: Orhan',
    metin: 'Orhan Bey Mudanya\'yı aldı. Bursa\'nın denizle bağı koptu.', fx: { akce: 30 } },
  { yil: 1324, ay: 0, baslik: 'Osman Bey\'in vefatı', kaynak: 'en Wikipedia: Osman I',
    metin: 'Osman Bey 1323 ya da 1324\'te vefat etti (tarih tartışmalı; bazı kaynaklar 1326 der). Yerine oğlu Orhan Bey geçti. Devlet devam ediyor.', fx: { memnun: -5 } },
  { yil: 1326, ay: 3, baslik: 'Bursa fethedildi', kaynak: 'en Wikipedia: Siege of Bursa',
    metin: '6 Nisan 1326\'da Orhan Bey Bursa\'ya girdi. Şehrin komutanı Saroz teslim oldu. Bursa beyliğin yeni başkenti olacak: camiler, imaretler, hamamlar ve hanlarla büyüyecek.',
    fx: { akce: 120, memnun: 15 }, son: true }
];
