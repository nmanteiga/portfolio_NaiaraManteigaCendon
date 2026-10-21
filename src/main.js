import './style.css';
import { initRoom } from './room.js';
import { initTilt } from './tilt.js';
import { initPolaroids } from './polaroids.js';

// Cabecera 3D
const hero = document.querySelector('.hero');
const loaderPct = hero.querySelector('.hero__loader span');
const room = initRoom({
  canvas: hero.querySelector('.hero__canvas'),
  section: hero,
  onProgress: (p) => (loaderPct.textContent = `${Math.round(p * 100)}%`),
  onLoaded: () => hero.classList.add('is-loaded'),
});
if (import.meta.env.DEV) window.__room = room;

// Pila de polaroids con mis fotos
document.querySelectorAll('[data-tilt]').forEach(initTilt);
document.querySelectorAll('[data-polaroids]').forEach(initPolaroids);

// Fondo de la barra de navegación al hacer scroll
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Aparición de elementos al entrar en pantalla
const revealer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.15 },
);
document.querySelectorAll('.reveal').forEach((el) => revealer.observe(el));
