"use client";

import { useRef } from "react";
import * as THREE from "three";
import {
  flareSprite,
  haloSprite,
  lookFor,
  particleRing,
  spiralDisk,
  stippleHand,
  stippleOrb,
} from "./orbitParts";
import { dotTexture, useThreeScene } from "./useThreeScene";

export type OrbitVersion = "stipple" | "kept" | "flare" | "rings";

type Ring = { points: THREE.Points; speed: number };

// Four takes on the Orbit hero visual, built from the same stippled parts.
export default function OrbitVersions({ version }: { version: OrbitVersion }) {
  const ref = useRef<HTMLDivElement>(null);
  const tone = version === "kept" || version === "flare" ? "night" : "blue";

  useThreeScene(
    ref,
    ({ scene, pointer }) => {
      const sprite = dotTexture();
      const look = lookFor(tone);
      const system = new THREE.Group();
      scene.add(system);
      const rings: Ring[] = [];
      const addRing = (radius: number, count: number, tilt: [number, number, number], speed: number, parent = system) => {
        const holder = new THREE.Group();
        holder.rotation.set(...tilt);
        const points = particleRing(radius, count, sprite, look);
        holder.add(points);
        parent.add(holder);
        rings.push({ points, speed });
      };

      let orb: THREE.Points;
      let flare: THREE.Sprite | null = null;
      let halo: THREE.Sprite | null = null;
      let disk: ReturnType<typeof spiralDisk> | null = null;
      let hand: THREE.Points | null = null;
      const orbGroup = new THREE.Group();
      system.add(orbGroup);

      if (version === "stipple") {
        // A big stippled sphere with two thin rings and a soft flare.
        orb = stippleOrb(1.15, 9000, sprite, look);
        halo = haloSprite(4.2, 0.35, look.blending);
        flare = flareSprite(3.6, 0.55);
        addRing(1.75, 1300, [1.2, 0.2, 0.3], 0.22);
        addRing(2.3, 1700, [-0.4, 0.6, 0.2], -0.14);
      } else if (version === "kept") {
        // A dotted hand holding a small glowing orb, on a night background.
        hand = stippleHand(11000, sprite, look, 3.6);
        hand.position.set(-0.15, -1.05, 0);
        system.add(hand);
        orbGroup.position.set(0.35, 0.55, 0.2);
        orb = stippleOrb(0.62, 5200, sprite, look);
        halo = haloSprite(3.2, 0.55, look.blending);
        flare = flareSprite(4.4, 0.95);
        addRing(1.0, 900, [1.25, 0, 0.35], 0.5, orbGroup);
      } else if (version === "flare") {
        // A bright star with long rays and particles spiralling into it.
        orb = stippleOrb(0.72, 6000, sprite, look);
        halo = haloSprite(4.8, 0.6, look.blending);
        flare = flareSprite(6.2, 1);
        disk = spiralDisk(7000, 0.85, 2.9, sprite, look);
        const holder = new THREE.Group();
        holder.rotation.set(1.15, 0, 0.25);
        holder.add(disk.points);
        system.add(holder);
      } else {
        // The original Orbit rings, with a stippled core and a flare instead of a flat disc.
        orb = stippleOrb(0.5, 3800, sprite, look);
        halo = haloSprite(2.6, 0.4, look.blending);
        flare = flareSprite(3.2, 0.7);
        addRing(1.05, 900, [0.9, -0.5, 0], -0.42);
        addRing(1.55, 1500, [0.3, 0.1, 0.25], 0.28);
        addRing(2.05, 2000, [1.15, 0.35, 0], -0.2);
        addRing(2.55, 2400, [-0.55, 0.8, 0.4], 0.13);
      }

      orbGroup.add(orb);
      if (halo) orbGroup.add(halo);
      if (flare) orbGroup.add(flare);

      return {
        tick: (dt, t) => {
          rings.forEach((ring) => (ring.points.rotation.y += ring.speed * dt));
          orb.rotation.y += dt * 0.15;
          disk?.update(dt);
          if (flare) {
            flare.material.rotation += dt * 0.05;
            const pulse = 1 + Math.sin(t * 2.2) * 0.05;
            flare.scale.setScalar((flare.userData.base ??= flare.scale.x) * pulse);
          }
          if (version === "kept") {
            // The orb floats gently above the palm.
            orbGroup.position.y = 0.55 + Math.sin(t * 1.3) * 0.08;
          }
          const lean = hand ? 0.12 : 0.3;
          system.rotation.x += (-pointer.y * lean - system.rotation.x) * 0.05;
          system.rotation.y += (pointer.x * lean - system.rotation.y) * 0.05;
        },
        dispose: () => sprite.dispose(),
      };
    },
    { cameraZ: 7.2 },
  );

  return <div ref={ref} className="size-full" />;
}
