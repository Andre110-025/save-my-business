<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import IconPlus from './IconPlus.vue'
import IconSearch from './IconSearch.vue'
import IconFilter from './IconFilter.vue'
import PropPaginator from './PropPaginator.vue'
import PropButtonIcon from './PropButtonIcon.vue'
import AdminTable from './AdminTable.vue'
import { useModal } from 'vue-final-modal'
import PopUpCreateAdmin from './PopUpCreateAdmin.vue'
import { useUserStore } from '@/stores/user'

const { privileges } = useUserStore()

//button for sales and salesReturn
const activeTab = ref('admins')

const showItem = (item) => {
  activeTab.value = item
}

const isLoading = ref(false)
const searchTerm = ref('')

const administrationList = ref(null)

const getAdministrationList = async (page = 1) => {
  try {
    isLoading.value = true
    administrationList.value = null

    const response = await axios.get(`getStoreStaffByOwner?search=${searchTerm.value}&page=${page}`)

    if (response.data.success) {
      administrationList.value = response.data['all Staffs']
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error fetching Date:', error)
    isLoading.value = false
  }

  // console.log(administrationList.value)
}

let delaySearch = null
watch(searchTerm, (newValue) => {
  if (delaySearch) {
    clearTimeout(delaySearch)
  }
  delaySearch = setTimeout(() => {
    getAdministrationList(1)
  }, 1500)
})

const { open: openAdminCreate, close: closeAdminCreate } = useModal({
  component: PopUpCreateAdmin,
  attrs: {
    // edit: true,
    onConfirm(bool) {
      if (bool) {
        getAdministrationList()
      }
      closeAdminCreate()
    },
  },
})

onMounted(() => {
  getAdministrationList()
})
</script>

<template>
  <div class="flex justify-between items-center w-full p-4 mt-2.5">
    <div class="relative w-64 -ml-3">
      <IconSearch
        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
      />
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search...."
        class="w-full pl-10 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-mainColor"
      />
    </div>
    <div>
      <button
        class="w-30 mainBtn flex items-center justify-center gap-2 transition duration-300 rounded-md"
        @click="openAdminCreate()"
        v-if="privileges.add_delete_staff"
      >
        <IconPlus class="w-5 h-5" />
        <span class="hidden md:inline">Invite User</span>
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
    <AdminTable
      v-if="!isLoading && administrationList"
      @refresh="getAdministrationList()"
      :admin-data="administrationList.data"
    />

    <div v-else-if="isLoading" class="h-24 flex justify-center items-center bg-white">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
      ></div>
    </div>

    <!-- Updated Paginator implementation -->
    <!-- Improved Paginator implementation with original styling -->
    <PropPaginator
      v-if="administrationList && !isLoading"
      :pagination="administrationList"
      :limit="2"
      :keepLength="false"
      :showInfo="true"
      @page-changed="getAdministrationList"
    />
    <!--<PropTable :table-info="admin.slice(tableStart,tableEnd)" :can-view-info="true" />-->
  </div>
</template>
