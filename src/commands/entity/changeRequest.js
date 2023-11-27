const Base = require("../base");
const changeRequest  = require('../../api/artifact/changeRequest.js');

const COMMAND_NAME = 'change'

module.exports = class ChangeRequest extends Base {


    create(createCommand) {

        const command = createCommand.command(COMMAND_NAME);
        this.addDefaultOptions(command);

        command.option('-p , --payload <changePayload>', "Change payload in JSON format");
        command.action((options) => {
            console.log('Calling Change Control API to create change....');
            new changeRequest(options.url,options.token,options.toolId).createChange(options.payload);
        })
    }


}