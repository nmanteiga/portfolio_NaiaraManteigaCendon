import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createDust, createSmoke } from './effects.js';
import { LIGHTING } from './lighting.js';

// Datos sacados de la escena de Blender (convertidos a ejes Y-up de glTF)
const ROOM_CENTER = new THREE.Vector3(-3, 20, -3);
const BLENDER_VIEW_DIR = new THREE.Vector3(126, 144, -48).normalize(); // "cámara rotación"
const ROOM_RADIUS = 56;
const CEILING_LIGHT_POS = new THREE.Vector3(0, 62, 0); // "luz techo" (Area, no exportable a glTF)
const SMOKE_ORIGIN = new THREE.Vector3(23.45, 6.2, 10.04); // "humo base" (emisor del humo)
const DUST_CENTER = new THREE.Vector3(0, 30, 0); // cubo emisor "polvo"
const DUST_SIZE = new THREE.Vector3(56, 54, 56);
// Cortinas: la simulación (24 fps) se reproduce una vez y luego "respira" entre estos fotogramas
const CURTAIN_FPS = 24;
const CURTAIN_BREEZE = { from: 150, to: 250, period: 9 }; // periodo en segundos

// Simulaciones de Blender que se exportan como objetos sólidos o congelados: las oculto
// y las recreo (humo y polvo en effects.js; las cortinas, con su simulación de tela
// horneada en shape keys, vienen en cortinas.glb)
const REPLACED_NODES = /^(humo|polvo_refe|cortinas$)/;

export function initRoom({ canvas, section, onProgress, onLoaded }) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = matchMedia('(pointer: coarse)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarsePointer ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.AgXToneMapping; // mismo "view transform" que en Blender
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 1, 1000);
  camera.position.copy(ROOM_CENTER).add(BLENDER_VIEW_DIR);

  // Relleno ambiental: el "World" de Blender era gris oscuro; aquí lo tiño de morado
  const hemi = new THREE.HemisphereLight();
  scene.add(hemi);

  // Una luz de área mirando hacia abajo se parece mucho a un foco muy abierto:
  // así además puede proyectar sombras con un único shadow map
  const ceiling = new THREE.SpotLight(0xffffff, 1, 0, 1.3, 1, 2);
  ceiling.position.copy(CEILING_LIGHT_POS);
  ceiling.target.position.set(CEILING_LIGHT_POS.x, 0, CEILING_LIGHT_POS.z);
  ceiling.castShadow = true;
  ceiling.shadow.mapSize.setScalar(coarsePointer ? 1024 : 2048);
  ceiling.shadow.camera.near = 5;
  ceiling.shadow.camera.far = 90;
  ceiling.shadow.bias = -0.0005;
  ceiling.shadow.normalBias = 0.25; // evita las rayas ("shadow acne") en los laterales del suelo
  ceiling.shadow.radius = 4;
  scene.add(ceiling, ceiling.target);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(ROOM_CENTER);
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.rotateSpeed = 0.5;
  controls.minPolarAngle = 0.55;
  controls.maxPolarAngle = 1.25;
  // La habitación solo tiene dos paredes: limito el giro para no ver "por detrás"
  const baseAzimuth = Math.atan2(BLENDER_VIEW_DIR.x, BLENDER_VIEW_DIR.z);
  controls.minAzimuthAngle = baseAzimuth - 0.6;
  controls.maxAzimuthAngle = baseAzimuth + 0.6;
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = 0.35;
  // En móvil el lienzo ocupa toda la pantalla: si capturase el dedo no se podría hacer scroll
  if (coarsePointer) {
    controls.enableRotate = false;
    canvas.style.touchAction = 'pan-y';
  }

  function fitCamera() {
    const w = section.clientWidth;
    const h = section.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // En pantallas verticales hay que alejarse más para que quepa la habitación
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const dist = ROOM_RADIUS / Math.sin(Math.min(vFov, hFov) / 2);
    const dir = camera.position.clone().sub(controls.target);
    camera.position.copy(controls.target).addScaledVector(dir.normalize(), dist);
    // En horizontal, desplazo la habitación a la derecha para dejar sitio al nombre
    // y en vertical la subo para que no pise el texto de abajo
    if (camera.aspect > 1.15) camera.setViewOffset(w, h, -w * 0.16, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.09, w, h);
    camera.updateProjectionMatrix();
    effectsScale();
  }

  const mixer = new THREE.AnimationMixer(scene);

  // El polvo solo brilla al pasar junto a las luces de la escena (posiciones de Blender)
  const dust = createDust({
    center: DUST_CENTER,
    size: DUST_SIZE,
    glows: [
      { position: new THREE.Vector3(27.02, 6.91, -5.83), color: 0xff3dc8, radius: 11 }, // lámpara de lava
      { position: new THREE.Vector3(20.58, 7.56, 17.22), color: 0xff2a90, radius: 8 }, // boba
      { position: new THREE.Vector3(18.52, 43.49, 28.16), color: 0xff6a2a, radius: 16 }, // ventana
    ],
    beam: { position: CEILING_LIGHT_POS, color: 0x8a7a70, radius: 16 }, // haz del techo, tenue
  });
  const smoke = createSmoke({ origin: SMOKE_ORIGIN });
  const effects = [dust, smoke];

  // Luces que vienen del .glb (ventana, boba, lámpara de lava)
  const lamps = [];
  let floorMaterial = null;

  // Aplica LIGHTING a la escena; el panel de ?luces la vuelve a llamar en cada cambio
  function applyLighting() {
    renderer.toneMappingExposure = LIGHTING.exposure;
    hemi.intensity = LIGHTING.ambient;
    hemi.color.set(LIGHTING.ambientSky);
    hemi.groundColor.set(LIGHTING.ambientGround);
    ceiling.intensity = LIGHTING.ceiling;
    ceiling.color.set(LIGHTING.ceilingColor);
    ceiling.shadow.intensity = LIGHTING.shadowStrength;
    for (const lamp of lamps) lamp.intensity = lamp.userData.exportedIntensity * (LIGHTING.lamps[lamp.name] ?? 1);
    dust.material.uniforms.uBase.value = LIGHTING.dust.base;
    dust.material.uniforms.uGlowGain.value = LIGHTING.dust.glow;
    dust.material.uniforms.uSizeMul.value = LIGHTING.dust.size;
    smoke.material.uniforms.uOpacity.value = LIGHTING.smoke;
    if (floorMaterial) floorMaterial.bumpScale = LIGHTING.floorBump;
  }
  applyLighting();

  if (new URLSearchParams(location.search).has('luces')) {
    import('./lighting-panel.js').then(({ initLightingPanel }) => initLightingPanel(LIGHTING, applyLighting));
  }
  const effectsScale = () => {
    const px = renderer.getDrawingBufferSize(new THREE.Vector2()).y;
    const s = px / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    for (const fx of effects) fx.material.uniforms.uScale.value = s;
  };

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(
    `${import.meta.env.BASE_URL}models/habitacion.glb`,
    (gltf) => {
      const room = gltf.scene;
      room.traverse((obj) => {
        if (REPLACED_NODES.test(obj.name)) obj.visible = false;
        // El exportador de glTF metió la textura de madera en blanco y negro (un bump map en
        // Blender) como si fuera un mapa de normales, y eso da contrastes raros: la paso a bumpMap
        if (obj.isMesh && obj.material.normalMap && /suelo/.test(obj.material.name)) {
          floorMaterial = obj.material;
          floorMaterial.bumpMap = floorMaterial.normalMap;
          floorMaterial.normalMap = null;
          floorMaterial.needsUpdate = true;
        }
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
        if (obj.isLight) {
          obj.decay = 2;
          obj.userData.exportedIntensity = obj.intensity;
          lamps.push(obj);
        }
      });
      scene.add(room, ...effects);
      applyLighting();
      for (const clip of gltf.animations) mixer.clipAction(clip).play();
      onLoaded?.();
      loadCurtains();
    },
    (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    },
    (err) => console.error('No se pudo cargar la habitación', err),
  );

  // Cortinas con la simulación de tela de Blender (viento de la ventana), cargadas después
  // de la habitación para no retrasar la primera imagen
  function loadCurtains() {
    loader.load(`${import.meta.env.BASE_URL}models/cortinas.glb`, (gltf) => {
      gltf.scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });
      scene.add(gltf.scene);
      const clip = gltf.animations[0];
      if (!clip) return;
      curtain = { action: mixer.clipAction(clip), duration: clip.duration, t: 0 };
      curtain.action.setLoop(THREE.LoopOnce);
      curtain.action.clampWhenFinished = true;
      curtain.action.play();
    });
  }

  // Tras la primera pasada (el viento hincha la cortina), oscila suavemente entre dos
  // fotogramas con entrada y salida suaves, en vez de volver de golpe al principio
  let curtain = null;
  function updateCurtain(dt) {
    if (!curtain) return;
    curtain.t += dt;
    if (curtain.t < curtain.duration) return; // primera pasada: la lleva el mixer
    curtain.action.paused = true;
    const a = (CURTAIN_BREEZE.from - 1) / CURTAIN_FPS;
    const b = Math.min((CURTAIN_BREEZE.to - 1) / CURTAIN_FPS, curtain.duration);
    const phase = ((curtain.t - curtain.duration) / CURTAIN_BREEZE.period) * Math.PI * 2;
    // empieza en b (donde acabó la pasada) y va hacia a y vuelve
    curtain.action.time = b - (b - a) * (0.5 - 0.5 * Math.cos(phase));
  }

  fitCamera();
  window.addEventListener('resize', fitCamera);

  // Solo renderizo cuando la cabecera está a la vista (batería y CPU en móvil)
  let visible = true;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }).observe(section);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1);
    if (!visible || document.hidden) return;

    // Giro automático de ida y vuelta entre los límites
    if (controls.autoRotate) {
      const az = controls.getAzimuthalAngle();
      if (az >= controls.maxAzimuthAngle - 0.01) controls.autoRotateSpeed = Math.abs(controls.autoRotateSpeed);
      if (az <= controls.minAzimuthAngle + 0.01) controls.autoRotateSpeed = -Math.abs(controls.autoRotateSpeed);
    }
    controls.update(dt);
    mixer.update(dt);
    updateCurtain(dt);
    for (const fx of effects) fx.material.uniforms.uTime.value += dt;
    renderer.render(scene, camera);
  });

  return { scene, renderer, camera, mixer, applyLighting };
}
