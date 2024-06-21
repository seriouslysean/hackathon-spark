#!/usr/bin/env node

/**
 * This script validates the Personal Access Token (PAT) for JIRA by attempting to fetch the current user's details and accessible projects.
 * It leverages the JIRA REST API to ensure the provided credentials are valid and have the necessary permissions.
 *
 * Usage:
 * npm run validate-jira
 *
 * The script requires the following environment variables to be set in config/.env:
 * - JIRA_EMAIL: The email associated with the JIRA account.
 * - JIRA_TOKEN: The API token for JIRA access.
 * - JIRA_DOMAIN: The domain of the JIRA instance.
 */

import { getJiraAxiosClient, getJiraConfig } from '#utils/jira-utils.js';

async function validatePAT(client) {
    try {
        // Validate user
        const userResponse = await client.get('/myself');
        console.log('Jira PAT is valid. Authenticated as:', userResponse.data.emailAddress);

        // Fetch and list accessible projects
        const projectsResponse = await client.get('/project/search');
        console.log(`${projectsResponse.data.values.length} accessible projects!`);
    } catch (error) {
        console.error('An error occurred while validating PAT:', error.message);
    }
}

// Example usage with environment variables
(async () => {
    try {
        const { email, token, domain } = getJiraConfig();
        const client = getJiraAxiosClient(email, token, domain);
        await validatePAT(client);
    } catch (error) {
        console.error(error.message);
    }
})();
