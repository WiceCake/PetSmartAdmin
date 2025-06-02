<template>
  <v-app>
    <v-main>
      <div class="login-container">
        <!-- Background Elements -->
        <div class="background-elements">
          <div class="bg-circle bg-circle-1"></div>
          <div class="bg-circle bg-circle-2"></div>
          <div class="bg-circle bg-circle-3"></div>
        </div>

        <v-container fluid class="fill-height">
          <v-row justify="center" align="center" class="fill-height">
            <v-col cols="12" sm="8" md="6" lg="5" xl="4">
              <!-- Welcome Section -->
              <div class="welcome-section text-center mb-8">
                <div class="logo-container mb-6">
                  <AppLogo
                    context="login"
                    :clickable="false"
                    fallback-text="PetSmart"
                  />
                </div>
                <h1 class="text-h3 font-weight-bold text-white mb-2">
                  Welcome Back
                </h1>
                <p class="text-h6 text-white-lighten-2 mb-0">
                  Sign in to your admin dashboard
                </p>
              </div>

              <!-- Login Card -->
              <v-card class="login-card" elevation="24" rounded="xl">
                <v-card-text class="pa-8">
                  <div class="text-center mb-6">
                    <h2 class="text-h5 font-weight-bold text-on-surface mb-2">
                      Admin Login
                    </h2>
                    <p class="text-body-2 text-on-surface-variant">
                      Enter your credentials to continue
                    </p>
                  </div>

                  <v-form @submit.prevent="handleLogin" ref="form">
                    <!-- Email Field -->
                    <div class="form-group mb-4">
                      <label class="form-label">Email Address</label>
                      <v-text-field
                        v-model="email"
                        type="email"
                        prepend-inner-icon="mdi-email-outline"
                        variant="outlined"
                        density="comfortable"
                        :rules="emailRules"
                        :error-messages="emailError"
                        placeholder="Enter your email"
                        class="modern-input"
                        hide-details="auto"
                        required
                      />
                    </div>

                    <!-- Password Field -->
                    <div class="form-group mb-4">
                      <label class="form-label">Password</label>
                      <v-text-field
                        v-model="password"
                        :type="showPassword ? 'text' : 'password'"
                        prepend-inner-icon="mdi-lock-outline"
                        :append-inner-icon="showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                        @click:append-inner="showPassword = !showPassword"
                        variant="outlined"
                        density="comfortable"
                        :rules="passwordRules"
                        :error-messages="passwordError"
                        placeholder="Enter your password"
                        class="modern-input"
                        hide-details="auto"
                        required
                      />
                    </div>



                    <!-- Login Button -->
                    <v-btn
                      type="submit"
                      color="primary"
                      size="large"
                      block
                      :loading="authStore.loading"
                      :disabled="!isFormValid"
                      class="login-btn mb-4 mt-6"
                      rounded="lg"
                    >
                      <v-icon icon="mdi-login" class="me-2" />
                      Sign In to Dashboard
                    </v-btn>

                    <!-- Error Alert -->
                    <v-alert
                      v-if="errorMessage"
                      type="error"
                      variant="tonal"
                      rounded="lg"
                      class="error-alert"
                    >
                      <v-icon icon="mdi-alert-circle" class="me-2" />
                      {{ errorMessage }}
                    </v-alert>
                  </v-form>
                </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
      </div>
    </v-main>


  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLogo from '@/components/ui/AppLogo.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const emailError = ref('')
const passwordError = ref('')

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters'
]

const isFormValid = computed(() => {
  return email.value && password.value && 
         emailRules.every(rule => rule(email.value) === true) &&
         passwordRules.every(rule => rule(password.value) === true)
})

const handleLogin = async () => {
  errorMessage.value = ''
  emailError.value = ''
  passwordError.value = ''

  if (!form.value?.validate()) {
    return
  }

  try {
    const result = await authStore.signIn(email.value, password.value)

    if (result?.success) {
      // Wait a moment to ensure auth state is fully updated
      await new Promise(resolve => setTimeout(resolve, 100))

      // Verify that authentication state is properly set
      if (!authStore.isAuthenticated || !authStore.isAdmin) {
        errorMessage.value = 'Authentication state error. Please try again.'
        return
      }

      // Get the intended destination or default to dashboard
      const redirectUrl = authStore.getAndClearRedirectUrl()

      // Use router.replace to avoid adding login to history
      await router.replace(redirectUrl)
    } else {
      errorMessage.value = result?.error || 'Login failed. Please try again.'

      // Handle specific error types
      if (result?.error?.includes('email')) {
        emailError.value = 'Invalid email address'
      } else if (result?.error?.includes('password')) {
        passwordError.value = 'Invalid password'
      }
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Login failed. Please try again.'
  }
}


</script>

<style scoped>
/* Login Container */
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #3B82F6 100%);
  position: relative;
  overflow: hidden;
}

/* Background Elements */
.background-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  animation: float 6s ease-in-out infinite;
}

.bg-circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation-delay: 0s;
}

.bg-circle-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation-delay: 2s;
}

.bg-circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: -75px;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Welcome Section */
.welcome-section {
  animation: fadeInUp 0.8s ease-out;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 32px; /* More horizontal padding for wide wordmark */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  min-width: 280px; /* Ensure enough space for PetSmart wordmark */
}

.logo-container:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* Login Card */
.login-card {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

/* Form Styling */
.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 8px;
  letter-spacing: 0.025em;
}

.modern-input :deep(.v-field) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-input :deep(.v-field:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modern-input :deep(.v-field--focused) {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  border-color: #6366F1;
}

.modern-input :deep(.v-field__input) {
  padding: 16px;
  font-size: 0.875rem;
}



/* Login Button */
.login-btn {
  height: 56px;
  font-size: 1rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.025em;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-btn:hover {
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}

/* Error Alert */
.error-alert {
  border-left: 4px solid #EF4444;
}



/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .welcome-section {
    margin-bottom: 2rem;
  }

  .welcome-section h1 {
    font-size: 2rem;
  }

  .welcome-section p {
    font-size: 1rem;
  }

  .login-card {
    margin: 16px;
  }

  .bg-circle-1 {
    width: 200px;
    height: 200px;
    top: -100px;
    right: -100px;
  }

  .bg-circle-2 {
    width: 150px;
    height: 150px;
    bottom: -75px;
    left: -75px;
  }
}

@media (max-width: 480px) {
  .login-card .pa-8 {
    padding: 24px !important;
  }

  .form-group {
    margin-bottom: 20px;
  }
}

/* Dark Theme Support */
.v-theme--dark .login-card {
  background: rgba(30, 41, 59, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.v-theme--dark .form-label {
  color: rgba(255, 255, 255, 0.87);
}
</style>
