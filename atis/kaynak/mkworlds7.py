import sys
s = open('worlds6.js').read()
def rep(old, new):
    global s
    if s.count(old) != 1: sys.exit('miss: ' + old[:70])
    s = s.replace(old, new)
rep("// ================= WORLDS (v6): Sokak, Amerika, Avrupa, Uzay · 20 levels each =================", "// ================= WORLDS (v7): 9 worlds · 20 levels each =================")
rep("""  {id: 'sokak', name: 'SOKAK', sub: 'Mahalle', col: '#e22511'},
  {id: 'amerika', name: 'AMERİKA', sub: 'Büyük şehir', col: '#1f6fd1'},
  {id: 'avrupa', name: 'AVRUPA', sub: 'Eski şehir', col: '#2f8a4a'},
  {id: 'uzay', name: 'UZAY', sub: 'Ay üssü', col: '#4a3ab0'},""",
"""  {id: 'sokak', name: 'SOKAK', sub: 'Mahalle', col: '#e22511', cost: 0, old: 0},
  {id: 'turkiye', name: 'TÜRKİYE', sub: 'Tarihi çarşı', col: '#c8102e', cost: 200},
  {id: 'amerika', name: 'AMERİKA', sub: 'Büyük şehir', col: '#1f6fd1', cost: 350, old: 20},
  {id: 'avrupa', name: 'AVRUPA', sub: 'Eski şehir', col: '#2f8a4a', cost: 500, old: 40},
  {id: 'asya', name: 'ASYA', sub: 'Fener sokağı', col: '#d83a5a', cost: 700},
  {id: 'avustralya', name: 'AVUSTRALYA', sub: 'Sahil kasabası', col: '#ff8a1a', cost: 900},
  {id: 'afrika', name: 'AFRİKA', sub: 'Savan köyü', col: '#b8641e', cost: 1100},
  {id: 'antarktika', name: 'ANTARKTİKA', sub: 'Buz üssü', col: '#3aa8d8', cost: 1400},
  {id: 'uzay', name: 'UZAY', sub: 'Ay üssü', col: '#4a3ab0', cost: 1800, old: 60},""")
# new themes go next to the old ones
rep("  uzay: {walls:", """  turkiye: {walls: [['#f4e4c8', '#7a2a1a', '#c8102e'], ['#e8d0a8', '#5a3a22', '#c8102e'], ['#f8ecd8', '#2f5a3a', '#c8102e'], ['#d8b890', '#7a2a1a', '#022753'], ['#f0d8c8', '#5a3a22', '#2f8a4a']],
    shops: ['LOKUMCU LÜTFÜ', 'KÜNEFECİ KEMAL', 'ÇAYCI ÇETİN', 'BAKLAVACI BARIŞ', 'DONDURMACI DURSUN', 'HALICI HAMDİ', 'KOKOREÇÇİ KOKO', 'MIDYECİ MİDO', 'TESBİHÇİ TAHSİN', 'PİŞMANİYECİ PİŞO', 'KEBAPÇI KEREM', 'BOZACI BOZO', 'GÖZLEMECİ GÜLÜ', 'ŞALGAMCI ŞAHAP'],
    style: 'wood', hMin: 5, hMax: 8, cars: [0xc8102e, 0xffc20e, 0x1f6fd1, 0xf4eee2], sky: ['#7ec2e8', '#f0e4d0', '#ffc890'], fog: 0xf0e4d0},
  asya: {walls: [['#f4ead8', '#b8102e', '#b8102e'], ['#e8e0d0', '#1b1330', '#d83a5a'], ['#f8f0e0', '#2f6b4a', '#b8102e'], ['#d8d0c0', '#b8102e', '#1b1330'], ['#f0e0e4', '#1b1330', '#ffc20e']],
    shops: ['RAMEN REN', 'SUSHI SAKURA', 'DIM SUM DAN', 'BAO BAO', 'NOODLE NINA', 'MOCHI MIKO', 'TOFU TAO', 'PHO PHONG', 'KIMCHI KIM', 'BOBA BOBO', 'CURRY KUMAR', 'WOK WANG', 'TEMPURA TEO', 'MATCHA MEI'],
    style: 'asia', hMin: 5, hMax: 9, cars: [0xd83a5a, 0xf4f4f4, 0x2fa84f, 0xffc20e], sky: ['#8ab8e8', '#f4dce4', '#ffd0d8'], fog: 0xf4dce4},
  avustralya: {walls: [['#bfe4e8', '#f4f4f4', '#ff8a1a'], ['#f8e0a8', '#f4f4f4', '#1f6fd1'], ['#d8f0c8', '#f4f4f4', '#e22511'], ['#f8d0c0', '#f4f4f4', '#2f8a4a'], ['#e0e8f8', '#f4f4f4', '#ff8a1a']],
    shops: ['SURF SHACK', 'KOALA KAFE', 'BARBEKÜ BAZ', 'MEAT PIE MO', 'KANGA KIOSK', 'BUMERANG BOB', 'OUTBACK OLLIE', 'REEF RITA', 'FLAT WHITE FRED', 'BEACH BEV', 'G\\'DAY GARY', 'CROCO CAFE'],
    style: 'board', hMin: 3.8, hMax: 6, cars: [0xff8a1a, 0x1f6fd1, 0xf4f4f4, 0x2fa84f], sky: ['#3ea0f0', '#bfe6f8', '#f8f0c8'], fog: 0xbfe6f8},
  afrika: {walls: [['#c8844a', '#5a3a22', '#e8a020'], ['#d89a5a', '#3a2a1a', '#2f8a4a'], ['#b8743a', '#5a3a22', '#c8102e'], ['#e0aa6a', '#3a2a1a', '#1f6fd1'], ['#c88a5a', '#5a3a22', '#ffc20e']],
    shops: ['SAFARİ SAM', 'BAOBAB BAR', 'JOLLOF JOE', 'MANGO MAMA', 'ZEBRA ZONE', 'KENTE KEMI', 'DAVUL DUMA', 'TAM TAM TAKI', 'ASLAN ALİ', 'KAKAO KOFI', 'HURMA HASAN', 'FIL FATU'],
    style: 'adobe', hMin: 3.4, hMax: 5.4, cars: [0xe8a020, 0x2f8a4a, 0xc8102e, 0xf4eee2], sky: ['#f0b060', '#f8d8a0', '#ffe8c0'], fog: 0xf8d8a0},
  antarktika: {walls: [['#e8f4fc', '#1f6fd1', '#e22511'], ['#d8ecf8', '#022753', '#ff8a1a'], ['#f4fafe', '#3aa8d8', '#e22511'], ['#c8e0f0', '#022753', '#ffc20e']],
    shops: ['İGLO İSO', 'BUZ BAR', 'PENGUEN PAŞA', 'KAR KAFE', 'FOK FIRIN', 'KUTUP KÜMES', 'AURORA ÇAY', 'KARTOPU KAMİL', 'SOĞUK SAMİ', 'BUZDAĞI BÜFE', 'FIRTINA FERDİ', 'KIZAK KIOSK'],
    style: 'ice', hMin: 3.6, hMax: 5.6, cars: [0xe22511, 0xff8a1a, 0xffc20e], sky: ['#6ab0e0', '#d8ecf8', '#f4fafe'], fog: 0xe4f2fa},
  uzay: {walls:""")
rep("const names = {", "const names = {\n    turkiye: ['Simitçi Köşesi', 'Çay Ocağı', 'Kapalı Çarşı', 'Lokum Yolu', 'Tramvay Durağı', 'Cumbalı Evler', 'Galata Yokuşu', 'Baklava Köprüsü', 'Bozacı Sokağı', 'Halı Pazarı', 'Rüzgârlı İskele', 'Kız Kulesi Manzarası', 'Kebap Kavşağı', 'Martı Köprüsü', 'Eski Hamam', 'Bayrak Sokak', 'Fener Yolu', 'Lale Bahçesi', 'Boğaz Rüzgârı', 'Türkiye Finali'],\n    asya: ['Fener Sokağı', 'Ramen Köşesi', 'Kiraz Çiçeği', 'Pagoda Yolu', 'Bambu Bahçesi', 'Gece Pazarı', 'Ejderha Kapısı', 'Çay Evi', 'Fener Köprüsü', 'Pirinç Tarlası', 'Rüzgârlı Tapınak', 'Neon Ara Sokak', 'Bonsai Bahçesi', 'Panda Yolu', 'Kâğıt Fener', 'Samuray Köprüsü', 'Tapınak Merdiveni', 'Uçurtma Şenliği', 'Ejderha Rüzgârı', 'Asya Finali'],\n    avustralya: ['Sahil Yolu', 'Sörf Kulübesi', 'Kanguru Geçidi', 'Koala Ağacı', 'Barbekü Parkı', 'Mercan Köşesi', 'Okyanus Köprüsü', 'Bumerang Yolu', 'Çöl Kasabası', 'Deniz Feneri', 'Rüzgârlı Plaj', 'Timsah Köprüsü', 'Palmiyeli Cadde', 'Liman Kafe', 'Kızıl Çöl', 'Dalga Kıran', 'Okaliptüs Yolu', 'Gün Batımı Plajı', 'Fırtınalı Sahil', 'Avustralya Finali'],\n    afrika: ['Savan Yolu', 'Baobab Ağacı', 'Pazar Günü', 'Zürafa Geçidi', 'Davul Meydanı', 'Kerpiç Evler', 'Nehir Köprüsü', 'Mango Bahçesi', 'Piramit Manzarası', 'Kum Fırtınası', 'Rüzgârlı Vaha', 'Fil Yolu', 'Aslan Tepesi', 'Akasya Gölgesi', 'Çöl Kervanı', 'Kente Çarşısı', 'Şelale Yolu', 'Gün Batımı Savanı', 'Sıcak Rüzgâr', 'Afrika Finali'],\n    antarktika: ['İlk Kar', 'Penguen Yolu', 'Buz Köprüsü', 'İgloo Köyü', 'Kardan Adam', 'Buzdağı', 'Araştırma Üssü', 'Kayan Yol', 'Kutup Işığı', 'Fok Burnu', 'Kar Fırtınası', 'Buz Mağarası', 'Kızak Yolu', 'Penguen Kolonisi', 'Donmuş Göl', 'Aurora Gecesi', 'Buz Kalesi', 'Soğuk Rüzgâr', 'Beyaz Çöl', 'Antarktika Finali'],")
rep("const GEN_PARS = {", "const GEN_PARS = {turkiye: [2,  2,  2,  2,  3,  4,  5,  4,  5,  5,  6,  7,  7,  8,  7,  7,  7,  7,  7,  8], asya: [2,  2,  2,  2,  5,  4,  4,  4,  4,  4,  5,  6,  7,  9,  6,  7,  7,  9,  7,  7], avustralya: [2,  2,  3,  2,  5,  5,  4,  4,  5,  6,  4,  6,  7,  6,  6,  7,  7,  7,  8,  8], afrika: [3,  2,  2,  2,  4,  5,  5,  4,  4,  6,  4,  6,  6,  8,  6,  7,  8,  7,  7,  6], antarktika: [2,  2,  2,  2,  4,  4,  4,  4,  5,  4,  5,  7,  7,  6,  7,  9,  7,  8,  8,  8], ")
# wind: none in space (unchanged for old themes)
# seeds of the old worlds stay as in v6 so those levels do not change
rep("  def.bucket = [0, 0];\n  return def;", "  def.bucket = [0, 0];\n  const W = WORLDS.find((q) => q.id === theme), wi = WORLDS.indexOf(W); def.seedI = W.old !== undefined ? W.old + k : 200 + wi * PER_WORLD + k;\n  return def;")
open('worlds7.js', 'w').write(s); print('ok')
