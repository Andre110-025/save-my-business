<script setup>
import IconDashboard from './IconDashboard.vue'
import IconCustomers from './IconCustomers.vue'
import IconIncome from './IconIncome.vue'
import IconSale from './IconSale.vue'
import IconBox from './IconBox.vue'
import IconAdmin from './IconAdmin.vue'
import IconSettings from './IconSettings.vue'
import Logo from './Logo.vue'
import IconActivityLog from './IconActivityLog.vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
// import IconAccount from './IconAccount.vue'
import IconProfile from './IconProfile.vue'

const userStore = useUserStore()
const { user, privileges } = storeToRefs(userStore)
</script>

<template>
  <!-- Desktop/Tablet Sidebar (shows from 768px and up) -->
  <aside
    class="fixed bottom-0 left-0 top-0 z-50 hidden w-64 overflow-y-auto bg-white py-5 px-5 lg:flex flex-col"
  >
    <div class="pb-5 flex items-center justify-center">
      <Logo class="w-[135px]" />
    </div>
    <div class="flex-1 space-y-3.5 overflow-y-auto py-5">
      <RouterLink v-if="privileges.can_view_analytics" :to="{ name: 'overview' }" class="dashNav">
        <IconDashboard class="" />
        Dashboard
      </RouterLink>
      <RouterLink v-if="privileges.can_view_customers" :to="{ name: 'Customers' }" class="dashNav">
        <IconCustomers class="" />
        Customers
      </RouterLink>
      <RouterLink
        v-if="privileges.can_view_income_records"
        :to="{ name: 'Income' }"
        class="dashNav"
      >
        <IconIncome class="" />
        Income
      </RouterLink>
      <RouterLink v-if="privileges.can_view_sales_records" :to="{ name: 'Sales' }" class="dashNav">
        <IconSale class="" />
        Sales
      </RouterLink>
      <RouterLink v-if="privileges.can_view_products" :to="{ name: 'Inventory' }" class="dashNav">
        <IconBox class="" />
        Inventory
      </RouterLink>
      <RouterLink v-if="privileges.can_view_staff" :to="{ name: 'Administration' }" class="dashNav">
        <IconAdmin class="" />
        Administration
      </RouterLink>
      <RouterLink
        v-if="privileges.view_other_staff_activities"
        :to="{ name: 'ActivityLog' }"
        class="dashNav"
      >
        <IconActivityLog class="" />
        Activity Log
      </RouterLink>
    </div>

    <div class="divide-y divide-gray-300">
      <RouterLink :to="{ name: 'Settings' }" class="dashNav mb-2.5">
        <IconSettings class="" />
        Settings
      </RouterLink>

      <div class="pt-2.5 flex flex-row gap-2.5">
        <div>
          <p v-text="user.userInfo?.full_name"></p>
          <RouterLink :to="{ name: 'Profile' }" class="text-mainColor"> Profile </RouterLink>
        </div>
      </div>
    </div>
  </aside>

  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-300 lg:hidden">
    <div class="flex overflow-x-auto py-3 px-4 space-x-6 hide-scrollbar">
      <RouterLink
        v-if="privileges.can_view_analytics"
        :to="{ name: 'overview' }"
        class="dashNav w-[60px]"
      >
        <IconDashboard class="" />
      </RouterLink>
      <RouterLink
        v-if="privileges.can_view_customers"
        :to="{ name: 'Customers' }"
        class="dashNav w-[60px]"
      >
        <IconCustomers class="" />
      </RouterLink>
      <RouterLink
        v-if="privileges.can_view_income_records"
        :to="{ name: 'Income' }"
        class="dashNav w-[60px]"
      >
        <IconIncome class="" />
      </RouterLink>
      <RouterLink
        v-if="privileges.can_view_sales_records"
        :to="{ name: 'Sales' }"
        class="dashNav w-[60px]"
      >
        <IconSale class="" />
      </RouterLink>
      <RouterLink
        v-if="privileges.can_view_products"
        :to="{ name: 'Inventory' }"
        class="dashNav w-[60px]"
      >
        <IconBox class="" />
      </RouterLink>
      <RouterLink
        v-if="privileges.can_view_staff"
        :to="{ name: 'Administration' }"
        class="dashNav w-[60px]"
      >
        <IconAdmin class="" />
      </RouterLink>
      <RouterLink
        v-if="privileges.view_other_staff_activities"
        :to="{ name: 'ActivityLog' }"
        class="dashNav w-[60px]"
      >
        <IconActivityLog class="" />
      </RouterLink>
      <RouterLink :to="{ name: 'Settings' }" class="dashNav w-[60px]">
        <IconSettings class="" />
      </RouterLink>
      <RouterLink :to="{ name: 'Profile' }" class="dashNav w-[60px]">
        <IconProfile class="" />
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
