import { Octokit } from "@octokit/core";

/**
 * Retrieves and validates the necessary GitHub configuration from environment variables.
 * @returns {string} - Returns the GitHub token if valid, otherwise throws an error.
 */
export function getGitHubConfig() {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        throw new Error('Missing required environment variable: GITHUB_TOKEN');
    }

    return token;
}

export function getGitHubClient(token) {
    return new Octokit({
        auth: token,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        },
    });
}
