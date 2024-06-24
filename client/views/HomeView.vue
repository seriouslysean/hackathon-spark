<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ROUTE_RELEASE } from '@/router';
import { useReleaseStore, FETCH_RELEASE_VERSIONS } from '~stores/release';

const router = useRouter();
const releaseStore = useReleaseStore();
const hasError = ref(false);

// Fetch release versions on component mount, using the store
onMounted(async () => {
  try {
    await releaseStore[FETCH_RELEASE_VERSIONS]();
  } catch (error) {
    console.error('Error fetching data:', error);
    hasError.value = true;
  }
});

const onSubmit = () => {
  router.push({ name: ROUTE_RELEASE });
};
</script>

<template>
    <div class="home">
        <div v-if="hasError">
            <p>Failed to load release versions. Please try again later.</p>
        </div>
        <form class="form-container" @submit.prevent="onSubmit">
            <select class="select-version" v-model="releaseStore.selectedRelease">
                <option value="">Select Version</option>
                <option v-for="version in releaseStore.releaseVersions" :key="version.name" :value="version.name">
                    {{ version.name }}
                </option>
            </select>
            <button class="submit-btn" type="submit">Submit</button>
        </form>
    </div>
</template>

<style scoped>
.form-container {
  display: flex;
  align-items: center;
  gap: 1.25em;
}

.select-version, .submit-btn {
  padding: 0.5em 1em;
  font-size: 1em;
  border-radius: 5px;
  height: 2.5em;
}

.select-version {
  flex-grow: 1;
  border: 1px solid #ccc;
}

.submit-btn {
  background-color: #007bff;
  color: white;
  border: 1px solid #007bff;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #0056b3;
}
</style>
