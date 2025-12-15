<script setup>
import { ref } from 'vue'
import IconLogout from './IconLogout.vue'
import IconNotification from './IconNotification.vue'
import IconPasswordLock from './IconPasswordLock.vue'
import IconButtonNotification from './IconButtonNotification.vue'
import SettingPasswordChange from './SettingPasswordChange.vue'
import { useUserStore } from '@/stores/user'

const { logOut } = useUserStore()

const activeSetting = ref('setting1')
</script>

<template>
  <div class="settings-wrapper">
    <header class="mb-6 md:mb-8">
      <div>
        <h2 class="text-gray-900 text-xl md:text-2xl font-semibold">Settings</h2>
        <p class="mt-1 md:mt-2.5 text-sm md:text-base text-gray-600">Configure your dashboard</p>
      </div>
    </header>

    <!-- Mobile Navigation Tabs -->
    <div class="md:hidden mb-4 overflow-x-auto scrollbar-hide">
      <div class="flex space-x-2 pb-2 min-w-max">
        <button
          @click="activeSetting = 'setting1'"
          class="flex items-center space-x-2 px-4 py-3 rounded-lg whitespace-nowrap transition-colors"
          :class="activeSetting === 'setting1' ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'"
        >
          <div class="w-5 h-5 bg-[#f43c3e] flex items-center justify-center rounded flex-shrink-0">
            <IconPasswordLock class="w-3 h-3 text-white" />
          </div>
          <span class="text-sm font-medium">Password</span>
        </button>
        <button
          @click="activeSetting = 'setting2'"
          class="flex items-center space-x-2 px-4 py-3 rounded-lg whitespace-nowrap transition-colors"
          :class="activeSetting === 'setting2' ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'"
          v-if="false"
        >
          <div class="w-5 h-5 bg-[#763ce8] flex items-center justify-center rounded flex-shrink-0">
            <IconNotification class="w-3 h-3 text-white" />
          </div>
          <span class="text-sm font-medium">Notifications</span>
        </button>
      </div>
    </div>

    <div class="flex flex-col md:flex-row gap-4 md:gap-6">
      <!-- Desktop Sidebar -->
      <div class="hidden md:flex flex-col w-full md:w-[300px] lg:w-[350px] border border-gray-200 rounded-lg bg-white">
        <!-- Top Section -->
        <div class="flex-1">
          <div
            @click="activeSetting = 'setting1'"
            class="flex flex-row items-start space-x-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            :class="{ 'bg-gray-100': activeSetting === 'setting1' }"
          >
            <div class="w-6 h-6 bg-[#f43c3e] flex items-center justify-center rounded flex-shrink-0">
              <IconPasswordLock class="w-4 h-4 text-white" />
            </div>
            <div class="text-left min-w-0">
              <h6 class="font-semibold text-sm">Password</h6>
              <p class="text-xs text-gray-600 mt-1">
                Secure your account by setting up or changing your password
              </p>
            </div>
          </div>
          <div
            @click="activeSetting = 'setting2'"
            class="flex flex-row items-start space-x-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            :class="{ 'bg-gray-100': activeSetting === 'setting2' }"
            v-if="false"
          >
            <div class="w-6 h-6 bg-[#763ce8] flex items-center justify-center rounded flex-shrink-0">
              <IconNotification class="w-4 h-4 text-white" />
            </div>
            <div class="text-left min-w-0">
              <h6 class="font-semibold text-sm">Notification Center</h6>
              <p class="text-xs text-gray-600 mt-1">
                Stay updated on the activities going on in your dashboard
              </p>
            </div>
          </div>
        </div>
        
        <!-- Desktop Logout Button -->
        <div class="p-4 border-t border-gray-200">
          <button 
            @click="logOut()" 
            class="flex flex-row items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors w-full group"
          >
            <div class="w-6 h-6 bg-[#1bb56f] flex items-center justify-center rounded flex-shrink-0 group-hover:bg-[#1a9e62] transition-colors">
              <IconLogout class="w-4 h-4 text-white" />
            </div>
            <div class="text-left">
              <h6 class="font-semibold text-sm">Log out</h6>
            </div>
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="w-full md:flex-1 min-w-0 overflow-hidden">
        <!-- Password Change Section -->
        <div v-if="activeSetting === 'setting1'" class="w-full">
          <SettingPasswordChange />
        </div>

        <!-- Notification Section -->
        <div v-if="activeSetting === 'setting2'" class="w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div class="p-4 md:p-6">
            <div class="flex flex-col gap-4 md:gap-6">
              <div class="pb-3 md:pb-4 border-b border-gray-200">
                <h6 class="font-bold text-base md:text-lg">Notification Center</h6>
                <p class="text-gray-500 text-xs md:text-sm mt-1">View and change your notification settings</p>
              </div>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between py-2">
                  <div class="flex items-center gap-3">
                    <IconButtonNotification class="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 text-gray-700" />
                    <div>
                      <h6 class="text-sm md:text-base font-medium">In-App Notification</h6>
                      <p class="text-gray-500 text-xs md:text-sm">Get Notification In-app</p>
                    </div>
                  </div>
                  <!-- Add toggle switch here -->
                </div>
                
                <div class="flex items-center justify-between py-2 border-t border-gray-100 pt-4">
                  <div class="flex items-center gap-3">
                    <IconButtonNotification class="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 text-gray-700" />
                    <div>
                      <h6 class="text-sm md:text-base font-medium">Every Status update</h6>
                      <p class="text-gray-500 text-xs md:text-sm">Notify me on every status update</p>
                    </div>
                  </div>
                  <!-- Add toggle switch here -->
                </div>
              </div>
              
              <div class="pt-4 md:pt-6 border-t border-gray-200">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <h6 class="font-bold text-sm md:text-base">Configure credit notification</h6>
                    <p class="text-gray-500 text-xs md:text-sm mt-1">
                      Get notified when credit transactions reach a particular threshold
                    </p>
                  </div>
                  <div class="w-full lg:w-48 xl:w-60">
                    <select
                      id="credit"
                      name="credit"
                      class="w-full h-10 md:h-[40px] border border-gray-300 rounded-lg px-3 md:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base bg-white"
                    >
                      <option value="5 days to due date">5 days to due date</option>
                      <option value="10 days to due date">10 days to due date</option>
                      <option value="15 days to due date">15 days to due date</option>
                      <option value="20 days to due date">20 days to due date</option>
                      <option value="25 days to due date">25 days to due date</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Logout Button -->
    <div class="md:hidden mt-6 pt-4 border-t border-gray-200">
      <button 
        @click="logOut()" 
        class="flex flex-row items-center justify-center space-x-3 text-gray-700 w-full py-3 hover:text-gray-900 transition-colors"
      >
        <div class="w-6 h-6 bg-[#1bb56f] flex items-center justify-center rounded">
          <IconLogout class="w-4 h-4 text-white" />
        </div>
        <div>
          <h6 class="font-semibold text-sm">Log out</h6>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.settings-wrapper {
  @apply w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Ensure content doesn't overflow on mobile */
@media (max-width: 767px) {
  .settings-wrapper {
    @apply px-4;
  }
  
  .settings-wrapper > * {
    @apply max-w-full overflow-hidden;
  }
}
</style>