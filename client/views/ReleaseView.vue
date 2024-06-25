<script setup>
import { computed } from 'vue';
import { useReleaseStore } from '~stores/release';

import ReleaseEmail from '~components/ReleaseEmail.vue';

const releaseStore = useReleaseStore();

const selectedRelease = computed(() => releaseStore.selectedRelease);
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
/* .headers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 10px;
  margin-bottom: 20px;
}
.header-section {
  padding: 20px;
  border: 1px dashed #ccc;
} */

.team {
  border-bottom: 1px solid #bbb;
  margin-bottom: 20px;
  padding-bottom: 20px;
}

.section {
    padding: 20px 0;
}

h3 {
  font-size: 20px;
  font-weight: bold;
}

h4 {
  font-size: 22px;
}

h5 {
  font-weight: bold;
}

ul {
    padding-left: 30px;
}
</style>
