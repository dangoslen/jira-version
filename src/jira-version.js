const core = require('@actions/core');
const JiraApi = require('jira-client');
const versionClient = require('./version-client');

const IN_JIRA_HOST = 'host'
const IN_USERNAME = 'username'
const IN_TOKEN = 'token'
const IN_VERSION = 'version'
const IN_PROJECT_KEY = 'projectKey'
const IN_ISSUE_IDS = 'issueIds'
const IN_RELEASE = 'release'

module.exports.action = async function () {
    const jiraHost = core.getInput(IN_JIRA_HOST)
    const username = core.getInput(IN_USERNAME)
    const token = core.getInput(IN_TOKEN)
    const projectKey = core.getInput(IN_PROJECT_KEY)
    const version = core.getInput(IN_VERSION)
    const issueIdString = core.getInput(IN_ISSUE_IDS)
    const shouldRelease = core.getBooleanInput(IN_RELEASE)

    const issues = await getIssues(issueIdString);
    const client = createJiraClient(jiraHost, username, token)

    versionClient.upsertVersion(client, version, projectKey)
        .catch(err => {
            core.setFailed(error.message);
        })
        .then(() => {
            issues.forEach(issue => {
                versionClient.assignVersionToIssue(client, version, issue)
            })
            shouldRelease && versionClient.releaseVersion(client, version, projectKey)
        })
}

function getIssues(issueIdString) {
    if (issueIdString == '') {
        return []
    }
    return JSON.parse(issueIdString)
}

function createJiraClient(jiraHost, username, token) {
    return new JiraApi({
        protocol: 'https',
        host: jiraHost,
        username: username,
        password: token
    })
}