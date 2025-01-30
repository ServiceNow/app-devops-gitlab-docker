const SnDevopsApi = require('../base/sndevopsApi.js')
const API_GET_CHANGE_PATH = 'api/sn_devops/devops/orchestration/changeInfo';
const axios = require('axios');
const BaseEnv = require('../../common/baseEnv.js');
const fs = require('fs');

class GetChangeManager extends SnDevopsApi {
    
  /**
   * 
   * @param {*} changeDetails  : 
    * {
       "build_number": "21",
       "pipeline_name": "CI_Pipeline",
       "stage_name": "Create_Change"
       }
   */
    async getChange(changeDetails) {
        let status = "NOT-STARTED";
        let buildNumber;
        let stageName;
        let pipelineName;
        let url;
        let httpHeaders;
        let response;
        let outputObject = {};
        let changeDetailsParsed;
        let gitLabProjectId;
        let attemptNumber;

        try {
            outputObject.status = status;

            //changeDetails are optional
            if(changeDetails) {
                try {
                    changeDetailsParsed = JSON.parse(changeDetails);
                    buildNumber = changeDetailsParsed.buildNumber;
                    stageName = changeDetailsParsed.stageName;
                    pipelineName = changeDetailsParsed.pipelineName;
                    attemptNumber = changeDetailsParsed.attemptNumber
                } catch (e) {
                    throw new Error("Change request details cannot be retrieved because changeDetails were not parsed.");
                }
            }

            try {
                buildNumber = buildNumber || BaseEnv.CI_JOB_ID;
                stageName = stageName || BaseEnv.CI_JOB_NAME;
                pipelineName = pipelineName || BaseEnv.CI_PROJECT_TITLE;
                gitLabProjectId = BaseEnv.CI_PROJECT_ID;
                attemptNumber = attemptNumber || BaseEnv.CI_RUN_ATTEMPT;

                console.log("buildNumber " + buildNumber + " stageName = " + stageName + " pipelineName = " + pipelineName + " attemptNumber = "+ attemptNumber);

                url = new URL(API_GET_CHANGE_PATH, this.url);
                url.searchParams.append("buildNumber", buildNumber);
                url.searchParams.append("stageName", stageName);
                url.searchParams.append("pipelineName", this.buildPipelineName(pipelineName));
                url.searchParams.append("toolId", this.toolId);
                if(gitLabProjectId)
                    url.searchParams.append("pipelineId", gitLabProjectId);
                if(attemptNumber)
                    url.searchParams.append("attemptNumber", attemptNumber);
                console.log("Get change API = " + url.toString());

                httpHeaders = { headers: this._getAuthHeaderWithToken() };    
                response = await axios.get(url.toString(), httpHeaders);
                console.log("[ServiceNow DevOps], Receiving response for Get Change, Response : " + JSON.stringify(response.data));
                
               
                if (response.data && response.data.result) {
                    status = "SUCCESS";
                    console.log('\n \x1b[1m\x1b[32m' + "changeRequestNumber => " + response.data.result.number + '\x1b[0m\x1b[0m');
                    outputObject.changeRequestNumber = response.data.result.number;
                    outputObject.status = status;
                    this._writeToOutputFile(outputObject);
                    return outputObject;
                } else {
                    status = "NOT SUCCESSFUL";
                    throw new Error('No response from ServiceNow. Please check ServiceNow logs for more details.');
                }

             } catch(err){
                status = "NOT SUCCESSFUL";
                if (!err.response) {
                    throw new Error('No response from ServiceNow. Please check ServiceNow logs for more details.');
                } else {
                    status = "FAILURE";
                    if (err.message.includes('ECONNREFUSED') || err.message.includes('ENOTFOUND')) {
                        throw new Error('Change request details cannot be retrieved because the ServiceNow Instance URL is invalid. Enter the correct URL and try again.');
                    }

                    else if (err.message.includes('401')) {
                        throw new Error('The SNOW_TOKEN and SNOW_TOOLID are incorrect. Verify that the variables are configured.');
                    }

                    else if (err.message.includes('405')) {
                        throw new Error('Change request details cannot be retrieved because response Code from ServiceNow is 405. Please check ServiceNow logs for more details.');
                    }

                    else if (err.response.status == 500) {
                        throw new Error('Change request details cannot be retrieved because response code from ServiceNow is 500. Please check ServiceNow logs for more details.')
                    }

                    else if (err.response.status == 400 || err.response.status == 404) {
                        let errMsg = 'ServiceNow DevOps Get Change is not Successful.';
                        let errMsgSuffix = ' Please provide valid inputs.';
                        let responseData = err.response.data;
                        if (responseData && responseData.result && responseData.result.errorMessage) {
                            errMsg = errMsg + responseData.result.errorMessage + errMsgSuffix;
                            throw new Error(errMsg);
                        }
                        else if (responseData && responseData.result && responseData.result.details && responseData.result.details.errors) {
                            let errors = responseData.result.details.errors;
                            for (var index in errors) {
                                errMsg = errMsg + errors[index].message + errMsgSuffix;
                            }
                            throw new Error(errMsg);
                        }
                    }
                   
                    else {
                        throw new Error('Change request details cannot be retrieved. Please check ServiceNow logs for more details.'); 
                    }
                }
                
            }
        } catch (err) {
            console.error('\n \x1b[1m\x1b[31m' + err.message + '\x1b[0m\x1b[0m');
            outputObject.status = status;
            this._writeToOutputFile(outputObject);
            process.exit(1);
        }
    }

    _writeToOutputFile(outputObject) {
        // Stringify the JSON object
        const outputObjectString = JSON.stringify(outputObject, null, 2);
        // Write the JSON string to the sndevopschg.json file
        try {
            fs.writeFileSync('sndevopschg.json', outputObjectString);    
              // Log message to confirm the file creation
            console.log('sndevopschg.json file created with content:', outputObjectString);
        } catch (err) {
            // ignore error
        }
    }
}

module.exports = GetChangeManager;