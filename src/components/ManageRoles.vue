<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import IconPlus from './IconPlus.vue'
import IconSearch from './IconSearch.vue'
import IconFilter from './IconFilter.vue'
import PropPaginator from './PropPaginator.vue'
import PropButtonIcon from './PropButtonIcon.vue'
import AdminRoleTable from './AdminRoleTable.vue'
import { useModal } from 'vue-final-modal'
import PopUpCreateEditRole from './PopUpCreateEditRole.vue'
import { useUserStore } from '@/stores/user'

const { privileges } = useUserStore()

const isLoading = ref(false)

const roleList = ref(null)

const getRoleList = async () => {
  try {
    isLoading.value = true
    roleList.value = null

    const response = await axios.get(`getrole`)

    if (response.status === 202) {
      roleList.value = response.data.Data
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error fetching Date:', error)
    isLoading.value = false
  }

  console.log(roleList.value)
}

const { open: openRoleCreate, close: closeRoleCreate } = useModal({
  component: PopUpCreateEditRole,
  attrs: {
    // edit: true,
    onConfirm(bool) {
      if (bool) {
        getRoleList()
      }
      closeRoleCreate()
    },
  },
})

onMounted(() => {
  getRoleList()
})
</script>

<template>
  <div class="flex justify-between items-center w-full p-4 mt-2.5">
    <div class="relative w-64 -ml-3">
      <IconSearch
        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
      />
      <input
        type="text"
        placeholder="Search...."
        class="w-full pl-10 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-mainColor"
      />
    </div>
    <div>
      <button
        class="w-30 mainBtn flex items-center justify-center gap-2 transition duration-300 rounded-md"
        @click="openRoleCreate()"
        v-if="privileges.can_create_role"
      >
        <IconPlus class="w-5 h-5" />
        <span class="hidden md:inline">Create Role</span>
      </button>
    </div>
    <div v-if="false" class="flex gap-2.5">
      <PropButtonIcon
        class="border-gray-400 text-black hover:bg-gray-100 transition"
        :icon-component="IconFilter"
        text="Filter"
      />
      <!-- <PropButtonIcon
        class="border-gray-400 text-black hover:bg-gray-100 transition"
        :icon-component="IconExport"
        text="Export"
      /> -->
    </div>
  </div>
  <div class="w-full overflow-hidden rounded-lg">
    <AdminRoleTable v-if="!isLoading && roleList" @refresh="getRoleList()" :admin-data="roleList" />

    <div v-else-if="isLoading" class="h-24 flex justify-center items-center bg-white">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
      ></div>
    </div>

    <!-- Updated Paginator implementation -->
    <!-- Improved Paginator implementation with original styling -->
    <PropPaginator
      v-if="roleList && !isLoading"
      :pagination="roleList"
      :limit="2"
      :keepLength="false"
      :showInfo="true"
      @page-changed="getRoleList"
    />
    <!--<PropTable :table-info="admin.slice(tableStart,tableEnd)" :can-view-info="true" />-->
  </div>
</template>
