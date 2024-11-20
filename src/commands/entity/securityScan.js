const Base = require("../base");
const SecurtyScanRegistrationManager = require('../../api/security/securityScanRegistration.js');

const COMMAND_NAME = 'securityScan'

module.exports = class SecurtyScanRegistration extends Base {
    constructor() {
        super()
    }

    create(createCommand) {

        const command = createCommand.command(COMMAND_NAME);
        this.addDefaultOptions(command);

        command.requiredOption('-p , --payload <securityScanPaylod>', "Security result payload in JSON format");

        command.action((options) => {
            console.log("Security scan action called ")
            new SecurtyScanRegistrationManager(options.url, options.token, options.toolId).createSecurityScan(options.payload)
        })
    }

}