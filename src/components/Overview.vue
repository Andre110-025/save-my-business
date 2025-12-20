<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import IconSearch from './IconSearch.vue'
import IconNotification from './IconNotification.vue'
import TheMobileMenu from './TheMobileMenu.vue'
import DateFilter from './DateFilter.vue'
import { useUserStore } from '@/stores/user'
import { useFormatCurrency } from '@/formatCurrency'
import ChartOrder from './ChartOrder.vue'
import ChartRevenueProfit from './ChartRevenueProfit.vue'
import { usePWAInstall } from '@/composables/usePWAInstall'
import IconIOS from './IconIOS.vue'
import IconAndroid from './IconAndroid.vue'
import IconDesktop from './IconDesktop.vue'

const { canInstall, installApp } = usePWAInstall()
const isMobile = ref(window.innerWidth < 450)

const handleResize = () => {
  isMobile.value = window.innerWidth < 450
}

const showDownloadBtn = ref(false)

onMounted(() => {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches

  if (!isPWA) {
    showDownloadBtn.value = true
  }
})
onMounted(() => {
  handleResize()

  if (isMobile.value) canInstall.value = true
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const { formatCurrency } = useFormatCurrency()

const { user } = useUserStore()

// Data and loading states
const isLoading = ref(false)

const dateRangeDate = reactive({
  start: '',
  end: '',
  user_type: user.userInfo.user_type,
})

// Sample data objects (would come from API)
const metrics = reactive({
  sales: 0,
  cost: 0,
  profit: 0,
  inStock: 0,
  stockValue: 0,
})

const orderData = ref(null)
const revenueProfitData = ref(null)

const topSelling = ref([])
const lowStock = ref([])
const topCustomers = ref([])
const slowestSelling = ref([])
const stockBrand = ref([])

const getMetrics = async () => {
  console.log('called')
  try {
    // Reset loading states
    isLoading.value = true

    // Fetch analytics data
    const response = await axios.post('getCustomersAnalytics', dateRangeDate)

    if (response.status == 201) {
      console.log(response)
      const data = response.data
      metrics.sales = data.sales_spent
      metrics.cost = data.sales_spent - data.profit
      metrics.profit = data.profit
      metrics.inStock = data.inventory_summary.total_in_stock
      metrics.stockValue = data.inventory_summary.value_of_stock
      topCustomers.value = data.customer_spent
      topSelling.value = data.top_sold_products
      slowestSelling.value = data.least_sold_products
      lowStock.value = data.low_quantity_stock
      stockBrand.value = data.stock_by_brand
      orderData.value = data.order_summary
      revenueProfitData.value = data.revenue_profit
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error fetching metrics:', error)
    // Handle error state
    isLoading.value = false
  }
}

const handleDateRangeChange = (range) => {
  // console.log(range)
  dateRangeDate.start = range.start
  dateRangeDate.end = range.end

  // Reload data with new date range
  getMetrics()
}

const formatShortNumber = (num) => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num
}

// const isMobile = ref(false);

// onMounted(() => {
//   const check = () => {
//     isMobile.value = window.innerWidth <= 450;
//   };
//   check();
//   window.addEventListener("resize", check);
// });
</script>

<template>
  <header>
    <!-- <div class="flex flex-row w-full sm:hidden justify-between items-center gap-2 py-4">
      <div class="relative w-2/3">
        <IconSearch
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search...."
          class="w-full pl-10 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-mainColor"
        />
      </div>
      <div class="rounded w-6 h-6">
        <IconNotification class="w-full h-full" :color="'#aaa'" />
      </div>
    </div> -->
    <div class="flex flex-row justify-between items-center" v-if="!isMobile">
      <div>
        <h2 class="text-gray-900 sm:text-gray-800">Dashboard</h2>
        <p class="mt-2.5 max-sm:hidden">An overview of your business performance</p>
        <p class="sm:hidden sm:text-gray-600">
          Here is a quick summary of what's happening with your business
        </p>
      </div>
      <div>
        <button
          v-if="canInstall && showDownloadBtn"
          @click="installApp"
          class="rounded-xl bg-mainColor mt-2.5 text-white py-3 font-semibold shadow-lg"
        >
          Install App
        </button>
      </div>
    </div>
    <div class="flex flex-col" v-if="isMobile">
      <div>
        <h6>Overview Dashboard</h6>
        <p class="sm:hidden sm:text-gray-600">
          Here is a quick summary of what's happening with your business<br />
        </p>
        <h5 v-if="showDownloadBtn" class="mt-3 text-mainColor">download the app now, anywhere</h5>
      </div>
      <div v-if="showDownloadBtn" class="flex flex-start gap-3">
        <button
          v-if="canInstall"
          @click="installApp"
          class="rounded-xl bg-mainColor mt-2.5 text-white py-3 font-semibold shadow-lg flex flex-row items-center gap-2"
          title="Download for ios"
        >
          <IconIOS class="w-5 h-5" />
          <span>IOS</span>
        </button>
        <button
          v-if="canInstall"
          @click="installApp"
          class="rounded-xl bg-mainColor mt-2.5 text-white py-3 font-semibold shadow-lg flex flex-row items-center gap-2"
          title="Download for Android"
        >
          <IconAndroid class="w-5 h-5" />
          <span>Android</span>
        </button>
        <button
          v-if="canInstall"
          @click="installApp"
          class="rounded-xl bg-mainColor mt-2.5 text-white py-3 font-semibold shadow-lg flex flex-row items-center gap-2"
          title="Download for desktop"
        >
          <IconDesktop />
          <span>Desktop</span>
        </button>
      </div>
    </div>
    <DateFilter @updateDateRange="handleDateRangeChange" />
  </header>

  <!-- Main loading indicator for entire dashboard -->

  <div class="grid grid-cols-5 gap-4 py-5 max-sm:flex max-sm:flex-col">
    <!-- Sales Summary -->
    <div class="col-span-3 bg-white p-4 rounded-xl shadow">
      <h5>Sales Overview</h5>
      <div v-if="isLoading" class="h-24 flex justify-center items-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
        ></div>
      </div>
      <div v-else class="grid grid-cols-3 gap-4 mt-5">
        <div>
          <p>Sales</p>
          <h4 class="text-mainColor">
            <!-- {{ formatCurrency(metrics.sales, 2, false) }} -->
            {{
              isMobile ? formatShortNumber(metrics.sales) : formatCurrency(metrics.sales, 2, false)
            }}
          </h4>
        </div>
        <div>
          <p>Cost</p>
          <h4 class="text-mainColor">
            {{
              isMobile ? formatShortNumber(metrics.cost) : formatCurrency(metrics.cost, 2, false)
            }}
          </h4>
        </div>
        <div>
          <p>Profit</p>
          <h4 class="text-mainColor">
            {{
              isMobile
                ? formatShortNumber(metrics.profit)
                : formatCurrency(metrics.profit, 2, false)
            }}
          </h4>
        </div>
      </div>
    </div>

    <!-- Inventory Summary -->
    <div class="col-span-2 bg-white p-4 rounded-xl shadow">
      <h5>Inventory Summary</h5>
      <div v-if="isLoading" class="h-24 flex justify-center items-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
        ></div>
      </div>
      <div v-else class="flex gap-4 mt-5">
        <div>
          <p>In Stock</p>
          <h4 class="text-mainColor">{{ metrics.inStock.toLocaleString() }}</h4>
        </div>
        <div class="flex-1">
          <p>Stock Value</p>
          <h4 class="text-mainColor">
            {{
              isMobile
                ? formatShortNumber(metrics.stockValue)
                : formatCurrency(metrics.stockValue, 2, false)
            }}
          </h4>
        </div>
      </div>
    </div>

    <!-- Top Selling Stock -->
    <div class="col-span-3 bg-white p-4 rounded-xl shadow">
      <div class="flex justify-between items-center mb-4">
        <h5>Top Selling Stock</h5>
        <RouterLink :to="{ name: 'topSellingProducts' }" class="text-mainColor">See All</RouterLink>
      </div>

      <div v-if="isLoading" class="h-32 flex justify-center items-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
        ></div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="text-left text-gray-500 text-sm *:font-medium">
              <th class="pb-3 pr-4">Name</th>
              <th class="pb-3 pr-4">Sold Qty</th>
              <th class="max-sm:hidden pb-3 pr-4">Remaining Qty</th>
              <th class="max-sm:hidden pb-3">Amount Sold</th>
              <th class="max-sm:hidden pb-3">Percentage</th>
            </tr>
          </thead>
          <tbody class="text-gray-500 text-sm">
            <tr v-for="(item, index) in topSelling" :key="index" class="border-t border-gray-100">
              <td class="py-3 pr-4" v-text="item.product_name"></td>
              <td class="py-3 pr-4" v-text="item.qty_lowest"></td>
              <td class="max-sm:hidden py-3 pr-4" v-text="item.qty_remaining_by_lowest"></td>
              <td class="max-sm:hidden py-3 text-end">
                ₦ {{ item.subtotal.toLocaleString() || '0' }}
              </td>
              <td class="max-sm:hidden py-3 text-end">{{ item.percentage }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Stock by Brand Summary -->
    <div class="col-span-2 flex flex-col bg-white p-4 rounded-xl shadow">
      <!-- Order summary content with loading state would go here -->
      <div class="flex justify-between items-center mb-4">
        <h5>Stock By Brand</h5>
        <RouterLink :to="{ name: 'InventoryByBrands' }" class="text-mainColor">See All</RouterLink>
      </div>
      <div
        v-if="isLoading"
        class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
      ></div>
      <!-- <ChartOrder v-else-if="!isLoading && orderData" :order-data="orderData" /> -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="text-left text-gray-500 text-sm *:font-medium">
              <th class="pb-3 pr-4">Brand Name</th>
              <th class="pb-3 max-sm:hidden pr-4">Product Quantity</th>
              <th class="pb-3 max-sm:hidden">Stock Value</th>
            </tr>
          </thead>
          <tbody class="text-gray-500 text-sm">
            <tr v-for="(item, index) in stockBrand" :key="index" class="border-t border-gray-100">
              <td class="py-3 pr-4" v-text="item.brand"></td>
              <td class="py-3 max-sm:hidden pr-4" v-text="item.product_count.toLocaleString()"></td>
              <td class="py-3 max-sm:hidden">₦ {{ item.stock_value.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Revenue and Profit -->
    <div class="col-span-3 flex flex-col bg-white p-4 rounded-xl shadow">
      <!-- Revenue chart with loading state would go here -->
      <h5>Revenue and Profit</h5>
      <div class="h-32 flex justify-center items-center flex-1">
        <div
          v-if="isLoading"
          class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
        ></div>
        <ChartRevenueProfit
          v-else-if="!isLoading && revenueProfitData"
          :revenueProfit="revenueProfitData"
        />
      </div>
    </div>

    <!-- Low Quantity Stock-->
    <div class="col-span-2 bg-white p-4 rounded-xl shadow">
      <div class="flex justify-between items-center mb-4">
        <h5>Low Quantity Stock</h5>
        <RouterLink
          :to="{ name: 'Inventory', query: { state: 'low stock' } }"
          class="text-mainColor"
          >See All</RouterLink
        >
      </div>

      <div v-if="isLoading" class="h-40 flex justify-center items-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
        ></div>
      </div>
      <div v-else class="space-y-4">
        <!-- Low Quantity Items -->
        <div
          v-for="(item, index) in lowStock"
          :key="index"
          class="flex items-center border-b border-gray-100 pb-4"
        >
          <div class="w-10 h-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
            <img
              :src="item.product_image || 'https://placehold.co/40'"
              :alt="item.product_name"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="ml-4 flex-grow">
            <p class="font-medium" v-text="item.product_name"></p>
            <p class="text-sm text-gray-500">
              Remaining Quantity: {{ item.qty_remaining_by_lowest }}
            </p>
          </div>
          <div class="ml-4">
            <span class="px-2 py-1 text-xs font-medium bg-red-50 text-red-500 rounded">Low</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Customers -->
    <div class="col-span-3 bg-white p-4 rounded-xl shadow">
      <div class="flex justify-between items-center mb-4">
        <h5>Top Customers</h5>
        <RouterLink
          :to="{ name: 'Customers', query: { type: 'topcustomer' } }"
          class="text-mainColor"
          >See All</RouterLink
        >
      </div>

      <div v-if="isLoading" class="h-40 flex justify-center items-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
        ></div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="text-left text-gray-500 text-sm *:font-medium">
              <th class="pb-3 pr-4">Customer Name</th>
              <!-- <th class="pb-3 pr-4">Email Address</th> -->
              <th class="pb-3 max-sm:hidden pr-4">Contact Number</th>
              <th class="pb-3 max-sm:hidden">Total Sales</th>
            </tr>
          </thead>
          <tbody class="text-gray-500 text-sm">
            <tr v-for="(item, index) in topCustomers" :key="index" class="border-t border-gray-100">
              <td class="py-3 pr-4" v-text="item.customer"></td>
              <!-- <td class="py-3 pr-4" v-text="item.customer_email"></td> -->
              <td class="py-3 max-sm:hidden pr-4" v-text="item.customer_number"></td>
              <td class="py-3 max-sm:hidden">₦ {{ item.total_amount.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Slowest Selling Products -->
    <div class="col-span-2 bg-white p-4 rounded-xl shadow">
      <div class="flex justify-between items-center mb-4">
        <h5>Slowest Selling Products</h5>
        <!-- <RouterLink :to="{ name: 'Inventory' }" class="text-mainColor">See All</RouterLink> -->
      </div>

      <div v-if="isLoading" class="h-40 flex justify-center items-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
        ></div>
      </div>
      <div v-else class="space-y-4">
        <!-- Slowest Selling Items -->
        <div
          v-for="(item, index) in slowestSelling"
          :key="index"
          class="flex items-center border-b border-gray-100 pb-4"
        >
          <div class="w-10 h-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
            <img
              :src="item.product_image || 'https://placehold.co/40'"
              :alt="item.product_name"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="ml-4 flex-grow">
            <p class="font-medium" v-text="item.product_name"></p>
            <p class="text-sm text-gray-500">Remaining Quantity: {{ item.qty_lowest }} Packet</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- <TheMobileMenu /> -->
</template>
