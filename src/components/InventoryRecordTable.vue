<script setup>
import IconEye from './IconEye.vue'
import { useModal } from 'vue-final-modal'
import PopUpRecordDetail from './PopUpRecordDetail.vue'
import { useHelpers } from '@/helper'

const { formatTime, formatDateTime } = useHelpers()

const emit = defineEmits(['refresh'])

const props = defineProps({
  inventoryData: {
    type: Array,
    default: () => [],
  },
})

const handleRecordDetails = (item) => {
  const { open, close } = useModal({
    component: PopUpRecordDetail,
    attrs: {
      inventoryRecord: item,
      onConfirm(bool) {
        if (bool) {
          emit('refresh')
        }
        close()
      },
    },
  })
  open()
}
</script>

<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full border-collapse bg-white">
      <thead class="bg-gray-50">
        <tr>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-start"
          >
            Product Name
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-start"
          >
            Record Type
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-start"
          >
            Staff Name
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-start"
          >
            Date
          </th>
          <th class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-start">
            Action
          </th>
        </tr>
      </thead>

      <tbody class="divide-y-8 divide-[#FAFAFA]">
        <tr class="rounded-3xl" v-for="(item, index) in inventoryData" :key="index">
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">{{ item.product }}</div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">{{ item.type_of_inventory }}</div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">{{ item.staff }}</div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                {{ formatDateTime(item.created_at) }} | {{ formatTime(item.created_at) }}
              </div>
            </div>
          </td>
          <td>
            <button
              @click.stop="handleRecordDetails(item)"
              class="p-1 rounded-md hover:bg-gray-100"
              title="View Details"
            >
              <IconEye class="w-6 h-6" />
            </button>
          </td>
        </tr>
        <tr v-if="!inventoryData.length">
          <td colspan="5" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
            No Inventory Record found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
