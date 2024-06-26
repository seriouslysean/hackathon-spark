<script setup>
import { computed } from 'vue'
import { useReleaseStore } from '~stores/release'

import ReleaseEmail from '~components/ReleaseEmail.vue'

const releaseStore = useReleaseStore()

const selectedRelease = computed(() => releaseStore.selectedRelease)
</script>

<template>
  <div class="release">
    <div v-if="!selectedRelease">
      <p>No release provided.</p>
    </div>
    <div v-else>
      <Suspense>
        <template #default>
          <ReleaseEmail :release="selectedRelease" />
        </template>
        <template #fallback>
          <div>Loading...</div>
        </template>
      </Suspense>
    </div>
  </div>
</template>
