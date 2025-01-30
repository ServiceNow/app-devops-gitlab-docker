const AbstractToolIntegrationHandler = require('./abstractHandler')

class GithubIntegrationHandler extends AbstractToolIntegrationHandler {
  
  handle () {
    if (process.env.GITHUB_ACTIONS) {
      console.log('Platform: GitHub')
      return true
    }
  }

  getJob () {
    return process.env.GITHUB_JOB
  }

  getJobId () {
    return process.env.GITHUB_RUN_ID
  }

  getPipelineId () {
    return process.env.GITHUB_RUN_ID
  }

  getProjectTitle () {
    return `${process.env.GITHUB_REPOSITORY}/${process.env.GITHUB_WORKFLOW}`
  }

  getBranch () {
    return process.env.GITHUB_REF
  }

  getRunAttempt () {
    return process.env.GITHUB_RUN_ATTEMPT
  }

  getWorkflow () {
    return process.env.GITHUB_WORKFLOW
  }

  getRepository () {
    return process.env.GITHUB_REPOSITORY
  }

  getServerURL () {
    return process.env.GITHUB_SERVER_URL
  }

  getPipelineName (pipelineName) {
    return pipelineName
  }
}

module.exports = GithubIntegrationHandler;
