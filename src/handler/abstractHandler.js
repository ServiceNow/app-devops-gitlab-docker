class AbstractToolIntegrationHandler {
  getJob() {}

  getJobId() {}

  getPipelineId () {}

  getProjectTitle () {}

  getBranch () {}

  getRunAttempt() {}

  getOrgId () {}

  getWorkflow () {}

  getRepository () {}

  getServerURL () {}

  getProjectId () {}

  getPipelineName() {}

  getSecurityScanPayload(payload = {}) {
    return payload;
  }
}

module.exports = AbstractToolIntegrationHandler
