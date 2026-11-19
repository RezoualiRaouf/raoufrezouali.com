"use client";

import { sfx } from "@/lib/sound";
import { useRef } from "react";
import * as THREE from "three";
import { COLORS, dotTexture, useThreeScene } from "./useThreeScene";

// Particles on tilted rings spinning at different speeds around a bright core,
// like a gyroscope that never stops. The whole system leans toward the cursor,
// and the small amber heart flies its own close loop around the core.
//
// It also reacts to the cursor (sounds are clicks and noise only, no music):
//   - brushing the cursor across a ring gives a soft click, and it flashes
//   - while hovered, the heart pulses each time it swings past the front of
//     the core
//   - a click or tap on it spins the rings up with a click and a whoosh
const RINGS = [
  { radius: 1.05, count: 900, tilt: [0.9, -0.5, 0], speed: -0.42 },
  { radius: 1.55, count: 1500, tilt: [0.3, 0.1, 0.25], speed: 0.28 },
  { radius: 2.05, count: 2000, tilt: [1.15, 0.35, 0], speed: -0.2 },
  { radius: 2.55, count: 2400, tilt: [-0.55, 0.8, 0.4], speed: 0.13 },
] as const;
const DOT_SIZE = 0.045;

// How far from the centre (in canvas units, -1..1) still counts as over the
// orbit: just past the outer ring.
const HOVER_RADIUS = 0.74;
// Points per ring when checking whether the cursor crossed it.
const RING_SAMPLES = 48;
const RING_UNIT = Array.from({ length: RING_SAMPLES }, (_, i) => {
  const a = (i / RING_SAMPLES) * Math.PI * 2;
  return [Math.cos(a), Math.sin(a)] as const;
});

/** Even-odd test: is (x, y) inside the closed outline (x, y pairs)? */
function inside(path: Float32Array, x: number, y: number) {
  let hit = false;
  for (let i = 0, j = RING_SAMPLES - 1; i < RING_SAMPLES; j = i++) {
    const xi = path[i * 2];
    const yi = path[i * 2 + 1];
    const xj = path[j * 2];
    const yj = path[j * 2 + 1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

// The canvas is drawn this much bigger than its box (and the camera moves back
// to match), so the rings keep the same size on screen but never reach the
// canvas edge when the system leans. That is what stopped the side cropping.
const BLEED = 1.44;
const TRAIL = 56;

const gaussian = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

/**
 * Where the heart is at time t: a close loop around the core that swells a
 * little, bobs and slowly turns its plane. It stays 0.45 to 0.65 from the
 * centre; core and heart together are about 0.31 across, so they never touch.
 */
function heartAt(t: number, out: THREE.Vector3, plane: THREE.Euler) {
  const angle = t * 1.2;
  const radius = 0.55 + Math.sin(t * 0.43) * 0.1;
  out.set(Math.cos(angle) * radius, Math.sin(t * 0.61) * 0.12, Math.sin(angle) * radius);
  plane.set(0.55 + Math.sin(t * 0.19) * 0.45, 0, 0.35 + Math.cos(t * 0.13) * 0.3);
  return out.applyEuler(plane);
}

export default function OrbitParticles() {
  const ref = useRef<HTMLDivElement>(null);

  useThreeScene(
    ref,
    ({ scene, pointer, camera, renderer }) => {
      const sprite = dotTexture();
      const system = new THREE.Group();
      scene.add(system);

      const rings = RINGS.map((def) => {
        const positions = new Float32Array(def.count * 3);
        const colors = new Float32Array(def.count * 3);
        for (let i = 0; i < def.count; i++) {
          const a = Math.random() * Math.PI * 2;
          const r = def.radius + gaussian() * 0.11;
          positions.set([Math.cos(a) * r, gaussian() * 0.05, Math.sin(a) * r], i * 3);
          const roll = Math.random();
          const c = roll < 0.1 ? COLORS.amber : roll < 0.35 ? COLORS.ice : COLORS.white;
          colors.set([c.r, c.g, c.b], i * 3);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        const material = new THREE.PointsMaterial({
          size: DOT_SIZE,
          map: sprite,
          vertexColors: true,
          transparent: true,
          depthWrite: false,
        });
        const points = new THREE.Points(geometry, material);
        const holder = new THREE.Group();
        holder.rotation.set(def.tilt[0], def.tilt[1], def.tilt[2]);
        holder.add(points);
        system.add(holder);
        return {
          points,
          holder,
          material,
          speed: def.speed,
          radius: def.radius,
          // The ring's outline on screen, and which side of it the cursor was on.
          path: new Float32Array(RING_SAMPLES * 2),
          wasInside: null as boolean | null,
          lastClick: 0,
          flash: 0,
        };
      });

      // Bright core.
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 32, 32),
        new THREE.MeshBasicMaterial({ color: COLORS.white }),
      );
      // Amber heart on its own orbit, with a fading trail of dots behind it.
      const heart = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 24, 24),
        new THREE.MeshBasicMaterial({ color: COLORS.amber }),
      );
      const trailPositions = new Float32Array(TRAIL * 3);
      const trailColors = new Float32Array(TRAIL * 4);
      for (let i = 0; i < TRAIL; i++) {
        const alpha = Math.pow(1 - i / TRAIL, 1.6) * 0.9;
        trailColors.set([COLORS.amber.r, COLORS.amber.g, COLORS.amber.b, alpha], i * 4);
      }
      const trailGeometry = new THREE.BufferGeometry();
      trailGeometry.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
      // Four colour components, so each trail dot has its own transparency.
      trailGeometry.setAttribute("color", new THREE.BufferAttribute(trailColors, 4));
      const trail = new THREE.Points(
        trailGeometry,
        new THREE.PointsMaterial({
          size: 0.07,
          map: sprite,
          vertexColors: true,
          transparent: true,
          depthWrite: false,
        }),
      );
      system.add(core, heart, trail);

      const spot = new THREE.Vector3();
      const plane = new THREE.Euler();
      const probe = new THREE.Vector3();

      // --- Sound and touch ---------------------------------------------------
      // Where the mouse is, in page pixels; turned into canvas units each frame
      // so it stays right while the page scrolls under a still mouse.
      const hand = { x: -1e4, y: -1e4, mouse: false, inWindow: false };
      let last = { x: 0, y: 0 };
      let hovering = false;
      let boost = 0; // spin-up after a click, eases back to 0
      let heartZ = 0;
      let heartRising = false;
      let heartFlash = 0;
      let lastPulse = 0;
      let down: { x: number; y: number; time: number } | null = null;

      const toCanvas = (clientX: number, clientY: number) => {
        const rect = renderer.domElement.getBoundingClientRect();
        return {
          x: ((clientX - rect.left) / rect.width) * 2 - 1,
          y: -((clientY - rect.top) / rect.height) * 2 + 1,
        };
      };
      const onMove = (e: PointerEvent) => {
        hand.x = e.clientX;
        hand.y = e.clientY;
        hand.mouse = e.pointerType === "mouse";
        hand.inWindow = true;
      };
      const onOut = (e: PointerEvent) => {
        if (!e.relatedTarget) hand.inWindow = false;
      };
      // A click or tap on the orbit (not on a link or a field near it) spins it
      // up. Taps are read from pointer events: iPhones send no click event for
      // a plain element. A press that moves (a scroll) is not a tap.
      const onDown = (e: PointerEvent) => {
        down = { x: e.clientX, y: e.clientY, time: performance.now() };
      };
      const onUp = (e: PointerEvent) => {
        const start = down;
        down = null;
        if (!start || performance.now() - start.time > 500) return;
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) return;
        if ((e.target as Element | null)?.closest?.("a, button, input, textarea, select, label")) return;
        const at = toCanvas(e.clientX, e.clientY);
        if (Math.hypot(at.x, at.y) > HOVER_RADIUS) return;
        boost = 1;
        sfx.spin();
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerout", onOut, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });

      /** Project each ring onto the canvas and click the ones the cursor crossed. */
      const brushRings = (x: number, y: number, speed: number, now: number) => {
        camera.updateMatrixWorld();
        for (const ring of rings) {
          ring.holder.updateWorldMatrix(true, false);
          for (let i = 0; i < RING_SAMPLES; i++) {
            const [c, s] = RING_UNIT[i];
            probe.set(c * ring.radius, 0, s * ring.radius).applyMatrix4(ring.holder.matrixWorld).project(camera);
            ring.path[i * 2] = probe.x;
            ring.path[i * 2 + 1] = probe.y;
          }
          const isInside = inside(ring.path, x, y);
          if (ring.wasInside !== null && isInside !== ring.wasInside && now - ring.lastClick > 0.12) {
            sfx.brush(THREE.MathUtils.clamp(0.45 + speed * 6, 0.45, 1));
            ring.flash = 1;
            ring.lastClick = now;
          }
          ring.wasInside = isInside;
        }
      };

      return {
        tick: (dt, t) => {
          const now = performance.now() / 1000;
          const spin = 1 + boost * 6;
          rings.forEach((ring) => (ring.points.rotation.y += ring.speed * dt * spin));
          system.rotation.y += dt * 0.05 * spin;
          system.rotation.x += (-pointer.y * 0.45 - system.rotation.x) * 0.05;
          system.rotation.z += (pointer.x * 0.35 - system.rotation.z) * 0.05;

          heart.position.copy(heartAt(t, spot, plane));
          for (let i = 0; i < TRAIL; i++) {
            heartAt(t - (i + 1) * 0.02, spot, plane);
            trailPositions.set([spot.x, spot.y, spot.z], i * 3);
          }
          trailGeometry.attributes.position.needsUpdate = true;

          // Is the mouse over the orbit, and did it move this frame?
          const at = toCanvas(hand.x, hand.y);
          const wasHovering = hovering;
          hovering = hand.mouse && hand.inWindow && Math.hypot(at.x, at.y) < HOVER_RADIUS;
          const speed = Math.hypot(at.x - last.x, at.y - last.y);
          last = at;
          if (hovering) {
            if (speed > 0.002) brushRings(at.x, at.y, speed, now);
          } else if (wasHovering) {
            rings.forEach((ring) => (ring.wasInside = null));
          }

          // Heart pulse (no sound): each time it swings past the front of the
          // core (its nearest point to the camera). One loop takes about 5
          // seconds; the gap stops the lean wobble from adding extra pulses.
          heart.getWorldPosition(probe);
          const rising = probe.z > heartZ;
          if (hovering && heartRising && !rising && now - lastPulse > 2) {
            heartFlash = 1;
            lastPulse = now;
          }
          heartRising = rising;
          heartZ = probe.z;

          // Flashes and the spin-up ease away. With reduced motion (dt is 0)
          // there are no flashes and no spin; the sounds still play.
          const fade = dt ? Math.exp(-dt * 4) : 0;
          rings.forEach((ring) => {
            ring.flash *= fade;
            ring.material.size = DOT_SIZE * (1 + ring.flash * 0.7);
          });
          heartFlash *= fade;
          boost = dt ? boost * Math.exp(-dt * 1.3) : 0;

          const pulse = 1 + Math.sin(t * 2.4) * 0.06;
          core.scale.setScalar(pulse * (1 + boost * 0.25));
          heart.scale.setScalar((2 - pulse) * (1 + heartFlash * 0.5));
        },
        dispose: () => {
          window.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerout", onOut);
          window.removeEventListener("pointerdown", onDown);
          window.removeEventListener("pointerup", onUp);
          sprite.dispose();
        },
      };
    },
    { cameraZ: 7.2 * BLEED },
  );

  // The canvas overhangs its box on every side; it ignores the mouse so it
  // never blocks the text or buttons it overlaps.
  return (
    <div className="relative size-full">
      <div ref={ref} className="pointer-events-none absolute -inset-[22%]" />
    </div>
  );
}
