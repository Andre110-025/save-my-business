<script>
    import { ref, onMounted, onUnmounted, computed } from 'vue'
    
    export function usePWAInstall() {
      const deferredPrompt = ref(null) // this stores the beforeinstall prompt, like a simulation
      const canInstall = ref(false) // checking if install flow is available
      const isDevelopment = import.meta.env.DEV // this enables a simulation in dev
      const isInstalled = ref(false)
      const showPrompt = ref(false)
    
      const engagementTime = ref(0)
      const pageViews = ref(1)
      const userInteractions = ref(0)
    
      const shouldAutoShow = computed(() => {
        // don't show button, if installed already
        if (isInstalled.value || localStorage.getItem('pwa_prompt_shown')) {
          return false
        }
    
        const hasEngagement = engagementTime.value > 30 && userInteractions.value > 3
        const hasMultipleVisits = parseInt(localStorage.getItem('pwa_visit_count') || '1') >= 2
    
        return hasEngagement || hasMultipleVisits
      })
    
      const trackVisit = () => {
        const today = new Date().toDateString()
        const lastVisit = localStorage.getItem('pwa_last_visit')
    
        if (lastVisit !== today) {
          const count = parseInt(localStorage.getItem('pwa_visit_count') || '0') + 1
          localStorage.setItem('pwa_visit_count', count.toString())
          localStorage.setItem('pwa_last_visit', today)
          pageViews.value = count
        }
      }
    
      const checkIfInstalled = () => {
        const standalone = window.matchMedia('(display-mode: standalone)').matches
        const isStandaloneIOS = window.navigator.standalone === true
        const hasAppReferrer = document.referrer.includes('android-app://')
    
        if (
          'windowControlsOverlay' in navigator ||
          'standalone' in window.navigator ||
          'getInstalledRelatedApps' in navigator
        ) {
          isInstalled.value = standalone || isStandaloneIOS || hasAppReferrer
        } else {
          // Fallback to traditional detection
          isInstalled.value =
            standalone ||
            isStandaloneIOS ||
            hasAppReferrer ||
            window.matchMedia('(display-mode: fullscreen)').matches ||
            window.matchMedia('(display-mode: minimal-ui)').matches
        }
    
        if (isInstalled.value) {
          console.log('📱 App is already installed as PWA')
          canInstall.value = false
          localStorage.setItem('pwa_installed', 'true')
        }
    
        return isInstalled.value
      }
    
      const handleBeforeInstall = (e) => {
        console.log('beforeinstallprompt event fired')
        e.preventDefault()
        deferredPrompt.value = e
        canInstall.value = true
    
        if (shouldAutoShow.value) {
          setTimeout(() => {
            showInstallPrompt()
          }, 1000)
        }
      }
    
      const checkAndAutoPrompt = () => {
        if (canInstall.value && shouldAutoShow.value && !showPrompt.value) {
          showInstallPrompt()
          localStorage.setItem('pwa_prompt_shown', 'true')
        }
      }
    
      const showInstallPrompt = () => {
        if (!canInstall.value || isInstalled.value) {
          return
        }
    
        showPrompt.value = true
    
        const dialog = createInstallDialog()
        document.body.appendChild(dialog)
    
        setTimeout(() => {
          dialog.classList.add('show')
        }, 10)
      }
    
      const createInstallDialog = () => {
        const dialog = document.createElement('div')
        dialog.className = 'pwa-install-dialog'
        dialog.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 10000;
          font-family: system-ui, -apple-system, sans-serif;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        `
    
        dialog.innerHTML = `
              <div class="pwa-install-content" style="
                background: white;
                border-radius: 20px 20px 0 0;
                padding: 30px 24px 24px;
                width: 100%;
                max-width: 500px;
                box-shadow: 0 -10px 40px rgba(0,0,0,0.2);
                transform: translateY(100%);
                transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
              ">
                <div style="position: absolute; top: 16px; right: 16px;">
                  <button class="close-btn" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #999;
                    padding: 4px 8px;
                  ">✕</button>
                </div>
                
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                  <div style="
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, #05716c, #089f9a);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 24px;
                    margin-right: 16px;
                    box-shadow: 0 4px 12px rgba(5, 113, 108, 0.3);
                  ">SH</div>
                  <div>
                    <h3 style="margin: 0; font-weight: 600; font-size: 20px;">Install StoreHive</h3>
                    <p style="margin: 6px 0 0; color: #666; font-size: 14px;">Enhanced experience & offline access</p>
                  </div>
                </div>
        
                <div style="margin-bottom: 24px;">
                  <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="color: #05716c; margin-right: 8px;">✓</span>
                    <span style="font-size: 14px;">Fast loading</span>
                  </div>
                  <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="color: #05716c; margin-right: 8px;">✓</span>
                    <span style="font-size: 14px;">Home screen access</span>
                  </div>
                </div>
        
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  <button id="installBtn" style="
                    padding: 16px;
                    background: linear-gradient(135deg, #05716c, #089f9a);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 16px;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                  ">Install Now</button>
                  
                  <button id="laterBtn" style="
                    padding: 16px;
                    background: transparent;
                    color: #666;
                    border: 1px solid #ddd;
                    border-radius: 12px;
                    font-weight: 500;
                    font-size: 16px;
                    cursor: pointer;
                  ">Maybe Later</button>
                </div>
              </div>
            `
    
        setTimeout(() => {
          dialog.style.opacity = '1'
          dialog.style.pointerEvents = 'all'
          const content = dialog.querySelector('.pwa-install-content')
          content.style.transform = 'translateY(0)'
        }, 10)
    
        dialog.querySelector('#installBtn').addEventListener('click', async () => {
          await installApp()
          hideDialog(dialog)
        })
    
        const hideDialog = (d) => {
          const content = d.querySelector('.pwa-install-content')
          content.style.transform = 'translateY(100%)'
          d.style.opacity = '0'
    
          setTimeout(() => {
            if (document.body.contains(d)) {
              document.body.removeChild(d)
            }
            showPrompt.value = false
          }, 400)
        }
    
        dialog.querySelector('.close-btn').addEventListener('click', () => {
          localStorage.setItem('pwa_prompt_dismissed', Date.now().toString())
          hideDialog(dialog)
        })
    
        dialog.querySelector('#laterBtn').addEventListener('click', () => {
          // Don't show again for 7 days
          const weekFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000
          localStorage.setItem('pwa_prompt_dismissed', weekFromNow.toString())
          hideDialog(dialog)
        })
    
        // Close on background click
        dialog.addEventListener('click', (e) => {
          if (e.target === dialog) {
            hideDialog(dialog)
          }
        })
    
        return dialog
      }
    
      const installApp = async () => {
        console.log('Install App triggered')
    
        if (isInstalled.value) {
          alert('App already installed')
          return
        }
    
        if (!deferredPrompt.value) {
          showNativeInstructions()
          return
        }
    
        try {
          console.log('Triggering install prompt...')
          deferredPrompt.value.prompt()
    
          const choiceResult = await deferredPrompt.value.userChoice
    
          console.log('User choice:', choiceResult.outcome)
          if (choiceResult.outcome === 'accepted') {
            console.log('✅ Installation accepted')
            canInstall.value = false
            isInstalled.value = true
            localStorage.setItem('pwa_installed', 'true')
    
            // Show success message
            showInstallSuccess()
          } else {
            console.log('❌ Installation dismissed')
            // Schedule to show again in 3 days
            localStorage.setItem(
              'pwa_prompt_dismissed',
              (Date.now() + 3 * 24 * 60 * 60 * 1000).toString(),
            )
          }
    
          deferredPrompt.value = null
        } catch (error) {
          console.error('Install error:', error)
          showNativeInstructions()
        }
      }
    
      const showInstallSuccess = () => {
        const success = document.createElement('div')
        success.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
          z-index: 10001;
          animation: slideIn 0.3s ease;
          font-family: system-ui, -apple-system, sans-serif;
        `
    
        success.innerHTML = `
          <div style="display: flex; align-items: center;">
            <span style="font-size: 20px; margin-right: 12px;">🎉</span>
            <div>
              <strong style="display: block;">Installation Started!</strong>
              <small style="opacity: 0.9;">Check your home screen</small>
            </div>
          </div>
        `
    
        document.body.appendChild(success)
    
        setTimeout(() => {
          if (document.body.contains(success)) {
            document.body.removeChild(success)
          }
        }, 3000)
      }
    
      let engagementInterval
      const setupEngagementTracking = () => {
        // Start engagement timer
        engagementInterval = setInterval(() => {
          engagementTime.value++
    
          // Check if we should auto-prompt every 10 seconds
          if (engagementTime.value % 10 === 0) {
            checkAndAutoPrompt()
          }
        }, 1000)
    
        // Track interactions
        const trackInteraction = () => {
          userInteractions.value++
        }
    
        document.addEventListener('click', trackInteraction, { passive: true })
        document.addEventListener('scroll', trackInteraction, { passive: true })
        document.addEventListener('keydown', trackInteraction, { passive: true })
    
        return () => {
          clearInterval(engagementInterval)
          document.removeEventListener('click', trackInteraction)
          document.removeEventListener('scroll', trackInteraction)
          document.removeEventListener('keydown', trackInteraction)
        }
      }
    
      const setupSimulatedPrompt = () => {
        console.log('🔧 Setting up simulated PWA install for development')
    
        // Simulate install prompt after engagement
        setTimeout(() => {
          if (!checkIfInstalled()) {
            console.log('🚀 Simulating PWA install availability')
            canInstall.value = true
    
            // Create realistic mock prompt
            deferredPrompt.value = {
              prompt: () => {
                console.log('💡 Showing simulated install dialog')
                return Promise.resolve({ outcome: 'accepted' })
              },
              userChoice: Promise.resolve({ outcome: 'accepted' }),
            }
    
            // Auto-show after simulation
            setTimeout(() => {
              showInstallPrompt()
            }, 1000)
          }
        }, 2000) // Shorter delay for development
    
        setupEngagementTracking()
      }
    
      onMounted(() => {
        // Track visit
        trackVisit()
    
        // Check if already installed
        checkIfInstalled()
    
        // Check if we shouldn't show prompt (recent dismissal)
        const lastDismissal = localStorage.getItem('pwa_prompt_dismissed')
        if (lastDismissal && Date.now() < parseInt(lastDismissal)) {
          console.log('⏸️ Skipping auto-prompt (recently dismissed)')
        }
    
        // Listen for real install prompt
        window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    
        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
          console.log('🎉 PWA was installed')
          isInstalled.value = true
          canInstall.value = false
          localStorage.setItem('pwa_installed', 'true')
        })
    
        // Setup engagement tracking
        if (isDevelopment && !isInstalled.value) {
          setupSimulatedPrompt()
        } else if (!isInstalled.value) {
          setupEngagementTracking()
        }
      })
    
      onUnmounted(() => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
        window.removeEventListener('appinstalled', () => {})
    
        if (engagementInterval) {
          clearInterval(engagementInterval)
        }
      })
    
      const showNativeInstructions = () => {
        const userAgent = navigator.userAgent.toLowerCase()
        const isIOS = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream
        const isAndroid = /android/.test(userAgent)
        const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent)
        const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent)
    
        let instructions = '📱 Install StoreHive\n\n'
    
        if (isIOS) {
          if (isSafari) {
            instructions += 'Safari on iOS:\n'
            instructions += '1. Tap the Share button (📤) at the bottom\n'
            instructions += '2. Scroll down and tap "Add to Home Screen"\n'
            instructions += '3. Tap "Add" in the top right\n'
          } else {
            instructions += 'Other browsers on iOS may not support PWA installation.\n'
            instructions += 'Try opening in Safari and following the steps above.'
          }
        } else if (isAndroid) {
          if (isChrome) {
            instructions += 'Chrome on Android:\n'
            instructions += '1. Tap the menu (⋮) in top right\n'
            instructions += '2. Tap "Install app" or "Add to Home Screen"\n'
            instructions += '3. Follow the prompts to install\n'
            instructions += '\nNote: Chrome may require you to use the site for 30+ seconds first.'
          } else {
            instructions += 'For other Android browsers, look for:\n'
            instructions += '• "Add to Home Screen" in menu\n'
            instructions += '• "Install" option\n'
            instructions += '• Three-dot menu → More tools'
          }
        } else {
          // Desktop
          instructions += 'On Desktop:\n'
          if (isChrome) {
            instructions += '1. Look for the install icon (⬇️) in address bar\n'
            instructions += '2. Or click the puzzle piece icon → "Install StoreHive"\n'
            instructions += '\nChrome requires: 30+ seconds of interaction, visited 2+ times'
          } else if (isSafari) {
            instructions += 'Safari: File → "Add to Dock" (macOS)'
          } else {
            instructions += 'Check your browser\'s menu for "Install" or "Add to Home Screen"'
          }
        }
    
        alert(instructions)
      }
    
      return {
        canInstall,
        installApp,
        isInstalled,
        showInstallPrompt, // Export to allow manual triggering
        engagementTime,
        userInteractions,
        pageViews,
      }
    }
</script>



<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
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

const {
  canInstall,
  installApp,
  isInstalled,
  showInstallPrompt,
  engagementTime,
  userInteractions,
  pageViews,
} = usePWAInstall()

const hasPrompted = computed(() => {
  return localStorage.getItem('pwa_prompt_shown') === 'true'
})

const isMobile = ref(window.innerWidth < 450)
const showDownloadBtn = ref(false)

const handleResize = () => {
  isMobile.value = window.innerWidth < 450
}

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
          v-if="canInstall && showDownloadBtn && !hasPrompted"
          @click="showInstallPrompt"
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
      <div v-if="showDownloadBtn && !hasPrompted" class="flex flex-start gap-3">
        <button
          v-if="canInstall"
          @click="showInstallPrompt"
          class="rounded-xl bg-mainColor mt-2.5 text-white py-3 font-semibold shadow-lg flex flex-row items-center gap-2"
          title="Download for ios"
        >
          <IconIOS class="w-5 h-5" />
          <span>IOS</span>
        </button>
        <button
          v-if="canInstall"
          @click="showInstallPrompt"
          class="rounded-xl bg-mainColor mt-2.5 text-white py-3 font-semibold shadow-lg flex flex-row items-center gap-2"
          title="Download for Android"
        >
          <IconAndroid class="w-5 h-5" />
          <span>Android</span>
        </button>
        <button
          v-if="canInstall"
          @click="showInstallPrompt"
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
