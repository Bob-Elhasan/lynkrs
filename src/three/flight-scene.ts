import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

/**
 * Scroll-scrubbed camera flight, wired to the contract in the Blender
 * production spec.
 *
 * The mechanic is the one the prototype pins down: a single AnimationClip
 * holds baked camera keyframes (position + quaternion) and scroll progress
 * maps straight onto `mixer.setTime()`. The path is authored, never computed
 * — no lookAt() chasing a target, no parametric curve.
 *
 * Until `spaces.glb` lands, a placeholder clip and four stand-in spaces are
 * built here with the same names and shape the export will produce
 * (`CameraFlythrough`, node `CameraTrack`, .position/.quaternion tracks), so
 * swapping the real asset in is `loadGLB()` and nothing else.
 */

/** Lynkrs palette, per the spec. */
const NEAR_BLACK = 0x0a0a08;
const LIME = 0xd7de21;

/** Distance between the four spaces along Z (spec: ~20–26 units). */
const S = 26;

/** Clip length in seconds. Whatever this is, scroll scrubs 0..1 across it. */
export const CLIP_DURATION = 8;

/** The node the baked clip drives. Must match the Blender export. */
const CAMERA_NODE = "CameraTrack";
const CLIP_NAME = "CameraFlythrough";

type Disposable = { dispose(): void };

export class FlightScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private mixer: THREE.AnimationMixer;
  private action: THREE.AnimationAction | null = null;
  private clipDuration = CLIP_DURATION;
  /** Node the clip animates; its transform is copied onto the render camera. */
  private cameraNode: THREE.Object3D;

  private placeholder: THREE.Group | null = null;
  private keyLight: THREE.PointLight;
  private trash: Disposable[] = [];
  private raf = 0;

  /** Scroll progress 0..1 — set externally, consumed on the next frame. */
  progress = 0;
  /** Eased progress. Smoothing is applied to the progress *number* only,
   *  never to the pose, so the camera always sits exactly where the clip
   *  says it does at that time value. */
  private smoothed = 0;
  private paused = false;
  private lastFrame = 0;

  private reducedMotion: boolean;
  private lite: boolean;
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
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.lite ? 1.5 : 1.75));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(NEAR_BLACK, 0.028);

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);

    // Stand-in for the baked lightmap: cheap static lights that never
    // recalculate. The real asset ships unlit with lighting baked to texture,
    // at which point these stop mattering.
    this.scene.add(new THREE.AmbientLight(0x555548, 0.9));
    this.keyLight = new THREE.PointLight(LIME, 6, 40);
    this.keyLight.position.set(4, 6, 2);
    this.scene.add(this.keyLight);
    const rim = new THREE.PointLight(0xffffff, 2, 30);
    rim.position.set(-6, 3, -8);
    this.scene.add(rim);

    this.cameraNode = new THREE.Object3D();
    this.cameraNode.name = CAMERA_NODE;
    this.scene.add(this.cameraNode);

    this.mixer = new THREE.AnimationMixer(this.scene);
    this.buildPlaceholder();
    this.useClip(this.buildPlaceholderClip());

    this.onResize = this.onResize.bind(this);
    window.addEventListener("resize", this.onResize);
  }

  // ────────────────────────────────────────────────────────────
  //  LOAD REAL GLB HERE
  //  Everything else in this class is unchanged either way.
  // ────────────────────────────────────────────────────────────
  /**
   * Swap in the produced asset. Expects one clip named `CameraFlythrough`
   * driving a node named `CameraTrack` (or the camera object itself), with
   * lighting baked to texture and materials exported unlit.
   */
  async loadGLB(url: string, dracoPath = "https://www.gstatic.com/draco/v1/decoders/") {
    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath(dracoPath);
    loader.setDRACOLoader(draco);

    const gltf = await loader.loadAsync(url);

    // Drop the stand-in geometry; the lights stay harmless in case the asset
    // ships lit rather than unlit.
    if (this.placeholder) {
      this.scene.remove(this.placeholder);
      this.disposeTree(this.placeholder);
      this.placeholder = null;
    }
    this.scene.add(gltf.scene);

    // Re-point the mixer at the loaded hierarchy, then find the node the clip
    // actually drives: the named track node, else a camera, else the root.
    this.mixer.stopAllAction();
    this.mixer = new THREE.AnimationMixer(gltf.scene);
    this.cameraNode =
      gltf.scene.getObjectByName(CAMERA_NODE) ??
      gltf.cameras[0] ??
      gltf.scene.children[0] ??
      gltf.scene;

    const clip = gltf.animations.find((a) => a.name === CLIP_NAME) ?? gltf.animations[0];
    if (clip) this.useClip(clip);

    draco.dispose();
  }

  /** Play a clip paused, so `setTime` is the only thing that moves it. */
  private useClip(clip: THREE.AnimationClip) {
    this.clipDuration = clip.duration || CLIP_DURATION;
    this.action = this.mixer.clipAction(clip);
    this.action.play();
    this.action.paused = true;
  }

  /**
   * Placeholder camera keyframes with the same track names and shape the
   * Blender export produces — four dwell beats with transit between.
   */
  private buildPlaceholderClip() {
    const times = [0, 0.6, 1.6, 2.0, 2.6, 3.6, 4.0, 4.6, 5.6, 6.0, 6.6, 7.6, 8.0];

    const posKeys: number[][] = [
      [0, 3.2, 9],
      [0, 2.6, 4],
      [3.5, 2.2, 0.5],
      [2.0, 2.4, -6],
      [-1.5, 2.8, -S + 9],
      [0, 2.0, -S + 2],
      [2.0, 2.6, -S - 4],
      [-3, 2.4, -S * 2 + 8],
      [4, 2.0, -S * 2],
      [0, 3.0, -S * 2 - 6],
      [-2, 2.6, -S * 3 + 9],
      [0, 2.4, -S * 3 + 1],
      [0, 2.4, -S * 3 - 2],
    ];
    const lookKeys: number[][] = [
      [0, 1.5, 0],
      [0, 1.5, -2],
      [0, 1.4, -3],
      [0, 1.5, -S + 10],
      [0, 1.6, -S + 2],
      [0, 1.8, -S - 2],
      [0, 1.5, -S - 6],
      [0, 1.4, -S * 2 + 6],
      [0, 1.6, -S * 2 - 2],
      [0, 1.5, -S * 2 - 8],
      [0, 1.6, -S * 3 + 6],
      [0, 1.7, -S * 3 - 2],
      [0, 1.7, -S * 3 - 6],
    ];

    const posValues: number[] = [];
    const quatValues: number[] = [];
    const m = new THREE.Matrix4();
    const up = new THREE.Vector3(0, 1, 0);
    const eye = new THREE.Vector3();
    const target = new THREE.Vector3();
    const q = new THREE.Quaternion();

    posKeys.forEach((p, i) => {
      posValues.push(p[0], p[1], p[2]);
      eye.set(p[0], p[1], p[2]);
      const l = lookKeys[i];
      target.set(l[0], l[1], l[2]);
      m.lookAt(eye, target, up);
      q.setFromRotationMatrix(m);
      quatValues.push(q.x, q.y, q.z, q.w);
    });

    return new THREE.AnimationClip(CLIP_NAME, CLIP_DURATION, [
      new THREE.VectorKeyframeTrack(`${CAMERA_NODE}.position`, times, posValues),
      new THREE.QuaternionKeyframeTrack(`${CAMERA_NODE}.quaternion`, times, quatValues),
    ]);
  }

  /**
   * Four stand-in spaces — the spatial moments from the spec, not literal
   * rooms: fragmentation, alignment, the system, the suite.
   */
  private buildPlaceholder() {
    const limeMat = new THREE.MeshStandardMaterial({
      color: LIME,
      emissive: 0x3a3d08,
      roughness: 0.35,
      metalness: 0.1,
    });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x111110, roughness: 0.85 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x1c1c18,
      roughness: 0.15,
      metalness: 0.6,
    });
    this.trash.push(limeMat, darkMat, glassMat);

    const root = new THREE.Group();
    const floorGeo = new THREE.PlaneGeometry(14, 14);
    this.trash.push(floorGeo);

    const makeSpace = (z: number, kind: number) => {
      const g = new THREE.Group();
      g.position.set(0, 0, z);

      const floor = new THREE.Mesh(floorGeo, darkMat);
      floor.rotation.x = -Math.PI / 2;
      g.add(floor);

      if (kind === 0) {
        // Fragmentation — scattered, disconnected volumes.
        for (let i = 0; i < 6; i++) {
          const s = 0.6 + Math.random() * 1.4;
          const geo = new THREE.BoxGeometry(s, s, s);
          this.trash.push(geo);
          const b = new THREE.Mesh(geo, darkMat);
          b.position.set((Math.random() - 0.5) * 8, s / 2, (Math.random() - 0.5) * 8);
          b.rotation.y = Math.random() * Math.PI;
          g.add(b);
        }
        const shardGeo = new THREE.BoxGeometry(0.15, 3, 0.15);
        this.trash.push(shardGeo);
        const shard = new THREE.Mesh(shardGeo, limeMat);
        shard.position.set(0, 1.5, 0);
        g.add(shard);
      } else if (kind === 1) {
        // Alignment — one unified central form.
        const coreGeo = new THREE.CylinderGeometry(1.6, 1.6, 4, 8);
        const ringGeo = new THREE.TorusGeometry(3, 0.06, 8, 48);
        this.trash.push(coreGeo, ringGeo);
        const core = new THREE.Mesh(coreGeo, glassMat);
        core.position.y = 2;
        g.add(core);
        const ring = new THREE.Mesh(ringGeo, limeMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.05;
        g.add(ring);
      } else if (kind === 2) {
        // The system — five staged elements implying sequence.
        for (let i = 0; i < 5; i++) {
          const h = 0.4 + i * 0.35;
          const geo = new THREE.BoxGeometry(1.6, h, 1.6);
          this.trash.push(geo);
          const p = new THREE.Mesh(geo, i % 2 === 0 ? darkMat : glassMat);
          p.position.set(-4 + i * 2, h / 2, 0);
          g.add(p);
        }
        const beamGeo = new THREE.BoxGeometry(9, 0.05, 0.05);
        this.trash.push(beamGeo);
        const beam = new THREE.Mesh(beamGeo, limeMat);
        beam.position.set(0, 2.4, 0);
        g.add(beam);
      } else {
        // The suite — four panels of increasing scale.
        for (let i = 0; i < 4; i++) {
          const h = 3 + i * 0.6;
          const geo = new THREE.BoxGeometry(1.4, h, 0.2);
          this.trash.push(geo);
          const panel = new THREE.Mesh(geo, i === 3 ? limeMat : darkMat);
          panel.position.set(-3 + i * 2, h / 2, 0);
          g.add(panel);
        }
      }
      root.add(g);
    };

    makeSpace(0, 0);
    makeSpace(-S, 1);
    makeSpace(-S * 2, 2);
    makeSpace(-S * 3, 3);

    this.placeholder = root;
    this.scene.add(root);
  }

  private disposeTree(root: THREE.Object3D) {
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
      else if (mat) mat.dispose();
    });
  }

  private onResize() {
    // A collapsing mobile URL bar fires resize with only the height changing;
    // reallocating the drawing buffer for that is pure jank.
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
    if (!paused) this.start();
  }

  start() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.lastFrame = performance.now();
    const tick = (now: number) => {
      if (this.paused) {
        this.raf = 0;
        return;
      }
      this.raf = requestAnimationFrame(tick);
      this.update(now);
    };
    this.raf = requestAnimationFrame(tick);
  }

  private update(now: number) {
    const dt = Math.min((now - this.lastFrame) / 1000, 0.1);
    this.lastFrame = now;

    const target = THREE.MathUtils.clamp(this.progress, 0, 1);
    // Frame-rate independent easing of the progress value itself.
    this.smoothed += (target - this.smoothed) * Math.min(1, dt * 6);
    if (Math.abs(target - this.smoothed) < 0.0002) this.smoothed = target;

    // The whole trick: exact scrub against the authored clip.
    this.mixer.setTime(this.smoothed * this.clipDuration);

    // The clip drives the track node; the render camera copies it. Reading the
    // world transform keeps this correct if the GLB parents the node to a rig.
    this.cameraNode.updateWorldMatrix(true, false);
    this.cameraNode.getWorldPosition(this.camera.position);
    this.cameraNode.getWorldQuaternion(this.camera.quaternion);

    if (!this.reducedMotion) {
      this.keyLight.intensity = 5.5 + Math.sin(now * 0.001) * 0.5;
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    this.mixer.stopAllAction();
    if (this.placeholder) this.disposeTree(this.placeholder);
    this.trash.forEach((d) => d.dispose());
    this.renderer.dispose();
  }
}
