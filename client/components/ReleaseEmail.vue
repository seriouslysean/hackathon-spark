<script setup>
import { ref, defineProps, onMounted } from 'vue';
import { useReleaseStore, GENERATE_RELEASE_NOTES } from '~stores/release';

const releaseStore = useReleaseStore();

const props = defineProps({
    release: {
        type: String,
        required: true,
        validator: function (value) {
            return value.trim().length > 0;
        }
    }
});

const hasError = ref(false);
const releaseData = ref({});
///////////////
// Real Data //
///////////////

// onMounted(async () => {
//   try {
//     releaseData.value = await releaseStore[GENERATE_RELEASE_NOTES]();
//   } catch (error) {
//     console.error('Error generating release notes', error);
//     hasError.value = true;
//   }
// });

///////////////
// Mock Data //
///////////////

try {
    const response = await fetch(`/api/jira/release`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Network response was not ok :(');
    }

    const data = await response.json();
    releaseData.value = data;
} catch (error) {
    console.error('Error fetching data:', error);
    hasError.value = true;
}
</script>

<template>
    <div class="release-email">
        <div v-if="hasError">
            <p>Failed to fetch the release.</p>
        </div>
        <div v-else class="email">
            <div class="headers">
                <div class="header-section">
                    <h3>Dates</h3>
                    <h4>Web</h4>
                    <p>{{ releaseData.releaseDate }}</p>
                </div>

                <div class="header-section">
                    <h3>Web Versions</h3>
                    <p><a href="#">Jira Tickets</a></p>

                    <ul>
                        <li>Version {{ releaseData.title }}</li>
                    </ul>
                </div>
            </div>

            <div v-for="(team, index) in releaseData.teams" :key="index" class="team">
                <h4>{{ team.name }}</h4>
                <h5>Customer Facing</h5>
                <ul>
                    <li class="ticket" v-for="ticket in team.tickets.filter(t => t.customerFacing)" :key="ticket.ticket">
                        {{ticket.ticket}}: {{ ticket.title }} - {{ ticket.summary }}
                    </li>
                </ul>
                <h5>Not Customer Facing</h5>
                <ul>
                    <li v-for="ticket in team.tickets.filter(t => !t.customerFacing)" :key="ticket.ticket">
                        {{ticket.ticket}}: {{ ticket.title }} - {{ ticket.summary }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style scoped>
.ticket {
    margin-bottom: 1em;
}
</style>