const SnDevopsApi = require('../base/sndevopsApi.js')
const axios = require('axios');
const API_PACKAGE_PATH = 'api/sn_devops/devops/package/registration';
const BaseEnv = require('../../common/baseEnv.js')


class PackageManager extends SnDevopsApi {

    async createPackage(packageName, artifacts) {
      try{
         var response;
         var payload;
         var url;
         var artifactJson;
         let httpHeaders

         url = new URL(API_PACKAGE_PATH, this.url);
         url.searchParams.append("orchestrationToolId", this.toolId);

         try{
            artifactJson = JSON.parse(artifacts);
         } catch(exception){
            throw new Error("Package cannot be registered because Artifact Details were not parsed.");
         }

         try {
            payload = this._getRequestBodyForPackageRegistration(packageName, artifactJson)
            httpHeaders = { headers: this._getAuthHeaderWithToken() };    
            response = await axios.post(url.toString(), JSON.stringify(payload), httpHeaders);
            console.log("Response of package registration request ->: " + new URL(url).pathname + " --->"  +JSON.stringify(response.data))
         } catch(e){
            if (e.message.includes('ECONNREFUSED') || e.message.includes('ENOTFOUND')) {
                throw new Error('Package cannot be registered because the ServiceNow Instance URL is invalid. Enter the correct URL and try again.');
            }
            
            else if (e.message.includes('401')) {
                throw new Error('The SNOW_TOKEN and SNOW_TOOLID are incorrect. Verify that the variables are configured.');
            }
            
            else if (e.message.includes('405')) {
                throw new Error('Package cannot be registered because response Code from ServiceNow is 405. Please check ServiceNow logs for more details.');
            }

            else if(e.message.includes('400') || e.message.includes('404')){
                let errMsg = 'ServiceNow DevOps Package Registration is not successful. ';
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
                throw new Error('ServiceNow Package Registration cannot be completed. Please check ServiceNow logs for more details.'); 
            }
        }
      } catch(err) {
            console.error('\n \x1b[1m\x1b[31m' + err.message + '\x1b[0m\x1b[0m');
            process.exit(1);
      }   
        
    }

    _getRequestBodyForPackageRegistration(packageName, artifacts) {
        let branchName = this.fetchBranchName();
        let requestPayload = {
            "name": packageName,
            "artifacts": artifacts,
            "pipelineName": BaseEnv.CI_PROJECT_TITLE,
            "stageName": BaseEnv.CI_JOB_NAME,
            "taskExecutionNumber": BaseEnv.CI_JOB_ID,
            "branchName": branchName
        };
        if(BaseEnv.CI_PROJECT_ID) {
            requestPayload.gitLabProjectId = BaseEnv.CI_PROJECT_ID;
        }

        return requestPayload;
    }

}

module.exports = PackageManager;