import './assets/main.css'
import 'vue-final-modal/style.css'
import 'vue3-toastify/dist/index.css'
import { registerSW } from 'virtual:pwa-register'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVfm } from 'vue-final-modal'
import Vue3Toasity from 'vue3-toastify'

import App from './App.vue'
import router from './router'
import './app.service'

registerSW({
  onNeedRefresh() {},
  onOfflineReady() {
    // console.log('App ready to work offline')
  },
})

const updateSW = registerSW({
  onNeedRefresh() {},
  onOfflineReady() {},
  onRegistered(registration) {
    console.log('🎯 Service Worker registered:', registration)
    console.log('📡 Scope:', registration?.scope)
  },
  onRegisterError(error) {
    console.error('❌ Service Worker registration error:', error)
  },
})

if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('🏠 App is already installed as PWA')
}

const app = createApp(App)
app.use(createVfm())
app.use(createPinia())
app.use(Vue3Toasity, {
  autoClose: 1000,
  clearOnUrlChange: false,
})
app.use(router)

app.mount('#hephzihub')

if (import.meta.env.DEV) {
  window.updatePWA = updateSW
}
