'use strict';

const ArtifactManager = require("../../api/artifact/artifactManager");
const Base = require("../base");

const COMMAND_NAME = "artifact"

module.exports = class Artifact extends Base {

    constructor(){
        super()
    }


    create(createCommand) {

        const command = createCommand.command(COMMAND_NAME)
            .requiredOption('-a, --artifacts <artifacts>', 'Artifacts in Json format');

            this.addDefaultOptions(command);
            
        command.action((options) => {
            console.log("Create Artifacts action called with options" + JSON.stringify(options))
            new ArtifactManager(options.url,options.token,options.toolId).createArtifacts(options.artifacts)
        })
        

    }


}