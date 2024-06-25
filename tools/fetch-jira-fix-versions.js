#!/usr/bin/env node

/**
 * This script fetches and displays all versions from Jira that optionally start with a prefix,
 * ordered by newest to oldest.
 *
 * Usage:
 * npm run tool:fetch-jira-versions
 *
 * The script requires the following environment variables to be set in config/.env:
 * - JIRA_EMAIL: The email associated with the JIRA account.
 * - JIRA_TOKEN: The API token for JIRA access.
 * - JIRA_DOMAIN: The domain of the JIRA instance.
 */

import { getJiraAxiosClient, getJiraConfig, fetchJiraVersions } from '#utils/jira-utils.js'

// Fetch and display JIRA versions
;(async () => {
  try {
    const { email, token, domain, projectKey, versionFilterPrefix } = getJiraConfig()
    const client = getJiraAxiosClient(email, token, domain)

    const versions = await fetchJiraVersions(client, projectKey, versionFilterPrefix)

    console.log(`Filtered Versions (${versionFilterPrefix}*):`)
    console.log(JSON.stringify(versions, null, 2))
  } catch (error) {
    console.error(error.message)
  }
})()
