import axios from 'axios'
import fs from 'fs'
import { join } from 'path'

/**
 * Retrieves and validates the necessary Jira configuration from environment variables.
 * @returns {object} Returns an object with the Jira configuration if valid, otherwise throws an error.
 */
export function getJiraConfig() {
  const requiredEnvVars = [
    'JIRA_EMAIL',
    'JIRA_TOKEN',
    'JIRA_DOMAIN',
    'JIRA_PROJECT_KEY',
    'JIRA_VERSION_FILTER_PREFIX'
  ]
  const missingVars = requiredEnvVars.filter((v) => !process.env[v])

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }

  return {
    email: process.env.JIRA_EMAIL,
    token: process.env.JIRA_TOKEN,
    domain: process.env.JIRA_DOMAIN,
    projectKey: process.env.JIRA_PROJECT_KEY,
    versionFilterPrefix: process.env.JIRA_VERSION_FILTER_PREFIX
  }
}

/**
 * Creates an Axios instance with the base URL and headers set for Jira API requests.
 * @param {string} email Jira email.
 * @param {string} token Jira API token.
 * @param {string} domain Jira domain.
 * @returns {AxiosInstance} Configured Axios instance.
 */
export function getJiraAxiosClient(email, token, domain) {
  const authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`

  return axios.create({
    baseURL: `https://${domain}.atlassian.net/rest/api/3`,
    headers: {
      Authorization: authHeader,
      Accept: 'application/json'
    }
  })
}

/**
 * Fetches all versions from JIRA, optionally filters them to only include versions starting with a specified prefix,
 * and orders them from newest to oldest.
 * @param {AxiosInstance} client Configured Axios instance.
 * @param {string} projectKey The JIRA project key.
 * @param {string} [filterPrefix] Optional prefix to filter versions by.
 * @returns {Array} Filtered (if filterPrefix is provided) and sorted list of JIRA versions.
 */
export async function fetchJiraVersions(client, projectKey, filterPrefix) {
  try {
    const queryParamsObj = {
      orderBy: '+name',
      expand: 'issuesstatus'
    }

    const queryString = Object.entries(queryParamsObj)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')

    const url = `/project/${projectKey}/versions?${queryString}`
    console.log(`Requesting JIRA versions with URL: ${url}`)

    const response = await client.get(url)
    console.log(`Response count from JIRA:`, response.data.length)

    const semverRegex = /(\d+)\.(\d+)\.(\d+)/

    const filteredSortedAndTrimmed = response.data
      .filter((version) => version.name.startsWith(filterPrefix) && version.releaseDate)
      .sort((a, b) => {
        const dateComparison = new Date(b.releaseDate) - new Date(a.releaseDate)
        if (dateComparison !== 0) {
          return dateComparison
        } else {
          const [, aMajor, aMinor, aPatch] = a.name.match(semverRegex) || []
          const [, bMajor, bMinor, bPatch] = b.name.match(semverRegex) || []
          return bMajor - aMajor || bMinor - aMinor || bPatch - aPatch
        }
      })
      .slice(0, 10)

    return filteredSortedAndTrimmed
  } catch (error) {
    console.error('An error occurred while fetching JIRA versions:', error)
    throw error
  }
}

/**
 * Fetches a Jira ticket by its ID.
 * @param {AxiosInstance} client Configured Axios instance.
 * @param {string} ticketId The Jira ticket ID.
 * @returns {object} The Jira ticket details.
 */
export async function fetchTicketById(client, ticketId) {
  try {
    const ticketResponse = await client.get(`/issue/${ticketId}`)
    return ticketResponse.data
  } catch (error) {
    console.error('An error occurred while fetching the ticket:', error.message)
    throw error
  }
}

/**
 * Fetches Jira tickets by fix version.
 * @param {AxiosInstance} client Configured Axios instance.
 * @param {string} fixVersion The Jira fix version.
 * @returns {Array} List of Jira tickets.
 */
export async function fetchTicketsByFixVersion(client, fixVersion) {
  try {
    const jql = `fixVersion = "${fixVersion}"`
    const searchResponse = await client.get(`/search?jql=${encodeURIComponent(jql)}`)
    return searchResponse.data.issues
  } catch (error) {
    console.error('An error occurred while fetching tickets:', error.message)
    throw error
  }
}

/**
 * Saves the provided issue data into a text file within a directory named after the fix version.
 * Each issue's data is saved in a separate text file.
 * @param {string} fixVersion The Jira fix version.
 * @param {object} issueData The issue data to save.
 */
export function saveIssueData(fixVersion, issueData) {
  const dirPath = join('./tmp', fixVersion)
  const filePath = join(dirPath, `${issueData.ticketNumber}.json`)

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
  const jsonIssueData = JSON.stringify(issueData, null, 2)

  fs.writeFileSync(filePath, jsonIssueData + '\n\n')
}

/**
 * Converts Jira issue description to plain text.
 * @param {object} description Jira issue description object.
 * @returns {string} Plain text description.
 */
export const convertDescriptionToText = (description) => {
  if (!description || !description.content) return ''

  const extractText = (content) =>
    content.reduce((acc, node) => {
      if (!node.content) return acc

      const processNodeText = (item) => {
        let text = item.text || ''
        if (item.marks) {
          item.marks.forEach((mark) => {
            if (mark.type === 'strong') {
              text = `**${text.trim()}**`
            }
          })
        }
        return text.trim()
      }

      let prefix = ''
      if (node.type === 'heading') {
        const level = node.attrs.level
        prefix = '#'.repeat(level) + ' '
      }

      // Join node texts carefully, ensuring no extra spaces are introduced
      const nodeText = node.content
        .map(processNodeText)
        .filter((text) => text.length > 0)
        .join(' ')
      return acc + prefix + nodeText + '\n' // No need to trim here as spaces are now managed
    }, '')

  return extractText(description.content).trim()
}

/**
 * Extracts relevant issue data from a Jira issue object.
 * @param {object} issue Jira issue object.
 * @returns {object} Extracted issue data.
 */
const extractIssueData = (issue) => ({
  ticketNumber: issue.key,
  epic: issue.fields?.parent?.key ?? 'N/A',
  resolution: issue.fields?.resolution?.name ?? 'N/A',
  // issuelinks: convertIssueLinksToText(issue.fields?.issuelinks) ?? 0,
  // issuetype: issue.fields?.issuetype?.name ?? 'N/A',
  brand: issue.fields?.customfield_13301?.value ?? 'N/A',
  resolutiondate: issue.fields?.resolutiondate ?? 'N/A',
  summary: issue.fields?.summary ?? 'No summary',
  description: convertDescriptionToText(issue.fields?.description) ?? 'N/A',
  fixVersionName: issue.fields?.fixVersions?.map((fv) => fv.name).join(', ') ?? 'N/A',
  fixVersionReleaseDate: issue.fields?.fixVersions?.map((fv) => fv.releaseDate).join(', ') ?? 'N/A',
  // priority: issue.fields?.priority?.name ?? 'N/A',
  team: issue.fields?.customfield_18834?.value ?? 'N/A',
  labels: issue.fields?.labels?.join(', ') ?? 'No labels'
})

/**
 * Extracts relevant issue data from a Jira epic object.
 * @param {object} issue Jira epic object.
 * @returns {object} Extracted epic data.
 */
const extractEpicIssueData = (issue) => ({
  ticketNumber: issue.key,
  summary: issue.fields?.summary ?? 'No summary',
  description: convertDescriptionToText(issue.fields?.description) ?? 'N/A',
  fixVersionName: issue.fields?.fixVersions?.map((fv) => fv.name).join(', ') ?? 'N/A',
  fixVersionReleaseDate: issue.fields?.fixVersions?.map((fv) => fv.releaseDate).join(', ') ?? 'N/A',
})

/**
 * Fetches tickets by fix version and saves their data to files.
 * @param {AxiosInstance} client Configured Axios instance.
 * @param {string} fixVersion The Jira fix version.
 */
export async function fetchTicketsAndSaveToFiles(client, fixVersion) {
  try {
    const FIX_VERSION = fixVersion
    const dirPath = join('./tmp', fixVersion)
    if (fs.existsSync(dirPath)) {
      console.log(`Files already exist for ${fixVersion}`)
      return
    }

    const issues = await fetchTicketsByFixVersion(client, FIX_VERSION)

    for (const issue of issues) {
      const issueData = extractIssueData(issue);
      if (issueData.epic && issueData.epic !== 'N/A') {
        const epicData = await fetchTicketById(client, issueData.epic);
        issueData.epicTicket = extractEpicIssueData(epicData);
      }
      saveIssueData(FIX_VERSION, issueData)
      console.log(`Saved ${issue.key}`)
    }
  } catch (error) {
    console.error(error.message)
  }
}

/**
 * Retrieves team names from the environment configuration.
 * @returns {Array<string>} List of team names.
 */
function getTeamNamesFromConfig() {
  return process.env.JIRA_TEAM_NAMES?.split(',') || []
}

/**
 * Sorts tickets by teams based on the team names from the environment configuration.
 * @param {Array<object>} tickets List of tickets to sort.
 * @returns {Array<object>} Tickets sorted by teams.
 */
export function sortTicketsByTeams(tickets) {
  const engineeringTeams = getTeamNamesFromConfig()
  const sortedTickets = []
  engineeringTeams.forEach((team) => {
    const teamTickets = tickets.filter((ticket) => ticket.team?.trim() === team)
    const teamRelease = {
      name: team,
      tickets: teamTickets.map((ticket) => ({
        ticket: ticket.ticketNumber,
        title: ticket.summary,
        summary: ticket.copyAIDescription,
        customerFacing: ticket.isCustomerFacing
      }))
    }
    sortedTickets.push(teamRelease)
  })

  return sortedTickets
}
