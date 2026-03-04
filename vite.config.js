import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages deployment at https://ananyabhattdev.github.io/photo-editor/
  base: '/photo-editor/',
})
