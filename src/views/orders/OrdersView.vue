<template>
  <div class="orders-view">
    <!-- Enhanced Professional Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Order Management</h1>
          <p class="page-subtitle">Track and manage customer orders, payments, and deliveries</p>
        </div>
        <div class="header-actions">
          <v-btn
            color="primary"
            size="large"
            variant="outlined"
            prepend-icon="mdi-download"
            class="export-btn me-3"
            @click="exportOrders"
          >
            Export Orders
          </v-btn>
          <v-btn
            color="primary"
            size="large"
            variant="flat"
            prepend-icon="mdi-refresh"
            class="refresh-btn"
            @click="loadOrders"
            :loading="loading"
          >
            Refresh
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Enhanced Statistics Cards -->
    <v-row class="stats-section mb-6">
      <v-col
        v-for="stat in orderStats"
        :key="stat.title"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card rounded="xl" class="stats-card" elevation="2">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon-container me-3">
                <v-icon :icon="stat.icon" size="32" :color="stat.color" />
              </div>
              <div>
                <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
                <div class="text-body-2 text-on-surface-variant">{{ stat.title }}</div>
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
          <h3 class="text-h6 font-weight-bold">Filter & Search Orders</h3>
          <p class="text-body-2 text-medium-emphasis">Find orders by customer, status, date range, or order details</p>
        </div>

        <v-row class="filters-row">
          <v-col cols="12" md="4" xl="3">
            <v-text-field
              v-model="searchQuery"
              label="Search orders..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="debouncedSearch"
              class="search-field"
            />
          </v-col>
          <v-col cols="12" sm="6" md="2" xl="2">
            <v-select
              v-model="selectedStatus"
              label="Status"
              :items="statusOptions"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="handleStatusFilter"
              class="filter-select"
            />
          </v-col>
          <v-col cols="12" sm="6" md="2" xl="2">
            <v-text-field
              v-model="dateFrom"
              label="From Date"
              type="date"
              variant="outlined"
              density="comfortable"
              @update:model-value="handleDateFilter"
              class="filter-select"
            />
          </v-col>
          <v-col cols="12" sm="6" md="2" xl="2">
            <v-text-field
              v-model="dateTo"
              label="To Date"
              type="date"
              variant="outlined"
              density="comfortable"
              @update:model-value="handleDateFilter"
              class="filter-select"
            />
          </v-col>
          <v-col cols="12" sm="6" md="2" xl="2">
            <v-select
              v-model="sortBy"
              label="Sort By"
              :items="sortOptions"
              variant="outlined"
              density="comfortable"
              @update:model-value="handleSortChange"
              class="filter-select"
            />
          </v-col>
          <v-col cols="12" md="12" xl="1" class="d-flex align-end">
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

    <!-- Enhanced Orders Table -->
    <v-card rounded="xl" class="orders-table-card" elevation="2">
      <v-card-title class="table-header pa-6">
        <div class="d-flex align-center justify-space-between w-100">
          <div>
            <h3 class="text-h6 font-weight-bold">Orders Management</h3>
            <p class="text-body-2 text-medium-emphasis">{{ totalOrders }} orders found</p>
          </div>
        </div>
      </v-card-title>

      <v-divider />

      <div class="table-container">
        <v-data-table
          :headers="tableHeaders"
          :items="orders"
          :loading="loading"
          :items-per-page="itemsPerPage"
          hide-default-footer
          class="orders-table"
        >
          <!-- Order ID -->
          <template #item.id="{ item }">
            <span class="font-weight-medium">#{{ item.id.slice(-8) }}</span>
          </template>

          <!-- Customer -->
          <template #item.customer="{ item }">
            <div class="d-flex align-center py-2">
              <v-avatar size="40" color="primary" variant="tonal" class="me-3">
                <v-icon>mdi-account</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-bold text-truncate" style="max-width: 180px;">
                  {{ getCustomerName(item.user) }}
                </div>
                <div class="text-caption text-medium-emphasis text-truncate" style="max-width: 180px;">
                  {{ item.user?.username || '' }}
                </div>
              </div>
            </div>
          </template>

          <!-- Items -->
          <template #item.items="{ item }">
            <v-chip
              size="small"
              variant="tonal"
              color="info"
            >
              <v-icon start size="16">mdi-package-variant</v-icon>
              {{ item.items?.length || 0 }} item(s)
            </v-chip>
          </template>

          <!-- Total Amount -->
          <template #item.total_amount="{ item }">
            <div class="font-weight-bold text-primary">
              ₱{{ Number(item.total_amount).toLocaleString() || '0' }}
            </div>
          </template>

          <!-- Status -->
          <template #item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="tonal"
            >
              <v-icon start :icon="getStatusIcon(item.status)" size="16" />
              {{ getStatusText(item.status) }}
            </v-chip>
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
                icon="mdi-eye"
                size="small"
                variant="text"
                color="primary"
                @click="viewOrder(item)"
                title="View Order Details"
              />
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    size="small"
                    variant="text"
                    v-bind="props"
                    title="More Actions"
                  />
                </template>
                <v-list>
                  <v-list-item
                    v-for="status in availableStatuses"
                    :key="status.value"
                    @click="updateStatus(item, status.value)"
                  >
                    <v-list-item-title>Mark as {{ status.title }}</v-list-item-title>
                  </v-list-item>
                  <v-divider />
                  <v-list-item @click="printOrder(item)">
                    <v-list-item-title>Print Order</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>

          <!-- Enhanced Empty State -->
          <template #no-data>
            <div class="text-center py-16">
              <v-icon size="80" color="grey-lighten-2" class="mb-6">mdi-shopping-outline</v-icon>
              <h3 class="text-h4 font-weight-bold mb-3">No orders found</h3>
              <p class="text-body-1 text-medium-emphasis mb-6 mx-auto" style="max-width: 400px;">
                {{ searchQuery ? 'Try adjusting your search criteria or filters' : 'Orders will appear here when customers place them' }}
              </p>
              <v-btn
                v-if="searchQuery"
                color="primary"
                variant="outlined"
                size="large"
                prepend-icon="mdi-refresh"
                @click="resetFilters"
              >
                Clear Filters
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </div>

      <!-- Enhanced Pagination Footer -->
      <div v-if="!loading && totalOrders > 0" class="pagination-footer">
        <v-divider class="footer-divider" />

        <div class="footer-content">
          <div class="footer-info">
            <div class="results-summary">
              <span class="text-body-2 text-medium-emphasis">
                Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalOrders) }} of {{ totalOrders }} orders
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
              v-model="currentPage"
              :length="Math.ceil(totalOrders / itemsPerPage)"
              :total-visible="7"
              @update:model-value="handlePageChange"
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
        <p class="text-body-1 text-medium-emphasis mt-4">Loading orders...</p>
      </div>
    </div>

    <!-- Enhanced Status Update Dialog -->
    <v-dialog v-model="showStatusDialog" max-width="500px" persistent>
      <v-card rounded="xl" elevation="12">
        <v-card-title class="dialog-header pa-6">
          <div class="d-flex align-center">
            <v-avatar size="40" color="primary" variant="tonal" class="me-3">
              <v-icon>mdi-update</v-icon>
            </v-avatar>
            <div>
              <h3 class="text-h6 font-weight-bold">Update Order Status</h3>
              <p class="text-body-2 text-medium-emphasis">Change the status of order #{{ selectedOrder?.id?.slice(-8) }}</p>
            </div>
          </div>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6">
          <div class="mb-4">
            <p class="text-body-1 mb-2">
              Update order <strong>#{{ selectedOrder?.id?.slice(-8) }}</strong> to <strong>{{ getStatusText(selectedOrder?.status) }}</strong>?
            </p>
            <p class="text-body-2 text-medium-emphasis">
              This will notify the customer about the status change.
            </p>
          </div>

          <v-textarea
            v-model="statusNotes"
            label="Notes (optional)"
            variant="outlined"
            rows="3"
            placeholder="Add any notes about this status change..."
            class="enhanced-field"
          />
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn
            variant="text"
            @click="showStatusDialog = false"
            :disabled="updating"
            class="cancel-btn"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="updating"
            @click="confirmStatusUpdate"
            class="update-btn"
          >
            <v-icon start>mdi-check</v-icon>
            Update Status
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { debounce } from 'lodash-es'
import { ApiService } from '@/services/api'
import { useGlobalRealtime } from '@/composables/useGlobalRealtime'

const router = useRouter()
const toast = useToast()

// Real-time functionality
const {
  orders: realtimeOrders,
  pendingOrderCount,
  ordersLoading: realtimeLoading,
  lastOrderUpdate
} = useGlobalRealtime()

// Reactive data
const orders = ref<any[]>([])
const loading = ref(false)
const updating = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const sortBy = ref('created_at')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalOrders = ref(0)
const showStatusDialog = ref(false)
const selectedOrder = ref<any>(null)
const statusNotes = ref('')

// Stats data
const orderStats = ref([
  { title: 'Total Orders', value: '0', icon: 'mdi-shopping', color: 'primary' },
  { title: 'Preparing', value: '0', icon: 'mdi-chef-hat', color: 'warning' },
  { title: 'Completed', value: '0', icon: 'mdi-package-check', color: 'success' },
  { title: 'Total Revenue', value: '₱0', icon: 'mdi-currency-php', color: 'info' }
])

// Table configuration
const tableHeaders = [
  { title: 'Order ID', key: 'id', sortable: true },
  { title: 'Customer', key: 'customer', sortable: false },
  { title: 'Items', key: 'items', sortable: false },
  { title: 'Total', key: 'total_amount', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Date', key: 'created_at', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

const statusOptions = [
  { title: 'All Status', value: '' },
  { title: 'Preparing', value: 'Preparing' },
  { title: 'Order Confirmation', value: 'Order Confirmation' },
  { title: 'Pending Delivery', value: 'Pending Delivery' },
  { title: 'Completed', value: 'Completed' },
  { title: 'Cancelled', value: 'Cancelled' }
]

const sortOptions = [
  { title: 'Newest First', value: 'created_at' },
  { title: 'Oldest First', value: 'created_at_asc' },
  { title: 'Highest Amount', value: 'total_amount' },
  { title: 'Lowest Amount', value: 'total_amount_asc' }
]

const availableStatuses = [
  { title: 'Order Confirmation', value: 'Order Confirmation' },
  { title: 'Pending Delivery', value: 'Pending Delivery' },
  { title: 'Completed', value: 'Completed' },
  { title: 'Cancelled', value: 'Cancelled' }
]

const itemsPerPageOptions = [
  { title: '10', value: 10 },
  { title: '25', value: 25 },
  { title: '50', value: 50 },
  { title: '100', value: 100 }
]

// Computed properties
const totalPages = computed(() => Math.ceil(totalOrders.value / itemsPerPage.value))

// Real-time watchers
watch(lastOrderUpdate, (update) => {
  if (update) {
    // Show toast notification for new orders
    if (update.type === 'INSERT') {
      toast.info(`New order received: #${update.order.id.slice(-8)}`, {
        timeout: 5000
      })
    } else if (update.type === 'UPDATE') {
      toast.success(`Order #${update.order.id.slice(-8)} status updated to ${update.order.status}`, {
        timeout: 4000
      })
    }

    // Refresh the current page data to show updates
    loadOrders()
  }
}, { deep: true })

// Watch for real-time orders data changes
watch(realtimeOrders, (newOrders) => {
  // If we're on the first page and not filtering, use real-time data
  if (currentPage.value === 1 && !searchQuery.value && !selectedStatus.value && !dateFrom.value && !dateTo.value) {
    orders.value = newOrders.slice(0, itemsPerPage.value)
  }
}, { deep: true })

// Watch for pending order count changes to update stats
watch(pendingOrderCount, (newCount) => {
  if (orderStats.value[1]) {
    orderStats.value[1].value = newCount.toString()
  }
})

// Methods
const loadOrders = async () => {
  loading.value = true
  try {
    const { data, error, count } = await ApiService.getOrders(
      currentPage.value,
      itemsPerPage.value,
      selectedStatus.value,
      searchQuery.value,
      dateFrom.value,
      dateTo.value
    )

    if (error) {
      return
    }

    orders.value = data || []
    totalOrders.value = count || 0

    // Load stats
    await loadStats()
  } catch (error) {
    // Silent fail for orders loading
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const { data, error } = await ApiService.getOrderStats()

    if (error) {
      return
    }

    if (data) {
      orderStats.value[0].value = data.totalOrders.toString()
      orderStats.value[1].value = data.pendingOrders.toString()
      orderStats.value[2].value = data.completedOrders.toString()
      orderStats.value[3].value = `₱${Number(data.totalRevenue).toLocaleString()}`
    }
  } catch (error) {
    // Silent fail for stats loading
  }
}

// Event handlers
const debouncedSearch = debounce(() => {
  currentPage.value = 1
  loadOrders()
}, 500)

const handleStatusFilter = () => {
  currentPage.value = 1
  loadOrders()
}

const handleDateFilter = () => {
  currentPage.value = 1
  loadOrders()
}

const handleSortChange = () => {
  currentPage.value = 1
  loadOrders()
}

const handleTableUpdate = (options: any) => {
  currentPage.value = options.page
  itemsPerPage.value = options.itemsPerPage
  loadOrders()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadOrders()
}

const handleItemsPerPageChange = () => {
  currentPage.value = 1
  loadOrders()
}

// Utility functions
const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getCustomerName = (user: any) => {
  if (!user) return 'N/A'
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  }
  return user.username || 'N/A'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Preparing': return 'warning'
    case 'Order Confirmation': return 'info'
    case 'Pending Delivery': return 'primary'
    case 'Completed': return 'success'
    case 'Cancelled': return 'error'
    default: return 'grey'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Preparing': return 'mdi-chef-hat'
    case 'Order Confirmation': return 'mdi-check-circle-outline'
    case 'Pending Delivery': return 'mdi-truck-outline'
    case 'Completed': return 'mdi-package-check'
    case 'Cancelled': return 'mdi-close-circle-outline'
    default: return 'mdi-help-circle-outline'
  }
}

const getStatusText = (status: string) => {
  if (!status) return 'Unknown'
  return status
}

// Action handlers
const viewOrder = async (order: any) => {
  try {
    // Navigate to order detail page
    await router.push(`/orders/${order.id}`)
  } catch (error) {

  }
}

const updateStatus = (order: any, status: string) => {
  selectedOrder.value = { ...order, status }
  showStatusDialog.value = true
}

const printOrder = async (order: any) => {
  try {
    // Get detailed order data
    const { data: orderData, error } = await ApiService.getOrderById(order.id)

    if (error || !orderData) {
      toast.error('Failed to load order details for printing')
      return
    }

    // Generate print content
    const printContent = generatePrintContent(orderData)

    // Create print window with better parameters
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
    if (!printWindow) {
      toast.error('Please allow popups to print orders')
      return
    }

    // Write content and handle printing
    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()

    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        // Don't close immediately, let user close manually
      }, 500)
    }

    // Fallback if onload doesn't fire
    setTimeout(() => {
      if (printWindow && !printWindow.closed) {
        printWindow.print()
      }
    }, 1000)

  } catch (error) {
    toast.error('Failed to print order')
  }
}



const confirmStatusUpdate = async () => {
  if (!selectedOrder.value) return

  updating.value = true
  try {
    const { error } = await ApiService.updateOrderStatus(
      selectedOrder.value.id,
      selectedOrder.value.status,
      statusNotes.value
    )

    if (error) {
      toast.error('Failed to update order status')
      return
    }

    // Success toast will be shown by real-time watcher
    showStatusDialog.value = false
    statusNotes.value = ''
    await loadOrders()
  } catch (error) {

    toast.error('Failed to update order status')
  } finally {
    updating.value = false
  }
}

const exportOrders = async () => {
  try {
    // Get all orders with current filters (no pagination for export)
    const { data: allOrders, error } = await ApiService.getOrders(
      1,
      1000, // Large limit to get all orders
      selectedStatus.value,
      searchQuery.value,
      dateFrom.value,
      dateTo.value
    )

    if (error || !allOrders) {
      toast.error('Failed to fetch orders for export')
      return
    }

    // Generate CSV content
    const csvContent = generateCSVContent(allOrders)

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `orders-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`Exported ${allOrders.length} orders successfully`)
  } catch (error) {

    toast.error('Failed to export orders')
  }
}

// Helper functions
const generatePrintContent = (order: any) => {
  const customerName = getCustomerName(order.user)
  const orderDate = formatDate(order.created_at)

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order #${order.id.slice(-8)} - PetSmart</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .order-info { margin-bottom: 20px; }
        .order-info div { margin-bottom: 8px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items-table th { background-color: #f5f5f5; }
        @media (prefers-color-scheme: dark) {
          .items-table th { background-color: #333; color: #fff; }
        }
        .total { text-align: right; font-size: 18px; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>PetSmart Admin</h1>
        <h2>Order Receipt</h2>
      </div>

      <div class="order-info">
        <div><strong>Order ID:</strong> #${order.id.slice(-8)}</div>
        <div><strong>Date:</strong> ${orderDate}</div>
        <div><strong>Customer:</strong> ${customerName}</div>
        <div><strong>Status:</strong> ${getStatusText(order.status)}</div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items?.map((item: any) => `
            <tr>
              <td>${item.product?.title || 'Unknown Product'}</td>
              <td>${item.quantity}</td>
              <td>₱${Number(item.price).toLocaleString()}</td>
              <td>₱${(Number(item.price) * item.quantity).toLocaleString()}</td>
            </tr>
          `).join('') || '<tr><td colspan="4">No items found</td></tr>'}
        </tbody>
      </table>

      <div class="total">
        <strong>Total Amount: ₱${Number(order.total_amount).toLocaleString()}</strong>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Printed on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `
}

const generateCSVContent = (orders: any[]) => {
  const headers = [
    'Order ID',
    'Customer Name',
    'Customer Email',
    'Status',
    'Total Amount',
    'Items Count',
    'Order Date',
    'Notes'
  ]

  const csvRows = [
    headers.join(','),
    ...orders.map(order => {
      const customerName = getCustomerName(order.user)
      const customerEmail = order.user?.email || order.user?.username || 'N/A'
      const orderDate = formatDate(order.created_at)
      const itemsCount = order.items?.length || 0

      return [
        `"#${order.id.slice(-8)}"`,
        `"${customerName}"`,
        `"${customerEmail}"`,
        `"${getStatusText(order.status)}"`,
        `"₱${Number(order.total_amount).toLocaleString()}"`,
        itemsCount,
        `"${orderDate}"`,
        `"${order.notes || ''}"`
      ].join(',')
    })
  ]

  return csvRows.join('\n')
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  sortBy.value = 'created_at'
  currentPage.value = 1
  loadOrders()
}

onMounted(() => {
  loadOrders()
  loadStats()
})
</script>

<style scoped>
/* Enhanced Orders View Styling */
.orders-view {
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

.export-btn,
.refresh-btn {
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
  transition: all 0.3s ease;
}

.export-btn:hover,
.refresh-btn:hover {
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

.filters-row {
  align-items: end;
}

.search-field :deep(.v-field),
.filter-select :deep(.v-field) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  min-width: 0; /* Prevent field overflow */
}

.search-field :deep(.v-field:hover),
.filter-select :deep(.v-field:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.reset-btn {
  font-weight: 600;
  min-height: 56px; /* Match field height */
}

/* Ensure proper field sizing */
.filter-select :deep(.v-select__selection) {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Fix date input styling */
.filter-select :deep(.v-field__input) {
  min-height: 40px;
}

/* Enhanced Table */
.orders-table-card {
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

.orders-table :deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.02) !important;
}

.orders-table :deep(.v-data-table-header) {
  background: rgb(var(--v-theme-surface-variant));
}

.orders-table :deep(.v-data-table-header th) {
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

/* Enhanced Dialog */
.dialog-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);
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

.cancel-btn {
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
}

.update-btn {
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
  transition: all 0.3s ease;
}

.update-btn:hover {
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.4);
  transform: translateY(-1px);
}

/* Dark Theme Adjustments */
.v-theme--dark .orders-view {
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

.v-theme--dark .orders-table-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .orders-table :deep(.v-data-table-header) {
  background: rgba(var(--v-theme-primary), 0.1);
}

.v-theme--dark .orders-table :deep(.v-data-table-header th) {
  color: rgb(var(--v-theme-on-surface));
  border-bottom-color: rgba(var(--v-theme-primary), 0.2);
}

.v-theme--dark .orders-table :deep(.v-data-table__td) {
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

.v-theme--dark .cancel-btn {
  color: rgba(255, 255, 255, 0.6);
}

/* Responsive Design */
@media (max-width: 768px) {
  .orders-view {
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

  /* Responsive Filters */
  .filters-row {
    align-items: stretch;
  }

  .filters-row .v-col {
    padding-bottom: 8px;
  }

  .reset-btn {
    min-height: 48px;
    margin-top: 8px;
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

/* Medium screen adjustments */
@media (max-width: 1200px) and (min-width: 769px) {
  .filters-row {
    align-items: end;
  }

  /* Stack reset button on medium screens */
  .filters-row .v-col:last-child {
    margin-top: 16px;
  }
}
</style>
