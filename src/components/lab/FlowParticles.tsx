"use client";

import { useRef } from "react";
import * as THREE from "three";
import { COLORS, dotTexture, useThreeScene } from "./useThreeScene";

// Eight wavy lanes of particles streaming left to right, like lines of data
// that never stop moving. The cursor pushes the lanes apart where it passes.
const LANES = 8;
const PER_LANE = 750;
const COUNT = LANES * PER_LANE;
const HALF_WIDTH = 3.4;

const gaussian = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

export default function FlowParticles() {
  const ref = useRef<HTMLDivElement>(null);

  useThreeScene(
    ref,
    ({ scene, pointer }) => {
      const sprite = dotTexture();
      const lane = new Uint8Array(COUNT);
      const xs = new Float32Array(COUNT);
      const speed = new Float32Array(COUNT);
      const jitter = new Float32Array(COUNT * 2);
      const positions = new Float32Array(COUNT * 3);
      const colors = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        lane[i] = Math.floor(i / PER_LANE);
        xs[i] = (Math.random() * 2 - 1) * HALF_WIDTH;
        speed[i] = 0.7 + Math.random() * 0.6;
        jitter[i * 2] = gaussian() * 0.045;
        jitter[i * 2 + 1] = gaussian() * 0.15;
        const roll = Math.random();
        const c = roll < 0.08 ? COLORS.amber : lane[i] % 2 ? COLORS.ice : COLORS.white;
        colors.set([c.r, c.g, c.b], i * 3);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      const points = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({ size: 0.05, map: sprite, vertexColors: true, transparent: true, depthWrite: false }),
      );
      points.rotation.z = -0.12;
      scene.add(points);
      let pointerActive = false;

      return {
        tick: (dt, t) => {
          if (pointer.x !== 0 || pointer.y !== 0) pointerActive = true;
          const px = pointer.x * HALF_WIDTH;
          const py = pointer.y * 2;
          for (let i = 0; i < COUNT; i++) {
            let x = xs[i] + speed[i] * dt * 0.9;
            if (x > HALF_WIDTH) x -= HALF_WIDTH * 2;
            xs[i] = x;
            const l = lane[i];
            const laneY = ((l / (LANES - 1)) * 2 - 1) * 1.15;
            let y = laneY + 0.3 * Math.sin(x * 1.25 - t * 0.9 + l * 0.7) + jitter[i * 2];
            // Push lanes apart around the cursor (once the mouse has moved).
            if (pointerActive) {
              const dx = x - px;
              const dy = y - py;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 0.9 && dist > 0.001) y += (dy / dist) * (0.9 - dist) * 0.7;
            }
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = (l - LANES / 2) * 0.08 + jitter[i * 2 + 1];
          }
          geometry.attributes.position.needsUpdate = true;
        },
        dispose: () => sprite.dispose(),
      };
    },
    { cameraZ: 6.2 },
  );

  // Soft fade on the left and right edges.
  return (
    <div
      ref={ref}
      className="size-full [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]"
    />
  );
}
