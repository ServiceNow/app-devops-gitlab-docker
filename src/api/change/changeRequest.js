const SnDevopsApi = require('../base/sndevopsApi.js')
const API_CHANGE_PATH = 'api/sn_devops/devops/orchestration/changeControl';
const API_CHANGE_STATUS_PATH = 'api/sn_devops/devops/orchestration/changeStatus';
const axios = require('axios');
const BaseEnv = require('../../common/baseEnv.js')


class ChangeRequestManager extends SnDevopsApi {
    
  /**
   * 
   * @param {*} changeAttrPayload  : 
    * {
        "changeStepDetails": {
          "timeout": 3600,
          "interval": 100
        },
        "attributes": {
          "short_description": "Automated Software Deployment",
          "description": "Automated Software Deployment."
        }
     }
   */
    async createChange(changeAttrPayload) {
        let status = true;
        let response;
        let changePayload; //Payload contains information necessary for change creation
        let changeDetails; //Incoming payload after JSON parsed
        let changeRequestDetails; //Contains only change attributes
        let changeStepDetails; //Contains information related to change step like timeout, interval.
        let timeout;
        let interval;

        try {
            changePayload = {
                "buildNumber" : BaseEnv.CI_PIPELINE_ID,
                "apiPath": BaseEnv.CI_API_V4_URL,
                "projectId": BaseEnv.CI_PROJECT_ID,
                "jobId": BaseEnv.CI_JOB_ID,
                "pipelineName": BaseEnv.CI_PROJECT_TITLE,
                "jobName": BaseEnv.CI_JOB_NAME,
                "projectPath": BaseEnv.CI_PROJECT_PATH
            };

            //ChangeAttributes are optional
            if(changeAttrPayload) {
                try {
                    changeDetails = JSON.parse(changeAttrPayload);
                    changeRequestDetails = this._objectWithoutProperties(changeDetails, ["changeStepDetails"]);
                    changePayload.changeRequestDetails = changeRequestDetails;
                    changeStepDetails = changeDetails.changeStepDetails;
                    if(changeStepDetails) {
                      if(changeStepDetails.timeout)
                        timeout = changeStepDetails.timeout;
                      if(changeStepDetails.interval)
                        interval = changeStepDetails.interval;
                    } 
                } catch (e) {
                    throw new Error("Change request cannot be created because changeRequestDetails were not parsed.");
                }
            }

            response = await this.createChangeNotification(changePayload);
            if (status) {
                interval = interval >= 100 ? interval : 100;
                timeout = timeout >= 100? timeout : 3600;
          
                let start = +new Date();
                let prevPollChangeDetails = {};
          
                try {
                    response = await this.tryFetch(start,interval,timeout,prevPollChangeDetails, changePayload);
                } catch (error) {
                    throw new Error(error.message);
               }
            } 
          } catch (err) {
              status = false;
              console.error('\n \x1b[1m\x1b[31m' + err.message + '\x1b[0m\x1b[0m');
              process.exit(1);
          }
    }
      
    async createChangeNotification(changePayload) {
       let status = false;
       let response;

       try {
            let url = new URL(API_CHANGE_PATH, this.url);
            url.searchParams.append("toolId", this.toolId);

            let payload = this._getRequestBodyForChangeCreation(changePayload);
            console.log("Change creation payload = " + JSON.stringify(payload));
            const defaultHeadersForToken = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'sn_devops.DevOpsToken ' + this.toolId + ":" + this.token
            };
            let httpHeaders = { headers: defaultHeadersForToken };
            try {
                response = await axios.post(url.toString(), JSON.stringify(payload), httpHeaders);
                status = true;
            } catch (err) {
                if (err.code === 'ECONNABORTED') {
                    throw new Error(`change creation timeout after ${err.config.timeout}s`);
                }
        
                if (err.message.includes('ECONNREFUSED') || err.message.includes('ENOTFOUND')) {
                    throw new Error('Change request cannot be created because the ServiceNow Instance URL is invalid. Enter the correct URL and try again.');
                }
        
                if (err.message.includes('401')) {
                    throw new Error('The SNOW_TOKEN and SNOW_TOOLID are incorrect. Verify that the GitLab project level variables are configured.');
                }
        
                if (err.message.includes('405')) {
                    throw new Error('Change request cannot be created because response Code from ServiceNow is 405. Please check ServiceNow logs for more details.');
                }
        
                if (!err.response) {
                    throw new Error('Change request cannot be created because no response from ServiceNow. Please check ServiceNow logs for more details.');
                }
        
                if (err.response.status == 500) {
                    throw new Error('Change request cannot be created because response Code from ServiceNow is 500. Please check ServiceNow logs for more details.')
                }
        
                if (err.response.status == 400) {
                    let errMsg = 'ServiceNow DevOps Change is not created. Please check ServiceNow logs for more details.';
                    let responseData = err.response.data;
                    
                    if (responseData && responseData.error && responseData.error.message) {
                        errMsg = responseData.error.message;
                    } else if (responseData && responseData.result) {
                        let result = responseData.result;
                        //When we have errors inside details object
                        if(result.details && result.details.errors) {
                              errMsg = 'ServiceNow DevOps Change is not created. ';
                              let errors = err.response.data.result.details.errors;
                              for (var index in errors) {
                                  errMsg = errMsg + errors[index].message;
                              }
                        } 
                        else if(result.errorMessage) {//Other technical error messages
                              errMsg = result.errorMessage;
                        }
                    }
                    throw new Error(errMsg);
                }
            }

            if(status) {
                var result = response.data.result;
                if (result && result.status == "Success") {
                    if(result.message)
                        console.log('\n     \x1b[1m\x1b[36m' + result.message + '\x1b[0m\x1b[0m');
                    else
                        console.log('\n     \x1b[1m\x1b[36m' + "The job is under change control. A callback request is created and polling has been started to retrieve the change info." + '\x1b[0m\x1b[0m');
                }
            }
        } catch(error) {
            throw new Error(error.message);
        }
    }

    async tryFetch(start, interval, timeout, prevPollChangeDetails, changePayload) {
        try {
            await this.doFetch(prevPollChangeDetails, changePayload);
        } catch (error) {
              if (error.message == "500") {
                throw new Error(`Internal server error. An unexpected error occurred while processing the request.`);
              }
      
              if (error.message == "400") {
                throw new Error(`Bad Request. Missing inputs to process the request.`);
              }
      
              if (error.message == "401") {
                throw new Error(`The SNOW_TOKEN and SNOW_TOOLID are incorrect. Verify that the GitLab project level variables are configured.`);
              }
      
              if (error.message == "403") {
                throw new Error(`Forbidden. The user does not have the role to process the request.`);
              }
      
              if (error.message == "404") {
                throw new Error(`Not found. The requested item was not found.`);
              }
      
              if (error.message == "202") {
                throw new Error("****Change has been created but the change is either rejected or cancelled.");
              }
      
              const errorMessage = error.message;
              if (errorMessage) {
                  const errorObject = JSON.parse(errorMessage);
                  if (errorObject && errorObject.statusCode == "201") {
                      prevPollChangeDetails = errorObject.details;
                  }else if(errorObject && errorObject.status == "error"){
                      //throws error incase of status is 'error'
                      throw new Error(errorObject.details);
                  }
              }
      
              // Wait and then continue
              await new Promise((resolve) => setTimeout(resolve, interval * 1000));
              if (+new Date() - start > timeout * 1000) {
                 throw new Error("Aborting the pipeline due to timeout = " + timeout);
              }
      
              await this.tryFetch(start,interval,timeout,prevPollChangeDetails, changePayload);
        }
    }

    async doFetch(prevPollChangeDetails, changePayload) {
        let endpoint = '';
        let httpHeaders = {};
        let response = {};
        let status = false;
        let responseCode = 500;
        let changeStatus = {};
        const codesAllowedArr = '200,201,400,401,403,404,500'.split(',').map(Number);
        
        let url = new URL(API_CHANGE_STATUS_PATH, this.url);
        url.searchParams.append("toolId", this.toolId);
        url.searchParams.append("stageName", changePayload.jobName);
        url.searchParams.append("buildNumber", changePayload.jobId);
        url.searchParams.append("pipelineName", changePayload.pipelineName);
        url.searchParams.append("pipelineId", changePayload.projectId);

        endpoint =  url.toString();
        const defaultHeadersForToken = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'sn_devops.DevOpsToken '+ this.toolId + ":" + this.token
        };
        httpHeaders = { headers: defaultHeadersForToken };

        try {
            response = await axios.get(endpoint, httpHeaders);
            status = true;
        } catch (err) {
            if (!err.response) {
                throw new Error("500");
            }
    
            if (!codesAllowedArr.includes(err.response.status)) {
              throw new Error("500");
            }
        
            if (err.response.status == 500) {
                throw new Error("500");
            }
    
            if (err.response.status == 400) {
                let responseData = err.response.data;
                if (responseData && responseData.result && responseData.result.errorMessage) {//Other technical error messages
                    let errMsg = responseData.result.errorMessage;
                    throw new Error(JSON.stringify({ "status":"error","details": errMsg }));
                }
                throw new Error("400");
            }
    
            if (err.response.status == 401) {
               throw new Error("401");
            }
    
            if (err.response.status == 403) {
               throw new Error("403");
            }
    
            if (err.response.status == 404) {
               throw new Error("404");
            }
        }

        if (status) {
            try {
              responseCode = response.status;
            } catch (error) {
                console.log('\nCould not read response code from API response: ' + error);
                throw new Error("500");
            }
    
            try {
              changeStatus = response.data.result;
            } catch (error) {
                console.log('\nCould not read change status details from API response: ' + error);
                throw new Error("500");
            }
    
            let currChangeDetails = changeStatus.details;
            let changeState = currChangeDetails.status;
        
            if (responseCode == 201) {

                if (changeState == "pending_decision") {
                    if (this.isChangeDetailsChanged(prevPollChangeDetails, currChangeDetails)) {
                      console.log('\n \x1b[1m\x1b[32m' + JSON.stringify(currChangeDetails) + '\x1b[0m\x1b[0m');
                    }
                    throw new Error(JSON.stringify({ "statusCode": "201", "details": currChangeDetails }));
                } 
                else if((changeState == "failed")||(changeState == "error")) {
                      throw new Error(JSON.stringify({ "status":"error","details": currChangeDetails.details }));
                } 
                else if ((changeState == "rejected") || (changeState == "canceled_by_user")) {
                      if (this.isChangeDetailsChanged(prevPollChangeDetails, currChangeDetails)) {
                        console.log('\n \x1b[1m\x1b[32m' + JSON.stringify(currChangeDetails) + '\x1b[0m\x1b[0m');
                      }
                      throw new Error("202");
                } else
                      throw new Error("201");

            } 
            else if (responseCode == 200) {

              if (this.isChangeDetailsChanged(prevPollChangeDetails, currChangeDetails)) {
                console.log('\n \x1b[1m\x1b[32m' + JSON.stringify(currChangeDetails) + '\x1b[0m\x1b[0m');
              }
              console.log('\n****Change is Approved.');

            }
            else
              throw new Error("500");
    
          return true;
        }
    }
    
    isChangeDetailsChanged(prevPollChangeDetails, currChangeDetails) {
        if (Object.keys(currChangeDetails).length !== Object.keys(prevPollChangeDetails).length) {
            return true;
        }
        for (let field of Object.keys(currChangeDetails)) {
            if (currChangeDetails[field] !== prevPollChangeDetails[field]) {
              return true;
            }
        }
        return false;
    }

    _objectWithoutProperties(obj, keys) {
        var target = {};
        for (var i in obj) {
            if (keys.indexOf(i) >= 0) continue;
            if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
            target[i] = obj[i];
        }
        return target;
    }
    
    _getRequestBodyForChangeCreation(changePayload) {
        this.validateChangePayload(changePayload);
        let branchName = this.fetchBranchName();
        return {
            "toolId": this.toolId,
            "stageName": changePayload.jobName,
            "buildNumber": changePayload.buildNumber,
            "callbackURL": changePayload.apiPath + "/projects/" + changePayload.projectId +"/jobs/" + changePayload.jobId,
            "isMultiBranch": "true",
            "branchName": branchName,
            "changeRequestDetails": changePayload.changeRequestDetails,
            "action": "customChange",
            "pipelineName": changePayload.pipelineName,
            "jobId": changePayload.jobId,
            "gitLabProjectId" : changePayload.projectId,
            "pipelineId": changePayload.buildNumber,
            "projectPath": changePayload.projectPath
        }
    }

    validateChangePayload(changePayload) {
      for (var key in changePayload) {
        if (changePayload.hasOwnProperty(key) && !changePayload[key]) {
           throw new Error(`Change request cannot be created as Key: ${key} has a null value.`);
        }
      }
    }
}

module.exports = ChangeRequestManager;