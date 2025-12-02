<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import IconImageUpload from './IconImageUpload.vue'
import IconBox from './IconBox.vue'
import IconCancel from './IconCancel.vue'
import { VueFinalModal } from 'vue-final-modal'
import DynamicInput from './DynamicInput.vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useHelpers } from '@/helper'
import { useUserStore } from '@/stores/user'
import IconDelete from './IconDelete.vue'
import useVuelidate from '@vuelidate/core'
import { required, minValue } from '@vuelidate/validators'

const { user } = useUserStore()

// const { productCategoryList } = useHelpers()

const emits = defineEmits(['confirm'])

const props = defineProps({
  edit: {
    type: Boolean,
    default: false,
  },
  productItem: {
    type: Object,
    default: null,
  },
})

const productCategoryList = ref([])
const selectedCategory = ref(props.edit ? props.productItem.category : null)
const isLoading = ref(false)

const getProductCategory = async () => {
  try {
    isLoading.value = true
    const { data, status } = await axios.get('getProductCategory')
    if (status === 202 && data.success) {
      productCategoryList.value = data['all category']
    } else {
      toast.error('Failed to fetch product categories', {
        position: toast.POSITION.TOP_CENTER,
      })
    }
  } catch (error) {
    toast.error('An error occurred while fetching product categories', {
      position: toast.POSITION.TOP_CENTER,
    })
  } finally {
    isLoading.value = false
  }
}

const productData = reactive({
  product_name: props.edit ? props.productItem.product_name : null,
  category: props.edit ? props.productItem.category : null,
  brand: props.edit ? props.productItem.brand : null,
  user_type: user.userType,
  product_type: props.edit ? props.productItem.category : null, // Same with category
  product_image: props.edit ? props.productItem.product_image : null,
  bar_code: props.edit ? props.productItem.bar_code : null,
  threshold: props.edit ? props.productItem.threshold : null,
  prescription: 0 ? 0 : 'false',
  created_by: props.edit ? props.productItem.created_by : user.userInfo.full_name,
  edit: props.edit ? 'true' : 'false',
  purchase_unit_type: props.edit ? props.productItem.sku[0].purchase_unit_type : null,
  purchased_date: props.edit ? props.productItem.sku[0].purchased_date : null,
  expiry_date: props.edit ? props.productItem.sku[0].expiry_date : null,
  purchased_unit_qty: props.edit ? props.productItem.sku[0].purchased_unit_qty : 1,
  purchased_total_amount: props.edit ? props.productItem.sku[0].purchased_total_amount : 0,
  product_id: props.edit ? props.productItem.id : null,
  sku_id: props.edit ? props.productItem.sku[0].id : null,
  whole_sale_amount: props.edit ? props.productItem.sku[0].skusale[0].whole_sale_amount : 0,
  sale_unit_type: props.edit ? props.productItem.sku[0].purchase_unit_type : null, //Same with purchase unit
  sale_unit_parent: props.edit ? props.productItem.sku[0].purchase_unit_type : null, //Same with purchase unit
  qty_in_parent: props.edit ? props.productItem.sku[0].skusale[0].qty_in_parent : 1,
  unit_amount: props.edit ? props.productItem.sku[0].skusale[0].unit_amount : 0,
  unit_cost_price: props.edit ? props.productItem.sku[0].skusale[0].unit_cost_price : 0,
  sku_sale_id: props.edit ? props.productItem.sku[0].skusale[0].id : null,
  addProduct: {
    branch: [
      {
        qty_to_assign: props.edit
          ? props.productItem.sku[0].productbranch[0].qty_remaining_by_lowest
          : 0, // same as purchased_unit_qty
        branch_id: user.branchId,
      },
    ],
  },
  id: props.edit ? props.productItem.id : null,
})

const rules = computed(() => ({
  product_name: {
    required,
  },
  category: {
    required,
  },
  brand: {
    required,
  },
  // product_type: {
  //   required,
  //   sameAs: sameAs(productData.category),
  // },
  // product_image: {
  //   required,
  // },
  threshold: {
    required,
    minValue: minValue(1),
  },
  // prescription: {
  //   required,
  // },
  purchase_unit_type: {
    required,
  },
  purchased_date: {
    required,
  },
  expiry_date: {
    required,
  },
  purchased_unit_qty: {
    required,
  },
  purchased_total_amount: {
    required,
  },
  whole_sale_amount: {
    required,
    minValue: minValue(productData.unit_cost_price),
  },
  // sale_unit_type: {
  //   required,
  //   sameAs: sameAs(productData.purchase_unit_type),
  // },
  // sale_unit_parent: {
  //   required,
  //   sameAs: sameAs(productData.purchase_unit_type),
  // },
  qty_in_parent: {
    required,
  },
  unit_amount: {
    required,
    minValue: minValue(productData.unit_cost_price),
  },
  unit_cost_price: {
    required,
    minValue: minValue(0),
  },
}))

const v$ = useVuelidate(rules, productData)

const imgData = ref(props.edit ? props.productItem.product_image : null)

const handleImage = (e) => {
  const img = e.target.files[0]
  let reader = new FileReader()

  reader.addEventListener(
    'load',
    () => {
      imgData.value = reader.result
      if (/\.(jpe?g|png)$/i.test(img.name)) {
        productData.product_image = reader.result.split(',')[1]
        // console.log(base64Content);
      }
    },
    false,
  )

  if (img) {
    if (/\.(jpe?g|png)$/i.test(img.name)) {
      reader.readAsDataURL(img)
    }
  }

  e.target.value = null
}

const removeImg = () => {
  imgData.value = null
  productData.product_image = null
}

watch(
  [() => productData.purchased_total_amount, () => productData.purchased_unit_qty],
  ([newTotalAmount, newUnitQty]) => {
    // Check if both values exist and quantity is not zero
    if (newTotalAmount && newUnitQty && newUnitQty !== 0) {
      // Calculate unit cost price
      productData.unit_cost_price = newTotalAmount / newUnitQty
    }
  },
)

watch(selectedCategory, (newCategory) => {
  if (newCategory !== 'Others' && newCategory !== '') {
    productData.category = newCategory
  } else if (newCategory === 'Others') {
    productData.category = ''
  }
})

const addNewProduct = async () => {
  productData.product_type = productData.category
  productData.sale_unit_type = productData.purchase_unit_type
  productData.sale_unit_parent = productData.purchase_unit_type
  productData.addProduct.branch[0].qty_to_assign = productData.purchased_unit_qty

  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) return

  try {
    isLoading.value = true

    const { data, status } = await axios.post('addproduct', productData)
    // console.log(status, data)

    if (status === 201 && !data.errors && data.Product !== 'null') {
      if (props.edit) {
        toast.success('Product Updated Successfully', {
          position: toast.POSITION.TOP_CENTER,
        })
      } else {
        toast.success('Product Added Successfully', {
          position: toast.POSITION.TOP_CENTER,
        })
      }

      emits('confirm', true)
    } else {
      if (data['save type'] && data.Product === 'null') {
        toast.warning(data['save type'], {
          position: toast.POSITION.TOP_CENTER,
        })
      } else if (data.errors) {
        toast.warning(data.errors, {
          position: toast.POSITION.TOP_CENTER,
        })
      } else {
        toast.error('An Error was encountered', {
          position: toast.POSITION.TOP_CENTER,
        })
      }
      isLoading.value = false
    }
  } catch (error) {
    toast.error('An Error was encountered while adding Stock', {
      position: toast.POSITION.TOP_CENTER,
    })
    isLoading.value = false
  }
}

onMounted(() => {
  getProductCategory()
})
</script>

<template>
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-[600px] max-w-[400px] rounded-2xl shadow-lg"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="false"
  >
    <form @submit.prevent="addNewProduct" class="flex flex-col w-full h-full">
      <div class="flex flex-row justify-between items-center p-5">
        <div class="flex flex-row items-center gap-3">
          <div
            class="w-10 h-10 bg-[rgba(5,113,108,0.1)] rounded-md flex items-center justify-center"
          >
            <IconBox class="w-8 h-8 stroke-mainColor stroke-1" />
          </div>
          <div class="flex flex-col">
            <h2 class="text-lg font-semibold">{{ props.edit ? 'Edit' : 'Add' }} Product</h2>
            <p class="text-gray-600">Always know the items you have available.</p>
          </div>
        </div>
        <button
          @click="emits('confirm')"
          type="button"
          class="border border-black rounded p-1 flex items-center justify-center"
        >
          <IconCancel color="black" class="w-5 h-5" />
        </button>
      </div>

      <div class="flex flex-col flex-1 overflow-y-auto p-4">
        <!-- Add your form or content here -->
        <div class="mb-4">
          <label
            for="productImage"
            v-if="!imgData"
            class="border-2 border-dashed border-gray-3 rounded-lg cursor-pointer block w-fit"
          >
            <input
              @change="handleImage"
              accept="image/*"
              type="file"
              name="productImage"
              id="productImage"
              class="hidden"
            />
            <div class="flex flex-col items-center justify-center p-4 text-sm user-select-none">
              <IconImageUpload class="w-8 h-8 stroke-mainColor stroke-1" />
              <p class="text-gray-600">Upload Product Image</p>
              <p class="text-gray-400">Max size: 2MB</p>
              <p class="text-gray-400">Format: JPG, PNG</p>
              <p class="text-gray-400">Recommended size: 500x500</p>
            </div>
          </label>
          <div v-show="imgData" class="w-fit relative">
            <img :src="imgData" class="h-48 w-48 object-center object-cover" alt="" />
            <button
              type="button"
              class="absolute bg-slate-200 rounded-md bottom-5 right-10 w-10 h-10 p-0 flex justify-center items-center"
              @click="removeImg"
              title="Remove Image"
            >
              <IconDelete class="w-8 h-8" />
            </button>
          </div>
        </div>

        <DynamicInput
          v-model="productData.product_name"
          type="text"
          placeholder="Enter product name"
          :label="'Enter product name'"
        />

        <!-- <div class="flex flex-row justify-between items-center gap-2.5 mb-4">
          <span>Is this a Prescriptive Product</span>

          <div class="flex flex-row gap-2.5">
            <div class="flex flex-row items-center gap-2">
              <input
                type="radio"
                name="prescription"
                id="prescriptionChoice1"
                value="true"
                v-model="productData.prescription"
                class="accent-mainColor"
              />
              <label for="prescriptionChoice1">Yes</label>
            </div>
            <div class="flex flex-row items-center gap-2">
              <input
                type="radio"
                name="prescription"
                id="prescriptionChoice2"
                value="false"
                v-model="productData.prescription"
                class="accent-mainColor"
              />
              <label for="prescriptionChoice2">No</label>
            </div>
          </div>
        </div> -->

        <div class="mb-4">
          <label class="block mb-2" for="productCategory">Select Product Category</label>
          <select
            class="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-mainColor capitalize"
            v-model="selectedCategory"
            name="productCategory"
            id="productCategory"
            v-if="productCategoryList.length"
          >
            <option value="">Select Product Category</option>
            <option
              class="capitalize"
              v-for="(category, index) in productCategoryList"
              :key="index"
              :value="category.name"
            >
              {{ category.name }}
            </option>
            <option value="Others" selected>Others</option>
          </select>
        </div>

        <DynamicInput
          v-model="productData.category"
          type="text"
          :label="'Enter Product Category'"
          placeholder="Enter Product Category"
          v-if="selectedCategory === 'Others'"
        />

        <DynamicInput
          v-model="productData.brand"
          type="text"
          :label="'Enter product Brand'"
          placeholder="Enter product Brand"
        />

        <!-- <DynamicInput
          v-model="productData.bar_code"
          type="text"
          placeholder="product Barcode (optional)"
          :label="'Product Barcode (optional)'"
        /> -->

        <DynamicInput
          v-model="productData.purchased_total_amount"
          type="Number"
          placeholder="Purchased Total Amount"
          :label="'Purchased Total Amount'"
          v-if="!props.edit"
          :currency="true"
        />

        <div v-if="!props.edit" class="flex flex-row gap-2.5 mb-4">
          <button
            @click="--productData.purchased_unit_qty"
            :disabled="productData.purchased_unit_qty <= 1"
            type="button"
            class="py-2 px-3.5 w-10 text-center border border-black"
          >
            -
          </button>
          <DynamicInput
            v-model="productData.purchased_unit_qty"
            type="Number"
            placeholder="Unit Price"
            style="flex: 1; margin-bottom: 0"
          />
          <button
            @click="++productData.purchased_unit_qty"
            type="button"
            class="py-2 px-3.5 w-10 text-center border border-black"
          >
            +
          </button>
        </div>

        <DynamicInput
          v-model="productData.purchase_unit_type"
          type="text"
          placeholder="Enter Purchase Unit Type"
          :label="'Enter Purchase Unit Type'"
          v-if="!props.edit"
        />

        <div v-if="!props.edit" class="flex flex-row gap-2.5">
          <DynamicInput
            v-model="productData.unit_amount"
            type="Number"
            placeholder="Retail Price"
            class="flex-1"
            :label="'Retail Price'"
            :currency="true"
          />

          <DynamicInput
            v-model="productData.whole_sale_amount"
            type="Number"
            placeholder="Wholesale Price"
            class="flex-1"
            :label="'Wholesale Price'"
            :currency="true"
          />
        </div>

        <div v-if="!props.edit" class="flex flex-row gap-2.5">
          <DynamicInput
            v-model="productData.purchased_date"
            type="Date"
            placeholder="Purchase Date"
            class="flex-1"
            :label="'Purchase Date'"
          />

          <DynamicInput
            v-model="productData.expiry_date"
            type="Date"
            placeholder="Expiry Date"
            class="flex-1"
            :label="'Expiry Date'"
          />
        </div>

        <div v-if="false" class="flex flex-row gap-2.5">
          <DynamicInput
            v-model="productData.purchased_unit_qty"
            type="Number"
            placeholder="Wholesale Price"
            class="flex-1"
          />

          <DynamicInput
            v-model="productData.purchased_total_amount"
            type="Number"
            placeholder="Min. Quantity"
            class="flex-1"
          />
        </div>

        <DynamicInput
          v-model="productData.threshold"
          type="Number"
          placeholder="Enter Threshold Quantity"
          :label="'Enter Threshold Quantity'"
        />
      </div>

      <div class="p-4">
        <button
          :disabled="isLoading || v$.$invalid"
          type="submit"
          class="bg-mainColor w-full text-white px-4 py-2 rounded-md"
        >
          Confirm
        </button>
      </div>
    </form>
  </VueFinalModal>
</template>
