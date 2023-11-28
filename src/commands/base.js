
module.exports = class Base{
    constructor(){
    }

    addDefaultOptions(command){

        command.option("-t, --toolId <toolId>", "Tool ID, if not passed via environmentaal variable")
        .option("--token <token>", "Token ID, if not passed via environmental variable")
        .option("-u --url <nowUrl>", "Service Now Url, if not passed via environmental variable")  

    }
}