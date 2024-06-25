<script setup>
import { ref, defineProps } from 'vue';

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
const releaseData = ref(null);

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
            <!-- <div class="headers">
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
            </div> -->

            <div class="section">
                <p>Hello,</p>
                <p>Here are the latest release notes for {{ releaseData.title }}:</p>
            </div>

            <div class="section">

                <h3>Feature Releases and Highlights</h3>
                <ul>
                    <li>highlight 1</li>
                    <li>highlight 2</li>
                    <li>highlight 3</li>
                </ul>

            </div>

            <div class="section">

                <h3>Bug Fixes and Improvements</h3>

                <div v-for="(team, index) in releaseData.teams" :key="index" class="team">
                    <h4>{{ team.name }}</h4>
                    <h5>Customer Facing</h5>
                    <ul>
                        <li v-for="ticket in team.tickets.filter(t => t.customerFacing)" :key="ticket.ticket">
                            {{ ticket.title }} - {{ ticket.summary }}
                        </li>
                    </ul>
                    <h5>Not Customer Facing</h5>
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
