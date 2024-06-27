<script setup>
import { computed, ref } from 'vue'
import { useReleaseStore, GENERATE_RELEASE_NOTES } from '~stores/release'

const releaseStore = useReleaseStore()

const props = defineProps({
  release: {
    type: String,
    required: true,
    validator: (value) => value.trim().length > 0
  }
})

const hasError = ref(false)
const releaseData = ref({})
const emailContentRef = ref(null)

// Fetch release data asynchronously on component setup
try {
  releaseData.value = await releaseStore[GENERATE_RELEASE_NOTES](props.release)
} catch (error) {
  console.error('Error generating release notes', error)
  hasError.value = true
}

const pageTitle = computed(() => `🚀 Release Notes for ${releaseData.value.title || ''}`);

const formattedReleaseDate = computed(() => {
  const date = new Date(releaseData.value.releaseDate);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
});

const adaptedEpics = computed(() => releaseData.value.epics.map((epic, index) => ({
  ...epic,
  key: `${index}-${epic.ticket}`
})));

const adaptedTeams = computed(() => releaseData.value.teams.map((team, index) => ({
  ...team,
  key: `${index}-${team.name}-${team.tickets.length}`,
  customerFacingTickets: team.tickets.filter(t => t.customerFacing),
  nonCustomerFacingTickets: team.tickets.filter(t => !t.customerFacing)
})));

const handleEmailDownloadClick = async () => {
  if (!emailContentRef.value) {
    console.error('Email content is not available.');
    return;
  }

  const contentHtml = emailContentRef.value.innerHTML;

  try {
    const generateResponse = await fetch('/api/spark/generate-email-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailTitle: pageTitle.value, contentHtml, release: props.release }),
    });

    if (!generateResponse.ok) {
      throw new Error(`HTTP error! status: ${generateResponse.status}`);
    }

    window.location.href = `/api/spark/download-email-file/${props.release}`;
  } catch (error) {
    console.error('Error generating or downloading the file:', error);
  }
};
</script>

<template>
  <div class="release-email">
    <div v-if="hasError">
      <p>Failed to fetch the release.</p>
    </div>
    <div v-else>
      <h1>{{ pageTitle }}</h1>

      <div class="actions">
        <button @click="handleEmailDownloadClick">Download Email File</button>
        <button>Send Email</button>
      </div>

      <div class="email" ref="emailContentRef">
          <div class="section">
            <p>Hello,</p>
            <p>Here are the latest release notes for <strong>{{ releaseData.title }}</strong>, releasing on <strong>{{ formattedReleaseDate }}</strong>.</p>
          </div>

          <div class="section">
            <h3>✨ Feature Releases and Highlights</h3>
            <ul>
              <li v-for="epic in adaptedEpics" :key="epic.key">
                {{ epic.summary }}
              </li>
            </ul>
          </div>

          <div class="section">
            <h3>🛠️ Bug Fixes and Improvements</h3>

            <div v-for="team in adaptedTeams" :key="team.key" class="team">
              <h4>{{ team.name }}</h4>
              <ul>
                <template v-if="team.customerFacingTickets.length || team.nonCustomerFacingTickets.length">
                  <!-- Customer Facing -->
                  <li v-for="ticket in team.customerFacingTickets" :key="ticket.ticket">
                    {{ ticket.summary }}
                  </li>
                  <!-- Not Customer Facing -->
                  <li v-for="ticket in team.nonCustomerFacingTickets" :key="ticket.ticket">
                    {{ ticket.summary }}*
                  </li>
                </template>
                <li v-else>No tickets released</li>
              </ul>
            </div>
          </div>

          <div class="section">
            <p>
              For more details on each line item, please refer to
              <a href="#">all JIRA tickets in this release</a>.
            </p>

            <p>Thank you!</p>
          </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 {
  text-align: center;
}

strong {
  font-weight: 500;
}

.email {
    margin: 2em;
    border: 2px dotted #CCC;
    padding: 2em;
}

.team {
  border-bottom: 1px solid #bbb;
  margin-bottom: 1.5em;
  padding-bottom: 1.5em;
}

.section {
  padding: 0 0 1.5em 0;
}

.section :first-child {
  margin-top: 0;
}

.section :last-child {
  margin-bottom: 0;
}

.actions {
  text-align: center;
  margin: 1em 0;
}

.actions button {
  margin-right: 1em;
}

.actions button:last-child {
  margin-right: 0;
}

.ticket {
  margin-bottom: 1em;
}
</style>
