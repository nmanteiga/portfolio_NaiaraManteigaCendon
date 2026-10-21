// API pública de Bevy (la plataforma de gdg.community.dev). Permite CORS, así que funciona
// tanto en el navegador como en Node (script de build).
export const GDG_CHAPTER_URL = 'https://gdg.community.dev/gdg-a-coruna/';
const CHAPTER_ID = 1694; // GDG A Coruña
const FIELDS = 'id,title,start_date,end_date,static_url,cropped_picture_url,description_short';

async function fetchStatus(status, signal) {
  const params = new URLSearchParams({
    page_size: '500',
    status,
    include_cohosted_events: 'true',
    visible_on_parent_chapter_only: 'true',
    order: '-start_date',
    fields: FIELDS,
  });
  const res = await fetch(`https://gdg.community.dev/api/event_slim/for_chapter/${CHAPTER_ID}/?${params}`, { signal });
  if (!res.ok) throw new Error(`Bevy respondió ${res.status}`);
  const data = await res.json();
  return data.results;
}

/** Todos los eventos (próximos y pasados), solo con los campos que usa la web */
export async function fetchGdgEvents({ signal } = {}) {
  const [live, completed] = await Promise.all([fetchStatus('Live', signal), fetchStatus('Completed', signal)]);
  return [...live, ...completed].map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start_date,
    end: e.end_date,
    url: e.static_url,
    image: e.cropped_picture_url,
    summary: e.description_short ?? '',
  }));
}
