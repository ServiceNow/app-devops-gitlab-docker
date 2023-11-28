const SnDevopsApi = require('../base/sndevopsApi.js')

const API_PACKAGE_PATH = 'api/sn_devops/devops/package/registration';
const API_ARTIFACT_PATH = 'api/sn_devops/devops/artifact/registration';
const BaseEnv = require('../../common/baseEnv.js')


class ArtifactManager extends SnDevopsApi {

    createPackage(packageName, artifacts) {

        let url = new URL(API_PACKAGE_PATH, this.url);
        url.searchParams.append("orchestrationToolId", this.toolId)

        console.log("Computed  ServiceNow url " + url.toString())

        let artifactJson = JSON.parse(artifacts);
        let payload = this._getRequestBodyForPackageRegistration(packageName, artifactJson)

        this.post(url.toString(), payload, this._getAuthHeaderWithToken());
        
    }


    createArtifacts(artifacts) {

        let url = new URL(API_ARTIFACT_PATH, this.url);
        url.searchParams.append("orchestrationToolId", this.toolId)
        console.log("Computed path ServiceNow url " + url.toString())


        let artifactJson = JSON.parse(artifacts);
        let payload = this._getRequestBodyForArtifactRegistration(artifactJson)

        let response = this.post(url.toString(), payload, this._getAuthHeaderWithToken());
        console.log("Response for Package Creation" + response);

    }

    _getRequestBodyForPackageRegistration(packageName, artifacts) {
        let requestPayload = {
            "name": packageName,
            "pipelineName": BaseEnv.CI_PROJECT_PATH,
            "stageName": BaseEnv.CI_JOB_NAME,
            "taskExecutionNumber": BaseEnv.CI_JOB_ID,
            "orchestrationTask": {
                "orchestrationTaskURL": BaseEnv.CI_PIPELINE_URL,
                "orchestrationTaskName": BaseEnv.CI_JOB_NAME,
                "branchName": BaseEnv.CI_COMMIT_BRANCH,
                "toolId": this.toolId,
            },
            "artifacts": [
                {
                    "name": artifacts[0].name,
                    "pipelineName": BaseEnv.CI_PROJECT_PATH,
                    "repositoryName": artifacts[0].repositoryName,
                    "stageName": BaseEnv.CI_JOB_NAME,
                    "taskExecutionNumber": BaseEnv.CI_JOB_ID,
                    "semanticVersion": artifacts[0].semanticVersion,
                    "version": artifacts[0].version
                }
            ]
        }
        return requestPayload;

    }

    _getRequestBodyForArtifactRegistration(artifacts) {

        let requestPayload = {
            "taskExecutionNumber": BaseEnv.CI_JOB_ID,
            "pipelineName": BaseEnv.CI_PROJECT_PATH,
            "stageName": BaseEnv.CI_JOB_NAME,
            "artifacts": artifacts
        };
        return requestPayload;

    }


}

module.exports = ArtifactManager;