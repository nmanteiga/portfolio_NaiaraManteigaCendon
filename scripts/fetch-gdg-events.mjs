// Descarga los eventos de GDG A Coruña desde Bevy y guarda una copia en src/data/gdg-events.json.
// Se ejecuta antes de cada build (npm run build) para que la web publicada tenga siempre una copia
// reciente por si, al abrirla, no hay conexión con Bevy (p. ej. el wifi de una feria).
// En el navegador la web vuelve a pedirlos en directo, así que los eventos nuevos salen solos.
import { writeFile, mkdir } from 'node:fs/promises';
import { fetchGdgEvents } from '../src/gdg-api.js';

const OUT = new URL('../src/data/gdg-events.json', import.meta.url);

try {
  const events = await fetchGdgEvents();
  await mkdir(new URL('.', OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), events }, null, 2) + '\n');
  console.log(`gdg-events: ${events.length} eventos guardados`);
} catch (err) {
  // Sin red no se rompe el build: se queda la copia anterior
  console.warn(`gdg-events: no se pudo actualizar la copia (${err.message}); se usa la existente`);
}
