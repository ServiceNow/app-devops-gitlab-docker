
const axios = require('axios');
const url = require('node:url');
require('dotenv').config();
const BaseEnv = require('../../common/baseEnv')

class SndevopsApi {

    constructor(url = null, token = null, toolId = null, waitForApproval = false) {
        this.url = url ? url : BaseEnv.SNOW_URL ;
        this.token = token ? token  : BaseEnv.SNOW_TOKEN ;
        this.toolId = toolId ? toolId : BaseEnv.SNOW_TOOLID;
        this.waitForApproval = waitForApproval;
        console.log("ServiceNow Url set to " + this.url + " tool id: " + this.toolId)
        this.validateMandatoryParams(this.url, this.token, this.toolId);
    }

    validateMandatoryParams(url, token, toolId) {
        var errorMessage;
        if(!url) errorMessage = "SNOW_URL is a required field.";
        if(!token) errorMessage += "SNOW_TOKEN is a required field.";
        if(!toolId) errorMessage += "SNOW_TOOLID is a required field.";

        if(errorMessage) {
            errorMessage += " Verify that the variables are configured.";
            console.error('\n \x1b[1m\x1b[31m' + errorMessage + '\x1b[0m\x1b[0m');
            process.exit(1);
        }
    }

    setNowUrl(url) {
        this.setNowUrl = url;
        return this;
    }

    setToken(token) {
        this.token = token;
        return token;
    }


    setToolId(toolId) {
        this.toolId = toolId;
        return this;
    }

    post(url, body, httpHeaders) {
        return this._postMethod(url, body ,  httpHeaders);
    }

    _getAuthHeaderWithToken(){
        return {
            "Authorization": "sn_devops.DevOpsToken " + this.toolId + ":" + this.token,
            'Accept': 'application/json',
            "Content-Type": "application/json"
        }
    }


      _postMethod(url, body, httpHeaders) {

          axios.post(url,
            JSON.stringify(body),
            {headers:httpHeaders})
            .then(function (response) {
                console.log("Response of requet: " + new URL(url).pathname + " --->"  +JSON.stringify(response.data))
                return Promise.resolve(response)
            })
            .catch(function (error) {
                console.log(error);
                return Promise.reject;
            });;
    }

    fetchBranchName() {
        let branchName = BaseEnv.CI_COMMIT_BRANCH || BaseEnv.CI_DEFAULT_BRANCH;
        if(BaseEnv.CI_PIPELINE_SOURCE == 'merge_request_event')
           branchName = BaseEnv.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME;

        return branchName;
    }
    
}

module.exports = SndevopsApi