<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import PropButtonIcon from './PropButtonIcon.vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import IconSearch from './IconSearch.vue'
import IconRestock from './IconRestock.vue'
import IconFilter from './IconFilter.vue'
import IconExport from './IconExport.vue'
import IconCancel from './IconCancel.vue'
import IconPlus from './IconPlus.vue'
// import PropTable from './PropTable.vue'
import InventoryTable from './InventoryTable.vue'
import PropPaginator from './PropPaginator.vue'
import IconCVS from './IconCVS.vue'
import PopupAddEditProduct from './PopupAddEditProduct.vue'
import PopUpBulkProduct from './PopUpBulkProduct.vue'
// import InventoryList from './InventoryList.vue'
// import InventoryRecords from './InventoryRecords.vue'
import { useModal } from 'vue-final-modal'

const { user, privileges } = useUserStore()
const isLoading = ref(false)
const searchTerm = ref('')
const showFilters = ref(false)
const state = ref('')
const prescription = ref('')
const isPrescription = ref(false) // New Boolean ref for checkbox state
const route = useRoute()
const router = useRouter()

const inventory = ref(null)
const filters = ['expiry', 'low stock', 'out of stock']

// Handle prescription checkbox change
const handlePrescriptionChange = () => {
  prescription.value = isPrescription.value ? 'true' : ''
}

// Clear all filters
const clearFilters = () => {
  state.value = ''
  prescription.value = ''
  isPrescription.value = false

  // Update URL to remove state parameter
  router.replace({
    query: { ...route.query, state: undefined },
  })
  getInventoryList()
}

// Apply filters and close filter panel
const applyFilters = () => {
  showFilters.value = false
  getInventoryList()
}

const getInventoryList = async (page = 1) => {
  try {
    isLoading.value = true
    inventory.value = null
    //searchSellingProductByOwner/owner?search=dangote&page=1
    const response = await axios.post(
      `searchSellingProductByOwner/${user.userType}?branch=${user.branchId}&state=${state.value}prescription=0&search=${searchTerm.value}&page=${page}`,
    )

    if (response.data.success) {
      inventory.value = response.data.products
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error fetching Data:', error)
    // Handle error state
    isLoading.value = false
  }
}

// watch for changes in the search term
let delaySearch = null
watch(searchTerm, (newValue) => {
  if (delaySearch) {
    clearTimeout(delaySearch)
  }
  delaySearch = setTimeout(() => {
    getInventoryList(1)
    // Call the function or perform actions that should happen after the delay
  }, 1500) // Adjust the delay time in milliseconds as needed
})

// Watch for route changes to handle state parameter updates
watch(
  () => route.query.state,
  (newState) => {
    if (newState !== undefined) {
      state.value = newState
    } else {
      state.value = ''
    }
    getInventoryList(1)
  },
)

const { open: openAddProduct, close: closeAddProduct } = useModal({
  component: PopupAddEditProduct,
  attrs: {
    // edit: true,
    onConfirm(bool) {
      if (bool) {
        getInventoryList()
      }
      closeAddProduct()
    },
  },
})

const { open: openBulkUpload, close: closeBulkUpload } = useModal({
  component: PopUpBulkProduct,
  attrs: {
    // edit: true,
    onConfirm(bool) {
      if (bool) {
        getInventoryList()
      }
      closeBulkUpload()
    },
  },
})

const handleUrlParams = () => {
  // Get URL parameters
  const stateParam = route.query.state

  if (stateParam) {
    // Set the state filter if it exists in our filters array
    if (filters.includes(stateParam)) {
      state.value = stateParam
    }

    // Apply filters
    // getInventoryList()
  }
}

// const activeTab = ref('allinventory')

// const showItem = (item) => {
//   activeTab.value = item
// }

onMounted(() => {
  handleUrlParams()
  getInventoryList()
})
</script>

<template>
  <!-- <header>
    <div>
      <h2 class="text-gray-900">Inventory</h2>
      <p class="mt-2.5">Monitor your stock level</p>
    </div>
  </header> -->
  <div class="flex flex-col md:flex-row justify-between items-start md:items-center w-full p-4 mt-2.5 gap-3">
    <div class="relative w-64 -ml-3">
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
        text="Add New product"
        class="bg-mainColor text-white"
        @click="openAddProduct()"
        v-if="privileges.can_add_products"
      />
      <!-- <button
        class="mainBtn flex items-center justify-center gap-2 transition duration-300 rounded-md"
      >
        <IconRestock class="w-5 h-5" />
        <span>Restock</span>
      </button> -->
      <button
        class="mainBtn flex items-center justify-center gap-2 transition duration-300 rounded-md"
        @click="openBulkUpload"
        v-if="privileges.can_add_bulk_products"
      >
        <IconCVS class="w-5 h-5" />
        <span class="hidden md:inline">Import CSV</span>
      </button>

      <div class="relative">
        <button
          class="flex items-center justify-center gap-2 border border-gray-400 rounded-md text-black hover:bg-gray-100 transition"
          @click="showFilters = !showFilters"
        >
          <IconFilter class="w-5 h-5" />
          <span class="hidden md:inline">Filter</span>
          <span v-if="state || prescription" class="ml-1 w-2 h-2 rounded-full bg-mainColor"></span>
        </button>
        <div
          v-if="showFilters"
          class="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
        >
          <div class="p-2">
            <div class="flex items-center justify-between mb-2">
              <p class="font-medium text-sm mb-2">Filter By</p>
              <button class="p-0" @click="showFilters = false">
                <IconCancel class="w-5 h-5" />
              </button>
            </div>
            <div class="space-y-1">
              <p class="text-xs text-gray-500 mb-1">Stock Status</p>
              <label
                v-for="(filter, index) in filters"
                :key="index"
                :for="filter"
                class="flex items-center text-sm cursor-pointer capitalize"
              >
                <input
                  type="radio"
                  :value="filter"
                  v-model="state"
                  :id="filter"
                  class="form-radio h-4 w-4 accent-mainColor mr-2"
                />
                {{ filter }}
              </label>

              <!-- <div class="border-t border-gray-200 my-2 pt-2">
                <p class="text-xs text-gray-500 mb-1">Type</p>
                <label for="prescription" class="flex items-center text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="isPrescription"
                    id="prescription"
                    class="form-checkbox h-4 w-4 accent-mainColor mr-2"
                    @change="handlePrescriptionChange"
                  />
                  Prescription Only
                </label>
              </div> -->
            </div>
            <div class="mt-3 flex justify-between">
              <button @click="clearFilters" class="text-xs text-gray-600 hover:text-gray-800">
                Clear all
              </button>
              <button
                @click="applyFilters"
                class="text-xs bg-mainColor/90 text-white px-3 py-1 rounded hover:bg-mainColor"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- <button
        class="flex items-center justify-center gap-2 border border-gray-400 rounded-md text-black hover:bg-gray-100 transition D"
      >
        <IconExport class="w-5 h-5" />
      </button> -->
    </div>
  </div>
  <div class="w-full overflow-hidden rounded-lg">
    <InventoryTable
      v-if="!isLoading && inventory"
      @refresh="getInventoryList()"
      :inventory-data="inventory.data"
    />

    <div v-else-if="isLoading" class="h-24 flex justify-center items-center bg-white">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
      ></div>
    </div>

    <!-- Updated Paginator implementation -->
    <PropPaginator
      v-if="inventory && !isLoading"
      :pagination="inventory"
      :show-info="true"
      @page-changed="getInventoryList"
      :limit="2"
      :keepLength="false"
    />
  </div>
</template>
