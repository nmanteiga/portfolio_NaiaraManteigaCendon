// Proyectos de la sección "Proyectos". Para editar textos o añadir uno, copia un bloque.
// - images: las capturas de contents/projects cuyo nombre empiece así (se optimizan solas)
// - video: archivo de public/projects (ya comprimido para la web)
// - visual: animación generada si aún no hay capturas ('network' = red neuronal, 'protein' = proteína)
// - size: 'wide' ocupa dos columnas en escritorio
// - en: textos de la versión en inglés de la web (lo que no esté aquí se queda como en español;
//   en `links` van solo los textos de los enlaces, en el mismo orden)
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
    en: {
      title: 'Spiking NEAT with R‑STDP',
      context: "Bachelor's thesis · UDC",
      status: 'In progress',
      description:
        "I'm researching how to improve the NEAT neuroevolution algorithm by replacing classic networks with Spiking Neural Networks, " +
        'whose neurons communicate through spikes like biological ones, and by adding lifetime learning to each network with R-STDP ' +
        '(reward-modulated plasticity).',
      links: ['Code'],
    },
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
    en: {
      award: 'Winning project',
      description:
        'In 36 hours we built a website to visualize proteins in 3D and in virtual and augmented reality. ' +
        'I deployed the backend on Google Cloud and built an agent that summarizes protein information and comparisons.',
      links: ['Code'],
    },
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
    en: {
      title: 'DOOM on a satellite',
      context: 'HackUDC 2026 · Alén Space challenge',
      description:
        'We simulated a link with a satellite in low Earth orbit: the satellite runs DOOM and a ground station controls it, ' +
        'sending only the pixels that change to save bandwidth. I developed the satellite subsystem in C: an asynchronous network ' +
        'over UDP with non-blocking sockets and a state machine to mitigate latency.',
      stack: ['C', 'Python', 'UDP', 'Networking'],
      links: ['Code'],
    },
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
    en: {
      title: 'Spanish Sign Language (LSE)',
      context: 'Machine Learning · UDC',
      description:
        'Recognizes the letters of the LSE alphabet in real time through the camera, based on the position of the hand landmarks. ' +
        'We compared decision trees, kNN, SVM, neural networks, deep learning and DoME.',
      stack: ['Julia', 'Python', 'Computer vision', 'ML'],
      links: ['Code'],
    },
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
    en: {
      description:
        "A card game based on quantum physics concepts. I handled the main game programming in Godot, based on my teammates' design.",
      links: ['Play on itch.io', 'Code'],
    },
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
    en: {
      title: 'My room in 3D',
      context: 'University project',
      description:
        'The room in the header. I modeled, textured and animated it in Blender during my degree, after many hours of work: ' +
        '53 animations, cloth simulation on the curtains, smoke and dust particles. For this website I exported it to Three.js.',
      stack: ['Blender', 'Three.js', 'Cloth simulation'],
      links: ['See it in 3D'],
    },
  },
];
