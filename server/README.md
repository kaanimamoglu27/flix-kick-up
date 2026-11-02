# Flix Kick Up online sunucusu

Gerçek zamanlı 1'e 1 online maç için hafif bir Node.js sunucusu: tek bağımlılık `ws`, veritabanı yok, hesap yok. Oyuncular yalnızca bir isimle (oyundaki "ADIN" alanı) oynar.

## Çalıştırma
```bash
cd server
npm install
npm start          # http://localhost:8080/health ve ws://localhost:8080/ws
npm test           # 17 uçtan uca test (oda, kuyruk, maç, beraberlik, ayrılma, yeniden bağlanma, rematch, anti-cheat)
```
Oyunu tarayıcıda yerel sunucuyla denemek için: oyunu `http://localhost:...` üzerinden aç (otomatik olarak `DEV_SERVER_URL` kullanılır) ya da herhangi bir adrese `?online=ws://localhost:8080/ws` ekle.

## Ortam değişkenleri
| Değişken | Varsayılan | Ne işe yarar |
|---|---|---|
| `PORT` | 8080 | Render bunu kendisi verir |
| `ALLOWED_ORIGINS` | `*` | WebSocket'e izin verilen sayfa adresleri, virgülle. Uygulama: `capacitor://localhost`, web: `https://kaanimamoglu27.github.io` |
| `MATCH_MS` | 60000 | Maç süresi |
| `COUNTDOWN_MS` | 3000 | 3-2-1 geri sayım |
| `RECONNECT_GRACE_MS` | 20000 | Kopan oyuncunun yerini tutma süresi; dolarsa maç rakibe verilir |
| `SCORE_BURST` / `SCORE_PER_SEC` | 2000 / 300 | Skor tek seferde en fazla 2000, sonra saniyede 300 artabilir; fazlası kırpılır |
| `MAX_MSG_PER_SEC` | 40 | Bağlantı başına mesaj sınırı (fazlası atılır, 5 katı bağlantıyı keser) |
| `LOG_LEVEL` | info | `silent` ile log kapanır |

## Render'a deploy
1. Repo kökündeki `render.yaml` hazır: Render > **New > Blueprint** > bu repoyu seç > Apply. (Elle: New > Web Service, Root Directory `server`, Build `npm ci --omit=dev`, Start `npm start`, Health Check Path `/health`.)
2. Deploy bitince adres `https://<servis-adı>.onrender.com` olur. `https://<servis-adı>.onrender.com/health` `{"ok":true,...}` döndürmeli.
3. Oyundaki adres: `wss://<servis-adı>.onrender.com/ws` (https değil **wss**, sonunda **/ws**). Bunu repo kökündeki `online-config.js` içine `ONLINE_SERVER_URL` olarak yaz (ya da GitHub'da `KICKUP_ONLINE_SERVER_URL` değişkeni, aşağıya bak).
4. Ücretsiz plan 15 dakika boşta kalınca uyur; ilk oyuncu ~1 dakika bekler ve "Sunucuya ulaşılamadı" görebilir. App Store sürümü için **Starter** plan önerilir. Sunucu tek kopya çalışmalı (odalar bellekte tutulur, birden fazla instance açma).

## Mimari
- `src/index.js`: HTTP (`/health`) + WebSocket (`/ws`), origin kontrolü, mesaj sınırı, 15 sn'de bir ping ile ölü bağlantıları kapatma.
- `src/game.js`: bütün kararlar burada. Oda kodu (6 hane, benzersiz), hızlı eşleşme kuyruğu, hazır durumu, geri sayım, başlangıç/bitiş zamanı, kazanan, rematch, yeniden bağlanma süresi, skor kontrolü.
- İstemci yalnızca kendi skorunu gönderir. Sunucu skoru maç başlamadan ve bittikten sonra kabul etmez, negatif/bozuk değeri atar, skor düşemez, aşırı hızlı artışı kırpar.

### Mesajlar
İstemci → sunucu: `hello {name, token?}`, `ping {c}`, `name {name}`, `quick`, `cancel`, `create`, `join {code}`, `ready {ready}`, `score {score}`, `rematch`, `leave`
Sunucu → istemci: `welcome {id, token, resumed, now}`, `pong`, `room {code, quick, state, players[...]}`, `queued`, `unqueued`, `countdown {startAt, endAt, seed, now}`, `score {id, score}`, `end {reason, winner, draw, players[...]}`, `opponent_left {reason, room?}`, `left`, `error {code}`

Oda durumları: `lobby` → `countdown` → `playing` → `finished` (→ ikisi de rematch derse yeniden `countdown`).
