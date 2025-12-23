<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import DynamicInput from './DynamicInput.vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePWAInstall } from '@/composables/usePWAInstall'
import IconDesktop from './IconDesktop.vue'
import IconDownloadBtn from './IconDownloadBtn.vue'

const { canInstall, installApp } = usePWAInstall()
const userStore = useUserStore()

const showDownloadBtn = ref(false)

onMounted(() => {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches

  if (!isPWA) {
    showDownloadBtn.value = true
  }
})

const router = useRouter()

const loading = ref(false)
const authData = reactive({
  email: '',
  password: '',
})

const rules = computed(() => ({
  email: {
    email,
    required,
  },
  password: {
    required,
  },
}))

const v$ = useVuelidate(rules, authData)

const submitLogin = async () => {
  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) return

  try {
    loading.value = true

    const response = await axios.post('login', authData)

    // console.log(response)
    // return
    if (response.status === 202) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.Login.token
      userStore.user.token = response.data.Login.token
      userStore.user.expirationTime = response.data.Login.expiry_date

      await userStore.getUserDetails()

      toast.success('Login Successful', {
        position: toast.POSITION.TOP_CENTER,
      })

      router.push({ name: 'overview' })
    } else {
      if (response.data.errors) {
        toast.warning(response.data.errors, {
          position: toast.POSITION.TOP_CENTER,
        })
      } else {
        toast.error('An Error was encountered', {
          position: toast.POSITION.TOP_CENTER,
        })
      }
    }
  } catch (error) {
    toast.error('An Error was encountered', {
      position: toast.POSITION.TOP_CENTER,
    })
  }

  loading.value = false
}

onMounted(() => {
  userStore.$reset()
})
</script>

<template>
  <!-- <button
    class="fixed top-6 right-6 z-50 inline-flex items-center gap-2 rounded-xl bg-mainColor text-white py-3 px-4 font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mainColor/50"
    aria-label="Install app"
    @click="installApp"
    v-if="showDownloadBtn"
  >
    <IconDownloadBtn class="w-5 h-5" />
    <!-- <span>Install App</span> 
  </button> -->
  <form class="max-w-lg w-full bg-white p-10 rounded-lg" @submit.prevent="submitLogin">
    <h2 class="mb-8">Sign In</h2>

    <div class="w-full">
      <DynamicInput
        v-model="authData.email"
        label="Email Address"
        type="email"
        placeholder="Enter your email"
      />

      <DynamicInput
        v-model="authData.password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        :link="{
          label: 'Forgot Password?',
          route: 'ForgetPassword',
        }"
      />

      <button
        :disabled="loading || v$.$invalid"
        class="w-full mainBtn transition duration-300"
        type="submit"
      >
        Sign In
      </button>
    </div>
  </form>
</template>
