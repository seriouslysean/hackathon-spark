import axios from 'axios';
import fs from 'fs';
import { join } from 'path';

/**
 * Creates an Axios instance with the base URL and headers set for CopyAI requests.
 * @returns {AxiosInstance} - Configured Axios instance.
 */
export function getCopyAIClient() {
    const copyAIToken = process.env.COPY_AI_TOKEN;

    return axios.create({
        baseURL: 'https://api.copy.ai/api',
        headers: {
            'x-copy-ai-api-key': copyAIToken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
}

/**
 * Starts a run of a CopyAI workflow with a given prompt as input.
 * @param {AxiosInstance} client - Configured Axios instance.
 * @param {string} prompt - The prompt to generate text from.
 * @returns {string} - The generated text.
 */
export async function runCopyAIWorkflow(client, prompt) {
    try {
        const response = await client.post(`/workflow/${process.env.COPY_AI_WORKFLOW_ID}/run`, {
            startVariables: {
                jira_blob: prompt,
            },
            metadata: {
                api: true,
            },
        });
        return response;
    } catch (error) {
        console.error('An error occurred while running CopyAI workflow', error.message);
        throw error;
    }
}

/**
 * Gets instantce of a CopyAI workflow run.
 * @param {AxiosInstance} client - Configured Axios instance.
 * @param {string} runId - id of the workflow run instance.
 * @returns {string} - The generated text.
 */
export async function getWorkflowRun(client, runId) {
    try {
        const response = await client.get(`/workflow/${process.env.COPY_AI_WORKFLOW_ID}/run/${runId}`);
        return response;
    } catch (error) {
        console.error('An error occurred while running CopyAI workflow', error.message);
        throw error;
    }
}

/**
 * Reads the contents of a specified file and returns it as a string.
 * @param {string} fixVersion - The directory path where the file is located.
 * @param {string} fileName - The name of the file to read.
 * @returns {string} The contents of the file as a string.
 */
export function readIssueData(fixVersion, fileName) {
    const dirPath = join('./tmp', fixVersion);
    const filePath = join(dirPath, `${fileName}.txt`);
    console.log('getting file contents from:', filePath);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return fileContents;
}

/**
 * Saves provided workflow data to a file in the tmp directory.
 * @param {string} fixVersion - The Jira fix version.
 * @param {object} issueData - The issue data to save.
 */
export function saveWorkflow(fixVersion, ticketNumber, workflowData) {
    const dirPath = join('./tmp', fixVersion);
    const filePath = join(dirPath, `${ticketNumber}--workflow.txt`);

    fs.writeFileSync(filePath, workflowData + '\n\n');
}

/**
 * Polls the status of a CopyAI workflow run until it is complete.
 * @param {AxiosInstance} client - Configured Axios instance.
 * @param {string} runId - id of the workflow run instance.
 * @returns {string} - The generated text.
 */
export async function pollWorkflowStatus(client, runId) {
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
