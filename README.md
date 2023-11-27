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
sndevopscli create pakcage --help
```
### Removing symlink

```sh
npm unlink .
```

## Creating Docker image

### Buildng docker image

```sh
docker build -t dockerusername/sndevops-cli:0.35 .
```

```sh
docker push dockerusername/sndevops-cli:0.35
```

## Integrating with gitlab

[Example gitlab project](https://gitlab.k8s.sndevops.xyz/devops-admin/helloworld/-/blob/main/.gitlab-ci.yml?ref_type=heads)


**Example with passing all ServiceNow info via commandlie**

```yaml

stages:
  - package

package:
  stage: package
  image: sannrao/sndevops-cli:0.35
  script: 
    - sndevopscli create artifact -a '[{"name":"artifact-name-$CI_JOB_ID","repositoryName":"artifact-repo-name" ,"version":"1.3.0"}]'
    - sndevopscli create package -n "package-mame" -a '[{"name":"artifact-name-$CI_JOB_ID","repositoryName":"artifact-repo-name" ,"version":"1.3.0"}]

```

### Env variables 

```
SNOW_URL = <servicenow-instance-url>
SNOW_TOKEN = <servicenow-tool-token>
SNOW_TOOLID = <servicenow-tool-id>
```

**Example with passing all ServiceNow info via commandlie**
```yaml

stages:
  - package

package:
  stage: package
  image: sannrao/sndevops-cli:0.35
  script: 
    - sndevopscli create artifact -u <serviceno-url> -t <tool-id> --token <tool-token> -a '[{"name":"artifact-name-$CI_JOB_ID","repositoryName":"artifact-repo-name" ,"version":"1.3.0"}]'
    - sndevopscli create package -u <serviceno-url> -t <tool-id> --token <tool-token> -n "package-mame" -a '[{"name":"artifact-name-$CI_JOB_ID","repositoryName":"artifact-repo-name" ,"version":"1.3.0"}]

```

**Example of change creation for ServiceNow via commandline**
```yaml

stages:
  - DevOpsChangeApproval

package:
  stage: DevOpsChangeApproval
  image: smrutisnow/sndevops-cli:0.35
  script: 
    - sndevopscli create change -p '{"changeStepDetails":{"timeout":3600,"interval":100},"attributes":{"short_description":"Automated Software Deployment","description":"Automated Software Deployment.","assignment_group":"XXXXXXX","implementation_plan":"Software update is tested and results can be found in Test Summaries Tab.","backout_plan":"When software fails in production, the previous software release will be re-deployed.","test_plan":"Testing if the software was successfully deployed or not"}}'

```

