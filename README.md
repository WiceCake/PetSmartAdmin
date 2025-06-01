# PetSmart Admin Dashboard

A comprehensive Vue.js admin dashboard for managing the PetSmart Flutter mobile application. Built with Vue 3, Vuetify 3, and Supabase integration.

## 🚀 Features

### Core Management Interfaces
- **User Account Management** - View, edit, and manage user profiles and authentication status
- **Pet Profile Management** - Oversee all registered pets and their information
- **Appointment System** - Schedule oversight, time slot management, and status control
- **E-commerce Management** - Product catalog, inventory, orders, and sales analytics
- **Chat System Administration** - Monitor and manage customer support conversations
- **Notification System** - Send notifications and manage user preferences
- **Analytics Dashboard** - Business insights, revenue tracking, and user analytics

### Technical Features
- **Material Design UI** - Responsive design with Vuetify 3 components
- **Real-time Updates** - Live data synchronization with Supabase
- **Role-based Access** - Admin authentication and authorization
- **Audit Trail** - Activity logging for all admin actions
- **Data Export** - Export functionality for reports and analytics
- **Dark/Light Theme** - Theme switching capability

## 🛠️ Technology Stack

- **Vue.js 3** - Progressive JavaScript framework with Composition API
- **Vuetify 3** - Material Design component framework
- **TypeScript** - Type-safe JavaScript development
- **Supabase** - Backend-as-a-Service with PostgreSQL database
- **Pinia** - State management for Vue.js
- **Vue Router** - Client-side routing
- **Chart.js** - Data visualization and analytics charts
- **Vite** - Fast build tool and development server

## 📋 Prerequisites

Before setting up the admin dashboard, ensure you have:

### Required Software
- **Node.js** - Version 18.0.0 or higher
- **npm** - Version 8.0.0 or higher (or yarn/pnpm)
- **Git** - For version control

### Backend Requirements
- **Supabase Project** - Active project with the PetSmart database
- **Admin User Account** - Supabase Auth user with admin privileges

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Navigate to the admin dashboard directory
cd admin-dashboard

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy the environment template
cp .env.example .env

# Edit the .env file with your Supabase credentials
```

Required environment variables:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Database Setup

Execute the database modifications in your Supabase SQL Editor:

```bash
# Run the database modifications script
# Copy and paste the contents of database-modifications.sql into Supabase SQL Editor
```

### 4. Create Admin User

In your Supabase dashboard:

1. **Authentication > Users** - Create a new user or use existing
2. **SQL Editor** - Run the following query with your user ID:

```sql
INSERT INTO admin_users (id, email, role, is_active) 
VALUES ('your-user-id-here', 'admin@yourdomain.com', 'super_admin', true);
```

### 5. Start Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

## 📁 Project Structure

```
admin-dashboard/
├── src/
│   ├── components/          # Reusable Vue components
│   │   └── layout/         # Layout components
│   ├── config/             # Configuration files
│   │   └── supabase.ts     # Supabase client setup
│   ├── router/             # Vue Router configuration
│   ├── services/           # API service layer
│   │   └── api.ts          # Main API service
│   ├── stores/             # Pinia state management
│   │   └── auth.ts         # Authentication store
│   ├── views/              # Page components
│   │   ├── auth/           # Authentication pages
│   │   ├── users/          # User management
│   │   ├── pets/           # Pet management
│   │   ├── appointments/   # Appointment management
│   │   ├── products/       # Product management
│   │   ├── orders/         # Order management
│   │   ├── messages/       # Chat management
│   │   ├── notifications/  # Notification management
│   │   ├── analytics/      # Analytics dashboard
│   │   └── settings/       # System settings
│   ├── App.vue             # Root component
│   └── main.ts             # Application entry point
├── database-modifications.sql  # Database schema updates
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
└── README.md              # This file
```

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

## 🗄️ Database Schema

The admin dashboard requires additional tables beyond the existing PetSmart schema:

### New Tables
- **admin_users** - Admin user management
- **admin_sessions** - Session tracking
- **admin_activity_logs** - Audit trail
- **dashboard_metrics** - Cached statistics
- **system_settings** - Configuration management

### Enhanced RLS Policies
- Admin access policies for all existing tables
- Secure data access based on admin roles
- Activity logging for all admin actions

## 🔐 Authentication & Authorization

### Admin Roles
- **super_admin** - Full system access and user management
- **admin** - Standard admin access with limited user management
- **moderator** - Read-only access with basic moderation capabilities

### Security Features
- JWT-based authentication via Supabase Auth
- Row Level Security (RLS) policies
- Session management and timeout
- Activity logging and audit trail
- IP address and user agent tracking

## 📊 API Integration

### Core Services
All API interactions are handled through the `ApiService` class:

```typescript
// User management
await ApiService.getUsers(page, limit, search)
await ApiService.updateUser(id, updates)

// Product management
await ApiService.getProducts(page, limit, search)
await ApiService.createProduct(product)

// Order management
await ApiService.getOrders(page, limit, status)
await ApiService.updateOrderStatus(id, status)
```

### Real-time Features
- Live order updates
- Real-time chat monitoring
- Instant notification delivery
- Dashboard metrics refresh

## 🎨 UI Components

### Layout Components
- **AppLayout** - Main dashboard layout with navigation
- **Navigation Drawer** - Collapsible sidebar navigation
- **App Bar** - Top navigation with user menu and notifications

### Data Components
- **Data Tables** - Sortable, filterable tables with pagination
- **Charts** - Revenue and analytics visualizations
- **Cards** - Information display cards with actions
- **Forms** - Create and edit forms with validation

## 📈 Analytics & Reporting

### Dashboard Metrics
- Total users and growth trends
- Active pets and registrations
- Monthly revenue and sales
- Order status distribution
- Appointment scheduling trends

### Export Capabilities
- User data export (CSV/Excel)
- Order reports with filtering
- Revenue analytics
- Appointment schedules

## 🔔 Notification System

### Admin Notifications
- Real-time system alerts
- User activity notifications
- Order status changes
- Appointment updates

### User Communication
- Broadcast notifications to all users
- Targeted notifications by user segments
- Email and push notification integration
- Message templates and scheduling

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build

# The dist/ folder contains the production build
```

### Environment Variables for Production
```env
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
```

### Deployment Options
- **Vercel** - Automatic deployment from Git
- **Netlify** - Static site hosting with CI/CD
- **AWS S3 + CloudFront** - Scalable static hosting
- **Self-hosted** - Nginx or Apache server

## 🔧 Troubleshooting

### Common Issues

**Authentication Errors**
- Verify Supabase credentials in `.env`
- Check admin user exists in `admin_users` table
- Ensure RLS policies are properly configured

**Database Connection Issues**
- Confirm Supabase project is active
- Verify service role key has proper permissions
- Check database modifications were applied

**Build Errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Update dependencies: `npm update`
- Check TypeScript errors: `npm run type-check`

## 📚 Additional Resources

- [Vue.js Documentation](https://vuejs.org/guide/)
- [Vuetify Documentation](https://vuetifyjs.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for PetSmart Flutter Application**
