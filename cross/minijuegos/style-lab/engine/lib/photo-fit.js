// Start from a photo: the pieces that don't need the editor.
//
// Face points come from Google's MediaPipe Face Landmarker (web/vendor/mediapipe-tasks-vision-*,
// Apache-2.0), loaded only when someone uses this, and run in the browser: the photo never leaves it.
// The editor renders its own avatar's face at the photo's angle, finds the same 468 points on that
// picture, and moves the face sliders until the two sets match (align within the picture, then
// bounded least squares). Colors are sampled from the photo: skin, irises, sclera and the hair above
// the forehead.
//
//   loadLandmarker()                 the face finder (cached)
//   facePoints(landmarker, image)    { pts: Float64Array(468*3), raw: landmarks, blend: {name: score} } | null
//   alignFlat(p, ref, w)             p scaled, turned and shifted onto ref within the picture
//   solveBounded(J, r, x, lo, hi, λ, wt)  the step d minimizing |r - J d|² + λ|x + d|² (weighted), within bounds
//   loadHairSegmenter(), findHair(seg, image, raw)  how much hair is on top, and its color
//   headTurn(result)                 the head's yaw and pitch in degrees (face finder's head pose)
//   sampleColors(image, raw)         median colors (sRGB 0-255) of skin, sclera, irises and hair
//   lightness(rgb)                   CIELAB L* of an sRGB color

const MP = new URL("../vendor/mediapipe-tasks-vision-1.1.1/", import.meta.url).href;
const MESH = 468;  // the face mesh points (the 10 iris points after them are used for colors only)

let landmarker = null;
export function loadLandmarker() {
  landmarker ??= (async () => {
    const { FaceLandmarker, FilesetResolver } = await import(MP + "vision_bundle.mjs");
    const fileset = await FilesetResolver.forVisionTasks(MP + "wasm");
    const make = (delegate) => FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MP + "face_landmarker.task", delegate },
      runningMode: "IMAGE", numFaces: 1, outputFaceBlendshapes: true, outputFacialTransformationMatrixes: true });
    try { return await make("GPU"); } catch { return await make("CPU"); }
  })();
  landmarker.catch(() => { landmarker = null; });  // let a later try load it again
  return landmarker;
}

let segmenter = null;
/** The hair finder (MediaPipe's hair segmentation model, Apache-2.0): marks the hair in a picture. */
export function loadHairSegmenter() {
  segmenter ??= (async () => {
    const { ImageSegmenter, FilesetResolver } = await import(MP + "vision_bundle.mjs");
    const fileset = await FilesetResolver.forVisionTasks(MP + "wasm");
    const make = (delegate) => ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MP + "hair_segmenter.tflite", delegate },
      runningMode: "IMAGE", outputCategoryMask: true, outputConfidenceMasks: false });
    try { return await make("GPU"); } catch { return await make("CPU"); }
  })();
  segmenter.catch(() => { segmenter = null; });
  return segmenter;
}

/** Hair in the picture around the face (`raw`: its landmarks): { cover, color }. cover: how much of the
 * band above the forehead is hair (0 bald, 1 full); color: the median hair color (sRGB), or null. */
export function findHair(seg, image, raw) {
  const W = image.width, H = image.height;
  const res = seg.segment(image);
  const m = res.categoryMask, mask = m.getAsUint8Array(), mw = m.width, mh = m.height;
  const isHair = (x, y) => { const X = Math.floor(x * mw / W), Y = Math.floor(y * mh / H); return X >= 0 && Y >= 0 && X < mw && Y < mh && mask[Y * mw + X] > 0; };
  const P = (i) => [raw[i].x * W, raw[i].y * H];
  const faceH = Math.hypot(P(10)[0] - P(152)[0], P(10)[1] - P(152)[1]);
  const [lx] = P(234), [rx] = P(454), [, top] = P(10), [, chin] = P(152), mid = (lx + rx) / 2, half = Math.abs(rx - lx) / 2;
  // The top of the head: between the temples, from the forehead's top up a third of the face.
  let n = 0, hair = 0;
  for (let y = top - faceH * 0.33; y < top - faceH * 0.03; y += faceH / 60) for (let x = mid - half * 0.6; x <= mid + half * 0.6; x += half / 25) { n++; if (isHair(x, y)) hair++; }
  // Its color: hair pixels anywhere around the head (long or pulled-back hair is beside the face).
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true }); ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(0, 0, W, H).data, px = [];
  const step = Math.max(1, faceH / 120);
  for (let y = top - faceH * 0.5; y < chin; y += step) for (let x = mid - half * 1.6; x <= mid + half * 1.6; x += step)
    if (isHair(x, y)) { const o = (Math.round(y) * W + Math.round(x)) * 4; if (o >= 0 && o < data.length) px.push([data[o], data[o + 1], data[o + 2]]); }
  m.close?.(); res.close?.();
  return { cover: n ? hair / n : 0, color: px.length > 50 ? medianColor(px) : null };
}

/** The face's points in pixels (x right, y up, z toward the camera), or null if no face was found. */
export function facePoints(lm, image) {
  const res = lm.detect(image);
  const raw = res.faceLandmarks?.[0];
  if (!raw) return null;
  const W = image.width, H = image.height, pts = new Float64Array(MESH * 3);
  for (let i = 0; i < MESH; i++) { pts[i * 3] = raw[i].x * W; pts[i * 3 + 1] = -raw[i].y * H; pts[i * 3 + 2] = -raw[i].z * W; }
  const blend = {};
  for (const c of res.faceBlendshapes?.[0]?.categories ?? []) blend[c.categoryName] = c.score;
  return { pts, raw, blend, width: W, height: H, turn: headTurn(res) };
}

/** The head's turn in degrees from the face finder's head pose: { yaw (sideways), pitch }, or null.
 * Only the size is used (which side is which depends on mirroring). */
export function headTurn(res) {
  const m = res.facialTransformationMatrixes?.[0]?.data;
  if (!m) return null;
  const deg = 180 / Math.PI;  // column-major: the face's forward axis is the third column
  return { yaw: Math.atan2(m[8], m[10]) * deg, pitch: Math.asin(Math.max(-1, Math.min(1, -m[9]))) * deg };
}

/** `p` scaled, turned and shifted within the picture (x, y; z dropped to 0) to lie on `ref` as
 * closely as possible (least squares; `w`: an optional weight per point). For comparing two faces
 * seen from the same angle. */
export function alignFlat(p, ref, w = null) {
  const n = p.length / 3, wi = (i) => (w ? w[i] : 1);
  let total = 0, px = 0, py = 0, rx = 0, ry = 0;
  for (let i = 0; i < n; i++) { const q = wi(i); total += q; px += q * p[i * 3]; py += q * p[i * 3 + 1]; rx += q * ref[i * 3]; ry += q * ref[i * 3 + 1]; }
  px /= total; py /= total; rx /= total; ry /= total;
  let a = 0, b = 0, pp = 0;
  for (let i = 0; i < n; i++) {
    const q = wi(i), x = p[i * 3] - px, y = p[i * 3 + 1] - py, u = ref[i * 3] - rx, v = ref[i * 3 + 1] - ry;
    a += q * (x * u + y * v); b += q * (x * v - y * u); pp += q * (x * x + y * y);
  }
  const c = a / pp, s = b / pp, out = new Float64Array(p.length);  // scale·cos, scale·sin
  for (let i = 0; i < n; i++) {
    const x = p[i * 3] - px, y = p[i * 3 + 1] - py;
    out[i * 3] = c * x - s * y + rx; out[i * 3 + 1] = s * x + c * y + ry;
  }
  return out;
}

// Solve the small symmetric system A x = b (Gaussian elimination with pivoting).
function solve(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    if (Math.abs(M[c][c]) < 1e-12) continue;
    for (let r = 0; r < n; r++) if (r !== c) {
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((r, i) => (Math.abs(r[i]) < 1e-12 ? 0 : r[n] / r[i]));
}

/** J: columns (one Float64Array per variable), r: residual, x: current values. Weights `wt` per
 * residual entry. Variables that would leave [lo, hi] are pinned to the bound and the rest re-solved. */
export function solveBounded(J, r, x, lo, hi, lambda, wt) {
  const n = J.length, free = new Array(n).fill(true), d = new Array(n).fill(0);
  const JtJ = J.map((a) => J.map((b) => { let s = 0; for (let k = 0; k < r.length; k++) s += a[k] * b[k] * wt[k]; return s; }));
  const Jtr = J.map((a) => { let s = 0; for (let k = 0; k < r.length; k++) s += a[k] * r[k] * wt[k]; return s; });
  const scale = JtJ.reduce((s, row, i) => s + row[i], 0) / n || 1;
  for (let round = 0; round < n; round++) {
    const idx = [...Array(n).keys()].filter((i) => free[i]);
    const A = idx.map((i) => idx.map((j) => JtJ[i][j] + (i === j ? lambda * scale : 0)));
    const b = idx.map((i) => {
      let s = Jtr[i] - lambda * scale * x[i];
      for (let j = 0; j < n; j++) if (!free[j]) s -= JtJ[i][j] * d[j];
      return s;
    });
    const sol = solve(A, b);
    let pinned = false;
    idx.forEach((i, k) => {
      d[i] = sol[k];
      if (x[i] + d[i] < lo[i]) { d[i] = lo[i] - x[i]; free[i] = false; pinned = true; }
      else if (x[i] + d[i] > hi[i]) { d[i] = hi[i] - x[i]; free[i] = false; pinned = true; }
    });
    if (!pinned) break;
  }
  return d;
}

// ---- Colors ----------------------------------------------------------------------------------
export const toLinear = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
export const toSRGB = (l) => Math.round(255 * (l <= 0.0031308 ? l * 12.92 : 1.055 * l ** (1 / 2.4) - 0.055));
export const luminance = (rgb) => 0.2126 * toLinear(rgb[0]) + 0.7152 * toLinear(rgb[1]) + 0.0722 * toLinear(rgb[2]);

/** CIELAB lightness L* (0-100) of an sRGB color. */
export const lightness = (rgb) => { const y = luminance(rgb); return y > 0.008856 ? 116 * Math.cbrt(y) - 16 : 903.3 * y; };

function median(values) { const s = [...values].sort((a, b) => a - b); return s.length ? s[s.length >> 1] : 0; }
function medianColor(px) { return px.length ? [0, 1, 2].map((k) => median(px.map((p) => p[k]))) : null; }

/** Median colors of skin (cheeks and forehead), sclera, irises and the hair just above the forehead. */
export function sampleColors(image, raw) {
  const W = image.width, H = image.height;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true }); ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(0, 0, W, H).data;
  const P = (i) => [raw[i].x * W, raw[i].y * H];
  const pixel = (x, y) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= W || y >= H) return null; const o = (y * W + x) * 4; return [data[o], data[o + 1], data[o + 2]]; };
  const faceH = Math.hypot(P(10)[0] - P(152)[0], P(10)[1] - P(152)[1]);
  const disc = (cx, cy, r, inner = 0) => {
    const out = [];
    for (let y = cy - r; y <= cy + r; y += Math.max(1, r / 6)) for (let x = cx - r; x <= cx + r; x += Math.max(1, r / 6)) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= r && d >= inner) { const p = pixel(x, y); if (p) out.push(p); }
    }
    return out;
  };
  const skin = medianColor([50, 280, 151, 205, 425].flatMap((i) => disc(...P(i), faceH * 0.035)));
  // Irises: centers 468 (right in the picture's left) and 473, radius from the iris edge points.
  const irisPx = [], scleraPx = [];
  for (const [center, edge, corners] of [[468, 469, [33, 133]], [473, 474, [263, 362]]]) {
    const [cx, cy] = P(center), r = Math.hypot(P(edge)[0] - cx, P(edge)[1] - cy);
    irisPx.push(...disc(cx, cy, r * 0.8, r * 0.35));
    for (const k of corners) {  // halfway from the iris edge to the eye's corner
      const [kx, ky] = P(k), len = Math.hypot(kx - cx, ky - cy);
      if (len < r * 1.3) continue;
      const t = (r * 1.2 + (len - r * 1.2) * 0.35) / len;
      scleraPx.push(...disc(cx + (kx - cx) * t, cy + (ky - cy) * t, Math.max(1, r * 0.18)));
    }
  }
  // Hair: going up from the top of the forehead (and over both temples), the first band that isn't
  // skin-colored. None (bald, or a background like skin) gives null.
  const up = (i, f) => { const [x, y] = P(i), [cx, cy] = P(152); return [x + (x - cx) * f, y + (y - cy) * f]; };
  const unlike = (c) => skin && (Math.abs(luminance(c) - luminance(skin)) / luminance(skin) > 0.35 || Math.hypot(c[0] - skin[0], c[1] - skin[1], c[2] - skin[2]) > 60);
  let hair = null;
  for (const f of [0.08, 0.14, 0.2, 0.27]) {
    const c = medianColor([up(10, f), up(109, f * 0.8), up(338, f * 0.8)].flatMap(([x, y]) => disc(x, y, faceH * 0.035)));
    if (c && unlike(c)) { hair = c; break; }
  }
  // The brightest half of the sclera samples (the rest is often lid, lashes or shadow). Squinting or
  // smiling eyes may show none: then it's no brighter than the skin, and it's left out.
  scleraPx.sort((a, b) => luminance(b) - luminance(a));
  let sclera = medianColor(scleraPx.slice(0, Math.max(1, scleraPx.length >> 1)));
  if (sclera && skin && luminance(sclera) < luminance(skin) * 1.1) sclera = null;
  return { skin, sclera, iris: medianColor(irisPx), hair };
}
