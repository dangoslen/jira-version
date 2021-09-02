const versionClient = require('../src/version-client');
const jiraClient = require('jira-client')
const errors = require('request-promise/errors')

test('upsert version should not do anything when version exists', async () => {
  const mockGetVersions = jest.fn(projectId => {
      return Promise.resolve([{
        name: 'version'
      }])
  })

  jiraClient.getVersions = mockGetVersions
 
  await versionClient.upsertVersion(jiraClient, 'version', 'project')

  expect(mockGetVersions).toHaveBeenCalled()
})

test('upsert version should create a new version', async () => {
  const mockGetVersions = jest.fn(projectId => {
    return Promise.resolve([ ])
  })
  const mockCreateVersion = jest.fn(body => {
    return Promise.resolve(null)
  })

  jiraClient.getVersions = mockGetVersions
  jiraClient.createVersion = mockCreateVersion

  await versionClient.upsertVersion(jiraClient, 'version', 'project')

  expect(mockGetVersions).toHaveBeenCalled()
  expect(mockCreateVersion).toBeCalledWith(
    expect.objectContaining({
      name: 'version',
      projectId: 'project'
    })
  )
})

test('add version to issue should add the version to the issue when it does not already',  done => {
  const mockGetIssue = jest.fn(issueId => {
    return Promise.resolve({
      fields: {
        'fixVersions': [ ]
      }
    })
  })

  const validate = function(issueId, issue) {
    expect(issueId).toBe('issue')
    expect(issue).toMatchObject({
      fields: {
        'fixVersions': [ 'version' ]
      }
    })

    done()
  }
  const mockUpdateIssue = jest.fn((issueId, issue) => {
    validate(issueId, issue)
    return Promise.resolve(null)
  })

  jiraClient.getIssue = mockGetIssue
  jiraClient.updateIssue = mockUpdateIssue

  versionClient.assignVersionToIssue(jiraClient, 'version', 'issue')

  expect(mockGetIssue).toHaveBeenCalled()
})

test('do not add version when it already exists',  async () => {
  const mockGetIssue = jest.fn(issueId => {
    return Promise.resolve({
      fields: {
        'fixVersions': [ 'version' ]
      }
    })
  })

  const mockUpdateIssue = jest.fn((issueId, issue) => {
    return Promise.resolve(null)
  })

  jiraClient.getIssue = mockGetIssue
  jiraClient.updateIssue = mockUpdateIssue

  versionClient.assignVersionToIssue(jiraClient, 'version', 'issue')

  expect(mockGetIssue).toHaveBeenCalled()
  expect(mockUpdateIssue).not.toHaveBeenCalled()
})

test('should release version',  async () => {
  const mockGetVersions = jest.fn(projectId => {
    return Promise.resolve([{
      id: '100',
      name: 'version'
    }])
  })

  const mockUpdateVersion = jest.fn((versionId, version) => {
    return Promise.resolve(null)
  })

  jiraClient.getVersions = mockGetVersions
  jiraClient.updateVersion = mockUpdateVersion

  await versionClient.releaseVersion(jiraClient, 'version', 'project')

  expect(mockGetVersions).toHaveBeenCalled()
  expect(mockUpdateVersion).toHaveBeenCalled()
})