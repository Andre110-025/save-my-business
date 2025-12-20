<script setup>
import { RouterView } from 'vue-router'
import { ModalsContainer } from 'vue-final-modal'
import LoadingBar from '@/components/LoadingBar.vue'
import { ref, onMounted } from 'vue'

const showSplash = ref(false)

onMounted(() => {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches

  if (isPWA) {
    showSplash.value = true
    setTimeout(() => {
      showSplash.value = false
    }, 3000)
  }
})
</script>

<template>
  <LoadingBar color="#05716c" :height="3" />

  <div v-if="showSplash" class="splash-screen">
    <img src="/SMB.gif" alt="Loading" class="splash-gif" />
  </div>

  <div v-else>
    <RouterView />
  </div>
  <ModalsContainer />
</template>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.splash-gif {
  max-width: 200px;
  max-height: 200px;
}
</style>
