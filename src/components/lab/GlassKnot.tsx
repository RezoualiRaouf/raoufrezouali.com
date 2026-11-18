"use client";

import { useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { BACKDROP_FRAGMENT, useThreeScene } from "./useThreeScene";

// A clear glass knot (an endless loop, always running) slowly turning in front
// of drifting colour, which it bends and splits like real glass.
export default function GlassKnot() {
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
      };
      const backdrop = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.ShaderMaterial({
          uniforms,
          vertexShader: "void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
          fragmentShader: `${BACKDROP_FRAGMENT}
            void main() {
              vec2 uv = gl_FragCoord.xy / uResolution;
              // Fade to plain sky blue at the edges so it melts into the hero.
              float edge = smoothstep(0.62, 0.28, length(uv - 0.5));
              gl_FragColor = vec4(mix(vec3(0.0, 0.6, 1.0), field(uv), edge), 1.0);
            }`,
        }),
      );
      backdrop.position.z = -3;
      scene.add(backdrop);

      const knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1.05, 0.36, 260, 48, 2, 3),
        new THREE.MeshPhysicalMaterial({
          color: "#ffffff",
          transmission: 1,
          thickness: 1.3,
          roughness: 0.04,
          ior: 1.5,
          dispersion: 1.5,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
          attenuationColor: new THREE.Color("#d6ecff"),
          attenuationDistance: 3,
          envMapIntensity: 1.1,
        }),
      );
      scene.add(knot);
      const size = new THREE.Vector2();

      return {
        tick: (dt) => {
          uniforms.uTime.value += dt;
          uniforms.uPointer.value.set(pointer.x, pointer.y);
          knot.rotation.y += dt * 0.25;
          knot.rotation.x += (pointer.y * -0.4 + 0.3 - knot.rotation.x) * 0.04;
          knot.rotation.z += (pointer.x * 0.3 - knot.rotation.z) * 0.04;
        },
        onResize: () => {
          renderer.getDrawingBufferSize(size);
          uniforms.uResolution.value.copy(size);
        },
        dispose: () => {
          env.dispose();
          pmrem.dispose();
        },
      };
    },
    { cameraZ: 6.2 },
  );

  return <div ref={ref} className="size-full [mask-image:radial-gradient(closest-side,black_78%,transparent)]" />;
}
