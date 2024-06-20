# GitHub PAT Setup and Validation

This guide provides instructions on creating a GitHub Personal Access Token (PAT) and validating it for use in projects, with a focus on the required attributes for the PAT.

## Creating a PAT

1. **GitHub Settings**: Log in, click your profile picture, then **Settings**.
2. **Developer Settings**: Scroll to **Developer Settings** on the sidebar.
3. **Tokens**: Select **Personal Access Tokens**, then **Generate New Token**.
4. **Configure Token**:
   - **Note**: Enter a name for your token.
   - **Expiration**: Choose an expiry period.
   - **Scopes**: Select necessary permissions. The `repo` scope is required for most project-related actions, including private repository access, commit status, repositories invitations, and more.
5. **Generate**: Click **Generate Token**. Copy the token immediately.

## Optional SSO Authentication

If using SSO:

1. **Review Tokens**: Go to **Personal Access Tokens** in settings.
2. **Enable SSO**: Click **Enable SSO** next to your token.
3. **Authorize**: Follow prompts to authorize for SSO organizations.

## Using Your PAT

Use the PAT for API requests, cloning repositories, etc. Provide it when prompted for a password in tools or scripts. The `repo` scope ensures broad access for repository management tasks.

## Validating Your PAT

To validate your PAT, set your environment variables in [`config/.env`](../config/.env), using [`config/.env.example`](../config/.env.example) as a guide. Then, run:

```sh
npm run tools:validate-pat
```

This script checks your PAT against the GitHub API using the `GITHUB_TOKEN`, `GITHUB_OWNER`, and `GITHUB_REPO` variables from your `.env` file, ensuring it has the necessary permissions, especially the `repo` scope.
