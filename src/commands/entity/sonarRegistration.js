const Base = require("../base");
const SonarRegistrationManager  = require('../../api/sonar/sonarRegistration.js');

const COMMAND_NAME = 'sonar'

module.exports = class SonarRegistration extends Base {
    constructor(){
        super()
    }
    
    create(createCommand) {

        const command = createCommand.command(COMMAND_NAME);
        this.addDefaultOptions(command);

        command.requiredOption('-projectKey, --sonarProjectKey <sonarProjectKey>', 'Sonar Project Key')
        .requiredOption('-url, --sonarUrl <sonarUrl>', 'Sonar URL')
        .option('-branch, --branchName <branchName>', 'branch Name');

        command.action((options) => {
            console.log("Sonar registartion action called " )
            new SonarRegistrationManager(options.url,options.token,options.toolId).createSonarSummary(options.sonarProjectKey, options.sonarUrl, options.branchName)
        })
    }

}