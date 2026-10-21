// Proyectos de la sección "Proyectos". Para editar textos o añadir uno, copia un bloque.
// - images: las capturas de contents/projects cuyo nombre empiece así (se optimizan solas)
// - video: archivo de public/projects (ya comprimido para la web)
// - visual: animación generada si aún no hay capturas ('network' = red neuronal, 'protein' = proteína)
// - size: 'wide' ocupa dos columnas en escritorio
export const PROJECTS = [
  {
    id: 'tfg',
    title: 'Spiking NEAT con R‑STDP', // guion que no parte la línea
    context: 'Trabajo de Fin de Grado · UDC',
    year: '2026',
    status: 'En progreso',
    size: 'wide',
    images: /^tfg/, // si añades capturas tfg*.png, sustituyen a la animación
    visual: 'network',
    description:
      'Investigo cómo mejorar el algoritmo de neuroevolución NEAT sustituyendo las redes clásicas por Spiking Neural Networks, ' +
      'neuronas que se comunican con impulsos como las biológicas, y añadiendo aprendizaje durante la vida de cada red con R-STDP ' +
      '(plasticidad modulada por recompensa).',
    stack: ['Python', 'SNNs', 'NEAT', 'R-STDP', 'LaTeX'],
    links: [{ label: 'Código', url: 'https://github.com/nmanteiga/TFG_Spiking-NEAT_Arquitecture_with_R-STDP' }],
  },
  {
    id: 'camelia',
    title: 'CAMELIA',
    context: 'Impacthon 2026 · GDG Santiago',
    year: '2026',
    award: 'Proyecto ganador',
    images: /^camelia/, // cuando tengas la captura, guárdala como camelia1.png en contents/projects
    visual: 'protein',
    description:
      'En 36 horas construimos una web para visualizar proteínas en 3D y en realidad virtual y aumentada. ' +
      'Yo desplegué el backend en Google Cloud y creé un agente que resume la información de las proteínas y sus comparaciones.',
    stack: ['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Google Cloud'],
    links: [{ label: 'Código', url: 'https://github.com/HugoVilr/ImpactThon2026-CAMELIA' }],
  },
  {
    id: 'doom',
    title: 'DOOM en un satélite',
    context: 'HackUDC 2026 · Reto de Alén Space',
    year: '2026',
    images: /^hack2026/,
    description:
      'Simulamos un enlace con un satélite en órbita baja: el satélite ejecuta DOOM y una estación terrena lo controla, ' +
      'enviando solo los píxeles que cambian para ahorrar ancho de banda. Desarrollé en C el subsistema satelital: red asíncrona ' +
      'sobre UDP con sockets no bloqueantes y una máquina de estados para mitigar la latencia.',
    stack: ['C', 'Python', 'UDP', 'Redes'],
    links: [{ label: 'Código', url: 'https://github.com/nmanteiga/Doom-gameplay-on-a-satellite' }],
  },
  {
    id: 'lse',
    title: 'Lengua de Signos Española',
    context: 'Aprendizaje Automático · UDC',
    year: '2026',
    video: { src: 'projects/lse.mp4', poster: 'projects/lse-poster.jpg' },
    description:
      'Reconoce en tiempo real, con la cámara, las letras del abecedario en LSE a partir de la posición de los puntos de la mano. ' +
      'Comparamos árboles de decisión, kNN, SVM, redes neuronales, deep learning y DoME.',
    stack: ['Julia', 'Python', 'Visión por computador', 'ML'],
    links: [{ label: 'Código', url: 'https://github.com/nmanteiga/Pr-ctica-AA/tree/main/Pr%C3%A1ctica2' }],
  },
  {
    id: 'brinqo',
    title: "Schrödinger's Hand",
    context: 'BrinQo Quantum Game Jam 2026',
    year: '2026',
    images: /^brinqo/,
    description:
      'Un juego de cartas basado en conceptos de la física cuántica. Me encargué de la programación principal del juego en Godot ' +
      'a partir del diseño de mis compañeros.',
    stack: ['Godot', 'GDScript', 'Shaders'],
    links: [
      { label: 'Jugar en itch.io', url: 'https://itch.io/jam/brinqo/rate/4288174' },
      { label: 'Código', url: 'https://github.com/nmanteiga/BrinQo-Quantum-GameJam' },
    ],
  },
  {
    id: 'habitacion',
    title: 'Mi habitación en 3D',
    context: 'Proyecto de la carrera',
    year: '2025',
    size: 'wide',
    images: /^habitacion/,
    description:
      'La habitación de la cabecera. La modelé, texturicé y animé en Blender durante la carrera, con muchas horas de esfuerzo: ' +
      '53 animaciones, simulación de tela en las cortinas, humo y partículas de polvo. Para esta web la exporté a Three.js.',
    stack: ['Blender', 'Three.js', 'Simulación de tela'],
    links: [{ label: 'Verla en 3D', url: '#top' }],
  },
];
