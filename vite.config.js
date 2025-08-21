import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "",
  resolve: {
    alias: {
      fabric: path.resolve(__dirname, "node_modules/fabric/dist/fabric.js"),
    },
  },
})
