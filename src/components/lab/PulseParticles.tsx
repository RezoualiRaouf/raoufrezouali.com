"use client";

import { useRef } from "react";
import * as THREE from "three";
import { COLORS, dotTexture, useThreeScene } from "./useThreeScene";

// A heartbeat line made of particles scrolling across, like an uptime monitor
// that says "still running". Peaks glow amber; the cursor raises the beat.
const COUNT = 3200;
const WIDTH = 6.6;
const PERIOD = 2.4;

const g = (p: number, center: number, width: number) => Math.exp(-((p - center) ** 2) / (2 * width * width));

/** One heartbeat over phase 0..1: small P wave, sharp QRS spike, rounded T wave. */
function beat(p: number) {
  return (
    0.12 * g(p, 0.12, 0.025) -
    0.16 * g(p, 0.2, 0.01) +
    1.0 * g(p, 0.23, 0.012) -
    0.36 * g(p, 0.26, 0.012) +
    0.26 * g(p, 0.46, 0.04)
  );
}

export default function PulseParticles() {
  const ref = useRef<HTMLDivElement>(null);

  useThreeScene(
    ref,
    ({ scene, pointer }) => {
      const sprite = dotTexture();
      const baseX = new Float32Array(COUNT);
      const jitter = new Float32Array(COUNT * 2);
      const positions = new Float32Array(COUNT * 3);
      const colors = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        baseX[i] = (Math.random() - 0.5) * WIDTH;
        jitter[i * 2] = (Math.random() - 0.5) * 0.09;
        jitter[i * 2 + 1] = (Math.random() - 0.5) * 0.5;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      const points = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({ size: 0.055, map: sprite, vertexColors: true, transparent: true, depthWrite: false }),
      );
      scene.add(points);

      // A faint baseline under the beat.
      const baseline = new THREE.Mesh(
        new THREE.PlaneGeometry(WIDTH, 0.008),
        new THREE.MeshBasicMaterial({ color: COLORS.white, transparent: true, opacity: 0.35 }),
      );
      scene.add(baseline);

      const tmp = new THREE.Color();
      let gain = 1;

      return {
        tick: (dt, t) => {
          // Moving the cursor up makes the beat stronger.
          gain += (1 + Math.max(0, pointer.y) * 0.6 - gain) * 0.05;
          for (let i = 0; i < COUNT; i++) {
            const x = baseX[i];
            const phase = (((x - t * 1.7) / PERIOD) % 1 + 1) % 1;
            const y = beat(phase) * 1.35 * gain;
            const spread = 1 + Math.abs(y) * 1.5;
            positions[i * 3] = x;
            positions[i * 3 + 1] = y + jitter[i * 2] * spread;
            positions[i * 3 + 2] = jitter[i * 2 + 1];
            // Peaks glow amber, the rest stays white/ice.
            const heat = THREE.MathUtils.clamp(Math.abs(y) / 0.9, 0, 1);
            tmp.copy(COLORS.white).lerp(COLORS.amber, heat * heat);
            if (heat < 0.05 && i % 3 === 0) tmp.copy(COLORS.ice);
            colors[i * 3] = tmp.r;
            colors[i * 3 + 1] = tmp.g;
            colors[i * 3 + 2] = tmp.b;
          }
          geometry.attributes.position.needsUpdate = true;
          geometry.attributes.color.needsUpdate = true;
          points.rotation.y = pointer.x * 0.25;
          baseline.rotation.y = points.rotation.y;
          void dt;
        },
        dispose: () => sprite.dispose(),
      };
    },
    { cameraZ: 6 },
  );

  return (
    <div
      ref={ref}
      className="size-full [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
    />
  );
}
