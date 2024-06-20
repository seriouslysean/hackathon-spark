# Jira PAT Setup and Validation

This guide provides instructions on creating a Jira Personal Access Token (PAT) and validating it for use in projects. The guide focuses on the required steps and attributes for the PAT.

## Creating a PAT

1. **Account Settings**: Log in to Jira, click your profile picture, then click the gear icon next to your profile to access **Account Settings**.
2. **Security Tab**: Inside the Account Settings, navigate to the **Security** tab.
3. **API Token**: Scroll to **API Token** and click **Create and manage API tokens**.
4. **Create API Token**:
   - Click **Create API Token**.
   - **Label**: Enter a label for your token to remember its purpose.
   - **Create**: Click **Create** to generate the token.
5. **Copy Token**: Copy the generated token immediately. This is the only time it will be displayed.

## Using Your PAT

Use the PAT for API requests to Jira. Provide it when prompted for authentication in tools or scripts. The token acts as a secure way to access Jira without using your actual password.

## Validating Your PAT

To validate your Jira PAT, set your environment variables in [`config/.env`](../config/.env), using [`config/.env.example`](../config/.env.example) as a guide. Then, run:

```sh
npm run tools:validate-jira
```

This script checks your PAT against the Jira API using the `JIRA_EMAIL`, `JIRA_TOKEN`, and `JIRA_DOMAIN` variables from your `.env` file, ensuring it has the necessary permissions for your tasks.
