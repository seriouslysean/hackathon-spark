<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router'; // Import useRouter

const router = useRouter(); // Use useRouter to access the router instance
const selectedVersion = ref('');
const releaseVersionsData = ref([]);

// Fetch release versions on component mount
onMounted(async () => {
  try {
    const response = await fetch('/api/jira/versions');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    releaseVersionsData.value = data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

// Computed property to format release versions for the select options
const releaseVersions = computed(() => {
  return releaseVersionsData.value.map(version => ({
    name: version.name,
    value: version.name
  }));
});

// Function to handle form submission using Vue Router
const submitForm = () => {
  router.push({ path: `/release/${selectedVersion.value}` });
};
</script>

<template>
    <div class="home">
        <!-- Wrap the select and button in a form tag -->
        <form @submit.prevent="submitForm">
            <select v-model="selectedVersion">
                <!-- Option for "Select Version" -->
                <option value="">Select Version</option>
                <!-- Options for versions -->
                <option v-for="version in releaseVersions" :key="version.value" :value="version.value">
                    {{ version.name }}
                </option>
            </select>

            <button type="submit">Submit</button>
        </form>
    </div>
</template>
