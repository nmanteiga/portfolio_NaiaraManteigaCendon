// Textos de la web en inglés.
//
// - HTML_EN: textos fijos de index.html. Cada elemento con data-i18n="clave" usa su texto en
//   español tal cual está en index.html, y en inglés el de aquí (puede llevar <strong>, <em>…).
// - ATTR_EN: atributos (alt, aria-label, href…) de elementos con data-i18n-attr="atributo:clave".
// - STRINGS: textos que generan los scripts (eventos de GDG, proyectos, gata…), en los dos idiomas.
//
// Los textos de los proyectos en inglés están en src/data/projects.js (campo `en` de cada uno).

export const META_EN = {
  description:
    'Naiara Manteiga Cendón — Computer Engineering student at the University of A Coruña. AI, neuroevolution, 3D and tech community in A Coruña.',
};

export const HTML_EN = {
  // Navegación
  navAbout: 'About',
  navProjects: 'Projects',
  navContact: 'Contact',

  // Cabecera
  heroLoader: 'loading my room…',
  heroSubtitle: 'Computer Engineering · AI, 3D &amp; tech community',
  heroHintFine: 'drag to look around the room',
  heroHintCoarse: 'modeled and animated by me in Blender',

  // Sobre mí
  caption1: 'Graduation portrait',
  caption3: 'Graduation 2026',
  aboutLabel: '<span>01</span> About me',
  aboutHeading: 'I code and survive<br /> on <em>caffeine</em>.',
  aboutBio1: `I'm a final-year <strong>Computer Engineering</strong> student at the University of A&nbsp;Coruña,
    specializing in Computing. In my bachelor's thesis I research how to improve the
    <strong>NeuroEvolution of Augmented Topologies (NEAT)</strong> algorithm by applying <strong>Spiking Neural Networks (SNNs)</strong>
    and learning through <strong>Reward-Modulated Spike-Timing-Dependent Plasticity (R-STDP)</strong>.`,
  aboutBio2: `I'm passionate about artificial intelligence (especially machine learning and business intelligence),
    algorithms and applied research, but also anything with a creative touch: from 3D models to video games
    (I modeled and animated the room above myself). Video games are what made me decide, at the age of 10, that I
    would become a computer engineer, and I've been doing everything I can to reach that goal ever since.`,
  aboutBio3: `Outside class, I co-founded <strong>GDG A Coruña</strong>, where I lead communications and organize
    tech events for the Galician community.`,
  factBase: 'Based in',
  factBaseValue: 'A Coruña, Galicia (Spain)',
  factGrad: 'Graduation',
  factGradValue: 'February 2027',
  factLangs: 'Languages',
  factLangsValue: 'Native Spanish and Galician · English C2.1',
  factWorld: 'Abroad',
  factWorldValue: '2 years in the US · Erasmus in Hungary',
  cvView: 'View CV',
  cvDownload: 'Download PDF',
  hl1Num: '€7,500',
  hl1: 'Winner of the AI Körber Innovathon, Hungary',
  hl2: 'hackathons won: Körber Innovathon and Impacthon (GDG Santiago)',
  hl3: 'attendees at DevFest 2025, which we co-organized',
  hl4: 'co-founded Google Developer Group A Coruña',

  // GDG
  gdgLabel: '<span>02</span> Community',
  gdgHeading: 'Building community <em>con sentidiño</em>.',
  gdgLead: `In August 2024 I co-founded <strong>Google Developer Group A Coruña</strong>, where I'm the Communication Manager.
    We organize talks, workshops and hackathons in A Coruña, elsewhere in Galicia and online. My main role is
    leading the creative team: each event's visual identity, the designs and the social media campaigns.`,
  gdgStat1: 'events organized and co-organized',
  gdgStat2: 'attendees at DevFest 2025',
  gdgStat3: 'participants at Hacktoberfest 2025',
  gdgBevy: 'GDG A Coruña on Bevy',
  gdgPast: 'Past events',
  gdgDesigns: 'My designs for GDG',
  gdgDesignsIntro: `Here are some of the designs I've made by hand during my time at GDG. Not all of them are here,
    but this is a small selection.`,

  // Proyectos
  projectsLabel: '<span>03</span> Projects',
  projectsHeading: "Things I've <em>built</em>.",
  projectsIntro: `From my thesis research to 36-hour hackathons: personal, university and competition projects. Hopefully this
    collection will keep growing little by little ;) NOTE: the code for the Körber Innovathon isn't available because the
    company <strong>bought the project</strong> and signing an NDA was required to develop it.`,
  projectsMore: 'More on my GitHub',

  // Contacto y pie
  contactLabel: '<span>✦</span> Contact',
  contactHeading: "Let's talk!",
  footer: 'Made with love in A Coruña · Naiara Manteiga Cendón',
};

export const ATTR_EN = {
  langToggle: 'Switch language to Spanish',
  navHome: 'Home',
  navSections: 'Sections',
  hero: 'Introduction',
  heroCanvas: 'Animated 3D model of my room, made in Blender',
  heroScroll: 'Go to About',
  photos: 'Photos of Naiara',
  photo1: 'Naiara wearing the UDC Computer Engineering graduation sash',
  photo2: 'Naiara speaking on the communities panel at WordCamp Galicia 2026',
  photo3: 'Naiara smiling and making a heart with her arms, wearing the Faculty of Computer Science sash',
  cvHref: 'cv/Naiara_Manteiga_Cendon_CV_EN.pdf',
  cvFile: 'Naiara_Manteiga_Cendon_CV_EN.pdf',
  highlights: 'Highlights',
  eventsPrev: 'Previous events',
  eventsNext: 'More events',
  lightbox: 'Enlarged image',
  lightboxPrev: 'Previous',
  lightboxNext: 'Next',
  lightboxClose: 'Close',
};

export const STRINGS = {
  es: {
    locale: 'es-ES',
    nextEvent: 'Próximo evento',
    today: 'hoy',
    tomorrow: 'mañana',
    inDays: (n) => `en ${n} días`,
    signUp: 'Apúntate en Bevy',
    gdgLogoAlt: 'Logo de GDG A Coruña',
    otherDesigns: 'Otros diseños',
    otherYear: 'Otros',
    events: (n) => `${n} ${n === 1 ? 'evento' : 'eventos'}`,
    designs: (n) => `${n} ${n === 1 ? 'diseño' : 'diseños'}`,
    seeEvent: 'Ver evento ↗',
    designN: (title, n) => `${title}: diseño ${n}`,
    videoOf: (title) => `Ver el vídeo de ${title}`,
    shotsOf: (title) => `Ver capturas de ${title}`,
    shots: (n) => `${n} capturas`,
    shotN: (title, n) => `${title}: captura ${n}`,
    catShow: '🐾 Mostrar a mi gata',
    catHide: '🐾 Ocultar a mi gata',
  },
  en: {
    locale: 'en-GB',
    nextEvent: 'Next event',
    today: 'today',
    tomorrow: 'tomorrow',
    inDays: (n) => `in ${n} days`,
    signUp: 'Sign up on Bevy',
    gdgLogoAlt: 'GDG A Coruña logo',
    otherDesigns: 'Other designs',
    otherYear: 'Other',
    events: (n) => `${n} ${n === 1 ? 'event' : 'events'}`,
    designs: (n) => `${n} ${n === 1 ? 'design' : 'designs'}`,
    seeEvent: 'View event ↗',
    designN: (title, n) => `${title}: design ${n}`,
    videoOf: (title) => `Watch the video of ${title}`,
    shotsOf: (title) => `View screenshots of ${title}`,
    shots: (n) => `${n} screenshots`,
    shotN: (title, n) => `${title}: screenshot ${n}`,
    catShow: '🐾 Show my cat',
    catHide: '🐾 Hide my cat',
  },
};
