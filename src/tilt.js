// Inclinación 3D de la polaroid de delante siguiendo el ratón o el dedo, con un reflejo de luz
const MAX_TILT = 14; // grados

export function initTilt(frame) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const front = () => frame.querySelector('.frame__card[data-pos="0"]') ?? frame.querySelector('.frame__card');

  function move(e) {
    const card = front();
    const r = frame.getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
    const y = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
    card.style.setProperty('--ry', `${(x - 0.5) * 2 * MAX_TILT}deg`);
    card.style.setProperty('--rx', `${(0.5 - y) * 2 * MAX_TILT}deg`);
    card.style.setProperty('--gx', `${x * 100}%`);
    card.style.setProperty('--gy', `${y * 100}%`);
    frame.classList.add('is-tilting');
  }

  function reset() {
    for (const card of frame.querySelectorAll('.frame__card')) {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    }
    frame.classList.remove('is-tilting');
  }

  frame.addEventListener('pointermove', move);
  frame.addEventListener('pointerdown', move);
  frame.addEventListener('pointerleave', reset);
  frame.addEventListener('pointercancel', reset);
  frame.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'mouse') reset();
  });
}
