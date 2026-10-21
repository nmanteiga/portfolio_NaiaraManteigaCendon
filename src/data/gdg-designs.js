// A qué evento pertenece cada diseño de contents/gdg, según cómo empieza el nombre del archivo.
// Ej.: "devfest3.jpg" → DevFest 2025. La galería se ordena por fecha (lo más reciente primero)
// y se agrupa por año.
//
// Para añadir un evento nuevo: copia un bloque y cambia `files`, `title`, `date` y `url`.
// Un archivo que no encaje con ningún bloque sale igualmente, en "Otros".
export const DESIGN_GROUPS = [
  {
    files: /^hacktoberfest2026/,
    title: 'Hacktoberfest 2026',
    date: '2026-10-24',
    url: 'https://gdg.community.dev/e/mzc6kg/',
  },
  {
    files: /^(devfest|agenda_ig)/,
    title: 'DevFest 2025 · A Coruña ft. Ourense',
    date: '2025-11-21',
    url: 'https://gdg.community.dev/e/mcehnm/',
  },
  {
    files: /^hacktoberfest2025/,
    title: 'Hacktoberfest 2025',
    date: '2025-10-18',
    url: 'https://gdg.community.dev/e/m544cd/',
  },
  {
    files: /^explorando_patrones_cancer_mama/,
    title: 'Explorando patrones en el cáncer de mama con R',
    date: '2025-02-26',
    url: 'https://gdg.community.dev/e/m4rjfk/',
  },
  {
    files: /^como_hablar_mas_alla_del_codigo/,
    title: 'Cómo hablar más allá del código',
    date: '2024-12-01',
    url: 'https://gdg.community.dev/e/mzxvgg/',
  },
  {
    files: /^hacktoberfest2024/,
    title: 'Hacktoberfest 2024',
    date: '2024-10-26',
    url: 'https://gdg.community.dev/e/m649tg/',
  },
  {
    files: /^others/,
    title: 'Acreditaciones para eventos',
  },
];
