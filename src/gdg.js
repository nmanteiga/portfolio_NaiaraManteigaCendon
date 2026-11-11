import snapshot from './data/gdg-events.json';
import { fetchGdgEvents } from './gdg-api.js';
import { DESIGN_GROUPS } from './data/gdg-designs.js';
import { openLightbox } from './lightbox.js';
import { getLang, t } from './i18n.js';

// Diseños: cualquier imagen que se deje en contents/gdg aparece sola en la galería, agrupada por
// evento según src/data/gdg-designs.js. Si se llama "logo" (logo.png…) se usa como logo de la sección.
// vite-imagetools genera versiones optimizadas en WebP (miniatura y tamaño grande); los originales no se tocan.
const thumbFiles = import.meta.glob('../contents/gdg/*.{png,jpg,jpeg,webp,avif,PNG,JPG,JPEG,WEBP}', {
  eager: true,
  query: { w: '720', format: 'webp', withoutEnlargement: 'true' },
  import: 'default',
});
const fullFiles = import.meta.glob('../contents/gdg/*.{png,jpg,jpeg,webp,avif,PNG,JPG,JPEG,WEBP}', {
  eager: true,
  query: { w: '1800', format: 'webp', withoutEnlargement: 'true' },
  import: 'default',
});
// SVG y GIF se sirven tal cual (no se pueden convertir sin perder vectores/animación)
const rawFiles = import.meta.glob('../contents/gdg/*.{svg,gif,SVG,GIF}', { eager: true, query: '?url', import: 'default' });

// Fechas en el idioma de la web (español o inglés)
const fmt = (options) => new Intl.DateTimeFormat(t('locale'), options).format.bind(null);
const dateFmt = () => fmt({ day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Madrid' });
const longDateFmt = () => fmt({ weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Madrid' });
const timeFmt = () => fmt({ hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// Bevy solo debería devolver enlaces/imágenes suyos; por si acaso, solo se aceptan https
const safeUrl = (u) => (/^https:\/\//.test(u ?? '') ? u : '#');

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function daysUntil(date) {
  const days = Math.ceil((date - Date.now()) / 86_400_000);
  if (days <= 0) return t('today');
  if (days === 1) return t('tomorrow');
  return t('inDays', days);
}

let lastEvents = [];

function renderEvents(root, events) {
  lastEvents = events;
  const now = Date.now();
  // Se reparten por fecha (no por el estado de Bevy) para que la copia de respaldo no quede desfasada
  const upcoming = events.filter((e) => new Date(e.end) >= now).sort((a, b) => new Date(a.start) - new Date(b.start));
  const past = events.filter((e) => new Date(e.end) < now).sort((a, b) => new Date(b.start) - new Date(a.start));

  root.querySelectorAll('[data-gdg-count]').forEach((el) => (el.textContent = events.length));

  const next = upcoming[0];
  const nextBox = root.querySelector('[data-gdg-next]');
  nextBox.hidden = !next;
  if (next) {
    const start = new Date(next.start);
    nextBox.innerHTML = `
      <a class="next-event__img" href="${safeUrl(next.url)}" target="_blank" rel="noopener">
        <img src="${safeUrl(next.image)}" alt="" loading="lazy" />
      </a>
      <div class="next-event__body">
        <p class="next-event__badge"><span class="pulse" aria-hidden="true"></span> ${esc(t('nextEvent'))} · ${daysUntil(start)}</p>
        <h3 class="next-event__title">${esc(next.title)}</h3>
        <p class="next-event__date">${esc(capitalize(longDateFmt()(start)))} · ${esc(timeFmt()(start))}</p>
        ${next.summary ? `<p class="next-event__summary">${esc(next.summary)}</p>` : ''}
        <a class="btn btn--primary" href="${safeUrl(next.url)}" target="_blank" rel="noopener">
          ${esc(t('signUp'))}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
        </a>
      </div>`;
  }

  const formatDate = dateFmt();
  root.querySelector('[data-gdg-events]').innerHTML = past
    .map(
      (e) => `
      <li class="event-card">
        <a href="${safeUrl(e.url)}" target="_blank" rel="noopener">
          <img src="${safeUrl(e.image)}" alt="" loading="lazy" width="500" height="500" />
          <time datetime="${esc(e.start)}">${esc(formatDate(new Date(e.start)))}</time>
          <h4>${esc(e.title)}</h4>
        </a>
      </li>`,
    )
    .join('');
}

function initEventsTrack(root) {
  const track = root.querySelector('[data-gdg-events]');
  const step = () => track.clientWidth * 0.8;
  root.querySelector('[data-events-prev]').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  root.querySelector('[data-events-next]').addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
}

const baseName = (path) => path.split('/').pop().replace(/\.[^.]+$/, '');
const naturalSort = (a, b) => a.localeCompare(b, 'es', { numeric: true });
const monthYearFmt = () => fmt({ day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
// Título del evento de un grupo de diseños en el idioma de la web
const groupTitle = (g) => (g.other ? t('otherDesigns') : getLang() === 'en' ? (g.titleEn ?? g.title) : g.title);

const OTHER_GROUP = { other: true };

function collectDesigns() {
  const files = [
    ...Object.keys(thumbFiles).map((path) => ({ name: baseName(path), thumb: thumbFiles[path], full: fullFiles[path] })),
    ...Object.entries(rawFiles).map(([path, url]) => ({ name: baseName(path), thumb: url, full: url })),
  ];
  const logo = files.find((f) => f.name.toLowerCase() === 'logo');

  // Cada archivo va al primer evento cuyo patrón encaje; si ninguno encaja, a "Otros diseños"
  const groups = new Map();
  for (const file of files) {
    if (file === logo) continue;
    const def = DESIGN_GROUPS.find((g) => g.files.test(file.name)) ?? OTHER_GROUP;
    if (!groups.has(def)) groups.set(def, { ...def, items: [] });
    groups.get(def).items.push(file);
  }
  const list = [...groups.values()];
  for (const g of list) g.items.sort((a, b) => naturalSort(a.name, b.name));
  // Más recientes primero; los que no tienen fecha, al final
  list.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  return { logo, groups: list };
}

let designGroups = [];

function renderDesigns(root) {
  const { logo, groups } = collectDesigns();
  designGroups = groups;

  const logoBox = root.querySelector('[data-gdg-logo]');
  if (logo) logoBox.innerHTML = `<img src="${logo.thumb}" alt="${esc(t('gdgLogoAlt'))}" />`;

  const box = root.querySelector('[data-gdg-designs]');
  box.hidden = groups.length === 0;
  const list = box.querySelector('[data-designs-list]');
  // Al cambiar de idioma se vuelven a pintar: se conservan abiertas las cajas que lo estaban
  const open = new Set([...list.querySelectorAll('details[open]')].map((d) => d.dataset.year));

  // Agrupados por año de organización del evento
  const years = new Map();
  for (const g of groups) {
    const year = g.date ? g.date.slice(0, 4) : 'other';
    if (!years.has(year)) years.set(year, []);
    years.get(year).push(g);
  }

  list.innerHTML = [...years]
    .map(
      ([year, yearGroups]) => {
        const items = yearGroups.flatMap((g) => g.items);
        // Caja cerrada por año: miniaturas en abanico + resumen; al abrirla, los eventos y diseños
        return `
      <details class="designs-year" data-year="${esc(year)}" ${open.has(year) ? 'open' : ''}>
        <summary>
          <span class="designs-year__label">${esc(year === 'other' ? t('otherYear') : year)}</span>
          <span class="designs-year__info">
            <span class="designs-year__count">${t('events', yearGroups.length)} · ${t('designs', items.length)}</span>
            <span class="designs-year__titles">${yearGroups.map((g) => esc(groupTitle(g))).join(' · ')}</span>
          </span>
          <span class="designs-year__fan" aria-hidden="true">
            ${items
              .slice(0, 3)
              .map((it) => `<img src="${it.thumb}" alt="" loading="lazy" />`)
              .join('')}
          </span>
          <span class="designs-year__toggle" aria-hidden="true"></span>
        </summary>
        <div class="designs-year__events">
          ${yearGroups
            .map((g) => {
              const gi = groups.indexOf(g);
              const meta = [
                g.date ? esc(monthYearFmt()(new Date(g.date))) : '',
                g.url ? `<a href="${safeUrl(g.url)}" target="_blank" rel="noopener">${esc(t('seeEvent'))}</a>` : '',
              ]
                .filter(Boolean)
                .join(' · ');
              return `
              <article class="design-group">
                <header class="design-group__head">
                  <h5>${esc(groupTitle(g))}</h5>
                  ${meta ? `<p>${meta}</p>` : ''}
                </header>
                <ul class="designs-grid">
                  ${g.items
                    .map(
                      (item, ii) => `
                    <li><button type="button" class="design" data-group="${gi}" data-index="${ii}">
                      <img src="${item.thumb}" alt="${esc(t('designN', groupTitle(g), ii + 1))}" loading="lazy" />
                    </button></li>`,
                    )
                    .join('')}
                </ul>
              </article>`;
            })
            .join('')}
        </div>
      </details>`;
      },
    )
    .join('');
}

// Al pulsar un diseño se abre el visor con los del mismo evento
function initLightbox(root) {
  root.querySelector('[data-designs-list]').addEventListener('click', (e) => {
    const btn = e.target.closest('.design');
    if (!btn) return;
    const group = designGroups[Number(btn.dataset.group)];
    const title = groupTitle(group);
    const items = group.items.map((it, i) => ({ src: it.full, alt: t('designN', title, i + 1) }));
    openLightbox(items, Number(btn.dataset.index), title);
  });
}

export function initGdg(root) {
  if (!root) return;
  renderDesigns(root);
  initLightbox(root);
  initEventsTrack(root);
  addEventListener('langchange', () => {
    renderDesigns(root);
    renderEvents(root, lastEvents);
  });

  // 1) Copia guardada en el build: se ve al instante y sirve sin conexión
  renderEvents(root, snapshot.events);
  // 2) Eventos en directo desde Bevy: si se ha publicado algo nuevo, aparece solo
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), 8000);
  fetchGdgEvents({ signal: ctrl.signal })
    .then((events) => events.length && renderEvents(root, events))
    .catch(() => {}); // sin conexión: se queda la copia
}
