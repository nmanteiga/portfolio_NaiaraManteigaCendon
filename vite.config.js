import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';

// base relativa: funciona igual en Vercel/Netlify que en GitHub Pages (usuario.github.io/repo)
export default defineConfig({
  base: './',
  // Redimensiona y convierte a WebP las imágenes importadas con parámetros (?w=…&format=webp),
  // p. ej. los diseños de contents/gdg: los originales se quedan intactos
  plugins: [imagetools()],
});
