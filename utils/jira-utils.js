import axios from 'axios';
import fs from 'fs';
import path from 'path';

/**
 * Retrieves and validates the necessary Jira configuration from environment variables.
 * @returns {object} - Returns an object with the Jira configuration if valid, otherwise throws an error.
 */
export function getJiraConfig() {
    const requiredEnvVars = ['JIRA_EMAIL', 'JIRA_TOKEN', 'JIRA_DOMAIN'];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    return {
        email: process.env.JIRA_EMAIL,
        token: process.env.JIRA_TOKEN,
        domain: process.env.JIRA_DOMAIN
    };
}

/**
 * Creates an Axios instance with the base URL and headers set for Jira API requests.
 * @param {string} email - Jira email.
 * @param {string} token - Jira API token.
 * @param {string} domain - Jira domain.
 * @returns {AxiosInstance} - Configured Axios instance.
 */
export function getJiraAxiosClient(email, token, domain) {
    const authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;

    return axios.create({
        baseURL: `https://${domain}.atlassian.net/rest/api/3`,
        headers: {
            'Authorization': authHeader,
            'Accept': 'application/json'
        }
    });
}

/**
 * Fetches a Jira ticket by its ID.
 * @param {AxiosInstance} client - Configured Axios instance.
 * @param {string} ticketId - The Jira ticket ID.
 * @returns {object} - The Jira ticket details.
 */
export async function fetchTicketById(client, ticketId) {
    try {
        const ticketResponse = await client.get(`/issue/${ticketId}`);
        return ticketResponse.data;
    } catch (error) {
        console.error('An error occurred while fetching the ticket:', error.message);
        throw error;
    }
}

/**
 * Fetches Jira tickets by fix version.
 * @param {AxiosInstance} client - Configured Axios instance.
 * @param {string} fixVersion - The Jira fix version.
 * @returns {Array} - List of Jira tickets.
 */
export async function fetchTicketsByFixVersion(client, fixVersion) {
    try {
        const jql = `fixVersion = "${fixVersion}"`;
        const searchResponse = await client.get(`/search?jql=${encodeURIComponent(jql)}`);
        return searchResponse.data.issues;
    } catch (error) {
        console.error('An error occurred while fetching tickets:', error.message);
        throw error;
    }
}

/**
 * Saves the provided issue data into a text file within a directory named after the fix version.
 * Each issue's data is saved in a separate text file.
 * @param {string} fixVersion - The Jira fix version.
 * @param {object} issueData - The issue data to save.
 */
export function saveIssueData(fixVersion, issueData) {
    const dirPath = path.join('./tmp', fixVersion);
    const filePath = path.join(dirPath, `${issueData.key}.txt`);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const issueDataString = Object.entries(issueData).map(([key, value]) => {
        const indentedValue = value.split('\n').map((line, index) => {
            return index === 0 ? line : '    ' + line;
        }).join('\n');
        return `${key}: ${indentedValue}`;
    }).join('\n\n');

    fs.writeFileSync(filePath, issueDataString + '\n\n');
}
