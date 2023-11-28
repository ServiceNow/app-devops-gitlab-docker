require('dotenv').config();

module.exports = class BaseEnv{
    
        static CI_PROJECT_NAME = process.env.CI_PROJECT_NAME;
        static CI_JOB_STAGE = process.env.CI_JOB_STAGE;
        static CI_JOB_ID = process.env.CI_JOB_ID;
        static CI_SERVER_URL = process.env.CI_SERVER_URL;
        static CI_COMMIT_SHA = process.env.CI_COMMIT_SHA
        static CI_JOB_NAME = process.env.CI_JOB_NAME
        static CI_PIPELINE_ID = process.env.CI_PIPELINE_ID
        static CI_PAGES_URL = process.env.CI_PAGES_URL;
        static CI_PROJECT_TITLE = process.env.CI_PROJECT_TITLE;
        static CI_PROJECT_PATH = process.env.CI_PROJECT_PATH;
        static CI_PIPELINE_URL = process.env.CI_PROJECT_PATH;
        static CI_COMMIT_BRANCH = process.env.CI_COMMIT_BRANCH;
        static CI_API_V4_URL = process.env.CI_API_V4_URL;
        static CI_PIPELINE_SOURCE = process.env.CI_PIPELINE_SOURCE;
        static CI_PROJECT_ID = process.env.CI_PROJECT_ID;
        static SNOW_URL = process.env.SNOW_URL;
        static SNOW_TOKEN = process.env.SNOW_TOKEN;
        static SNOW_TOOLID = process.env.SNOW_TOOLID;

    static getEnv(envVariableName){
        return process.env[envVariableName];
    }
}
