<script setup>
import { computed, ref, onMounted } from 'vue'
import { useReleaseStore, GENERATE_RELEASE_NOTES } from '~stores/release'

const releaseStore = useReleaseStore()

const props = defineProps({
  release: {
    type: String,
    required: true,
    validator: function (value) {
      return value.trim().length > 0
    }
  }
})

const hasError = ref(false)
const releaseData = ref({})
const emailContentRef = ref(null)

const pageTitle = computed(() => {
  if (!releaseData.value.title) {
    return '';
  }
  return `🚀 Release Notes for ${releaseData.value.title}`;
});

onMounted(async () => {
  try {
    releaseData.value = await releaseStore[GENERATE_RELEASE_NOTES](props.release)
  } catch (error) {
    console.error('Error generating release notes', error)
    hasError.value = true
  }
})

const handleEmailDownloadClick = async () => {
  if (!emailContentRef.value) {
    console.error('Email content is not available.');
    return;
  }

  const contentHtml = emailContentRef.value.innerHTML;

  try {
    const generateResponse = await fetch('/api/spark/generate-email-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      </div>

      <div class="email" ref="emailContentRef">
          <div class="section">
            <p>Hello,</p>
            <p>Here are the latest release notes for {{ releaseData.title }}, releasing on {{releaseData.releaseDate}}.</p>
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
                <li v-for="ticket in team.tickets.filter((t) => t.customerFacing)" :key="ticket.ticket">
                  {{ ticket.title }} - {{ ticket.summary }}
                </li>
              </ul>
              <!-- <h5>Not Customer Facing</h5> -->
              <ul>
                <li
                  v-for="ticket in team.tickets.filter((t) => !t.customerFacing)"
                  :key="ticket.ticket"
                >
                  {{ ticket.title }} - {{ ticket.summary }}
                </li>
              </ul>
            </div>
          </div>

          <div class="section">
            <p>
              For more details on each line item, please refer to
              <a href="#">all JIRA tickets in this release</a>
            </p>

            <p>Thank you!</p>
          </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.actions {
  text-align: center;
  margin: 1em 0;
}

.ticket {
  margin-bottom: 1em;
}
</style>
