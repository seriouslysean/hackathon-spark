import express, { json } from 'express';
import {
    getJiraAxiosClient,
    getJiraConfig,
    fetchJiraVersions,
    fetchTicketsAndSaveToFiles,
} from '#utils/jira-utils.js';

import { getCopyAISummary, getFileNames } from '#utils/copy-ai-utils.js';

// app setup
const app = express();
app.listen(3000, () => console.log('listening for requests on port 3000'));

//middleware
import cors from 'cors';
app.use(cors());
app.use(json());

// Define routes
app.get('/api/jira/versions', async (req, res) => {
    try {
        const { email, token, domain, projectKey, versionFilterPrefix } = getJiraConfig();
        const client = getJiraAxiosClient(email, token, domain);

        const versions = await fetchJiraVersions(client, projectKey, versionFilterPrefix);

        console.log(`Filtered Versions (${versionFilterPrefix}*):`);
        console.log(JSON.stringify(versions, null, 2));
        res.json(versions);
    } catch (error) {
        console.error(error.message);
        res.send(error.message);
    }
});

app.get('/api/spark/generate-release-notes', async (req, res) => {
    const { email, token, domain } = getJiraConfig();
    const { fixVersion } = req.query;
    const client = getJiraAxiosClient(email, token, domain);
    try {
        await fetchTicketsAndSaveToFiles(client, fixVersion);
        const fileNames = getFileNames(fixVersion);
        const copyAISummary = await getCopyAISummary(fileNames[0], fixVersion);
        console.log('CopyAI Summary:');
        console.log(copyAISummary);
        res.status(200).send('Release notes generated successfully');
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
    //
    // Build response based on outcome of workflow runs
    //
    //
    // const response = {
    //     title: 'Summary for Release x.y.z',
    //     releaseDate: 'Nov 1, 2022',
    //     // This will be the epics that were completed in the given release
    //     // We can check the parent of the tickets for this release, and see if:
    //     //   1. It has a type of epic
    //     //   2. It has a fix version of the current release
    //     epics: [{
    //         summary: 'Summary of whatever epic was completed',
    //     }],
    //     // Need team names, may need to store in ENV and split on a comma delimited value
    //     // But see if we can get them from JIRA first
    //     teams: [{
    //         name: 'explore & eval',
    //         tickets: [{
    //             ticket: 'UW-123',
    //             title: 'Title of ticket',
    //             summary: 'Summary of the ticket from COPYAI'
    //         }],
    //     }, {
    //         name: 'expansion',
    //         tickets: [{
    //             ticket: 'UW-123',
    //             title: 'Title of ticket',
    //             summary: 'Summary of the ticket from COPYAI'
    //         }],
    //     }]
    // };
});
