# app-devops-gitlab-docker

 New repository for developing a plugin to integrate between ITSM DevOps and GitLab pipelines

# CLI example using npm modules

## Build and install

```sh
npm install .
```

## Running the cli commands

```sh
node src/index.js
```

Follow the prompts to create a package or type --help to get more informaiton

```sh
node src/index.js --help
```

## Creating a bin executable 

To create a symlink sndevopscli, run the following commmand

```sh

npm link

```
OR

```sh
npm install -g .
```

This will create a executable sndevopscli in bin folder ( /usr/loca/bin/)

**Running CLI**

```sh
sndevopscli create package --help
```
### Removing symlink

```sh
npm unlink .
```

## Creating Docker Image

### Building Docker Image

```sh
docker build -t servicenowdocker/sndevops:3.1.0 .
```

```sh
docker push servicenowdocker/sndevops:3.1.0
```

## Integrating with GitLab

[Example gitlab project](/gitlab-ci.yml)


### Env variables 

```
SNOW_URL = <servicenow-instance-url>
SNOW_TOKEN = <servicenow-tool-token>
SNOW_TOOLID = <servicenow-tool-id>
```

**Example with passing all ServiceNow information via commandline**
```yaml

This custom step needs to be added at job level to create artifact or package in ServiceNow instance.

stages:
  - package

package:
  stage: package
  image: servicenowdocker/sndevops:3.1.0
  script: 
    - sndevopscli create artifact -a '[{"name":"artifact-name-$CI_JOB_ID","repositoryName":"artifact-repo-name" ,"version":"1.3.0"}]'
    - sndevopscli create package -n "package-name" -a '[{"name":"artifact-name-$CI_JOB_ID","repositoryName":"artifact-repo-name" ,"version":"1.3.0"}]

OR

stages:
  - package

package:
  stage: package
  image: servicenowdocker/sndevops:3.1.0
  script: 
    - sndevopscli create artifact -u <serviceno-url> -t <tool-id> --token <tool-token> -a '[{"name":"artifact-name-$CI_JOB_ID","repositoryName":"artifact-repo-name" ,"version":"1.3.0"}]'
    - sndevopscli create package -u <serviceno-url> -t <tool-id> --token <tool-token> -n "package-mame" -a '[{"name":"artifact-name-$CI_JOB_ID","repositoryName":"artifact-repo-name" ,"version":"1.3.0"}]

 -a : [mandatory]
 This specifies artifact details.

 -n : [mandatory]
 This specifies package details.

```


**Example of change creation for ServiceNow via commandline**
```yaml

This custom step needs to be added at job level to create change in ServiceNow instance.

stages:
  - DevOpsChangeApproval

ServiceNow DevOps Change:
  stage: DevOpsChangeApproval
  image: servicenowdocker/sndevops:3.1.0
  script: 
    - sndevopscli create change -p '{"changeStepDetails":{"timeout":3600,"interval":100},"attributes":{"short_description":"Automated Software Deployment","description":"Automated Software Deployment.","assignment_group":"XXXXXXX","implementation_plan":"Software update is tested and results can be found in Test Summaries Tab.","backout_plan":"When software fails in production, the previous software release will be re-deployed.","test_plan":"Testing if the software was successfully deployed or not"}}'

changeStepDetails: [optional]
It holds the timeout and interval details.

interval: [optional]
The time in seconds to wait between trying the API. The default value is 100 seconds.

timeout: [optional]
The maximum time in seconds to wait until the action should fails. The default value is 3600 seconds.

attributes: [optional]
The change request attribute details are to be used while creating change in ServiceNow instance. The change request is a JSON object surrounded by curly braces {} containing key-value pairs separated by a comma ,. A key-value pair consists of a key and a value separated by a colon :. The keys supported in key-value pair are short_description, description, assignment_group, implementation_plan, backout_plan, test_plan etc.



```

**Example of sonar summary for ServiceNow via commandline**
```yaml

This custom step needs to be added at job level to create sonar summary in ServiceNow instance.

stages:
  - DevOpsSonarStage

ServiceNow DevOps Sonar Scan Results:
  stage: DevOpsSonarStage
  image: servicenowdocker/sndevops:3.1.0
  script: 
    - sndevopscli create sonar -url 'https://sonarcloud.io' -projectKey 'xxxxxxx'

url: [mandatory]
This specifies the sonar url.

projectKey: [mandatory]
This specifies the sonar project key.

```

**Example of get change for ServiceNow via commandline**
```yaml

This custom step needs to be added at job level to get changeRequestNumber from ServiceNow instance with provided changeDetails to identify the change-request.

stages:
  - DevOpsGetChange

ServiceNow DevOps Get Change:
  stage: DevOpsGetChange
  image: servicenowdocker/sndevops:4.0.0
  script: 
    - sndevopscli get change -p "{\"buildNumber\":${CHG_JOB_ID},\"stageName\":\"ServiceNow DevOps Change Step\",\"pipelineName\":\"GitlabDockerGetAndUpdateChange\"}"

-p: It stands for changeDetails. The change details to be used for identifying change request in ServiceNow instance. The change details is a JSON object surrounded by curly braces {} containing key-value pair separated by a comma ,. A key-value pair consists of a key and a value separated by a colon :. The keys supported in key-value pair are buildNumber, pipelineName, stageName

buildNumber: [mandatory]
This specifies ID of the Job where we have created change request.

stageName: [mandatory]
This specifies the Job name where we have created change request..

pipelineName: [mandatory]
This specifies the pipeline name.

Outputs:
  sndevopschg.json file created with content: {
    "status": "SUCCESS",
    "changeRequestNumber": "CHGXXXXX"
  }
  
  changeRequestNumber: Change Request Number found for the given change details
  status: To know the status of the Change Request GET.

```

**Example of update change for ServiceNow via commandline**
```yaml

This custom step needs to be added at job level to Update change in ServiceNow instance for the changeRequestNumber provided as input along with changeRequestDetails.

stages:
  - DevOpsUpdateChangeStage

ServiceNow DevOps Update Change:
  stage: DevOpsUpdateChangeStage
  image: servicenowdocker/sndevops:4.0.0
  script: 
    - sndevopscli update change -n 'CHGXXXXXX' -p "{\"short_description\":\"G Venkata12345 Automated Software Deployment\",\"description\":\"Automated Software Deployment.\",\"assignment_group\":\"XXXXX\",\"implementation_plan\":\"Software update is tested and results can be found in Test Summaries Tab.\",\"backout_plan\":\"When software fails in production, the previous software release will be re-deployed.\",\"test_plan\":\"Testing if the software was successfully deployed or not\"}"

-n [Not mandatory if we have sndevopschg.json in our pipeline yml]: It stands for changeRequestNumber. The change request number to identify a unique change request. 
   Precedence of choosing changeRequestNumber: 
     - changeRequestNumber mentioned in the pipeline yml
     - changeRequestNumber stored in sndevopschg.json.

-p : It stands for changeDetails. The change details to be used for Updating the change request information identified by the specified change request number with the key-value pairs. The change details is a JSON object surrounded by curly braces {} containing key-value pair separated by a comma ,. A key-value pair consists of a key and a value separated by a colon :. The keys supported in key-value pair are short_description, state, description, work_notes ..so on

OR
  - sndevopscli update change -p "{\"short_description\":\"Updated Automated Software Deployment\",\"description\":\"Automated Software Deployment.\",\"assignment_group\":\"XXXXXXXXXX\",\"implementation_plan\":\"Software update is tested and results can be found in Test Summaries Tab.\",\"backout_plan\":\"When software fails in production, the previous software release will be re-deployed.\",\"test_plan\":\"Testing if the software was successfully deployed or not\"}"

NOTE: State should be specified at last in case if you are update the state of change request.
- sndevopscli update change -p "{\"short_description\":\"Updated Automated Software Deployment\",\"description\":\"Automated Software Deployment.\",\"assignment_group\":\"XXXXXXXXXX\",\"implementation_plan\":\"Software update is tested and results can be found in Test Summaries Tab.\",\"backout_plan\":\"When software fails in production, the previous software release will be re-deployed.\",\"test_plan\":\"Testing if the software was successfully deployed or not\","state":"3"}'

```

**Example to incorporate autoCloseChange feature for ServiceNow via commandline**
```yaml

stages:
  - changeapproval

ServiceNow DevOps Change Step:
  stage: changeapproval
  image: servicenowdocker/sndevops:4.0.0
  script: 
     - sndevopscli create change -p "{\"changeStepDetails\":{\"timeout\":3600,\"interval\":100},\"autoCloseChange\":true,\"attributes\":{\"short_description\":\"G Venkata Automated Software Deployment\",\"description\":\"Automated Software Deployment.\",\"assignment_group\":\"xxxxxxxx\",\"implementation_plan\":\"Software update is tested and results can be found in Test Summaries Tab.\",\"backout_plan\":\"When software fails in production, the previous software release will be re-deployed.\",\"test_plan\":\"Testing if the software was successfully deployed or not\"}}"
  
autoCloseChange: [optional] : Boolean value

```

