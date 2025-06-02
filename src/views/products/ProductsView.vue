<template>
  <div class="products-view">
    <!-- Enhanced Professional Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Product Management</h1>
          <p class="page-subtitle">Manage your pet store's product catalog, inventory, and pricing</p>
        </div>
        <div class="header-actions">
          <v-btn
            color="primary"
            size="large"
            variant="flat"
            prepend-icon="mdi-plus"
            class="add-product-btn"
            @click="showNewProductDialog = true"
          >
            Add New Product
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <v-row class="stats-section mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" class="stats-card" elevation="2">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon-container me-3">
                <v-icon icon="mdi-package-variant" size="32" color="primary" />
              </div>
              <div>
                <div class="text-h5 font-weight-bold">{{ totalProducts }}</div>
                <div class="text-body-2 text-on-surface-variant">Total Products</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" class="stats-card" elevation="2">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon-container me-3">
                <v-icon icon="mdi-check-circle" size="32" color="success" />
              </div>
              <div>
                <div class="text-h5 font-weight-bold">{{ activeProducts }}</div>
                <div class="text-body-2 text-on-surface-variant">Active Products</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" class="stats-card" elevation="2">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon-container me-3">
                <v-icon icon="mdi-alert-circle" size="32" color="warning" />
              </div>
              <div>
                <div class="text-h5 font-weight-bold">{{ lowStockProducts }}</div>
                <div class="text-body-2 text-on-surface-variant">Low Stock</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" class="stats-card" elevation="2">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon-container me-3">
                <v-icon icon="mdi-currency-php" size="32" color="info" />
              </div>
              <div>
                <div class="text-h5 font-weight-bold">₱{{ totalValue.toLocaleString() }}</div>
                <div class="text-body-2 text-on-surface-variant">Total Value</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Enhanced Filters Section -->
    <v-card rounded="xl" class="filters-card mb-6" elevation="2">
      <v-card-text class="pa-6">
        <div class="filters-header mb-4">
          <h3 class="text-h6 font-weight-bold">Filter & Search Products</h3>
          <p class="text-body-2 text-medium-emphasis">Find products by name, category, or stock status</p>
        </div>

        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="Search products..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="debouncedSearch"
              class="search-field"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="selectedCategory"
              label="Category"
              :items="categoryOptions"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="handleCategoryFilter"
              class="filter-select"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="selectedStatus"
              label="Stock Status"
              :items="statusOptions"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="handleStatusFilter"
              class="filter-select"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="selectedPriceRange"
              label="Price Range"
              :items="priceRangeOptions"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="handlePriceFilter"
              class="filter-select"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-btn
              color="primary"
              variant="outlined"
              size="large"
              block
              @click="resetFilters"
              class="reset-btn"
            >
              <v-icon start>mdi-refresh</v-icon>
              Reset
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Enhanced Products Table -->
    <v-card rounded="xl" class="products-table-card" elevation="2">
      <v-card-title class="table-header pa-6">
        <div class="d-flex align-center justify-space-between w-100">
          <div>
            <h3 class="text-h6 font-weight-bold">Products Catalog</h3>
            <p class="text-body-2 text-medium-emphasis">{{ totalProducts }} products found</p>
          </div>
          <div class="d-flex align-center view-toggle-buttons">
            <v-btn
              variant="outlined"
              size="small"
              prepend-icon="mdi-view-grid"
              @click="viewMode = 'grid'"
              :color="viewMode === 'grid' ? 'primary' : 'default'"
              class="view-toggle-btn"
            >
              Grid
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              prepend-icon="mdi-view-list"
              @click="viewMode = 'table'"
              :color="viewMode === 'table' ? 'primary' : 'default'"
              class="view-toggle-btn"
            >
              Table
            </v-btn>
          </div>
        </div>
      </v-card-title>

      <v-divider />

      <!-- Table View -->
      <div v-if="viewMode === 'table'" class="table-container">
        <v-data-table
          :headers="tableHeaders"
          :items="products"
          :loading="loading"
          :items-per-page="itemsPerPage"
          hide-default-footer
          class="products-table"
        >
          <!-- Product Image & Name -->
          <template #item.title="{ item }">
            <div class="d-flex align-center py-2">
              <v-avatar size="48" rounded="lg" class="me-3">
                <v-img
                  :src="item.images?.[0]?.image_url || '/placeholder-product.png'"
                  cover
                />
              </v-avatar>
              <div>
                <div class="font-weight-bold text-truncate" style="max-width: 200px;">
                  {{ item.title }}
                </div>
                <div class="text-caption text-medium-emphasis text-truncate" style="max-width: 200px;">
                  {{ item.description }}
                </div>
              </div>
            </div>
          </template>

          <!-- Price -->
          <template #item.price="{ item }">
            <div>
              <div class="font-weight-bold text-primary">
                ₱{{ Number(item.price).toLocaleString() }}
              </div>
              <div v-if="item.is_on_sale" class="text-caption text-decoration-line-through text-medium-emphasis">
                ₱{{ Number(item.original_price || 0).toLocaleString() }}
              </div>
            </div>
          </template>

          <!-- Stock Status -->
          <template #item.quantity="{ item }">
            <v-chip
              :color="getStockColor(item.quantity)"
              size="small"
              variant="tonal"
            >
              <v-icon start :icon="getStockIcon(item.quantity)" size="16" />
              {{ item.quantity }} units
            </v-chip>
          </template>

          <!-- Sale Status -->
          <template #item.is_on_sale="{ item }">
            <v-chip
              v-if="item.is_on_sale"
              color="error"
              size="small"
              variant="tonal"
            >
              {{ item.discount_percentage }}% OFF
            </v-chip>
            <span v-else class="text-medium-emphasis">—</span>
          </template>

          <!-- Created Date -->
          <template #item.created_at="{ item }">
            <div class="text-body-2">
              {{ formatDate(item.created_at) }}
            </div>
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <div class="d-flex align-center gap-1">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="primary"
                @click="editProduct(item)"
                title="Edit Product"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="confirmDelete(item)"
                title="Delete Product"
              />
            </div>
          </template>
        </v-data-table>
      </div>

      <!-- Grid View -->
      <div v-else class="grid-container pa-6">
        <v-row>
          <v-col
            v-for="product in products"
            :key="product.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card class="product-card" elevation="3" rounded="xl">
              <!-- Product Image -->
              <v-img
                :src="product.images?.[0]?.image_url || '/placeholder-product.png'"
                height="200"
                cover
                class="product-image"
              >
                <div class="d-flex justify-space-between pa-3">
                  <v-chip
                    v-if="product.is_on_sale"
                    color="error"
                    size="small"
                    variant="elevated"
                  >
                    {{ product.discount_percentage }}% OFF
                  </v-chip>
                  <v-spacer />
                  <v-chip
                    :color="getStockColor(product.quantity)"
                    size="small"
                    variant="elevated"
                  >
                    {{ product.quantity > 0 ? 'In Stock' : 'Out of Stock' }}
                  </v-chip>
                </div>
              </v-img>

              <!-- Product Info -->
              <v-card-text class="pa-4">
                <h3 class="text-h6 font-weight-bold mb-2 text-truncate">
                  {{ product.title }}
                </h3>
                <p class="text-body-2 text-medium-emphasis mb-3 line-clamp-2">
                  {{ product.description }}
                </p>

                <!-- Price -->
                <div class="d-flex align-center justify-space-between mb-3">
                  <div>
                    <span class="text-h6 font-weight-bold text-primary">
                      ₱{{ Number(product.price).toLocaleString() }}
                    </span>
                    <span v-if="product.is_on_sale" class="text-decoration-line-through text-medium-emphasis ml-2">
                      ₱{{ Number(product.original_price || 0).toLocaleString() }}
                    </span>
                  </div>
                </div>

                <!-- Stock Info -->
                <div class="d-flex align-center justify-space-between mb-3">
                  <span class="text-caption text-medium-emphasis">
                    Stock: {{ product.quantity }} units
                  </span>
                  <span class="text-caption text-medium-emphasis">
                    {{ formatDate(product.created_at) }}
                  </span>
                </div>
              </v-card-text>

              <!-- Actions -->
              <v-card-actions class="pa-4 pt-0">
                <v-btn
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-pencil"
                  @click="editProduct(product)"
                  class="flex-grow-1"
                >
                  Edit
                </v-btn>
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="confirmDelete(product)"
                  title="Delete Product"
                />
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Enhanced Pagination Footer -->
      <div v-if="!loading && totalProducts > 0" class="pagination-footer">
        <v-divider class="footer-divider" />

        <div class="footer-content">
          <div class="footer-info">
            <div class="results-summary">
              <span class="text-body-2 text-medium-emphasis">
                Showing {{ ((page - 1) * itemsPerPage) + 1 }}-{{ Math.min(page * itemsPerPage, totalProducts) }} of {{ totalProducts }} products
              </span>
            </div>

            <div class="items-per-page">
              <span class="text-body-2 text-medium-emphasis me-2">Items per page:</span>
              <v-select
                v-model="itemsPerPage"
                :items="itemsPerPageOptions"
                variant="outlined"
                density="compact"
                hide-details
                class="items-per-page-select"
                @update:model-value="handleItemsPerPageChange"
              />
            </div>
          </div>

          <div class="pagination-controls">
            <v-pagination
              v-model="page"
              :length="Math.ceil(totalProducts / itemsPerPage)"
              :total-visible="7"
              @update:model-value="loadProducts"
              density="comfortable"
              class="custom-pagination"
            />
          </div>
        </div>
      </div>
    </v-card>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center py-12">
      <div class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
          width="6"
        />
        <p class="text-body-1 text-medium-emphasis mt-4">Loading products...</p>
      </div>
    </div>

    <!-- Empty State -->
    <v-card v-if="!loading && products.length === 0" rounded="xl" class="text-center py-16" elevation="2">
      <v-icon size="80" color="grey-lighten-2" class="mb-6">mdi-package-variant-closed</v-icon>
      <h3 class="text-h4 font-weight-bold mb-3">No products found</h3>
      <p class="text-body-1 text-medium-emphasis mb-6 mx-auto" style="max-width: 400px;">
        {{ searchQuery ? 'Try adjusting your search criteria or filters' : 'Start building your product catalog by adding your first product' }}
      </p>
      <v-btn
        v-if="!searchQuery"
        color="primary"
        size="large"
        prepend-icon="mdi-plus"
        @click="showNewProductDialog = true"
      >
        Add Your First Product
      </v-btn>
      <v-btn
        v-else
        color="primary"
        variant="outlined"
        size="large"
        prepend-icon="mdi-refresh"
        @click="resetFilters"
      >
        Clear Filters
      </v-btn>
    </v-card>



    <!-- Enhanced New Product Dialog -->
    <v-dialog v-model="showNewProductDialog" max-width="800px" persistent>
      <v-card class="product-form-dialog elevation-12" rounded="xl">
        <!-- Enhanced Header -->
        <v-card-title class="dialog-header pa-0">
          <div class="header-content">
            <div class="header-icon-section">
              <v-avatar size="48" color="primary" variant="tonal">
                <v-icon size="24">mdi-package-variant-plus</v-icon>
              </v-avatar>
              <div class="header-text">
                <h2 class="header-title">{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h2>
                <p class="header-subtitle">{{ editingProduct ? 'Update product information and inventory' : 'Create a new product for your catalog' }}</p>
              </div>
            </div>
            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              class="close-btn"
              @click="closeProductDialog"
            />
          </div>
        </v-card-title>

        <v-divider class="header-divider" />

        <v-card-text class="form-content">
          <v-form ref="productFormRef" v-model="productFormValid" @submit.prevent="saveProduct">

            <!-- Basic Information Section -->
            <div class="form-section">
              <div class="section-header">
                <v-icon class="section-icon" color="primary">mdi-information</v-icon>
                <div class="section-info">
                  <h3 class="section-title">Basic Information</h3>
                  <p class="section-description">Product name and description</p>
                </div>
              </div>

              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="productForm.title"
                    label="Product Name"
                    variant="outlined"
                    :rules="[v => !!v || 'Product name is required']"
                    prepend-inner-icon="mdi-package-variant"
                    class="enhanced-field"
                    required
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="productForm.description"
                    label="Product Description"
                    variant="outlined"
                    rows="3"
                    prepend-inner-icon="mdi-text"
                    class="enhanced-field"
                  />
                </v-col>
              </v-row>
            </div>

            <!-- Pricing Section -->
            <div class="form-section">
              <div class="section-header">
                <v-icon class="section-icon" color="primary">mdi-currency-php</v-icon>
                <div class="section-info">
                  <h3 class="section-title">Pricing & Sales</h3>
                  <p class="section-description">Set product price and sale information</p>
                </div>
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="productForm.price"
                    label="Price"
                    type="number"
                    variant="outlined"
                    :rules="[v => !!v || 'Price is required', v => v > 0 || 'Price must be greater than 0']"
                    prepend-inner-icon="mdi-currency-php"
                    class="enhanced-field"
                    required
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="productForm.quantity"
                    label="Stock Quantity"
                    type="number"
                    variant="outlined"
                    :rules="[v => v >= 0 || 'Quantity cannot be negative']"
                    prepend-inner-icon="mdi-package"
                    class="enhanced-field"
                  />
                </v-col>
              </v-row>
            </div>

            <!-- Image Upload Section -->
            <div class="form-section">
              <div class="section-header">
                <v-icon class="section-icon" color="primary">mdi-image-multiple</v-icon>
                <div class="section-info">
                  <h3 class="section-title">Product Images</h3>
                  <p class="section-description">Upload thumbnail and additional product images</p>
                </div>
              </div>

              <!-- Thumbnail Upload -->
              <div class="image-upload-section mb-6">
                <h4 class="upload-section-title">
                  <v-icon class="me-2" color="primary">mdi-image</v-icon>
                  Thumbnail Image
                </h4>
                <p class="upload-section-description">Main product image (recommended: 800x800px)</p>

                <div class="thumbnail-upload-area">
                  <v-file-input
                    v-model="productForm.thumbnail"
                    accept="image/jpeg,image/png,image/webp"
                    prepend-icon=""
                    prepend-inner-icon="mdi-camera"
                    variant="outlined"
                    label="Choose thumbnail image"
                    class="thumbnail-input"
                    @change="handleThumbnailChange"
                    @click:clear="clearThumbnail"
                  />

                  <!-- Thumbnail Preview -->
                  <div v-if="thumbnailPreview" class="thumbnail-preview">
                    <v-card class="preview-card" elevation="2">
                      <v-img
                        :src="thumbnailPreview"
                        aspect-ratio="1"
                        cover
                        class="preview-image"
                      />
                      <v-card-actions class="preview-actions">
                        <v-btn
                          icon="mdi-delete"
                          size="small"
                          color="error"
                          variant="text"
                          @click="clearThumbnail"
                        />
                      </v-card-actions>
                    </v-card>
                  </div>
                </div>
              </div>

              <!-- Additional Images Upload -->
              <div class="image-upload-section">
                <h4 class="upload-section-title">
                  <v-icon class="me-2" color="primary">mdi-image-multiple</v-icon>
                  Additional Images
                </h4>
                <p class="upload-section-description">Upload multiple product images (up to 5 images)</p>

                <div class="multiple-upload-area">
                  <v-file-input
                    v-model="productForm.productImages"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    prepend-icon=""
                    prepend-inner-icon="mdi-image-plus"
                    variant="outlined"
                    label="Choose additional images"
                    class="multiple-input"
                    @change="handleProductImagesChange"
                  />

                  <!-- Images Preview Grid -->
                  <div v-if="productImagePreviews.length > 0" class="images-preview-grid">
                    <div
                      v-for="(preview, index) in productImagePreviews"
                      :key="index"
                      class="image-preview-item"
                    >
                      <v-card class="preview-card" elevation="2">
                        <v-img
                          :src="preview"
                          aspect-ratio="1"
                          cover
                          class="preview-image"
                        />
                        <v-card-actions class="preview-actions">
                          <v-btn
                            icon="mdi-delete"
                            size="small"
                            color="error"
                            variant="text"
                            @click="removeProductImage(index)"
                          />
                        </v-card-actions>
                      </v-card>
                    </div>
                  </div>

                  <!-- Existing Images (Edit Mode) -->
                  <div v-if="editingProduct && productForm.existingImages.length > 0" class="existing-images-section">
                    <h5 class="existing-images-title">Current Images</h5>
                    <div class="images-preview-grid">
                      <div
                        v-for="(image, index) in productForm.existingImages"
                        :key="image.id"
                        class="image-preview-item"
                      >
                        <v-card class="preview-card" elevation="2">
                          <v-img
                            :src="image.image_url"
                            aspect-ratio="1"
                            cover
                            class="preview-image"
                          />
                          <v-card-actions class="preview-actions">
                            <v-chip
                              v-if="image.is_thumbnail"
                              size="x-small"
                              color="primary"
                              class="thumbnail-badge"
                            >
                              Thumbnail
                            </v-chip>
                            <v-spacer />
                            <v-btn
                              icon="mdi-delete"
                              size="small"
                              color="error"
                              variant="text"
                              @click="removeExistingImage(index)"
                            />
                          </v-card-actions>
                        </v-card>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </v-form>
        </v-card-text>

        <v-divider />

        <!-- Enhanced Actions -->
        <v-card-actions class="form-actions">
          <div v-if="uploadingImages" class="upload-progress">
            <v-progress-linear
              indeterminate
              color="primary"
              class="mb-2"
            />
            <span class="text-caption text-medium-emphasis">Uploading images...</span>
          </div>
          <v-spacer />
          <v-btn
            variant="text"
            size="large"
            @click="closeProductDialog"
            :disabled="savingProduct || uploadingImages"
            class="cancel-btn"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            @click="saveProduct"
            :loading="savingProduct || uploadingImages"
            :disabled="!productFormValid"
            class="save-btn"
          >
            <v-icon start>{{ editingProduct ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
            {{ editingProduct ? 'Update Product' : 'Create Product' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>



    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="500px" persistent>
      <v-card rounded="xl" elevation="12">
        <v-card-title class="dialog-header pa-6">
          <div class="d-flex align-center">
            <v-avatar size="40" color="error" variant="tonal" class="me-3">
              <v-icon>mdi-delete-alert</v-icon>
            </v-avatar>
            <div>
              <h3 class="text-h6 font-weight-bold">Delete Product</h3>
              <p class="text-body-2 text-medium-emphasis">This action cannot be undone</p>
            </div>
          </div>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4">
            Are you sure you want to delete <strong>"{{ productToDelete?.title }}"</strong>?
          </p>
          <p class="text-body-2 text-medium-emphasis">
            This will permanently remove the product from your catalog. This action cannot be undone.
          </p>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn
            variant="text"
            @click="showDeleteDialog = false"
            :disabled="deletingProduct"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="deleteProduct"
            :loading="deletingProduct"
          >
            <v-icon start>mdi-delete</v-icon>
            Delete Product
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { debounce } from 'lodash-es'
import { useToast } from 'vue-toastification'
import { ApiService } from '@/services/api'

const router = useRouter()
const toast = useToast()

// Data
const products = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const itemsPerPage = ref(12)
const totalProducts = ref(0)
const viewMode = ref<'table' | 'grid'>('table')

// Search and Filters
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const selectedPriceRange = ref('')

// Dialog states
const showNewProductDialog = ref(false)
const showDeleteDialog = ref(false)
const editingProduct = ref(false)
const productToDelete = ref<any>(null)
const selectedProduct = ref<any>(null)

// Form states
const productFormValid = ref(false)
const productFormRef = ref<any>(null)
const savingProduct = ref(false)
const deletingProduct = ref(false)

// Image upload states
const thumbnailPreview = ref<string | null>(null)
const productImagePreviews = ref<string[]>([])
const uploadingImages = ref(false)

// Product form data
const productForm = reactive({
  title: '',
  description: '',
  price: 0,
  quantity: 0,
  thumbnail: null as File | null,
  productImages: [] as File[],
  existingImages: [] as any[]
})



// Filter options
const categoryOptions = [
  { title: 'Dog Food', value: 'dog_food' },
  { title: 'Cat Food', value: 'cat_food' },
  { title: 'Toys', value: 'toys' },
  { title: 'Accessories', value: 'accessories' },
  { title: 'Health & Care', value: 'health_care' },
  { title: 'Treats', value: 'treats' }
]

const statusOptions = [
  { title: 'In Stock', value: 'in_stock' },
  { title: 'Low Stock', value: 'low_stock' },
  { title: 'Out of Stock', value: 'out_of_stock' },
  { title: 'On Sale', value: 'on_sale' }
]

const priceRangeOptions = [
  { title: 'Under ₱100', value: '0-100' },
  { title: '₱100 - ₱500', value: '100-500' },
  { title: '₱500 - ₱1,000', value: '500-1000' },
  { title: '₱1,000 - ₱2,000', value: '1000-2000' },
  { title: 'Over ₱2,000', value: '2000+' }
]

const itemsPerPageOptions = [
  { title: '12', value: 12 },
  { title: '24', value: 24 },
  { title: '48', value: 48 },
  { title: '96', value: 96 }
]

// Table headers
const tableHeaders = [
  { title: 'Product', key: 'title', sortable: false },
  { title: 'Price', key: 'price', sortable: true },
  { title: 'Stock', key: 'quantity', sortable: true },
  { title: 'Sale', key: 'is_on_sale', sortable: false },
  { title: 'Created', key: 'created_at', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, width: '100px' }
]

// Computed properties for statistics
const activeProducts = computed(() => {
  return products.value.filter(product => product.quantity > 0).length
})

const lowStockProducts = computed(() => {
  return products.value.filter(product => product.quantity > 0 && product.quantity <= 10).length
})

const totalValue = computed(() => {
  return products.value.reduce((total, product) => {
    return total + (Number(product.price) * product.quantity)
  }, 0)
})

// Helper functions
const formatDate = (date: string) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

const getStockColor = (quantity: number) => {
  if (quantity === 0) return 'error'
  if (quantity <= 10) return 'warning'
  return 'success'
}

const getStockIcon = (quantity: number) => {
  if (quantity === 0) return 'mdi-alert-circle'
  if (quantity <= 10) return 'mdi-alert'
  return 'mdi-check-circle'
}

// Methods
const loadProducts = async () => {
  loading.value = true
  try {
    const result = await ApiService.getProducts(page.value, itemsPerPage.value, searchQuery.value)
    if (result.error) {
      throw result.error
    }
    products.value = result.data || []
    totalProducts.value = result.count || 0
  } catch (error) {
    toast.error('Failed to load products')

  } finally {
    loading.value = false
  }
}

const debouncedSearch = debounce(() => {
  page.value = 1
  loadProducts()
}, 500)

// Filter handlers
const handleCategoryFilter = () => {
  page.value = 1
  loadProducts()
}

const handleStatusFilter = () => {
  page.value = 1
  loadProducts()
}

const handlePriceFilter = () => {
  page.value = 1
  loadProducts()
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
  selectedPriceRange.value = ''
  page.value = 1
  loadProducts()
}

const handleItemsPerPageChange = () => {
  page.value = 1
  loadProducts()
}

// Product management methods
const editProduct = (product: any) => {
  editingProduct.value = true
  productForm.title = product.title
  productForm.description = product.description || ''
  productForm.price = Number(product.price)
  productForm.quantity = product.quantity

  // Load existing images
  productForm.existingImages = product.images || []

  // Set thumbnail preview if exists
  const thumbnailImage = productForm.existingImages.find(img => img.is_thumbnail)
  if (thumbnailImage) {
    thumbnailPreview.value = thumbnailImage.image_url
  }

  selectedProduct.value = product
  showNewProductDialog.value = true
}

const closeProductDialog = () => {
  showNewProductDialog.value = false
  editingProduct.value = false
  selectedProduct.value = null
  resetProductForm()
}

const resetProductForm = () => {
  productForm.title = ''
  productForm.description = ''
  productForm.price = 0
  productForm.quantity = 0
  productForm.thumbnail = null
  productForm.productImages = []
  productForm.existingImages = []

  // Clear previews
  thumbnailPreview.value = null
  productImagePreviews.value = []

  nextTick(() => {
    if (productFormRef.value) {
      productFormRef.value.resetValidation()
    }
  })
}

const saveProduct = async () => {
  if (!productFormValid.value) return

  savingProduct.value = true
  uploadingImages.value = true

  try {
    const productData = {
      title: productForm.title,
      description: productForm.description,
      price: Number(productForm.price),
      quantity: Number(productForm.quantity),
      is_on_sale: false,
      discount_percentage: null,
      original_price: null,
      sale_start_date: null,
      sale_end_date: null
    }

    let result
    if (editingProduct.value && selectedProduct.value) {
      // Update existing product with images
      result = await ApiService.updateProductWithImages(
        selectedProduct.value.id,
        productData,
        productForm.thumbnail,
        productForm.productImages,
        productForm.existingImages
      )
      toast.success('Product updated successfully')
    } else {
      // Create new product with images
      result = await ApiService.createProductWithImages(
        productData,
        productForm.thumbnail,
        productForm.productImages
      )
      toast.success('Product created successfully')
    }

    if (result.error) throw result.error

    closeProductDialog()
    await loadProducts()

  } catch (error) {

    toast.error('Failed to save product')
  } finally {
    savingProduct.value = false
    uploadingImages.value = false
  }
}

// Image handling methods
const handleThumbnailChange = (event: Event) => {
  const files = (event.target as HTMLInputElement)?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        thumbnailPreview.value = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }
}

const clearThumbnail = () => {
  productForm.thumbnail = null
  thumbnailPreview.value = null
}

const handleProductImagesChange = (event: Event) => {
  const files = (event.target as HTMLInputElement)?.files
  if (files) {
    const fileArray = Array.from(files)
    productImagePreviews.value = []

    fileArray.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        productImagePreviews.value.push(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    })
  }
}

const removeProductImage = (index: number) => {
  productImagePreviews.value.splice(index, 1)
  // Also remove from the actual files array
  if (productForm.productImages && productForm.productImages.length > index) {
    productForm.productImages.splice(index, 1)
  }
}

const removeExistingImage = (index: number) => {
  productForm.existingImages.splice(index, 1)
}

const duplicateProduct = async (product: any) => {
  try {
    const duplicatedProduct = {
      title: `${product.title} (Copy)`,
      description: product.description,
      price: Number(product.price),
      quantity: product.quantity
    }

    const result = await ApiService.createProduct(duplicatedProduct)
    if (result.error) throw result.error

    toast.success('Product duplicated successfully')
    loadProducts()
  } catch (error) {
    toast.error('Failed to duplicate product')

  }
}

const confirmDelete = (product: any) => {
  productToDelete.value = product
  showDeleteDialog.value = true
}

const deleteProduct = async () => {
  if (!productToDelete.value) return

  deletingProduct.value = true
  try {
    const result = await ApiService.deleteProduct(productToDelete.value.id)
    if (result.error) throw result.error

    toast.success('Product deleted successfully')
    showDeleteDialog.value = false
    productToDelete.value = null
    loadProducts()
  } catch (error) {
    toast.error('Failed to delete product')

  } finally {
    deletingProduct.value = false
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
/* Enhanced Products View Styling */
.products-view {
  padding: 32px;
  background: rgb(var(--v-theme-background));
  min-height: 100vh;
}

/* Professional Header */
.page-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.9);
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 1.125rem;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
  line-height: 1.4;
}

.add-product-btn {
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
  transition: all 0.3s ease;
}

.add-product-btn:hover {
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.4);
  transform: translateY(-2px);
}

/* Statistics Cards */
.stats-section {
  margin-bottom: 32px;
}

.stats-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.stats-icon-container {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Enhanced Filters */
.filters-card {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  transition: all 0.3s ease;
}

.filters-header {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.2);
  padding-bottom: 16px;
}

.search-field :deep(.v-field),
.filter-select :deep(.v-field) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.search-field :deep(.v-field:hover),
.filter-select :deep(.v-field:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.reset-btn {
  font-weight: 600;
}

/* View Toggle Buttons */
.view-toggle-buttons {
  gap: 8px;
}

.view-toggle-btn {
  font-weight: 500;
  transition: all 0.2s ease;
}

.view-toggle-btn:hover {
  transform: translateY(-1px);
}

/* Enhanced Table */
.products-table-card {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  overflow: hidden;
}

.table-header {
  background: rgb(var(--v-theme-surface-variant));
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.table-container {
  overflow-x: auto;
}

.products-table :deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.02) !important;
}

.products-table :deep(.v-data-table-header) {
  background: rgb(var(--v-theme-surface-variant));
}

.products-table :deep(.v-data-table-header th) {
  color: rgb(var(--v-theme-on-surface));
  border-bottom-color: rgba(var(--v-theme-primary), 0.1);
}

/* Enhanced Pagination Footer */
.pagination-footer {
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 0 0 20px 20px;
}

.footer-divider {
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  gap: 24px;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 32px;
}

.results-summary {
  white-space: nowrap;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
}

.items-per-page-select {
  width: 80px;
  flex-shrink: 0;
}

.items-per-page-select :deep(.v-field) {
  border-radius: 8px;
  font-size: 0.875rem;
}

.pagination-controls {
  flex-shrink: 0;
}

.custom-pagination :deep(.v-pagination__item) {
  font-weight: 500;
}

.custom-pagination :deep(.v-pagination__item--is-active) {
  background: rgba(var(--v-theme-primary), 1) !important;
  color: white !important;
}

/* Enhanced Grid */
.grid-container {
  background: transparent;
}

.product-card {
  height: 100%;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15) !important;
}

.product-image {
  position: relative;
  overflow: hidden;
}

.product-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 0%, rgba(0, 0, 0, 0.1) 100%);
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-image::before {
  opacity: 1;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

/* Enhanced Product Form Dialog */
.product-form-dialog {
  border-radius: 20px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
}

.header-icon-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.9);
  margin: 0;
}

.header-subtitle {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}

.close-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
}

.header-divider {
  border-color: rgba(var(--v-theme-primary), 0.1);
}

.form-content {
  padding: 32px;
  background: rgba(255, 255, 255, 0.98);
}

.form-section {
  margin-bottom: 32px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.section-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.section-info {
  flex: 1;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  margin: 0 0 4px 0;
}

.section-description {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
  line-height: 1.4;
}

.enhanced-field :deep(.v-field) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.enhanced-field :deep(.v-field:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.enhanced-field :deep(.v-field--focused) {
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.2);
}

.form-actions {
  padding: 24px 32px;
  background: rgba(248, 250, 252, 0.8);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.cancel-btn {
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
}

.save-btn {
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
  transition: all 0.3s ease;
}

.save-btn:hover {
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.4);
  transform: translateY(-1px);
}

/* Dark Theme Adjustments */
.v-theme--dark .products-view {
  background: rgb(var(--v-theme-background));
}

.v-theme--dark .page-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1), rgba(var(--v-theme-primary), 0.05));
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.v-theme--dark .stats-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .stats-card:hover {
  background: rgba(var(--v-theme-surface-variant), 0.4);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
}

.v-theme--dark .filters-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .products-table-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .products-table :deep(.v-data-table-header) {
  background: rgba(var(--v-theme-primary), 0.1);
}

.v-theme--dark .products-table :deep(.v-data-table-header th) {
  color: rgb(var(--v-theme-on-surface));
  border-bottom-color: rgba(var(--v-theme-primary), 0.2);
}

.v-theme--dark .products-table :deep(.v-data-table__td) {
  border-bottom-color: rgba(var(--v-theme-outline), 0.1);
  color: rgb(var(--v-theme-on-surface));
}

.v-theme--dark .pagination-footer {
  background: rgba(var(--v-theme-surface-variant), 0.5);
}

.v-theme--dark .footer-divider {
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .page-title {
  color: rgba(255, 255, 255, 0.9);
}

.v-theme--dark .page-subtitle {
  color: rgba(255, 255, 255, 0.6);
}

.v-theme--dark .header-title {
  color: rgba(255, 255, 255, 0.9);
}

.v-theme--dark .header-subtitle {
  color: rgba(255, 255, 255, 0.6);
}

.v-theme--dark .form-content {
  background: rgba(30, 30, 30, 0.98);
}

.v-theme--dark .section-header {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .section-title {
  color: rgba(255, 255, 255, 0.9);
}

.v-theme--dark .section-description {
  color: rgba(255, 255, 255, 0.6);
}

.v-theme--dark .form-actions {
  background: rgba(20, 20, 20, 0.8);
  border-top-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .cancel-btn {
  color: rgba(255, 255, 255, 0.6);
}

/* Responsive Design */
@media (max-width: 768px) {
  .products-view {
    padding: 16px;
  }

  .page-header {
    padding: 24px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .page-title {
    font-size: 2rem;
  }

  .header-icon-section {
    gap: 12px;
  }

  .form-content {
    padding: 24px;
  }

  .form-section {
    margin-bottom: 24px;
  }

  .section-header {
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
  }

  .form-actions {
    padding: 20px 24px;
  }

  /* Responsive Pagination Footer */
  .footer-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 16px 24px;
  }

  .footer-info {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .items-per-page {
    justify-content: space-between;
  }

  .pagination-controls {
    align-self: center;
  }

  .custom-pagination :deep(.v-pagination) {
    justify-content: center;
  }
}

/* Image Upload Styling */
.image-upload-section {
  margin-bottom: 24px;
}

.upload-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.upload-section-description {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 16px;
}

.thumbnail-upload-area,
.multiple-upload-area {
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
  border-radius: 12px;
  padding: 20px;
  background: rgba(var(--v-theme-primary), 0.02);
  transition: all 0.3s ease;
}

.thumbnail-upload-area:hover,
.multiple-upload-area:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  background: rgba(var(--v-theme-primary), 0.05);
}

.thumbnail-input,
.multiple-input {
  margin-bottom: 16px;
}

.thumbnail-preview {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.images-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.image-preview-item {
  position: relative;
}

.preview-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.preview-image {
  width: 120px;
  height: 120px;
  border-radius: 12px 12px 0 0;
}

.preview-actions {
  padding: 8px;
  min-height: auto;
  justify-content: center;
}

.thumbnail-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
}

.existing-images-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.existing-images-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.existing-images-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: var(--v-theme-primary);
  border-radius: 2px;
  margin-right: 12px;
}

.upload-progress {
  position: absolute;
  top: 16px;
  left: 32px;
  right: 32px;
  z-index: 1;
}

.upload-progress span {
  display: block;
  text-align: center;
  margin-top: 4px;
}
</style>
