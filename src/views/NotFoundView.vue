<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height">
        <v-row justify="center" align="center" class="fill-height">
          <v-col cols="12" sm="8" md="6" class="text-center">
            <v-icon size="120" color="grey-lighten-2" class="mb-6">
              mdi-emoticon-sad-outline
            </v-icon>
            <h1 class="text-h2 font-weight-bold mb-4">404</h1>
            <h2 class="text-h4 mb-4">Page Not Found</h2>
            <p class="text-body-1 text-medium-emphasis mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-home"
              @click="$router.push('/dashboard')"
            >
              Go to Dashboard
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
// No script needed for this simple component
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
