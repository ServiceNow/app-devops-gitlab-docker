# app-devops-gitlab-docker

 New repository for developing a plugin to integrate between ITSM DevOps and GitLab pipelines

### Owners

> ramachandrarao.p

### How to build on Jenkins
* Create a `pom.xml` file at the root level
* Go to the [BT1 Service Catalog](https://buildtools1.service-now.com/nav_to.do?uri=%2Fcom.glideapp.servicecatalog_cat_item_view.do%3Fv%3D1%26sysparm_id%3D9dbd0c54db1acb403a3d5dd5ce961948%26sysparm_link_parent%3Dad2fecb72bfc310052f7c71317da157e%26sysparm_catalog%3De0d08b13c3330100c8b837659bba8fb4%26sysparm_catalog_view%3Dess%26sysparm_view%3Dess) to request a Jenkins job

Once the request is processed, a multi-branch job is created on https://buildmaster-hotel.devsnc.com and will build any branches that match [ServiceNow branch naming convention](https://buildtools1.service-now.com/kb_view_customer.do?sysparm_article=KB0528607).

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

