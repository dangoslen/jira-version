const core = require('@actions/core');

module.exports.upsertVersion = async function(client, version, projectId) {
    client.getVersions(projectId).then(async (response) => {
        // Version exists, nothing to todo
        const names = response.map(x => x.name)
        if (!names.includes(version)) {
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
            updateIssue(client, issueId, issue);
        }
    }).catch(err => {
        core.warning(`Could not find issue '${issueId}`)
    });
}

module.exports.releaseVersion = async function(client, version, projectId) {
  
}

async function createVersion(client, version, projectId) {
    const versionBody = {
        version: version,
        projectId: projectId
    }
    
    client.createVersion(versionBody).then(response => {
        return
    }).catch(err => {
        throw new Error(`Error creating version: ${err.reason}`)
    });
}

async function updateIssue(client, issueId, issue) {
    client.updateIssue(issueId, issue).catch(function(err) {
        core.warning(`Could not add version to issue '${issueId}`)
    });
}