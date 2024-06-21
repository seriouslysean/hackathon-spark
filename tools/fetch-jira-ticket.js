#!/usr/bin/env node

/**
 * This script fetches and displays details for a specified JIRA ticket.
 * It is intended to be run as a standalone Node.js script.
 *
 * Usage:
 * npm run tools:fetch-jira-ticket -- --ticketNumber=<ticketNumber>
 *
 * The script requires the following environment variables to be set in config/.env:
 * - JIRA_EMAIL: The email associated with the JIRA account.
 * - JIRA_TOKEN: The API token for JIRA access.
 * - JIRA_DOMAIN: The domain of the JIRA instance.
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getJiraAxiosClient, getJiraConfig, fetchTicketById } from '#utils/jira-utils.js';

const argv = yargs(hideBin(process.argv))
    .option('t', {
        alias: 'ticketNumber',
        describe: 'The JIRA ticket ID',
        type: 'string',
        demandOption: true,
    })
    .help()
    .alias('help', 'h')
    .argv;

// Example usage with environment variables and command line arguments
(async () => {
    try {
        const { email, token, domain } = getJiraConfig();
        const client = getJiraAxiosClient(email, token, domain);
        const JIRA_TICKET_ID = argv.ticketNumber;
        const ticketData = await fetchTicketById(client, JIRA_TICKET_ID);
        console.log(`Ticket Details for ${JIRA_TICKET_ID}:`);
        console.log(JSON.stringify(ticketData, null, 2));
    } catch (error) {
        console.error(error.message);
    }
})();
