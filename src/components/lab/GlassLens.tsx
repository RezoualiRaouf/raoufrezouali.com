"use client";

import { useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { BACKDROP_FRAGMENT, useThreeScene } from "./useThreeScene";

// A big glass sphere and two small ones drift over a grid of dots, magnifying
// and bending it like a lens. The big sphere follows the cursor a little.
export default function GlassLens() {
  const ref = useRef<HTMLDivElement>(null);

  useThreeScene(
    ref,
    ({ renderer, scene, pointer }) => {
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;

      const uniforms = {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uPointer: { value: new THREE.Vector2() },
        uDot: { value: 18 },
      };
      const backdrop = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.ShaderMaterial({
          uniforms,
          vertexShader: "void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
          fragmentShader: `${BACKDROP_FRAGMENT}
            uniform float uDot;
            void main() {
              vec2 uv = gl_FragCoord.xy / uResolution;
              float edge = smoothstep(0.62, 0.3, length(uv - 0.5));
              vec3 col = mix(vec3(0.0, 0.6, 1.0), field(uv), edge * 0.8);
              // Grid of white dots the glass can magnify.
              vec2 cell = fract(gl_FragCoord.xy / uDot) - 0.5;
              float dotMask = smoothstep(0.17, 0.1, length(cell));
              col = mix(col, vec3(1.0), dotMask * 0.55 * smoothstep(0.75, 0.2, length(uv - 0.5)));
              gl_FragColor = vec4(col, 1.0);
            }`,
        }),
      );
      backdrop.position.z = -3;
      scene.add(backdrop);

      const glass = () =>
        new THREE.MeshPhysicalMaterial({
          color: "#ffffff",
          transmission: 1,
          thickness: 2.2,
          roughness: 0,
          ior: 1.6,
          dispersion: 1.2,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
          envMapIntensity: 1.2,
        });
      const big = new THREE.Mesh(new THREE.SphereGeometry(1.3, 96, 96), glass());
      const small = new THREE.Mesh(new THREE.SphereGeometry(0.38, 64, 64), glass());
      const tiny = new THREE.Mesh(new THREE.SphereGeometry(0.24, 48, 48), glass());
      scene.add(big, small, tiny);
      const size = new THREE.Vector2();

      return {
        tick: (dt, t) => {
          uniforms.uTime.value += dt;
          uniforms.uPointer.value.set(pointer.x, pointer.y);
          const tx = Math.sin(t * 0.35) * 0.55 + pointer.x * 0.5;
          const ty = Math.sin(t * 0.5) * 0.35 + pointer.y * 0.4;
          big.position.x += (tx - big.position.x) * 0.04;
          big.position.y += (ty - big.position.y) * 0.04;
          small.position.set(big.position.x + Math.cos(t * 0.8) * 2, big.position.y + Math.sin(t * 0.8) * 1.2, 0.8);
          tiny.position.set(big.position.x + Math.cos(t * 0.8 + 2.4) * 1.7, big.position.y + Math.sin(t * 0.8 + 2.4) * 1.5, 1);
        },
        onResize: () => {
          renderer.getDrawingBufferSize(size);
          uniforms.uResolution.value.copy(size);
          uniforms.uDot.value = 18 * renderer.getPixelRatio();
        },
        dispose: () => {
          env.dispose();
          pmrem.dispose();
        },
      };
    },
    { cameraZ: 6.4 },
  );

  return <div ref={ref} className="size-full [mask-image:radial-gradient(closest-side,black_78%,transparent)]" />;
}
