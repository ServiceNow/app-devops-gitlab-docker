const SnDevopsApi = require('../base/sndevopsApi.js')
const axios = require('axios');
const API_SONAR_PATH = 'api/sn_devops/devops/tool/softwarequality';
const BaseEnv = require('../../common/baseEnv.js');

class SonarRegistrationManager extends SnDevopsApi {

    async createSonarSummary(sonarProjectKey, sonarUrl) {
        let sonarPayload; //Payload contains information necessary for fetching sonar summary
        let endpoint;
        let httpHeaders;
        let response;

        //Mandatory field validation check
        if(!sonarUrl) {
            console.error("sonarUrl is a required field. Enter the correct sonarUrl and try again.");
            process.exit(1);
        }
        if(!sonarProjectKey) {
            console.error("sonarProjectKey is a required field. Enter the correct sonarProjectKey and try again.");
            process.exit(1);
        }

        sonarPayload = {
            "sonarProjectKey": sonarProjectKey,
            "sonarUrl": sonarUrl,
        };
        
        endpoint = new URL(API_SONAR_PATH, this.url);
        endpoint.searchParams.append("toolId", this.toolId)
        console.log("Computed  ServiceNow url " + endpoint.toString());
        
        let payload = this._getRequestBodyForSonarSummary(sonarPayload);
        console.log("Payload to fetch sonar summary = " + JSON.stringify(payload));
        
        const defaultHeadersForToken = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'sn_devops.DevOpsToken ' + this.toolId + ":" + this.token
        };
        httpHeaders = { headers: defaultHeadersForToken };

        try {
            response = await axios.post(endpoint.toString(), JSON.stringify(payload), httpHeaders);
        } catch (e) {
            if (e.message.includes('ECONNREFUSED') || e.message.includes('ENOTFOUND') || e.message.includes('405')) {
                console.error('ServiceNow Instance URL is NOT valid. Enter the correct the URL and try again.');
                process.exit(1);

            } else if (e.message.includes('401')) {
                console.error('The SNOW_TOKEN and SNOW_TOOLID are incorrect. Verify that the variables are configured.');
                process.exit(1);

            } else if(e.message.includes('400') || e.message.includes('404')){
                let errMsg = '[ServiceNow DevOps] Register Sonar Scan Summaries are not Successful. ';
                let errMsgSuffix = ' Provide valid inputs and verify that the variables are configured.';
                let responseData = e.response.data;
                
                if (responseData && responseData.result && responseData.result.errorMessage) {
                    errMsg = errMsg + responseData.result.errorMessage + errMsgSuffix;
                    console.error(errMsg);
                    process.exit(1);
                }
                else if (responseData && responseData.result && responseData.result.details && responseData.result.details.errors) {
                    let errors = responseData.result.details.errors;
                    for (var index in errors) {
                        errMsg = errMsg + errors[index].message + errMsgSuffix;
                    }
                    console.error(errMsg);
                    process.exit(1);
                }

            } else {
                console.error('ServiceNow DevOps Event to register Sonar Scan Summaries is not created. Please check ServiceNow logs for more details.');
                process.exit(1);

            }
        }
    }

    _getRequestBodyForSonarSummary(sonarPayload) {
        let branchName = this.fetchBranchName();
        let payload = {
            "sonarProjectKey": sonarPayload.sonarProjectKey,
            "sonarUrl": sonarPayload.sonarUrl,
            "repositoryName": BaseEnv.CI_REPOSITORY_NAME,
            "repository": BaseEnv.CI_REPOSITORY_NAME,
            "pipelineName": BaseEnv.CI_PROJECT_TITLE,
            "buildNumber": BaseEnv.CI_JOB_ID,
            "stageName": BaseEnv.CI_JOB_NAME,
            "branchName": branchName,
            "toolId": this.toolId
        };
        if(BaseEnv.CI_PROJECT_ID) {
            payload.gitLabProjectId = BaseEnv.CI_PROJECT_ID
        }
        if(BaseEnv.CI_WORKFLOW_NAME) {
            payload.workflow =  BaseEnv.CI_WORKFLOW_NAME
        }
        if(BaseEnv.CI_RUN_ATTEMPT) {
            payload.attemptNumber = BaseEnv.CI_RUN_ATTEMPT;
        }
        return payload;
    }

}

module.exports = SonarRegistrationManager;