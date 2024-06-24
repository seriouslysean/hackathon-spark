#!/usr/bin/env node

/**
 * This script starts a CopyAI workflow run with a given prompt and saves the output to a file.
 * The prompt is extracted from a specified JIRA ticket's file under ./tmp/[fixVersion]/.
 *
 * Usage:
 * npm run tool:run-copy-ai-workflow -- -f <FixVersion> -t <TicketNumber>
 *
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getCopyAIClient, readIssueData, runCopyAIWorkflow, pollWorkflowStatus, saveWorkflow, } from '#utils/copy-ai-utils.js';

const argv = yargs(hideBin(process.argv))
    .option('t', {
        alias: 'ticketNumber',
        describe: 'The JIRA ticket ID',
        type: 'string',
        demandOption: true,
    })
    .option('f', {
        alias: 'fixVersion',
        describe: 'Fix Version of the JIRA ticket',
        type: 'string',
        demandOption: true,
    })
    .help()
    .alias('help', 'h')
    .argv;

// Example usage with environment variables and command line arguments
(async () => {
    try {
        const client = getCopyAIClient();
        const JIRA_TICKET_ID = argv.ticketNumber;
        const JIRA_FIX_VERSION = argv.fixVersion;
        const prompt = await readIssueData(JIRA_FIX_VERSION, JIRA_TICKET_ID);
        const runWorkflowResponse = await runCopyAIWorkflow(client, prompt);
        const runId = runWorkflowResponse.data.data.id;
        console.log(`Started workflow run with ID: ${runId}`);

        const statusRes = await pollWorkflowStatus(client, runId);

        saveWorkflow(JIRA_FIX_VERSION, JIRA_TICKET_ID, JSON.stringify(JSON.parse(statusRes?.data?.data?.output?.final_output), null, 2));
        console.log('Workflow output saved successfully!');
    } catch (error) {
        console.error(error.message);
    }
})();