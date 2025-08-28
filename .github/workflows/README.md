# GitHub Actions Setup

This directory contains GitHub Actions workflows for automated CI/CD.

## NPM Publishing Setup

To enable automatic npm publishing, you need to set up an NPM_TOKEN secret in your GitHub repository:

### 1. Create NPM Access Token

1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Click on your profile → "Access Tokens"
3. Click "Generate New Token" → "Granular Access Token"
4. Configure the token:
   - **Token name**: `syncrostate-github-actions`
   - **Expiration**: Set to your preference (e.g., 1 year)
   - **Packages and scopes**: Select your `syncrostate` package
   - **Permissions**: 
     - `Read and write` for the package
     - `Read` for organization (if applicable)

### 2. Add Secret to GitHub Repository

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `NPM_TOKEN`
5. Value: Paste the token you created from npm
6. Click **"Add secret"**

### 3. How the Workflow Works

The `publish.yml` workflow will:

- **Trigger**: Automatically run when code is pushed to `master` or `main` branch
- **Version Check**: Compare current package version with published version on npm
- **Build & Test**: Run tests and build the package
- **Publish**: Only publish if the version number has changed
- **Release**: Create a GitHub release with the new version tag

### 4. Manual Publishing

You can also trigger the workflow manually:
1. Go to **Actions** tab in your GitHub repository
2. Select "Publish to NPM" workflow
3. Click "Run workflow" button

### 5. Version Management

To publish a new version:
1. Update the version in `package/package.json`
2. Update the `CHANGELOG.md` with new changes
3. Commit and push to master/main branch
4. The workflow will automatically detect the version change and publish

### Security Notes

- The NPM_TOKEN is stored securely as a GitHub secret
- The workflow only publishes when the version number changes
- Tests must pass before publishing
- The workflow runs in an isolated environment
