"use client";

import { RefObject, useEffect } from "react";
import * as THREE from "three";

export type SceneContext = {
  el: HTMLElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Pointer position relative to the canvas, roughly -1..1 on each axis. */
  pointer: { x: number; y: number };
};

export type SceneHandle = {
  tick: (dt: number, t: number) => void;
  onResize?: (width: number, height: number) => void;
  dispose?: () => void;
};

/**
 * Shared three.js boilerplate for the hero design options: renderer, resize,
 * pointer tracking, pausing off screen, reduced motion and clean-up.
 */
export function useThreeScene(
  ref: RefObject<HTMLDivElement | null>,
  build: (ctx: SceneContext) => SceneHandle,
  options: { cameraZ?: number; fov?: number } = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = "block";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(options.fov ?? 40, 1, 0.1, 100);
    camera.position.set(0, 0, options.cameraZ ?? 6);
    const pointer = { x: 0, y: 0 };
    const handle = build({ el, renderer, scene, camera, pointer });

    const resize = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      handle.onResize?.(width, height);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(el);

    const onMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = THREE.MathUtils.clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1.5, 1.5);
      pointer.y = THREE.MathUtils.clamp(-((e.clientY - rect.top) / rect.height) * 2 + 1, -1.5, 1.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const viewObserver = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
      rootMargin: "120px",
    });
    viewObserver.observe(el);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const clock = new THREE.Clock();
    let frame = 0;
    const loop = () => {
      frame = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible) return;
      handle.tick(reduced ? 0 : dt, reduced ? 0 : clock.elapsedTime);
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      viewObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      handle.dispose?.();
      scene.traverse((obj) => {
        const item = obj as THREE.Mesh;
        item.geometry?.dispose();
        const materials = Array.isArray(item.material) ? item.material : item.material ? [item.material] : [];
        materials.forEach((m) => {
          (m as THREE.MeshBasicMaterial).map?.dispose();
          m.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
    // Each design builds its scene once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Soft round sprite so points render as dots instead of squares. */
export function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.9)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export const COLORS = {
  sky: new THREE.Color("#0099ff"),
  amber: new THREE.Color("#ff5a1f"),
  white: new THREE.Color("#ffffff"),
  ice: new THREE.Color("#cfe9ff"),
  navy: new THREE.Color("#0b2545"),
};

/**
 * Animated colour field in screen space (sky blue with drifting amber, white
 * and navy blobs). Used as the "world behind the glass" for the glass designs.
 */
export const BACKDROP_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  float blob(vec2 uv, vec2 c, float r) { return smoothstep(r, 0.0, length(uv - c)); }
  vec3 field(vec2 uv) {
    float aspect = uResolution.x / uResolution.y;
    vec2 p = vec2(uv.x * aspect, uv.y);
    vec2 c1 = vec2((0.5 + 0.28 * sin(uTime * 0.37)) * aspect, 0.55 + 0.22 * cos(uTime * 0.29));
    vec2 c2 = vec2((0.5 + 0.30 * cos(uTime * 0.23 + 1.7)) * aspect, 0.42 + 0.25 * sin(uTime * 0.31 + 2.1));
    vec2 c3 = vec2((0.5 + uPointer.x * 0.25) * aspect, 0.5 + uPointer.y * 0.25);
    vec3 col = vec3(0.0, 0.6, 1.0);
    col = mix(col, vec3(1.0, 0.353, 0.122), blob(p, c1, 0.42) * 0.95);
    col = mix(col, vec3(1.0), blob(p, c2, 0.34) * 0.85);
    col = mix(col, vec3(0.043, 0.145, 0.27), blob(p, c3, 0.30) * 0.75);
    return col;
  }
`;
