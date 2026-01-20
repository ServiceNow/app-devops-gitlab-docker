
const axios = require('axios');
const url = require('node:url');
const { HttpsProxyAgent } = require('https-proxy-agent');
require('dotenv').config();
const BaseEnv = require('../../common/baseEnv')
const ToolHandlerRegistry = require('../../handler/registry.js');

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

    _getProxyConfig() {
        // Check if proxy is configured via environment variables
        const proxyUrl = BaseEnv.PROXY_ENDPOINT;
        const proxyUsername = BaseEnv.PROXY_USERNAME;
        const proxyPassword = BaseEnv.PROXY_PASSWORD;
        const proxyAuth = BaseEnv.PROXY_AUTH;

        if (!proxyUrl) {
            return null;
        }
        try {
            // Build proxy URL with authentication if provided
            let fullProxyUrl = proxyUrl;
            
            if (proxyAuth) {
                // If PROXY_AUTH is set, use it as the username with no password
                const proxyUrlObj = new URL(proxyUrl);
                fullProxyUrl = `${proxyUrlObj.protocol}//${proxyAuth}@${proxyUrlObj.host}`;
                console.log(`Using proxy with API key authentication: ${proxyUrlObj.protocol}//${proxyUrlObj.host}`);
            } else if (proxyUsername) {
                // If username/password are provided
                const proxyUrlObj = new URL(proxyUrl);
                const credentials = proxyPassword ? `${proxyUsername}:${proxyPassword}` : proxyUsername;
                fullProxyUrl = `${proxyUrlObj.protocol}//${credentials}@${proxyUrlObj.host}`;
                console.log(`Using proxy with username/password authentication: ${proxyUrlObj.protocol}//${proxyUrlObj.host}`);
            } else {
                console.log(`Using proxy without authentication: ${proxyUrl}`);
            }
            
            return fullProxyUrl;
        } catch (error) {
            console.warn(`Invalid proxy URL: ${proxyUrl}. Proceeding without proxy.`);
            return null;
        }
    }

    /**
     * Helper method to build axios config with headers and proxy support
     * This centralizes the proxy configuration logic so subclasses don't need to duplicate it
     * @param {Object} headers - Optional custom headers. If not provided, uses default auth headers
     * @returns {Object} Axios config object with headers and proxy configuration
     */
    _getAxiosConfig(headers = null) {
        const axiosConfig = {
            headers: headers || this._getAuthHeaderWithToken()
        };
        // Add proxy configuration if available
        const proxyUrl = this._getProxyConfig();
        if (proxyUrl) {
            // Use HttpsProxyAgent for HTTPS endpoints through HTTP proxy
            // This properly handles SSL tunneling via CONNECT method
            axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
            // Set proxy to false to prevent axios from using its default proxy handling
            axiosConfig.proxy = false;
        }
        return axiosConfig;
    }


      _postMethod(url, body, httpHeaders) {
          axios.post(url,
            JSON.stringify(body),
            this._getAxiosConfig(httpHeaders))
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

    buildPipelineName(pipelineName) {
        const handler = new ToolHandlerRegistry().getToolHandler();
        if(handler) {
            return handler.getPipelineName(pipelineName)
        }
        return pipelineName
    }
    
}

module.exports = SndevopsApi