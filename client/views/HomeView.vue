<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ROUTE_RELEASE } from '@/router';
import { useReleaseStore, FETCH_RELEASE_VERSIONS, GENERATE_RELEASE_NOTES } from '~stores/release';

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

const generateReleaseNotes = async () => {
  try {
    if (!releaseStore.selectedRelease) {
      console.log('Please select a release version');
      this.hasError = true;
      return;
    }
    await releaseStore[GENERATE_RELEASE_NOTES]();
  } catch (error) {
    console.error('Error generating release notes', error);
    hasError.value = true;
  }
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
  flex-direction: column;
  gap: 1em;
}

.select-version, .submit-btn {
  padding: 0.5em 1em;
  font-size: 1em;
  border-radius: 5px;
  width: 100%;
}

.select-version {
  border: 1px solid #ccc;
}

</style>
