// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxt/test-utils/module'
  ],
  vite: {
    optimizeDeps: {
      include: ['three']
    },
    build: {
      chunkSizeWarningLimit: 1000
    }
  },
  runtimeConfig: {
    public: {
      apiKey: process.env.API_KEY,
    },
  },
})
