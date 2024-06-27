# Tools

The tools provided in this document are designed to automate and streamline various tasks related to this project.

## Fetch GitHub Release

**Command**: `npm run tools:fetch-github-release -- --currentVersion=<currentVersion> --previousVersion=<previousVersion>`

Fetches and logs the pull requests merged between two specified tags in a GitHub repository.

## Fetch JIRA Fix Version

**Command**: `npm run tool:fetch-jira-fix-version -- -f <FixVersion>`

Fetches JIRA issues by fix version and saves the extracted issue data into text files.

## Fetch JIRA Versions

**Command**: `npm run tool:fetch-jira-versions`

Fetches and displays all versions from Jira that optionally start with a prefix.

## Fetch JIRA Ticket

**Command**: `npm run tools:fetch-jira-ticket -- --ticketNumber=<ticketNumber>`

Fetches and displays details for a specified JIRA ticket.

## Run CopyAI Workflow

**Command**: `npm run tool:run-copy-ai-workflow -- -f <FixVersion> -t <TicketNumber>`

Starts a CopyAI workflow run with a given prompt and saves the output to a file.

## Validate GitHub

**Command**: `npm run validate-github`

Validates the GitHub Personal Access Token (PAT) by fetching the current user's details.

## Validate JIRA

**Command**: `npm run validate-jira`

Validates the JIRA Personal Access Token (PAT) by fetching the current user's details.
