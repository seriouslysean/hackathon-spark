import express, { json } from 'express';
import { getJiraAxiosClient, getJiraConfig, fetchJiraVersions } from '#utils/jira-utils.js';

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
