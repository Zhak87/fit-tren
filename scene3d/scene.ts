/**
 * 3D-сцена FIT / AI: собственная процедурная модель тела с отдельными мышцами,
 * вращение, выбор мышцы касанием и анимация техники упражнений.
 * Собирается esbuild в одну HTML-строку (npm run build:3d) и работает
 * в WebView на телефоне и в iframe в веб-версии.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PATTERNS, type Pattern, type Pose, type Vec3 } from './patterns';

type Sex = 'male' | 'female';
type Prop = 'none' | 'dumbbells' | 'barbell' | 'kettlebell';
interface Config {
  type: 'config';
  sex: Sex;
  mode: 'map' | 'demo';
  selected?: string | null;
  secondary?: string[];
  pattern?: string;
  prop?: Prop;
  az?: number;
  autoRotate?: boolean;
  t?: number; // зафиксировать фазу анимации (0 — поза A, 1 — поза B)
}

const ACCENT = 0xc8ff3d;

// ───────── связь с приложением ─────────
function post(msg: unknown) {
  const w = window as unknown as { ReactNativeWebView?: { postMessage: (s: string) => void } };
  if (w.ReactNativeWebView) w.ReactNativeWebView.postMessage(JSON.stringify(msg));
  else window.parent?.postMessage({ __fitai: true, ...(msg as object) }, '*');
}

// ───────── рендер ─────────
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
let renderer: THREE.WebGLRenderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch {
  post({ type: 'error', message: 'webgl' });
  throw new Error('WebGL недоступен');
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.35;

const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 50);
camera.position.set(0, 1.1, 4.2);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 1.6;
controls.maxDistance = 7;
controls.rotateSpeed = 0.8;
controls.target.set(0, 0.95, 0);

scene.add(new THREE.HemisphereLight(0xe8eeff, 0x15171c, 1.2));
const key = new THREE.DirectionalLight(0xffffff, 2.4);
key.position.set(2.2, 3.5, 3);
scene.add(key);
const rim = new THREE.DirectionalLight(0x9fb4ff, 1.8);
rim.position.set(-2.5, 2.2, -3);
scene.add(rim);
const rim2 = new THREE.DirectionalLight(0xc8ff3d, 0.5);
rim2.position.set(2.5, 1, -2.5);
scene.add(rim2);

// подсветка пола
function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  grd.addColorStop(0, 'rgba(200,255,61,0.35)');
  grd.addColorStop(0.45, 'rgba(200,255,61,0.08)');
  grd.addColorStop(1, 'rgba(200,255,61,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}
const floor = new THREE.Mesh(new THREE.CircleGeometry(1.1, 64), new THREE.MeshBasicMaterial({ map: glowTexture(), transparent: true, depthWrite: false }));
floor.rotation.x = -Math.PI / 2;
scene.add(floor);
const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.635, 96), new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.35 }));
ring.rotation.x = -Math.PI / 2;
ring.position.y = 0.002;
scene.add(ring);

// ───────── материалы ─────────
const skinMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.5, metalness: 0.04, clearcoat: 0.45, clearcoatRoughness: 0.35, sheen: 0.25, sheenColor: new THREE.Color(0x8d96a8) });
const hairMat = new THREE.MeshPhysicalMaterial({ color: 0x121418, roughness: 0.75, sheen: 0.6, sheenColor: new THREE.Color(0x3a3f4a) });
// пульсирующая подсветка выбранной мышцы (через атрибут aSel)
const pulse = { value: 0.3 };
skinMat.onBeforeCompile = (sh) => {
  sh.uniforms.uPulse = pulse;
  sh.vertexShader = 'attribute float aSel;\nvarying float vSel;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvSel = aSel;');
  sh.fragmentShader = 'uniform float uPulse;\nvarying float vSel;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.55, 0.75, 0.12) * vSel * uPulse;');
};
const C_SKIN = new THREE.Color(0x23272e);
const C_MUSCLE = new THREE.Color(0x56606f);
const C_SEL = new THREE.Color(ACCENT);
const C_SEC = new THREE.Color(0x7f9c36);
const propMat = new THREE.MeshPhysicalMaterial({ color: 0x9aa0aa, metalness: 0.85, roughness: 0.3 });
const plateMat = new THREE.MeshPhysicalMaterial({ color: 0x1c1f25, metalness: 0.3, roughness: 0.5, clearcoat: 0.6 });
const benchMat = new THREE.MeshPhysicalMaterial({ color: 0x23262d, roughness: 0.7 });

const SPHERE = new THREE.SphereGeometry(1, 64, 44);

// ───────── модель ─────────
interface Body {
  root: THREE.Group;
  joints: Record<string, THREE.Object3D>;
  rest: Record<string, THREE.Vector3>;
  muscles: THREE.Object3D[];
  skins: THREE.Mesh[];
  points: Record<string, THREE.Object3D>;
}

function joint(name: string, parent: THREE.Object3D, x: number, y: number, z: number, b: Partial<Body>) {
  const o = new THREE.Object3D();
  o.name = name;
  o.position.set(x, y, z);
  parent.add(o);
  b.joints![name] = o;
  b.rest![name] = o.position.clone();
  return o;
}

function ell(parent: THREE.Object3D, p: Vec3, s: Vec3, mat: THREE.Material, r: Vec3 = [0, 0, 0]) {
  const m = new THREE.Mesh(SPHERE, mat);
  m.position.set(...p);
  m.scale.set(...s);
  m.rotation.set(...r);
  parent.add(m);
  return m;
}

function cap(parent: THREE.Object3D, r: number, len: number, y: number, mat: THREE.Material, r2?: number) {
  const g = new THREE.CapsuleGeometry(r, len, 10, 24);
  if (r2) {
    // лёгкое сужение к дистальному концу
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const yy = pos.getY(i);
      const t = THREE.MathUtils.clamp((yy + len / 2 + r) / (len + 2 * r), 0, 1);
      const k = THREE.MathUtils.lerp(r2 / r, 1, t);
      pos.setX(i, pos.getX(i) * k);
      pos.setZ(i, pos.getZ(i) * k);
    }
    g.computeVertexNormals();
  }
  const m = new THREE.Mesh(g, mat);
  m.position.y = y;
  parent.add(m);
  return m;
}

/** Сечение: [y, полуширина, глубина спереди, глубина сзади, сдвиг по z]. */
type Ring = [number, number, number, number, number?];

/** Гладкая «вытянутая» форма по сечениям (торс, конечности) со скруглёнными торцами. */
function loft(parent: THREE.Object3D, rings: Ring[], mat: THREE.Material, opt: { seg?: number; sub?: number; sq?: number; x?: number } = {}) {
  const seg = opt.seg ?? 128;
  const sub = opt.sub ?? 14;
  const sq = opt.sq ?? 2; // показатель суперэллипса: >2 — «квадратнее»
  const cr = (a: number, b: number, c: number, d: number, t: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  const val = (r: Ring, k: number): number => r[k] ?? 0;
  const dense: number[][] = [];
  for (let i = 0; i < rings.length - 1; i++) {
    const r0 = rings[Math.max(0, i - 1)], r1 = rings[i], r2 = rings[i + 1], r3 = rings[Math.min(rings.length - 1, i + 2)];
    for (let s = 0; s < sub; s++) {
      const t = s / sub;
      dense.push([0, 1, 2, 3, 4].map((k) => cr(val(r0, k), val(r1, k), val(r2, k), val(r3, k), t)));
    }
  }
  const lastR = rings[rings.length - 1];
  dense.push([0, 1, 2, 3, 4].map((k) => val(lastR, k)));
  // скруглённые торцы
  const capRings = (r: number[], dir: number) => {
    const out: number[][] = [];
    const len = Math.min(r[1], (r[2] + r[3]) / 2) * 0.9;
    for (let k = 1; k <= 4; k++) {
      const a = (k / 4) * (Math.PI / 2);
      const f = Math.max(Math.cos(a), 0.001);
      out.push([r[0] + dir * Math.sin(a) * len, r[1] * f, r[2] * f, r[3] * f, r[4]]);
    }
    return out;
  };
  const all = [...capRings(dense[0], Math.sign(dense[0][0] - dense[1][0]) || 1).reverse(), ...dense, ...capRings(dense[dense.length - 1], Math.sign(dense[dense.length - 1][0] - dense[dense.length - 2][0]) || -1)];
  const pos: number[] = [];
  const idx: number[] = [];
  const e = 2 / sq;
  for (const r of all) {
    for (let j = 0; j < seg; j++) {
      const th = (j / seg) * Math.PI * 2;
      const c = Math.cos(th), sn = Math.sin(th);
      const cx = Math.sign(c) * Math.pow(Math.abs(c), e);
      const sz = Math.sign(sn) * Math.pow(Math.abs(sn), e);
      pos.push((opt.x ?? 0) + r[1] * cx, r[0], r[4] + (sz > 0 ? r[2] : r[3]) * sz);
    }
  }
  for (let i = 0; i < all.length - 1; i++) {
    for (let j = 0; j < seg; j++) {
      const a = i * seg + j, b = i * seg + ((j + 1) % seg), c = (i + 1) * seg + j, d = (i + 1) * seg + ((j + 1) % seg);
      idx.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  // направление обхода зависит от порядка y: при необходимости переворачиваем
  const n = g.attributes.normal;
  let outward = 0;
  for (let i = 0; i < pos.length / 3; i += 7) outward += n.getX(i) * (pos[i * 3] - (opt.x ?? 0)) + n.getZ(i) * (pos[i * 3 + 2] - (all[Math.floor(i / seg)][4] ?? 0));
  if (outward < 0) {
    for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
    g.setIndex(idx);
    g.computeVertexNormals();
  }
  const m = new THREE.Mesh(g, mat);
  parent.add(m);
  return m;
}

function point(name: string, parent: THREE.Object3D, p: Vec3, b: Partial<Body>) {
  const o = new THREE.Object3D();
  o.position.set(...p);
  parent.add(o);
  b.points![name] = o;
}

function buildBody(sex: Sex): Body {
  const F = sex === 'female';
  const b: Partial<Body> = { joints: {}, rest: {}, muscles: [], skins: [], points: {} };
  const root = new THREE.Group();
  b.root = root;
  b.joints!.root = root;
  b.rest!.root = new THREE.Vector3();

  const shX = F ? 0.172 : 0.205;
  const hipX = F ? 0.094 : 0.09;
  const M = (parent: THREE.Object3D, id: string, p: Vec3, s: Vec3, r: Vec3 = [0, 0, 0]) => {
    // мышца задаётся эллипсоидом: им «рисуется» и выдавливается рельеф на коже
    const m = new THREE.Object3D();
    m.position.set(...p);
    m.scale.set(...s);
    m.rotation.set(...r);
    parent.add(m);
    m.userData.muscle = id;
    b.muscles!.push(m);
    return m;
  };

  const spine = joint('spine', root, 0, 0.06, 0, b);
  const chest = joint('chest', spine, 0, 0.24, 0, b);
  const neck = joint('neck', chest, 0, 0.27, -0.012, b);
  const head = joint('head', neck, 0, 0.075, 0.005, b);

  // корпус: таз, живот, грудная клетка — гладкие сечения
  const w = (m: number, f: number) => (F ? f : m);
  loft(root, [
    [-0.16, w(0.105, 0.115), 0.065, w(0.07, 0.08)],
    [-0.1, w(0.152, 0.172), w(0.082, 0.085), w(0.098, 0.118)],
    [-0.03, w(0.16, 0.176), 0.088, w(0.1, 0.112)],
    [0.05, w(0.148, 0.152), 0.088, w(0.09, 0.092)],
    [0.12, w(0.14, 0.13), 0.088, 0.085],
  ], skinMat, { sq: 2.3 });
  loft(spine, [
    [-0.04, w(0.142, 0.132), 0.088, 0.086],
    [0.05, w(0.135, 0.118), 0.09, 0.082],
    [0.14, w(0.145, 0.122), 0.095, 0.084],
    [0.22, w(0.162, 0.135), 0.103, 0.09],
    [0.29, w(0.172, 0.145), 0.108, 0.094],
  ], skinMat, { sq: 2.3 });
  loft(chest, [
    [-0.05, w(0.17, 0.142), 0.106, 0.093],
    [0.04, w(0.182, 0.15), 0.114, 0.098],
    [0.12, w(0.192, 0.156), 0.116, 0.1],
    [0.19, w(0.188, 0.152), 0.1, 0.096],
    [0.245, w(0.155, 0.125), 0.072, 0.085],
    [0.285, w(0.075, 0.062), 0.052, 0.058],
  ], skinMat, { sq: 2.4 });
  cap(neck, w(0.05, 0.043), 0.07, 0.025, skinMat);
  // голова: череп, лицо, челюсть
  ell(head, [0, 0.105, -0.005], [0.083, 0.1, 0.095], skinMat);
  ell(head, [0, 0.06, 0.035], [0.066, 0.075, 0.07], skinMat);
  ell(head, [0, 0.035, 0.028], [w(0.056, 0.048), 0.045, 0.058], skinMat);
  for (const sx of [1, -1]) ell(head, [sx * 0.082, 0.085, 0], [0.012, 0.022, 0.014], skinMat);
  ell(head, [0, 0.135, -0.012], [0.088, 0.085, 0.1], hairMat);
  if (F) {
    ell(head, [0, 0.1, -0.06], [0.086, 0.09, 0.07], hairMat);
    const bun = ell(head, [0, 0.13, -0.11], [0.04, 0.04, 0.04], hairMat);
    bun.userData.hair = true;
    const tail = cap(head, 0.028, 0.13, 0, hairMat, 0.012);
    tail.position.set(0, 0.04, -0.13);
    tail.rotation.x = 0.25;
  }

  // мышцы корпуса
  for (const sx of [1, -1]) {
    if (F) {
      M(chest, 'chest', [sx * 0.07, 0.15, 0.08], [0.08, 0.065, 0.042], [0.1, sx * 0.3, sx * -0.15]);
      ell(chest, [sx * 0.066, 0.1, 0.092], [0.06, 0.056, 0.05], skinMat);
    } else {
      M(chest, 'chest', [sx * 0.08, 0.14, 0.082], [0.095, 0.078, 0.046], [0.12, sx * 0.3, sx * -0.12]);
    }
    M(chest, 'traps', [sx * 0.07, 0.24, -0.025], [0.09, 0.04, 0.055], [0, 0, sx * 0.38]);
    M(chest, 'traps', [sx * 0.045, 0.13, -0.068], [0.065, 0.12, 0.032], [0, 0, sx * -0.3]);
    M(chest, 'lats', [sx * w(0.105, 0.088), 0.04, -0.04], [0.068, 0.16, 0.05], [0.1, sx * 0.45, sx * -0.26]);
    M(spine, 'obliques', [sx * w(0.105, 0.09), 0.12, 0.03], [0.042, 0.11, 0.066], [0, 0, sx * 0.1]);
    M(spine, 'lowerback', [sx * 0.035, 0.12, -0.058], [0.036, 0.14, 0.034]);
    M(root, 'glutes', [sx * w(0.072, 0.08), -0.06, -0.06], F ? [0.092, 0.105, 0.075] : [0.082, 0.095, 0.065], [0, sx * 0.25, 0]);
    for (let r = 0; r < 4; r++) M(spine, 'abs', [sx * 0.034, 0.245 - r * 0.068, [0.097, 0.092, 0.086, 0.08][r]], [0.033, r === 3 ? 0.042 : 0.032, 0.026]);
  }

  // руки и ноги
  for (const side of ['L', 'R'] as const) {
    const sx = side === 'L' ? 1 : -1;
    const sh = joint('shoulder' + side, chest, sx * shX, 0.2, -0.01, b);
    const el = joint('elbow' + side, sh, 0, w(-0.29, -0.275), 0, b);
    const hd = joint('hand' + side, el, 0, w(-0.255, -0.24), 0, b);
    const a = F ? 0.85 : 1;
    ell(sh, [0, -0.005, 0], [0.05 * a, 0.05 * a, 0.05 * a], skinMat);
    loft(sh, [[0.0, 0.048 * a, 0.048 * a, 0.048 * a], [-0.08, 0.047 * a, 0.045 * a, 0.047 * a], [-0.17, 0.043 * a, 0.042 * a, 0.043 * a], [-0.26, 0.036 * a, 0.034 * a, 0.035 * a], [-0.3, 0.035 * a, 0.033 * a, 0.033 * a]], skinMat, { seg: 64, sub: 10 });
    ell(el, [0, 0, 0], [0.037 * a, 0.037 * a, 0.037 * a], skinMat);
    loft(el, [[0.01, 0.037 * a, 0.035 * a, 0.035 * a], [-0.06, 0.042 * a, 0.037 * a, 0.038 * a], [-0.15, 0.034 * a, 0.029 * a, 0.03 * a], [-0.24, 0.026 * a, 0.019 * a, 0.019 * a]], skinMat, { seg: 64, sub: 10 });
    ell(hd, [0, -0.055, 0.004], [0.036 * a, 0.062 * a, 0.017 * a], skinMat);
    const th = cap(hd, 0.011 * a, 0.035, 0, skinMat);
    th.position.set(sx * 0.03 * a, -0.035, 0.018);
    th.rotation.set(0.5, 0, sx * 0.5);
    M(sh, 'shoulders', [sx * 0.008, -0.04, 0], [0.058 * a, 0.09 * a, 0.06 * a], [0, 0, sx * 0.12]);
    M(sh, 'biceps', [0, -0.155, 0.02], [0.038 * a, 0.1, 0.038 * a]);
    M(sh, 'triceps', [0, -0.14, -0.02], [0.041 * a, 0.12, 0.04 * a]);
    M(el, 'forearms', [sx * 0.006, -0.07, 0.002], [0.043 * a, 0.1, 0.038 * a], [0, 0, sx * 0.05]);

    const hp = joint('hip' + side, root, sx * hipX, -0.07, 0, b);
    const kn = joint('knee' + side, hp, 0, w(-0.44, -0.425), 0, b);
    const an = joint('ankle' + side, kn, 0, w(-0.42, -0.405), 0, b);
    const l = F ? 1.04 : 1;
    loft(hp, [[0.07, 0.088 * l, 0.085, 0.092 * l], [-0.04, 0.09 * l, 0.088, 0.09 * l], [-0.17, 0.082 * l, 0.08, 0.078], [-0.31, 0.066, 0.064, 0.062], [-0.42, 0.054, 0.054, 0.05]], skinMat, { seg: 72, sub: 10 });
    ell(kn, [0, 0.0, 0.006], [0.052, 0.055, 0.052], skinMat);
    loft(kn, [[0.02, 0.052, 0.05, 0.05, 0.002], [-0.05, 0.05, 0.044, 0.062], [-0.13, 0.048, 0.04, 0.066], [-0.24, 0.037, 0.034, 0.044], [-0.36, 0.028, 0.028, 0.03], [-0.41, 0.029, 0.028, 0.03]], skinMat, { seg: 72, sub: 10 });
    ell(an, [0, -0.01, 0], [0.033, 0.035, 0.035], skinMat);
    loft(an, [[0.0, 0.03, 0.03, 0.03], [-0.04, 0.038, 0.036, 0.035], [-0.07, 0.04, 0.02, 0.03]], skinMat, { seg: 20, sub: 3 }).visible = false;
    const foot = ell(an, [sx * 0.004, -0.048, 0.05], [0.038, 0.03, 0.105], skinMat, [0.05, 0, 0]);
    foot.userData.foot = true;
    M(hp, 'quads', [sx * 0.01, -0.2, 0.03], [0.075, 0.2, 0.068]);
    M(hp, 'quads', [-sx * 0.03, -0.33, 0.03], [0.045, 0.08, 0.045]);
    M(hp, 'hamstrings', [0, -0.22, -0.03], [0.07, 0.19, 0.062]);
    M(hp, 'adductors', [-sx * 0.036, -0.12, 0.006], [0.05, 0.13, 0.058]);
    M(kn, 'calves', [sx * 0.014, -0.11, -0.026], [0.036, 0.105, 0.045]);
    M(kn, 'calves', [-sx * 0.016, -0.115, -0.024], [0.034, 0.1, 0.045]);

    point('heel' + side, an, [0, -0.078, -0.035], b);
    point('toe' + side, an, [0, -0.07, 0.155], b);
    point('hand' + side, hd, [0, -0.11, 0], b);
    point('grip' + side, hd, [0, -0.065, 0.01], b);
    point('knee' + side, kn, [0, 0, 0.055], b);
    point('elbow' + side, el, [0, 0, -0.04], b);
  }
  point('barBack', chest, [0, 0.255, -0.1], b);
  point('barFront', chest, [0, 0.235, 0.1], b);
  point('barHips', root, [0, -0.05, 0.13], b);
  point('chestBack', chest, [0, 0.13, -0.1], b);
  point('pelvisBack', root, [0, -0.03, -0.11], b);
  point('chestFront', chest, [0, 0.12, 0.12], b);
  point('pelvisFront', root, [0, -0.04, 0.09], b);
  point('seat', root, [0, -0.13, -0.03], b);
  point('headTop', head, [0, 0.21, 0], b);
  point('head', head, [0, 0.1, 0], b);

  paintMuscles(b as Body);
  root.scale.setScalar(F ? 0.96 : 1);
  return b as Body;
}

// ───────── снаряды ─────────
function dumbbell() {
  const g = new THREE.Group();
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.16, 16), propMat);
  h.rotation.z = Math.PI / 2;
  g.add(h);
  for (const s of [1, -1]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 24), plateMat);
    p.rotation.z = Math.PI / 2;
    p.position.x = s * 0.09;
    g.add(p);
  }
  return g;
}
function barbell() {
  const g = new THREE.Group();
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 1.5, 16), propMat);
  bar.rotation.z = Math.PI / 2;
  g.add(bar);
  for (const s of [1, -1]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 40), plateMat);
    p.rotation.z = Math.PI / 2;
    p.position.x = s * 0.6;
    g.add(p);
  }
  return g;
}
function kettlebell() {
  const g = new THREE.Group();
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 18), plateMat);
  ball.position.y = -0.09;
  g.add(ball);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.011, 10, 24, Math.PI), propMat);
  handle.position.y = -0.03;
  g.add(handle);
  return g;
}

// ───────── состояние ─────────
let cfg: Config = { type: 'config', sex: 'male', mode: 'map', selected: null, secondary: [] };
let body: Body | null = null;
let props: { dl?: THREE.Object3D; dr?: THREE.Object3D; bar?: THREE.Object3D; kb?: THREE.Object3D; bench?: THREE.Mesh; pullbar?: THREE.Mesh; seat?: THREE.Mesh; dipbars?: THREE.Group; thrustBench?: THREE.Mesh } = {};
let pattern: Pattern | null = null;
let poseA: Map<string, THREE.Quaternion> | null = null;
let poseB: Map<string, THREE.Quaternion> | null = null;
let interacted = false;
let clock = 0;

function setSex(sex: Sex) {
  if (body) scene.remove(body.root);
  body = buildBody(sex);
  scene.add(body.root);
}

const MUSCLE_IDS: string[] = [];
const smooth = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Переносит мышцы-эллипсоиды на кожу: рельеф (смещение по нормали), id мышцы и бороздки на каждой вершине. */
function paintMuscles(b: Body) {
  b.root.updateMatrixWorld(true);
  const rootInv = new THREE.Matrix4().copy(b.root.matrixWorld).invert();
  const ells = b.muscles.map((m) => {
    const id = m.userData.muscle as string;
    if (!MUSCLE_IDS.includes(id)) MUSCLE_IDS.push(id);
    const mat = new THREE.Matrix4().multiplyMatrices(rootInv, m.matrixWorld);
    return { idx: MUSCLE_IDS.indexOf(id), inv: mat.clone().invert(), depth: Math.min(m.scale.x, m.scale.y, m.scale.z) };
  });
  for (const m of b.muscles) m.parent?.remove(m);
  const skins: THREE.Mesh[] = [];
  b.root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && (o as THREE.Mesh).material === skinMat) skins.push(o as THREE.Mesh);
  });
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  const u = new THREE.Vector3();
  for (const mesh of skins) {
    mesh.geometry = mesh.geometry.clone();
    const g = mesh.geometry;
    if (!g.attributes.normal) g.computeVertexNormals();
    const pos = g.attributes.position;
    const nor = g.attributes.normal;
    const toRoot = new THREE.Matrix4().multiplyMatrices(rootInv, mesh.matrixWorld);
    const fromRoot = toRoot.clone().invert();
    const nm = new THREE.Matrix3().getNormalMatrix(toRoot);
    const mids = new Int16Array(pos.count).fill(-1);
    const groove = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(toRoot);
      let best = 9, second = 9, bi = -1, bd = 0;
      for (const e of ells) {
        const d = u.copy(v).applyMatrix4(e.inv).length();
        if (d < best) {
          if (bi !== e.idx) second = best;
          best = d;
          bi = e.idx;
          bd = e.depth;
        } else if (d < second && e.idx !== bi) second = d;
      }
      if (best >= 1.12) continue;
      mids[i] = bi;
      const seam = second < 1.12 ? 1 - smooth(0, 0.14, second - best) : 0;
      groove[i] = (1 - smooth(0.74, 1.1, best)) * (1 - 0.7 * seam);
      const bulge = best < 1 ? bd * 0.38 * (1 - best * best) * (1 - 0.65 * seam) : 0;
      n.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize();
      v.addScaledVector(n, bulge).applyMatrix4(fromRoot);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(pos.count * 3), 3));
    g.setAttribute('aSel', new THREE.Float32BufferAttribute(new Float32Array(pos.count), 1));
    mesh.userData.mids = mids;
    mesh.userData.groove = groove;
    b.skins.push(mesh);
  }
}

const cTmp = new THREE.Color();
function applyHighlight() {
  if (!body) return;
  const sel = cfg.selected ? MUSCLE_IDS.indexOf(cfg.selected) : -2;
  const sec = new Set((cfg.secondary ?? []).map((id) => MUSCLE_IDS.indexOf(id)));
  for (const mesh of body.skins) {
    const mids = mesh.userData.mids as Int16Array;
    const groove = mesh.userData.groove as Float32Array;
    const col = mesh.geometry.attributes.color as THREE.BufferAttribute;
    const aSel = mesh.geometry.attributes.aSel as THREE.BufferAttribute;
    for (let i = 0; i < mids.length; i++) {
      const id = mids[i];
      if (id < 0) {
        col.setXYZ(i, C_SKIN.r, C_SKIN.g, C_SKIN.b);
        aSel.setX(i, 0);
        continue;
      }
      const base = id === sel ? C_SEL : sec.has(id) ? C_SEC : C_MUSCLE;
      const wgt = groove[i];
      cTmp.copy(C_SKIN).lerp(base, id === sel ? Math.min(1, wgt * 1.25) : wgt);
      col.setXYZ(i, cTmp.r, cTmp.g, cTmp.b);
      aSel.setX(i, id === sel ? wgt : 0);
    }
    col.needsUpdate = true;
    aSel.needsUpdate = true;
  }
}

function poseQuats(p: Pose): Map<string, THREE.Quaternion> {
  const map = new Map<string, THREE.Quaternion>();
  const all = { ...PATTERNS.rest.a, ...p };
  for (const [k, v] of Object.entries(all)) {
    if (k === 'lift' || k === 'shift') continue;
    map.set(k, new THREE.Quaternion().setFromEuler(new THREE.Euler(...(v as Vec3))));
  }
  return map;
}

const IDENT = new THREE.Quaternion();
function applyPose(qa: Map<string, THREE.Quaternion>, qb: Map<string, THREE.Quaternion>, t: number) {
  if (!body) return;
  for (const [name, j] of Object.entries(body.joints)) {
    j.quaternion.slerpQuaternions(qa.get(name) ?? IDENT, qb.get(name) ?? IDENT, t);
  }
  // смещения суставов (например, шраги)
  const la = pattern?.a.lift ?? {};
  const lb = pattern?.b.lift ?? {};
  for (const [name, rest] of Object.entries(body.rest)) {
    if (name === 'root') continue;
    const da = la[name] ?? [0, 0, 0];
    const db = lb[name] ?? [0, 0, 0];
    body.joints[name].position.set(rest.x + THREE.MathUtils.lerp(da[0], db[0], t), rest.y + THREE.MathUtils.lerp(da[1], db[1], t), rest.z + THREE.MathUtils.lerp(da[2], db[2], t));
  }
}

const tmp = new THREE.Vector3();
function ground() {
  if (!body) return;
  const root = body.root;
  root.position.set(0, 1, 0);
  root.updateMatrixWorld(true);
  const g = pattern?.ground ?? { points: ['heelL', 'heelR', 'toeL', 'toeR'], y: 0, mode: 'min' as const };
  let v = g.mode === 'max' ? -Infinity : Infinity;
  for (const n of g.points) {
    body.points[n].getWorldPosition(tmp);
    v = g.mode === 'max' ? Math.max(v, tmp.y) : Math.min(v, tmp.y);
  }
  root.position.y += g.y - v;
  // центрируем по горизонтали по опорным точкам
  if (pattern?.center) {
    root.updateMatrixWorld(true);
    let cz = 0;
    for (const n of pattern.center) {
      body.points[n].getWorldPosition(tmp);
      cz += tmp.z;
    }
    root.position.z -= cz / pattern.center.length;
  }
  root.updateMatrixWorld(true);
}

const pA = new THREE.Vector3();
const pB = new THREE.Vector3();
function updateProps() {
  if (!body) return;
  body.points.gripL.getWorldPosition(pA);
  body.points.gripR.getWorldPosition(pB);
  if (props.dl && props.dr) {
    props.dl.position.copy(pA);
    props.dr.position.copy(pB);
    const yaw = pattern?.dbYaw ?? 0;
    props.dl.rotation.set(0, yaw, 0);
    props.dr.rotation.set(0, -yaw, 0);
  }
  if (props.bar) {
    if (pattern?.bar === 'back') body.points.barBack.getWorldPosition(props.bar.position);
    else if (pattern?.bar === 'front') body.points.barFront.getWorldPosition(props.bar.position);
    else if (pattern?.bar === 'hips') body.points.barHips.getWorldPosition(props.bar.position);
    else props.bar.position.copy(pA).add(pB).multiplyScalar(0.5);
  }
  if (props.kb) props.kb.position.copy(pA).add(pB).multiplyScalar(0.5);
  if (props.pullbar && pattern?.ground?.mode === 'max') props.pullbar.position.set(0, (pattern.ground.y ?? 2.2) + 0.03, props.pullbar.position.z);
}

function clearProps() {
  for (const p of Object.values(props)) if (p) scene.remove(p);
  props = {};
}

function setupDemo() {
  clearProps();
  pattern = (cfg.pattern && PATTERNS[cfg.pattern]) || PATTERNS.squat;
  poseA = poseQuats(pattern.a);
  poseB = poseQuats(pattern.b);
  const prop = pattern.forceProp ?? cfg.prop ?? 'none';
  if (prop === 'dumbbells') {
    props.dl = dumbbell();
    props.dr = dumbbell();
    scene.add(props.dl, props.dr);
  } else if (prop === 'barbell') {
    props.bar = barbell();
    scene.add(props.bar);
  } else if (prop === 'kettlebell') {
    props.kb = kettlebell();
    scene.add(props.kb);
  }
  for (const s of pattern.scene ?? []) {
    if (s === 'bench') {
      props.bench = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 1.0), benchMat);
      scene.add(props.bench);
    }
    if (s === 'pullbar') {
      props.pullbar = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.2, 16), propMat);
      props.pullbar.rotation.z = Math.PI / 2;
      scene.add(props.pullbar);
    }
    if (s === 'thrustBench') {
      props.thrustBench = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1, 0.34), benchMat);
      scene.add(props.thrustBench);
    }
    if (s === 'dipbars') {
      const g = new THREE.Group();
      for (const sx of [1, -1]) {
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.9, 16), propMat);
        bar.rotation.x = Math.PI / 2;
        bar.position.set(sx * 0.27, 0, 0);
        g.add(bar);
        for (const sz of [1, -1]) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.15, 12), benchMat);
          post.position.set(sx * 0.27, -0.575, sz * 0.4);
          g.add(post);
        }
      }
      props.dipbars = g;
      scene.add(g);
    }
    if (s === 'seat') {
      props.seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.4), benchMat);
      scene.add(props.seat);
    }
  }
  // кадрирование по обеим позам
  const box = new THREE.Box3();
  for (const t of [0, 1]) {
    applyPose(poseA, poseB, t);
    ground();
    box.expandByObject(body!.root);
  }
  placeStatic();
  frame(box, pattern.view ?? 55);
}

function placeStatic() {
  if (!body || !pattern) return;
  applyPose(poseA!, poseB!, 0);
  ground();
  if (props.bench) {
    body.points.chestBack.getWorldPosition(pA);
    body.points.pelvisBack.getWorldPosition(pB);
    const top = Math.min(pA.y, pB.y);
    props.bench.position.set(0, top - 0.21, (pA.z + pB.z) / 2 + 0.05);
  }
  if (props.seat) {
    body.points.seat.getWorldPosition(pA);
    props.seat.position.set(0, pA.y - 0.225, pA.z);
  }
  if (props.pullbar) props.pullbar.position.set(0, (pattern.ground?.y ?? 2.2) + 0.03, 0);
  if (props.thrustBench) {
    // скамья под лопатками: высота по позе B, где корпус горизонтален
    applyPose(poseA!, poseB!, 1);
    ground();
    body.points.chestBack.getWorldPosition(pA);
    const h = Math.max(0.2, pA.y);
    props.thrustBench.scale.y = h;
    props.thrustBench.position.set(0, h / 2, pA.z - 0.08);
    applyPose(poseA!, poseB!, 0);
    ground();
  }
  if (props.dipbars) {
    body.points.handL.getWorldPosition(pA);
    props.dipbars.position.set(0, pattern.ground?.y ?? 1.15, pA.z);
  }
}

function frame(box: THREE.Box3, azimuthDeg: number) {
  const c = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const r = Math.max(size.x, size.y, size.z) * 0.5 + 0.12;
  const dist = (r / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2))) * (camera.aspect < 1 ? (1 / Math.max(camera.aspect, 0.55)) * 0.75 : 1) * (cfg.mode === "demo" ? 0.86 : 1);
  const az = THREE.MathUtils.degToRad(azimuthDeg);
  controls.target.copy(c);
  camera.position.set(c.x + Math.sin(az) * dist, c.y + dist * 0.18, c.z + Math.cos(az) * dist);
  controls.update();
}

function setupMap() {
  clearProps();
  pattern = null;
  poseA = poseQuats({});
  poseB = poseA;
  applyPose(poseA, poseB, 0);
  ground();
  const box = new THREE.Box3().expandByObject(body!.root);
  frame(box, cfg.az ?? 0);
}

function configure(next: Config) {
  const sexChanged = !body || next.sex !== cfg.sex;
  const modeChanged = next.mode !== cfg.mode || next.pattern !== cfg.pattern || next.prop !== cfg.prop || (next.az !== undefined && next.az !== cfg.az);
  cfg = { ...cfg, ...next };
  if (sexChanged) setSex(cfg.sex);
  if (sexChanged || modeChanged) {
    clock = 0;
    if (cfg.mode === 'demo') setupDemo();
    else setupMap();
  }
  controls.autoRotate = cfg.mode === 'map' && !interacted && cfg.autoRotate !== false;
  controls.autoRotateSpeed = 0.8;
  applyHighlight();
}

// ───────── выбор мышцы касанием ─────────
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let down: { x: number; y: number } | null = null;
canvas.addEventListener('pointerdown', (e) => {
  down = { x: e.clientX, y: e.clientY };
  interacted = true;
  controls.autoRotate = false;
});
canvas.addEventListener('pointerup', (e) => {
  if (!down || !body) return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
  down = null;
  if (moved > 8 || cfg.mode !== 'map') return;
  const rect = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(body.skins, false)[0];
  const mids = hit?.object.userData.mids as Int16Array | undefined;
  let id: string | undefined;
  if (hit?.face && mids) {
    const c = [hit.face.a, hit.face.b, hit.face.c].map((k) => mids[k]).filter((k) => k >= 0);
    if (c.length) id = MUSCLE_IDS[c[0]];
  }
  if (id) {
    cfg.selected = id;
    applyHighlight();
    post({ type: 'select', muscle: id });
  }
});

// ───────── цикл ─────────
function resize() {
  const w = window.innerWidth || 1;
  const h = window.innerHeight || 1;
  renderer.setSize(w, h, false);
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
let last = performance.now();
function loop(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  clock += dt;
  if (cfg.mode === 'demo' && pattern && poseA && poseB) {
    const D = pattern.dur ?? 1.3;
    const H = pattern.hold ?? 0.35;
    const cyc = clock % (2 * D + 2 * H);
    let t: number;
    if (typeof cfg.t === 'number') t = cfg.t;
    else if (cyc < H) t = 0;
    else if (cyc < H + D) t = ease((cyc - H) / D);
    else if (cyc < 2 * H + D) t = 1;
    else t = 1 - ease((cyc - 2 * H - D) / D);
    applyPose(poseA, poseB, t);
    ground();
    updateProps();
  }
  // пульс выбранной мышцы
  pulse.value = 0.35 + Math.sin(clock * 3) * 0.2;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

// ───────── входящие сообщения ─────────
function receive(data: unknown) {
  let msg = data as Config | string;
  if (typeof msg === 'string') {
    try {
      msg = JSON.parse(msg);
    } catch {
      return;
    }
  }
  if (msg && typeof msg === 'object' && msg.type === 'config') configure(msg);
}
(window as unknown as { __recv: (d: unknown) => void }).__recv = receive;
window.addEventListener('message', (e) => receive(e.data));
document.addEventListener('message', (e) => receive((e as MessageEvent).data));

const init = (window as unknown as { __initConfig?: Config }).__initConfig;
configure(init ?? cfg);
requestAnimationFrame(loop);
post({ type: 'ready' });
