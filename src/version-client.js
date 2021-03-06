const core = require('@actions/core');

module.exports.upsertVersion = async function (client, version, projectKey) {
    var project = await client.getProject(projectKey)
        .catch(err => {
            core.warning(err)
            throw new Error('Error getting the project')
        });
    var response = await client.getVersions(projectKey)
        .catch(err => {
            core.warning(err)
            throw new Error('Error checking for the version')
        });

    core.info(JSON.stringify(response))
    const foundVersion = response.filter(x => x.name == version)
    if (foundVersion.length == 0) {
        await createVersion(client, version, project.id)
    }
}

module.exports.assignVersionToIssue = async function (client, version, issueId) {
    client.getIssue(issueId)
        .then((issue) => {
            const fixVersions = issue.fields.fixVersions
            if (!fixVersions.includes(version)) {
                update = {
                    update: { fixVersions: [{ add: { name: version } }] }
                }
                updateIssue(client, issueId, update)
            }
        }).catch(err => {
            core.warning(err)
            core.warning(`Could not find issue '${issueId}`)
        });
}

module.exports.releaseVersion = async function (client, version, projectKey) {
    client.getVersions(projectKey)
        .then(async (response) => {
            const release = response.filter(x => x.name == version)[0]
            const update = {
                id: release.id,
                released: true
            }
            await updateVersion(client, update)
        }).catch(err => {
            throw new Error(`Error releasing version '${version}' due to error: ${err}`)
        });
}

async function createVersion(client, version, projectId) {
    const versionBody = {
        name: version,
        projectId: projectId
    }
    await client.createVersion(versionBody)
        .catch(err => {
            throw new Error(`Error creating version: ${err}`)
        });
}

async function updateIssue(client, issueId, issue) {
    await client.updateIssue(issueId, issue)
        .catch(err => {
            core.warning(`Could not add version to issue '${issueId}' due to error: ${err}`)
        });
}

async function updateVersion(client, version) {
    await client.updateVersion(version)
        .catch(err => {
            core.warning(`Could not release version '${version.id}' due to error: ${err}`)
        });
}