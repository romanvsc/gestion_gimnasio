import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      dts: true,
      resolvers: [
        // Auto-import Lucide icons as <ILucide{IconName} /> (ej: <ILucideUserPlus />)
        IconsResolver({ prefix: 'I', enabledCollections: ['lucide'] })
      ]
    }),
    Icons({ compiler: 'vue3', autoInstall: true })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
