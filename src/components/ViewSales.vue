<script setup>
import { ref, onBeforeMount } from 'vue'
import SaleList from './SaleList.vue'
import SalesReturnList from './SalesReturnList.vue'
import SaleCreditList from './SaleCreditList.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

//button for sales and salesReturn
const activeTab = ref('sales')

const showItem = (item) => {
  activeTab.value = item
}

const handleUrlParams = () => {
  // Get URL parameters
  const typeParam = route.query.type

  if (typeParam) {
    // Set the state filter if it exists in our filters array
    if (['creditSales', 'sales', 'salesReturn'].includes(typeParam)) {
      activeTab.value = typeParam
      // Apply filters
    }
    // getInventoryList()
  }
}

onBeforeMount(() => {
  handleUrlParams()
  // getInventoryList()
})
</script>

<template>
  <header>
    <div>
      <h2 class="text-gray-900">Sales</h2>
      <p class="mt-2.5">Attend to customer orders</p>
    </div>
  </header>
  <!-- _______________________________________ Pre Tab ______________________________________ -->
  <div class="mt-2.5 flex flex-row items-start justify-center md:justify-start space-x-4">
    <button
      class="mt-2.5 relative pb-2"
      :class="activeTab === 'sales' ? 'text-mainColor font-semibold' : 'text-gray-500'"
      @click="showItem('sales')"
    >
      All Sales
      <span
        v-if="activeTab === 'sales'"
        class="absolute left-0 right-0 -bottom-1 h-[2px] bg-mainColor w-3/4 mx-auto"
      ></span>
    </button>

    <button
      class="mt-2.5 relative pb-2"
      :class="activeTab === 'creditSales' ? 'text-mainColor font-semibold' : 'text-gray-500'"
      @click="showItem('creditSales')"
    >
      Credit Sales
      <span
        v-if="activeTab === 'creditSales'"
        class="absolute left-0 right-0 -bottom-1 h-[2px] bg-mainColor w-3/4 mx-auto"
      ></span>
    </button>

    <button
      class="mt-2.5 relative pb-2"
      :class="activeTab === 'salesReturn' ? 'text-mainColor font-semibold' : 'text-gray-500'"
      @click="showItem('salesReturn')"
    >
      Sales Return
      <span
        v-if="activeTab === 'salesReturn'"
        class="absolute left-0 right-0 -bottom-1 h-[2px] bg-mainColor w-3/4 mx-auto"
      ></span>
    </button>
  </div>
  <!-- </div> -->

  <!-- _____________________________________ Tab 1 Sales _____________________________________ -->
  <SaleList v-if="activeTab === 'sales'" />

  <SaleCreditList v-else-if="activeTab === 'creditSales'" />

  <!-- _________________________________ Tab 2 Sales Return __________________________________ -->
  <SalesReturnList v-else-if="activeTab === 'salesReturn'" />
</template>
