// ================= ROUTE helpers (auto aim, bot) =================
function routeInfo(p) { // distance left along the route from the closest point to p
  const R = LV.route; let best = {d: 1e9, left: 0, seg: 0};
  for (let k = 0; k < R.length - 1; k++) {
    const [ax, az] = R[k], [bx, bz] = R[k + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
    const u = clamp(((p.x - ax) * dx + (p.z - az) * dz) / L2, 0, 1), cx = ax + dx * u, cz = az + dz * u, d = Math.hypot(p.x - cx, p.z - cz);
    if (d < best.d) { let left = Math.hypot(bx - cx, bz - cz); for (let j = k + 1; j < R.length - 1; j++) left += Math.hypot(R[j + 1][0] - R[j][0], R[j + 1][1] - R[j][1]); best = {d, left, seg: k}; }
  }
  return best;
}
function autoYaw(p) {
  const bk = LV.bucket, R = LV.route, info = routeInfo(p);
  const direct = Math.hypot(bk[0] - p.x, bk[1] - p.z);
  let tx = bk[0], tz = bk[1];
  if (info.seg < R.length - 2 && direct > 9) { tx = R[info.seg + 1][0]; tz = R[info.seg + 1][1]; }
  return Math.atan2(tx - p.x, -(tz - p.z));
}
// best next shot from p: lands in the bucket, or rests as far along the route as possible
function solveShot(from) {
  const by = bucketY(LV), lv = {boxes, bucket: {x: LV.bucket[0], z: LV.bucket[1], y: by, rIn: 0.66, rOut: 0.9, rimY: by + 1.0}, stars: []};
  const y0 = autoYaw(from), yb = Math.atan2(LV.bucket[0] - from.x, -(LV.bucket[1] - from.z)); let best = null;
  const yaws = []; for (let d = -0.6; d <= 0.6001; d += 0.05) yaws.push(y0 + d); if (Math.abs(yb - y0) > 0.05) for (let d = -0.2; d <= 0.2001; d += 0.05) yaws.push(yb + d);
  for (const openAt of [-1, 0]) for (const ang of yaws) for (let pw = 0.05; pw <= 1.0001; pw += 0.05) {
    const B = newBody(from, launchVel(ang, pw)); B.autoOpen = openAt;
    for (let i = 0; i < 1100 && !B.done; i++) stepBody(B, 1 / 120, LV.wind, lv);
    let sc;
    if (B.done === 'in') sc = -100 + Math.abs(ang - y0) + pw * 0.1;
    else if (B.done === 'out' || !islandAt(B.p.x, B.p.z) || B.p.y < -0.3) sc = 1e6;
    else { const r = routeInfo(B.p); sc = r.left + r.d * 0.6 + (openAt >= 0 ? 0.3 : 0); }
    if (!best || sc < best.sc) best = {ang, pow: pw, open: openAt, sc};
  }
  return best;
}

// ================= PLAY STATE =================
let state = 'home', cur = 0;
const P = {phase: 'aim', shot: 0, body: null, from: null, yaw: 0, got: [], celebrate: 0, reacts: 0, map: false, intro: 0, pen: 0};
const MAXOVER = 3; // shots allowed over par
function startLevel(i) {
  cur = i; buildLevel(i); audio();
  Object.assign(P, {phase: 'aim', shot: 0, body: null, got: LV.feathers.map(() => false), celebrate: 0, reacts: 0, map: false, intro: BOT ? 0 : 2.2, pen: 0});
  bubbles.splice(0).forEach((b) => b.el.remove());
  P.from = startPos(LV); placeToy(P.from); toyRoot.quaternion.identity(); P.yaw = autoYaw(P.from);
  ['homeL', 'levelsL', 'endL', 'pauseL'].forEach((id) => show(id, false)); show('hud', true); state = 'play';
  $('lvN').textContent = i + 1; $('lvName').textContent = LV.name; $('par').textContent = LV.par;
  $('wind').hidden = !LV.wind; $('windV').textContent = (LV.wind > 0 ? '→ ' : '← ') + Math.round(Math.abs(LV.wind) * 3);
  hudShots(); hudFeathers(); tuyUI(); $('toast').innerHTML = ''; $('mapB').classList.remove('on');
  // intro: show the whole street, then swoop behind the FLIX
  camMode = 'map'; snapCam(); camMode = 'aim';
  if (LV.tut === 1) tutor(['Sağa sola kaydır: yön', 'Aşağı çek: güç · bırak: at']);
  else if (LV.tut === 2) tutor(['Kısa kaldırıma in!', 'Uçarken ekrana basılı tut: süzül']);
  else tutor(null);
  toast('PAR ' + LV.par, LV.name, '#022753');
}
function placeToy(p) { toyRoot.position.copy(p); }
function show(id, on) { $(id).hidden = !on; }
const STAR = (on, s) => `<svg viewBox="0 0 24 24" ${s || ''}><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21.1l1.5-7L2 9.3l7-.8z" fill="${on ? '#ffc20e' : 'rgba(255,255,255,.65)'}" stroke="#022753" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const FEATHER = (on) => `<svg viewBox="0 0 20 24"><path d="M10 23C3 15 4 6 10 1c6 5 7 14 0 22z" fill="${on ? '#ffc20e' : 'rgba(255,255,255,.6)'}" stroke="#022753" stroke-width="1.8"/><path d="M10 22V6" stroke="#022753" stroke-width="1.2"/></svg>`;
function hudShots() { $('shots').textContent = P.shot; $('shotsBox').classList.toggle('over', P.shot >= LV.par); }
function hudFeathers() { $('hudFe').innerHTML = P.got.map((g) => FEATHER(g)).join(''); }
function tuyUI() { const B = P.body, e = B ? B.energy / 1.6 : 1; $('tuyArc').setAttribute('stroke-dashoffset', (377 * (1 - e)).toFixed(1)); $('tuy').classList.toggle('off', !(P.phase === 'fly' && B && B.energy > 0)); }
function toast(txt, sub, col) { $('toast').innerHTML = `<div class="in"><div class="tag" style="background:${col || '#e22511'}">${txt}</div>${sub ? `<div class="call">${sub}</div>` : ''}</div>`; }
let tutSteps = null;
function tutor(steps) { tutSteps = steps; const h = $('hint'); if (!steps) { h.hidden = true; $('tut').hidden = true; return; } h.innerHTML = steps.map((s, k) => `<div class="st${k ? '' : ' on'}">${s}</div>`).join(''); h.hidden = false; $('tut').hidden = LV.tut !== 1; }
function tutorDone(k) { const el = $('hint').querySelectorAll('.st'); if (el[k]) { el[k].classList.add('ok'); el[k].classList.remove('on'); if (el[k + 1]) el[k + 1].classList.add('on'); } }

// ================= AIMING (3rd person) =================
// slide left/right = turn, pull down = power, let go = shoot. Pull back up to cancel.
let aim = null;
const dotsG = new THREE.Group(); scene.add(dotsG);
const dotGeo = new THREE.SphereGeometry(0.09, 10, 8), dotMat = new THREE.MeshBasicMaterial({color: 0xffffff}), dotOut = new THREE.MeshBasicMaterial({color: NAVY, side: THREE.BackSide});
for (let i = 0; i < 30; i++) { const m = new THREE.Mesh(dotGeo, dotMat); const o = new THREE.Mesh(dotGeo, dotOut); o.scale.setScalar(1.45); m.add(o); m.visible = false; dotsG.add(m); }
const aimArrow = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 3), new THREE.MeshBasicMaterial({color: 0xffc20e})); aimArrow.rotation.x = -Math.PI / 2; const arrowG = new THREE.Group(); arrowG.add(aimArrow); aimArrow.position.z = -1.0; scene.add(arrowG);
function previewAim() {
  const kids = dotsG.children; kids.forEach((m) => { m.visible = false; });
  const svg = $('aimsvg'); svg.innerHTML = '';
  if (!aim || aim.pow === null) return;
  const B = newBody(P.from, launchVel(P.yaw, aim.pow)); let k = 0;
  const free = {boxes: [], bucket: {x: 999, z: 999, y: -99, rimY: -99, rIn: 0, rOut: 0}, stars: []};
  for (let i = 0; i < 600 && k < kids.length && !B.done; i++) { stepBody(B, 1 / 60, LV.wind, free); if (i % 3 === 2) { const m = kids[k++]; m.position.copy(B.p); m.visible = true; m.scale.setScalar(1.05 - k / 40); } if (B.v.y < -3 && k > 14) break; }
  svg.setAttribute('width', innerWidth); svg.setAttribute('height', innerHeight);
  const p = Math.round(aim.pow * 100);
  svg.innerHTML = `<line x1="${aim.x0}" y1="${aim.y0}" x2="${aim.cx}" y2="${aim.cy}" stroke="#022753" stroke-width="4" stroke-dasharray="2 9" stroke-linecap="round"/><circle cx="${aim.x0}" cy="${aim.y0}" r="9" fill="#fff" stroke="#022753" stroke-width="3"/><circle cx="${aim.cx}" cy="${aim.cy}" r="28" fill="rgba(255,255,255,.75)" stroke="${p > 85 ? '#e22511' : '#022753'}" stroke-width="4"/><text x="${aim.cx}" y="${aim.cy + 6}" text-anchor="middle" font-family="Barlow Condensed" font-style="italic" font-weight="900" font-size="19" fill="#022753">${p}</text>`;
}
function shoot(pow) {
  P.shot++; hudShots();
  P.body = newBody(P.from, launchVel(P.yaw, pow)); P.phase = 'fly'; P.flyT = 0; SAVE.seen = 1; save();
  SFX.launch(pow); buzz(15); squash = 1; tuyUI(); dotsG.children.forEach((m) => { m.visible = false; }); $('aimsvg').innerHTML = '';
  if (LV.tut === 1) tutorDone(1); if (LV.tut === 2 && !BOT) setTimeout(() => { if (P.phase === 'fly') toast('BASILI TUT', 'süzül!', '#2fa84f'); }, 450);
}
const tb = $('tuy');
let holdId = null;
function featherOn() { if (P.phase === 'fly' && P.body && P.body.energy > 0 && !P.body.open) { if (LV.tut === 2) tutorDone(1); P.body.open = true; tb.classList.add('down'); SFX.feather(); buzz(8); } }
function featherOff() { tb.classList.remove('down'); if (P.body) P.body.open = false; holdId = null; }
const onUI = (e) => e.target.closest && (e.target.closest('button') || e.target.closest('#tuy'));
addEventListener('pointerdown', (e) => {
  if (state !== 'play') return;
  if (P.phase === 'fly' && !onUI(e)) { holdId = e.pointerId; audio(); featherOn(); return; }
  if (P.phase !== 'aim' || onUI(e) || P.map) return;
  audio(); P.intro = 0; aim = {id: e.pointerId, x0: e.clientX, y0: e.clientY, cx: e.clientX, cy: e.clientY, yaw0: P.yaw, pow: null, turned: false};
});
addEventListener('pointermove', (e) => {
  if (!aim || e.pointerId !== aim.id) return;
  aim.cx = e.clientX; aim.cy = e.clientY; const dx = aim.cx - aim.x0, dy = aim.cy - aim.y0;
  P.yaw = aim.yaw0 + dx * 0.0065; if (Math.abs(dx) > 12 && !aim.turned) { aim.turned = true; if (LV.tut === 1) tutorDone(0); }
  const full = Math.min(230, innerHeight * 0.3), old = aim.pow;
  aim.pow = dy > 16 ? clamp((dy - 16) / (full - 16), 0, 1) : null;
  if (aim.pow !== null && (old === null || Math.floor(aim.pow * 10) !== Math.floor(old * 10))) tick();
  if (aim.pow !== null) $('tut').hidden = true;
  previewAim();
});
addEventListener('pointerup', (e) => {
  if (holdId !== null && e.pointerId === holdId) { featherOff(); return; }
  if (!aim || e.pointerId !== aim.id) return; const pw = aim.pow; aim = null; previewAim();
  if (pw !== null && pw > 0.01 && state === 'play' && P.phase === 'aim') shoot(pw);
});
addEventListener('pointercancel', () => { aim = null; previewAim(); if (holdId !== null) featherOff(); });
document.addEventListener('touchmove', (e) => e.preventDefault(), {passive: false});
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());
tb.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); audio(); if (P.phase === 'fly') { holdId = e.pointerId; featherOn(); } });
addEventListener('keydown', (e) => { if (e.key === ' ' && P.phase === 'fly') featherOn(); if (e.key === 'Escape') pause(true); });
addEventListener('keyup', (e) => { if (e.key === ' ') featherOff(); });
$('mapB').addEventListener('click', () => { if (state !== 'play') return; P.map = !P.map; $('mapB').classList.toggle('on', P.map); camMode = P.map ? 'map' : (P.phase === 'fly' ? 'fly' : 'aim'); tick(); });

// ================= SHOT RESULTS =================
function endShot(B) {
  const how = B.done;
  for (const a of actors) if (a.kind === 'pigeon' && !a.fly && Math.hypot(a.x - B.p.x, a.z - B.p.z) < 2.2) { scarePigeons(a); break; }
  featherOff();
  if (how === 'in') return win();
  const onGround = how === 'rest' && islandAt(B.p.x, B.p.z) && B.p.y > -0.4;
  if (onGround) { P.from = new V3(B.p.x, B.p.y, B.p.z); if (LV.tut === 1) tutor(['Durduğu yerden devam et', 'Kovaya at!']); }
  else { P.shot++; P.pen++; hudShots(); toast('DÜŞTÜ +1', 'ceza atışı', '#e22511'); SFX.fail(); buzz(30); }
  if (P.shot >= LV.par + MAXOVER) return lose();
  P.body = null; P.phase = 'aim'; placeToy(P.from); toyRoot.quaternion.identity(); tuyUI();
  P.yaw = autoYaw(P.from); camMode = P.map ? 'map' : 'aim';
}
function rating(shots, par) { const d = shots - par; return shots === 1 ? 'TEK ATIŞ!' : d <= -2 ? 'EFSANE!' : d === -1 ? 'SÜPER!' : d === 0 ? 'PAR!' : '+' + d; }
function starsFor(shots, par) { return shots <= par ? 3 : shots === par + 1 ? 2 : 1; }
function win() {
  P.phase = 'won'; P.celebrate = 1; SFX.win(); buzz([20, 40, 20]); confetti(bucket.x, bucket.rimY + 0.3, bucket.z); camMode = 'win';
  const nStars = starsFor(P.shot, LV.par), nFe = P.got.filter(Boolean).length;
  const fe = 10 + nStars * 5 + nFe * 5 + (P.shot < LV.par ? 10 : 0) + Math.min(5, P.reacts || 0) * 2;
  const prev = SAVE.lv[cur] || {s: 0, best: 99};
  SAVE.lv[cur] = {s: Math.max(prev.s || 0, nStars), best: Math.min(prev.best || 99, P.shot), done: 1}; SAVE.fe += fe; save();
  setTimeout(() => {
    state = 'end'; show('hud', false); show('endL', true);
    $('endT').textContent = rating(P.shot, LV.par); $('endT').className = 'big ' + (P.shot <= LV.par ? 'good' : 'meh');
    $('endW').innerHTML = `<b>${P.shot}</b> atış · par <b>${LV.par}</b>${P.pen ? ` · ${P.pen} ceza` : ''}`;
    $('endStars').innerHTML = [0, 1, 2].map((k) => STAR(k < nStars)).join('');
    $('endRows').innerHTML = row('Bölüm', 10) + row('Yıldız', nStars * 5) + (nFe ? row('Altın tüy x' + nFe, nFe * 5) : '') + (P.shot < LV.par ? row('Par altı', 10) : '') + (P.reacts ? row('Şaşkın komşu x' + Math.min(5, P.reacts), Math.min(5, P.reacts) * 2) : '') + `<div class="tot"><span>Toplam</span><b>+${fe} tüy</b></div>`;
    $('endStars').querySelectorAll('svg').forEach((s, k) => setTimeout(() => { s.classList.add('show'); if (k < nStars) SFX.star(k); }, 250 + k * 260));
    $('retry3').hidden = false;
    $('next').querySelector('b').textContent = cur + 1 < LEVELS.length ? 'SONRAKİ' : 'BÖLÜMLER';
    $('next').onclick = () => { if (cur + 1 < LEVELS.length) startLevel(cur + 1); else openLevels(); };
  }, BOT ? 50 : 1500);
}
const row = (a, b) => `<div class="row"><span>${a}</span><b>+${b}</b></div>`;
function lose() {
  P.phase = 'lost'; SFX.fail();
  setTimeout(() => {
    state = 'end'; show('hud', false); show('endL', true);
    $('endT').textContent = 'OLMADI!'; $('endT').className = 'big meh'; $('endW').innerHTML = `Par ${LV.par} bölümde ${LV.par + MAXOVER} atış hakkın bitti.`;
    $('endStars').innerHTML = ''; $('endRows').innerHTML = '<div class="row"><span>İpucu: atmadan önce sağa sola kaydırıp yolu seç, harita tuşuyla tüm sokağa bak.</span></div>';
    $('retry3').hidden = true; $('next').querySelector('b').textContent = 'TEKRAR'; $('next').onclick = () => startLevel(cur);
  }, BOT ? 50 : 1000);
}

// ================= EFFECTS =================
const parts = [];
const pGeo = new THREE.BoxGeometry(0.16, 0.16, 0.03);
for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({color: 0xffffff})); m.visible = false; scene.add(m); parts.push({m, life: 0, v: new V3()}); }
function confetti(x, y, z) { const cols = [0xe22511, 0xffc20e, 0x1f6fd1, 0x2fa84f, 0xffffff]; for (const p of parts) { p.life = 1 + Math.random() * 0.6; p.m.material.color.setHex(cols[(Math.random() * 5) | 0]); p.m.position.set(x, y, z); p.v.set((Math.random() - 0.5) * 6, 5 + Math.random() * 6, (Math.random() - 0.5) * 6); p.m.visible = true; } }
function sparks(p, col) { let n = 0; for (const q of parts) { if (q.life > 0) continue; q.life = 0.5; q.m.material.color.setHex(col); q.m.position.copy(p); q.v.set((Math.random() - 0.5) * 5, Math.random() * 4, (Math.random() - 0.5) * 5); q.m.visible = true; if (++n > 10) break; } }
let squash = 0;
// toy trail
const trailN = 26, trailPos = new Float32Array(trailN * 3), trailGeo = new THREE.BufferGeometry(); trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
const trail = new THREE.Points(trailGeo, new THREE.PointsMaterial({color: 0xffc20e, size: 0.16, transparent: true, opacity: 0.8, depthWrite: false})); trail.frustumCulled = false; scene.add(trail); let trailK = 0;

// ================= CAMERA =================
let camMode = 'aim';
const camPos = new V3(), camLook = new V3(), wantPos = new V3(), wantLook = new V3(), fwd = new V3();
function camWanted() {
  const tp = toyRoot.position;
  if (camMode === 'map' || state !== 'play' && state !== 'pause' && state !== 'end') {
    const bb = levelBounds(), cx = (bb.x0 + bb.x1) / 2, cz = (bb.z0 + bb.z1) / 2, span = Math.max(bb.x1 - bb.x0, (bb.z1 - bb.z0) * 0.6);
    wantLook.set(cx, 0, cz); wantPos.set(cx + span * 0.12, span * 1.25 + 8, cz + span * 0.55 + 6);
    if (state === 'home') { const a = T * 0.12; wantLook.copy(tp); wantLook.y += 1.2; wantPos.set(tp.x + Math.sin(a) * 6.5, tp.y + 2.4, tp.z + Math.cos(a) * 6.5); }
    return;
  }
  if (camMode === 'fly' && P.body) {
    const v = P.body.v; fwd.set(v.x, 0, v.z); if (fwd.lengthSq() < 0.5) fwd.set(Math.sin(P.yaw), 0, -Math.cos(P.yaw)); fwd.normalize();
    wantPos.copy(tp).addScaledVector(fwd, -6.2); wantPos.y = Math.max(tp.y + 2.6, P.from.y + 2.2);
    wantLook.copy(tp).addScaledVector(fwd, 2.5); wantLook.y = tp.y * 0.6 + P.from.y * 0.4;
    return;
  }
  if (camMode === 'win') { wantLook.set(bucket.x, bucket.rimY, bucket.z); fwd.set(Math.sin(P.yaw), 0, -Math.cos(P.yaw)); wantPos.set(bucket.x, bucket.rimY + 2.6, bucket.z).addScaledVector(fwd, -5); return; }
  fwd.set(Math.sin(P.yaw), 0, -Math.cos(P.yaw));
  wantPos.copy(tp).addScaledVector(fwd, -5.4); wantPos.y = tp.y + 2.3;
  wantLook.copy(tp).addScaledVector(fwd, 7); wantLook.y = tp.y + 1.2;
}
function camBlock() { // keep the camera out of buildings: pull it toward the FLIX
  const tp = toyRoot.position; if (camMode === 'map' || state === 'home') return;
  const steps = 14; let ok = 1;
  for (let k = 1; k <= steps; k++) { const t = k / steps; tmp.lerpVectors(tp, wantPos, t); if (boxes.some((o) => o.b[3] > 1 && tmp.x > o.b[0] - 0.3 && tmp.x < o.b[1] + 0.3 && tmp.y < o.b[3] + 0.3 && tmp.z > o.b[4] - 0.3 && tmp.z < o.b[5] + 0.3 && tmp.y > o.b[2])) { ok = (k - 1) / steps; break; } }
  if (ok < 1) { wantPos.lerpVectors(tp, wantPos, Math.max(0.3, ok)); wantPos.y += (1 - ok) * 2.5; }
}
function snapCam() { camWanted(); camPos.copy(wantPos); camLook.copy(wantLook); }
function updateCam(dt) {
  if (P.intro > 0 && state === 'play') { P.intro -= dt; if (P.intro > 1.2) { const m = camMode; camMode = 'map'; camWanted(); camMode = m; } else camWanted(); }
  else camWanted();
  camBlock();
  const k = 1 - Math.exp(-dt * (camMode === 'fly' ? 4.5 : camMode === 'map' ? 3 : P.intro > 0 ? 2.2 : 6));
  camPos.lerp(wantPos, k); camLook.lerp(wantLook, k);
  camera.position.copy(camPos); camera.lookAt(camLook);
}

// ================= SCREENS =================
function starTotal() { return Object.values(SAVE.lv).reduce((a, b) => a + (b.s || 0), 0); }
function nextLevel() { const k = LEVELS.findIndex((_, i) => !(SAVE.lv[i] && SAVE.lv[i].done)); return k < 0 ? LEVELS.length - 1 : k; }
function openHome() {
  state = 'home'; ['hud', 'levelsL', 'endL', 'pauseL', 'setL'].forEach((id) => show(id, false)); show('homeL', true);
  $('starsH').textContent = starTotal() + '/' + LEVELS.length * 3; $('feH').textContent = SAVE.fe;
  const n = nextLevel(); $('playSub').textContent = (n + 1) + '. bölüm · ' + LEVELS[n].name;
  if (!LV || cur !== 0) { cur = 0; buildLevel(0); } placeToy(startPos(LV)); P.phase = 'home'; P.body = null; camMode = 'map'; snapCam();
}
function openLevels() {
  state = 'levels'; ['hud', 'homeL', 'endL', 'pauseL', 'setL'].forEach((id) => show(id, false)); show('levelsL', true);
  const done = (i) => SAVE.lv[i] && SAVE.lv[i].done; let html = '';
  const tot = starTotal(); $('lvProg').style.width = (tot / (LEVELS.length * 3) * 100).toFixed(1) + '%'; $('lvProgT').textContent = tot + ' / ' + LEVELS.length * 3;
  LEVELS.forEach((L, i) => {
    const open = i === 0 || done(i - 1) || done(i), sv = SAVE.lv[i] || {}, nxt = open && !done(i);
    html += `<button class="lv${open ? '' : ' lock'}${nxt ? ' next' : ''}" data-i="${i}" ${open ? '' : 'disabled'}>
      <div class="num big">${open ? i + 1 : '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="5" y="10" width="14" height="11" rx="2" fill="#022753"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#022753" stroke-width="2.6" fill="none"/></svg>'}</div>
      <div class="info"><div class="nm">${L.name}${L.tut ? ' <i>ÖĞRETİCİ</i>' : ''}</div><div class="meta">Par ${L.par}${sv.best && sv.best < 99 ? ' · en iyi ' + sv.best + ' atış' : ''}</div></div>
      <div class="st">${[0, 1, 2].map((k) => STAR(k < (sv.s || 0))).join('')}</div></button>`;
  });
  $('grid').innerHTML = html; $('grid').querySelectorAll('.lv:not(.lock)').forEach((b) => b.addEventListener('click', () => { audio(); startLevel(+b.dataset.i); }));
}
function pause(on) { if (on && state === 'play') { state = 'pause'; show('pauseL', true); aim = null; previewAim(); } else if (!on && state === 'pause') { state = 'play'; show('pauseL', false); last = performance.now(); } }
function setUI() { $('sndT').textContent = SAVE.snd ? 'Açık' : 'Kapalı'; $('vibT').textContent = SAVE.vib === 0 ? 'Kapalı' : 'Açık'; $('sndT').parentNode.classList.toggle('off', !SAVE.snd); $('vibT').parentNode.classList.toggle('off', SAVE.vib === 0); }
$('play').addEventListener('click', () => { audio(); startLevel(nextLevel()); });
$('lvlB').addEventListener('click', () => { audio(); openLevels(); });
$('setB').addEventListener('click', () => { show('setL', true); setUI(); });
$('setClose').addEventListener('click', () => show('setL', false));
$('sndRow').addEventListener('click', () => { SAVE.snd = SAVE.snd ? 0 : 1; save(); setUI(); if (SAVE.snd) audio(); });
$('vibRow').addEventListener('click', () => { SAVE.vib = SAVE.vib === 0 ? 1 : 0; save(); setUI(); buzz(15); });
$('back1').addEventListener('click', openHome); $('retry3').addEventListener('click', () => startLevel(cur)); $('menu2').addEventListener('click', openLevels); $('menu3').addEventListener('click', openLevels);
$('pauseB').addEventListener('click', () => pause(true)); $('resume').addEventListener('click', () => pause(false)); $('retryP').addEventListener('click', () => startLevel(cur));
$('homeP').addEventListener('click', openHome);
document.addEventListener('visibilitychange', () => { if (document.hidden) { pause(true); if (AC) AC.suspend(); } else if (AC) AC.resume(); });

// ================= TEST BOT =================
function botTick() {
  if (state === 'end') { if (!P.botNext) { P.botNext = 1; setTimeout(() => { P.botNext = 0; if (state === 'end' && $('next').querySelector('b').textContent !== 'BÖLÜMLER') $('next').onclick(); }, 100); } return; }
  if (state !== 'play') return;
  if (P.phase === 'aim' && !P.botWait) { P.botWait = 1; setTimeout(() => { P.botWait = 0; if (P.phase !== 'aim' || state !== 'play') return; const s = solveShot(P.from); P.yaw = s.ang; shoot(s.pow); P.body.autoOpen = s.open; }, 150); }
}

// ================= FRAME =================
let last = performance.now(), T = 0, acc = 0;
const qT = new THREE.Quaternion(), upV = new V3(0, 1, 0), tmp = new V3();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
  if (BOT) botTick();
  if (state === 'play' && P.phase === 'fly' && P.body) {
    if (!P.map) camMode = 'fly';
    acc += dt; const lvp = lvPhys();
    while (acc >= 1 / 120) {
      acc -= 1 / 120;
      const before = P.body.got.slice(), vy0 = P.body.v.length();
      const h = stepBody(P.body, 1 / 120, LV.wind, lvp);
      if (h === 'actor') { if (reactActor(P.body.lastA, P.body.p)) { P.reacts = (P.reacts || 0) + 1; squash = 0.8; } }
      else if (h === 'bounce') { SFX.bounce(); squash = 1; buzz(10); } else if (h === 'hit' || h === 'rim') { SFX.thud(vy0); squash = 0.6; }
      P.body.got.forEach((g, k) => { if (g && !before[k] && !P.got[k]) { P.got[k] = true; stars[k].m.visible = false; sparks(stars[k].p, 0xffc20e); SFX.star(P.got.filter(Boolean).length - 1); hudFeathers(); } });
      if (P.body.done) { const B = P.body; if (B.done === 'in') B.p.set(bucket.x, bucket.y + 0.45, bucket.z); placeToy(B.p); endShot(B); break; }
    }
    if (P.body) { placeToy(P.body.p); tuyUI(); }
  }
  if (state !== 'pause') updateActors(dt);
  render(dt);
}
function render(dt) {
  const B = P.body;
  if (B && P.phase === 'fly' && B.v.lengthSq() > 1) { tmp.copy(B.v).normalize().negate(); qT.setFromUnitVectors(upV, tmp); toyRoot.quaternion.slerp(qT, 0.18); }
  else toyRoot.quaternion.slerp(qT.identity(), 0.12);
  // home screen: the FLIX does kick-ups on the street
  if (state === 'home' || state === 'levels') { const ph = (T * 1.25) % 1, base = startPos(LV); toyRoot.position.set(base.x, base.y + Math.sin(ph * Math.PI) * 1.6, base.z); if (ph < 0.06) squash = Math.max(squash, 0.7); toyRoot.rotation.set(0, T * 0.8, 0); }
  const open = B && B.open ? 1 : 0; toyM.userData.op = lerp(toyM.userData.op || 0, open, 0.25);
  toyM.userData.fe.forEach((f, i) => { const k = i - 1; f.rotation.z = -k * (0.42 + toyM.userData.op * 0.75); f.rotation.x = (k === 0 ? -0.08 : 0.06) - toyM.userData.op * 0.6 + Math.sin(T * 20 + i) * 0.04 * (P.phase === 'fly' ? 1 : 0); });
  squash = Math.max(0, squash - dt * 5); const sq = squash; toyM.scale.set(TOYS * (1 + sq * 0.2), TOYS * (1 - sq * 0.25), TOYS * (1 + sq * 0.2));
  if (P.phase === 'aim' && aim && aim.pow !== null) { const k = aim.pow; toyM.scale.set(TOYS * (1 + k * 0.12), TOYS * (1 - k * 0.15), TOYS * (1 + k * 0.12)); }
  // aim arrow on the ground
  arrowG.visible = state === 'play' && P.phase === 'aim' && !P.map; if (arrowG.visible) { arrowG.position.set(P.from.x, P.from.y - RAD + 0.05, P.from.z); arrowG.rotation.y = -P.yaw; aimArrow.position.z = -1.0 - Math.sin(T * 5) * 0.12; }
  // trail
  if (P.phase === 'fly' && B) { trailPos.set([B.p.x, B.p.y, B.p.z], (trailK++ % trailN) * 3); trailGeo.attributes.position.needsUpdate = true; trail.visible = true; trail.material.color.setHex(B.open ? 0x2fa84f : 0xffc20e); } else if (trail.visible && P.phase !== 'fly') { trail.visible = false; trailPos.fill(0); trailK = 0; }
  const tp = toyRoot.position, I = LV && islandAt(tp.x, tp.z);
  toyShadow.visible = !!I; if (I) { toyShadow.position.set(tp.x, I.top + 0.02, tp.z); toyShadow.material.opacity = clamp(0.35 - (tp.y - I.top) * 0.03, 0.05, 0.35); }
  for (const s of stars) { s.m.rotation.y = T * 2; s.m.position.y = s.p.y + Math.sin(T * 3 + s.p.x) * 0.1; }
  if (bucket) { bucket.flag.rotation.y = Math.sin(T * 3) * 0.3; bucket.glow.material.opacity = 0.35 + Math.sin(T * 4) * 0.2; bucket.beam.material.opacity = 0.1 + Math.sin(T * 2) * 0.04; if (P.celebrate > 0) { P.celebrate = Math.max(0, P.celebrate - dt * 1.5); const s = 1 + Math.sin(P.celebrate * 18) * 0.12 * P.celebrate; bucket.g.scale.set(s, 1 / s, s); } }
  if (sock) { const w = LV.wind || 0.4; sock.rotation.z = Math.PI / 2 - Math.sign(w || 1) * 0.15 + Math.sin(T * 5) * 0.08; sock.rotation.order = 'YXZ'; sock.rotation.y = w >= 0 ? 0 : Math.PI; sock.position.x = sock.userData.base.x + 0.45 * Math.sign(w || 1); }
  for (const p of parts) if (p.life > 0) { p.life -= dt; p.v.y -= 12 * dt; p.m.position.addScaledVector(p.v, dt); p.m.rotation.x += dt * 9; p.m.rotation.y += dt * 7; if (p.life <= 0) p.m.visible = false; }
  if (!window.__freezeCam) updateCam(dt);
  sun.target.position.copy(tp); sun.position.copy(tp).add(tmp.set(8, 20, 7));
  renderer.render(scene, camera);
}
function resize() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);
window.__A = {actors: () => actors, reactActor, X: {scene, camera, toyRoot, toyM, renderer, get bucket() { return bucket; }, get world() { return world; }, stars: () => stars}, P, LEVELS, startLevel, solveShot, state: () => state, SAVE, get LV() { return LV; }, cam: () => camMode};
resize(); openHome(); requestAnimationFrame(frame);
