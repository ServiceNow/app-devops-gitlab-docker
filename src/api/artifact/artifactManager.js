const SnDevopsApi = require('../base/sndevopsApi.js')

const API_ARTIFACT_PATH = 'api/sn_devops/devops/artifact/registration';
const BaseEnv = require('../../common/baseEnv.js');
const { default: axios } = require('axios');


class ArtifactManager extends SnDevopsApi {

    async createArtifacts(artifacts) {

        try{
            var response;
            var payload;
            var url;
            var artifactJson;

            url = new URL(API_ARTIFACT_PATH, this.url);
            url.searchParams.append("orchestrationToolId", this.toolId)
        
            try{
                artifactJson = JSON.parse(artifacts);
            } catch(exception){
                throw new Error("Artifact cannot be registered because Artifact Details were not parsed.");
            }
            
            try {
                payload = this._getRequestBodyForArtifactRegistration(artifactJson);
                let httpHeaders = { headers: this._getAuthHeaderWithToken() };    

                response = await axios.post(url.toString(), JSON.stringify(payload), httpHeaders);
            } catch(e){
                if (e.message.includes('ECONNREFUSED') || e.message.includes('ENOTFOUND')) {
                    throw new Error('Artifact cannot be registered because the ServiceNow Instance URL is invalid. Enter the correct URL and try again.');
                }
                
                else if (e.message.includes('401')) {
                    throw new Error('The SNOW_TOKEN and SNOW_TOOLID are incorrect. Verify that the variables are configured.');
                }
                
                else if (e.message.includes('405')) {
                    throw new Error('Artifact cannot be registered because response Code from ServiceNow is 405. Please check ServiceNow logs for more details.');
                }

                else if(e.message.includes('400') || e.message.includes('404')){
                    let errMsg = 'ServiceNow DevOps Artifact Registration is not successful. ';
                    let responseData = e.response.data;
                    if (responseData && responseData.result && responseData.result.errorMessage) {
                        errMsg = errMsg + responseData.result.errorMessage;
                        throw new Error(errMsg);
                    }
                    else if (responseData && responseData.result && responseData.result.details && responseData.result.details.errors) {
                        let errors = responseData.result.details.errors;
                        for (var index in errors) {
                            errMsg = errMsg + errors[index].message;
                        }
                        throw new Error(errMsg);
                    }
                }

                else {
                    throw new Error('ServiceNow Artifact Registration cannot be completed. Please check ServiceNow logs for more details.'); 
                }
            }
        } catch(err) {
            console.error('\n \x1b[1m\x1b[31m' + err.message + '\x1b[0m\x1b[0m');
            process.exit(1);
        }                    
    }

    _getRequestBodyForArtifactRegistration(artifacts) {

        let requestPayload = {
            "taskExecutionNumber": BaseEnv.CI_JOB_ID,
            "pipelineName": BaseEnv.CI_PROJECT_TITLE,
            "stageName": BaseEnv.CI_JOB_NAME,
            "artifacts": artifacts
        };

        if(BaseEnv.CI_PROJECT_ID) {
            requestPayload.gitLabProjectId = BaseEnv.CI_PROJECT_ID;
        }
        this.validateArtifactsPayload(requestPayload);
        return requestPayload;

    }

    validateArtifactsPayload(artifactPayload){
        for (var key in artifactPayload) {
            if (artifactPayload.hasOwnProperty(key) && !artifactPayload[key]) {
               throw new Error(`Artifact cannot be registered as Key: ${key} has a null value.`);
            }
        }  
    }
}

module.exports = ArtifactManager;