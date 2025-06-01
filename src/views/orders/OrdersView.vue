<template>
  <div class="orders-view">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <h1 class="text-h3 font-weight-bold mb-2">Order Management</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          Track and manage customer orders
        </p>
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-end align-center">
        <v-btn
          color="primary"
          prepend-icon="mdi-download"
          variant="outlined"
          class="me-2"
          @click="exportOrders"
        >
          Export
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="$router.push('/orders/new')"
        >
          New Order
        </v-btn>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col
        v-for="stat in orderStats"
        :key="stat.title"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card elevation="2">
          <v-card-text class="d-flex align-center">
            <v-avatar
              :color="stat.color"
              size="48"
              class="me-4"
            >
              <v-icon :icon="stat.icon" color="white"></v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ stat.value }}</div>
              <div class="text-subtitle-2 text-medium-emphasis">{{ stat.title }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card class="mb-6" elevation="2">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="search"
              label="Search orders..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              @input="debouncedSearch"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="statusFilter"
              label="Status"
              :items="statusOptions"
              variant="outlined"
              density="compact"
              clearable
              @update:model-value="loadOrders"
            ></v-select>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="dateFrom"
              label="From Date"
              type="date"
              variant="outlined"
              density="compact"
              @change="loadOrders"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="dateTo"
              label="To Date"
              type="date"
              variant="outlined"
              density="compact"
              @change="loadOrders"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="sortBy"
              label="Sort By"
              :items="sortOptions"
              variant="outlined"
              density="compact"
              @update:model-value="loadOrders"
            ></v-select>
          </v-col>
          <v-col cols="12" md="1">
            <v-btn
              color="primary"
              variant="outlined"
              block
              @click="resetFilters"
            >
              Reset
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Orders Table -->
    <v-card elevation="2">
      <v-data-table
        :headers="headers"
        :items="orders"
        :loading="loading"
        :items-per-page="itemsPerPage"
        :page="page"
        :server-items-length="totalOrders"
        @update:options="handleTableUpdate"
        class="elevation-0"
      >
        <template v-slot:item.id="{ item }">
          <span class="font-weight-medium">#{{ item.id.slice(-8) }}</span>
        </template>

        <template v-slot:item.customer="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.customer_name || 'N/A' }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.customer_email || '' }}</div>
          </div>
        </template>

        <template v-slot:item.items="{ item }">
          <div class="text-caption">
            {{ item.order_items?.length || 0 }} item(s)
          </div>
        </template>

        <template v-slot:item.total_amount="{ item }">
          <span class="font-weight-medium">₱{{ item.total_amount?.toLocaleString() || '0' }}</span>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.created_at="{ item }">
          <span class="text-caption">{{ formatDate(item.created_at) }}</span>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            size="small"
            variant="text"
            @click="viewOrder(item)"
          ></v-btn>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                size="small"
                variant="text"
                v-bind="props"
              ></v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="status in availableStatuses"
                :key="status.value"
                @click="updateStatus(item, status.value)"
              >
                <v-list-item-title>Mark as {{ status.title }}</v-list-item-title>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item @click="printOrder(item)">
                <v-list-item-title>Print Order</v-list-item-title>
              </v-list-item>
              <v-list-item @click="sendNotification(item)">
                <v-list-item-title>Send Notification</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <template v-slot:no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-shopping-outline</v-icon>
            <h3 class="text-h6 mb-2">No orders found</h3>
            <p class="text-body-2 text-medium-emphasis">
              {{ search ? 'Try adjusting your search criteria' : 'Orders will appear here when customers place them' }}
            </p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Status Update Dialog -->
    <v-dialog v-model="showStatusDialog" max-width="400">
      <v-card>
        <v-card-title>Update Order Status</v-card-title>
        <v-card-text>
          <p class="mb-4">
            Update order #{{ selectedOrder?.id?.slice(-8) }} to {{ selectedStatus }}?
          </p>
          <v-textarea
            v-model="statusNotes"
            label="Notes (optional)"
            variant="outlined"
            rows="3"
            placeholder="Add any notes about this status change..."
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showStatusDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="updating"
            @click="confirmStatusUpdate"
          >
            Update Status
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { debounce } from 'lodash-es'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()

// Data
const orders = ref<any[]>([])
const loading = ref(false)
const updating = ref(false)
const search = ref('')
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const sortBy = ref('created_at')
const page = ref(1)
const itemsPerPage = ref(10)
const totalOrders = ref(0)
const showStatusDialog = ref(false)
const selectedOrder = ref<any>(null)
const selectedStatus = ref('')
const statusNotes = ref('')

// Stats
const orderStats = ref([
  { title: 'Total Orders', value: '0', icon: 'mdi-shopping', color: 'primary' },
  { title: 'Pending', value: '0', icon: 'mdi-clock', color: 'warning' },
  { title: 'Confirmed', value: '0', icon: 'mdi-check', color: 'info' },
  { title: 'Delivered', value: '0', icon: 'mdi-truck', color: 'success' }
])

// Table configuration
const headers = [
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
  { title: 'Pending', value: 'pending' },
  { title: 'Confirmed', value: 'confirmed' },
  { title: 'Processing', value: 'processing' },
  { title: 'Shipped', value: 'shipped' },
  { title: 'Delivered', value: 'delivered' },
  { title: 'Cancelled', value: 'cancelled' }
]

const sortOptions = [
  { title: 'Newest First', value: 'created_at' },
  { title: 'Oldest First', value: 'created_at_asc' },
  { title: 'Highest Amount', value: 'total_amount' },
  { title: 'Lowest Amount', value: 'total_amount_asc' }
]

const availableStatuses = [
  { title: 'Confirmed', value: 'confirmed' },
  { title: 'Processing', value: 'processing' },
  { title: 'Shipped', value: 'shipped' },
  { title: 'Delivered', value: 'delivered' },
  { title: 'Cancelled', value: 'cancelled' }
]

// Computed
const statusCounts = computed(() => {
  const counts = { total: 0, pending: 0, confirmed: 0, delivered: 0 }
  orders.value.forEach(order => {
    counts.total++
    if (order.status === 'pending') counts.pending++
    if (order.status === 'confirmed') counts.confirmed++
    if (order.status === 'delivered') counts.delivered++
  })
  return counts
})

// Methods
const loadOrders = async () => {
  loading.value = true
  try {
    // Mock data for now since ApiService might not be available
    const mockOrders = [
      {
        id: 'order-123456789',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        order_items: [{ id: 1 }, { id: 2 }],
        total_amount: 1500,
        status: 'pending',
        created_at: new Date().toISOString()
      }
    ]

    orders.value = mockOrders
    totalOrders.value = mockOrders.length

    // Update stats
    const counts = statusCounts.value
    orderStats.value[0].value = counts.total.toString()
    orderStats.value[1].value = counts.pending.toString()
    orderStats.value[2].value = counts.confirmed.toString()
    orderStats.value[3].value = counts.delivered.toString()
  } catch (error) {
    toast.error('Failed to load orders')
    console.error('Error loading orders:', error)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = debounce(() => {
  page.value = 1
  loadOrders()
}, 500)

const handleTableUpdate = (options: any) => {
  page.value = options.page
  itemsPerPage.value = options.itemsPerPage
  loadOrders()
}

const formatDate = (date: string) => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'confirmed': return 'info'
    case 'processing': return 'primary'
    case 'shipped': return 'purple'
    case 'delivered': return 'success'
    case 'cancelled': return 'error'
    default: return 'grey'
  }
}

const viewOrder = (order: any) => {
  router.push(`/orders/${order.id}`)
}

const updateStatus = (order: any, status: string) => {
  selectedOrder.value = order
  selectedStatus.value = status
  statusNotes.value = ''
  showStatusDialog.value = true
}

const confirmStatusUpdate = async () => {
  updating.value = true
  try {
    // Mock update for now
    toast.success('Order status updated successfully')
    showStatusDialog.value = false
    loadOrders()
  } catch (error) {
    toast.error('Failed to update order status')
    console.error('Error updating order status:', error)
  } finally {
    updating.value = false
  }
}

const printOrder = (order: any) => {
  toast.info('Print functionality not implemented')
}

const sendNotification = (order: any) => {
  toast.info('Notification sent to customer')
}

const exportOrders = () => {
  toast.info('Export functionality not implemented')
}

const resetFilters = () => {
  search.value = ''
  statusFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  sortBy.value = 'created_at'
  page.value = 1
  loadOrders()
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-view {
  padding: 24px;
}

.v-data-table {
  border-radius: 8px;
}
</style>
