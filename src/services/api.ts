import { supabase, supabaseAdmin } from '@/config/supabase'
import type { Database } from '@/config/supabase'

// Enhanced error handling and retry logic
class ApiError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message)
    this.name = 'ApiError'
  }
}

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 5000
}

// Enhanced API wrapper with retry logic
async function withRetry<T>(
  operation: () => Promise<T>,
  context: string,
  maxAttempts = RETRY_CONFIG.maxAttempts
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      console.warn(`${context} attempt ${attempt}/${maxAttempts} failed:`, error.message)

      // Don't retry on certain errors
      if (error.code === 'PGRST301' || error.code === 'PGRST116' || attempt === maxAttempts) {
        break
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1),
        RETRY_CONFIG.maxDelay
      )

      console.log(`Retrying ${context} in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw new ApiError(
    `${context} failed after ${maxAttempts} attempts: ${lastError?.message}`,
    lastError?.code,
    lastError
  )
}

// Type aliases for better readability
type Tables = Database['public']['Tables']
type Profile = Tables['profiles']['Row']
type Pet = Tables['pets']['Row']
type Appointment = Tables['appointments']['Row']
type DaySlot = Tables['day_slots']['Row']
type Product = Tables['products']['Row']
type Order = Tables['orders']['Row']
type Message = Tables['messages']['Row']
type Notification = Tables['notifications']['Row']

export class ApiService {
  // Dashboard Analytics
  static async getDashboardMetrics() {
    return withRetry(async () => {
      const { data, error } = await supabase.rpc('calculate_dashboard_metrics')
      if (error) throw error
      return { data, error: null }
    }, 'Dashboard metrics fetch').catch(error => {
      console.error('Error fetching dashboard metrics:', error)
      return { data: null, error }
    })
  }

  // User Management
  static async getUsers(page = 1, limit = 10, search = '') {
    try {
      // Get admin user emails to exclude them from the results
      const { data: adminUsers, error: adminError } = await supabaseAdmin
        .from('admin_users')
        .select('email')
        .eq('is_active', true)

      const adminEmails = adminUsers?.map(admin => admin.email) || []

      // First get the total count for pagination (excluding admin users and inactive users)
      let countQuery = supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (search) {
        countQuery = countQuery.or(`username.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
      }

      const { count } = await countQuery

      // Then get the actual data with joins
      const { data: profilesData, error: profilesError } = await supabaseAdmin
        .rpc('get_users_with_email_and_stats', {
          page_number: page,
          page_size: limit,
          search_term: search || ''
        })

      if (profilesError) {
        // Fallback to direct query if RPC doesn't exist
        let query = supabaseAdmin
          .from('profiles')
          .select(`
            *,
            pets:pets(count),
            orders:orders(count),
            appointments:appointments(count)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (search) {
          query = query.or(`username.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
        }

        const { data, error } = await query
          .range((page - 1) * limit, page * limit - 1)

        if (error) throw error

        // Get email data separately
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

        if (!authError && authUsers) {
          const emailMap = new Map(authUsers.users.map(user => [user.id, {
            email: user.email
          }]))

          const enrichedData = data?.map(user => ({
            ...user,
            email: emailMap.get(user.id)?.email || ''
          }))
          .filter(user => !adminEmails.includes(user.email)) // Filter out admin users

          // Recalculate count after filtering
          const filteredCount = enrichedData?.length || 0
          const totalFilteredCount = count ? Math.max(0, count - adminEmails.length) : 0

          return { data: enrichedData, error: null, count: totalFilteredCount }
        }

        // Filter out admin users from data
        const filteredData = data?.filter(user => {
          // Since we don't have email in profiles, we need to check against auth users
          return true // Will be filtered in the email enrichment step above
        })

        return { data: filteredData, error: null, count: count || 0 }
      }

      // Filter out admin users from RPC results
      const filteredProfilesData = profilesData?.filter(user =>
        !adminEmails.includes(user.email)
      )

      // Recalculate count after filtering
      const totalFilteredCount = count ? Math.max(0, count - adminEmails.length) : 0

      return { data: filteredProfilesData, error: null, count: totalFilteredCount }
    } catch (error) {
      console.error('Error fetching users:', error)
      return { data: null, error, count: 0 }
    }
  }

  static async getUserById(id: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select(`
          *,
          pets:pets(*),
          orders:orders(*),
          appointments:appointments(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      // Get email data from auth.users
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(id)

      if (!authError && authUser) {
        return {
          data: {
            ...data,
            email: authUser.user.email || ''
          },
          error: null
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching user:', error)
      return { data: null, error }
    }
  }

  static async updateUser(id: string, updates: Partial<Profile>) {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating user:', error)
      return { data: null, error }
    }
  }

  static async createUser(userData: {
    email: string
    password: string
    first_name: string
    last_name: string
    username: string
    mobile_number?: string
    bio?: string
  }) {
    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      })

      if (authError) throw authError

      // Create profile
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          mobile_number: userData.mobile_number || null,
          bio: userData.bio || null,
          profile_visibility: true
        })
        .select()
        .single()

      if (profileError) {
        // Cleanup auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        throw profileError
      }

      return {
        data: {
          ...profileData,
          email: userData.email
        },
        error: null
      }
    } catch (error) {
      console.error('Error creating user:', error)
      return { data: null, error }
    }
  }

  static async deleteUser(id: string) {
    try {
      // Soft delete: mark user as inactive instead of hard delete
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (profileError) throw profileError

      // Optionally disable the auth user (soft delete in auth system)
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        ban_duration: 'none', // This effectively disables the user
        user_metadata: {
          ...{}, // preserve existing metadata
          is_deleted: true,
          deleted_at: new Date().toISOString()
        }
      })

      if (authError) {
        console.warn('Failed to disable auth user, but profile was marked inactive:', authError)
      }

      return { error: null }
    } catch (error) {
      console.error('Error deleting user:', error)
      return { error }
    }
  }

  static async resetUserPassword(userId: string, newPassword: string) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error resetting user password:', error)
      return { data: null, error }
    }
  }

  // Pet Management
  static async getPets(page = 1, limit = 10, search = '', type = '') {
    try {
      // First get the total count for pagination (including all pets for admin dashboard)
      // Use supabaseAdmin to bypass RLS and see all pets in admin dashboard
      let countQuery = supabaseAdmin
        .from('pets')
        .select('*', { count: 'exact', head: true })

      if (search) {
        countQuery = countQuery.or(`name.ilike.%${search}%,type.ilike.%${search}%`)
      }
      
      if (type) {
        countQuery = countQuery.eq('type', type) // Apply type filter to count query
      }

      const { count } = await countQuery

      // Then get the actual data
      let query = supabaseAdmin
        .from('pets')
        .select(`
          *,
          owner:profiles(id, username, first_name, last_name)
        `)
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`name.ilike.%${search}%,type.ilike.%${search}%`)
      }
      
      if (type) {
        query = query.eq('type', type) // Apply type filter to data query
      }

      const { data, error } = await query
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error
      return { data, error: null, count }
    } catch (error) {
      console.error('Error fetching pets:', error)
      return { data: null, error, count: 0 }
    }
  }

  static async getPetById(id: string) {
    try {
      // Use supabaseAdmin to bypass RLS and see all pets in admin dashboard
      const { data, error } = await supabaseAdmin
        .from('pets')
        .select(`
          *,
          owner:profiles(id, username, first_name, last_name, mobile_number)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching pet:', error)
      return { data: null, error }
    }
  }

  static async createPet(pet: { name: string; type?: string; gender?: string; user_id: string }) {
    try {
      // Validate required fields
      if (!pet.name || !pet.user_id) {
        throw new Error('Pet name and user_id are required')
      }

      const insertData = {
        name: pet.name,
        type: pet.type || null,
        gender: pet.gender || null,
        user_id: pet.user_id,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Use regular supabase client with user authentication for RLS policies
      const { data, error } = await supabase
        .from('pets')
        .insert(insertData)
        .select(`
          *,
          owner:profiles(id, username, first_name, last_name)
        `)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error creating pet:', error)
      return { data: null, error }
    }
  }

  static async updatePet(id: string, updates: { name?: string; type?: string; gender?: string }) {
    try {
      // Use regular supabase client with user authentication for RLS policies
      const { data, error } = await supabase
        .from('pets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          owner:profiles(id, username, first_name, last_name)
        `)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating pet:', error)
      return { data: null, error }
    }
  }

  static async deletePet(id: string) {
    try {
      // Soft delete: mark pet as inactive instead of hard delete
      // Use regular supabase client with user authentication for RLS policies
      const { error: petError } = await supabase
        .from('pets')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (petError) throw petError

      return { error: null }
    } catch (error) {
      console.error('Error deleting pet:', error)
      return { error }
    }
  }

  // Appointment Management
  static async getAppointments(page = 1, limit = 10, status = '', date = '', search = '') {
    try {
      console.log('API: Fetching appointments with params:', { page, limit, status, date, search })

      let query = supabaseAdmin
        .from('appointments')
        .select(`
          *,
          pets!inner(name, type),
          profiles!inner(username, first_name, last_name)
        `, { count: 'exact' })
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: true })

      if (status) {
        query = query.eq('status', status)
      }

      if (date) {
        query = query.eq('appointment_date', date)
      }

      if (search) {
        // Search in status for now - can be enhanced later
        query = query.ilike('status', `%${search}%`)
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)

      console.log('API: Raw appointment data:', { data, error, count })

      if (error) {
        console.error('API: Supabase error:', error)
        throw error
      }

      // Transform the data to match our interface
      const transformedData = data?.map(appointment => ({
        ...appointment,
        pet: appointment.pets,
        user: appointment.profiles
      })) || []

      console.log('API: Transformed appointment data:', transformedData)

      return { data: transformedData, error: null, count }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      return { data: null, error, count: 0 }
    }
  }

  static async createAppointment(appointmentData: {
    pet_id: string
    user_id: string
    appointment_date: string
    appointment_time: string
    day_slot_id: string
    status: string
  }) {
    try {
      console.log('API: Creating appointment with data:', appointmentData)

      const { data, error } = await supabaseAdmin
        .from('appointments')
        .insert({
          pet_id: appointmentData.pet_id,
          user_id: appointmentData.user_id,
          appointment_date: appointmentData.appointment_date,
          appointment_time: appointmentData.appointment_time,
          day_slot_id: appointmentData.day_slot_id,
          status: appointmentData.status,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      console.log('API: Create appointment result:', { data, error })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating appointment:', error)
      return { data: null, error }
    }
  }

  static async updateAppointmentStatus(id: string, status: string) {
    try {
      console.log('API: Updating appointment status:', { id, status })

      const { data, error } = await supabaseAdmin
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      console.log('API: Update appointment result:', { data, error })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating appointment:', error)
      return { data: null, error }
    }
  }

  // Day Slots Management
  static async getDaySlots(dayOfWeek?: string) {
    try {
      let query = supabaseAdmin
        .from('day_slots')
        .select('*')
        .eq('is_active', true)
        .order('time_slot', { ascending: true })

      if (dayOfWeek) {
        query = query.eq('day_of_week', dayOfWeek)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching day slots:', error)
      return { data: null, error }
    }
  }

  static async getAvailableTimeSlots(appointmentDate: string) {
    try {
      // Get day of week from the date
      const date = new Date(appointmentDate)
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })

      // Get all active slots for this day
      const slotsResult = await this.getDaySlots(dayOfWeek)
      if (slotsResult.error || !slotsResult.data) {
        throw slotsResult.error || new Error('No slots found')
      }

      // Get existing appointments for this date (excluding cancelled appointments)
      const { data: appointments, error: appointmentsError } = await supabaseAdmin
        .from('appointments')
        .select('day_slot_id')
        .eq('appointment_date', appointmentDate)
        .not('status', 'eq', 'Cancelled')

      if (appointmentsError) throw appointmentsError

      // Count appointments per slot
      const slotCounts = appointments?.reduce((acc: Record<string, number>, apt) => {
        if (apt.day_slot_id) {
          acc[apt.day_slot_id] = (acc[apt.day_slot_id] || 0) + 1
        }
        return acc
      }, {}) || {}

      // Filter available slots
      const availableSlots = slotsResult.data.filter(slot => {
        const currentCount = slotCounts[slot.id] || 0
        return currentCount < slot.max_capacity
      })

      return { data: availableSlots, error: null }
    } catch (error) {
      console.error('Error fetching available time slots:', error)
      return { data: null, error }
    }
  }

  // Product Management
  static async getProducts(page = 1, limit = 10, search = '') {
    try {
      let baseQuery = supabaseAdmin
        .from('products')

      // Apply search filter to base query if provided
      if (search) {
        baseQuery = baseQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }

      // Get total count with same filters
      const { count: totalCount } = await baseQuery
        .select('*', { count: 'exact', head: true })

      // Get paginated data with same filters
      const { data, error } = await baseQuery
        .select(`
          *,
          images:product_images(*)
        `)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error
      return { data, error: null, count: totalCount }
    } catch (error) {
      console.error('Error fetching products:', error)
      return { data: null, error, count: 0 }
    }
  }

  static async createProduct(product: Omit<Product, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert(product)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating product:', error)
      return { data: null, error }
    }
  }

  // Image upload methods
  static async uploadProductImage(productId: string, file: File, fileName: string) {
    try {
      const filePath = `${productId}/${fileName}`

      const { data, error } = await supabaseAdmin.storage
        .from('product-images')
        .upload(filePath, file, {
          upsert: true
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(filePath)

      return { data: { ...data, publicUrl: urlData.publicUrl }, error: null }
    } catch (error) {
      console.error('Error uploading product image:', error)
      return { data: null, error }
    }
  }

  static async saveProductImageRecord(productId: string, imageUrl: string, isThumbnail: boolean = false) {
    try {
      const { data, error } = await supabaseAdmin
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: imageUrl,
          is_thumbnail: isThumbnail
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error saving product image record:', error)
      return { data: null, error }
    }
  }

  static async deleteProductImage(imageId: string, imagePath: string) {
    try {
      // Delete from storage
      const { error: storageError } = await supabaseAdmin.storage
        .from('product-images')
        .remove([imagePath])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabaseAdmin
        .from('product_images')
        .delete()
        .eq('id', imageId)

      if (dbError) throw dbError
      return { error: null }
    } catch (error) {
      console.error('Error deleting product image:', error)
      return { error }
    }
  }

  static async createProductWithImages(productData: any, thumbnail: File | null, productImages: File[]) {
    try {
      // First create the product
      const productResult = await this.createProduct(productData)
      if (productResult.error) throw productResult.error

      const productId = productResult.data.id
      const imagePromises = []

      // Upload thumbnail if provided
      if (thumbnail) {
        const extension = thumbnail.name.split('.').pop()
        const thumbnailFileName = `thumbnail.${extension}`

        const uploadResult = await this.uploadProductImage(productId, thumbnail, thumbnailFileName)
        if (uploadResult.error) throw uploadResult.error

        imagePromises.push(
          this.saveProductImageRecord(productId, uploadResult.data.publicUrl, true)
        )
      }

      // Upload additional images
      for (let i = 0; i < productImages.length; i++) {
        const file = productImages[i]
        const extension = file.name.split('.').pop()
        const fileName = `product-${i + 1}.${extension}`

        const uploadResult = await this.uploadProductImage(productId, file, fileName)
        if (uploadResult.error) throw uploadResult.error

        imagePromises.push(
          this.saveProductImageRecord(productId, uploadResult.data.publicUrl, false)
        )
      }

      // Wait for all image records to be saved
      await Promise.all(imagePromises)

      return { data: productResult.data, error: null }
    } catch (error) {
      console.error('Error creating product with images:', error)
      return { data: null, error }
    }
  }

  static async updateProductWithImages(productId: string, productData: any, thumbnail: File | null, productImages: File[], existingImages: any[]) {
    try {
      // Update the product
      const productResult = await this.updateProduct(productId, productData)
      if (productResult.error) throw productResult.error

      const imagePromises = []

      // Upload new thumbnail if provided
      if (thumbnail) {
        // Delete existing thumbnail
        const existingThumbnail = existingImages.find(img => img.is_thumbnail)
        if (existingThumbnail) {
          const imagePath = existingThumbnail.image_url.split('/').slice(-2).join('/')
          await this.deleteProductImage(existingThumbnail.id, imagePath)
        }

        const extension = thumbnail.name.split('.').pop()
        const thumbnailFileName = `thumbnail.${extension}`

        const uploadResult = await this.uploadProductImage(productId, thumbnail, thumbnailFileName)
        if (uploadResult.error) throw uploadResult.error

        imagePromises.push(
          this.saveProductImageRecord(productId, uploadResult.data.publicUrl, true)
        )
      }

      // Upload new additional images
      for (let i = 0; i < productImages.length; i++) {
        const file = productImages[i]
        const extension = file.name.split('.').pop()
        const fileName = `product-${Date.now()}-${i + 1}.${extension}`

        const uploadResult = await this.uploadProductImage(productId, file, fileName)
        if (uploadResult.error) throw uploadResult.error

        imagePromises.push(
          this.saveProductImageRecord(productId, uploadResult.data.publicUrl, false)
        )
      }

      // Wait for all image operations to complete
      await Promise.all(imagePromises)

      return { data: productResult.data, error: null }
    } catch (error) {
      console.error('Error updating product with images:', error)
      return { data: null, error }
    }
  }

  static async updateProduct(id: string, updates: Partial<Product>) {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating product:', error)
      return { data: null, error }
    }
  }

  static async deleteProduct(id: string) {
    try {
      const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error deleting product:', error)
      return { error }
    }
  }

  // Order Management
  static async getOrders(page = 1, limit = 10, status = '') {
    try {
      let query = supabaseAdmin
        .from('orders')
        .select(`
          *,
          user:profiles(username, first_name, last_name),
          items:order_items(
            *,
            product:products(title, price)
          )
        `)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error
      return { data, error: null, count }
    } catch (error) {
      console.error('Error fetching orders:', error)
      return { data: null, error, count: 0 }
    }
  }

  static async updateOrderStatus(id: string, status: string, notes = '') {
    try {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Log status change
      await supabaseAdmin
        .from('order_status_history')
        .insert({
          order_id: id,
          status,
          notes,
          changed_by: (await supabase.auth.getUser()).data.user?.id
        })

      return { data, error: null }
    } catch (error) {
      console.error('Error updating order status:', error)
      return { data: null, error }
    }
  }

  // Message Management
  static async getMessages(page = 1, limit = 10) {
    try {
      const { data, error, count } = await supabaseAdmin
        .from('messages')
        .select(`
          *,
          sender:sender_id(username, first_name, last_name),
          receiver:receiver_id(username, first_name, last_name)
        `)
        .order('sent_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error
      return { data, error: null, count }
    } catch (error) {
      console.error('Error fetching messages:', error)
      return { data: null, error, count: 0 }
    }
  }

  static async sendMessage(receiverId: string, message: string) {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabaseAdmin
        .from('messages')
        .insert({
          sender_id: user.user.id,
          receiver_id: receiverId,
          message
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error sending message:', error)
      return { data: null, error }
    }
  }

  // Notification Management
  static async createNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .insert(notification)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating notification:', error)
      return { data: null, error }
    }
  }

  static async broadcastNotification(title: string, message: string, type = 'info') {
    try {
      // Get all user IDs
      const { data: users, error: usersError } = await supabaseAdmin
        .from('profiles')
        .select('id')

      if (usersError) throw usersError

      // Create notifications for all users
      const notifications = users.map(user => ({
        user_id: user.id,
        title,
        message,
        type,
        is_read: false
      }))

      const { data, error } = await supabaseAdmin
        .from('notifications')
        .insert(notifications)
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error broadcasting notification:', error)
      return { data: null, error }
    }
  }

  // Analytics
  static async getAnalytics(timeframe = '30d') {
    try {
      const days = parseInt(timeframe.replace('d', ''))
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Revenue analytics
      const { data: revenueData, error: revenueError } = await supabaseAdmin
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', startDate.toISOString())
        .not('status', 'eq', 'cancelled')

      if (revenueError) throw revenueError

      // User registration analytics
      const { data: userGrowth, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())

      if (userError) throw userError

      return {
        data: {
          revenue: revenueData,
          userGrowth
        },
        error: null
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      return { data: null, error }
    }
  }
}
