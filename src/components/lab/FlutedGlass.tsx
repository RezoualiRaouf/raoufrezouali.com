"use client";

import { useRef } from "react";
import * as THREE from "three";
import { BACKDROP_FRAGMENT, useThreeScene } from "./useThreeScene";

// A slab of fluted (ribbed) glass. Colour drifts behind it and every rib bends
// it into stripes. The navy blob follows the cursor, so the glass reacts.
export default function FlutedGlass() {
  const ref = useRef<HTMLDivElement>(null);

  useThreeScene(ref, ({ renderer, scene, pointer }) => {
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2() },
    };
    const quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: "void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }",
        fragmentShader: `${BACKDROP_FRAGMENT}
          float roundedBox(vec2 p, vec2 b, float r) {
            vec2 q = abs(p) - b + r;
            return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
          }
          void main() {
            vec2 uv = gl_FragCoord.xy / uResolution;
            float aspect = uResolution.x / uResolution.y;
            vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
            vec2 half_ = vec2(0.34, 0.4);
            float d = roundedBox(p, half_, 0.07);
            float inside = smoothstep(0.004, -0.004, d);

            // Outside the glass: the colour field, fading to sky blue at the edges.
            float edge = smoothstep(0.7, 0.3, length(uv - 0.5));
            vec3 outside = mix(vec3(0.0, 0.6, 1.0), field(uv), edge * 0.85);

            // Inside: each rib acts as a small lens and shifts what is behind it.
            float ribs = 15.0;
            float local = (p.x + half_.x) / (2.0 * half_.x);
            float lens = fract(local * ribs + 0.02 * sin(uTime * 0.6)) - 0.5;
            vec2 suv = uv + vec2(lens * 0.11, lens * lens * 0.04);
            vec3 glass = field(suv);
            glass = mix(glass, vec3(1.0), 0.08);
            glass *= 0.9 + 0.14 * cos(lens * 3.14159);
            glass += pow(smoothstep(0.34, 0.5, abs(lens)), 2.0) * 0.22;
            // Bright rim along the edge of the slab.
            glass += smoothstep(-0.012, 0.0, d) * 0.5;

            gl_FragColor = vec4(mix(outside, glass, inside), 1.0);
          }`,
      }),
    );
    quad.frustumCulled = false;
    scene.add(quad);
    const size = new THREE.Vector2();
    const target = new THREE.Vector2();

    return {
      tick: (dt) => {
        uniforms.uTime.value += dt;
        target.set(pointer.x, pointer.y);
        uniforms.uPointer.value.lerp(target, 0.06);
      },
      onResize: () => {
        renderer.getDrawingBufferSize(size);
        uniforms.uResolution.value.copy(size);
      },
    };
  });

  return <div ref={ref} className="size-full [mask-image:radial-gradient(closest-side,black_78%,transparent)]" />;
}
