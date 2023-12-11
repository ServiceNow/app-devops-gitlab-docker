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

        command.requiredOption('-sonarProjectKey, --sonarProjectKey <sonarProjectKey>', 'Sonar Project Key')
        .requiredOption('-sonarUrl, --sonarUrl <sonarUrl>', 'Sonar URL');

        command.action((options) => {
            console.log("Sonar registartion action called " )
            new SonarRegistrationManager(options.url,options.token,options.toolId).createSonarSummary(options.sonarProjectKey, options.sonarUrl)
        })
    }

}