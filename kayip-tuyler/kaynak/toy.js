import * as THREE from 'three';
let LOGO = null; export function setLogo(img) { LOGO = img; }
const C = { red: 0xe22511, blue: 0x2a80dc, green: 0x2fa043, yel: 0xffd41f };
const rnd = (() => { let s = 1234567; return (a = 0, b = 1) => { s = (s * 16807) % 2147483647; return a + (b - a) * (s / 2147483647); }; })();
function phys(color, o = {}) { return new THREE.MeshPhysicalMaterial({ color, roughness: 0.5, ...o }); }
function mesh(geo, mat, par, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (par) par.add(m); return m; }
function canvasTex(w, h, draw, srgb = true) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); draw(c, w, h); const t = new THREE.CanvasTexture(cv); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function hexBump() {
  return canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); const r = 16, dx = r * Math.sqrt(3), dy = r * 1.5;
    c.strokeStyle = '#000'; c.lineWidth = 4;
    for (let j = -1; j < h / dy + 1; j++) for (let i = -1; i < w / dx + 1; i++) {
      const x = i * dx + (j % 2 ? dx / 2 : 0), y = j * dy; c.beginPath();
      for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
      c.closePath(); c.stroke();
    }
  }, false);
}

const featherCache = {};
export function featherTex(hex) {
  if (featherCache[hex]) return featherCache[hex];
  const col = new THREE.Color(hex);
  const t = canvasTex(256, 1024, (c, w, h) => {
    const cx = w / 2, prof = (v) => { // v: 0 bottom .. 1 tip -> half width
      if (v < 0.08) return 0.1 + v * 3; return Math.pow(Math.sin(Math.PI * Math.min(1, (v - 0.02) / 1.0)), 0.75) * (0.93 - 0.15 * v);
    };
    const hsl = {}; col.getHSL(hsl);
    const shade = (l, s = 0) => `hsl(${hsl.h * 360 + s},${Math.min(100, hsl.s * 100 + 5)}%,${Math.max(5, Math.min(92, l))}%)`;
    // solid vane
    const vg = c.createLinearGradient(0, h, 0, 0); vg.addColorStop(0, shade(hsl.l * 100 - 14)); vg.addColorStop(0.6, shade(hsl.l * 100)); vg.addColorStop(1, shade(hsl.l * 100 + 10));
    c.fillStyle = vg; c.beginPath(); c.moveTo(cx, h);
    for (let v = 0; v <= 1.001; v += 0.01) c.lineTo(cx + prof(v) * (w / 2 - 8), h * (1 - v) - prof(v) * 40);
    for (let v = 1; v >= 0; v -= 0.01) c.lineTo(cx - prof(v) * (w / 2 - 8), h * (1 - v) - prof(v) * 40);
    c.fill();
    // barbs
    for (let i = 0; i < 2600; i++) {
      const v = rnd(0.03, 0.995), side = rnd() < 0.5 ? -1 : 1, hw = prof(v) * (w / 2 - 6);
      const y0 = h * (1 - v), len = hw * rnd(0.85, 1.05), ang = 0.55 + v * 0.25;
      const L = hsl.l * 100 + (v - 0.5) * 18 + rnd(-8, 8) - (side > 0 ? 4 : 0);
      c.strokeStyle = shade(L, rnd(-6, 6)); c.lineWidth = rnd(0.8, 1.8); c.globalAlpha = 0.55;
      c.beginPath(); c.moveTo(cx, y0);
      c.quadraticCurveTo(cx + side * len * 0.55, y0 - len * ang * 0.25, cx + side * len, y0 - len * ang * 0.7); c.stroke();
    }
    // splits (gaps in vane)
    c.globalCompositeOperation = 'destination-out'; c.globalAlpha = 1;
    for (let i = 0; i < 7; i++) {
      const v = rnd(0.25, 0.9), side = rnd() < 0.5 ? -1 : 1, hw = prof(v) * (w / 2), y0 = h * (1 - v);
      c.lineWidth = rnd(2, 4); c.beginPath(); c.moveTo(cx + side * hw * rnd(0.35, 0.6), y0 - hw * 0.3); c.lineTo(cx + side * hw * 1.1, y0 - hw * 0.95); c.stroke();
    }
    c.globalCompositeOperation = 'source-over';
    // fluffy down near base
    for (let i = 0; i < 260; i++) {
      const v = rnd(0, 0.16), side = rnd(-1, 1), y0 = h * (1 - v);
      c.strokeStyle = `rgba(255,255,255,${rnd(0.15, 0.4)})`; c.lineWidth = 1; c.beginPath(); c.moveTo(cx, y0);
      c.lineTo(cx + side * rnd(20, 70), y0 - rnd(10, 60)); c.stroke();
    }
    // rachis
    const g = c.createLinearGradient(0, h, 0, 0); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, 'rgba(255,250,240,.6)');
    c.fillStyle = g; c.beginPath(); c.moveTo(cx - 5, h); c.lineTo(cx - 1, h * 0.01); c.lineTo(cx + 1, h * 0.01); c.lineTo(cx + 5, h); c.fill();
  });
  return (featherCache[hex] = t);
}
export function featherGeo(L, Wd, bend, curl) {
  const g = new THREE.PlaneGeometry(Wd, L, 10, 40); g.translate(0, L / 2, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), v = y / L; p.setZ(i, -bend * v * v * L - curl * (x / Wd) * (x / Wd) * Wd); }
  g.computeVertexNormals(); return g;
}


// realistic FLIX toy: orange honeycomb rubber dome, red brim + collar with label, 3 long feathers
export function makeToy(o = {}) {
  const g = new THREE.Group(), cols = o.colors || [C.blue, C.green, C.yel];
  const bump = hexBump(); bump.wrapS = bump.wrapT = THREE.RepeatWrapping; bump.repeat.set(3, 1.5);
  const dome = mesh(new THREE.SphereGeometry(0.5, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), phys(o.base || 0xf08a24, { roughness: 0.62, bumpMap: bump, bumpScale: 1.2, sheen: 0.3, sheenColor: 0xffc080 }), g);
  dome.scale.set(1, 0.85, 1);
  const red = phys(C.red, { roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const brim = mesh(new THREE.CylinderGeometry(0.6, 0.62, 0.08, 64), red, g, 0, 0.03, 0);
  const lip = mesh(new THREE.TorusGeometry(0.6, 0.04, 16, 64), red, g, 0, 0.03, 0); lip.rotation.x = Math.PI / 2;
  const label = canvasTex(1024, 128, (c, w, h) => {
    c.fillStyle = '#d81f0e'; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(0, 10, w, 4); c.fillRect(0, h - 14, w, 4);
    if (LOGO) for (let i = 0; i < 4; i++) c.drawImage(LOGO, i * 256 + 92, 30, 72, 64);
  });
  label.wrapS = THREE.RepeatWrapping;
  const collar = mesh(new THREE.CylinderGeometry(0.27, 0.3, 0.42, 64, 1, true), phys(0xffffff, { map: label, roughness: 0.3, clearcoat: 0.7, side: THREE.DoubleSide }), g, 0, 0.27, 0);
  mesh(new THREE.TorusGeometry(0.27, 0.025, 12, 48), red, g, 0, 0.48, 0).rotation.x = Math.PI / 2;
  mesh(new THREE.CircleGeometry(0.27, 32), phys(0x5a1a10, { roughness: 0.9 }), g, 0, 0.47, 0).rotation.x = -Math.PI / 2;
  const feathers = []; g.userData.feathers = feathers; const L = o.len ?? 2.5, spread = [-0.32, 0, 0.32], tilt = [0.06, -0.05, 0.08];
  cols.forEach((col, i) => {
    const m = phys(0xffffff, { map: featherTex(col), alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.55, sheen: 0.8, sheenColor: new THREE.Color(col).lerp(new THREE.Color(0xffffff), 0.5), sheenRoughness: 0.4 });
    const f = mesh(featherGeo(L * (i === 1 ? 1.06 : 0.97), 0.62, 0.08, 0.12), m, null);
    const piv = new THREE.Group(); feathers.push(piv); piv.position.set((i - 1) * 0.1, 0.4, (i === 1 ? -0.05 : 0.04)); piv.rotation.set(tilt[i], (i - 1) * 0.5, spread[i]); piv.add(f); g.add(piv);
    f.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: m.map, alphaTest: 0.35 });
  });
  g.userData.baseRot = feathers.map(f => f.rotation.clone());
  return g;
}


export function featherOnly(col) {
  const g = new THREE.Group();
  const m = phys(0xffffff, { map: featherTex(col), alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.5, emissive: col, emissiveIntensity: 0.35, sheen: 0.8, sheenColor: 0xffffff });
  const f = mesh(featherGeo(2.4, 0.62, 0.08, 0.12), m, g); f.position.y = -0.2; f.rotation.z = 0.25;
  f.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: m.map, alphaTest: 0.35 });
  return g;
}
