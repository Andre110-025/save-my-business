<script setup>
import { ref, onBeforeMount } from 'vue'
import IconPlus from '@/components/IconPlus.vue'
import IconArrowBack from './IconArrowBack.vue'
import CustomerList from './CustomerList.vue'
import TopCustomerList from './TopCustomerList.vue'
import PropButtonIcon from './PropButtonIcon.vue'
import { useRoute } from 'vue-router'
import { useModal } from 'vue-final-modal'
import PopupAddCustomer from './PopupAddCustomer.vue'

const route = useRoute()
const customerListRef = ref(null) //this is the gateway to updating tables

//button for customer and Top customer
const activeTab = ref('allcustomer')

const showItem = (item) => {
  activeTab.value = item
}

const handleUrlParams = () => {
  // Get URL parameters
  const typeParam = route.query.type

  if (typeParam) {
    // Set the state filter if it exists in our filters array
    if (['allcustomer', 'topcustomer'].includes(typeParam)) {
      activeTab.value = typeParam
      // Apply filters
    }
    // getInventoryList()
  }
}

const { open: openAddUser, close: closeAddUser } = useModal({
  component: PopupAddCustomer,
  attrs: {
    // edit: true,
    onConfirm(bool) {
      if (bool) {
        // this is checking the child component if, a refresh method is available
        if (customerListRef.value?.refreshCustomers) {
          customerListRef.value.refreshCustomers()
        }
      }
      closeAddUser()
    },
  },
})

onBeforeMount(() => {
  handleUrlParams()
  // getInventoryList()
})

// this is the menu, of what is being checked
// defineExpose({
//   refreshCustomers: () => getCustomers(1)
// })
</script>

<template>
  <header>
    <div class="max-sm:flex max-sm:justify-between max-sm:items-center max-sm:pb-4 relative">
      <PropButtonIcon
        :icon-component="IconArrowBack"
        class="bg-gray-100 absolute left-0 sm:hidden"
      />

      <h2 class="text-gray-900 text-lg max-sm:h-fit max-sm:w-full max-sm:text-center">Customer</h2>

      <p class="mt-2.5 max-sm:hidden">Manage Your business Customer</p>

      <PropButtonIcon
        :icon-component="IconPlus"
        class="bg-mainColor sm:hidden max-sm:absolute max-sm:right-0"
        @click="openAddUser"
      />
    </div>
    <!-- <IconArrowBack /> -->
  </header>

  <div class="mt-2.5 flex flex-row items-center space-x-4">
    <button
      class="mt-2.5 relative pb-2"
      :class="activeTab === 'allcustomer' ? 'text-mainColor font-semibold' : 'text-gray-500'"
      @click="showItem('allcustomer')"
    >
      All Customer
      <span
        v-if="activeTab === 'allcustomer'"
        class="absolute left-0 right-0 -bottom-1 h-[2px] bg-mainColor w-3/4 mx-auto"
      >
      </span>
    </button>

    <button
      class="mt-2.5 relative pb-2"
      :class="activeTab === 'topcustomer' ? 'text-mainColor font-semibold' : 'text-gray-500'"
      @click="showItem('topcustomer')"
    >
      Customer By Performance
      <span
        v-if="activeTab === 'topcustomer'"
        class="absolute left-0 right-0 -bottom-1 h-[2px] bg-mainColor w-3/4 mx-auto"
      >
      </span>
    </button>
  </div>

  <!-- Tab for all Customer -->
  <CustomerList v-if="activeTab === 'allcustomer'" ref="customerListRef" />

  <!-- Tab for top Customer -->
  <TopCustomerList v-else-if="activeTab === 'topcustomer'" />
</template>
