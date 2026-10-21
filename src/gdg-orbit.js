import * as THREE from 'three';

// Anillo 3D de piezas "de Google" orbitando alrededor del logo de GDG A Coruña:
// destellos de cuatro puntas (estilo Gemini), los corchetes < > de GDG y bolitas de colores.
// Un disco invisible en el plano del círculo oculta lo que pasa por detrás.

const GOOGLE = { blue: 0x4285f4, red: 0xea4335, yellow: 0xfbbc04, green: 0x34a853 };
const CAMERA_DIST = 10;
const FOV = 35;
// El lienzo es 1,6 veces el círculo (ver CSS): el radio del círculo en el mundo 3D sale de ahí
const CANVAS_SCALE = 1.6;
const DISC_RADIUS = (0.5 / (CANVAS_SCALE / 2)) * CAMERA_DIST * Math.tan(THREE.MathUtils.degToRad(FOV / 2));

function sparkleGeometry() {
  const s = new THREE.Shape();
  const k = 0.14; // cuánto se "cierra" la cintura de la estrella
  s.moveTo(0, 1);
  s.quadraticCurveTo(k, k, 1, 0);
  s.quadraticCurveTo(k, -k, 0, -1);
  s.quadraticCurveTo(-k, -k, -1, 0);
  s.quadraticCurveTo(-k, k, 0, 1);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 3, curveSegments: 24 });
  geo.center();
  // Degradado azul → violeta como el de Gemini, por vértice
  const a = new THREE.Color(0x4f8df5);
  const b = new THREE.Color(0xa77bf3);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    c.copy(a).lerp(b, THREE.MathUtils.clamp((pos.getX(i) - pos.getY(i) + 1.4) / 2.8, 0, 1));
    c.toArray(colors, i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geo;
}

// Un corchete del logo de GDG: dos "píldoras" en ángulo, de dos colores
function chevron(dir, topColor, bottomColor) {
  const group = new THREE.Group();
  const geo = new THREE.CapsuleGeometry(0.2, 0.75, 8, 16);
  for (const [sign, color] of [
    [1, topColor],
    [-1, bottomColor],
  ]) {
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.05 }));
    m.rotation.z = dir * sign * -0.87;
    m.position.set(0, sign * 0.27, 0);
    group.add(m);
  }
  return group;
}

export function initGdgOrbit(canvas) {
  if (!canvas) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.set(0, 0, CAMERA_DIST);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a1150, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 4, 6);
  scene.add(key);

  // Disco invisible que solo escribe profundidad: tapa lo que orbita por detrás del círculo
  const occluder = new THREE.Mesh(new THREE.CircleGeometry(DISC_RADIUS, 64), new THREE.MeshBasicMaterial({ colorWrite: false }));
  occluder.renderOrder = -1;
  scene.add(occluder);

  // El anillo va inclinado para que se vea como una órbita alrededor del "planeta"
  const ring = new THREE.Group();
  ring.rotation.set(0.42, 0, -0.22);
  scene.add(ring);

  const sparkleGeo = sparkleGeometry();
  const sparkleMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.25, metalness: 0.1 });
  const ballGeo = new THREE.SphereGeometry(1, 32, 16);
  const items = [
    { obj: new THREE.Mesh(sparkleGeo, sparkleMat), size: 0.62, radius: 2.9, phase: 0.2, speed: 0.22, y: 0.25, facing: true },
    { obj: new THREE.Mesh(sparkleGeo, sparkleMat), size: 0.32, radius: 2.5, phase: 3.4, speed: 0.22, y: -0.35, facing: true },
    { obj: chevron(1, GOOGLE.red, GOOGLE.blue), size: 0.55, radius: 2.8, phase: 1.5, speed: 0.22, y: 0, facing: true, wobble: true },
    { obj: chevron(-1, GOOGLE.green, GOOGLE.yellow), size: 0.55, radius: 2.8, phase: 2.2, speed: 0.22, y: 0, facing: true, wobble: true },
    ...Object.values(GOOGLE).map((color, i) => ({
      obj: new THREE.Mesh(ballGeo, new THREE.MeshStandardMaterial({ color, roughness: 0.3 })),
      size: 0.14 + (i % 2) * 0.06,
      radius: 2.35 + (i % 3) * 0.35,
      phase: 4.1 + i * 0.75,
      speed: 0.22,
      y: (i % 2 ? 1 : -1) * 0.45,
    })),
  ];
  for (const it of items) {
    it.obj.scale.setScalar(it.size);
    it.spin = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.8);
    it.hover = 0; // 0 → 1 al pasar el ratón por encima
    it.kick = 1; // progreso (0 → 1) de la vuelta completa que da al hacer clic; 1 = en reposo
    it.obj.traverse((o) => (o.userData.item = it));
    ring.add(it.obj);
  }

  function resize() {
    const size = canvas.clientWidth;
    if (!size) return;
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  // Interacción: el anillo se inclina hacia el puntero; las piezas reaccionan al pasar y al hacer clic
  const pointer = new THREE.Vector2(9, 9);
  const tilt = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let hovered = null;

  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  });
  canvas.addEventListener('pointerleave', () => pointer.set(9, 9));
  canvas.addEventListener('click', () => {
    if (hovered && hovered.kick >= 1) hovered.kick = 0;
  });

  let visible = false;
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(canvas);

  const clock = new THREE.Clock();
  let t = 0;
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1);
    if (!visible || document.hidden) return;
    frame(dt);
  });

  function frame(dt) {
    t += dt * (reducedMotion ? 0.15 : 1);

    const active = Math.abs(pointer.x) <= 1;
    tilt.lerp(active ? pointer : new THREE.Vector2(), 0.06);
    // solo se inclina el anillo: el disco que tapa debe seguir alineado con el círculo HTML
    ring.rotation.set(0.42 - tilt.y * 0.25, tilt.x * 0.35, -0.22);

    hovered = null;
    if (active) {
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(ring.children, true)[0];
      hovered = hit?.object.userData.item ?? null;
    }
    canvas.style.cursor = hovered ? 'pointer' : '';

    for (const it of items) {
      const a = it.phase + t * it.speed;
      it.obj.position.set(Math.cos(a) * it.radius, it.y + Math.sin(t * 0.9 + it.phase) * 0.15, Math.sin(a) * it.radius);
      it.hover += ((it === hovered ? 1 : 0) - it.hover) * 0.12;
      it.kick = Math.min(1, it.kick + dt / 0.9);
      const flip = (1 - (1 - it.kick) ** 3) * Math.PI * 2; // vuelta completa con frenada suave
      const spinBoost = 1 + it.hover * 3;
      if (it.facing) {
        // Destellos y corchetes miran a cámara (contrarrestando la inclinación del anillo) para que
        // se reconozcan: los destellos giran en su plano y los corchetes solo se balancean
        it.obj.quaternion.copy(ring.quaternion).invert();
        if (!it.wobble) it.angle = (it.angle ?? 0) + dt * 0.6 * spinBoost;
        const sway = it.wobble ? Math.sin(t * 0.9 + it.phase) * (0.2 + it.hover * 0.2) : 0;
        it.obj.rotateZ((it.angle ?? 0) + sway);
        it.obj.rotateY(Math.sin(t * 0.8 + it.phase) * 0.35 + flip);
      } else {
        it.obj.rotation.x += it.spin.x * dt * spinBoost;
        it.obj.rotation.y += (it.spin.y + 0.3) * dt * spinBoost + (it.kick < 1 ? dt * 8 : 0);
        it.obj.rotation.z += it.spin.z * dt * spinBoost;
      }
      it.obj.scale.setScalar(it.size * (1 + it.hover * 0.3 + Math.sin(it.kick * Math.PI) * 0.25));
    }
    renderer.render(scene, camera);
  }

  return { frame };
}
