const core = require('@actions/core');

module.exports.upsertVersion = function(client, version, projectId) {
    client.getVersion(version).then(response => {
        return response
    }).catch(errors.StatusCodeError, function (reason) {
        if (reason.statusCode == 404) {
            createVersion(client, version, projectId)
        }
        throw new Error('Error checking for the version')
    })
    .catch(errors.RequestError, function (reason) {
        throw new Error('Error checking for the version')
    });

}

module.exports.assignVersionToIssue = async function(client, version, issueId) {
    client.getIssue(issueId).then(issue => {
        const fixVersions = issue.fields.fixVersions
        if (fixVersions.includes(version)) {
            return;
        }
        const updated = [...fixVersions]
        updated.push(version)
        updateIssue(client, issueId, issue)
    }).catch(function(err){
        core.warning(`Could not find issue '${issueId}`)
    });
}

module.exports.releaseVersion = async function(client, version, projectId) {
  
}

function createVersion(client, version, projectId) {
    const versionBody = {
        version: version,
        projectId: projectId
    }
    client.createVersion(versionBody).catch(function (err) {
        throw new Error(`Error creating version: ${err.reason}`)
    });
}

async function updateIssue(client, issueId, issue) {
    client.updateIssue(issueId, issue).catch(function(err) {
        core.warning(`Could not add version to issue '${issueId}`)
    });
}