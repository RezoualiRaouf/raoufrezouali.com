"use client";

import { useRef } from "react";
import * as THREE from "three";
import { COLORS, dotTexture, useThreeScene } from "./useThreeScene";

// Particles on tilted rings spinning at different speeds around a bright core,
// like a gyroscope that never stops. The whole system leans toward the cursor,
// and the small amber heart flies its own close loop around the core.
const RINGS = [
  { radius: 1.05, count: 900, tilt: [0.9, -0.5, 0], speed: -0.42 },
  { radius: 1.55, count: 1500, tilt: [0.3, 0.1, 0.25], speed: 0.28 },
  { radius: 2.05, count: 2000, tilt: [1.15, 0.35, 0], speed: -0.2 },
  { radius: 2.55, count: 2400, tilt: [-0.55, 0.8, 0.4], speed: 0.13 },
] as const;

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
    ({ scene, pointer }) => {
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
        const points = new THREE.Points(
          geometry,
          new THREE.PointsMaterial({
            size: 0.045,
            map: sprite,
            vertexColors: true,
            transparent: true,
            depthWrite: false,
          }),
        );
        const holder = new THREE.Group();
        holder.rotation.set(def.tilt[0], def.tilt[1], def.tilt[2]);
        holder.add(points);
        system.add(holder);
        return { points, speed: def.speed };
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

      return {
        tick: (dt, t) => {
          rings.forEach((ring) => (ring.points.rotation.y += ring.speed * dt));
          system.rotation.y += dt * 0.05;
          system.rotation.x += (-pointer.y * 0.45 - system.rotation.x) * 0.05;
          system.rotation.z += (pointer.x * 0.35 - system.rotation.z) * 0.05;

          heart.position.copy(heartAt(t, spot, plane));
          for (let i = 0; i < TRAIL; i++) {
            heartAt(t - (i + 1) * 0.02, spot, plane);
            trailPositions.set([spot.x, spot.y, spot.z], i * 3);
          }
          trailGeometry.attributes.position.needsUpdate = true;

          const pulse = 1 + Math.sin(t * 2.4) * 0.06;
          core.scale.setScalar(pulse);
          heart.scale.setScalar(2 - pulse);
        },
        dispose: () => sprite.dispose(),
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
