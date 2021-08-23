const jiraVersion = require('../src/jira-version');
const versionClient = require('../src/version-client');

const mockUpsertVersion = jest.spyOn(versionClient, 'upsertVersion')
    .mockImplementation((client, version) => {
  return Promise.resolve(null)
})

const mockAssignVersionToIssue = jest.spyOn(versionClient, 'assignVersionToIssue')
    .mockImplementation((client, version, issueId) => {
  return
})

const mockReleaseVersion = jest.spyOn(versionClient, 'releaseVersion')
    .mockImplementation((client, version, projectId) => {
  return
})

beforeEach(() => {
  jest.clearAllMocks()
});

afterEach(() => {
  
});

// Should grab all the inputs properly
test('grabs inputs and calls basic flow w/o releasing version', (done) => {
  initBasicInputs();

  jiraVersion.action().then(() => {
    expect(mockUpsertVersion).toHaveBeenCalledTimes(1)

    let versionArg = mockUpsertVersion.mock.calls[0][1]
    expect(versionArg).toBe('version')

    expect(mockAssignVersionToIssue).toHaveBeenCalledTimes(2)

    versionArg = mockAssignVersionToIssue.mock.calls[0][1]
    expect(versionArg).toBe('version')

    const firstIssue = mockAssignVersionToIssue.mock.calls[0][2]
    const secondIssue = mockAssignVersionToIssue.mock.calls[1][2]
    expect([firstIssue, secondIssue]).toStrictEqual(['JIRA-1', 'JIRA-2'])

    expect(mockReleaseVersion).not.toHaveBeenCalled()

    done()
  })
})

function initBasicInputs() {
  process.env['INPUT_JIRAHOST'] = 'jira-host'
  process.env['INPUT_USERNAME'] = 'user'
  process.env['INPUT_TOKEN'] = 'token'
  process.env['INPUT_PROJECTID'] = 'projectId'
  process.env['INPUT_VERSION'] = 'version'
  process.env['INPUT_ISSUEIDS'] = '["JIRA-1", "JIRA-2"]'
  process.env['INPUT_RELEASE'] = 'false'
}