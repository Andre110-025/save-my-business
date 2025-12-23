<script setup>
import { ref, onMounted, watch } from 'vue'
import InventoryList from './InventoryList.vue'
import InventoryRecords from './InventoryRecords.vue'
import { useModal } from 'vue-final-modal'


const activeTab = ref('allinventory')

const showItem = (item) => {
  activeTab.value = item
}
</script>

<template>
  <header>
    <div>
      <h2 class="text-gray-900">Inventory</h2>
      <p class="mt-2.5">Monitor your stock level</p>
    </div>
  </header>

  <!-- _______________________________________ Pre Tab ______________________________________ -->
   <div class="mt-2.5 flex flex-row items-start justify-center md:justify-start space-x-4">
    <button
      class="mt-2.5 relative pb-2"
      :class="activeTab === 'allinventory' ? 'text-mainColor font-semibold' : 'text-gray-500'"
      @click="showItem('allinventory')"
    >
      All Inventory
      <span
        v-if="activeTab === 'allinventory'"
        class="absolute left-0 right-0 -bottom-1 h-[2px] bg-mainColor w-3/4 mx-auto"
      >
      </span>
    </button>

    <button
      class="mt-2.5 relative pb-2"
      :class="activeTab === 'inventoryrecords' ? 'text-mainColor font-semibold' : 'text-gray-500'"
      @click="showItem('inventoryrecords')"
    >
      All Inventory Records
      <span
        v-if="activeTab === 'inventoryrecords'"
        class="absolute left-0 right-0 -bottom-1 h-[2px] bg-mainColor w-3/4 mx-auto"
      >
      </span>
    </button>
   </div>

   <InventoryList v-if="activeTab === 'allinventory'" />


   <InventoryRecords v-else-if="activeTab === 'inventoryrecords'" />
</template>
