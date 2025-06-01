<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-btn icon @click="$router.go(-1)" class="mr-4">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h1 class="text-h4">{{ isEditing ? 'Edit Product' : 'New Product' }}</h1>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Product Information</v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="product.name"
                    label="Product Name"
                    :rules="[rules.required]"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-select
                    v-model="product.category"
                    :items="categories"
                    label="Category"
                    :rules="[rules.required]"
                    required
                  ></v-select>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="product.sku"
                    label="SKU"
                    :rules="[rules.required]"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12">
                  <v-textarea
                    v-model="product.description"
                    label="Description"
                    rows="4"
                    :rules="[rules.required]"
                    required
                  ></v-textarea>
                </v-col>
                
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="product.price"
                    label="Price"
                    type="number"
                    step="0.01"
                    prefix="$"
                    :rules="[rules.required, rules.positiveNumber]"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="product.costPrice"
                    label="Cost Price"
                    type="number"
                    step="0.01"
                    prefix="$"
                    :rules="[rules.required, rules.positiveNumber]"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="product.stock"
                    label="Stock Quantity"
                    type="number"
                    :rules="[rules.required, rules.positiveInteger]"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="product.brand"
                    label="Brand"
                    :rules="[rules.required]"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-select
                    v-model="product.status"
                    :items="statusOptions"
                    label="Status"
                    :rules="[rules.required]"
                    required
                  ></v-select>
                </v-col>
                
                <v-col cols="12">
                  <v-switch
                    v-model="product.featured"
                    label="Featured Product"
                    color="primary"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-title>Product Images</v-card-title>
          <v-card-text>
            <div class="text-center pa-8">
              <v-icon size="64" color="grey">mdi-image-multiple</v-icon>
              <div class="text-h6 mt-4">Image Upload</div>
              <div class="text-body-2 text-grey">Image upload functionality will be implemented here</div>
              <v-btn color="primary" class="mt-4">
                <v-icon left>mdi-upload</v-icon>
                Upload Images
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
        
        <v-card class="mb-4">
          <v-card-title>SEO Settings</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="product.metaTitle"
              label="Meta Title"
              counter="60"
            ></v-text-field>
            
            <v-textarea
              v-model="product.metaDescription"
              label="Meta Description"
              rows="3"
              counter="160"
            ></v-textarea>
            
            <v-text-field
              v-model="product.slug"
              label="URL Slug"
              hint="Auto-generated from product name"
              persistent-hint
            ></v-text-field>
          </v-card-text>
        </v-card>
        
        <v-card>
          <v-card-title>Actions</v-card-title>
          <v-card-text>
            <v-btn
              color="primary"
              block
              class="mb-2"
              :disabled="!valid"
              @click="saveProduct"
            >
              {{ isEditing ? 'Update Product' : 'Create Product' }}
            </v-btn>
            
            <v-btn
              text
              block
              class="mb-2"
              @click="saveDraft"
            >
              Save as Draft
            </v-btn>
            
            <v-btn
              text
              block
              @click="$router.go(-1)"
            >
              Cancel
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface Product {
  id?: number
  name: string
  category: string
  sku: string
  description: string
  price: number
  costPrice: number
  stock: number
  brand: string
  status: string
  featured: boolean
  metaTitle: string
  metaDescription: string
  slug: string
}

const route = useRoute()
const router = useRouter()

const valid = ref(false)
const form = ref()

const product = ref<Product>({
  name: '',
  category: '',
  sku: '',
  description: '',
  price: 0,
  costPrice: 0,
  stock: 0,
  brand: '',
  status: 'active',
  featured: false,
  metaTitle: '',
  metaDescription: '',
  slug: ''
})

const categories = [
  'Dog Food',
  'Cat Food',
  'Toys',
  'Accessories',
  'Health & Wellness',
  'Grooming',
  'Training',
  'Treats'
]

const statusOptions = [
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' },
  { title: 'Draft', value: 'draft' },
  { title: 'Out of Stock', value: 'out_of_stock' }
]

const rules = {
  required: (value: any) => !!value || 'This field is required',
  positiveNumber: (value: number) => value > 0 || 'Must be a positive number',
  positiveInteger: (value: number) => (value > 0 && Number.isInteger(value)) || 'Must be a positive integer'
}

const isEditing = computed(() => !!route.params.id)

// Auto-generate slug from product name
watch(() => product.value.name, (newName) => {
  if (newName && !product.value.slug) {
    product.value.slug = newName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
})

const saveProduct = async () => {
  if (!form.value.validate()) return
  
  try {
    if (isEditing.value) {
      // TODO: Update existing product
      console.log('Updating product:', product.value)
    } else {
      // TODO: Create new product
      console.log('Creating product:', product.value)
    }
    
    router.push('/products')
  } catch (error) {
    console.error('Error saving product:', error)
  }
}

const saveDraft = async () => {
  try {
    product.value.status = 'draft'
    // TODO: Save as draft
    console.log('Saving draft:', product.value)
    router.push('/products')
  } catch (error) {
    console.error('Error saving draft:', error)
  }
}

const loadProduct = async () => {
  if (isEditing.value) {
    const productId = route.params.id
    // TODO: Load product data
    console.log('Loading product:', productId)
    
    // Mock data for demonstration
    product.value = {
      id: Number(productId),
      name: 'Premium Dog Food',
      category: 'Dog Food',
      sku: 'PDF001',
      description: 'High-quality premium dog food for adult dogs',
      price: 29.99,
      costPrice: 15.00,
      stock: 100,
      brand: 'PetSmart Premium',
      status: 'active',
      featured: true,
      metaTitle: 'Premium Dog Food - PetSmart',
      metaDescription: 'High-quality premium dog food for adult dogs. Made with natural ingredients.',
      slug: 'premium-dog-food'
    }
  }
}

onMounted(() => {
  loadProduct()
})
</script>
