# Local Setup

## Table of Contents

- [Recommended IDE Setup](#recommended-ide-setup)
- [Environment Variables](#environment-variables)
- [Customize Configuration](#customize-configuration)
- [Project Setup](#project-setup)
  - [Start Development Server](#start-development-server)
  - [Compile and Minify for Production](#compile-and-minify-for-production)
  - [Run Unit Tests with Vitest](#run-unit-tests-with-vitest)
  - [Lint with ESLint](#lint-with-eslint)

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Environment Variables

S.P.A.R.K. requires the following environment variables to be set in the `config/.env` file. You can use the `config/.env.example` file as a guide.

- `COPY_AI_TOKEN`: Token for accessing CopyAI services.
- `COPY_AI_WORKFLOW_ID`: ID of the workflow to be used in CopyAI.
- `GITHUB_OWNER`: The owner of the GitHub repository.
- `GITHUB_REPO`: The name of the GitHub repository.
- `GITHUB_TOKEN`: PAT for accessing GitHub services.
- `JIRA_TOKEN`: PAT for accessing JIRA services.
- `JIRA_EMAIL`: Email associated with the JIRA account.
- `JIRA_DOMAIN`: Domain of the JIRA instance.
- `JIRA_PROJECT_KEY`: Key of the JIRA project.
- `JIRA_TEAM_NAMES`: Comma-separated list of team names in JIRA.
- `JIRA_VERSION_FILTER_PREFIX`: Prefix to filter JIRA versions on.
- `SPARK_ENABLE_REALTIME_DATA`: Flag to enable real-time data fetching.

## Customize Configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Start Server + Client

```sh
npm run dev
```

This command spins up both the Express server and the client application for development, with hot-reload enabled.

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
