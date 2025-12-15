<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import IconAccount from './IconAccount.vue'
import DynamicInput from './DynamicInput.vue'
import IconAccount2 from './IconAccount2.vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { toast } from 'vue3-toastify'
import { useVuelidate } from '@vuelidate/core'
import { required, requiredIf, email, sameAs } from '@vuelidate/validators'
import PermissionDisplay from './PermissionDisplay.vue'
import IconCancel from './IconCancel.vue'

const { user } = useUserStore()

const emit = defineEmits(['confirm'])

const props = defineProps({
  edit: {
    type: Boolean,
    default: false,
  },
  customData: {
    type: Object,
    default: () => ({}),
  },
})

const roleList = ref([])

const isLoading = ref(false)
const rolePermissions = ref(null)

const getRoleList = async () => {
  try {
    // roleList.value = null

    const response = await axios.get(`getrole`)

    if (response.status === 202) {
      roleList.value = response.data.Data

      if (props.edit) {
        handleRoleSelection()
      }
    }
  } catch (error) {
    console.error('Error fetching Roles:', error)
    toast.error('Error fetching Roles')
  }

  // console.log(roleList.value)
}

const adminData = reactive({
  full_name: props.edit ? props.customData.full_name : null,
  email: props.edit ? props.customData.email : null,
  password: null,
  cPassword: null,
  phone_number: props.edit ? props.customData.phone_number : null,
  business_name: user.userInfo.business_name,
  user_type: props.edit ? props.customData.user_type : null,
  owner_id: user.userInfo.id,
  country_code: 'NG',
  storehive_officer: '123',
})

const rules = computed(() => ({
  full_name: { required },
  email: { email, required },
  password: { requiredIf: requiredIf(!props.edit) },
  cPassword: { sameAs: sameAs(adminData.password), requiredIf: requiredIf(!props.edit) },
  phone_number: { required },
  user_type: { required },
}))

const v$ = useVuelidate(rules, adminData)

const assignBranch = async (id) => {
  const payload = {
    branches: {
      branch: {
        staff_id: id,
        branchinput: [
          {
            branch_id: user.branchId,
          },
        ],
      },
    },
  }
  try {
    const response = await axios.post('assignBranch', payload)
    if (response.data.success === 'Branch(s) Assigned Successfully!') {
      toast.success('Admin created successfully')
      emit('confirm', true)
    }
  } catch (error) {
    toast.error('Error assigning branch')
    isLoading.value = false
  }
}

const createAdmin = async () => {
  try {
    isLoading.value = true
    const isFormCorrect = await v$.value.$validate()
    if (!isFormCorrect) {
      isLoading.value = false
      {
        toast.warning('Ensure you provided valid details')
        isLoading.value = false
      }
      return
    }

    const { status, data } = await axios.post('register', adminData)

    if (status === 201 && !data.errors) {
      assignBranch(data.success.userId)
    } else if (data.errors) {
      data.errors.forEach((element) => {
        toast.error(element, {
          position: toast.POSITION.TOP_CENTER,
        })
      })
    }
  } catch (error) {
    toast.error('Error creating admin')
  } finally {
    isLoading.value = false
  }
}

const editAdminRole = async () => {
  try {
    isLoading.value = true

    const response = await axios.post(`changeUserRole/${props.customData.id}`, {
      user_type: adminData.user_type,
    })

    if (response.status === 201) {
      toast.success('Admin role updated successfully')
      isLoading.value = false
      emit('confirm', true)
    }
  } catch (error) {
    toast.error('Error Updating admin role')
    isLoading.value = false
  }
}

// Handle role selection change
const handleRoleSelection = () => {
  // Find the complete role object based on the selected role name
  const selectedRoleData = roleList.value.find((role) => role.role_name === adminData.user_type)

  if (selectedRoleData) {
    // Emit the selected role data to parent component
    // emit('role-selected', selectedRoleData);

    // You can also perform additional actions here if needed
    const { created_at, updated_at, id, role_id, ...filteredPermission } =
      selectedRoleData.rolepreviledges
    rolePermissions.value = filteredPermission
    // console.log('Selected role:', selectedRoleData, rolePermissions.value)
  }
}

onMounted(() => {
  getRoleList()
})
</script>

<template>
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-[600px] max-w-[940px] rounded-2xl shadow-lg max-[450px]:h-full max-[450px]:max-w-full max-[450px]:rounded-none max-[450px]:overflow-y-auto"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="true"
  >
    <div class="flex w-full h-full max-[450px]:flex-col max-[450px]:h-auto max-[450px]:min-h-full">
      <!-- Left side: Form -->
      <div class="flex-1 h-full flex flex-col max-[450px]:w-full">
        <div class="p-6 flex flex-row items-center gap-[15px] max-[450px]:p-4 max-[450px]:gap-3">
          <div
            class="w-11 h-11 bg-[rgba(5,113,108,0.1)] rounded-md flex items-center justify-center max-[450px]:w-9 max-[450px]:h-9"
          >
            <IconAccount class="w-8 h-8 max-[450px]:w-6 max-[450px]:h-6" />
          </div>
          <div v-if="!edit" class="flex flex-row justify-between items-center gap-[140px]">
            <div>
              <h3 class="text-gray-900 max-[450px]:text-base">Invite Admin</h3>
              <h6 class="text-gray-500 max-[450px]:text-sm">Assign role to your staff</h6>
            </div>
            <div>
              <button
                @click="emit('confirm')"
                type="button"
                class="border border-black rounded p-1 flex items-center justify-center"
              >
                <IconCancel color="black" class="w-5 h-5" />
              </button>
            </div>
          </div>
          <div v-else class="flex flex-row justify-between items-center gap-[130px]">
            <div>
              <h3 class="text-gray-900 max-[450px]:text-base">Change Staff Role</h3>
              <h6 class="text-gray-500 max-[450px]:text-sm">Edit your staff role</h6>
            </div>
            <div>
              <button
                @click="emit('confirm')"
                type="button"
                class="border border-black rounded p-1 flex items-center justify-center"
              >
                <IconCancel color="black" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <!-- Form wrapped in a scrollable container -->
        <div class="flex-1 overflow-y-auto px-6 pb-6 max-[450px]:px-4 max-[450px]:pb-4">
          <form>
            <DynamicInput
              v-model="adminData.full_name"
              :label="'Full Name'"
              type="text"
              placeholder="Enter Full Name"
              :readonly="edit"
            />
            <DynamicInput
              v-model="adminData.email"
              :label="'Email'"
              type="text"
              placeholder="Enter Email"
              :readonly="edit"
            />
            <DynamicInput
              v-model="adminData.phone_number"
              :label="'Phone Number'"
              type="tel"
              placeholder="Enter Phone Number"
              :readonly="edit"
            />
            <DynamicInput
              v-model="adminData.password"
              :label="'Password'"
              type="password"
              placeholder="Enter password"
              v-if="!edit"
            />
            <DynamicInput
              v-model="adminData.cPassword"
              :label="'Confirm Password'"
              type="password"
              placeholder="Confirm password"
              v-if="!edit"
            />
            <div class="mb-4">
              <label class="block mb-2 max-[450px]:text-sm max-[450px]:mb-1.5">Select Role</label>
              <select
                class="w-full p-2 border border-gray-300 rounded-lg accent-mainColor text-sm outline-none focus:ring-1 focus:ring-mainColor max-[450px]:text-xs max-[450px]:p-1.5"
                v-model="adminData.user_type"
                :disabled="!roleList.length"
                @change="handleRoleSelection"
              >
                <option value="">Select a role</option>
                <option
                  class="capitalize accent-mainColor"
                  v-for="(item, index) in roleList"
                  :key="index"
                  :value="item.role_name"
                >
                  {{ item.role_name }}
                </option>
              </select>
            </div>

            <button
              class="w-full mainBtn transition duration-300 mt-2.5 flex flex-row items-center justify-center max-[450px]:py-2.5 max-[450px]:text-sm"
              @click="editAdminRole"
              :disabled="isLoading || v$.$invalid"
              v-if="edit"
              type="button"
            >
              <IconAccount2 class="w-[20px] h-[20px] max-[450px]:w-4 max-[450px]:h-4" />
              Update Role
            </button>
          </form>
        </div>
      </div>

      <!-- Right side: Role details -->
      <div
        class="flex-1 h-full bg-[#f7f8fa] p-5 rounded-tr-2xl rounded-br-2xl max-[450px]:w-full max-[450px]:p-4 max-[450px]:rounded-none max-[450px]:border-t max-[450px]:border-gray-200"
      >
        <div
          class="p-6 flex flex-col bg-white border w-full h-full rounded-md shadow-sm max-[450px]:p-4 max-[450px]:h-auto max-[450px]:min-h-[400px]"
        >
          <div>
            <h4 class="max-[450px]:text-base">Role Details</h4>
            <h6 class="text-gray-400 max-[450px]:text-sm">
              This is the list of permission assigned to your staff
            </h6>
            <button
              class="w-full mainBtn transition duration-300 mt-2.5 flex flex-row items-center justify-center max-[450px]:py-2.5 max-[450px]:text-sm"
              @click="createAdmin"
              :disabled="isLoading || v$.$invalid"
              v-if="!edit"
            >
              <IconAccount2 class="w-[20px] h-[20px] max-[450px]:w-4 max-[450px]:h-4" />
              Send Invite
            </button>
          </div>
          <div
            class="mt-3 flex flex-col flex-1 overflow-y-hidden border-t-2 border-b-2 border-dotted border-gray-300 pt-2 pb-2 max-[450px]:mt-2.5"
            v-if="adminData.user_type && rolePermissions"
          >
            <h6 class="max-[450px]:text-sm">Role: {{ adminData.user_type }}</h6>

            <PermissionDisplay class="flex-1 overflow-y-auto" :permissions="rolePermissions" />
          </div>
        </div>
      </div>
    </div>
  </VueFinalModal>
</template>
