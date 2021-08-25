const core = require('@actions/core');

module.exports.upsertVersion = async function(client, version, projectId) {
    client.getVersions(projectId).then(async (response) => {
        const foundVersion = response.filter(x => x.name == version)
        if (foundVersion.length == 0) {
            await createVersion(client, version, projectId)
        }
    }).catch(err => {
        throw new Error('Error checking for the version')
    });
}

module.exports.assignVersionToIssue = async function(client, version, issueId) {
    client.getIssue(issueId).then(issue => {
        const fixVersions = issue.fields.fixVersions
        if (!fixVersions.includes(version)) {
            const updated = [...fixVersions]
            updated.push(version)
            issue.fields.fixVersions = updated
            updateIssue(client, issueId, issue);
        }
    }).catch(err => {
        core.warning(`Could not find issue '${issueId}`)
    });
}

module.exports.releaseVersion = async function(client, version, projectId) {
    client.getVersions(projectId).then(async (response) => {
        // Version exists, nothing to todo
        const foundVersion = response.filter(x => x.name == version)[0]
        const updated = {}
        Object.assign(updated, foundVersion)
        updated.released = true
        await updateVersion(client, updated.id, updated)
    }).catch(err => {
        throw new Error('Error releasing version')
    });
}

async function createVersion(client, version, projectId) {
    const versionBody = {
        version: version,
        projectId: projectId
    }  
    client.createVersion(versionBody).catch(err => {
        throw new Error(`Error creating version: ${err.reason}`)
    });
}

async function updateIssue(client, issueId, issue) {
    client.updateIssue(issueId, issue).catch(err => {
        core.warning(`Could not add version to issue '${issueId}`)
    });
}

async function updateVersion(client, versionId, version) {
    client.updateVersion(versionId, version).catch(err => {
        core.warning(`Could not release version '${versionId}`)
    });
}