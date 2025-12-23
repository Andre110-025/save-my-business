<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  pagination: {
    type: Object,
    required: true,
    default: () => ({
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
      links: [],
      data: [],
    }),
  },
  limit: {
    type: Number,
    default: 2,
  },
  keepLength: {
    type: Boolean,
    default: false,
  },
  showInfo: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['page-changed'])

// Computed properties from pagination object
const currentPage = computed(() => props.pagination.current_page)
const lastPage = computed(() => props.pagination.last_page)
const total = computed(() => props.pagination.total)
const perPage = computed(() => props.pagination.per_page)
const from = computed(() => (currentPage.value - 1) * perPage.value + 1)
const to = computed(() => Math.min(currentPage.value * perPage.value, total.value))
const nextPageUrl = computed(() => props.pagination.next_page_url)
const prevPageUrl = computed(() => props.pagination.prev_page_url)

// Calculate page range using Laravel's logic
const pageRange = computed(() => {
  if (props.limit === -1) {
    return []
  }

  if (props.limit === 0) {
    return Array.from({ length: lastPage.value }, (_, i) => i + 1)
  }

  const current = currentPage.value
  const last = lastPage.value
  const delta = props.limit
  const left = current - delta
  const right = current + delta + 1
  const leftPad = (delta + 2) * 2
  const rightPad = (delta + 2) * 2 - 1
  const range = []
  const pages = []
  let l

  for (let i = 1; i <= last; i++) {
    // Item is first or last
    if (i === 1 || i === last) {
      range.push(i)
    }
    // Item is within the delta
    else if (i >= left && i < right) {
      range.push(i)
    }
    // Item is before max left padding (if keeping length)
    else if (props.keepLength && i < leftPad && current < leftPad - 2) {
      range.push(i)
    }
    // Item is after max right padding (if keeping length)
    else if (props.keepLength && i > last - rightPad && current > last - rightPad + 2) {
      range.push(i)
    }
  }

  // Add ellipses
  range.sort((a, b) => a - b)
  range.forEach(function (i) {
    if (l) {
      if (i - l === 2) {
        pages.push(l + 1)
      } else if (i - l !== 1) {
        pages.push('...')
      }
    }
    pages.push(i)
    l = i
  })

  return pages
})

// Method to handle page change
function selectPage(page) {
  if (page === '...' || page === currentPage.value) {
    return
  }
  emit('page-changed', page)
}

// Navigate to previous page
function previousPage() {
  if (currentPage.value > 1) {
    selectPage(currentPage.value - 1)
  }
}

// Navigate to next page
function nextPage() {
  if (currentPage.value < lastPage.value) {
    selectPage(currentPage.value + 1)
  }
}
</script>

<template>
  <div
    v-if="total > 0"
    class="flex justify-between max-sm:flex-col items-center px-6 py-4 bg-white"
  >
    <!-- Pagination info -->
    <span v-if="showInfo" class="text-gray-500 text-sm max-sm:text-xs">
      Showing {{ from }}-{{ to }} of <b class="text-black">{{ total }}</b> results (<b
        class="text-black"
        >{{ perPage }} ▼</b
      >
      per page)
    </span>
    <div v-else class="flex-grow"></div>

    <!-- Pagination controls -->
    <nav v-if="lastPage > 1" class="flex items-center mt-2 sm:mt-0">
      <!-- Previous button -->
      <button
        class="border border-gray-300 px-3 py-1 text-black max-sm:text-xs bg-white rounded-sm hover:bg-gray-100 text-sm transition-all duration-300"
        @click="previousPage"
        :disabled="currentPage <= 1"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage <= 1 }"
      >
        « 
      </button>

      <!-- Page numbers -->
      <template v-for="(page, index) in pageRange" :key="index">
        <button
          v-if="page !== '...'"
          class="border border-gray-300 px-3 py-1 text-black max-sm:text-xs bg-white rounded-sm hover:bg-gray-100 text-sm transition-all duration-300"
          @click="selectPage(page)"
          :disabled="currentPage === page"
          :class="{ 'bg-slate-200 border-blue-300': page === currentPage }"
        >
          {{ page }}
        </button>
        <span
          v-else
          class="border border-gray-300 px-3 py-1 text-black max-sm:text-xs bg-white rounded-sm text-sm"
        >
          {{ page }}
        </span>
      </template>

      <!-- Next button -->
      <button
        class="border border-gray-300 px-3 py-1 text-black max-sm:text-xs bg-white rounded-sm hover:bg-gray-100 text-sm transition-all duration-300"
        @click="nextPage"
        :disabled="currentPage >= lastPage"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage >= lastPage }"
      >
         »
      </button>
    </nav>
  </div>
</template>
