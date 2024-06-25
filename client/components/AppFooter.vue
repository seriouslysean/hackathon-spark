<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
  <footer>
    <small
      >Made with <span class="heart">&hearts;</span> for the {{ currentYear }} URBN Hackathon</small
    >
  </footer>
</template>

<style scoped>
footer {
  text-align: center;
}

.heart {
  color: #ff0000;
}
</style>
