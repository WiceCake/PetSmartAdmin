# PetSmart Admin Dashboard - Implementation Guide

This guide provides step-by-step instructions for implementing and deploying the Vue.js admin dashboard for your PetSmart Flutter application.

## 🚀 Quick Implementation Steps

### 1. Database Setup

First, apply the database modifications to your existing Supabase project:

```sql
-- Execute in Supabase SQL Editor
-- Copy and paste the entire contents of database-modifications.sql
```

Key additions:
- `admin_users` table for admin authentication
- `admin_sessions` for session tracking
- `admin_activity_logs` for audit trail
- Enhanced RLS policies for admin access

### 2. Create Admin User

After running the database modifications, create your first admin user:

```sql
-- Replace with your actual user ID from Supabase Auth
INSERT INTO admin_users (id, email, role, is_active) 
VALUES ('your-supabase-user-id', 'admin@yourdomain.com', 'super_admin', true);
```

### 3. Environment Configuration

Create your `.env` file:

```bash
cp .env.example .env
```

Update with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://jgqxknwrcxxhwylnrpfr.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 📋 Component Implementation Status

### ✅ Completed Components

1. **Authentication System**
   - Login page with admin validation
   - JWT-based authentication
   - Role-based access control

2. **Dashboard Overview**
   - Key metrics and statistics
   - Revenue charts placeholder
   - Recent activity feeds

3. **User Management**
   - User listing with search/filter
   - User profile editing
   - Account status management

4. **Product Management**
   - Product grid view
   - Create/edit/delete products
   - Sale management system

5. **Order Management**
   - Order listing and filtering
   - Status update workflow
   - Order details view

6. **Layout & Navigation**
   - Responsive sidebar navigation
   - Theme switching (light/dark)
   - Notification system

### 🔄 Components to Implement

The following components need to be created based on the established patterns:

#### Pet Management (`src/views/pets/PetsView.vue`)
```vue
<template>
  <!-- Similar structure to UsersView.vue -->
  <!-- Table showing: Pet name, type, owner, registration date -->
  <!-- Actions: View details, edit info, view appointments -->
</template>
```

#### Appointment Management (`src/views/appointments/AppointmentsView.vue`)
```vue
<template>
  <!-- Calendar view + table view toggle -->
  <!-- Filters: Date range, status, pet type -->
  <!-- Actions: Confirm, reschedule, cancel appointments -->
</template>
```

#### Messages/Chat (`src/views/messages/MessagesView.vue`)
```vue
<template>
  <!-- Chat interface for customer support -->
  <!-- User list + conversation view -->
  <!-- Real-time message updates -->
</template>
```

#### Notifications (`src/views/notifications/NotificationsView.vue`)
```vue
<template>
  <!-- Send broadcast notifications -->
  <!-- Notification templates -->
  <!-- Delivery status tracking -->
</template>
```

#### Analytics (`src/views/analytics/AnalyticsView.vue`)
```vue
<template>
  <!-- Revenue charts with Chart.js -->
  <!-- User growth analytics -->
  <!-- Product performance metrics -->
</template>
```

## 🔧 API Service Extensions

### Required API Methods

Add these methods to `src/services/api.ts`:

```typescript
// Pet Management
static async getPetsByOwner(userId: string) { /* implementation */ }
static async updatePet(id: string, updates: any) { /* implementation */ }

// Appointment Management  
static async getAppointmentsByDate(date: string) { /* implementation */ }
static async rescheduleAppointment(id: string, newDate: string, newTime: string) { /* implementation */ }

// Real-time Chat
static async getConversations() { /* implementation */ }
static async subscribeToMessages(callback: Function) { /* implementation */ }

// Analytics
static async getRevenueAnalytics(timeframe: string) { /* implementation */ }
static async getUserGrowthData(timeframe: string) { /* implementation */ }
```

## 🎨 UI Component Patterns

### Data Table Pattern
```vue
<v-data-table
  :headers="headers"
  :items="items"
  :loading="loading"
  :server-items-length="totalItems"
  @update:options="handleTableUpdate"
>
  <!-- Custom column templates -->
</v-data-table>
```

### Filter Card Pattern
```vue
<v-card class="mb-6" elevation="2">
  <v-card-text>
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field v-model="search" label="Search..." />
      </v-col>
      <!-- Additional filters -->
    </v-row>
  </v-card-text>
</v-card>
```

### Action Menu Pattern
```vue
<v-menu>
  <template v-slot:activator="{ props }">
    <v-btn icon="mdi-dots-vertical" v-bind="props" />
  </template>
  <v-list>
    <v-list-item @click="action1">Action 1</v-list-item>
    <v-list-item @click="action2">Action 2</v-list-item>
  </v-list>
</v-menu>
```

## 🔐 Security Implementation

### RLS Policy Examples

```sql
-- Allow admins to view all user data
CREATE POLICY "Admin users can view all profiles" ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Log admin activities
CREATE OR REPLACE FUNCTION log_admin_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_activity_logs (
    admin_user_id, action, resource_type, resource_id, 
    old_values, new_values
  ) VALUES (
    auth.uid(), TG_OP, TG_TABLE_NAME, 
    COALESCE(NEW.id, OLD.id),
    to_jsonb(OLD), to_jsonb(NEW)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

### Authentication Flow

1. User enters credentials on login page
2. Supabase Auth validates credentials
3. Check if user exists in `admin_users` table
4. Verify `is_active = true` status
5. Store session and redirect to dashboard

## 📊 Analytics Integration

### Chart.js Setup

```bash
npm install chart.js vue-chartjs
```

```vue
<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)
</script>
```

## 🚀 Deployment Options

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify Deployment

```bash
# Build for production
npm run build

# Deploy dist/ folder to Netlify
```

### Environment Variables for Production

Set these in your deployment platform:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
```

## 🔧 Customization Guide

### Theme Customization

Edit `src/main.ts` to customize the Vuetify theme:

```typescript
const vuetify = createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#your-brand-color',
          secondary: '#your-secondary-color',
          // ... other colors
        }
      }
    }
  }
})
```

### Adding New Pages

1. Create component in appropriate `views/` folder
2. Add route to `src/router/index.ts`
3. Add navigation item to `AppLayout.vue`
4. Implement API methods in `src/services/api.ts`

### Custom Components

Follow the established patterns:
- Use Vuetify components for consistency
- Implement proper loading states
- Add error handling with toast notifications
- Follow TypeScript best practices

## 📝 Testing Strategy

### Unit Testing Setup

```bash
npm install -D vitest @vue/test-utils
```

### E2E Testing

```bash
npm install -D cypress
```

### Testing Checklist

- [ ] Authentication flow
- [ ] CRUD operations for each entity
- [ ] Permission-based access
- [ ] Real-time updates
- [ ] Error handling
- [ ] Mobile responsiveness

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check admin_users table has correct user ID
   - Verify RLS policies are applied
   - Ensure service role key is correct

2. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

3. **Database Connection**
   - Verify Supabase project is active
   - Check environment variables
   - Test connection in Supabase dashboard

## 📚 Next Steps

1. Complete remaining view components
2. Implement real-time features
3. Add comprehensive testing
4. Set up CI/CD pipeline
5. Configure monitoring and analytics
6. Create user documentation

---

This implementation guide provides the foundation for a fully functional admin dashboard. Follow the patterns established in the completed components to implement the remaining features.
