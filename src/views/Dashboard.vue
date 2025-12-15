<script setup>
// import TheHeader from '../components/TheHeader.vue'
import TheSideBar from '../components/TheSidebar.vue'
import { RouterView } from 'vue-router'
import TheMobileMenu from '@/components/TheMobileMenu.vue'
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import PopUpNotification from '@/components/PopUpNotification.vue'
import { useModal } from 'vue-final-modal'

const { privileges, notificationData } = useUserStore()

const { open, close } = useModal({
  component: PopUpNotification,
  attrs: {
    onConfirm() {
      close()
    },
  },
})

onMounted(() => {
  if (
    (privileges.can_view_products && (notificationData.expiring || notificationData.low_stock)) ||
    (privileges.can_view_sales_records && notificationData.due_payments)
  ) {
    open()
  }
})
</script>

<template>
  <!-- <TheHeader /> -->
  <TheSideBar />
  <!-- <TheMobileMenu /> -->

  <main class="min-h-[100dvh] overflow-y-auto mx-5 pb-16 py-5 lg:ml-[270px]">
    <!-- Global route-specific loading indicator -->
    <!-- <LoadingIndicator :routeName="$route.name" :text="`Loading ${$route.name}...`" /> -->
    <RouterView />
  </main>
</template>
