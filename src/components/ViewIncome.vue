<script setup>
import { ref, reactive, onMounted } from 'vue'
import IconArrowUp from './IconArrowUp.vue'
import IconExport from './IconExport.vue'
import IconFilter from './IconFilter.vue'
import PropPaginator from './PropPaginator.vue'
import IncomeTable from './IncomeTable.vue'
import PropFilter from './PropFilter.vue'
import PropButtonIcon from './PropButtonIcon.vue'
import PropTableMobile from './PropTableMobile.vue'
// import SearchBar from './SearchBar.vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { useFormatCurrency } from '@/formatCurrency'
import { useHelpers } from '@/helper'
import { toZonedTime } from 'date-fns-tz'

const { formatCurrency } = useFormatCurrency()
const { formatDate } = useHelpers()

const { user } = useUserStore()

// Set WAT time zone
const WAT_TIMEZONE = 'Africa/Lagos'

// Helper to get today in WAT
const getTodayWAT = () => {
  const now = new Date()
  return toZonedTime(now, WAT_TIMEZONE)
}

// Sample income data
const incomeList = ref(null)
const incomeMetrics = ref({
  total_cost_price: 0,
  total_selling_price: 0,
  total_profit: 0,
  total_owed_by_customer: 0,
  direction: 'decreased',
  percentage: '0',
})
const isLoading = ref(false)
const searchTerm = ref('')

const incomeFilter = reactive({
  user_type: user.userType,
  start: '01/01/2025',
  end: formatDate(getTodayWAT()),
})

const getIncomeList = async (page = 1) => {
  try {
    isLoading.value = true
    incomeList.value = null

    const response = await axios.post(`incomeretuns?page=${page}`, incomeFilter)

    if (response.status === 201 && response.data.success) {
      incomeMetrics.value = response.data.totals
      incomeList.value = response.data.IncomeList
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error fetching metrics:', error)
    // Handle error state
    isLoading.value = false
  }
}

const showIncomeFilter = ref(false)

const updateDate = (date) => {
  incomeFilter.start = date.start
  incomeFilter.end = date.end
  getIncomeList()
}

onMounted(() => {
  getIncomeList()
})

const formatShortNumber = (num) => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num;
};

const isMobile = ref(false);

onMounted(() => {
  const check = () => {
    isMobile.value = window.innerWidth <= 450;  
  };
  check();
  window.addEventListener("resize", check);
});
</script>

<template>
  <header>
    <div class="max-sm:flex max-sm:justify-between max-sm:items-center max-sm:pb-4 relative">
      <h2 class="text-gray-900 text-lg max-sm:h-fit max-sm:w-full max-sm:text-center">Income</h2>
      <p class="mt-2.5 max-sm:hidden">Manage Your business Customer</p>
    </div>
  </header>

  <!-- Cards -->
  <div class="flex items-center justify-between space-x-4 py-4 overflow-x-auto">
    <div
      class="min-w-60 flex-1 p-4 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)] rounded-lg flex flex-col"
    >
      <p>Total Income</p>
      <div class="flex flex-row items-center justify-between">
        <div class="flex flex-row items-end space-x-2">
          <h4 class="text-mainColor leading-none font-bold">
            {{ isMobile ? formatShortNumber(incomeMetrics.total_profit) : formatCurrency(incomeMetrics?.total_profit || 0, 2, false) }}
          </h4>
          <!-- <h6 class="text-xs font-bold">from ₦2.97M</h6> -->
        </div>

        <div
          class="w-fit h-6 rounded-full flex flex-row items-center justify-center p-2"
          :class="{
            'bg-green-200': incomeMetrics?.direction === 'increased',
            'bg-red-200': incomeMetrics?.direction === 'decreased',
          }"
        >
          <IconArrowUp
            :class="{
              'rotate-180 stroke-red-700': incomeMetrics?.direction === 'decreased',
              'green-red-700': incomeMetrics?.direction === 'decreased',
            }"
            class="w-2"
          />
          <h6
            class="text-[8px] font-bold"
            :class="{
              'text-green-700': incomeMetrics?.direction === 'increased',
              'text-red-700': incomeMetrics?.direction === 'decreased',
            }"
          >
            {{ incomeMetrics.percentage }}%
          </h6>
        </div>
      </div>
    </div>
    <div
      class="min-w-60 flex-1 p-4 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)] rounded-lg flex flex-col"
    >
      <p>Total Cost Price</p>
      <div class="flex flex-row items-center justify-between">
        <div class="flex flex-row items-end space-x-2">
          <h4 class="text-mainColor leading-none font-bold">
            {{ isMobile ? formatShortNumber(incomeMetrics.total_cost_price) : formatCurrency(incomeMetrics?.total_cost_price || 0, 2, false) }}
          </h4>
          <!-- <h6 class="text-xs font-bold">from ₦2.97M</h6> -->
        </div>

        <div
          class="w-12 h-6 bg-[#c7fde5] rounded-full flex flex-row items-center justify-center p-2"
          v-if="false"
        >
          <IconArrowUp class="w-3" />
          <h6 class="text-[#165941] font-bold text-xs">12%</h6>
        </div>
      </div>
    </div>
    <div
      class="min-w-60 flex-1 p-4 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)] rounded-lg flex flex-col"
    >
      <p>Total Selling Price</p>
      <div class="flex flex-row items-center justify-between">
        <div class="flex flex-row items-end space-x-2">
          <h4 class="text-mainColor leading-none font-bold">
            {{ isMobile ? formatShortNumber(incomeMetrics.total_selling_price) : formatCurrency(incomeMetrics?.total_selling_price || 0, 2, false) }}
          </h4>
          <!-- <h6 class="text-xs font-bold">from ₦2.97M</h6> -->
        </div>

        <div
          class="w-12 h-6 bg-[#c7fde5] rounded-full flex flex-row items-center justify-center p-2"
          v-if="false"
        >
          <IconArrowUp class="w-3" />
          <h6 class="text-[#165941] font-bold text-xs">12%</h6>
        </div>
      </div>
    </div>

    <div
      class="min-w-60 flex-1 p-4 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)] rounded-lg flex flex-col"
    >
      <p>Total Amount Owed</p>
      <div class="flex flex-row items-center justify-between">
        <div class="flex flex-row items-end space-x-2">
          <h4 class="text-mainColor leading-none font-bold">
            {{ isMobile ? formatShortNumber(incomeMetrics.total_owed_by_customer) : formatCurrency(incomeMetrics?.total_owed_by_customer || 0, 2, false) }}
          </h4>
          <!-- <h6 class="text-xs font-bold">from ₦2.97M</h6> -->
        </div>

        <div
          class="w-12 h-6 bg-[#c7fde5] rounded-full flex flex-row items-center justify-center p-2"
          v-if="false"
        >
          <IconArrowUp class="w-3" />
          <h6 class="text-[#165941] font-bold text-xs">12%</h6>
        </div>
      </div>
    </div>
  </div>

  <!-- Desktop Filter Section -->
  <div class="flex justify-end items-center w-full p-4 mt-2.5 max-xs:p-2">
    <!-- <SearchBar v-model="searchTerm" /> -->

    <div class="flex gap-2.5 justify-end">
      <PropButtonIcon
        class="border-gray-400 text-black hover:bg-gray-100 transition"
        :icon-component="IconFilter"
        text="Filter Date"
        @click="showIncomeFilter = true"
      />
      <!-- <PropButtonIcon
        class="border-gray-400 text-black hover:bg-gray-100 transition"
        :icon-component="IconExport"
        text="Export"
        @click="showIncomeFilter = true"
      /> -->
    </div>
  </div>

  <!-- Filter Popup -->
  <div class="relative">
    <PropFilter
      :dateFilter="incomeFilter"
      v-model:showFilter="showIncomeFilter"
      @changeDate="updateDate"
    />
  </div>

  <div class="w-full overflow-hidden rounded-lg shadow">
    <!--incase you fucked something up you removed this class="w-full"-->
    <IncomeTable :incomes="incomeList.data" v-if="!isLoading && incomeList" />

    <div v-else-if="isLoading" class="h-24 flex justify-center items-center bg-white">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
      ></div>
    </div>

    <PropPaginator
      v-if="incomeList && !isLoading"
      :pagination="incomeList"
      :show-info="true"
      @page-changed="getIncomeList"
      :limit="2"
      :keepLength="false"
    />
  </div>

  <div v-if="false" class="w-full">
    <PropTableMobile />
  </div>
</template>
