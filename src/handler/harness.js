const AbstractToolIntegrationHandler = require('./abstractHandler')

class HarnessIntegrationHandler extends AbstractToolIntegrationHandler {
  handle () {
    if (process.env.HARNESS_ORG_ID) {
      console.log('Platform: Harness.io')
      return true
    }
  }

  getJobId () {
    return process.env.HARNESS_STAGE_ID
  }

  getJob () {
    return process.env.DRONE_STAGE_NAME || process.env.HARNESS_STAGE_NAME
  }

  getRunId () {
    return process.env.HARNESS_BUILD_ID
  }

  getPipelineId () {
    return process.env.HARNESS_PIPELINE_ID
  }

  getBranch () {
    return process.env.CI_COMMIT_BRANCH
  }

  getProjectTitle () {
    return process.env.HARNESS_PIPELINE_NAME || process.env.HARNESS_PIPELINE_ID
  }

  getRunAttempt () {
    return null
  }

  getOrgId () {
    return process.env.HARNESS_ORG_ID
  }

  getProjectId () {
    return process.env.HARNESS_PROJECT_ID
  }

  getCallbackURL (){
    const HARNESS_DEFAULT_URL = 'https://app.harness.io/';
    const harnessPipelineExecutionUrl = `${HARNESS_DEFAULT_URL}/ng/#/account/${process.env.HARNESS_ACCOUNT_ID}/ci/orgs/${process.env.HARNESS_ORG_ID}/projects/${process.env.HARNESS_PROJECT_ID}/pipeline/${process.env.HARNESS_PIPELINE_ID}/executions/${process.env.HARNESS_EXECUTION_ID}`;
    return process.env.CI_CALLBACK_URL || harnessPipelineExecutionUrl;
  }

  getPipelineName (pipelineName) {
    return `${process.env.HARNESS_ORG_ID}/${process.env.HARNESS_PROJECT_ID}/${pipelineName}`
  }
}

module.exports = HarnessIntegrationHandler;