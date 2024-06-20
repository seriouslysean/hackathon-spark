#!/usr/bin/env node

import axios from 'axios';

async function validatePAT(email, token, domain) {
    const authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;

    try {
        // Validate user
        const userResponse = await axios.get(`https://${domain}.atlassian.net/rest/api/3/myself`, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json'
            }
        });
        console.log('Jira PAT is valid. Authenticated as:', userResponse.data.emailAddress);

        // Fetch and list accessible projects
        const projectsResponse = await axios.get(`https://${domain}.atlassian.net/rest/api/3/project/search`, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json'
            }
        });

        console.log('Accessible projects:');
        projectsResponse.data.values.forEach(project => {
            console.log(`- ${project.key}: ${project.name}`);
        });
    } catch (error) {
        if (error.response) {
            console.error(`Failed to authenticate or fetch projects. Status: ${error.response.status}, Message: ${error.message}`);
        } else {
            console.error('An error occurred:', error.message);
        }
    }
}

// Example usage with environment variables
(async () => {
    const JIRA_EMAIL = process.env.JIRA_EMAIL;
    const JIRA_TOKEN = process.env.JIRA_TOKEN;
    const JIRA_DOMAIN = process.env.JIRA_DOMAIN;

    if (!JIRA_EMAIL || !JIRA_TOKEN || !JIRA_DOMAIN) {
        console.error('Missing required environment variables: JIRA_EMAIL, JIRA_TOKEN, and/or JIRA_DOMAIN');
        return;
    }

    await validatePAT(JIRA_EMAIL, JIRA_TOKEN, JIRA_DOMAIN);
})();
