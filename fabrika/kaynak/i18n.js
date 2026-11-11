// Flix Fabrika · language (Türkçe / English). The game is written in Turkish; in English mode every
// visible text (DOM, toasts, panels and canvas text on 3D signs) is translated with this table.
export const LANG = (() => { try { const s = localStorage.getItem('flix_fab_lang'); if (s) return s; } catch {} return (navigator.language || 'tr').toLowerCase().startsWith('tr') ? 'tr' : 'en'; })();
export function setLang(l) { try { localStorage.setItem('flix_fab_lang', l); } catch {} location.reload(); }
const EN = {
  'Oyuncak treni': 'Toy train', 'Mağazada tur atar · müşteri +%15': 'Loops around the store · customers +15%',
  'C Blok': 'Block C', 'FLIX Mağazası açılır · alan sağa büyür': 'FLIX Store opens · area grows right', '6. Kasa': '6th Register', '7. Kasa': '7th Register', 'Mağaza kasası · müşteri +%20': 'Store register · customers +20%',
  'Elmas hindi': 'Diamond turkey', 'Elmas': 'Diamond', 'Gökkuşağı hindi': 'Rainbow turkey', 'FLIX Müzesi': 'FLIX Museum', 'Tüm satışlar +%15': 'All sales +15%', '5. Montaj': '5th Assembly', 'Üretim +%25': 'Production +25%',
  'Şov stadyumu': 'Show stadium', 'Şovda 2 kat para · daha büyük coşku': 'Show pays 2x · bigger hype', 'Müşteri +%15': 'Customers +15%', 'Dev FLIX Anıtı': 'Giant FLIX Monument', 'Tüm satışlar +%25 · büyük kutlama': 'All sales +25% · big celebration',
  'FLIX MAĞAZASI': 'FLIX STORE', 'FLIX MÜZESİ': 'FLIX MUSEUM', 'ŞOV STADYUMU': 'SHOW STADIUM', 'Elmas FLIX': 'Diamond FLIX', 'Gökkuşağı FLIX': 'Rainbow FLIX',
  'Oyna': 'Play', 'OYUN PARKI': 'PLAYGROUND', 'FLIX TOP': 'FLIX BALL', 'KASA': 'CASHIER',
  // menu / hud
  'OYNA': 'PLAY', 'DEVAM': 'CONTINUE', 'Ayarlar': 'Settings', 'Dolap': 'Wardrobe', 'Mağaza': 'Shop', 'Bonus': 'Boost', 'Tamam': 'OK', 'Hayır': 'No', '▶ İzle': '▶ Watch',
  'Bir FLIX TOYS oyunu': 'A FLIX TOYS game', 'Hindi çiftliğinden oyuncakçıya FLIX üret': 'Make FLIX from turkey farm to toy shop', 'Parmağını sürükleyerek yürü': 'Drag your finger to walk',
  'HEMEN İNDİR': 'GET IT NOW', 'HEMEN OYNA': 'PLAY NOW', "APP STORE’DA": 'ON APP STORE', '🧪 ENDGAME TEST MODU': '🧪 ENDGAME TEST MODE', 'Flix Fabrika': 'Flix Factory', 'FLIX FABRİKA': 'FLIX FACTORY',
  'Bonus yok': 'No boost', 'aktif': 'active', 'DOLU': 'FULL', 'SİPARİŞ': 'ORDER', 'PATRON SV': 'BOSS LV', 'EN İYİ': 'BEST', 'POPÜLER': 'POPULAR', 'ÖDÜLLÜ REKLAM': 'REWARDED AD',
  // tutorial & toasts
  'Hindiden tüy al': 'Take feathers from the turkey', 'Makineden FLIX tabanı al': 'Take a FLIX base from the machine', 'Standa git: kur, kutula ve test et': 'Go to the stand: build, box and test',
  'Müşteri alsın, parayı topla': 'Let a customer buy, collect the cash', 'Harika! Parayla atölyeni büyüt · +10 💎': 'Great! Grow your workshop with the money · +10 💎', 'Kuruldu · kutulandı': 'Built · boxed',
  'Para yetmiyor': 'Not enough money', 'Elmas yetmiyor, mağazaya bak': 'Not enough gems, check the shop', 'Reklam şu an yok, biraz sonra dene': 'No ad right now, try again soon',
  'Reklamlar kapandı, teşekkürler!': 'Ads removed, thank you!', 'Başlangıç paketi eklendi!': 'Starter pack added!', 'Satın alma tamamlanmadı': 'Purchase not completed', 'Satın alımlar geri yüklendi': 'Purchases restored',
  'Geri yüklenecek satın alım yok': 'Nothing to restore', 'Mağazaya ulaşılamadı': 'Could not reach the store', 'Kazanç alındı': 'Earnings collected', '2 kat kazanç alındı!': 'Double earnings collected!',
  'Kamyon oyuncakçılara yola çıktı!': 'The truck left for the toy shops!', 'Kamyon döndü: ₺': 'Truck is back: ₺', 'Sipariş tamam! +₺': 'Order done! +₺', 'VIP Fabrika: satışlar 2 kat!': 'VIP Factory: sales x2!',
  'Biraz bekle: ': 'Wait a bit: ', 'ücretsiz yükseldi!': 'upgraded for free!', 'işe başladı!': 'started working!', 'açıldı!': 'unlocked!', 'alındı': 'bought', 'kazandın!': 'earned!',
  'Halkan ve boyun büyüdü': 'your ring and size grew', 'Yeni süsleme geldi': 'New decoration arrived', 'Fabrika seviye': 'Factory level', 'Sen yokken elemanların çalıştı': 'Your crew worked while you were away',
  'dakika · fabrika kazancı': 'minutes · factory earnings', 'Normal oyuna dönülsün mü?': 'Back to the normal game?', 'Endgame kaydı saklanır.': 'The Endgame save is kept.', 'Endgame test modu': 'Endgame test mode',
  'Her şey açık, geliştirmeler orta seviyede, sakin tempo. Normal kaydın ayrı saklanır.': 'Everything open, mid-level upgrades, calm pace. Your normal save is kept separately.', 'Endgame modunu aç': 'Open Endgame mode', 'Normal oyuna dön': 'Back to normal game',
  'Bu web sürümünde gerçek ödeme yok. Demo olarak eklensin mi?': 'This web version has no real payments. Add it as a demo?', 'Demo olarak al': 'Get as demo', 'Web sürümü: ödemeler demo': 'Web version: payments are demo',
  'Satın alımları geri yükle': 'Restore purchases', '🔊 Ses açık': '🔊 Sound on', '🔇 Ses kapalı': '🔇 Sound off', '🏠 Ana menüye dön': '🏠 Main menu', '↩ Normal oyuna dön': '↩ Back to normal game', '🧪 Endgame modu (test)': '🧪 Endgame mode (test)',
  'Reklam izle, boost al!': 'Watch an ad, get a boost!', 'reklam izle, boost al': 'watch an ad, get a boost', 'Reklam izle': 'Watch ad', 'Reklam': 'Ad', 'Bugünlük bitti': 'Done for today', 'sonra': 'later', 'Bugün': 'Today', 'hak': 'left', 'İZLE': 'WATCH',
  'Bonuslar üst üste eklenir. Elmasları mağazadan alabilirsin.': 'Boosts stack. You can get gems in the shop.', 'Eleman geliştirmeleri ilk taşıyıcıyı alınca açılır.': 'Crew upgrades open after hiring the first carrier.',
  'Kâr, Reklam ve Sipariş primi sınırsız yükselir. Her 6 seviyede ofis rafına bir kupa gelir.': 'Profit, Ads and Order bonus have no limit. Every 6 levels a trophy goes on the office shelf.',
  'Tüm taşıyıcılar bunu giyer. ': 'All carriers wear this. ', 'Giydiklerinden gelen toplam bonus:': 'Total bonus from what you wear:', 'yok': 'none', 'DİĞER FLIX OYUNLARI': 'OTHER FLIX GAMES',
  'Bonuslu kostümler ve süreli bonuslar için': 'For bonus outfits and timed boosts', 'ALINDI': 'OWNED', 'TAMAM': 'MAX', 'İşe al': 'Hire', 'Ücretsiz': 'Free', 'GİY': 'WEAR', 'GİYİLİ': 'WORN', '▶ 2 katı al': '▶ Get x2',
  'en üst seviye': 'max level', 'Sahne hazırlanıyor': 'Stage resetting', 'DOKUN, FLIX DÜŞMESİN!': 'TAP, KEEP THE FLIX UP!', 'MÜKEMMEL!': 'PERFECT!', 'sektirme': 'kicks', 'Hype': 'Hype',
  // panels / groups / tabs
  'Patron': 'Boss', 'Fabrika': 'Factory', 'Eleman': 'Crew', 'Kostüm': 'Outfit', 'Aksesuar': 'Accessory', 'Zemin': 'Floor', 'E. şapka': 'Crew hat', 'GELİŞTİR': 'UPGRADE', 'ELEMAN': 'CREW', 'DOLAP': 'WARDROBE',
  'Çırak': 'Apprentice', 'Usta': 'Master', 'Şef': 'Chief', 'Efsane': 'Legend', 'ÇIRAK': 'APPRENTICE', 'USTA': 'MASTER', 'ŞEF': 'CHIEF', 'PATRON': 'BOSS', 'EFSANE': 'LEGEND',
  'hız': 'speed', 'taşıma': 'carry', 'kâr': 'profit', 'kupa': 'trophies', 'sipariş': 'orders', 'parça': 'items', 'eleman taşıma': 'crew carry', '% eleman hızı': '% crew speed',
  // pads
  '2. hindi': '2nd turkey', '3. hindi': '3rd turkey', 'Atölye avlusu': 'Workshop yard', 'Montaj masası': 'Assembly table', 'Depo kanadı': 'Storage wing', 'Büyük pres': 'Big press', 'Fabrika binası': 'Factory building',
  'Hindi çiftliği': 'Turkey farm', 'Oyun parkı': 'Playground', 'Şov sahnesi': 'Show stage', 'Ofis': 'Office', 'Mavi hindi': 'Blue turkey', 'Mısır ambarı': 'Corn silo', 'İşe alım': 'Hiring', '2. Montaj': '2nd Assembly',
  'Geri dönüşüm': 'Recycling', 'Yeşil hindi': 'Green turkey', '2. Kasa': '2nd Register', 'Tüy bandı': 'Feather belt', 'Yeni salon': 'New hall', 'Kamyon': 'Truck', 'Sarı hindi': 'Yellow turkey', 'FLIX Top hattı': 'FLIX Ball line',
  '3. Kasa': '3rd Register', 'Hindi sürüsü': 'Turkey flock', 'Peluş atölyesi': 'Plush workshop', 'Tüy toplayıcı': 'Feather collector', '3. Montaj': '3rd Assembly', 'Konveyör': 'Conveyor', 'Kırmızı hindi': 'Red turkey',
  'Büyük çiftlik': 'Big farm', 'Hediye paketi': 'Gift pack', '4. Kasa': '4th Register', 'B Blok': 'Block B', '4. Montaj': '4th Assembly', '2. Pres': '2nd Press', 'Mor hindi': 'Purple turkey', '5. Kasa': '5th Register',
  'Robot garajı': 'Robot garage', 'Altın hindi': 'Golden turkey',
  'Tüy 2 katı': 'Feathers x2', 'Avlu büyür · montaj yeri açılır': 'Yard grows · assembly spot opens', 'Robot kol FLIX kurar': 'Robot arm builds FLIX', 'Kümeste 3 hindi': '3 turkeys in the coop', 'Alan sola büyür · dolap': 'Area grows left · wardrobe',
  'Taban üretimi hızlanır': 'Faster base production', 'Duvarlar yükselir · çiftlik kapısı': 'Walls go up · farm gate', '4 hindi · tüy sandığı': '4 turkeys · feather crate', '3 çocuk FLIX test eder': '3 kids test FLIX',
  'Sektirme şovu: kalabalık para atar': 'Kick-up show: the crowd throws money', 'Geliştirmeler açılır': 'Upgrades open', 'FLIX değeri 5 → 8': 'FLIX value 5 → 8', 'Hindileri besle: tüy 2 kat hızlı': 'Feed turkeys: feathers 2x faster',
  'Eleman al, iş yürüsün': 'Hire crew, keep it moving', 'Üretim 2 katı': 'Production x2', 'Hatalılar anahtarlık olur': 'Faulty ones become keychains', 'FLIX değeri': 'FLIX value', 'Müşteri 2 katı': 'Customers x2',
  'Tüy ve taban masaya akar': 'Feathers and bases flow to the table', '+%10 satış · +1 müşteri': '+10% sales · +1 customer', 'Toplu satış 1,5 kat': 'Bulk sale x1.5', 'Yeni ürün: FLIX Top': 'New product: FLIX Ball',
  'Müşteri +%50': 'Customers +50%', 'Müşteri +%33': 'Customers +33%', 'Müşteri +%25': 'Customers +25%', '+6 hindi · 2 kat tüy': '+6 turkeys · 2x feathers', 'Yeni ürün: Peluş FLIX': 'New product: Plush FLIX', '2 robot tüy toplar': '2 robots collect feathers',
  'Üretim +%50': 'Production +50%', 'Üretim +%33': 'Production +33%', 'Montaj kendi teste gider': 'Assembly goes to testing by itself', '+8 hindi · 2. tüy sandığı': '+8 turkeys · 2nd feather crate', '3 FLIX = 1,6 kat set': '3 FLIX = x1.6 set',
  'Fabrika sola büyür': 'Factory grows left', 'Taban üretimi 2 katı': 'Base production x2', '+3 robot · hızlı toplama': '+3 robots · faster collecting',
  // upgrades / staff
  'Yürüme hızı': 'Walk speed', 'Taşıma kapasitesi': 'Carry capacity', 'Kâr': 'Profit', 'Pres hızı': 'Press speed', 'Montaj hızı': 'Assembly speed', 'Kümes verimi': 'Coop output', 'Tüy bandı hızı': 'Feather belt speed',
  'Oyun parkı (3 çocuk)': 'Playground (3 kids)', 'Tezgâh rafı': 'Counter shelf', 'Toplayıcı robot': 'Collector robot', 'Reklam & tanıtım': 'Ads & promo', 'Sipariş primi': 'Order bonus', 'Eleman hızı': 'Crew speed', 'Eleman kapasitesi': 'Crew capacity',
  'Taşıyıcı': 'Carrier', 'Kasiyer': 'Cashier', 'Tüy ve taban taşır, FLIX’leri tezgâha dizer': 'Carries feathers and bases, stacks FLIX on the counter', 'Her kasaya bir kasiyer: satış 3 kat hızlı': 'One cashier per register: sales 3x faster',
  'sn/taban': 's/base', 'sn/FLIX': 's/FLIX', 'sn/parça': 's/item', 'sn yol': 's trip', 'kutu': 'boxes', 'tüy': 'feathers', 'Tank': 'Tank', 'satış': 'sales', 'müşteri': 'customers', 'sipariş ödülü': 'order reward', 'hatalı': 'faulty', 'FLIX': 'FLIX',
  'sektirme ·': 'kicks ·',
  // boosts
  '2x Kazanç': '2x Earnings', 'Tüm satışlar 2 kat': 'All sales x2', 'Turbo Hız': 'Turbo Speed', 'Sen ve elemanlar 1,5 kat hızlı': 'You and crew 1.5x faster', 'Çift Üretim': 'Double Production',
  'Kümes, pres ve montaj 2 kat hızlı': 'Coop, press and assembly 2x faster', 'Müşteri Akını': 'Customer Rush', 'Müşteriler 2 kat sık gelir, daha çok alır': 'Customers come 2x as often and buy more',
  'Para Mıknatısı': 'Money Magnet', 'Paralar kendiliğinden cebine gelir': 'Cash flies into your pocket', 'dakika': 'minutes',
  // shop
  '100 Elmas': '100 Gems', '300 Elmas': '300 Gems', '800 Elmas': '800 Gems', '2000 Elmas': '2000 Gems', 'Başlangıç Paketi': 'Starter Pack', '150 elmas + ₺2.000 + Altın FLIX kostümü': '150 gems + ₺2,000 + Golden FLIX outfit',
  'Reklamsız': 'No Ads', 'Ara reklamlar kalkar, ödüllü reklamlar isteğe bağlı kalır': 'Removes interstitials, rewarded ads stay optional', 'VIP Fabrika': 'VIP Factory', 'Tüm satışlar kalıcı 2 kat + reklamsız': 'All sales permanently x2 + no ads',
  'Neon yörüngede kaç, rekor kır!': 'Dodge in the neon orbit, set a record!', "FLIX’i düşürmeden sektir!": 'Keep the FLIX up!',
  // colours & cosmetics
  'Doğal': 'Natural', 'Mavi': 'Blue', 'Yeşil': 'Green', 'Sarı': 'Yellow', 'Kırmızı': 'Red', 'Mor': 'Purple', 'Altın': 'Golden', 'Karışık': 'Mixed', 'Karışık renkler': 'Mixed colours',
  'Altın FLIX': 'Golden FLIX', 'Kırmızı FLIX': 'Red FLIX', 'FLIX kırmızısı': 'FLIX red', 'FLIX sarı-mavi': 'FLIX yellow-blue', 'Ejder Yeşili': 'Dragon Green', 'Gece Altını': 'Night Gold', 'Gökkuşağı': 'Rainbow', 'Gün Batımı': 'Sunset',
  'Türkiye Özel': 'Türkiye Special', 'Zümrüt': 'Emerald', 'Buz Mavisi': 'Ice Blue', 'Galaksi': 'Galaxy', 'Gece mavisi': 'Night blue', 'Kar Tanesi': 'Snowflake', 'Kiraz': 'Cherry', 'Lav FLIX': 'Lava FLIX', 'Neon Pembe': 'Neon Pink',
  'Okyanus': 'Ocean', 'Robot FLIX': 'Robot FLIX', 'Turkuaz': 'Turquoise', 'Uzay': 'Space', 'Aksesuarsız': 'No accessory', 'Altın taç': 'Golden crown', 'FLIX şapkası': 'FLIX cap', 'Güneş gözlüğü': 'Sunglasses', 'Işık halesi': 'Halo',
  'Kovboy şapkası': 'Cowboy hat', 'Kulaklık': 'Headphones', 'Kışlık bere': 'Winter beanie', 'Süper maske': 'Super mask', 'Taraftar atkısı': 'Fan scarf', 'Tüy kanatlar': 'Feather wings', 'Yıldız anten': 'Star antenna', 'Kahraman pelerini': 'Hero cape',
  'Ahşap parke': 'Wood parquet', 'Fabrika betonu': 'Factory concrete', 'Kırmızı karo': 'Red tiles', 'Krem karo': 'Cream tiles', 'Mermer': 'Marble', 'Nane karo': 'Mint tiles', 'Saha çimi': 'Pitch grass', 'Satranç': 'Chess',
  'Altın ekip': 'Golden crew', 'Galaksi ekip': 'Galaxy crew', 'Robot ekip': 'Robot crew', 'Turkuaz ekip': 'Turquoise crew', 'Mavi tulum': 'Blue overalls', 'Yeşil yelek': 'Green vest', 'Usta bareti': 'Hard hat', 'Şapkasız': 'No hat',
  // 3D signs & floor labels
  'ATÖLYE': 'WORKSHOP', 'FABRİKA': 'FACTORY', 'KÜMES': 'COOP', 'MİNİ MAKİNE': 'MINI MACHINE', 'DEPO': 'STORAGE', 'MONTAJ': 'ASSEMBLY', 'FLIX SATIŞ': 'FLIX SHOP', 'SATIŞ': 'SHOP', 'OFİS': 'OFFICE', 'İŞE ALIM': 'HIRING',
  'GERİ DÖNÜŞÜM': 'RECYCLING', 'HEDİYE PAKETİ': 'GIFT PACK', 'KAUÇUK': 'RUBBER', 'PELUŞ ATÖLYESİ': 'PLUSH WORKSHOP', 'OYUNCAKÇILARA SEVKİYAT': 'SHIPPING TO TOY SHOPS', 'SEVKİYAT': 'SHIPPING', 'PRES': 'PRESS', 'ROBOT GARAJI': 'ROBOT GARAGE',
  'YAKINDA: YENİ SALON': 'SOON: NEW HALL', 'YENİ SALON': 'NEW HALL', 'ÇİFTLİK YAKINDA': 'FARM SOON', 'SEKTİRME ŞOVU': 'KICK-UP SHOW', 'ŞOV': 'SHOW', 'MISIR': 'CORN', 'YEM': 'FEED', 'HATALI': 'FAULTY', 'B BLOK': 'BLOCK B',
  'tüy + taban': 'feather + base', 'bırak': 'drop', 'test için': 'to test', 'test edilmiş': 'tested', 'FLIX bırak': 'drop FLIX', 'kauçuk': 'rubber', 'GELİR ↑': 'INCOME ↑', 'Fabrika Sv': 'Factory Lv', 'Sv': 'Lv', 'sn': 's', 'dk': 'min',
  'Sahne': 'Stage', 'Nasıl?': 'Help', 'Nasıl oynanır': 'How to play', 'Senin': 'Owned', 'Giyili': 'Worn', 'Yasal Bilgiler': 'Legal', 'Hakkında': 'About', 'Tüm taşıyıcılar bunu giyer. Giydiklerinden gelen toplam bonus:': 'All carriers wear this. Total bonus from what you wear:', 'kârı': 'profit', 'satış kârı': 'sales profit', 'Dil': 'Language', '🌐 Türkçe': '🌐 Türkçe', 'İngilizce': 'English',
};
const KEYS = Object.keys(EN).filter(k => EN[k] !== k).sort((a, b) => b.length - a.length);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RX = new RegExp('(?<![\\p{L}])(' + KEYS.map(esc).join('|') + ')(?![\\p{L}])', 'gu');
const UP = {}; for (const k of Object.keys(EN)) { const u = k.toLocaleUpperCase('tr'); if (u !== k && EN[u] === undefined) UP[u] = EN[k].toUpperCase(); }
try { localStorage.setItem('flixLegalLang', LANG); } catch {}
const cache = new Map(); try { if (location.search.includes('miss')) { window.__i18nMiss = new Set(); setTimeout(() => { window.__T_ = T_; }); } } catch {}
export function T_(s) { if (LANG === 'tr' || s == null) return s; s = String(s); const hit = cache.get(s); if (hit !== undefined) return hit;
  const t = s.trim(); let out = EN[t] !== undefined ? s.replace(t, EN[t]) : UP[t] !== undefined ? s.replace(t, UP[t]) : s.replace(RX, (m) => EN[m]); out = out.replace(/(\d),(\d{1,2})(?!\d)/g, '$1.$2'); if (cache.size < 4000) cache.set(s, out); if (window.__i18nMiss && /[çğıöşüÇĞİÖŞÜâ]|(?<![\p{L}])(ve|sn|dk|bir|için|ile|Senin|kâr|hız|Sv|yok|Bin)(?![\p{L}])/u.test(out)) window.__i18nMiss.add(out); return out; }
if (LANG === 'en') {
  // canvas text on 3D signs, pads and labels
  const P = CanvasRenderingContext2D.prototype, f = P.fillText, st = P.strokeText, mt = P.measureText;
  P.fillText = function (s, ...a) { return f.call(this, T_(s), ...a); }; P.strokeText = function (s, ...a) { return st.call(this, T_(s), ...a); }; P.measureText = function (s) { return mt.call(this, T_(s)); };
  // DOM text: translate now and whenever the UI changes
  const fix = (n) => { if (n.nodeType === 3) { const pt = n.parentNode && n.parentNode.tagName; if (pt === 'SCRIPT' || pt === 'STYLE') return; const v = n.data; if (/[A-Za-zÇĞİÖŞÜçğıöşüâÂ]{2,}|\d,\d/.test(v)) { const t = T_(v); if (t !== v) n.data = t; } } else if (n.nodeType === 1 && n.tagName !== 'SCRIPT' && n.tagName !== 'STYLE') { for (const c of n.childNodes) fix(c); } };
  const start = () => { document.documentElement.lang = 'en'; fix(document.body); new MutationObserver(ms => { for (const m of ms) { if (m.type === 'characterData') fix(m.target); else m.addedNodes.forEach(fix); } }).observe(document.body, { childList: true, subtree: true, characterData: true }); };
  if (document.body) start(); else addEventListener('DOMContentLoaded', start);
}
