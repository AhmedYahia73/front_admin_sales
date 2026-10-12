import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'project', 'PROJECT'])
  const projectType = (env.project || env.PROJECT || env.VITE_PROJECT || 'keeto').toLowerCase().trim()
  const isSystego = projectType === 'systego'

  return {
    envPrefix: ['VITE_', 'project', 'PROJECT'],
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'brand-html-transform',
        transformIndexHtml(html) {
          if (isSystego) {
            return html
              .replace(/data-brand="keeto"/g, 'data-brand="systego"')
              .replace(/\/keeto-favicon\.svg/g, '/systego-favicon.svg')
              .replace(/\/favicon\.svg/g, '/systego-favicon.svg')
              .replace(/Keeto Sales/g, 'Systego Sales')
          }
          return html
        }
      }
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://sales.systego.net',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})