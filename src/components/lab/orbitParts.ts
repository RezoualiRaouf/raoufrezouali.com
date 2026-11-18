import * as THREE from "three";
import { COLORS } from "./useThreeScene";

// Building blocks for the Orbit versions: a stippled orb, light flare and halo,
// particle rings, a dotted hand and an in-falling spiral. Everything is made of
// small dots so it keeps a grainy, hand-stippled look.

export type Look = { blending: THREE.Blending; dotSize: number };

const gaussian = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

function pointsFrom(positions: number[], colors: number[], sprite: THREE.Texture, look: Look, size = look.dotSize) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size,
      map: sprite,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: look.blending,
    }),
  );
}

/** Dots on a sphere, packed tighter on the side facing the light. */
export function stippleOrb(radius: number, count: number, sprite: THREE.Texture, look: Look, light = new THREE.Vector3(-0.5, 0.7, 0.6)) {
  const dir = light.clone().normalize();
  const positions: number[] = [];
  const colors: number[] = [];
  const n = new THREE.Vector3();
  let tries = 0;
  while (positions.length / 3 < count && tries < count * 8) {
    tries++;
    n.set(gaussian(), gaussian(), gaussian()).normalize();
    const lit = Math.max(0, n.dot(dir));
    // Lit side dense, shadow side sparse but never empty (rim stays visible).
    if (Math.random() > 0.12 + 0.88 * Math.pow(lit, 1.3)) continue;
    const r = radius * (1 - Math.random() * 0.06);
    positions.push(n.x * r, n.y * r, n.z * r);
    const c = Math.random() < 0.05 ? COLORS.amber : COLORS.white;
    colors.push(c.r, c.g, c.b);
  }
  return pointsFrom(positions, colors, sprite, look);
}

/** A thin ring of dots; returns a holder you can tilt and the points to spin. */
export function particleRing(radius: number, count: number, sprite: THREE.Texture, look: Look, spread = 0.06) {
  const positions: number[] = [];
  const colors: number[] = [];
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = radius + gaussian() * spread;
    positions.push(Math.cos(a) * r, gaussian() * spread * 0.4, Math.sin(a) * r);
    const roll = Math.random();
    const c = roll < 0.08 ? COLORS.amber : roll < 0.3 ? COLORS.ice : COLORS.white;
    colors.push(c.r, c.g, c.b);
  }
  return pointsFrom(positions, colors, sprite, look);
}

/** Soft round glow sprite. */
export function haloSprite(size: number, opacity: number, blending: THREE.Blending) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.25, "rgba(220,240,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, opacity, depthWrite: false, blending }),
  );
  sprite.scale.setScalar(size);
  return sprite;
}

/**
 * Star-burst flare: a bright core with four long rays and four short ones.
 * Always additive, so the rays stay crisp white on the sky blue too.
 */
export function flareSprite(size: number, opacity: number, blending: THREE.Blending = THREE.AdditiveBlending) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.globalCompositeOperation = "lighter";
  const core = g.createRadialGradient(256, 256, 0, 256, 256, 70);
  core.addColorStop(0, "rgba(255,255,255,1)");
  core.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = core;
  g.fillRect(0, 0, 512, 512);
  const ray = (angle: number, length: number, width: number) => {
    g.save();
    g.translate(256, 256);
    g.rotate(angle);
    const grad = g.createLinearGradient(0, 0, length, 0);
    grad.addColorStop(0, "rgba(255,255,255,0.95)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(0, -width);
    g.lineTo(length, 0);
    g.lineTo(0, width);
    g.closePath();
    g.fill();
    g.restore();
  };
  for (let i = 0; i < 4; i++) ray((i * Math.PI) / 2 + 0.35, 250, 7);
  for (let i = 0; i < 4; i++) ray((i * Math.PI) / 2 + 0.35 + Math.PI / 4, 120, 4);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, opacity, depthWrite: false, blending }),
  );
  sprite.scale.setScalar(size);
  return sprite;
}

/**
 * An open hand, palm up, made of dots. The silhouette is drawn on a canvas,
 * then sampled; top edges (lit by the orb) get more dots, and the fingers curl up.
 */
export function stippleHand(count: number, sprite: THREE.Texture, look: Look, width = 3.2) {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff";
  g.strokeStyle = "#fff";
  g.lineCap = "round";
  // Forearm coming in from the bottom left, narrowing into the wrist.
  g.beginPath();
  g.moveTo(0, 350);
  g.quadraticCurveTo(90, 326, 168, 316);
  g.lineTo(186, 386);
  g.quadraticCurveTo(95, 408, 0, 446);
  g.closePath();
  g.fill();
  // Palm.
  g.beginPath();
  g.ellipse(255, 345, 118, 58, -0.12, 0, Math.PI * 2);
  g.fill();
  // Fingers fanning to the right and curling up at the tips.
  const finger = (x1: number, y1: number, x2: number, y2: number, w: number) => {
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(x1, y1);
    g.quadraticCurveTo((x1 + x2) / 2 + 10, (y1 + y2) / 2 + 12, x2, y2);
    g.stroke();
  };
  // Kept close together so they read as one open hand, not a claw.
  finger(320, 316, 448, 284, 28);
  finger(332, 334, 474, 310, 29);
  finger(332, 353, 466, 336, 27);
  finger(318, 372, 436, 360, 23);
  // Thumb pointing up.
  finger(215, 318, 262, 228, 34);

  const data = g.getImageData(0, 0, S, S).data;
  const filled = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < S && y < S && data[(Math.floor(y) * S + Math.floor(x)) * 4 + 3] > 0;

  const positions: number[] = [];
  const colors: number[] = [];
  const scale = width / S;
  let tries = 0;
  while (positions.length / 3 < count && tries < count * 30) {
    tries++;
    const px = Math.random() * S;
    const py = Math.random() * S;
    if (!filled(px, py)) continue;
    const topEdge = !filled(px, py - 7) ? 1 : 0;
    const anyEdge = topEdge || !filled(px, py + 7) || !filled(px - 7, py) || !filled(px + 7, py) ? 1 : 0;
    const height = 1 - py / S;
    // The forearm dissolves toward the left instead of ending in a hard edge.
    const fade = Math.min(1, px / 190);
    const p = (0.12 + height * 0.35 + anyEdge * 0.35 + topEdge * 0.4) * fade * fade;
    if (Math.random() > p) continue;
    let x = (px - S / 2) * scale;
    let y = -(py - S / 2) * scale;
    // Fingers curl upward, toward the orb.
    if (px > 300) {
      const k = (px - 300) / 170;
      y += k * k * 0.45;
    }
    const z = (anyEdge ? 0.05 : -0.05) + gaussian() * 0.04;
    x += gaussian() * 0.004;
    positions.push(x, y, z);
    const shade = 0.55 + height * 0.45;
    colors.push(shade, shade, shade);
  }
  return pointsFrom(positions, colors, sprite, look, look.dotSize * 0.9);
}

/** Particles spiralling inward on a tilted disk, like matter falling into a star. */
export function spiralDisk(count: number, inner: number, outer: number, sprite: THREE.Texture, look: Look) {
  const angle = new Float32Array(count);
  const radius = new Float32Array(count);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    angle[i] = Math.random() * Math.PI * 2;
    radius[i] = inner + Math.random() * (outer - inner);
    const c = Math.random() < 0.12 ? COLORS.amber : Math.random() < 0.4 ? COLORS.ice : COLORS.white;
    colors.set([c.r, c.g, c.b], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ size: look.dotSize, map: sprite, vertexColors: true, transparent: true, depthWrite: false, blending: look.blending }),
  );
  const update = (dt: number) => {
    for (let i = 0; i < count; i++) {
      const r = radius[i];
      angle[i] += dt * (1.6 / (r * r + 0.3));
      radius[i] = r - dt * 0.12 * (outer / r) * 0.35;
      if (radius[i] < inner) radius[i] = outer - Math.random() * 0.3;
      const wobble = Math.sin(angle[i] * 3 + r) * 0.03;
      positions[i * 3] = Math.cos(angle[i]) * radius[i];
      positions[i * 3 + 1] = wobble;
      positions[i * 3 + 2] = Math.sin(angle[i]) * radius[i];
    }
    geometry.attributes.position.needsUpdate = true;
  };
  update(0);
  return { points, update };
}

export function lookFor(tone: "blue" | "night"): Look {
  return tone === "night"
    ? { blending: THREE.AdditiveBlending, dotSize: 0.03 }
    : { blending: THREE.NormalBlending, dotSize: 0.034 };
}
