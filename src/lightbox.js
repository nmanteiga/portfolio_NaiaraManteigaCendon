// Visor a pantalla completa compartido (diseños de GDG, capturas y vídeos de proyectos).
// items: [{ src, alt, type?: 'image' | 'video', poster? }]
let dialog, img, video, caption;
let current = { items: [], index: 0, title: '' };

function show(i) {
  const { items, title } = current;
  current.index = (i + items.length) % items.length;
  const item = items[current.index];
  const isVideo = item.type === 'video';
  img.hidden = isVideo;
  video.hidden = !isVideo;
  if (isVideo) {
    img.removeAttribute('src');
    video.poster = item.poster ?? '';
    video.src = item.src;
    video.play().catch(() => {});
  } else {
    video.pause();
    video.removeAttribute('src');
    img.src = item.src;
    img.alt = item.alt ?? '';
  }
  caption.textContent = items.length > 1 ? `${title} · ${current.index + 1}/${items.length}` : title;
  dialog.classList.toggle('is-single', items.length < 2);
}

function init() {
  dialog = document.querySelector('[data-lightbox]');
  img = dialog.querySelector('img');
  video = dialog.querySelector('video');
  caption = dialog.querySelector('figcaption');
  dialog.addEventListener('click', (e) => {
    if (e.target.closest('[data-lightbox-prev]')) show(current.index - 1);
    else if (e.target.closest('[data-lightbox-next]')) show(current.index + 1);
    else if (e.target === dialog || e.target.closest('[data-lightbox-close]')) dialog.close();
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current.index - 1);
    if (e.key === 'ArrowRight') show(current.index + 1);
  });
  dialog.addEventListener('close', () => video.pause());
}

export function openLightbox(items, index = 0, title = '') {
  if (!dialog) init();
  current = { items, index, title };
  show(index);
  if (!dialog.open) dialog.showModal();
}
