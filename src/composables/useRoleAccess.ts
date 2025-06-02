import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export type AdminRole = 'super_admin' | 'admin'

export interface RolePermissions {
  canManageAdmins: boolean
  canAccessSystemSettings: boolean
  canPerformBackup: boolean
  canPerformMaintenance: boolean
  canManageUsers: boolean
  canManageProducts: boolean
  canManageOrders: boolean
  canViewReports: boolean
  canAccessSettings: boolean
}

export const useRoleAccess = () => {
  const authStore = useAuthStore()

  // Current user role
  const currentRole = computed<AdminRole | null>(() => {
    return authStore.adminUser?.role || null
  })

  // Check if user has specific role
  const hasRole = (role: AdminRole): boolean => {
    return currentRole.value === role
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: AdminRole[]): boolean => {
    return roles.includes(currentRole.value as AdminRole)
  }

  // Check if user is super admin
  const isSuperAdmin = computed(() => hasRole('super_admin'))

  // Check if user is regular admin
  const isAdmin = computed(() => hasRole('admin'))

  // Get role permissions
  const permissions = computed<RolePermissions>(() => {
    const role = currentRole.value

    if (role === 'super_admin') {
      return {
        canManageAdmins: true,
        canAccessSystemSettings: true,
        canPerformBackup: true,
        canPerformMaintenance: true,
        canManageUsers: true,
        canManageProducts: true,
        canManageOrders: true,
        canViewReports: true,
        canAccessSettings: true
      }
    }

    if (role === 'admin') {
      return {
        canManageAdmins: false,
        canAccessSystemSettings: false,
        canPerformBackup: false,
        canPerformMaintenance: false,
        canManageUsers: true,
        canManageProducts: true,
        canManageOrders: true,
        canViewReports: true,
        canAccessSettings: true // Limited settings access
      }
    }

    // No role or unknown role - no permissions
    return {
      canManageAdmins: false,
      canAccessSystemSettings: false,
      canPerformBackup: false,
      canPerformMaintenance: false,
      canManageUsers: false,
      canManageProducts: false,
      canManageOrders: false,
      canViewReports: false,
      canAccessSettings: false
    }
  })

  // Navigation items that should be visible based on role
  const visibleNavItems = computed(() => {
    const items = []

    // Dashboard is always visible
    items.push('dashboard')

    if (permissions.value.canManageUsers) {
      items.push('users')
    }

    items.push('pets') // Always visible for now

    items.push('appointments') // Always visible for now

    if (permissions.value.canManageProducts) {
      items.push('products')
    }

    if (permissions.value.canManageOrders) {
      items.push('orders')
    }

    // Admin Management - only for super_admin
    if (permissions.value.canManageAdmins) {
      items.push('admin-management')
    }

    if (permissions.value.canAccessSettings) {
      items.push('settings')
    }

    return items
  })

  // Settings sections that should be visible based on role
  const visibleSettingsSections = computed(() => {
    const sections = []

    // General settings - always visible for admins
    sections.push('general')

    // Notifications - always visible for admins
    sections.push('notifications')

    // Security - always visible for admins
    sections.push('security')

    // API settings - only for super_admin
    if (permissions.value.canAccessSystemSettings) {
      sections.push('api')
    }

    // Backup - only for super_admin
    if (permissions.value.canPerformBackup) {
      sections.push('backup')
    }

    return sections
  })

  return {
    currentRole,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isAdmin,
    permissions,
    visibleNavItems,
    visibleSettingsSections
  }
}
