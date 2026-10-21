import { PROJECTS } from './data/projects.js';
import { openLightbox } from './lightbox.js';

// Capturas de contents/projects, optimizadas por vite-imagetools (portada y tamaño grande)
const coverFiles = import.meta.glob('../contents/projects/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG}', {
  eager: true,
  query: { w: '1400', format: 'webp', withoutEnlargement: 'true' },
  import: 'default',
});
const fullFiles = import.meta.glob('../contents/projects/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG}', {
  eager: true,
  query: { w: '2200', format: 'webp', withoutEnlargement: 'true' },
  import: 'default',
});

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const base = import.meta.env.BASE_URL;

function imagesFor(pattern) {
  if (!pattern) return [];
  return Object.keys(coverFiles)
    .filter((path) => pattern.test(path.split('/').pop()))
    .sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
    .map((path) => ({ cover: coverFiles[path], full: fullFiles[path] }));
}

function mediaHtml(p, images) {
  if (p.video) {
    return `<button type="button" class="project__media" data-open aria-label="Ver el vídeo de ${esc(p.title)}">
      <video src="${base}${p.video.src}" poster="${base}${p.video.poster}" muted loop playsinline preload="none" data-autoplay></video>
      <span class="project__play" aria-hidden="true">▶</span>
    </button>`;
  }
  if (images.length) {
    return `<button type="button" class="project__media" data-open aria-label="Ver capturas de ${esc(p.title)}">
      <img src="${images[0].cover}" alt="" loading="lazy" />
      ${images.length > 1 ? `<span class="project__count">${images.length} capturas</span>` : ''}
    </button>`;
  }
  return `<div class="project__media project__media--visual"><canvas data-visual="${p.visual}" aria-hidden="true"></canvas></div>`;
}

function render(root) {
  const grid = root.querySelector('[data-projects]');
  const media = new Map();
  grid.innerHTML = PROJECTS.map((p) => {
    const images = imagesFor(p.images);
    media.set(p.id, images);
    const badges = [
      p.status ? `<span class="badge badge--progress"><span class="pulse" aria-hidden="true"></span>${esc(p.status)}</span>` : '',
      p.award ? `<span class="badge badge--award">🏆 ${esc(p.award)}</span>` : '',
    ].join('');
    return `
      <article class="project ${p.size === 'wide' ? 'project--wide' : ''} reveal" data-id="${p.id}">
        ${mediaHtml(p, images)}
        <div class="project__body">
          <p class="project__context">${esc(p.context)} · ${esc(p.year)}</p>
          <h3 class="project__title">${esc(p.title)}</h3>
          ${badges ? `<div class="project__badges">${badges}</div>` : ''}
          <p class="project__desc">${esc(p.description)}</p>
          <ul class="project__stack">${p.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          <div class="project__links">
            ${p.links
              .map((l) => {
                const external = /^https?:/.test(l.url);
                return `<a href="${esc(l.url)}" ${external ? 'target="_blank" rel="noopener"' : ''}>${esc(l.label)} ${external ? '↗' : '↑'}</a>`;
              })
              .join('')}
          </div>
        </div>
      </article>`;
  }).join('');

  // Abrir capturas o vídeo a pantalla completa
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open]');
    if (!btn) return;
    const p = PROJECTS.find((x) => x.id === btn.closest('.project').dataset.id);
    if (p.video) openLightbox([{ type: 'video', src: base + p.video.src, poster: base + p.video.poster }], 0, p.title);
    else openLightbox(media.get(p.id).map((img, i) => ({ src: img.full, alt: `${p.title}: captura ${i + 1}` })), 0, p.title);
  });

  // Los vídeos solo se reproducen (en silencio) mientras se ven
  const io = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting && !matchMedia('(prefers-reduced-motion: reduce)').matches) target.play().catch(() => {});
      else target.pause();
    }
  });
  grid.querySelectorAll('video[data-autoplay]').forEach((v) => io.observe(v));

  grid.querySelectorAll('canvas[data-visual]').forEach((c) => (c.dataset.visual === 'network' ? spikingNetwork(c) : protein(c)));
}

// ── Animaciones para proyectos sin capturas ─────────────────────────────────

function setupCanvas(canvas, draw) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  const resize = () => {
    const dpr = Math.min(devicePixelRatio, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  new ResizeObserver(resize).observe(canvas);
  let visible = false;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let last = performance.now();
  let t = 0;
  const loop = (now) => {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (visible || t === 0) {
      t += reduced ? 0 : dt;
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h, t, dt);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/** TFG: red neuronal de impulsos. Las neuronas acumulan potencial, "disparan" y el impulso viaja por sus conexiones */
function spikingNetwork(canvas) {
  const layers = [4, 6, 6, 3];
  const nodes = [];
  layers.forEach((n, li) => {
    for (let i = 0; i < n; i++) nodes.push({ layer: li, i, n, v: Math.random(), flash: 0 });
  });
  const edges = [];
  for (const a of nodes)
    for (const b of nodes)
      if (b.layer === a.layer + 1 && Math.random() < 0.7) edges.push({ a, b, w: 0.3 + Math.random() * 0.7 });
  const spikes = [];
  const pos = (node, w, h) => [
    w * (0.12 + (0.76 * node.layer) / (layers.length - 1)),
    h * (0.15 + (0.7 * (node.i + 0.5)) / node.n) + Math.sin(node.layer * 3 + node.i) * 4,
  ];

  setupCanvas(canvas, (ctx, w, h, t, dt) => {
    // entrada: la primera capa recibe estímulos aleatorios
    for (const node of nodes) {
      if (node.layer === 0) node.v += dt * (0.5 + Math.random() * 0.9);
      node.flash = Math.max(0, node.flash - dt * 2.5);
      if (node.v >= 1) {
        node.v = 0;
        node.flash = 1;
        for (const e of edges) if (e.a === node) spikes.push({ e, p: 0 });
      }
    }
    ctx.lineWidth = 1;
    for (const e of edges) {
      const [x1, y1] = pos(e.a, w, h);
      const [x2, y2] = pos(e.b, w, h);
      ctx.strokeStyle = `rgba(205, 182, 255, ${0.08 + e.w * 0.14})`;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    for (let i = spikes.length - 1; i >= 0; i--) {
      const s = spikes[i];
      s.p += dt * 1.6;
      const [x1, y1] = pos(s.e.a, w, h);
      const [x2, y2] = pos(s.e.b, w, h);
      if (s.p >= 1) {
        s.e.b.v += 0.45 * s.e.w; // el impulso suma potencial a la neurona destino
        spikes.splice(i, 1);
        continue;
      }
      const x = x1 + (x2 - x1) * s.p;
      const y = y1 + (y2 - y1) * s.p;
      ctx.fillStyle = 'rgba(255, 79, 184, 0.95)';
      ctx.shadowColor = '#ff4fb8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    for (const node of nodes) {
      const [x, y] = pos(node, w, h);
      const r = 6 + node.flash * 5;
      ctx.fillStyle = `rgba(184, 146, 255, ${0.35 + node.v * 0.4 + node.flash * 0.6})`;
      ctx.shadowColor = '#b892ff';
      ctx.shadowBlur = node.flash * 22;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    // las capas ocultas pierden potencial poco a poco (neuronas "leaky")
    for (const node of nodes) if (node.layer > 0) node.v = Math.max(0, node.v - dt * 0.15);
  });
}

/** CAMELIA: proteína esquemática (hélice de "aminoácidos") girando en 3D */
function protein(canvas) {
  const colors = ['#4285f4', '#ea4335', '#fbbc04', '#34a853', '#b892ff'];
  const atoms = Array.from({ length: 46 }, (_, i) => {
    const a = i * 0.55;
    return { x: Math.cos(a) * 1, y: (i - 23) * 0.075, z: Math.sin(a) * 1, c: colors[(i * 7) % colors.length] };
  });
  setupCanvas(canvas, (ctx, w, h, t) => {
    const s = Math.min(w, h) * 0.32;
    const rot = t * 0.5;
    const tilt = 0.5;
    const proj = atoms.map((p) => {
      const x = p.x * Math.cos(rot) - p.z * Math.sin(rot);
      const z0 = p.x * Math.sin(rot) + p.z * Math.cos(rot);
      const y = p.y * Math.cos(tilt) - z0 * Math.sin(tilt) * 0.3;
      const z = z0;
      const k = 1 / (1.8 - z * 0.35);
      return { sx: w / 2 + x * s * k * 1.4, sy: h / 2 + y * s * 1.6 * k, z, k, c: p.c };
    });
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(205, 182, 255, 0.35)';
    ctx.beginPath();
    proj.forEach((p, i) => (i ? ctx.lineTo(p.sx, p.sy) : ctx.moveTo(p.sx, p.sy)));
    ctx.stroke();
    for (const p of [...proj].sort((a, b) => a.z - b.z)) {
      ctx.globalAlpha = 0.45 + (p.z + 1) * 0.27;
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, 7 * p.k * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

export function initProjects(root) {
  if (root) render(root);
}
