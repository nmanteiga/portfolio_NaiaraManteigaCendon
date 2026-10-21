import GUI from 'three/addons/libs/lil-gui.module.min.js';

// Panel para afinar la iluminación en vivo. Solo se carga con ?luces en la URL,
// así que los visitantes de la web nunca lo descargan.
export function initLightingPanel(config, apply) {
  const gui = new GUI({ title: 'Iluminación' });
  const onChange = () => apply();

  const general = gui.addFolder('General');
  general.add(config, 'exposure', 0.2, 2.5, 0.01).name('Exposición').onChange(onChange);
  general.add(config, 'ambient', 0, 2, 0.01).name('Luz ambiental').onChange(onChange);
  general.addColor(config, 'ambientSky').name('Ambiental (arriba)').onChange(onChange);
  general.addColor(config, 'ambientGround').name('Ambiental (abajo)').onChange(onChange);
  general.add(config, 'shadowStrength', 0, 1, 0.01).name('Fuerza sombras').onChange(onChange);

  const ceiling = gui.addFolder('Luz del techo');
  ceiling.add(config, 'ceiling', 0, 40000, 100).name('Intensidad').onChange(onChange);
  ceiling.addColor(config, 'ceilingColor').name('Color').onChange(onChange);

  const lamps = gui.addFolder('Lámparas (de Blender)');
  lamps.add(config.lamps, 'luz_ventana', 0, 0.5, 0.005).name('Ventana').onChange(onChange);
  lamps.add(config.lamps, 'luz_boba', 0, 1.5, 0.01).name('Boba').onChange(onChange);
  lamps.add(config.lamps, 'luz_lámpara_lava', 0, 1, 0.005).name('Lámpara de lava').onChange(onChange);

  const fx = gui.addFolder('Polvo y humo');
  fx.add(config.dust, 'base', 0, 1, 0.01).name('Polvo: brillo base').onChange(onChange);
  fx.add(config.dust, 'glow', 0, 6, 0.05).name('Polvo: brillo en luces').onChange(onChange);
  fx.add(config.dust, 'size', 0.2, 4, 0.05).name('Polvo: tamaño').onChange(onChange);
  fx.add(config, 'smoke', 0, 1, 0.01).name('Humo: opacidad').onChange(onChange);

  const floor = gui.addFolder('Suelo');
  floor.add(config, 'floorBump', 0, 10, 0.05).name('Relieve madera').onChange(onChange);

  gui
    .add(
      {
        copiar: async () => {
          const text = `export const LIGHTING = ${JSON.stringify(config, null, 2)};\n`;
          try {
            await navigator.clipboard.writeText(text);
            alert('Ajustes copiados. Pégalos en src/lighting.js (o pásamelos por el chat).');
          } catch {
            console.log(text);
            alert('No se pudo copiar al portapapeles: los ajustes están en la consola del navegador.');
          }
        },
      },
      'copiar',
    )
    .name('📋 Copiar ajustes');
}
