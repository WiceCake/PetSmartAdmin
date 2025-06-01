<template>
  <div
    class="app-logo"
    :class="logoClasses"
    :style="logoStyles"
    @click="handleClick"
  >
    <!-- Primary logo image -->
    <img
      v-if="!showFallback"
      :src="logoSrc"
      :alt="altText"
      :width="logoSize.width"
      :height="logoSize.height"
      class="logo-image"
      @error="handleImageError"
      @load="handleImageLoad"
    />

    <!-- Fallback placeholder or text -->
    <div v-if="showFallback" class="logo-fallback">
      <img
        :src="ASSETS.logos.placeholder"
        :alt="`${fallbackText} Placeholder`"
        :width="logoSize.width"
        :height="logoSize.height"
        class="logo-image logo-placeholder"
        @error="() => {}"
      />
      <span v-if="!imageLoaded" class="logo-text">{{ fallbackText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { getLogo, getLogoSize, ASSETS } from '@/config/assets'

interface Props {
  context?: 'sidebar' | 'login' | 'header'
  collapsed?: boolean
  isMobile?: boolean
  fallbackText?: string
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  context: 'sidebar',
  collapsed: false,
  isMobile: false,
  fallbackText: 'PetSmart',
  clickable: false
})

const emit = defineEmits<{
  click: []
}>()

const theme = useTheme()
const showFallback = ref(false)
const imageLoaded = ref(false)
const hasAnimated = ref(false) // Track if logo has already animated

const isDark = computed(() => theme.global.current.value.dark)

const logoSrc = computed(() => {
  const logo = getLogo(props.context, {
    collapsed: props.collapsed,
    isDark: isDark.value,
    isMobile: props.isMobile
  })

  // Return the computed logo path
  return logo
})

const logoSize = computed(() => {
  return getLogoSize(props.context, {
    collapsed: props.collapsed,
    isMobile: props.isMobile
  })
})

const altText = computed(() => {
  return `${props.fallbackText} Logo`
})

const logoClasses = computed(() => ({
  'app-logo--clickable': props.clickable,
  'app-logo--collapsed': props.collapsed,
  'app-logo--mobile': props.isMobile,
  'app-logo--sidebar': props.context === 'sidebar',
  'app-logo--login': props.context === 'login',
  'app-logo--header': props.context === 'header',
  'app-logo--fallback': showFallback.value,
  'app-logo--no-animation': hasAnimated.value // Disable animation after first load
}))

const logoStyles = computed(() => ({
  '--logo-width': `${logoSize.value.width}px`,
  '--logo-height': `${logoSize.value.height}px`
}))

const handleImageError = () => {
  console.warn(`Logo image failed to load: ${logoSrc.value}`)
  showFallback.value = true

  // Try to load placeholder as backup
  const img = new Image()
  img.onload = () => {
    // If placeholder loads successfully, we can use it
    console.info('Fallback placeholder logo loaded successfully')
  }
  img.onerror = () => {
    // If even placeholder fails, we'll rely on text fallback
    console.warn('Placeholder logo also failed to load, using text fallback')
  }
  img.src = ASSETS.logos.placeholder
}

const handleImageLoad = () => {
  imageLoaded.value = true
  showFallback.value = false
  // Mark as animated after first load to prevent re-animation
  setTimeout(() => {
    hasAnimated.value = true
  }, 500) // Wait for animation to complete
}

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}

onMounted(() => {
  // Pre-check if the image exists
  const img = new Image()
  img.onload = () => {
    imageLoaded.value = true
  }
  img.onerror = () => {
    showFallback.value = true
  }
  img.src = logoSrc.value
})
</script>

<style scoped>
.app-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: var(--logo-width);
  height: var(--logo-height);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-logo--clickable {
  cursor: pointer;
}

.app-logo--clickable:hover {
  transform: scale(1.05);
}

.logo-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: opacity 0.3s ease;
}

.app-logo--fallback .logo-image {
  opacity: 0;
}

.logo-fallback {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.logo-placeholder {
  opacity: 0.8;
  filter: grayscale(20%);
}

.logo-text {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
  font-size: clamp(0.75rem, 2vw, 1rem);
  text-align: center;
  letter-spacing: 0.025em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Context-specific styling */
.app-logo--sidebar {
  border-radius: 8px;
  background: rgba(var(--v-theme-surface), 0.02);
  padding: 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-logo--sidebar:hover {
  background: rgba(var(--v-theme-primary), 0.04);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.1);
}

.app-logo--sidebar.app-logo--collapsed {
  border-radius: 8px;
  overflow: hidden;
  padding: 2px;
}

.app-logo--sidebar.app-logo--collapsed .logo-image {
  /* Ensure wordmark fits in collapsed state */
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
  filter: brightness(1.1);
}

.app-logo--sidebar .logo-image {
  /* Improve logo contrast and sharpness */
  filter: contrast(1.05) brightness(1.02);
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.app-logo--login {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.app-logo--header {
  border-radius: 6px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .app-logo--sidebar {
    width: calc(var(--logo-width) * 0.9);
    height: calc(var(--logo-height) * 0.9);
  }
  
  .app-logo--login {
    width: calc(var(--logo-width) * 0.8);
    height: calc(var(--logo-height) * 0.8);
  }
}

@media (max-width: 480px) {
  .app-logo--login {
    width: calc(var(--logo-width) * 0.7);
    height: calc(var(--logo-height) * 0.7);
  }
  
  .logo-text {
    font-size: 0.7rem;
  }
}

/* Dark theme adjustments */
.v-theme--dark .logo-text {
  background: rgba(0, 0, 0, 0.8);
  color: rgb(var(--v-theme-on-surface));
}

.v-theme--dark .app-logo--sidebar {
  background: rgba(var(--v-theme-surface), 0.05);
}

.v-theme--dark .app-logo--sidebar:hover {
  background: rgba(var(--v-theme-primary), 0.08);
  box-shadow: 0 2px 12px rgba(var(--v-theme-primary), 0.15);
}

.v-theme--dark .app-logo--sidebar .logo-image {
  /* Enhance white logo visibility on dark background */
  filter: contrast(1.1) brightness(1.05) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.v-theme--dark .app-logo--sidebar.app-logo--collapsed .logo-image {
  filter: brightness(1.15) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
}

/* Animation for logo loading */
.logo-image {
  animation: logoFadeIn 0.5s ease-out;
}

/* Disable animation after first load */
.app-logo--no-animation .logo-image {
  animation: none;
}

@keyframes logoFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
