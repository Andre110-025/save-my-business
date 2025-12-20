<script setup>
import { useUserStore } from '@/stores/user'
import { VueFinalModal } from 'vue-final-modal'
import { ref, reactive, useTemplateRef, onMounted, watchEffect } from 'vue'
import IconCancel from './IconCancel.vue'
import IconFile from './IconFile.vue'
import IconDownload from './IconDownloadFile.vue'
import IconUpload from './IconUpload.vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'

const { user } = useUserStore()

const emits = defineEmits(['confirm'])

// Tab management
const activeTab = ref('new') // 'new' for bulk product upload, 'update' for price update
const selectedFile = ref(null)
const isLoading = ref(false)

const anchorLink = useTemplateRef('new-product-file')
const downloadLink = ref(null)

const uploadData = reactive({
  user_type: user.userType,
  excel_file: null,
  created_by: user.userInfo.full_name,
  sku_id: 0,
  branch_id: user.branchId,
})

// Handle tab switch
const switchTab = (tab) => {
  activeTab.value = tab
  selectedFile.value = null
  uploadData.excel_file = ''
}

// Handle file selection
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  selectedFile.value = file

  // Convert file to base64
  const reader = new FileReader()
  reader.onload = (e) => {
    // Extract only the base64 part by removing the data URL prefix
    // Format is typically: data:[<mediatype>][;base64],<base64data>
    const base64WithPrefix = e.target.result
    const base64Data = base64WithPrefix.split(',')[1]
    uploadData.excel_file = base64Data
  }
  reader.readAsDataURL(file)
}

// Download current products spreadsheet for updates
const getDownloadLink = async () => {
  try {
    const { data } = await axios.get('downloadproducts', {
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

// Handle upload
const handleUpload = async () => {
  if (!selectedFile.value) {
    alert('Please select a file first')
    return
  }

  isLoading.value = true

  const endPoint = activeTab.value === 'new' ? 'addproductbulk' : 'editproductbulk'

  try {
    const { data, status } = await axios.post(endPoint, uploadData)

    console.log(data)

    if (status === 201 && (!data.Errors || !data.errors)) {
      if (activeTab.value === 'new') {
        toast.success('New Stock added Successfully', {
          position: toast.POSITION.TOP_CENTER,
        })

        emits('confirm', true)
      } else {
        toast.success('Product Prices Updated Successfully', {
          position: toast.POSITION.TOP_CENTER,
        })
      }

      emits('confirm', true)
    } else if (data.errors) {
      data.errors.forEach((element) => {
        toast.error(element, {
          position: toast.POSITION.TOP_CENTER,
        })
      })
    }
  } catch (error) {
    toast.error('An error was encountered while uploading file', {
      position: toast.POSITION.TOP_CENTER,
    })
  } finally {
    isLoading.value = false
  }
}

watchEffect(() => {
  if (anchorLink.value) {
    anchorLink.value.href = downloadLink.value
    anchorLink.value.setAttribute('download', 'current_products.xlsx')
  } else {
    // not mounted yet, or the element was unmounted (e.g. by v-if)
  }
})

onMounted(() => {
  getDownloadLink()
})
</script>

<template>
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-fit max-w-[600px] rounded-2xl flex flex-col shadow-lg overflow-hidden"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="true"
  >
    <div class="flex flex-row justify-between items-center p-5">
      <div class="flex flex-row items-center gap-3">
        <div
          class="w-10 h-10 bg-[rgba(5,113,108,0.1)] rounded-md flex items-center justify-center"
        >
          <IconFile />
        </div>
        <div class="flex flex-col">
          <h2 class="text-lg font-semibold">Bulk Product Management</h2>
          <p class="text-gray-600 text-sm">Upload or update product data in bulk</p>
        </div>
      </div>
      <button
        @click="emits('confirm')"
        type="button"
        class="border border-black rounded p-1 flex items-center justify-center"
      >
        <IconCancel color="black" class="w-5 h-5" />
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b">
      <button
        @click="switchTab('new')"
        class="flex-1 py-3 text-center font-medium text-sm rounded-none"
        :class="
          activeTab === 'new' ? 'text-mainColor border-b-2 border-mainColor' : 'text-gray-500'
        "
      >
        New Product Upload
      </button>
      <button
        @click="switchTab('update')"
        class="flex-1 py-3 text-center font-medium text-sm rounded-none"
        :class="
          activeTab === 'update' ? 'text-mainColor border-b-2 border-mainColor' : 'text-gray-500'
        "
      >
        Product Update
      </button>
    </div>

    <!-- Tab Content -->
    <div class="p-5">
      <!-- New Product Upload Tab -->
      <div v-if="activeTab === 'new'" class="space-y-4">
        <div class="text-sm">
          <p>Upload a spreadsheet with new product information.</p>
          <a
            href="/product_template.xlsx"
            download
            class="text-mainColor cursor-pointer font-medium inline-flex items-center mt-2"
          >
            <IconDownload />

            Download sample spreadsheet
          </a>
        </div>

        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            id="new-product-file"
            class="hidden"
            accept=".xlsx"
            @change="handleFileSelect"
          />
          <label
            for="new-product-file"
            class="cursor-pointer flex flex-col items-center justify-center"
          >
            <IconUpload />
            <span class="mt-2 block text-sm font-medium text-gray-700">
              {{ selectedFile && activeTab === 'new' ? selectedFile.name : 'Click to upload' }}
            </span>
            <span class="mt-1 block text-xs text-gray-500"> Excel files only (max. 10MB) </span>
          </label>
        </div>
      </div>

      <!-- Product Update Tab -->
      <div v-if="activeTab === 'update'" class="space-y-4">
        <div class="text-sm">
          <p>
            Update existing product prices or add new stock to product by uploading a spreadsheet.
          </p>
          <a
            class="text-mainColor cursor-pointer font-medium inline-flex items-center mt-2"
            type="button"
            ref="new-product-file"
          >
            <IconDownload />
            Download current products
          </a>
        </div>

        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            id="update-product-file"
            class="hidden"
            accept=".xlsx"
            @change="handleFileSelect"
          />
          <label
            for="update-product-file"
            class="cursor-pointer flex flex-col items-center justify-center"
          >
            <IconUpload />
            <span class="mt-2 block text-sm font-medium text-gray-700">
              {{ selectedFile && activeTab === 'update' ? selectedFile.name : 'Click to upload' }}
            </span>
            <span class="mt-1 block text-xs text-gray-500"> Excel files only (max. 10MB) </span>
          </label>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex justify-end p-4 gap-5 w-full bg-slate-100">
      <button @click="emits('confirm')" class="secondaryBtn">Cancel</button>
      <button
        @click="handleUpload"
        class="mainBtn flex items-center justify-center"
        :disabled="!selectedFile || isLoading"
      >
        <svg
          v-if="isLoading"
          class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {{ isLoading ? 'Uploading...' : 'Upload' }}
      </button>
    </div>
  </VueFinalModal>
</template>
