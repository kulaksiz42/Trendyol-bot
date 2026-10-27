# 3D varlıklar

| Dosya | Kaynak | Lisans |
|---|---|---|
| `govde_a.glb`, `govde_b.glb` | Quaternius, *Universal Base Characters* (Standard) | CC0 1.0 |
| `saclar.glb` | Quaternius, *Universal Base Characters* (Standard), saç modelleri | CC0 1.0 |
| `animasyon.glb` | Quaternius, *Universal Animation Library* (Standard) | CC0 1.0 |

- https://quaternius.itch.io/universal-base-characters
- https://quaternius.itch.io/universal-animation-library

CC0 kaynak göstermeyi zorunlu tutmaz; yine de yapımcıya teşekkür olarak burada duruyor.

## Dönüştürme

Orijinal glTF dosyaları web için küçültüldü:

- Dokular WebP'ye çevrildi. Renk dokusu 1024, normal dokusu 512, pürüzlülük dokusu 256 piksel.
- Animasyonlardan sadece oyunda kullanılan 11 tanesi tutuldu. Parmak kanalları ve pelvis dışındaki konum kanalları çıkarıldı.
- Saç modelleri tek dosyada birleştirildi.

Paketin ücretsiz sürümündeki temel bedenler iç çamaşırıyla gelir. Oyunda herkes giyinik görünür: kıyafetler `js/model.js` içindeki gölgelendiriciyle bedenin üstüne boyanır, gövdenin önü bol kıyafet görünümü için düzleştirilir.
