import { ATTR_EN, HTML_EN, META_EN, STRINGS } from './data/translations.js';

// Idioma de la web (español o inglés).
// 1) El que la persona eligió con el botón ES / EN (se recuerda en este navegador).
// 2) Si no, el del navegador: español o gallego → español; cualquier otro → inglés.
const STORAGE_KEY = 'lang';
const LANGS = ['es', 'en'];

function detect() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGS.includes(saved)) return saved;
  } catch {}
  for (const tag of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    const code = String(tag ?? '').toLowerCase().slice(0, 2);
    if (code === 'es' || code === 'gl') return 'es';
    if (code === 'en') return 'en';
  }
  return 'en';
}

let lang = detect();

export const getLang = () => lang;

/** Texto generado por los scripts; si es una función, se le pasan los argumentos */
export function t(key, ...args) {
  const value = STRINGS[lang][key];
  return typeof value === 'function' ? value(...args) : value;
}

// Textos originales (en español) de index.html, guardados la primera vez para poder volver a ellos
const originalHtml = new WeakMap();
const originalAttrs = new WeakMap();
let originalDescription;

function applyStatic() {
  const en = lang === 'en';
  document.documentElement.lang = lang;

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    originalDescription ??= description.content;
    description.content = en ? META_EN.description : originalDescription;
  }

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    if (!originalHtml.has(el)) originalHtml.set(el, el.innerHTML);
    el.innerHTML = en ? (HTML_EN[el.dataset.i18n] ?? originalHtml.get(el)) : originalHtml.get(el);
  });

  // data-i18n-attr="alt:photo1;aria-label:otraClave"
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    if (!originalAttrs.has(el)) originalAttrs.set(el, {});
    const saved = originalAttrs.get(el);
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (!(attr in saved)) saved[attr] = el.getAttribute(attr);
      el.setAttribute(attr, en ? (ATTR_EN[key] ?? saved[attr]) : saved[attr]);
    }
  });
}

export function setLang(next) {
  if (!LANGS.includes(next) || next === lang) return;
  lang = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {}
  applyStatic();
  dispatchEvent(new CustomEvent('langchange', { detail: next }));
}

/** Traduce index.html al idioma detectado y activa el botón ES / EN */
export function initI18n() {
  applyStatic();
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) =>
    btn.addEventListener('click', () => setLang(lang === 'es' ? 'en' : 'es')),
  );
}
