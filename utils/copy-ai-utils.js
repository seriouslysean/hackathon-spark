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
