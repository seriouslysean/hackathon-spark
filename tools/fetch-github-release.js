#!/usr/bin/env node

/**
 * This script fetches and logs the pull requests merged between two specified tags in a GitHub repository.
 * It leverages the GitHub REST API to ensure the provided token is valid and has the necessary permissions.
 *
 * Usage:
 * npm run tools:fetch-github-release -- --currentVersion=<currentVersion> --previousVersion=<previousVersion>
 *
 * The script requires the following environment variables to be set in config/.env:
 * - GITHUB_TOKEN: The Personal Access Token for GitHub access.
 */

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { getGitHubClient, getGitHubConfig } from '#utils/github-utils.js'

const argv = yargs(hideBin(process.argv))
  .option('currentVersion', {
    alias: 'c',
    describe: 'Current release version to compare',
    type: 'string',
    demandOption: true
  })
  .option('previousVersion', {
    alias: 'p',
    describe: 'Previous release version to compare',
    type: 'string',
    demandOption: true
  })
  .help()
  .alias('help', 'h').argv

async function getPRsMergedBetweenTags(owner, repo, baseTag, headTag) {
  const token = getGitHubConfig()
  const client = getGitHubClient(token)

  try {
    const baseTagCommit = await client.request('GET /repos/{owner}/{repo}/git/ref/tags/{tag}', {
      owner,
      repo,
      tag: baseTag
    })
    const baseTagDate = (
      await client.request('GET /repos/{owner}/{repo}/git/commits/{commit_sha}', {
        owner,
        repo,
        commit_sha: baseTagCommit.data.object.sha
      })
    ).data.committer.date

    const headTagCommit = await client.request('GET /repos/{owner}/{repo}/git/ref/tags/{tag}', {
      owner,
      repo,
      tag: headTag
    })
    const headTagDate = (
      await client.request('GET /repos/{owner}/{repo}/git/commits/{commit_sha}', {
        owner,
        repo,
        commit_sha: headTagCommit.data.object.sha
      })
    ).data.committer.date

    const searchQuery = `repo:${owner}/${repo} is:pr is:merged merged:${baseTagDate}..${headTagDate}`
    const prs = await client.request('GET /search/issues', {
      q: searchQuery
    })

    return prs.data.items.map((pr) => ({ title: pr.title, number: pr.number }))
  } catch (error) {
    console.error('Error fetching PRs with Octokit')
    console.error('Response:', error.response?.data)
    return []
  }
}

(async () => {
  const { GITHUB_OWNER, GITHUB_REPO } = process.env
  const { currentVersion, previousVersion } = argv

  if (!GITHUB_OWNER || !GITHUB_REPO) {
    console.error('Missing required environment variables: GITHUB_OWNER, GITHUB_REPO')
    return
  }

  const prs = await getPRsMergedBetweenTags(
    GITHUB_OWNER,
    GITHUB_REPO,
    previousVersion,
    currentVersion
  )

  if (prs.length > 0) {
    console.log(`PRs merged between ${previousVersion} and ${currentVersion}:`)
    prs.forEach((pr) => {
      console.log(`- ${pr.title} (#${pr.number})`)
    })
  } else {
    console.log(`No PRs found between ${previousVersion} and ${currentVersion}.`)
  }
})()
