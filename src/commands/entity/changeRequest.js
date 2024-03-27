const Base = require("../base");
const ChangeRequestManager  = require('../../api/change/changeRequest.js');
const GetChangeManager  = require('../../api/change/getChange.js');
const UpdateChangeManager  = require('../../api/change/updateChange.js');

const COMMAND_NAME = 'change'

module.exports = class ChangeRequest extends Base {


    create(createCommand) {

        const command = createCommand.command(COMMAND_NAME);
        this.addDefaultOptions(command);

        command.option('-p , --payload <changeAttributesPayload>', "Change Attributes payload in JSON format");
        command.action((options) => {
            console.log('Calling Change Control API to create change....');
            new ChangeRequestManager(options.url,options.token,options.toolId).createChange(options.payload);
        })
    }

    get(getCommand) {
        const command = getCommand.command(COMMAND_NAME);
        this.addDefaultOptions(command);

        command.option('-p , --payload <changeDetails>', "Change details in JSON format");
        command.action((options) => {
            console.log('Calling Change Control API to get change....');
            new GetChangeManager(options.url,options.token,options.toolId).getChange(options.payload);
        })
    }

    update(updateCommand) {
        const command = updateCommand.command(COMMAND_NAME);
        this.addDefaultOptions(command);

        command.option('-n, --changeRequestNumber <changeRequestNumber>', 'Change Request Number')
               .requiredOption('-p, --payload <changeDetails>', 'Change details in JSON format');
        command.action((options) => {
            console.log('Calling Change Control API to update change....');
            new UpdateChangeManager(options.url,options.token,options.toolId).updateChange(options.changeRequestNumber, options.payload);
        })
    }
}