<script setup>
import { ref, onMounted, useTemplateRef, watchEffect } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import { useModal } from 'vue-final-modal'
import PopupReturnSale from './PopupReturnSale.vue'
import IconCheckCertificate from './IconCheckCertificate.vue'
import DynamicInput from './DynamicInput.vue'
import IconCancel from './IconCancel.vue'
import IconImage from './IconImage.vue'
import IconReturn from './IconReturn.vue'
import { useHelpers } from '@/helper'
import { useUserStore } from '@/stores/user'
import axios from 'axios'
import { toast } from 'vue3-toastify'

const { user, privileges } = useUserStore()

const { formatDateTime, formatTime } = useHelpers()

const props = defineProps({
  sales: {
    type: Object,
    default: () => ({}),
  },
})

const anchorLink = useTemplateRef('new-product-file')
const downloadLink = ref(null)

const emits = defineEmits(['confirm'])

const handleReturnItem = (item) => {
  const { open, close } = useModal({
    component: PopupReturnSale,
    attrs: {
      orderItem: item,
      onConfirm(bool) {
        if (bool) {
          downloadLink.value = null
          emits('confirm', true)
        }
        close()
      },
    },
  })

  open()
}

const getPdf = async () => {
  try {
    const { data } = await axios.get(
      `downloadinvoice/${props.sales.order_code}/${user.userType}/print`,
      {
        responseType: 'blob',
      },
    )

    // Create a blob from the Excel data
    const blob = new Blob([data], {
      type: 'application/pdf',
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
    anchorLink.value.download = `${props.sales.order_code}.pdf`
  }
})

onMounted(() => {
  getPdf()
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
      <!-- Sale Details Form Section -->
      <div class="flex flex-col p-6 w-2/5 max-[450px]:w-full max-[450px]:p-4">
        <div class="flex flex-row items-start gap-4 max-[450px]:gap-2">
          <div
            class="mt-1.5 w-10 h-10 bg-[rgba(5,113,108,0.1)] rounded-sm flex items-center justify-center max-[450px]:w-8 max-[450px]:h-8 max-[450px]:mt-0.5"
          >
            <IconCheckCertificate color="#05716c" class="max-[450px]:w-5 max-[450px]:h-5" />
          </div>
          <div class="flex flex-col justify-center">
            <h2 class="text-lg font-semibold max-[450px]:text-base">Sale Details</h2>
            <p class="text-gray-600 max-[450px]:text-sm">An overview of sales.</p>
          </div>
        </div>
        <form class="flex flex-col gap-2 mt-6 max-[450px]:mt-4 max-[450px]:gap-1.5">
          <DynamicInput
            label="Initiated By"
            type="text"
            v-model="sales.paymenthistory[0].staff_name"
            readonly
          />
          <DynamicInput
            v-if="sales.payment_status.toLowerCase() === 'paid'"
            label="Completed By"
            type="text"
            v-model="sales.paymenthistory[sales.paymenthistory.length - 1].staff_name"
            readonly
          />
          <DynamicInput
            class="mb-0"
            label="Customer Details"
            type="text"
            v-model="sales.customer"
            readonly
          />
          <DynamicInput
            v-if="sales.customer_email"
            type="text"
            v-model="sales.customer_email"
            readonly
          />
          <div v-if="sales.note">
            <label class="block mb-2 max-[450px]:text-sm max-[450px]:mb-1">Note</label>
            <textarea
              class="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor text-sm max-[450px]:text-xs max-[450px]:p-1.5"
              name=""
              id=""
              cols="30"
              rows="2"
              v-model="sales.note"
              readonly
            ></textarea>
          </div>
        </form>
      </div>

      <!-- Receipt Section -->
      <div class="bg-[#f7f8fa] flex-1 p-5 h-full rounded-tr-2xl rounded-br-2xl max-[450px]:p-4 max-[450px]:rounded-none max-[450px]:h-auto max-[450px]:border-t max-[450px]:border-gray-200">
        <div class="flex flex-col h-[560px] p-5 bg-white rounded-md shadow max-[450px]:h-auto max-[450px]:p-4">
          <div class="flex flex-row justify-between items-center max-[450px]:items-start">
            <div class="flex flex-col gap-1">
              <h4 class="text-sm font-semibold max-[450px]:text-xs">CUSTOMER RECEIPT</h4>
              <div class="flex flex-col gap-2.5 max-[450px]:gap-1.5">
                <p class="text-gray-500 text-sm max-[450px]:text-xs">Order {{ sales.order_code }}</p>
                <p class="text-gray-500 text-sm max-[450px]:text-xs">
                  {{ formatDateTime(sales.created_at) }} | {{ formatTime(sales.created_at) }}
                </p>
              </div>
            </div>
            <button
              @click="emits('confirm')"
              class="border border-black rounded p-1 flex items-center justify-center max-[450px]:p-0.5"
            >
              <IconCancel color="black" class="w-5 h-5 max-[450px]:w-4 max-[450px]:h-4" />
            </button>
          </div>
          
          <div
            class="mt-5 pt-2 pb-2 border-t-2 border-dotted border-gray-300 flex-1 overflow-y-auto max-[450px]:mt-3"
          >
            <!-- Table for order details -->
            <div class="w-full overflow-x-auto">
              <table class="w-full border-collapse">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-900 max-[450px]:px-2 max-[450px]:py-1.5 max-[450px]:text-xs">Product</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-900 max-[450px]:px-2 max-[450px]:py-1.5 max-[450px]:text-xs">Subtotal</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-900 max-[450px]:px-2 max-[450px]:py-1.5 max-[450px]:text-xs">Qty</th>
                    <th
                      v-if="privileges.can_return_sales_orders"
                      class="px-4 py-2 text-right text-sm font-medium text-gray-900 max-[450px]:px-2 max-[450px]:py-1.5 max-[450px]:text-xs max-[450px]:hidden"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in sales.orderdetails"
                    :key="item.id"
                    class="border-b border-gray-100"
                  >
                    <td class="px-4 py-3 text-sm max-[450px]:px-2 max-[450px]:py-2 max-[450px]:text-xs">
                      <div class="flex flex-row items-center gap-2 max-[450px]:gap-1">
                        <IconImage class="w-8 h-8 hidden" />
                        <p class="max-[450px]:line-clamp-2">{{ item.product_name }}</p>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm text-right text-gray-500 max-[450px]:px-2 max-[450px]:py-2 max-[450px]:text-xs">
                      {{
                        item.subtotal.toLocaleString('en-NG', {
                          style: 'currency',
                          currency: 'NGN',
                        })
                      }}
                    </td>
                    <td class="px-4 py-3 text-sm text-right text-gray-500 max-[450px]:px-2 max-[450px]:py-2 max-[450px]:text-xs">
                      {{ item.qty }}
                    </td>
                    <td
                      v-if="privileges.can_return_sales_orders"
                      class="px-4 py-3 text-sm text-right max-[450px]:hidden"
                    >
                      <button
                        @click="handleReturnItem(item)"
                        class="inline-flex items-center justify-center p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Return Item"
                        :disabled="item.qty <= 0"
                      >
                        <IconReturn />
                      </button>
                    </td>
                  </tr>
                  <!-- Mobile return button row -->
                  <tr v-if="privileges.can_return_sales_orders" class="hidden max-[450px]:table-row">
                    <td colspan="3" class="px-2 py-2">
                      <div class="flex flex-wrap gap-2">
                        <button
                          v-for="item in sales.orderdetails"
                          :key="'return-' + item.id"
                          @click="handleReturnItem(item)"
                          class="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200 transition-colors"
                          :disabled="item.qty <= 0"
                        >
                          Return {{ item.product_name }}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Summary section -->
            <div class="mt-4 grid grid-cols-2 gap-2 max-[450px]:gap-1.5 max-[450px]:mt-3">
              <div class="text-left font-medium max-[450px]:text-sm">TOTAL</div>
              <div class="text-right font-medium max-[450px]:text-sm">
                {{
                  sales.total_amount.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
                }}
              </div>

              <div class="text-left font-medium max-[450px]:text-sm">AMOUNT PAID</div>
              <div class="text-right font-medium max-[450px]:text-sm">
                {{
                  sales.amount_paid.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
                }}
              </div>
            </div>
          </div>

          <div>
            <a
              class="mt-8 w-full block text-center rounded-md px-5 py-2.5 text-sm mainBtn transition duration-300 max-[450px]:mt-4 max-[450px]:px-4 max-[450px]:py-2 max-[450px]:text-xs"
              ref="new-product-file"
              type="button"
            >
              Print Receipt
            </a>
          </div>
        </div>
      </div>
    </div>
  </VueFinalModal>
</template>
