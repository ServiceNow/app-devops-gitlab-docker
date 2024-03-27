const SnDevopsApi = require('../base/sndevopsApi.js')
const API_UPDATE_CHANGE_PATH = 'api/sn_devops/devops/orchestration/changeInfo';
const axios = require('axios');
const fs = require('fs');

class UpdateChangeManager extends SnDevopsApi {
    
    async updateChange(changeRequestNumber, changeDetails) {
        let status = "NOT-STARTED";
        let url;
        let httpHeaders;
        let response;
        let changeDetailsParsed;
        let data;
        let jsonData;

        try {
            //Mandatory field validation check
            if(!changeRequestNumber) {
                // Read the content of sndevopschg.json synchronously
                try {
                    data = fs.readFileSync('sndevopschg.json', 'utf8');
                    console.log("Details in sndevopschg.json file = " + data);
                    jsonData = JSON.parse(data);
                    changeRequestNumber = jsonData.changeRequestNumber;
                } catch (err) {
                    throw new Error("changeRequestNumber is a required field. Enter the correct changeRequestNumber or pass the correct artifact file and try again.");
                }
            }

            if(!changeDetails) {
                throw new Error("changeDetails is a required field. Enter the correct changeDetails and try again.");
            }

            if(changeDetails) {
                try {
                    changeDetailsParsed = JSON.parse(changeDetails);
                    console.log("Change details to be updated -> " + JSON.stringify(changeDetailsParsed));
                } catch (e) {
                    throw new Error("Change request details cannot be updated because changeDetails were not parsed.");
                }
            }

            try {
                url = new URL(API_UPDATE_CHANGE_PATH, this.url);
                url.searchParams.append("changeRequestNumber", changeRequestNumber);
                console.log("Update change API = " + url.toString());

                httpHeaders = { headers: this._getAuthHeaderWithToken() };    
                response = await axios.put(url.toString(), JSON.stringify(changeDetailsParsed), httpHeaders);
                console.log("[ServiceNow DevOps], Receiving response for Update Change, Response : " + JSON.stringify(response.data));
                
                if(response.data && response.data.result){
                    status = response.data.result.status;
                    console.log('\n \x1b[1m\x1b[32m' + "Status of the Update => "+status+", and the message => "+response.data.result.message + '\x1b[0m\x1b[0m');
                }else{
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
                        throw new Error('Change request details cannot be updated because the ServiceNow Instance URL is invalid. Enter the correct URL and try again.');
                    }

                    else if (err.message.includes('401')) {
                        throw new Error('The SNOW_TOKEN and SNOW_TOOLID are incorrect. Verify that the GitLab project level variables are configured.');
                    }

                    else if (err.message.includes('405')) {
                        throw new Error('Change request details cannot be updated because response Code from ServiceNow is 405. Please check ServiceNow logs for more details.');
                    }

                    else if (err.response.status == 500) {
                        throw new Error('Change request details cannot be updated because response code from ServiceNow is 500. Please check ServiceNow logs for more details.')
                    }

                    else if (err.response.status == 400 || err.response.status == 404) {
                        let errMsg = 'ServiceNow DevOps Update Change is not Successful.';
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
                        throw new Error('Change request details cannot be updated. Please check ServiceNow logs for more details.'); 
                    }
                }
                
            }
        } catch (err) {
            console.error('\n \x1b[1m\x1b[31m' + err.message + '\x1b[0m\x1b[0m');
            process.exit(1);
        }
    }
}

module.exports = UpdateChangeManager;