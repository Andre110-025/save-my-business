<script setup>
import { ref, reactive } from 'vue'
import { onMounted, onUnmounted } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import IconCheckCertificate from './IconCheckCertificate.vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useUserStore } from '@/stores/user'
import ProductSearch from './SaleProductSearch.vue'
import ReceiptView from './SaleReceiptView.vue'
import CustomerSale from './CustomerSale.vue'

const { user } = useUserStore()

const isLoading = ref(false)
const selectedSale = ref([])
const currentView = ref('first')
const currentTime = ref(getCurrentTime())
const customerView = ref('search')
const selectedCustomer = ref(null)

// Sale data structure
const saleData = reactive({
  customer: 'Falana',
  customer_id: null,
  tax: 0,
  total_amount: 0,
  payment_status: 'unpaid',
  payment_mode: 'credit',
  amount_paid: 0,
  note: '',
  branch_id: user.branchId,
  account_id: user.account,
  user_type: user.userType,
  allproducts: {
    product: [],
  },
})

const emits = defineEmits(['confirm'])

const goToCustomerSomething = () => {
  if (selectedSale.value.length === 0) {
    toast.error('Please add at least one product to the sale')
    return
  }
  prepareSaleData()
  currentView.value = 'second'
}

function getCurrentTime() {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

let interval
onMounted(() => {
  interval = setInterval(() => {
    currentTime.value = getCurrentTime()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})

const initializeSelected = (productData) => {
  const { item, availableQty } = productData

  if (availableQty === 0) {
    toast.error('No Stock available for this product.')
    return
  }

  const existingProduct = selectedSale.value.find((product) => product.product_id === item.id)
  if (existingProduct) {
    toast.error('Product already selected.')
    return
  }

  const data = {
    product_id: item.id,
    product_name: item.product_name,
    unit_type: item.sku[0].purchase_unit_type,
    qty: 1,
    qty_by_lowest: 1,
    max: availableQty,
    discount: 0,
    subtotal: 0,
    profit: 0,
    wholesale_price: item.sku[0].skusale[0].whole_sale_amount,
    retail_price: item.sku[0].skusale[0].unit_amount,
    cost_price: item.sku[0].skusale[0].unit_cost_price,
  }

  selectedSale.value.push(data)
}

const deleteSelect = (index) => {
  selectedSale.value.splice(index, 1)
}

const updateTax = (taxPercentage) => {
  saleData.tax = taxPercentage
}

const calculateTotal = () => {
  if (!selectedSale.value.length) return 0

  return selectedSale.value.reduce((total, item) => {
    const price = item.qty > 1 && item.wholesale_price ? item.wholesale_price : item.retail_price
    return total + price * item.qty
  }, 0)
}

const prepareSaleData = () => {
  const totalAmount = calculateTotal()
  saleData.total_amount = totalAmount

  saleData.allproducts.product = selectedSale.value.map((item) => {
    const price = item.qty > 1 && item.wholesale_price ? item.wholesale_price : item.retail_price
    const subtotal = price * item.qty
    const costTotal = item.cost_price * item.qty
    const profit = subtotal - costTotal

    return {
      product_id: item.product_id,
      product_name: item.product_name,
      unit_type: item.unit_type,
      qty: item.qty,
      qty_by_lowest: item.qty,
      discount: item.discount || 0,
      subtotal: subtotal,
      profit: profit,
    }
  })

  return saleData
}

const selectCustomer = (customer) => {
  selectedCustomer.value = customer
  saleData.customer = customer.name
  saleData.customer_id = `${customer.id}`
  toast.success(`Customer ${customer.name} selected`)
}

const completeSale = async () => {
  const finalSaleData = prepareSaleData()
  console.log('Final sale data:', finalSaleData)

  try {
    isLoading.value = true
    const response = await axios.post('makeSales', finalSaleData)

    if (response.status === 200 || response.status === 201) {
      toast.success('Sale completed successfully')
    }
  } catch (error) {
    console.error('Error completing sale', error)
    toast.error('Error completing sale')
  }
  emits('confirm', true)
}
</script>

<template>
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-[600px] max-w-[940px] rounded-2xl shadow-lg max-[450px]:h-full max-[450px]:max-w-full max-[450px]:rounded-none"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="true"
  >
    <div class="flex w-full h-full max-[450px]:flex-col">
      <!-- FIRST VIEW: Product Selection + Receipt -->
      <div v-if="currentView === 'first'" class="flex w-full h-full max-[450px]:flex-col">
        <!-- Product Search Section -->
        <div class="flex-1 flex flex-col p-6 max-[450px]:p-4 max-[450px]:pb-0">
          <div class="flex flex-row items-start gap-4 max-[450px]:gap-2">
            <div
              class="mt-1.5 w-10 h-10 bg-[rgba(5,113,108,0.1)] rounded-sm flex items-center justify-center max-[450px]:w-8 max-[450px]:h-8 max-[450px]:mt-0.5"
            >
              <IconCheckCertificate color="#05716c" class="max-[450px]:w-5 max-[450px]:h-5" />
            </div>
            <div class="flex flex-col justify-center">
              <h2 class="text-lg font-semibold max-[450px]:text-base">Make a Sale</h2>
              <p class="text-gray-600 max-[450px]:text-sm">Select from your stock to make sales easily.</p>
            </div>
          </div>

          <ProductSearch
            :userType="user.userType"
            :userBranch="user.branchId"
            @select-product="initializeSelected"
          />
        </div>

        <!-- Receipt View Section -->
        <div class="bg-[#f7f8fa] flex-1 p-5 rounded-tr-2xl rounded-br-2xl max-[450px]:p-4 max-[450px]:rounded-none max-[450px]:border-t max-[450px]:border-gray-200">
          <ReceiptView
            :selectedItems="selectedSale"
            :currentTime="currentTime"
            :initialTaxEnabled="false"
            @close="emits('confirm')"
            @delete-item="deleteSelect"
            @update-tax="updateTax"
          />

          <button
            @click="goToCustomerSomething"
            class="mt-2.5 w-full mainBtn transition duration-300"
            type="submit"
          >
            Complete Sale
          </button>
        </div>
      </div>

      <!-- SECOND VIEW: Customer Selection + Payment -->
      <div v-if="currentView === 'second'" class="flex w-full h-full max-[450px]:flex-col-reverse">
        <!-- Receipt Summary (Left on desktop, Bottom on mobile) -->
        <div class="bg-[#f7f8fa] flex-1 p-5 h-[599px] rounded-tl-2xl rounded-bl-2xl max-[450px]:h-auto max-[450px]:p-4 max-[450px]:rounded-none max-[450px]:border-t max-[450px]:border-gray-200">
          <ReceiptView
            :selectedItems="selectedSale"
            :currentTime="currentTime"
            :updatable="false"
            :initialTaxEnabled="saleData.tax > 0"
            @close="emits('confirm')"
          />
        </div>

        <!-- Customer & Payment Section (Right on desktop, Top on mobile) -->
        <div class="w-1/2 p-6 flex flex-1 h-600px flex-col max-[450px]:w-full max-[450px]:p-4">
          <div class="flex flex-row justify-between items-center mb-4 max-[450px]:mb-3">
            <div class="flex flex-row gap-3 max-[450px]:gap-2">
              <div
                class="mt-1.5 w-10 h-10 bg-[rgba(5,113,108,0.1)] rounded-sm flex items-center justify-center max-[450px]:w-8 max-[450px]:h-8 max-[450px]:mt-0.5"
              >
                <IconCheckCertificate color="#05716c" class="max-[450px]:w-5 max-[450px]:h-5" />
              </div>
              <div class="flex flex-col justify-center">
                <h2 class="text-lg font-semibold max-[450px]:text-base">
                  {{ selectedCustomer ? 'Complete Sale' : 'Select Customer' }}
                </h2>
                <p class="text-gray-600 max-[450px]:text-sm max-[450px]:hidden">
                  {{
                    selectedCustomer
                      ? 'Finalize payment details'
                      : 'Choose a customer for this sale'
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- Customer Management Area -->
          <div class="flex-1 max-[450px]:overflow-y-auto">
            <!-- Customer Search -->
            <div v-if="!selectedCustomer" class="h-full">
              <CustomerSale v-if="customerView === 'search'" @select-customer="selectCustomer" />
            </div>

            <!-- Selected Customer & Complete Sale -->
            <div v-else class="h-full flex flex-col">
              <div class="bg-gray-50 p-4 rounded-lg mb-4 max-[450px]:p-3">
                <div class="flex flex-col gap-2.5 max-[450px]:gap-2">
                  <div>
                    <h3 class="font-medium max-[450px]:text-sm">Selected Customer</h3>
                    <p class="text-gray-600 max-[450px]:text-sm">{{ selectedCustomer.name }}</p>
                    <p class="text-sm text-gray-500 max-[450px]:text-xs">{{ selectedCustomer.phone }}</p>
                    <p v-if="selectedCustomer.email" class="text-sm text-gray-500 max-[450px]:text-xs">
                      {{ selectedCustomer.email }}
                    </p>
                  </div>

                  <textarea
                    class="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor text-sm max-[450px]:text-xs"
                    name=""
                    id=""
                    cols="30"
                    rows="2"
                    placeholder="Enter a note (Optional)"
                    v-model="saleData.note"
                  ></textarea>
                </div>
              </div>

              <button
                @click="completeSale"
                :disabled="isLoading"
                class="w-full mainBtn flex items-center justify-center transition duration-300 rounded-md max-[450px]:py-3"
              >
                <IconCheckCertificate class="w-5 h-5 max-[450px]:w-4 max-[450px]:h-4" color="#ffffff" />
                <span class="max-[450px]:text-sm">End Sale</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VueFinalModal>
</template>