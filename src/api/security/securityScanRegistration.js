const SnDevopsApi = require('../base/sndevopsApi.js')
const axios = require('axios');
const API_SECURITY_PATH = 'api/sn_devops/devops/tool/security';
const BaseEnv = require('../../common/baseEnv.js');


class SecurtyScanRegistrationManager extends SnDevopsApi {

    async createSecurityScan(inputPayload) {
        let payload;
        let response;

        if (inputPayload) {
            try {
                payload = JSON.parse(inputPayload);
            } catch (e) {
                throw new Error("Unable to parse Security scan payload");
            }
        }

        let endpoint = new URL(API_SECURITY_PATH, this.url);
        endpoint.searchParams.append("toolId", this.toolId)
        console.log("Computed  ServiceNow url " + endpoint.toString());

        console.log("Payload to register security scan results = " + JSON.stringify(payload));

        const defaultHeadersForToken = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'sn_devops.DevOpsToken ' + this.toolId + ":" + this.token
        };
        let httpHeaders = { headers: defaultHeadersForToken };

        try {
            response = await axios.post(endpoint.toString(), JSON.stringify(payload), httpHeaders);
        } catch (e) {
            if (e.message.includes('ECONNREFUSED') || e.message.includes('ENOTFOUND') || e.message.includes('405')) {
                console.error('ServiceNow Instance URL is NOT valid. Enter the correct the URL and try again.');
                process.exit(1);

            } else if (e.message.includes('401')) {
                console.error('The SNOW_TOKEN and SNOW_TOOLID are incorrect. Verify that the variables are configured.');
                process.exit(1);

            } else if (e.message.includes('400') || e.message.includes('404')) {
                let errMsg = '[ServiceNow DevOps] Register Security Scan Results are not Successful. ';
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
                console.error('ServiceNow DevOps Event for Security Scan Results are not created. Please check ServiceNow logs for more details.');
                process.exit(1);
            }
        }
    }

}

module.exports = SecurtyScanRegistrationManager;