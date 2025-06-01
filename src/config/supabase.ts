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
    flowType: 'pkce' as const
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'petsmart-admin'
    }
  }
}

const supabaseAdminConfig = {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'petsmart-admin-service'
    }
  }
}

// Create clients with proper typing
let supabaseInstance: SupabaseClient<Database> | null = null
let supabaseAdminInstance: SupabaseClient<Database> | null = null

// Lazy initialization to avoid circular dependencies
export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (!supabaseInstance && supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, supabaseConfig)
  }

  if (!supabaseInstance) {
    throw new Error('Failed to initialize Supabase client. Check environment variables.')
  }

  return supabaseInstance
}

export const getSupabaseAdminClient = (): SupabaseClient<Database> => {
  if (!supabaseAdminInstance && supabaseUrl) {
    const key = supabaseServiceRoleKey || supabaseAnonKey
    if (key) {
      supabaseAdminInstance = createClient<Database>(supabaseUrl, key, supabaseAdminConfig)
    }
  }

  if (!supabaseAdminInstance) {
    throw new Error('Failed to initialize Supabase admin client. Check environment variables.')
  }

  return supabaseAdminInstance
}

// Export instances for backward compatibility with lazy initialization
let _supabase: SupabaseClient<Database> | null = null
let _supabaseAdmin: SupabaseClient<Database> | null = null

// Lazy-loaded supabase client getter
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(target, prop) {
    if (!_supabase) {
      _supabase = getSupabaseClient()
    }
    return (_supabase as any)[prop]
  }
})

// Lazy-loaded supabase admin client getter
export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(target, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = getSupabaseAdminClient()
    }
    return (_supabaseAdmin as any)[prop]
  }
})

// Re-export database types for convenience
export type { Database } from './database-types'
