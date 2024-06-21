#!/usr/bin/env node

/**
 * This script fetches JIRA issues by fix version and saves the extracted issue data into text files.
 * Each issue's data is saved in a separate text file within a directory named after the fix version.
 *
 * Usage:
 * npm run tool:fetch-jira-fix-version -- -f <FixVersion>
 *
 * The script requires the following environment variables to be set in config/.env:
 * - JIRA_EMAIL: The email associated with the JIRA account.
 * - JIRA_TOKEN: The API token for JIRA access.
 * - JIRA_DOMAIN: The domain of the JIRA instance.
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getJiraAxiosClient, getJiraConfig, fetchTicketsByFixVersion, saveIssueData } from '#utils/jira-utils.js';

const argv = yargs(hideBin(process.argv))
    .option('f', {
        alias: 'fixVersion',
        describe: 'The JIRA fix version',
        type: 'string',
        demandOption: true,
    })
    .help()
    .alias('help', 'h')
    .argv;

const convertDescriptionToText = (description) => {
    if (!description || !description.content) return '';

    const extractText = (content) => content.reduce((acc, node) => {
        if (!node.content) return acc;

        const processNodeText = (item) => {
            let text = item.text || '';
            if (item.marks) {
                item.marks.forEach(mark => {
                    if (mark.type === 'strong') {
                        text = `**${text}**`;
                    }
                });
            }
            return text;
        };

        let prefix = '';
        if (node.type === 'heading') {
            const level = node.attrs.level;
            prefix = '#'.repeat(level) + ' ';
        }

        const nodeText = node.content.map(processNodeText).join(' ');
        return acc + prefix + nodeText.trim() + '\n';
    }, '');

    return extractText(description.content).trim();
};

const convertIssueLinksToText = (issuelinks) => {
    return issuelinks
        .filter(link => link.type.name !== "Cloners")
        .map(link => {
            const isOutward = !!link.outwardIssue;
            const issue = isOutward ? link.outwardIssue : link.inwardIssue;
            const direction = isOutward ? link.type.outward : link.type.inward;
            return `${issue.key}: ${issue.fields.summary} - ${direction}`;
        })
        .join('\n');
};

const extractIssueData = (issue) => ({
    key: issue.key,
    parent: issue.fields?.parent?.key ?? 'N/A',
    resolution: issue.fields?.resolution?.name ?? 'N/A',
    issuelinks: convertIssueLinksToText(issue.fields?.issuelinks) ?? 0,
    issuetype: issue.fields?.issuetype?.name ?? 'N/A',
    brand: issue.fields?.customfield_13301?.value ?? 'N/A',
    resolutiondate: issue.fields?.resolutiondate ?? 'N/A',
    summary: issue.fields?.summary ?? 'No summary',
    description: convertDescriptionToText(issue.fields?.description) ?? 'N/A',
    fixVersionName: issue.fields?.fixVersions?.map(fv => fv.name).join(', ') ?? 'N/A',
    fixVersionReleaseDate: issue.fields?.fixVersions?.map(fv => fv.releaseDate).join(', ') ?? 'N/A',
    priority: issue.fields?.priority?.name ?? 'N/A',
    team: issue.fields?.customfield_18834?.value ?? 'N/A',
    labels: issue.fields?.labels?.join(', ') ?? 'No labels'
});

// Example usage with environment variables and command line arguments
(async () => {
    try {
        const { email, token, domain } = getJiraConfig();
        const client = getJiraAxiosClient(email, token, domain);
        const FIX_VERSION = argv.fixVersion;
        const issues = await fetchTicketsByFixVersion(client, FIX_VERSION);

        issues.forEach(issue => {
            const issueData = extractIssueData(issue);
            saveIssueData(FIX_VERSION, issueData);
            console.log(`Saved ${issue.key}`);
        });
    } catch (error) {
        console.error(error.message);
    }
})();
