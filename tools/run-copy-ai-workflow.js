import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getCopyAIClient, readIssueData, runCopyAIWorkflow, getWorkflowRun } from '#utils/copy-ai-utils.js';

async function pollWorkflowStatus(client, runId) {
    try {
        const response = await getWorkflowRun(client, runId);
        const { data } = response; // Assuming 'status' is a field in the response JSON

        if (data.data.status === "COMPLETE") {
            console.log("Workflow run is complete.");
            return response; // Or return any other data you need
        } else {
            console.log(`Workflow run status is '${data.data.status}', polling again in 3 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds
            return pollWorkflowStatus(client, runId); // Recursive call to continue polling
        }
    } catch (error) {
        console.error("Error while polling workflow status:", error);
        throw error; // Handle or rethrow the error as needed
    }
}

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
        console.log(statusRes.data);
        // console.log(response.data.data);
    } catch (error) {
        console.error(error.message);
    }
})();