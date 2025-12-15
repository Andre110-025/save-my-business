<script setup>
const props = defineProps({
  incomes: {
    type: Array,
    default: () => [],
  },
})
</script>

<<template>
  <!-- Wrapper div for horizontal scrolling -->
  <div class="overflow-x-auto">
    <table class="w-full min-w-[800px] border-collapse bg-white">
      <thead class="bg-gray-50">
        <tr>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center"
          >
            Date
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center"
          >
            Product Name
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center"
          >
            Quantity Sold
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center"
          >
            Sell Price
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center"
          >
            Cost Price
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center"
          >
            Profit
          </th>
        </tr>
      </thead>

      <tbody class="divide-y-8 divide-[#FAFAFA]">
        <tr class="rounded-3xl" v-for="(item, index) in incomes" :key="index">
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.date"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.product"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.quantity"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p
              class="h-fit text-end"
              v-text="
                item.selling_price.toLocaleString('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                })
              "
            ></p>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p
              class="h-fit text-end"
              v-text="
                item.cost_price.toLocaleString('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                })
              "
            ></p>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p
              class="h-fit text-end"
              v-text="
                item.profit.toLocaleString('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                })
              "
            ></p>
          </td>
        </tr>
        <tr v-if="!incomes.length">
          <td colspan="6" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
            No Income Record found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
