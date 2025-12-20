<script setup>
import { ref, reactive, watch, watchEffect, useTemplateRef, onMounted } from 'vue'
import PropPaginator from './PropPaginator.vue'
import axios from 'axios'
import SearchBar from './SearchBar.vue'
import PopupMakeSale from './PopupMakeSale.vue'
import IconPlus from './IconPlus.vue'
import IconFilter from './IconFilter.vue'
import IconExport from './IconExport.vue'
import PropFilter from './PropFilter.vue'
import SalesTable from './SalesTable.vue'
import { useUserStore } from '@/stores/user'
import PropButtonIcon from './PropButtonIcon.vue'
import { useModal } from 'vue-final-modal'

const { user, privileges } = useUserStore()

const isLoading = ref(false)
const searchTerm = ref('')
const showFilter = ref(false)

const anchorLink = useTemplateRef('sales-list')
const downloadLink = ref(null)

const sales = ref(null)

const dataFilter = reactive({
  start: '',
  end: '',
  status: '',
})

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const getSalesList = async (page = 1) => {
  try {
    isLoading.value = true
    sales.value = null

    const response = await axios.post(
      `searchtransactionsByOwner/${user.userType}?branch_id=${user.branchId}&search=${searchTerm.value}&status=${dataFilter.status}&start=${dataFilter.start}&end=${dataFilter.end}&page=${page}`,
    )

    if (response.data.success) {
      sales.value = response.data.transactions
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error fetching metrics:', error)
    // Handle error state
    isLoading.value = false
  }
}

const updateDate = (date) => {
  dataFilter.start = date.start
  dataFilter.end = date.end
  dataFilter.status = date.status
  // console.log('date', date)
  getSalesList()
}

// watch for changes in the search term
let delaySearch = null
watch(searchTerm, (newValue) => {
  if (delaySearch) {
    clearTimeout(delaySearch)
  }
  delaySearch = setTimeout(() => {
    getSalesList(1)
    // Call the function or perform actions that should happen after the delay
  }, 1500) // Adjust the delay time in milliseconds as needed
})

const { open: openMakeSale, close: closeMakeSale } = useModal({
  component: PopupMakeSale,
  attrs: {
    // edit: true,
    onConfirm(bool) {
      if (bool) {
        getSalesList()
      }
      closeMakeSale()
    },
  },
})

const getSaleData = async () => {
  try {
    const { data } = await axios.get(`downloadsales`, {
      responseType: 'blob',
    })

    // Create a blob from the Excel data
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob)

    // Set the download link
    downloadLink.value = url
  } catch (error) {
    console.error('Error getting file:', error)
  }
}

watchEffect(() => {
  if (downloadLink.value) {
    anchorLink.value.href = downloadLink.value
    anchorLink.value.download = `salesList.xlsx`
  }
})

onMounted(() => {
  getSalesList()
  getSaleData()
})
</script>

<template>
  <div>
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center w-full p-4 mt-2.5 gap-3"
    >
      <div class="relative w-full md:w-auto">
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

      <div class="flex flex-wrap md:flex-nowrap items-center gap-2.5">
        <PropButtonIcon
          :icon-component="IconPlus"
          text="Make a Sale"
          class="bg-mainColor text-white"
          @click="openMakeSale()"
          v-if="privileges.can_make_sales"
        />

        <PropButtonIcon
          class="border-gray-400 text-black hover:bg-gray-100 transition"
          :icon-component="IconFilter"
          text="Filter"
          @click="showFilter = true"
        />

        <a
          class="flex flex-row gap-2 rounded-md px-5 py-2.5 text-sm border-gray-400 text-black hover:bg-gray-100 transition secondaryBtn justify-center items-center"
          ref="sales-list"
          type="button"
        >
          <IconExport class="h-4 w-4" />
          <p class="h-fit max-md:hidden p-0 m-0">Export</p>
        </a>
      </div>
    </div>

    <!-- Filter Popup -->
    <div class="relative">
      <PropFilter
        :dateFilter="dataFilter"
        v-model:showFilter="showFilter"
        :show-status="true"
        :options="statusOptions"
        @changeDate="updateDate"
      />
    </div>
    <div class="w-full overflow-hidden rounded-lg">
      <SalesTable v-if="!isLoading && sales" @refresh="getSalesList" :sales="sales.data" />

      <div v-else-if="isLoading" class="h-24 flex justify-center items-center bg-white">
        <div
          class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
        ></div>
      </div>

      <!-- Updated Paginator implementation -->
      <PropPaginator
        v-if="sales && !isLoading"
        :pagination="sales"
        :show-info="true"
        @page-changed="getSalesList"
        :limit="2"
        :keepLength="false"
      />
    </div>
    <div class="w-full overflow-hidden rounded-lg shadow bg-white mt-3"></div>
  </div>
</template>
