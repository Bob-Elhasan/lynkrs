import * as THREE from "three";

/**
 * A scroll-scrubbed camera flight through a procedural corridor of "rooms".
 *
 * Mirrors the mechanism wlt.design uses: a pinned canvas whose camera position
 * is driven entirely by scroll progress (0..1) along a baked path, with the
 * camera additionally lerping toward the pointer every frame so the world
 * parallaxes under the cursor while it flies.
 */

const ACCENT = new THREE.Color("#3d7fff");
// Lifted off the CSS token's #1e40cf — additive blending on a near-black
// ground needs more luminance than the flat UI colour to register.
const ACCENT_DEEP = new THREE.Color("#3a5fe0");
const ACCENT_PALE = new THREE.Color("#9ec6ff");

/** How far down -Z the corridor runs. */
const DEPTH = 460;

/** Four zones, matching the four "rooms" the flight passes through. */
export const ZONES = [0, 0.26, 0.52, 0.78];

type Disposable = { dispose(): void };

export class FlightScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private path: THREE.CatmullRomCurve3;
  private lookPath: THREE.CatmullRomCurve3;
  private particleGroups: THREE.Points[] = [];
  private godray: THREE.Mesh | null = null;
  private trash: Disposable[] = [];
  private raf = 0;
  private clock = new THREE.Clock();

  /** Scroll progress 0..1 — set externally, consumed on the next frame. */
  progress = 0;
  /** Progress the camera actually uses, easing toward `progress`. This is the
   *  equivalent of GSAP's `scrub` lag and is what makes the flight feel like
   *  gliding rather than being dragged frame-by-frame with the wheel. */
  private smoothed = 0;
  private paused = false;
  /** Pointer offset in normalized -1..1 space. */
  private pointer = new THREE.Vector2();
  /** Smoothed camera target, so pointer motion eases rather than snaps. */
  private drift = new THREE.Vector2();

  private reducedMotion: boolean;
  /** Small screens get lighter geometry and a lower pixel ratio. */
  private lite: boolean;
  /** Touch devices: ignore height-only resizes (URL bar show/hide). */
  private coarse: boolean;
  private lastW = 0;

  constructor(canvas: HTMLCanvasElement, reducedMotion = false) {
    this.reducedMotion = reducedMotion;
    this.lite = window.innerWidth < 900;
    this.coarse = window.matchMedia("(pointer: coarse)").matches;
    this.lastW = window.innerWidth;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !this.lite,
      alpha: true,
      powerPreference: "high-performance",
    });
    // A phone at dpr 3 would otherwise rasterise ~1M px/frame for this scene.
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.lite ? 1.5 : 1.75));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x08090c, 0.0044);

    this.camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 900);

    // The flight path weaves rather than running straight, so the corridor
    // reveals itself progressively instead of all at once. It starts well
    // clear of the first portal so the corridor reads as depth ahead at p=0.
    this.path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.5, 34),
      new THREE.Vector3(-6, 2.5, -DEPTH * 0.16),
      new THREE.Vector3(5, -1, -DEPTH * 0.34),
      new THREE.Vector3(-4, 3, -DEPTH * 0.54),
      new THREE.Vector3(6, 1, -DEPTH * 0.74),
      new THREE.Vector3(0, 0, -DEPTH * 0.92),
      new THREE.Vector3(0, 0, -DEPTH - 40),
    ]);
    // A second, smoothed curve the camera aims at — keeps the look direction
    // ahead of the position so turns bank instead of whipping.
    this.lookPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1, -20),
      new THREE.Vector3(-2, 1.5, -DEPTH * 0.3),
      new THREE.Vector3(2, 0, -DEPTH * 0.6),
      new THREE.Vector3(0, 0, -DEPTH - 80),
    ]);

    this.buildWorld();
    this.buildParticles();
    this.buildGodray();

    this.onResize = this.onResize.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    window.addEventListener("resize", this.onResize);
    if (!this.coarse) window.addEventListener("pointermove", this.onPointerMove, { passive: true });
  }

  /** Portal frames receding down the corridor, tinted per zone. */
  private buildWorld() {
    // 4 radial segments makes a square ring; the +45° base roll below turns the
    // diamond upright so the frames read as architectural portals.
    const frameGeo = new THREE.TorusGeometry(1, 0.022, 6, 4);
    const COUNT = this.lite ? 32 : 54;

    const frameMat = new THREE.MeshBasicMaterial({
      transparent: true,
      // reads as a backdrop behind copy now rather than the subject itself
      opacity: 0.58,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    // Split into chunks along the corridor. A single InstancedMesh spanning the
    // whole path is culled as one unit, so every frame draws every tick — and
    // these are large additive quads, so that overdraw is the dominant cost.
    // Chunked, the frustum drops everything behind and far ahead of the camera.
    const CHUNKS = this.lite ? 4 : 7;
    const per = Math.ceil(COUNT / CHUNKS);
    const frameChunks: THREE.InstancedMesh[] = [];
    for (let k = 0; k < CHUNKS; k++) {
      const n = Math.min(per, COUNT - k * per);
      if (n <= 0) break;
      const mesh = new THREE.InstancedMesh(frameGeo, frameMat, n);
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
      frameChunks.push(mesh);
    }

    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    const c = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      const chunk = frameChunks[Math.floor(i / per)];
      const slot = i % per;
      const t = i / (COUNT - 1);
      // Frames begin just ahead of the camera and run the length of the path,
      // so p=0 already looks down a stack of receding portals rather than into
      // empty space with one oversized frame off at the screen edges.
      const p = this.path.getPointAt(0.015 + t * 0.965);
      const wobble = Math.sin(i * 1.7) * 2.2;
      pos.set(p.x + wobble * 0.3, p.y + Math.cos(i * 1.3) * 1.2, p.z);

      // Large enough that the camera passes *through* the opening rather than
      // seeing every frame converge into a knot at the vanishing point.
      const s = 20 + Math.sin(i * 0.9) * 6;
      scl.set(s, s * (0.66 + Math.sin(i * 0.5) * 0.14), 1);
      q.setFromEuler(new THREE.Euler(0, 0, Math.PI / 4 + Math.sin(i * 0.7) * 0.12));
      m.compose(pos, q, scl);
      chunk.setMatrixAt(slot, m);

      // Colour shifts across the four zones: pale -> accent -> deep -> pale.
      const zone = t < 0.26 ? 0 : t < 0.52 ? 1 : t < 0.78 ? 2 : 3;
      c.copy(zone === 0 ? ACCENT_PALE : zone === 1 ? ACCENT : zone === 2 ? ACCENT_DEEP : ACCENT);
      c.multiplyScalar(0.7 + 0.3 * Math.sin(i * 0.4));
      chunk.setColorAt(slot, c);
    }
    frameChunks.forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      // Tight per-chunk bounds are what let the frustum reject them.
      mesh.computeBoundingSphere();
      this.scene.add(mesh);
    });
    this.trash.push(frameGeo, frameMat);

    // Scattered volumes flanking the path — read as architecture at speed.
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const boxMat = new THREE.MeshBasicMaterial({
      color: 0x1a2130,
      transparent: true,
      opacity: 0.85,
    });
    const BOXES = this.lite ? 40 : 90;
    const boxPer = Math.ceil(BOXES / CHUNKS);
    const boxChunks: THREE.InstancedMesh[] = [];
    for (let k = 0; k < CHUNKS; k++) {
      const n = Math.min(boxPer, BOXES - k * boxPer);
      if (n <= 0) break;
      boxChunks.push(new THREE.InstancedMesh(boxGeo, boxMat, n));
    }
    for (let i = 0; i < BOXES; i++) {
      const chunk = boxChunks[Math.floor(i / boxPer)];
      const slot = i % boxPer;
      const t = i / BOXES;
      const p = this.path.getPointAt(Math.min(t * 0.97, 1));
      const side = i % 2 === 0 ? 1 : -1;
      pos.set(
        p.x + side * (9 + Math.random() * 13),
        p.y + (Math.random() - 0.5) * 16,
        p.z + (Math.random() - 0.5) * 8
      );
      const w = 1.5 + Math.random() * 6;
      scl.set(w, w * (0.5 + Math.random() * 3), w);
      q.setFromEuler(new THREE.Euler(Math.random() * 0.4, Math.random() * Math.PI, Math.random() * 0.4));
      m.compose(pos, q, scl);
      chunk.setMatrixAt(slot, m);
    }
    boxChunks.forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
      this.scene.add(mesh);
    });
    this.trash.push(boxGeo, boxMat);

    // Emissive accent strips — the brand colour threading through the dark.
    const stripGeo = new THREE.PlaneGeometry(1, 1);
    const stripMat = new THREE.MeshBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const STRIPS = this.lite ? 24 : 46;
    const strips = new THREE.InstancedMesh(stripGeo, stripMat, STRIPS);
    for (let i = 0; i < STRIPS; i++) {
      const t = i / STRIPS;
      const p = this.path.getPointAt(Math.min(t * 0.97, 1));
      const side = i % 2 === 0 ? 1 : -1;
      // Just outside the portal openings, so they streak past the edges of frame.
      pos.set(p.x + side * 15, p.y + (Math.random() - 0.5) * 14, p.z);
      scl.set(0.16, 10 + Math.random() * 18, 1);
      q.setFromEuler(new THREE.Euler(0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0));
      m.compose(pos, q, scl);
      strips.setMatrixAt(i, m);
    }
    strips.instanceMatrix.needsUpdate = true;
    this.scene.add(strips);
    this.trash.push(stripGeo, stripMat);

    // Faint ground grid for a floor reference under the flight.
    const grid = new THREE.GridHelper(DEPTH * 1.4, this.lite ? 40 : 90, ACCENT_DEEP, 0x141821);
    grid.position.set(0, -14, -DEPTH / 2);
    const gm = grid.material as THREE.Material;
    gm.transparent = true;
    gm.opacity = 0.16;
    this.scene.add(grid);
    this.trash.push(grid.geometry, gm);
  }

  /**
   * Five sprite groups counter-rotating at different rates — the same trick
   * wlt.design uses to keep the space feeling alive while the camera moves.
   */
  private buildParticles() {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < (this.lite ? 110 : 260); i++) {
      pts.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 90,
          (Math.random() - 0.5) * 60,
          -Math.random() * (DEPTH + 60) + 20
        )
      );
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    this.trash.push(geo);

    const sizes = [0.34, 0.2, 0.46, 0.22, 0.28];
    const groups = this.lite ? 3 : 5;
    for (let i = 0; i < groups; i++) {
      const mat = new THREE.PointsMaterial({
        size: sizes[i],
        color: i % 2 === 0 ? ACCENT_PALE : ACCENT,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const p = new THREE.Points(geo, mat);
      p.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      this.scene.add(p);
      this.particleGroups.push(p);
      this.trash.push(mat);
    }
  }

  /** A soft additive glow at the mouth of the corridor that breathes on a sine. */
  private buildGodray() {
    const geo = new THREE.PlaneGeometry(90, 60);
    const mat = new THREE.MeshBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.godray = new THREE.Mesh(geo, mat);
    this.godray.position.set(0, 0, -DEPTH * 0.5);
    this.scene.add(this.godray);
    this.trash.push(geo, mat);
  }

  private onPointerMove(e: PointerEvent) {
    this.pointer.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      (e.clientY / window.innerHeight) * 2 - 1
    );
  }

  private onResize() {
    // On phones the URL bar collapsing fires resize constantly with only the
    // height changing; re-sizing the drawing buffer for that is pure jank.
    if (this.coarse && window.innerWidth === this.lastW) return;
    this.lastW = window.innerWidth;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
  }

  /** Stop the render loop when the world is off-screen. */
  setPaused(paused: boolean) {
    if (paused === this.paused) return;
    this.paused = paused;
    if (!paused) {
      // Skip the wall-clock gap so ambient motion doesn't jump on resume.
      this.clock.getDelta();
      this.start();
    }
  }

  start() {
    if (this.raf) cancelAnimationFrame(this.raf);
    const tick = () => {
      if (this.paused) {
        this.raf = 0;
        return;
      }
      this.raf = requestAnimationFrame(tick);
      this.update();
    };
    tick();
  }

  private update() {
    const t = this.clock.getElapsedTime();
    const target = THREE.MathUtils.clamp(this.progress, 0, 1);
    this.smoothed += (target - this.smoothed) * 0.075;
    // Snap once close enough, so the camera settles instead of creeping.
    if (Math.abs(target - this.smoothed) < 0.0002) this.smoothed = target;
    const p = this.smoothed;

    // Position along the baked path is a pure function of scroll — this is the
    // scrub. Everything else is ambient motion layered on top.
    const at = this.path.getPointAt(p);
    const look = this.lookPath.getPointAt(p);

    // Pointer drift eases toward the cursor (their 0.05 lerp coefficient).
    if (!this.reducedMotion) {
      this.drift.x += (this.pointer.x - this.drift.x) * 0.05;
      this.drift.y += (this.pointer.y - this.drift.y) * 0.05;
    }

    this.camera.position.set(
      at.x + this.drift.x * 2.6,
      at.y - this.drift.y * 1.8,
      at.z
    );
    this.camera.lookAt(look.x + this.drift.x * 1.2, look.y - this.drift.y * 0.8, look.z);
    // Subtle roll into the turns.
    this.camera.rotation.z += Math.sin(p * Math.PI * 3) * 0.03;

    if (!this.reducedMotion) {
      this.particleGroups.forEach((g, i) => {
        g.rotation.y = 0.02 * t * (i < 3 ? i + 1 : -(i + 1));
      });
      if (this.godray) {
        const mat = this.godray.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.1 + 0.07 * Math.abs(Math.sin(0.8 * t));
        this.godray.position.z = at.z - 120;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointerMove);
    this.trash.forEach((d) => d.dispose());
    this.renderer.dispose();
  }
}
