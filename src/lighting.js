// Ajustes de iluminación de la habitación 3D.
// Para afinarlos en vivo, abre la web con ?luces al final (http://localhost:5173/?luces),
// mueve los controles y pulsa "Copiar ajustes": pega aquí lo copiado sustituyendo este objeto.
// (Los cambios del panel no se guardan solos: al recargar se vuelve a usar lo que pone aquí.)
export const LIGHTING = {
  exposure: 0.32, // brillo general (tone mapping AgX, como en Blender)
  ambient: 0.77, // luz de relleno: más alto = sombras menos negras, menos contraste
  ambientSky: '#cdb6ff',
  ambientGround: '#3a2366',
  ceiling: 5600, // sustituye a la luz de área del techo (glTF no las exporta)
  ceilingColor: '#ffe9d6',
  shadowStrength: 0.13, // 1 = sombras totalmente opacas
  // Multiplicadores sobre las intensidades exportadas de Blender (que salen altísimas en la web)
  lamps: {
    luz_ventana: 0.05,
    luz_boba: 0,
    'luz_lámpara_lava': 0.09,
  },
  dust: {
    base: 0.32, // brillo de las motas lejos de las luces
    glow: 2.75, // brillo extra al cruzar una luz
    size: 1.25,
  },
  smoke: 0.32, // opacidad del humo
  floorBump: 8, // relieve de la madera del suelo (bump map de Blender)
};
