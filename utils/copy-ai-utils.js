import axios from 'axios';
import fs from 'fs';
import { join } from 'path';

/**
 * Creates an Axios instance for CopyAI requests.
 * @returns {AxiosInstance} Configured Axios instance.
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
 * Starts a CopyAI workflow with a given prompt.
 * @param {AxiosInstance} client Configured Axios instance.
 * @param {string} prompt The prompt to generate text from.
 * @returns {string} The generated text.
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
 * Gets instance of a CopyAI workflow run.
 * @param {AxiosInstance} client Configured Axios instance.
 * @param {string} runId ID of the workflow run instance.
 * @returns {string} The generated text.
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
 * @param {string} filePath The path of the file to read.
 * @returns {string} The contents of the file as a string.
 */
export function readIssueData(filePath) {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const parsedData = JSON.parse(fileContents);
    return parsedData;
}

/**
 * Saves provided workflow data to a file.
 * @param {string} fixVersion The Jira fix version.
 * @param {string} ticketNumber The ticket number.
 * @param {object} workflowData The issue data to save.
 */
export function saveWorkflow(fixVersion, ticketNumber, workflowData) {
    const dirPath = join('./tmp/workflows', fixVersion);
    const filePath = join(dirPath, `${ticketNumber}--workflow.json`);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, workflowData + '\n\n');
}

/**
 * Polls the status of a CopyAI workflow run until it is complete.
 * @param {AxiosInstance} client Configured Axios instance.
 * @param {string} runId ID of the workflow run instance.
 * @returns {string} The generated text.
 */
export async function pollWorkflowStatus(client, runId) {
    try {
        const response = await getWorkflowRun(client, runId);
        const { data } = response;

        if (data.data.status === "COMPLETE") {
            console.log("Workflow run is complete.");
            return response;
        } else {
            console.log(`Workflow run status is '${data.data.status}', polling again in 3 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            return pollWorkflowStatus(client, runId);
        }
    } catch (error) {
        console.error("Error while polling workflow status:", error);
        throw error;
    }
}

/**
 * Reads the contents of all files in a specified directory.
 * @param {string} fixVersion The version of the fix, used to construct the directory path.
 * @returns {string[]} An array containing the contents of each file.
 */
export function readFileContents(fixVersion) {
    const directoryPath = join('./tmp', fixVersion);
    console.log('getting file contents from:', directoryPath);

    try {
        const files = fs.readdirSync(directoryPath);
        const contentsArray = [];
        for (const file of files) {
            const filePath = join(directoryPath, file);
            const content = readIssueData(filePath);
            contentsArray.push(content);
        }
        return contentsArray;
    } catch (error) {
        console.error('Error reading files:', error);
        throw error;
    }
}

/**
 * Retrieves or generates a CopyAI summary for a given prompt.
 * @param {string} prompt The prompt for the CopyAI workflow.
 * @param {string} ticketNumber The ticket number.
 * @param {string} fixVersion The fix version.
 * @returns {Promise<string>} The workflow summary.
 */
export async function getCopyAISummary(prompt, ticketNumber, fixVersion) {
    try {
        const directoryPath = join('./tmp/workflows', fixVersion);
        const filePath = join(directoryPath, `${ticketNumber}--workflow.json`);

        if (fs.existsSync(filePath)) {
            console.log(`Workflow file already exist for ${ticketNumber}`);
            return readIssueData(filePath);
        }

        const client = getCopyAIClient();

        if (!prompt) {
            throw new Error('Prompt not found in file.');
        }
        const runWorkflowResponse = await runCopyAIWorkflow(client, prompt);
        const runId = runWorkflowResponse.data.data.id;
        console.log(`Started workflow run with ID: ${runId}`);

        const statusRes = await pollWorkflowStatus(client, runId);

        saveWorkflow(fixVersion, ticketNumber, JSON.stringify(JSON.parse(statusRes?.data?.data?.output?.final_output), null, 2));
        console.log('Workflow output saved successfully!');
        return statusRes?.data?.data?.output?.final_output;
    } catch (error) {
        console.error(error.message);
    }
}
