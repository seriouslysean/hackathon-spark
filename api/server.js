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

app.get('/api/jira/release', async (req, res) => {
    const response = {
        title: 'Summary for Release x.y.z',
        releaseDate: 'Nov 1, 2022',
        // This will be the epics that were completed in the given release
        // We can check the parent of the tickets for this release, and see if:
        //   1. It has a type of epic
        //   2. It has a fix version of the current release
        epics: [{
            summary: 'Summary of whatever epic was completed',
        }],
        // Need team names, may need to store in ENV and split on a comma delimited value
        // But see if we can get them from JIRA first
        teams: [{
            name: 'Bread Bakers',
            tickets: [{
                ticket: 'BB-123',
                title: 'Yeast shortage affecting production',
                summary: 'Investigate and address the recent yeast shortage impacting bread production rates.',
                customerFacing: true
            }, {
                ticket: 'BB-124',
                title: 'New sourdough bread line',
                summary: 'Develop a new line of sourdough breads for health-conscious consumers.',
                customerFacing: true
            }],
        }, {
            name: 'Cheese Crafters',
            tickets: [{
                ticket: 'CC-456',
                title: 'Aging room temperature inconsistencies',
                summary: 'Resolve temperature fluctuations in the cheese aging rooms to ensure product consistency.',
                customerFacing: false
            }, {
                ticket: 'CC-457',
                title: 'Lactose-free cheese options',
                summary: 'Research and develop lactose-free cheese options to cater to lactose-intolerant customers.',
                customerFacing: true
            }],
        }, {
            name: 'Chocolate Artisans',
            tickets: [{
                ticket: 'CA-789',
                title: 'Cocoa supply chain disruptions',
                summary: 'Develop a contingency plan for cocoa supply chain disruptions to maintain production schedules.',
                customerFacing: false
            }, {
                ticket: 'CA-790',
                title: 'Organic chocolate line',
                summary: 'Launch a new line of organic chocolates to meet growing consumer demand for organic products.',
                customerFacing: true
            }],
        }, {
            name: 'Pasta Makers',
            tickets: [{
                ticket: 'PM-101',
                title: 'Gluten-free pasta recipe development',
                summary: 'Create a new gluten-free pasta recipe to expand our product line to include gluten-sensitive options.',
                customerFacing: true
            }],
        }, {
            name: 'Pastry Chefs',
            tickets: [{
                ticket: 'PC-112',
                title: 'Expansion of vegan dessert options',
                summary: 'Expand our dessert offerings with new vegan options to cater to a broader customer base.',
                customerFacing: true
            }, {
                ticket: 'PC-113',
                title: 'Reduced sugar dessert recipes',
                summary: 'Develop reduced sugar recipes for our existing dessert lineup to offer healthier options.',
                customerFacing: true
            }, {
                ticket: 'PC-114',
                title: 'Eco-friendly packaging',
                summary: 'Implement eco-friendly packaging for all pastry products to reduce environmental impact.',
                customerFacing: false
            }],
        }]
    };
    console.log(response);
    res.send(response);
});
