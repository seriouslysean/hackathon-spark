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

<style>
.email {
    width: 90%;
    margin: 0 auto;
    border: 1px dotted #CCC;
    padding: 20px;
}

.team {
  border-bottom: 1px solid #bbb;
  margin-bottom: 20px;
  padding-bottom: 20px;
}

.section {
  padding: 0 0 20px 0;
}

h1 {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
}
h3 {
  font-size: 20px;
  font-weight: bold;
}

h4 {
  font-size: 18px;
}

h5 {
  font-weight: bold;
}

ul {
  padding-left: 30px;
}
</style>
