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
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <div class="mt-4">Loading order details...</div>
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
                <div class="text-h6">#{{ order.id }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-subtitle-2">Order Date</div>
                <div class="text-h6">{{ formatDate(order.createdAt) }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-subtitle-2">Customer</div>
                <div class="text-h6">{{ order.customerName }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-subtitle-2">Total Amount</div>
                <div class="text-h6">${{ order.total.toFixed(2) }}</div>
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
            <template v-slot:item.total="{ item }">
              ${{ (item.price * item.quantity).toFixed(2) }}
            </template>
          </v-data-table>
        </v-card>

        <v-card>
          <v-card-title>Order Timeline</v-card-title>
          <v-timeline dense>
            <v-timeline-item
              v-for="event in order.timeline"
              :key="event.id"
              :color="event.color"
              small
            >
              <template v-slot:opposite>
                <span class="text-caption">{{ formatDateTime(event.timestamp) }}</span>
              </template>
              <div>
                <div class="text-subtitle-2">{{ event.title }}</div>
                <div class="text-body-2 text-grey">{{ event.description }}</div>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-title>Customer Information</v-card-title>
          <v-card-text>
            <div class="mb-3">
              <div class="text-subtitle-2">Name</div>
              <div>{{ order.customerName }}</div>
            </div>
            <div class="mb-3">
              <div class="text-subtitle-2">Email</div>
              <div>{{ order.customerEmail }}</div>
            </div>
            <div class="mb-3">
              <div class="text-subtitle-2">Phone</div>
              <div>{{ order.customerPhone }}</div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="mb-4">
          <v-card-title>Shipping Address</v-card-title>
          <v-card-text>
            <div>{{ order.shippingAddress.street }}</div>
            <div>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.zipCode }}</div>
            <div>{{ order.shippingAddress.country }}</div>
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
              class="mb-2"
              @click="printOrder"
            >
              Print Order
            </v-btn>
            <v-btn
              color="info"
              block
              @click="contactCustomer"
            >
              Contact Customer
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-icon size="64" color="grey">mdi-package-variant</v-icon>
        <div class="text-h6 mt-4">Order not found</div>
        <div class="text-body-2 text-grey">The requested order could not be found</div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface TimelineEvent {
  id: number
  title: string
  description: string
  timestamp: string
  color: string
}

interface Order {
  id: number
  customerName: string
  customerEmail: string
  customerPhone: string
  status: string
  total: number
  createdAt: string
  items: OrderItem[]
  timeline: TimelineEvent[]
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

const route = useRoute()
const loading = ref(true)
const order = ref<Order | null>(null)

const itemHeaders = [
  { title: 'Product', key: 'name' },
  { title: 'Price', key: 'price' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Total', key: 'total' }
]

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'warning'
    case 'processing': return 'info'
    case 'shipped': return 'primary'
    case 'delivered': return 'success'
    case 'cancelled': return 'error'
    default: return 'grey'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const updateOrderStatus = () => {
  console.log('Update order status')
}

const printOrder = () => {
  console.log('Print order')
}

const contactCustomer = () => {
  console.log('Contact customer')
}

const loadOrder = async () => {
  loading.value = true
  const orderId = route.params.id
  
  // TODO: Implement actual data loading
  order.value = {
    id: Number(orderId),
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+1 (555) 123-4567',
    status: 'Processing',
    total: 89.97,
    createdAt: '2024-01-15T10:00:00Z',
    items: [
      { id: 1, name: 'Premium Dog Food', price: 29.99, quantity: 2 },
      { id: 2, name: 'Dog Toy Set', price: 19.99, quantity: 1 },
      { id: 3, name: 'Pet Shampoo', price: 9.99, quantity: 1 }
    ],
    timeline: [
      {
        id: 1,
        title: 'Order Placed',
        description: 'Order was successfully placed',
        timestamp: '2024-01-15T10:00:00Z',
        color: 'success'
      },
      {
        id: 2,
        title: 'Payment Confirmed',
        description: 'Payment has been processed',
        timestamp: '2024-01-15T10:05:00Z',
        color: 'success'
      },
      {
        id: 3,
        title: 'Processing',
        description: 'Order is being prepared for shipment',
        timestamp: '2024-01-15T11:00:00Z',
        color: 'info'
      }
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'USA'
    }
  }
  
  loading.value = false
}

onMounted(() => {
  loadOrder()
})
</script>
