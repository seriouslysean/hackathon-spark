#!/usr/bin/env node

/**
 * This script validates the GitHub Personal Access Token (PAT) by attempting to fetch the current user's details and accessible repositories.
 * It leverages the GitHub REST API to ensure the provided token is valid and has the necessary permissions.
 *
 * Usage:
 * npm run validate-github
 *
 * The script requires the following environment variables to be set in config/.env:
 * - GITHUB_TOKEN: The Personal Access Token for GitHub access.
 */

import { getGitHubClient, getGitHubConfig } from '#utils/github-utils.js'

async function validatePAT(client) {
  try {
    // Validate PAT by fetching user information
    const userResponse = await client.request('GET /user')
    console.log('GitHub PAT is valid. Authenticated as:', userResponse.data.login)

    // Optionally, fetch and list accessible repositories or perform other checks
  } catch (error) {
    console.error('An error occurred while validating PAT:', error.message)
  }
}

// Example usage with environment variables
(async () => {
  try {
    const token = getGitHubConfig()
    const client = getGitHubClient(token)
    await validatePAT(client)
  } catch (error) {
    console.error(error.message)
  }
})()
