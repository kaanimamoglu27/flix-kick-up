# Süper Lig oyuncularını FIFA veri setlerinden çıkarır (Direktör oyunu için)
import csv, sys, os, json, io, zipfile, urllib.request, collections
csv.field_size_limit(10**9)
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
SRC = {
  'legacy': 'https://huggingface.co/datasets/jsulz/FIFA23/resolve/main/male_players%20(legacy).csv',
  'fc24': 'https://huggingface.co/datasets/Belkin7/fifa24-player-values/resolve/main/male_players.csv',
  'fc25': 'https://huggingface.co/datasets/jmacd867/SoFifa-Dataset-2024/resolve/main/all_fifa_players.csv',
  'zip': 'https://huggingface.co/datasets/Rohollah903/sofifa/resolve/main/soccerdata.zip',
}
KEEP = ['fifa_version','short_name','long_name','player_positions','overall','potential','age','dob','club_name','league_name','nationality_name','club_position','club_jersey_number',
  'pace','shooting','passing','dribbling','defending','physic','attacking_finishing','defending_standing_tackle','goalkeeping_reflexes',
  'ls','st','rs','lw','lf','cf','rf','rw','lam','cam','ram','lm','lcm','cm','rcm','rm','lwb','ldm','cdm','rdm','rwb','lb','lcb','cb','rcb','rb','gk','preferred_foot','height_cm']
def get(u, path):
  req = urllib.request.Request(u, headers={'User-Agent': 'flix-bot'})
  with urllib.request.urlopen(req) as r, open(path, 'wb') as f:
    while True:
      b = r.read(1 << 20)
      if not b: break
      f.write(b)
  print('indi', u, os.path.getsize(path), flush=True)
def isTR(row):
  t = ' '.join(str(row.get(k, '')) for k in ('league_name', 'League', 'league')).lower()
  return 'süper lig' in t or 'super lig' in t or 'turkish' in t or 'turkey' in t
summary = {}
for name in ('legacy', 'fc24', 'fc25', 'zip'):
  p = '/tmp/' + name
  try: get(SRC[name], p)
  except Exception as e: print('HATA', name, e); continue
  files = []
  if name == 'zip':
    z = zipfile.ZipFile(p)
    for i in z.infolist(): print('  zip:', i.filename, i.file_size)
    for i in z.infolist():
      if i.filename.endswith('.csv'): files.append((i.filename, io.TextIOWrapper(z.open(i), 'utf-8', errors='replace')))
  else:
    files.append((name, open(p, encoding='utf-8', errors='replace')))
  for fn, fh in files:
    rd = csv.DictReader(fh)
    cols = rd.fieldnames or []
    print('==', fn, 'kolonlar:', cols[:60], flush=True)
    keep = [c for c in cols if c in KEEP] or cols[:40]
    rows = []; ver = collections.Counter(); leagues = collections.Counter(); n = 0
    for row in rd:
      n += 1
      ver[row.get('fifa_version', '?')] += 1
      if n < 4: print('  örnek:', {k: row[k] for k in cols[:25]})
      lg = row.get('league_name') or row.get('League') or ''
      if 'urk' in lg or 'Lig' in lg: leagues[lg] += 1
      if isTR(row): rows.append({k: row.get(k, '') for k in keep})
    print('  satır', n, 'sürümler', dict(ver), 'TR', len(rows), 'ligler', leagues.most_common(8), flush=True)
    safe = fn.replace('/', '_').replace(' ', '_')
    if rows:
      with open(f'{OUT}/{safe}.json', 'w') as f: json.dump(rows, f, ensure_ascii=False, separators=(',', ':'))
    summary[fn] = {'rows': n, 'tr': len(rows), 'versions': dict(ver), 'cols': cols}
json.dump(summary, open(f'{OUT}/summary.json', 'w'), ensure_ascii=False, indent=1)
