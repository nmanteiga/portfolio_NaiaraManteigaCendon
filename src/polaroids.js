// Pila de polaroids: cada INTERVAL ms (o al tocarla) la de delante sale hacia un lado y pasa al fondo
const INTERVAL = 4500;
const LEAVE_MS = 450;

export function initPolaroids(frame) {
  const cards = [...frame.querySelectorAll('.frame__card')];
  if (cards.length < 2) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let busy = false;
  let hovering = false;
  let timer;

  function next() {
    if (busy) return;
    busy = true;
    const front = cards.find((c) => c.dataset.pos === '0');
    front.style.setProperty('--rx', '0deg');
    front.style.setProperty('--ry', '0deg');
    front.classList.add('is-leaving');

    setTimeout(
      () => {
        // la de delante pasa al fondo y el resto avanza un puesto
        for (const card of cards) {
          const pos = Number(card.dataset.pos);
          card.dataset.pos = pos === 0 ? cards.length - 1 : pos - 1;
        }
        front.classList.remove('is-leaving');
        busy = false;
      },
      reducedMotion ? 0 : LEAVE_MS,
    );
  }

  function schedule() {
    clearInterval(timer);
    if (reducedMotion) return; // sin cambio automático, solo al tocar
    timer = setInterval(() => {
      if (!hovering && !document.hidden) next();
    }, INTERVAL);
  }

  frame.addEventListener('click', () => {
    next();
    schedule(); // reinicia la cuenta para que no cambie justo después de tocar
  });
  frame.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') hovering = true;
  });
  frame.addEventListener('pointerleave', () => (hovering = false));

  // Solo rota cuando la sección está a la vista
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) schedule();
    else clearInterval(timer);
  }).observe(frame);
}
