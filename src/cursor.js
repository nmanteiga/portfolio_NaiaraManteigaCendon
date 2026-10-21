// Cursor personalizado (puntito + aro con retraso) y mi gata siberiana siguiendo al ratón.
// Solo en ordenador (puntero fino) y sin "reducir movimiento" activado.

const INTERACTIVE = 'a, button, summary, [data-open], .design, .frame, label';
const DRAGGABLE = '.hero__canvas, .gdg__orbit';

export function initCursor() {
  const enabled = matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!enabled) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.append(ring, dot);
  document.documentElement.classList.add('has-custom-cursor');

  const mouse = { x: innerWidth / 2, y: innerHeight / 2, seen: false };
  const ringPos = { x: mouse.x, y: mouse.y };

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (!mouse.seen) {
      mouse.seen = true;
      ringPos.x = mouse.x;
      ringPos.y = mouse.y;
    }
    document.documentElement.classList.remove('cursor-hidden');
    const t = e.target instanceof Element ? e.target : null;
    ring.classList.toggle('is-hover', !!t?.closest(INTERACTIVE));
    ring.classList.toggle('is-drag', !!t?.closest(DRAGGABLE));
  });
  document.addEventListener('pointerleave', () => document.documentElement.classList.add('cursor-hidden'));
  addEventListener('pointerdown', () => ring.classList.add('is-down'));
  addEventListener('pointerup', () => ring.classList.remove('is-down'));

  const cat = initCat(mouse);

  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    // el aro persigue al puntero con un poco de inercia
    const k = 1 - Math.pow(0.0008, dt);
    ringPos.x += (mouse.x - ringPos.x) * k;
    ringPos.y += (mouse.y - ringPos.y) * k;
    // Se mueven con "translate" y no con "transform": el giro del aro (rotate) se aplica después
    // de translate, así gira sobre sí mismo y no alrededor de la esquina de la pantalla
    dot.style.translate = `${mouse.x}px ${mouse.y}px`;
    ring.style.translate = `${ringPos.x}px ${ringPos.y}px`;
    if (mouse.seen) cat.update(dt);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

// ── La gata ────────────────────────────────────────────────────────────────

const FUR = '#d8d4de';
const FUR_MID = '#b6b0c0';
const POINTS = '#8b8496'; // orejas, cola y máscara más oscuras (como una siberiana neva masquerade)
const WHITE = '#f4f2f7';
const EYE = '#7db4ff';
const PINK = '#eba8bb';

// Cabeza en 3/4, compartida por las dos posturas
const head = (x, y) => `
  <g class="cat__head" transform="translate(${x} ${y})">
    <path d="M-15 -8 L-11 -27 L-2 -15 Z" fill="${POINTS}" />
    <path d="M-12 -11 L-10 -22 L-5 -15 Z" fill="${PINK}" opacity=".7" />
    <path d="M5 -15 L13 -28 L16 -8 Z" fill="${POINTS}" />
    <path d="M8 -15 L13 -23 L14 -11 Z" fill="${PINK}" opacity=".7" />
    <ellipse cx="0" cy="0" rx="18" ry="16" fill="${FUR}" />
    <!-- mejillas de pelo largo -->
    <path d="M-17 -2 L-25 4 L-19 6 L-24 12 L-16 12 L-17 18 L-9 14 L-4 17 L0 13 L4 17 L9 14 L17 18 L16 12 L24 12 L19 6 L25 4 L17 -2 Z" fill="${FUR}" />
    <ellipse cx="-6.5" cy="-1" rx="6.5" ry="6" fill="${POINTS}" opacity=".28" />
    <ellipse cx="6.5" cy="-1" rx="6.5" ry="6" fill="${POINTS}" opacity=".28" />
    <ellipse cx="0" cy="7" rx="7" ry="6" fill="${WHITE}" opacity=".8" />
    <!-- "M" atigrada en la frente -->
    <path d="M-7 -8 L-5 -13 L-2 -9 L0 -14 L2 -9 L5 -13 L7 -8" fill="none" stroke="${POINTS}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round" opacity=".75" />
    <g class="cat__eyes-open">
      <ellipse cx="-6.5" cy="-1" rx="3.6" ry="4" fill="${EYE}" />
      <ellipse cx="6.5" cy="-1" rx="3.6" ry="4" fill="${EYE}" />
      <ellipse cx="-6" cy="-0.5" rx="1.3" ry="2.6" fill="#1b1530" />
      <ellipse cx="7" cy="-0.5" rx="1.3" ry="2.6" fill="#1b1530" />
      <circle cx="-5" cy="-2.4" r="1" fill="#fff" />
      <circle cx="8" cy="-2.4" r="1" fill="#fff" />
    </g>
    <g class="cat__eyes-closed" fill="none" stroke="#4a4258" stroke-width="1.4" stroke-linecap="round">
      <path d="M-10 0 Q-6.5 3 -3 0 M3 0 Q6.5 3 10 0" />
    </g>
    <path d="M-1.8 5 L1.8 5 L0 7.2 Z" fill="${PINK}" />
    <path d="M0 7.2 Q-2 9.5 -4 8.5 M0 7.2 Q2 9.5 4 8.5" fill="none" stroke="#6b6278" stroke-width="1" stroke-linecap="round" />
    <path d="M-8 6 L-23 4 M-8 8 L-22 10 M8 6 L23 4 M8 8 L22 10" stroke="#fff" stroke-width=".7" opacity=".8" />
  </g>`;

const CAT_SVG = `
<svg viewBox="0 0 130 100" aria-hidden="true">
  <!-- Caminando (de perfil) -->
  <g class="cat__walk">
    <g class="cat__tail">
      <path d="M30 52 C14 46 8 30 14 14" fill="none" stroke="${FUR_MID}" stroke-width="21" stroke-linecap="round" />
      <path d="M30 52 C14 46 8 30 14 14" fill="none" stroke="${POINTS}" stroke-width="21" stroke-dasharray="4 8" opacity=".45" />
      <path d="M27 50 C16 44 10 32 14 18" fill="none" stroke="${FUR}" stroke-width="6" stroke-linecap="round" opacity=".5" />
    </g>
    <g class="cat__leg cat__leg--back-b"><rect x="34" y="58" width="9" height="26" rx="4.5" fill="${FUR_MID}" /></g>
    <g class="cat__leg cat__leg--front-b"><rect x="76" y="60" width="9" height="24" rx="4.5" fill="${FUR_MID}" /></g>
    <g class="cat__body">
      <path d="M24 56 C22 38 44 33 62 35 C80 36 92 42 90 58 C89 70 74 72 58 72 C40 72 26 70 24 56 Z" fill="${FUR}" />
      <path d="M34 68 q4 8 8 1 q4 8 8 1 q4 8 8 1 q4 8 8 1 q4 7 8 0" fill="${FUR}" />
      <path d="M44 37 q3 6 1 12 M56 35 q3 7 1 13 M68 36 q3 7 1 12" fill="none" stroke="${POINTS}" stroke-width="3" stroke-linecap="round" opacity=".4" />
      <ellipse cx="84" cy="52" rx="15" ry="18" fill="${FUR}" />
      <path d="M74 64 l3 7 l3 -5 l3 7 l3 -6 l3 7 l3 -6 l2 4 l1 -12 Z" fill="${WHITE}" />
      <ellipse cx="85" cy="58" rx="10" ry="12" fill="${WHITE}" />
    </g>
    <g class="cat__leg cat__leg--back-a"><rect x="40" y="60" width="10" height="25" rx="5" fill="${FUR}" /></g>
    <g class="cat__leg cat__leg--front-a"><rect x="82" y="62" width="10" height="23" rx="5" fill="${WHITE}" /></g>
    ${head(96, 36)}
  </g>
  <!-- Sentada (también para dormir) -->
  <g class="cat__sit">
    <g class="cat__tail cat__tail--sit">
      <path d="M44 86 C60 96 92 96 100 84" fill="none" stroke="${FUR_MID}" stroke-width="18" stroke-linecap="round" />
      <path d="M44 86 C60 96 92 96 100 84" fill="none" stroke="${POINTS}" stroke-width="18" stroke-dasharray="4 8" opacity=".45" />
    </g>
    <ellipse cx="58" cy="76" rx="19" ry="15" fill="${FUR_MID}" />
    <path d="M48 84 C40 62 50 40 66 40 C82 40 86 62 80 86 Z" fill="${FUR}" />
    <path d="M50 54 q-2 -6 2 -9 M84 56 q2 -6 -1 -9" fill="none" stroke="${POINTS}" stroke-width="3" stroke-linecap="round" opacity=".35" />
    <path d="M58 48 L60 72 L64 66 L67 76 L71 68 L75 76 L78 66 L82 70 L84 48 Z" fill="${WHITE}" />
    <ellipse cx="71" cy="60" rx="12" ry="14" fill="${WHITE}" />
    <rect x="64" y="70" width="8" height="18" rx="4" fill="${WHITE}" />
    <rect x="74" y="70" width="8" height="18" rx="4" fill="${WHITE}" />
    ${head(68, 34)}
  </g>
</svg>`;

function initCat(mouse) {
  const el = document.createElement('div');
  el.className = 'cat';
  el.innerHTML = `${CAT_SVG}<span class="cat__zzz" aria-hidden="true">z<span>z</span><span>z</span></span>`;
  document.body.append(el);

  const toggle = document.querySelector('[data-cat-toggle]');
  let hidden = false;
  try {
    hidden = localStorage.getItem('cat-hidden') === '1';
  } catch {}
  const applyHidden = () => {
    el.hidden = hidden;
    if (toggle) {
      toggle.hidden = false;
      toggle.textContent = hidden ? '🐾 Mostrar a mi gata' : '🐾 Ocultar a mi gata';
    }
  };
  applyHidden();
  toggle?.addEventListener('click', () => {
    hidden = !hidden;
    try {
      localStorage.setItem('cat-hidden', hidden ? '1' : '0');
    } catch {}
    applyHidden();
  });

  const SIZE = 74; // px de ancho
  const pos = { x: mouse.x - 80, y: mouse.y + 30 };
  let facing = 1; // 1 = mira a la derecha
  let idle = 0;
  let state = '';
  let hop = 0;

  const setState = (s) => {
    if (s === state) return;
    state = s;
    el.dataset.state = s;
  };

  // Acariciarla: clic encima (sin bloquear los clics de la página, el gato no captura eventos)
  addEventListener('click', (e) => {
    if (hidden) return;
    const r = el.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    hop = 1;
    idle = 0;
    const heart = document.createElement('span');
    heart.className = 'cat__heart';
    heart.textContent = '♥';
    el.append(heart);
    setTimeout(() => heart.remove(), 1200);
  });

  return {
    update(dt) {
      if (hidden) return;
      // Se coloca a un lado del cursor (en el lado en el que esté), "pisando" justo por debajo
      const side = pos.x < mouse.x ? -1 : 1;
      const tx = mouse.x + side * 58;
      const ty = mouse.y + 34;
      const dx = tx - pos.x;
      const dy = ty - pos.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 14) {
        const speed = Math.min(420, 90 + dist * 3);
        const step = Math.min(dist, speed * dt);
        pos.x += (dx / dist) * step;
        pos.y += (dy / dist) * step;
        if (Math.abs(dx) > 4) facing = dx > 0 ? 1 : -1;
        idle = 0;
        setState('walk');
      } else {
        idle += dt;
        if (state === 'walk' && idle < 0.25) {
          // sigue un instante caminando antes de sentarse
        } else if (idle > 8) setState('sleep');
        else setState('sit');
        // al sentarse, mira hacia el cursor
        facing = mouse.x >= pos.x ? 1 : -1;
      }

      hop = Math.max(0, hop - dt * 2.4);
      const jump = Math.sin(hop * Math.PI) * 26;
      pos.x = Math.min(Math.max(pos.x, SIZE / 2), innerWidth - SIZE / 2);
      pos.y = Math.min(Math.max(pos.y, SIZE), innerHeight - 4);
      // el punto de referencia es el centro de las patas
      el.style.transform = `translate(${pos.x - SIZE / 2}px, ${pos.y - SIZE * 0.78 - jump}px)`;
      el.style.setProperty('--facing', facing);
    },
  };
}
