import * as THREE from 'three';

// Efectos que en Blender eran simulaciones (humo y partículas de polvo) y que glTF no puede
// exportar. Se recrean con partículas animadas íntegramente en la GPU: un solo draw call cada uno.

const softPointFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

function pointsMaterial({ vertexShader, color, blending, uniforms = {} }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uScale: { value: 1 }, // px por unidad de mundo a distancia 1 (se calcula en resize)
      uColor: { value: new THREE.Color(color) },
      ...uniforms,
    },
    vertexShader,
    fragmentShader: softPointFragment,
    transparent: true,
    depthWrite: false,
    blending,
  });
}

const MAX_GLOWS = 4;

/**
 * Polvo flotando por toda la habitación, como el sistema de partículas "polvo".
 * Las motas solo se ven cuando cruzan una luz (`glows`: puntos de luz, `beam`: haz vertical
 * del techo); en el resto de la habitación quedan casi a oscuras.
 */
export function createDust({ center, size, glows = [], beam, count = 260 }) {
  const glowPos = Array.from({ length: MAX_GLOWS }, (_, i) => glows[i]?.position.clone() ?? new THREE.Vector3());
  const glowColor = Array.from({ length: MAX_GLOWS }, (_, i) => new THREE.Color(glows[i]?.color ?? 0x000000));
  const glowRadius = Array.from({ length: MAX_GLOWS }, (_, i) => glows[i]?.radius ?? 1);

  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = center.x + (Math.random() - 0.5) * size.x;
    pos[i * 3 + 1] = center.y + (Math.random() - 0.5) * size.y;
    pos[i * 3 + 2] = center.z + (Math.random() - 0.5) * size.z;
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

  const mat = pointsMaterial({
    color: 0xffe6f4,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uGlowPos: { value: glowPos },
      uGlowColor: { value: glowColor },
      uGlowRadius: { value: glowRadius },
      uBeamPos: { value: beam?.position.clone() ?? new THREE.Vector3() },
      uBeamColor: { value: new THREE.Color(beam?.color ?? 0x000000) },
      uBeamRadius: { value: beam?.radius ?? 1 },
      uBase: { value: 0.12 }, // brillo de las motas lejos de las luces
      uGlowGain: { value: 1.6 }, // cuánto brillan al cruzar una luz
      uSizeMul: { value: 1 },
    },
    vertexShader: /* glsl */ `
      #define MAX_GLOWS ${MAX_GLOWS}
      uniform float uTime;
      uniform float uScale;
      uniform vec3 uColor;
      uniform vec3 uGlowPos[MAX_GLOWS];
      uniform vec3 uGlowColor[MAX_GLOWS];
      uniform float uGlowRadius[MAX_GLOWS];
      uniform vec3 uBeamPos;
      uniform vec3 uBeamColor;
      uniform float uBeamRadius;
      uniform float uBase;
      uniform float uGlowGain;
      uniform float uSizeMul;
      attribute float aSeed;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float t = uTime * 0.12 + aSeed * 40.0;
        vec3 p = position;
        // deriva lenta y desordenada, sin gravedad (igual que en Blender)
        p.x += sin(t * 1.3 + aSeed * 6.0) * 1.6;
        p.y += sin(t * 0.7 + aSeed * 11.0) * 1.2;
        p.z += cos(t * 1.1 + aSeed * 3.0) * 1.6;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (0.2 + aSeed * 0.28) * uSizeMul * uScale / -mv.z;

        // Cuánta luz recibe la mota: casi nada salvo cerca de las lámparas o dentro del haz del techo
        vec3 light = uColor * uBase;
        for (int i = 0; i < MAX_GLOWS; i++) {
          float k = max(0.0, 1.0 - distance(p, uGlowPos[i]) / uGlowRadius[i]);
          light += uGlowColor[i] * k * k * uGlowGain;
        }
        float r = length(p.xz - uBeamPos.xz);
        float b = max(0.0, 1.0 - r / uBeamRadius);
        light += uBeamColor * b * b * uGlowGain;
        vColor = light;

        // parpadeo suave, como motas que giran y reflejan la luz
        vAlpha = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * 0.9 + aSeed * 30.0), 3.0);
      }
    `,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.name = 'efecto_polvo';
  return points;
}

/** Columna de humo/vapor, sustituye al dominio de fluidos "humo domain" */
export function createSmoke({ origin, height = 12, width = 2.6, count = 70 }) {
  const seed = new Float32Array(count);
  const pos = new Float32Array(count * 3); // todos nacen en el emisor; el shader los mueve
  for (let i = 0; i < count; i++) {
    seed[i] = i / count + Math.random() / count;
    pos[i * 3] = origin.x;
    pos[i * 3 + 1] = origin.y;
    pos[i * 3 + 2] = origin.z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

  const mat = pointsMaterial({
    color: 0xf3ecff,
    blending: THREE.NormalBlending,
    uniforms: { uOpacity: { value: 0.32 } },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uScale;
      uniform float uOpacity;
      uniform vec3 uColor;
      attribute float aSeed;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = uColor;
        float life = fract(uTime / 4.5 + aSeed);       // 0 → 1 a lo largo de su vida
        float swirl = aSeed * 50.0 + uTime * 0.8;
        vec3 p = position;
        p.y += life * ${height.toFixed(1)};
        p.x += sin(swirl) * ${(width / 2).toFixed(2)} * life + sin(life * 6.0 + aSeed * 9.0) * 0.5;
        p.z += cos(swirl * 0.8) * ${(width / 2).toFixed(2)} * life;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.2 + life * 3.2) * uScale / -mv.z;
        vAlpha = smoothstep(0.0, 0.12, life) * (1.0 - life) * uOpacity;
      }
    `,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.name = 'efecto_humo';
  return points;
}
