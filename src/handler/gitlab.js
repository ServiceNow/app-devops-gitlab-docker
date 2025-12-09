const AbstractToolIntegrationHandler = require('./abstractHandler');

class GitlabIntegrationHandler extends AbstractToolIntegrationHandler {
    /**
     * Detect if running in a GitLab CI environment.
     * @returns {boolean}
     */
    handle() {
        if (process.env.GITLAB_CI) {
            console.log('Platform: GitLab');
            return true;
        }
        return false;
    }

    /**
     * Ensures GitLab-specific pipelineInfo fields are set in the security scan payload.
     *
     * - Modifies pipelineInfo.orchestrationPipeline and pipelineInfo.taskExecutionUrl if not already set,
     *   using GitLab CI environment variables.
     * - Leaves all other fields as provided in the input payload.
     * - Returns the modified payload, ready for ServiceNow registration.
     *
     * @param {Object} [securityPayload] - The input payload containing pipelineInfo and securityResultAttributes.
     * @returns {Object} The payload with GitLab-specific pipelineInfo fields set as needed.
     */
    getSecurityScanPayload(securityPayload = {}) {

        // Prefer values from the payload, else fall back to environment variables
        let orchestrationPipeline = securityPayload.pipelineInfo.orchestrationPipeline;
        if (!orchestrationPipeline) {
            if (process.env.CI_PROJECT_NAMESPACE === "root") {
                orchestrationPipeline = process.env.CI_PROJECT_NAME;
            } else {
                orchestrationPipeline = process.env.CI_PROJECT_PATH;
            }
        }
        securityPayload.pipelineInfo.orchestrationPipeline = orchestrationPipeline;

        let taskExecutionUrl = securityPayload.pipelineInfo.taskExecutionUrl;
        if (!taskExecutionUrl) {
            taskExecutionUrl = process.env.CI_JOB_URL ? process.env.CI_JOB_URL : null;
        }
        // Ensure taskExecutionUrl ends with a '/'
        if (taskExecutionUrl && !taskExecutionUrl.endsWith('/')) {
            taskExecutionUrl += '/';
        }
        securityPayload.pipelineInfo.taskExecutionUrl = taskExecutionUrl;
        return securityPayload;
    }

    getPipelineName (pipelineName) {
        return pipelineName;
    }
}

module.exports = GitlabIntegrationHandler;

