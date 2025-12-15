<script setup>
import { ref, reactive, computed } from 'vue'
import DynamicInput from './DynamicInput.vue'
import { useVuelidate } from '@vuelidate/core'
import { required, sameAs } from '@vuelidate/validators'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { toast } from 'vue3-toastify'

const { $reset } = useUserStore()

const isLoading = ref(false)

const authData = reactive({
  oldpassword: null,
  password: null,
  cPassword: null,
})

const rules = computed(() => ({
  oldpassword: {
    required,
  },
  password: {
    required,
  },
  cPassword: {
    required,
    sameAs: sameAs(authData.password),
  },
}))

const v$ = useVuelidate(rules, authData)

const submitAuth = async () => {
  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) return

  try {
    isLoading.value = true

    const response = await axios.post('editUser', authData)

    if (response.status === 201) {
      toast.success(response.data.success, {
        position: toast.POSITION.TOP_CENTER,
      })

      $reset()
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

  isLoading.value = false
}
</script>

<template>
  <div class="w-full max-w-xl md:max-w-2xl p-3 md:p-4 lg:p-6">
    <div class="flex flex-col gap-3">
      <div class="border-b h-20 flex flex-col justify-center">
        <h6 class="font-bold">Password info</h6>
        <p class="text-gray-500 text-xs">View and change your password settings</p>
      </div>

      <form @submit.prevent="submitAuth" class="divide-y divide-gray-200">
        <DynamicInput
          v-model="authData.oldpassword"
          label="Current Password"
          type="password"
          placeholder="Enter your Current password"
        />

        <DynamicInput
          v-model="authData.password"
          label="New Password"
          type="password"
          placeholder="Enter your new password"
        />

        <DynamicInput
          v-model="authData.cPassword"
          label="Confirm New Password"
          type="password"
          placeholder="Confirm New password"
        />

        <button
          :disabled="isLoading || v$.$invalid"
          class="w-full mainBtn transition duration-300"
          type="submit"
        >
          Continue
        </button>
      </form>
    </div>
  </div>
</template>
