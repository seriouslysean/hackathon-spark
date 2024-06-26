import express, { json } from 'express'
import { existsSync } from 'fs';
import { join } from 'path';
import { kebabCase } from '#utils/utils.js';
import { generateEmailFile, saveEmailToFile } from '#utils/email-utils.js'
import {
  getJiraAxiosClient,
  getJiraConfig,
  fetchJiraVersions,
  fetchTicketsAndSaveToFiles,
  sortTicketsByTeams
} from '#utils/jira-utils.js'

import { getCopyAISummary, readFileContents } from '#utils/copy-ai-utils.js'

// app setup
const app = express()
app.listen(3000, () => console.log('listening for requests on port 3000'))

//middleware
import cors from 'cors'
app.use(cors())
app.use(json())

// Define routes
app.get('/api/jira/versions', async (req, res) => {
  if (process.env.SPARK_ENABLE_REALTIME_DATA !== 'true') {
    try {
      // Directly destructure MOCK_FIX_VERSIONS from the dynamically imported module
      const { MOCK_FIX_VERSIONS } = await import('#fixtures/fix-versions.js')
      console.log('Using mock fix versions:', MOCK_FIX_VERSIONS)
      res.status(200).json(MOCK_FIX_VERSIONS)
    } catch (error) {
      console.error('Failed to import MOCK_FIX_VERSIONS:', error)
      res.status(500).send('Failed to load mock fix versions')
    }
    return
  }

  try {
    const { email, token, domain, projectKey, versionFilterPrefix } = getJiraConfig()
    const client = getJiraAxiosClient(email, token, domain)

    const versions = await fetchJiraVersions(client, projectKey, versionFilterPrefix)

    console.log(`Filtered Versions (${versionFilterPrefix}*):`)
    console.log(JSON.stringify(versions, null, 2))
    res.json(versions)
  } catch (error) {
    console.error(error.message)
    res.send(error.message)
  }
})

app.get('/api/spark/generate-release-notes', async (req, res) => {
  if (process.env.SPARK_ENABLE_REALTIME_DATA !== 'true') {
    try {
      // Directly destructure MOCK_RELEASE_NOTES from the dynamically imported module
      const { MOCK_RELEASE_NOTES } = await import('#fixtures/release-notes.js')
      console.log('Using mock release notes:', MOCK_RELEASE_NOTES)
      res.status(200).json(MOCK_RELEASE_NOTES)
    } catch (error) {
      console.error('Failed to import MOCK_RELEASE_NOTES:', error)
      res.status(500).send('Failed to load mock release notes')
    }
    return
  }

  // Logic for when real-time data is enabled
  const { email, token, domain } = getJiraConfig()
  const { fixVersion } = req.query
  const client = getJiraAxiosClient(email, token, domain)
  try {
    await fetchTicketsAndSaveToFiles(client, fixVersion)
    const ticketFiles = readFileContents(fixVersion)
    let ticketsWithSummaries = []
    let epicsWithSummaries = []
    for (const file of ticketFiles) {
      const copyAIResponse = await getCopyAISummary(
        JSON.stringify(file, null, 2),
        file.ticketNumber,
        fixVersion
      )

      const { summary: copyAIDescription, isCustomerFacing } = copyAIResponse
      if (file.type === 'Epic') {
        epicsWithSummaries.push({ ticket: file.ticketNumber, title: file.summary, summary: copyAIDescription, isCustomerFacing })
      } else {
        ticketsWithSummaries.push({ ...file, copyAIDescription, isCustomerFacing })
      }
    }

    const sortedTickets = sortTicketsByTeams(ticketsWithSummaries)
    console.log('Sorted Tickets:', JSON.stringify(sortedTickets, null, 2))

    const response = {
      title: fixVersion,
      releaseDate: ticketsWithSummaries[0].fixVersionReleaseDate,
      epics: epicsWithSummaries,
      teams: sortedTickets
    }
    console.log(response)
    res.status(200).send(response)
  } catch (error) {
    console.error(error.message)
    res.status(500).send(error.message)
  }
})

app.post('/api/spark/generate-email-file', (req, res) => {
  const { emailTitle, contentHtml, release } = req.body;

  // Validate required fields
  if (!emailTitle || !contentHtml || !release) {
    return res.status(400).send('Missing required fields: emailTitle, contentHtml, release');
  }

  // Generate EML content without specifying "To" email address
  const emlContent = generateEmailFile(emailTitle, contentHtml);

  // Use the new utility to save the email file
  saveEmailToFile(release, emlContent);

  // Respond to indicate success without filename
  res.send({ message: 'Email file generated successfully.' });
});

app.get('/api/spark/download-email-file/:release', (req, res) => {
  const { release } = req.params;
  const releaseKebab = kebabCase(release); // Convert release to kebab-case
  const filePath = join('/tmp/emails', `${releaseKebab}.eml`); // Updated path
  const timestamp = Date.now();
  const downloadFilename = `spark-email-${releaseKebab}-${timestamp}.eml`; // Use kebab-case in filename

  if (existsSync(filePath)) {
    res.download(filePath, downloadFilename, (err) => {
      if (err) {
        console.error(`Failed to download email: ${err.message}`);
        res.status(500).send('Failed to download email.');
      }
    });
  } else {
    res.status(404).send('Email file not found.');
  }
});
