#!/usr/bin/env node

// This script tests the validity of a GitHub Personal Access Token (PAT) and checks access to a specific repository.
// It is intended to be run as a standalone Node.js script.
// Usage: node validate-pat.js

import { Octokit } from "@octokit/core";

async function validatePAT(token, owner, repo) {
    const octokit = new Octokit({ auth: token });

    try {
        // Validate PAT by fetching user information
        const userResponse = await octokit.request('GET /user');
        console.log('PAT is valid. Authenticated as:', userResponse.data.login);

        // Check access to the specified repository
        try {
            const repoResponse = await octokit.request('GET /repos/{owner}/{repo}', { owner, repo });
            const status = repoResponse.data.private ? 'Private' : 'Public';
            console.log(`Access to ${repoResponse.data.full_name} (${status}) confirmed.`);
            // console.debug('Repository details:', repoResponse.data);
        } catch (repoError) {
            console.error(`Error accessing repository ${owner}/${repo}. Error:`, repoError.message);
        }
    } catch (error) {
        console.error('Failed to authenticate using the provided PAT. Error:', error.message);
    }
}

(async () => {
    const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        console.error('Missing required environment variables: GITHUB_TOKEN, GITHUB_OWNER, and/or GITHUB_REPO');
        return;
    }

    // Test the PAT and check repository access
    await validatePAT(GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO);
})();
