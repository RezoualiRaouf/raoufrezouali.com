"use client";

import { sfx } from "@/lib/sound";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type Props = { reducedMotion: boolean; active: boolean; rim: string };

const STEP = 1;
const CUBIE = 0.94;
const TWIST_SECONDS = 0.75;
const AUTO_TWIST_EVERY = [1.4, 2.4];
type Axis = "x" | "y" | "z";

function speckleTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#eef2f7";
  g.fillRect(0, 0, 256, 256);
  // White plastic flecked with sky blue and navy.
  const flecks = ["11,37,69", "0,153,255", "10,132,232"];
  for (let i = 0; i < 2200; i++) {
    g.fillStyle = `rgba(${flecks[i % flecks.length]},${0.25 + Math.random() * 0.5})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 1.4, 1.4);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function perforatedTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#123a6b";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#061630";
  for (let y = 6; y < 256; y += 12) {
    for (let x = 6; x < 256; x += 12) {
      g.beginPath();
      g.arc(x, y, 3.6, 0, Math.PI * 2);
      g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const rand = (min: number, max: number) => min + Math.random() * (max - min);

// A puzzle cube in the site's colours: slow spin, layers that twist (and pop out a little)
// on their own, drag to turn it, tap to force a twist.
export default function Cube({ reducedMotion, active, rim }: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const live = useRef({ reducedMotion, active, rim });
  live.current = { reducedMotion, active, rim };
  const setRim = useRef<((color: string) => void) | null>(null);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.domElement.style.display = "block";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 11.5);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.position.set(-4, 6, 6);
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.4);
    rimLight.position.set(5, 2, -5);
    const under = new THREE.DirectionalLight(0xffffff, 0.6);
    under.position.set(0, -6, 3);
    scene.add(key, rimLight, under);
    setRim.current = (color) => rimLight.color.set(color);
    setRim.current(live.current.rim);

    const speckle = speckleTexture();
    const perforated = perforatedTexture();
    // Site colours: cloudy white, navy, sky blue, amber red, plus textures.
    const materials = [
      new THREE.MeshPhysicalMaterial({ color: "#f3f5f9", roughness: 0.3, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.25, envMapIntensity: 0.8 }),
      new THREE.MeshStandardMaterial({ color: "#0b2545", roughness: 0.75, metalness: 0.15, envMapIntensity: 0.4 }),
      new THREE.MeshPhysicalMaterial({ color: "#0a84e8", roughness: 0.3, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.3, envMapIntensity: 0.6 }),
      new THREE.MeshPhysicalMaterial({ color: "#ff5a1f", roughness: 0.32, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.3, envMapIntensity: 0.6 }),
      new THREE.MeshStandardMaterial({ map: speckle, roughness: 0.6, metalness: 0.05, envMapIntensity: 0.6 }),
      new THREE.MeshStandardMaterial({ map: perforated, bumpMap: perforated, bumpScale: 3, roughness: 0.55, metalness: 0.3, envMapIntensity: 0.4 }),
    ];
    const pickMaterial = (x: number, y: number, z: number) => {
      const h = Math.abs((x + 2) * 73 + (y + 2) * 151 + (z + 2) * 283) % 20;
      if (h < 6) return materials[0];
      if (h < 10) return materials[1];
      if (h < 13) return materials[2];
      if (h < 15) return materials[3];
      if (h < 18) return materials[4];
      return materials[5];
    };

    const geometry = new RoundedBoxGeometry(CUBIE, CUBIE, CUBIE, 4, 0.09);
    const spinner = new THREE.Group();
    const cube = new THREE.Group();
    spinner.add(cube);
    scene.add(spinner);
    spinner.rotation.set(0.55, 0.75, 0);

    const cubies: THREE.Mesh[] = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const m = new THREE.Mesh(geometry, pickMaterial(x, y, z));
          m.position.set(x * STEP, y * STEP, z * STEP);
          cube.add(m);
          cubies.push(m);
        }
      }
    }

    // Twisting one layer: parent its blocks to a pivot, rotate, then hand back.
    type Twist = { pivot: THREE.Group; axis: Axis; layer: number; dir: number; t: number };
    let twist: Twist | null = null;
    let queued = 0;
    const clock = new THREE.Clock();
    let nextAuto = rand(...(AUTO_TWIST_EVERY as [number, number]));

    const startTwist = (fromUser: boolean) => {
      if (twist) {
        if (fromUser) queued = Math.min(queued + 1, 2);
        return;
      }
      const axes: Axis[] = ["x", "y", "z"];
      const axis = axes[Math.floor(Math.random() * 3)];
      const layer = Math.floor(Math.random() * 3) - 1;
      const dir = Math.random() < 0.5 ? -1 : 1;
      const pivot = new THREE.Group();
      cube.add(pivot);
      cubies
        .filter((c) => Math.round(c.position[axis] / STEP) === layer)
        .forEach((c) => pivot.attach(c));
      twist = { pivot, axis, layer, dir, t: 0 };
      if (fromUser) sfx.clack(0.85 + Math.random() * 0.3);
    };

    const snap = new THREE.Euler();
    const finishTwist = (tw: Twist) => {
      tw.pivot.updateMatrixWorld();
      [...tw.pivot.children].forEach((child) => {
        cube.attach(child);
        child.position.set(
          Math.round(child.position.x / STEP) * STEP,
          Math.round(child.position.y / STEP) * STEP,
          Math.round(child.position.z / STEP) * STEP,
        );
        // Snap rotation to quarter turns so errors never accumulate.
        snap.setFromQuaternion(child.quaternion);
        snap.set(
          Math.round(snap.x / (Math.PI / 2)) * (Math.PI / 2),
          Math.round(snap.y / (Math.PI / 2)) * (Math.PI / 2),
          Math.round(snap.z / (Math.PI / 2)) * (Math.PI / 2),
        );
        child.quaternion.setFromEuler(snap);
      });
      cube.remove(tw.pivot);
    };

    const resize = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);

    // Pointer: lean toward the cursor, drag to turn, tap to twist.
    const canvas = renderer.domElement;
    const pointer = { x: 0, y: 0 };
    const drag = { active: false, lastX: 0, lastY: 0, moved: 0, vx: 0, vy: 0 };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = THREE.MathUtils.clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1.5, 1.5);
      pointer.y = THREE.MathUtils.clamp(-((e.clientY - rect.top) / rect.height) * 2 + 1, -1.5, 1.5);
      if (!drag.active) return;
      const dx = e.clientX - drag.lastX;
      const dy = e.clientY - drag.lastY;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      drag.vx = dx * 0.008;
      drag.vy = dy * 0.006;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
    };
    const onDown = (e: PointerEvent) => {
      drag.active = true;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      drag.moved = 0;
    };
    const onUp = () => {
      if (drag.active && drag.moved < 6) startTwist(true);
      drag.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      const { active, reducedMotion } = live.current;
      if (!active) return;
      const t = clock.elapsedTime;

      // Spin, drag inertia and a gentle lean toward the pointer.
      if (!drag.active) {
        drag.vx *= 0.94;
        drag.vy *= 0.94;
      }
      spinner.rotation.y += (reducedMotion ? 0 : dt * 0.22) + drag.vx;
      spinner.rotation.x = THREE.MathUtils.clamp(spinner.rotation.x + drag.vy, -0.4, 1.3);
      spinner.position.y = reducedMotion ? 0 : Math.sin(t * 0.9) * 0.12;
      cube.rotation.x += (-pointer.y * 0.18 - cube.rotation.x) * 0.05;
      cube.rotation.z += (pointer.x * 0.12 - cube.rotation.z) * 0.05;

      if (!reducedMotion && !twist && t > nextAuto) {
        startTwist(false);
        nextAuto = t + rand(...(AUTO_TWIST_EVERY as [number, number]));
      }

      if (twist) {
        twist.t = Math.min(1, twist.t + dt / TWIST_SECONDS);
        const e = easeInOut(twist.t);
        twist.pivot.rotation[twist.axis] = twist.dir * (Math.PI / 2) * e;
        // The turning layer slides out a little, then settles back in.
        const pop = Math.sin(Math.PI * twist.t) * 0.22;
        twist.pivot.position.set(0, 0, 0);
        twist.pivot.position[twist.axis] = (twist.layer === 0 ? 0 : twist.layer) * pop;
        if (twist.t >= 1) {
          twist.pivot.position.set(0, 0, 0);
          twist.pivot.rotation[twist.axis] = twist.dir * (Math.PI / 2);
          finishTwist(twist);
          twist = null;
          if (queued > 0) {
            queued--;
            startTwist(false);
          }
        }
      }

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      geometry.dispose();
      materials.forEach((m) => m.dispose());
      speckle.dispose();
      perforated.dispose();
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
      setRim.current = null;
    };
  }, []);

  useEffect(() => {
    setRim.current?.(rim);
  }, [rim]);

  return (
    <div
      ref={mount}
      className="size-full cursor-grab touch-pan-y active:cursor-grabbing"
      title="Drag to turn, tap to twist"
    />
  );
}
