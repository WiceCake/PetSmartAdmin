<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-btn icon @click="$router.go(-1)" class="mr-4">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h1 class="text-h4">Order Details</h1>
          <v-spacer></v-spacer>
          <v-chip
            :color="getStatusColor(order?.status)"
            text-color="white"
            large
          >
            {{ order?.status }}
          </v-chip>
        </div>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
        <div class="text-h6 mt-4">Loading order details...</div>
        <div class="text-body-2 text-medium-emphasis mt-2">Please wait while we fetch the order information</div>
      </v-col>
    </v-row>

    <v-row v-else-if="order">
      <v-col cols="12" md="8">
        <v-card class="mb-4">
          <v-card-title>Order Information</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <div class="text-subtitle-2">Order ID</div>
                <div class="text-h6">#{{ order.id.slice(-8) }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-subtitle-2">Order Date</div>
                <div class="text-h6">{{ formatDate(order.created_at) }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-subtitle-2">Customer</div>
                <div class="text-h6">{{ getCustomerName(order.user) }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-subtitle-2">Total Amount</div>
                <div class="text-h6">₱{{ Number(order.total_amount).toLocaleString() }}</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card class="mb-4">
          <v-card-title>Order Items</v-card-title>
          <v-data-table
            :headers="itemHeaders"
            :items="order.items"
            hide-default-footer
            disable-pagination
          >
            <template #[`item.name`]="{ item }">
              {{ item.product?.title || 'Unknown Product' }}
            </template>
            <template #[`item.price`]="{ item }">
              ₱{{ Number(item.price).toLocaleString() }}
            </template>
            <template #[`item.total`]="{ item }">
              ₱{{ (Number(item.price) * item.quantity).toLocaleString() }}
            </template>
          </v-data-table>
        </v-card>

        <v-card>
          <v-card-title>Order Status History</v-card-title>
          <v-timeline v-if="order.status_history && order.status_history.length > 0" dense>
            <v-timeline-item
              v-for="event in order.status_history"
              :key="event.id"
              :color="getStatusColor(event.status)"
              small
            >
              <template #opposite>
                <span class="text-caption">{{ formatDateTime(event.created_at) }}</span>
              </template>
              <div>
                <div class="text-subtitle-2">{{ getStatusText(event.status) }}</div>
                <div class="text-body-2 text-grey">{{ event.notes || 'Status updated' }}</div>
                <div v-if="event.changed_by_user" class="text-caption text-grey">
                  by {{ event.changed_by_user.first_name || event.changed_by_user.username }}
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>
          <div v-else class="pa-4 text-center text-grey">
            No status history available
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-title>Customer Information</v-card-title>
          <v-card-text>
            <div class="mb-3">
              <div class="text-subtitle-2">Name</div>
              <div>{{ getCustomerName(order.user) }}</div>
            </div>
            <div class="mb-3">
              <div class="text-subtitle-2">Username</div>
              <div>{{ order.user?.username || 'N/A' }}</div>
            </div>
            <div class="mb-3">
              <div class="text-subtitle-2">Phone</div>
              <div>{{ order.user?.phone_number || 'N/A' }}</div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="mb-4">
          <v-card-title>Order Details</v-card-title>
          <v-card-text>
            <div class="mb-3">
              <div class="text-subtitle-2">Delivery Address</div>
              <div>{{ order.delivery_address || 'N/A' }}</div>
            </div>
            <div class="mb-3">
              <div class="text-subtitle-2">Notes</div>
              <div>{{ order.notes || 'No notes' }}</div>
            </div>
            <div class="mb-3">
              <div class="text-subtitle-2">Payment Status</div>
              <v-chip :color="order.payment_status === 'paid' ? 'success' : 'warning'" size="small">
                {{ order.payment_status || 'pending' }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>Actions</v-card-title>
          <v-card-text>
            <v-btn
              color="primary"
              block
              class="mb-2"
              @click="updateOrderStatus"
            >
              Update Status
            </v-btn>
            <v-btn
              color="success"
              block
              @click="printOrder"
            >
              Print Order
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12" class="text-center py-12">
        <v-icon size="80" color="grey-lighten-2" class="mb-4">mdi-alert-circle-outline</v-icon>
        <h3 class="text-h4 font-weight-bold mb-3">Order Not Found</h3>
        <p class="text-body-1 text-medium-emphasis mb-6">
          The order you're looking for doesn't exist or has been removed.
        </p>
        <div class="d-flex justify-center gap-4">
          <v-btn
            color="primary"
            variant="outlined"
            size="large"
            prepend-icon="mdi-arrow-left"
            @click="$router.push('/orders')"
          >
            Back to Orders
          </v-btn>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-refresh"
            @click="loadOrder"
          >
            Try Again
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Status Update Dialog -->
    <v-dialog v-model="showStatusDialog" max-width="600" persistent>
      <v-card class="rounded-xl">
        <div class="dialog-header pa-6 pb-4">
          <div class="d-flex align-center">
            <v-icon color="primary" size="28" class="me-3">mdi-update</v-icon>
            <div>
              <h3 class="text-h5 font-weight-bold">Update Order Status</h3>
              <p class="text-body-2 text-medium-emphasis ma-0">
                Change the status of order #{{ order?.id?.slice(-8) }}
              </p>
            </div>
          </div>
        </div>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12">
              <div class="mb-4">
                <h4 class="text-subtitle-1 font-weight-medium mb-3">
                  <v-icon class="me-2" size="20">mdi-format-list-bulleted</v-icon>
                  Select New Status
                </h4>
                <v-select
                  v-model="selectedStatus"
                  :items="statusOptions"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  class="enhanced-field"
                  placeholder="Choose order status"
                  :disabled="updating"
                >
                  <template #selection="{ item }">
                    <div class="d-flex align-center">
                      <v-icon :color="item.raw.color" size="20" class="me-2">
                        {{ item.raw.icon }}
                      </v-icon>
                      {{ item.raw.title }}
                    </div>
                  </template>
                  <template #item="{ item, props }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-icon :color="item.raw.color" size="20">
                          {{ item.raw.icon }}
                        </v-icon>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </div>

              <div>
                <h4 class="text-subtitle-1 font-weight-medium mb-3">
                  <v-icon class="me-2" size="20">mdi-note-text</v-icon>
                  Notes (Optional)
                </h4>
                <v-textarea
                  v-model="statusNotes"
                  variant="outlined"
                  placeholder="Add notes about this status change..."
                  rows="3"
                  class="enhanced-field"
                  :disabled="updating"
                ></v-textarea>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            class="cancel-btn"
            @click="cancelStatusUpdate"
            :disabled="updating"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="update-btn"
            @click="confirmStatusUpdate"
            :loading="updating"
            :disabled="!selectedStatus"
          >
            Update Status
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { ApiService } from '@/services/api'

const route = useRoute()
const toast = useToast()
const loading = ref(true)
const order = ref<any>(null)

// Status update dialog
const showStatusDialog = ref(false)
const updating = ref(false)
const selectedStatus = ref('')
const statusNotes = ref('')

// Status options
const statusOptions = [
  { title: 'Preparing', value: 'Preparing', color: 'warning', icon: 'mdi-chef-hat' },
  { title: 'Order Confirmation', value: 'Order Confirmation', color: 'info', icon: 'mdi-check-circle-outline' },
  { title: 'Pending Delivery', value: 'Pending Delivery', color: 'primary', icon: 'mdi-truck-outline' },
  { title: 'Completed', value: 'Completed', color: 'success', icon: 'mdi-package-check' },
  { title: 'Cancelled', value: 'Cancelled', color: 'error', icon: 'mdi-close-circle-outline' }
]

const itemHeaders = [
  { title: 'Product', value: 'name' },
  { title: 'Price', value: 'price' },
  { title: 'Quantity', value: 'quantity' },
  { title: 'Total', value: 'total' }
]

// Helper functions
const getCustomerName = (user: any) => {
  if (!user) return 'Unknown Customer'
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  }
  return user.username || 'Unknown Customer'
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

const getStatusText = (status: string) => {
  if (!status) return 'Unknown'
  return status
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

const updateOrderStatus = () => {
  if (!order.value) return
  selectedStatus.value = order.value.status
  statusNotes.value = ''
  showStatusDialog.value = true
}

const confirmStatusUpdate = async () => {
  if (!order.value || !selectedStatus.value) return

  updating.value = true
  try {
    const { error } = await ApiService.updateOrderStatus(
      order.value.id,
      selectedStatus.value,
      statusNotes.value
    )

    if (error) {
      toast.error('Failed to update order status')
      return
    }

    // Update the local order data
    order.value.status = selectedStatus.value

    toast.success('Order status updated successfully')
    showStatusDialog.value = false
    statusNotes.value = ''

    // Optionally reload the order to get updated data including status history
    // await loadOrder()
  } catch (error) {

    toast.error('Failed to update order status')
  } finally {
    updating.value = false
  }
}

const cancelStatusUpdate = () => {
  showStatusDialog.value = false
  selectedStatus.value = ''
  statusNotes.value = ''
}

const printOrder = () => {
  if (!order.value) return

  // Generate print content
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order #${order.value.id.slice(-8)} - PetSmart</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .order-info { margin-bottom: 20px; }
        .order-info div { margin-bottom: 8px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items-table th { background-color: #f5f5f5; }
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
        <div><strong>Order ID:</strong> #${order.value.id.slice(-8)}</div>
        <div><strong>Date:</strong> ${formatDate(order.value.created_at)}</div>
        <div><strong>Customer:</strong> ${getCustomerName(order.value.user)}</div>
        <div><strong>Status:</strong> ${getStatusText(order.value.status)}</div>
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
          ${order.value.items?.map((item: any) => `
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
        <strong>Total Amount: ₱${Number(order.value.total_amount).toLocaleString()}</strong>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Printed on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `

  // Create print window
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) {
    toast.error('Please allow popups to print orders')
    return
  }

  printWindow.document.write(printContent)
  printWindow.document.close()

  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print()
    printWindow.close()
  }

  // Print dialog opened
}



const loadOrder = async () => {
  loading.value = true
  try {
    const orderId = route.params.id as string

    if (!orderId) {
      return
    }

    const { data, error } = await ApiService.getOrderById(orderId)

    if (error) {
      return
    }

    if (!data) {
      return
    }

    order.value = data
  } catch (error) {
    // Silent fail for order loading
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
/* Enhanced Dialog Styling */
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
</style>
