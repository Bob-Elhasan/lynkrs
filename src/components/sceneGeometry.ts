/* The prism is a square-section tube following a curve through 3D space, and the
   camera rides it. Arbitrary orientation means none of this can be expressed as
   rotateY/translateZ, so everything here builds `matrix3d` directly.

   Axes are CSS screen axes: +x right, +y DOWN, +z toward the viewer. The basis
   (x, y, z) is right-handed in those terms, so x × y = z. Travel starts heading
   +y — down the page — which is why "up" on screen is the negative tangent. */

export type Vec3 = [number, number, number];

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const len = (a: Vec3) => Math.sqrt(dot(a, a));
export const norm = (a: Vec3): Vec3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/** Rotate `v` about unit axis `k` by `deg` (Rodrigues). */
export function rotate(v: Vec3, k: Vec3, deg: number): Vec3 {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c)));
}

/** A point on the tube: where it is, and the frame carried along it. */
export interface Frame {
  pos: Vec3;
  /** Direction of travel. */
  t: Vec3;
  /** The two cross-section axes. Face 0's outward normal is u, face 1's is v. */
  u: Vec3;
  v: Vec3;
  /** Distance travelled from the start. */
  arc: number;
}

/** Outward normal of a face, given the angle round the tube from u toward v. */
export function normalAt(f: Frame, deg: number): Vec3 {
  const r = (deg * Math.PI) / 180;
  return norm(add(mul(f.u, Math.cos(r)), mul(f.v, Math.sin(r))));
}

export interface Station {
  /** Length of tube between this station and the next. */
  span: number;
  /** Degrees the tube swings sideways across the span. */
  bend: number;
  /** Degrees the tube tips toward or away from the viewer across the span. */
  climb: number;
}

/**
 * Walk the route, returning a dense run of frames.
 *
 * Turning is weighted to the middle of each span by a raised-cosine bump, so the
 * tube is straight where the stations are and bends only in between. That is what
 * keeps a panel flat on its face: copy on a curving surface would not be readable.
 */
export function buildPath(stations: Station[], perSpan: number) {
  const frames: Frame[] = [];
  /** Index into `frames` of each station. */
  const marks: number[] = [];

  let pos: Vec3 = [0, 0, 0];
  let t: Vec3 = [0, 1, 0];
  let u: Vec3 = [0, 0, 1];
  let v: Vec3 = [1, 0, 0];
  let arc = 0;

  frames.push({ pos, t, u, v, arc });
  marks.push(0);

  for (const st of stations) {
    const step = st.span / perSpan;
    // Bump weights summing to 1, so the whole bend is spent across the span.
    const w: number[] = [];
    let total = 0;
    for (let k = 0; k < perSpan; k++) {
      const x = (k + 0.5) / perSpan;
      const b = 1 - Math.cos(2 * Math.PI * x);
      w.push(b);
      total += b;
    }

    for (let k = 0; k < perSpan; k++) {
      const share = total > 0 ? w[k] / total : 1 / perSpan;
      // Rotate the entire frame, which parallel-transports the cross-section and
      // keeps the tube from twisting along its own axis.
      if (st.bend) {
        const axis = u;
        t = norm(rotate(t, axis, st.bend * share));
        v = norm(rotate(v, axis, st.bend * share));
      }
      if (st.climb) {
        const axis = v;
        t = norm(rotate(t, axis, st.climb * share));
        u = norm(rotate(u, axis, st.climb * share));
      }
      // Re-orthogonalise; small errors compound over a long route.
      u = norm(sub(u, mul(t, dot(u, t))));
      v = norm(cross(t, u));

      pos = add(pos, mul(t, step));
      arc += step;
      frames.push({ pos, t, u, v, arc });
    }
    marks.push(frames.length - 1);
  }

  return { frames, marks };
}

/** The frame at a given distance along the route, interpolated between samples. */
export function frameAt(frames: Frame[], arc: number): Frame {
  const last = frames[frames.length - 1];
  if (arc <= 0) return frames[0];
  if (arc >= last.arc) return last;

  // Samples are evenly spaced within a span but not across spans, so bisect.
  let lo = 0;
  let hi = frames.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (frames[mid].arc <= arc) lo = mid;
    else hi = mid;
  }
  const a = frames[lo];
  const b = frames[hi];
  const t = (arc - a.arc) / (b.arc - a.arc || 1);

  const tan = norm(lerp3(a.t, b.t, t));
  let uu = norm(lerp3(a.u, b.u, t));
  uu = norm(sub(uu, mul(tan, dot(uu, tan))));
  return {
    pos: lerp3(a.pos, b.pos, t),
    t: tan,
    u: uu,
    v: norm(cross(tan, uu)),
    arc,
  };
}

/**
 * Model matrix for a flat element of the tube.
 *
 * A div lies in its own xy plane facing +z. `ez` is where it should face, `ey`
 * where its down-the-page direction should point, and the element is expected to
 * be centred on its own origin.
 */
export function modelMatrix(centre: Vec3, ex: Vec3, ey: Vec3, ez: Vec3) {
  return (
    `matrix3d(${ex[0]},${ex[1]},${ex[2]},0,` +
    `${ey[0]},${ey[1]},${ey[2]},0,` +
    `${ez[0]},${ez[1]},${ez[2]},0,` +
    `${centre[0].toFixed(2)},${centre[1].toFixed(2)},${centre[2].toFixed(2)},1)`
  );
}

/**
 * View matrix: the transform applied to the world so it is seen from `eye`
 * looking along `fwd`, with `up` pointing up the screen.
 *
 * CSS looks along its own -z, so the camera's z basis is the reverse of `fwd`,
 * and its y basis points down the screen — the reverse of `up`.
 */
export function viewMatrix(eye: Vec3, fwd: Vec3, up: Vec3) {
  const z = norm(mul(fwd, -1));
  let y = norm(mul(up, -1));
  const x = norm(cross(y, z));
  y = cross(z, x);
  const tx = -dot(x, eye);
  const ty = -dot(y, eye);
  const tz = -dot(z, eye);
  return (
    `matrix3d(${x[0]},${y[0]},${z[0]},0,` +
    `${x[1]},${y[1]},${z[1]},0,` +
    `${x[2]},${y[2]},${z[2]},0,` +
    `${tx.toFixed(2)},${ty.toFixed(2)},${tz.toFixed(2)},1)`
  );
}
