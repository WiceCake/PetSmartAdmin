import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Regular client for user operations with enhanced connection handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
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
})

// Admin client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'petsmart-admin-service'
    }
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          profile_pic: string | null
          phone_number: string | null
          birthdate: string | null
          created_at: string | null
          first_name: string | null
          last_name: string | null
          mobile_number: string | null
          bio: string | null
          updated_at: string | null
          profile_visibility: boolean | null
          data_sharing_enabled: boolean | null
          two_factor_enabled: boolean | null
          last_password_change: string | null
          security_notifications: boolean | null
          is_active: boolean | null
        }
        Insert: {
          id: string
          username?: string | null
          profile_pic?: string | null
          phone_number?: string | null
          birthdate?: string | null
          created_at?: string | null
          first_name?: string | null
          last_name?: string | null
          mobile_number?: string | null
          bio?: string | null
          updated_at?: string | null
          email_verified?: boolean | null
          profile_visibility?: boolean | null
          data_sharing_enabled?: boolean | null
          two_factor_enabled?: boolean | null
          last_password_change?: string | null
          security_notifications?: boolean | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          username?: string | null
          profile_pic?: string | null
          phone_number?: string | null
          birthdate?: string | null
          created_at?: string | null
          first_name?: string | null
          last_name?: string | null
          mobile_number?: string | null
          bio?: string | null
          updated_at?: string | null
          email_verified?: boolean | null
          profile_visibility?: boolean | null
          data_sharing_enabled?: boolean | null
          two_factor_enabled?: boolean | null
          last_password_change?: string | null
          security_notifications?: boolean | null
          is_active?: boolean | null
        }
      }
      pets: {
        Row: {
          id: string
          user_id: string | null
          name: string
          type: string | null
          gender: string | null
          created_at: string | null
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          type?: string | null
          gender?: string | null
          created_at?: string | null
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          type?: string | null
          gender?: string | null
          created_at?: string | null
          is_active?: boolean | null
          updated_at?: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string | null
          pet_id: string | null
          appointment_date: string
          appointment_time: string
          status: string | null
          created_at: string | null
          day_slot_id: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          pet_id?: string | null
          appointment_date: string
          appointment_time: string
          status?: string | null
          created_at?: string | null
          day_slot_id?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          pet_id?: string | null
          appointment_date?: string
          appointment_time?: string
          status?: string | null
          created_at?: string | null
          day_slot_id?: string | null
          updated_at?: string | null
        }
      }
      day_slots: {
        Row: {
          id: string
          day_of_week: string
          time_slot: string
          is_active: boolean | null
          max_capacity: number
          end_time: string
        }
        Insert: {
          id?: string
          day_of_week: string
          time_slot: string
          is_active?: boolean | null
          max_capacity: number
          end_time: string
        }
        Update: {
          id?: string
          day_of_week?: string
          time_slot?: string
          is_active?: boolean | null
          max_capacity?: number
          end_time?: string
        }
      }
      products: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number
          created_at: string | null
          quantity: number
          discount_percentage: number | null
          original_price: number | null
          is_on_sale: boolean | null
          sale_start_date: string | null
          sale_end_date: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          price: number
          created_at?: string | null
          quantity: number
          discount_percentage?: number | null
          original_price?: number | null
          is_on_sale?: boolean | null
          sale_start_date?: string | null
          sale_end_date?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number
          created_at?: string | null
          quantity?: number
          discount_percentage?: number | null
          original_price?: number | null
          is_on_sale?: boolean | null
          sale_start_date?: string | null
          sale_end_date?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          total_amount: number
          status: string | null
          confirmed_by_user: boolean | null
          created_at: string | null
          delivery_address_id: string | null
          delivery_fee: number | null
          tax_amount: number | null
          subtotal: number | null
          estimated_delivery_date: string | null
          delivered_at: string | null
          confirmed_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          total_amount: number
          status?: string | null
          confirmed_by_user?: boolean | null
          created_at?: string | null
          delivery_address_id?: string | null
          delivery_fee?: number | null
          tax_amount?: number | null
          subtotal?: number | null
          estimated_delivery_date?: string | null
          delivered_at?: string | null
          confirmed_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          total_amount?: number
          status?: string | null
          confirmed_by_user?: boolean | null
          created_at?: string | null
          delivery_address_id?: string | null
          delivery_fee?: number | null
          tax_amount?: number | null
          subtotal?: number | null
          estimated_delivery_date?: string | null
          delivered_at?: string | null
          confirmed_at?: string | null
          notes?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string | null
          receiver_id: string | null
          message: string
          sent_at: string | null
        }
        Insert: {
          id?: string
          sender_id?: string | null
          receiver_id?: string | null
          message: string
          sent_at?: string | null
        }
        Update: {
          id?: string
          sender_id?: string | null
          receiver_id?: string | null
          message?: string
          sent_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          data: any | null
          is_read: boolean | null
          created_at: string | null
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          data?: any | null
          is_read?: boolean | null
          created_at?: string | null
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          data?: any | null
          is_read?: boolean | null
          created_at?: string | null
          read_at?: string | null
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string | null
          created_by: string | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          email: string
          role: string
          created_at?: string | null
          created_by?: string | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          email?: string
          role?: string
          created_at?: string | null
          created_by?: string | null
          is_active?: boolean | null
        }
      }
    }
  }
}
