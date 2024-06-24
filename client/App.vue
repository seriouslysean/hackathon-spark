<script setup>
import { RouterView } from 'vue-router'
import AppHeader from '~components/AppHeader.vue'
import AppFooter from '~components/AppFooter.vue'
</script>

<template>
  <AppHeader />

  <main id="main">
    <RouterView />
  </main>

  <AppFooter />
</template>

<style scoped>
#main {
  flex: 1; /* Allows the main content to expand and fill the available space */
  margin: 1em 0;
}
</style>
