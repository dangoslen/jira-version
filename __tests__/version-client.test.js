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
      version: 'version',
      projectId: 'project'
    })
  )
})