<script setup>
import axios from 'axios'
import { ref, watch, onMounted, useTemplateRef, reactive } from 'vue'
import IconSearch from '@/components/IconSearch.vue'
import IconPlus from '@/components/IconPlus.vue'
import IconFilter from '@/components/IconFilter.vue'
import IconExport from '@/components/IconExport.vue'
import PropPaginator from './PropPaginator.vue'
import PropFilter from './PropFilter.vue'
import PropButtonIcon from './PropButtonIcon.vue'
import PopupAddCustomer from './PopupAddCustomer.vue'
import PropTableMobile from './PropTableMobile.vue'
// import IconArrowBack from './IconArrowBack.vue'
import { useUserStore } from '@/stores/user'
import { useModal } from 'vue-final-modal'
import { useHelpers } from '@/helper'
import CustomerTable from './CustomerTable.vue'
import SearchBar from './SearchBar.vue'

const { user, privileges } = useUserStore()
const { formatDate } = useHelpers()
const isLoading = ref(false)
const searchTerm = ref('')
const showIncomeFilter = ref(false)

const WAT_TIMEZONE = 'Africa/Lagos'
// const getTodayWAT = () => {
//   const now = new Date()
//   return toZonedTime(now, WAT_TIMEZONE)
// }
const statusOptions = [
  {
    label: 'Purchase',
    value: '',
  },
  {
    label: 'Not Purchase',
    value: 'not_spent',
  },
]
// const customerFilter = reactive({
//   user_type: user.userType,
//   start: '01/01/2025',
//   end: formatDate(getTodayWAT()),
//   status: '',
// })
// Sample customer data
const customers = ref(null)
const showCustomerFilter = ref(false)

// this for the download features
const downloadLink = ref(null)
const anchorLink = useTemplateRef('customer-link')

const getCustomers = async (page = 1) => {
  try {
    isLoading.value = true
    customers.value = null

    const response = await axios.post('getCustomer', {
      user_type: user.userType,
      search: searchTerm.value,
      page,
    })

    if (response.status === 201) {
      customers.value = response.data['save type']
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error fetching metrics:', error)
    // Handle error state
    isLoading.value = false
  }
}

const { open: openAddUser, close: closeAddUser } = useModal({
  component: PopupAddCustomer,
  attrs: {
    // edit: true,
    onConfirm(bool) {
      if (bool) {
        getCustomers()
      }
      closeAddUser()
    },
  },
})

// watch for changes in the search term
let delaySearch = null
watch(searchTerm, (newValue) => {
  if (delaySearch) {
    clearTimeout(delaySearch)
  }
  delaySearch = setTimeout(() => {
    getCustomers(1)
    // Call the function or perform actions that should happen after the delay
  }, 1500) // Adjust the delay time in milliseconds as needed
})

onMounted(() => {
  getCustomers()
})

// this is what the parent is checking from
defineExpose({
  refreshCustomers: () => getCustomers(1),
})
</script>

<template>
  <div class="flex justify-between items-center w-full p-4 mt-2.5 max-xs:p-2 max-sm:hidden">
    <SearchBar v-model="searchTerm" />

    <div
      v-if="privileges.can_add_edit_customers"
      class="flex space-x-1 gap-1 justify-end max-xs:w-1/2"
    >
      <PropButtonIcon
        :icon-component="IconPlus"
        text="Add Customer"
        class="bg-mainColor text-white"
        @click="openAddUser"
      />
      <!-- <PropButtonIcon
        :icon-component="IconFilter"
        text="Filter"
        class="border border-gray-400 rounded-md text-black hover:bg-gray-100 transition D"
        @click="showCustomerFilter = true"
      /> -->
      <!-- <PropButtonIcon
        :icon-component="IconExport"
        text="Export"
        class="border border-gray-400 rounded-md text-black hover:bg-gray-100 transition D"
        @click="showCustomerFilter = true"
      /> -->
    </div>
  </div>

  <!-- Mobile Filtering -->
  <div class="flex justify-between sm:hidden py-4 px-4">
    <div class="relative w-full ">
      <IconSearch
        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
      />
      <input
        type="text"
        placeholder="Search...."
        v-model="searchTerm"
        class="w-full pl-10 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-mainColor"
      />
    </div>

    <div class="flex gap-1.5 justify-end max-[450px]:hidden">
      <PropButtonIcon
        :icon-component="IconFilter"
        class="border border-gray-400 text-black hover:bg-gray-100 transition"
        @click="showCustomerFilter = true"
      />
      <PropButtonIcon
        :icon-component="IconExport"
        class="border border-gray-400 text-black hover:bg-gray-100 transition"
        @click="showCustomerFilter = true"
      />
    </div>
  </div>

  <div class="relative">
    <PropFilter :filter-attrs="customerFilterAttributes" v-model:showFilter="showCustomerFilter" />
  </div>

  <!-- Desktop Table -->
  <div class="w-full overflow-hidden rounded-lg mt-4">
    <!--remove mt-4 when done-->
    <!-- Table -->
    <CustomerTable
      v-if="!isLoading && customers"
      @refresh="getCustomers()"
      :customers="customers.data"
    />

    <div v-else-if="isLoading" class="h-24 flex justify-center items-center bg-white">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
      ></div>
    </div>

    <!-- Updated Paginator implementation -->
    <PropPaginator
      v-if="customers && !isLoading"
      :pagination="customers"
      :show-info="true"
      @page-changed="getCustomers"
      :limit="2"
      :keepLength="false"
    />
  </div>

  <!-- Mobile Table -->
  <div class="w-full hidden">
    <PropTableMobile />
  </div>

  <div class="w-full overflow-hidden rounded-lg shadow bg-white mt-3"></div>
</template>
