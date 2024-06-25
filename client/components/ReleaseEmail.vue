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

onMounted(async () => {
    try {
        releaseData.value = await releaseStore[GENERATE_RELEASE_NOTES](props.release);
    } catch (error) {
        console.error('Error generating release notes', error);
        hasError.value = true;
    }
});
</script>

<template>
    <div class="release-email">
        <div v-if="hasError">
            <p>Failed to fetch the release.</p>
        </div>
        <div v-else class="email">
            <h1>🚀 Release Notes for {{ releaseData.title }}</h1>
            <div class="section">
                <p>Hello,</p>
                <p>Here are the latest release notes.</p>
            </div>

            <div class="section">

                <h3>✨ Feature Releases and Highlights</h3>
                <ul>
                    <li>highlight 1</li>
                    <li>highlight 2</li>
                    <li>highlight 3</li>
                </ul>

            </div>

            <div class="section">

                <h3>🛠️ Bug Fixes and Improvements</h3>

                <div v-for="(team, index) in releaseData.teams" :key="index" class="team">
                    <h4>{{ team.name }}</h4>
                    <!-- <h5>Customer Facing</h5> -->
                    <ul>
                        <li v-for="ticket in team.tickets.filter(t => t.customerFacing)" :key="ticket.ticket">
                            {{ ticket.title }} - {{ ticket.summary }}
                        </li>
                    </ul>
                    <!-- <h5>Not Customer Facing</h5> -->
                    <ul>
                        <li v-for="ticket in team.tickets.filter(t => !t.customerFacing)" :key="ticket.ticket">
                            {{ ticket.title }} - {{ ticket.summary }}
                        </li>
                    </ul>
                </div>
            </div>

            <div class="section">
                <p>For more details on each line item, please refer to <a href="#">all JIRA tickets in this release</a></p>

                <p>Thank you!</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.ticket {
    margin-bottom: 1em;
}
</style>
