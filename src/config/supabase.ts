import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database-types'

// Environment variable validation with fallbacks for build time
const getEnvVar = (key: string, fallback?: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || fallback || ''
  }
  // Fallback for server-side rendering or build time
  return fallback || ''
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL')
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY')
const supabaseServiceRoleKey = getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY')

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables:', {
    url: !!supabaseUrl,
    anonKey: !!supabaseAnonKey
  })

  // In development, throw error. In production, provide more graceful handling
  if (import.meta.env?.DEV) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.')
  }
}

// Supabase client configuration
const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
    storageKey: 'petsmart-admin-auth', // Unique storage key to prevent conflicts
    debug: false // Disable debug to reduce console noise
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'petsmart-admin-singleton'
    }
  }
}

// Single instance pattern to prevent multiple GoTrueClient instances
let supabaseInstance: SupabaseClient<Database> | null = null
let supabaseAdminInstance: SupabaseClient<Database> | null = null

// Initialize main Supabase client (singleton)
const initializeSupabaseClient = (): SupabaseClient<Database> => {
  if (supabaseInstance) {
    return supabaseInstance
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Failed to initialize Supabase client. Check environment variables.')
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, supabaseConfig)
  return supabaseInstance
}

// Initialize admin Supabase client (singleton) - No Auth to prevent GoTrueClient conflicts
const initializeSupabaseAdminClient = (): SupabaseClient<Database> => {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  if (!supabaseUrl) {
    throw new Error('Failed to initialize Supabase admin client. Check environment variables.')
  }

  const key = supabaseServiceRoleKey || supabaseAnonKey
  if (!key) {
    throw new Error('No service role key or anon key available for admin client.')
  }

  // Create admin client with minimal auth configuration to prevent GoTrueClient creation
  const adminConfig = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      storageKey: `petsmart-admin-service-${Date.now()}`, // Unique storage key
      storage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'petsmart-admin-service-no-auth'
      }
    }
  }

  supabaseAdminInstance = createClient<Database>(supabaseUrl, key, adminConfig)
  return supabaseAdminInstance
}

// Export getter functions (for backward compatibility)
export const getSupabaseClient = (): SupabaseClient<Database> => {
  return initializeSupabaseClient()
}

export const getSupabaseAdminClient = (): SupabaseClient<Database> => {
  return initializeSupabaseAdminClient()
}

// Export singleton instances directly
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(target, prop) {
    const client = initializeSupabaseClient()
    return (client as any)[prop]
  }
})

export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(target, prop) {
    const client = initializeSupabaseAdminClient()
    return (client as any)[prop]
  }
})

// Re-export database types for convenience
export type { Database } from './database-types'
