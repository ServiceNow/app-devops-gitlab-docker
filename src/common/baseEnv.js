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
        static CI_DEFAULT_BRANCH = process.env.CI_DEFAULT_BRANCH;
        static CI_MERGE_REQUEST_SOURCE_BRANCH_NAME = process.env.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME;

        static CI_RUN_ATTEMPT = process.env.CI_RUN_ATTEMPT;
        static CI_REPOSITORY_NAME = process.env.CI_REPOSITORY_NAME;
        static CI_CALLBACK_URL = process.env.CI_CALLBACK_URL;
        static CI_WORKFLOW_NAME = process.env.CI_WORKFLOW_NAME;

    static getEnv(envVariableName){
        return process.env[envVariableName];
    }
}
